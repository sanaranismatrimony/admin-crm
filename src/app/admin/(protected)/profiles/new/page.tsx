import { ProfileForm } from '@/components/admin/ProfileForm';

export default function NewProfilePage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--brown)]">Add New Profile</h2>
        <p className="text-sm text-[var(--gray-400)] mt-1">Fill in the profile details below. All sections stay open so you can see everything at once.</p>
      </div>
      <ProfileForm mode="create" />
    </div>
  );
}
