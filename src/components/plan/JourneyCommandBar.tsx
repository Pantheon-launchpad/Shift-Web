import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, X } from 'lucide-react';
import { interpretCommand, type Journey } from '../../lib/journey';

interface Proposal {
  message: string;
  journey: Journey;
  summary: string;
  changedNodeIds: string[];
}

export default function JourneyCommandBar({
  journey,
  selectedNodeId,
  onPreview,
  onAccept,
  onReject,
  proposal,
  answer,
}: {
  journey: Journey;
  selectedNodeId: string | null;
  onPreview: (p: Proposal | null) => void;
  onAccept: () => void;
  onReject: () => void;
  proposal: Proposal | null;
  answer: string | null;
}) {
  const [input, setInput] = useState('');

  function submit() {
    if (!input.trim()) return;
    const result = interpretCommand(journey, input.trim(), selectedNodeId);
    if (!result) {
      onPreview({ message: input.trim(), journey, summary: 'I didn\u2019t catch a graph edit in that \u2014 try things like "split X into three phases" or "connect A to B".', changedNodeIds: [] });
      setInput('');
      return;
    }
    if (result.answerOnly) {
      onPreview({ message: input.trim(), journey: result.journey, summary: result.summary, changedNodeIds: [] });
    } else {
      onPreview({ message: input.trim(), journey: result.journey, summary: result.summary, changedNodeIds: result.changedNodeIds });
    }
    setInput('');
  }

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-full max-w-[460px] px-4">
      {(proposal || answer) && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 rounded-2xl p-3.5 glass-strong"
        >
          <div className="flex items-start gap-2">
            <Sparkles size={13} color="var(--violet)" className="mt-0.5 shrink-0" />
            <p className="text-[12.5px] leading-relaxed flex-1" style={{ color: 'var(--text)' }}>
              {proposal?.summary ?? answer}
            </p>
          </div>
          {proposal && proposal.changedNodeIds.length > 0 && (
            <div className="flex gap-2 mt-3">
              <button onClick={onAccept} className="flex-1 h-8 rounded-lg text-[12px] font-medium flex items-center justify-center gap-1.5" style={{ background: 'var(--violet)', color: 'white' }}>
                <Check size={12} /> Accept
              </button>
              <button onClick={onReject} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ color: 'var(--text-muted)', border: '1px solid var(--line)' }} aria-label="Reject">
                <X size={13} />
              </button>
            </div>
          )}
          {(!proposal || proposal.changedNodeIds.length === 0) && (
            <button onClick={onReject} className="mt-2 text-[11px]" style={{ color: 'var(--text-faint)' }}>Dismiss</button>
          )}
        </motion.div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-center gap-2 rounded-full pl-4 pr-1.5 py-1.5 glass-strong"
      >
        <Sparkles size={14} color="var(--text-faint)" className="shrink-0" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Talk to the Journey&hellip;"
          className="flex-1 bg-transparent outline-none text-[13px] min-w-0"
          style={{ color: 'var(--text)' }}
        />
        <button type="submit" className="btn btn-primary text-[12px] py-1.5 px-3.5 shrink-0" disabled={!input.trim()}>
          Ask
        </button>
      </form>
    </div>
  );
}
