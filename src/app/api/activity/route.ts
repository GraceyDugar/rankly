import { supabaseAdmin } from "@/lib/supabase";

// Public, anonymous social proof: total checks + recent questions.
// Never exposes brand names, emails or anything that looks personal.
export async function GET() {
  const db = supabaseAdmin();
  const [{ count }, { data }] = await Promise.all([
    db.from("free_checks").select("id", { count: "exact", head: true }),
    db.from("free_checks").select("question, created_at").order("created_at", { ascending: false }).limit(25),
  ]);

  const recent = (data ?? [])
    .map((r) => ({ question: String(r.question).trim().replace(/\s+/g, " "), at: r.created_at as string }))
    // Skip anything that could identify someone: emails, links, long numbers.
    .filter((r) => r.question.length >= 8 && !/@|https?:|www\.|\d{5,}/i.test(r.question))
    .slice(0, 10)
    .map((r) => ({ ...r, question: r.question.length > 60 ? `${r.question.slice(0, 57)}…` : r.question }));

  return Response.json(
    { total: count ?? 0, recent },
    { headers: { "Cache-Control": "public, max-age=30" } },
  );
}
