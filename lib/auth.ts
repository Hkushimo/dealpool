import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { AppUser } from "@/lib/types";

const sessionCookie = "dealpool_session";
const sessionDays = 30;
const passwordHashIterations = 100000;

function bytesToBase64Url(bytes: Uint8Array) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let output = "";

  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = bytes[index + 1];
    const third = bytes[index + 2];

    output += alphabet[first >> 2];
    output += alphabet[((first & 0x03) << 4) | ((second ?? 0) >> 4)];

    if (index + 1 < bytes.length) {
      output += alphabet[((second & 0x0f) << 2) | ((third ?? 0) >> 6)];
    }

    if (index + 2 < bytes.length) {
      output += alphabet[third & 0x3f];
    }
  }

  return output;
}

function textBytes(value: string) {
  return new TextEncoder().encode(value);
}

export async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", textBytes(value));
  return bytesToBase64Url(new Uint8Array(digest));
}

export async function hashPassword(password: string, salt = randomToken(18)) {
  const key = await crypto.subtle.importKey("raw", textBytes(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: textBytes(salt),
      iterations: passwordHashIterations
    },
    key,
    256
  );

  return {
    salt,
    hash: bytesToBase64Url(new Uint8Array(bits))
  };
}

export async function verifyPassword(password: string, salt: string, expectedHash: string) {
  const { hash } = await hashPassword(password, salt);
  return hash === expectedHash;
}

export function randomToken(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

export async function createSession(userId: string) {
  const token = randomToken();
  const tokenHash = await sha256(token);
  const expires = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);
  const supabase = createClient();

  const { error } = await supabase.from("sessions").insert({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expires.toISOString()
  });

  if (error) throw new Error(error.message);

  const cookieStore = await cookies();
  cookieStore.set(sessionCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;
  if (token) {
    const supabase = createClient();
    await supabase.from("sessions").delete().eq("token_hash", await sha256(token));
  }
  cookieStore.delete(sessionCookie);
}

export async function getUserProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;

  if (!token) {
    return { user: null, profile: null };
  }

  const supabase = createClient();
  const { data: session } = await supabase
    .from("sessions")
    .select("user_id, expires_at, users(*)")
    .eq("token_hash", await sha256(token))
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  const appUser = (Array.isArray(session?.users) ? session?.users[0] : session?.users) as AppUser | null;
  if (!session || !appUser) {
    return { user: null, profile: null };
  }

  return { user: { id: session.user_id, username: appUser.username }, profile: appUser };
}

export async function requireUser(returnTo?: string) {
  const { user, profile } = await getUserProfile();
  if (!user) {
    const next = returnTo ? `?next=${encodeURIComponent(returnTo)}` : "";
    redirect(`/login${next}`);
  }
  return { user, profile };
}

export async function requireAdmin() {
  const { user, profile } = await requireUser();
  if (!profile?.is_admin) {
    redirect("/dashboard");
  }
  return { user, profile };
}
