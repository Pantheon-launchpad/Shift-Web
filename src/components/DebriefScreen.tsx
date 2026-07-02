import React, { useState } from "react";
import { Loader2 } from "lucide-react";

// -------- Design Tokens --------
const COLORS = {
  ink: "#0A0A0A",
  paper: "#0D0D0D",
  accent: "#7C3AED",
  accentSoft: "#1A0A2E",
  muted: "#8A8A8A",
  line: "#2A2A2A",
  glass: "rgba(255,255,255,0.04)",
  glassBorder: "rgba(255,255,255,0.06)",
};

// -------- Background Decorations --------
const PurpleBlurCircles = () => (
  <div className="db-orbs">
    <div className="orb orb-1" />
    <div className="orb orb-2" />
    <div className="orb orb-3" />
    <style>{`
      .db-orbs { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
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
  <div className="db-grid">
    <style>{`
      .db-grid { position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.03; background-image: linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px); background-size: 48px 48px; }
    `}</style>
  </div>
);

// -------- Component Props --------
interface DebriefScreenProps {
  taskTitle: string;
  onComplete: (debrief: { rawText: string; link?: string; aiSummary: string }) => void;
}

// -------- Main Component --------
export default function DebriefScreen({ taskTitle, onComplete }: DebriefScreenProps) {
  const [rawText, setRawText] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const summary = `Got it. I marked "${taskTitle}" as done and moved your milestone forward.`;
      setAiSummary(summary);
      setLoading(false);
      setTimeout(() => {
        onComplete({ rawText, link: link.trim() || undefined, aiSummary: summary });
      }, 600);
    }, 1500);
  };

  // -------- AI Summary (transition) --------
  if (aiSummary) {
    return (
      <div className="db-screen">
        <PurpleBlurCircles />
        <GridPattern />
        <div className="db-container">
          <div className="db-card">
            <div className="db-ai-summary">
              <span className="db-check">✓</span>
              <p>{aiSummary}</p>
            </div>
            <div className="db-loading">Continuing…</div>
          </div>
        </div>
        <style>{`
          .db-screen { min-height: 100vh; background: ${COLORS.ink}; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
          .db-container { width: 100%; max-width: 560px; padding: 20px; position: relative; z-index: 1; }
          .db-card { background: ${COLORS.glass}; backdrop-filter: blur(20px); border-radius: 16px; padding: 32px 28px; border: 1px solid ${COLORS.glassBorder}; box-shadow: 0 8px 48px rgba(0,0,0,0.5); }
          .db-ai-summary { display: flex; gap: 12px; align-items: flex-start; }
          .db-check { font-size: 24px; color: ${COLORS.accent}; }
          .db-ai-summary p { font-size: 15px; line-height: 1.6; color: #FAFAFA; margin: 0; }
          .db-loading { margin-top: 20px; text-align: center; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: ${COLORS.muted}; }
          @media (max-width: 480px) { .db-card { padding: 24px 16px; } }
        `}</style>
      </div>
    );
  }

  // -------- Input Form --------
  return (
    <div className="db-screen">
      <PurpleBlurCircles />
      <GridPattern />
      <div className="db-container">
        <div className="db-card">
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 22, color: "#FAFAFA", marginBottom: 4 }}>
            What did you get done?
          </h2>
          <p style={{ color: COLORS.muted, marginBottom: 20, fontSize: 13 }}>
            Tell Shift what you accomplished during the focus session.
          </p>
          <div className="db-field">
            <label>Your update</label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="e.g., Wrote the landing page copy and fixed the mobile nav"
              rows={4}
            />
          </div>
          <div className="db-field">
            <label>Link (optional)</label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://github.com/your-pr, etc."
            />
          </div>
          <button className="db-submit" onClick={handleSubmit} disabled={!rawText.trim() || loading}>
            {loading ? <Loader2 size={16} className="spin" /> : "Submit update"}
          </button>
        </div>
      </div>
      <style>{`
        .db-screen { min-height: 100vh; background: ${COLORS.ink}; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .db-container { width: 100%; max-width: 560px; padding: 20px; position: relative; z-index: 1; }
        .db-card { background: ${COLORS.glass}; backdrop-filter: blur(20px); border-radius: 16px; padding: 32px 28px; border: 1px solid ${COLORS.glassBorder}; box-shadow: 0 8px 48px rgba(0,0,0,0.5); }
        .db-field { margin-bottom: 16px; }
        .db-field label { display: block; font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.05em; text-transform: uppercase; color: ${COLORS.muted}; margin-bottom: 4px; }
        .db-field textarea, .db-field input { width: 100%; border-radius: 8px; border: 1.5px solid ${COLORS.line}; background: ${COLORS.glass}; backdrop-filter: blur(10px); padding: 10px 14px; font-family: 'Inter', sans-serif; font-size: 14px; color: #FAFAFA; outline: none; transition: border-color 150ms; resize: vertical; }
        .db-field textarea:focus, .db-field input:focus { border-color: ${COLORS.accent}; }
        .db-field textarea::placeholder, .db-field input::placeholder { color: ${COLORS.muted}; }
        .db-submit { width: 100%; height: 46px; border-radius: 8px; border: none; background: ${COLORS.accent}; color: #fff; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; box-shadow: 0 2px 12px rgba(124,58,237,0.3); transition: opacity 150ms; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 8px; }
        .db-submit:disabled { opacity: 0.5; cursor: default; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 480px) { .db-card { padding: 24px 16px; } }
      `}</style>
    </div>
  );
}