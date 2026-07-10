import { useNavigate } from 'react-router-dom';
import { Archive, ArrowUpRight, Bot, CheckCircle2, Map, Plus } from 'lucide-react';
import { GlassCard, PrimaryButton } from '../../components/app/ui';
import { useAppStore } from '../../stores/useAppStore';

export default function Goals() {
  const navigate = useNavigate();
  const goals = useAppStore((s) => s.goals);
  const activeGoalId = useAppStore((s) => s.activeGoalId);
  const setActiveGoal = useAppStore((s) => s.setActiveGoal);
  const archiveGoal = useAppStore((s) => s.archiveGoal);
  const startGoalCreation = useAppStore((s) => s.startGoalCreation);

  const activeGoals = goals.filter((g) => !g.archived);
  const archivedGoals = goals.filter((g) => g.archived);

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--text)' }}>Goals</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your long-term goals and their roadmaps.</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <PrimaryButton onClick={() => navigate('/app/plan')}>
            <Bot size={16} /> Plan
          </PrimaryButton>
          <button
            onClick={() => { startGoalCreation(); navigate('/app/goals/new'); }}
            className="text-[12px] underline-offset-2 hover:underline flex items-center gap-1"
            style={{ color: 'var(--text-muted)' }}
          >
            <Plus size={12} /> Quick 4-question setup
          </button>
        </div>
      </div>

      {activeGoals.length === 0 ? (
        <GlassCard className="text-center py-12">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No goals yet. Create your first one to get a roadmap.</p>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-3">
          {activeGoals.map((g) => {
            const allTasks = g.roadmap.milestones.flatMap((m) => m.tasks);
            const done = allTasks.filter((t) => t.done).length;
            const progress = allTasks.length ? Math.round((done / allTasks.length) * 100) : 0;
            const isActive = g.id === activeGoalId;
            return (
              <GlassCard key={g.id} className="flex items-center justify-between gap-4 flex-wrap p-5">
                <div className="flex items-start gap-3">
                  {(isActive || g.completed) && <CheckCircle2 size={16} color={g.completed ? 'var(--gold)' : 'var(--violet)'} className="mt-0.5 shrink-0" />}
                  <div>
                    <p className="font-display font-semibold text-[15px]" style={{ color: 'var(--text)' }}>{g.title}</p>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {progress}% complete &middot; {g.completed ? 'Finished' : isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {!isActive && (
                    <button onClick={() => setActiveGoal(g.id)} className="btn btn-ghost text-xs py-1.5 px-3">
                      Make active
                    </button>
                  )}
                  <button onClick={() => navigate('/app/roadmap')} className="btn btn-ghost text-xs py-1.5 px-3 gap-1.5">
                    <Map size={13} /> Roadmap
                  </button>
                  <button onClick={() => archiveGoal(g.id)} aria-label="Archive goal" className="btn btn-ghost text-xs py-1.5 px-3 gap-1.5">
                    <Archive size={13} />
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {archivedGoals.length > 0 && (
        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Archived</h3>
          <div className="flex flex-col gap-2">
            {archivedGoals.map((g) => (
              <div key={g.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{g.title}</span>
                <button onClick={() => setActiveGoal(g.id)} className="text-[12px] flex items-center gap-1" style={{ color: 'var(--violet)' }}>
                  Restore <ArrowUpRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
