import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export default function TimelineOverlay() {
  const isOpen = useAppStore((s) => s.isTimelineOpen);
  const close = useAppStore((s) => s.closeTimeline);
  const roadmap = useAppStore((s) => s.roadmap);

  if (!roadmap) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          />
          <motion.div
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[380px] h-full overflow-y-auto p-6"
            style={{ background: 'var(--ink-1)', borderLeft: '1px solid var(--line)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-xl" style={{ color: 'var(--text)' }}>Timeline</h2>
              <button
                onClick={close}
                aria-label="Close timeline"
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ border: '1px solid var(--line)', color: 'var(--text)' }}
              >
                <X size={17} />
              </button>
            </div>

            <div className="flex flex-col">
              {roadmap.milestones.map((m, i) => (
                <div
                  key={m.id}
                  className="flex items-start gap-3.5 py-3.5"
                  style={{ borderBottom: i < roadmap.milestones.length - 1 ? '1px solid var(--line)' : 'none' }}
                >
                  <div
                    className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: m.status === 'done' ? 'var(--violet)' : 'transparent',
                      border: `1.5px solid ${m.status === 'upcoming' ? 'var(--line)' : 'var(--violet)'}`,
                    }}
                  >
                    {m.status === 'done' && <Check size={11} color="white" />}
                    {m.status === 'current' && <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--violet)' }} />}
                  </div>
                  <div>
                    <div
                      className="font-mono text-[10px] uppercase tracking-wide mb-0.5"
                      style={{ color: m.status === 'upcoming' ? 'var(--text-muted)' : 'var(--violet)' }}
                    >
                      Week {m.week} {m.status === 'current' && '\u00b7 in progress'}
                    </div>
                    <div className="text-sm leading-snug" style={{ color: m.status === 'upcoming' ? 'var(--text-muted)' : 'var(--text)' }}>
                      {m.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
