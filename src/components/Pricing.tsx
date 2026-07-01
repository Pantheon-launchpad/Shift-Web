import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: 39,
    description: 'Great for small teams getting started.',
    features: ['5,000 tracked users', 'Core analytics', 'Simple dashboards', 'Email support', 'Weekly reports']
  },
  {
    name: 'Growth',
    price: 99,
    description: 'For fast-growing teams who are scaling.',
    features: ['50,000 tracked users', 'Funnel & drop-off analysis', 'Custom dashboards', 'Team collaboration tools', 'Everything in Starter'],
    popular: true
  },
  {
    name: 'Premium',
    price: 299,
    description: 'Great for enterprises to convert more.',
    features: ['Unlimited tracked users', 'Dedicated account manager', 'SLA & compliance support', 'Advanced integrations', 'All Growth features']
  }
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-sm font-medium mb-4">
          Our Pricing
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Choose The Best<br />Plan That Suites You
        </h2>
        <p className="text-gray-600 mb-8">
          Flexible pricing built for every stage — from startup to scale, no hidden fees.
        </p>

        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm ${!isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-14 h-7 bg-purple-800 rounded-full transition-colors"
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${isYearly ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm ${isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>Yearly</span>
          {isYearly && <span className="text-xs text-purple-900 bg-purple-50 px-2 py-1 rounded-full">Save 20%</span>}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className={`relative bg-white rounded-3xl p-6 border ${plan.popular ? 'border-purple-900 shadow-xl shadow-purple-500/10' : 'border-gray-200'}`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-900 text-white text-xs font-medium px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-bold text-gray-900">${isYearly ? Math.round(plan.price * 0.8) : plan.price}</span>
              <span className="text-gray-500">/month</span>
            </div>
            <p className="text-sm text-gray-600 mb-6">{plan.description}</p>

            <p className="text-sm font-medium text-gray-900 mb-4">What's included</p>
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-purple-800" />
                  {feature}
                </li>
              ))}
            </ul>

            <button className={`w-full py-3 rounded-full font-medium transition-colors ${plan.popular ? 'bg-purple-900 text-white hover:bg-purple-800' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
              Get Started
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}