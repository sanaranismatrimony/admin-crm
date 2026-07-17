'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle, Users, Share2, Image, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { deleteProfile, getProfileDeleteInfo } from '@/lib/db/profiles';

interface DeleteProfileButtonProps {
  profileId: string;
}

interface DeleteInfo {
  fullName: string | null;
  photoCount: number;
  matches: string[];
  shareCount: number;
  siblingCount: number;
}

export function DeleteProfileButton({ profileId }: DeleteProfileButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState<DeleteInfo | null>(null);
  const router = useRouter();

  async function openDialog() {
    setShowConfirm(true);
    setFetching(true);
    setError('');
    try {
      const data = await getProfileDeleteInfo(profileId);
      setInfo(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile info');
    } finally {
      setFetching(false);
    }
  }

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

  const hasRelated = info && (info.matches.length > 0 || info.shareCount > 0 || info.siblingCount > 0 || info.photoCount > 0);

  return (
    <>
      <Button variant="danger" size="sm" onClick={openDialog}>
        <Trash2 className="w-4 h-4" />
      </Button>

      <Modal isOpen={showConfirm} onClose={() => { if (!loading) setShowConfirm(false); }} title="Delete Profile" maxWidth="max-w-md">
        <div className="space-y-4">
          {fetching ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Permanently delete {info?.fullName || 'this profile'}?</p>
                  <p className="text-xs text-red-600 mt-1">This action cannot be undone. All associated data will be permanently removed.</p>
                </div>
              </div>

              {info && hasRelated && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[var(--gray-500)] uppercase tracking-wide">The following will also be deleted:</p>
                  <div className="space-y-1.5">
                    {info.matches.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-[var(--brown-mid)]">
                        <Link2 className="w-4 h-4 text-[var(--gray-400)] flex-shrink-0" />
                        <span><strong>{info.matches.length}</strong> match{info.matches.length !== 1 ? 'es' : ''} with: {info.matches.join(', ')}</span>
                      </div>
                    )}
                    {info.shareCount > 0 && (
                      <div className="flex items-center gap-2 text-sm text-[var(--brown-mid)]">
                        <Share2 className="w-4 h-4 text-[var(--gray-400)] flex-shrink-0" />
                        <span><strong>{info.shareCount}</strong> share{info.shareCount !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {info.siblingCount > 0 && (
                      <div className="flex items-center gap-2 text-sm text-[var(--brown-mid)]">
                        <Users className="w-4 h-4 text-[var(--gray-400)] flex-shrink-0" />
                        <span><strong>{info.siblingCount}</strong> sibling{info.siblingCount !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {info.photoCount > 0 && (
                      <div className="flex items-center gap-2 text-sm text-[var(--brown-mid)]">
                        <Image className="w-4 h-4 text-[var(--gray-400)] flex-shrink-0" />
                        <span><strong>{info.photoCount}</strong> photo{info.photoCount !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-sm text-[var(--red)] border border-red-200">{error}</div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setShowConfirm(false)} disabled={loading}>Cancel</Button>
                <Button variant="danger" className="flex-1" loading={loading} onClick={handleDelete}>Delete Permanently</Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
