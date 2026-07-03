import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Layers,
  ListChecks,
  Map,
  Share2,
  Sparkles,
  Square,
  Target,
} from 'lucide-react';
import { GlassCard, Pill, PrimaryButton, ProgressBar } from '../../components/app/ui';
import { useAppStore, getUpcomingTasks } from '../../stores/useAppStore';

function EmptyState() {
  const startGoalCreation = useAppStore((s) => s.startGoalCreation);
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex items-center justify-center px-5 py-20">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(131,53,253,0.14)' }}>
          <Sparkles size={26} color="var(--violet)" />
        </div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl tracking-tight" style={{ color: 'var(--text)' }}>
          What should we build toward?
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Tell Shift your goal and it turns into a roadmap, a streak, and one clear task for today.
        </p>
        <PrimaryButton
          onClick={() => {
            startGoalCreation();
            navigate('/app/goals/new');
          }}
          className="mt-7 mx-auto"
        >
          Create your first goal <ArrowUpRight size={16} />
        </PrimaryButton>
      </div>
    </div>
  );
}

const difficultyColor: Record<string, string> = { easy: '#4ADE80', medium: 'var(--gold)', hard: '#f87171' };

export default function Dashboard() {
  const navigate = useNavigate();
  const activeGoal = useAppStore((s) => s.activeGoal());
  const streak = useAppStore((s) => s.streak);
  const upcomingTasks = useMemo(() => getUpcomingTasks(activeGoal), [activeGoal]);
  const activityLog = useAppStore((s) => s.activityLog);
  const buildInPublicPosts = useAppStore((s) => s.buildInPublicPosts);
  const startFocusSession = useAppStore((s) => s.startFocusSession);
  const startGoalCreation = useAppStore((s) => s.startGoalCreation);
  // Rough "this week" completion: last 7 days of activity vs 7.
  const [weekAgo] = useState(() => Date.now() - 7 * 86_400_000);

  if (!activeGoal) return <EmptyState />;

  const allTasks = activeGoal.roadmap.milestones.flatMap((m) => m.tasks);
  const doneTasks = allTasks.filter((t) => t.done).length;
  const overallProgress = allTasks.length ? Math.round((doneTasks / allTasks.length) * 100) : 0;
  const currentMilestone = activeGoal.roadmap.milestones.find((m) => m.status === 'current');
  const milestoneTasks = currentMilestone?.tasks ?? [];
  const milestoneDone = milestoneTasks.filter((t) => t.done).length;
  const milestoneProgress = milestoneTasks.length ? Math.round((milestoneDone / milestoneTasks.length) * 100) : 0;
  const todayTask = milestoneTasks.find((t) => !t.done);
  const isDoneForToday = !todayTask;

  const thisWeekCount = activityLog.filter((a) => a.date >= weekAgo).length;
  const weeklyRate = Math.min(100, Math.round((thisWeekCount / 7) * 100));

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 flex flex-col gap-6">
      {/* Hero */}
      <GlassCard>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="eyebrow"><Target size={12} /> Working toward</span>
            <h1 className="font-display font-semibold text-2xl sm:text-[28px] mt-2" style={{ color: 'var(--text)' }}>{activeGoal.title}</h1>
            {currentMilestone && (
              <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
                Week {currentMilestone.week} &middot; {currentMilestone.title}
              </p>
            )}
            <p className="text-[13px] mt-3 max-w-md" style={{ color: 'var(--text-faint)' }}>
              {isDoneForToday
                ? 'You\u2019re fully caught up on this milestone\u2019s tasks. Nice work.'
                : `AI summary: you\u2019re ${overallProgress}% through the roadmap and on pace for this week.`}
            </p>
          </div>
          {!isDoneForToday && (
            <PrimaryButton onClick={() => { startFocusSession(); navigate('/app/focus'); }}>
              <Square size={15} fill="white" /> Start focus session
            </PrimaryButton>
          )}
        </div>
      </GlassCard>

      {/* Today's task */}
      <GlassCard>
        {isDoneForToday ? (
          <div className="text-center py-3">
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(74,222,128,0.12)' }}>
              <Sparkles size={22} color="#4ADE80" />
            </div>
            <h2 className="font-display font-semibold text-xl" style={{ color: 'var(--text)' }}>You shipped today&rsquo;s task</h2>
            <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>Come back tomorrow for your next step.</p>
          </div>
        ) : (
          <>
            <span className="eyebrow"><Sparkles size={12} /> Today&rsquo;s one task</span>
            <h2 className="font-display font-semibold text-xl sm:text-2xl leading-snug mt-2 mb-3" style={{ color: 'var(--text)' }}>{todayTask!.title}</h2>
            <div className="flex flex-wrap gap-4 mb-5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1.5"><Clock size={13} /> ~{todayTask!.estimateMinutes} min</span>
              <span className="flex items-center gap-1.5" style={{ color: difficultyColor[todayTask!.difficulty] }}>
                <Layers size={13} /> {todayTask!.difficulty}
              </span>
            </div>
            <div className="flex gap-3 flex-wrap">
              <PrimaryButton onClick={() => { startFocusSession(); navigate('/app/focus'); }} className="flex-1 min-w-[160px]">
                <Square size={15} fill="white" /> Start
              </PrimaryButton>
              <button onClick={() => navigate('/app/roadmap')} className="btn btn-ghost flex-1 min-w-[140px] justify-center gap-2">
                <Map size={15} /> View roadmap
              </button>
            </div>
          </>
        )}
      </GlassCard>

      {/* Progress overview */}
      <div>
        <h3 className="font-mono text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Progress overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile label="Streak" value={`${streak}d`} />
          <StatTile label="This week" value={`${weeklyRate}%`} />
          <StatTile label="Milestone" value={`${milestoneProgress}%`} />
          <StatTile label="Overall" value={`${overallProgress}%`} />
        </div>
        <div className="mt-4">
          <ProgressBar value={overallProgress} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Upcoming tasks */}
        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Upcoming tasks</h3>
          <GlassCard className="p-4 sm:p-5">
            {upcomingTasks.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No upcoming tasks &mdash; you&rsquo;re at the front of the roadmap.</p>
            ) : (
              <div className="flex flex-col divide-y" style={{ borderColor: 'var(--line)' }}>
                {upcomingTasks.map(({ task, milestone }, i) => (
                  <div key={task.id} className="flex items-center justify-between gap-3 py-2.5" style={{ borderTop: i > 0 ? '1px solid var(--line)' : 'none' }}>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text)' }}>{task.title}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-faint)' }}>{milestone.title}</p>
                    </div>
                    <Pill>{task.estimateMinutes}m</Pill>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Recent activity */}
        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Recent activity</h3>
          <GlassCard className="p-4 sm:p-5">
            {activityLog.length === 0 && buildInPublicPosts.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nothing yet &mdash; finish today&rsquo;s task to start your history.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {activityLog.slice(0, 3).map((a) => (
                  <div key={a.id} className="flex items-start gap-2.5">
                    <CheckCircle2 size={14} color="#4ADE80" className="mt-0.5 shrink-0" />
                    <p className="text-[13px] leading-snug" style={{ color: 'var(--text-muted)' }}>{a.aiSummary}</p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="font-mono text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Quick actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <QuickAction icon={Target} label="New goal" onClick={() => { startGoalCreation(); navigate('/app/goals/new'); }} />
          <QuickAction icon={Map} label="Roadmap" onClick={() => navigate('/app/roadmap')} />
          <QuickAction icon={Square} label="Focus" onClick={() => { startFocusSession(); navigate('/app/focus'); }} />
          <QuickAction icon={ListChecks} label="Goals" onClick={() => navigate('/app/goals')} />
          <QuickAction icon={Share2} label="Build in public" onClick={() => navigate('/app/build-in-public')} />
        </div>
      </div>
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

function QuickAction({ icon: Icon, label, onClick }: { icon: typeof Target; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl py-4 transition-colors"
      style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}
    >
      <Icon size={17} />
      <span className="text-[11.5px]" style={{ color: 'var(--text)' }}>{label}</span>
    </button>
  );
}
