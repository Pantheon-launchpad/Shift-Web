import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Check } from 'lucide-react';
import type { Goal, PlannerMessage } from '../../stores/useAppStore';
import { findTask } from './shared';

/**
 * The continuation of the thinking space once a goal exists. Deliberately
 * not styled as chat bubbles with avatars \u2014 quiet left-aligned entries
 * separated by hairlines, closer to a running journal thread than a
 * messenger, in keeping with "the user should feel like they're thinking,
 * not chatting."
 */
export default function ThinkingLog({
  goal,
  onSend,
  onMarkDone,
  isReplying,
}: {
  goal: Goal;
  onSend: (text: string) => void;
  onMarkDone: (taskId: string) => void;
  isReplying: boolean;
}) {
  const [value, setValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const messages = goal.plannerLog;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isReplying]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1">
        {messages.map((m) => (
          <LogEntry key={m.id} message={m} goal={goal} onMarkDone={onMarkDone} />
        ))}
        {isReplying && (
          <div className="flex gap-1 pl-0.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--text-faint)' }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!value.trim()) return;
          onSend(value.trim());
          setValue('');
        }}
        className="flex items-center gap-2 mt-4 pt-4"
        style={{ borderTop: '1px solid var(--line)' }}
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Keep thinking out loud&hellip;"
          className="flex-1 h-11 rounded-xl px-4 text-[13.5px] outline-none"
          style={{ background: 'var(--glass)', border: '1.5px solid var(--line)', color: 'var(--text)' }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--violet)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
        />
        <button type="submit" disabled={!value.trim()} className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 btn-primary disabled:opacity-40">
          <ArrowUp size={16} />
        </button>
      </form>
    </div>
  );
}

function LogEntry({ message, goal, onMarkDone }: { message: PlannerMessage; goal: Goal; onMarkDone: (taskId: string) => void }) {
  const isUser = message.from === 'user';
  const found = message.actionTaskId ? findTask(goal, message.actionTaskId) : null;
  const showAction = found && !found.task.done;

  return (
    <div className="pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
      <div className="font-mono text-[9.5px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-faint)' }}>
        {isUser ? 'You' : 'Plan'}
      </div>
      <p className="text-[13.5px] leading-relaxed whitespace-pre-line" style={{ color: isUser ? 'var(--text)' : 'var(--text-muted)' }}>
        {message.text}
      </p>
      {showAction && (
        <button onClick={() => onMarkDone(message.actionTaskId!)} className="btn btn-ghost text-[11.5px] py-1.5 px-3 gap-1.5 mt-2.5">
          <Check size={12} /> Mark &ldquo;{found!.task.title}&rdquo; done
        </button>
      )}
    </div>
  );
}
