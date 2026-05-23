import sqlite3
import os
import sys
import pandas as pd

# Add root to path for config import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import DB_PATH, CLEAN_CSV_PATH

SCHEMA = """
CREATE TABLE IF NOT EXISTS pdf_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT UNIQUE NOT NULL,
    source_label TEXT,
    course_name TEXT,
    academic_year TEXT,
    cap_round INTEGER,
    candidate_scope TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS institutes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    institute_code TEXT UNIQUE NOT NULL,
    institute_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cutoff_rows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER REFERENCES pdf_sources(id),
    institute_id INTEGER REFERENCES institutes(id),
    academic_year TEXT,
    cap_round INTEGER,
    candidate_type TEXT,
    category TEXT,
    seat_type TEXT,
    university_type TEXT,
    cutoff_value REAL,
    cutoff_unit TEXT,
    raw_row_text TEXT,
    page_number INTEGER,
    row_hash TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
"""

def init_db():
    """Initializes the database with the schema."""
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.executescript(SCHEMA)
        conn.commit()
        print(f"Database initialized at {DB_PATH}")
    finally:
        conn.close()

def import_data():
    if not os.path.exists(CLEAN_CSV_PATH):
        print(f"Clean CSV not found at {CLEAN_CSV_PATH}")
        return

    df = pd.read_csv(CLEAN_CSV_PATH)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # 1. Import PDF Sources
        pdf_files = df['source_pdf'].unique() if 'source_pdf' in df.columns else []
        # If 'source_pdf' not in df, we might need it from extraction. 
        # Let's assume it's in the CSV for now.
        
        # Actually, let's just use the data in df
        for _, row in df.iterrows():
            # Add institute if not exists
            cursor.execute("INSERT OR IGNORE INTO institutes (institute_code, institute_name) VALUES (?, ?)",
                         (str(row['institute_code']), row['institute_name']))
            
            # Get institute id
            cursor.execute("SELECT id FROM institutes WHERE institute_code = ?", (str(row['institute_code']),))
            inst_id = cursor.fetchone()[0]
            
            # Add PDF source if not exists
            file_name = row.get('source_pdf', 'Unknown')
            cursor.execute("INSERT OR IGNORE INTO pdf_sources (file_name, cap_round, academic_year) VALUES (?, ?, ?)",
                         (file_name, row['cap_round'], row['academic_year']))
            
            # Get source id
            cursor.execute("SELECT id FROM pdf_sources WHERE file_name = ?", (file_name,))
            source_id = cursor.fetchone()[0]
            
            # Insert cutoff row
            cursor.execute("""
                INSERT OR IGNORE INTO cutoff_rows 
                (source_id, institute_id, academic_year, cap_round, candidate_type, category, seat_type, university_type, cutoff_value, cutoff_unit, raw_row_text, page_number, row_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                source_id, inst_id, row['academic_year'], row['cap_round'], 
                row['candidate_type'], row['normalized_category'], row['seat_type'],
                row['university_type'], row['cutoff_value'], row['cutoff_unit'],
                row['raw_row_text'], row['page_number'], row['row_hash']
            ))
        
        conn.commit()
        print("Import completed successfully.")
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()
    import_data()
