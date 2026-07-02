'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import TiltCard from './TiltCard';

const testimonials = [
  {
    quote: "I had the same 'launch by Q2' goal on three different apps for a year. Shift is the first one that gave me something to actually do today.",
    author: 'Priya Raman',
    role: 'Solo founder',
  },
  {
    quote: "The nightly debrief takes two minutes and somehow I've kept a 60-day streak. I didn't think I was a streak person.",
    author: 'Diego Alvarez',
    role: 'Indie developer',
  },
  {
    quote: "I stopped dreading my build-in-public posts. Shift already has them written from what I actually did that day.",
    author: 'Hana Kobayashi',
    role: 'Product designer',
  },
  {
    quote: "It's not another place to write goals. It's the thing that tells me which one goal matters today, and that's the part I was missing.",
    author: 'Marcus Webb',
    role: 'Freelance engineer',
  },
  {
    quote: "The roadmap actually moved when my plans changed. Most tools make you start over. This one just adjusted.",
    author: 'Lena Fischer',
    role: 'Early-stage founder',
  },
];

const duplicated = [...testimonials, ...testimonials, ...testimonials];

export default function Testimonials() {
  return (
    <section className="py-24 overflow-hidden">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="eyebrow justify-center mb-4">People who finished things</div>
          <h2 className="font-display font-semibold mb-4" style={{ fontSize: 'clamp(1.9rem, 3.4vw, 2.75rem)', color: 'var(--text)' }}>
            Not testimonials about a tool.
            <br />Testimonials about a habit.
          </h2>
        </motion.div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-48 z-10 pointer-events-none" style={{ background: 'linear-gradient(90deg, var(--ink), transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-48 z-10 pointer-events-none" style={{ background: 'linear-gradient(270deg, var(--ink), transparent)' }} />

        <motion.div
          className="flex gap-5 px-4 perspective"
          animate={{ x: ['0%', '-33.33%'] }}
          transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
        >
          {duplicated.map((t, idx) => (
            <TiltCard
              key={`${t.author}-${idx}`}
              maxTilt={6}
              className="glass flex-shrink-0 w-[380px] rounded-3xl p-7"
            >
              <div className="flex items-center gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5" style={{ fill: 'var(--gold)', color: 'var(--gold)' }} />
                ))}
              </div>
              <Quote className="w-8 h-8 mb-3" style={{ color: 'var(--line-strong)' }} />
              <p className="text-[14.5px] leading-relaxed mb-7" style={{ color: 'var(--text)' }}>{t.quote}</p>
              <div className="flex items-center gap-3 pt-5" style={{ borderTop: '1px solid var(--line)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-semibold text-sm text-white" style={{ background: 'linear-gradient(135deg, #9653fd, var(--gold))' }}>
                  {t.author[0]}
                </div>
                <div>
                  <p className="font-medium text-[13.5px]" style={{ color: 'var(--text)' }}>{t.author}</p>
                  <p className="text-[12px] text-faint">{t.role}</p>
                </div>
              </div>
            </TiltCard>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
