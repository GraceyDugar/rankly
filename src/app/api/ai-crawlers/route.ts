import { AI_CRAWLERS, checkCrawler, parseRobots } from "@/lib/robots";
import { site } from "@/lib/site";

// Free AI crawler checker: reads a site's robots.txt (and looks for llms.txt)
// and reports which AI crawlers may read its homepage.

const USER_AGENT = `RanklyBot/1.0 (+${site.url}/ai-crawler-checker)`;
const TIMEOUT_MS = 8000;
// Crawlers must read at least 500 KiB of robots.txt (RFC 9309); anything past that is ignored.
const MAX_ROBOTS_BYTES = 512 * 1024;
const MAX_LLMS_BYTES = 16 * 1024;

// Public domain names only: no IP addresses, ports, or local/internal hosts.
function isPublicHost(hostname: string) {
  return (
    hostname.length <= 253 &&
    /^[a-z0-9.-]+$/.test(hostname) &&
    /\.(?:[a-z]{2,63}|xn--[a-z0-9-]+)$/.test(hostname) &&
    !/(^|\.)(localhost|local|internal|lan|home|arpa)$/.test(hostname)
  );
}

// Accepts "example.com", "www.example.com" or a full URL, and returns the hostname.
function toHost(input: string) {
  const raw = input.trim().toLowerCase();
  if (!raw || raw.length > 300) return null;
  try {
    const url = new URL(/^https?:\/\//.test(raw) ? raw : `https://${raw}`);
    if (url.port || url.username || url.password) return null;
    return isPublicHost(url.hostname) ? url.hostname : null;
  } catch {
    return null;
  }
}

async function readCapped(res: Response, maxBytes: number) {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.byteLength;
  }
  await reader.cancel().catch(() => {});
  const bytes = new Uint8Array(Math.min(size, maxBytes));
  let offset = 0;
  for (const chunk of chunks) {
    const take = Math.min(chunk.byteLength, bytes.length - offset);
    bytes.set(chunk.subarray(0, take), offset);
    offset += take;
  }
  return new TextDecoder().decode(bytes);
}

// Follows up to 3 redirects by hand, so each hop can be checked before it's fetched.
async function fetchText(url: string, maxBytes: number, signal: AbortSignal) {
  let current = url;
  for (let hop = 0; hop <= 3; hop++) {
    const res = await fetch(current, { redirect: "manual", signal, headers: { "User-Agent": USER_AGENT } });
    const location = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
    if (location) {
      await res.body?.cancel();
      const next = new URL(location, current);
      if (!/^https?:$/.test(next.protocol) || next.port || !isPublicHost(next.hostname)) throw new Error("Unsafe redirect");
      current = next.toString();
      continue;
    }
    if (!res.ok) {
      await res.body?.cancel();
      return { status: res.status, type: "", text: "" };
    }
    return { status: res.status, type: res.headers.get("content-type") ?? "", text: await readCapped(res, maxBytes) };
  }
  throw new Error("Too many redirects");
}

export async function POST(request: Request) {
  let body: { url?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const host = typeof body.url === "string" ? toHost(body.url) : null;
  if (!host) {
    return Response.json({ error: "Enter a website address, like example.com." }, { status: 400 });
  }

  const signal = AbortSignal.timeout(TIMEOUT_MS);
  const [robots, llms] = await Promise.allSettled([
    fetchText(`https://${host}/robots.txt`, MAX_ROBOTS_BYTES, signal),
    fetchText(`https://${host}/llms.txt`, MAX_LLMS_BYTES, signal),
  ]);

  if (robots.status === "rejected") {
    return Response.json({ error: `Couldn't reach ${host}. Check the address and try again.` }, { status: 502 });
  }

  // Per RFC 9309: a missing robots.txt (4xx) allows everything; a server error (5xx)
  // tells crawlers to stay away until it's fixed.
  const { status } = robots.value;
  const robotsState = status >= 500 ? "error" : status >= 400 ? "missing" : "found";
  const groups = robotsState === "found" ? parseRobots(robots.value.text) : [];

  const crawlers = AI_CRAWLERS.map((c) => {
    const verdict = robotsState === "error" ? { allowed: false, matchedAgent: null, rule: null } : checkCrawler(groups, c.token);
    return { ...c, ...verdict };
  });

  // Many sites answer every path with their HTML homepage, so only count real text files.
  const llmsTxt =
    llms.status === "fulfilled" &&
    llms.value.status === 200 &&
    !/html/i.test(llms.value.type) &&
    llms.value.text.trim().length > 0 &&
    !llms.value.text.trimStart().startsWith("<");

  return Response.json({ host, robots: { state: robotsState, status }, llmsTxt, crawlers });
}
