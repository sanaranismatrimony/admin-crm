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
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      }`}
      style={{
        background: variant === 'gold' ? 'rgba(212,168,83,0.15)' : 'var(--gray-100)',
        color: variant === 'gold' ? 'var(--gold-dark)' : 'var(--text-secondary)',
      }}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded-full hover:bg-black/10 p-0.5 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
