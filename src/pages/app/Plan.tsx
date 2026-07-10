import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, ChevronDown, Map, Maximize2, Minimize2 } from 'lucide-react';
import { GlassCard, Pill } from '../../components/app/ui';
import { useAppStore } from '../../stores/useAppStore';
import type { PlannerMessage } from '../../stores/useAppStore';
import { generateRoadmap } from '../../lib/generateRoadmap';
import { extractUnderstanding, applyClarification, getClarificationQuestions, CLARIFICATION_BANK } from '../../lib/understanding';
import type { Understanding, ClarificationQuestion } from '../../lib/understanding';
import { generateJourney } from '../../lib/journey';
import type { Journey } from '../../lib/journey';
import { plannerReply } from '../../lib/plannerEngine';
import { goalProgress, findTask, type Attachment } from '../../components/plan/shared';
import ThinkingComposer from '../../components/plan/ThinkingComposer';
import { LiveUnderstandingPanel, PersistentUnderstandingPanel } from '../../components/plan/UnderstandingPanel';
import AnalyzingTransition from '../../components/plan/AnalyzingTransition';
import UnderstandingReview from '../../components/plan/UnderstandingReview';
import ClarificationFlow from '../../components/plan/ClarificationFlow';
import JourneyCanvas from '../../components/plan/JourneyCanvas';
import JourneyAccordion from '../../components/plan/JourneyAccordion';
import ThinkingLog from '../../components/plan/ThinkingLog';
import PlanSwitcher from '../../components/plan/PlanSwitcher';

type ComposePhase = 'compose' | 'analyzing' | 'review' | 'clarify' | 'generating';

export default function Plan() {
  const allGoals = useAppStore((s) => s.goals);
  const goals = useMemo(() => allGoals.filter((g) => !g.archived), [allGoals]);
  const activeGoalId = useAppStore((s) => s.activeGoalId);
  const setActiveGoal = useAppStore((s) => s.setActiveGoal);
  const createGoal = useAppStore((s) => s.createGoal);
  const deleteGoal = useAppStore((s) => s.deleteGoal);
  const updateGoalJourney = useAppStore((s) => s.updateGoalJourney);
  const appendPlannerMessage = useAppStore((s) => s.appendPlannerMessage);
  const logProgressFromChat = useAppStore((s) => s.logProgressFromChat);
  const streak = useAppStore((s) => s.streak());

  const [viewGoalId, setViewGoalId] = useState<string | null>(activeGoalId ?? goals[0]?.id ?? null);
  const [isComposing, setIsComposing] = useState(goals.length === 0);
  const [phase, setPhase] = useState<ComposePhase>('compose');

  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const liveUnderstanding = useMemo(() => extractUnderstanding(text), [text]);

  const [reviewUnderstanding, setReviewUnderstanding] = useState<Understanding | null>(null);
  const understandingRef = useRef<Understanding | null>(null);
  const [clarificationQueue, setClarificationQueue] = useState<ClarificationQuestion[]>([]);
  const [editingField, setEditingField] = useState<ClarificationQuestion['key'] | null>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [mobileJourneyOpen, setMobileJourneyOpen] = useState(false);
  const [isJourneyExpanded, setIsJourneyExpanded] = useState(false);

  useEffect(() => {
    if (!isJourneyExpanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsJourneyExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isJourneyExpanded]);

  const viewGoal = goals.find((g) => g.id === viewGoalId) ?? null;

  function updateUnderstanding(updater: (u: Understanding) => Understanding) {
    setReviewUnderstanding((u) => {
      if (!u) return u;
      const next = updater(u);
      understandingRef.current = next;
      return next;
    });
  }

  function startNewGoal() {
    setIsComposing(true);
    setPhase('compose');
    setText('');
    setAttachments([]);
    setReviewUnderstanding(null);
    understandingRef.current = null;
    setClarificationQueue([]);
    setEditingField(null);
    setViewGoalId(null);
    setSelectedNodeId(null);
  }

  function switchToGoal(id: string) {
    setIsComposing(false);
    setViewGoalId(id);
    setActiveGoal(id);
    setSelectedNodeId(null);
  }

  function handleDeleteGoal(id: string) {
    deleteGoal(id);
    if (viewGoalId === id) {
      const remaining = goals.filter((g) => g.id !== id);
      if (remaining.length > 0) {
        switchToGoal(remaining[0].id);
      } else {
        startNewGoal();
      }
    }
  }

  function handleUpdateJourney(goalId: string, journey: Journey) {
    updateGoalJourney(goalId, journey);
  }

  function handleAnalyze() {
    setPhase('analyzing');
  }

  function handleAnalyzingDone() {
    const snapshot = extractUnderstanding(text);
    understandingRef.current = snapshot;
    setReviewUnderstanding(snapshot);
    setPhase('review');
  }

  function handleReviewContinue() {
    const u = understandingRef.current!;
    const missing = getClarificationQuestions(u);
    if (missing.length === 0) {
      generateGoal(u);
    } else {
      setClarificationQueue(missing);
      setPhase('clarify');
    }
  }

  function handleClarificationAnswer(key: ClarificationQuestion['key'], answer: string) {
    updateUnderstanding((u) => applyClarification(u, key, answer));
  }

  function handleClarificationDone() {
    generateGoal(understandingRef.current!);
  }

  function handleReviewEditAnswer(key: ClarificationQuestion['key'], answer: string) {
    updateUnderstanding((u) => applyClarification(u, key, answer));
    setEditingField(null);
  }

  function generateGoal(u: Understanding) {
    setPhase('generating');
    setTimeout(() => {
      const goalTitle = u.goal.value || text.slice(0, 140) || 'New goal';
      const roadmapAnswers = ['', u.timePerDayMinutes ? `${u.timePerDayMinutes} minutes` : '', text, u.timeline.value ?? ''];
      const roadmap = generateRoadmap(goalTitle, roadmapAnswers);
      const journey = generateJourney(goalTitle, u, roadmap);
      const now = Date.now();
      const transcript: PlannerMessage[] = [
        { id: `pm_${now}_a`, date: now, from: 'user', text: text || goalTitle },
        {
          id: `pm_${now}_b`,
          date: now + 1,
          from: 'ai',
          text: `Your Journey for "${goalTitle}" is ready \u2014 ${roadmap.milestones.length} milestones, starting with "${roadmap.milestones[0].title}". First task: "${roadmap.milestones[0].tasks[0].title}".`,
        },
      ];
      const newId = createGoal(goalTitle, roadmap, transcript, u, journey);
      setIsComposing(false);
      setPhase('compose');
      setViewGoalId(newId);
      setActiveGoal(newId);
    }, 900);
  }

  function handleSend(value: string) {
    if (!viewGoal) return;
    appendPlannerMessage(viewGoal.id, { from: 'user', text: value });
    setActiveGoal(viewGoal.id);
    setIsReplying(true);
    setTimeout(() => {
      const currentMilestone = viewGoal.roadmap.milestones.find((m) => m.status === 'current') ?? null;
      const todayTask = currentMilestone?.tasks.find((t) => !t.done) ?? null;
      const reply = plannerReply(value, { goal: viewGoal, currentMilestone, todayTask, streak });
      appendPlannerMessage(viewGoal.id, { from: 'ai', text: reply.text, actionTaskId: reply.offerCompleteTaskId });
      setIsReplying(false);
    }, 650);
  }

  function handleMarkDone(taskId: string) {
    if (!viewGoal) return;
    const found = findTask(viewGoal, taskId);
    if (!found) return;
    logProgressFromChat(viewGoal.id, {
      taskTitle: found.task.title,
      rawText: 'Marked done from Plan.',
      aiSummary: `Marked "${found.task.title}" done and advanced the Journey.`,
    });
    appendPlannerMessage(viewGoal.id, { from: 'ai', text: `Done \u2014 "${found.task.title}" is marked complete and your Journey moved forward.` });
  }

  return (
    <div className="w-full flex flex-col">
      {/* Header + plan switcher, shared by mobile and desktop */}
      <div className="px-5 sm:px-8 pt-6 pb-4 flex flex-col gap-3">
        <Pill tone="accent" className="w-fit"><Bot size={12} /> Plan</Pill>
        <PlanSwitcher goals={goals} activeId={viewGoalId} isComposing={isComposing} onSelect={switchToGoal} onNew={startNewGoal} onDelete={handleDeleteGoal} />
      </div>

      {/* ---------------- Desktop / tablet ---------------- */}
      <div className="hidden md:flex flex-col px-5 sm:px-8 pb-8 gap-6">
        {/* Journey \u2014 the centerpiece, full width, expandable */}
        <div className="shrink-0 flex flex-col rounded-3xl glass-strong overflow-hidden" style={{ height: 460, boxShadow: 'var(--shadow-lift)' }}>
          <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ borderBottom: '1px solid var(--line)' }}>
            <div className="flex items-center gap-2 min-w-0">
              <Map size={14} color="var(--text-muted)" className="shrink-0" />
              <span className="text-[13px] font-medium truncate" style={{ color: 'var(--text)' }}>
                {viewGoal ? `${viewGoal.title} \u2014 Journey` : 'Journey'}
              </span>
            </div>
            {viewGoal?.journey && (
              <button
                onClick={() => setIsJourneyExpanded(true)}
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Expand Journey"
              >
                <Maximize2 size={13} />
              </button>
            )}
          </div>
          <div className="flex-1 relative min-h-0">
            {viewGoal?.journey ? (
              <JourneyCanvas goal={viewGoal} journey={viewGoal.journey} selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} onUpdateJourney={(j) => handleUpdateJourney(viewGoal.id, j)} />
            ) : (
              <CenterPlaceholder isComposing={isComposing} />
            )}
          </div>
        </div>

        {/* Thinking (left) + Understanding (right), below the Journey */}
        <div className="flex gap-6" style={{ height: 560 }}>
          <div className="w-[420px] shrink-0 h-full flex flex-col">
            <GlassCard className="flex-1 min-h-0 flex flex-col p-7 overflow-y-auto">
              {isComposing ? (
                <ComposeFlow
                  phase={phase}
                  text={text}
                  setText={setText}
                  attachments={attachments}
                  setAttachments={setAttachments}
                  onAnalyze={handleAnalyze}
                  onAnalyzingDone={handleAnalyzingDone}
                  reviewUnderstanding={reviewUnderstanding}
                  editingField={editingField}
                  setEditingField={setEditingField}
                  onReviewEditAnswer={handleReviewEditAnswer}
                  onReviewContinue={handleReviewContinue}
                  clarificationQueue={clarificationQueue}
                  onClarificationAnswer={handleClarificationAnswer}
                  onClarificationDone={handleClarificationDone}
                />
              ) : viewGoal ? (
                <ThinkingLog goal={viewGoal} onSend={handleSend} onMarkDone={handleMarkDone} isReplying={isReplying} />
              ) : null}
            </GlassCard>
          </div>

          <div className="flex-1 h-full flex flex-col">
            <GlassCard className="flex-1 min-h-0 overflow-y-auto p-6">
              {isComposing ? (
                <LiveUnderstandingPanel understanding={liveUnderstanding} hasText={text.trim().length > 0} />
              ) : viewGoal ? (
                <PersistentUnderstandingPanel goal={viewGoal} streak={streak} />
              ) : null}
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Expanded Journey \u2014 near-fullscreen overlay */}
      <AnimatePresence>
        {isJourneyExpanded && viewGoal?.journey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-8"
            style={{ background: 'rgba(5,5,7,0.72)' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsJourneyExpanded(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full max-w-[1600px] rounded-3xl glass-strong overflow-hidden flex flex-col"
              style={{ boxShadow: 'var(--shadow-lift)' }}
            >
              <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: '1px solid var(--line)' }}>
                <span className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>{viewGoal.title} &mdash; Journey</span>
                <button
                  onClick={() => setIsJourneyExpanded(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="Collapse Journey"
                >
                  <Minimize2 size={14} />
                </button>
              </div>
              <div className="flex-1 relative min-h-0">
                <JourneyCanvas goal={viewGoal} journey={viewGoal.journey} selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} onUpdateJourney={(j) => handleUpdateJourney(viewGoal.id, j)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- Mobile: simplified, text-first flow ---------------- */}
      <div className="md:hidden flex-1 px-5 pb-8 flex flex-col gap-5 overflow-y-auto">
        {isComposing ? (
          <>
            <GlassCard className="p-6">
              <ComposeFlow
                phase={phase}
                text={text}
                setText={setText}
                attachments={attachments}
                setAttachments={setAttachments}
                onAnalyze={handleAnalyze}
                onAnalyzingDone={handleAnalyzingDone}
                reviewUnderstanding={reviewUnderstanding}
                editingField={editingField}
                setEditingField={setEditingField}
                onReviewEditAnswer={handleReviewEditAnswer}
                onReviewContinue={handleReviewContinue}
                clarificationQueue={clarificationQueue}
                onClarificationAnswer={handleClarificationAnswer}
                onClarificationDone={handleClarificationDone}
              />
            </GlassCard>
            {phase === 'compose' && text.trim().length > 0 && (
              <GlassCard className="p-5">
                <LiveUnderstandingPanel understanding={liveUnderstanding} hasText={true} />
              </GlassCard>
            )}
          </>
        ) : viewGoal ? (
          <>
            <GlassCard className="p-0 overflow-hidden">
              <button onClick={() => setMobileJourneyOpen((o) => !o)} className="w-full flex items-center justify-between px-5 py-3.5" style={{ borderBottom: mobileJourneyOpen ? '1px solid var(--line)' : 'none' }}>
                <span className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>Journey &middot; {goalProgress(viewGoal)}% complete</span>
                <ChevronDown size={16} color="var(--text-faint)" style={{ transform: mobileJourneyOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {mobileJourneyOpen && viewGoal.journey && (
                <div className="px-5 pb-5 pt-1">
                  <JourneyAccordion goal={viewGoal} journey={viewGoal.journey} />
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-5">
              <PersistentUnderstandingPanel goal={viewGoal} streak={streak} />
            </GlassCard>

            <GlassCard className="flex-1 p-5 min-h-[360px] flex flex-col">
              <ThinkingLog goal={viewGoal} onSend={handleSend} onMarkDone={handleMarkDone} isReplying={isReplying} />
            </GlassCard>
          </>
        ) : null}
      </div>
    </div>
  );
}

function CenterPlaceholder({ isComposing }: { isComposing: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center px-8 text-center">
      <div className="max-w-[280px]">
        <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--glass)' }}>
          <Bot size={20} color="var(--text-faint)" />
        </div>
        <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--text-faint)' }}>
          {isComposing ? 'Your Journey takes shape here once Plan understands enough to build it.' : 'Select or start a goal to see its Journey.'}
        </p>
      </div>
    </div>
  );
}

/** The left-panel state machine for creating a new goal: compose \u2192 analyzing \u2192 review \u2192 clarify \u2192 generating. Shared verbatim between the desktop rail and the mobile stacked layout. */
function ComposeFlow({
  phase,
  text,
  setText,
  attachments,
  setAttachments,
  onAnalyze,
  onAnalyzingDone,
  reviewUnderstanding,
  editingField,
  setEditingField,
  onReviewEditAnswer,
  onReviewContinue,
  clarificationQueue,
  onClarificationAnswer,
  onClarificationDone,
}: {
  phase: ComposePhase;
  text: string;
  setText: (v: string) => void;
  attachments: Attachment[];
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
  onAnalyze: () => void;
  onAnalyzingDone: () => void;
  reviewUnderstanding: Understanding | null;
  editingField: ClarificationQuestion['key'] | null;
  setEditingField: (k: ClarificationQuestion['key'] | null) => void;
  onReviewEditAnswer: (key: ClarificationQuestion['key'], answer: string) => void;
  onReviewContinue: () => void;
  clarificationQueue: ClarificationQuestion[];
  onClarificationAnswer: (key: ClarificationQuestion['key'], answer: string) => void;
  onClarificationDone: () => void;
}) {
  if (phase === 'analyzing') return <AnalyzingTransition onDone={onAnalyzingDone} />;

  if (phase === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16">
        <div className="w-9 h-9 rounded-full mb-4" style={{ border: '2px solid var(--line)', borderTopColor: 'var(--violet)', animation: 'spin 1s linear infinite' }} />
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Building your Journey&hellip;</p>
      </div>
    );
  }

  if (phase === 'review' && reviewUnderstanding) {
    if (editingField) {
      return (
        <ClarificationFlow
          questions={[{ key: editingField, question: CLARIFICATION_BANK[editingField] }]}
          onAnswer={onReviewEditAnswer}
          onDone={() => setEditingField(null)}
        />
      );
    }
    return <UnderstandingReview understanding={reviewUnderstanding} onEdit={setEditingField} onContinue={onReviewContinue} />;
  }

  if (phase === 'clarify') {
    return <ClarificationFlow questions={clarificationQueue} onAnswer={onClarificationAnswer} onDone={onClarificationDone} />;
  }

  return (
    <ThinkingComposer
      value={text}
      onChange={setText}
      attachments={attachments}
      onAddAttachment={(a) => setAttachments((prev) => [...prev, a])}
      onRemoveAttachment={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
      onAnalyze={onAnalyze}
      autoFocus
    />
  );
}
