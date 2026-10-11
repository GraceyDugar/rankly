import { runScan } from "@/lib/scan";

// Basic per-IP limit so the free scan can't burn through the API quota.
// In-memory only: good enough for launch, moves to the database later.
const LIMIT = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000;
const hits = new Map<string, { count: number; resetAt: number }>();

function allow(ip: string) {
  // No limit while developing locally.
  if (process.env.NODE_ENV === "development") return true;
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count++;
  return true;
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

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!allow(ip)) {
    return Response.json(
      { error: "You've used your free scans for today. Sign up to track this every week." },
      { status: 429 },
    );
  }

  try {
    const result = await runScan(brand, keyword, website || undefined);
    return Response.json(result);
  } catch (err) {
    console.error("Scan failed:", err);
    return Response.json({ error: "The scan failed. Please try again in a minute." }, { status: 502 });
  }
}
