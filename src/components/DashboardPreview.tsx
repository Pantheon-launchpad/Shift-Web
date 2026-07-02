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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 25;
    const y = (e.clientY - rect.top - rect.height / 2) / 25;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-20">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[var(--card)] rounded-3xl shadow-2xl overflow-hidden border border-[var(--border)]"
        style={{
          transform: `perspective(1000px) rotateX(${-mousePosition.y}deg) rotateY(${
            mousePosition.x
          }deg)`,
          transition: "transform 0.1s ease-out",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-[var(--surface)] border-r border-[var(--border)] p-4 hidden sm:block">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-purple-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">+</span>
              </div>
              <span className="font-bold text-[var(--text)]">Shift</span>
            </div>

            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                    item.active
                      ? "bg-[var(--card)] text-purple-600 shadow-sm"
                      : "text-[var(--text-muted)] hover:bg-[var(--card)]"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.hasSubmenu && (
                    <ChevronDown className="w-4 h-4 ml-auto" />
                  )}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-[var(--border)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">
                    Gustavo Xavier
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">Admin</p>
                </div>
              </div>
              <button className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-muted)] w-full">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-muted)] w-full">
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                {
                  title: "Revenues",
                  value: "15%",
                  subtext: "Increase compared to last week",
                  link: "Revenues report",
                  color: "purple",
                },
                {
                  title: "Lost deals",
                  value: "4%",
                  subtext: "You closed 96 out of 100 deals",
                  link: "All deals",
                  color: "gray",
                },
                {
                  title: "Quarter goal",
                  value: "84%",
                  subtext: "",
                  link: "All goals",
                  color: "purple",
                  isChart: true,
                },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.title}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onMouseEnter={() => setHoveredCard(stat.title)}
                  onMouseLeave={() => setHoveredCard(null)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-[var(--text-muted)]">
                      {stat.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-[var(--text)]">
                      {stat.value}
                    </span>
                    {!stat.isChart && (
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                    )}
                  </div>
                  {stat.subtext && (
                    <p className="text-xs text-[var(--text-muted)] mb-3">
                      {stat.subtext}
                    </p>
                  )}
                  {stat.isChart && (
                    <div className="h-16 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[{ value: 60 }, { value: 84 }]}>
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#a855f7"
                            fill="#a855f7"
                            fillOpacity={0.2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  
                    <a href="#"
                    className="text-sm text-purple-600 hover:underline flex items-center gap-1"
                  >
                    {stat.link} <span>→</span>
                  </a>
                </motion.div>
              ))}
            </div>

            {/* Customers & Growth */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Customers List */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-[var(--text)]">
                    Customers
                  </h3>
                  <button className="text-sm text-[var(--text-muted)] flex items-center gap-1">
                    Sort by Newest <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {customers.map((customer, idx) => (
                    <div
                      key={customer.name}
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        customer.active
                          ? "bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800"
                          : "hover:bg-[var(--surface)]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full ${customer.avatar}`}
                        />
                        <div>
                          <p className="text-sm font-medium text-[var(--text)]">
                            {customer.name}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {customer.company}
                          </p>
                        </div>
                      </div>
                      {customer.active && (
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 hover:bg-[var(--card)] rounded-lg">
                            <Search className="w-4 h-4 text-[var(--text-muted)]" />
                          </button>
                          <button className="p-1.5 hover:bg-[var(--card)] rounded-lg">
                            <Star className="w-4 h-4 text-purple-500 fill-purple-500" />
                          </button>
                          <button className="p-1.5 hover:bg-[var(--card)] rounded-lg">
                            <Edit className="w-4 h-4 text-[var(--text-muted)]" />
                          </button>
                          <button className="p-1.5 hover:bg-[var(--card)] rounded-lg">
                            <MoreHorizontal className="w-4 h-4 text-[var(--text-muted)]" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                  <a href="#"
                  className="text-sm text-purple-600 mt-4 inline-flex items-center gap-1"
                >
                  All customers <span>→</span>
                </a>
              </div>

              {/* Growth Chart */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-[var(--text)]">Growth</h3>
                  <button className="text-sm text-[var(--text-muted)] flex items-center gap-1">
                    Yearly <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData}>
                      <defs>
                        <linearGradient
                          id="colorValue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#a855f7"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#a855f7"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="year"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#a855f7"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[var(--border)]">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">
                      Top month
                    </p>
                    <p className="text-lg font-bold text-purple-600">
                      November
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">2019</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">
                      Top year
                    </p>
                    <p className="text-lg font-bold text-purple-600">2023</p>
                    <p className="text-xs text-[var(--text-muted)]">96K sold so far</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">
                      Top buyer
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-600" />
                      <div>
                        <p className="text-xs font-medium text-[var(--text)]">
                          Maggie Johnson
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          Oasis Organic Inc.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Chats */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
                <h3 className="font-semibold text-[var(--text)] mb-1">Chats</h3>
                <p className="text-xs text-[var(--text-muted)] mb-4">
                  2 unread messages
                </p>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-[var(--surface)] border-2 border-[var(--card)]"
                    />
                  ))}
                </div>
              </div>

              {/* Top States */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
                <h3 className="font-semibold text-[var(--text)] mb-4">
                  Top states
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--text)]">
                        NY
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-1 mx-4">
                      <div className="flex-1 h-2 bg-[var(--surface)] rounded-full overflow-hidden">
                        <div className="w-[80%] h-full bg-purple-500 rounded-full" />
                      </div>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      120K
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--text)]">
                        MA
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-1 mx-4">
                      <div className="flex-1 h-2 bg-[var(--surface)] rounded-full overflow-hidden">
                        <div className="w-[60%] h-full bg-purple-500 rounded-full" />
                      </div>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      80K
                    </span>
                  </div>
                </div>
              </div>

              {/* New Deals */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
                <h3 className="font-semibold text-[var(--text)] mb-4">
                  New deals
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Fruit2Go",
                    "Marshall's MKT",
                    "CCNT",
                    "Joana Mini-market",
                  ].map((deal) => (
                    <span
                      key={deal}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-full text-xs font-medium"
                    >
                      <span className="w-4 h-4 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center text-[10px]">
                        +
                      </span>
                      {deal}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}