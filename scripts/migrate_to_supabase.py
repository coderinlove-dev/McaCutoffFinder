import sqlite3
import pandas as pd
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
SQLITE_DB = 'database/mca_cutoffs.db'
# SUPABASE_URL should be in the format: postgresql://postgres.xxxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres
SUPABASE_URL = os.getenv('DATABASE_URL')

def migrate():
    if not SUPABASE_URL:
        print("Error: DATABASE_URL not found in environment.")
        return

    print(f"Connecting to SQLite: {SQLITE_DB}")
    sqlite_conn = sqlite3.connect(SQLITE_DB)
    
    print(f"Connecting to Supabase PostgreSQL...")
    pg_engine = create_engine(SUPABASE_URL)

    tables = ['pdf_sources', 'institutes', 'cutoff_rows']

    for table in tables:
        print(f"Migrating table: {table}...")
        df = pd.read_sql_query(f"SELECT * FROM {table}", sqlite_conn)
        
        # In PostgreSQL, we might want to handle serial/identity columns
        # For a simple migration, we just overwrite
        df.to_sql(table, pg_engine, if_exists='replace', index=False)
        print(f"Successfully migrated {len(df)} rows to {table}")

    sqlite_conn.close()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
