// Benefits.tsx
import { motion } from "framer-motion";
import {
  Clock,
  LayoutDashboard,
  Send,
  Lock,
  FileText,
  MousePointer,
} from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Real-Time Tracking",
    description: "Monitor user activity instantly for smarter decision-making.",
  },
  {
    icon: LayoutDashboard,
    title: "All-in-One View",
    description:
      "Keep all your analytics in one place, without jumping between tools.",
  },
  {
    icon: Send,
    title: "Actionable Insights",
    description:
      "Track the metrics that matter most for sustainable business growth.",
  },
  {
    icon: Lock,
    title: "Secure Data",
    description:
      "Keep your analytics safe with advanced security and strong encryption.",
  },
  {
    icon: FileText,
    title: "Custom Reports",
    description:
      "Create tailored reports that fit your needs and highlight key insights.",
  },
  {
    icon: MousePointer,
    title: "Simple to Use",
    description:
      "Navigate easily—no steep learning curve, start making better decisions quickly.",
  },
];

export default function Benefits() {
  return (
    <section
      id="benefits"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-full text-sm font-medium mb-4">
          Benefits
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text)] mb-4">
          Benefits That Truly
          <br />
          Matter To You
        </h2>
        <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
          Monitor metrics as they happen, so you can respond quickly and keep
          your goals on track.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit, idx) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)] hover:shadow-lg transition-shadow"
          >
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mb-4">
              <benefit.icon className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text)] mb-2">
              {benefit.title}
            </h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              {benefit.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}