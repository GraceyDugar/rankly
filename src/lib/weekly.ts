import { sendReportEmail, sendSetupEmail, setupUrl } from "./email";
import { buildReport, currentWeekOf, runBrandReport, type Brand } from "./report";
import { supabaseAdmin } from "./supabase";

type BrandWithCustomer = Brand & { customers: { email: string; status: string } };

// Brands of active customers still owed a report: on Mondays, everyone
// without this week's emailed report; other days, only brand-new customers
// (no report yet), so they get their first one within minutes of signing up.
export async function pendingBrands(limit: number) {
  const db = supabaseAdmin();
  const weekOf = currentWeekOf();
  const [{ data: brands, error }, { data: done }] = await Promise.all([
    db
      .from("brands")
      .select("id, name, website, questions, customer_id, customers!inner(email, status)")
      .eq("customers.status", "active")
      .order("created_at"),
    new Date().getUTCDay() === 1
      ? db.from("scans").select("brand_id").eq("week_of", weekOf).not("emailed_at", "is", null)
      : db.from("scans").select("brand_id").not("emailed_at", "is", null),
  ]);
  if (error) throw new Error(`Loading brands failed: ${error.message}`);
  const doneIds = new Set((done ?? []).map((s) => s.brand_id));
  return ((brands ?? []) as unknown as BrandWithCustomer[]).filter((b) => !doneIds.has(b.id)).slice(0, limit);
}

// Run and email reports for the next few brands. Small batches keep each run
// well under Cloudflare's per-request limits; the cron repeats until all are done.
export async function runWeeklyBatch(limit = 1) {
  const brands = await pendingBrands(limit);
  const results: { brand: string; ok: boolean; error?: string }[] = [];
  for (const b of brands) {
    try {
      const report = await runBrandReport(b);
      await sendReportEmail(b.customers.email, report);
      await markEmailed(b.id, report.weekOf);
      results.push({ brand: b.name, ok: true });
    } catch (err) {
      console.error(`Weekly report failed for ${b.name}:`, err);
      results.push({ brand: b.name, ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  }
  return results;
}

export async function markEmailed(brandId: string, weekOf: string) {
  await supabaseAdmin()
    .from("scans")
    .update({ emailed_at: new Date().toISOString() })
    .eq("brand_id", brandId)
    .eq("week_of", weekOf);
}

export async function getBrandWithCustomer(brandId: string) {
  const { data, error } = await supabaseAdmin()
    .from("brands")
    .select("id, name, website, questions, customer_id, customers!inner(email, status)")
    .eq("id", brandId)
    .single();
  if (error || !data) throw new Error(`Brand not found: ${error?.message}`);
  return data as unknown as BrandWithCustomer;
}

// Next free report waiting in the queue: run it, email it, record the result.
export async function runNextFreeReport() {
  const db = supabaseAdmin();
  const { data: job } = await db
    .from("free_reports")
    .select("id, email, brand, website, questions")
    .eq("status", "pending")
    .order("created_at")
    .limit(1)
    .maybeSingle();
  if (!job) return null;

  // Claim it so an overlapping run doesn't send it twice.
  const { data: claimed } = await db
    .from("free_reports")
    .update({ status: "running" })
    .eq("id", job.id)
    .eq("status", "pending")
    .select("id");
  if (!claimed?.length) return null;

  try {
    const report = await buildReport({ name: job.brand, website: job.website, questions: job.questions }, null, {
      light: true,
    });
    await sendReportEmail(job.email, report, { free: true });
    await db
      .from("free_reports")
      .update({ status: "sent", score: report.score, total: report.total, sent_at: new Date().toISOString() })
      .eq("id", job.id);
    return { brand: job.brand, ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Free report failed for ${job.brand}:`, err);
    await db.from("free_reports").update({ status: "failed", error: message.slice(0, 500) }).eq("id", job.id);
    return { brand: job.brand, ok: false, error: message };
  }
}

// Paid but never finished setup, ~24h after the welcome email: remind once.
export async function sendNextSetupReminder() {
  const db = supabaseAdmin();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data } = await db
    .from("customers")
    .select("id, email, dodo_subscription_id, brands(id)")
    .eq("status", "active")
    .is("setup_reminded_at", null)
    .not("dodo_subscription_id", "is", null)
    .lt("welcome_sent_at", dayAgo)
    .limit(20);
  const target = (data ?? []).find((c) => !(c.brands as unknown[] | undefined)?.length);
  if (!target) return null;
  // Mark first so a failure can't cause repeated emails.
  await db.from("customers").update({ setup_reminded_at: new Date().toISOString() }).eq("id", target.id);
  try {
    await sendSetupEmail(target.email, setupUrl(target.dodo_subscription_id!), true);
    return { email: target.email, ok: true };
  } catch (err) {
    console.error("Setup reminder failed:", err);
    return { email: target.email, ok: false };
  }
}

// One job per cron run keeps each run well inside Cloudflare's limits.
export async function runNextJob() {
  const reminder = await sendNextSetupReminder();
  if (reminder) return { kind: "setup-reminder", ...reminder };
  const free = await runNextFreeReport();
  if (free) return { kind: "free", ...free };
  const [paid] = await runWeeklyBatch(1);
  return paid ? { kind: "subscriber", ...paid } : { kind: "idle" };
}
