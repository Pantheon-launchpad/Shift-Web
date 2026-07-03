import { useState } from 'react';
import { Check } from 'lucide-react';
import TiltCard from './TiltCard';

const plans = [
  {
    name: 'Starter',
    price: 0,
    description: 'For your first goal, and finding out if this actually works for you.',
    features: ['1 active roadmap', 'Daily task + focus timer', 'Nightly debrief', 'Basic proof cards'],
  },
  {
    name: 'Pro',
    price: 15,
    description: 'For the goal you\u2019re actually serious about right now.',
    features: ['Unlimited roadmaps', 'AI goal interview', 'Full memory across days', 'Build-in-public generator', 'Everything in Starter'],
    popular: true,
  },
  {
    name: 'Teams',
    price: 39,
    description: 'For small teams shipping toward one goal together.',
    features: ['Shared roadmaps', 'Team streaks', 'Priority support', 'Everything in Pro'],
  },
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <div className="eyebrow justify-center mb-4">Pricing</div>
        <h2 className="font-display font-semibold mb-4" style={{ fontSize: 'clamp(1.9rem, 3.4vw, 2.75rem)', color: 'var(--text)' }}>
          Simple, like the product
        </h2>
        <p className="text-muted mb-8 max-w-md mx-auto">
          Start free. Upgrade when the roadmap becomes something you actually rely on.
        </p>

        <div className="inline-flex items-center gap-4 pill px-4 py-2.5">
          <span className="text-sm" style={{ color: !isYearly ? 'var(--text)' : 'var(--text-muted)', fontWeight: !isYearly ? 600 : 400 }}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-11 h-6 rounded-full transition-colors"
            style={{ background: 'var(--violet)' }}
          >
            <div className="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform" style={{ transform: isYearly ? 'translateX(22px)' : 'translateX(4px)' }} />
          </button>
          <span className="text-sm" style={{ color: isYearly ? 'var(--text)' : 'var(--text-muted)', fontWeight: isYearly ? 600 : 400 }}>Yearly</span>
          {isYearly && <span className="text-xs gold-text font-mono">save 20%</span>}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto perspective">
        {plans.map((plan, idx) => (
          <TiltCard
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            maxTilt={plan.popular ? 10 : 7}
            className={plan.popular ? 'glass-strong rounded-3xl p-6 relative' : 'card p-6 relative'}
            style={plan.popular ? { border: '1px solid rgba(131,53,253,0.4)' } : undefined}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-medium px-3 py-1 rounded-full" style={{ background: 'linear-gradient(135deg, #9653fd, #6629c5)' }}>
                Most used
              </span>
            )}
            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text)' }}>{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="font-display text-4xl font-semibold" style={{ color: 'var(--text)' }}>${isYearly ? Math.round(plan.price * 0.8) : plan.price}</span>
              <span className="text-muted text-sm">/month</span>
            </div>
            <p className="text-[13px] text-muted mb-6">{plan.description}</p>

            <ul className="space-y-3 mb-7">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-[13.5px]" style={{ color: 'var(--text)' }}>
                  <Check className="w-4 h-4 shrink-0" style={{ color: 'var(--violet)' }} />
                  {feature}
                </li>
              ))}
            </ul>

            <button className={plan.popular ? 'btn btn-primary w-full justify-center' : 'btn btn-ghost w-full justify-center'}>
              {plan.price === 0 ? 'Start free' : 'Get started'}
            </button>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}
