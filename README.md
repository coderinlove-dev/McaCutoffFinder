# MCA CAP Cutoff Finder - Phase 1

This project implements a Python-based data extraction pipeline for official Maharashtra MCA CAP cutoff PDFs.

## Folder Structure
- `/data/pdfs/`: Input official PDF files.
- `/data/output/`: Cleaned CSV exports and intermediate results.
- `/database/`: SQLite database file (`mca_cutoffs.db`).
- `/scripts/`: Python scripts for extraction, normalization, import, and search.
- `config.py`: Global configuration and path settings.
- `requirements.txt`: Python dependencies.

## Setup
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage
To run the full pipeline:
1. Place official PDFs in `data/pdfs/`.
2. Run the extraction script:
   ```bash
   python scripts/extract_pdf.py
   ```
3. Run the normalization script:
   ```bash
   python scripts/normalize_data.py
   ```
4. Initialize the database and import data:
   ```bash
   python scripts/import_to_sqlite.py
   ```
5. (Optional) Export the database to CSV:
   ```bash
   python scripts/export_csv.py
   ```

## Validation & Search
- To see database statistics:
  ```bash
  python scripts/validate.py
  ```
- To search locally for cutoffs:
  ```bash
  python scripts/search.py <percentile> <category>
  ```
  Example: `python scripts/search.py 85.0 OBC`

## Phase 2: Web Application
A modern Next.js 15 web app for students to search cutoffs.

### Setup
1. Navigate to the webapp directory:
   ```bash
   cd webapp
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Features
- Mobile-first responsive design.
- Server Actions for fast database queries.
- EWS filter support.
- Chance-based college bucketing (Dream, Target, Safe, Secure).
- SQLite backend with migration path to Supabase.
