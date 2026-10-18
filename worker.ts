// Custom Cloudflare entry: the Next.js app (built by OpenNext) plus cron
// handlers: the every-minute report queue and the 9:00 IST daily summary.
// Generated at build time by `opennextjs-cloudflare build` (excluded from tsconfig).
import handler from "./.open-next/worker.js";

type Env = { CRON_SECRET?: string; NEXT_PUBLIC_SITE_URL?: string };
type Ctx = { waitUntil(p: Promise<unknown>): void };

// Must match the second cron in wrangler.jsonc (03:30 UTC = 9:00 IST).
const DAILY_CRON = "30 3 * * *";

const worker = {
  fetch: handler.fetch,

  async scheduled(event: { cron: string }, env: Env, ctx: Ctx) {
    const job = event.cron === DAILY_CRON ? "daily" : "weekly";
    const url = `${env.NEXT_PUBLIC_SITE_URL || "https://rankly.world"}/api/cron/${job}`;
    const request = new Request(url, {
      method: "POST",
      headers: { authorization: `Bearer ${env.CRON_SECRET ?? ""}` },
    });
    // Run the route inside this same Worker, not over the network.
    ctx.waitUntil(
      Promise.resolve(handler.fetch(request, env, ctx)).then(async (res: Response) => {
        console.log(`Cron ${job}:`, res.status, await res.text());
      }),
    );
  },
};

export default worker;
