import { detectCategoryKey, parseDailyMinutes, type CategoryKey } from './generateRoadmap';

/**
 * Everything Plan tries to understand about a goal from what someone
 * writes, before it ever asks a clarifying question. Each field carries a
 * confidence so the UI can show it calmly (low-key, not flagged red) when
 * it's a guess, and so the clarification step knows exactly what's still
 * missing \u2014 never a generic "tell me more."
 *
 * This is still a deterministic, keyword/pattern-based extractor, not a
 * live model call (see the Plan page's implementation notes). It's built
 * so a real Anthropic call can replace `extractUnderstanding()` later
 * without changing anything that reads an `Understanding` object.
 */
export interface UnderstandingField {
  value: string | null;
  confidence: number; // 0..1
  source: 'inferred' | 'clarified' | 'default';
}

export interface Understanding {
  category: CategoryKey;
  categoryLabel: string;
  goal: UnderstandingField;
  motivation: UnderstandingField;
  audience: UnderstandingField;
  timeline: UnderstandingField;
  experience: UnderstandingField;
  resources: UnderstandingField;
  timePerDayMinutes: number | null;
  constraints: string[];
  risks: string[];
  overallConfidence: number;
}

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  software: 'Software Product',
  writing: 'Creative Writing',
  fitness: 'Fitness Goal',
  learning: 'Learning Goal',
};

function field(value: string | null, confidence: number, source: UnderstandingField['source'] = 'inferred'): UnderstandingField {
  return { value, confidence: value ? confidence : 0, source };
}

function firstMatch(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (m?.[1]) return m[1].trim().replace(/[.,;]+$/, '');
  }
  return null;
}

const MOTIVATION_PATTERNS = [
  /because\s+([^.!?\n]{4,80})/i,
  /so that\s+([^.!?\n]{4,80})/i,
  /i want to\s+([^.!?\n]{4,80})/i,
  /i\u2019m trying to\s+([^.!?\n]{4,80})/i,
];

const AUDIENCE_PATTERNS = [
  /for\s+(people who[^.!?\n]{3,60})/i,
  /for\s+(beginners[^.!?\n]{0,40})/i,
  /for\s+(my [a-z\s]{3,40})/i,
  /(targeting|target audience is|aimed at)\s+([^.!?\n]{3,60})/i,
  /\b(myself|just me|personal use)\b/i,
];

const TIMELINE_PATTERNS = [
  /by\s+(the end of [^.!?\n]{3,30})/i,
  /by\s+((?:january|february|march|april|may|june|july|august|september|october|november|december)[^.!?\n]{0,20})/i,
  /in\s+(\d+\s*(?:weeks|months|days))/i,
  /within\s+(\d+\s*(?:weeks|months|days))/i,
  /\b(this year|next month|this quarter|asap|no rush|no deadline)\b/i,
];

const EXPERIENCE_PATTERNS = [
  /\b(no experience|never done this|complete beginner|first time)\b/i,
  /\b(some experience|a bit of experience|dabbled in)\b/i,
  /\b(experienced|professional|\d+\s*years? of experience|done this before)\b/i,
];

const RESOURCES_PATTERNS = [
  /\b(no budget|zero budget|bootstrapping)\b/i,
  /\$[\d,]+(?:k|,000)?\s*(?:budget)?/i,
  /\b(solo|by myself|alone|just me)\b/i,
  /\b(with a (?:friend|partner|co-founder|team))\b/i,
  /\b(team of \d+)\b/i,
];

const CONSTRAINT_PATTERNS: { pattern: RegExp; label: (m: RegExpMatchArray) => string }[] = [
  { pattern: /\bno budget\b/i, label: () => 'Working with no budget' },
  { pattern: /\b(part[- ]time|full[- ]time job|only weekends|only evenings)\b/i, label: (m) => `Limited availability (${m[0].toLowerCase()})` },
  { pattern: /\bno experience\b/i, label: () => 'Starting with no prior experience' },
  { pattern: /\bsolo|by myself|alone\b/i, label: () => 'Working solo, no team' },
  { pattern: /\bnever launched|never shipped|never published\b/i, label: () => 'First time shipping something like this' },
];

const RISK_HINT_PATTERNS: { pattern: RegExp; label: (m: RegExpMatchArray) => string }[] = [
  { pattern: /\b(worried about|afraid of|risk of|might fail because)\s+([^.!?\n]{4,60})/i, label: (m) => m[2].trim() },
  { pattern: /\bcompetitive|lots of competitors|crowded market\b/i, label: () => 'Competitive space \u2014 differentiation matters' },
  { pattern: /\bhard part is\s+([^.!?\n]{4,60})/i, label: (m) => m[1].trim() },
];

const CATEGORY_DEFAULT_RISKS: Record<CategoryKey, string[]> = {
  software: ['Scope creep turning the MVP into a much bigger build', 'Losing momentum before reaching real users'],
  writing: ['Losing momentum in the messy middle', 'Perfectionism blocking a finished first draft'],
  fitness: ['Losing consistency after the first few weeks', 'Progressing too fast and risking injury'],
  learning: ['Passive learning without applying it to something real', 'Losing motivation without a visible finish line'],
};

const CATEGORY_DEFAULT_OPPORTUNITIES: Record<CategoryKey, string[]> = {
  software: ['Early user feedback can reshape the roadmap for the better', 'A working demo becomes a strong portfolio piece either way'],
  writing: ['Sharing drafts early can build an audience before it\u2019s finished', 'The research phase often surfaces a stronger angle than the original idea'],
  fitness: ['Visible early progress builds motivation for the harder middle stretch', 'A consistent routine compounds faster than it feels like it will'],
  learning: ['Applying it to a real project cements it far better than passive study', 'Teaching or explaining it to someone else reveals the gaps fastest'],
};

/** Extracts a structured Understanding from whatever the person has typed so far. Safe to call on every keystroke (debounce in the component, not here). */
export function extractUnderstanding(text: string): Understanding {
  const trimmed = text.trim();
  const category = detectCategoryKey(trimmed || 'general goal');
  const categoryLabel = CATEGORY_LABELS[category];

  const goalSummary = trimmed ? (trimmed.split(/[.!?\n]/)[0] || trimmed).slice(0, 140) : null;
  const motivation = firstMatch(trimmed, MOTIVATION_PATTERNS);
  const audience = firstMatch(trimmed, AUDIENCE_PATTERNS);
  const timeline = firstMatch(trimmed, TIMELINE_PATTERNS);
  const experience = firstMatch(trimmed, EXPERIENCE_PATTERNS);
  const resources = firstMatch(trimmed, RESOURCES_PATTERNS);
  const timePerDayMinutes = trimmed ? parseDailyMinutes(trimmed) : null;

  const constraints = CONSTRAINT_PATTERNS.filter((c) => c.pattern.test(trimmed)).map((c) => c.label(trimmed.match(c.pattern)!));

  const risksFromText = RISK_HINT_PATTERNS.map((r) => {
    const m = trimmed.match(r.pattern);
    return m ? r.label(m) : null;
  }).filter((r): r is string => !!r);
  const risks = risksFromText.length > 0 ? risksFromText.slice(0, 3) : CATEGORY_DEFAULT_RISKS[category].slice(0, 2);

  const fields: Understanding = {
    category,
    categoryLabel,
    goal: field(goalSummary, goalSummary ? 0.95 : 0),
    motivation: field(motivation, 0.75),
    audience: field(audience, 0.7),
    timeline: field(timeline, 0.75),
    experience: field(experience, 0.75),
    resources: field(resources, 0.7),
    timePerDayMinutes,
    constraints,
    risks,
    overallConfidence: 0,
  };

  const scored = [fields.goal, fields.motivation, fields.audience, fields.timeline, fields.experience, fields.resources];
  fields.overallConfidence = scored.reduce((sum, f) => sum + f.confidence, 0) / scored.length;

  return fields;
}

export function opportunitiesFor(category: CategoryKey): string[] {
  return CATEGORY_DEFAULT_OPPORTUNITIES[category];
}

/**
 * The shape the Plan chat-collector (server/index.js's /v1/ai/collect) fills
 * in progressively, one field at a time, as the conversation goes. Every
 * field is optional since it's built up incrementally.
 */
export interface CollectedFields {
  goal?: string | null;
  motivation?: string | null;
  timeline?: string | null;
  experience?: string | null;
  resources?: string | null;
  audience?: string | null;
  timePerDayMinutes?: number | null;
  risks?: string[];
}

/**
 * Folds chat-collected fields onto a base Understanding (usually the result
 * of `extractUnderstanding` on whatever raw text exists, even if that's
 * just a placeholder). Anything explicitly collected is treated as
 * user-confirmed (confidence 1, source 'clarified') and overrides the
 * guessed value; anything left undefined is untouched.
 */
export function mergeCollectedFields(u: Understanding, collected: CollectedFields): Understanding {
  const next = { ...u };
  if (collected.goal) next.goal = field(collected.goal, 1, 'clarified');
  if (collected.motivation) next.motivation = field(collected.motivation, 1, 'clarified');
  if (collected.timeline) next.timeline = field(collected.timeline, 1, 'clarified');
  if (collected.experience) next.experience = field(collected.experience, 1, 'clarified');
  if (collected.resources) next.resources = field(collected.resources, 1, 'clarified');
  if (collected.audience) next.audience = field(collected.audience, 1, 'clarified');
  if (collected.timePerDayMinutes != null) next.timePerDayMinutes = collected.timePerDayMinutes;
  if (collected.risks && collected.risks.length > 0) next.risks = collected.risks;

  const scored = [next.goal, next.motivation, next.audience, next.timeline, next.experience, next.resources];
  next.overallConfidence = scored.reduce((sum, f) => sum + f.confidence, 0) / scored.length;
  return next;
}

export interface ClarificationQuestion {
  key: 'goal' | 'timeline' | 'experience' | 'resources' | 'audience' | 'timePerDay';
  question: string;
}

export const CLARIFICATION_BANK: Record<ClarificationQuestion['key'], string> = {
  goal: 'What\u2019s the goal, in a nutshell?',
  timeline: 'When would you like to have this done by?',
  experience: 'Have you done something like this before, or is this new territory?',
  resources: 'Will you be working on this alone, or with anyone else?',
  audience: 'Who is this really for \u2014 including if the answer is just yourself?',
  timePerDay: 'Roughly how much time can you give this each week?',
};

/**
 * Only asks about what genuinely couldn't be inferred \u2014 capped at 3
 * questions, and empty if the write-up already covered enough ground.
 * Order matters: timeline and time-budget affect the roadmap's pacing
 * most, so they're asked first when both are missing.
 */
export function getClarificationQuestions(u: Understanding): ClarificationQuestion[] {
  const candidates: ClarificationQuestion[] = [];
  if (u.timeline.confidence < 0.5) candidates.push({ key: 'timeline', question: CLARIFICATION_BANK.timeline });
  if (u.timePerDayMinutes == null) candidates.push({ key: 'timePerDay', question: CLARIFICATION_BANK.timePerDay });
  if (u.experience.confidence < 0.5) candidates.push({ key: 'experience', question: CLARIFICATION_BANK.experience });
  if (u.resources.confidence < 0.5) candidates.push({ key: 'resources', question: CLARIFICATION_BANK.resources });
  if (u.audience.confidence < 0.5) candidates.push({ key: 'audience', question: CLARIFICATION_BANK.audience });
  return candidates.slice(0, 3);
}

/** Applies a clarification answer back onto the Understanding, used both by the sequential clarification step and by the Understanding Review's per-field edit action. */
export function applyClarification(u: Understanding, key: ClarificationQuestion['key'], answer: string): Understanding {
  const next = { ...u };
  if (key === 'goal') next.goal = field(answer, 1, 'clarified');
  if (key === 'timeline') next.timeline = field(answer, 1, 'clarified');
  if (key === 'experience') next.experience = field(answer, 1, 'clarified');
  if (key === 'resources') next.resources = field(answer, 1, 'clarified');
  if (key === 'audience') next.audience = field(answer, 1, 'clarified');
  if (key === 'timePerDay') next.timePerDayMinutes = parseDailyMinutes(answer) ?? next.timePerDayMinutes;

  const scored = [next.goal, next.motivation, next.audience, next.timeline, next.experience, next.resources];
  next.overallConfidence = scored.reduce((sum, f) => sum + f.confidence, 0) / scored.length;
  return next;
}
