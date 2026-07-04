import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import { FadeUp, GlassCard, Pill, PrimaryButton, ProgressBar } from '../../components/app/ui';
import { useAppStore, getUpcomingTasks } from '../../stores/useAppStore';

function EmptyState() {
  const startGoalCreation = useAppStore((s) => s.startGoalCreation);
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex items-center justify-center px-5 py-20">
      <FadeUp className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'rgba(131,53,253,0.14)' }}
        >
          <Sparkles size={26} color="var(--violet)" />
        </motion.div>
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
      </FadeUp>
    </div>
  );
}

function GoalCompleteState({ title }: { title: string }) {
  const startGoalCreation = useAppStore((s) => s.startGoalCreation);
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex items-center justify-center px-5 py-20">
      <FadeUp className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 15 }}
          className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'rgba(250,204,21,0.14)' }}
        >
          <Sparkles size={28} color="var(--gold)" />
        </motion.div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl tracking-tight" style={{ color: 'var(--text)' }}>
          You finished &ldquo;{title}&rdquo;
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Every milestone on this roadmap is done. That&rsquo;s the whole goal, shipped.
        </p>
        <div className="flex gap-3 justify-center mt-7 flex-wrap">
          <PrimaryButton onClick={() => { startGoalCreation(); navigate('/app/goals/new'); }}>
            Start a new goal <ArrowUpRight size={16} />
          </PrimaryButton>
          <button onClick={() => navigate('/app/roadmap')} className="btn btn-ghost">
            <Map size={15} /> View roadmap
          </button>
        </div>
      </FadeUp>
    </div>
  );
}

const difficultyColor: Record<string, string> = { easy: '#4ADE80', medium: 'var(--gold)', hard: '#f87171' };

export default function Dashboard() {
  const navigate = useNavigate();
  const activeGoal = useAppStore((s) => s.activeGoal());
  const streak = useAppStore((s) => s.streak());
  const upcomingTasks = useMemo(() => getUpcomingTasks(activeGoal), [activeGoal]);
  const activityLog = useAppStore((s) => s.activityLog);
  const buildInPublicPosts = useAppStore((s) => s.buildInPublicPosts);
  const startFocusSession = useAppStore((s) => s.startFocusSession);
  const startGoalCreation = useAppStore((s) => s.startGoalCreation);
  // Rough "this week" completion: last 7 days of activity vs 7.
  const [weekAgo] = useState(() => Date.now() - 7 * 86_400_000);

  if (!activeGoal) return <EmptyState />;
  if (activeGoal.completed) return <GoalCompleteState title={activeGoal.title} />;

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
      <FadeUp delay={0}>
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
      </FadeUp>

      {/* Today's task */}
      <FadeUp delay={0.06}>
      <GlassCard>
        {isDoneForToday ? (
          <div className="text-center py-3">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16 }}
              className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(74,222,128,0.12)' }}
            >
              <Sparkles size={22} color="#4ADE80" />
            </motion.div>
            <h2 className="font-display font-semibold text-xl" style={{ color: 'var(--text)' }}>You shipped today&rsquo;s task</h2>
            <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>Come back tomorrow for your next step.</p>
          </div>
        ) : (
          <>
            <span className="eyebrow"><Sparkles size={12} /> Today&rsquo;s one task</span>
            <h2 className="font-display font-semibold text-xl sm:text-2xl leading-snug mt-2 mb-1" style={{ color: 'var(--text)' }}>{todayTask!.title}</h2>
            {currentMilestone && (
              <p className="text-[12px] mb-3" style={{ color: 'var(--text-faint)' }}>
                Part of &ldquo;{currentMilestone.title}&rdquo; &middot; {milestoneDone}/{milestoneTasks.length} done this milestone
              </p>
            )}
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
      </FadeUp>

      {/* Progress overview */}
      <FadeUp delay={0.12}>
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
      </FadeUp>

      <FadeUp delay={0.18}>
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
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * i }}
                    className="flex items-center justify-between gap-3 py-2.5"
                    style={{ borderTop: i > 0 ? '1px solid var(--line)' : 'none' }}
                  >
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text)' }}>{task.title}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-faint)' }}>{milestone.title}</p>
                    </div>
                    <Pill>{task.estimateMinutes}m</Pill>
                  </motion.div>
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
                {activityLog.slice(0, 3).map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * i }}
                    className="flex items-start gap-2.5"
                  >
                    <CheckCircle2 size={14} color="#4ADE80" className="mt-0.5 shrink-0" />
                    <p className="text-[13px] leading-snug" style={{ color: 'var(--text-muted)' }}>{a.aiSummary}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
      </FadeUp>

      {/* Quick actions */}
      <FadeUp delay={0.24}>
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
      </FadeUp>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="rounded-2xl p-4"
      style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}
    >
      <div className="font-display font-semibold text-xl" style={{ color: 'var(--text)' }}>{value}</div>
      <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </motion.div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: typeof Target; label: string; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col items-center gap-2 rounded-2xl py-4"
      style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}
    >
      <motion.span whileHover={{ rotate: -8, scale: 1.1 }} transition={{ duration: 0.15 }} className="flex">
        <Icon size={17} />
      </motion.span>
      <span className="text-[11.5px]" style={{ color: 'var(--text)' }}>{label}</span>
    </motion.button>
  );
}
