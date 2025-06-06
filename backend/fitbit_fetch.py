"""
Run fitbit_raw.py i retorna el dataframe com una llista JSON.

"""

import importlib.util
import pandas as pd
from pathlib import Path
import datetime as dt

import db

RAW_PATH = Path(__file__).with_name("fitbit_raw.py")

def fetch_fitbit_data() -> list[dict]:
    """Retorna les dades Fitbit evitant duplicar peticions"""
    today = dt.date.today().strftime("%Y-%m-%d")

    # Si ja tenim dades d'avui, retornem l'últim registre
    if db.count_records() > 0:
        record = db.get_record_for_date(today)
        if record:
            return [record]

    # En cas contrari executem fitbit_raw.py
    spec = importlib.util.spec_from_file_location("fitbit_raw", RAW_PATH)
    fitbit_raw = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(fitbit_raw)  # executa el script

    if not hasattr(fitbit_raw, "df"):
        raise RuntimeError("fitbit_raw.py no hi ha definit un datafreame anomenat 'df'.")

    records = fitbit_raw.df.where(~fitbit_raw.df.isna(), None).to_dict(orient="records")
    db.insert_records(records)
    return records

