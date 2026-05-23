import sqlite3
import sys
import os

# Add root to path for config import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import DB_PATH

def search(percentile, category):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    query = """
    SELECT 
        i.institute_name, 
        cr.category, 
        cr.cutoff_value, 
        cr.cap_round
    FROM cutoff_rows cr
    JOIN institutes i ON cr.institute_id = i.id
    WHERE cr.cutoff_value <= ? AND cr.category = ?
    ORDER BY cr.cutoff_value DESC
    LIMIT 10
    """
    
    cursor.execute(query, (percentile, category))
    results = cursor.fetchall()
    
    if not results:
        print(f"No results found for {category} below {percentile} percentile.")
    else:
        print(f"\nTop 10 Colleges for {category} below {percentile} percentile:")
        print("-" * 80)
        for row in results:
            print(f"{row[0][:50]:<50} | {row[1]:<10} | {row[2]:<10} | Round {row[3]}")
            
    conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python scripts/search.py <percentile> <category>")
        print("Example: python scripts/search.py 85.0 OBC")
    else:
        try:
            perc = float(sys.argv[1])
            cat = sys.argv[2].upper()
            search(perc, cat)
        except ValueError:
            print("Error: Percentile must be a number.")
