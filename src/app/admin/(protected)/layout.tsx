import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/admin/Sidebar';
import { Header } from '@/components/admin/Header';
import { isAdmin } from '@/lib/auth/actions';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  if (!admin) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <Sidebar />
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
