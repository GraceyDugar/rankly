import { askGemini, GeminiError } from "./gemini";

export type ScanResult = {
  engine: "gemini";
  keyword: string;
  mentioned: boolean;
  position: number | null; // 1 = first brand named in the answer
  competitors: string[];
  answer: string;
  // true = answer used live Google Search; false = the AI's built-in knowledge
  searched: boolean;
};

const EXTRACT_SCHEMA = {
  type: "OBJECT",
  properties: {
    brands: {
      type: "ARRAY",
      description: "Every business, product or brand recommended in the answer, in the order they appear.",
      items: { type: "STRING" },
    },
  },
  required: ["brands"],
};

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

  const extracted = await askGemini(
    `List every business, product or brand recommended in this answer, in order of appearance. Names only.\n\nANSWER:\n${answer}`,
    { jsonSchema: EXTRACT_SCHEMA, light: true },
  );

  let brands: string[] = [];
  try {
    brands = (JSON.parse(extracted).brands ?? []).filter((b: unknown) => typeof b === "string");
  } catch {
    brands = [];
  }

  const targets = [normalize(brand), website ? normalize(website.split("/")[0]) : ""].filter(Boolean);
  const matches = (name: string) => {
    const n = normalize(name);
    return targets.some((t) => n.includes(t) || t.includes(n));
  };

  const index = brands.findIndex(matches);
  const mentionedInText = targets.some((t) => normalize(answer).includes(t));

  return {
    engine: "gemini",
    keyword,
    mentioned: index !== -1 || mentionedInText,
    position: index !== -1 ? index + 1 : null,
    competitors: brands.filter((b) => !matches(b)).slice(0, 8),
    answer,
    searched,
  };
}
