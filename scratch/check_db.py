from sqlalchemy import create_engine, inspect
import os

db_path = "backend/electrahome.db"
if os.path.exists(db_path):
    engine = create_engine(f"sqlite:///{db_path}")
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Tables in {db_path}: {tables}")
    if "users" in tables:
        columns = [col['name'] for col in inspector.get_columns("users")]
        print(f"Columns in 'users' table: {columns}")
else:
    print(f"{db_path} does not exist.")
