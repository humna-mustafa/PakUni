/**
 * Data submission constants and types
 */

import {SubmissionType, SubmissionPriority} from '../../services/dataSubmissions';
import {STATUS, PRIORITY} from '../../constants/brand';

export type TabType = 'submit' | 'history';

export const SUBMISSION_TYPES: {value: SubmissionType; label: string; icon: string; description: string}[] = [
  {value: 'merit_update', label: 'Merit List', icon: 'trophy', description: 'Closing merit, cutoffs, etc.'},
  {value: 'date_correction', label: 'Deadline', icon: 'calendar', description: 'Application or fee deadlines'},
  {value: 'entry_test_update', label: 'Entry Test', icon: 'school', description: 'Test dates, registration, fees'},
  {value: 'university_info', label: 'University', icon: 'business', description: 'University information'},
  {value: 'scholarship_info', label: 'Scholarship', icon: 'cash', description: 'Scholarship details'},
  {value: 'program_info', label: 'Program', icon: 'book', description: 'Program details, eligibility'},
  {value: 'fee_update', label: 'Fee Structure', icon: 'card', description: 'Tuition, hostel, other fees'},
  {value: 'other', label: 'Other', icon: 'ellipsis-horizontal', description: 'Any other correction'},
];

export const PRIORITY_OPTIONS: {value: SubmissionPriority; label: string; color: string}[] = [
  {value: 'low', label: 'Low', color: PRIORITY.low.color},
  {value: 'medium', label: 'Medium', color: PRIORITY.medium.color},
  {value: 'high', label: 'High (Time Sensitive)', color: PRIORITY.high.color},
  {value: 'urgent', label: 'Urgent', color: PRIORITY.urgent.color},
];

export const STATUS_COLORS: Record<string, {bg: string; text: string}> = {
  pending: {bg: STATUS.pending.bg, text: STATUS.pending.text},
  under_review: {bg: STATUS.under_review.bg, text: STATUS.under_review.text},
  approved: {bg: STATUS.approved.bg, text: STATUS.approved.text},
  rejected: {bg: STATUS.rejected.bg, text: STATUS.rejected.text},
  auto_approved: {bg: STATUS.auto_approved.bg, text: STATUS.auto_approved.text},
};
