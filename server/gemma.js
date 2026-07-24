// Minimal client for calling Gemma models through the Gemini API, the same
// endpoint Google AI Studio uses. Docs: https://ai.google.dev/gemma/docs/core

const API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * @param {string} prompt - the user-turn content
 * @param {object} [opts]
 * @param {string} [opts.systemInstruction] - sets the model's behavior/persona
 * @param {boolean} [opts.json] - if true, asks the model to respond with raw JSON only
 * @param {number} [opts.maxOutputTokens] - defaults to 1024; raise for longer structured output (roadmaps, etc). "Thinking"-style models spend part of this budget on visible reasoning before the real answer, so err generous.
 * @returns {Promise<string>} the model's text response
 */
export async function generateWithGemma(prompt, opts = {}) {
  const apiKey = process.env.GEMMA_API_KEY;
  const model = process.env.GEMMA_MODEL || "gemma-4-26b-a4b-it";

  if (!apiKey) {
    const err = new Error("GEMMA_API_KEY is not set on the server");
    err.code = "MISSING_API_KEY";
    throw err;
  }

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: opts.json ? 0.4 : 0.8,
      maxOutputTokens: opts.maxOutputTokens ?? 1024,
      ...(opts.json ? { responseMimeType: "application/json" } : {}),
    },
  };
  if (opts.systemInstruction) {
    body.systemInstruction = { role: "system", parts: [{ text: opts.systemInstruction }] };
  }

  const res = await fetch(`${API_ROOT}/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`Gemma API request failed (${res.status}): ${text.slice(0, 300)}`);
    err.code = "GEMMA_REQUEST_FAILED";
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text) {
    const err = new Error("Gemma API returned no text \u2014 the response may have been blocked");
    err.code = "EMPTY_RESPONSE";
    throw err;
  }
  return text;
}

/**
 * Extracts and parses JSON from a model response, tolerant of the ways
 * Gemma tends to wrap it: ```json fences, a leading/trailing explanation,
 * or (with "thinking"-style models) a whole visible reasoning trace that
 * itself contains small decoy JSON fragments (e.g. inline examples like
 * `fields`: {}) before the real answer at the very end. Scans the ENTIRE
 * text for every top-level {...} / [...] block and returns the LAST one
 * found, since the real answer always comes after the reasoning, not
 * before it. Depth-matching respects quoted strings and escapes so braces
 * inside string values don't throw off the boundaries.
 */
export function parseJsonLoose(text) {
  const cleaned = text.replace(/```json\s*|```\s*/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Fall through to extraction below.
  }

  let lastMatch = null;
  let i = 0;

  while (i < cleaned.length) {
    const ch = cleaned[i];
    if (ch !== "{" && ch !== "[") {
      i++;
      continue;
    }

    const openChar = ch;
    const closeChar = openChar === "{" ? "}" : "]";
    let depth = 0;
    let inString = false;
    let escaped = false;
    let end = -1;

    for (let j = i; j < cleaned.length; j++) {
      const c = cleaned[j];
      if (inString) {
        if (escaped) escaped = false;
        else if (c === "\\") escaped = true;
        else if (c === '"') inString = false;
        continue;
      }
      if (c === '"') inString = true;
      else if (c === openChar) depth++;
      else if (c === closeChar) {
        depth--;
        if (depth === 0) {
          end = j;
          break;
        }
      }
    }

    if (end === -1) break; // unterminated from here on; nothing more to find

    const slice = cleaned.slice(i, end + 1);
    try {
      lastMatch = JSON.parse(slice);
    } catch {
      // Not valid JSON on its own (e.g. a stray bracket in prose) — skip it.
    }
    i = end + 1;
  }

  if (lastMatch === null) {
    throw new Error(`No JSON object or array found in model response: ${cleaned.slice(0, 200)}`);
  }
  return lastMatch;
}
