import type { ExtractionResult } from '@/types';

export interface ValidationWarning {
  field: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export function validateExtraction(result: ExtractionResult): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const f = result.fields;

  if (!f.full_name.value) {
    warnings.push({
      field: 'full_name',
      severity: 'warning',
      message: 'Full name not extracted. Please enter manually.',
    });
  }

  if (!f.gender.value && !f.profile_type.value) {
    warnings.push({
      field: 'gender',
      severity: 'warning',
      message: 'Gender/Profile type not detected. Please select manually.',
    });
  }

  if (f.age.value !== null && f.date_of_birth.value) {
    const dobYear = f.date_of_birth.value.match(/(\d{4})/);
    if (dobYear) {
      const calculatedAge = new Date().getFullYear() - parseInt(dobYear[1]);
      if (Math.abs(calculatedAge - f.age.value) > 2) {
        warnings.push({
          field: 'age',
          severity: 'warning',
          message: `Age (${f.age.value}) doesn't match DOB year (${dobYear[1]} → ~${calculatedAge} years).`,
        });
      }
    }
  }

  if (f.phone.value) {
    const digits = f.phone.value.replace(/\D/g, '');
    if (digits.length !== 10 || !/^[6-9]/.test(digits)) {
      warnings.push({
        field: 'phone',
        severity: 'warning',
        message: `Phone "${f.phone.value}" may be invalid. Indian numbers are 10 digits starting with 6-9.`,
      });
    }
  }

  if (f.email.value) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value)) {
      warnings.push({
        field: 'email',
        severity: 'warning',
        message: `Email "${f.email.value}" doesn't look valid.`,
      });
    }
  }

  if (f.height_feet.value !== null) {
    if (f.height_feet.value < 1 || f.height_feet.value > 8) {
      warnings.push({
        field: 'height_feet',
        severity: 'warning',
        message: `Height ${f.height_feet.value}ft seems unrealistic.`,
      });
    }
  }

  if (f.age.value !== null) {
    if (f.age.value < 15 || f.age.value > 80) {
      warnings.push({
        field: 'age',
        severity: 'warning',
        message: `Age ${f.age.value} seems unusual for matrimony.`,
      });
    }
  }

  if (!f.date_of_birth.value && f.age.value === null) {
    warnings.push({
      field: 'date_of_birth',
      severity: 'info',
      message: 'Neither DOB nor age extracted. Please fill at least one.',
    });
  }

  return warnings;
}
