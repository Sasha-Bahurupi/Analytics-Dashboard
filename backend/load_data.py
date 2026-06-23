import pandas as pd
import sqlite3
import os

# Identify correct data file name
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "analytics.db")

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

data_files = [f for f in os.listdir(DATA_DIR) if f.endswith('.xlsx')]
if not data_files:
    print("No Excel file found in data/ directory. Please place sales_data.xlsx there.")
    exit(1)

file_path = os.path.join(DATA_DIR, data_files[0])
print(f"Reading dataset from {file_path}...")

# Read the file
df = pd.read_excel(file_path)

# Clean and transform data
print("Processing data...")
df['Order_Datetime'] = pd.to_datetime(df['Order_Datetime'], format="%d-%m-%Y %H:%M:%S", errors='coerce')
df['Revenue'] = df['Price'] * df['Quantity']

# Connect to database
print("Connecting to database...")
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Write to SQLite table
print("Writing to SQLite database...")
df.to_sql('sales', conn, if_exists='replace', index=False)

# Add indexes for performance
print("Creating indexes...")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_date ON sales (Order_Datetime)")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_outlet ON sales (Outlet_Name)")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_group ON sales ([Group])")

conn.commit()
conn.close()

print("Data ingestion complete!")
