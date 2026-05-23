import os

# Base Directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
PDF_DIR = os.path.join(DATA_DIR, "pdfs")
OUTPUT_DIR = os.path.join(DATA_DIR, "output")
DB_DIR = os.path.join(BASE_DIR, "database")

# Database Path
DB_PATH = os.path.join(DB_DIR, "mca_cutoffs.db")

# Output Paths
CLEAN_CSV_PATH = os.path.join(OUTPUT_DIR, "cutoff_rows_clean.csv")
REVIEW_CSV_PATH = os.path.join(OUTPUT_DIR, "manual_review_rows.csv")

# Ensure directories exist
for d in [DATA_DIR, PDF_DIR, OUTPUT_DIR, DB_DIR]:
    if not os.path.exists(d):
        os.makedirs(d)

# Normalization Mappings
CATEGORY_MAPPING = {
    'OPEN': 'OPEN',
    'OBC': 'OBC',
    'SC': 'SC',
    'ST': 'ST',
    'VJ/DT': 'VJNT',
    'NT-1': 'NT-1',
    'NT-2': 'NT-2',
    'NT-3': 'NT-3',
    'EWS': 'EWS',
    'TFWS': 'TFWS',
}

UNIVERSITY_MAPPING = {
    'Home University': 'HU',
    'Other Than Home University': 'OHU',
    'State Level': 'SL'
}
