// features.tsx
'use client';

import { motion } from 'framer-motion';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';

const features = [
  {
    title: 'Unified Metrics',
    description: 'See your MRR and active users in one clean, unified view — no more switching tabs.',
    type: 'metrics'
  },
  {
    title: 'AI Growth Insights',
    description: 'Actionable suggestions from your data, without digging into spreadsheets or dashboards.',
    type: 'ai'
  },
  {
    title: 'Product Usage Tracking',
    description: 'Track how users engage with your app live to uncover patterns and optimize features.',
    type: 'tracking'
  },
  {
    title: 'Feature Impact Analysis',
    description: 'Know exactly which features drive long-term retention—and which ones don\'t contribute.',
    type: 'impact'
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto bg-[#f8f9fa]">
      {/* Header */}
      <motion.div 
        className="text-center mb-14"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.span 
          className="inline-block px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs font-medium mb-4 border border-purple-100"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Unique Features
        </motion.span>
        <motion.h2 
          className="text-3xl sm:text-[32px] font-bold text-gray-900 mb-3 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Make Your Platform<br />Work Harder For You
        </motion.h2>
        <motion.p 
          className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          Streamline your business with unified metrics and AI-powered analytics—all in one place.
        </motion.p>
      </motion.div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.12, duration: 0.5 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-shadow duration-300 flex flex-col"
          >
            {/* Card Content - Fixed height container */}
            <div className="mb-4 flex-shrink-0">
              {feature.type === 'metrics' && (
                <div className="bg-[#f8f9fa] rounded-xl p-4 h-36 relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">MRR</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-900">$69,897</span>
                        <motion.span 
                          className="text-[10px] text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded font-medium"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                        >+12%</motion.span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">Active users</p>
                      <span className="text-xl font-bold text-gray-900">1206</span>
                    </div>
                  </div>
                  
                  {/* Chart */}
                  <div className="absolute bottom-2 left-4 right-4 h-14">
                    <svg className="w-full h-full" viewBox="0 0 300 60" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="purple" stopOpacity="0.15"/>
                          <stop offset="100%" stopColor="purple" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <motion.path
                        d="M 0 50 L 30 48 L 60 45 L 90 38 L 120 40 L 150 30 L 180 32 L 210 22 L 240 25 L 270 15 L 300 12 L 300 60 L 0 60 Z"
                        fill="url(#chartGradient)"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      />
                      <motion.path
                        d="M 0 50 L 30 48 L 60 45 L 90 38 L 120 40 L 150 30 L 180 32 L 210 22 L 240 25 L 270 15 L 300 12"
                        fill="none"
                        stroke="#770477f8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                      <motion.circle
                        cx="300"
                        cy="12"
                        r="4"
                        fill="#770477f8"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
                      />
                    </svg>
                  </div>
                </div>
              )}

              {feature.type === 'ai' && (
                <div className="bg-[#f8f9fa] rounded-xl p-4 h-36 relative overflow-hidden">
                  {/* Center Star */}
                  <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/20">
                      <Star className="w-6 h-6 text-white fill-white" />
                    </div>
                  </motion.div>
                  
                  {/* Tags positioned around */}
                  <motion.div
                    className="absolute top-2 left-2 px-2 py-1 rounded-full text-[9px] font-medium bg-gray-100 text-gray-600"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Raise pricing tier
                  </motion.div>
                  
                  <motion.div
                    className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full text-[9px] font-medium bg-purple-100 text-purple-600 ring-2 ring-purple-200"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Optimize onboarding flow
                  </motion.div>
                  
                  <motion.div
                    className="absolute top-2 right-2 px-2 py-1 rounded-full text-[9px] font-medium bg-gray-100 text-gray-600"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    Test premium model
                  </motion.div>
                  
                  <motion.div
                    className="absolute top-1/2 right-2 -translate-y-1/2 px-2 py-1 rounded-full text-[9px] font-medium bg-gray-100 text-gray-600"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    Fix churn spike
                  </motion.div>
                  
                  <motion.div
                    className="absolute bottom-8 left-2 px-2 py-1 rounded-full text-[9px] font-medium bg-gray-100 text-gray-600"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    Target high-retention users
                  </motion.div>
                  
                  <motion.div
                    className="absolute bottom-2 left-1/4 px-2 py-1 rounded-full text-[9px] font-medium bg-gray-100 text-gray-600"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    Improve feature adoption
                  </motion.div>
                  
                  <motion.div
                    className="absolute bottom-2 right-4 px-2 py-1 rounded-full text-[9px] font-medium bg-gray-100 text-gray-600"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.0 }}
                  >
                    Refine upgrade prompt
                  </motion.div>
                </div>
              )}

              {feature.type === 'tracking' && (
                <div className="bg-[#f8f9fa] rounded-xl p-3 h-36 overflow-hidden">
                  <div className="space-y-2">
                    {[
                      { name: 'Nuvio Integration', change: '+12%', up: true, color: 'bg-purple-600', delay: 0 },
                      { name: 'Klyra Integration', change: '-8%', up: false, color: 'bg-orange-500', delay: 0.1 },
                      { name: 'Veltix Integration', change: '+10%', up: true, color: 'bg-sky-500', delay: 0.2 },
                    ].map((item, i) => (
                      <motion.div
                        key={item.name}
                        className="flex items-center justify-between bg-white rounded-lg p-2.5"
                        initial={{ x: -15, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 + item.delay }}
                        whileHover={{ x: 3 }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white font-bold text-xs">{item.name[0]}</span>
                          </div>
                          <span className="text-xs font-medium text-gray-800">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-semibold ${item.up ? 'text-purple-600' : 'text-red-500'}`}>
                            {item.change}
                          </span>
                          {item.up ? (
                            <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {feature.type === 'impact' && (
                <div className="bg-[#f8f9fa] rounded-xl p-3 h-36 relative overflow-hidden">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-1 relative z-10">
                    <span className="text-xs text-gray-500 font-medium">Retention</span>
                    <motion.div 
                      className="flex items-center gap-1 text-[10px] text-purple-600 bg-purple-50 px-2 py-1 rounded-full font-medium"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <span>+14%</span>
                      <TrendingUp className="w-3 h-3" />
                    </motion.div>
                  </div>
                  
                  {/* Chart */}
                  <div className="h-20 relative">
                    <svg className="w-full h-full" viewBox="0 0 260 70" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="purple" stopOpacity="0.25"/>
                          <stop offset="100%" stopColor="purple" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      
                      <motion.path
                        d="M 0 55 Q 35 60, 65 40 Q 95 20, 130 48 Q 165 75, 195 32 Q 225 10, 260 22 L 260 70 L 0 70 Z"
                        fill="url(#retentionGradient)"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      />
                      
                      <motion.path
                        d="M 0 55 Q 35 60, 65 40 Q 95 20, 130 48 Q 165 75, 195 32 Q 225 10, 260 22"
                        fill="none"
                        stroke="#770477f8"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        transition={{ duration: 1.8, ease: "easeOut" }}
                      />
                    </svg>
                  </div>

                  {/* Floating Avatars */}
                  <motion.div
                    className="absolute top-8 left-4 flex items-center gap-2 bg-white rounded-full pl-1 pr-2.5 py-1 shadow-sm border border-gray-100"
                    initial={{ y: -10, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                  >
                    <div className="w-5 h-5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-[9px] text-white font-bold">B</div>
                    <span className="text-[9px] text-gray-600 font-medium">Sabrina Joseph is back</span>
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  </motion.div>

                  <motion.div
                    className="absolute bottom-6 right-3 flex items-center gap-2 bg-white rounded-full pl-1 pr-2.5 py-1 shadow-sm border border-gray-100"
                    initial={{ y: 10, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                  >
                    <div className="w-5 h-5 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold">N</div>
                    <span className="text-[9px] text-gray-600 font-medium">Natalie Williams is back</span>
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  </motion.div>
                </div>
              )}
            </div>

            {/* Text Content - Separate from visual content */}
            <div className="mt-auto">
              <motion.h3 
                className="text-base font-bold text-gray-900 mb-1.5"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              >
                {feature.title}
              </motion.h3>
              <motion.p 
                className="text-gray-500 text-xs leading-relaxed"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
              >
                {feature.description}
              </motion.p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}