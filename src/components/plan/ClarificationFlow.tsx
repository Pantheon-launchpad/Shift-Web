import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { ClarificationQuestion } from '../../lib/understanding';
import { PrimaryButton } from '../app/ui';

export default function ClarificationFlow({
  questions,
  onAnswer,
  onDone,
}: {
  questions: ClarificationQuestion[];
  onAnswer: (key: ClarificationQuestion['key'], answer: string) => void;
  onDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const current = questions[index];

  function submit() {
    if (!value.trim()) return;
    onAnswer(current.key, value.trim());
    setValue('');
    if (index + 1 >= questions.length) {
      onDone();
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="flex flex-col h-full justify-center">
      <span className="eyebrow mb-4">Just a couple things &middot; {index + 1} of {questions.length}</span>
      <motion.h2
        key={current.key}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="font-display font-semibold text-[22px] leading-snug mb-6"
        style={{ color: 'var(--text)' }}
      >
        {current.question}
      </motion.h2>
      <form
        className="flex gap-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your answer&hellip;"
          className="flex-1 h-12 rounded-xl px-4 text-[14px] outline-none"
          style={{ background: 'var(--glass)', border: '1.5px solid var(--line)', color: 'var(--text)' }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--violet)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
        />
        <PrimaryButton type="submit" disabled={!value.trim()} style={{ width: 48, height: 48, padding: 0 }}>
          <ArrowRight size={17} />
        </PrimaryButton>
      </form>
    </motion.div>
  );
}
