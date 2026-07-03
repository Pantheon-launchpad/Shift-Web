import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, Flame, Home, Square, User } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export default function MobileNav() {
  const navigate = useNavigate();
  const startFocusSession = useAppStore((s) => s.startFocusSession);

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
      <NavLink to="/app" end className="w-12 h-12 rounded-full flex items-center justify-center transition-all" style={itemStyle}>
        <Home size={19} />
      </NavLink>
      <NavLink to="/app/goals" className="w-12 h-12 rounded-full flex items-center justify-center transition-all" style={itemStyle}>
        <Flame size={19} />
      </NavLink>
      <button
        onClick={() => {
          startFocusSession();
          navigate('/app/focus');
        }}
        aria-label="Focus"
        className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
        style={{ color: 'var(--text-muted)' }}
      >
        <Square size={19} />
      </button>
      <NavLink to="/app/activity" className="w-12 h-12 rounded-full flex items-center justify-center transition-all" style={itemStyle}>
        <Activity size={19} />
      </NavLink>
      <NavLink to="/app/settings" className="w-12 h-12 rounded-full flex items-center justify-center transition-all" style={itemStyle}>
        <User size={19} />
      </NavLink>
    </nav>
  );
}
