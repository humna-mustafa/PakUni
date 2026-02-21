/**
 * Compare screen data - metrics and helpers
 */

import {PROGRAMS} from '../../data/programs';
import {UniversityData} from '../../data';
import {formatProvinceName} from '../../utils/provinceUtils';

export const COMPARISON_METRICS = [
  {key: 'type', label: 'Type', iconName: 'business-outline'},
  {key: 'city', label: 'City', iconName: 'location-outline'},
  {key: 'province', label: 'Province', iconName: 'map-outline'},
  {key: 'ranking', label: 'National Rank', iconName: 'trophy-outline'},
  {key: 'hec_category', label: 'HEC Category', iconName: 'ribbon-outline'},
  {key: 'established', label: 'Established', iconName: 'calendar-outline'},
  {key: 'programs', label: 'Programs', iconName: 'book-outline'},
  {key: 'campuses', label: 'Campuses', iconName: 'business-outline'},
  {key: 'fee', label: 'Fee Range', iconName: 'cash-outline'},
];

export type ComparisonMetric = (typeof COMPARISON_METRICS)[0];

const formatFee = (fee: number) => {
  if (fee >= 1000000) return `${(fee / 1000000).toFixed(1)}M`;
  return `${(fee / 1000).toFixed(0)}K`;
};

export const getMetricValue = (uni: UniversityData | null, metricKey: string): string => {
  if (!uni) return '-';
  switch (metricKey) {
    case 'type':
      return uni.type ? uni.type.charAt(0).toUpperCase() + uni.type.slice(1) : 'N/A';
    case 'city':
      return uni.city || 'N/A';
    case 'province':
      return uni.province ? formatProvinceName(uni.province) : 'N/A';
    case 'ranking':
      return uni.ranking_national && uni.ranking_national > 0 ? `#${uni.ranking_national}` : 'Not Ranked';
    case 'hec_category':
      return uni.ranking_hec || 'N/A';
    case 'established':
      return uni.established_year ? uni.established_year.toString() : 'N/A';
    case 'programs': {
      const count = PROGRAMS.filter(p => p.universities.includes(uni.short_name)).length;
      return count > 0 ? `${count} Programs` : 'Contact Univ.';
    }
    case 'campuses': {
      const campusCount = uni.campuses?.length || 0;
      if (campusCount > 1) return `${campusCount} Campuses`;
      if (campusCount === 1) return '1 Campus';
      return 'N/A';
    }
    case 'fee': {
      const uniPrograms = PROGRAMS.filter(p => p.universities.includes(uni.short_name));
      if (uniPrograms.length === 0) return 'Contact Univ.';
      const fees = uniPrograms.map(p => p.avg_fee_per_semester).filter(f => f > 0);
      if (fees.length === 0) return 'Contact Univ.';
      const minFee = Math.min(...fees);
      const maxFee = Math.max(...fees);
      return minFee === maxFee
        ? `PKR ${formatFee(minFee)}/sem`
        : `PKR ${formatFee(minFee)}-${formatFee(maxFee)}`;
    }
    default:
      return 'N/A';
  }
};
