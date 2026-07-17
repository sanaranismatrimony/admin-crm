'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface PhotoUploadProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  onRemove?: (url: string) => void;
  maxFiles?: number;
}

export function PhotoUpload({ urls, onChange, onRemove, maxFiles = 5 }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } finally {
      setUploading(false);
    }
  }, []);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = maxFiles - urls.length;
    const toUpload = files.slice(0, remaining);

    const uploadedUrls: string[] = [];
    for (const file of toUpload) {
      const url = await uploadFile(file);
      if (url) uploadedUrls.push(url);
    }

    onChange([...urls, ...uploadedUrls]);
    e.target.value = '';
  }

  function removePhoto(index: number) {
    onRemove?.(urls[index]);
    onChange(urls.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {urls.map((url, index) => (
          <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border border-[var(--gray-200)] group">
            <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}

        {urls.length < maxFiles && (
          <label className="w-24 h-24 rounded-xl border-2 border-dashed border-[var(--gray-200)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--gold)] hover:bg-[var(--gold)]/5 transition-colors">
            {uploading ? (
              <svg className="animate-spin h-6 w-6 text-[var(--gray-400)]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                <Upload className="w-5 h-5 text-[var(--gray-400)]" />
                <span className="text-xs text-[var(--gray-400)] mt-1">Upload</span>
              </>
            )}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} disabled={uploading} />
          </label>
        )}
      </div>
      <p className="text-xs text-[var(--gray-400)]">Upload up to {maxFiles} photos. Recommended: 500x500px or larger.</p>
      <input type="hidden" name="photo_urls" value={JSON.stringify(urls)} />
    </div>
  );
}
