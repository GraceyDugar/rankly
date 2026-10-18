// Visitor numbers from Cloudflare Web Analytics, via its GraphQL API.
// Optional: needs CF_API_TOKEN (secret, "Account Analytics: Read") and
// CF_ACCOUNT_ID. CF_SITE_TAG narrows it to one site if the account has several.

export type Visitors = {
  visits: number;
  pageViews: number;
  referrers: [string, number][];
  countries: [string, number][];
};

type Group = { count: number; sum?: { visits: number }; dimensions?: Record<string, string> };

const clean = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "");
const iso = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");

export async function getVisitors(since: Date, until: Date): Promise<Visitors | null> {
  const token = process.env.CF_API_TOKEN;
  const account = process.env.CF_ACCOUNT_ID;
  if (!token || !account) return null;

  const siteTag = process.env.CF_SITE_TAG;
  const filter = `{ AND: [{ datetime_geq: "${iso(since)}", datetime_leq: "${iso(until)}" }${siteTag ? `, { siteTag: "${clean(siteTag)}" }` : ""}] }`;
  const groups = (alias: string, dimension?: string, limit = 5) =>
    `${alias}: rumPageloadEventsAdaptiveGroups(filter: ${filter}, limit: ${limit}${dimension ? ", orderBy: [count_DESC]" : ""}) {
      count sum { visits }${dimension ? ` dimensions { ${dimension} }` : ""}
    }`;
  const query = `{ viewer { accounts(filter: { accountTag: "${clean(account)}" }) {
    ${groups("total", undefined, 1)}
    ${groups("referrers", "refererHost", 8)}
    ${groups("countries", "countryName")}
  } } }`;

  const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    data?: { viewer?: { accounts?: { total: Group[]; referrers: Group[]; countries: Group[] }[] } };
    errors?: { message: string }[];
  };
  if (!res.ok || json.errors?.length) {
    throw new Error(`Cloudflare analytics: ${json.errors?.[0]?.message ?? res.status}`);
  }
  const acc = json.data?.viewer?.accounts?.[0];
  const top = (list: Group[] | undefined, key: string, label: (v: string) => string | null) =>
    (list ?? [])
      .map((g) => [label(g.dimensions?.[key] ?? ""), g.sum?.visits ?? g.count] as [string | null, number])
      .filter((r): r is [string, number] => r[0] !== null && r[1] > 0)
      .slice(0, 5);

  const ownHost = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://rankly.world").hostname;
  return {
    visits: acc?.total?.[0]?.sum?.visits ?? 0,
    pageViews: acc?.total?.[0]?.count ?? 0,
    // Clicks between our own pages aren't a traffic source.
    referrers: top(acc?.referrers, "refererHost", (h) => (h === ownHost ? null : h || "Direct / typed in")),
    countries: top(acc?.countries, "countryName", (c) => c || "Unknown"),
  };
}
