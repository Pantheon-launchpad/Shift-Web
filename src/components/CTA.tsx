// CTA.tsx
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-24 bg-[var(--surface)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-6">
            Ready to unlock your data potential?
          </h2>
          <p className="text-xl text-[var(--text-muted)] mb-8">
            Join thousands of companies already using Alytics to drive growth.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-purple-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="border border-[var(--border)] text-[var(--text)] px-8 py-4 rounded-xl font-semibold hover:bg-[var(--surface)] transition-colors">
              Contact Sales
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};