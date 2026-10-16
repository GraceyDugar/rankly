import Link from "next/link";
import { site } from "@/lib/site";
import LogoMark from "@/components/LogoMark";

// Shared layout for the Terms, Privacy and Refund pages.
export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-line">
        <nav className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-[17px] font-semibold tracking-tight">
            <LogoMark />
            {site.name}
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-foreground">← Back to home</Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">Last updated {updated}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{title}</h1>
        <div className="mt-10 space-y-6 leading-relaxed text-muted [&_a]:text-accent [&_a]:underline [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground">
          {children}
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}

export function LegalFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted sm:flex-row">
        <p>© 2026 {site.name} · AI visibility tracker for AEO &amp; GEO</p>
        <div className="flex gap-6">
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/refund" className="hover:text-foreground">Refunds</Link>
          <a href={`mailto:${site.supportEmail}`} className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}
