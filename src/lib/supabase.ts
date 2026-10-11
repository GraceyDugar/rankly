import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only client using the service role key. It bypasses row level
// security, so it must never be imported into browser code.
let admin: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (typeof window !== "undefined") throw new Error("supabaseAdmin is server-only");
  if (!admin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Supabase env vars are not set");
    admin = createClient(url, key, { auth: { persistSession: false } });
  }
  return admin;
}
