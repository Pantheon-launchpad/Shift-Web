import type { ReactNode, CSSProperties } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Flame, Home, Sparkles, User } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export default function MobileNav() {
  const isAssistantOpen = useAppStore((s) => s.isAssistantOpen);
  const toggleAssistant = useAppStore((s) => s.toggleAssistant);

  const itemStyle = ({ isActive }: { isActive: boolean }) => ({
    color: isActive ? 'var(--violet)' : 'var(--text-muted)',
    background: isActive ? 'rgba(131,53,253,0.14)' : 'transparent',
  });

  return (
    <nav
      className="md:hidden fixed left-1/2 z-30 flex items-center gap-1 rounded-full px-2 py-2 glass-strong"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        transform: 'translateX(-50%)',
        boxShadow: 'var(--shadow-lift)',
      }}
    >
      <NavItem to="/app" end icon={<Home size={19} />} style={itemStyle} />
      <NavItem to="/app/goals" icon={<Flame size={19} />} style={itemStyle} />

      {/* Raised center button: shared AI assistant, same state as the desktop bubble */}
      <motion.button
        onClick={toggleAssistant}
        aria-label="Quick chat with AI"
        aria-pressed={isAssistantOpen}
        whileTap={{ scale: 0.92 }}
        animate={{ y: isAssistantOpen ? 0 : -6, rotate: isAssistantOpen ? 90 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="rounded-full flex items-center justify-center shrink-0 mx-0.5"
        style={{
          width: 52,
          height: 52,
          background: 'linear-gradient(135deg, var(--violet), #9653fd)',
          boxShadow: '0 6px 18px rgba(131,53,253,0.45)',
        }}
      >
        <Sparkles size={20} color="white" />
      </motion.button>

      <NavItem to="/app/activity" icon={<Activity size={19} />} style={itemStyle} />
      <NavItem to="/app/settings" icon={<User size={19} />} style={itemStyle} />
    </nav>
  );
}

function NavItem({
  to,
  end,
  icon,
  style,
}: {
  to: string;
  end?: boolean;
  icon: ReactNode;
  style: (props: { isActive: boolean }) => CSSProperties;
}) {
  return (
    <NavLink to={to} end={end} className="relative w-12 h-12 rounded-full flex items-center justify-center transition-colors">
      {({ isActive }) => (
        <motion.span
          whileTap={{ scale: 0.88 }}
          className="w-full h-full rounded-full flex items-center justify-center"
          style={style({ isActive })}
        >
          {icon}
        </motion.span>
      )}
    </NavLink>
  );
}
