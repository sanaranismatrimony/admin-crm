'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { adminLogin } from '@/lib/auth/actions';

export default function AdminLoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const result = await adminLogin(form);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4">
            <img src="/logo.svg" alt="Sana Rani Matrimony" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--brown)]">Admin Login</h1>
          <p className="text-sm text-[var(--gray-400)] mt-1">Sana Rani Matrimony</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--gray-100)] space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-sm text-[var(--red)]">{error}</div>
          )}

          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="admin@saranani.com"
            required
          />

          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="Enter password"
            required
          />

          <Button type="submit" loading={loading} className="w-full">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
