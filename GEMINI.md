# MCA CAP Cutoff Finder - Project Context

## Project goal
Build a lightweight web app for Maharashtra MCA admission cutoff search.

The system must work in 2 phases:

1. Phase 1: Build a Python extraction pipeline that reads official MAH MCA CAP cutoff PDFs and stores extracted rows into a local SQLite database.
2. Phase 2: Build a simple one-page student web app that searches only the stored database and shows relevant college cutoff results.

## Core rule
Only use data derived from official uploaded CAP cutoff PDFs.
Do not scrape or use cutoff values from external websites.
Do not generate fake cutoff rows.
If data is missing or unclear, mark it for review instead of guessing.

## Public product scope
The final public website should be very simple:
- One search page only
- No public admin panel
- No public PDF upload
- No user authentication required
- No user-side data editing
- Results should come only from the local database / migrated SQL database

## Student search inputs
The search form should include:
- Category
- Percentile
- University type: Home University / Other Than Home University
- Candidate type: Maharashtra Candidate / All India Candidate

## Search output
Each result should show:
- College code
- College name
- CAP round
- Candidate type
- Category
- University type
- Last year cutoff
- Source label / PDF round
- Chance label: Safe / Likely / Borderline / Dream

## Tech stack
Phase 1:
- Python 3.11+
- pdfplumber and/or camelot/tabula-py
- pandas
- sqlite3
- CSV export

Phase 2:
- Next.js
- TypeScript
- Tailwind CSS
- SQLite for local development
- Design code so schema can later be migrated to Supabase/Postgres
- Keep hosting friendly for Vercel

## Database expectations
Tables should include:
- pdf_sources
- institutes
- cutoff_rows

Every cutoff row must preserve:
- Source PDF label
- CAP round
- Academic year
- Institute code
- Institute name
- Candidate type
- Category
- Seat type if present
- University type
- Cutoff value
- Raw row text
- Page number
- Duplicate prevention hash

## Coding style instructions
- Build in small phases
- First propose folder structure before writing all code
- Do not generate too many files at once
- After each phase, summarize what was created
- Prefer clean, maintainable code
- Add README steps for local setup
- Use practical filenames
- Avoid unnecessary dependencies
- When unsure, ask before making assumptions

## Build order
1. Folder structure
2. SQLite schema
3. PDF extraction scripts
4. Data cleaning and normalization
5. Import to SQLite
6. CSV export and validation
7. Web app schema access layer
8. Search API / query logic
9. Chance logic
10. Single-page UI
11. Migration notes for Supabase/Postgres

## Important constraints
- Separate CAP Round 1, 2, 3 data
- Separate Maharashtra and All India candidate data
- Keep traceability to original PDF
- Do not merge uncertain rows automatically
- Prefer SQLite first, then migration later
- Keep the frontend lightweight and mobile-friendly