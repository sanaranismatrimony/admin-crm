'use client';

import { useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Eye, Share2, Pencil, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ShareDialog } from './ShareDialog';
import type { Profile } from '@/types';

function highlight(text: string, term: string): ReactNode {
  if (!term || !text) return text;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === term.toLowerCase()
      ? <mark key={i} className="bg-[var(--gold)]/20 text-[var(--brown)] rounded-sm px-0.5">{part}</mark>
      : part
  );
}

interface ProfileCardProps {
  profile: Profile;
  searchTerm?: string;
}

export function ProfileCard({ profile, searchTerm }: ProfileCardProps) {
  const router = useRouter();
  const photos = profile.photo_urls || [];
  const [photoIndex, setPhotoIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const initials = profile.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isMale = profile.gender === 'male';
  const statusVariant = profile.status === 'active' ? (isMale ? 'info' : 'success') : 'default';
  const height = profile.height_feet
    ? `${profile.height_feet}'${profile.height_inches ? profile.height_inches + '"' : ''}`
    : '';

  function handleView() {
    router.push(`/admin/profiles/${profile.id}`);
  }

  function scrollPhotos(direction: 'left' | 'right') {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }

  function handleScroll() {
    if (!scrollRef.current) return;
    const idx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
    setPhotoIndex(idx);
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={handleView}>
      {/* Photo Section */}
      <div className={`relative aspect-[4/3] ${isMale ? 'bg-blue-50/30' : 'bg-pink-50/30'} overflow-hidden`} onClick={(e) => e.stopPropagation()}>
        <div className={`absolute top-2 right-2 z-10 text-[10px] font-medium px-2 py-0.5 rounded-full ${isMale ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
          {profile.gender === 'male' ? 'Groom' : 'Bride'}
        </div>
        {photos.length > 0 ? (
          <>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
            >
              {photos.map((url, i) => (
                <div key={i} className="w-full h-full flex-shrink-0 snap-center">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => scrollPhotos('left')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <ChevronLeft className="w-4 h-4 text-[var(--brown)]" />
                </button>
                <button
                  onClick={() => scrollPhotos('right')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <ChevronRight className="w-4 h-4 text-[var(--brown)]" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {photos.map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        i === photoIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
            <User className="w-10 h-10 text-[var(--gray-300)]" />
            {initials && (
              <span className="text-sm font-semibold text-[var(--gray-400)]">{initials}</span>
            )}
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-mono tracking-wider text-[var(--gray-400)] uppercase">{highlight(profile.profile_id, searchTerm || '')}</p>
            <h3 className="font-semibold text-[var(--brown)] truncate text-[15px] leading-snug mt-1">
              {highlight(profile.full_name || 'Unnamed', searchTerm || '')}
            </h3>
          </div>
          <Badge variant={statusVariant} className="flex-shrink-0 capitalize text-[10px] px-2 py-0.5">
            {profile.status}
          </Badge>
        </div>

        <div className="text-[13px] text-[var(--gray-500)] space-y-1.5">
          {(profile.age || height) && (
            <p className="text-[var(--brown-mid)] font-medium text-[13px]">
              {[profile.age ? `${profile.age} yrs` : '', height].filter(Boolean).join(' \u2022 ')}
            </p>
          )}
          {profile.occupation && (
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[var(--gold)] flex-shrink-0" />
              <span className="truncate">{profile.occupation}</span>
            </div>
          )}
          {profile.salary && (
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[var(--gold)] flex-shrink-0" />
              <span className="font-semibold text-[var(--brown)]">{profile.salary}</span>
            </div>
          )}
          {profile.gotram && (
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[var(--gold)] flex-shrink-0" />
              <span className="text-[var(--gray-400)]">{highlight(profile.gotram || '', searchTerm || '')}</span>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4 pt-2">
          <button
            onClick={handleView}
            className="w-10 h-10 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white hover:shadow-md flex items-center justify-center transition-all"
          >
            <Eye className="w-[18px] h-[18px]" />
          </button>
          <ShareDialog profileId={profile.id} profileName={profile.full_name || 'Unnamed'} showText={false} buttonClassName="w-10 h-10 !p-0 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white hover:shadow-md flex items-center justify-center" />
          <button
            onClick={() => router.push(`/admin/profiles/${profile.id}/edit`)}
            className="w-10 h-10 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white hover:shadow-md flex items-center justify-center transition-all"
          >
            <Pencil className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); window.open(`/api/biodata/${profile.id}`, '_blank'); }}
            className="w-10 h-10 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white hover:shadow-md flex items-center justify-center transition-all"
          >
            <Download className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </Card>
  );
}
