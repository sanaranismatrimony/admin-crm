'use client';

import { forwardRef } from 'react';
import type { ConfidenceLevel } from '@/types';
import { ConfidenceDot } from '@/components/ui/ConfidenceDot';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  confidence?: ConfidenceLevel;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', confidence, id, ...props }, ref) => {
    const textareaId = id || props.name;

    const borderClass = !error && confidence === 'low'
      ? 'border-orange-300 focus:ring-orange/40 focus:border-orange'
      : error
        ? 'border-[var(--red)] focus:ring-red/40 focus:border-red'
        : 'border-[var(--gray-200)] hover:border-[var(--gray-300)]';

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-[var(--brown-mid)] inline-flex items-center">
            {label}
            {confidence && <ConfidenceDot level={confidence} />}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm text-[var(--brown)] bg-white placeholder:text-[var(--gray-400)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40 focus:border-[var(--gold)] resize-y min-h-[80px] ${borderClass} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-[var(--red)] mt-0.5">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
