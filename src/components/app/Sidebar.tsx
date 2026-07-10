import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, BarChart3, Bot, Calendar, ChevronLeft, Flame, Map, Settings, Share2 } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import logo from '../../assets/logo.svg';

const NAV_ITEMS = [
  { to: '/app', label: 'Dashboard', icon: Calendar, end: true },
  { to: '/app/goals', label: 'Goals', icon: Flame },
  { to: '/app/roadmap', label: 'Roadmap', icon: Map },
  { to: '/app/plan', label: 'Plan', icon: Bot },
  { to: '/app/activity', label: 'Activity', icon: Activity },
  { to: '/app/build-in-public', label: 'Build in Public', icon: Share2 },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const streak = useAppStore((s) => s.streak());
  const longestStreak = useAppStore((s) => s.longestStreak);
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useAppStore((s) => s.toggleSidebarCollapsed);

  return (
    <aside
      className="hidden md:flex flex-col shrink-0 h-screen sticky top-0 p-4 transition-[width] duration-200"
      style={{ borderRight: '1px solid var(--line)', width: collapsed ? 76 : 240 }}
    >
      <div className="flex items-center justify-between mb-8 px-1">
        <a href="/app" className="flex items-center gap-2 min-w-0">
          <img src={logo} alt="Shift logo" className="w-6 h-6 rounded-md shrink-0" />
          {!collapsed && <span className="font-display font-semibold text-[15px] truncate" style={{ color: 'var(--text)' }}>Shift</span>}
        </a>
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
          style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}
        >
          <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex">
            <ChevronLeft size={14} />
          </motion.span>
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={collapsed ? item.label : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-colors"
            style={({ isActive }) =>
              isActive
                ? { background: 'var(--glass-strong)', color: 'var(--text)', border: '1px solid var(--glass-border)', justifyContent: collapsed ? 'center' : 'flex-start' }
                : { color: 'var(--text-muted)', border: '1px solid transparent', justifyContent: collapsed ? 'center' : 'flex-start' }
            }
          >
            {({ isActive }) => (
              <motion.span whileHover={{ x: isActive || collapsed ? 0 : 2 }} transition={{ duration: 0.15 }} className="flex items-center gap-3">
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6" style={{ borderTop: '1px solid var(--line)' }}>
        <div className={`flex items-center gap-2 mb-1 ${collapsed ? 'justify-center' : ''}`}>
          <motion.span
            animate={streak > 0 ? { scale: [1, 1.18, 1] } : {}}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="flex"
          >
            <Flame className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
          </motion.span>
          {!collapsed && <span className="text-[12px] font-mono" style={{ color: 'var(--text)' }}>{streak}-day streak</span>}
        </div>
        {!collapsed && (
          <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
            {longestStreak > streak ? `Best: ${longestStreak} days` : streak > 0 ? 'Personal best' : 'Start today'}
          </p>
        )}
      </div>
    </aside>
  );
}
