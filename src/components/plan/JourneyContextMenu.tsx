import { motion } from 'framer-motion';
import type { ContextMenuAction } from './journeyContextMenuActions';

export default function JourneyContextMenu({
  position,
  actions,
  onAction,
  onClose,
}: {
  position: { x: number; y: number };
  actions: ContextMenuAction[];
  onAction: (key: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.13 }}
        className="fixed z-50 w-[196px] rounded-2xl p-1.5 glass-strong"
        style={{ left: position.x, top: position.y, boxShadow: 'var(--shadow-lift)' }}
      >
        {actions.map((a) => (
          <button
            key={a.key}
            onClick={() => {
              onAction(a.key);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12.5px] transition-colors"
            style={{ color: a.danger ? '#f87171' : 'var(--text)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--glass)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <a.icon size={13} />
            {a.label}
          </button>
        ))}
      </motion.div>
    </>
  );
}
