import { EnrichedCutoffRow, SearchResult, ChanceBucket } from './types';

export function classifyChance(row: EnrichedCutoffRow, userPercentile: number): SearchResult {
  const difference = userPercentile - row.cutoff_value;

  let chance_label: ChanceBucket = 'Target';

  if (difference < -0.5) {
    // Cutoff is significantly higher than user percentile
    chance_label = 'Dream';
  } else if (difference >= -0.5 && difference <= 1.5) {
    // Cutoff is close or user is slightly higher
    chance_label = 'Target';
  } else if (difference > 1.5 && difference <= 3.5) {
    // User is safely above cutoff
    chance_label = 'Safe';
  } else {
    // User is significantly above cutoff
    chance_label = 'Secure';
  }

  return {
    ...row,
    chance_label,
    difference,
  };
}

export function groupAndSortResults(results: SearchResult[]) {
  const buckets: Record<ChanceBucket, SearchResult[]> = {
    Dream: [],
    Target: [],
    Safe: [],
    Secure: [],
  };

  results.forEach((res) => {
    buckets[res.chance_label].push(res);
  });

  // Sort each bucket by closeness to user percentile (absolute difference)
  Object.keys(buckets).forEach((key) => {
    const bucket = key as ChanceBucket;
    buckets[bucket].sort((a, b) => Math.abs(a.difference) - Math.abs(b.difference));
  });

  return buckets;
}
