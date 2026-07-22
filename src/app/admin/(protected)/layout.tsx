import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/admin/Sidebar';
import { Header } from '@/components/admin/Header';
import { isAdmin } from '@/lib/auth/actions';
import { ThemeProvider } from '@/components/ThemeProvider';
import { PageTransition } from '@/components/PageTransition';
import { Toaster } from 'sonner';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  if (!admin) redirect('/admin/login');

  return (
    <ThemeProvider>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
        <Sidebar />
        <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6" style={{ background: 'var(--bg-page)' }}>
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
          },
        }}
      />
    </ThemeProvider>
  );
}
