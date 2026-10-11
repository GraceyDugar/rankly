import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// The login email links here. Swap the one-time code for a session cookie.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  // Only allow redirects within this site.
  const target = next?.startsWith("/") && !next.startsWith("//") ? next : "/admin";

  if (code) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(target, url.origin));
    console.error("Login callback failed:", error.message);
  }
  return NextResponse.redirect(new URL("/admin/login?error=link", url.origin));
}
