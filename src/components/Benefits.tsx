import { Focus, Activity, BellRing, Sparkles, Share2, RefreshCcw } from 'lucide-react';
import TiltCard from './TiltCard';

const benefits = [
  {
    icon: Focus,
    title: 'One tab open at a time',
    description: 'A focus session with a timer and nothing else. No competing to-do lists fighting for your attention.',
  },
  {
    icon: Activity,
    title: 'Progress tracked without asking',
    description: 'Every finished task updates the roadmap automatically. You never have to log it twice.',
  },
  {
    icon: BellRing,
    title: 'Someone checks in',
    description: 'The nightly debrief is short, but it\u2019s there every day \u2014 the gentle accountability most apps skip.',
  },
  {
    icon: Sparkles,
    title: 'Gets sharper over time',
    description: 'Shift remembers what worked, what stalled, and what you actually finish \u2014 and adjusts the roadmap accordingly.',
  },
  {
    icon: Share2,
    title: 'Marketing you don\u2019t have to do',
    description: 'Your build-in-public post is already written by the time you\u2019d normally start dreading writing it.',
  },
  {
    icon: RefreshCcw,
    title: 'The plan moves when life does',
    description: 'Miss a day, change direction, get a new idea \u2014 the roadmap adapts instead of guilting you back to page one.',
  },
];

export default function Benefits() {
  return (
    <section id="benefits" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <div className="eyebrow justify-center mb-4">Why it holds up</div>
        <h2 className="font-display font-semibold mb-4" style={{ fontSize: 'clamp(1.9rem, 3.4vw, 2.75rem)', color: 'var(--text)' }}>
          The parts that make people stick around
        </h2>
        <p className="text-muted max-w-xl mx-auto leading-relaxed">
          None of this is flashy. It\u2019s just the difference between a tool you open once and a tool you use daily.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 perspective">
        {benefits.map((benefit, idx) => (
          <TiltCard
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08 }}
            maxTilt={7}
            className="card p-6"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: 'var(--glass-strong)', border: '1px solid var(--glass-border)' }}>
              <benefit.icon className="w-5 h-5" style={{ color: 'var(--violet)' }} />
            </div>
            <h3 className="text-[16px] font-display font-semibold mb-2" style={{ color: 'var(--text)' }}>{benefit.title}</h3>
            <p className="text-[13.5px] leading-relaxed text-muted">{benefit.description}</p>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}
