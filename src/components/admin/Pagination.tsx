'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageCount, total, onPageChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  function getPages(): (number | '...')[] {
    const pages: (number | '...')[] = [];
    const delta = 2;
    const left = Math.max(2, page - delta);
    const right = Math.min(pageCount - 1, page + delta);

    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < pageCount - 1) pages.push('...');
    if (pageCount > 1) pages.push(pageCount);

    return pages;
  }

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-xs text-[var(--gray-400)]">
        Showing <span className="font-medium text-[var(--gray-600)]">{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-[var(--gray-500)] hover:bg-[var(--gray-100)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-[var(--gray-400)]">
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                p === page
                  ? 'bg-[var(--gold)] text-white'
                  : 'text-[var(--gray-500)] hover:bg-[var(--gray-100)]'
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-[var(--gray-500)] hover:bg-[var(--gray-100)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
