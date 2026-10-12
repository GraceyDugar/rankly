import { runScan } from "@/lib/scan";
import { supabaseAdmin } from "@/lib/supabase";
import { clientIp, hashIp } from "@/lib/ip";

// Free checks per visitor per 24 hours.
const LIMIT = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000;

async function underLimit(ipHash: string) {
  if (process.env.NODE_ENV === "development") return true;
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count, error } = await supabaseAdmin()
    .from("free_checks")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  // If the database is unreachable, don't block real visitors.
  if (error) {
    console.error("Rate limit check failed:", error.message);
    return true;
  }
  return (count ?? 0) < LIMIT;
}

export async function POST(request: Request) {
  let body: { brand?: unknown; keyword?: unknown; website?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const brand = typeof body.brand === "string" ? body.brand.trim() : "";
  const keyword = typeof body.keyword === "string" ? body.keyword.trim() : "";
  const website = typeof body.website === "string" ? body.website.trim() : "";

  if (brand.length < 2 || brand.length > 80) {
    return Response.json({ error: "Enter your brand name (2–80 characters)." }, { status: 400 });
  }
  if (keyword.length < 5 || keyword.length > 150) {
    return Response.json({ error: "Enter a question customers ask (5–150 characters)." }, { status: 400 });
  }

  const ipHash = await hashIp(clientIp(request));
  if (!(await underLimit(ipHash))) {
    return Response.json(
      { error: "You've used your free checks for today. Sign up to track this every week." },
      { status: 429 },
    );
  }

  let result;
  try {
    result = await runScan(brand, keyword, website || undefined);
  } catch (err) {
    console.error("Scan failed:", err);
    return Response.json({ error: "The scan failed. Please try again in a minute." }, { status: 502 });
  }

  // Saving is best-effort: a database hiccup shouldn't hide the visitor's result.
  const { error } = await supabaseAdmin().from("free_checks").insert({
    brand,
    question: keyword,
    mentioned: result.mentioned,
    position: result.position,
    competitors: result.competitors,
    ip_hash: ipHash,
  });
  if (error) console.error("Saving free check failed:", error.message);

  return Response.json(result);
}
