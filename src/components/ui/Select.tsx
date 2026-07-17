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

    const borderClass = !error && confidence === 'low'
      ? 'border-orange-300 focus:ring-orange/40 focus:border-orange'
      : error
        ? 'border-[var(--red)] focus:ring-red/40 focus:border-red'
        : 'border-[var(--gray-200)] hover:border-[var(--gray-300)]';

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-[var(--brown-mid)] inline-flex items-center">
            {label}
            {confidence && <ConfidenceDot level={confidence} />}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm text-[var(--brown)] bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40 focus:border-[var(--gold)] ${borderClass} ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="text-xs text-[var(--red)] mt-0.5">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
