import { runNextJob } from "@/lib/weekly";

// Called by the Cloudflare cron (see worker.ts) every minute. Each run does
// one job: a pending free report, a new customer's first report, or (on
// Mondays) a subscriber's weekly report.
// Protected by CRON_SECRET so nobody else can trigger scans.
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const job = await runNextJob();
  return Response.json(job);
}
