import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, CheckCircle2, Circle, Flame, Heart, MessageCircle, Repeat2 } from 'lucide-react';
import { FaAndroid } from 'react-icons/fa6';
import TiltCard from './TiltCard';

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

export default function Hero({ onGetStarted }: { onGetStarted?: () => void }) {
  return (
    <section className="relative pt-40 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
        {/* Copy */}
        <div>
          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="eyebrow mb-6">
            Built for people who start things
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display font-semibold leading-[1.03] mb-6"
            style={{ fontSize: 'clamp(2.6rem, 5.4vw, 4.6rem)', color: 'var(--text)' }}
          >
            You don't need
            <br />
            another planner.
            <br />
            <span style={{ color: 'var(--text-muted)' }}>You need to finish.</span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-lg leading-relaxed mb-9 max-w-lg"
            style={{ color: 'var(--text-muted)' }}
          >
            Most people don't fail because they lack goals. They fail because they never
            know exactly what to do today. Shift turns a goal into a roadmap, the roadmap
            into one task, and the task into proof you actually did the work.
          </motion.p>

          <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.25 }} className="flex flex-wrap items-center gap-4">
            <button onClick={onGetStarted} className="btn btn-primary text-[15px] py-3.5 px-6">
              Start your roadmap <ArrowRight className="w-4 h-4" />
            </button>
            <button className="btn btn-ghost text-[15px] py-3.5 px-6">
              See how it works
            </button>
            <a href="" className="btn btn-ghost text-[15px] py-3.5 px-6">
              <FaAndroid className="w-4 h-4" />
              Download for Android
            </a>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.35 }} className="flex items-center gap-6 mt-10 pt-8" style={{ borderTop: '1px solid var(--line)' }}>
            <div>
              <p className="font-display text-2xl font-semibold" style={{ color: 'var(--text)' }}>1</p>
              <p className="text-xs text-muted mt-0.5">task assigned per day</p>
            </div>
            <div className="w-px h-8" style={{ background: 'var(--line)' }} />
            <div>
              <p className="font-display text-2xl font-semibold" style={{ color: 'var(--text)' }}>0</p>
              <p className="text-xs text-muted mt-0.5">spreadsheets to maintain</p>
            </div>
            <div className="w-px h-8" style={{ background: 'var(--line)' }} />
            <div>
              <p className="font-display text-2xl font-semibold gold-text">∞</p>
              <p className="text-xs text-muted mt-0.5">proof, generated for you</p>
            </div>
          </motion.div>
        </div>

        {/* Signature visual: messy log -> proof */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative h-[440px] hidden lg:block perspective"
        >
          {/* Messy log card, tucked behind */}
          <TiltCard
            maxTilt={10}
            className="card absolute top-2 left-0 w-[300px] p-5 rotate-[-6deg]"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <p className="eyebrow mb-4" style={{ color: 'var(--text-faint)' }}>today's log</p>
            <ul className="space-y-2.5 font-mono text-[12.5px]" style={{ color: 'var(--text-faint)' }}>
              <li className="flex items-center gap-2"><Circle className="w-3 h-3 shrink-0" /> fix onboarding copy</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: 'var(--text-muted)' }} /> <span className="line-through">reply to emails</span></li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: 'var(--text-muted)' }} /> <span className="line-through">ship waitlist page</span></li>
              <li className="flex items-center gap-2"><Circle className="w-3 h-3 shrink-0" /> debug signup flow</li>
            </ul>
          </TiltCard>

          {/* Connector */}
          <motion.div
            className="absolute left-[240px] top-[190px] hidden xl:flex items-center gap-1.5 z-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <div className="pill px-3 py-1.5 text-[11px] font-mono" style={{ color: 'var(--gold)' }}>becomes</div>
            <ArrowUpRight className="w-4 h-4" style={{ color: 'var(--gold)' }} />
          </motion.div>

          {/* Proof card, up front */}
          <TiltCard
            maxTilt={12}
            className="glass-strong absolute bottom-2 right-0 w-[320px] rounded-3xl p-5 rotate-[4deg]"
            style={{ boxShadow: 'var(--shadow-lift)' }}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full shrink-0" style={{ background: 'linear-gradient(135deg, #9653fd, var(--gold))' }} />
              <div>
                <p className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>Building Shift</p>
                <p className="text-[11px] text-faint font-mono">Day 41 · shipped</p>
              </div>
              <div className="ml-auto w-5 h-5 rounded flex items-center justify-center" style={{ background: 'var(--gold)' }}>
                <Flame className="w-3 h-3" style={{ color: 'var(--ink)' }} />
              </div>
            </div>
            <p className="text-[13.5px] leading-relaxed mb-4" style={{ color: 'var(--text)' }}>
              Shipped the new signup flow and fixed the onboarding copy that was
              costing us activations. Small day. Real progress.
            </p>
            <div className="flex items-center gap-4 pt-3" style={{ borderTop: '1px solid var(--line)' }}>
              <span className="flex items-center gap-1.5 text-[11px] text-muted"><Heart className="w-3.5 h-3.5" /> 128</span>
              <span className="flex items-center gap-1.5 text-[11px] text-muted"><Repeat2 className="w-3.5 h-3.5" /> 19</span>
              <span className="flex items-center gap-1.5 text-[11px] text-muted"><MessageCircle className="w-3.5 h-3.5" /> 7</span>
            </div>
          </TiltCard>

          {/* Streak badge */}
          <motion.div
            className="glass absolute top-0 right-6 rounded-2xl px-3.5 py-2.5 flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, type: 'spring', stiffness: 220 }}
          >
            <Flame className="w-4 h-4" style={{ color: 'var(--gold)' }} />
            <span className="text-[12px] font-medium font-mono" style={{ color: 'var(--text)' }}>41-day streak</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
