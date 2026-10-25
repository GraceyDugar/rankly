// Reads robots.txt the way crawlers do (RFC 9309), to tell whether each AI
// crawler may fetch a site's homepage.

export type CrawlerUse = "search" | "agent" | "training";

// Well-known AI and search crawlers, by the product token they obey in robots.txt.
export const AI_CRAWLERS: { token: string; company: string; use: CrawlerUse }[] = [
  { token: "OAI-SearchBot", company: "OpenAI", use: "search" },
  { token: "ChatGPT-User", company: "OpenAI", use: "agent" },
  { token: "GPTBot", company: "OpenAI", use: "training" },
  { token: "Claude-SearchBot", company: "Anthropic", use: "search" },
  { token: "Claude-User", company: "Anthropic", use: "agent" },
  { token: "ClaudeBot", company: "Anthropic", use: "training" },
  { token: "PerplexityBot", company: "Perplexity", use: "search" },
  { token: "Perplexity-User", company: "Perplexity", use: "agent" },
  { token: "Googlebot", company: "Google", use: "search" },
  { token: "Google-Extended", company: "Google (Gemini)", use: "training" },
  { token: "Bingbot", company: "Microsoft", use: "search" },
  { token: "DuckAssistBot", company: "DuckDuckGo", use: "search" },
  { token: "MistralAI-User", company: "Mistral", use: "agent" },
  { token: "Applebot-Extended", company: "Apple", use: "training" },
  { token: "meta-externalagent", company: "Meta", use: "training" },
  { token: "CCBot", company: "Common Crawl", use: "training" },
  { token: "Bytespider", company: "ByteDance", use: "training" },
];

type Rule = { allow: boolean; path: string };
type Group = { agents: string[]; rules: Rule[] };

export function parseRobots(text: string): Group[] {
  const groups: Group[] = [];
  let current: Group | null = null;
  // Consecutive user-agent lines share one group; a rule line ends the run.
  let collectingAgents = false;

  for (const raw of text.replace(/^﻿/, "").split(/\r\n|\r|\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (key === "user-agent") {
      if (!current || !collectingAgents) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      collectingAgents = true;
    } else if (key === "allow" || key === "disallow") {
      collectingAgents = false;
      // An empty path matches nothing (e.g. "Disallow:" allows everything).
      if (current && value) current.rules.push({ allow: key === "allow", path: value });
    }
  }
  return groups;
}

// "*" matches any run of characters and a trailing "$" anchors the end.
function matches(pattern: string, path: string) {
  const anchored = pattern.endsWith("$");
  const body = anchored ? pattern.slice(0, -1) : pattern;
  const regex = body
    .split("*")
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${regex}${anchored ? "$" : ""}`).test(path);
}

export type Verdict = {
  allowed: boolean;
  matchedAgent: string | null; // the user-agent line that applied, or null if none did
  rule: string | null; // the rule that decided it, or null if no rule matched
};

export function checkCrawler(groups: Group[], token: string, path = "/"): Verdict {
  const name = token.toLowerCase();
  const isFor = (agent: string) => agent === name || agent.startsWith(`${name}/`);
  // Every group naming this crawler applies; only if none does, "*" applies.
  let applicable = groups.filter((g) => g.agents.some(isFor));
  let matchedAgent: string | null = token;
  if (!applicable.length) {
    applicable = groups.filter((g) => g.agents.includes("*"));
    matchedAgent = applicable.length ? "*" : null;
  }

  // The longest matching rule wins; on a tie, Allow wins.
  let best: Rule | null = null;
  for (const rule of applicable.flatMap((g) => g.rules)) {
    if (!matches(rule.path, path)) continue;
    if (!best || rule.path.length > best.path.length || (rule.path.length === best.path.length && rule.allow)) best = rule;
  }
  return {
    allowed: best ? best.allow : true,
    matchedAgent,
    rule: best ? `${best.allow ? "Allow" : "Disallow"}: ${best.path}` : null,
  };
}
