'use client';

import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { createShare } from '@/lib/db/shares';

interface ShareDialogProps {
  profileId: string;
  profileName: string;
  buttonClassName?: string;
  showText?: boolean;
}

export function ShareDialog({ profileId, profileName, buttonClassName = '', showText = true }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const name = form.get('recipient_name') as string;
    const phone = form.get('recipient_phone') as string;
    const notes = form.get('notes') as string;

    if (!phone) {
      setError('Recipient phone is required');
      setLoading(false);
      return;
    }

    try {
      const share = await createShare(profileId, name, phone, notes);
      const link = `${window.location.origin}/view/${share.share_token}`;
      setShareLink(link);
    } catch (err: any) {
      setError(err.message || 'Failed to create share link');
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClose() {
    setIsOpen(false);
    setShareLink('');
    setCopied(false);
    setError('');
  }

  return (
    <>
      <Button variant="outline" size="sm" className={buttonClassName} onClick={() => setIsOpen(true)}>
        <Share2 className="w-4 h-4" />{showText ? ' Share' : ''}
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose} title={`Share ${profileName}`} maxWidth="max-w-md">
        {!shareLink ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(220,38,38,0.08)', color: 'var(--red)' }}>
                {error}
              </div>
            )}
            <Input name="recipient_name" label="Recipient Name" placeholder="e.g., Rajesh Sharma" required />
            <Input name="recipient_phone" label="Recipient Phone" type="tel" placeholder="e.g., +91 9876543210" required />
            <Textarea name="notes" label="Notes (optional)" placeholder="Any notes about this share" />
            <Button type="submit" loading={loading} className="w-full">Generate Share Link</Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(22,163,74,0.1)', color: 'var(--green)' }}>
              Share link created! Send this to the recipient via WhatsApp.
            </div>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareLink}
                className="flex-1 rounded-xl border px-4 py-2.5 text-sm"
                style={{
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-input)',
                }}
              />
              <Button variant="outline" size="sm" onClick={copyLink}>
                {copied ? <Check className="w-4 h-4" style={{ color: 'var(--green)' }} /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <Button variant="primary" className="w-full" onClick={handleClose}>Done</Button>
          </div>
        )}
      </Modal>
    </>
  );
}
