// howitworks.tsx
"use client";

import { motion } from "framer-motion";

const steps = [
  {
    title: "Connect your product",
    description:
      "Integrate in minutes with your existing stack—no engineering lift required.",
    type: "connect",
  },
  {
    title: "Track User Behavior",
    description:
      "See what's used, what's dropped, and what keeps users engaged.",
    type: "track",
  },
  {
    title: "Turn Insights Into Action",
    description:
      "Get clear, actionable recommendations to boost retention and grow MRR.",
    type: "action",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto ">
      {/* Header */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.span
          className="inline-flex items-center px-4 py-1.5 bg-[var(--card)] text-purple-600 rounded-full text-xs font-medium mb-4 border border-[var(--border)] shadow-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          How It Works
        </motion.span>
        <motion.h2
          className="text-4xl sm:text-[42px] font-bold text-[var(--text)] mb-4 leading-tight tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Get Clear Answers
          <br />
          In 3 Simple Steps
        </motion.h2>
        <motion.p
          className="text-[var(--text-muted)] text-base max-w-lg mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          From data to clarity—uncover insights, take action, and grow smarter
          in three simple steps.
        </motion.p>
      </motion.div>

      {/* Steps Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, idx) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15, duration: 0.5 }}
            className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)] shadow-sm hover:shadow-lg transition-shadow duration-300"
          >
            {/* Title and Description at top */}
            <h3 className="text-lg font-bold text-[var(--text)] mb-2">
              {step.title}
            </h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6">
              {step.description}
            </p>

            {/* Visual Content */}
            <div className="h-44 relative overflow-hidden bg-[var(--surface)]/30 rounded-xl">
              {step.type === "connect" && (
                <div className="relative w-full h-full">
                  {/* Concentric circles - very subtle */}
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 200 176"
                  >
                    <motion.ellipse
                      cx="100"
                      cy="88"
                      rx="85"
                      ry="70"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="1"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ delay: 0.3, duration: 1 }}
                    />
                    <motion.ellipse
                      cx="100"
                      cy="88"
                      rx="65"
                      ry="55"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="1"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ delay: 0.4, duration: 1 }}
                    />
                    <motion.ellipse
                      cx="100"
                      cy="88"
                      rx="45"
                      ry="38"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="1"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ delay: 0.5, duration: 1 }}
                    />
                  </svg>

                  {/* Center - blue circle with white plus */}
                  <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 bg-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/20 z-20"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </motion.div>

                  {/* Top left - N logo (black) */}
                  <motion.div
                    className="absolute w-8 h-8 bg-black rounded-lg flex items-center justify-center"
                    style={{ left: "12%", top: "15%" }}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7, type: "spring" }}
                  >
                    <span className="text-white font-bold text-lg italic">
                      N
                    </span>
                  </motion.div>

                  {/* Top right - orange swirl logo */}
                  <motion.div
                    className="absolute w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center"
                    style={{ right: "12%", top: "12%" }}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8, type: "spring" }}
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                    </svg>
                  </motion.div>

                  {/* Bottom left - teal circle with V */}
                  <motion.div
                    className="absolute w-8 h-8 bg-teal-400 rounded-full flex items-center justify-center"
                    style={{ left: "8%", bottom: "28%" }}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.9, type: "spring" }}
                  >
                    <span className="text-white font-bold text-sm">V</span>
                  </motion.div>

                  {/* Bottom right - purple hexagon */}
                  <motion.div
                    className="absolute w-8 h-8 bg-purple-600 flex items-center justify-center"
                    style={{
                      right: "8%",
                      bottom: "25%",
                      clipPath:
                        "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.0, type: "spring" }}
                  >
                    <span className="text-white font-bold text-xs">K</span>
                  </motion.div>
                </div>
              )}

              {step.type === "track" && (
                <div className="relative w-full h-full flex flex-col items-center justify-end pb-4">
                  {/* Labels at top - diagonal */}
                  <motion.div
                    className="absolute top-6 left-6 flex items-center gap-1.5 transform -rotate-12"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <span className="text-[10px] text-[var(--text-muted)] font-medium">
                      Low Engagement
                    </span>
                    <span className="text-[9px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">
                      -8%
                    </span>
                  </motion.div>

                  <motion.div
                    className="absolute top-4 right-6 flex items-center gap-1.5 transform rotate-6"
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <span className="text-[10px] text-[var(--text-muted)] font-medium">
                      High Engagement
                    </span>
                    <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                      +12%
                    </span>
                  </motion.div>

                  {/* Gauge - half circle with gradient */}
                  <div className="relative w-40 h-20 mt-auto">
                    {/* Background track - very light blue */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden">
                      <div className="w-40 h-40 rounded-full border-[16px] border-purple-300" />
                    </div>

                    {/* Blue gradient arc */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <svg className="w-40 h-40" viewBox="0 0 160 160">
                        <defs>
                          <linearGradient
                            id="gaugeGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                          >
                            <stop offset="0%" stopColor="purple" />
                            <stop offset="100%" stopColor="purple" />
                          </linearGradient>
                        </defs>
                        <circle
                          cx="80"
                          cy="80"
                          r="64"
                          fill="none"
                          stroke="url(#gaugeGradient)"
                          strokeWidth="16"
                          strokeDasharray="201 402"
                          strokeDashoffset="0"
                          transform="rotate(-90 80 80)"
                        />
                      </svg>
                    </motion.div>

                    {/* Needle */}
                    <motion.div
                      className="absolute bottom-0 left-1/2 w-0.5 bg-gray-400 origin-bottom"
                      style={{ height: "60px" }}
                      initial={{ rotate: -90, opacity: 0 }}
                      whileInView={{ rotate: 45, opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.6, type: "spring" }}
                    >
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full" />
                    </motion.div>
                  </div>
                </div>
              )}

              {step.type === "action" && (
                <div className="relative w-full h-full flex items-end justify-center pb-2">
                  {/* Floating cards above envelope */}
                  <motion.div
                    className="absolute top-2 left-1/2 -translate-x-1/2 bg-[var(--card)] rounded-md px-3 py-1 shadow-md border border-[var(--border)] z-20"
                    initial={{ y: 15, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <span className="text-[10px] text-purple-500 font-medium">
                      Optimize
                    </span>
                  </motion.div>

                  <motion.div
                    className="absolute top-10 left-8 bg-[var(--card)] rounded-md px-2.5 py-1 shadow-md border border-[var(--border)] transform -rotate-12 z-20"
                    initial={{ x: -15, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <span className="text-[9px] text-purple-500 font-bold">
                      Action
                    </span>
                  </motion.div>

                  <motion.div
                    className="absolute top-12 left-24 bg-[var(--card)] rounded-md px-2.5 py-1 shadow-md border border-[var(--border)] transform rotate-6 z-20"
                    initial={{ y: 15, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <span className="text-[9px] text-[var(--text-muted)]">
                      Fix churn spike
                    </span>
                  </motion.div>

                  <motion.div
                    className="absolute top-10 right-8 bg-[var(--card)] rounded-md px-2.5 py-1 shadow-md border border-[var(--border)] transform rotate-12 z-20"
                    initial={{ x: 15, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <span className="text-[9px] text-[var(--text)] font-bold">
                      $30,982
                    </span>
                  </motion.div>

                  {/* Envelope at bottom */}
                  <motion.div
                    className="relative w-44 h-24 z-10"
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {/* Envelope body */}
                    <div className="absolute inset-0 bg-[var(--surface)] rounded-lg overflow-hidden">
                      {/* Bottom part */}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-[var(--surface)]" />

                      {/* Side flaps */}
                      <div
                        className="absolute bottom-0 left-0 w-22 h-16 bg-[var(--surface)]"
                        style={{ clipPath: "polygon(0 100%, 100% 0, 0 0)" }}
                      />
                      <div
                        className="absolute bottom-0 right-0 w-22 h-16 bg-[var(--surface)]"
                        style={{ clipPath: "polygon(100% 100%, 100% 0, 0 0)" }}
                      />

                      {/* Top flap */}
                      <div
                        className="absolute top-0 left-0 right-0 h-12 bg-gray-200 border-b border-gray-300"
                        style={{ clipPath: "polygon(0 0, 50% 100%, 100% 0)" }}
                      />
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
