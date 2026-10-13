import { Suspense } from "react";
import { site } from "@/lib/site";
import WelcomeForm from "./WelcomeForm";

export const metadata = { title: `Welcome — ${site.name}`, robots: { index: false } };

async function Content({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { subscription_id: subscriptionId, status } = await searchParams;

  if (!subscriptionId || (status && !["active", "succeeded"].includes(status))) {
    return (
      <p className="rounded-2xl border border-line bg-card p-6 text-muted">
        We couldn&apos;t confirm a payment from this link. If you were charged, reply to your receipt email and we&apos;ll sort it out.
      </p>
    );
  }
  return <WelcomeForm subscriptionId={subscriptionId} />;
}

export default function Welcome({ searchParams }: PageProps<"/welcome">) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">{"// welcome to " + site.name}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Payment received. <span className="font-serif font-normal italic text-accent">Let&apos;s set you up.</span>
        </h1>
        <p className="mt-3 text-muted">Tell us your brand and the questions your customers ask AI. Takes 2 minutes.</p>
        <div className="mt-8">
          <Suspense>
            <Content searchParams={searchParams as Promise<Record<string, string | undefined>>} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
