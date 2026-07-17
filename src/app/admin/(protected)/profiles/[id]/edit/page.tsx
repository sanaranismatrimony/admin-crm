import { createServerSupabase } from '@/lib/supabase/server';
import { ProfileForm } from '@/components/admin/ProfileForm';
import { notFound } from 'next/navigation';

export default async function EditProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (!profile) notFound();

  const { data: siblings } = await supabase.from('siblings').select('*').eq('profile_id', id);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--brown)]">Edit Profile</h2>
        <p className="text-sm text-[var(--gray-400)] mt-1">{profile.profile_id} &mdash; {profile.full_name}</p>
      </div>
      <ProfileForm profile={profile} siblings={siblings || []} mode="edit" />
    </div>
  );
}
