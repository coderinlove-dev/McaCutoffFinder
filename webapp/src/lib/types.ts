export interface PDFSource {
  id: number;
  file_name: string;
  source_label?: string;
  course_name?: string;
  academic_year: string;
  cap_round: number;
  candidate_scope?: string;
  uploaded_at: string;
}

export interface Institute {
  id: number;
  institute_code: string;
  institute_name: string;
}

export interface CutoffRow {
  id: number;
  source_id: number;
  institute_id: number;
  academic_year: string;
  cap_round: number;
  candidate_type: string;
  category: string;
  seat_type: string;
  university_type: string;
  cutoff_value: number;
  cutoff_unit: string;
  raw_row_text: string;
  page_number: number;
  row_hash: string;
  created_at: string;
}

export interface EnrichedCutoffRow extends CutoffRow {
  institute_name: string;
  institute_code: string;
  source_file: string;
}

export type ChanceBucket = 'Dream' | 'Target' | 'Safe' | 'Secure';

export interface SearchResult extends EnrichedCutoffRow {
  chance_label: ChanceBucket;
  difference: number;
}
