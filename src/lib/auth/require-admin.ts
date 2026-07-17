import { isAdmin } from '@/lib/auth/actions';

export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized: admin access required');
  }
}
