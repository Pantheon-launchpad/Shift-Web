import React, { useEffect, useRef, useState } from "react";
import { Flame, Square, X } from "lucide-react";

/* ============================================================
   DESIGN TOKENS (same as auth)
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
   FONTS & BACKGROUND DECORATIONS (reuse from auth)
============================================================ */
// (same PurpleBlurCircles and GridPattern as above)
// I'll inline them here for completeness, but you can extract to a shared file.
const PurpleBlurCircles = () => (
  <div className="shift-bg-orbs">
    <div className="orb orb-1" />
    <div className="orb orb-2" />
    <div className="orb orb-3" />
    <style>{`
      .shift-bg-orbs { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
      .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.6; }
      .orb-1 { width: 60vw; height: 60vw; top: -20%; right: -10%; background: radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%); }
      .orb-2 { width: 40vw; height: 40vw; bottom: -15%; left: -5%; background: radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%); filter: blur(60px); }
      .orb-3 { width: 25vw; height: 25vw; top: 40%; right: 5%; background: radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%); filter: blur(50px); }
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
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        opacity: 0.03;
        background-image: 
          linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px);
        background-size: 48px 48px;
      }
    `}</style>
  </div>
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
   MOCK DATA
============================================================ */
type WeekStatus = "done" | "current" | "upcoming";
interface Week {
  week: number;
  title: string;
  status: WeekStatus;
}
const INITIAL_WEEKS: Week[] = [
  { week: 1, title: "Working prototype end to end", status: "done" },
  { week: 2, title: "Real AI in every screen", status: "current" },
  {
    week: 3,
    title: "Timeline, streak, and the card that gets shared",
    status: "upcoming",
  },
  { week: 4, title: "Polish and a demo that never breaks", status: "upcoming" },
];
const MILESTONE = "Week 2 — Real AI in every screen";
const TASK =
  "Wire the AI Debrief endpoint so a raw update becomes a one-line summary";
const DURATIONS = [15, 25, 45, 60];

/* ============================================================
   COMPONENTS
============================================================ */
const StreakBadge = ({ count }: { count: number }) => (
  <div className="streak">
    <Flame size={16} color={COLORS.accent} fill={COLORS.accent} />
    <span>{count}</span>
    <style>{`
      .streak { display: flex; align-items: center; gap: 6px; position: relative; z-index: 1; }
      .streak span { font-family: 'IBM Plex Mono', monospace; font-size: 14px; font-weight: 500; color: ${COLORS.accent}; }
    `}</style>
  </div>
);

const ProgressBar = ({ percent }: { percent: number }) => (
  <div className="progress-track">
    <div
      className="progress-fill"
      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
    />
    <style>{`
      .progress-track { width: 100%; height: 4px; background: ${COLORS.line}; border-radius: 999; }
      .progress-fill { height: 100%; background: ${COLORS.accent}; border-radius: 999; transition: width 700ms cubic-bezier(0.4,0,0.2,1); box-shadow: 0 0 12px ${COLORS.accentGlow}; }
    `}</style>
  </div>
);

const LoadingState = ({ phrases }: { phrases: string[] }) => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % phrases.length), 1100);
    return () => clearInterval(id);
  }, [phrases.length]);
  return <span className="loading">{phrases[i]}</span>;
};

const TimelineWeek = ({ week }: { week: Week }) => (
  <div className="timeline-week">
    <div className="tw-dot">
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
      {week.status === "current" && <div className="tw-current-dot" />}
    </div>
    <div>
      <div className="tw-label">
        Week {week.week} {week.status === "current" && "· in progress"}
      </div>
      <div className="tw-title">{week.title}</div>
    </div>
    <style>{`
      .timeline-week {
        display: flex; align-items: flex-start; gap: 14px; padding: 14px 0; border-bottom: 1px solid ${
          COLORS.line
        };
      }
      .tw-dot {
        width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0; margin-top: 2px;
        display: flex; align-items: center; justify-content: center;
        background: ${week.status === "done" ? COLORS.accent : "transparent"};
        border: 1.5px solid ${
          week.status === "upcoming" ? COLORS.line : COLORS.accent
        };
      }
      .tw-current-dot { width: 7px; height: 7px; border-radius: 50%; background: ${
        COLORS.accent
      }; }
      .tw-label {
        font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.05em; text-transform: uppercase;
        color: ${
          week.status === "upcoming" ? COLORS.muted : COLORS.accent
        }; margin-bottom: 3px;
      }
      .tw-title {
        font-family: 'Inter', sans-serif; font-size: 14px; color: ${
          week.status === "upcoming" ? COLORS.muted : "#FAFAFA"
        };
        line-height: 1.4;
      }
    `}</style>
  </div>
);

/* ============================================================
   TIMELINE OVERLAY (responsive)
============================================================ */
const TimelineOverlay = ({
  weeks,
  onClose,
}: {
  weeks: Week[];
  onClose: () => void;
}) => (
  <div className="timeline-overlay">
    <div className="to-backdrop" onClick={onClose} />
    <div className="to-panel">
      <div className="to-header">
        <h2>Timeline</h2>
        <button onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      {weeks.map((w) => (
        <TimelineWeek key={w.week} week={w} />
      ))}
    </div>
    <style>{`
      .timeline-overlay {
        position: fixed; inset: 0; z-index: 40; display: flex; justify-content: flex-end;
      }
      .to-backdrop {
        position: absolute; inset: 0; background: rgba(0,0,0,0.7); animation: fadeIn 200ms ease;
      }
      .to-panel {
        position: relative; width: 100%; max-width: 380px; height: 100%; background: ${COLORS.ink};
        border-left: 1px solid ${COLORS.line}; padding: 28px 24px; overflow-y: auto;
        animation: slideIn 260ms cubic-bezier(0.16,1,0.3,1);
      }
      .to-header {
        display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
      }
      .to-header h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 20px; color: #FAFAFA; margin: 0; }
      .to-header button {
        background: none; border: 1px solid ${COLORS.line}; border-radius: 50%; width: 32px; height: 32px;
        display: flex; align-items: center; justify-content: center; cursor: pointer; color: #FAFAFA;
      }
      @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
      @keyframes slideIn { from { transform: translateX(20px); opacity:0; } to { transform: translateX(0); opacity:1; } }
      @media (max-width: 480px) {
        .to-panel { max-width: 100%; padding: 20px 16px; }
      }
    `}</style>
  </div>
);

/* ============================================================
   FOCUS SESSION
============================================================ */
const FocusSession = ({ task, onEnd }: { task: string; onEnd: () => void }) => {
  const [duration, setDuration] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(duration * 60);
  }, [duration]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");

  return (
    <div className="focus-session">
      <PurpleBlurCircles />
      <GridPattern />
      <div className="focus-content">
        <div className="focus-durations">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`focus-dur-btn ${d === duration ? "active" : ""}`}
            >
              {d}m
            </button>
          ))}
        </div>
        <div className="focus-timer">
          {mins}:{secs}
        </div>
        <p className="focus-task">{task}</p>
        <button className="focus-end-btn" onClick={onEnd}>
          <Square size={13} fill="#FAFAFA" /> End session
        </button>
      </div>
      <style>{`
        .focus-session {
          position: fixed; inset: 0; z-index: 30; background: ${COLORS.ink};
          display: flex; align-items: center; justify-content: center;
        }
        .focus-content {
          display: flex; flex-direction: column; align-items: center; gap: 28px; position: relative; z-index: 1;
          padding: 20px;
        }
        .focus-durations { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
        .focus-dur-btn {
          padding: 6px 14px; border-radius: 999; border: 1px solid ${COLORS.line};
          background: transparent; color: ${COLORS.muted}; font-family: 'IBM Plex Mono', monospace;
          font-size: 12px; cursor: pointer; transition: all 150ms ease;
        }
        .focus-dur-btn.active {
          background: ${COLORS.accentSoft}; border-color: ${COLORS.accent}; color: ${COLORS.accent};
        }
        .focus-timer {
          font-family: 'IBM Plex Mono', monospace; font-size: clamp(60px, 15vw, 96px);
          font-weight: 500; color: #FAFAFA; letter-spacing: 0.02em; font-variant-numeric: tabular-nums;
        }
        .focus-task {
          font-family: 'Inter', sans-serif; font-size: 14px; color: ${COLORS.muted};
          max-width: 380px; text-align: center; line-height: 1.5; margin: 0;
        }
        .focus-end-btn {
          margin-top: 8px; display: flex; align-items: center; gap: 8px; padding: 10px 24px;
          border-radius: 8px; border: none; background: ${COLORS.accent}; color: #FAFAFA;
          font-family: 'Inter', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer;
          box-shadow: 0 2px 24px rgba(124,58,237,0.3); transition: transform 150ms ease, box-shadow 150ms ease;
        }
        .focus-end-btn:hover { box-shadow: 0 4px 32px rgba(124,58,237,0.45); transform: scale(0.98); }
      `}</style>
    </div>
  );
};

/* ============================================================
   MAIN DASHBOARD
============================================================ */
export default function ShiftCommandCenter() {
  useShiftFonts();
  const [weeks] = useState<Week[]>(INITIAL_WEEKS);
  const [streak] = useState(6);
  const [progress, setProgress] = useState(35);
  const [showTimeline, setShowTimeline] = useState(false);
  const [inSession, setInSession] = useState(false);
  const [justLogged, setJustLogged] = useState(false);

  const handleEndSession = () => {
    setInSession(false);
    setProgress((p) => Math.min(100, p + 20));
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 3200);
  };

  if (inSession) return <FocusSession task={TASK} onEnd={handleEndSession} />;

  return (
    <div className="dashboard">
      <PurpleBlurCircles />
      <GridPattern />

      {/* header */}
      <header className="dash-header">
        <span className="dash-milestone">{MILESTONE}</span>
        <StreakBadge count={streak} />
      </header>

      {/* main card */}
      <main className="dash-main">
        <div className="dash-card">
          <span className="dash-today-label">Today's one task</span>
          <h1 className="dash-task">{TASK}</h1>
          <div className="dash-progress">
            <ProgressBar percent={progress} />
            <span className="dash-progress-label">{progress}% today</span>
          </div>
          <button
            className="dash-timeline-btn"
            onClick={() => setShowTimeline(true)}
          >
            View timeline
          </button>
          {justLogged && (
            <LoadingState phrases={["Session logged.", "Nice work today."]} />
          )}
        </div>
      </main>

      {/* footer button */}
      <footer className="dash-footer">
        <button className="dash-start-btn" onClick={() => setInSession(true)}>
          Start Focus
        </button>
      </footer>

      {showTimeline && (
        <TimelineOverlay weeks={weeks} onClose={() => setShowTimeline(false)} />
      )}

      <style>{`
        .dashboard {
          min-height: 100vh; width: 100%; background: ${COLORS.ink};
          font-family: 'Inter', sans-serif; display: flex; flex-direction: column;
          position: relative; overflow: hidden;
        }
        .dash-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 24px 28px 0; position: relative; z-index: 1;
        }
        .dash-milestone {
          font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.05em;
          text-transform: uppercase; color: ${COLORS.muted};
        }
        .dash-main {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 20px 24px; position: relative; z-index: 1;
        }
        .dash-card {
          width: 100%; max-width: 480px; text-align: center;
          background: ${COLORS.glass}; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-radius: 16px; padding: 32px 24px;
          border: 1px solid ${COLORS.glassBorder};
          box-shadow: 0 8px 48px rgba(0,0,0,0.5);
        }
        .dash-today-label {
          display: block; font-family: 'IBM Plex Mono', monospace; font-size: 10px;
          letter-spacing: 0.05em; text-transform: uppercase; color: ${COLORS.accent}; margin-bottom: 12px;
        }
        .dash-task {
          font-family: 'Space Grotesk', sans-serif; font-weight: 600;
          font-size: clamp(24px, 4vw, 32px); line-height: 1.3; color: #FAFAFA;
          margin: 0; letter-spacing: -0.01em;
        }
        .dash-progress {
          margin-top: 24px; display: flex; flex-direction: column; gap: 6px;
        }
        .dash-progress-label {
          font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: ${COLORS.muted}; align-self: flex-end;
        }
        .dash-timeline-btn {
          margin-top: 20px; background: none; border: none; cursor: pointer;
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
          color: ${COLORS.muted}; text-decoration: underline; text-underline-offset: 3px;
          text-decoration-color: ${COLORS.line}; transition: color 150ms ease;
        }
        .dash-timeline-btn:hover { color: ${COLORS.accent}; }

        .dash-footer {
          padding: 0 24px 32px; display: flex; justify-content: center; position: relative; z-index: 1;
        }
        .dash-start-btn {
          width: 100%; max-width: 480px; height: 54px; border-radius: 8px; border: none;
          background: ${COLORS.accent}; color: #FAFAFA; font-family: 'Inter', sans-serif;
          font-weight: 600; font-size: 15px; cursor: pointer;
          box-shadow: 0 2px 24px rgba(124,58,237,0.3);
          transition: transform 150ms ease, box-shadow 150ms ease;
        }
        .dash-start-btn:hover {
          box-shadow: 0 4px 32px rgba(124,58,237,0.45);
          transform: scale(0.98);
        }

        @media (max-width: 480px) {
          .dash-header { padding: 16px 16px 0; flex-wrap: wrap; gap: 8px; }
          .dash-main { padding: 16px; }
          .dash-card { padding: 24px 16px; }
          .dash-task { font-size: 22px; }
          .dash-footer { padding: 0 16px 24px; }
        }
      `}</style>
    </div>
  );
}
