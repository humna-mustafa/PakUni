/**
 * Fee Range Utility
 * 
 * Converts exact fee values to user-friendly ranges
 * Helps prevent data discrepancies while giving accurate ballpark figures
 * 
 * Examples:
 * - 150,000 → 140k - 160k (±5% range)
 * - 500,000 → 480k - 520k (±4% range for higher fees)
 * - 85,000 → 80k - 90k (±5% range)
 */

export interface FeeRange {
  min: number;
  max: number;
  minDisplay: string; // "140k", "500k", etc.
  maxDisplay: string;
  range: string; // "140k - 160k"
  isExact: boolean; // true if should show exact value
  currency: string; // "PKR", etc.
}

export interface FeeRangeOptions {
  exactThreshold?: number; // Show exact if fee is below this
  rangePercent?: number; // Percentage range (default 5%)
  currency?: string;
}

const DEFAULT_OPTIONS: Required<FeeRangeOptions> = {
  exactThreshold: 50000, // Show exact values below 50k
  rangePercent: 5, // ±5% range
  currency: 'PKR',
};

/**
 * Convert a fee value to a user-friendly range
 */
export function getFeeRange(fee: number | null | undefined, options: FeeRangeOptions = {}): FeeRange {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!fee || fee <= 0) {
    return {
      min: 0,
      max: 0,
      minDisplay: 'N/A',
      maxDisplay: 'N/A',
      range: 'Contact university',
      isExact: true,
      currency: opts.currency,
    };
  }

  // Show exact for small values
  if (fee < opts.exactThreshold) {
    return {
      min: fee,
      max: fee,
      minDisplay: formatCurrency(fee),
      maxDisplay: formatCurrency(fee),
      range: formatCurrency(fee),
      isExact: true,
      currency: opts.currency,
    };
  }

  // Calculate range
  const variance = fee * (opts.rangePercent / 100);
  const min = Math.floor((fee - variance) / 1000) * 1000; // Round down to nearest 1k
  const max = Math.ceil((fee + variance) / 1000) * 1000; // Round up to nearest 1k

  return {
    min,
    max,
    minDisplay: formatCurrency(min),
    maxDisplay: formatCurrency(max),
    range: `${formatCurrency(min)} - ${formatCurrency(max)}`,
    isExact: false,
    currency: opts.currency,
  };
}

/**
 * Format currency value to display string (e.g., 150000 → "150k")
 */
export function formatCurrency(amount: number, currency: string = 'PKR'): string {
  if (!amount || amount <= 0) {
    return '0';
  }

  // For values >= 1 million
  if (amount >= 1000000) {
    const millions = (amount / 1000000).toFixed(1);
    return `${millions}M`;
  }

  // For values >= 1000
  if (amount >= 1000) {
    const thousands = Math.round(amount / 1000);
    return `${thousands}k`;
  }

  // For smaller values
  return amount.toString();
}

/**
 * Format a fee range for display
 * Example: 150000 → "150k - 160k"
 */
export function displayFeeRange(
  minFee: number | null,
  maxFee: number | null,
  options: FeeRangeOptions = {},
): string {
  // If both are provided, return the range
  if (minFee && maxFee && minFee !== maxFee) {
    return `${formatCurrency(minFee)} - ${formatCurrency(maxFee)}`;
  }

  // If only one is provided
  const fee = minFee || maxFee;
  if (!fee) {
    return 'Contact university';
  }

  // Use the getFeeRange utility
  return getFeeRange(fee, options).range;
}

/**
 * Get fee range with context for display
 * Returns full object with min/max for comparison
 */
export function analyzeFeeRange(fee: number | null, options: FeeRangeOptions = {}): {
  range: FeeRange;
  description: string;
  affordabilityTier: 'budget' | 'moderate' | 'premium' | 'luxury';
} {
  const range = getFeeRange(fee, options);

  let description = '';
  let affordabilityTier: 'budget' | 'moderate' | 'premium' | 'luxury' = 'moderate';

  if (!fee || fee <= 0) {
    description = 'Fee information not available. Contact the university.';
  } else if (fee < 100000) {
    description = 'Very affordable option';
    affordabilityTier = 'budget';
  } else if (fee < 300000) {
    description = 'Moderately priced';
    affordabilityTier = 'moderate';
  } else if (fee < 800000) {
    description = 'Premium program';
    affordabilityTier = 'premium';
  } else {
    description = 'High-end program';
    affordabilityTier = 'luxury';
  }

  return {
    range,
    description,
    affordabilityTier,
  };
}

/**
 * Compare two fees and show which is more/less expensive
 */
export function compareFees(
  fee1: number | null,
  fee2: number | null,
  options: FeeRangeOptions = {},
): {
  difference: number;
  percentDifference: number;
  isFirstMoreExpensive: boolean;
  comparisonText: string;
} {
  if (!fee1 || !fee2) {
    return {
      difference: 0,
      percentDifference: 0,
      isFirstMoreExpensive: false,
      comparisonText: 'Cannot compare with missing fee data',
    };
  }

  const difference = fee1 - fee2;
  const percentDifference = (difference / fee2) * 100;
  const isFirstMoreExpensive = difference > 0;

  let comparisonText = '';
  if (Math.abs(percentDifference) < 5) {
    comparisonText = 'Similar pricing';
  } else if (isFirstMoreExpensive) {
    comparisonText = `${Math.round(percentDifference)}% more expensive`;
  } else {
    comparisonText = `${Math.round(Math.abs(percentDifference))}% cheaper`;
  }

  return {
    difference,
    percentDifference,
    isFirstMoreExpensive,
    comparisonText,
  };
}

/**
 * Get fee range with scholarly insights
 */
export function getFeeInsights(fee: number | null): {
  averageCost: string;
  totalInvestment: string; // For 4-year program
  monthlyEstimate: string;
  scholarshipPotential: string;
} {
  if (!fee || fee <= 0) {
    return {
      averageCost: 'N/A',
      totalInvestment: 'N/A',
      monthlyEstimate: 'N/A',
      scholarshipPotential: 'Ask university',
    };
  }

  const fourYearTotal = fee * 4;
  const monthlyEstimate = Math.round(fee / 12);

  let scholarshipPotential = '';
  if (fee < 200000) {
    scholarshipPotential = 'High (likely eligible for merit scholarships)';
  } else if (fee < 500000) {
    scholarshipPotential = 'Moderate (some merit scholarship options)';
  } else {
    scholarshipPotential = 'Check directly with university';
  }

  return {
    averageCost: formatCurrency(fee),
    totalInvestment: `~${formatCurrency(fourYearTotal)} (estimated 4-year)`,
    monthlyEstimate: `~${formatCurrency(monthlyEstimate)}/month`,
    scholarshipPotential,
  };
}

/**
 * Settings to toggle between exact and range view
 */
export interface FeeDisplaySettings {
  showRanges: boolean; // true = show ranges, false = show exact
  rangePercent: number; // Default 5%
  exactThreshold: number; // Show exact below this value
}

/**
 * Get user's fee display preference
 */
export async function getFeeDisplaySettings(): Promise<FeeDisplaySettings> {
  // This would come from user settings/admin settings
  return {
    showRanges: true, // Default to ranges
    rangePercent: 5,
    exactThreshold: 50000,
  };
}
