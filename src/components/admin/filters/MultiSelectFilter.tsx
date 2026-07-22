'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/Checkbox';

interface MultiSelectFilterProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  emptyText?: string;
}

export function MultiSelectFilter({
  options,
  selected,
  onChange,
  placeholder = 'Search...',
  emptyText = 'No options found',
}: MultiSelectFilterProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, search]);

  function toggle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  return (
    <div className="space-y-1">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-8 pr-3 py-2 rounded-lg border text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)]"
          style={{
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-input)',
          }}
        />
      </div>
      <div className="max-h-48 overflow-y-auto space-y-0.5">
        {filtered.length > 0 ? (
          filtered.map((option) => (
            <Checkbox
              key={option}
              label={option}
              checked={selected.includes(option)}
              onChange={() => toggle(option)}
            />
          ))
        ) : (
          <p className="text-xs text-center py-3" style={{ color: 'var(--text-muted)' }}>{emptyText}</p>
        )}
      </div>
    </div>
  );
}
