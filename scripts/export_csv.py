import sqlite3
import pandas as pd
import os
import sys

# Add root to path for config import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import DB_PATH, OUTPUT_DIR

def export_db_to_csv():
    conn = sqlite3.connect(DB_PATH)
    query = """
    SELECT 
        cr.*, 
        i.institute_code, 
        i.institute_name,
        ps.file_name as source_pdf
    FROM cutoff_rows cr
    JOIN institutes i ON cr.institute_id = i.id
    JOIN pdf_sources ps ON cr.source_id = ps.id
    """
    df = pd.read_sql_query(query, conn)
    output_path = os.path.join(OUTPUT_DIR, "final_database_export.csv")
    df.to_csv(output_path, index=False)
    conn.close()
    print(f"Database exported to {output_path}")

if __name__ == "__main__":
    export_db_to_csv()
