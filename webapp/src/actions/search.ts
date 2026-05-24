'use server';

import { prisma } from '@/lib/prisma';
import { EnrichedCutoffRow, SearchResult } from '@/lib/types';
import { classifyChance } from '@/lib/chance-logic';

export async function searchCutoffs(formData: FormData) {
  const percentile = parseFloat(formData.get('percentile') as string);
  const category = formData.get('category') as string;
  const universityType = formData.get('universityType') as string;
  const candidateType = formData.get('candidateType') as string;
  const isEws = formData.get('isEws') === 'true';

  console.log(`[Search] Params: percentile=${percentile}, category=${category}, uni=${universityType}, candidate=${candidateType}, isEws=${isEws}`);

  if (isNaN(percentile)) {
    return { error: 'Invalid percentile' };
  }

  // EWS Logic: If EWS is selected, force category to EWS
  const searchCategory = isEws ? 'EWS' : category;

  // Ranges to fetch: from percentile - 10 to percentile + 5
  const minCutoff = Math.max(0, percentile - 15);
  const maxCutoff = Math.min(100, percentile + 5);

  const searchCand = candidateType === 'All India' ? 'Maharashtra' : candidateType;
  console.log(`[Search] Querying: cand=${searchCand}, cat=${searchCategory}, uni=${universityType}, range=${minCutoff.toFixed(2)}-${maxCutoff.toFixed(2)}`);

  try {
    const totalRows = await prisma.cutoffRow.count();
    console.log(`[Search] Total rows in DB: ${totalRows}`);

    let rows = await prisma.cutoffRow.findMany({
      where: {
        candidateType: searchCand,
        category: searchCategory,
        OR: [{ universityType }, { universityType: 'SL' }],
        cutoffValue: { gte: minCutoff, lte: maxCutoff },
      },
      include: { institute: true, source: true },
      orderBy: { cutoffValue: 'desc' },
      take: 100,
    });

    console.log(`[Search] Primary search found ${rows.length} rows.`);

    // Fallback 1: Broaden University Type if zero results (e.g. if HU/OHU mislabeled)
    if (rows.length === 0) {
      console.log(`[Search] Fallback 1: Searching all university types for ${searchCategory}`);
      rows = await prisma.cutoffRow.findMany({
        where: {
          candidateType: searchCand,
          category: searchCategory,
          cutoffValue: { gte: minCutoff, lte: maxCutoff },
        },
        include: { institute: true, source: true },
        orderBy: { cutoffValue: 'desc' },
        take: 100,
      });
    }

    // Fallback 2: Broaden Candidate Type if still zero
    if (rows.length === 0) {
      console.log(`[Search] Fallback 2: Searching all candidate types for ${searchCategory}`);
      rows = await prisma.cutoffRow.findMany({
        where: {
          category: searchCategory,
          cutoffValue: { gte: minCutoff, lte: maxCutoff },
        },
        include: { institute: true, source: true },
        orderBy: { cutoffValue: 'desc' },
        take: 100,
      });
    }

    console.log(`[Search] Final result count: ${rows.length}`);


    // Map Prisma result to existing EnrichedCutoffRow type
    const enrichedRows: EnrichedCutoffRow[] = rows.map(row => ({
      id: row.id,
      source_id: row.sourceId,
      institute_id: row.instituteId,
      academic_year: row.academicYear || '',
      cap_round: row.capRound || 0,
      candidate_type: row.candidateType || '',
      category: row.category || '',
      seat_type: row.seatType || '',
      university_type: row.universityType || '',
      cutoff_value: row.cutoffValue || 0,
      cutoff_unit: row.cutoffUnit || '',
      raw_row_text: row.rawRowText || '',
      page_number: row.pageNumber || 0,
      row_hash: row.rowHash || '',
      created_at: row.createdAt.toISOString(),
      institute_name: row.institute.instituteName,
      institute_code: row.institute.instituteCode,
      source_file: row.source.fileName,
    }));

    // Sort by proximity to percentile (Prisma doesn't support ABS diff sorting natively in findMany)
    enrichedRows.sort((a, b) => 
      Math.abs(a.cutoff_value - percentile) - Math.abs(b.cutoff_value - percentile)
    );

    const results: SearchResult[] = enrichedRows.map((row) => classifyChance(row, percentile));

    return { results };
  } catch (error: any) {
    console.error('[Search] Database Error:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    return { error: `Search failed: ${error.message || 'Unknown database error'}` };
  }
}
