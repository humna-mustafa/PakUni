/**
 * Entry Tests - Pure helper functions & constants
 */

import {EntryTestData} from '../../data';

// Filter categories
export const CATEGORIES = ['All', 'Engineering', 'Medical', 'Business', 'General'];

/** Get primary category from applicable_for array */
export const getTestCategory = (test: EntryTestData): string => {
  const applicableFor = test.applicable_for || [];
  if (applicableFor.some(a => a.toLowerCase().includes('engineering'))) return 'Engineering';
  if (applicableFor.some(a => a.toLowerCase().includes('medical') || a.toLowerCase().includes('mbbs'))) return 'Medical';
  if (applicableFor.some(a => a.toLowerCase().includes('business') || a.toLowerCase().includes('mba'))) return 'Business';
  return 'General';
};

/** Calculate days until a test date string */
export const getDaysUntil = (dateString: string): number | null => {
  if (!dateString || dateString === 'TBA') return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Try parsing formats like "July 2025", "15 July 2025", "2025-07-15"
  let testDate = new Date(dateString);

  if (isNaN(testDate.getTime())) {
    const monthYearMatch = dateString.match(/(\w+)\s+(\d{4})/);
    if (monthYearMatch) {
      testDate = new Date(`${monthYearMatch[1]} 1, ${monthYearMatch[2]}`);
    }
  }

  if (isNaN(testDate.getTime())) return null;

  const diffTime = testDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/** Get a short field tag from applicable_for */
export const getFieldTag = (test: EntryTestData): string => {
  const fields = test.applicable_for || [];
  if (fields.some(f => f.toLowerCase().includes('mbbs') || f.toLowerCase().includes('medical'))) return 'Medical';
  if (fields.some(f => f.toLowerCase().includes('engineering'))) return 'Engineering';
  if (fields.some(f => f.toLowerCase().includes('computer') || f.toLowerCase().includes('software') || f.toLowerCase().includes('ai'))) return 'CS / IT';
  if (fields.some(f => f.toLowerCase().includes('business') || f.toLowerCase().includes('bba') || f.toLowerCase().includes('mba'))) return 'Business';
  if (fields.some(f => f.toLowerCase().includes('law') || f.toLowerCase().includes('llb'))) return 'Law';
  if (fields.some(f => f.toLowerCase().includes('phd') || f.toLowerCase().includes('ms') || f.toLowerCase().includes('mphil'))) return 'Graduate';
  return fields[0] || 'General';
};

/** Format test date to short readable form */
export const getShortDate = (dateString: string): string => {
  if (!dateString || dateString === 'TBA') return 'TBA';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateString;
  }
};
