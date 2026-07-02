// testimonials.tsx
"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Alytics gave us visibility we didn't even know we were missing. Within one week, we discovered which features were actually driving retention. Setup was smooth and fast.",
    author: "Marcus Lee",
    role: "Head of Product",
  },
  {
    quote:
      "Since switching to Alytics, we finally understand how users interact with our product. The event tracking is super intuitive and actionable.",
    author: "Sarah Bond",
    role: "Product Lead",
  },
  {
    quote:
      "We used Alytics to track onboarding drop-off and spotted a friction point instantly. After one small UX tweak, our activation rate jumped by 23%.",
    author: "Carter June",
    role: "Product Lead",
  },
  {
    quote:
      "I've tried nearly every analytics tool out there, and Alytics is by far the most intuitive. No need for devs to set things up—our marketing team was running insights independently in hours.",
    author: "Elena Park",
    role: "Marketing Director",
  },
  {
    quote:
      "It's like product analytics finally caught up with design. We use Alytics not just for numbers—but to tell the story behind them. It's become our go-to tool for every launch.",
    author: "James Nair",
    role: "Growth Manager",
  },
];

export default function Testimonials() {
  // Triple the testimonials for smoother infinite scroll
  const duplicatedTestimonials = [
    ...testimonials,
    ...testimonials,
    ...testimonials,
  ];

  return (
    <section className="py-24 overflow-hidden bg-[var(--bg)]">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-full text-sm font-medium mb-4 border border-purple-100 dark:border-purple-800">
            <Star className="w-3.5 h-3.5 fill-purple-600 text-purple-600" />
            Testimonials
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-4 tracking-tight">
            Loved by product teams
          </h2>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            See why top teams choose Alytics for their product analytics needs.
          </p>
        </motion.div>
      </div>

      <div className="relative">
        {/* Gradient masks for seamless fade */}
        <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-48 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-48 bg-gradient-to-l from-[var(--bg)] via-[var(--bg)]/80 to-transparent z-10 pointer-events-none" />
        <motion.div
          className="flex gap-6 px-4"
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          }}
        >
          {duplicatedTestimonials.map((testimonial, idx) => (
            <motion.div
              key={`${testimonial.author}-${idx}`}
              className="flex-shrink-0 w-[400px] bg-[var(--card)] rounded-2xl p-8 shadow-sm border border-[var(--border)] hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 group"
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              <Quote className="w-10 h-10 text-purple-200 dark:text-purple-800 mb-4 group-hover:text-purple-400 dark:group-hover:text-purple-600 transition-colors" />

              <p className="text-[var(--text)] text-base leading-relaxed mb-8 font-medium">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-[var(--border)]">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/30">
                  {testimonial.author[0]}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text)] text-base">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
