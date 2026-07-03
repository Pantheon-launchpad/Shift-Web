import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, CSSProperties } from 'react';

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
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`glass-strong rounded-3xl p-7 sm:p-9 ${className}`} style={{ boxShadow: 'var(--shadow-lift)', ...style }}>
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
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button className={`btn btn-primary justify-center ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button className={`btn btn-ghost justify-center ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${clamped}%`,
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
