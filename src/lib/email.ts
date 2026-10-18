import type { Report } from "./report";
import { site } from "./site";

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

// `free`: one-off free report, so end with an upgrade button.
export function reportEmailHtml(r: Report, opts: { free?: boolean } = {}) {
  const change =
    r.previousScore === null
      ? "Your first report"
      : r.score > r.previousScore
        ? `↑ ${r.score - r.previousScore} from last week`
        : r.score < r.previousScore
          ? `↓ ${r.previousScore - r.score} from last week`
          : "Same as last week";

  const rows = r.results
    .map(
      (q) => `<tr>
        <td style="padding:10px 0;border-top:1px solid #e6dfd4;font-size:14px;color:#16130f">${esc(q.keyword)}</td>
        <td style="padding:10px 0;border-top:1px solid #e6dfd4;font-size:14px;text-align:right;white-space:nowrap;color:${q.mentioned ? "#047857" : "#b9532c"}">
          ${q.mentioned ? `#${q.position ?? "?"}` : "not mentioned"}
        </td>
      </tr>`,
    )
    .join("");

  const competitors = r.topCompetitors.length
    ? r.topCompetitors.map((c) => `${esc(c.name)} (${c.count}×)`).join(", ")
    : "No competitors named this week.";

  const fixes = r.fixes.map((f) => `<li style="margin:0 0 8px">${esc(f)}</li>`).join("");

  return `<!doctype html><html><body style="margin:0;background:#f8f5f0;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf9;border:1px solid #e6dfd4;border-radius:16px;padding:28px">
    <tr><td>
      <p style="margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b645b">${esc(site.name)} · weekly AI visibility report</p>
      <h1 style="margin:12px 0 4px;font-size:24px;color:#16130f">${esc(r.brand.name)}: ${r.score}/${r.total}</h1>
      <p style="margin:0 0 20px;font-size:14px;color:#6b645b">AI recommended you for ${r.score} of your ${r.total} questions · ${change}</p>

      <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>

      <p style="margin:24px 0 6px;font-size:13px;font-weight:600;color:#16130f">Beating you</p>
      <p style="margin:0;font-size:14px;color:#6b645b">${competitors}</p>

      <p style="margin:24px 0 8px;font-size:13px;font-weight:600;color:#16130f">This week's 3 fixes</p>
      <ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.5;color:#16130f">${fixes}</ol>

      ${
        opts.free
          ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;background:#16130f;border-radius:12px"><tr><td style="padding:20px">
        <p style="margin:0;font-size:15px;font-weight:600;color:#f8f5f0">AI answers change every week.</p>
        <p style="margin:6px 0 16px;font-size:14px;color:#c9c2b8">Get this report every Monday, see if your fixes work, and catch competitors overtaking you.</p>
        <a href="${site.url}/#pricing" style="display:inline-block;background:#b9532c;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 18px;border-radius:8px">Track it weekly · $${site.price}/month →</a>
      </td></tr></table>`
          : ""
      }
      <p style="margin:28px 0 0;font-size:12px;color:#6b645b">AI visibility check by ${esc(site.name)} · ${esc(site.url.replace(/^https?:\/\//, ""))}</p>
    </td></tr>
  </table></td></tr></table></body></html>`;
}

// Sends through Resend's REST API. Until rankly.world is verified in Resend,
// the default sender can only deliver to the Resend account's own email.
export async function sendReportEmail(to: string, r: Report, opts: { free?: boolean } = {}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || `${site.name} <onboarding@resend.dev>`,
      to: [to],
      reply_to: site.supportEmail,
      subject: opts.free
        ? `Your free AI visibility report: ${r.brand.name} ${r.score}/${r.total}`
        : `${r.brand.name}: AI visibility ${r.score}/${r.total} this week`,
      html: reportEmailHtml(r, opts),
    }),
  });
  if (!res.ok) throw new Error(`Resend error ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

// Sent right after payment (and once more a day later if they haven't
// finished), so nobody pays and never gets a report.
export async function sendSetupEmail(to: string, setupUrl: string, reminder = false) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  const title = reminder ? "One step left to get your first AI visibility report" : `Welcome to ${site.name}! Finish setup (2 min)`;
  const intro = reminder
    ? "You're subscribed, but we don't know your brand yet, so we can't send your report."
    : "Thanks for subscribing. Tell us your brand and the questions your customers ask AI, and your first report arrives within minutes.";
  const html = `<!doctype html><html><body style="margin:0;background:#f8f5f0;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fffdf9;border:1px solid #e6dfd4;border-radius:16px;padding:28px">
    <tr><td>
      <p style="margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b645b">${esc(site.name)}</p>
      <h1 style="margin:12px 0 10px;font-size:22px;color:#16130f">${esc(title)}</h1>
      <p style="margin:0 0 22px;font-size:15px;line-height:1.5;color:#6b645b">${esc(intro)}</p>
      <a href="${setupUrl}" style="display:inline-block;background:#b9532c;color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 20px;border-radius:10px">Finish setup →</a>
      <p style="margin:22px 0 0;font-size:12px;color:#6b645b">Takes 2 minutes. Questions? Just reply to this email.</p>
    </td></tr>
  </table></td></tr></table></body></html>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || `${site.name} <onboarding@resend.dev>`,
      to: [to],
      reply_to: site.supportEmail,
      subject: title,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend error ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

export function setupUrl(subscriptionId: string) {
  return `${site.url}/welcome?subscription_id=${encodeURIComponent(subscriptionId)}&status=active`;
}
