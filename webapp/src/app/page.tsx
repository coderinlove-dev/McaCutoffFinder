'use client';

import { useState } from 'react';
import { SearchForm } from '@/components/SearchForm';
import { ResultsList } from '@/components/ResultsList';
import { SearchResult } from '@/lib/types';
import { GraduationCap, ShieldCheck, Loader2, Search } from 'lucide-react';

export default function Home() {
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
              <GraduationCap className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-800">
              MCA CAP <span className="text-blue-600">Cutoff Finder</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-500">
            <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-600">2025-26 Data</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Intro */}
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
            Find the perfect MCA college.
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
            Personalized college recommendations based on official Maharashtra CAP cutoff data. 
            No more guessing—just clear, data-driven targets.
          </p>
          <div className="mt-4 flex items-center gap-3 bg-green-50 px-4 py-3 rounded-xl border border-green-200 w-fit mx-auto md:mx-0 shadow-sm">
            <div className="bg-green-100 p-1.5 rounded-full">
              <ShieldCheck className="text-green-700" size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-green-800 leading-none mb-0.5">Verified Source: Official CAP cutoff PDFs</p>
              <p className="text-[11px] font-medium text-green-600/80">100% official Maharashtra CAP data</p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <SearchForm 
          onResults={(res) => setResults(res)} 
          onLoading={(loading) => setIsLoading(loading)} 
        />

        {/* Results Section */}
        <div className="mt-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="text-blue-600 animate-spin" size={48} />
              <p className="text-slate-500 font-bold animate-pulse">Analyzing cutoff data...</p>
            </div>
          ) : results ? (
            <ResultsList results={results} />
          ) : (
            <div className="bg-blue-50 border border-blue-100 p-8 rounded-2xl text-center">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Search className="text-blue-600" size={24} />
              </div>
              <h3 className="text-blue-900 font-black text-xl mb-2">Ready to search?</h3>
              <p className="text-blue-700/70 max-w-sm mx-auto">
                Enter your percentile and category above to see colleges where you have the best chance of admission.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-4">
          <p className="text-sm text-slate-400 font-medium">
            &copy; 2026 MCA CAP Cutoff Finder. Built for MCA Students.
          </p>
          <p className="text-[10px] text-slate-300 max-w-md mx-auto leading-relaxed">
            DISCLAIMER: This tool uses historical data from official PDFs for reference only. 
            Admission is subject to current year dynamics and official CET Cell seat allotment.
          </p>
        </div>
      </footer>
    </main>
  );
}
