import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Globe, Sparkles, Target, Zap } from 'lucide-react';
import Background from '../../components/app/Background';
import { FocusedScreen, GlassCard, Pill, PrimaryButton, ProgressBar } from '../../components/app/ui';
import { useAppStore } from '../../stores/useAppStore';
import { generateRoadmap } from '../../lib/generateRoadmap';

const QUESTIONS = [
  { question: 'What does done look like: a live product, a first user, or a first dollar?', icon: Target, hint: 'Be specific \u2014 this becomes your finish line' },
  { question: 'How much time can you give this each day, honestly?', icon: Clock, hint: 'e.g. "30 minutes" or "1 hour" \u2014 it shapes the size of your tasks' },
  { question: 'What already exists, if anything?', icon: Globe, hint: 'A rough mockup? Code? Research? Or nothing yet \u2014 both are fine' },
  { question: 'Any hard deadline, like a submission date?', icon: Zap, hint: 'Deadlines create focus' },
];

const EXAMPLES = ['Launch a SaaS product', 'Build a mobile app', 'Write a book'];

export default function GoalCreation() {
  const navigate = useNavigate();
  const createGoal = useAppStore((s) => s.createGoal);
  const [step, setStep] = useState<'input' | 'interview' | 'loading'>('input');
  const [goal, setGoal] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');

  const handleGoalSubmit = () => {
    if (!goal.trim()) return;
    setStep('interview');
  };

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) return;
    const next = [...answers, currentAnswer];
    setAnswers(next);
    setCurrentAnswer('');
    if (next.length < QUESTIONS.length) return;

    setStep('loading');
    setTimeout(() => {
      createGoal(goal, generateRoadmap(goal, next));
      navigate('/app');
    }, 2200);
  };

  const handleBack = () => {
    if (answers.length === 0) {
      setStep('input');
      return;
    }
    const previousAnswer = answers[answers.length - 1];
    setAnswers(answers.slice(0, -1));
    setCurrentAnswer(previousAnswer);
  };

  if (step === 'loading') {
    return (
      <FocusedScreen maxWidth={480}>
        <Background />
        <GlassCard className="text-center">
          <div className="w-10 h-10 mx-auto rounded-full animate-spin" style={{ border: '3px solid var(--line)', borderTopColor: 'var(--violet)' }} />
          <h2 className="font-display font-semibold text-[22px] mt-6" style={{ color: 'var(--text)' }}>Building your roadmap</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{goal} &rarr; turning into a plan&hellip;</p>
          <div className="flex flex-col gap-1.5 mt-5 font-mono text-[11px]" style={{ color: 'var(--text-faint)' }}>
            <span>Reading your goal and answers</span>
            <span>Matching a roadmap template</span>
            <span>Sizing tasks to your time budget</span>
          </div>
        </GlassCard>
      </FocusedScreen>
    );
  }

  if (step === 'interview') {
    const index = answers.length;
    const q = QUESTIONS[index];
    const Icon = q.icon;
    return (
      <FocusedScreen maxWidth={520}>
        <Background />
        <GlassCard>
          <div className="flex items-center gap-3 mb-3">
            <button onClick={handleBack} aria-label="Back" className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
              <ArrowLeft size={15} />
            </button>
            <ProgressBar value={(index / QUESTIONS.length) * 100} />
          </div>
          <p className="font-mono text-[11px] mb-6" style={{ color: 'var(--text-muted)' }}>Question {index + 1} of {QUESTIONS.length}</p>

          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(131,53,253,0.14)' }}>
            <Icon size={22} color="var(--violet)" />
          </div>
          <h2 className="font-display font-semibold text-xl leading-snug" style={{ color: 'var(--text)' }}>{q.question}</h2>
          <p className="text-[13px] mt-1.5 mb-5" style={{ color: 'var(--text-muted)' }}>{q.hint}</p>

          <form className="flex gap-2.5" onSubmit={(e) => { e.preventDefault(); handleAnswerSubmit(); }}>
            <input
              autoFocus
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="flex-1 h-12 rounded-xl px-4 text-[14px] outline-none"
              style={{ background: 'var(--glass)', border: '1.5px solid var(--line)', color: 'var(--text)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--violet)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
            />
            <button type="submit" className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 btn-primary">
              <ArrowRight size={18} />
            </button>
          </form>

          {answers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {answers.map((a, i) => (
                <span key={i} className="pill inline-flex items-center gap-1.5 px-3 py-1 text-xs" style={{ color: 'var(--text)' }}>
                  <CheckCircle2 size={12} color="#4ADE80" /> {a}
                </span>
              ))}
            </div>
          )}
        </GlassCard>
      </FocusedScreen>
    );
  }

  return (
    <FocusedScreen maxWidth={520}>
      <Background />
      <GlassCard>
        <div className="text-center mb-7">
          <Pill tone="accent" className="mb-4"><Sparkles size={12} /> Guided planning</Pill>
          <h1 className="font-display font-semibold text-[26px] sm:text-[30px] tracking-tight" style={{ color: 'var(--text)' }}>What do you want to achieve?</h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>One goal. Shift builds the rest.</p>
        </div>

        <form className="flex gap-2.5 mb-2" onSubmit={(e) => { e.preventDefault(); handleGoalSubmit(); }}>
          <input
            autoFocus
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., Launch my hackathon startup"
            className="flex-1 h-13 rounded-xl px-4 text-[15px] outline-none"
            style={{ height: 52, background: 'var(--glass)', border: '1.5px solid var(--line)', color: 'var(--text)' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--violet)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
          />
          <PrimaryButton type="submit" disabled={!goal.trim()} style={{ width: 52, height: 52, padding: 0 }}>
            <ArrowRight size={18} />
          </PrimaryButton>
        </form>
        {!goal.trim() && <p className="text-xs text-center mb-6" style={{ color: 'var(--text-faint)' }}>Press Enter or click &rarr; to start</p>}

        <div className="text-center mt-6">
          <p className="text-xs mb-2.5" style={{ color: 'var(--text-muted)' }}>Try these examples:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => setGoal(ex)} className="pill px-4 py-1.5 text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>
                {ex}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>
    </FocusedScreen>
  );
}
