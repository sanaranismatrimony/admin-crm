'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { deleteProfile } from '@/lib/db/profiles';

interface DeleteProfileButtonProps {
  profileId: string;
}

export function DeleteProfileButton({ profileId }: DeleteProfileButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    setError('');
    try {
      await deleteProfile(profileId);
      router.push('/admin/profiles');
    } catch (err: any) {
      setError(err.message || 'Failed to delete profile');
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setShowConfirm(true)}>
        <Trash2 className="w-4 h-4" />
      </Button>

      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Delete Profile" maxWidth="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--brown-mid)]">Are you sure you want to delete this profile? This action cannot be undone.</p>
          {error && <div className="p-3 rounded-xl bg-red-50 text-sm text-[var(--red)]">{error}</div>}
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button variant="danger" className="flex-1" loading={loading} onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
