/**
 * Types for the Data Contribution / Correction system
 */

import { SubmissionType, SubmissionPriority, DataSubmission } from '../services/dataSubmissions';

// Re-export for convenience
export type { SubmissionType, SubmissionPriority, DataSubmission };

export type WizardStep = 1 | 2 | 3 | 4;
export type TabType = 'contribute' | 'history';

export interface CategoryOption {
  id: SubmissionType;
  title: string;
  subtitle: string;
  icon: string;
  gradient: [string, string, string];
  emoji: string;
  fields: FieldOption[];
}

export interface FieldOption {
  id: string;
  label: string;
  placeholder: string;
  icon: string;
}

export interface EntityData {
  id: string;
  name: string;
  type: string;
  location?: string;
  verified?: boolean;
}

export interface ContributeFormData {
  category: CategoryOption | null;
  entity: EntityData | null;
  field: FieldOption | null;
  customField: string;
  currentValue: string;
  newValue: string;
  reason: string;
  sourceUrl: string;
  priority: SubmissionPriority;
}
