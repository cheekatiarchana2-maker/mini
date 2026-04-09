import sys
import os

# Add backend to path so we can import modules
sys.path.append(os.path.abspath("backend"))

try:
    from database import engine, SessionLocal
    import models
    import pandas as pd

    print("--- Verifying Models and Tables ---")
    models.Base.metadata.create_all(bind=engine)
    
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Tables in DB: {tables}")

    db = SessionLocal()
    
    # Check Users
    user_count = db.query(models.User).count()
    print(f"Users: {user_count}")

    # Check Settings
    settings_count = db.query(models.UserSettings).count()
    print(f"User Settings records: {settings_count}")

    # Check Consumption Data
    consumption_count = db.query(models.ConsumptionData).count()
    print(f"Consumption Data records: {consumption_count}")
    
    if consumption_count == 0:
        print("Consumption data is 0. Attempting migration logic...")
        # (This script doesn't run the full main.py app logic, but we can call it if needed)
        # However, metadata.create_all should have happened.
    
    db.close()
    print("--- Verification Complete ---")

except ImportError as e:
    print(f"Library missing: {e}. Please ensure dependencies are installed.")
except Exception as e:
    print(f"An error occurred: {e}")
