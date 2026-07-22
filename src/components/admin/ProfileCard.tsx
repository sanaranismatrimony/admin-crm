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
      ? <mark key={i} className="rounded-sm px-0.5" style={{ background: 'rgba(212,168,83,0.25)', color: 'var(--text-primary)' }}>{part}</mark>
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
    <Card hover className="overflow-hidden cursor-pointer group" onClick={handleView}>
      {/* Photo Section */}
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: isMale ? 'rgba(59,130,246,0.05)' : 'rgba(236,72,153,0.05)' }} onClick={(e) => e.stopPropagation()}>
        {/* Floating badge */}
        <div
          className="absolute top-2.5 right-2.5 z-10 text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm"
          style={{
            background: isMale ? 'rgba(59,130,246,0.15)' : 'rgba(236,72,153,0.15)',
            color: isMale ? 'var(--blue)' : '#db2777',
            backdropFilter: 'blur(4px)',
          }}
        >
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
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  style={{ background: 'rgba(255,255,255,0.85)', color: 'var(--text-primary)' }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollPhotos('right')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  style={{ background: 'rgba(255,255,255,0.85)', color: 'var(--text-primary)' }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {photos.map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                        i === photoIndex ? 'w-3' : ''
                      }`}
                      style={{
                        background: i === photoIndex ? 'var(--gold)' : 'rgba(255,255,255,0.5)',
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Photo overlay actions */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <button
                onClick={(e) => { e.stopPropagation(); handleView(); }}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
                style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--text-primary)' }}
              >
                <Eye className="w-[18px] h-[18px]" />
              </button>
              <ShareDialog
                profileId={profile.id}
                profileName={profile.full_name || 'Unnamed'}
                showText={false}
                buttonClassName="w-9 h-9 !p-0 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
              />
              <button
                onClick={(e) => { e.stopPropagation(); router.push(`/admin/profiles/${profile.id}/edit`); }}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
                style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--text-primary)' }}
              >
                <Pencil className="w-[18px] h-[18px]" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); window.open(`/api/biodata/${profile.id}`, '_blank'); }}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
                style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--text-primary)' }}
              >
                <Download className="w-[18px] h-[18px]" />
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
            <User className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
            {initials && (
              <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>{initials}</span>
            )}
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="p-4 space-y-2.5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-mono tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
              {highlight(profile.profile_id, searchTerm || '')}
            </p>
            <h3 className="font-semibold truncate text-[15px] leading-snug mt-1" style={{ color: 'var(--text-primary)' }}>
              {highlight(profile.full_name || 'Unnamed', searchTerm || '')}
            </h3>
          </div>
          <Badge variant={statusVariant} className="flex-shrink-0 capitalize text-[10px] px-2 py-0.5">
            {profile.status}
          </Badge>
        </div>

        <div className="text-[13px] space-y-1.5" style={{ color: 'var(--text-secondary)' }}>
          {(profile.age || height) && (
            <p className="font-medium text-[13px]" style={{ color: 'var(--gold-dark)' }}>
              {[profile.age ? `${profile.age} yrs` : '', height].filter(Boolean).join(' \u2022 ')}
            </p>
          )}
          {profile.occupation && (
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--gold)' }} />
              <span className="truncate">{profile.occupation}</span>
            </div>
          )}
          {profile.salary && (
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--gold)' }} />
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{profile.salary}</span>
            </div>
          )}
          {profile.gotram && (
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--gold)' }} />
              <span style={{ color: 'var(--text-muted)' }}>{highlight(profile.gotram || '', searchTerm || '')}</span>
            </div>
          )}
        </div>

        {/* Bottom actions row */}
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleView(); }}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ background: 'rgba(212,168,83,0.12)', color: 'var(--gold)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(212,168,83,0.12)'; e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <Eye className="w-[18px] h-[18px]" />
          </button>
          <ShareDialog
            profileId={profile.id}
            profileName={profile.full_name || 'Unnamed'}
            showText={false}
            buttonClassName="w-9 h-9 !p-0 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          />
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/admin/profiles/${profile.id}/edit`); }}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ background: 'rgba(212,168,83,0.12)', color: 'var(--gold)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(212,168,83,0.12)'; e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <Pencil className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); window.open(`/api/biodata/${profile.id}`, '_blank'); }}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ background: 'rgba(212,168,83,0.12)', color: 'var(--gold)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(212,168,83,0.12)'; e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <Download className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </Card>
  );
}
