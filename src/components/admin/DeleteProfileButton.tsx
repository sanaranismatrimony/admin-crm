'use client';

import { useState, useTransition } from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { deleteProfile, getProfileDeleteInfo } from '@/lib/db/profiles';
import { useRouter } from 'next/navigation';

interface DeleteProfileButtonProps {
  profileId: string;
}

export function DeleteProfileButton({ profileId }: DeleteProfileButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState<{ fullName: string; photoCount: number; matches: string[]; shareCount: number; siblingCount: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleOpen() {
    setIsOpen(true);
    setLoading(true);
    try {
      const info = await getProfileDeleteInfo(profileId);
      setDeleteInfo(info);
    } catch {
      setDeleteInfo({ fullName: '', photoCount: 0, matches: [], shareCount: 0, siblingCount: 0 });
    } finally {
      setLoading(false);
    }
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteProfile(profileId);
        setIsOpen(false);
        router.push('/admin/profiles');
      } catch (err: any) {
        alert(err.message || 'Failed to delete profile');
      }
    });
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen}>
        <Trash2 className="w-4 h-4" /> Delete
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Delete Profile" maxWidth="max-w-md">
        <div className="space-y-4">
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--red)' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                This action cannot be undone
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                This will permanently delete this profile and all associated data.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-muted)' }} />
            </div>
          ) : deleteInfo && (deleteInfo.matches.length > 0 || deleteInfo.shareCount > 0) ? (
            <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--gray-50)', color: 'var(--text-secondary)' }}>
              <p>This profile has:</p>
              <ul className="mt-1 space-y-0.5">
                {deleteInfo.matches.length > 0 && <li>\u2022 {deleteInfo.matches.length} match{deleteInfo.matches.length !== 1 ? 'es' : ''}</li>}
                {deleteInfo.shareCount > 0 && <li>\u2022 {deleteInfo.shareCount} share{deleteInfo.shareCount !== 1 ? 's' : ''}</li>}
              </ul>
              <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>All related data will be permanently deleted.</p>
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button variant="danger" loading={isPending} onClick={handleDelete}>Delete Profile</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
