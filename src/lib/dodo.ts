// Dodo Payments: checkout sessions + webhook verification (Standard Webhooks).
// Docs: https://docs.dodopayments.com

function apiBase() {
  return process.env.DODO_MODE === "live" ? "https://live.dodopayments.com" : "https://test.dodopayments.com";
}

export async function createCheckout(email: string, returnUrl: string) {
  const key = process.env.DODO_API_KEY;
  const productId = process.env.DODO_PRODUCT_ID;
  if (!key || !productId) throw new Error("Dodo is not configured");

  const res = await fetch(`${apiBase()}/checkouts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email },
      return_url: returnUrl,
      // Lets the webhook match the subscription back to our customer row.
      metadata: { email },
    }),
  });
  if (!res.ok) throw new Error(`Dodo checkout error ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { checkout_url?: string | null };
  if (!data.checkout_url) throw new Error("Dodo returned no checkout URL");
  return data.checkout_url;
}

// Looks up a subscription directly, so onboarding doesn't have to wait for
// the webhook. Returns null if Dodo doesn't know it.
export async function getSubscription(subscriptionId: string) {
  const key = process.env.DODO_API_KEY;
  if (!key || !/^sub_[A-Za-z0-9]+$/.test(subscriptionId)) return null;
  const res = await fetch(`${apiBase()}/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) return null;
  return (await res.json()) as {
    subscription_id: string;
    status: string;
    metadata?: { email?: string };
    customer?: { customer_id?: string; email?: string };
  };
}

function base64ToBytes(b64: string) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Verifies `webhook-signature` = HMAC-SHA256("{id}.{timestamp}.{body}") with the
// base64 secret after "whsec_". Rejects events older/newer than 5 minutes.
export async function verifyWebhook(headers: Headers, body: string) {
  const secret = process.env.DODO_WEBHOOK_SECRET;
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatures = headers.get("webhook-signature");
  if (!secret || !id || !timestamp || !signatures) return false;

  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 5 * 60) return false;

  // Tolerate stray quotes/whitespace from copy-pasting the secret.
  const cleaned = secret.trim().replace(/^["']|["']$/g, "").trim().replace(/^whsec_/, "");
  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey("raw", base64ToBytes(cleaned), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  } catch (err) {
    console.error("DODO_WEBHOOK_SECRET is not a valid whsec_ secret:", err);
    return false;
  }
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${timestamp}.${body}`));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));

  return signatures
    .split(" ")
    .map((s) => s.split(",")[1] ?? "")
    .some((sig) => timingSafeEqual(sig, expected));
}

// Maps Dodo subscription events to our customer status.
export function statusForEvent(type: string): "active" | "past_due" | "cancelled" | null {
  switch (type) {
    case "subscription.active":
    case "subscription.renewed":
    case "subscription.unpaused":
    case "subscription.plan_changed":
      return "active";
    case "subscription.past_due":
    case "subscription.on_hold":
    case "subscription.failed":
      return "past_due";
    case "subscription.cancelled":
    case "subscription.expired":
    case "subscription.paused":
      return "cancelled";
    default:
      return null;
  }
}
