"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, hashPassword, requireAdmin, requireUser, verifyPassword } from "@/lib/auth";
import { getDealById, randomSlug } from "@/lib/deals";
import { numeric } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import type { DealStatus } from "@/lib/types";
import { normalizeUsername } from "@/lib/username";

const dealStatuses: DealStatus[] = ["open", "funded", "purchased", "sold", "closed"];

function authErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Authentication failed.";
}

function normalizePoolCode(value: FormDataEntryValue | null) {
  const rawValue = String(value ?? "").trim();
  const pathMatch = rawValue.match(/\/d\/([^/?#]+)/i);
  const code = (pathMatch?.[1] ?? rawValue).trim().toUpperCase();

  if (!/^[A-Z0-9]{4,32}$/.test(code)) {
    throw new Error("Enter a valid pool code.");
  }

  return code;
}

export async function openPoolFromCode(formData: FormData) {
  const code = normalizePoolCode(formData.get("code"));
  redirect(`/d/${code}`);
}

export async function signIn(formData: FormData) {
  let username: string;
  try {
    username = normalizeUsername(formData.get("username"));
  } catch (error) {
    const next = String(formData.get("next") ?? "/dashboard");
    redirect(`/login?error=${encodeURIComponent((error as Error).message)}&next=${encodeURIComponent(next)}`);
  }
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  try {
    const supabase = createClient();
    const { data: profile, error } = await supabase
      .from("users")
      .select("id,password_hash,password_salt")
      .eq("username", username)
      .maybeSingle();

    if (error || !profile?.password_hash || !profile.password_salt) {
      throw new Error("Invalid username or password.");
    }

    const valid = await verifyPassword(password, profile.password_salt, profile.password_hash);
    if (!valid) {
      throw new Error("Invalid username or password.");
    }

    await createSession(profile.id);
  } catch (error) {
    redirect(`/login?error=${encodeURIComponent(authErrorMessage(error))}&next=${encodeURIComponent(next)}`);
  }
  redirect(next);
}

export async function signUp(formData: FormData) {
  let username: string;
  try {
    username = normalizeUsername(formData.get("username"));
  } catch (error) {
    const next = String(formData.get("next") ?? "/dashboard");
    redirect(`/signup?error=${encodeURIComponent((error as Error).message)}&next=${encodeURIComponent(next)}`);
  }
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");
  if (password.length < 6) {
    redirect(`/signup?error=${encodeURIComponent("Use a password with at least 6 characters.")}&next=${encodeURIComponent(next)}`);
  }

  try {
    const supabase = createClient();
    const { hash, salt } = await hashPassword(password);
    const { data: profile, error } = await supabase
      .from("users")
      .insert({
        username,
        display_name: username,
        password_hash: hash,
        password_salt: salt
      })
      .select("id")
      .single();

    if (error || !profile) {
      const message = error?.code === "23505" ? "That username is already taken." : error?.message ?? "Could not create account.";
      throw new Error(message);
    }

    await createSession(profile.id);
  } catch (error) {
    redirect(`/signup?error=${encodeURIComponent(authErrorMessage(error))}&next=${encodeURIComponent(next)}`);
  }
  redirect(next);
}

export async function createDeal(formData: FormData) {
  const { user } = await requireAdmin();
  const supabase = createClient();
  const parsed = z
    .object({
      title: z.string().trim().min(1),
      description: z.string().trim().optional(),
      target_amount: z.string(),
      expected_sale_price: z.string().nullable()
    })
    .parse({
      title: formData.get("title"),
      description: formData.get("description"),
      target_amount: numeric(formData.get("target_amount")),
      expected_sale_price: formData.get("expected_sale_price")
        ? numeric(formData.get("expected_sale_price"))
        : null
    });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = randomSlug();
    const { data, error } = await supabase
      .from("deals")
      .insert({ ...parsed, slug, created_by: user.id, status: "open" })
      .select("id")
      .single();

    if (!error && data) redirect(`/admin/deals/${data.id}?created=1`);
    if (error.code !== "23505") throw new Error(error.message);
  }

  throw new Error("Could not generate a unique pool link.");
}

export async function joinDeal(dealId: string, slug: string, formData: FormData) {
  const { user } = await requireUser(`/d/${slug}`);
  const supabase = createClient();
  const amount = numeric(formData.get("amount"));

  const { error } = await supabase.from("participations").insert({
    deal_id: dealId,
    user_id: user.id,
    amount,
    status: "pending"
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/d/${slug}`);
  redirect(`/d/${slug}?joined=1`);
}

export async function confirmParticipation(id: string, dealId: string) {
  const { user } = await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase
    .from("participations")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString(), confirmed_by: user.id })
    .eq("id", id)
    .eq("status", "pending");

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/deals/${dealId}`);
  const deal = await getDealById(dealId);
  if (deal) revalidatePath(`/d/${deal.deal.slug}`);
}

export async function cancelParticipation(id: string, dealId: string) {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase
    .from("participations")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/deals/${dealId}`);
  const deal = await getDealById(dealId);
  if (deal) revalidatePath(`/d/${deal.deal.slug}`);
}

export async function editParticipationAmount(id: string, dealId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createClient();
  const amount = numeric(formData.get("amount"));
  const { error } = await supabase.from("participations").update({ amount }).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/deals/${dealId}`);
  const deal = await getDealById(dealId);
  if (deal) revalidatePath(`/d/${deal.deal.slug}`);
}

export async function updateDealStatus(dealId: string, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status"));
  if (!dealStatuses.includes(status as DealStatus)) throw new Error("Invalid status.");
  const supabase = createClient();
  const { error } = await supabase.from("deals").update({ status }).eq("id", dealId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/deals/${dealId}`);
  const deal = await getDealById(dealId);
  if (deal) revalidatePath(`/d/${deal.deal.slug}`);
}
