'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface Stat {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bg: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

function AnimatedCounter({ value }: { value: number }) {
  return (
    <span className="text-3xl font-bold animate-count" style={{ color: 'var(--text-primary)' }}>
      {value}
    </span>
  );
}

export function StatsGrid({ stats }: { stats: Stat[] }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={item}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-2xl border p-5 transition-all duration-200 cursor-default"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-default)',
            boxShadow: 'var(--shadow-card)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              <AnimatedCounter value={stat.value} />
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-200"
              style={{ background: stat.bg }}
            >
              <stat.icon className="w-7 h-7" style={{ color: stat.color }} />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
