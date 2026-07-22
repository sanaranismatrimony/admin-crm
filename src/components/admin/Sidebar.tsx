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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl shadow-sm border"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-default)',
          color: 'var(--text-primary)',
        }}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'var(--bg-sidebar)',
          borderColor: 'var(--border-default)',
        }}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b" style={{ borderColor: 'var(--border-default)' }}>
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 flex-shrink-0">
                <img src="/logo.svg" alt="Sana Rani" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Sana Rani</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Matrimony Admin</p>
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
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    background: isActive ? 'var(--gold)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--cream-dark)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t" style={{ borderColor: 'var(--border-default)' }}>
            <form action={adminLogout}>
              <button
                type="submit"
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(220,38,38,0.08)';
                  e.currentTarget.style.color = 'var(--red)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden" style={{ background: 'var(--bg-overlay)' }} onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}
