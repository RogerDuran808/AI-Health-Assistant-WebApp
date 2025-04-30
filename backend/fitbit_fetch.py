"""Run fitbit_raw.py (unmodified) and return the dataframe as JSON‑serialisable list."""
import importlib.util, json, pandas as pd
from pathlib import Path

RAW_PATH = Path(__file__).with_name("fitbit_raw.py")

def fetch_fitbit_data() -> list[dict]:
    spec = importlib.util.spec_from_file_location("fitbit_raw", RAW_PATH)
    fitbit_raw = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(fitbit_raw)  # executes the script; df appears in namespace
    if not hasattr(fitbit_raw, "df"):
        raise RuntimeError("fitbit_raw.py did not define a dataframe named 'df'.")
    # We convert NaNs → None for clean JSON
    return (
        fitbit_raw.df.where(~fitbit_raw.df.isna(), None)
        .to_dict(orient="records")
    )