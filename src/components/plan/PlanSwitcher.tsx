import { useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import type { Goal } from '../../stores/useAppStore';
import { goalProgress } from './shared';

interface PlanSwitcherProps {
  goals: Goal[];
  activeId: string | null;
  isComposing: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

/**
 * The primary way to move between goals inside Plan. Deliberately built as
 * a row of real cards (progress ring, status, clear selected state) rather
 * than a thin strip of pills - switching plans is a first-class action
 * here, not a buried detail. Horizontally scrollable so it holds up with
 * many plans; each card offers a delete action behind a confirm step.
 */
export default function PlanSwitcher({ goals, activeId, isComposing, onSelect, onNew, onDelete }: PlanSwitcherProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  if (goals.length === 0) return null;

  return (
    <div>
      <span className="eyebrow px-1">Your Plans</span>
      <div className="flex gap-3 overflow-x-auto pb-2 pt-2.5 -mx-1 px-1">
        {goals.map((g) => {
          const selected = !isComposing && activeId === g.id;
          const progress = goalProgress(g);
          const isConfirming = confirmingId === g.id;

          if (isConfirming) {
            return (
              <div
                key={g.id}
                className="shrink-0 w-[210px] rounded-2xl p-4 flex flex-col justify-between"
                style={{ background: 'var(--glass-strong)', border: '1.5px solid rgba(248,113,113,0.4)' }}
              >
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text)' }}>
                  Delete &ldquo;{g.title}&rdquo;? This can&rsquo;t be undone.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      onDelete(g.id);
                      setConfirmingId(null);
                    }}
                    className="flex-1 h-8 rounded-lg text-[12px] font-medium"
                    style={{ background: '#f87171', color: 'white' }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmingId(null)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ color: 'var(--text-muted)', border: '1px solid var(--line)' }}
                    aria-label="Cancel"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={g.id}
              className="group relative shrink-0 w-[210px] rounded-2xl p-4 transition-all"
              style={{
                background: selected ? 'var(--glass-strong)' : 'var(--glass)',
                border: `1.5px solid ${selected ? 'var(--violet)' : 'var(--glass-border)'}`,
                boxShadow: selected ? '0 0 0 3px rgba(131,53,253,0.14)' : 'none',
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmingId(g.id);
                }}
                aria-label={`Delete ${g.title}`}
                className="absolute top-2.5 right-2.5 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-faint)' }}
              >
                <Trash2 size={12} />
              </button>
              <button onClick={() => onSelect(g.id)} className="w-full text-left">
                <div className="flex items-center gap-2.5 mb-3 pr-5">
                  <ProgressRing value={progress} complete={g.completed} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium truncate" style={{ color: 'var(--text)' }}>{g.title}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
                      {g.completed ? 'Complete' : `${progress}% through`}
                    </div>
                  </div>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
                  <div className="h-full rounded-full" style={{ width: `${progress}%`, background: g.completed ? 'var(--gold)' : 'var(--violet)' }} />
                </div>
              </button>
            </div>
          );
        })}

        <button
          onClick={onNew}
          className="shrink-0 w-[150px] rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-colors"
          style={{ border: '1.5px dashed var(--line-strong)', color: 'var(--text-faint)' }}
        >
          <Plus size={17} />
          <span className="text-[12px] font-medium">New Plan</span>
        </button>
      </div>
    </div>
  );
}

function ProgressRing({ value, complete }: { value: number; complete: boolean }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
      <svg width={36} height={36} className="-rotate-90">
        <circle cx={18} cy={18} r={r} fill="none" stroke="var(--line)" strokeWidth={2.5} />
        <circle
          cx={18}
          cy={18}
          r={r}
          fill="none"
          stroke={complete ? 'var(--gold)' : 'var(--violet)'}
          strokeWidth={2.5}
          strokeDasharray={c}
          strokeDashoffset={c - (c * value) / 100}
          strokeLinecap="round"
        />
      </svg>
      {complete && <Check size={13} color="var(--gold)" className="absolute" />}
    </div>
  );
}
