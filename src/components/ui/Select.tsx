'use client';

import { forwardRef } from 'react';
import type { ConfidenceLevel } from '@/types';
import { ConfidenceDot } from '@/components/ui/ConfidenceDot';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  confidence?: ConfidenceLevel;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', confidence, id, ...props }, ref) => {
    const selectId = id || props.name;

    const borderStyle: React.CSSProperties = {
      borderColor: error ? 'var(--red)' : confidence === 'low' ? 'var(--amber)' : 'var(--border-input)',
    };

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium inline-flex items-center" style={{ color: 'var(--text-secondary)' }}>
            {label}
            {confidence && <ConfidenceDot level={confidence} />}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40 focus:border-[var(--gold)] ${className}`}
          style={{
            ...borderStyle,
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
          }}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="text-xs mt-0.5" style={{ color: 'var(--red)' }}>{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
