import { askGemini } from "./gemini";
import { runScan, type ScanResult } from "./scan";
import { supabaseAdmin } from "./supabase";

export type Brand = {
  id: string;
  name: string;
  website: string | null;
  questions: string[];
  customer_id: string;
};

export type Report = {
  brand: Brand;
  weekOf: string;
  score: number;
  total: number;
  previousScore: number | null;
  results: Pick<ScanResult, "keyword" | "mentioned" | "position" | "competitors">[];
  topCompetitors: { name: string; count: number }[];
  fixes: string[];
};

// Monday (UTC) of the current week, as YYYY-MM-DD. One report per brand per week.
export function currentWeekOf(now = new Date()) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = d.getUTCDay() || 7; // Sunday = 7
  d.setUTCDate(d.getUTCDate() - (day - 1));
  return d.toISOString().slice(0, 10);
}

const FIXES_SCHEMA = {
  type: "OBJECT",
  properties: { fixes: { type: "ARRAY", items: { type: "STRING" } } },
  required: ["fixes"],
};

async function writeFixes(brand: Brand, report: Omit<Report, "fixes">): Promise<string[]> {
  const lines = report.results
    .map((r) => `- "${r.keyword}": ${r.mentioned ? `mentioned at #${r.position ?? "?"}` : "NOT mentioned"}; AI named: ${r.competitors.slice(0, 5).join(", ") || "none"}`)
    .join("\n");
  const prompt = `You are an AEO/GEO (AI search visibility) consultant. Write exactly 3 specific, practical fixes this week for "${brand.name}"${brand.website ? ` (${brand.website})` : ""} to get recommended more often by AI assistants.

Results from asking AI the customer's questions:
${lines}

Most-recommended competitors: ${report.topCompetitors.map((c) => `${c.name} (${c.count}x)`).join(", ") || "none"}

Rules: each fix is one sentence, under 25 words, starts with a verb, names a specific competitor, question or type of page/site where useful. Prefer: getting listed in "best X" articles, honest comparison pages vs named competitors, answering Reddit/Quora threads on these questions, consistent business info, reviews. No generic advice.`;
  try {
    const raw = await askGemini(prompt, { jsonSchema: FIXES_SCHEMA, light: true });
    const fixes = (JSON.parse(raw).fixes ?? []).filter((f: unknown) => typeof f === "string");
    if (fixes.length) return fixes.slice(0, 3);
  } catch (err) {
    console.error("Writing fixes failed:", err);
  }
  // Fallback so a report always goes out.
  const top = report.topCompetitors[0]?.name;
  return [
    top ? `Publish an honest "${top} vs ${brand.name}" comparison page.` : `Publish an honest comparison page against your main competitor.`,
    `Get ${brand.name} listed in "best of" articles for "${report.results[0]?.keyword}".`,
    `Answer Reddit and Quora threads asking your 5 questions, mentioning ${brand.name} where relevant.`,
  ];
}

// Ask AI every question for one brand, then save the weekly report.
export async function runBrandReport(brand: Brand): Promise<Report> {
  const db = supabaseAdmin();
  const weekOf = currentWeekOf();

  const results: Report["results"] = [];
  const answers: string[] = [];
  for (const q of brand.questions) {
    try {
      const r = await runScan(brand.name, q, brand.website || undefined);
      results.push({ keyword: q, mentioned: r.mentioned, position: r.position, competitors: r.competitors });
      answers.push(r.answer);
    } catch (err) {
      console.error(`Question failed for ${brand.name}: ${q}`, err);
      results.push({ keyword: q, mentioned: false, position: null, competitors: [] });
      answers.push("");
    }
  }

  const counts = new Map<string, number>();
  for (const r of results) for (const c of r.competitors) counts.set(c, (counts.get(c) ?? 0) + 1);
  const topCompetitors = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const { data: prev } = await db
    .from("scans")
    .select("score")
    .eq("brand_id", brand.id)
    .lt("week_of", weekOf)
    .order("week_of", { ascending: false })
    .limit(1)
    .maybeSingle();

  const base = {
    brand,
    weekOf,
    score: results.filter((r) => r.mentioned).length,
    total: results.length,
    previousScore: prev?.score ?? null,
    results,
    topCompetitors,
  };
  const fixes = await writeFixes(brand, base);

  const { data: scan, error } = await db
    .from("scans")
    .upsert(
      { brand_id: brand.id, week_of: weekOf, score: base.score, total: base.total, fixes },
      { onConflict: "brand_id,week_of" },
    )
    .select("id")
    .single();
  if (error || !scan) throw new Error(`Saving scan failed: ${error?.message}`);

  // Re-running a week replaces its results.
  await db.from("scan_results").delete().eq("scan_id", scan.id);
  const { error: resultsError } = await db.from("scan_results").insert(
    results.map((r, i) => ({
      scan_id: scan.id,
      question: r.keyword,
      engine: "gemini",
      mentioned: r.mentioned,
      position: r.position,
      competitors: r.competitors,
      answer: answers[i] || null,
    })),
  );
  if (resultsError) console.error("Saving scan results failed:", resultsError.message);

  return { ...base, fixes };
}
