import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Pencil, Plus, X } from 'lucide-react';
import type { Understanding, ClarificationQuestion } from '../../lib/understanding';
import { parseDailyMinutes } from '../../lib/generateRoadmap';
import { PrimaryButton, GhostButton } from '../app/ui';

type EditableKey = ClarificationQuestion['key'];

interface FieldRow {
  key: EditableKey;
  label: string;
  value: string | null;
  placeholder: string;
  flagged: boolean;
}

export default function UnderstandingReview({
  understanding,
  onBack,
  onFieldSave,
  onContinue,
}: {
  understanding: Understanding;
  onBack: () => void;
  onFieldSave: (key: EditableKey, answer: string) => void;
  onContinue: () => void;
}) {
  const timePerDayLabel = understanding.timePerDayMinutes
    ? understanding.timePerDayMinutes >= 60
      ? `${(understanding.timePerDayMinutes / 60).toFixed(understanding.timePerDayMinutes % 60 ? 1 : 0)} hours/day`
      : `${understanding.timePerDayMinutes} minutes/day`
    : null;

  const rows: FieldRow[] = [
    { key: 'goal', label: 'Goal', value: understanding.goal.value, placeholder: 'What are you trying to do?', flagged: false },
    { key: 'timeline', label: 'Timeline', value: understanding.timeline.value, placeholder: 'e.g. 3 months, by June, no deadline', flagged: understanding.timeline.confidence < 0.5 },
    { key: 'timePerDay', label: 'Time available', value: timePerDayLabel, placeholder: 'e.g. 1 hour a day, a few hours a week', flagged: understanding.timePerDayMinutes == null },
    { key: 'experience', label: 'Experience', value: understanding.experience.value, placeholder: 'New to this, or done it before?', flagged: understanding.experience.confidence < 0.5 },
    { key: 'resources', label: 'Resources', value: understanding.resources.value, placeholder: 'Solo, with a team, specific tools?', flagged: understanding.resources.confidence < 0.5 },
    { key: 'audience', label: 'Who it\u2019s for', value: understanding.audience.value, placeholder: 'Yourself, customers, a specific group?', flagged: understanding.audience.confidence < 0.5 },
  ];

  const flaggedCount = rows.filter((r) => r.flagged).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="flex flex-col h-full">
      <div className="px-1 mb-5 flex items-start gap-3">
        <button
          onClick={onBack}
          aria-label="Back to editing your description"
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
          style={{ color: 'var(--text-faint)', background: 'var(--glass)', border: '1px solid var(--glass-border)' }}
        >
          <ArrowLeft size={14} />
        </button>
        <div className="min-w-0">
          <span className="eyebrow">Review your plan</span>
          <p className="text-[13px] mt-2" style={{ color: 'var(--text-muted)' }}>
            Here&rsquo;s what Plan picked up. Click anything to fix it &mdash; nothing here is required, so hit Continue whenever you&rsquo;re ready.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
        {rows.map((row) => (
          <EditableRow key={row.key} row={row} onSave={(answer) => onFieldSave(row.key, answer)} />
        ))}

        <div className="rounded-2xl p-4" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
          <div className="font-mono text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-faint)' }}>Vision</div>
          <div className="text-[13.5px] leading-relaxed" style={{ color: 'var(--text)' }}>{understanding.categoryLabel}</div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
          <div className="font-mono text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-faint)' }}>Motivation</div>
          <div className="text-[13.5px] leading-relaxed" style={{ color: 'var(--text)' }}>
            {understanding.motivation.value ?? 'Not stated \u2014 that\u2019s fine, plenty of goals are worth doing without a grand reason.'}
          </div>
        </div>

        {understanding.constraints.length > 0 && (
          <ReviewListCard label="Detected Constraints" items={understanding.constraints} />
        )}
        <ReviewListCard label="Potential Risks" items={understanding.risks} />

        <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
          <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>Confidence</span>
          <div className="flex items-center gap-2 w-32">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
              <div className="h-full rounded-full" style={{ width: `${Math.round(understanding.overallConfidence * 100)}%`, background: 'var(--violet)' }} />
            </div>
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>{Math.round(understanding.overallConfidence * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="pt-5 flex items-center gap-3">
        <GhostButton onClick={onBack}>Back</GhostButton>
        <PrimaryButton onClick={onContinue} className="flex-1">
          {flaggedCount > 0 ? `Continue anyway (${flaggedCount} left blank)` : 'Continue'}
        </PrimaryButton>
      </div>
    </motion.div>
  );
}

function EditableRow({ row, onSave }: { row: FieldRow; onSave: (answer: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(row.value ?? '');

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== row.value) onSave(trimmed);
    setIsEditing(false);
  }

  function cancel() {
    setDraft(row.value ?? '');
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="rounded-2xl p-4" style={{ background: 'var(--glass-strong)', border: '1.5px solid var(--violet)' }}>
        <div className="font-mono text-[10px] uppercase tracking-wide mb-2" style={{ color: 'var(--text-faint)' }}>{row.label}</div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            commit();
          }}
        >
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') cancel();
            }}
            placeholder={row.placeholder}
            className="flex-1 h-9 rounded-lg px-3 text-[13px] outline-none"
            style={{ background: 'var(--glass)', border: '1px solid var(--line)', color: 'var(--text)' }}
          />
          <button type="submit" aria-label="Save" className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--violet)', color: 'white' }}>
            <Check size={14} />
          </button>
          <button type="button" onClick={cancel} aria-label="Cancel" className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ color: 'var(--text-faint)', border: '1px solid var(--glass-border)' }}>
            <X size={14} />
          </button>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="rounded-2xl p-4 flex items-start justify-between gap-3 text-left card-hover w-full"
      style={{
        background: 'var(--glass)',
        border: row.flagged ? '1px solid rgba(230,180,80,0.4)' : '1px solid var(--glass-border)',
      }}
    >
      <div className="min-w-0">
        <div className="font-mono text-[10px] uppercase tracking-wide mb-1 flex items-center gap-1.5" style={{ color: 'var(--text-faint)' }}>
          {row.label}
          {row.flagged && <span style={{ color: 'var(--gold)' }}>&middot; worth adding</span>}
        </div>
        {row.value ? (
          <div className="text-[13.5px] leading-relaxed" style={{ color: 'var(--text)' }}>{row.value}</div>
        ) : (
          <div className="text-[13.5px] leading-relaxed italic" style={{ color: 'var(--text-faint)' }}>{row.placeholder}</div>
        )}
      </div>
      <span className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: 'var(--text-faint)' }}>
        {row.value ? <Pencil size={13} /> : <Plus size={14} />}
      </span>
    </button>
  );
}

function ReviewListCard({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
      <div className="font-mono text-[10px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-faint)' }}>{label}</div>
      <div className="flex flex-col gap-1">
        {items.map((item, i) => (
          <span key={i} className="text-[13px] leading-relaxed" style={{ color: 'var(--text)' }}>{item}</span>
        ))}
      </div>
    </div>
  );
}
