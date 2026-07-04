import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, BarChart3, Calendar, Flame, Map, Settings, Share2 } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import logo from '../../assets/logo.svg';

const NAV_ITEMS = [
  { to: '/app', label: 'Dashboard', icon: Calendar, end: true },
  { to: '/app/goals', label: 'Goals', icon: Flame },
  { to: '/app/roadmap', label: 'Roadmap', icon: Map },
  { to: '/app/activity', label: 'Activity', icon: Activity },
  { to: '/app/build-in-public', label: 'Build in Public', icon: Share2 },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const streak = useAppStore((s) => s.streak());
  const longestStreak = useAppStore((s) => s.longestStreak);

  return (
    <aside
      className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 p-4"
      style={{ borderRight: '1px solid var(--line)' }}
    >
      <a href="/app" className="flex items-center gap-2 mb-8 px-1">
        <img src={logo} alt="Shift logo" className="w-6 h-6 rounded-md" />
        <span className="font-display font-semibold text-[15px]" style={{ color: 'var(--text)' }}>Shift</span>
      </a>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-colors"
            style={({ isActive }) =>
              isActive
                ? { background: 'var(--glass-strong)', color: 'var(--text)', border: '1px solid var(--glass-border)' }
                : { color: 'var(--text-muted)', border: '1px solid transparent' }
            }
          >
            {({ isActive }) => (
              <motion.span whileHover={{ x: isActive ? 0 : 2 }} transition={{ duration: 0.15 }} className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="flex items-center gap-2 mb-1">
          <motion.span
            animate={streak > 0 ? { scale: [1, 1.18, 1] } : {}}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="flex"
          >
            <Flame className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
          </motion.span>
          <span className="text-[12px] font-mono" style={{ color: 'var(--text)' }}>{streak}-day streak</span>
        </div>
        <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
          {longestStreak > streak ? `Best: ${longestStreak} days` : streak > 0 ? 'Personal best' : 'Start today'}
        </p>
      </div>
    </aside>
  );
}
