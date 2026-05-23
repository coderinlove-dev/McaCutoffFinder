import sqlite3
import sys
import os

# Add root to path for config import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import DB_PATH

def print_stats():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("\n--- Summary Statistics ---")
    
    # Counts by Round
    print("\nCounts by CAP Round:")
    cursor.execute("SELECT cap_round, COUNT(*) FROM cutoff_rows GROUP BY cap_round")
    for row in cursor.fetchall():
        print(f"Round {row[0]}: {row[1]} rows")
        
    # Counts by Category
    print("\nCounts by Category (Top 10):")
    cursor.execute("SELECT category, COUNT(*) FROM cutoff_rows GROUP BY category ORDER BY COUNT(*) DESC LIMIT 10")
    for row in cursor.fetchall():
        print(f"{row[0]}: {row[1]} rows")
        
    # Counts by Candidate Type
    print("\nCounts by Candidate Type:")
    cursor.execute("SELECT candidate_type, COUNT(*) FROM cutoff_rows GROUP BY candidate_type")
    for row in cursor.fetchall():
        print(f"{row[0]}: {row[1]} rows")

    # Sample SQL queries for checking duplicates and bad rows
    print("\n--- Validation Queries ---")
    print("Check for duplicate hashes:")
    cursor.execute("SELECT row_hash, COUNT(*) FROM cutoff_rows GROUP BY row_hash HAVING COUNT(*) > 1")
    dupes = cursor.fetchall()
    print(f"Duplicate hashes found: {len(dupes)}")
    
    conn.close()

if __name__ == "__main__":
    print_stats()
