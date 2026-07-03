import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

const QUICK_PROMPTS = ['Explain today\u2019s task', 'Break this into smaller steps', 'Why this milestone?'];

interface Message {
  from: 'ai' | 'user';
  text: string;
}

export default function AIAssistant() {
  const activeGoal = useAppStore((s) => s.activeGoal());
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { from: 'ai', text: activeGoal ? `I\u2019m here to help with "${activeGoal.title}". Ask me anything.` : 'Create a goal and I\u2019ll help you break it down.' },
  ]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { from: 'user', text }]);
    setInput('');
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { from: 'ai', text: 'Good question \u2014 focus on the smallest version that proves the idea works, then iterate from real feedback.' },
      ]);
    }, 700);
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="AI assistant"
        className="fixed z-40 flex items-center justify-center rounded-full transition-transform hover:scale-105"
        style={{
          width: 52,
          height: 52,
          right: 24,
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          background: 'linear-gradient(135deg, var(--violet), #9653fd)',
          boxShadow: '0 8px 24px rgba(131,53,253,0.4)',
        }}
      >
        {open ? <X size={20} color="white" /> : <Sparkles size={20} color="white" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="glass-strong fixed z-40 flex flex-col rounded-2xl overflow-hidden"
            style={{
              right: 24,
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 86px)',
              width: 'min(360px, calc(100vw - 48px))',
              height: 440,
              boxShadow: 'var(--shadow-lift)',
            }}
          >
            <div className="flex items-center gap-2 px-4 py-3.5" style={{ borderBottom: '1px solid var(--line)' }}>
              <Sparkles size={15} color="var(--violet)" />
              <span className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>Shift Assistant</span>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3.5 flex flex-col gap-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className="text-[13px] leading-relaxed px-3.5 py-2.5 rounded-2xl max-w-[85%]"
                  style={
                    m.from === 'ai'
                      ? { background: 'var(--glass)', color: 'var(--text)', alignSelf: 'flex-start' }
                      : { background: 'var(--violet)', color: 'white', alignSelf: 'flex-end' }
                  }
                >
                  {m.text}
                </div>
              ))}
            </div>

            <div className="px-3 pb-3 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((p) => (
                <button key={p} onClick={() => send(p)} className="pill px-2.5 py-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {p}
                </button>
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
