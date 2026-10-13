import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { site } from "@/lib/site";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminEmail } from "@/lib/supabase-server";
import { runReportNow, signOut } from "./actions";
import AddCustomerForm from "./AddCustomerForm";
import RunReportButton from "./RunReportButton";

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

type BrandRow = {
  id: string;
  name: string;
  questions: string[];
  customers: { email: string; status: string };
  scans: { week_of: string; score: number; total: number }[];
};

type Signup = { id: string; email: string; brand: string | null; created_at: string };

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
  // Always render at request time: the stats depend on the current time.
  await connection();
  const email = await getAdminEmail();
  if (!email) redirect("/admin/login");

  const DAY = 24 * 60 * 60 * 1000;
  const db = supabaseAdmin();
  const [today, week, allTime, activeCustomers, checksRes, signupsRes, brandsRes] = await Promise.all([
    countSince("free_checks", DAY),
    countSince("free_checks", 7 * DAY),
    countSince("free_checks"),
    db.from("customers").select("id", { count: "exact", head: true }).eq("status", "active"),
    db
      .from("free_checks")
      .select("id, brand, question, mentioned, position, competitors, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    db.from("waitlist").select("id, email, brand, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(500),
    db
      .from("brands")
      .select("id, name, questions, customers!inner(email, status), scans(week_of, score, total)")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);
  const brands = (brandsRes.data ?? []) as unknown as BrandRow[];
  const signups = (signupsRes.data ?? []) as Signup[];

  const checks = (checksRes.data ?? []) as FreeCheck[];
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

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-6">
        <Stat label="Checks today" value={today} />
        <Stat label="Checks · 7 days" value={week} />
        <Stat label="Checks · all time" value={allTime} />
        <Stat label="Mentioned rate" value={`${mentionRate}%`} />
        <Stat label="Early access" value={signupsRes.count ?? 0} />
        <Stat label="Paying customers" value={activeCustomers.count ?? 0} />
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">Early access list</h2>
        <div className="mt-4 rounded-2xl border border-line bg-card">
          {signups.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">No signups yet.</p>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {signups.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="font-medium">{s.email}</span>
                  <span className="flex items-center gap-4 text-muted">
                    <span>{s.brand || "—"}</span>
                    <span className="whitespace-nowrap">{when(s.created_at)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {signups.length > 0 && (
          <details className="mt-3 text-sm text-muted">
            <summary className="cursor-pointer">Copy all emails</summary>
            <textarea readOnly className="mt-2 h-24 w-full rounded-xl border border-line bg-card p-3 font-mono text-xs" value={signups.map((s) => s.email).join(", ")} />
          </details>
        )}
      </section>

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
        <h2 className="text-xl font-semibold tracking-tight">Customers &amp; weekly reports</h2>
        <p className="mt-1 text-sm text-muted">
          Reports run automatically every Monday. &ldquo;Run report now&rdquo; scans and emails one brand immediately.
        </p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-card">
          {brands.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">No customers yet. Add one below to test.</p>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line font-mono text-[11px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Latest score</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {brands.map((b) => {
                  const latest = [...b.scans].sort((x, y) => y.week_of.localeCompare(x.week_of))[0];
                  return (
                    <tr key={b.id}>
                      <td className="px-4 py-3 font-medium">
                        {b.name}
                        <span className="block text-xs font-normal text-muted">{b.questions.length} questions</span>
                      </td>
                      <td className="px-4 py-3">{b.customers.email}</td>
                      <td className="px-4 py-3 text-muted">{b.customers.status}</td>
                      <td className="px-4 py-3">
                        {latest ? `${latest.score}/${latest.total} · week of ${latest.week_of}` : <span className="text-muted">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <form action={runReportNow}>
                          <input type="hidden" name="brandId" value={b.id} />
                          <RunReportButton />
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <h3 className="mt-8 font-semibold tracking-tight">Add a customer manually</h3>
        <p className="mt-1 text-sm text-muted">For testing, or to give someone free access before payments are live.</p>
        <div className="mt-3">
          <AddCustomerForm />
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
