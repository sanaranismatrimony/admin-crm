'use client';

import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/profiles': 'All Profiles',
  '/admin/profiles/new': 'Add New Profile',

  '/admin/shares': 'Profile Shares',
  '/admin/matches': 'Matches',
  '/admin/payments': 'Payments',
};

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'Admin';

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[var(--gray-100)] px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[var(--brown)] lg:ml-0 ml-12">{title}</h1>
      </div>
    </header>
  );
}
