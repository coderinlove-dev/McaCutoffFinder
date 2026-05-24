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
 * Strictly enforces logical consistency and bucket distribution.
 * Strategy: Sort all by cutoff DESC, then allocate top-down.
 */
export function groupAndSortResults(results: SearchResult[]) {
  const buckets: Record<ChanceBucket, SearchResult[]> = {
    Dream: [],
    Target: [],
    Safe: [],
    Secure: [],
  };

  if (results.length === 0) return buckets;

  // 1. GLOBAL SORT: Highest cutoffs first
  // This is the "Secret Sauce" to logical consistency.
  const sorted = [...results].sort((a, b) => b.cutoff_value - a.cutoff_value);

  // 2. SEQUENTIAL ALLOCATION
  // We fill buckets from the top of the sorted list to maintain logical order.
  const config = [
    { key: 'Dream' as const, count: 3, minDiff: -999, maxDiff: 0 },   // Harder/Equal
    { key: 'Target' as const, count: 6, minDiff: -0.5, maxDiff: 1.5 }, // Near match
    { key: 'Safe' as const, count: 5, minDiff: 1.5, maxDiff: 3.5 },    // Easier
    { key: 'Secure' as const, count: 3, minDiff: 3.5, maxDiff: 999 },  // Much easier
  ];

  let currentIdx = 0;

  // DREAM BUCKET (Special Case: Only if cutoff >= user score - 0.5)
  // We don't want to show 90% colleges as "Dream" for a 98% user.
  const dreamCandidates = sorted.slice(currentIdx, currentIdx + 3);
  const actualDream = dreamCandidates.filter(c => c.difference <= 0.5);
  
  if (actualDream.length > 0) {
    buckets.Dream = actualDream;
    currentIdx += actualDream.length;
  }

  // TARGET BUCKET (Next 6)
  const targetCount = 6;
  const targetEnd = Math.min(currentIdx + targetCount, sorted.length);
  buckets.Target = sorted.slice(currentIdx, targetEnd);
  currentIdx = targetEnd;

  // SAFE BUCKET (Next 5)
  const safeCount = 5;
  const safeEnd = Math.min(currentIdx + safeCount, sorted.length);
  buckets.Safe = sorted.slice(currentIdx, safeEnd);
  currentIdx = safeEnd;

  // SECURE BUCKET (Next 3)
  const secureCount = 3;
  const secureEnd = Math.min(currentIdx + secureCount, sorted.length);
  buckets.Secure = sorted.slice(currentIdx, secureEnd);

  // 3. FINAL LABEL SYNC
  // Ensure the label matches the bucket it ended up in
  Object.keys(buckets).forEach((key) => {
    const bucketKey = key as ChanceBucket;
    buckets[bucketKey].forEach(res => {
      res.chance_label = bucketKey;
    });
  });

  return buckets;
}
