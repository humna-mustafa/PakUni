/**
 * Province Display Utilities
 * Centralized province name formatting for consistent UI display
 * 
 * Data layer uses abbreviated keys (kpk, azad_kashmir, etc.)
 * This utility converts them to proper display names
 */

// Mapping from internal data keys to full display names
export const PROVINCE_DISPLAY_MAP: Record<string, string> = {
  punjab: 'Punjab',
  sindh: 'Sindh',
  kpk: 'Khyber Pakhtunkhwa',
  balochistan: 'Balochistan',
  islamabad: 'Islamabad Capital Territory',
  azad_kashmir: 'Azad Jammu & Kashmir',
  gilgit_baltistan: 'Gilgit-Baltistan',
};

// Short abbreviations for compact UI (chips, badges)
export const PROVINCE_SHORT_MAP: Record<string, string> = {
  punjab: 'Punjab',
  sindh: 'Sindh',
  kpk: 'KPK',
  balochistan: 'Balochistan',
  islamabad: 'ICT',
  azad_kashmir: 'AJK',
  gilgit_baltistan: 'GB',
};

/**
 * Format province key to full display name
 * @param provinceKey - Internal data key (e.g., "kpk", "azad_kashmir")
 * @returns Full province name (e.g., "Khyber Pakhtunkhwa", "Azad Jammu & Kashmir")
 */
export const formatProvinceName = (provinceKey: string): string => {
  if (!provinceKey) return '';
  const key = provinceKey.toLowerCase().trim();
  return PROVINCE_DISPLAY_MAP[key] || provinceKey.charAt(0).toUpperCase() + provinceKey.slice(1);
};

/**
 * Format province key to short abbreviation
 * @param provinceKey - Internal data key (e.g., "kpk", "azad_kashmir")
 * @returns Short name (e.g., "KPK", "AJK")
 */
export const formatProvinceShort = (provinceKey: string): string => {
  if (!provinceKey) return '';
  const key = provinceKey.toLowerCase().trim();
  return PROVINCE_SHORT_MAP[key] || provinceKey.charAt(0).toUpperCase() + provinceKey.slice(1);
};

/**
 * Get all province options for filter dropdowns
 * Values match the data layer keys, labels are display names
 */
export const PROVINCE_FILTER_OPTIONS = Object.entries(PROVINCE_DISPLAY_MAP).map(
  ([value, label]) => ({ value, label })
);

export default {
  formatProvinceName,
  formatProvinceShort,
  PROVINCE_DISPLAY_MAP,
  PROVINCE_SHORT_MAP,
  PROVINCE_FILTER_OPTIONS,
};
