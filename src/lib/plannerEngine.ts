import type { Goal, Milestone, Task } from '../stores/useAppStore';
import { getUpcomingTasks } from '../stores/useAppStore';

/**
 * The AI Planner's intake is a fixed sequence of questions, same as the
 * quick-setup wizard's, but delivered conversationally: each prompt
 * references what was just said instead of appearing as a bare form field.
 * It's still a scripted, deterministic flow (no live model call) \u2014 the
 * personalization comes from templating each line with the previous answer.
 */
export interface IntakeStep {
  key: 'goal' | 'doneLooksLike' | 'timePerDay' | 'existingWork' | 'deadline';
  prompt: (ctx: { goal: string; answers: string[] }) => string;
}

export const INTAKE_STEPS: IntakeStep[] = [
  {
    key: 'goal',
    prompt: () => 'Hey! I\u2019m the AI Planner \u2014 tell me what you\u2019re trying to achieve, and I\u2019ll help you turn it into a real roadmap. What\u2019s the goal?',
  },
  {
    key: 'doneLooksLike',
    prompt: ({ goal }) => `Got it \u2014 "${goal}". Let\u2019s make this concrete: what does *done* actually look like? A live product, a first user, a finished draft \u2014 be specific.`,
  },
  {
    key: 'timePerDay',
    prompt: () => 'Good. How much time can you realistically give this each day? Even "20 minutes" is useful \u2014 it changes how I size your tasks.',
  },
  {
    key: 'existingWork',
    prompt: () => 'Is there anything already in progress \u2014 a draft, a prototype, some research \u2014 or are we starting from zero?',
  },
  {
    key: 'deadline',
    prompt: () => 'Last one: any hard deadline I should plan around? If not, just say "no deadline."',
  },
];

export function intakeAck(stepKey: IntakeStep['key'], answer: string): string {
  switch (stepKey) {
    case 'doneLooksLike':
      return `Noted \u2014 "${answer}" is the finish line.`;
    case 'timePerDay':
      return `${answer} a day, got it. I\u2019ll size tasks to fit that.`;
    case 'existingWork':
      return /nothing|none|scratch|no\b/i.test(answer) ? 'Starting fresh \u2014 that\u2019s completely fine.' : 'Good, I\u2019ll build on what you\u2019ve already got.';
    case 'deadline':
      return /no deadline|none|no\b/i.test(answer) ? 'No hard deadline \u2014 we\u2019ll pace it sensibly.' : `Noted \u2014 aiming for ${answer}.`;
    default:
      return '';
  }
}

// ---------------------------------------------------------------------------
// Post-creation chat: answering questions about an existing goal/roadmap.
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
      text: `Nice work. Want me to mark "${todayTask.title}" as done and move your roadmap forward?`,
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
    return { text: `"${currentMilestone.title}" comes next because it's the gap between where "${goal.title}" is now and the next real checkpoint on the roadmap.` };
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
