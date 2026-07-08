import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

function timeAgo(ts: number) {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function NotificationsMenu() {
  const notifications = useAppStore((s) => s.notifications);
  const markAllRead = useAppStore((s) => s.markAllNotificationsRead);
  const markRead = useAppStore((s) => s.markNotificationRead);
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative w-9 h-9 rounded-full flex items-center justify-center transition-colors"
        style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center font-mono text-[9px]"
            style={{ background: 'var(--violet)', color: 'white' }}
          >
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="glass-strong absolute right-0 top-11 z-20 w-80 rounded-2xl p-2 max-h-96 overflow-y-auto"
            style={{ boxShadow: 'var(--shadow-lift)' }}
          >
            <div className="flex items-center justify-between px-2 py-1.5 mb-1">
              <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Notifications</span>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-[11px]" style={{ color: 'var(--violet)' }}>
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 && (
              <p className="text-center text-xs py-6" style={{ color: 'var(--text-muted)' }}>You&rsquo;re all caught up.</p>
            )}
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className="w-full text-left flex items-start gap-2.5 px-2.5 py-2.5 rounded-xl transition-colors"
                style={{ background: n.read ? 'transparent' : 'rgba(131,53,253,0.08)' }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                  style={{ background: n.read ? 'transparent' : 'var(--violet)' }}
                />
                <div className="flex-1">
                  <div className="text-[13px]" style={{ color: 'var(--text)' }}>{n.title}</div>
                  <div className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{n.body}</div>
                  <div className="font-mono text-[10px] mt-1" style={{ color: 'var(--text-faint)' }}>{timeAgo(n.date)}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
