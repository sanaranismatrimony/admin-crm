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

    const borderStyle: React.CSSProperties = {
      borderColor: error ? 'var(--red)' : confidence === 'low' ? 'var(--amber)' : 'var(--border-input)',
    };

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium inline-flex items-center" style={{ color: 'var(--text-secondary)' }}>
            {label}
            {confidence && <ConfidenceDot level={confidence} />}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm placeholder:transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40 focus:border-[var(--gold)] resize-y min-h-[80px] ${className}`}
          style={{
            ...borderStyle,
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
          }}
          {...props}
        />
        {error && <p className="text-xs mt-0.5" style={{ color: 'var(--red)' }}>{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
