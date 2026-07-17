'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Share2,
  HeartHandshake,
  Wallet,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { adminLogout } from '@/lib/auth/actions';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/profiles', label: 'Profiles', icon: Users },
  { href: '/admin/profiles/new', label: 'Add Profile', icon: UserPlus },

  { href: '/admin/shares', label: 'Shares', icon: Share2 },
  { href: '/admin/matches', label: 'Matches', icon: HeartHandshake },
  { href: '/admin/payments', label: 'Payments', icon: Wallet },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-sm border border-[var(--gray-100)]"
      >
        {mobileOpen ? <X className="w-5 h-5 text-[var(--brown)]" /> : <Menu className="w-5 h-5 text-[var(--brown)]" />}
      </button>

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[var(--gray-100)] transform transition-transform duration-200
        lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-[var(--gray-100)]">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 flex-shrink-0">
                <img src="/logo.svg" alt="Sana Rani" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--brown)]">Sana Rani</p>
                <p className="text-xs text-[var(--gray-400)]">Matrimony Admin</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--gold)]/10 text-[var(--gold-dark)]'
                      : 'text-[var(--gray-500)] hover:bg-[var(--cream)] hover:text-[var(--brown)]'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-[var(--gray-100)]">
            <form action={adminLogout}>
              <button
                type="submit"
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--gray-500)] hover:bg-red-50 hover:text-red transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}
