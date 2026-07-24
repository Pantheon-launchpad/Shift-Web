import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUp, Bot, Check } from 'lucide-react';
import { GlassCard, PrimaryButton, Pill } from '../../components/app/ui';
import { useAppStore } from '../../stores/useAppStore';
import { collectPlanInfo, type CollectChatMessage } from '../../lib/aiApi';
import type { CollectedFields } from '../../lib/understanding';

const FIELD_LABELS: Record<keyof CollectedFields, string> = {
  goal: 'Goal',
  motivation: 'Motivation',
  timeline: 'Timeline',
  experience: 'Experience',
  resources: 'Resources',
  audience: 'Who it\u2019s for',
  timePerDayMinutes: 'Time available',
  risks: 'Risks',
};

const OPENING_MESSAGE = "Hey \u2014 no worries if you don't have it all figured out. What are you trying to do? Just describe it however comes naturally, and I'll ask about the rest as we go.";

export default function PlanCollect() {
  const navigate = useNavigate();
  const setPlanChatDraft = useAppStore((s) => s.setPlanChatDraft);

  const [messages, setMessages] = useState<CollectChatMessage[]>([{ from: 'ai', text: OPENING_MESSAGE }]);
  const [collected, setCollected] = useState<CollectedFields>({});
  const [input, setInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isReplying]);

  const filledCount = Object.values(collected).filter((v) => v != null && (Array.isArray(v) ? v.length > 0 : v !== '')).length;

  async function handleSend(text: string) {
    const nextMessages: CollectChatMessage[] = [...messages, { from: 'user', text }];
    setMessages(nextMessages);
    setIsReplying(true);
    setError(null);
    try {
      const result = await collectPlanInfo(nextMessages, collected as Record<string, unknown>);
      setMessages((m) => [...m, { from: 'ai', text: result.reply }]);
      setCollected((prev) => {
        const merged: CollectedFields = { ...prev };
        for (const [key, value] of Object.entries(result.fields)) {
          if (value == null || value === '') continue;
          (merged as Record<string, unknown>)[key] = key === 'timePerDayMinutes' ? Number(value) : value;
        }
        if (result.risks.length > 0) merged.risks = result.risks;
        return merged;
      });
      if (result.done) setIsDone(true);
    } catch {
      setError('Couldn\u2019t reach Gemma \u2014 make sure the server is running and GEMMA_API_KEY is set, then try again.');
    } finally {
      setIsReplying(false);
    }
  }

  function handleUseThis() {
    const rawText = messages.filter((m) => m.from === 'user').map((m) => m.text).join('. ');
    setPlanChatDraft({ text: rawText || collected.goal || 'New goal', collected });
    navigate('/app/plan');
  }

  const hasEnoughToFinish = filledCount >= 2;

  return (
    <div className="w-full max-w-3xl mx-auto px-5 sm:px-8 py-8 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="flex items-center gap-3 mb-5 shrink-0">
        <button
          onClick={() => navigate('/app/plan')}
          aria-label="Back to Plan"
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ color: 'var(--text-faint)', background: 'var(--glass)', border: '1px solid var(--glass-border)' }}
        >
          <ArrowLeft size={14} />
        </button>
        <div className="min-w-0">
          <Pill tone="accent" className="w-fit mb-1"><Bot size={12} /> Talk it through</Pill>
          <p className="text-[12.5px]" style={{ color: 'var(--text-muted)' }}>
            No pressure to have it all figured out \u2014 answer what you can, skip what you can&rsquo;t.
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-5">
        <GlassCard className="flex-1 min-h-0 flex flex-col p-6">
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1">
            {messages.map((m, i) => (
              <ChatEntry key={i} message={m} />
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
            {error && <p className="text-[12px]" style={{ color: 'var(--danger)' }}>{error}</p>}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!input.trim() || isReplying) return;
              handleSend(input.trim());
              setInput('');
            }}
            className="flex items-center gap-2 mt-4 pt-4"
            style={{ borderTop: '1px solid var(--line)' }}
          >
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your answer&hellip;"
              className="flex-1 h-11 rounded-xl px-4 text-[13.5px] outline-none"
              style={{ background: 'var(--glass)', border: '1.5px solid var(--line)', color: 'var(--text)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--violet)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
            />
            <button type="submit" disabled={!input.trim() || isReplying} className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 btn-primary disabled:opacity-40">
              <ArrowUp size={16} />
            </button>
          </form>
        </GlassCard>

        <div className="md:w-[280px] shrink-0 flex flex-col gap-4">
          <GlassCard className="p-5">
            <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
              Collected so far
            </span>
            <div className="flex flex-col gap-2.5 mt-3">
              {(Object.keys(FIELD_LABELS) as (keyof CollectedFields)[]).map((key) => {
                const value = collected[key];
                const has = Array.isArray(value) ? value.length > 0 : value != null && value !== '';
                return (
                  <div key={key} className="flex items-start gap-2">
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: has ? 'var(--success)' : 'var(--glass)', border: has ? 'none' : '1px solid var(--line)' }}
                    >
                      {has && <Check size={9} color="var(--ink)" />}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11.5px] font-medium" style={{ color: has ? 'var(--text)' : 'var(--text-faint)' }}>{FIELD_LABELS[key]}</div>
                      {has && (
                        <div className="text-[11px] truncate" style={{ color: 'var(--text-faint)' }}>
                          {Array.isArray(value) ? value.join('; ') : String(value)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <PrimaryButton onClick={handleUseThis} disabled={!hasEnoughToFinish} className="w-full">
            {isDone ? 'Build my plan' : 'Use what we have so far'}
          </PrimaryButton>
          {!hasEnoughToFinish && (
            <p className="text-[11px] text-center px-2" style={{ color: 'var(--text-faint)' }}>
              Answer a couple more questions and this unlocks.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatEntry({ message }: { message: CollectChatMessage }) {
  const isUser = message.from === 'user';
  return (
    <div className="pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
      <div className="font-mono text-[9.5px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-faint)' }}>
        {isUser ? 'You' : 'Plan'}
      </div>
      <p className="text-[13.5px] leading-relaxed whitespace-pre-line" style={{ color: isUser ? 'var(--text)' : 'var(--text-muted)' }}>
        {message.text}
      </p>
    </div>
  );
}
