'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Sibling } from '@/types';

interface SiblingFormProps {
  siblings: Sibling[];
  onChange: (siblings: Sibling[]) => void;
}

export function SiblingForm({ siblings, onChange }: SiblingFormProps) {
  function addSibling() {
    onChange([...siblings, { name: '', gender: 'male', marital_status: 'unmarried', occupation: '' }]);
  }

  function removeSibling(index: number) {
    onChange(siblings.filter((_, i) => i !== index));
  }

  function updateSibling(index: number, field: keyof Sibling, value: string) {
    const updated = siblings.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {siblings.map((sibling, index) => (
        <div key={index} className="p-4 bg-[var(--cream)] rounded-xl border border-[var(--gray-100)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[var(--brown-mid)]">Sibling {index + 1}</span>
            <button
              type="button"
              onClick={() => removeSibling(index)}
              className="p-1 rounded-lg hover:bg-red-50 text-[var(--gray-400)] hover:text-[var(--red)] transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              name={`sibling-name-${index}`}
              placeholder="Name"
              value={sibling.name}
              onChange={(e) => updateSibling(index, 'name', e.target.value)}
            />
            <Select
              name={`sibling-gender-${index}`}
              value={sibling.gender}
              onChange={(e) => updateSibling(index, 'gender', e.target.value)}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
            />
            <Select
              name={`sibling-marital-${index}`}
              value={sibling.marital_status}
              onChange={(e) => updateSibling(index, 'marital_status', e.target.value)}
              options={[
                { value: 'married', label: 'Married' },
                { value: 'unmarried', label: 'Unmarried' },
              ]}
            />
            <Input
              name={`sibling-occupation-${index}`}
              placeholder="Occupation"
              value={sibling.occupation}
              onChange={(e) => updateSibling(index, 'occupation', e.target.value)}
            />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addSibling}>
        <Plus className="w-4 h-4" /> Add Sibling
      </Button>
    </div>
  );
}
