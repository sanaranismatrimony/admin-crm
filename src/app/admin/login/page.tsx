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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-page)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4">
            <img src="/logo.svg" alt="Sana Rani Matrimony" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Admin Login</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Sana Rani Matrimony</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 space-y-4"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {error && (
            <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(220,38,38,0.08)', color: 'var(--red)' }}>{error}</div>
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
