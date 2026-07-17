'use client';

import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
}

export function Checkbox({ checked, onChange, label, id }: CheckboxProps) {
  const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <label
      htmlFor={checkboxId}
      className="flex items-center gap-2.5 cursor-pointer group px-1 py-1"
    >
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
          checked
            ? 'bg-[var(--gold)] border-[var(--gold)]'
            : 'border-[var(--gray-300)] group-hover:border-[var(--gold)]'
        }`}
      >
        {checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
      </div>
      {label && (
        <span className="text-sm text-[var(--gray-600)] select-none">{label}</span>
      )}
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
    </label>
  );
}
