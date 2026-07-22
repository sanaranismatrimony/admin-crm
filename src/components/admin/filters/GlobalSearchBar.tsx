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
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder="Search profiles across name, ID, phone, location, family..."
        className="w-full pl-10 pr-9 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40 focus:border-[var(--gold)]"
        style={{
          background: 'var(--bg-input)',
          color: 'var(--text-primary)',
          borderColor: 'var(--border-input)',
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: 'var(--text-muted)' }}
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
            className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border overflow-hidden z-50"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-default)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {suggestions.map((s) => (
              <button
                key={s.profile_id}
                type="button"
                onClick={() => {
                  onSelectSuggestion(s);
                  setFocused(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-3"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div className="min-w-0">
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{s.full_name}</span>
                  <span className="ml-2 text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{s.profile_id}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>
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
