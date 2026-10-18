"use server";

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
  let { data: customer } = await db
    .from("customers")
    .select("id, email, status")
    .eq("dodo_subscription_id", subscriptionId)
    .maybeSingle();

  // Webhook not here yet? Confirm the subscription with Dodo directly.
  if (!customer) {
    const { getSubscription } = await import("@/lib/dodo");
    const sub = await getSubscription(subscriptionId);
    const email = (sub?.metadata?.email || sub?.customer?.email || "").trim().toLowerCase();
    if (sub && ["active", "trialing", "on_trial"].includes(sub.status) && email) {
      const { data } = await db
        .from("customers")
        .upsert(
          {
            email,
            status: "active",
            dodo_subscription_id: sub.subscription_id,
            dodo_customer_id: sub.customer?.customer_id ?? null,
          },
          { onConflict: "email" },
        )
        .select("id, email, status")
        .single();
      customer = data;
    }
  }

  if (!customer || customer.status !== "active") {
    return { pending: true, error: "We're still confirming your payment — try again in a few seconds." };
  }

  const { data: existing } = await db.from("brands").select("id").eq("customer_id", customer.id).maybeSingle();
  const { data: brand, error } = existing
    ? await db.from("brands").update({ name, website, questions }).eq("id", existing.id).select("id").single()
    : await db.from("brands").insert({ customer_id: customer.id, name, website, questions }).select("id").single();
  if (error || !brand) return { error: "Couldn't save. Please try again." };

  // The cron queue picks up new customers within a minute or two and sends
  // their first report (a full report takes longer than a request can wait).
  return { ok: true };
}
