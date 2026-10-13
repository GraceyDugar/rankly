import { sendReportEmail } from "./email";
import { currentWeekOf, runBrandReport, type Brand } from "./report";
import { supabaseAdmin } from "./supabase";

type BrandWithCustomer = Brand & { customers: { email: string; status: string } };

// Brands of active customers that don't have this week's report yet.
export async function pendingBrands(limit: number) {
  const db = supabaseAdmin();
  const weekOf = currentWeekOf();
  const [{ data: brands, error }, { data: done }] = await Promise.all([
    db
      .from("brands")
      .select("id, name, website, questions, customer_id, customers!inner(email, status)")
      .eq("customers.status", "active")
      .order("created_at"),
    db.from("scans").select("brand_id").eq("week_of", weekOf).not("emailed_at", "is", null),
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
