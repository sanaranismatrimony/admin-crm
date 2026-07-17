'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Check, X } from 'lucide-react';
import { updateAdminNotes } from '@/lib/db/matches';

interface EditableAdminNotesProps {
  matchId: string;
  initialNotes: string;
}

export function EditableAdminNotes({ matchId, initialNotes }: EditableAdminNotesProps) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    try {
      await updateAdminNotes(matchId, notes);
      setEditing(false);
      router.refresh();
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div
        onClick={() => setEditing(true)}
        className="group cursor-pointer"
      >
        {notes ? (
          <p className="text-sm text-[var(--gray-500)]">{notes}</p>
        ) : (
          <p className="text-sm text-[var(--gray-400)]">Click to add notes...</p>
        )}
        <button className="text-xs text-[var(--gold-dark)] mt-2 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
          <Edit className="w-3 h-3" /> Edit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full rounded-xl border border-[var(--gray-200)] px-3 py-2 text-sm text-[var(--brown)] bg-white placeholder:text-[var(--gray-400)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40 focus:border-[var(--gold)] resize-none"
        rows={3}
        placeholder="Add admin notes..."
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1 text-xs text-[var(--green)] font-medium hover:underline disabled:opacity-50"
        >
          <Check className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={() => { setEditing(false); setNotes(initialNotes); }}
          className="inline-flex items-center gap-1 text-xs text-[var(--gray-400)] font-medium hover:underline"
        >
          <X className="w-3 h-3" /> Cancel
        </button>
      </div>
    </div>
  );
}
