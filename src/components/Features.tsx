'use client';

import { motion } from 'framer-motion';
import { Sparkles, MapPin, Timer, Brain, Share2, CheckCircle2, Circle } from 'lucide-react';
import TiltCard from './TiltCard';

const features = [
  {
    title: 'It starts by understanding you',
    description: "Not a form. A conversation. Shift asks what you're actually trying to build, then turns the answer into a real roadmap — not a list of vague milestones.",
    type: 'interview',
  },
  {
    title: 'One task. Today. That\u2019s it.',
    description: "No backlog to triage. Every morning, Shift looks at your roadmap and hands you the single highest-impact task, with a focus timer built in.",
    type: 'task',
  },
  {
    title: 'It remembers, so you don\u2019t have to',
    description: "Every night, Shift asks what you actually got done, updates the roadmap, and carries the context forward. It gets sharper about you over time.",
    type: 'memory',
  },
  {
    title: 'Work in, proof out',
    description: "Your messy daily log becomes a clean, shareable update — a streak, a build-in-public card, a progress post. The record writes itself.",
    type: 'proof',
  },
];

export default function Features() {
  return (
    <section id="how-shift-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="eyebrow justify-center mb-4">What it actually does</div>
        <h2 className="font-display font-semibold mb-4" style={{ fontSize: 'clamp(1.9rem, 3.4vw, 2.75rem)', color: 'var(--text)' }}>
          Not another dashboard.
          <br />A loop that finishes things.
        </h2>
        <p className="text-muted max-w-lg mx-auto leading-relaxed">
          Four moves, repeated every day, until the goal stops being a goal
          and becomes something you did.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-5 perspective">
        {features.map((feature, idx) => (
          <TiltCard
            key={feature.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            maxTilt={7}
            className="card p-5 flex flex-col"
          >
            <div className="mb-5 rounded-xl h-40 relative overflow-hidden" style={{ background: 'var(--ink-1)' }}>
              {feature.type === 'interview' && (
                <div className="p-4 h-full flex flex-col justify-center gap-2">
                  <div className="self-start max-w-[80%] rounded-2xl rounded-bl-sm px-3 py-2 text-[11.5px]" style={{ background: 'var(--ink-3)', color: 'var(--text-muted)' }}>
                    What are you trying to build in the next 90 days?
                  </div>
                  <motion.div
                    className="self-end max-w-[75%] rounded-2xl rounded-br-sm px-3 py-2 text-[11.5px]"
                    style={{ background: 'linear-gradient(135deg, #9653fd, #6629c5)', color: 'white' }}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Get Shift to 10 paying users
                  </motion.div>
                  <motion.div
                    className="self-start flex items-center gap-1.5 text-[10.5px] font-mono"
                    style={{ color: 'var(--gold)' }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <MapPin className="w-3 h-3" /> roadmap generated
                  </motion.div>
                </div>
              )}

              {feature.type === 'task' && (
                <div className="p-4 h-full flex flex-col justify-center gap-2.5">
                  {[
                    { label: 'Fix signup drop-off', active: true },
                    { label: 'Reply to support emails', active: false },
                    { label: 'Redesign pricing page', active: false },
                  ].map((t, i) => (
                    <motion.div
                      key={t.label}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2"
                      style={t.active ? { background: 'var(--glass-strong)', border: '1px solid var(--glass-border)' } : { opacity: 0.4 }}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: t.active ? 1 : 0.4, x: 0 }}
                      transition={{ delay: 0.15 * i }}
                    >
                      {t.active ? <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} /> : <Circle className="w-3.5 h-3.5 text-faint" />}
                      <span className="text-[12px]" style={{ color: t.active ? 'var(--text)' : 'var(--text-faint)' }}>{t.label}</span>
                      {t.active && <Timer className="w-3.5 h-3.5 ml-auto" style={{ color: 'var(--text-muted)' }} />}
                    </motion.div>
                  ))}
                </div>
              )}

              {feature.type === 'memory' && (
                <div className="p-4 h-full flex items-center justify-center relative">
                  <motion.div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(131,53,253,0.25), rgba(131,53,253,0.05))', border: '1px solid var(--glass-border)' }}
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Brain className="w-6 h-6" style={{ color: 'var(--violet)' }} />
                  </motion.div>
                  {['Day 12', 'Day 27', 'Day 41', 'Day 55'].map((d, i) => (
                    <motion.span
                      key={d}
                      className="absolute pill px-2 py-1 text-[9.5px] font-mono"
                      style={{
                        color: 'var(--text-muted)',
                        top: `${18 + i * 20}%`,
                        left: i % 2 === 0 ? '10%' : undefined,
                        right: i % 2 !== 0 ? '10%' : undefined,
                      }}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.15 }}
                    >
                      {d}
                    </motion.span>
                  ))}
                </div>
              )}

              {feature.type === 'proof' && (
                <div className="p-4 h-full flex items-center gap-3">
                  <div className="flex-1 rounded-lg p-2.5 font-mono text-[10px] leading-relaxed" style={{ background: 'var(--ink-3)', color: 'var(--text-faint)' }}>
                    <div className="flex items-center gap-1.5 mb-1"><CheckCircle2 className="w-3 h-3" />shipped auth</div>
                    <div className="flex items-center gap-1.5 mb-1"><CheckCircle2 className="w-3 h-3" />fixed 3 bugs</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" />wrote docs</div>
                  </div>
                  <Share2 className="w-4 h-4 shrink-0" style={{ color: 'var(--gold)' }} />
                  <motion.div
                    className="flex-1 rounded-lg p-2.5"
                    style={{ background: 'linear-gradient(135deg, rgba(242,184,75,0.15), rgba(131,53,253,0.1))', border: '1px solid var(--glass-border)' }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-[10px] font-semibold mb-1" style={{ color: 'var(--text)' }}>Day 41 update</p>
                    <p className="text-[9.5px] leading-snug" style={{ color: 'var(--text-muted)' }}>Auth shipped, 3 bugs fixed, docs written.</p>
                  </motion.div>
                </div>
              )}
            </div>

            <div className="mt-auto">
              <h3 className="text-[17px] font-semibold mb-1.5 font-display" style={{ color: 'var(--text)' }}>{feature.title}</h3>
              <p className="text-[13.5px] leading-relaxed text-muted">{feature.description}</p>
            </div>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}
