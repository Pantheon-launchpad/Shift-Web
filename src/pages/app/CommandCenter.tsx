import { ArrowUpRight, Clock, Layers, Sparkles, Square, Target } from 'lucide-react';
import Background from '../../components/app/Background';
import AppHeader from '../../components/app/AppHeader';
import MobileNav from '../../components/app/MobileNav';
import TimelineOverlay from '../../components/app/TimelineOverlay';
import { GlassCard, PrimaryButton, ProgressBar } from '../../components/app/ui';
import { useAppStore } from '../../stores/useAppStore';

function EmptyState() {
  const startGoalCreation = useAppStore((s) => s.startGoalCreation);
  return (
    <div className="flex-1 flex items-center justify-center px-5 py-16">
      <div className="text-center max-w-md">
        <div
          className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'rgba(131,53,253,0.14)' }}
        >
          <Sparkles size={26} color="var(--violet)" />
        </div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl tracking-tight" style={{ color: 'var(--text)' }}>
          What should we build toward?
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Tell Shift your goal and it turns into a roadmap, a streak, and one clear task for today.
        </p>
        <PrimaryButton onClick={startGoalCreation} className="mt-7 mx-auto">
          Create your first goal <ArrowUpRight size={16} />
        </PrimaryButton>
      </div>
    </div>
  );
}

function ActiveCommandCenter() {
  const roadmap = useAppStore((s) => s.roadmap);
  const goal = useAppStore((s) => s.goal);
  const todayProgress = useAppStore((s) => s.todayProgress);
  const startFocusSession = useAppStore((s) => s.startFocusSession);
  const openTimeline = useAppStore((s) => s.openTimeline);

  if (!roadmap) return null;
  const currentMilestone = roadmap.milestones.find((m) => m.status === 'current');
  const isDoneForToday = todayProgress >= 100;

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-10 sm:py-16">
      <div className="w-full max-w-[560px]">
        {goal && (
          <p className="font-mono text-[11px] uppercase tracking-wide text-center mb-6" style={{ color: 'var(--text-faint)' }}>
            Working toward &mdash; {goal}
          </p>
        )}

        <GlassCard>
          {isDoneForToday ? (
            <div className="text-center py-4">
              <div
                className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ background: 'rgba(74,222,128,0.12)' }}
              >
                <Sparkles size={22} color="#4ADE80" />
              </div>
              <h2 className="font-display font-semibold text-xl" style={{ color: 'var(--text)' }}>
                You shipped today&rsquo;s task
              </h2>
              <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
                Come back tomorrow for your next step. Momentum is the whole game.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <span className="eyebrow"><Sparkles size={12} /> Today&rsquo;s one task</span>
              </div>

              <h1 className="font-display font-semibold text-2xl sm:text-[28px] leading-snug mt-1 mb-3" style={{ color: 'var(--text)' }}>
                {roadmap.todayTask.title}
              </h1>

              <div className="flex flex-wrap gap-4 mb-5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1.5"><Clock size={13} /> ~{roadmap.todayTask.estimateMinutes} min</span>
                {currentMilestone && (
                  <span className="flex items-center gap-1.5"><Layers size={13} /> {currentMilestone.title}</span>
                )}
                <span className="flex items-center gap-1.5" style={{ color: '#4ADE80' }}><Target size={13} /> On track</span>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Today&rsquo;s progress</span>
                  <span className="font-mono text-xs" style={{ color: 'var(--text)' }}>{todayProgress}%</span>
                </div>
                <ProgressBar value={todayProgress} />
              </div>

              <div className="flex gap-3 flex-wrap">
                <PrimaryButton onClick={startFocusSession} className="flex-1 min-w-[160px]">
                  <Square size={15} fill="white" /> Start focus
                </PrimaryButton>
                <button onClick={openTimeline} className="btn btn-ghost flex-1 min-w-[140px] justify-center gap-2">
                  <ArrowUpRight size={15} /> View timeline
                </button>
              </div>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

export default function CommandCenter() {
  const roadmap = useAppStore((s) => s.roadmap);

  return (
    <div className="relative min-h-screen flex flex-col">
      <Background />
      <div className="relative z-10 flex flex-col flex-1">
        <AppHeader />
        {roadmap ? <ActiveCommandCenter /> : <EmptyState />}
      </div>
      <MobileNav />
      <TimelineOverlay />
    </div>
  );
}
