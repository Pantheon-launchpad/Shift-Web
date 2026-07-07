import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Check, ChevronDown, Plus, Send, Sparkles, User } from 'lucide-react';
import { GlassCard, Pill } from '../../components/app/ui';
import { useAppStore } from '../../stores/useAppStore';
import type { Goal, Milestone, Task } from '../../stores/useAppStore';
import { generateRoadmap } from '../../lib/generateRoadmap';
import { INTAKE_STEPS, intakeAck, plannerReply } from '../../lib/plannerEngine';

interface ChatMsg {
  id: string;
  from: 'ai' | 'user';
  text: string;
  actionTaskId?: string;
}

function findTask(goal: Goal, taskId: string): { task: Task; milestone: Milestone } | null {
  for (const milestone of goal.roadmap.milestones) {
    const task = milestone.tasks.find((t) => t.id === taskId);
    if (task) return { task, milestone };
  }
  return null;
}

function goalProgress(goal: Goal): number {
  const total = goal.roadmap.milestones.reduce((n, m) => n + m.tasks.length, 0);
  const done = goal.roadmap.milestones.reduce((n, m) => n + m.tasks.filter((t) => t.done).length, 0);
  return total ? Math.round((done / total) * 100) : 0;
}

function RoadmapSummary({ goal }: { goal: Goal }) {
  return (
    <div className="flex flex-col gap-2.5">
      {goal.roadmap.milestones.map((m) => (
        <div key={m.id} className="rounded-xl p-3" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: m.status === 'done' ? 'var(--gold)' : m.status === 'current' ? 'var(--violet)' : 'var(--line)',
              }}
            >
              {m.status === 'done' && <Check size={10} color="#0a0b0d" />}
            </span>
            <span className="text-[12.5px] font-medium truncate" style={{ color: m.status === 'upcoming' ? 'var(--text-muted)' : 'var(--text)' }}>
              {m.title}
            </span>
          </div>
          <div className="flex flex-col gap-1 pl-6">
            {m.tasks.map((t) => (
              <span key={t.id} className="text-[11.5px] truncate" style={{ color: t.done ? 'var(--text-faint)' : 'var(--text-muted)', textDecoration: t.done ? 'line-through' : 'none' }}>
                {t.title}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AIPlanner() {
  const goals = useAppStore((s) => s.goals.filter((g) => !g.archived));
  const activeGoalId = useAppStore((s) => s.activeGoalId);
  const setActiveGoal = useAppStore((s) => s.setActiveGoal);
  const createGoal = useAppStore((s) => s.createGoal);
  const appendPlannerMessage = useAppStore((s) => s.appendPlannerMessage);
  const logProgressFromChat = useAppStore((s) => s.logProgressFromChat);
  const streak = useAppStore((s) => s.streak());

  const [viewGoalId, setViewGoalId] = useState<string | null>(activeGoalId ?? goals[0]?.id ?? null);
  const [isIntaking, setIsIntaking] = useState(goals.length === 0);
  const [stepIndex, setStepIndex] = useState(0);
  const [intakeGoalTitle, setIntakeGoalTitle] = useState('');
  const [intakeAnswers, setIntakeAnswers] = useState<string[]>([]);
  const [intakeMessages, setIntakeMessages] = useState<ChatMsg[]>([
    { id: 'intake-0', from: 'ai', text: INTAKE_STEPS[0].prompt({ goal: '', answers: [] }) },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [input, setInput] = useState('');
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const viewGoal = goals.find((g) => g.id === viewGoalId) ?? null;
  const displayMessages: ChatMsg[] = isIntaking ? intakeMessages : (viewGoal?.plannerLog ?? []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [displayMessages.length, isGenerating]);

  function startNewGoalChat() {
    setIsIntaking(true);
    setStepIndex(0);
    setIntakeGoalTitle('');
    setIntakeAnswers([]);
    setIntakeMessages([{ id: `intake-${Date.now()}`, from: 'ai', text: INTAKE_STEPS[0].prompt({ goal: '', answers: [] }) }]);
    setViewGoalId(null);
  }

  function switchToGoal(id: string) {
    setIsIntaking(false);
    setViewGoalId(id);
    setActiveGoal(id);
  }

  const handleIntakeSubmit = useCallback(() => {
    const answer = input.trim();
    if (!answer || isGenerating) return;
    setInput('');
    const step = INTAKE_STEPS[stepIndex];
    const userMsg: ChatMsg = { id: `u-${Date.now()}`, from: 'user', text: answer };

    const goalTitle = step.key === 'goal' ? answer : intakeGoalTitle;
    const answers = step.key === 'goal' ? intakeAnswers : [...intakeAnswers, answer];
    if (step.key === 'goal') setIntakeGoalTitle(answer);
    else setIntakeAnswers(answers);

    const ackText = intakeAck(step.key, answer);
    const ackMsg: ChatMsg | null = ackText ? { id: `a-${Date.now()}`, from: 'ai', text: ackText } : null;
    const isLastStep = stepIndex === INTAKE_STEPS.length - 1;

    if (isLastStep) {
      const transcriptSoFar = [...intakeMessages, userMsg, ...(ackMsg ? [ackMsg] : [])];
      setIntakeMessages(transcriptSoFar);
      setIsGenerating(true);
      setTimeout(() => {
        const roadmap = generateRoadmap(goalTitle, answers);
        const firstMilestone = roadmap.milestones[0];
        const wrapUp = `Your roadmap for "${goalTitle}" is ready \u2014 ${roadmap.milestones.length} milestones, starting with "${firstMilestone.title}". First task: "${firstMilestone.tasks[0].title}". Ask me what's next, how you're doing, or just tell me when you've finished today's task and I'll mark it off.`;
        const fullTranscript = [...transcriptSoFar, { id: `w-${Date.now()}`, from: 'ai' as const, text: wrapUp }];
        const newId = createGoal(
          goalTitle,
          roadmap,
          fullTranscript.map((m) => ({ id: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, date: Date.now(), from: m.from, text: m.text }))
        );
        setIsGenerating(false);
        setIsIntaking(false);
        setViewGoalId(newId);
        setActiveGoal(newId);
      }, 1500);
      return;
    }

    const nextQ: ChatMsg = { id: `q-${Date.now()}`, from: 'ai', text: INTAKE_STEPS[stepIndex + 1].prompt({ goal: goalTitle, answers }) };
    setIntakeMessages((m) => [...m, userMsg, ...(ackMsg ? [ackMsg] : []), nextQ]);
    setStepIndex((i) => i + 1);
  }, [input, isGenerating, stepIndex, intakeGoalTitle, intakeAnswers, intakeMessages, createGoal, setActiveGoal]);

  const handleChatSubmit = useCallback(() => {
    const text = input.trim();
    if (!text || !viewGoal) return;
    setInput('');
    appendPlannerMessage(viewGoal.id, { from: 'user', text });
    setActiveGoal(viewGoal.id);

    setTimeout(() => {
      const currentMilestone = viewGoal.roadmap.milestones.find((m) => m.status === 'current') ?? null;
      const todayTask = currentMilestone?.tasks.find((t) => !t.done) ?? null;
      const reply = plannerReply(text, { goal: viewGoal, currentMilestone, todayTask, streak });
      appendPlannerMessage(viewGoal.id, { from: 'ai', text: reply.text, actionTaskId: reply.offerCompleteTaskId });
    }, 650);
  }, [input, viewGoal, appendPlannerMessage, setActiveGoal, streak]);

  const handleMarkDone = useCallback(
    (taskId: string) => {
      if (!viewGoal) return;
      const found = findTask(viewGoal, taskId);
      if (!found) return;
      logProgressFromChat(viewGoal.id, {
        taskTitle: found.task.title,
        rawText: 'Marked done from the AI Planner chat.',
        aiSummary: `Marked "${found.task.title}" done via chat and advanced the roadmap.`,
      });
      appendPlannerMessage(viewGoal.id, { from: 'ai', text: `Done \u2014 "${found.task.title}" is marked complete and your roadmap moved forward. What's next on your mind?` });
    },
    [viewGoal, logProgressFromChat, appendPlannerMessage]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isIntaking) handleIntakeSubmit();
    else handleChatSubmit();
  };

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <Pill tone="accent" className="mb-3"><Sparkles size={12} /> AI Planner</Pill>
          <h1 className="font-display font-semibold text-2xl sm:text-[28px] tracking-tight" style={{ color: 'var(--text)' }}>
            {isIntaking ? 'Let\u2019s plan something' : viewGoal?.title}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {isIntaking
              ? 'Talk it through and I\u2019ll turn it into a roadmap.'
              : 'Chat here anytime \u2014 ask what\u2019s next, check your progress, or tell me when a task is done.'}
          </p>
        </div>
        <button onClick={startNewGoalChat} className="btn btn-primary shrink-0">
          <Plus size={15} /> New goal
        </button>
      </div>

      {goals.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {goals.map((g) => (
            <button
              key={g.id}
              onClick={() => switchToGoal(g.id)}
              className="pill shrink-0 px-3.5 py-1.5 text-xs flex items-center gap-2 transition-colors"
              style={
                !isIntaking && viewGoalId === g.id
                  ? { color: 'var(--violet)', borderColor: 'var(--violet)', background: 'rgba(131,53,253,0.14)' }
                  : { color: 'var(--text-muted)' }
              }
            >
              {g.completed && <Check size={12} color="var(--gold)" />}
              {g.title} &middot; {goalProgress(g)}%
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <GlassCard className="flex-1 w-full flex flex-col p-0 overflow-hidden" style={{ minHeight: 520 }}>
          {!isIntaking && viewGoal && (
            <button
              onClick={() => setMobileSummaryOpen((o) => !o)}
              className="lg:hidden flex items-center justify-between px-5 py-3 text-sm"
              style={{ borderBottom: '1px solid var(--line)', color: 'var(--text)' }}
            >
              <span>Roadmap &middot; {goalProgress(viewGoal)}% complete</span>
              <motion.span animate={{ rotate: mobileSummaryOpen ? 180 : 0 }}><ChevronDown size={16} /></motion.span>
            </button>
          )}
          {!isIntaking && viewGoal && mobileSummaryOpen && (
            <div className="lg:hidden px-5 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
              <RoadmapSummary goal={viewGoal} />
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4" style={{ maxHeight: 560 }}>
            {displayMessages.map((m) => (
              <MessageBubble key={m.id} message={m} goal={viewGoal} onMarkDone={handleMarkDone} />
            ))}
            {isGenerating && (
              <div className="flex items-center gap-2 self-start">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(131,53,253,0.14)' }}>
                  <Bot size={14} color="var(--violet)" />
                </div>
                <div className="rounded-2xl px-4 py-2.5 flex gap-1" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: 'var(--text-muted)' }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2.5 p-4" style={{ borderTop: '1px solid var(--line)' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isIntaking ? 'Type your answer\u2026' : 'Ask about your roadmap, or say what you finished\u2026'}
              disabled={isGenerating}
              className="flex-1 h-11 rounded-xl px-4 text-[14px] outline-none"
              style={{ background: 'var(--glass)', border: '1.5px solid var(--line)', color: 'var(--text)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--violet)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
            />
            <button type="submit" disabled={isGenerating || !input.trim()} className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 btn-primary disabled:opacity-50">
              <Send size={16} />
            </button>
          </form>
        </GlassCard>

        {!isIntaking && viewGoal && (
          <div className="hidden lg:block w-[300px] shrink-0 sticky top-24">
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Roadmap</span>
                <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{goalProgress(viewGoal)}%</span>
              </div>
              <RoadmapSummary goal={viewGoal} />
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ message, goal, onMarkDone }: { message: ChatMsg; goal: Goal | null; onMarkDone: (taskId: string) => void }) {
  const isUser = message.from === 'user';
  const found = message.actionTaskId && goal ? findTask(goal, message.actionTaskId) : null;
  const showAction = found && !found.task.done;

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{ background: isUser ? 'var(--glass)' : 'rgba(131,53,253,0.14)', border: isUser ? '1px solid var(--glass-border)' : 'none' }}
      >
        {isUser ? <User size={13} color="var(--text-muted)" /> : <Bot size={14} color="var(--violet)" />}
      </div>
      <div className={`flex flex-col gap-2 max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className="rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-line"
          style={
            isUser
              ? { background: 'var(--violet)', color: 'white', borderBottomRightRadius: 4 }
              : { background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text)', borderBottomLeftRadius: 4 }
          }
        >
          {message.text}
        </div>
        {showAction && (
          <button onClick={() => onMarkDone(message.actionTaskId!)} className="btn btn-ghost text-xs py-1.5 px-3 gap-1.5">
            <Check size={13} /> Mark &ldquo;{found!.task.title}&rdquo; done
          </button>
        )}
      </div>
    </div>
  );
}
