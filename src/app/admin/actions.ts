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

// --- Admin-only customer tools. Every action re-checks the admin session. ---

async function requireAdmin() {
  const { getAdminEmail } = await import("@/lib/supabase-server");
  if (!(await getAdminEmail())) throw new Error("Unauthorized");
}

export type AdminState = { ok?: string; error?: string };

export async function addCustomer(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const { supabaseAdmin } = await import("@/lib/supabase");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const name = String(formData.get("brand") || "").trim();
  const website = String(formData.get("website") || "").trim() || null;
  const questions = String(formData.get("questions") || "")
    .split("\n")
    .map((q) => q.trim())
    .filter(Boolean)
    .slice(0, 5);

  if (!email.includes("@")) return { error: "Enter a valid email." };
  if (name.length < 2) return { error: "Enter the brand name." };
  if (questions.length === 0) return { error: "Add at least one question (one per line)." };

  const db = supabaseAdmin();
  const { data: customer, error } = await db
    .from("customers")
    .upsert({ email, status: "active" }, { onConflict: "email" })
    .select("id")
    .single();
  if (error || !customer) return { error: `Saving customer failed: ${error?.message}` };

  const { error: brandError } = await db.from("brands").insert({ customer_id: customer.id, name, website, questions });
  if (brandError) return { error: `Saving brand failed: ${brandError.message}` };

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/admin");
  return { ok: `Added ${name} for ${email}.` };
}

export async function runReportNow(formData: FormData) {
  await requireAdmin();
  const brandId = String(formData.get("brandId") || "");
  const { getBrandWithCustomer, markEmailed } = await import("@/lib/weekly");
  const { runBrandReport } = await import("@/lib/report");
  const { sendReportEmail } = await import("@/lib/email");
  const brand = await getBrandWithCustomer(brandId);
  const report = await runBrandReport(brand);
  await sendReportEmail(brand.customers.email, report);
  await markEmailed(brand.id, report.weekOf);
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/admin");
}
