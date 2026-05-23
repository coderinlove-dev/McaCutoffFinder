import { SearchResult } from '@/lib/types';
import { School, Award, FileText } from 'lucide-react';

interface ResultCardProps {
  result: SearchResult;
}

export function ResultCard({ result }: ResultCardProps) {
  const chanceStyles = {
    Dream: 'bg-purple-50 text-purple-700 border-purple-200',
    Target: 'bg-blue-50 text-blue-700 border-blue-200',
    Safe: 'bg-green-50 text-green-700 border-green-200',
    Secure: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${chanceStyles[result.chance_label]}`}>
            {result.chance_label}
          </span>
          <span className="text-sm font-medium text-slate-500">
            Round {result.cap_round}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 mb-1 leading-snug h-14 overflow-hidden">
          {result.institute_name}
        </h3>
        <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
          <School size={14} /> Code: {result.institute_code}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50 p-2 rounded-lg">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Category</p>
            <p className="text-sm font-semibold text-slate-700">{result.category}</p>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Cutoff</p>
            <p className="text-sm font-semibold text-slate-700">{result.cutoff_value.toFixed(2)}%</p>
          </div>
        </div>

        <div className="space-y-1.5 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2">
            <Award size={12} className="text-slate-400" />
            <span className="truncate">{result.candidate_type} | {result.university_type === 'HU' ? 'Home Univ' : result.university_type === 'OHU' ? 'Other Than HU' : 'State Level'}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText size={12} className="text-slate-400" />
            <span className="truncate" title={result.source_file}>{result.source_file}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
