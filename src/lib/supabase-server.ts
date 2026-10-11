import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Per-request Supabase client that reads/writes the login session cookie.
// Uses the public anon key: it can only do what row level security allows.
export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components can't set cookies; the session still works for this render.
        }
      },
    },
  });
}

export function isAdminEmail(email: string | undefined | null) {
  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return !!admin && email?.trim().toLowerCase() === admin;
}

// Returns the signed-in admin's email, or null if not signed in as the admin.
export async function getAdminEmail() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  return isAdminEmail(data.user?.email) ? data.user!.email! : null;
}
