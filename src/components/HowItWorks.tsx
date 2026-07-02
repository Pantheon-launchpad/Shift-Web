'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Timer, Share2, ArrowRight } from 'lucide-react';
import TiltCard from './TiltCard';

const steps = [
  {
    n: '01',
    title: 'Tell it the goal',
    description: 'A short conversation, not a form. Shift turns what you say into a real roadmap with real milestones.',
    icon: MessageSquare,
  },
  {
    n: '02',
    title: 'Do today\u2019s task',
    description: 'One task, chosen by the roadmap, one focus session. At night, a two-minute debrief updates everything.',
    icon: Timer,
  },
  {
    n: '03',
    title: 'Watch it become proof',
    description: 'Your log turns into a streak, a milestone, a card worth posting. The goal stops being invisible.',
    icon: Share2,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="eyebrow justify-center mb-4">The loop</div>
        <h2 className="font-display font-semibold mb-4" style={{ fontSize: 'clamp(1.9rem, 3.4vw, 2.75rem)', color: 'var(--text)' }}>
          Three steps. Every day.
          <br />That's the whole system.
        </h2>
        <p className="text-muted max-w-lg mx-auto leading-relaxed">
          No planning ritual to maintain. No dashboard to babysit. Just the same
          small loop, run daily, until the goal is behind you.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-5 relative perspective">
        {steps.map((step, idx) => (
          <TiltCard
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15, duration: 0.5 }}
            maxTilt={7}
            className="card p-6 relative"
          >
            <div className="flex items-center justify-between mb-8">
              <span className="font-mono text-xs text-faint">{step.n}</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--glass-strong)', border: '1px solid var(--glass-border)' }}>
                <step.icon className="w-4.5 h-4.5" style={{ color: idx === 2 ? 'var(--gold)' : 'var(--violet)' }} />
              </div>
            </div>
            <h3 className="text-lg font-display font-semibold mb-2" style={{ color: 'var(--text)' }}>{step.title}</h3>
            <p className="text-[13.5px] leading-relaxed text-muted">{step.description}</p>

            {idx < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-faint)' }} />
            )}
          </TiltCard>
        ))}
      </div>
    </section>
  );
}
