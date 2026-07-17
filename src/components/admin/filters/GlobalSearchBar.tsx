'use client';

import { useRef, useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface Suggestion {
  profile_id: string;
  full_name: string;
  age: number;
  city: string;
}

interface GlobalSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: Suggestion[];
  onSelectSuggestion: (suggestion: Suggestion) => void;
}

export function GlobalSearchBar({ value, onChange, suggestions, onSelectSuggestion }: GlobalSearchBarProps) {
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative flex-1 max-w-lg">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gray-400)]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder="Search profiles across name, ID, phone, location, family..."
        className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[var(--gray-200)] bg-white text-sm text-[var(--brown)] placeholder:text-[var(--gray-400)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40 focus:border-[var(--gold)] transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)] hover:text-[var(--gray-600)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <AnimatePresence>
        {focused && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-lg border border-[var(--gray-200)] overflow-hidden z-50"
          >
            {suggestions.map((s) => (
              <button
                key={s.profile_id}
                type="button"
                onClick={() => {
                  onSelectSuggestion(s);
                  setFocused(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-[var(--gray-600)] hover:bg-[var(--gray-50)] transition-colors flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <span className="font-medium text-[var(--brown)]">{s.full_name}</span>
                  <span className="ml-2 text-[11px] font-mono text-[var(--gray-400)]">{s.profile_id}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-xs text-[var(--gray-400)]">
                  {s.age > 0 && <span>{s.age} yrs</span>}
                  {s.city && <span>{s.city}</span>}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
