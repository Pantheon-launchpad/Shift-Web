// logocloud.tsx
'use client';

import { motion } from 'framer-motion';

export default function LogoCloud() {
  const logos = [
    { 
      name: 'LOOAO', 
      svg: (
        <svg viewBox="0 0 120 40" className="h-8 w-auto">
          <text x="0" y="30" className="text-3xl font-bold fill-gray-400 tracking-wider">LOOAO</text>
          <circle cx="105" cy="8" r="3" className="fill-gray-400"/>
        </svg>
      )
    },
    { 
      name: 'Logoipsum', 
      svg: (
        <svg viewBox="0 0 140 40" className="h-8 w-auto">
          <circle cx="20" cy="20" r="15" className="fill-none stroke-gray-400" strokeWidth="2" strokeDasharray="4 2"/>
          <text x="42" y="28" className="text-2xl font-bold fill-gray-400">Logoipsum</text>
        </svg>
      )
    },
    { 
      name: 'CCC', 
      svg: (
        <svg viewBox="0 0 100 40" className="h-8 w-auto">
          <path d="M10 20 Q10 5, 25 5 Q40 5, 40 20 Q40 35, 25 35 Q10 35, 10 20" className="fill-none stroke-gray-400" strokeWidth="4" strokeLinecap="round"/>
          <path d="M35 20 Q35 5, 50 5 Q65 5, 65 20 Q65 35, 50 35 Q35 35, 35 20" className="fill-none stroke-gray-400" strokeWidth="4" strokeLinecap="round"/>
          <path d="M60 20 Q60 5, 75 5 Q90 5, 90 20 Q90 35, 75 35 Q60 35, 60 20" className="fill-none stroke-gray-400" strokeWidth="4" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      name: 'logoipsum', 
      svg: (
        <svg viewBox="0 0 140 40" className="h-8 w-auto">
          <g className="fill-gray-400">
            <circle cx="10" cy="20" r="4"/>
            <circle cx="22" cy="12" r="4"/>
            <circle cx="22" cy="28" r="4"/>
            <circle cx="34" cy="20" r="4"/>
            <circle cx="22" cy="20" r="4"/>
          </g>
          <text x="48" y="28" className="text-2xl font-bold fill-gray-400">logoipsum</text>
          <text x="128" y="15" className="text-lg fill-gray-400">®</text>
        </svg>
      )
    },
    { 
      name: 'Orbit', 
      svg: (
        <svg viewBox="0 0 120 40" className="h-8 w-auto">
          <ellipse cx="60" cy="20" rx="50" ry="15" className="fill-none stroke-gray-400" strokeWidth="2"/>
          <ellipse cx="60" cy="20" rx="40" ry="12" className="fill-none stroke-gray-400" strokeWidth="2"/>
          <ellipse cx="60" cy="20" rx="30" ry="9" className="fill-none stroke-gray-400" strokeWidth="2"/>
          <ellipse cx="60" cy="20" rx="20" ry="6" className="fill-none stroke-gray-400" strokeWidth="2"/>
        </svg>
      )
    },
  ];

  // Triple the logos for seamless infinite scroll
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <section className="py-16 bg-gray-50/50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 mb-10">
        <h3 className="text-center text-gray-900 text-lg font-semibold">
          Blindly trusted by
        </h3>
      </div>
      
      <div className="relative">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-48 bg-gradient-to-r from-gray-50/50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-48 bg-gradient-to-l from-gray-50/50 to-transparent z-10 pointer-events-none" />
        
        {/* Scrolling container */}
        <motion.div 
          className="flex gap-20 items-center px-8"
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear",
            repeatType: "loop"
          }}
        >
          {duplicatedLogos.map((logo, idx) => (
            <div 
              key={`${logo.name}-${idx}`} 
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-300"
            >
              {logo.svg}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}