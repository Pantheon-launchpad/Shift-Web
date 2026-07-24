import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, ChevronDown, Map, MessageCircleMore, Maximize2, Minimize2 } from 'lucide-react';
import { GlassCard, Pill } from '../../components/app/ui';
import { useAppStore } from '../../stores/useAppStore';
import type { PlannerMessage, Roadmap } from '../../stores/useAppStore';
import { generateRoadmap, stampRoadmapIds } from '../../lib/generateRoadmap';
import { extractUnderstanding, applyClarification, mergeCollectedFields } from '../../lib/understanding';
import type { Understanding, ClarificationQuestion } from '../../lib/understanding';
import { generateJourney } from '../../lib/journey';
import type { Journey } from '../../lib/journey';
import { plannerReply } from '../../lib/plannerEngine';
import { generateSuggestedTasks, generatePlanReply, refreshRisks, generateAiRoadmap } from '../../lib/aiApi';
import { goalProgress, findTask, type Attachment } from '../../components/plan/shared';
import ThinkingComposer from '../../components/plan/ThinkingComposer';
import { LiveUnderstandingPanel, PersistentUnderstandingPanel } from '../../components/plan/UnderstandingPanel';
import AnalyzingTransition from '../../components/plan/AnalyzingTransition';
import UnderstandingReview from '../../components/plan/UnderstandingReview';
import PlanStepper from '../../components/plan/PlanStepper';
import JourneyCanvas from '../../components/plan/JourneyCanvas';
import JourneyAccordion from '../../components/plan/JourneyAccordion';
import ThinkingLog from '../../components/plan/ThinkingLog';
import PlanSwitcher from '../../components/plan/PlanSwitcher';

type ComposePhase = 'compose' | 'analyzing' | 'review' | 'generating';

export default function Plan() {
  const navigate = useNavigate();
  const allGoals = useAppStore((s) => s.goals);
  const goals = useMemo(() => allGoals.filter((g) => !g.archived), [allGoals]);
  const activeGoalId = useAppStore((s) => s.activeGoalId);
  const setActiveGoal = useAppStore((s) => s.setActiveGoal);
  const createGoal = useAppStore((s) => s.createGoal);
  const deleteGoal = useAppStore((s) => s.deleteGoal);
  const updateGoalJourney = useAppStore((s) => s.updateGoalJourney);
  const appendPlannerMessage = useAppStore((s) => s.appendPlannerMessage);
  const logProgressFromChat = useAppStore((s) => s.logProgressFromChat);
  const addDailyTasks = useAppStore((s) => s.addDailyTasks);
  const planChatDraft = useAppStore((s) => s.planChatDraft);
  const clearPlanChatDraft = useAppStore((s) => s.clearPlanChatDraft);
  const streak = useAppStore((s) => s.streak());

  const [viewGoalId, setViewGoalId] = useState<string | null>(activeGoalId ?? goals[0]?.id ?? null);
  const [isComposing, setIsComposing] = useState(goals.length === 0);
  const [phase, setPhase] = useState<ComposePhase>('compose');

  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const liveUnderstanding = useMemo(() => extractUnderstanding(text), [text]);

  const [reviewUnderstanding, setReviewUnderstanding] = useState<Understanding | null>(null);
  const understandingRef = useRef<Understanding | null>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [mobileJourneyOpen, setMobileJourneyOpen] = useState(false);
  const [isJourneyExpanded, setIsJourneyExpanded] = useState(false);

  // Picks up whatever the "Talk it through instead" chat page collected and
  // drops straight into Review with it pre-filled, skipping compose/analyzing.
  useEffect(() => {
    if (!planChatDraft) return;
    const base = extractUnderstanding(planChatDraft.text);
    const merged = mergeCollectedFields(base, planChatDraft.collected);
    understandingRef.current = merged;
    setText(planChatDraft.text);
    setReviewUnderstanding(merged);
    setIsComposing(true);
    setPhase('review');
    clearPlanChatDraft();
    refreshRisksFor(merged);
    // Runs once per draft handoff, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planChatDraft]);


  useEffect(() => {
    if (!isJourneyExpanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsJourneyExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isJourneyExpanded]);

  const viewGoal = goals.find((g) => g.id === viewGoalId) ?? null;

  const riskRefreshToken = useRef(0);

  /** Re-asks Gemma for risks using everything currently known, instead of leaving the flat category-default list from the very first pass. Silently no-ops on failure. */
  function refreshRisksFor(u: Understanding) {
    const token = ++riskRefreshToken.current;
    refreshRisks({
      goalTitle: u.goal.value || text.slice(0, 140) || 'New goal',
      category: u.categoryLabel,
      timeline: u.timeline.value,
      experience: u.experience.value,
      resources: u.resources.value,
      audience: u.audience.value,
      timePerDayMinutes: u.timePerDayMinutes,
      constraints: u.constraints,
    })
      .then((risks) => {
        if (risks.length === 0) return;
        if (riskRefreshToken.current !== token) return; // a newer edit superseded this request
        updateUnderstanding((prev) => ({ ...prev, risks }));
      })
      .catch(() => {
        // No backend / no key / offline \u2014 keep whatever risks are already showing.
      });
  }

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
    refreshRisksFor(snapshot);
  }

  function handleBackToCompose() {
    setPhase('compose');
  }

  function handleReviewContinue() {
    generateGoal(understandingRef.current!);
  }

  function handleReviewFieldSave(key: ClarificationQuestion['key'], answer: string) {
    updateUnderstanding((u) => {
      const next = applyClarification(u, key, answer);
      refreshRisksFor(next);
      return next;
    });
  }

  function generateGoal(u: Understanding) {
    setPhase('generating');
    (async () => {
      const goalTitle = u.goal.value || text.slice(0, 140) || 'New goal';
      const startedAt = Date.now();

      let roadmap: Roadmap;
      try {
        const raw = await generateAiRoadmap({
          goalTitle,
          rawText: text,
          motivation: u.motivation.value,
          audience: u.audience.value,
          timeline: u.timeline.value,
          experience: u.experience.value,
          resources: u.resources.value,
          timePerDayMinutes: u.timePerDayMinutes,
          constraints: u.constraints,
        });
        roadmap = stampRoadmapIds(raw);
      } catch {
        // Offline, no key configured, or a bad response \u2014 fall back to the
        // deterministic template so goal creation never hard-fails.
        const roadmapAnswers = ['', u.timePerDayMinutes ? `${u.timePerDayMinutes} minutes` : '', text, u.timeline.value ?? ''];
        roadmap = generateRoadmap(goalTitle, roadmapAnswers);
      }

      // Keep the "generating" phase visible for at least a beat even when
      // the AI call resolves fast, so it doesn't flash instantly.
      const elapsed = Date.now() - startedAt;
      if (elapsed < 700) await new Promise((r) => setTimeout(r, 700 - elapsed));

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

      // Best-effort: ask Gemma for a few quick supporting to-dos for the Tasks
      // page. Non-blocking and silent on failure (no key configured, offline,
      // etc.) so it never holds up or breaks the plan-creation flow.
      generateSuggestedTasks({
        goalTitle,
        milestoneTitle: roadmap.milestones[0]?.title,
        todayTaskTitle: roadmap.milestones[0]?.tasks[0]?.title,
        count: 3,
      })
        .then((tasks) => {
          if (tasks.length) addDailyTasks(tasks, 'ai');
        })
        .catch(() => {
          // No backend / no API key / request failed \u2014 the user can still add tasks manually.
        });
    })();
  }

  function handleSend(value: string) {
    if (!viewGoal) return;
    appendPlannerMessage(viewGoal.id, { from: 'user', text: value });
    setActiveGoal(viewGoal.id);
    setIsReplying(true);

    const currentMilestone = viewGoal.roadmap.milestones.find((m) => m.status === 'current') ?? null;
    const todayTask = currentMilestone?.tasks.find((t) => !t.done) ?? null;
    // Local pattern-matcher stays authoritative for detecting "mark as done"
    // actions (cheap and reliable) and as the offline/no-API-key fallback.
    const localReply = plannerReply(value, { goal: viewGoal, currentMilestone, todayTask, streak });

    generatePlanReply({
      message: value,
      goalTitle: viewGoal.title,
      milestoneTitle: currentMilestone?.title,
      todayTaskTitle: todayTask?.title,
      streak,
      progressPct: Math.round(goalProgress(viewGoal) * 100),
    })
      .then((text) => {
        appendPlannerMessage(viewGoal.id, { from: 'ai', text, actionTaskId: localReply.offerCompleteTaskId });
      })
      .catch(() => {
        appendPlannerMessage(viewGoal.id, { from: 'ai', text: localReply.text, actionTaskId: localReply.offerCompleteTaskId });
      })
      .finally(() => setIsReplying(false));
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
                  onBackToCompose={handleBackToCompose}
                  onReviewFieldSave={handleReviewFieldSave}
                  onReviewContinue={handleReviewContinue}
                  onTalkInstead={() => navigate('/app/plan/collect')}
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
                onBackToCompose={handleBackToCompose}
                onReviewFieldSave={handleReviewFieldSave}
                onReviewContinue={handleReviewContinue}
                onTalkInstead={() => navigate('/app/plan/collect')}
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
  onBackToCompose,
  onReviewFieldSave,
  onReviewContinue,
  onTalkInstead,
}: {
  phase: ComposePhase;
  text: string;
  setText: (v: string) => void;
  attachments: Attachment[];
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
  onAnalyze: () => void;
  onAnalyzingDone: () => void;
  reviewUnderstanding: Understanding | null;
  onBackToCompose: () => void;
  onReviewFieldSave: (key: ClarificationQuestion['key'], answer: string) => void;
  onReviewContinue: () => void;
  onTalkInstead: () => void;
}) {
  const step = phase === 'review' || phase === 'generating' ? (phase === 'generating' ? 3 : 2) : 1;

  if (phase === 'analyzing') return <AnalyzingTransition onDone={onAnalyzingDone} />;

  if (phase === 'generating') {
    return (
      <div className="flex flex-col h-full">
        <PlanStepper step={3} />
        <div className="flex-1 flex flex-col items-center justify-center py-16">
          <div className="w-9 h-9 rounded-full mb-4" style={{ border: '2px solid var(--line)', borderTopColor: 'var(--violet)', animation: 'spin 1s linear infinite' }} />
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Building your Journey&hellip;</p>
        </div>
      </div>
    );
  }

  if (phase === 'review' && reviewUnderstanding) {
    return (
      <div className="flex flex-col h-full">
        <PlanStepper step={2} />
        <UnderstandingReview
          understanding={reviewUnderstanding}
          onBack={onBackToCompose}
          onFieldSave={onReviewFieldSave}
          onContinue={onReviewContinue}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PlanStepper step={1} />
      <ThinkingComposer
        value={text}
        onChange={setText}
        attachments={attachments}
        onAddAttachment={(a) => setAttachments((prev) => [...prev, a])}
        onRemoveAttachment={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
        onAnalyze={onAnalyze}
        autoFocus
      />
      <button
        onClick={onTalkInstead}
        className="flex items-center justify-center gap-1.5 mt-3 text-[12px] py-2 rounded-lg"
        style={{ color: 'var(--text-faint)' }}
      >
        <MessageCircleMore size={13} /> Don&rsquo;t know where to start? Talk it through instead
      </button>
    </div>
  );
}
