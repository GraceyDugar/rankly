import { clientIp, hashIp } from "@/lib/ip";
import { supabaseAdmin } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Signups per visitor per hour, to stop bots filling the list.
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  let body: { email?: unknown; brand?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const brand = typeof body.brand === "string" ? body.brand.trim().slice(0, 80) : "";
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return Response.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const db = supabaseAdmin();
  const ipHash = await hashIp(clientIp(request));
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count } = await db
    .from("waitlist")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if ((count ?? 0) >= LIMIT) {
    return Response.json({ error: "Too many signups. Try again later." }, { status: 429 });
  }

  // Signing up twice with the same email just updates the brand.
  const { error } = await db
    .from("waitlist")
    .upsert({ email, brand: brand || null, ip_hash: ipHash }, { onConflict: "email" });
  if (error) {
    console.error("Waitlist signup failed:", error.message);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
