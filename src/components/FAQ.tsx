// FAQ.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: 'How is this different from a to-do list?',
    answer: 'A to-do list still makes you decide what matters. Shift decides for you, based on a roadmap tied to your actual goal, and only ever shows you one task at a time.',
  },
  {
    question: 'What happens in the AI goal interview?',
    answer: 'You describe what you\u2019re trying to build in plain language. Shift asks a few follow-up questions, then generates a roadmap with real milestones \u2014 not generic advice.',
  },
  {
    question: 'What if I miss a day?',
    answer: 'The roadmap adjusts. Your streak resets, but your plan doesn\u2019t \u2014 Shift picks back up from where you actually are, not where the plan assumed you\u2019d be.',
  },
  {
    question: 'Do I have to share my progress publicly?',
    answer: 'No. The build-in-public generator is optional. Most people start by just keeping the private log, then start sharing once there\u2019s something worth showing.',
  },
  {
    question: 'Can I use Shift for more than one goal?',
    answer: 'Yes, on the Pro plan. Each goal gets its own roadmap, daily task, and proof trail, so they don\u2019t get tangled together.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <div className="eyebrow justify-center mb-4">Questions</div>
        <h2 className="font-display font-semibold mb-4" style={{ fontSize: 'clamp(1.9rem, 3.4vw, 2.75rem)', color: 'var(--text)' }}>
          Things people ask before starting
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="card overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <span className="font-medium text-[14.5px]" style={{ color: 'var(--text)' }}>{faq.question}</span>
              {openIndex === idx ? (
                <Minus className="w-4 h-4 shrink-0 ml-4" style={{ color: 'var(--text-faint)' }} />
              ) : (
                <Plus className="w-4 h-4 shrink-0 ml-4" style={{ color: 'var(--text-faint)' }} />
              )}
            </button>
            <AnimatePresence>
              {openIndex === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-[13.5px] leading-relaxed text-muted">{faq.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
