'use client';

import { motion } from 'framer-motion';
import { FaXTwitter, FaLinkedin, FaThreads, FaMedium, FaGithub } from 'react-icons/fa6';

const destinations = [
  { name: 'X / Twitter', Icon: FaXTwitter },
  { name: 'LinkedIn', Icon: FaLinkedin },
  { name: 'Threads', Icon: FaThreads },
  { name: 'Medium', Icon: FaMedium },
  { name: 'GitHub', Icon: FaGithub },
];

const duplicated = [...destinations, ...destinations, ...destinations];

export default function LogoCloud() {
  return (
    <section className="py-14 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <p className="text-center eyebrow justify-center">Your proof, wherever people look</p>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-48 z-10 pointer-events-none" style={{ background: 'linear-gradient(90deg, var(--ink), transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-48 z-10 pointer-events-none" style={{ background: 'linear-gradient(270deg, var(--ink), transparent)' }} />

        <motion.div
          className="flex gap-16 items-center px-8"
          animate={{ x: ['0%', '-33.33%'] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        >
          {duplicated.map((d, idx) => (
            <div key={`${d.name}-${idx}`} className="flex-shrink-0 flex items-center gap-2.5 opacity-50 hover:opacity-100 transition-opacity">
              <d.Icon className="w-5 h-5" style={{ color: 'var(--text)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{d.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
