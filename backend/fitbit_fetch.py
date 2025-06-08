"""
Run fitbit_raw.py and return the DataFrame as a JSON list.
If data for yesterday is already in the SQLite database, it's returned from there
instead of calling fitbit_raw.py.
"""

import importlib.util
import json
import pandas as pd
from pathlib import Path
import sqlite3
import datetime as dt
import sys # Potentially needed for module manipulation if issues arise

# --- Configuration ---
RAW_PATH = Path(__file__).resolve().parent / "fitbit_raw.py"
DB_PATH = Path(__file__).resolve().parent / "fitbit_data.db"
TABLE_NAME = "fitbit_daily_data"

# Define column names and their SQLite types based on fitbit_raw.py output DataFrame (df)
# This ensures consistency for table creation and data retrieval.
COLUMN_DEFINITIONS = {
    "date": "TEXT PRIMARY KEY",
    "name": "TEXT", "age": "INTEGER", "gender": "TEXT", "bmi": "REAL", "weight": "REAL", "height": "REAL",
    "calories": "INTEGER", "steps": "INTEGER",
    "lightly_active_minutes": "INTEGER", "moderately_active_minutes": "INTEGER",
    "very_active_minutes": "INTEGER", "sedentary_minutes": "INTEGER", "resting_hr": "INTEGER",
    "minutes_below_default_zone_1": "INTEGER", "minutes_in_default_zone_1": "INTEGER",
    "minutes_in_default_zone_2": "INTEGER", "minutes_in_default_zone_3": "INTEGER",
    "max_hr": "INTEGER", "min_hr": "INTEGER",
    "minutesToFallAsleep": "INTEGER", "minutesAsleep": "INTEGER", "minutesAwake": "INTEGER",
    "minutesAfterWakeup": "INTEGER", "sleep_efficiency": "INTEGER",
    "sleep_deep_ratio": "REAL", "sleep_light_ratio": "REAL", "sleep_rem_ratio": "REAL", "sleep_wake_ratio": "REAL",
    "daily_temperature_variation": "REAL", "rmssd": "REAL", "spo2": "REAL", "full_sleep_breathing_rate": "REAL",
    # Columns added after initial test run based on fitbit_raw.py output
    "wake_after_sleep_pct": "REAL",
    "cat__age_<30": "INTEGER",
    "cat__age_>=30": "INTEGER",
    "cat__gender_FEMALE": "INTEGER",
    "cat__gender_MALE": "INTEGER",
    "tired_pred": "REAL",
    "tired_prob": "REAL"
}
ORDERED_COLUMN_NAMES = list(COLUMN_DEFINITIONS.keys())

# --- Database Helper Functions ---
def _init_db():
    """Initializes the database and creates the data table if it doesn't exist."""
    print(f"[_init_db] Attempting to connect to DB at: {DB_PATH}")
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cols_sql = ", ".join([f'\"{col_name}\" {col_type}' for col_name, col_type in COLUMN_DEFINITIONS.items()])
        create_table_sql = f"CREATE TABLE IF NOT EXISTS {TABLE_NAME} ({cols_sql})"
        print(f"[_init_db] Executing SQL: {create_table_sql}")
        cursor.execute(create_table_sql)
        conn.commit()
        print(f"[_init_db] Table {TABLE_NAME} ensured to exist.")
    except sqlite3.Error as e:
        print(f"[_init_db] Database initialization error: {e}")
        raise
    finally:
        if 'conn' in locals() and conn:
            print(f"[_init_db] Closing DB connection.")
            conn.close()

def _get_data_from_db(date_str: str) -> list[dict] | None:
    """Fetches data for a specific date from the database. Returns a list of dicts or None."""
    print(f"[_get_data_from_db] Attempting to fetch data for date: {date_str}")
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        select_cols_sql = ", ".join([f'\"{col_name}\"' for col_name in ORDERED_COLUMN_NAMES])
        query = f"SELECT {select_cols_sql} FROM {TABLE_NAME} WHERE date = ?"
        print(f"[_get_data_from_db] Executing SQL: {query} with params ({date_str},)")
        
        cursor.execute(query, (date_str,))
        row = cursor.fetchone()
        
        if row:
            print(f"[_get_data_from_db] Data found for {date_str}.")
            return [dict(row)]
        else:
            print(f"[_get_data_from_db] No data found for {date_str}.")
            return None
    except sqlite3.Error as e:
        print(f"[_get_data_from_db] Error fetching data for date {date_str}: {e}")
        return None
    finally:
        if 'conn' in locals() and conn:
            print(f"[_get_data_from_db] Closing DB connection for date {date_str}.")
            conn.close()

def _insert_data_into_db(df: pd.DataFrame):
    """Inserts data from the DataFrame into the database."""
    if df.empty:
        print("[_insert_data_into_db] DataFrame is empty, nothing to insert.")
        return

    print(f"[_insert_data_into_db] Attempting to insert {len(df)} row(s). First row date: {df.iloc[0]['date'] if 'date' in df.columns and not df.empty else 'N/A'}")
    try:
        conn = sqlite3.connect(DB_PATH)
        df_for_sql = df.copy()
        df_for_sql = df_for_sql.fillna(value=pd.NA).where(~df_for_sql.isna(), None)
        
        print(f"[_insert_data_into_db] Before df.to_sql(TABLE_NAME='{TABLE_NAME}', if_exists='append')")
        df_for_sql.to_sql(TABLE_NAME, conn, if_exists="append", index=False)
        print(f"[_insert_data_into_db] After df.to_sql(), before commit.")
        conn.commit()
        print(f"[_insert_data_into_db] Data committed successfully for date: {df.iloc[0]['date'] if 'date' in df.columns and not df.empty else 'N/A'}.")
    except sqlite3.IntegrityError as e:
        print(f"[_insert_data_into_db] IntegrityError inserting data. Date {df.iloc[0]['date'] if 'date' in df.columns and not df.empty else 'Unknown'} likely already exists. Error: {e}")
    except sqlite3.Error as e:
        print(f"[_insert_data_into_db] SQLite Error inserting data: {e}")
    except Exception as e:
        print(f"[_insert_data_into_db] Unexpected error inserting data: {e}")
    finally:
        if 'conn' in locals() and conn:
            print(f"[_insert_data_into_db] Closing DB connection.")
            conn.close()

# --- Main Fetch Function (Simplified for Debugging) ---
def fetch_fitbit_data() -> list[dict]:
    """DEBUG: Executes fitbit_raw.py and prints info about its DataFrame."""
    print("[DEBUG_FETCH] Attempting to execute fitbit_raw.py...")
    try:
        spec = importlib.util.spec_from_file_location("fitbit_raw", str(RAW_PATH))
        if spec is None or spec.loader is None:
            raise ImportError(f"[DEBUG_FETCH] Could not create module spec from {RAW_PATH}")
        
        fitbit_raw_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(fitbit_raw_module)
        print("[DEBUG_FETCH] fitbit_raw.py executed.")

        if not hasattr(fitbit_raw_module, "df") or not isinstance(fitbit_raw_module.df, pd.DataFrame):
            print("[DEBUG_FETCH] fitbit_raw.py did not define a valid pandas DataFrame named 'df'.")
            return []
        
        df_from_api = fitbit_raw_module.df
        print(f"[DEBUG_FETCH] DataFrame 'df' found in fitbit_raw_module.")
        print(f"[DEBUG_FETCH] DataFrame shape: {df_from_api.shape}")
        print(f"[DEBUG_FETCH] DataFrame columns: {df_from_api.columns.tolist()}")
        
        if df_from_api.empty:
            print("[DEBUG_FETCH] DataFrame is empty.")
        else:
            print("[DEBUG_FETCH] DataFrame head(1):")
            # Using to_string() for potentially better console output than raw print
            print(df_from_api.head(1).to_string())
        
        # Return a simple list of dicts if not empty, otherwise empty list
        if not df_from_api.empty:
            return df_from_api.head(1).to_dict(orient="records") 
        else:
            return []

    except ImportError as e:
        print(f"[DEBUG_FETCH] Failed to import or execute fitbit_raw.py: {e}")
        raise
    except RuntimeError as e:
        print(f"[DEBUG_FETCH] Error during fitbit_raw.py execution or data processing: {e}")
        raise
    except Exception as e:
        print(f"[DEBUG_FETCH] An unexpected error occurred: {e}")
        raise

# --- Test Execution (Simplified for Debugging) ---
if __name__ == "__main__":
    print("[DEBUG_MAIN] Starting simplified test execution...")
    try:
        result_data = fetch_fitbit_data()
        if result_data:
            print(f"[DEBUG_MAIN] fetch_fitbit_data returned: {json.dumps(result_data, indent=2)}")
        else:
            print("[DEBUG_MAIN] fetch_fitbit_data returned no data or an empty list.")
    except Exception as e:
        print(f"[DEBUG_MAIN] An error occurred during test execution: {e}")
    finally:
        print("[DEBUG_MAIN] Simplified test execution finished.")