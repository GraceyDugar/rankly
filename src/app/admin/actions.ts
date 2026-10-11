"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminEmail, supabaseServer } from "@/lib/supabase-server";

export type LoginState = { sent?: boolean; error?: string };

export async function sendLoginLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim();
  if (!email.includes("@")) return { error: "Enter a valid email." };

  // Only the admin email ever gets a link. Everyone else sees the same
  // message, so the page doesn't reveal which email is the admin.
  if (isAdminEmail(email)) {
    const h = await headers();
    const origin = h.get("origin") || `https://${h.get("host")}`;
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback?next=/admin` },
    });
    if (error) {
      console.error("Login link failed:", error.message);
      return { error: "Couldn't send the link. Try again in a minute." };
    }
  }
  return { sent: true };
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
