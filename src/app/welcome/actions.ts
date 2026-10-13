"use server";

import { after } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export type WelcomeState = { ok?: boolean; error?: string; pending?: boolean };

// Saves a new customer's brand + questions after checkout, then runs and
// emails their first report in the background.
export async function saveBrand(_prev: WelcomeState, formData: FormData): Promise<WelcomeState> {
  const subscriptionId = String(formData.get("subscription_id") || "");
  const name = String(formData.get("brand") || "").trim().slice(0, 80);
  const website = String(formData.get("website") || "").trim().slice(0, 200) || null;
  const questions = String(formData.get("questions") || "")
    .split("\n")
    .map((q) => q.trim().slice(0, 150))
    .filter((q) => q.length >= 5)
    .slice(0, 5);

  if (!subscriptionId) return { error: "Missing payment reference. Please use the link from your checkout." };
  if (name.length < 2) return { error: "Enter your brand name." };
  if (questions.length === 0) return { error: "Add at least one question (one per line)." };

  // The subscription id comes from Dodo's redirect and is set on the customer by
  // the webhook, so only the person who paid can complete this step.
  const db = supabaseAdmin();
  const { data: customer } = await db
    .from("customers")
    .select("id, email, status")
    .eq("dodo_subscription_id", subscriptionId)
    .maybeSingle();
  if (!customer || customer.status !== "active") {
    return { pending: true, error: "We're still confirming your payment — try again in a few seconds." };
  }

  const { data: existing } = await db.from("brands").select("id").eq("customer_id", customer.id).maybeSingle();
  const { data: brand, error } = existing
    ? await db.from("brands").update({ name, website, questions }).eq("id", existing.id).select("id").single()
    : await db.from("brands").insert({ customer_id: customer.id, name, website, questions }).select("id").single();
  if (error || !brand) return { error: "Couldn't save. Please try again." };

  // First report right away, so customers see value today, not next Monday.
  after(async () => {
    try {
      const { getBrandWithCustomer, markEmailed } = await import("@/lib/weekly");
      const { runBrandReport } = await import("@/lib/report");
      const { sendReportEmail } = await import("@/lib/email");
      const full = await getBrandWithCustomer(brand.id);
      const report = await runBrandReport(full);
      await sendReportEmail(full.customers.email, report);
      await markEmailed(full.id, report.weekOf);
    } catch (err) {
      console.error("First report failed:", err);
    }
  });

  return { ok: true };
}
