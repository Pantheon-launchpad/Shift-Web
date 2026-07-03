import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, LogOut, Moon, Settings, Sun } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../../stores/useAppStore';
import { useStore } from '../../stores/useStore';

export default function AppHeader() {
  const navigate = useNavigate();
  const roadmap = useAppStore((s) => s.roadmap);
  const streak = useAppStore((s) => s.streak);
  const signOut = useAppStore((s) => s.signOut);
  const { theme, toggleTheme } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentMilestone = roadmap?.milestones.find((m) => m.status === 'current');

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between gap-3 px-5 sm:px-8 py-4 flex-wrap"
      style={{ borderBottom: '1px solid var(--line)', background: 'var(--ink)' }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <a href="/app" className="flex items-center gap-2">
          <svg width={22} height={22} viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="var(--violet)" strokeWidth="1.5" strokeDasharray="2 5" />
            <circle cx="10" cy="2.5" r="2" fill="var(--violet)" />
          </svg>
          <span className="font-display font-semibold text-[17px]" style={{ color: 'var(--text)' }}>Shift</span>
        </a>
        {currentMilestone && (
          <span className="pill font-mono text-[10px] uppercase tracking-wide px-3 py-1" style={{ color: 'var(--text-muted)' }}>
            Week {currentMilestone.week} &mdash; {currentMilestone.title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {streak > 0 && (
          <div className="pill flex items-center gap-1.5 px-3 py-1.5">
            <Flame size={15} color="var(--violet)" fill="var(--violet)" />
            <span className="font-mono text-sm" style={{ color: 'var(--violet)' }}>{streak}</span>
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Settings"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}
          >
            <Settings size={16} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="glass-strong absolute right-0 top-11 z-20 w-52 rounded-2xl p-1.5"
                  style={{ boxShadow: 'var(--shadow-lift)' }}
                >
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors"
                    style={{ color: 'var(--text)' }}
                  >
                    {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                    {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors"
                    style={{ color: 'var(--text)' }}
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
