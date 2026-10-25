import Link from "next/link";
import AiCrawlerChecker from "@/components/AiCrawlerChecker";
import { LegalFooter } from "@/components/LegalPage";
import LogoMark from "@/components/LogoMark";
import { site } from "@/lib/site";

const title = "Free AI Crawler Checker: Is Your Site Blocking ChatGPT?";
const description =
  "Check if your robots.txt lets ChatGPT, Claude, Perplexity, Gemini and other AI crawlers read your website. Free, results in seconds, no signup.";

export const metadata = {
  title: `${title} | ${site.name}`,
  description,
  alternates: { canonical: "/ai-crawler-checker" },
  openGraph: { title, description, url: "/ai-crawler-checker", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

const faqs = [
  {
    q: "Does blocking GPTBot remove my site from ChatGPT?",
    a: "No. GPTBot collects data to train OpenAI's models. ChatGPT search uses OAI-SearchBot, and ChatGPT-User opens pages that people ask about. If those two are allowed, ChatGPT can still find and cite your site.",
  },
  {
    q: "What is Google-Extended?",
    a: "A robots.txt token rather than a separate crawler. Blocking it stops Google from using your content to train and ground Gemini. It doesn't affect how your site appears in Google Search.",
  },
  {
    q: "What is llms.txt?",
    a: "A proposed plain-text file at /llms.txt that summarises your site for AI tools. It's optional and not an official standard yet, but it's a quick way to tell AI what you do.",
  },
  {
    q: "If AI crawlers are allowed, will AI recommend my business?",
    a: `Not necessarily. Allowed means AI can read your site. Whether it recommends you depends on what it finds across the web, such as reviews, "best of" lists and comparisons. ${site.name} checks whether AI actually recommends you.`,
  },
];

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-line bg-card p-4 font-mono text-[13px] leading-relaxed text-foreground">{children}</pre>
  );
}

export default function AiCrawlerCheckerPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "AI Crawler Checker",
      url: `${site.url}/ai-crawler-checker`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@type": "Organization", name: site.name, url: site.url },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="border-b border-line">
        <nav className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-[17px] font-semibold tracking-tight">
            <LogoMark />
            {site.name}
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-foreground">Free AI visibility check →</Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">Free tool · AEO &amp; GEO</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          AI crawler checker. <span className="font-serif font-normal italic text-accent">Can AI read your site?</span>
        </h1>
        <p className="mt-4 text-lg leading-snug text-muted">
          See if your robots.txt lets ChatGPT, Claude, Perplexity, Gemini and other AI crawlers read your website.
        </p>
        <div className="mt-8">
          <AiCrawlerChecker />
        </div>

        <div className="mt-20 space-y-6 leading-relaxed text-muted [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground">
          <h2>Why AI crawler access matters</h2>
          <p>
            AI tools can only quote what they can read. If your robots.txt blocks their crawlers, ChatGPT search, Perplexity
            and others can&apos;t open your pages. They fall back on what other sites say about you, or leave you out.
          </p>

          <h2>Three kinds of AI crawler</h2>
          <ul className="space-y-2">
            <li>
              <strong>Search:</strong> OAI-SearchBot, Claude-SearchBot, PerplexityBot, Googlebot and Bingbot find pages to show
              and cite in answers.
            </li>
            <li>
              <strong>Reads pages when asked:</strong> ChatGPT-User, Claude-User and Perplexity-User open a page when someone
              asks about it.
            </li>
            <li>
              <strong>Training:</strong> GPTBot, ClaudeBot, Google-Extended, CCBot and others collect text to train future
              models.
            </li>
          </ul>
          <p>Blocking a training crawler doesn&apos;t hide you from that company&apos;s AI search. Blocking a search crawler does.</p>

          <h2>How to allow AI crawlers in robots.txt</h2>
          <p>To let every crawler in, your robots.txt only needs:</p>
          <Code>{"User-agent: *\nAllow: /"}</Code>
          <p>To stay in AI search but opt out of training, block only the training crawlers:</p>
          <Code>{"User-agent: GPTBot\nUser-agent: ClaudeBot\nUser-agent: Google-Extended\nUser-agent: CCBot\nDisallow: /\n\nUser-agent: *\nAllow: /"}</Code>

          <h2>What this checker can&apos;t see</h2>
          <p>
            It reads your robots.txt, which is what well-behaved crawlers follow. A firewall or CDN bot setting can still turn
            crawlers away without changing robots.txt, so if you use one, check its bot settings too.
          </p>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">Questions</h2>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {faqs.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] font-medium hover:text-accent [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <svg aria-hidden viewBox="0 0 20 20" className="size-5 shrink-0 text-muted transition group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <p className="-mt-1 pb-5 pr-10 leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl bg-foreground p-8 text-background md:p-10">
          <h2 className="text-3xl font-semibold tracking-tight">
            AI can read you. <span className="font-serif font-normal italic text-[#e8a07f]">Does it recommend you?</span>
          </h2>
          <p className="mt-3 text-background/70">
            Ask AI a question your customers ask, and see if it names you or a competitor. Free, about 30 seconds.
          </p>
          <Link href="/" className="mt-6 inline-block rounded-full bg-background px-6 py-3 font-medium text-foreground hover:bg-background/90">
            Run a free AI visibility check →
          </Link>
        </section>
      </main>
      <LegalFooter />
    </div>
  );
}
