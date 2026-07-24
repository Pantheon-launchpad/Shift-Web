import { Bot, ListChecks, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FadeUp, PrimaryButton } from '../../components/app/ui';
import { useAppStore } from '../../stores/useAppStore';
import DailyTodoList from '../../components/app/DailyTodoList';

export default function Tasks() {
  const navigate = useNavigate();
  const activeGoal = useAppStore((s) => s.activeGoal());
  const currentMilestone = useAppStore((s) => s.currentMilestone());
  const todayTaskId = useAppStore((s) => s.todayTaskId());
  const streak = useAppStore((s) => s.streak());

  const todayTask = currentMilestone?.tasks.find((t) => t.id === todayTaskId) ?? null;

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--text)' }}>Tasks</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Today's roadmap task, plus anything else on your plate.
          </p>
        </div>
        {streak > 0 && (
          <span className="pill font-mono text-[11px] px-2.5 py-1" style={{ color: 'var(--gold)' }}>
            {streak}-day streak
          </span>
        )}
      </div>

      {!activeGoal && (
        <FadeUp>
          <div className="text-center py-10 rounded-2xl" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
            <Sparkles size={22} className="mx-auto mb-3" color="var(--text-faint)" />
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              No active goal yet, so there&rsquo;s no roadmap task to show &mdash; but you can still keep a to-do list below, or talk to Plan to get one.
            </p>
            <PrimaryButton onClick={() => navigate('/app/plan')}>
              <Bot size={16} /> Talk to Plan
            </PrimaryButton>
          </div>
        </FadeUp>
      )}

      <DailyTodoList todayTask={todayTask} goalId={activeGoal?.id ?? ''} />

      <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-faint)' }}>
        <ListChecks size={12} /> Tasks you check off here don&rsquo;t advance your roadmap &mdash; use the highlighted roadmap task for that.
      </div>
    </div>
  );
}
