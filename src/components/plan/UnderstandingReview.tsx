import { motion } from 'framer-motion';
import { Pencil } from 'lucide-react';
import type { Understanding } from '../../lib/understanding';
import { PrimaryButton } from '../app/ui';

interface ReviewSection {
  label: string;
  value: string;
  editKey?: 'timeline' | 'experience' | 'resources' | 'audience';
}

export default function UnderstandingReview({
  understanding,
  onEdit,
  onContinue,
}: {
  understanding: Understanding;
  onEdit: (key: 'timeline' | 'experience' | 'resources' | 'audience') => void;
  onContinue: () => void;
}) {
  const sections: ReviewSection[] = [
    { label: 'Goal', value: understanding.goal.value ?? '\u2014' },
    { label: 'Vision', value: understanding.categoryLabel },
    { label: 'Motivation', value: understanding.motivation.value ?? 'Not stated \u2014 that\u2019s fine, plenty of goals are worth doing without a grand reason.' },
    { label: 'Target Audience', value: understanding.audience.value ?? 'Not specified yet', editKey: 'audience' },
    { label: 'Timeline', value: understanding.timeline.value ?? 'No deadline mentioned', editKey: 'timeline' },
    { label: 'Current Experience', value: understanding.experience.value ?? 'Not mentioned', editKey: 'experience' },
    { label: 'Resources', value: understanding.resources.value ?? 'Not mentioned', editKey: 'resources' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="flex flex-col h-full">
      <div className="px-1 mb-5">
        <span className="eyebrow">Understanding Review</span>
        <p className="text-[13px] mt-2" style={{ color: 'var(--text-muted)' }}>
          Here&rsquo;s what Plan picked up. Anything worth correcting?
        </p>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
        {sections.map((s) => (
          <div key={s.label} className="rounded-2xl p-4 flex items-start justify-between gap-3" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-faint)' }}>{s.label}</div>
              <div className="text-[13.5px] leading-relaxed" style={{ color: 'var(--text)' }}>{s.value}</div>
            </div>
            {s.editKey && (
              <button onClick={() => onEdit(s.editKey!)} aria-label={`Edit ${s.label}`} className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: 'var(--text-faint)' }}>
                <Pencil size={13} />
              </button>
            )}
          </div>
        ))}

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

      <div className="pt-5">
        <PrimaryButton onClick={onContinue} className="w-full">Continue</PrimaryButton>
      </div>
    </motion.div>
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
