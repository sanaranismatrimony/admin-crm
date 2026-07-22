'use client';

import { X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { ConfidenceDot } from '@/components/ui/ConfidenceDot';
import type { ExtractionResult } from '@/types';

interface BiodataReviewPanelProps {
  result: ExtractionResult;
  fileUrl: string;
  mimeType: string;
  fileName: string;
  onClose: () => void;
}

const sections: { key: string; label: string; fields: string[] }[] = [
  { key: 'basic', label: 'Basic Info', fields: ['full_name', 'profile_type', 'gender'] },
  { key: 'personal', label: 'Personal & Birth', fields: ['date_of_birth', 'time_of_birth', 'place_of_birth', 'age', 'height_feet', 'height_inches', 'weight'] },
  { key: 'community', label: 'Community', fields: ['caste', 'gotram', 'rashi', 'nakshatram', 'padam'] },
  { key: 'education', label: 'Education & Career', fields: ['education', 'education_qualification', 'career', 'occupation', 'salary', 'business_name', 'business_type', 'annual_income'] },
  { key: 'location', label: 'Location', fields: ['state', 'district', 'city', 'native_place'] },
  { key: 'family', label: 'Family', fields: ['father_name', 'father_occupation', 'mother_name', 'mother_surname', 'mother_gotram', 'siblings', 'family_background', 'property_details', 'family_values'] },
  { key: 'expectations', label: 'Expectations', fields: ['expected_age_min', 'expected_age_max', 'expected_height_min', 'expected_height_max', 'education_preference', 'occupation_preference', 'location_preference', 'community_preference', 'other_expectations'] },
  { key: 'contact', label: 'Contact', fields: ['phone', 'whatsapp', 'email', 'address'] },
];

const fieldLabels: Record<string, string> = {
  full_name: 'Full Name',
  profile_type: 'Category',
  gender: 'Gender',
  date_of_birth: 'DOB',
  time_of_birth: 'Time of Birth',
  place_of_birth: 'Place of Birth',
  age: 'Age',
  height_feet: 'Height (ft)',
  height_inches: 'Height (in)',
  weight: 'Weight',
  caste: 'Caste',
  gotram: 'Gotram',
  rashi: 'Rashi',
  nakshatram: 'Nakshatram',
  padam: 'Padam',
  education: 'Education',
  education_qualification: 'Qualification',
  career: 'Career',
  occupation: 'Occupation',
  salary: 'Salary',
  business_name: 'Business Name',
  business_type: 'Business Type',
  annual_income: 'Annual Income',
  state: 'State',
  district: 'District',
  city: 'City',
  native_place: 'Native Place',
  father_name: 'Father\'s Name',
  father_occupation: 'Father\'s Occupation',
  mother_name: 'Mother\'s Name',
  mother_surname: 'Mother\'s Surname',
  mother_gotram: 'Mother\'s Gotram',
  siblings: 'Siblings',
  family_background: 'Family Background',
  property_details: 'Property Details',
  family_values: 'Family Values',
  additional_info: 'Additional Info',
  expected_age_min: 'Age Min',
  expected_age_max: 'Age Max',
  expected_height_min: 'Height Min',
  expected_height_max: 'Height Max',
  education_preference: 'Education Pref.',
  occupation_preference: 'Occupation Pref.',
  location_preference: 'Location Pref.',
  community_preference: 'Community Pref.',
  other_expectations: 'Other Expectations',
  phone: 'Phone',
  whatsapp: 'WhatsApp',
  email: 'Email',
  address: 'Address',
};

export function BiodataReviewPanel({ result, fileUrl, mimeType, fileName, onClose }: BiodataReviewPanelProps) {
  const allFields = result.fields || {};
  const isImage = mimeType.startsWith('image/');
  const isPdf = mimeType === 'application/pdf' || fileName.endsWith('.pdf');

  return (
    <Card className="overflow-hidden" style={{ borderColor: 'var(--gold)' }}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: 'var(--border-default)' }}>
          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Extraction Review</h4>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
          
          <div className="p-4 max-h-[500px] overflow-auto" style={{ background: 'var(--gray-50)' }}>
            <p className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Original Document</p>
            {isImage ? (
              <img src={fileUrl} alt="Biodata" className="w-full rounded-lg border" style={{ borderColor: 'var(--border-input)' }} />
            ) : isPdf ? (
              <iframe src={fileUrl} className="w-full h-[460px] rounded-lg border" style={{ borderColor: 'var(--border-input)' }} title="Biodata PDF" />
            ) : (
              <div className="p-4 rounded-lg border text-xs whitespace-pre-wrap font-mono max-h-[460px] overflow-auto" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', borderColor: 'var(--border-input)' }}>
                {result.raw_text || 'Document text preview not available'}
              </div>
            )}
          </div>

          <div className="p-4 max-h-[500px] overflow-auto">
            <p className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Extracted Fields ({result.field_count})
            </p>
            <div className="space-y-3">
              {sections.map((section) => {
                const hasFields = section.fields.some((k) => {
                  const f = (allFields as any)[k];
                  return f && f.value !== null && f.value !== undefined;
                });
                if (!hasFields) return null;

                return (
                  <div key={section.key}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                      {section.label}
                    </p>
                    <div className="space-y-0.5">
                      {section.fields.map((k) => {
                        const f = (allFields as any)[k];
                        if (!f || f.value === null || f.value === undefined) return null;
                        return (
                          <div key={k} className="flex items-center gap-2 text-xs">
                            <ConfidenceDot level={f.confidence} />
                            <span className="w-28 shrink-0" style={{ color: 'var(--text-muted)' }}>{fieldLabels[k] || k}:</span>
                            <span
                              className="font-medium"
                              style={{
                                color: f.confidence === 'low' ? 'var(--red)' : 'var(--text-primary)',
                                background: f.confidence === 'low' ? 'rgba(220,38,38,0.08)' : 'transparent',
                                padding: f.confidence === 'low' ? '0 4px' : 0,
                                borderRadius: f.confidence === 'low' ? 4 : 0,
                              }}
                            >
                              {String(f.value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {result.field_count === 0 && (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No fields were extracted from this document.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
