import { EnrichedCutoffRow, SearchResult, ChanceBucket } from './types';

/**
 * Initial classification. 
 * Note: Actual bucket distribution is enforced in groupAndSortResults.
 */
export function classifyChance(row: EnrichedCutoffRow, userPercentile: number): SearchResult {
  const difference = userPercentile - row.cutoff_value;
  
  // Basic classification based on requested strict ranges
  let chance_label: ChanceBucket = 'Target';
  if (difference >= -2.0 && difference <= -1.0) chance_label = 'Dream';
  else if (difference >= -0.5 && difference <= 0.5) chance_label = 'Target';
  else if (difference >= 2.0 && difference <= 3.0) chance_label = 'Safe';
  else if (difference > 3.0) chance_label = 'Secure';
  else if (difference < -2.0) chance_label = 'Dream'; // Outside strict range but still "harder"
  else if (difference > 0.5 && difference < 2.0) chance_label = 'Target'; // Transition zone

  return {
    ...row,
    chance_label,
    difference,
  };
}

/**
 * Strictly enforces bucket distribution and range expansion as per requirements.
 * Dream: 2-3, Target: 5-6, Safe: 4-5, Secure: 2-3
 */
export function groupAndSortResults(results: SearchResult[]) {
  const buckets: Record<ChanceBucket, SearchResult[]> = {
    Dream: [],
    Target: [],
    Safe: [],
    Secure: [],
  };

  // 1. Initial assignment based on STRICT range rules
  // Dream: cutoff +1 to +2 (diff -1 to -2)
  // Target: cutoff ±0.5 (diff -0.5 to 0.5)
  // Safe: cutoff -2 to -3 (diff 2 to 3)
  // Secure: cutoff -3 to -4+ (diff 3+)
  const remaining: SearchResult[] = [];
  results.forEach(res => {
    const d = res.difference;
    if (d >= -2.0 && d <= -1.0) buckets.Dream.push(res);
    else if (d >= -0.5 && d <= 0.5) buckets.Target.push(res);
    else if (d >= 2.0 && d <= 3.0) buckets.Safe.push(res);
    else if (d > 3.0) buckets.Secure.push(res);
    else remaining.push(res);
  });

  // 2. Enforce Counts and Priority Expansion
  const config = {
    Dream: { target: 3, center: -1.5 },
    Target: { target: 6, center: 0 },
    Safe: { target: 5, center: 2.5 },
    Secure: { target: 3, center: 4.5 },
  };

  const priority: ChanceBucket[] = ['Dream', 'Target', 'Safe', 'Secure'];

  // First, cap any buckets exceeding their target to keep them balanced
  priority.forEach(key => {
    if (buckets[key].length > config[key].target) {
      buckets[key].sort((a, b) => Math.abs(a.difference - config[key].center) - Math.abs(b.difference - config[key].center));
      const excess = buckets[key].splice(config[key].target);
      remaining.push(...excess);
    }
  });

  // Then, expand ranges for buckets that are under their minimum target
  priority.forEach(key => {
    const needed = config[key].target - buckets[key].length;
    if (needed > 0 && remaining.length > 0) {
      // Pick the best fits from the remaining pool
      remaining.sort((a, b) => Math.abs(a.difference - config[key].center) - Math.abs(b.difference - config[key].center));
      const picked = remaining.splice(0, needed);
      buckets[key].push(...picked);
    }
  });

  // 3. Final Re-Classification and Internal Sorting
  priority.forEach(key => {
    buckets[key].forEach(res => {
      res.chance_label = key;
    });
    // "Sorting must be done only inside each bucket after classification."
    // We sort by absolute difference to show most relevant colleges first within each bucket.
    buckets[key].sort((a, b) => Math.abs(a.difference) - Math.abs(b.difference));
  });

  return buckets;
}
