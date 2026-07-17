import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download, Edit, MapPin } from 'lucide-react';
import { createServerSupabase } from '@/lib/supabase/server';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { profileTypeLabel, formatDate } from '@/lib/utils/format';
import { ShareDialog } from '@/components/admin/ShareDialog';
import { SendProfileDialog } from '@/components/admin/SendProfileDialog';
import { ProfileMatchHistory } from '@/components/admin/ProfileMatchHistory';
import { DeleteProfileButton } from '@/components/admin/DeleteProfileButton';
import { PhotoLightbox } from '@/components/admin/PhotoLightbox';
import type { Profile } from '@/types';

const maleTheme = {
  badge: 'bg-blue-50 text-blue-600 border-blue-200',
  dot: 'bg-blue-400',
  accent: 'text-blue-500',
  accentBg: 'bg-blue-50',
  ring: 'ring-blue-300',
  sectionHeader: 'bg-blue-50/40',
};

const femaleTheme = {
  badge: 'bg-pink-50 text-pink-600 border-pink-200',
  dot: 'bg-pink-400',
  accent: 'text-pink-500',
  accentBg: 'bg-pink-50',
  ring: 'ring-pink-300',
  sectionHeader: 'bg-pink-50/40',
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

function Section({ title, icon, theme, children }: { title: string; icon?: React.ReactNode; theme?: typeof maleTheme; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className={theme?.sectionHeader || 'bg-[var(--cream-dark)]/30'}>
        <div className="flex items-center gap-2">
          {icon && <span className={theme?.accent || 'text-[var(--gold)]'}>{icon}</span>}
          <h3 className="text-sm font-semibold text-[var(--brown)] tracking-wide">{title}</h3>
        </div>
      </CardHeader>
      <CardContent className="divide-y divide-[var(--gray-100)]">
        {children}
      </CardContent>
    </Card>
  );
}

export default async function ProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: rawProfile } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (!rawProfile) notFound();
  const profile = rawProfile as unknown as Profile;

  const { data: siblings } = await supabase.from('siblings').select('*').eq('profile_id', id);
  const { data: shares } = await supabase
    .from('profile_shares')
    .select('*')
    .eq('profile_id', id)
    .order('shared_date', { ascending: false });

  const { data: profileMatches } = await supabase
    .from('matches')
    .select(`
      *,
      bride:profiles!matches_bride_profile_id_fkey(id, full_name, profile_id, gender),
      groom:profiles!matches_groom_profile_id_fkey(id, full_name, profile_id, gender)
    `)
    .or(`bride_profile_id.eq.${id},groom_profile_id.eq.${id}`)
    .order('created_at', { ascending: false });

  const isMale = profile.gender === 'male';
  const theme = isMale ? maleTheme : femaleTheme;

  const height = profile.height_feet
    ? `${profile.height_feet}\u2019${profile.height_inches || 0}\u201d`
    : null;

  const vs = profile.visibility_settings || {};

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Link href="/admin/profiles" className="flex items-center gap-2 text-sm text-[var(--gray-400)] hover:text-[var(--brown)] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Profiles
        </Link>
        <div className="flex items-center gap-2">
          <SendProfileDialog profileId={profile.id} profileName={profile.full_name || profile.profile_id} profileGender={profile.gender} existingMatches={profileMatches || []} />
          <ShareDialog profileId={profile.id} profileName={profile.full_name || profile.profile_id} />
          <a href={`/api/biodata/${profile.id}`}>
            <Button variant="outline" size="sm"><Download className="w-4 h-4" /> Biodata</Button>
          </a>
          <Link href={`/admin/profiles/${profile.id}/edit`}>
            <Button variant="outline" size="sm"><Edit className="w-4 h-4" /> Edit</Button>
          </Link>
          <DeleteProfileButton profileId={profile.id} />
        </div>
      </div>

      {/* Hero */}
      <Card className="overflow-hidden">
        <div className="p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-2xl font-bold text-[var(--brown)] truncate">
                {profile.full_name || 'Unnamed'}
              </h1>
              <div className="flex items-center gap-2">
                <Badge variant={profile.status === 'active' ? 'success' : 'default'} className="capitalize w-fit">
                  {profile.status}
                </Badge>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${isMale ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                  {profileTypeLabel(profile.profile_type)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--gray-500)]">
              <span className="font-mono text-[var(--gray-400)]">{profile.profile_id}</span>
              <span className="capitalize">{profile.gender}</span>
              {profile.age && <span>{profile.age} yrs</span>}
              {height && <span>{height}</span>}
            </div>

            {profile.city && (
              <div className="flex items-center gap-1.5 text-sm text-[var(--gray-500)]">
                <MapPin className={`w-3.5 h-3.5 ${theme.accent}`} />
                <span>{[profile.city, profile.district, profile.state].filter(Boolean).join(', ')}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[var(--gray-400)]">
              <span>Created: {formatDate(profile.created_at)}</span>
              {profile.updated_at !== profile.created_at && (
                <span>Updated: {formatDate(profile.updated_at)}</span>
              )}
            </div>
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Classification & Status */}
        <Section title="Classification & Status" theme={theme}>
          <DetailRow label="Category" value={profileTypeLabel(profile.profile_type)} />
          <DetailRow label="Gender" value={profile.gender ? (profile.gender === 'male' ? 'Male' : 'Female') : null} />
          <DetailRow label="Status" value={profile.status ? (profile.status === 'active' ? 'Active' : 'Inactive') : null} />
        </Section>

        {/* Personal & Birth Details */}
        <Section title="Personal & Birth Details" theme={theme}>
          <DetailRow label="Full Name" value={profile.full_name} />
          <DetailRow label="Date of Birth" value={profile.date_of_birth ? formatDate(profile.date_of_birth) : null} />
          <DetailRow label="Time of Birth" value={profile.time_of_birth} />
          <DetailRow label="Place of Birth" value={profile.place_of_birth} />
          <DetailRow label="Age" value={profile.age ? `${profile.age} yrs` : null} />
          <DetailRow label="Height" value={height} />
          <DetailRow label="Weight" value={profile.weight ? `${profile.weight} kg` : null} />
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
          <DetailRow label="Career" value={profile.career} />
          <DetailRow label="Occupation" value={profile.occupation} />
          <DetailRow label="Salary" value={profile.salary} />
          {profile.business_name && <DetailRow label="Business Name" value={profile.business_name} />}
          {profile.business_type && <DetailRow label="Business Type" value={profile.business_type} />}
          {profile.annual_income && <DetailRow label="Annual Income" value={profile.annual_income} />}
        </Section>

        {/* Location */}
        <Section title="Location" theme={theme}>
          <DetailRow label="State" value={profile.state} />
          <DetailRow label="District" value={profile.district} />
          <DetailRow label="City / Village" value={profile.city} />
          <DetailRow label="Native Place" value={profile.native_place} />
        </Section>

        {/* Family Details */}
        <Section title="Family Details" theme={theme}>
          <DetailRow label="Father's Name" value={profile.father_name} />
          <DetailRow label="Father's Occupation" value={profile.father_occupation} />
          <DetailRow label="Mother's Name" value={profile.mother_name} />
          <DetailRow label="Mother's Surname" value={profile.mother_surname} />
          <DetailRow label="Mother's Gotram" value={profile.mother_gotram} />
          {siblings && siblings.length > 0 && (
            <div className="py-2.5 border-b border-[var(--gray-100)] last:border-0">
              <span className="text-sm text-[var(--gray-400)]">Siblings</span>
              <div className="mt-2 space-y-2">
                {siblings.map((sib, i) => (
                  <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 ${isMale ? 'bg-blue-50/30' : 'bg-pink-50/30'}`}>
                    <div>
                      <p className="text-sm font-medium text-[var(--brown)]">{sib.name}</p>
                      <p className="text-xs text-[var(--gray-400)] capitalize">{sib.gender} &middot; {sib.marital_status === 'married' ? 'Married' : 'Unmarried'}</p>
                    </div>
                    {sib.occupation && (
                      <span className="text-xs text-[var(--gray-500)]">{sib.occupation}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Background */}
        <Section title="Additional Background" theme={theme}>
          <DetailRow label="Family Background" value={profile.family_background} />
          <DetailRow label="Property Details" value={profile.property_details} />
          <DetailRow label="Family Values" value={profile.family_values} />
          <DetailRow label="Additional Info" value={profile.additional_info} />
        </Section>

        {/* Partner Expectations */}
        <Section title="Partner Expectations" theme={theme}>
          <DetailRow
            label="Expected Age"
            value={profile.expected_age_min && profile.expected_age_max
              ? `${profile.expected_age_min} \u2013 ${profile.expected_age_max} yrs`
              : null}
          />
          <DetailRow
            label="Expected Height"
            value={profile.expected_height_min && profile.expected_height_max
              ? `${profile.expected_height_min}\u2019 \u2013 ${profile.expected_height_max}\u2019`
              : null}
          />
          <DetailRow label="Education Preference" value={profile.education_preference} />
          <DetailRow label="Occupation Preference" value={profile.occupation_preference} />
          <DetailRow label="Location Preference" value={profile.location_preference} />
          <DetailRow label="Community Preference" value={profile.community_preference} />
          <DetailRow label="Other Expectations" value={profile.other_expectations} />
        </Section>

        {/* Contact Details */}
        <Section title="Contact Details" theme={theme}>
          <DetailRow label="Phone" value={profile.phone} />
          <DetailRow label="WhatsApp" value={profile.whatsapp} />
          <DetailRow label="Email" value={profile.email} />
          <DetailRow label="Address" value={profile.address} />
          <DetailRow label="Admin Notes" value={profile.admin_notes} />
        </Section>

        {/* Settings & Visibility */}
        <Section title="Settings & Visibility" theme={theme}>
          <DetailRow label="Show Full Profile" value={profile.show_full_profile ? 'Yes' : 'No'} empty="" />
          <DetailRow label="Show Location" value={vs?.show_location ? 'Yes' : 'No'} empty="" />
          <DetailRow label="Show Expectations" value={vs?.show_expectations ? 'Yes' : 'No'} empty="" />
          <DetailRow label="Show Contact" value={vs?.show_contact ? 'Yes' : 'No'} empty="" />
        </Section>

      </div>

      {/* Match History */}
      <ProfileMatchHistory profileId={profile.id} matches={profileMatches || []} />

      {/* Share History */}
      {shares && shares.length > 0 ? (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-[var(--brown)] tracking-wide">Share History</h3>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-[var(--gray-100)]">
              {shares.map((share) => (
                <div key={share.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--brown)] truncate">
                      {share.recipient_name || share.recipient_phone || 'Unknown'}
                    </p>
                    <p className="text-xs text-[var(--gray-400)] mt-0.5">
                      {formatDate(share.shared_date)} &middot; {share.view_count} view{share.view_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Badge
                    variant={share.interest_status === 'interested' ? 'success' : share.interest_status === 'not_interested' ? 'danger' : 'default'}
                    className="flex-shrink-0 ml-3"
                  >
                    {share.interest_status === 'interested' ? 'Interested' : share.interest_status === 'not_interested' ? 'Not Interested' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-[var(--brown)] tracking-wide">Share History</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--gray-400)] text-center py-4">No share history available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
