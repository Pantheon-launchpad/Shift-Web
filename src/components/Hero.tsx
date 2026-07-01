// hero.tsx
import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';

export default function Hero() {
  return (
    <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center relative">
        {/* Floating logos with continuous animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute left-0 top-20 hidden lg:block"
        >
          <motion.div 
            className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute right-0 top-10 hidden lg:block"
        >
          <motion.div 
            className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="absolute left-10 bottom-0 hidden lg:block"
        >
          <motion.div 
            className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-2xl">N</div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute right-10 bottom-10 hidden lg:block"
        >
          <motion.div 
            className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          >
            <div className="w-12 h-12 bg-purple-600 rounded-xl rotate-45" />
          </motion.div>
        </motion.div>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-4 py-2 mb-6"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white" />
            ))}
          </div>
          <span className="text-purple-600 text-sm font-medium">Trusted by 1M+ users</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
        >
          Stop Planing Scattered Data<br /> Start Executing
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
        >
          One simple dashboard to track your SaaS growth, MRR, churn and user behavior—without the chaos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-3"
        >
          <button className="bg-purple-900 text-white px-8 py-3 rounded-full font-medium hover:bg-purple-700 transition-colors">
            Get Started For Free
          </button>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <CreditCard className="w-4 h-4" />
            <span>No credit card required</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}