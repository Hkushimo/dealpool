import { createAdminClient } from "@/lib/supabase/admin";

export function createClient() {
  return createAdminClient();
}
