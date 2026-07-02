import React, { useState } from "react";
import { ArrowRight } from "lucide-react";

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
  <div className="gi-orbs">
    <div className="orb orb-1" />
    <div className="orb orb-2" />
    <div className="orb orb-3" />
    <style>{`
      .gi-orbs { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
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
  <div className="gi-grid">
    <style>{`
      .gi-grid { position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.03; background-image: linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px); background-size: 48px 48px; }
    `}</style>
  </div>
);

// -------- Interview Questions --------
const interviewQuestions = [
  "What does done look like: a live product, a first user, or a first dollar?",
  "How much time can you give this each day, honestly?",
  "What already exists, if anything?",
  "Any hard deadline, like a submission time?",
];

// -------- Component Props --------
interface GoalIntakeProps {
  onComplete: (goal: string, roadmap: any) => void;
}

// -------- Main Component --------
export default function GoalIntake({ onComplete }: GoalIntakeProps) {
  const [step, setStep] = useState<"input" | "interview" | "loading">("input");
  const [goal, setGoal] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");

  const handleGoalSubmit = () => {
    if (!goal.trim()) return;
    setStep("interview");
  };

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) return;
    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer("");
    if (newAnswers.length < interviewQuestions.length) {
      setCurrentQuestionIndex(newAnswers.length);
    } else {
      // All questions answered → loading → roadmap generated
      setStep("loading");
      setTimeout(() => {
        const roadmap = {
          milestones: [
            { id: "m1", title: "Validate idea", week: 1, status: "current" },
            { id: "m2", title: "Build MVP", week: 2, status: "upcoming" },
            { id: "m3", title: "Launch to first users", week: 3, status: "upcoming" },
          ],
          todayTask: { id: "t1", title: "Write landing page headline", milestoneId: "m1" },
        };
        onComplete(goal, roadmap);
      }, 2500);
    }
  };

  // -------- Interview Step --------
  if (step === "interview") {
    const question = interviewQuestions[currentQuestionIndex];
    return (
      <div className="gi-screen">
        <PurpleBlurCircles />
        <GridPattern />
        <div className="gi-container">
          <div className="gi-card">
            <div className="gi-chat">
              <div className="gi-bubble ai">{question}</div>
              <div className="gi-input-row">
                <input
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Your answer..."
                  onKeyDown={(e) => e.key === "Enter" && handleAnswerSubmit()}
                  autoFocus
                />
                <button onClick={handleAnswerSubmit}>
                  <ArrowRight size={18} />
                </button>
              </div>
              <div className="gi-progress">
                {currentQuestionIndex + 1} / {interviewQuestions.length}
              </div>
            </div>
          </div>
        </div>
        <style>{`
          .gi-screen { min-height: 100vh; background: ${COLORS.ink}; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
          .gi-container { width: 100%; max-width: 560px; padding: 20px; position: relative; z-index: 1; }
          .gi-card { background: ${COLORS.glass}; backdrop-filter: blur(20px); border-radius: 16px; padding: 32px 28px; border: 1px solid ${COLORS.glassBorder}; box-shadow: 0 8px 48px rgba(0,0,0,0.5); }
          .gi-chat { display: flex; flex-direction: column; gap: 20px; }
          .gi-bubble { background: ${COLORS.accentSoft}; color: #FAFAFA; padding: 14px 18px; border-radius: 12px; font-family: 'Inter', sans-serif; font-size: 15px; line-height: 1.6; border: 1px solid ${COLORS.glassBorder}; }
          .gi-bubble.ai { background: ${COLORS.glass}; border-left: 3px solid ${COLORS.accent}; }
          .gi-input-row { display: flex; gap: 10px; }
          .gi-input-row input { flex: 1; height: 44px; border-radius: 8px; border: 1.5px solid ${COLORS.line}; background: ${COLORS.glass}; backdrop-filter: blur(10px); padding: 0 14px; font-family: 'Inter', sans-serif; font-size: 14px; color: #FAFAFA; outline: none; transition: border-color 150ms; }
          .gi-input-row input:focus { border-color: ${COLORS.accent}; }
          .gi-input-row button { width: 44px; height: 44px; border-radius: 8px; border: none; background: ${COLORS.accent}; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 12px rgba(124,58,237,0.3); }
          .gi-progress { text-align: right; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: ${COLORS.muted}; }
          @media (max-width: 480px) { .gi-card { padding: 24px 16px; } }
        `}</style>
      </div>
    );
  }

  // -------- Loading Step --------
  if (step === "loading") {
    return (
      <div className="gi-screen">
        <PurpleBlurCircles />
        <GridPattern />
        <div className="gi-container">
          <div className="gi-card" style={{ textAlign: "center", padding: "48px 28px" }}>
            <div className="gi-loader" />
            <p style={{ color: COLORS.muted, fontFamily: "'Inter', sans-serif", marginTop: 20 }}>
              Building your roadmap...
            </p>
          </div>
        </div>
        <style>{`
          .gi-loader { width: 40px; height: 40px; border-radius: 50%; border: 3px solid ${COLORS.line}; border-top-color: ${COLORS.accent}; animation: spin 0.8s linear infinite; margin: 0 auto; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // -------- Initial Goal Input --------
  return (
    <div className="gi-screen">
      <PurpleBlurCircles />
      <GridPattern />
      <div className="gi-container">
        <div className="gi-card">
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 24, color: "#FAFAFA", marginBottom: 8 }}>
            What do you want to achieve?
          </h1>
          <p style={{ color: COLORS.muted, marginBottom: 24, fontSize: 14 }}>
            One goal. Shift builds the rest.
          </p>
          <div className="gi-input-row">
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Launch my hackathon startup"
              onKeyDown={(e) => e.key === "Enter" && handleGoalSubmit()}
              autoFocus
            />
            <button onClick={handleGoalSubmit}>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}