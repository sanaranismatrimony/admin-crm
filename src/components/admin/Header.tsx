'use client';

import { usePathname } from 'next/navigation';
import { Sun, Moon, ChevronRight } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/profiles': 'All Profiles',
  '/admin/profiles/new': 'Add New Profile',
  '/admin/shares': 'Profile Shares',
  '/admin/matches': 'Matches',
  '/admin/payments': 'Payments',
};

function Breadcrumbs({ pathname }: { pathname: string }) {
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
      {segments.map((seg, i) => {
        const label = pageTitles['/' + segments.slice(0, i + 1).join('/')] || seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const isLast = i === segments.length - 1;
        return (
          <span key={seg} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3 h-3" />}
            <span style={{ color: isLast ? 'var(--text-primary)' : 'inherit', fontWeight: isLast ? 500 : 400 }}>
              {label}
            </span>
          </span>
        );
      })}
    </nav>
  );
}

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'Admin';
  const { theme, toggle } = useTheme();

  return (
    <header
      className="sticky top-0 z-30 border-b px-6 py-3"
      style={{
        background: 'var(--bg-header)',
        borderColor: 'var(--border-default)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="lg:ml-0 ml-12">
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
          <Breadcrumbs pathname={pathname} />
        </div>
        <button
          onClick={toggle}
          className="p-2 rounded-xl transition-all duration-200 hover:scale-105"
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
          }}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
