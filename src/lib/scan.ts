import { askGemini, GeminiError } from "./gemini";

export type ScanResult = {
  engine: "gemini";
  keyword: string;
  mentioned: boolean;
  position: number | null; // 1 = first brand named in the answer
  competitors: string[];
  // A closely related name AI did mention (same group or brand family, but a
  // different organization), shown honestly instead of counted as a mention.
  related: { name: string; position: number } | null;
  answer: string;
  // true = answer used live Google Search; false = the AI's built-in knowledge
  searched: boolean;
};

const EXTRACT_SCHEMA = {
  type: "OBJECT",
  properties: {
    brands: {
      type: "ARRAY",
      description: "Every business, product, institution or brand recommended in the answer, in the order they appear.",
      items: { type: "STRING" },
    },
    target_index: {
      type: "INTEGER",
      description: "0-based index in `brands` of the entry that is the target organization, or -1 if it isn't there.",
    },
    related_index: {
      type: "INTEGER",
      description: "0-based index of an entry from the same group or brand family as the target but a different organization, or -1.",
    },
  },
  required: ["brands", "target_index", "related_index"],
};

// Words that don't identify an organization on their own.
const GENERIC = new Set(
  "the a an and of for in at by co inc ltd llc pvt limited corp company group university college institute school academy engineering technology tech science sciences management business global international national india app apps ai hq labs studio studios solutions services software online digital".split(
    " ",
  ),
);

function distinctiveWords(s: string) {
  return s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !GENERIC.has(w));
}

// Same brand family: shares all distinctive words of the brand (at least 2),
// e.g. "Dayananda Sagar University" ↔ "Dayananda Sagar College of Engineering".
function sameFamily(brand: string, candidate: string) {
  const mine = distinctiveWords(brand);
  if (mine.length < 2) return false;
  const theirs = new Set(distinctiveWords(candidate));
  return mine.every((w) => theirs.has(w));
}

function normalize(s: string) {
  return s.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[^a-z0-9]/g, "");
}

// Step 1: ask the AI the question a real customer would ask.
// Step 2: pull out which brands it recommended and where the user ranks.
export async function runScan(brand: string, keyword: string, website?: string): Promise<ScanResult> {
  const question = `${keyword}\n\nGive specific recommendations (names of businesses, products or services) with a one-line reason for each.`;

  // Web search isn't included in every Gemini plan (e.g. the free tier),
  // so fall back to the model's built-in knowledge when it's unavailable.
  let answer: string;
  let searched = process.env.GEMINI_SEARCH !== "off";
  try {
    answer = await askGemini(question, { search: searched });
  } catch (err) {
    if (!searched || !(err instanceof GeminiError) || err.status !== 429) throw err;
    searched = false;
    answer = await askGemini(question);
  }

  // Let the model judge whether a listed name is really the user's brand
  // (abbreviations, former names, official campuses or sub-brands count;
  // a different organization with a similar name does not).
  const extracted = await askGemini(
    `The user asked: "${keyword}"

List every business, product, institution or brand that this answer RECOMMENDS as an answer to that question, in order of appearance (names only). Include only things of the kind the user asked for (e.g. if they asked for colleges, list colleges, not recruiting companies, labs, programs or tools mentioned along the way). Don't list sub-items mentioned inside a recommendation.

Then decide which entry, if any, is the TARGET: "${brand}"${website ? ` (website: ${website})` : ""}.
Count it as the target only if it is genuinely the same organization: the same name, an abbreviation of it, a former name, or an official campus/branch/product of it. A different organization that merely shares words in its name is NOT the target. If unsure, answer -1.
Separately, if an entry is a sister organization from the same group or brand family (e.g. another college run by the same trust), give its index as related_index; otherwise -1.

ANSWER:
${answer}`,
    { jsonSchema: EXTRACT_SCHEMA, light: true },
  );

  let brands: string[] = [];
  let targetIndex = -1;
  let relatedIndex = -1;
  try {
    const parsed = JSON.parse(extracted);
    brands = (parsed.brands ?? []).filter((b: unknown) => typeof b === "string" && b.trim());
    const t = Number(parsed.target_index);
    targetIndex = Number.isInteger(t) && t >= 0 && t < brands.length ? t : -1;
    const r = Number(parsed.related_index);
    relatedIndex = Number.isInteger(r) && r >= 0 && r < brands.length && r !== targetIndex ? r : -1;
  } catch {
    brands = [];
  }

  // Exact-name safety net, in case the model misses an obvious match.
  const targets = [normalize(brand), website ? normalize(website.replace(/^https?:\/\//, "").split("/")[0]) : ""].filter(
    (t) => t.length >= 3,
  );
  const nameMatches = (name: string) => {
    const n = normalize(name);
    return n.length >= 3 && targets.some((t) => n.includes(t) || t.includes(n));
  };
  if (targetIndex === -1) targetIndex = brands.findIndex(nameMatches);
  if (targetIndex === -1 && relatedIndex === -1) relatedIndex = brands.findIndex((b) => sameFamily(brand, b));
  const mentionedInText = targets.some((t) => normalize(answer).includes(t));

  return {
    engine: "gemini",
    keyword,
    mentioned: targetIndex !== -1 || mentionedInText,
    position: targetIndex !== -1 ? targetIndex + 1 : null,
    competitors: brands.filter((b, i) => i !== targetIndex && i !== relatedIndex && !nameMatches(b)).slice(0, 8),
    related: targetIndex === -1 && relatedIndex !== -1 ? { name: brands[relatedIndex], position: relatedIndex + 1 } : null,
    answer,
    searched,
  };
}
