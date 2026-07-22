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
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Showing <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { if (page > 1) e.currentTarget.style.background = 'var(--gray-100)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs" style={{ color: 'var(--text-muted)' }}>
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-200 ${
                p === page ? 'text-white' : ''
              }`}
              style={{
                background: p === page ? 'var(--gold)' : 'transparent',
                color: p === page ? '#fff' : 'var(--text-muted)',
              }}
              onMouseEnter={(e) => {
                if (p !== page) {
                  e.currentTarget.style.background = 'var(--gray-100)';
                }
              }}
              onMouseLeave={(e) => {
                if (p !== page) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { if (page < pageCount) e.currentTarget.style.background = 'var(--gray-100)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
