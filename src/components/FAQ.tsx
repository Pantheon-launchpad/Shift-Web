// FAQ.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "How does your platform track feature usage?",
    answer:
      "We automatically collect interaction data across your product and visualize which features are being used most — no manual tagging needed.",
  },
  {
    question: "Do I need technical skills to use Alytics?",
    answer:
      "Not at all. Alytics is built for product and growth teams. Setup takes minutes, and our intuitive interface means you can start analyzing data right away.",
  },
  {
    question: "Can Alytics integrate with tools we already use?",
    answer:
      "Yes! We offer native integrations with popular tools like Slack, Salesforce, HubSpot, and many more. You can also use our API for custom integrations.",
  },
  {
    question: "Is my data secure on Alytics?",
    answer:
      "Absolutely. We use enterprise-grade encryption, are SOC 2 Type II certified, and GDPR compliant. Your data is never shared with third parties.",
  },
  {
    question: "Can I try Alytics before committing?",
    answer:
      "Yes, we offer a 14-day free trial with full access to all features. No credit card required to start.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto bg-[var(--bg)]">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-full text-sm font-medium mb-4">
          FAQ's
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text)] mb-4">
          Common Questions
          <br />
          With Clear Answers
        </h2>
        <p className="text-[var(--text-muted)]">
          Here are answers to the most common things people ask before getting
          started.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--surface)] transition-colors"
            >
              <span className="font-medium text-[var(--text)]">
                {faq.question}
              </span>
              {openIndex === idx ? (
                <Minus className="w-5 h-5 text-[var(--text-muted)]" />
              ) : (
                <Plus className="w-5 h-5 text-[var(--text-muted)]" />
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
                  <p className="px-5 pb-5 text-[var(--text-muted)] text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}