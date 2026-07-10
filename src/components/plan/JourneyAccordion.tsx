import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { Goal } from '../../stores/useAppStore';
import type { Journey } from '../../lib/journey';
import { TYPE_ICON, FALLBACK_ICON } from './journeyNodeVisuals';

export default function JourneyAccordion({ goal, journey }: { goal: Goal; journey: Journey }) {
  const milestoneNodes = journey.nodes.filter((n) => n.type === 'milestone');
  const otherNodes = journey.nodes.filter((n) => n.type !== 'milestone' && n.type !== 'task' && n.type !== 'vision');
  const [openId, setOpenId] = useState<string | null>(milestoneNodes[0]?.id ?? null);

  const sections = [...milestoneNodes, ...otherNodes];

  return (
    <div className="flex flex-col gap-2">
      {sections.map((node) => {
        const Icon = TYPE_ICON[node.type] ?? FALLBACK_ICON;
        const isOpen = openId === node.id;
        const milestone = node.milestoneId ? goal.roadmap.milestones.find((m) => m.id === node.milestoneId) : null;

        return (
          <div key={node.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
            <button
              onClick={() => setOpenId(isOpen ? null : node.id)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {Icon && <Icon size={15} color="var(--text-muted)" className="shrink-0" />}
                <span className="text-[13.5px] font-medium truncate" style={{ color: 'var(--text)' }}>{node.label}</span>
              </div>
              <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="shrink-0">
                <ChevronDown size={15} color="var(--text-faint)" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-4 pb-4"
                >
                  <p className="text-[13px] leading-relaxed mb-2" style={{ color: 'var(--text-muted)' }}>{node.description}</p>
                  {milestone && milestone.tasks.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-2">
                      {milestone.tasks.map((t) => (
                        <div key={t.id} className="flex items-center gap-2.5 rounded-xl px-3 py-2" style={{ background: 'var(--glass-strong)' }}>
                          <div className="flex-1 min-w-0">
                            <div
                              className="text-[12.5px] truncate"
                              style={{ color: t.done ? 'var(--text-faint)' : 'var(--text)', textDecoration: t.done ? 'line-through' : 'none' }}
                            >
                              {t.title}
                            </div>
                          </div>
                          <span className="font-mono text-[10.5px] shrink-0" style={{ color: 'var(--text-faint)' }}>{t.done ? 'Done' : `${t.estimateMinutes}m`}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
