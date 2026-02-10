/**
 * Constants for the Data Contribution / Correction system
 */

import { CategoryOption } from '../types/contribute';
import { GRADIENTS, STATUS, BRAND } from './brand';

export const CATEGORIES: CategoryOption[] = [
  {
    id: 'merit_update',
    title: 'Merit & Cutoffs',
    subtitle: 'Closing merit, aggregate scores',
    icon: 'trending-up',
    gradient: GRADIENTS.accent as [string, string, string],
    emoji: '📊',
    fields: [
      { id: 'closing_merit', label: 'Closing Merit', placeholder: 'e.g., 89.5%', icon: 'analytics' },
      { id: 'first_merit', label: '1st Merit List', placeholder: 'e.g., 92.3%', icon: 'ribbon' },
      { id: 'aggregate', label: 'Aggregate Score', placeholder: 'e.g., 85%', icon: 'calculator' },
      { id: 'seats', label: 'Total Seats', placeholder: 'e.g., 150', icon: 'people' },
    ],
  },
  {
    id: 'fee_update',
    title: 'Fee Structure',
    subtitle: 'Tuition, hostel, admission fees',
    icon: 'wallet',
    gradient: GRADIENTS.success as [string, string, string],
    emoji: '💰',
    fields: [
      { id: 'tuition', label: 'Tuition Fee', placeholder: 'e.g., PKR 500,000', icon: 'school' },
      { id: 'hostel', label: 'Hostel Fee', placeholder: 'e.g., PKR 80,000', icon: 'home' },
      { id: 'admission', label: 'Admission Fee', placeholder: 'e.g., PKR 25,000', icon: 'card' },
      { id: 'semester', label: 'Semester Fee', placeholder: 'e.g., PKR 250,000', icon: 'calendar' },
    ],
  },
  {
    id: 'date_correction',
    title: 'Dates & Deadlines',
    subtitle: 'Application, test, result dates',
    icon: 'calendar',
    gradient: GRADIENTS.error as [string, string, string],
    emoji: '📅',
    fields: [
      { id: 'app_deadline', label: 'Application Deadline', placeholder: 'e.g., March 15, 2025', icon: 'time' },
      { id: 'test_date', label: 'Test Date', placeholder: 'e.g., April 20, 2025', icon: 'document-text' },
      { id: 'result_date', label: 'Result Date', placeholder: 'e.g., May 10, 2025', icon: 'checkmark-circle' },
      { id: 'interview', label: 'Interview Date', placeholder: 'e.g., May 25, 2025', icon: 'chatbubbles' },
    ],
  },
  {
    id: 'entry_test_update',
    title: 'Entry Tests',
    subtitle: 'MDCAT, ECAT, NAT, GAT info',
    icon: 'document-text',
    gradient: GRADIENTS.warning as [string, string, string],
    emoji: '📝',
    fields: [
      { id: 'test_fee', label: 'Test Fee', placeholder: 'e.g., PKR 3,500', icon: 'cash' },
      { id: 'reg_deadline', label: 'Registration Deadline', placeholder: 'e.g., Feb 28, 2025', icon: 'time' },
      { id: 'syllabus', label: 'Syllabus Update', placeholder: 'Describe change', icon: 'book' },
      { id: 'centers', label: 'Test Centers', placeholder: 'e.g., 25 cities', icon: 'location' },
    ],
  },
  {
    id: 'university_info',
    title: 'University Info',
    subtitle: 'Contact, website, ranking',
    icon: 'business',
    gradient: [BRAND.primary, BRAND.primaryDark, BRAND.primaryDarkest] as [string, string, string],
    emoji: '🏛️',
    fields: [
      { id: 'website', label: 'Website URL', placeholder: 'e.g., www.nust.edu.pk', icon: 'globe' },
      { id: 'phone', label: 'Phone Number', placeholder: 'e.g., 051-9085xxxx', icon: 'call' },
      { id: 'address', label: 'Address', placeholder: 'Full address', icon: 'location' },
      { id: 'ranking', label: 'Ranking', placeholder: 'e.g., #3 in Pakistan', icon: 'trophy' },
    ],
  },
  {
    id: 'scholarship_info',
    title: 'Scholarships',
    subtitle: 'Eligibility, amount, coverage',
    icon: 'ribbon',
    gradient: GRADIENTS.highlight as [string, string, string],
    emoji: '🎓',
    fields: [
      { id: 'amount', label: 'Scholarship Amount', placeholder: 'e.g., 100% tuition', icon: 'cash' },
      { id: 'eligibility', label: 'Eligibility Criteria', placeholder: 'Requirements', icon: 'checkmark-done' },
      { id: 'coverage', label: 'Coverage', placeholder: 'What it covers', icon: 'shield-checkmark' },
      { id: 'deadline', label: 'Application Deadline', placeholder: 'e.g., Jan 31, 2025', icon: 'time' },
    ],
  },
];

export const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string; label: string }> = {
  pending: { bg: STATUS.pending.bg, text: STATUS.pending.text, icon: 'time', label: 'Pending' },
  under_review: { bg: STATUS.under_review.bg, text: STATUS.under_review.text, icon: 'eye', label: 'Reviewing' },
  approved: { bg: STATUS.approved.bg, text: STATUS.approved.text, icon: 'checkmark-circle', label: 'Approved' },
  rejected: { bg: STATUS.rejected.bg, text: STATUS.rejected.text, icon: 'close-circle', label: 'Rejected' },
  auto_approved: { bg: STATUS.auto_approved.bg, text: STATUS.auto_approved.text, icon: 'flash', label: 'Auto-Approved' },
};

export const QUICK_REASONS = [
  { id: 'official', text: 'Official website updated', icon: 'globe' },
  { id: 'revised', text: 'Fee revised for 2025-26', icon: 'cash' },
  { id: 'merit', text: 'New merit list released', icon: 'list' },
  { id: 'deadline', text: 'Deadline extended', icon: 'time' },
  { id: 'error', text: 'Typo/Error in current data', icon: 'alert-circle' },
];
