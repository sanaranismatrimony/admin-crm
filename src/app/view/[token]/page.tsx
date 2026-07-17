import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { createServerSupabase } from '@/lib/supabase/server';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { logView } from '@/lib/db/shares';
import { PhotoLightbox } from '@/components/admin/PhotoLightbox';
import { Download, Eye, MapPin, ShieldAlert } from 'lucide-react';
import { formatDate, profileTypeLabel } from '@/lib/utils/format';

const maleTheme = {
  sectionHeader: 'bg-blue-50/40',
  badge: 'bg-blue-50 text-blue-600',
  dot: 'bg-blue-400',
};

const femaleTheme = {
  sectionHeader: 'bg-pink-50/40',
  badge: 'bg-pink-50 text-pink-600',
  dot: 'bg-pink-400',
};

function Value({ val, empty = '\u2014' }: { val?: string | number | null; empty?: string }) {
  if (val === null || val === undefined || val === '') {
    return <span className="text-[var(--gray-300)]">{empty}</span>;
  }
  return <span className="text-[var(--brown)]">{val}</span>;
}

function DetailRow({ label, value, empty }: { label: string; value?: string | number | null; empty?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-[var(--gray-100)] last:border-0">
      <span className="text-sm text-[var(--gray-400)] whitespace-nowrap">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">
        <Value val={value} empty={empty} />
      </span>
    </div>
  );
}

function Section({ title, theme, children }: { title: string; theme?: typeof maleTheme; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className={theme?.sectionHeader || 'bg-[var(--cream-dark)]/30'}>
        <h3 className="text-sm font-semibold text-[var(--brown)] tracking-wide">{title}</h3>
      </CardHeader>
      <CardContent className="divide-y divide-[var(--gray-100)]">
        {children}
      </CardContent>
    </Card>
  );
}

export default async function ViewProfilePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createServerSupabase();

  // Fetch share record
  const { data: share } = await supabase
    .from('profile_shares')
    .select('*, profiles(*)')
    .eq('share_token', token)
    .single();

  // Check if share exists and is not revoked
  if (!share || !share.profiles) notFound();

  if (share.is_revoked) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center px-4">
        <Card className="max-w-sm w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--brown)]">Link Expired</h2>
            <p className="text-sm text-[var(--gray-400)]">
              This profile share link has been revoked and is no longer accessible.
            </p>
            <p className="text-xs text-[var(--gray-400)]">
              Please contact Sana Rani Matrimony for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profile = share.profiles as any;
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
  const ua = headersList.get('user-agent') || 'unknown';

  await logView(token, profile.id, ip, ua);

  const isMale = profile.gender === 'male';
  const theme = isMale ? maleTheme : femaleTheme;
  const showFull = profile.show_full_profile !== false;

  // Per-share visibility controls (override profile-level settings)
  const canViewContact = share.can_view_contact === true;
  const canViewLocation = share.can_view_location !== false; // default true

  const height = profile.height_feet
    ? `${profile.height_feet}\u2019${profile.height_inches || 0}\u201d`
    : null;

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Brand Header */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3">
            <img src="/logo.svg" alt="Sana Rani Matrimony" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--brown)]">Sana Rani Matrimony</h1>
          <p className="text-sm text-[var(--gray-400)] mt-1">Profile shared with you</p>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-[var(--gray-400)]">
          <Eye className="w-3 h-3" />
          This view is being recorded
        </div>

        {/* Hero Card */}
        <Card className="overflow-hidden">
          <div className="p-5 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h2 className="text-xl font-bold text-[var(--brown)] truncate">
                  {profile.full_name || 'Unnamed'}
                </h2>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit ${isMale ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                  {profileTypeLabel(profile.profile_type)}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--gray-500)]">
                <span className="font-mono text-[var(--gray-400)]">{profile.profile_id}</span>
                <span className="capitalize">{profile.gender}</span>
                {profile.age && <span>{profile.age} yrs</span>}
                {height && <span>{height}</span>}
              </div>

              {canViewLocation && profile.city && (
                <div className="flex items-center gap-1.5 text-sm text-[var(--gray-500)]">
                  <MapPin className={`w-3.5 h-3.5 ${isMale ? 'text-blue-400' : 'text-pink-400'}`} />
                  <span>{[profile.city, profile.district, profile.state].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
        </Card>

        {/* Photos Gallery */}
        {profile.photo_urls && profile.photo_urls.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-[var(--brown)] tracking-wide">Photos</h3>
            </CardHeader>
            <CardContent>
              <PhotoLightbox urls={profile.photo_urls} />
            </CardContent>
          </Card>
        )}

        {/* Personal Details - always shown */}
        <Section title="Personal & Birth Details" theme={theme}>
          <DetailRow label="Full Name" value={profile.full_name} />
          <DetailRow label="Age" value={profile.age ? `${profile.age} yrs` : null} />
          <DetailRow label="Height" value={height} />
          <DetailRow label="Weight" value={profile.weight ? `${profile.weight} kg` : null} />
          <DetailRow label="Date of Birth" value={profile.date_of_birth ? formatDate(profile.date_of_birth) : null} />
          <DetailRow label="Place of Birth" value={profile.place_of_birth} />
        </Section>

        {/* Community Details */}
        <Section title="Community Details" theme={theme}>
          <DetailRow label="Caste" value={profile.caste} />
          <DetailRow label="Gotram" value={profile.gotram} />
          <DetailRow label="Rashi" value={profile.rashi} />
          <DetailRow label="Nakshatram" value={profile.nakshatram} />
          <DetailRow label="Padam" value={profile.padam} />
        </Section>

        {/* Education & Career */}
        <Section title="Education & Career" theme={theme}>
          <DetailRow label="Education" value={profile.education} />
          <DetailRow label="Qualification" value={profile.education_qualification} />
          <DetailRow label="Occupation" value={profile.occupation} />
          <DetailRow label="Career" value={profile.career} />
          <DetailRow label="Salary" value={profile.salary} />
          {profile.business_name && <DetailRow label="Business Name" value={profile.business_name} />}
          {profile.business_type && <DetailRow label="Business Type" value={profile.business_type} />}
          {profile.annual_income && <DetailRow label="Annual Income" value={profile.annual_income} />}
        </Section>

        {/* Location - controlled by per-share visibility */}
        {canViewLocation && (
          <Section title="Location" theme={theme}>
            <DetailRow label="State" value={profile.state} />
            <DetailRow label="District" value={profile.district} />
            <DetailRow label="City / Village" value={profile.city} />
            <DetailRow label="Native Place" value={profile.native_place} />
          </Section>
        )}

        {/* Family Details */}
        <Section title="Family Details" theme={theme}>
          <DetailRow label="Father's Name" value={profile.father_name} />
          <DetailRow label="Father's Occupation" value={profile.father_occupation} />
          <DetailRow label="Mother's Name" value={profile.mother_name} />
          <DetailRow label="Mother's Surname" value={profile.mother_surname} />
          <DetailRow label="Mother's Gotram" value={profile.mother_gotram} />
        </Section>

        {/* Background */}
        {showFull && (
          <Section title="Additional Background" theme={theme}>
            <DetailRow label="Family Background" value={profile.family_background} />
            <DetailRow label="Property Details" value={profile.property_details} />
            <DetailRow label="Family Values" value={profile.family_values} />
            <DetailRow label="Additional Info" value={profile.additional_info} />
          </Section>
        )}

        {/* Partner Expectations - controlled by profile visibility */}
        {profile.visibility_settings?.show_expectations !== false && showFull && (
          <Section title="Partner Expectations" theme={theme}>
            <DetailRow label="Expected Age" value={profile.expected_age_min && profile.expected_age_max ? `${profile.expected_age_min} \u2013 ${profile.expected_age_max} yrs` : null} />
            <DetailRow label="Expected Height" value={profile.expected_height_min && profile.expected_height_max ? `${profile.expected_height_min}\u2019 \u2013 ${profile.expected_height_max}\u2019` : null} />
            <DetailRow label="Education Preference" value={profile.education_preference} />
            <DetailRow label="Occupation Preference" value={profile.occupation_preference} />
            <DetailRow label="Location Preference" value={profile.location_preference} />
            <DetailRow label="Community Preference" value={profile.community_preference} />
            <DetailRow label="Other Expectations" value={profile.other_expectations} />
          </Section>
        )}

        {/* Contact Details — ONLY shown if admin explicitly enabled on this share link */}
        {canViewContact && (
          <Section title="Contact Details" theme={theme}>
            <DetailRow label="Phone" value={profile.phone} />
            <DetailRow label="WhatsApp" value={profile.whatsapp} />
            <DetailRow label="Email" value={profile.email} />
          </Section>
        )}

        {/* Footer */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-xs text-[var(--gray-400)] bg-white rounded-xl px-4 py-2 border border-[var(--gray-200)]">
            <Download className="w-3 h-3" />
            Shared through Sana Rani Matrimony
          </div>
        </div>

        <div className="text-center pb-8">
          <p className="text-xs text-[var(--gray-400)]">
            For inquiries, contact Sana Rani Matrimony
          </p>
        </div>
      </div>
    </div>
  );
}
