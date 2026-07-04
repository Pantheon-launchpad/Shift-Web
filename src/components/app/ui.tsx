import type { ReactNode, InputHTMLAttributes, CSSProperties } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

/** Staggered fade-up entrance for dashboard sections. Subtle by design \u2014
 * a little lift and fade, never a slide or bounce. */
export function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Full-bleed centered layout used by every focused, single-purpose screen
 * (login, goal creation, focus session, debrief, share). */
export function FocusedScreen({ children, maxWidth = 480 }: { children: ReactNode; maxWidth?: number }) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-10">
      <div className="relative z-10 w-full" style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
}

export function GlassCard({
  children,
  className = '',
  style,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Subtle lift + shadow on hover, for cards that represent a clickable/navigable item. */
  hover?: boolean;
}) {
  return (
    <div
      className={`glass-strong rounded-3xl p-7 sm:p-9 ${hover ? 'transition-all duration-200 hover:-translate-y-0.5' : ''} ${className}`}
      style={{ boxShadow: 'var(--shadow-lift)', ...style }}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}

interface PillProps {
  children: ReactNode;
  tone?: 'default' | 'accent' | 'success';
  className?: string;
}

export function Pill({ children, tone = 'default', className = '' }: PillProps) {
  const toneStyle =
    tone === 'accent'
      ? { color: 'var(--violet)', borderColor: 'var(--glass-border)', background: 'rgba(131,53,253,0.12)' }
      : tone === 'success'
        ? { color: '#4ADE80', borderColor: 'var(--glass-border)', background: 'rgba(74,222,128,0.1)' }
        : { color: 'var(--text-muted)', borderColor: 'var(--glass-border)', background: 'var(--glass)' };
  return (
    <span
      className={`pill inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono tracking-wide ${className}`}
      style={toneStyle}
    >
      {children}
    </span>
  );
}

export function PrimaryButton({
  children,
  className = '',
  ...rest
}: Omit<HTMLMotionProps<'button'>, 'children'> & { children: ReactNode }) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={`btn btn-primary justify-center ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

export function GhostButton({
  children,
  className = '',
  ...rest
}: Omit<HTMLMotionProps<'button'>, 'children'> & { children: ReactNode }) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={`btn btn-ghost justify-center ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
      <motion.div
        className="h-full rounded-full"
        initial={false}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'linear-gradient(90deg, var(--violet), #9653fd)',
          boxShadow: '0 0 16px rgba(131,53,253,0.45)',
        }}
      />
    </div>
  );
}

export function TextField({
  label,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <input
        className="h-12 rounded-xl px-4 text-[15px] outline-none transition-colors"
        style={{
          background: 'var(--glass)',
          border: '1.5px solid var(--line)',
          color: 'var(--text)',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--violet)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
        {...rest}
      />
    </label>
  );
}
