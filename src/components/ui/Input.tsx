'use client';

import { forwardRef } from 'react';
import type { ConfidenceLevel } from '@/types';
import { ConfidenceDot } from '@/components/ui/ConfidenceDot';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  confidence?: ConfidenceLevel;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', confidence, id, ...props }, ref) => {
    const inputId = id || props.name;

    const borderStyle: React.CSSProperties = {
      borderColor: error ? 'var(--red)' : confidence === 'low' ? 'var(--amber)' : 'var(--border-input)',
    };

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium inline-flex items-center" style={{ color: 'var(--text-secondary)' }}>
            {label}
            {confidence && <ConfidenceDot level={confidence} />}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm placeholder:transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40 focus:border-[var(--gold)] ${className}`}
          style={{
            ...borderStyle,
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
          }}
          {...props}
        />
        {error && <p className="text-xs mt-0.5" style={{ color: 'var(--red)' }}>{error}</p>}
        {helperText && !error && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
