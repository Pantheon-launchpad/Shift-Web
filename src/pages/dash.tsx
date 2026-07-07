import React, { useEffect, useRef, useState } from "react";
import {
  Flame,
  Square,
  X,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  Zap,
  Layers,
  ArrowUpRight,
  Share2,
  Bell,
  Settings,
  ChevronRight,
  Target,
  BarChart3,
  GitBranch,
} from "lucide-react";

/* ============================================================
   DESIGN TOKENS
============================================================ */
const COLORS = {
  ink: "#0A0A0A",
  paper: "#0D0D0D",
  paperLight: "#141414",
  accent: "#7C3AED",
  accentSoft: "#1A0A2E",
  accentGlow: "rgba(124,58,237,0.15)",
  muted: "#8A8A8A",
  mutedDark: "#6A6A6A",
  line: "#2A2A2A",
  glass: "rgba(255,255,255,0.04)",
  glassBorder: "rgba(255,255,255,0.06)",
  glassStrong: "rgba(255,255,255,0.08)",
  green: "#4ADE80",
  yellow: "#FBBF24",
  pink: "#F472B6",
  blue: "#60A5FA",
  orange: "#FB923C",
  red: "#F87171",
};

/* ============================================================
   BACKGROUND DECORATIONS
============================================================ */
const PurpleBlurCircles = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      overflow: "hidden",
      zIndex: 0,
    }}
  >
    <div
      style={{
        position: "absolute",
        width: "60vw",
        height: "60vw",
        top: "-20%",
        right: "-10%",
        background:
          "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(80px)",
      }}
    />
    <div
      style={{
        position: "absolute",
        width: "40vw",
        height: "40vw",
        bottom: "-15%",
        left: "-5%",
        background:
          "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(60px)",
      }}
    />
    <div
      style={{
        position: "absolute",
        width: "25vw",
        height: "25vw",
        top: "40%",
        right: "5%",
        background:
          "radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(50px)",
      }}
    />
    <div
      style={{
        position: "absolute",
        width: "15vw",
        height: "15vw",
        top: "10%",
        left: "20%",
        background:
          "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(40px)",
      }}
    />
  </div>
);

const GridPattern = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      zIndex: 0,
      opacity: 0.03,
      backgroundImage: `
      linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)
    `,
      backgroundSize: "48px 48px",
    }}
  />
);

const useShiftFonts = () => {
  useEffect(() => {
    if (document.getElementById("shift-fonts")) return;
    const link = document.createElement("link");
    link.id = "shift-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap";
    document.head.appendChild(link);
  }, []);
};

/* ============================================================
   TYPES
============================================================ */
type WeekStatus = "done" | "current" | "upcoming";
interface Week {
  week: number;
  title: string;
  status: WeekStatus;
}

const INITIAL_WEEKS: Week[] = [
  { week: 1, title: "Research & Validate", status: "done" },
  { week: 2, title: "Build MVP Core", status: "done" },
  { week: 3, title: "Launch Beta", status: "current" },
  { week: 4, title: "User Growth", status: "upcoming" },
  { week: 5, title: "Monetization", status: "upcoming" },
  { week: 6, title: "Scale & Optimize", status: "upcoming" },
];

const DURATIONS = [15, 25, 45, 60];
const TASK =
  "Wire the AI Debrief endpoint so a raw update becomes a one-line summary";
const MILESTONE = "Week 3 - Launch Beta";

/* ============================================================
   FOCUS SESSION (Enhanced)
============================================================ */
const FocusSession = ({ task, onEnd }: { task: string; onEnd: () => void }) => {
  const [duration, setDuration] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(duration * 60);
  }, [duration]);

  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");
  const progress = ((duration * 60 - remaining) / (duration * 60)) * 100;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 30,
        background: COLORS.ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "focusFadeIn 0.4s ease",
      }}
    >
      <style>{`
        @keyframes focusFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <PurpleBlurCircles />
      <GridPattern />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          position: "relative",
          zIndex: 1,
          padding: "20px",
          maxWidth: "480px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "10px",
              letterSpacing: "0.1em",
              color: COLORS.muted,
            }}
          >
            ⚡ FOCUS SESSION
          </span>
          <button
            onClick={onEnd}
            style={{
              background: "none",
              border: "none",
              color: COLORS.muted,
              fontSize: "18px",
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="200" height="200" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke={COLORS.line}
              strokeWidth="4"
            />
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke={COLORS.accent}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${progress * 5.53} 553`}
              strokeDashoffset="0"
              style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "clamp(48px, 12vw, 72px)",
              fontWeight: 500,
              color: "#FAFAFA",
              letterSpacing: "0.02em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {mins}:{secs}
          </div>
        </div>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            color: COLORS.muted,
            textAlign: "center",
            lineHeight: 1.5,
            margin: 0,
            maxWidth: "380px",
          }}
        >
          {task}
        </p>

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              style={{
                padding: "6px 14px",
                borderRadius: "999px",
                border: `1px solid ${d === duration ? COLORS.accent : COLORS.line}`,
                background: d === duration ? COLORS.accentSoft : "transparent",
                color: d === duration ? COLORS.accent : COLORS.muted,
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "12px",
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
            >
              {d}m
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            width: "100%",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => setIsPaused(!isPaused)}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: `1px solid ${COLORS.line}`,
              background: "transparent",
              color: COLORS.muted,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 150ms ease",
              flex: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = COLORS.accent;
              e.currentTarget.style.color = "#FAFAFA";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.line;
              e.currentTarget.style.color = COLORS.muted;
            }}
          >
            {isPaused ? "▶ Resume" : "⏸ Pause"}
          </button>
          <button
            onClick={onEnd}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: COLORS.accent,
              color: "#FAFAFA",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: "0 2px 24px rgba(124,58,237,0.3)",
              transition: "all 150ms ease",
              flex: 1,
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 4px 32px rgba(124,58,237,0.45)";
              e.currentTarget.style.transform = "scale(0.98)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 2px 24px rgba(124,58,237,0.3)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <Square size={13} fill="#FAFAFA" /> End session
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   MAIN DASHBOARD - WITH onFocusEnd PROP
============================================================ */
interface ShiftCommandCenterProps {
  goalData?: { goal: string; roadmap: any } | null;
  onFocusEnd: () => void; // 👈 NEW: Called when focus session ends
}

export default function ShiftCommandCenter({
  goalData,
  onFocusEnd,
}: ShiftCommandCenterProps) {
  useShiftFonts();
  const [weeks] = useState<Week[]>(INITIAL_WEEKS);
  const [streak, setStreak] = useState(6);
  const [progress, setProgress] = useState(65);
  const [showTimeline, setShowTimeline] = useState(false);
  const [inSession, setInSession] = useState(false);
  const [justLogged, setJustLogged] = useState(false);

  const handleEndSession = () => {
    setInSession(false);
    setProgress((p) => Math.min(100, p + 15));
    setStreak((s) => s + 1);
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 3200);

    // 👇 Call the parent to go to debrief
    onFocusEnd();
  };

  if (inSession) return <FocusSession task={TASK} onEnd={handleEndSession} />;

  const currentMilestone = weeks.find((w) => w.status === "current");

  // Stats data
  const stats = [
    {
      icon: <Flame size={18} color={COLORS.accent} />,
      label: "Day Streak",
      value: streak,
      change: 12,
      color: COLORS.accentSoft,
    },
    {
      icon: <CheckCircle2 size={18} color={COLORS.green} />,
      label: "Tasks Done",
      value: "24/35",
      change: 8,
      color: "rgba(74,222,128,0.1)",
    },
    {
      icon: <TrendingUp size={18} color={COLORS.yellow} />,
      label: "Momentum",
      value: "89%",
      change: 5,
      color: "rgba(251,191,36,0.1)",
    },
    {
      icon: <Award size={18} color={COLORS.pink} />,
      label: "Milestones",
      value: "2/6",
      change: -2,
      color: "rgba(244,114,182,0.1)",
    },
  ];

  // Activity data
  const activities = [
    {
      title: "Shipped authentication flow",
      time: "2h ago",
      type: "Feature",
      status: "done",
    },
    {
      title: "Fixed signup page bug",
      time: "4h ago",
      type: "Bug Fix",
      status: "done",
    },
    {
      title: "Wrote API documentation",
      time: "6h ago",
      type: "Docs",
      status: "done",
    },
    {
      title: "Design review for dashboard",
      time: "Yesterday",
      type: "Design",
      status: "current",
    },
    {
      title: "User testing session",
      time: "Yesterday",
      type: "Research",
      status: "upcoming",
    },
  ];

  // Quick actions
  const quickActions = [
    {
      icon: <Zap size={16} />,
      label: "Quick Debrief",
      action: () => alert("Debrief would open here"),
    },
    {
      icon: <Share2 size={16} />,
      label: "Build in Public",
      action: () => alert("Build in Public would open here"),
    },
    {
      icon: <Target size={16} />,
      label: "Set Goal",
      action: () => alert("Goal setting would open here"),
    },
    {
      icon: <BarChart3 size={16} />,
      label: "Analytics",
      action: () => alert("Analytics would open here"),
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: COLORS.ink,
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <PurpleBlurCircles />
      <GridPattern />

      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 32px",
          position: "relative",
          zIndex: 1,
          flexWrap: "wrap",
          gap: "12px",
          borderBottom: `1px solid ${COLORS.line}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke={COLORS.accent}
                strokeWidth="1.5"
                strokeDasharray="2 5"
              />
              <circle cx="12" cy="3" r="2.5" fill={COLORS.accent} />
            </svg>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: "18px",
                color: "#FAFAFA",
                letterSpacing: "-0.01em",
              }}
            >
              Shift
            </span>
          </div>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "10px",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: COLORS.muted,
              background: COLORS.glass,
              padding: "4px 12px",
              borderRadius: "20px",
              border: `1px solid ${COLORS.glassBorder}`,
            }}
          >
            {MILESTONE}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: COLORS.glass,
              padding: "6px 14px",
              borderRadius: "20px",
              border: `1px solid ${COLORS.glassBorder}`,
            }}
          >
            <Flame size={16} color={COLORS.accent} fill={COLORS.accent} />
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "14px",
                fontWeight: 500,
                color: COLORS.accent,
              }}
            >
              {streak}
            </span>
          </div>
          <button
            style={{
              background: COLORS.glass,
              border: `1px solid ${COLORS.glassBorder}`,
              borderRadius: "8px",
              padding: "8px",
              color: COLORS.muted,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = COLORS.accent;
              e.currentTarget.style.color = "#FAFAFA";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.glassBorder;
              e.currentTarget.style.color = COLORS.muted;
            }}
          >
            <Bell size={16} />
          </button>
          <button
            style={{
              background: COLORS.glass,
              border: `1px solid ${COLORS.glassBorder}`,
              borderRadius: "8px",
              padding: "8px",
              color: COLORS.muted,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = COLORS.accent;
              e.currentTarget.style.color = "#FAFAFA";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.glassBorder;
              e.currentTarget.style.color = COLORS.muted;
            }}
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "24px 32px 32px",
          position: "relative",
          zIndex: 1,
          gap: "20px",
          maxWidth: "1100px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "12px",
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{
                background: COLORS.glass,
                backdropFilter: "blur(10px)",
                border: `1px solid ${COLORS.glassBorder}`,
                borderRadius: "12px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                transition: "all 0.3s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = COLORS.accent;
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(124,58,237,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = COLORS.glassBorder;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: stat.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {stat.icon}
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "22px",
                    fontWeight: 600,
                    color: "#FAFAFA",
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: COLORS.muted,
                    margin: 0,
                    letterSpacing: "0.02em",
                  }}
                >
                  {stat.label}
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: 500,
                    margin: 0,
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: stat.change > 0 ? COLORS.green : COLORS.red,
                  }}
                >
                  {stat.change > 0 ? "↑" : "↓"} {Math.abs(stat.change)}%
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Task Card */}
        <div
          style={{
            width: "100%",
            background: COLORS.glass,
            backdropFilter: "blur(20px)",
            borderRadius: "16px",
            padding: "28px 32px",
            border: `1px solid ${COLORS.glassBorder}`,
            boxShadow: "0 8px 48px rgba(0,0,0,0.5)",
            transition: "all 0.3s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "10px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: COLORS.accent,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Zap size={14} /> TODAY'S ONE TASK
            </span>
            <span
              style={{
                fontSize: "10px",
                color: COLORS.accent,
                background: COLORS.accentSoft,
                padding: "2px 10px",
                borderRadius: "12px",
              }}
            >
              ⚡ High Impact
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: "clamp(22px, 3vw, 30px)",
              lineHeight: 1.3,
              color: "#FAFAFA",
              margin: "4px 0 8px",
              letterSpacing: "-0.01em",
            }}
          >
            {TASK}
          </h1>

          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: COLORS.muted,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Clock size={12} /> ~25 min
            </span>
            <span
              style={{
                fontSize: "12px",
                color: COLORS.muted,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Layers size={12} /> {currentMilestone?.title || MILESTONE}
            </span>
            <span
              style={{
                fontSize: "12px",
                color: COLORS.green,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Target size={12} /> On track
            </span>
          </div>

          <div style={{ margin: "4px 0 16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "4px",
              }}
            >
              <span style={{ fontSize: "11px", color: COLORS.muted }}>
                Today's Progress
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "12px",
                  color: "#FAFAFA",
                }}
              >
                {progress}%
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "6px",
                background: COLORS.line,
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accent}CC)`,
                  borderRadius: "999px",
                  transition: "width 700ms cubic-bezier(0.4,0,0.2,1)",
                  boxShadow: `0 0 20px ${COLORS.accentGlow}`,
                }}
              />
            </div>
          </div>

          {justLogged && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(74,222,128,0.1)",
                border: "1px solid rgba(74,222,128,0.2)",
                borderRadius: "8px",
                padding: "8px 12px",
                marginBottom: "12px",
                animation: "slideUp 0.3s ease",
              }}
            >
              <CheckCircle2 size={16} color={COLORS.green} />
              <span style={{ fontSize: "13px", color: COLORS.green }}>
                Session logged! Progress updated. 🔥
              </span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setInSession(true)}
              style={{
                flex: 1,
                minWidth: "140px",
                height: "48px",
                borderRadius: "8px",
                border: "none",
                background: COLORS.accent,
                color: "#FAFAFA",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 2px 24px rgba(124,58,237,0.3)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 32px rgba(124,58,237,0.45)";
                e.currentTarget.style.transform = "scale(0.98)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 2px 24px rgba(124,58,237,0.3)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <Square size={16} fill="#FAFAFA" /> Start Focus
            </button>
            <button
              onClick={() => setShowTimeline(true)}
              style={{
                flex: 1,
                minWidth: "100px",
                height: "48px",
                borderRadius: "8px",
                border: `1px solid ${COLORS.line}`,
                background: "transparent",
                color: COLORS.muted,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = COLORS.accent;
                e.currentTarget.style.color = "#FAFAFA";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = COLORS.line;
                e.currentTarget.style.color = COLORS.muted;
              }}
            >
              <ArrowUpRight size={16} /> View Timeline
            </button>
          </div>
        </div>

        {/* Quick Actions + Activity */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          {/* Quick Actions */}
          <div
            style={{
              background: COLORS.glass,
              backdropFilter: "blur(20px)",
              borderRadius: "16px",
              padding: "20px 24px",
              border: `1px solid ${COLORS.glassBorder}`,
            }}
          >
            <h3
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                color: "#FAFAFA",
                margin: "0 0 12px 0",
              }}
            >
              Quick Actions
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={action.action}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: `1px solid ${COLORS.glassBorder}`,
                    background: "transparent",
                    color: COLORS.muted,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "13px",
                    fontWeight: 500,
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.accent;
                    e.currentTarget.style.color = "#FAFAFA";
                    e.currentTarget.style.background = COLORS.accentSoft;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.glassBorder;
                    e.currentTarget.style.color = COLORS.muted;
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {action.icon}
                  {action.label}
                  <ChevronRight size={14} style={{ marginLeft: "auto" }} />
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div
            style={{
              background: COLORS.glass,
              backdropFilter: "blur(20px)",
              borderRadius: "16px",
              padding: "20px 24px",
              border: `1px solid ${COLORS.glassBorder}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#FAFAFA",
                  margin: 0,
                }}
              >
                Recent Activity
              </h3>
              <span
                style={{
                  fontSize: "10px",
                  color: COLORS.green,
                  background: "rgba(74,222,128,0.1)",
                  padding: "2px 10px",
                  borderRadius: "12px",
                }}
              >
                +3 this week
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {activities.map((activity, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "8px 0",
                    borderBottom:
                      i < activities.length - 1
                        ? `1px solid ${COLORS.line}`
                        : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      marginTop: "6px",
                      flexShrink: 0,
                      background:
                        activity.status === "done"
                          ? COLORS.green
                          : activity.status === "current"
                            ? COLORS.yellow
                            : COLORS.muted,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#FAFAFA",
                        margin: 0,
                        lineHeight: 1.4,
                      }}
                    >
                      {activity.title}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        marginTop: "2px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          color: COLORS.muted,
                          fontFamily: "'IBM Plex Mono', monospace",
                        }}
                      >
                        {activity.time}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          color: COLORS.accent,
                          background: COLORS.accentSoft,
                          padding: "1px 8px",
                          borderRadius: "12px",
                        }}
                      >
                        {activity.type}
                      </span>
                    </div>
                  </div>
                  {activity.status === "done" && (
                    <CheckCircle2 size={16} color={COLORS.green} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Roadmap Preview */}
        <div
          style={{
            background: COLORS.glass,
            backdropFilter: "blur(20px)",
            borderRadius: "16px",
            padding: "20px 24px",
            border: `1px solid ${COLORS.glassBorder}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <h3
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                color: "#FAFAFA",
                margin: 0,
              }}
            >
              Roadmap Progress
            </h3>
            <button
              onClick={() => setShowTimeline(true)}
              style={{
                background: "none",
                border: "none",
                color: COLORS.muted,
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = COLORS.accent)
              }
              onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.muted)}
            >
              View all →
            </button>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              padding: "12px 0",
              position: "relative",
              overflowX: "auto",
              gap: 0,
            }}
          >
            {weeks.map((week, index) => (
              <div
                key={week.week}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                  minWidth: "60px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    border: `2px solid ${week.status === "upcoming" ? COLORS.line : COLORS.accent}`,
                    background:
                      week.status === "done"
                        ? COLORS.accent
                        : week.status === "current"
                          ? COLORS.accent
                          : COLORS.ink,
                    zIndex: 2,
                    transition: "all 0.3s ease",
                    boxShadow:
                      week.status === "current"
                        ? "0 0 20px rgba(124,58,237,0.3)"
                        : "none",
                    animation:
                      week.status === "current"
                        ? "pulseDot 2s infinite"
                        : "none",
                  }}
                />
                {index < weeks.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "5px",
                      left: "50%",
                      right: "-50%",
                      height: "2px",
                      background:
                        week.status === "done" || week.status === "current"
                          ? COLORS.accent
                          : COLORS.line,
                      zIndex: 1,
                    }}
                  />
                )}
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "9px",
                    color: COLORS.muted,
                    marginTop: "4px",
                    letterSpacing: "0.05em",
                  }}
                >
                  W{week.week}
                </div>
                <div
                  style={{
                    fontSize: "8px",
                    color: COLORS.mutedDark,
                    textAlign: "center",
                    maxWidth: "70px",
                    lineHeight: 1.2,
                    marginTop: "2px",
                    display: "none",
                  }}
                >
                  {week.title}
                </div>
                <style>{`
                  @keyframes pulseDot {
                    0%, 100% { box-shadow: 0 0 20px rgba(124,58,237,0.3); }
                    50% { box-shadow: 0 0 40px rgba(124,58,237,0.6); }
                  }
                  @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                `}</style>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Timeline Overlay */}
      {showTimeline && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div
            onClick={() => setShowTimeline(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              animation: "fadeIn 200ms ease",
            }}
          />
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "380px",
              height: "100%",
              background: COLORS.ink,
              borderLeft: `1px solid ${COLORS.line}`,
              padding: "28px 24px",
              overflowY: "auto",
              animation: "slideIn 260ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: "20px",
                  color: "#FAFAFA",
                  margin: 0,
                }}
              >
                Timeline
              </h2>
              <button
                onClick={() => setShowTimeline(false)}
                style={{
                  background: "none",
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#FAFAFA",
                }}
              >
                <X size={18} />
              </button>
            </div>
            {weeks.map((week) => (
              <div
                key={week.week}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  padding: "14px 0",
                  borderBottom: `1px solid ${COLORS.line}`,
                }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    marginTop: "2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      week.status === "done" ? COLORS.accent : "transparent",
                    border: `1.5px solid ${week.status === "upcoming" ? COLORS.line : COLORS.accent}`,
                  }}
                >
                  {week.status === "done" && (
                    <svg width="10" height="8" viewBox="0 0 10 8">
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="#FAFAFA"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {week.status === "current" && (
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: COLORS.accent,
                      }}
                    />
                  )}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "10px",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      color:
                        week.status === "upcoming"
                          ? COLORS.muted
                          : COLORS.accent,
                      marginBottom: "3px",
                    }}
                  >
                    Week {week.week}{" "}
                    {week.status === "current" && "· in progress"}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "14px",
                      color:
                        week.status === "upcoming" ? COLORS.muted : "#FAFAFA",
                      lineHeight: 1.4,
                    }}
                  >
                    {week.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          `}</style>
        </div>
      )}
    </div>
  );
}
