import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Github, Loader2, Mail } from "lucide-react";

// ============================================================
// 👇 NEW: Add props interface
// ============================================================
interface ShiftAuthProps {
  onAuthSuccess: () => void;
}

/* ============================================================
   DESIGN TOKENS — Dark Theme (Black + Purple)
============================================================ */
const COLORS = {
  ink: "#0A0A0A",
  paper: "#0D0D0D",
  accent: "#7C3AED",
  accentSoft: "#1A0A2E",
  accentGlow: "rgba(124,58,237,0.15)",
  muted: "#8A8A8A",
  line: "#2A2A2A",
  glass: "rgba(255,255,255,0.04)",
  glassBorder: "rgba(255,255,255,0.06)",
};

/* ============================================================
   FONTS
============================================================ */
const FONT_LINK_ID = "shift-fonts";
function useShiftFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap";
    document.head.appendChild(link);
  }, []);
}

/* ============================================================
   BACKGROUND DECORATIONS
============================================================ */
const PurpleBlurCircles = () => (
  <div className="shift-bg-orbs">
    <div className="orb orb-1" />
    <div className="orb orb-2" />
    <div className="orb orb-3" />
    <style>{`
      .shift-bg-orbs {
        position: fixed;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
        z-index: 0;
      }
      .orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.6;
      }
      .orb-1 {
        width: 60vw;
        height: 60vw;
        top: -20%;
        right: -10%;
        background: radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%);
      }
      .orb-2 {
        width: 40vw;
        height: 40vw;
        bottom: -15%;
        left: -5%;
        background: radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%);
        filter: blur(60px);
      }
      .orb-3 {
        width: 25vw;
        height: 25vw;
        top: 40%;
        right: 5%;
        background: radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%);
        filter: blur(50px);
      }
      @media (max-width: 768px) {
        .orb-1 { width: 80vw; height: 80vw; top: -30%; right: -20%; }
        .orb-2 { width: 60vw; height: 60vw; bottom: -20%; }
        .orb-3 { width: 40vw; height: 40vw; }
      }
    `}</style>
  </div>
);

const GridPattern = () => (
  <div className="shift-grid">
    <style>{`
      .shift-grid {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        opacity: 0.03;
        background-image: 
          linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px);
        background-size: 48px 48px;
      }
    `}</style>
  </div>
);

/* ============================================================
   THE LOOP (animated)
============================================================ */
const LOOP_STEPS = [
  "Goal",
  "AI builds today's plan",
  "You pick one task",
  "Focus session",
  "Work gets done",
  "AI asks what happened",
  "AI turns it into proof",
  "Progress moves",
];

const TheLoop = () => {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setActive((i) => (i + 1) % LOOP_STEPS.length),
      2200
    );
    return () => clearInterval(id);
  }, []);
  const size = 200;
  const r = 76;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="shift-loop">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={COLORS.line}
          strokeWidth={1}
          strokeDasharray="2 7"
        />
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
              fill={isActive ? COLORS.accent : COLORS.muted}
              style={{ transition: "r 500ms ease, fill 500ms ease" }}
            />
          );
        })}
        <circle cx={cx} cy={cy} r={2} fill={COLORS.muted} opacity={0.6} />
      </svg>
      <span className="loop-label">{LOOP_STEPS[active]}</span>
      <style>{`
        .shift-loop {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }
        .loop-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.06em;
          color: ${COLORS.accent};
          text-transform: uppercase;
          transition: opacity 300ms ease;
          text-align: center;
          min-height: 1.2em;
        }
        @media (max-width: 768px) {
          .shift-loop svg { width: 160px; height: 160px; }
        }
      `}</style>
    </div>
  );
};

/* ============================================================
   BRAND MARK
============================================================ */
const Brandmark = ({ dark = true }: { dark?: boolean }) => (
  <div className="shift-brand">
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <circle
        cx="10"
        cy="10"
        r="8"
        stroke={COLORS.accent}
        strokeWidth="1.5"
        strokeDasharray="2 5"
      />
      <circle cx="10" cy="2.5" r="2" fill={COLORS.accent} />
    </svg>
    <span>Shift</span>
    <style>{`
      .shift-brand {
        display: flex;
        align-items: center;
        gap: 8px;
        position: relative;
        z-index: 1;
      }
      .shift-brand span {
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 600;
        font-size: 18px;
        letter-spacing: -0.01em;
        color: ${dark ? "#FAFAFA" : COLORS.accent};
      }
    `}</style>
  </div>
);

/* ============================================================
   UI COMPONENTS — with proper TypeScript types
============================================================ */

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  loadingLabel?: string;
  type?: "button" | "submit" | "reset";
}

const PrimaryButton = ({
  children,
  onClick,
  loading = false,
  loadingLabel = "One moment…",
  type = "button",
}: PrimaryButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading}
    className="shift-primary-btn"
  >
    {loading ? (
      <>
        <Loader2 size={16} className="spin" />
        <span>{loadingLabel}</span>
      </>
    ) : (
      <>
        <span>{children}</span>
        <ArrowRight size={16} />
      </>
    )}
    <style>{`
      .shift-primary-btn {
        width: 100%;
        height: 48px;
        border-radius: 8px;
        border: none;
        background: ${COLORS.accent};
        color: #fff;
        font-family: 'Inter', sans-serif;
        font-weight: 600;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: ${loading ? "default" : "pointer"};
        opacity: ${loading ? 0.7 : 1};
        box-shadow: 0 2px 24px rgba(124,58,237,0.3);
        transition: transform 150ms ease, box-shadow 150ms ease;
        position: relative;
        z-index: 1;
      }
      .shift-primary-btn:hover:not(:disabled) {
        box-shadow: 0 4px 32px rgba(124,58,237,0.45);
        transform: scale(0.98);
      }
      .spin { animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
  </button>
);

interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoFocus?: boolean;
}

const InputField = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoFocus = false,
}: InputFieldProps) => {
  const [focused, setFocused] = useState(false);
  return (
    <label className="shift-field">
      <span className="field-label">{label}</span>
      <input
        autoFocus={autoFocus}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={`field-input ${focused ? "focused" : ""}`}
      />
      <style>{`
        .shift-field {
          display: block;
          position: relative;
          z-index: 1;
        }
        .field-label {
          display: block;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: ${COLORS.muted};
          margin-bottom: 6px;
        }
        .field-input {
          width: 100%;
          height: 44px;
          border-radius: 8px;
          border: 1.5px solid ${COLORS.line};
          background: ${COLORS.glass};
          backdrop-filter: blur(10px);
          padding: 0 14px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #FAFAFA;
          outline: none;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .field-input::placeholder { color: ${COLORS.muted}; }
        .field-input.focused {
          border-color: ${COLORS.accent};
          box-shadow: 0 0 0 4px ${COLORS.accentSoft};
        }
      `}</style>
    </label>
  );
};

interface SSOButtonProps {
  icon: React.ReactNode;
  label: string;
}

const SSOButton = ({ icon, label }: SSOButtonProps) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      className="sso-btn"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: hover ? COLORS.accentSoft : COLORS.glass }}
    >
      {icon} {label}
      <style>{`
        .sso-btn {
          flex: 1;
          height: 44px;
          border-radius: 8px;
          border: 1.5px solid ${COLORS.line};
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #FAFAFA;
          transition: background 150ms ease, border-color 150ms ease;
          position: relative;
          z-index: 1;
        }
      `}</style>
    </button>
  );
};

/* ============================================================
   MAIN AUTH COMPONENT
============================================================ */
// 👇 CHANGED: Component now accepts onAuthSuccess prop
export default function ShiftAuth({ onAuthSuccess }: ShiftAuthProps) {
  useShiftFonts();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [nudge, setNudge] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSubmit = () => {
    setNudge(null);
    if (
      !email.trim() ||
      !password.trim() ||
      (mode === "signup" && !name.trim())
    ) {
      setNudge(
        !name.trim()
          ? "What should we call you?"
          : !email.trim()
          ? "An email gets you back in tomorrow."
          : "Add a password to continue."
      );
      return;
    }
    setLoading(true);
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      // 👇 CHANGED: Call onAuthSuccess instead of showing error
      onAuthSuccess();
    }, 1600);
  };

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );

  return (
    <div className="shift-auth">
      <PurpleBlurCircles />
      <GridPattern />

      <div className="auth-container">
        {/* LEFT PANEL */}
        <div className="auth-left">
          <Brandmark dark />
          <div className="auth-left-content">
            <h1>
              You don't need
              <br />
              another planner.
              <br />
              <span className="accent-text">You need to finish.</span>
            </h1>
            <p>One goal. One task today. One loop that never stops running.</p>
          </div>
          <div className="auth-left-footer">
            <TheLoop />
            <span className="loop-caption">
              The loop — runs once a day, forever
            </span>
          </div>
        </div>

        {/* RIGHT PANEL (glass card) */}
        <div className="auth-right">
          <div className="auth-card">
            <div className="mobile-brand">
              <Brandmark dark={false} />
            </div>

            <div className="auth-tabs">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setNudge(null);
                  }}
                  className={`tab-btn ${mode === m ? "active" : ""}`}
                >
                  {m === "signin" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            <div className="auth-header">
              <h2>{mode === "signin" ? "Welcome back" : "Start your loop"}</h2>
              <p>
                {mode === "signin"
                  ? "Pick up today's task where you left it."
                  : "One goal. Shift builds the rest."}
              </p>
            </div>

            <div className="auth-fields">
              {mode === "signup" && (
                <InputField
                  label="Name"
                  type="text"
                  value={name}
                  onChange={setName}
                  placeholder="What should we call you?"
                  autoFocus
                />
              )}
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@domain.com"
                autoFocus={mode === "signin"}
              />
              <InputField
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
              />
              {nudge && <div className="nudge">{nudge}</div>}
              <PrimaryButton onClick={handleSubmit} loading={loading}>
                {mode === "signin" ? "Sign in" : "Create account"}
              </PrimaryButton>
            </div>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <div className="auth-sso">
              <SSOButton icon={<Github size={15} />} label="GitHub" />
              <SSOButton icon={<Mail size={15} />} label="Google" />
            </div>

            <p className="auth-footer-text">
              {mode === "signin" ? (
                <>
                  New to Shift?{" "}
                  <button onClick={() => setMode("signup")}>
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have one?{" "}
                  <button onClick={() => setMode("signin")}>Sign in</button>
                </>
              )}
              <br />
              By continuing you agree to build in public, honestly.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        /* ===== GLOBAL RESET / BASE ===== */
        .shift-auth {
          min-height: 100vh;
          width: 100%;
          background: ${COLORS.ink};
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .auth-container {
          display: flex;
          width: 100%;
          max-width: 1280px;
          min-height: 100vh;
          position: relative;
          z-index: 1;
        }

        /* ===== LEFT PANEL ===== */
        .auth-left {
          flex: 0 0 46%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px 48px;
          border-right: 1px solid ${COLORS.line};
          position: relative;
          z-index: 1;
          min-height: 100vh;
        }
        .auth-left-content {
          max-width: 380px;
          margin: 40px 0;
        }
        .auth-left-content h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: clamp(28px, 4vw, 40px);
          line-height: 1.15;
          letter-spacing: -0.01em;
          color: #FAFAFA;
          margin: 0;
        }
        .accent-text { color: ${COLORS.accent}; }
        .auth-left-content p {
          margin-top: 16px;
          font-size: clamp(14px, 1.2vw, 16px);
          color: ${COLORS.muted};
          max-width: 340px;
          line-height: 1.6;
        }
        .auth-left-footer {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
        .loop-caption {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.05em;
          color: ${COLORS.muted};
          text-transform: uppercase;
        }

        /* ===== RIGHT PANEL (glass) ===== */
        .auth-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          z-index: 1;
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
          background: ${COLORS.glass};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 32px 28px;
          border: 1px solid ${COLORS.glassBorder};
          box-shadow: 0 8px 48px rgba(0,0,0,0.5);
        }
        .mobile-brand { display: none; margin-bottom: 24px; }

        /* Tabs */
        .auth-tabs {
          display: flex;
          gap: 24px;
          border-bottom: 1px solid ${COLORS.line};
          margin-bottom: 24px;
        }
        .tab-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0 0 12px 0;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: ${COLORS.muted};
          border-bottom: 2px solid transparent;
          transition: color 150ms ease, border-color 150ms ease;
        }
        .tab-btn.active {
          color: ${COLORS.accent};
          border-bottom-color: ${COLORS.accent};
        }

        .auth-header h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 22px;
          color: #FAFAFA;
          margin: 0;
        }
        .auth-header p {
          font-size: 13px;
          color: ${COLORS.muted};
          margin-top: 4px;
        }

        .auth-fields {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 20px;
        }
        .nudge {
          font-size: 13px;
          color: ${COLORS.accent};
          background: ${COLORS.accentSoft};
          border-radius: 8px;
          padding: 8px 12px;
          border: 1px solid ${COLORS.glassBorder};
        }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
        }
        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: ${COLORS.line};
        }
        .auth-divider span {
          font-size: 10px;
          color: ${COLORS.muted};
          font-family: 'IBM Plex Mono', monospace;
        }

        .auth-sso {
          display: flex;
          gap: 10px;
        }

        .auth-footer-text {
          margin-top: 24px;
          font-size: 12px;
          color: ${COLORS.muted};
          text-align: center;
          line-height: 1.6;
        }
        .auth-footer-text button {
          background: none;
          border: none;
          color: ${COLORS.accent};
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1024px) {
          .auth-left { flex: 0 0 50%; padding: 32px 36px; }
        }
        @media (max-width: 768px) {
          .auth-container { flex-direction: column; min-height: auto; }
          .auth-left {
            flex: none;
            width: 100%;
            min-height: auto;
            padding: 32px 24px 24px;
            border-right: none;
            border-bottom: 1px solid ${COLORS.line};
          }
          .auth-left-content { margin: 20px 0; max-width: 100%; }
          .auth-left-footer { align-items: center; width: 100%; }
          .mobile-brand { display: block; }
          .auth-right { padding: 16px; }
          .auth-card { max-width: 100%; padding: 24px 20px; }
          .auth-card .mobile-brand { display: block; }
        }
        @media (max-width: 480px) {
          .auth-left { padding: 24px 16px; }
          .auth-left-content h1 { font-size: 26px; }
          .auth-card { padding: 20px 16px; }
          .auth-tabs { gap: 16px; }
          .tab-btn { font-size: 13px; }
        }
      `}</style>
    </div>
  );
}
