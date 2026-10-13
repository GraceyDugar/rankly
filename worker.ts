// Custom Cloudflare entry: the Next.js app (built by OpenNext) plus a cron
// handler that triggers the weekly reports.
// Generated at build time by `opennextjs-cloudflare build` (excluded from tsconfig).
import handler from "./.open-next/worker.js";

type Env = { CRON_SECRET?: string; NEXT_PUBLIC_SITE_URL?: string };
type Ctx = { waitUntil(p: Promise<unknown>): void };

const worker = {
  fetch: handler.fetch,

  async scheduled(_event: unknown, env: Env, ctx: Ctx) {
    const url = `${env.NEXT_PUBLIC_SITE_URL || "https://rankly.world"}/api/cron/weekly`;
    const request = new Request(url, {
      method: "POST",
      headers: { authorization: `Bearer ${env.CRON_SECRET ?? ""}` },
    });
    // Run the route inside this same Worker, not over the network.
    ctx.waitUntil(
      Promise.resolve(handler.fetch(request, env, ctx)).then(async (res: Response) => {
        console.log("Weekly cron:", res.status, await res.text());
      }),
    );
  },
};

export default worker;
