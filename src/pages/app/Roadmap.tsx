import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown, Circle } from 'lucide-react';
import { GlassCard } from '../../components/app/ui';
import { useAppStore } from '../../stores/useAppStore';

export default function Roadmap() {
  const navigate = useNavigate();
  const activeGoal = useAppStore((s) => s.activeGoal());
  const [expanded, setExpanded] = useState<string | null>(activeGoal?.roadmap.milestones.find((m) => m.status === 'current')?.id ?? null);

  if (!activeGoal) {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 text-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Create a goal to see its roadmap.</p>
        <button onClick={() => navigate('/app/goals')} className="btn btn-primary mt-5">Go to Goals</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 flex flex-col gap-6">
      <div>
        <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--text)' }}>Roadmap</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{activeGoal.title}</p>
      </div>

      <div className="relative pl-7">
        <div className="absolute left-[10px] top-2 bottom-2 w-px" style={{ background: 'var(--line)' }} />
        <div className="flex flex-col gap-4">
          {activeGoal.roadmap.milestones.map((m) => {
            const isOpen = expanded === m.id;
            const doneCount = m.tasks.filter((t) => t.done).length;
            return (
              <div key={m.id} className="relative">
                <div
                  className="absolute -left-7 top-4 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: m.status === 'done' ? 'var(--violet)' : 'var(--ink)',
                    border: `1.5px solid ${m.status === 'upcoming' ? 'var(--line)' : 'var(--violet)'}`,
                  }}
                >
                  {m.status === 'done' ? <Check size={11} color="white" /> : <Circle size={7} fill={m.status === 'current' ? 'var(--violet)' : 'transparent'} color="var(--violet)" />}
                </div>

                <GlassCard className="p-4 sm:p-5">
                  <button className="w-full flex items-center justify-between text-left" onClick={() => setExpanded(isOpen ? null : m.id)}>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wide mb-1" style={{ color: m.status === 'upcoming' ? 'var(--text-muted)' : 'var(--violet)' }}>
                        Week {m.week} {m.status === 'current' && '\u00b7 in progress'}
                      </div>
                      <div className="font-display font-semibold text-[15px]" style={{ color: 'var(--text)' }}>{m.title}</div>
                      <div className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{doneCount}/{m.tasks.length} tasks done</div>
                    </div>
                    <ChevronDown size={16} style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>

                  {isOpen && (
                    <div className="mt-4 pt-4 flex flex-col gap-2.5" style={{ borderTop: '1px solid var(--line)' }}>
                      {m.tasks.map((t) => (
                        <div key={t.id} className="flex items-center gap-2.5">
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: t.done ? 'var(--violet)' : 'transparent', border: `1.5px solid ${t.done ? 'var(--violet)' : 'var(--line)'}` }}
                          >
                            {t.done && <Check size={9} color="white" />}
                          </div>
                          <span className="text-[13px]" style={{ color: t.done ? 'var(--text-muted)' : 'var(--text)', textDecoration: t.done ? 'line-through' : 'none' }}>
                            {t.title}
                          </span>
                          <span className="ml-auto font-mono text-[11px]" style={{ color: 'var(--text-faint)' }}>{t.estimateMinutes}m</span>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
