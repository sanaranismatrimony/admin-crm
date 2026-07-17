'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function adminLogin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const supabase = await createServerSupabase();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Invalid email or password' };
  }

  redirect('/admin/dashboard');
}

export async function adminLogout() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

export async function getSession() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function isAdmin() {
  const user = await getSession();
  if (!user) return false;

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('admin_settings')
    .select('admin_email')
    .single();

  return data?.admin_email === user.email;
}
