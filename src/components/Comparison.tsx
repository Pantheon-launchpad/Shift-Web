// Comparison.tsx
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const comparisonData = {
  others: [
    "Data lives in too many places",
    "Reporting eats up hours",
    "Insights are too generic",
    "No smart guidance for decisions",
    "Hard to see what's really working",
  ],
  alytics: [
    "All your metrics, one platform",
    "Reports generate instantly",
    "Insights tailored to your goals",
    "AI suggests your next move",
    "Clear path to consistent growth",
  ],
};

export default function Comparison() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto bg-[var(--bg)]">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-full text-sm font-medium mb-4">
          Why Shift
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text)] mb-4">
          A Smarter Way To
          <br />
          Grow With Data
        </h2>
        <p className="text-[var(--text-muted)]">
          Turn complex metrics into clear insights that help you make better
          decisions, faster.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid md:grid-cols-2 gap-6"
      >
        {/* Other Tools */}
        <div className="bg-[var(--card)] rounded-3xl p-6 border border-[var(--border)]">
          <h3 className="text-xl font-bold text-[var(--text)] mb-6">
            Other Tools
          </h3>
          <ul className="space-y-4">
            {comparisonData.others.map((item, idx) => (
              <li
                key={idx}
                className="flex items-center gap-3 text-[var(--text-muted)]"
              >
                <X className="w-5 h-5 text-red-400" />
                <span className="line-through">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Alytics */}
        <div className="bg-[var(--card)] rounded-3xl p-6 border-2 border-purple-800 shadow-xl shadow-purple-500/10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-purple-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">+</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--text)]">Shift</h3>
          </div>
          <ul className="space-y-4">
            {comparisonData.alytics.map((item, idx) => (
              <li
                key={idx}
                className="flex items-center gap-3 text-[var(--text)] font-medium"
              >
                <div className="w-5 h-5 bg-purple-800 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}