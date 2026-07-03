import { useState } from 'react';
import { GlassCard } from '../../components/app/ui';
import { useAppStore } from '../../stores/useAppStore';

const DAY_MS = 86_400_000;

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export default function Analytics() {
  const goals = useAppStore((s) => s.goals);
  const activeGoal = useAppStore((s) => s.activeGoal());
  const activityLog = useAppStore((s) => s.activityLog);
  const streak = useAppStore((s) => s.streak);
  const longestStreak = useAppStore((s) => s.longestStreak);
  const totalFocusMinutes = useAppStore((s) => s.totalFocusMinutes);

  const tasksCompleted = activityLog.length;
  const milestonesCompleted = goals.reduce(
    (sum, g) => sum + g.roadmap.milestones.filter((m) => m.status === 'done').length,
    0
  );

  const allTasks = activeGoal?.roadmap.milestones.flatMap((m) => m.tasks) ?? [];
  const goalCompletion = allTasks.length
    ? Math.round((allTasks.filter((t) => t.done).length / allTasks.length) * 100)
    : 0;

  const [today] = useState(() => startOfDay(Date.now()));
  const activeDays = new Set(activityLog.map((a) => startOfDay(a.date)));

  const last7 = Array.from({ length: 7 }, (_, i) => today - (6 - i) * DAY_MS);
  const weeklyConsistency = Math.round((last7.filter((d) => activeDays.has(d)).length / 7) * 100);

  const last28 = Array.from({ length: 28 }, (_, i) => today - (27 - i) * DAY_MS);
  const monthlyConsistency = Math.round((last28.filter((d) => activeDays.has(d)).length / 28) * 100);

  const hours = Math.floor(totalFocusMinutes / 60);
  const mins = totalFocusMinutes % 60;
  const focusTimeLabel = totalFocusMinutes === 0 ? '0m' : hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8 flex flex-col gap-6">
      <div>
        <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--text)' }}>Analytics</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Execution over vanity &mdash; how consistently you&rsquo;re actually showing up.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Current streak" value={`${streak}d`} />
        <StatTile label="Longest streak" value={`${longestStreak}d`} />
        <StatTile label="Total focus time" value={focusTimeLabel} />
        <StatTile label="Tasks completed" value={String(tasksCompleted)} />
        <StatTile label="Milestones done" value={String(milestonesCompleted)} />
        <StatTile label="Goal completion" value={`${goalCompletion}%`} />
        <StatTile label="This week" value={`${weeklyConsistency}%`} />
        <StatTile label="This month" value={`${monthlyConsistency}%`} />
      </div>

      <GlassCard>
        <span className="font-mono text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Last 28 days
        </span>
        <div className="grid gap-1.5 mt-4" style={{ gridTemplateColumns: 'repeat(28, minmax(0, 1fr))' }}>
          {last28.map((d) => (
            <div
              key={d}
              title={new Date(d).toLocaleDateString()}
              className="aspect-square rounded-[4px]"
              style={{
                background: activeDays.has(d) ? 'var(--violet)' : 'var(--line)',
                opacity: activeDays.has(d) ? 1 : 0.5,
              }}
            />
          ))}
        </div>
        <p className="text-[12px] mt-4" style={{ color: 'var(--text-faint)' }}>
          {tasksCompleted === 0
            ? 'Complete a task to start filling this in.'
            : `Active on ${last28.filter((d) => activeDays.has(d)).length} of the last 28 days.`}
        </p>
      </GlassCard>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
      <div className="font-display font-semibold text-xl" style={{ color: 'var(--text)' }}>{value}</div>
      <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}
