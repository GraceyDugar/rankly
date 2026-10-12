import FreeScan from "@/components/FreeScan";
import { CtaButton, EarlyAccessDialog } from "@/components/EarlyAccess";
import { site } from "@/lib/site";

function Logo() {
  return (
    <a href="#" className="flex items-center gap-2 text-[17px] font-semibold tracking-tight">
      <span className="grid size-7 place-items-center rounded-lg bg-foreground font-serif text-lg italic text-background">
        {site.name[0]}
      </span>
      {site.name}
    </a>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-xs uppercase tracking-widest text-muted">{children}</p>;
}

// Floating "AI engine" tiles from the hero, Cloudflare-style.
function EngineTile({ name, glyph, className, rotate }: { name: string; glyph: string; className: string; rotate: string }) {
  return (
    <div
      className={`float absolute z-10 hidden flex-col items-center gap-1 rounded-2xl border border-line bg-card/90 px-4 py-3 shadow-[0_10px_30px_-15px_rgba(60,30,10,0.35)] backdrop-blur lg:flex ${className}`}
      style={{ ["--r" as string]: rotate }}
    >
      <span className="font-serif text-2xl italic text-accent">{glyph}</span>
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{name}</span>
    </div>
  );
}

// Mock of a weekly result, shown beside the hero form.
function ReportCard() {
  const rows = [
    { name: "Northwind CRM", ok: true },
    { name: "Ledgerly", ok: true },
    { name: "You", ok: false },
  ];
  return (
    <div className="relative rounded-3xl border border-line bg-card p-7 shadow-[0_30px_80px_-40px_rgba(60,30,10,0.45)]">
      <div className="flex items-center justify-between font-mono text-[11px] text-muted">
        <span>{"// monday report"}</span>
        <span>{site.name.toUpperCase()}</span>
      </div>
      <p className="mt-8 font-mono text-xs text-muted">Q: “best CRM for freelancers”</p>
      <p className="mt-2 text-3xl font-semibold leading-tight tracking-tight">
        AI recommends your <span className="font-serif text-4xl font-normal italic text-accent">competitor.</span>
      </p>
      <ul className="mt-6 space-y-2">
        {rows.map((r, i) => (
          <li key={r.name} className="flex items-center justify-between rounded-xl border border-line bg-background px-4 py-3 text-sm">
            <span className="flex items-center gap-3">
              <span className="w-5 font-mono text-xs text-muted">{r.ok ? `#${i + 1}` : "—"}</span>
              <span className={r.ok ? "" : "font-medium"}>{r.name}</span>
            </span>
            {r.ok ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">recommended</span>
            ) : (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">not mentioned</span>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-end justify-between border-t border-line pt-5">
        <div>
          <p className="font-mono text-[11px] text-muted">AI VISIBILITY SCORE</p>
          <p className="text-4xl font-semibold tracking-tight">
            2<span className="text-xl text-muted">/5</span>
          </p>
        </div>
        <p className="text-sm text-muted">+ 3 fixes →</p>
      </div>
    </div>
  );
}

const deliverables = [
  { title: "5 questions tracked", body: "What your customers ask AI." },
  { title: "Weekly AI check", body: "Every Monday. Fully automatic." },
  { title: "AI visibility score", body: "Your rank in every answer." },
  { title: "Competitor watch", body: "Who AI recommends instead." },
  { title: "3 fixes a week", body: "Exactly what to do next." },
  { title: "History", body: "See what's working over time." },
];

const flow = [
  { icon: "✎", title: "Add your brand", body: "Your business + 5 questions customers ask AI." },
  { icon: "⏱", title: "Every Monday", body: "Rankly asks AI search your questions — automatically." },
  { icon: "◎", title: "Who gets named", body: "We find which brands AI recommends, and your rank." },
  { icon: "▲", title: "AI visibility score", body: "Your score, competitors, and change vs. last week." },
  { icon: "✉", title: "Report + 3 fixes", body: "In your inbox: exactly what to do to rank higher." },
];

const faqs = [
  {
    q: "What is an AI visibility tracker?",
    a: `A tool that checks whether AI search tools recommend your business when customers ask questions like “best CRM for freelancers”. ${site.name} runs those checks every week and shows where you rank.`,
  },
  {
    q: "How do I check if AI recommends my business for free?",
    a: "Use the free check at the top of this page. Enter your brand and a question your customers ask — you'll see if AI mentions you and who it recommends instead. No signup needed.",
  },
  {
    q: `What do I get for $${site.price} a month?`,
    a: "5 customer questions checked every Monday, your AI visibility score and rank, the competitors AI recommends instead, 3 specific fixes each week, and your full history.",
  },
  {
    q: "What is the difference between SEO, AEO and GEO?",
    a: "SEO gets you ranked in Google's blue links. AEO (answer engine optimization) and GEO (generative engine optimization) get you named inside AI answers. Together they're often called AI SEO.",
  },
  {
    q: "How do I get my business recommended by AI search?",
    a: "Get listed in “best of” articles for your niche, publish honest comparison pages, answer real questions on Reddit and Quora, keep your business details consistent everywhere, and collect reviews. Your weekly report tells you which of these to do first.",
  },
  {
    q: "Why doesn't AI mention my business?",
    a: "Usually because AI hasn't seen enough about you on other websites yet — few reviews, list mentions or discussions. New brands are often missing simply because AI learned from older data.",
  },
  {
    q: "Why can't I just ask ChatGPT or Gemini myself?",
    a: "You can — but AI remembers you and your chats, so it may show you a flattering answer your customers never see. And doing it every week, for every question, quickly becomes a chore. We check in a clean session, automatically.",
  },
  {
    q: "Which AI search tools does it track?",
    a: "Google's AI (Gemini) today. ChatGPT and Perplexity are coming next, free for existing subscribers.",
  },
  {
    q: "How often is my AI visibility checked?",
    a: "Every Monday. Your report lands in your inbox the same morning.",
  },
  {
    q: "How long does it take to improve AI visibility?",
    a: "Usually weeks to months. AI answers change as new articles, reviews and discussions appear — which is exactly why tracking it weekly matters.",
  },
  {
    q: "Can you guarantee AI will recommend my business?",
    a: "No one honestly can. We show you exactly where you stand and the changes most likely to move you up.",
  },
  {
    q: `Who is ${site.name} for?`,
    a: "Small businesses, startups, indie founders, freelancers and local businesses who want customers to find them through AI search — without paying for an agency.",
  },
  {
    q: "Is the free AI visibility check really free?",
    a: "Yes. No card, no signup. You get 3 free checks a day.",
  },
  {
    q: "Is my data safe?",
    a: "We only store what you give us: your business name, your questions and your email. We never sell your data.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. It's month to month — cancel in one click and you won't be charged again.",
  },
];

export default function Home() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: site.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "AI visibility tracker for AI search (AEO & GEO, AI SEO). Checks weekly whether Google's AI recommends your business, which competitors it names instead, and what to fix.",
      offers: { "@type": "Offer", price: String(site.price), priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="relative overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Faint vertical grid lines, like an editorial layout. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 mx-auto hidden max-w-6xl grid-cols-4 px-6 md:grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-l border-line/70 last:border-r" />
        ))}
      </div>

      <header className="sticky top-0 z-30 border-b border-line/80 bg-background/80 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <div className="hidden items-center gap-8 text-[15px] text-muted md:flex">
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#value" className="hover:text-foreground">What you get</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </div>
          <CtaButton className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/85">
            {site.checkoutUrl ? `Start for $${site.price}/mo` : "Get early access"}
          </CtaButton>
        </nav>
      </header>

      <main className="relative">
        {/* Hero */}
        <section className="relative">
          <div aria-hidden className="dot-grid pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-40 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
          <svg aria-hidden className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block" preserveAspectRatio="none" viewBox="0 0 1200 800">
            <path d="M40 620 C 260 520, 380 700, 560 560 S 900 260, 1160 300" fill="none" stroke="var(--accent)" strokeOpacity="0.45" strokeWidth="1.2" strokeDasharray="3 6" />
            <circle cx="40" cy="620" r="3" fill="var(--accent)" />
            <circle cx="1160" cy="300" r="3" fill="var(--accent)" />
          </svg>

          <div className="relative mx-auto grid max-w-6xl gap-14 px-6 pb-24 pt-16 md:pt-24 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <Label>AI visibility tracker · AEO &amp; GEO</Label>
              <h1 className="mt-6 text-[48px] font-semibold leading-[1] tracking-[-0.04em] sm:text-6xl lg:text-[76px]">
                Get on AI&apos;s <span className="font-serif font-normal italic text-accent">shortlist.</span>
              </h1>
              <p className="mt-6 max-w-md text-xl leading-snug text-muted">
                See if AI search recommends your business — and who it names instead.
              </p>
              <div className="mt-10 max-w-xl">
                <FreeScan />
                <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-muted">
                  Checks Google&apos;s AI (Gemini) today · ChatGPT &amp; Perplexity soon
                </p>
              </div>
            </div>

            <div className="relative">
              <EngineTile name="Gemini" glyph="G" rotate="-8deg" className="-left-10 -top-10" />
              <EngineTile name="ChatGPT" glyph="C" rotate="6deg" className="-right-6 -top-14" />
              <EngineTile name="Perplexity" glyph="P" rotate="-4deg" className="-bottom-10 -right-4" />
              <ReportCard />
            </div>
          </div>
        </section>


        {/* How it works: the full flow */}
        <section id="how" className="scroll-mt-20 border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <Label>{"// how it works"}</Label>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Set up once. <span className="font-serif font-normal italic text-accent">Rankly does the rest.</span>
            </h2>
            <ol className="mt-12 grid gap-4 md:grid-cols-5">
              {flow.map((f, i) => (
                <li key={f.title} className="relative rounded-2xl border border-line bg-card p-5">
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-lg text-accent">{f.icon}</span>
                    <span className="font-mono text-xs text-muted">0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{f.body}</p>
                  {i < flow.length - 1 && (
                    <span aria-hidden className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-accent md:block">→</span>
                  )}
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-muted">
              2 minutes to set up · Fully automatic · No dashboards to learn
            </p>
          </div>
        </section>

        {/* What you get */}
        <section id="value" className="scroll-mt-20 border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <Label>{"// what you get"}</Label>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Your weekly AI SEO report. <span className="font-serif font-normal italic text-accent">${site.price}/month.</span>
            </h2>
            <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {deliverables.map((d) => (
                <div key={d.title} className="bg-card p-7">
                  <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                    <span className="text-accent">✓</span>
                    {d.title}
                  </h3>
                  <p className="mt-1 text-muted">{d.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
              {[
                ["By hand", "~1 hr every week"],
                ["Other AI SEO tools", "$50+/month"],
                [site.name, `$${site.price}/month, automatic`],
              ].map(([who, cost], i) => (
                <div key={who} className={`rounded-2xl border p-5 ${i === 2 ? "border-accent/40 bg-accent-soft/50" : "border-line"}`}>
                  <p className={`font-mono text-xs uppercase tracking-widest ${i === 2 ? "text-accent" : "text-muted"}`}>{who}</p>
                  <p className="mt-1 text-lg font-semibold tracking-tight">{cost}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works + sample report */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid items-center gap-12 rounded-3xl bg-foreground p-8 text-background md:p-14 lg:grid-cols-2">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-background/60">{"// your monday report"}</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight">
                Not a dashboard. <span className="font-serif font-normal italic text-[#e8a07f]">A to-do list.</span>
              </h2>
              <p className="mt-4 text-background/70">
                One short email every Monday: where you stand in AI search, who&apos;s beating you, and what to fix.
              </p>
            </div>
            <div className="rounded-2xl bg-card p-6 text-foreground">
              <p className="text-xs text-muted">From {site.name} · Monday</p>
              <p className="mt-1 font-semibold">AI visibility: 3/5 (↑ 1)</p>
              <p className="mt-4 rounded-lg bg-background p-3 text-sm">
                <span className="font-medium">Beating you:</span> Northwind (9×), Ledgerly (6×)
              </p>
              <p className="mt-4 text-sm font-medium">This week&apos;s fixes</p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-muted">
                <li>Publish “Northwind vs you”</li>
                <li>Get listed in “Best CRMs for freelancers”</li>
                <li>Answer 2 Reddit threads</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-6 pb-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <Label>{"// pricing"}</Label>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                One plan. <span className="font-serif font-normal italic text-accent">Less than lunch.</span>
              </h2>
            </div>
            <div className="rounded-3xl border border-line bg-card p-8 shadow-[0_30px_80px_-50px_rgba(60,30,10,0.5)]">
              <p className="mb-3 inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
                Founding price — locked in forever
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-semibold tracking-tight">${site.price}</span>
                <span className="text-muted">/month</span>
              </div>
              <ul className="mt-6 space-y-3 text-[15px]">
                {[
                  "5 questions, checked every Monday",
                  "AI visibility score + rank",
                  "Competitors AI recommends",
                  "3 fixes every week",
                  "Google Gemini now · ChatGPT & Perplexity free when added",
                  "Cancel anytime",
                ].map((f) => (
                  <li key={f} className="flex gap-3">
                    <span className="text-accent">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <CtaButton className="mt-8 block w-full rounded-xl bg-accent py-3.5 text-center font-medium text-white hover:brightness-110">
                {site.checkoutUrl ? "Start tracking" : "Get early access — no payment today"}
              </CtaButton>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-4xl scroll-mt-20 px-6 pb-24">
          <Label>{"// faq"}</Label>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">
            Questions about <span className="font-serif font-normal italic text-accent">AI visibility.</span>
          </h2>
          <div className="mt-10 divide-y divide-line border-y border-line">
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

        {/* Final CTA */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-24 text-center">
            <h2 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              Is AI search recommending <span className="font-serif font-normal italic text-accent">you?</span>
            </h2>
            <a href="#" className="mt-10 inline-block rounded-full bg-foreground px-8 py-4 font-medium text-background hover:bg-foreground/85">
              Check free ↑
            </a>
          </div>
        </section>
      </main>

      <EarlyAccessDialog />

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted sm:flex-row">
          <Logo />
          <p>© 2026 {site.name} · AI visibility tracker for AEO &amp; GEO</p>
        </div>
      </footer>
    </div>
  );
}
