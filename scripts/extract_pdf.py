import pdfplumber
import os
import re
import sys
import pandas as pd
import hashlib

# Add root to path for config import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import PDF_DIR, OUTPUT_DIR

def get_row_hash(row_data):
    """Generates a unique hash for a cutoff row."""
    # Using core fields including course_code to generate hash
    hash_str = f"{row_data['institute_code']}_{row_data['course_code']}_{row_data['cap_round']}_{row_data['category']}_{row_data['seat_type']}_{row_data['cutoff_value']}"
    return hashlib.sha256(hash_str.encode()).hexdigest()

class CutoffExtractor:
    # ... existing __init__ and _detect_round ...
    def __init__(self, pdf_path):
        self.pdf_path = pdf_path
        self.filename = os.path.basename(pdf_path)
        self.data = []
        self.current_institute = None
        self.current_course = None
        self.current_round = self._detect_round()
        self.academic_year = "2025-26" # Hardcoded based on filenames
        
    def _detect_round(self):
        if "CAP1" in self.filename: return 1
        if "CAP2" in self.filename: return 2
        if "CAP3" in self.filename: return 3
        if "CAP4" in self.filename: return 4
        return 0

    def parse(self):
        print(f"Parsing {self.filename}...")
        with pdfplumber.open(self.pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if not text: continue
                self._parse_page(text, page.page_number)
        return self.data

    def _parse_page(self, text, page_num):
        lines = text.split('\n')
        
        current_section = None
        current_allotment_type = None
        current_candidate_type = "Maharashtra" # Default
        
        headers = []
        merit_numbers = []
        percentiles = []
        
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            # Detect Candidate Type / Section
            if "All India Seats" in line:
                current_candidate_type = "All India"
            elif "Maharashtra State Seats" in line:
                current_candidate_type = "Maharashtra"

            # Detect Institute
            inst_match = re.match(r'^(\d{4})\s*-\s*(.*)', line)
            if inst_match:
                self.current_institute = {
                    'code': inst_match.group(1),
                    'name': inst_match.group(2).strip()
                }
            
            # Detect Course
            course_match = re.match(r'^(\d{10})\s*-\s*(.*)', line)
            if course_match:
                self.current_course = {
                    'code': course_match.group(1),
                    'name': course_match.group(2).strip()
                }

            # Detect Section (Home University / Other Than Home University / State Level / Minority)
            if "Home University Seats" in line:
                current_section = "HU"
            elif "Other Than Home University Seats" in line:
                current_section = "OHU"
            elif "State Level Seats" in line:
                current_section = "SL"
            elif "Minority Seats" in line:
                current_section = "MI"

            # Detect Allotment Type
            if "Allotted to" in line:
                current_allotment_type = line

            # Detect Category Headers
            if re.match(r'^[A-Z0-9\s-]+$', line) and len(line) > 3 and not any(x in line for x in ["MAHARASHTRA", "MUMBAI", "POST GRADUATE", "MCA", "STATE COMMON", "CUT OFF LIST"]):
                potential_headers = line.split()
                if i + 1 < len(lines) and re.match(r'^\d+[\s\d]*$', lines[i+1].strip()):
                    headers = potential_headers
                    i += 1
                    merit_numbers = lines[i].split()
                    
                    header_ptr = 0
                    i += 1
                    while i < len(lines):
                        next_line = lines[i].strip()
                        if "Stage-" in next_line or "I-Non PWD" in next_line:
                            current_stage = next_line
                            i += 1
                            if i < len(lines) and "(" in lines[i]:
                                page_percentiles = re.findall(r'\(([\d\.]+)\)', lines[i])
                                for perc in page_percentiles:
                                    if header_ptr < len(headers) and header_ptr < len(merit_numbers):
                                        cat = headers[header_ptr]
                                        merit = merit_numbers[header_ptr]
                                        
                                        row = {
                                            'source_pdf': self.filename,
                                            'institute_code': self.current_institute['code'] if self.current_institute else "UNKNOWN",
                                            'institute_name': self.current_institute['name'] if self.current_institute else "UNKNOWN",
                                            'course_code': self.current_course['code'] if self.current_course else "UNKNOWN",
                                            'academic_year': self.academic_year,
                                            'cap_round': self.current_round,
                                            'candidate_type': current_candidate_type,
                                            'category': cat,
                                            'seat_type': cat,
                                            'university_type': current_section,
                                            'cutoff_value': float(perc),
                                            'cutoff_unit': 'percentile',
                                            'raw_row_text': f"{cat} | {merit} | {perc} | {current_stage}",
                                            'page_number': page_num,
                                            'allotment_type': current_allotment_type
                                        }
                                        row['row_hash'] = get_row_hash(row)
                                        self.data.append(row)
                                        header_ptr += 1
                                if header_ptr >= len(headers):
                                    break
                        elif re.match(r'^[A-Z0-9\s-]+$', next_line) and len(next_line) > 3:
                            # Might be another set of headers
                            i -= 1
                            break
                        elif "University" in next_line or "Seats" in next_line or "Status :" in next_line:
                            i -= 1
                            break
                        i += 1
            i += 1

    def save_to_csv(self, output_path):
        df = pd.DataFrame(self.data)
        df.to_csv(output_path, index=False)
        print(f"Saved {len(df)} rows to {output_path}")

if __name__ == "__main__":
    for pdf_file in os.listdir(PDF_DIR):
        if pdf_file.endswith(".pdf"):
            extractor = CutoffExtractor(os.path.join(PDF_DIR, pdf_file))
            extractor.parse()
            output_csv = os.path.join(OUTPUT_DIR, f"{pdf_file}.csv")
            extractor.save_to_csv(output_csv)
