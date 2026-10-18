import { emailOwner, esc } from "./email";
import { askGemini } from "./gemini";
import { currentWeekOf } from "./report";
import { site } from "./site";
import { supabaseAdmin } from "./supabase";
import { getVisitors, type Visitors } from "./visitors";

const DAY_MS = 24 * 60 * 60 * 1000;

type CustomerRow = {
  email: string;
  status: string;
  created_at: string;
  welcome_sent_at: string | null;
  brands: { id: string }[] | null;
};

// One tiny question a day proves the AI is answering. Free checks and reports
// depend on it, so a failure here is the first thing to fix.
async function aiHealth(): Promise<string | null> {
  try {
    await askGemini("Reply with the single word OK.", { light: true });
    return null;
  } catch (err) {
    return err instanceof Error ? err.message.slice(0, 160) : String(err);
  }
}

// Everything the founder wants to know each morning, from the last 24 hours.
export async function buildDailySummary(now = new Date()) {
  const since = new Date(now.getTime() - DAY_MS);
  const sinceIso = since.toISOString();
  const db = supabaseAdmin();
  const weekOf = currentWeekOf(now);

  const [checksRes, allChecksRes, customersRes, sentRes, brandsRes, weekDoneRes, visitors, aiError] = await Promise.all([
    db.from("free_checks").select("brand, question, mentioned, position").gte("created_at", sinceIso).order("created_at", { ascending: false }),
    db.from("free_checks").select("id", { count: "exact", head: true }),
    db.from("customers").select("email, status, created_at, welcome_sent_at, brands(id)"),
    db.from("scans").select("id", { count: "exact", head: true }).gte("emailed_at", sinceIso),
    db.from("brands").select("id, name, created_at, customers!inner(status)").eq("customers.status", "active"),
    db.from("scans").select("brand_id").eq("week_of", weekOf).not("emailed_at", "is", null),
    getVisitors(since, now).catch((err: Error) => err),
    aiHealth(),
  ]);

  const checks = checksRes.data ?? [];
  // Leave out the founder's own test sign-ups.
  const owner = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const customers = ((customersRes.data ?? []) as unknown as CustomerRow[]).filter((c) => c.email !== owner);
  const newTrials = customers.filter((c) => c.welcome_sent_at && c.welcome_sent_at >= sinceIso);
  const abandoned = customers.filter((c) => c.status === "pending" && c.created_at >= sinceIso);
  const count = (s: string) => customers.filter((c) => c.status === s).length;

  // Things that need a human.
  const attention: string[] = [];
  if (aiError) attention.push(`AI isn't answering, so free checks and reports are failing. Error: ${aiError}`);
  if (visitors instanceof Error) attention.push(`Couldn't load visitor numbers from Cloudflare (${visitors.message}).`);
  for (const c of customers.filter((c) => c.status === "past_due")) {
    attention.push(`${c.email}'s payment is failing. Dodo retries automatically.`);
  }
  for (const c of customers) {
    const setupLate = c.status === "active" && !c.brands?.length && c.welcome_sent_at && now.getTime() - Date.parse(c.welcome_sent_at) > 2 * DAY_MS;
    if (setupLate) attention.push(`${c.email} started a trial 2+ days ago but hasn't added their brand yet.`);
  }
  // Weekly reports run on Monday (UTC). From Tuesday on, every brand that
  // existed before this week should have this week's report.
  if (now.getUTCDay() !== 1) {
    const done = new Set((weekDoneRes.data ?? []).map((s) => s.brand_id));
    const missed = (brandsRes.data ?? []).filter((b) => !done.has(b.id) && b.created_at.slice(0, 10) < weekOf);
    if (missed.length) attention.push(`${missed.length} weekly report(s) didn't go out this week: ${missed.map((b) => b.name).join(", ")}.`);
  }

  const mentioned = checks.filter((c) => c.mentioned).length;
  const visits = visitors && !(visitors instanceof Error) ? visitors.visits : null;
  const subject = [
    attention.length ? "⚠️" : "",
    "Rankly daily:",
    visits !== null ? `${visits} visits ·` : "",
    `${checks.length} free checks ·`,
    `${newTrials.length} new trial${newTrials.length === 1 ? "" : "s"}`,
  ]
    .filter(Boolean)
    .join(" ");

  const html = summaryHtml({
    date: now,
    visitors,
    checks,
    allChecks: allChecksRes.count ?? 0,
    mentioned,
    newTrials: newTrials.map((c) => c.email),
    abandoned: abandoned.map((c) => c.email),
    active: count("active"),
    pastDue: count("past_due"),
    cancelled: count("cancelled"),
    reportsSent: sentRes.count ?? 0,
    attention,
  });
  return { subject, html, attention: attention.length };
}

export async function sendDailySummary() {
  const { subject, html, attention } = await buildDailySummary();
  await emailOwner(subject, html);
  return { kind: "daily-summary", subject, attention };
}

// ---------- Email layout ----------

const card = "background:#fffdf9;border:1px solid #e6dfd4;border-radius:16px;padding:20px 22px;margin:0 0 14px";
const h = "margin:0 0 10px;font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#6b645b";
const big = "font-size:30px;font-weight:700;letter-spacing:-.02em;color:#16130f";
const small = "font-size:13px;color:#6b645b";
const list = (items: string[]) =>
  items.length ? `<ul style="margin:10px 0 0;padding-left:18px;font-size:14px;line-height:1.6;color:#16130f">${items.map((i) => `<li>${i}</li>`).join("")}</ul>` : "";

function stat(value: string | number, label: string) {
  return `<td style="padding-right:24px;vertical-align:top"><div style="${big}">${value}</div><div style="${small}">${label}</div></td>`;
}

function summaryHtml(d: {
  date: Date;
  visitors: Visitors | Error | null;
  checks: { brand: string; question: string; mentioned: boolean | null; position: number | null }[];
  allChecks: number;
  mentioned: number;
  newTrials: string[];
  abandoned: string[];
  active: number;
  pastDue: number;
  cancelled: number;
  reportsSent: number;
  attention: string[];
}) {
  const day = d.date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" });
  const v = d.visitors;

  const visitorsCard =
    v && !(v instanceof Error)
      ? `<div style="${card}"><p style="${h}">Visitors</p>
          <table cellpadding="0" cellspacing="0"><tr>${stat(v.visits, "visits")}${stat(v.pageViews, "page views")}</tr></table>
          ${v.referrers.length ? `<p style="margin:14px 0 0;${small}">Came from: ${v.referrers.map(([r, n]) => `${esc(r)} (${n})`).join(" · ")}</p>` : ""}
          ${v.countries.length ? `<p style="margin:6px 0 0;${small}">Countries: ${v.countries.map(([c, n]) => `${esc(c)} (${n})`).join(" · ")}</p>` : ""}
        </div>`
      : `<div style="${card}"><p style="${h}">Visitors</p>
          <p style="margin:0;font-size:14px;color:#16130f">See them in <a href="https://dash.cloudflare.com/?to=/:account/web-analytics" style="color:#b9532c">Cloudflare Web Analytics →</a></p>
        </div>`;

  const checkRows = d.checks
    .slice(0, 8)
    .map((c) => `<strong>${esc(c.brand)}</strong>: “${esc(c.question)}” · ${c.mentioned ? `<span style="color:#047857">#${c.position ?? "?"}</span>` : `<span style="color:#b9532c">not mentioned</span>`}`);
  const more = d.checks.length > 8 ? `<p style="margin:8px 0 0;${small}">+ ${d.checks.length - 8} more in your dashboard</p>` : "";

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f8f5f0;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#16130f">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5f0"><tr><td align="center" style="padding:28px 16px">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px"><tr><td>
    <p style="margin:0;${small}">Rankly · last 24 hours</p>
    <h1 style="margin:4px 0 18px;font-size:24px;letter-spacing:-.02em">${esc(day)}</h1>

    ${
      d.attention.length
        ? `<div style="${card};border-color:#e8a07f;background:#fbefe8"><p style="${h};color:#b9532c">Needs your attention</p>${list(d.attention.map(esc))}</div>`
        : `<div style="${card}"><p style="margin:0;font-size:14px">✅ Everything is running. AI is answering and nothing needs you.</p></div>`
    }

    ${visitorsCard}

    <div style="${card}"><p style="${h}">Free checks</p>
      <table cellpadding="0" cellspacing="0"><tr>${stat(d.checks.length, "last 24h")}${stat(d.checks.length ? `${Math.round((d.mentioned / d.checks.length) * 100)}%` : "–", "were mentioned")}${stat(d.allChecks, "all time")}</tr></table>
      ${list(checkRows)}${more}
    </div>

    <div style="${card}"><p style="${h}">Who wants the report</p>
      <table cellpadding="0" cellspacing="0"><tr>${stat(d.newTrials.length, "new trials")}${stat(d.abandoned.length, "didn't finish checkout")}</tr></table>
      ${d.newTrials.length ? `<p style="margin:12px 0 0;${small}">New trials:</p>${list(d.newTrials.map(esc))}` : ""}
      ${d.abandoned.length ? `<p style="margin:12px 0 0;${small}">Entered their email on the trial page but didn't finish. You could email them:</p>${list(d.abandoned.map(esc))}` : ""}
    </div>

    <div style="${card}"><p style="${h}">Customers</p>
      <table cellpadding="0" cellspacing="0"><tr>${stat(d.active, "active (trial or paying)")}${stat(d.cancelled, "cancelled")}${d.pastDue ? stat(d.pastDue, "payment failing") : ""}</tr></table>
      <p style="margin:12px 0 0;${small}">${d.reportsSent} report email${d.reportsSent === 1 ? "" : "s"} sent in the last 24 hours. Money: see the Dodo app.</p>
    </div>

    <p style="margin:18px 0 0;font-size:14px"><a href="${site.url}/admin" style="color:#b9532c">Open your admin dashboard →</a></p>
    <p style="margin:10px 0 0;font-size:12px;color:#6b645b">Sent every morning at 9:00 IST. If this email ever stops arriving, something is down.</p>
  </td></tr></table></td></tr></table></body></html>`;
}
