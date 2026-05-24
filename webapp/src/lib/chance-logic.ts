import { EnrichedCutoffRow, SearchResult, ChanceBucket } from './types';

/**
 * Initial classification based on strict threshold logic.
 */
export function classifyChance(row: EnrichedCutoffRow, userPercentile: number): SearchResult {
  const difference = userPercentile - row.cutoff_value;
  
  // Logic: User Percentile - Cutoff
  // If difference is negative, cutoff is HIGHER than user (Dream)
  // If difference is near 0, cutoff is CLOSE to user (Target)
  // If difference is positive, user is HIGHER than cutoff (Safe/Secure)

  let chance_label: ChanceBucket = 'Target';

  if (difference < -0.5) {
    chance_label = 'Dream';
  } else if (difference >= -0.5 && difference < 2.0) {
    chance_label = 'Target';
  } else if (difference >= 2.0 && difference < 4.0) {
    chance_label = 'Safe';
  } else {
    chance_label = 'Secure';
  }

  return {
    ...row,
    chance_label,
    difference,
  };
}

/**
 * Groups results based on the strict labels and enforces maximum counts.
 */
export function groupAndSortResults(results: SearchResult[]) {
  const buckets: Record<ChanceBucket, SearchResult[]> = {
    Dream: [],
    Target: [],
    Safe: [],
    Secure: [],
  };

  if (results.length === 0) return buckets;

  // 1. Group into strict buckets
  results.forEach(res => {
    buckets[res.chance_label].push(res);
  });

  // 2. Sort each bucket by proximity (most relevant first)
  // and enforce requested counts
  const limits = {
    Dream: 3,
    Target: 6,
    Safe: 5,
    Secure: 3,
  };

  Object.keys(buckets).forEach((key) => {
    const bucketKey = key as ChanceBucket;
    
    // Sort by absolute difference to show closest matches first
    buckets[bucketKey].sort((a, b) => Math.abs(a.difference) - Math.abs(b.difference));
    
    // Enforce the count limit
    if (buckets[bucketKey].length > limits[bucketKey]) {
      buckets[bucketKey] = buckets[bucketKey].slice(0, limits[bucketKey]);
    }
  });

  return buckets;
}
