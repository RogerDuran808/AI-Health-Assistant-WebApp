"""
Run fitbit_raw.py i retorna el dataframe com una llista JSON.

"""

import importlib.util, json, pandas as pd
from pathlib import Path

RAW_PATH = Path(__file__).with_name("fitbit_raw.py")

def fetch_fitbit_data() -> list[dict]:
    spec = importlib.util.spec_from_file_location("fitbit_raw", RAW_PATH)
    fitbit_raw = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(fitbit_raw)  # executa el script

    if not hasattr(fitbit_raw, "df"):
        raise RuntimeError("fitbit_raw.py no hi ha definit un datafreame anomenat 'df'.")
    
    # Convertim els NaNs en None pel json
    return (
        fitbit_raw.df.where(~fitbit_raw.df.isna(), None).to_dict(orient="records")
    )