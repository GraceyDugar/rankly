import { statusForEvent, verifyWebhook } from "@/lib/dodo";
import { supabaseAdmin } from "@/lib/supabase";

type SubscriptionData = {
  subscription_id?: string;
  status?: string;
  metadata?: { email?: string };
  customer?: { customer_id?: string; email?: string };
};

export async function POST(request: Request) {
  const body = await request.text();
  if (!(await verifyWebhook(request.headers, body))) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { type?: string; data?: SubscriptionData };
  try {
    event = JSON.parse(body);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const type = event.type ?? "";
  const status = statusForEvent(type);
  if (!status) return Response.json({ ok: true, ignored: type });

  const data = event.data ?? {};
  const email = (data.metadata?.email || data.customer?.email || "").trim().toLowerCase();
  const subscriptionId = data.subscription_id;
  if (!email && !subscriptionId) {
    console.error("Webhook without email or subscription id:", type);
    return Response.json({ ok: true, ignored: "no customer" });
  }

  const db = supabaseAdmin();
  const update = {
    status,
    ...(subscriptionId ? { dodo_subscription_id: subscriptionId } : {}),
    ...(data.customer?.customer_id ? { dodo_customer_id: data.customer.customer_id } : {}),
  };

  // Match on the subscription first (renewals, cancellations), else on email.
  let matched = false;
  if (subscriptionId) {
    const { data: rows } = await db.from("customers").update(update).eq("dodo_subscription_id", subscriptionId).select("id");
    matched = !!rows?.length;
  }
  // A new subscription can be linked by email, but a failed or cancelled
  // attempt we've never seen must not downgrade an existing customer.
  if (!matched && email && status === "active") {
    const { error } = await db.from("customers").upsert({ email, ...update }, { onConflict: "email" });
    if (error) {
      console.error("Webhook customer update failed:", error.message);
      return Response.json({ error: "Database error" }, { status: 500 }); // Dodo will retry
    }
  }

  // New subscriber with no brand yet: email their personal setup link once.
  if (status === "active" && subscriptionId) {
    const { data: customer } = await db
      .from("customers")
      .select("id, email, welcome_sent_at, brands(id)")
      .eq("dodo_subscription_id", subscriptionId)
      .maybeSingle();
    const hasBrand = !!(customer?.brands as unknown[] | undefined)?.length;
    if (customer && !customer.welcome_sent_at && !hasBrand) {
      try {
        const { sendSetupEmail, setupUrl } = await import("@/lib/email");
        await sendSetupEmail(customer.email, setupUrl(subscriptionId));
        await db.from("customers").update({ welcome_sent_at: new Date().toISOString() }).eq("id", customer.id);
      } catch (err) {
        console.error("Welcome email failed:", err); // the daily reminder is a safety net
      }
    }
  }

  console.log(`Dodo ${type} → ${status} (${email || subscriptionId})`);
  return Response.json({ ok: true });
}
