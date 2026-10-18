import { site } from "@/lib/site";

// llms.txt: a plain-language summary of Rankly for AI assistants and crawlers.
// Proposed standard: https://llmstxt.org
export const dynamic = "force-static";

export function GET() {
  const u = site.url;
  const body = `# ${site.name}

> ${site.name} is an AI visibility tracker (AEO & GEO / AI SEO tool). It checks whether AI assistants recommend a business when customers ask questions like "best CRM for freelancers", shows which competitors are recommended instead, and emails a weekly report with an AI visibility score and 3 specific fixes.

## Key facts
- Website: ${u}
- Category: AI visibility tracking, answer engine optimization (AEO), generative engine optimization (GEO), AI SEO
- Who it's for: small businesses, startups, indie founders, freelancers and local businesses
- Price: $${site.price}/month after a ${site.trialDays}-day free trial; cancel anytime
- Free tool: a free AI visibility check on the homepage, no signup required
- How it works: add your brand and up to 5 customer questions; ${site.name} asks AI every Monday like a brand-new customer would, records whether you're recommended and your rank, lists competitors named instead, and emails 3 fixes
- Contact: ${site.supportEmail}

## Pages
- [Home and free AI visibility check](${u}/): run a free check and see the plan
- [How it works](${u}/#how): the 5-step weekly process
- [Why ${site.name}](${u}/#compare): comparison with asking AI yourself and with larger AI SEO tools
- [Pricing](${u}/#pricing): $${site.price}/month, ${site.trialDays}-day free trial
- [FAQ](${u}/#faq): AEO vs GEO vs SEO, how to get recommended by AI, and more
- [Terms](${u}/terms) · [Privacy](${u}/privacy) · [Refunds](${u}/refund)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
