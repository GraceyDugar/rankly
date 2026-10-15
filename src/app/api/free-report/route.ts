import { clientIp, hashIp } from "@/lib/ip";
import { supabaseAdmin } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Free full reports per visitor per day (on top of one per email, ever).
const PER_IP_LIMIT = 2;
const DAY_MS = 24 * 60 * 60 * 1000;

// Queues a free full report. The cron worker runs it and emails it within
// a few minutes, because a full report takes longer than a request can wait.
export async function POST(request: Request) {
  let body: { email?: unknown; brand?: unknown; website?: unknown; questions?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const brand = typeof body.brand === "string" ? body.brand.trim().slice(0, 80) : "";
  const website = typeof body.website === "string" ? body.website.trim().slice(0, 200) : "";
  const questions = (Array.isArray(body.questions) ? body.questions : [])
    .filter((q): q is string => typeof q === "string")
    .map((q) => q.trim().slice(0, 150))
    .filter((q) => q.length >= 5)
    .slice(0, 5);

  if (!EMAIL_RE.test(email) || email.length > 200) return Response.json({ error: "Enter a valid email." }, { status: 400 });
  if (brand.length < 2) return Response.json({ error: "Enter your brand name." }, { status: 400 });
  if (questions.length === 0) return Response.json({ error: "Add at least one question." }, { status: 400 });

  const db = supabaseAdmin();
  const ipHash = await hashIp(clientIp(request));

  if (process.env.NODE_ENV !== "development") {
    const { count } = await db
      .from("free_reports")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", new Date(Date.now() - DAY_MS).toISOString());
    if ((count ?? 0) >= PER_IP_LIMIT) {
      return Response.json({ error: "You've used your free reports for today." }, { status: 429 });
    }
  }

  const { error } = await db
    .from("free_reports")
    .insert({ email, brand, website: website || null, questions, ip_hash: ipHash });
  if (error) {
    // Unique email: they've already had their free report.
    if (error.code === "23505") {
      return Response.json(
        { error: "This email already got its free report. Track it weekly to keep getting them." },
        { status: 409 },
      );
    }
    console.error("Free report signup failed:", error.message);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
