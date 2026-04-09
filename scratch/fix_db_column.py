import sqlite3
import os

db_path = "backend/electrahome.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check user_settings columns
    cursor.execute("PRAGMA table_info(user_settings)")
    columns = [col[1] for col in cursor.fetchall()]
    print(f"Columns in user_settings: {columns}")
    
    if "monthly_budget" not in columns:
        print("Adding column monthly_budget...")
        try:
            cursor.execute("ALTER TABLE user_settings ADD COLUMN monthly_budget FLOAT DEFAULT 3500.0")
            conn.commit()
            print("Successfully added monthly_budget column.")
        except Exception as e:
            print(f"Failed to add column: {e}")
    else:
        print("monthly_budget column already exists.")
    
    conn.close()
else:
    print(f"DB not found at {db_path}")
