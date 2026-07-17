'use client';

import { X } from 'lucide-react';

interface ChipProps {
  label: string;
  onRemove?: () => void;
  variant?: 'default' | 'gold';
  size?: 'sm' | 'md';
}

export function Chip({ label, onRemove, variant = 'default', size = 'sm' }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium transition-colors ${
        variant === 'gold'
          ? 'bg-[var(--gold)]/10 text-[var(--gold-dark)]'
          : 'bg-[var(--gray-100)] text-[var(--gray-600)]'
      } ${size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'}`}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded-full hover:bg-black/5 p-0.5 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
