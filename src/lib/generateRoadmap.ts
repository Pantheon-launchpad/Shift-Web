import type { Roadmap } from '../stores/useAppStore';

interface CategoryTemplate {
  keywords: string[];
  milestones: { title: string; tasks: { title: string; minutes: number; difficulty: 'easy' | 'medium' | 'hard' }[] }[];
  /** Alternate first task when the user says they already have something to build on. */
  hasExistingWorkTask?: { title: string; minutes: number; difficulty: 'easy' | 'medium' | 'hard' };
}

const CATEGORIES: Record<string, CategoryTemplate> = {
  writing: {
    keywords: ['book', 'novel', 'write', 'writing', 'blog', 'article', 'screenplay', 'memoir', 'poem', 'newsletter'],
    milestones: [
      {
        title: 'Shape the idea',
        tasks: [
          { title: 'Write a one-paragraph summary of what this is about', minutes: 25, difficulty: 'easy' },
          { title: 'Outline the structure \u2014 chapters, sections, or acts', minutes: 45, difficulty: 'medium' },
          { title: 'Identify who this is for and why they\u2019d read it', minutes: 20, difficulty: 'easy' },
        ],
      },
      {
        title: 'Get the first draft moving',
        tasks: [
          { title: 'Write the opening section', minutes: 45, difficulty: 'hard' },
          { title: 'Write the next section without editing as you go', minutes: 45, difficulty: 'hard' },
        ],
      },
      {
        title: 'Finish the draft',
        tasks: [
          { title: 'Push through the messy middle \u2014 keep writing forward', minutes: 45, difficulty: 'medium' },
          { title: 'Write the closing section', minutes: 45, difficulty: 'medium' },
        ],
      },
      {
        title: 'Revise & share',
        tasks: [
          { title: 'Do a full read-through and mark what\u2019s weak', minutes: 30, difficulty: 'medium' },
          { title: 'Share a draft with one honest reader', minutes: 20, difficulty: 'easy' },
        ],
      },
    ],
    hasExistingWorkTask: { title: 'Re-read what you have and mark where it stalled', minutes: 25, difficulty: 'easy' },
  },
  fitness: {
    keywords: ['run', 'marathon', 'fitness', 'gym', 'workout', 'weight', 'muscle', 'strength', 'health', '5k', '10k', 'triathlon'],
    milestones: [
      {
        title: 'Build the baseline',
        tasks: [
          { title: 'Write down your current numbers (weight, times, reps \u2014 whatever applies)', minutes: 15, difficulty: 'easy' },
          { title: 'Pick a simple weekly schedule you can actually keep', minutes: 20, difficulty: 'easy' },
          { title: 'Do your first session and note how it felt', minutes: 40, difficulty: 'medium' },
        ],
      },
      {
        title: 'Make it a habit',
        tasks: [
          { title: 'Complete three sessions this week', minutes: 40, difficulty: 'medium' },
          { title: 'Adjust the plan based on what felt too easy or too hard', minutes: 15, difficulty: 'easy' },
        ],
      },
      {
        title: 'Push the progression',
        tasks: [
          { title: 'Increase distance, weight, or reps by a small, safe margin', minutes: 40, difficulty: 'hard' },
          { title: 'Add one session that specifically targets your weak point', minutes: 40, difficulty: 'medium' },
        ],
      },
      {
        title: 'Test & taper',
        tasks: [
          { title: 'Do a trial run of the full goal (time trial, mock event, etc.)', minutes: 45, difficulty: 'hard' },
          { title: 'Rest and prep for the real thing', minutes: 20, difficulty: 'easy' },
        ],
      },
    ],
    hasExistingWorkTask: { title: 'Log your current routine so you know what to build on', minutes: 15, difficulty: 'easy' },
  },
  learning: {
    keywords: ['learn', 'study', 'course', 'certification', 'exam', 'language', 'degree', 'skill'],
    milestones: [
      {
        title: 'Map what you need to know',
        tasks: [
          { title: 'List the specific topics or skills this covers', minutes: 25, difficulty: 'easy' },
          { title: 'Find and bookmark your core learning resource', minutes: 20, difficulty: 'easy' },
          { title: 'Do a quick self-check on what you already know', minutes: 20, difficulty: 'easy' },
        ],
      },
      {
        title: 'Build the fundamentals',
        tasks: [
          { title: 'Work through the first core lesson or chapter', minutes: 45, difficulty: 'medium' },
          { title: 'Practice with a small exercise, not just reading', minutes: 30, difficulty: 'medium' },
        ],
      },
      {
        title: 'Apply it to something real',
        tasks: [
          { title: 'Use what you\u2019ve learned on a tiny real project or problem', minutes: 45, difficulty: 'hard' },
          { title: 'Get feedback from someone further along', minutes: 20, difficulty: 'medium' },
        ],
      },
      {
        title: 'Prove it',
        tasks: [
          { title: 'Take a practice test, quiz, or do a dry run', minutes: 40, difficulty: 'medium' },
          { title: 'Review your weak spots one more time', minutes: 25, difficulty: 'easy' },
        ],
      },
    ],
    hasExistingWorkTask: { title: 'Review what you\u2019ve already covered before continuing', minutes: 20, difficulty: 'easy' },
  },
  software: {
    keywords: ['app', 'saas', 'software', 'website', 'platform', 'startup', 'product', 'tool', 'api', 'website', 'ai', 'launch'],
    milestones: [
      {
        title: 'Validate the idea',
        tasks: [
          { title: 'Write the one-sentence pitch for your landing page', minutes: 25, difficulty: 'easy' },
          { title: 'Talk to 3 potential users about the problem', minutes: 45, difficulty: 'medium' },
          { title: 'Sketch the core user flow', minutes: 30, difficulty: 'easy' },
        ],
      },
      {
        title: 'Build the MVP',
        tasks: [
          { title: 'Set up the project scaffold', minutes: 30, difficulty: 'easy' },
          { title: 'Build the core feature end to end', minutes: 60, difficulty: 'hard' },
        ],
      },
      {
        title: 'Launch to first users',
        tasks: [
          { title: 'Write launch copy', minutes: 30, difficulty: 'easy' },
          { title: 'Share with your first 10 users', minutes: 45, difficulty: 'medium' },
        ],
      },
      {
        title: 'Grow & iterate',
        tasks: [
          { title: 'Review first feedback and prioritize fixes', minutes: 30, difficulty: 'medium' },
        ],
      },
    ],
    hasExistingWorkTask: { title: 'Audit what\u2019s already built and list what\u2019s missing', minutes: 25, difficulty: 'easy' },
  },
};

export type CategoryKey = keyof typeof CATEGORIES;

const DEFAULT_CATEGORY: CategoryTemplate = CATEGORIES.software;
const DEFAULT_CATEGORY_KEY: CategoryKey = 'software';

function detectCategory(goalTitle: string): CategoryTemplate {
  const lower = goalTitle.toLowerCase();
  for (const key of Object.keys(CATEGORIES)) {
    if (CATEGORIES[key].keywords.some((kw) => lower.includes(kw))) return CATEGORIES[key];
  }
  return DEFAULT_CATEGORY;
}

/**
 * Same classification as detectCategory, but returns the key rather than
 * the template \u2014 used by the Journey/Understanding engines so every part
 * of the app that needs "what kind of goal is this" agrees with the
 * roadmap generator instead of running a second, potentially-diverging
 * classifier.
 */
export function detectCategoryKey(text: string): CategoryKey {
  const lower = text.toLowerCase();
  for (const key of Object.keys(CATEGORIES) as CategoryKey[]) {
    if (CATEGORIES[key].keywords.some((kw) => lower.includes(kw))) return key;
  }
  return DEFAULT_CATEGORY_KEY;
}

/** Parses a free-text "how much time per day" answer into a per-task minute budget. */
export function parseDailyMinutes(answer: string): number | null {
  const lower = answer.toLowerCase();
  const hourMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)/);
  if (hourMatch) return Math.round(parseFloat(hourMatch[1]) * 60);
  const minMatch = lower.match(/(\d+)\s*(?:m|min|mins|minute|minutes)/);
  if (minMatch) return parseInt(minMatch[1], 10);
  const bareNumber = lower.match(/^\s*(\d+)\s*$/);
  if (bareNumber) return parseInt(bareNumber[1], 10);
  return null;
}

function scaleMinutes(base: number, dailyBudget: number | null): number {
  if (!dailyBudget || dailyBudget <= 0) return base;
  // Keep tasks proportional to the template but clamp to something realistic
  // relative to what the person actually said they have.
  const ratio = dailyBudget / 40; // 40min is the template's rough average task
  const scaled = Math.round((base * Math.min(Math.max(ratio, 0.4), 2)) / 5) * 5;
  return Math.min(Math.max(scaled, 15), 90);
}

const HAS_EXISTING_WORK_HINTS = ['have', 'already', 'existing', 'built', 'started', 'prototype', 'draft', 'mockup', 'sketch', 'some'];
const NOTHING_HINTS = ['nothing', 'none', 'scratch', "haven't", 'not yet', 'no'];

function hasExistingWork(answer: string): boolean {
  const lower = answer.toLowerCase().trim();
  if (NOTHING_HINTS.some((h) => lower.includes(h))) return false;
  return HAS_EXISTING_WORK_HINTS.some((h) => lower.includes(h));
}

/**
 * Builds a roadmap shaped by what the person actually typed: the category
 * comes from keywords in the goal itself, task-length comes from their
 * stated daily time budget, and the very first task adapts to whether
 * they're starting from zero or already have something in progress.
 *
 * This is still a deterministic, client-side template system rather than a
 * live model call \u2014 but unlike a single fixed roadmap, two different goals
 * now visibly produce two different plans.
 */
export function generateRoadmap(goalTitle: string, answers: string[]): Roadmap {
  const [, timeAnswer, existingAnswer] = answers;
  const category = detectCategory(goalTitle);
  const dailyBudget = timeAnswer ? parseDailyMinutes(timeAnswer) : null;
  const startsFromSomething = existingAnswer ? hasExistingWork(existingAnswer) : false;

  const rawMilestones = category.milestones.map((m, mi) => ({
    title: m.title,
    tasks: m.tasks.map((t, ti) => {
      const useExistingWorkVariant = mi === 0 && ti === 0 && startsFromSomething && category.hasExistingWorkTask;
      const source = useExistingWorkVariant ? category.hasExistingWorkTask! : t;
      return {
        title: source.title,
        estimateMinutes: scaleMinutes(source.minutes, dailyBudget),
        difficulty: source.difficulty,
      };
    }),
  }));

  return stampRoadmapIds({ milestones: rawMilestones });
}

/**
 * Stamps ids, week numbers, status, and done:false onto raw milestones/
 * tasks — the one place that assigns Roadmap identity, shared by both the
 * AI-generated path (src/lib/aiApi.ts's generateAiRoadmap) and the
 * deterministic template above, so every consumer (Journey, Tasks page,
 * backend sync) sees one consistent Roadmap shape no matter which
 * produced it.
 */
export function stampRoadmapIds(raw: {
  milestones: { title: string; tasks: { title: string; estimateMinutes: number; difficulty: 'easy' | 'medium' | 'hard' }[] }[];
}): Roadmap {
  return {
    milestones: raw.milestones.map((m, mi) => ({
      id: `m${mi + 1}`,
      week: mi + 1,
      title: m.title,
      status: (mi === 0 ? 'current' : 'upcoming') as 'current' | 'upcoming',
      tasks: m.tasks.map((t, ti) => ({
        id: `m${mi + 1}t${ti + 1}`,
        title: t.title,
        estimateMinutes: t.estimateMinutes,
        difficulty: t.difficulty,
        done: false,
      })),
    })),
  };
}

/**
 * Merges the AI review pass's output (src/lib/aiApi.ts's reviewRoadmap)
 * back into the live roadmap.
 *
 * This is the safety boundary for the whole "AI as PM" feature. The server
 * prompt instructs the model never to touch done tasks, but a prompt is
 * not a guarantee \u2014 so every done task in the CURRENT roadmap is kept
 * byte-identical here regardless of what the model returned for that id.
 * Undone tasks are replaced wholesale by whatever the reviewed milestone
 * list contains for that milestone (additions, splits, merges, reorders
 * all flow through naturally, since we don't try to diff them \u2014 we
 * just don't let done tasks disappear or move).
 *
 * ids: anything the model echoed back is reused as-is (so Journey nodes
 * pointing at existing tasks/milestones keep resolving). Anything new
 * (id null/missing, or an id that doesn't exist in the current roadmap)
 * gets a fresh id stamped past the current max index for that milestone,
 * so it can never collide with a real existing id.
 *
 * dependsOn arrives from the server as exact task TITLES (the model can't
 * know client-assigned ids for tasks it's inventing). Resolved here to
 * ids by case-insensitive title match across the WHOLE final roadmap;
 * unmatched titles are dropped rather than left dangling.
 */
export function reconcileRoadmapReview(
  current: Roadmap,
  reviewed: {
    milestones: {
      id: string | null;
      title: string;
      tasks: {
        id: string | null;
        title: string;
        estimateMinutes: number;
        difficulty: 'easy' | 'medium' | 'hard';
        priority: 'low' | 'medium' | 'high';
        dependsOn: string[];
      }[];
    }[];
  },
): Roadmap {
  const doneTasksById = new Map<string, { milestoneId: string; task: Roadmap['milestones'][number]['tasks'][number] }>();
  for (const m of current.milestones) {
    for (const t of m.tasks) {
      if (t.done) doneTasksById.set(t.id, { milestoneId: m.id, task: t });
    }
  }

  let nextMilestoneIdx = current.milestones.length;
  const milestoneIdxByOldId = new Map(current.milestones.map((m, i) => [m.id, i]));

  // First pass: build final milestones/tasks with real ids, keeping every
  // done task from `current` untouched and appended into whichever
  // milestone it already lived in (even if that milestone was reordered
  // or renamed by the review \u2014 done tasks stay put).
  const builtMilestones = reviewed.milestones.map((m) => {
    const existingIdx = m.id !== null ? milestoneIdxByOldId.get(m.id) : undefined;
    const milestoneId = m.id && existingIdx !== undefined ? m.id : `m${++nextMilestoneIdx}`;

    // Done tasks that belonged to this milestone before review, in their
    // original order, always come first and are never altered.
    const doneTasksHere =
      existingIdx !== undefined ? current.milestones[existingIdx].tasks.filter((t) => t.done) : [];

    const usedIds = new Set(doneTasksHere.map((t) => t.id));
    let taskCounter = doneTasksHere.length + m.tasks.length; // starts safely past any id that could already be in play
    const nextFreeId = () => {
      let id = `${milestoneId}t${++taskCounter}`;
      while (usedIds.has(id)) id = `${milestoneId}t${++taskCounter}`;
      return id;
    };

    const undoneTasks = m.tasks
      .filter((t) => !(t.id && doneTasksById.has(t.id))) // never let a done task sneak into the undone list twice
      .map((t) => {
        const reuseId = t.id && !doneTasksById.has(t.id) && !usedIds.has(t.id) ? t.id : null;
        const id = reuseId ?? nextFreeId();
        usedIds.add(id);
        return {
          id,
          title: t.title,
          estimateMinutes: t.estimateMinutes,
          difficulty: t.difficulty,
          done: false,
          priority: t.priority,
          _dependsOnTitles: t.dependsOn,
        };
      });

    return {
      id: milestoneId,
      title: m.title,
      tasks: [...doneTasksHere.map((t) => ({ ...t, _dependsOnTitles: [] as string[] })), ...undoneTasks],
    };
  });

  // Second pass: resolve dependsOn titles to real ids across the whole
  // final roadmap now that every task has one.
  const idByTitle = new Map<string, string>();
  for (const m of builtMilestones) {
    for (const t of m.tasks) {
      const key = t.title.trim().toLowerCase();
      if (!idByTitle.has(key)) idByTitle.set(key, t.id);
    }
  }

  const milestones: Roadmap['milestones'] = builtMilestones.map((m, mi) => ({
    id: m.id,
    week: mi + 1,
    title: m.title,
    status: 'upcoming' as const, // recomputed below
    tasks: m.tasks.map(({ _dependsOnTitles, ...t }) => {
      const dependsOn = _dependsOnTitles
        .map((title) => idByTitle.get(title.trim().toLowerCase()))
        .filter((id): id is string => !!id && id !== t.id);
      return dependsOn.length > 0 ? { ...t, dependsOn } : t;
    }),
  }));

  // Recompute status: first milestone with any not-done task is 'current',
  // milestones before it are 'done', everything after is 'upcoming'.
  let currentAssigned = false;
  for (const m of milestones) {
    const allDone = m.tasks.every((t) => t.done);
    if (allDone) {
      m.status = 'done';
    } else if (!currentAssigned) {
      m.status = 'current';
      currentAssigned = true;
    } else {
      m.status = 'upcoming';
    }
  }

  return { milestones };
}
