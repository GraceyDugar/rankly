import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import { site } from "@/lib/site";
import StartTrial from "./StartTrial";

export const metadata = {
  title: `Start your ${site.trialDays}-day free trial — ${site.name}`,
  description: `Track whether AI recommends your business. $0 today, free for ${site.trialDays} days, then $${site.price}/month.`,
};

const included = [
  "5 customer questions checked every Monday",
  "Your AI visibility score and rank in each answer",
  "Competitors AI recommends instead, and how often",
  "3 specific fixes every week",
  "First full report today, within minutes",
  "Clean checks, like a brand-new customer",
];

function Check() {
  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-full border border-accent/50 text-xs text-accent">✓</span>
  );
}

export default function StartPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col pb-40">
      <header className="border-b border-line">
        <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-[17px] font-semibold tracking-tight">
            <LogoMark />
            {site.name}
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-foreground">
            ← Back
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 pt-14">
        <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl">
          Your <span className="font-serif font-normal italic text-accent">{site.trialDays} days free</span> start here.
        </h1>
        <Link href="/#how" className="mt-5 inline-flex items-center gap-2 text-accent hover:underline">
          ↗ See how {site.name} works (30 seconds)
        </Link>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {["$0 today", `Free for ${site.trialDays} days`, "Cancel anytime"].map((t) => (
            <p key={t} className="flex items-center gap-3 text-lg">
              <Check />
              {t}
            </p>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border-2 border-accent/60 bg-accent-soft/40 p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-semibold">{site.name} · Monthly</p>
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
              Founding price
            </span>
          </div>
          <p className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-6xl">${site.price}</span>
            <span className="text-muted">/ month after your free trial</span>
          </p>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {included.map((f) => (
            <li key={f} className="flex items-start gap-3 text-[17px]">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded bg-foreground text-[11px] text-background">✓</span>
              {f}
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-muted">
          You won&apos;t be charged today. We&apos;ll charge ${site.price} when your trial ends unless you cancel. Questions?{" "}
          <a href={`mailto:${site.supportEmail}`} className="underline">
            {site.supportEmail}
          </a>
          {" · "}
          <Link href="/terms" className="underline">
            Terms
          </Link>
          {" · "}
          <Link href="/refund" className="underline">
            Refunds
          </Link>
        </p>
      </main>

      <StartTrial />
    </div>
  );
}
