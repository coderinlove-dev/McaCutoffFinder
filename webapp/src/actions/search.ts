'use server';

import { db } from '@/lib/db';
import { EnrichedCutoffRow, SearchResult } from '@/lib/types';
import { classifyChance } from '@/lib/chance-logic';

export async function searchCutoffs(formData: FormData) {
  const percentile = parseFloat(formData.get('percentile') as string);
  const category = formData.get('category') as string;
  const universityType = formData.get('universityType') as string;
  const candidateType = formData.get('candidateType') as string;
  const isEws = formData.get('isEws') === 'true';

  if (isNaN(percentile)) {
    return { error: 'Invalid percentile' };
  }

  // EWS Logic: If EWS is selected, force category to EWS
  const searchCategory = isEws ? 'EWS' : category;

  // We query for a wide range around the percentile to fill buckets
  // Dream: cutoff > percentile (up to +5)
  // Secure: cutoff < percentile (up to -10)
  const query = `
    SELECT 
      cr.*, 
      i.institute_name, 
      i.institute_code,
      ps.file_name as source_file
    FROM cutoff_rows cr
    JOIN institutes i ON cr.institute_id = i.id
    JOIN pdf_sources ps ON cr.source_id = ps.id
    WHERE cr.candidate_type = ?
      AND (cr.university_type = ? OR cr.university_type = 'SL')
      AND cr.category = ?
      AND cr.cutoff_value BETWEEN ? AND ?
    ORDER BY ABS(cr.cutoff_value - ?) ASC
    LIMIT 50
  `;

  // Ranges to fetch: from percentile - 10 to percentile + 5
  const minCutoff = Math.max(0, percentile - 15);
  const maxCutoff = Math.min(100, percentile + 5);

  const stmt = db.prepare(query);
  const rows = stmt.all(candidateType, universityType, searchCategory, minCutoff, maxCutoff, percentile) as EnrichedCutoffRow[];

  const results: SearchResult[] = rows.map(row => classifyChance(row, percentile));

  return { results };
}
