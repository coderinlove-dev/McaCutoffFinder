import { SearchResult } from '@/lib/types';
import { groupAndSortResults } from '@/lib/chance-logic';
import { ResultCard } from './ResultCard';
import { Target, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface ResultsListProps {
  results: SearchResult[];
}

export function ResultsList({ results }: ResultsListProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <p className="text-slate-500 font-medium">No colleges found matching your criteria.</p>
        <p className="text-slate-400 text-sm mt-1">Try adjusting your percentile or category.</p>
      </div>
    );
  }

  const buckets = groupAndSortResults(results);

  const bucketConfig = [
    { key: 'Dream', icon: Sparkles, label: 'Dream Colleges', color: 'text-purple-600', sub: 'Cutoff is slightly higher than your percentile.' },
    { key: 'Target', icon: Target, label: 'Target Colleges', color: 'text-blue-600', sub: 'Excellent match! Cutoff is very close to your percentile.' },
    { key: 'Safe', icon: ShieldCheck, label: 'Safe Colleges', color: 'text-green-600', sub: 'Good chance of admission.' },
    { key: 'Secure', icon: Zap, label: 'Secure Colleges', color: 'text-emerald-600', sub: 'Highly likely to get admission.' },
  ] as const;

  return (
    <div className="space-y-12 pb-20">
      {bucketConfig.map(({ key, icon: Icon, label, color, sub }) => {
        const bucketResults = buckets[key as keyof typeof buckets];
        if (bucketResults.length === 0) return null;

        return (
          <section key={key} className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end gap-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Icon className={color} size={24} />
                <h2 className={`text-2xl font-black ${color}`}>{label}</h2>
              </div>
              <p className="text-slate-400 text-sm font-medium ml-1 mb-0.5">{sub}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bucketResults.map((result) => (
                <ResultCard key={result.row_hash} result={result} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
