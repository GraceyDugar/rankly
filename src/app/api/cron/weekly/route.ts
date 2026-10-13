import { runWeeklyBatch } from "@/lib/weekly";

// Called by the Cloudflare cron (see worker.ts) every few minutes on Mondays.
// Protected by CRON_SECRET so nobody else can trigger scans.
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const results = await runWeeklyBatch(1);
  return Response.json({ processed: results.length, results });
}
