'use client';

import { ChevronDown } from 'lucide-react';
import { Dropdown } from '@/components/ui/Dropdown';

interface FilterCapsuleProps {
  label: string;
  isActive: boolean;
  children: React.ReactNode;
  width?: string;
  align?: 'start' | 'end';
}

export function FilterCapsule({ label, isActive, children, width, align }: FilterCapsuleProps) {
  return (
    <Dropdown
      trigger={
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border transition-all ${
            isActive
              ? 'bg-[var(--gold)]/10 border-[var(--gold)] text-[var(--gold-dark)]'
              : 'bg-white border-[var(--gray-200)] text-[var(--gray-500)] hover:border-[var(--gray-300)] hover:text-[var(--gray-700)]'
          }`}
        >
          {label}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isActive ? 'rotate-180' : ''}`} />
        </button>
      }
      width={width}
      align={align}
    >
      <div className="p-2 max-h-72 overflow-y-auto">{children}</div>
    </Dropdown>
  );
}
