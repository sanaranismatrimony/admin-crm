'use client';

import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants: Record<string, React.CSSProperties> = {
  primary: {
    background: 'var(--gold)',
    color: '#fff',
    boxShadow: 'var(--shadow-sm)',
  },
  secondary: {
    background: 'var(--text-primary)',
    color: 'var(--bg-card)',
    boxShadow: 'var(--shadow-sm)',
  },
  outline: {
    border: '2px solid var(--gold)',
    color: 'var(--gold)',
    background: 'transparent',
  },
  ghost: {
    color: 'var(--text-secondary)',
    background: 'transparent',
  },
  danger: {
    background: 'var(--red)',
    color: '#fff',
    boxShadow: 'var(--shadow-sm)',
  },
};

const sizes: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, disabled, className = '', style, ...props }, ref) => {
    const base = variants[variant] || variants.primary;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${className}`}
        style={{
          ...base,
          ...style,
        }}
        onMouseEnter={(e) => {
          if (variant === 'primary') {
            e.currentTarget.style.background = 'var(--gold-dark)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          } else if (variant === 'outline') {
            e.currentTarget.style.background = 'var(--gold)';
            e.currentTarget.style.color = '#fff';
          } else if (variant === 'ghost') {
            e.currentTarget.style.background = 'var(--cream-dark)';
          } else if (variant === 'danger') {
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          } else if (variant === 'secondary') {
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }
        }}
        onMouseLeave={(e) => {
          if (variant === 'primary') {
            e.currentTarget.style.background = 'var(--gold)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          } else if (variant === 'outline') {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--gold)';
          } else if (variant === 'ghost') {
            e.currentTarget.style.background = 'transparent';
          } else if (variant === 'danger') {
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          } else if (variant === 'secondary') {
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }
        }}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
