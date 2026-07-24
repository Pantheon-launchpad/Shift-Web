import "dotenv/config";
import express from "express";
import cors from "cors";
import { generateWithGemma, parseJsonLoose } from "./gemma.js";

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// POST /v1/ai/generate-roadmap
// The real AI planner: given everything Plan understands about a goal,
// produce a genuine phased roadmap (milestones + tasks) tailored to this
// specific person's timeline, experience, and available time per day \u2014
// instead of the deterministic keyword-matched template in
// src/lib/generateRoadmap.ts, which the frontend now only falls back to if
// this call fails (offline, no key, bad response, etc).
//
// Returns RAW milestones/tasks with no ids/week/status \u2014 the frontend
// stamps those on afterward with the same id scheme it already uses for
// the template path, so every downstream consumer (Journey, Tasks page,
// sync) sees one consistent Roadmap shape regardless of source.
// ---------------------------------------------------------------------------
app.post("/v1/ai/generate-roadmap", async (req, res) => {
  const {
    goalTitle,
    rawText,
    motivation,
    audience,
    timeline,
    experience,
    resources,
    timePerDayMinutes,
    constraints,
  } = req.body ?? {};

  if (!goalTitle || typeof goalTitle !== "string") {
    return res.status(400).json({ error: { code: "INVALID_INPUT", message: "goalTitle is required" } });
  }

  const known = [
    rawText ? `In their own words: "${rawText}"` : null,
    motivation ? `Motivation: ${motivation}` : null,
    audience ? `Who it's for: ${audience}` : null,
    timeline ? `Target timeline: ${timeline}` : null,
    experience ? `Experience level: ${experience}` : null,
    resources ? `Resources available: ${resources}` : null,
    typeof timePerDayMinutes === "number" && timePerDayMinutes > 0 ? `Time available: ${timePerDayMinutes} minutes/day` : null,
    Array.isArray(constraints) && constraints.length ? `Constraints: ${constraints.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `You are an experienced technical project manager helping someone turn a goal into a real, executable roadmap.

Goal: "${goalTitle}"
${known || "No further detail is known beyond the goal itself \u2014 use sound judgment for someone starting from scratch."}

Break this into 3-6 logical phases (milestones) in the order they should happen. For each milestone, list 2-5 concrete tasks. Requirements:
- Tasks must be specific and actionable, not vague ("Write the opening chapter", not "Work on writing").
- Order milestones and tasks so each one builds on what came before \u2014 respect real dependencies (you can't test what you haven't built).
- Estimate each task's time in minutes, realistic for someone with the stated experience level and time budget. If a daily time budget was given, no single task should wildly exceed a reasonable session length for it.
- Mark each task's difficulty as "easy", "medium", or "hard".
- Keep the whole roadmap achievable in the stated timeline if one was given \u2014 don't pad it with busywork, and don't compress unrealistic amounts of work into too few tasks.
- The very first task of the very first milestone should be something they could start in the next 30 minutes.

Respond with ONLY a JSON object of this exact shape, no extra keys, no markdown:
{
  "milestones": [
    {
      "title": "string",
      "tasks": [
        { "title": "string", "estimateMinutes": number, "difficulty": "easy" | "medium" | "hard" }
      ]
    }
  ]
}`;

  try {
    const raw = await generateWithGemma(prompt, { json: true, maxOutputTokens: 3000 });
    const parsed = parseJsonLoose(raw);

    if (!parsed || !Array.isArray(parsed.milestones) || parsed.milestones.length === 0) {
      console.error("[/v1/ai/generate-roadmap] No usable milestones. Parsed value was:\n", parsed);
      throw new Error("Malformed roadmap response");
    }

    const milestones = parsed.milestones
      .map((m) => ({
        title: typeof m?.title === "string" ? m.title.trim() : "",
        tasks: Array.isArray(m?.tasks)
          ? m.tasks
              .map((t) => ({
                title: typeof t?.title === "string" ? t.title.trim() : "",
                estimateMinutes: Number.isFinite(t?.estimateMinutes) && t.estimateMinutes > 0 ? Math.round(t.estimateMinutes) : 30,
                difficulty: ["easy", "medium", "hard"].includes(t?.difficulty) ? t.difficulty : "medium",
              }))
              .filter((t) => t.title.length > 0)
          : [],
      }))
      .filter((m) => m.title.length > 0 && m.tasks.length > 0);

    if (milestones.length === 0) {
      console.error("[/v1/ai/generate-roadmap] All milestones were empty after validation. Raw:\n", raw);
      throw new Error("Malformed roadmap response");
    }

    res.json({ milestones });
  } catch (err) {
    console.error("[/v1/ai/generate-roadmap]", err.message, err.cause ? `\ncause: ${err.cause}` : "");
    res.status(err.status && err.status < 500 ? 502 : 500).json({
      error: { code: err.code ?? "GENERATION_FAILED", message: "Could not generate a roadmap right now" },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /v1/ai/review-roadmap
// The "AI as project manager" pass. Runs after task completion. Given the
// FULL current roadmap (including which tasks are already done), Gemma
// reviews it like a PM would: fills gaps, flags unrealistic pacing,
// reorders/splits/merges tasks, and assigns priority + dependencies.
//
// Hard safety rule enforced in the prompt AND re-enforced client-side in
// src/lib/generateRoadmap.ts's reconcileRoadmapReview(): tasks already
// marked done are NEVER edited, reordered, split, merged, or removed by
// this pass. Only not-yet-done tasks are fair game. This matters because
// completed tasks are referenced by id from the Journey canvas \u2014
// rewriting them would silently break Journey nodes and erase progress
// history.
//
// dependsOn is expressed as exact task TITLES (not ids) in both directions,
// since the AI can't know the client-assigned ids for tasks it's inventing.
// The client resolves titles to ids after stamping.
// ---------------------------------------------------------------------------
app.post("/v1/ai/review-roadmap", async (req, res) => {
  const { goalTitle, timeline, experience, timePerDayMinutes, roadmap } = req.body ?? {};

  if (!goalTitle || typeof goalTitle !== "string") {
    return res.status(400).json({ error: { code: "INVALID_INPUT", message: "goalTitle is required" } });
  }
  if (!roadmap || !Array.isArray(roadmap.milestones)) {
    return res.status(400).json({ error: { code: "INVALID_INPUT", message: "roadmap.milestones is required" } });
  }

  const roadmapForModel = {
    milestones: roadmap.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      tasks: (m.tasks ?? []).map((t) => ({
        id: t.id,
        title: t.title,
        estimateMinutes: t.estimateMinutes,
        difficulty: t.difficulty,
        done: !!t.done,
      })),
    })),
  };

  const context = [
    timeline ? `Target timeline: ${timeline}` : null,
    experience ? `Experience level: ${experience}` : null,
    typeof timePerDayMinutes === "number" && timePerDayMinutes > 0 ? `Time available: ${timePerDayMinutes} minutes/day` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `You are an experienced technical project manager reviewing an in-progress roadmap for the goal "${goalTitle}".
${context}

Current roadmap (JSON, in order, "done": true means already completed by the user):
${JSON.stringify(roadmapForModel, null, 2)}

Review it like a PM checking in on a real project. Look for:
- Missing tasks or gaps that would block progress later.
- Tasks that are too large for the stated time budget \\u2014 split them into smaller ones.
- Redundant/duplicate tasks \\u2014 merge them into one.
- Ordering that ignores real dependencies \\u2014 reorder so prerequisites come first.
- Unrealistic pacing given the timeline \\u2014 note it in summary even if you can't fully fix it.

ABSOLUTE RULES \\u2014 do not break these:
1. Any task with "done": true must be returned completely unchanged: same id, same title, same milestone, same relative order versus other done tasks. Never edit, split, merge, remove, or reorder a done task.
2. You may freely add, remove, split, merge, and reorder tasks that are NOT done, and reorder whole milestones, as long as no done task's position relative to other done tasks changes.
3. Every task (done or not) needs an "id" in your response \\u2014 echo back the existing id for anything you're keeping (done or not), and omit "id" (or use null) only for genuinely new tasks you're adding.
4. For every task, include "priority": "low" | "medium" | "high".
5. For every task that has a real prerequisite elsewhere in the roadmap, include "dependsOn": an array of the EXACT title strings of the prerequisite task(s). Omit or use an empty array if there's no real dependency.
6. If, after careful review, nothing meaningfully needs to change, return "changed": false and an empty "summary" array \\u2014 do not invent busywork changes just to have something to report.

Respond with ONLY a JSON object of this exact shape, no markdown, no extra keys:
{
  "changed": boolean,
  "summary": ["one short plain-English sentence per change actually made, or per notable risk flagged"],
  "milestones": [
    {
      "id": "string or null if new",
      "title": "string",
      "tasks": [
        {
          "id": "string or null if new",
          "title": "string",
          "estimateMinutes": number,
          "difficulty": "easy" | "medium" | "hard",
          "priority": "low" | "medium" | "high",
          "dependsOn": ["exact title of prerequisite task", "..."]
        }
      ]
    }
  ]
}`;

  try {
    const raw = await generateWithGemma(prompt, { json: true, maxOutputTokens: 3000 });
    const parsed = parseJsonLoose(raw);

    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.milestones)) {
      console.error("[/v1/ai/review-roadmap] Malformed response. Parsed value was:\n", parsed);
      throw new Error("Malformed review response");
    }

    const milestones = parsed.milestones
      .map((m) => ({
        id: typeof m?.id === "string" ? m.id : null,
        title: typeof m?.title === "string" ? m.title.trim() : "",
        tasks: Array.isArray(m?.tasks)
          ? m.tasks
              .map((t) => ({
                id: typeof t?.id === "string" ? t.id : null,
                title: typeof t?.title === "string" ? t.title.trim() : "",
                estimateMinutes: Number.isFinite(t?.estimateMinutes) && t.estimateMinutes > 0 ? Math.round(t.estimateMinutes) : 30,
                difficulty: ["easy", "medium", "hard"].includes(t?.difficulty) ? t.difficulty : "medium",
                priority: ["low", "medium", "high"].includes(t?.priority) ? t.priority : "medium",
                dependsOn: Array.isArray(t?.dependsOn) ? t.dependsOn.filter((d) => typeof d === "string" && d.trim()).map((d) => d.trim()) : [],
              }))
              .filter((t) => t.title.length > 0)
          : [],
      }))
      .filter((m) => m.title.length > 0 && m.tasks.length > 0);

    if (milestones.length === 0) {
      console.error("[/v1/ai/review-roadmap] All milestones empty after validation. Raw:\n", raw);
      throw new Error("Malformed review response");
    }

    const summary = Array.isArray(parsed.summary) ? parsed.summary.filter((s) => typeof s === "string" && s.trim()) : [];

    res.json({ changed: !!parsed.changed && summary.length > 0, summary, milestones });
  } catch (err) {
    console.error("[/v1/ai/review-roadmap]", err.message, err.cause ? `\ncause: ${err.cause}` : "");
    res.status(err.status && err.status < 500 ? 502 : 500).json({
      error: { code: err.code ?? "GENERATION_FAILED", message: "Could not review the roadmap right now" },
    });
  }
});

// Given the goal Plan just created (or is working on), ask Gemma for a
// short list of concrete, low-effort to-do items the user could knock out
// today. These land in the ad-hoc Daily To-Do list on the Tasks page,
// separate from the roadmap's own milestone tasks.
// ---------------------------------------------------------------------------
app.post("/v1/ai/tasks", async (req, res) => {
  const { goalTitle, milestoneTitle, todayTaskTitle, count = 3 } = req.body ?? {};

  if (!goalTitle || typeof goalTitle !== "string") {
    return res.status(400).json({ error: { code: "INVALID_INPUT", message: "goalTitle is required" } });
  }

  const prompt = `A user just set the goal "${goalTitle}" in a productivity app.
${milestoneTitle ? `Their current milestone is "${milestoneTitle}".` : ""}
${todayTaskTitle ? `Their next roadmap task is "${todayTaskTitle}".` : ""}

Suggest ${count} small, concrete to-do items that support this goal but are NOT the roadmap task above \u2014 quick wins, setup chores, or research they could knock out today (each under 8 words, action-first, no numbering, no punctuation at the end).

Respond with ONLY a JSON array of strings, nothing else. Example: ["Set up a project folder", "Bookmark 3 reference sites", "Block 30 minutes tomorrow morning"]`;

  try {
    const raw = await generateWithGemma(prompt, { json: true });
    const tasks = parseJsonLoose(raw);
    if (!Array.isArray(tasks)) throw new Error("Model did not return an array");
    const clean = tasks.filter((t) => typeof t === "string" && t.trim()).slice(0, count);
    res.json({ tasks: clean });
  } catch (err) {
    console.error("[/v1/ai/tasks]", err.message, err.cause ? `\ncause: ${err.cause}` : "");
    res.status(err.status && err.status < 500 ? 502 : 500).json({
      error: { code: err.code ?? "GENERATION_FAILED", message: "Could not generate tasks right now" },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /v1/ai/plan-reply
// Powers the ongoing "thinking log" chat in Plan once a goal/Journey
// already exists. The frontend falls back to a local canned reply if this
// endpoint errors or no API key is configured, so it degrades gracefully.
// ---------------------------------------------------------------------------
app.post("/v1/ai/plan-reply", async (req, res) => {
  const { message, goalTitle, milestoneTitle, todayTaskTitle, streak, progressPct } = req.body ?? {};

  if (!message || !goalTitle) {
    return res.status(400).json({ error: { code: "INVALID_INPUT", message: "message and goalTitle are required" } });
  }

  const systemInstruction = `You are Plan, the AI planning assistant inside a productivity app called Shift. You help the user stay on track with one active goal. Be warm, direct, and brief \u2014 2-4 sentences max, no headers or bullet lists unless truly helpful. Never invent progress numbers or tasks that weren't given to you.`;

  const prompt = `Goal: "${goalTitle}"
${milestoneTitle ? `Current milestone: "${milestoneTitle}"` : ""}
${todayTaskTitle ? `Today's roadmap task: "${todayTaskTitle}"` : "No roadmap task is currently active."}
${typeof progressPct === "number" ? `Overall progress: ${progressPct}%` : ""}
${typeof streak === "number" ? `Current streak: ${streak} day(s)` : ""}

The user just said: "${message}"

Reply to them directly, in character as Plan.`;

  try {
    const text = await generateWithGemma(prompt, { systemInstruction });
    res.json({ text: text.trim() });
  } catch (err) {
    console.error("[/v1/ai/plan-reply]", err.message, err.cause ? `\ncause: ${err.cause}` : "");
    res.status(err.status && err.status < 500 ? 502 : 500).json({
      error: { code: err.code ?? "GENERATION_FAILED", message: "Could not reach Gemma right now" },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /v1/ai/build-in-public
// Given today's completed task (or, if regenerating, an existing post's
// context) plus a bit of the roadmap, asks Gemma to draft platform-native
// copy for X, LinkedIn, Instagram, and a short Medium blog intro, all
// grounded in the same underlying update.
// ---------------------------------------------------------------------------
app.post("/v1/ai/build-in-public", async (req, res) => {
  const { goalTitle, milestoneTitle, taskTitle, summary, roadmapMilestones } = req.body ?? {};

  if (!goalTitle || typeof goalTitle !== "string") {
    return res.status(400).json({ error: { code: "INVALID_INPUT", message: "goalTitle is required" } });
  }

  const roadmapContext = Array.isArray(roadmapMilestones) && roadmapMilestones.length
    ? `Roadmap milestones: ${roadmapMilestones.join(", ")}.`
    : "";

  const prompt = `Someone is building in public and wants today's update turned into platform-native posts.

Goal: "${goalTitle}"
${milestoneTitle ? `Current milestone: "${milestoneTitle}"` : ""}
${taskTitle ? `Task just completed: "${taskTitle}"` : ""}
${summary ? `What they did: ${summary}` : ""}
${roadmapContext}

Write four versions of the same update, one per platform, in the platform's native voice:
- "twitter": under 260 characters, punchy, 1-2 relevant hashtags max (include #buildinpublic), no more than one emoji
- "linkedin": 2-4 sentences, reflective/professional tone, no hashtag spam (0-2 hashtags max)
- "instagram": casual, upbeat, a couple of emoji are fine, 1-3 hashtags
- "medium": a 2-3 sentence blog-post opening paragraph, first person, no hashtags, sets up a longer post without needing one

Also write:
- "cardHeadline": under 8 words, a shareable headline for a progress card
- "cardSubline": under 10 words, one supporting line

Respond with ONLY a JSON object with exactly these keys: twitter, linkedin, instagram, medium, cardHeadline, cardSubline. No markdown, no extra keys.`;

  try {
    const raw = await generateWithGemma(prompt, { json: true });
    const parsed = parseJsonLoose(raw);
    const required = ["twitter", "linkedin", "instagram", "medium", "cardHeadline", "cardSubline"];
    for (const key of required) {
      if (typeof parsed[key] !== "string" || !parsed[key].trim()) {
        throw new Error(`Model response missing "${key}"`);
      }
    }
    res.json(parsed);
  } catch (err) {
    console.error("[/v1/ai/build-in-public]", err.message, err.cause ? `\ncause: ${err.cause}` : "");
    res.status(err.status && err.status < 500 ? 502 : 500).json({
      error: { code: err.code ?? "GENERATION_FAILED", message: "Could not generate posts right now" },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /v1/ai/risks
// Re-evaluates risks once more of the picture is known (timeline,
// experience, resources, audience, constraints) instead of the flat
// category-default list the initial pass has to fall back on. Meant to be
// called again whenever the user fills in more detail on the Review screen
// or finishes a chat-collection session, so the risk list actually reflects
// what's now known rather than a guess from the first draft of text.
// ---------------------------------------------------------------------------
app.post("/v1/ai/risks", async (req, res) => {
  const { goalTitle, category, timeline, experience, resources, audience, timePerDayMinutes, constraints } = req.body ?? {};

  if (!goalTitle || typeof goalTitle !== "string") {
    return res.status(400).json({ error: { code: "INVALID_INPUT", message: "goalTitle is required" } });
  }

  const known = [
    category ? `Category: ${category}` : null,
    timeline ? `Timeline: ${timeline}` : null,
    experience ? `Experience: ${experience}` : null,
    resources ? `Resources: ${resources}` : null,
    audience ? `Who it's for: ${audience}` : null,
    timePerDayMinutes ? `Time available: ${timePerDayMinutes} minutes/day` : null,
    Array.isArray(constraints) && constraints.length ? `Constraints: ${constraints.join(", ")}` : null,
  ].filter(Boolean).join("\n");

  const prompt = `Someone's goal: "${goalTitle}"
${known || "No further detail is known yet beyond the goal itself."}

Based on everything known above \u2014 not generic advice \u2014 list 2-4 realistic risks specific to THIS person's situation (their timeline, experience level, available time, and resources should all shape which risks matter most). Each risk under 15 words, concrete, not generic filler like "staying motivated."

Respond with ONLY a JSON array of strings. Example: ["Underestimating how long research alone will take", "No accountability partner to catch early drift"]`;

  try {
    const raw = await generateWithGemma(prompt, { json: true });
    const risks = parseJsonLoose(raw);
    if (!Array.isArray(risks)) throw new Error("Model did not return an array");
    const clean = risks.filter((r) => typeof r === "string" && r.trim()).slice(0, 4);
    res.json({ risks: clean });
  } catch (err) {
    console.error("[/v1/ai/risks]", err.message, err.cause ? `\ncause: ${err.cause}` : "");
    res.status(err.status && err.status < 500 ? 502 : 500).json({
      error: { code: err.code ?? "GENERATION_FAILED", message: "Could not refresh risks right now" },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /v1/ai/collect
// Powers the standalone "chat instead" intake flow (Plan \u2192 Talk it through
// instead) for people who don't have a fully-formed write-up ready. Gemma
// asks one question at a time, extracts structured fields as the
// conversation goes, and reports when it has enough to build a plan from.
// ---------------------------------------------------------------------------
const COLLECT_FIELDS = ["goal", "motivation", "timeline", "experience", "resources", "audience", "timePerDayMinutes"];

app.post("/v1/ai/collect", async (req, res) => {
  const { messages, collectedSoFar } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: { code: "INVALID_INPUT", message: "messages is required" } });
  }

  const transcript = messages
    .map((m) => `${m.from === "user" ? "User" : "Assistant"}: ${m.text}`)
    .join("\n");

  const knownSoFar = collectedSoFar && typeof collectedSoFar === "object"
    ? Object.entries(collectedSoFar).filter(([, v]) => v != null && v !== "").map(([k, v]) => `${k}: ${v}`).join("\n")
    : "";

  const systemInstruction = `You are Plan's intake assistant inside a productivity app called Shift. Someone doesn't have a full write-up of their goal ready, so you're collecting it conversationally, one question at a time. Be warm and brief \u2014 1-2 sentences, one question per turn. Never ask about a field you already have. Fields you're collecting: ${COLLECT_FIELDS.join(", ")}, plus a couple of realistic risks once you know enough to name specific ones. You have enough once you know at least "goal" and 3 other fields \u2014 don't drag it out past that.`;

  const prompt = `Fields collected so far:
${knownSoFar || "(none yet)"}

Conversation so far:
${transcript}

Reply with ONLY a JSON object with exactly these keys:
- "reply": your next message to the user (a question, or a short wrap-up if done)
- "fields": an object with any of ${COLLECT_FIELDS.join(", ")} you can now confidently fill in from the LATEST user message (omit keys you don't have; timePerDayMinutes must be a number of minutes per day or omitted)
- "risks": an array of 0-3 short, specific risk strings if you now know enough to name real ones, else an empty array
- "done": true once you have "goal" plus at least 3 other fields, or the user signals they're done/have nothing more to add; otherwise false`;

  try {
    const raw = await generateWithGemma(prompt, { systemInstruction, json: true });
    console.error("[/v1/ai/collect] Raw model response was:\n", raw);
    let parsed;
    try {
      parsed = parseJsonLoose(raw);
    } catch (parseErr) {
      console.error("[/v1/ai/collect] Could not parse model output as JSON.");
      throw parseErr;
    }
    if (typeof parsed.reply !== "string" || typeof parsed.done !== "boolean") {
      console.error("[/v1/ai/collect] Parsed JSON missing reply/done. Parsed value was:\n", parsed);
      throw new Error("Malformed collect response");
    }
    res.json({
      reply: parsed.reply,
      fields: parsed.fields && typeof parsed.fields === "object" ? parsed.fields : {},
      risks: Array.isArray(parsed.risks) ? parsed.risks.filter((r) => typeof r === "string") : [],
      done: !!parsed.done,
    });
  } catch (err) {
    console.error("[/v1/ai/collect]", err.message, err.cause ? `\ncause: ${err.cause}` : "");
    res.status(err.status && err.status < 500 ? 502 : 500).json({
      error: { code: err.code ?? "GENERATION_FAILED", message: "Could not reach Gemma right now" },
    });
  }
});

app.get("/v1/ai/health", (_req, res) => {
  res.json({ ok: true, model: process.env.GEMMA_MODEL || "gemma-4-26b-a4b-it", keyConfigured: !!process.env.GEMMA_API_KEY });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Shift AI server listening on http://localhost:${port}`);
  if (!process.env.GEMMA_API_KEY) {
    console.warn("\u26a0\ufe0f  GEMMA_API_KEY is not set \u2014 copy server/.env.example to server/.env and add your key from https://aistudio.google.com/apikey");
  }
});
