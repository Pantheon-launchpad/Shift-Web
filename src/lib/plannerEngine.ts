import type { Goal, Milestone, Task } from '../stores/useAppStore';
import { getUpcomingTasks } from '../stores/useAppStore';

// ---------------------------------------------------------------------------
// Ongoing thinking-log chat: answering questions about an existing goal's
// Journey once it's been generated (see Plan.tsx / ThinkingLog.tsx). The
// initial intake conversation that creates a goal lives in
// understanding.ts + Plan.tsx's ComposeFlow instead \u2014 this file only
// covers the "continue thinking" conversation after a Journey exists.
// ---------------------------------------------------------------------------

export interface PlannerContext {
  goal: Goal;
  currentMilestone: Milestone | null;
  todayTask: Task | null;
  streak: number;
}

export interface PlannerReply {
  text: string;
  /** If set, the UI should render a "mark as done" action tied to this task id. */
  offerCompleteTaskId?: string;
}

const DONE_PATTERNS = /\b(done|finished|complete[d]?|shipped|wrapped up|knocked out|did it|got it done)\b/i;
const STUCK_PATTERNS = /\b(stuck|stall|procrastinat|can\u2019t start|dont know where|don\u2019t know where|blocked|overwhelmed)\b/i;
const PROGRESS_PATTERNS = /\b(how am i doing|progress|status|where am i)\b/i;
const NEXT_PATTERNS = /\b(what\u2019s next|whats next|next task|next step)\b/i;
const WHY_PATTERNS = /\bwhy\b/i;
const EXPLAIN_PATTERNS = /\b(explain|what is|what\u2019s|help me understand)\b/i;

export function plannerReply(message: string, ctx: PlannerContext): PlannerReply {
  const { goal, currentMilestone, todayTask, streak } = ctx;

  if (goal.completed) {
    return { text: `"${goal.title}" is already fully complete \u2014 every milestone is done. Want to start planning your next goal instead?` };
  }

  if (DONE_PATTERNS.test(message) && todayTask) {
    return {
      text: `Nice work. Want me to mark "${todayTask.title}" as done and move your Journey forward?`,
      offerCompleteTaskId: todayTask.id,
    };
  }

  if (PROGRESS_PATTERNS.test(message)) {
    const total = goal.roadmap.milestones.reduce((n, m) => n + m.tasks.length, 0);
    const done = goal.roadmap.milestones.reduce((n, m) => n + m.tasks.filter((t) => t.done).length, 0);
    const pct = total ? Math.round((done / total) * 100) : 0;
    return {
      text: `You're at ${pct}% on "${goal.title}" (${done}/${total} tasks) and currently on "${currentMilestone?.title ?? 'the last milestone'}". Your streak is ${streak} day${streak === 1 ? '' : 's'}.`,
    };
  }

  if (NEXT_PATTERNS.test(message)) {
    const upcoming = getUpcomingTasks(goal, 3);
    if (upcoming.length === 0) return { text: 'There\u2019s nothing left on this roadmap \u2014 it\u2019s fully complete.' };
    const list = upcoming.map((u) => `\u2022 ${u.task.title}`).join('\n');
    return { text: `Here's what's coming up:\n${list}` };
  }

  if (STUCK_PATTERNS.test(message)) {
    return {
      text: todayTask
        ? `That's normal. Lower the bar for today: just open whatever "${todayTask.title}" requires and do the smallest possible version, even a bad one. Momentum beats quality on restart days.`
        : 'Start with the smallest version of the very next thing \u2014 you can improve it once it exists.',
    };
  }

  if (WHY_PATTERNS.test(message) && currentMilestone) {
    return { text: `"${currentMilestone.title}" comes next because it's the gap between where "${goal.title}" is now and the next real checkpoint on the Journey.` };
  }

  if (EXPLAIN_PATTERNS.test(message) && todayTask) {
    return { text: `"${todayTask.title}" is part of the "${currentMilestone?.title}" milestone \u2014 it's meant to be one concrete, finishable piece of progress, not the whole milestone at once.` };
  }

  const fallbacks = [
    `Tell me more about where you're at with "${goal.title}" and I can help you figure out the next move.`,
    'Want a breakdown of today\u2019s task, a progress check, or a nudge on where to focus?',
    `I'm tracking "${goal.title}" with you \u2014 ask me about your progress, what's next, or say the word if you've finished today's task.`,
  ];
  return { text: fallbacks[Math.floor(Math.random() * fallbacks.length)] };
}
