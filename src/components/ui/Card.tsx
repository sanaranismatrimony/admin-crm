'use client';

import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  style?: React.CSSProperties;
}

export function Card({ children, className = '', onClick, hover = false, style }: CardProps) {
  const Tag = onClick ? motion.div : motion.div;
  return (
    <Tag
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={`rounded-2xl border transition-all duration-200 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-default)',
        boxShadow: 'var(--shadow-card)',
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hover || onClick) {
          e.currentTarget.style.boxShadow = 'var(--shadow-elevated)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover || onClick) {
          e.currentTarget.style.boxShadow = 'var(--shadow-card)';
        }
      }}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ children, className = '', onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <div className={`px-6 py-4 border-b ${className}`} style={{ borderColor: 'var(--border-default)', ...style }} onClick={onClick}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}
