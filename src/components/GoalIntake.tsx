import React, { useState } from "react";
import { ArrowRight, Sparkles, Zap, Target, Clock, Globe, CheckCircle2 } from "lucide-react";

// -------- Design Tokens --------
const COLORS = {
  ink: "#0A0A0A",
  paper: "#0D0D0D",
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
};

// -------- Background Decorations --------
const PurpleBlurCircles = () => (
  <div className="gi-orbs">
    <div className="orb orb-1" />
    <div className="orb orb-2" />
    <div className="orb orb-3" />
    <div className="orb orb-4" />
    <style>{`
      .gi-orbs { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
      .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.6; }
      .orb-1 { width: 60vw; height: 60vw; top: -20%; right: -10%; background: radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%); }
      .orb-2 { width: 40vw; height: 40vw; bottom: -15%; left: -5%; background: radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%); filter: blur(60px); }
      .orb-3 { width: 25vw; height: 25vw; top: 40%; right: 5%; background: radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%); filter: blur(50px); }
      .orb-4 { width: 15vw; height: 15vw; top: 10%; left: 20%; background: radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%); filter: blur(40px); }
      @media (max-width: 768px) {
        .orb-1 { width: 80vw; height: 80vw; top: -30%; right: -20%; }
        .orb-2 { width: 60vw; height: 60vw; bottom: -20%; }
        .orb-3 { width: 40vw; height: 40vw; }
        .orb-4 { display: none; }
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

// -------- Interview Questions with Icons --------
const interviewQuestions = [
  {
    question:
      "What does done look like: a live product, a first user, or a first dollar?",
    icon: Target,
    hint: "Be specific – this becomes your finish line",
  },
  {
    question: "How much time can you give this each day, honestly?",
    icon: Clock,
    hint: "Be realistic – consistency beats intensity",
  },
  {
    question: "What already exists, if anything?",
    icon: Globe,
    hint: "A rough mockup? Code? Research? Anything helps",
  },
  {
    question: "Any hard deadline, like a submission time?",
    icon: Zap,
    hint: "Deadlines create focus",
  },
];

// -------- Props --------
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
      setStep("loading");
      setTimeout(() => {
        const roadmap = {
          milestones: [
            { id: "m1", title: "Validate idea", week: 1, status: "current" },
            { id: "m2", title: "Build MVP", week: 2, status: "upcoming" },
            {
              id: "m3",
              title: "Launch to first users",
              week: 3,
              status: "upcoming",
            },
          ],
          todayTask: {
            id: "t1",
            title: "Write landing page headline",
            milestoneId: "m1",
          },
        };
        onComplete(goal, roadmap);
      }, 2500);
    }
  };

  // -------- Loading Step --------
  if (step === "loading") {
    return (
      <div className="gi-screen">
        <PurpleBlurCircles />
        <GridPattern />
        <div className="gi-container">
          <div
            className="gi-card"
            style={{ textAlign: "center", padding: "48px 32px" }}
          >
            <div className="gi-loader" />
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 22,
                color: "#FAFAFA",
                marginTop: 24,
                marginBottom: 8,
              }}
            >
              Building your roadmap
            </h2>
            <p style={{ color: COLORS.muted, fontSize: 14 }}>
              {goal} → turning into a plan...
            </p>
            <div className="gi-loading-phrases">
              <span>Analyzing your goal</span>
              <span>Planning milestones</span>
              <span>Picking today's task</span>
            </div>
          </div>
        </div>
        <style>{`
          .gi-screen { min-height: 100vh; background: ${COLORS.ink}; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
          .gi-container { width: 100%; max-width: 560px; padding: 20px; position: relative; z-index: 1; }
          .gi-card { background: ${COLORS.glass}; backdrop-filter: blur(20px); border-radius: 16px; padding: 32px 28px; border: 1px solid ${COLORS.glassBorder}; box-shadow: 0 8px 48px rgba(0,0,0,0.5); }
          .gi-loader { width: 48px; height: 48px; border-radius: 50%; border: 3px solid ${COLORS.line}; border-top-color: ${COLORS.accent}; animation: spin 0.8s linear infinite; margin: 0 auto; }
          @keyframes spin { to { transform: rotate(360deg); } }
          .gi-loading-phrases { margin-top: 20px; display: flex; flex-direction: column; gap: 8px; }
          .gi-loading-phrases span { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: ${COLORS.muted}; animation: pulseText 1.5s ease infinite; }
          .gi-loading-phrases span:nth-child(2) { animation-delay: 0.5s; }
          .gi-loading-phrases span:nth-child(3) { animation-delay: 1s; }
          @keyframes pulseText { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        `}</style>
      </div>
    );
  }

  // -------- Interview Step --------
  if (step === "interview") {
    const q = interviewQuestions[currentQuestionIndex];
    const Icon = q.icon;
    const progress = (currentQuestionIndex / interviewQuestions.length) * 100;

    return (
      <div className="gi-screen">
        <PurpleBlurCircles />
        <GridPattern />
        <div className="gi-container">
          <div className="gi-card">
            {/* Progress Bar */}
            <div className="interview-progress">
              <div
                className="interview-progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="interview-step">
              Question {currentQuestionIndex + 1} of {interviewQuestions.length}
            </div>

            {/* Question */}
            <div className="interview-question">
              <div className="interview-icon">
                <Icon size={24} color={COLORS.accent} />
              </div>
              <h2>{q.question}</h2>
              <p className="interview-hint">{q.hint}</p>
            </div>

            {/* Answer Input */}
            <div className="interview-input">
              <input
                type="text"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer..."
                onKeyDown={(e) => e.key === "Enter" && handleAnswerSubmit()}
                autoFocus
              />
              <button onClick={handleAnswerSubmit}>
                <ArrowRight size={20} />
              </button>
            </div>

            {/* Previous Answers */}
            {answers.length > 0 && (
              <div className="interview-answers">
                <p className="answers-label">Previous answers:</p>
                {answers.map((ans, i) => (
                  <div key={i} className="answer-chip">
                    <CheckCircle2 size={12} color={COLORS.green} />
                    <span>{ans}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <style>{`
          .gi-screen { min-height: 100vh; background: ${COLORS.ink}; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
          .gi-container { width: 100%; max-width: 560px; padding: 20px; position: relative; z-index: 1; }
          .gi-card { background: ${COLORS.glass}; backdrop-filter: blur(20px); border-radius: 16px; padding: 32px 28px; border: 1px solid ${COLORS.glassBorder}; box-shadow: 0 8px 48px rgba(0,0,0,0.5); }

          .interview-progress { width: 100%; height: 4px; background: ${COLORS.line}; border-radius: 999; margin-bottom: 12px; overflow: hidden; }
          .interview-progress-bar { height: 100%; background: ${COLORS.accent}; border-radius: 999; transition: width 0.5s ease; }
          .interview-step { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: ${COLORS.muted}; letter-spacing: 0.05em; margin-bottom: 20px; }

          .interview-question { margin-bottom: 24px; }
          .interview-icon { width: 48px; height: 48px; border-radius: 12px; background: ${COLORS.accentSoft}; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
          .interview-question h2 { font-family: 'Space Grotesk', sans-serif; font-size: 20px; color: #FAFAFA; margin: 0 0 8px 0; line-height: 1.3; }
          .interview-hint { font-size: 13px; color: ${COLORS.muted}; margin: 0; }

          .interview-input { display: flex; gap: 10px; margin-bottom: 16px; }
          .interview-input input { flex: 1; height: 48px; border-radius: 8px; border: 1.5px solid ${COLORS.line}; background: ${COLORS.glass}; backdrop-filter: blur(10px); padding: 0 16px; font-family: 'Inter', sans-serif; font-size: 14px; color: #FAFAFA; outline: none; transition: border-color 150ms; }
          .interview-input input:focus { border-color: ${COLORS.accent}; box-shadow: 0 0 0 4px ${COLORS.accentSoft}; }
          .interview-input input::placeholder { color: ${COLORS.mutedDark}; }
          .interview-input button { width: 48px; height: 48px; border-radius: 8px; border: none; background: ${COLORS.accent}; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 12px rgba(124,58,237,0.3); transition: all 0.2s ease; }
          .interview-input button:hover { box-shadow: 0 4px 24px rgba(124,58,237,0.4); transform: scale(0.96); }

          .interview-answers { margin-top: 8px; }
          .answers-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: ${COLORS.muted}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
          .answer-chip { display: inline-flex; align-items: center; gap: 6px; background: ${COLORS.glass}; border: 1px solid ${COLORS.glassBorder}; border-radius: 20px; padding: 4px 12px; margin: 0 6px 6px 0; font-size: 12px; color: #FAFAFA; }

          @media (max-width: 480px) { .gi-card { padding: 24px 16px; } .interview-question h2 { font-size: 17px; } }
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
          <div className="gi-header">
            <div className="gi-badge">
              <Sparkles size={14} color={COLORS.accent} />
              <span>AI-Powered Planning</span>
            </div>
            <h1>What do you want to achieve?</h1>
            <p>One goal. Shift builds the rest.</p>
          </div>

          <div className="gi-input-wrapper">
            <div className="gi-input-row">
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., Launch my hackathon startup"
                onKeyDown={(e) => e.key === "Enter" && handleGoalSubmit()}
                autoFocus
              />
              <button onClick={handleGoalSubmit} disabled={!goal.trim()}>
                <ArrowRight size={20} />
              </button>
            </div>
            {!goal.trim() && (
              <p className="gi-input-hint">Press Enter or click → to start</p>
            )}
          </div>

          <div className="gi-examples">
            <p>Try these examples:</p>
            <div className="gi-example-chips">
              <button onClick={() => setGoal("Launch a SaaS product")}>
                🚀 Launch a SaaS product
              </button>
              <button onClick={() => setGoal("Build a mobile app")}>
                📱 Build a mobile app
              </button>
              <button onClick={() => setGoal("Write a book")}>
                📝 Write a book
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .gi-screen { min-height: 100vh; background: ${COLORS.ink}; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .gi-container { width: 100%; max-width: 560px; padding: 20px; position: relative; z-index: 1; }
        .gi-card { background: ${COLORS.glass}; backdrop-filter: blur(20px); border-radius: 16px; padding: 40px 32px; border: 1px solid ${COLORS.glassBorder}; box-shadow: 0 8px 48px rgba(0,0,0,0.5); }

        .gi-header { text-align: center; margin-bottom: 32px; }
        .gi-badge { display: inline-flex; align-items: center; gap: 6px; background: ${COLORS.accentSoft}; border: 1px solid ${COLORS.glassBorder}; border-radius: 20px; padding: 4px 14px; margin-bottom: 16px; }
        .gi-badge span { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: ${COLORS.accent}; letter-spacing: 0.05em; text-transform: uppercase; }
        .gi-header h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: clamp(24px, 4vw, 32px); color: #FAFAFA; margin: 0 0 8px 0; letter-spacing: -0.01em; }
        .gi-header p { font-size: 14px; color: ${COLORS.muted}; margin: 0; }

        .gi-input-wrapper { margin-bottom: 24px; }
        .gi-input-row { display: flex; gap: 10px; }
        .gi-input-row input { flex: 1; height: 52px; border-radius: 8px; border: 1.5px solid ${COLORS.line}; background: ${COLORS.glass}; backdrop-filter: blur(10px); padding: 0 16px; font-family: 'Inter', sans-serif; font-size: 16px; color: #FAFAFA; outline: none; transition: border-color 150ms, box-shadow 150ms; }
        .gi-input-row input:focus { border-color: ${COLORS.accent}; box-shadow: 0 0 0 4px ${COLORS.accentSoft}; }
        .gi-input-row input::placeholder { color: ${COLORS.mutedDark}; }
        .gi-input-row button { width: 52px; height: 52px; border-radius: 8px; border: none; background: ${COLORS.accent}; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 12px rgba(124,58,237,0.3); transition: all 0.2s ease; flex-shrink: 0; }
        .gi-input-row button:hover:not(:disabled) { box-shadow: 0 4px 24px rgba(124,58,237,0.4); transform: scale(0.96); }
        .gi-input-row button:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .gi-input-hint { font-size: 12px; color: ${COLORS.mutedDark}; margin-top: 8px; text-align: center; }

        .gi-examples { text-align: center; }
        .gi-examples p { font-size: 12px; color: ${COLORS.muted}; margin-bottom: 10px; }
        .gi-example-chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
        .gi-example-chips button { background: ${COLORS.glass}; border: 1px solid ${COLORS.glassBorder}; border-radius: 20px; padding: 6px 16px; color: ${COLORS.muted}; font-size: 12px; cursor: pointer; transition: all 0.2s ease; font-family: 'Inter', sans-serif; }
        .gi-example-chips button:hover { border-color: ${COLORS.accent}; color: #FAFAFA; background: ${COLORS.accentSoft}; }

        @media (max-width: 480px) { 
          .gi-card { padding: 28px 16px; } 
          .gi-header h1 { font-size: 22px; }
          .gi-input-row input { height: 44px; font-size: 14px; }
          .gi-input-row button { width: 44px; height: 44px; }
        }
      `}</style>
    </div>
  );
}
