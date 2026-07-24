import { useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, ListChecks, Search, Share2, Square } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: ComponentType<{ size?: number }>;
  run: () => void;
}

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const startFocusSession = useAppStore((s) => s.startFocusOnTodayTask);
  const [query, setQuery] = useState('');

  const close = () => {
    onClose();
    setQuery('');
  };

  const go = (path: string) => {
    navigate(path);
    close();
  };

  const commands: Command[] = useMemo(
    () => [
      { id: 'tasks', label: 'Go to Tasks', icon: ListChecks, run: () => go('/app') },
      { id: 'planner', label: 'Go to Plan', icon: Bot, run: () => go('/app/plan') },
      { id: 'bip', label: 'Go to Build in Public', icon: Share2, run: () => go('/app/build-in-public') },
      {
        id: 'plan-with-ai',
        label: 'Plan a new goal',
        hint: 'Journey-based planning \u2014 builds a living roadmap',
        icon: Bot,
        run: () => go('/app/plan'),
      },
      {
        id: 'focus',
        label: 'Start focus session',
        hint: 'Opens the floating focus widget',
        icon: Square,
        run: () => {
          startFocusSession();
          onClose();
        },
      },
    ],
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) close();
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={close}
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.55)' }}
          />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="glass-strong relative z-10 w-full max-w-lg rounded-2xl overflow-hidden"
            style={{ boxShadow: 'var(--shadow-lift)' }}
          >
            <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid var(--line)' }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages or actions..."
                className="flex-1 bg-transparent outline-none text-[14px]"
                style={{ color: 'var(--text)' }}
              />
              <span className="pill font-mono text-[10px] px-1.5 py-0.5">esc</span>
            </div>
            <div className="max-h-80 overflow-y-auto p-1.5">
              {filtered.length === 0 && (
                <p className="text-center text-xs py-8" style={{ color: 'var(--text-muted)' }}>No matches</p>
              )}
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={c.run}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors"
                  style={{ color: 'var(--text)' }}
                >
                  <c.icon size={15} />
                  <span className="text-[13px] flex-1">{c.label}</span>
                  {c.hint && <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>{c.hint}</span>}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
