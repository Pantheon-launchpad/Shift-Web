import React, { useState } from "react";
import { Copy, Download, Check } from "lucide-react";

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
  <div className="rs-orbs">
    <div className="orb orb-1" />
    <div className="orb orb-2" />
    <div className="orb orb-3" />
    <style>{`
      .rs-orbs { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
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
  <div className="rs-grid">
    <style>{`
      .rs-grid { position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.03; background-image: linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px); background-size: 48px 48px; }
    `}</style>
  </div>
);

// -------- Component Props --------
interface ResultScreenProps {
  goal: string;
  milestone: string;
  streak: number;
  debriefSummary: string;
  onDone: () => void;
}

// -------- Main Component --------
export default function ResultScreen({
  goal,
  milestone,
  streak,
  debriefSummary,
  onDone,
}: ResultScreenProps) {
  // Mock generated content (would come from AI)
  const [posts] = useState({
    twitter: `Just shipped a major update to ${goal}. ${debriefSummary.substring(
      0,
      40
    )}... #buildinpublic #dev`,
    linkedin: `Today I made progress on ${goal}. ${debriefSummary} This is part of our ${milestone} milestone. Building in public keeps me accountable. Let's see what tomorrow brings.`,
    cardHeadline: `Day ${streak}: ${debriefSummary.split(".")[0]}`,
    cardSubline: `${goal} · ${milestone}`,
  });

  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="rs-screen">
      <PurpleBlurCircles />
      <GridPattern />
      <div className="rs-container">
        <div className="rs-card">
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 22,
              color: "#FAFAFA",
              marginBottom: 4,
            }}
          >
            Build in Public
          </h2>
          <p style={{ color: COLORS.muted, marginBottom: 20, fontSize: 13 }}>
            Your work is now proof. Share it with the world.
          </p>

          <div className="rs-tabs">
            <div className="rs-tab-content">
              {/* Twitter */}
              <div className="rs-post">
                <div className="rs-post-label">Twitter / X</div>
                <div className="rs-post-text">{posts.twitter}</div>
                <div className="rs-post-actions">
                  <button
                    onClick={() => copyToClipboard(posts.twitter, "Twitter")}
                  >
                    {copied === "Twitter" ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                    {copied === "Twitter" ? "Copied" : "Copy"}
                  </button>
                  <span className="rs-tag">Built with Shift</span>
                </div>
              </div>

              {/* LinkedIn */}
              <div className="rs-post">
                <div className="rs-post-label">LinkedIn</div>
                <div className="rs-post-text">{posts.linkedin}</div>
                <div className="rs-post-actions">
                  <button
                    onClick={() => copyToClipboard(posts.linkedin, "LinkedIn")}
                  >
                    {copied === "LinkedIn" ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                    {copied === "LinkedIn" ? "Copied" : "Copy"}
                  </button>
                  <span className="rs-tag">Built with Shift</span>
                </div>
              </div>

              {/* BIP Card */}
              <div className="rs-post">
                <div className="rs-post-label">Build in Public Card</div>
                <div className="rs-card-preview">
                  <div className="rs-card-inner">
                    <div className="rs-card-headline">{posts.cardHeadline}</div>
                    <div className="rs-card-subline">{posts.cardSubline}</div>
                    <div className="rs-card-footer">Built with Shift</div>
                  </div>
                </div>
                <div className="rs-post-actions">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `${posts.cardHeadline}\n${posts.cardSubline}`,
                        "Card"
                      )
                    }
                  >
                    {copied === "Card" ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                    {copied === "Card" ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={() =>
                      alert("Download would trigger image export.")
                    }
                  >
                    <Download size={14} /> Download
                  </button>
                  <span className="rs-tag">Built with Shift</span>
                </div>
              </div>
            </div>
          </div>

          <button className="rs-done" onClick={onDone}>
            Done for today
          </button>
        </div>
      </div>
      <style>{`
        .rs-screen { min-height: 100vh; background: ${COLORS.ink}; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .rs-container { width: 100%; max-width: 640px; padding: 20px; position: relative; z-index: 1; }
        .rs-card { background: ${COLORS.glass}; backdrop-filter: blur(20px); border-radius: 16px; padding: 32px 28px; border: 1px solid ${COLORS.glassBorder}; box-shadow: 0 8px 48px rgba(0,0,0,0.5); }
        .rs-tabs { margin-top: 12px; }
        .rs-tab-content { display: flex; flex-direction: column; gap: 24px; }
        .rs-post { background: ${COLORS.glass}; border-radius: 12px; padding: 18px 16px; border: 1px solid ${COLORS.glassBorder}; }
        .rs-post-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.05em; text-transform: uppercase; color: ${COLORS.muted}; margin-bottom: 6px; }
        .rs-post-text { font-size: 14px; line-height: 1.6; color: #FAFAFA; margin-bottom: 10px; }
        .rs-post-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .rs-post-actions button { background: none; border: 1px solid ${COLORS.line}; border-radius: 6px; padding: 4px 12px; font-size: 12px; color: ${COLORS.muted}; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: background 150ms; }
        .rs-post-actions button:hover { background: ${COLORS.accentSoft}; border-color: ${COLORS.accent}; color: #FAFAFA; }
        .rs-tag { font-size: 10px; color: ${COLORS.accent}; font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; letter-spacing: 0.05em; }
        .rs-card-preview { background: ${COLORS.ink}; border-radius: 8px; padding: 16px; margin: 8px 0 12px; border: 1px solid ${COLORS.line}; }
        .rs-card-inner { text-align: center; }
        .rs-card-headline { font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 20px; color: #FAFAFA; }
        .rs-card-subline { font-family: 'Inter', sans-serif; font-size: 14px; color: ${COLORS.muted}; margin-top: 4px; }
        .rs-card-footer { margin-top: 12px; font-size: 10px; color: ${COLORS.accent}; font-family: 'IBM Plex Mono', monospace; border-top: 1px solid ${COLORS.line}; padding-top: 10px; }
        .rs-done { width: 100%; height: 48px; border-radius: 8px; border: none; background: ${COLORS.accent}; color: #fff; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; box-shadow: 0 2px 12px rgba(124,58,237,0.3); margin-top: 24px; transition: transform 150ms; }
        .rs-done:hover { transform: scale(0.98); }
        @media (max-width: 480px) { .rs-card { padding: 24px 16px; } }
      `}</style>
    </div>
  );
}
