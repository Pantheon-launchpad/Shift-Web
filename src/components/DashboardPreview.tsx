// dashboard.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  Users,
  FileText,
  Globe,
  MessageCircle,
  Handshake,
  Download,
  Settings,
  LogOut,
  ChevronDown,
  Star,
  Edit,
  MoreHorizontal,
  TrendingUp,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";

const growthData = [
  { year: "2016", value: 10 },
  { year: "2017", value: 25 },
  { year: "2018", value: 45 },
  { year: "2019", value: 30 },
  { year: "2020", value: 35 },
  { year: "2021", value: 55 },
  { year: "2022", value: 75 },
  { year: "2023", value: 95 },
];

const customers = [
  {
    name: "Chris Friedly",
    company: "Supermarket Villanova",
    avatar: "bg-amber-700",
  },
  {
    name: "Maggie Johnson",
    company: "Oasis Organic Inc.",
    avatar: "bg-emerald-600",
    active: true,
  },
  {
    name: "Gael Harry",
    company: "New York Finest Fruits",
    avatar: "bg-amber-800",
  },
  {
    name: "Jenna Sullivan",
    company: "Walmart",
    avatar: "bg-slate-500",
  },
];

const sidebarItems = [
  { icon: Search, label: "Search" },
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Users, label: "Customers", hasSubmenu: true },
  { icon: FileText, label: "All reports" },
  { icon: Globe, label: "Geography" },
  { icon: MessageCircle, label: "Conversations" },
  { icon: Handshake, label: "Deals" },
  { icon: Download, label: "Export" },
];

export default function DashboardPreview() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({
      x: (e.clientX - rect.left - rect.width / 2) / 40,
      y: (e.clientY - rect.top - rect.height / 2) / 40,
    });
  };

  return (
    <section id="product" className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-28">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="glass-strong rounded-[28px] overflow-hidden"
        style={{
          boxShadow: 'var(--shadow-lift)',
          transform: `perspective(1400px) rotateX(${-mouse.y}deg) rotateY(${mouse.x}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
        onMouseMove={handleMove}
        onMouseLeave={() => setMouse({ x: 0, y: 0 })}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: '1px solid var(--line)' }}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
          <span className="mx-auto text-[11px] font-mono text-faint">shift.app / today</span>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-56 p-4 hidden sm:block" style={{ borderRight: '1px solid var(--line)' }}>
            <div className="flex items-center gap-2 mb-8 px-1">
              <img src={logo} alt="Shift logo" className="w-6 h-6 rounded-md" />
              <span className="font-display font-semibold text-sm" style={{ color: 'var(--text)' }}>Shift</span>
            </div>
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-colors"
                  style={item.active
                    ? { background: 'var(--glass-strong)', color: 'var(--text)', border: '1px solid var(--glass-border)' }
                    : { color: 'var(--text-muted)' }}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--line)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                <span className="text-[12px] font-mono" style={{ color: 'var(--text)' }}>41-day streak</span>
              </div>
              <p className="text-[11px] text-faint">Longest run yet</p>
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 p-6">
            {/* Today's single task */}
            <TiltCard maxTilt={4} className="rounded-2xl p-5 mb-5" style={{ background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="eyebrow">Today's one task</div>
                <span className="pill px-2.5 py-1 text-[10.5px] font-mono flex items-center gap-1" style={{ color: 'var(--gold)' }}>
                  <Sparkles className="w-3 h-3" /> highest impact
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
                Fix the signup flow drop-off
              </h3>
              <p className="text-[13px] text-muted mb-4 leading-relaxed">
                Roadmap says growth is bottlenecked at activation. This is the one thing today
                that moves "First 10 users" forward the most.
              </p>
              <div className="flex items-center gap-3">
                <button className="btn btn-primary py-2 px-4 text-[13px]">
                  <Play className="w-3.5 h-3.5" /> Start focus session
                </button>
                <span className="text-[12px] text-faint font-mono">25:00</span>
              </div>
            </TiltCard>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Roadmap milestones */}
              <TiltCard maxTilt={5} className="rounded-2xl p-4" style={{ background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
                <h4 className="text-[13px] font-semibold mb-4" style={{ color: 'var(--text)' }}>Roadmap · First 10 users</h4>
                <div className="space-y-3">
                  {milestones.map((m) => (
                    <div key={m.label} className="flex items-center gap-3">
                      {m.done ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--violet)' }} />
                      ) : (
                        <Circle className="w-4 h-4 shrink-0" style={{ color: m.current ? 'var(--gold)' : 'var(--text-faint)' }} />
                      )}
                      <span className="text-[12.5px]" style={{ color: m.done ? 'var(--text-faint)' : 'var(--text)', textDecoration: m.done ? 'line-through' : 'none' }}>
                        {m.label}
                      </span>
                      {m.current && <span className="ml-auto text-[10px] font-mono gold-text">now</span>}
                    </div>
                  ))}
                </div>
              </TiltCard>

              {/* Progress chart */}
              <TiltCard maxTilt={5} className="rounded-2xl p-4" style={{ background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>Momentum</h4>
                  <span className="text-[11px] font-mono gold-text">+62%</span>
                </div>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={roadmapProgress}>
                      <defs>
                        <linearGradient id="momentumGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8335FD" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#8335FD" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke="#8335FD" strokeWidth={2} fill="url(#momentumGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-faint mt-2">Tasks finished, last 9 days</p>
              </TiltCard>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
