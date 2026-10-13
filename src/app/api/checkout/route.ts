import { createCheckout } from "@/lib/dodo";
import { site } from "@/lib/site";
import { supabaseAdmin } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return Response.json({ error: "Enter a valid email." }, { status: 400 });
  }

  // Create the customer as "pending" so the webhook has a row to activate.
  // Never downgrade someone who is already active.
  const db = supabaseAdmin();
  const { data: existing } = await db.from("customers").select("status").eq("email", email).maybeSingle();
  if (!existing) await db.from("customers").insert({ email, status: "pending" });

  try {
    const url = await createCheckout(email, `${site.url}/welcome`);
    return Response.json({ url });
  } catch (err) {
    console.error("Checkout failed:", err);
    return Response.json({ error: "Couldn't start checkout. Please try again." }, { status: 502 });
  }
}
