import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

const STEPS = [
  'Understanding your vision',
  'Extracting goals',
  'Finding dependencies',
  'Identifying opportunities',
  'Estimating complexity',
  'Building execution context',
];

/** Purely a pacing device \u2014 gives the extraction a moment to feel considered rather than instant, without pretending to be doing more than it is. */
export default function AnalyzingTransition({ onDone }: { onDone: () => void }) {
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    if (visibleCount >= STEPS.length) {
      const t = setTimeout(onDone, 550);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisibleCount((c) => c + 1), 420);
    return () => clearTimeout(t);
  }, [visibleCount, onDone]);

  return (
    <div className="flex flex-col items-center justify-center h-full py-20 px-6">
      <motion.div
        className="w-12 h-12 rounded-full mb-8"
        style={{ border: '2px solid var(--line)', borderTopColor: 'var(--violet)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
      />
      <div className="flex flex-col gap-3 w-full max-w-[280px]">
        <AnimatePresence initial={false}>
          {STEPS.slice(0, visibleCount).map((step, i) => {
            const isCurrent = i === visibleCount - 1;
            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: isCurrent ? 1 : 0.4, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-2.5 text-[13.5px]"
                style={{ color: isCurrent ? 'var(--text)' : 'var(--text-muted)' }}
              >
                {isCurrent ? (
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: 'var(--violet)' }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                ) : (
                  <Check size={12} color="var(--text-faint)" className="shrink-0" />
                )}
                {step}&hellip;
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <button
        onClick={onDone}
        className="mt-8 text-[12px] underline-offset-2 hover:underline"
        style={{ color: 'var(--text-faint)' }}
      >
        Skip
      </button>
    </div>
  );
}
