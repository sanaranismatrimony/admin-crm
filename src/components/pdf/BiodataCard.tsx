import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { Profile, Sibling } from '@/types';

const GOLD = '#D4A853';
const GOLD_DARK = '#B8860B';
const CREAM = '#FDF8F0';
const BROWN = '#5C4033';
const BROWN_LIGHT = '#7A5A4A';
const LABEL = '#7A5A4A';
const DIVIDER = '#EDE6D8';

const styles = StyleSheet.create({
  page: {
    padding: 32,
    backgroundColor: CREAM,
    fontFamily: 'Times-Roman',
    fontSize: 11,
    color: BROWN,
  },
  /* Double-line border */
  borderOuter: {
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 8,
    padding: 6,
    flex: 1,
  },
  borderInner: {
    padding: 24,
    flex: 1,
  },
  /* ─── Header ─── */
  header: {
    textAlign: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: GOLD,
  },
  logoImg: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  profileId: {
    fontSize: 8,
    color: LABEL,
    fontFamily: 'Times-Roman',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  /* ─── Photos ─── */
  photosRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
    height: 105,
  },
  photoContainer: {
    flex: 1,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GOLD,
  },
  photoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  /* ─── Two-column grid ─── */
  grid: {
    flexDirection: 'row',
    gap: 22,
    marginBottom: 16,
  },
  col: {
    flex: 1,
  },
  /* ─── Section ─── */
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Times-Roman',
    fontSize: 11,
    color: GOLD_DARK,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  sectionLine: {
    height: 1,
    backgroundColor: GOLD,
    marginBottom: 8,
    opacity: 0.6,
  },
  /* ─── Data rows ─── */
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  dataLabel: {
    width: 95,
    fontSize: 11,
    color: LABEL,
    fontFamily: 'Times-Roman',
  },
  dataValue: {
    flex: 1,
    fontSize: 11,
    color: BROWN,
    fontFamily: 'Times-Roman',
    textAlign: 'right',
  },
  /* ─── Siblings ─── */
  siblingHeader: {
    fontSize: 11,
    color: LABEL,
    fontFamily: 'Times-Roman',
    marginTop: 6,
    marginBottom: 4,
  },
  siblingRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  siblingName: {
    width: 85,
    fontSize: 11,
    color: BROWN,
    fontFamily: 'Times-Roman',
  },
  siblingDetail: {
    flex: 1,
    fontSize: 11,
    color: LABEL,
    fontFamily: 'Times-Roman',
    textAlign: 'right',
  },
  /* ─── Footer ─── */
  footer: {
    textAlign: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: GOLD,
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 7.5,
    color: LABEL,
    fontFamily: 'Times-Roman',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
});

function pdfFormatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function DataRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{String(value)}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
      {children}
    </View>
  );
}

interface BiodataCardProps {
  profile: Profile;
  siblings?: Sibling[];
  logoSrc?: string;
  logoWidth?: number;
  logoHeight?: number;
}

export function BiodataCard({ profile, siblings = [], logoSrc, logoWidth = 300, logoHeight = 111 }: BiodataCardProps) {
  const height = profile.height_feet
    ? `${profile.height_feet}'${profile.height_inches || 0}"`
    : '';

  const photos = profile.photo_urls || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.borderOuter}>
          <View style={styles.borderInner}>
            {/* ─── Header ─── */}
            <View style={styles.header}>
              {logoSrc && (
                <Image src={logoSrc} style={[styles.logoImg, { width: logoWidth, height: logoHeight }]} />
              )}
              <Text style={styles.profileId}>Profile ID: {profile.profile_id}</Text>
            </View>

            {/* ─── Photos ─── */}
            {photos.length > 0 && (
              <View style={styles.photosRow}>
                {photos.map((url, i) => (
                  <View key={i} style={styles.photoContainer}>
                    <Image src={url} style={styles.photoImg} />
                  </View>
                ))}
              </View>
            )}

            {/* ─── Two-Column Content ─── */}
            <View style={styles.grid}>
              {/* Left Column */}
              <View style={styles.col}>
                <Section title="Personal & Birth Details">
                  <DataRow label="Full Name" value={profile.full_name} />
                  <DataRow label="Age" value={profile.age ? `${profile.age} yrs` : null} />
                  <DataRow label="Height" value={height} />
                  <DataRow label="Weight" value={profile.weight ? `${profile.weight} kg` : null} />
                  <DataRow label="Date of Birth" value={profile.date_of_birth ? pdfFormatDate(profile.date_of_birth) : null} />
                  <DataRow label="Place of Birth" value={profile.place_of_birth} />
                  <DataRow label="Time of Birth" value={profile.time_of_birth} />
                </Section>

                <Section title="Community Details">
                  <DataRow label="Caste" value={profile.caste} />
                  <DataRow label="Gotram" value={profile.gotram} />
                  <DataRow label="Rashi" value={profile.rashi} />
                  <DataRow label="Nakshatram" value={profile.nakshatram} />
                  <DataRow label="Padam" value={profile.padam} />
                </Section>
              </View>

              {/* Right Column */}
              <View style={styles.col}>
                <Section title="Education & Career">
                  <DataRow label="Education" value={profile.education} />
                  <DataRow label="Qualification" value={profile.education_qualification} />
                  <DataRow label="Occupation" value={profile.occupation} />
                  <DataRow label="Career" value={profile.career} />
                  <DataRow label="Salary" value={profile.salary} />
                  {profile.business_name && <DataRow label="Business Name" value={profile.business_name} />}
                  {profile.business_type && <DataRow label="Business Type" value={profile.business_type} />}
                  <DataRow label="Annual Income" value={profile.annual_income} />
                </Section>

                <Section title="Family Details">
                  <DataRow label="Father's Name" value={profile.father_name} />
                  <DataRow label="Father's Occ." value={profile.father_occupation} />
                  <DataRow label="Mother's Name" value={profile.mother_name} />
                  <DataRow label="Mother's Surname" value={profile.mother_surname} />
                  <DataRow label="Mother's Gotram" value={profile.mother_gotram} />
                  {profile.family_background && <DataRow label="Family Background" value={profile.family_background} />}
                  {profile.property_details && <DataRow label="Property Details" value={profile.property_details} />}
                  {profile.family_values && <DataRow label="Family Values" value={profile.family_values} />}
                  {siblings.length > 0 && (
                    <>
                      <Text style={styles.siblingHeader}>Siblings</Text>
                      {siblings.map((sib, i) => (
                        <View key={i} style={styles.siblingRow}>
                          <Text style={styles.siblingName}>{sib.name}</Text>
                          <Text style={styles.siblingDetail}>
                            {sib.gender === 'male' ? 'Brother' : 'Sister'} |{' '}
                            {sib.marital_status === 'married' ? 'Married' : 'Unmarried'}
                            {sib.occupation ? ` | ${sib.occupation}` : ''}
                          </Text>
                        </View>
                      ))}
                    </>
                  )}
                </Section>
              </View>
            </View>

            {/* ─── Footer ─── */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>This biodata is shared exclusively through Sana Rani's Matrimony</Text>
              <Text style={styles.footerText}>For further details, please contact Sana Rani</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
