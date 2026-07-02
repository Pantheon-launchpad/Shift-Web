'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Newsletter() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-strong relative rounded-[32px] p-12 md:p-16 overflow-hidden text-center"
        style={{ boxShadow: 'var(--shadow-lift)' }}
      >
        <div className="orb absolute -top-24 -left-24" style={{ width: 300, height: 300, background: 'radial-gradient(circle, #8335FD, transparent 70%)' }} />
        <div className="orb absolute -bottom-24 -right-24" style={{ width: 320, height: 320, background: 'radial-gradient(circle, #f2b84b, transparent 70%)', opacity: 0.2 }} />

        <div className="relative z-10">
          <div className="eyebrow justify-center mb-5">Today is a good day to start</div>
          <h2 className="font-display font-semibold mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--text)' }}>
            Tell Shift the goal.
            <br />See what today looks like.
          </h2>
          <p className="text-muted mb-9 max-w-md mx-auto leading-relaxed">
            No credit card. No blank roadmap staring back at you. Just one task, chosen for today.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="you@domain.com"
              className="w-full sm:flex-1 px-5 py-3.5 rounded-full text-sm focus:outline-none"
              style={{ background: 'var(--ink-1)', border: '1px solid var(--line)', color: 'var(--text)' }}
            />
            <motion.button
              className="btn btn-primary w-full sm:w-auto py-3.5 px-6"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Start free <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
