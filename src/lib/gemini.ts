// Thin wrapper around the Gemini REST API. No SDK needed.
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

type GeminiOptions = {
  // Ground the answer in live Google Search results (what real users see).
  search?: boolean;
  // Ask for structured JSON matching this schema.
  jsonSchema?: Record<string, unknown>;
  // Simple jobs (like pulling names out of text) can start on the light models.
  light?: boolean;
};

export class GeminiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Statuses worth retrying on a different model: quota used up (429), or
// overloaded/flaky servers. Each model has its own free daily quota.
const RETRYABLE = new Set([429, 500, 502, 503, 504]);
const TIMEOUT_MS = 40_000;

function modelChain(light: boolean) {
  const main = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const fallbacks = (process.env.GEMINI_FALLBACK_MODELS || "gemini-3.5-flash-lite,gemini-3.1-flash-lite")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  return light ? [...fallbacks, main] : [main, ...fallbacks];
}

// Tries each model in turn until one answers.
export async function askGemini(prompt: string, opts: GeminiOptions = {}): Promise<string> {
  const models = modelChain(!!opts.light);
  let lastError: unknown;
  for (const model of models) {
    try {
      return await callModel(model, prompt, opts);
    } catch (err) {
      lastError = err;
      const retryable =
        (err instanceof GeminiError && RETRYABLE.has(err.status)) ||
        (err instanceof Error && err.name === "TimeoutError");
      if (!retryable) throw err;
      console.warn(`Gemini model ${model} unavailable, trying next:`, (err as Error).message.slice(0, 80));
    }
  }
  throw lastError;
}

async function callModel(model: string, prompt: string, opts: GeminiOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  };
  if (opts.search) body.tools = [{ google_search: {} }];
  if (opts.jsonSchema) {
    body.generationConfig = {
      responseMimeType: "application/json",
      responseSchema: opts.jsonSchema,
    };
  }

  const res = await fetch(`${API_BASE}/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new GeminiError(res.status, `Gemini error ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const parts: { text?: string }[] = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((p) => p.text ?? "").join("").trim();
  if (!text) throw new Error("Gemini returned an empty answer");
  return text;
}
