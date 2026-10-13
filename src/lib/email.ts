import type { Report } from "./report";
import { site } from "./site";

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function reportEmailHtml(r: Report) {
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

      <p style="margin:28px 0 0;font-size:12px;color:#6b645b">AI visibility check by ${esc(site.name)} · ${esc(site.url.replace(/^https?:\/\//, ""))}</p>
    </td></tr>
  </table></td></tr></table></body></html>`;
}

// Sends through Resend's REST API. Until rankly.world is verified in Resend,
// the default sender can only deliver to the Resend account's own email.
export async function sendReportEmail(to: string, r: Report) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || `${site.name} <onboarding@resend.dev>`,
      to: [to],
      subject: `${r.brand.name}: AI visibility ${r.score}/${r.total} this week`,
      html: reportEmailHtml(r),
    }),
  });
  if (!res.ok) throw new Error(`Resend error ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
