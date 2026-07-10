import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { PERSPECTIVES, type Perspective } from '../../lib/journey';

export default function ExpandWithAIMenu({
  nodeLabel,
  position,
  onPick,
  onClose,
}: {
  nodeLabel: string;
  position: { x: number; y: number };
  onPick: (p: Perspective) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed z-50 w-[240px] rounded-2xl p-2 glass-strong"
        style={{ left: position.x, top: position.y, boxShadow: 'var(--shadow-lift)' }}
      >
        <div className="px-2.5 py-2 flex items-center gap-1.5">
          <Sparkles size={12} color="var(--violet)" />
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Expand &ldquo;{nodeLabel.length > 20 ? `${nodeLabel.slice(0, 20)}\u2026` : nodeLabel}&rdquo;
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1 p-1">
          {PERSPECTIVES.map((p) => (
            <button
              key={p}
              onClick={() => onPick(p)}
              className="text-left px-2.5 py-2 rounded-xl text-[12px] transition-colors"
              style={{ color: 'var(--text)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--glass)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {p}
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
}
