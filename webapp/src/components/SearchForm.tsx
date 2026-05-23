'use client';

import { useState } from 'react';
import { searchCutoffs } from '@/actions/search';
import { SearchResult } from '@/lib/types';
import { Search, Loader2 } from 'lucide-react';

interface SearchFormProps {
  onResults: (results: SearchResult[]) => void;
  onLoading: (isLoading: boolean) => void;
}

export function SearchForm({ onResults, onLoading }: SearchFormProps) {
  const [percentile, setPercentile] = useState('');
  const [category, setCategory] = useState('OPEN');
  const [universityType, setUniversityType] = useState('HU');
  const [candidateType, setCandidateType] = useState('Maharashtra');
  const [isEws, setIsEws] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onLoading(true);

    const formData = new FormData();
    formData.append('percentile', percentile);
    formData.append('category', category);
    formData.append('universityType', universityType);
    formData.append('candidateType', candidateType);
    formData.append('isEws', isEws.toString());

    try {
      const { results, error } = await searchCutoffs(formData);
      if (error) {
        alert(error);
        onResults([]);
      } else if (results) {
        onResults(results);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while searching.');
    } finally {
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Percentile */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Percentile</label>
          <input
            type="number"
            step="0.0000001"
            min="0"
            max="100"
            required
            value={percentile}
            onChange={(e) => setPercentile(e.target.value)}
            placeholder="e.g. 85.5"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isEws}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="OPEN">OPEN</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="NTA">VJ/DT (NT-A)</option>
            <option value="NTB">NT-B</option>
            <option value="NTC">NT-C</option>
            <option value="NTD">NT-D</option>
            <option value="SEBC">SEBC</option>
            <option value="TFWS">TFWS</option>
          </select>
        </div>

        {/* University Type */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">University Type</label>
          <select
            value={universityType}
            onChange={(e) => setUniversityType(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
          >
            <option value="HU">Home University (HU)</option>
            <option value="OHU">Other Than Home University (OHU)</option>
          </select>
        </div>

        {/* Candidate Type */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Candidate Type</label>
          <select
            value={candidateType}
            onChange={(e) => setCandidateType(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
          >
            <option value="Maharashtra">Maharashtra Candidate</option>
            <option value="All India">All India Candidate (OMS)</option>
          </select>
        </div>

        {/* EWS Checkbox */}
        <div className="flex items-center space-x-3 pt-8">
          <input
            type="checkbox"
            id="ews"
            checked={isEws}
            onChange={(e) => setIsEws(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
          />
          <label htmlFor="ews" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
            Apply EWS Quota
          </label>
        </div>

        {/* Submit */}
        <div className="pt-6">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Search size={18} />
            Find Colleges
          </button>
        </div>
      </div>
    </form>
  );
}
