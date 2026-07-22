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
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border transition-all"
          style={{
            background: isActive ? 'rgba(212,168,83,0.12)' : 'var(--bg-card)',
            borderColor: isActive ? 'var(--gold)' : 'var(--border-input)',
            color: isActive ? 'var(--gold-dark)' : 'var(--text-muted)',
          }}
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
