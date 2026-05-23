import sqlite3

def fix_db():
    conn = sqlite3.connect('database/mca_cutoffs.db')
    c = conn.cursor()
    
    # Fix OHU
    c.execute("UPDATE cutoff_rows SET university_type = 'OHU' WHERE seat_type LIKE '%O' AND university_type = 'HU'")
    print(f"Fixed {c.rowcount} OHU rows.")
    
    # Fix HU (rows ending in H)
    c.execute("UPDATE cutoff_rows SET university_type = 'HU' WHERE seat_type LIKE '%H' AND university_type = 'HU'")
    print(f"Verified {c.rowcount} HU rows.")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    fix_db()
