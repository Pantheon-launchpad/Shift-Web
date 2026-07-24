// Client for the AI endpoints in server/index.js (Gemma, via the Gemini API).
// This is a separate deployment from the auth backend (VITE_API_URL) —
// the auth backend only handles signup/login/OAuth. Both calls here are
// designed to fail soft: callers should catch and fall back to local
// behavior rather than break the UI if the AI backend or API key isn't set
// up yet.

const API_BASE = import.meta.env.VITE_AI_API_URL ?? "http://localhost:3000";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let message = `Request to ${path} failed with status ${res.status}`;
    try {
      const data = await res.json();
      message = data?.error?.message ?? message;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(message);
  }
  return res.json();
}

export interface SuggestedTasksParams {
  goalTitle: string;
  milestoneTitle?: string;
  todayTaskTitle?: string;
  count?: number;
}

/** Asks Gemma for a handful of small to-dos related to a goal, separate from the roadmap's own tasks. */
export async function generateSuggestedTasks(params: SuggestedTasksParams): Promise<string[]> {
  const data = await postJson<{ tasks: string[] }>("/v1/ai/tasks", params);
  return data.tasks;
}

export interface PlanReplyParams {
  message: string;
  goalTitle: string;
  milestoneTitle?: string;
  todayTaskTitle?: string;
  streak?: number;
  progressPct?: number;
}

/** Asks Gemma for the Plan chat's reply to an in-progress-goal message. */
export async function generatePlanReply(params: PlanReplyParams): Promise<string> {
  const data = await postJson<{ text: string }>("/v1/ai/plan-reply", params);
  return data.text;
}

export interface BuildInPublicParams {
  goalTitle: string;
  milestoneTitle?: string;
  taskTitle?: string;
  summary?: string;
  roadmapMilestones?: string[];
}

export interface BuildInPublicContent {
  twitter: string;
  linkedin: string;
  instagram: string;
  medium: string;
  cardHeadline: string;
  cardSubline: string;
}

/** Asks Gemma to draft platform-native build-in-public posts (X, LinkedIn, Instagram, Medium) from one update. */
export async function generateBuildInPublicContent(params: BuildInPublicParams): Promise<BuildInPublicContent> {
  return postJson<BuildInPublicContent>("/v1/ai/build-in-public", params);
}

export interface RefreshRisksParams {
  goalTitle: string;
  category?: string;
  timeline?: string | null;
  experience?: string | null;
  resources?: string | null;
  audience?: string | null;
  timePerDayMinutes?: number | null;
  constraints?: string[];
}

/** Re-evaluates risks against everything currently known about the goal, instead of the flat category-default list the first pass falls back on. */
export async function refreshRisks(params: RefreshRisksParams): Promise<string[]> {
  const data = await postJson<{ risks: string[] }>("/v1/ai/risks", params);
  return data.risks;
}

export interface CollectChatMessage {
  from: "user" | "ai";
  text: string;
}

export interface CollectStepResult {
  reply: string;
  fields: Record<string, string | number | null | undefined>;
  risks: string[];
  done: boolean;
}

/** One turn of the "chat instead" intake flow \u2014 sends the running transcript, gets back a reply plus any fields Gemma could confidently extract. */
export async function collectPlanInfo(
  messages: CollectChatMessage[],
  collectedSoFar: Record<string, unknown>
): Promise<CollectStepResult> {
  return postJson<CollectStepResult>("/v1/ai/collect", { messages, collectedSoFar });
}

export interface GenerateRoadmapParams {
  goalTitle: string;
  rawText?: string;
  motivation?: string | null;
  audience?: string | null;
  timeline?: string | null;
  experience?: string | null;
  resources?: string | null;
  timePerDayMinutes?: number | null;
  constraints?: string[];
}

export interface RawRoadmapTask {
  title: string;
  estimateMinutes: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface RawRoadmapMilestone {
  title: string;
  tasks: RawRoadmapTask[];
}

export interface RawRoadmap {
  milestones: RawRoadmapMilestone[];
}

/**
 * Asks Gemma to act as the actual planner: a full phased roadmap tailored
 * to this goal and everything Plan knows about it, not the deterministic
 * keyword-matched template. Returns raw milestones/tasks with no ids —
 * callers stamp those on with stampRoadmapIds so every consumer (Journey,
 * Tasks page, sync) sees the same Roadmap shape regardless of source. This
 * is the default path now; the template is only a fail-soft fallback if
 * this throws (offline, no key, malformed response, etc).
 */
export async function generateAiRoadmap(params: GenerateRoadmapParams): Promise<RawRoadmap> {
  return postJson<RawRoadmap>("/v1/ai/generate-roadmap", params);
}

export interface ReviewRoadmapTask {
  id: string | null;
  title: string;
  estimateMinutes: number;
  difficulty: "easy" | "medium" | "hard";
  priority: "low" | "medium" | "high";
  dependsOn: string[];
}

export interface ReviewRoadmapMilestone {
  id: string | null;
  title: string;
  tasks: ReviewRoadmapTask[];
}

export interface ReviewRoadmapResult {
  changed: boolean;
  summary: string[];
  milestones: ReviewRoadmapMilestone[];
}

export interface ReviewRoadmapParams {
  goalTitle: string;
  timeline?: string | null;
  experience?: string | null;
  timePerDayMinutes?: number | null;
  /** The current roadmap, WITH ids and done flags, exactly as stored \u2014 the server never trusts done state back from the AI, but needs to see it to know what it can't touch. */
  roadmap: {
    milestones: {
      id: string;
      title: string;
      tasks: { id: string; title: string; estimateMinutes: number; difficulty: "easy" | "medium" | "hard"; done: boolean }[];
    }[];
  };
}

/**
 * Asks Gemma to act as an ongoing project manager over an existing roadmap:
 * detect gaps, split oversized tasks, merge redundant ones, reorder for
 * real dependencies, and assign priority/dependsOn \u2014 without ever
 * touching tasks already marked done. Called after every task completion;
 * callers should treat failures as a no-op (fail soft), same as the rest
 * of this module.
 */
export async function reviewRoadmap(params: ReviewRoadmapParams): Promise<ReviewRoadmapResult> {
  return postJson<ReviewRoadmapResult>("/v1/ai/review-roadmap", params);
}
