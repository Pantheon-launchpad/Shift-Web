'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { FaXTwitter, FaLinkedin } from 'react-icons/fa6';

const cards = [
  { day: 'Day 12', text: 'Finished the landing page copy and fixed the mobile nav.', platform: FaXTwitter },
  { day: 'Day 27', text: 'Shipped auth, wrote docs, closed 3 open bugs.', platform: FaLinkedin },
  { day: 'Day 41', text: 'Fixed signup drop-off. Activation up for the week.', platform: FaXTwitter },
  { day: 'Day 55', text: 'Hit first 10 paying users. Roadmap milestone cleared.', platform: FaLinkedin },
];

const duplicated = [...cards, ...cards, ...cards];

export default function Integrations() {
  return (
    <section id="proof" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-14 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="eyebrow mb-4">The build-in-public generator</div>
          <h2 className="font-display font-semibold mb-4" style={{ fontSize: 'clamp(1.9rem, 3.4vw, 2.75rem)', color: 'var(--text)' }}>
            The record writes itself
          </h2>
          <p className="text-muted mb-8 leading-relaxed">
            You already do the work. Shift turns the daily debrief into a clean update
            you can post to X or LinkedIn in one tap \u2014 or just keep as a private log
            you\u2019ll actually want to reread.
          </p>
          <button className="btn btn-primary py-3.5 px-6">Try the generator</button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass-strong rounded-3xl p-5 h-96 relative overflow-hidden"
          style={{ boxShadow: 'var(--shadow-lift)' }}
        >
          <div className="absolute inset-x-0 top-0 h-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(var(--ink-2), transparent)' }} />
          <div className="absolute inset-x-0 bottom-0 h-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(0deg, var(--ink-2), transparent)' }} />

          <motion.div
            className="space-y-4"
            animate={{ y: [0, -260] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          >
            {duplicated.map((c, idx) => (
              <motion.div
                key={`${c.day}-${idx}`}
                className="flex items-start gap-3.5 p-4 rounded-2xl"
                style={{ background: 'var(--ink-1)', border: '1px solid var(--line)' }}
                whileHover={{ x: 4 }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #9653fd, var(--gold))' }}>
                  <c.platform className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-mono text-faint mb-1">{c.day}</p>
                  <p className="text-[13px] leading-snug" style={{ color: 'var(--text)' }}>{c.text}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-1" style={{ color: 'var(--violet)' }} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
