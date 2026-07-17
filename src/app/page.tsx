import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-32 h-32 mx-auto mb-6">
          <img src="/logo.svg" alt="Sana Rani Matrimony" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--brown)] mb-2" style={{ fontFamily: "'Georgia', serif" }}>
          Sana Rani
        </h1>
        <p className="text-lg text-[var(--brown-mid)] mb-8" style={{ fontFamily: "'Georgia', serif" }}>
          Matrimony
        </p>
        <p className="text-sm text-[var(--gray-400)] mb-8 max-w-xs mx-auto">
          Trusted matchmaking service. Private. Secure. Verified.
        </p>
        <div className="space-y-3">
          <Link
            href="/admin/login"
            className="block w-full px-6 py-3 rounded-2xl bg-[var(--gold)] text-white font-medium hover:bg-[var(--gold-dark)] transition-colors shadow-sm text-center"
          >
            Admin Login
          </Link>
        </div>
        <p className="text-xs text-[var(--gray-400)] mt-8">
          &copy; {new Date().getFullYear()} Sana Rani Matrimony. All rights reserved.
        </p>
      </div>
    </div>
  );
}
