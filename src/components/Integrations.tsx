// integrations.tsx
'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const integrations = [
  { name: 'Nuvio', color: 'bg-purple-500', icon: 'N' },
  { name: 'Klyra', color: 'bg-orange-500', icon: 'K' },
  { name: 'Knot', color: 'bg-gray-800', icon: 'K' },
  { name: 'Veltix', color: 'bg-purple-400', icon: 'V' },
];

export default function Integrations() {
  const duplicatedIntegrations = [...integrations, ...integrations, ...integrations];

  return (
    <section id="integrations" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-sm font-medium mb-4">
            Integrations
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Seamless Integrations
          </h2>
          <p className="text-gray-600 mb-8">
            Connect Alytics with your favorite tools to streamline workflows and keep everything running smoothly.
          </p>
          <button className="bg-purple-900 text-white px-6 py-3 rounded-full font-medium hover:bg-purple-700 transition-colors">
            Get Started Now
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-6 border border-gray-200 shadow-lg overflow-hidden h-80 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white z-10 pointer-events-none" />
          
          <motion.div 
            className="space-y-4"
            animate={{ y: [0, -200] }}
            transition={{ 
              duration: 15, 
              repeat: Infinity, 
              ease: "linear",
              repeatType: "loop"
            }}
          >
            {duplicatedIntegrations.map((integration, idx) => (
              <motion.div 
                key={`${integration.name}-${idx}`} 
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
                whileHover={{ scale: 1.02, x: 10 }}
              >
                <div className={`w-12 h-12 ${integration.color} rounded-xl flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">{integration.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 rounded-full w-3/4 mb-2" />
                  <div className="h-2 bg-gray-200 rounded-full w-1/2" />
                </div>
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}