import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import TiltCard from './TiltCard';
import logo from '../assets/logo.svg';

const comparisonData = {
  others: [
    'A backlog that grows faster than you clear it',
    'You decide what to work on, every single morning',
    'Progress lives in your head, if anywhere',
    'Sharing progress means writing it from scratch',
    'Miss a week and the whole plan feels stale',
  ],
  shift: [
    'One task, chosen for you, every morning',
    'The roadmap decides what matters today',
    'Progress is tracked and dated automatically',
    'A shareable update is ready before you ask',
    'The plan adjusts instead of guilting you back',
  ],
};

export default function Comparison() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="text-center mb-14">
        <div className="eyebrow justify-center mb-4">Not a planner</div>
        <h2 className="font-display font-semibold mb-4" style={{ fontSize: 'clamp(1.9rem, 3.4vw, 2.75rem)', color: 'var(--text)' }}>
          Planning was never the hard part
        </h2>
        <p className="text-muted max-w-lg mx-auto leading-relaxed">
          Most productivity apps help you organize ambitions. Shift turns them into daily execution.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid md:grid-cols-2 gap-5 perspective"
      >
        <TiltCard maxTilt={6} className="card p-7">
          <h3 className="text-lg font-display font-semibold mb-6" style={{ color: 'var(--text-muted)' }}>Other productivity apps</h3>
          <ul className="space-y-4">
            {comparisonData.others.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-[14px] text-faint">
                <X className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--text-faint)' }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </TiltCard>

        <TiltCard maxTilt={9} className="glass-strong rounded-[20px] p-7 relative" style={{ border: '1px solid rgba(131,53,253,0.35)' }}>
          <div className="flex items-center gap-2 mb-6">
            <img src={logo} alt="Shift logo" className="w-7 h-7 rounded-lg" />
            <h3 className="text-lg font-display font-semibold" style={{ color: 'var(--text)' }}>Shift</h3>
          </div>
          <ul className="space-y-4">
            {comparisonData.shift.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-[14px] font-medium" style={{ color: 'var(--text)' }}>
                <div className="w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--violet)' }}>
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </TiltCard>
      </motion.div>
    </section>
  );
}
