from fastapi import FastAPI, Response, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fitbit_fetch import fetch_fitbit_data
from ai import get_recommendation

app = FastAPI(title="Fitbit Dashboard API")

# Allow local dev and deployed UI to talk to API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"]
)

def get_fitbit_data() -> dict:
    """
    Converteix el resultat de fetch_fitbit_data a dict.
    Accepta dict, list[dict] o pandas.DataFrame.
    """
    try:
        raw = fetch_fitbit_data()

        # 1) ja és dict  -----------------------------------------
        if isinstance(raw, dict):
            return raw

        # 2) list[dict]  -----------------------------------------
        if isinstance(raw, list) and len(raw) > 0 and isinstance(raw[0], dict):
            return raw[0]

        # 3) pandas.DataFrame  -----------------------------------
        try:
            import pandas as pd
            if isinstance(raw, pd.DataFrame) and len(raw) > 0:
                return raw.iloc[0].to_dict()
        except ImportError:
            pass

        # 4) res coincideix  → error
        raise ValueError("fetch_fitbit_data should return dict, list[dict] or DataFrame")

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

@app.get("/fitbit-data")
def fitbit_data():
    return get_fitbit_data()

@app.post("/recommend")
def recommend(payload: dict):
    text = get_recommendation(payload)
    return {"text": text}