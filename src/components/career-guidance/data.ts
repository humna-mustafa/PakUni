/**
 * Career Guidance data - categories, helpers, and utilities
 */

import type {CareerField} from '../../data';

export const CATEGORIES = ['All', 'Technology', 'Healthcare', 'Business', 'Engineering', 'Creative'];

export const getCareerCategory = (career: CareerField): string => {
  const id = career.id.toLowerCase();
  const name = career.name.toLowerCase();

  if (id.includes('software') || id.includes('data') || id.includes('cyber') || id.includes('ai') || id.includes('web') || name.includes('tech')) {
    return 'Technology';
  }
  if (id.includes('medicine') || id.includes('dentistry') || id.includes('pharmacy') || id.includes('nursing') || id.includes('health') || name.includes('doctor')) {
    return 'Healthcare';
  }
  if (id.includes('business') || id.includes('finance') || id.includes('banking') || id.includes('accounting') || id.includes('marketing') || id.includes('hr')) {
    return 'Business';
  }
  if (id.includes('engineering') || id.includes('civil') || id.includes('mechanical') || id.includes('electrical') || id.includes('chemical')) {
    return 'Engineering';
  }
  if (id.includes('design') || id.includes('art') || id.includes('media') || id.includes('fashion') || id.includes('architecture')) {
    return 'Creative';
  }
  return 'Other';
};

export const getCareerDuration = (career: CareerField): string => {
  if (career.duration) return career.duration;
  const educationList = career.required_education || [];
  for (const edu of educationList) {
    const durationMatch =
      edu.match(/\((\d+(?:-\d+)?\s*years?(?:\s*\+[^)]+)?)\)/i) ||
      edu.match(/(\d+(?:-\d+)?\s*years?)/i);
    if (durationMatch) return durationMatch[1].trim();
  }
  return '4 years';
};

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Technology': return '#4573DF';
    case 'Healthcare': return '#e74c3c';
    case 'Business': return '#9b59b6';
    case 'Engineering': return '#e67e22';
    case 'Creative': return '#1abc9c';
    default: return '#27ae60';
  }
};

export const getDemandColor = (trend: string): string => {
  switch (trend) {
    case 'rising': return '#10B981';
    case 'stable': return '#F59E0B';
    case 'declining': return '#EF4444';
    default: return '#10B981';
  }
};

export const getDemandLabel = (trend: string): string => {
  switch (trend) {
    case 'rising': return 'High';
    case 'stable': return 'Stable';
    case 'declining': return 'Low';
    default: return 'High';
  }
};
