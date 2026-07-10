import { useEffect, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Github, Loader2, Mail } from 'lucide-react';
import Background from '../components/app/Background';
import { useAppStore } from '../stores/useAppStore';
import { signup, login, startOAuth, ApiError } from '../lib/api';

const LOOP_STEPS = [
  'Goal',
  'AI builds today\u2019s plan',
  'You pick one task',
  'Focus session',
  'Work gets done',
  'AI asks what happened',
  'AI turns it into proof',
  'Progress moves',
];

function TheLoop() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % LOOP_STEPS.length), 2200);
    return () => clearInterval(id);
  }, []);
  const size = 200;
  const r = 76;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--line)" strokeWidth={1} strokeDasharray="2 7" />
        {LOOP_STEPS.map((_, i) => {
          const angle = (i / LOOP_STEPS.length) * Math.PI * 2 - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          const isActive = i === active;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={isActive ? 8 : 4}
              fill={isActive ? 'var(--violet)' : 'var(--text-faint)'}
              style={{ transition: 'r 500ms ease, fill 500ms ease' }}
            />
          );
        })}
        <circle cx={cx} cy={cy} r={2} fill="var(--text-faint)" />
      </svg>
      <span className="font-mono text-[11px] uppercase tracking-wide text-center min-h-[1.2em]" style={{ color: 'var(--violet)' }}>
        {LOOP_STEPS[active]}
      </span>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const signIn = useAppStore((s) => s.signIn);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password.trim() || (mode === 'signup' && !name.trim())) {
      setError(
        mode === 'signup' && !name.trim()
          ? 'What should we call you?'
          : !email.trim()
            ? 'An email gets you back in tomorrow.'
            : 'Add a password to continue.',
      );
      return;
    }
    setLoading(true);
    try {
      const { user } = mode === 'signup'
        ? await signup(email.trim(), password, name.trim())
        : await login(email.trim(), password);
      signIn(user.name || user.email.split('@')[0]);
      navigate('/app');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex">
      <Background />

      {/* Left: brand + narrative */}
      <div
        className="hidden md:flex flex-col justify-between flex-none w-[46%] p-12 relative z-10 min-h-screen"
        style={{ borderRight: '1px solid var(--line)' }}
      >
        <a href="/" className="flex items-center gap-2">
          <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="var(--violet)" strokeWidth="1.5" strokeDasharray="2 5" />
            <circle cx="10" cy="2.5" r="2" fill="var(--violet)" />
          </svg>
          <span className="font-display font-semibold text-lg" style={{ color: 'var(--text)' }}>Shift</span>
        </a>

        <div className="max-w-sm my-10">
          <h1 className="font-display font-semibold text-4xl leading-tight tracking-tight" style={{ color: 'var(--text)' }}>
            One goal. <span style={{ color: 'var(--violet)' }}>One task today.</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Shift turns ambition into a daily loop: plan, focus, reflect, share, repeat &mdash; so momentum compounds instead of stalling out.
          </p>
        </div>

        <div className="flex flex-col items-start gap-2">
          <TheLoop />
        </div>
      </div>

      {/* Right: auth card */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 min-h-screen">
        <div className="w-full max-w-[400px]">
          <div className="md:hidden flex items-center gap-2 mb-6">
            <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="var(--violet)" strokeWidth="1.5" strokeDasharray="2 5" />
              <circle cx="10" cy="2.5" r="2" fill="var(--violet)" />
            </svg>
            <span className="font-display font-semibold text-lg" style={{ color: 'var(--text)' }}>Shift</span>
          </div>

          <div className="glass-strong rounded-3xl p-8" style={{ boxShadow: 'var(--shadow-lift)' }}>
            <div className="flex gap-6 mb-6" style={{ borderBottom: '1px solid var(--line)' }}>
              {(['signin', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="pb-3 text-sm font-semibold transition-colors"
                  style={{
                    color: mode === m ? 'var(--violet)' : 'var(--text-muted)',
                    borderBottom: `2px solid ${mode === m ? 'var(--violet)' : 'transparent'}`,
                  }}
                >
                  {m === 'signin' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>

            <div>
              <h2 className="font-display font-semibold text-[22px]" style={{ color: 'var(--text)' }}>
                {mode === 'signin' ? 'Welcome back' : 'Start your first goal'}
              </h2>
              <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
                {mode === 'signin' ? 'Pick up your streak where you left off.' : 'Takes about a minute.'}
              </p>
            </div>

            <form
              className="flex flex-col gap-3.5 mt-5"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              {mode === 'signup' && (
                <Field label="Name" value={name} onChange={setName} placeholder="What should we call you?" autoFocus />
              )}
              <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@domain.com" autoFocus={mode === 'signin'} />
              <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />

              {error && (
                <div
                  className="text-[13px] rounded-lg px-3 py-2"
                  style={{ color: 'var(--violet)', background: 'var(--accent-soft, rgba(124,58,237,0.1))', border: '1px solid var(--line)' }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full justify-center mt-1"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> One moment&hellip;
                  </>
                ) : (
                  <>
                    {mode === 'signin' ? 'Sign in' : 'Create account'} <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <span className="flex-1 h-px" style={{ background: 'var(--line)' }} />
              <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>OR</span>
              <span className="flex-1 h-px" style={{ background: 'var(--line)' }} />
            </div>

            <div className="flex gap-2.5">
              <SSOButton icon={<Github size={15} />} label="GitHub" onClick={() => startOAuth('github')} />
              <SSOButton icon={<Mail size={15} />} label="Google" onClick={() => startOAuth('google')} />
            </div>

            <p className="mt-6 text-[12px] text-center leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {mode === 'signin' ? (
                <>
                  New to Shift?{' '}
                  <button type="button" className="font-semibold" style={{ color: 'var(--violet)' }} onClick={() => setMode('signup')}>
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have one?{' '}
                  <button type="button" className="font-semibold" style={{ color: 'var(--violet)' }} onClick={() => setMode('signin')}>
                    Sign in
                  </button>
                </>
              )}
              <br />
              By continuing you agree to build in public, honestly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-xl px-4 text-[15px] outline-none transition-colors"
        style={{ background: 'var(--glass)', border: '1.5px solid var(--line)', color: 'var(--text)' }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--violet)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
        {...rest}
      />
    </label>
  );
}

function SSOButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn btn-ghost flex-1 justify-center text-[13px]"
    >
      {icon} {label}
    </button>
  );
}
