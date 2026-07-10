import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { Understanding } from '../../lib/understanding';
import { getClarificationQuestions } from '../../lib/understanding';
import type { Goal, Milestone } from '../../stores/useAppStore';
import { goalProgress } from './shared';

function Section({ label, children, delay = 0 }: { label: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className="py-3"
      style={{ borderBottom: '1px solid var(--line)' }}
    >
      <div className="font-mono text-[10px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-faint)' }}>{label}</div>
      <div className="text-[13px] leading-relaxed" style={{ color: 'var(--text)' }}>{children}</div>
    </motion.div>
  );
}

/** Right panel during Compose: fields fade in one at a time as the AI infers them \u2014 never a popup, never a question, just quiet accumulation. */
export function LiveUnderstandingPanel({ understanding, hasText }: { understanding: Understanding; hasText: boolean }) {
  if (!hasText) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full py-16 px-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--glass)' }}>
          <Sparkles size={16} color="var(--text-faint)" />
        </div>
        <p className="text-[13px] leading-relaxed max-w-[220px]" style={{ color: 'var(--text-faint)' }}>
          As you write, this side quietly fills in with what Plan is picking up on.
        </p>
      </div>
    );
  }

  const rows: { label: string; value: string | null; delay: number }[] = [
    { label: 'Goal', value: understanding.goal.value, delay: 0 },
    { label: 'Business Type', value: understanding.categoryLabel, delay: 0.05 },
    { label: 'Motivation', value: understanding.motivation.value, delay: 0.1 },
    { label: 'Target Audience', value: understanding.audience.value, delay: 0.15 },
    { label: 'Timeline', value: understanding.timeline.value, delay: 0.2 },
    { label: 'Experience', value: understanding.experience.value, delay: 0.25 },
    { label: 'Resources', value: understanding.resources.value, delay: 0.3 },
  ];

  const visibleRows = rows.filter((r) => r.value);
  const missing = rows.filter((r) => !r.value).map((r) => r.label);

  return (
    <div className="flex flex-col">
      <AnimatePresence initial={false}>
        {visibleRows.map((r) => (
          <Section key={r.label} label={r.label} delay={r.delay}>{r.value}</Section>
        ))}
      </AnimatePresence>

      {understanding.constraints.length > 0 && (
        <Section label="Detected Constraints">
          <div className="flex flex-col gap-1">
            {understanding.constraints.map((c, i) => <span key={i}>{c}</span>)}
          </div>
        </Section>
      )}

      {understanding.risks.length > 0 && (
        <Section label="Risks">
          <div className="flex flex-col gap-1">
            {understanding.risks.map((r, i) => <span key={i}>{r}</span>)}
          </div>
        </Section>
      )}

      {missing.length > 0 && (
        <div className="py-3">
          <div className="font-mono text-[10px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-faint)' }}>Missing Information</div>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((m) => (
              <span key={m} className="pill px-2 py-0.5 text-[10.5px]" style={{ color: 'var(--text-faint)' }}>{m}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function estimateCompletion(goal: Goal, understanding: Understanding | null): string {
  const remaining = goal.roadmap.milestones.reduce((n, m) => n + m.tasks.filter((t) => !t.done).length, 0);
  if (remaining === 0) return 'Complete';
  const avgMinutes = goal.roadmap.milestones.flatMap((m) => m.tasks).reduce((sum, t) => sum + t.estimateMinutes, 0) / Math.max(1, goal.roadmap.milestones.flatMap((m) => m.tasks).length);
  const dailyBudget = understanding?.timePerDayMinutes ?? 40;
  const tasksPerDay = Math.max(1, Math.floor(dailyBudget / Math.max(avgMinutes, 15)));
  const days = Math.ceil(remaining / tasksPerDay);
  if (days <= 1) return 'About a day of focused work left';
  if (days < 14) return `About ${days} days of focused work left`;
  return `About ${Math.round(days / 7)} weeks of focused work left`;
}

/** Right panel once a goal exists: persistent, real numbers pulled from the live goal/streak state \u2014 not a static snapshot from creation time. */
export function PersistentUnderstandingPanel({ goal, streak }: { goal: Goal; streak: number }) {
  const currentMilestone: Milestone | null = goal.roadmap.milestones.find((m) => m.status === 'current') ?? null;
  const todayTask = currentMilestone?.tasks.find((t) => !t.done) ?? null;
  const nextMilestone = goal.completed
    ? null
    : (goal.roadmap.milestones.find((m) => m.status === 'upcoming') ?? null);
  const progress = goalProgress(goal);
  const u = goal.understanding;

  return (
    <div className="flex flex-col">
      <Section label="Current Goal">{goal.title}</Section>
      <Section label="Current Phase">{goal.completed ? 'Complete' : (currentMilestone?.title ?? '\u2014')}</Section>
      <Section label="Overall Confidence">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.round((u?.overallConfidence ?? 0.7) * 100)}%`, background: 'var(--violet)' }} />
          </div>
          <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>{Math.round((u?.overallConfidence ?? 0.7) * 100)}%</span>
        </div>
      </Section>
      {u && u.constraints.length > 0 && (
        <Section label="Detected Constraints">
          <div className="flex flex-col gap-1">{u.constraints.map((c, i) => <span key={i}>{c}</span>)}</div>
        </Section>
      )}
      {u && getClarificationQuestions(u).length > 0 && (
        <Section label="Missing Information">
          <div className="flex flex-wrap gap-1.5">
            {getClarificationQuestions(u).map((q) => (
              <span key={q.key} className="pill px-2 py-0.5 text-[10.5px]" style={{ color: 'var(--text-faint)' }}>{q.key}</span>
            ))}
          </div>
        </Section>
      )}
      <Section label="Strengths">
        <div className="flex flex-col gap-1">
          {streak > 0 && <span>{streak}-day streak going</span>}
          {progress > 0 && <span>{progress}% through the roadmap already</span>}
          {streak === 0 && progress === 0 && <span>A clear, specific first task — the hardest part is already done.</span>}
        </div>
      </Section>
      <Section label="Today's Priority">{goal.completed ? 'This goal is complete' : (todayTask?.title ?? 'Nothing queued yet')}</Section>
      <Section label="Upcoming Milestone">{nextMilestone?.title ?? (goal.completed ? '\u2014' : 'This is the last one')}</Section>
      <Section label="Estimated Completion">{estimateCompletion(goal, u)}</Section>
    </div>
  );
}
