import { buildDailySummary, sendDailySummary } from "@/lib/summary";

// Called by the Cloudflare cron (see worker.ts) once a day at 9:00 IST:
// emails the founder yesterday's visitors, checks, trials and anything broken.
// Protected by CRON_SECRET. `?preview=1` returns the email as HTML instead.
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (new URL(request.url).searchParams.get("preview")) {
    const { html } = await buildDailySummary();
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
  }
  return Response.json(await sendDailySummary());
}
