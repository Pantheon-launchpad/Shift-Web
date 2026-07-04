import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Command, Flame, LogOut, Moon, Sun, User } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { useStore } from '../../stores/useStore';
import NotificationsMenu from './NotificationsMenu';

export default function Topbar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const navigate = useNavigate();
  const streak = useAppStore((s) => s.streak());
  const signOut = useAppStore((s) => s.signOut);
  const userName = useAppStore((s) => s.userName);
  const { theme, toggleTheme } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="flex items-center justify-between gap-3 px-5 sm:px-8 py-4 flex-wrap" style={{ borderBottom: '1px solid var(--line)' }}>
      <button
        onClick={onOpenPalette}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] transition-colors"
        style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}
      >
        <Command size={13} /> Quick actions
        <span className="hidden sm:inline-flex pill font-mono text-[10px] px-1.5 py-0.5 ml-1">{'\u2318K'}</span>
      </button>

      <div className="flex items-center gap-2">
        <div className="md:hidden pill flex items-center gap-1.5 px-3 py-1.5">
          <Flame size={14} color="var(--violet)" fill="var(--violet)" />
          <span className="font-mono text-sm" style={{ color: 'var(--violet)' }}>{streak}</span>
        </div>

        <NotificationsMenu />

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Account menu"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}
          >
            <User size={16} />
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
                  <div className="px-3 py-2 text-[13px] truncate" style={{ color: 'var(--text)', borderBottom: '1px solid var(--line)' }}>
                    {userName || 'Signed in'}
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors mt-1"
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
    </div>
  );
}
