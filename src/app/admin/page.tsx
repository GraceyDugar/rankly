import { Suspense } from "react";
import { redirect } from "next/navigation";
import { site } from "@/lib/site";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminEmail } from "@/lib/supabase-server";
import { signOut } from "./actions";

export const metadata = { title: `Admin — ${site.name}`, robots: { index: false } };

type FreeCheck = {
  id: string;
  brand: string;
  question: string;
  mentioned: boolean | null;
  position: number | null;
  competitors: string[];
  created_at: string;
};

type Customer = { id: string; email: string; status: string; created_at: string };

async function countSince(table: string, sinceMs?: number) {
  let q = supabaseAdmin().from(table).select("id", { count: "exact", head: true });
  if (sinceMs !== undefined) q = q.gte("created_at", new Date(Date.now() - sinceMs).toISOString());
  const { count } = await q;
  return count ?? 0;
}

function when(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

async function Dashboard() {
  const email = await getAdminEmail();
  if (!email) redirect("/admin/login");

  const DAY = 24 * 60 * 60 * 1000;
  const db = supabaseAdmin();
  const [today, week, allTime, activeCustomers, checksRes, customersRes] = await Promise.all([
    countSince("free_checks", DAY),
    countSince("free_checks", 7 * DAY),
    countSince("free_checks"),
    db.from("customers").select("id", { count: "exact", head: true }).eq("status", "active"),
    db
      .from("free_checks")
      .select("id, brand, question, mentioned, position, competitors, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    db.from("customers").select("id, email, status, created_at").order("created_at", { ascending: false }).limit(100),
  ]);

  const checks = (checksRes.data ?? []) as FreeCheck[];
  const customers = (customersRes.data ?? []) as Customer[];
  const mentionRate = checks.length
    ? Math.round((checks.filter((c) => c.mentioned).length / checks.length) * 100)
    : 0;

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">{"// admin"}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{site.name} dashboard</h1>
        </div>
        <form action={signOut} className="flex items-center gap-3 text-sm text-muted">
          <span className="hidden sm:inline">{email}</span>
          <button className="rounded-full border border-line px-4 py-2 hover:bg-card">Sign out</button>
        </form>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat label="Checks today" value={today} />
        <Stat label="Checks · 7 days" value={week} />
        <Stat label="Checks · all time" value={allTime} />
        <Stat label="Mentioned rate" value={`${mentionRate}%`} />
        <Stat label="Paying customers" value={activeCustomers.count ?? 0} />
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">Latest free checks</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line font-mono text-[11px] uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Question</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3">Competitors named</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {checks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">No free checks yet.</td>
                </tr>
              )}
              {checks.map((c) => (
                <tr key={c.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{when(c.created_at)}</td>
                  <td className="px-4 py-3 font-medium">{c.brand}</td>
                  <td className="px-4 py-3">{c.question}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {c.mentioned ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                        #{c.position ?? "?"}
                      </span>
                    ) : (
                      <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">not mentioned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{c.competitors.slice(0, 4).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">Customers</h2>
        <div className="mt-4 rounded-2xl border border-line bg-card">
          {customers.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">No customers yet — they&apos;ll appear once payments are live.</p>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {customers.map((c) => (
                <li key={c.id} className="flex items-center justify-between px-4 py-3">
                  <span>{c.email}</span>
                  <span className="flex items-center gap-4 text-muted">
                    <span>{c.status}</span>
                    <span>{when(c.created_at)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <Suspense fallback={<p className="text-muted">Loading dashboard…</p>}>
        <Dashboard />
      </Suspense>
    </main>
  );
}
