import pandas as pd
import os
import sys

# Add root to path for config import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import OUTPUT_DIR, CLEAN_CSV_PATH, REVIEW_CSV_PATH, CATEGORY_MAPPING, UNIVERSITY_MAPPING

def normalize_data():
    all_data = []
    
    # Load all intermediate CSVs
    for file in os.listdir(OUTPUT_DIR):
        if file.endswith(".pdf.csv"):
            df = pd.read_csv(os.path.join(OUTPUT_DIR, file))
            all_data.append(df)
    
    if not all_data:
        print("No intermediate data found.")
        return
    
    df = pd.concat(all_data, ignore_index=True)
    
    # 1. Normalize Category
    def map_category(cat):
        # Remove gender prefix (G or L)
        normalized = cat
        if cat.startswith('G') or cat.startswith('L'):
            normalized = cat[1:]
        
        # Remove University suffix (H or O)
        if normalized.endswith('H') or normalized.endswith('O'):
            normalized = normalized[:-1]
            
        return CATEGORY_MAPPING.get(normalized, normalized)

    df['normalized_category'] = df['category'].apply(map_category)
    
    # 2. Normalize University Type
    df['university_type'] = df['university_type'].map(UNIVERSITY_MAPPING).fillna(df['university_type'])
    
    # 3. Clean Cutoff Value
    df['cutoff_value'] = pd.to_numeric(df['cutoff_value'], errors='coerce')
    
    # 4. Filter clear vs unclear rows
    clean_df = df.dropna(subset=['cutoff_value', 'institute_code'])
    review_df = df[df['cutoff_value'].isna() | df['institute_code'].isna()]
    
    # Save results
    clean_df.to_csv(CLEAN_CSV_PATH, index=False)
    review_df.to_csv(REVIEW_CSV_PATH, index=False)
    
    print(f"Normalization complete.")
    print(f"Clean rows: {len(clean_df)}")
    print(f"Review rows: {len(review_df)}")

if __name__ == "__main__":
    normalize_data()
