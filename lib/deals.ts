import { createClient } from "@/lib/supabase/server";
import type { AppUser, Deal, DealWithTotals, Participation } from "@/lib/types";

export function randomSlug() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export function withTotals(deal: Deal, participations: Pick<Participation, "amount" | "status">[]): DealWithTotals {
  const confirmed = participations
    .filter((participation) => participation.status === "confirmed")
    .reduce((sum, participation) => sum + Number(participation.amount), 0);
  const pending = participations
    .filter((participation) => participation.status === "pending")
    .reduce((sum, participation) => sum + Number(participation.amount), 0);
  const target = Number(deal.target_amount);

  return {
    ...deal,
    confirmed_amount: confirmed,
    pending_amount: pending,
    remaining_amount: Math.max(target - confirmed, 0)
  };
}

async function getParticipationsForDeal(dealId: string) {
  const supabase = createClient();
  const { data: participations, error } = await supabase
    .from("participations")
    .select("*")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: true })
    .returns<Participation[]>();

  if (error || !participations?.length) {
    return participations ?? [];
  }

  const userIds = [...new Set(participations.map((participation) => participation.user_id))];
  const { data: users } = await supabase
    .from("users")
    .select("id, username, display_name")
    .in("id", userIds)
    .returns<Pick<AppUser, "id" | "username" | "display_name">[]>();

  const usersById = new Map((users ?? []).map((user) => [user.id, user]));
  return participations.map((participation) => ({
    ...participation,
    users: usersById.get(participation.user_id) ?? null
  }));
}

export async function getDealBySlug(slug: string) {
  const supabase = createClient();
  const { data: deal, error } = await supabase
    .from("deals")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<Deal>();

  if (error || !deal) return null;

  const participations = await getParticipationsForDeal(deal.id);

  return {
    deal: withTotals(deal, participations),
    participations
  };
}

export async function getDealById(id: string) {
  const supabase = createClient();
  const { data: deal, error } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .maybeSingle<Deal>();

  if (error || !deal) return null;

  const participations = await getParticipationsForDeal(deal.id);

  return {
    deal: withTotals(deal, participations),
    participations
  };
}
