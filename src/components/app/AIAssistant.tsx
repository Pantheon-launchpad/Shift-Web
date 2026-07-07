import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Sparkles, X } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

const QUICK_PROMPTS = ['Explain today\u2019s task', 'Break this into smaller steps', 'Why this milestone?'];
const PLAN_NEW_GOAL_PROMPT = 'Help me plan a new goal';

interface Message {
  from: 'ai' | 'user';
  text: string;
}

const GENERAL_REPLIES = [
  'Good question \u2014 focus on the smallest version that proves the idea works, then iterate from real feedback.',
  'Try timeboxing it: give yourself one focus session and see how far you get before judging the result.',
  'If you\u2019re unsure where to start, pick the part you\u2019re most tempted to skip \u2014 it\u2019s usually the real blocker.',
];

/**
 * Builds a reply grounded in whatever's actually going on in the app right
 * now (the active goal, the current milestone, today's task) rather than
 * one fixed string. Still a scripted client-side responder, not a live
 * model \u2014 but the answer changes with context instead of being identical
 * for every goal and every question.
 */
function getReply(
  prompt: string,
  ctx: { goalTitle: string | null; milestoneTitle: string | null; taskTitle: string | null }
): string {
  const { goalTitle, milestoneTitle, taskTitle } = ctx;

  if (prompt === 'Explain today\u2019s task') {
    return taskTitle
      ? `Today's task is "${taskTitle}". It's part of the "${milestoneTitle}" milestone \u2014 the idea is to make one concrete piece of progress on ${goalTitle}, not the whole thing at once.`
      : 'You don\u2019t have an active task right now \u2014 start a goal from the dashboard and I\u2019ll break down the first step.';
  }

  if (prompt === 'Break this into smaller steps') {
    return taskTitle
      ? `Here's one way to split "${taskTitle}": (1) spend 5 minutes writing down what "done" looks like, (2) do the smallest version that technically counts, (3) polish only if you have time left.`
      : 'Once you have a task, ask me this again and I\u2019ll split it into a few smaller steps.';
  }

  if (prompt === 'Why this milestone?') {
    return milestoneTitle
      ? `"${milestoneTitle}" comes next because it's the thing standing between where ${goalTitle ?? 'your goal'} is now and the next real checkpoint. Skipping ahead usually just means circling back to it later.`
      : 'Create a goal first and I can walk you through why each milestone is ordered the way it is.';
  }

  const lower = prompt.toLowerCase();
  if (lower.includes('stuck') || lower.includes('stall') || lower.includes('procrastinat')) {
    return 'That happens. Lower the bar for today \u2014 open the file, write one bad sentence, ship one ugly version. Momentum matters more than quality on restart days.';
  }
  if (lower.includes('why')) {
    return goalTitle
      ? `It's in service of ${goalTitle} \u2014 every task on your roadmap exists to close a specific gap toward that.`
      : GENERAL_REPLIES[0];
  }

  return GENERAL_REPLIES[Math.floor(Math.random() * GENERAL_REPLIES.length)];
}

/**
 * Floating AI assistant panel. The trigger lives in two places that share
 * the same open/close state from the store: a bottom-right bubble on
 * desktop, and the raised center button in the mobile floating nav.
 */
export default function AIAssistant() {
  const navigate = useNavigate();
  const activeGoal = useAppStore((s) => s.activeGoal());
  const currentMilestone = useAppStore((s) => s.currentMilestone());
  const todayTaskId = useAppStore((s) => s.todayTaskId());
  const isOpen = useAppStore((s) => s.isAssistantOpen);
  const toggleAssistant = useAppStore((s) => s.toggleAssistant);
  const closeAssistant = useAppStore((s) => s.closeAssistant);

  const taskTitle = currentMilestone?.tasks.find((t) => t.id === todayTaskId)?.title ?? null;

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { from: 'ai', text: activeGoal ? `I\u2019m here to help with "${activeGoal.title}". Ask me anything.` : 'Create a goal and I\u2019ll help you break it down.' },
  ]);

  const openFullPlanner = () => {
    closeAssistant();
    navigate('/app/planner');
  };

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { from: 'user', text }]);
    setInput('');
    const reply = getReply(text, { goalTitle: activeGoal?.title ?? null, milestoneTitle: currentMilestone?.title ?? null, taskTitle });
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'ai', text: reply }]);
    }, 700);
  };

  return (
    <>
      {/* Desktop trigger only \u2014 mobile uses the center button in MobileNav */}
      <motion.button
        onClick={toggleAssistant}
        aria-label="Quick chat with AI"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="hidden md:flex fixed z-40 items-center justify-center rounded-full"
        style={{
          width: 52,
          height: 52,
          right: 24,
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          background: 'linear-gradient(135deg, var(--violet), #9653fd)',
          boxShadow: '0 8px 24px rgba(131,53,253,0.4)',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isOpen ? 'close' : 'open'}
            initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            {isOpen ? <X size={20} color="white" /> : <Sparkles size={20} color="white" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="glass-strong fixed z-40 flex flex-col rounded-2xl overflow-hidden left-4 right-4 md:left-auto md:right-6 md:w-[360px]"
            style={{
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
              maxHeight: 440,
              height: 440,
              boxShadow: 'var(--shadow-lift)',
            }}
          >
            <div className="flex items-center justify-between gap-2 px-4 py-3.5" style={{ borderBottom: '1px solid var(--line)' }}>
              <div className="flex items-center gap-2">
                <Sparkles size={15} color="var(--violet)" />
                <span className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>Quick chat</span>
              </div>
              <button onClick={openFullPlanner} className="flex items-center gap-1 text-[11px] font-medium" style={{ color: 'var(--violet)' }}>
                <Bot size={12} /> Open AI Planner
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3.5 flex flex-col gap-3">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[13px] leading-relaxed px-3.5 py-2.5 rounded-2xl max-w-[85%]"
                  style={
                    m.from === 'ai'
                      ? { background: 'var(--glass)', color: 'var(--text)', alignSelf: 'flex-start' }
                      : { background: 'var(--violet)', color: 'white', alignSelf: 'flex-end' }
                  }
                >
                  {m.text}
                </motion.div>
              ))}
            </div>

            <div className="px-3 pb-3 flex flex-wrap gap-1.5">
              <motion.button
                onClick={openFullPlanner}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                className="pill px-2.5 py-1 text-[11px] flex items-center gap-1"
                style={{ color: 'var(--violet)', borderColor: 'var(--violet)' }}
              >
                <Bot size={11} /> {PLAN_NEW_GOAL_PROMPT}
              </motion.button>
              {QUICK_PROMPTS.map((p) => (
                <motion.button
                  key={p}
                  onClick={() => send(p)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  className="pill px-2.5 py-1 text-[11px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {p}
                </motion.button>
              ))}
            </div>

            <form
              className="flex items-center gap-2 p-3"
              style={{ borderTop: '1px solid var(--line)' }}
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your plan..."
                className="flex-1 h-10 rounded-xl px-3.5 text-[13px] outline-none"
                style={{ background: 'var(--glass)', border: '1px solid var(--line)', color: 'var(--text)' }}
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
