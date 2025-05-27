from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware

from fitbit_fetch import fetch_fitbit_data
from ai import get_recommendation

import numpy as np
import logging

app = FastAPI(title="Fitbit Dashboard API")
log = logging.getLogger(__name__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ---------- Helper -----------------------------------------------------------
def get_fitbit_data() -> dict:
    """
    Converteix el resultat de fetch_fitbit_data a dict serialitzable.
    Accepta dict, list[dict] o pandas.DataFrame.
    """
    raw = fetch_fitbit_data()

    # 1) dict ----------------------------------------------------------
    if isinstance(raw, dict):
        record = raw

    # 2) list[dict] ----------------------------------------------------
    elif isinstance(raw, list) and raw and isinstance(raw[0], dict):
        record = raw[0]

    # 3) pandas.DataFrame ---------------------------------------------
    else:
        try:
            import pandas as pd
            if isinstance(raw, pd.DataFrame) and len(raw) > 0:
                record = raw.iloc[0].to_dict()
            else:
                raise ValueError
        except (ImportError, ValueError):
            raise HTTPException(
                status_code=500,
                detail="fetch_fitbit_data must return dict, list[dict] or DataFrame",
            )

    # ---------- Neteja JSON-unsafe (NaN, numpy, datetime, …) ----------
    if isinstance(record, dict):
        # converteix NaN→None i elimina claus sense valor útil
        record = {
            k: (None if isinstance(v, float) and np.isnan(v) else v)
            for k, v in record.items()
            if v is not None and not (isinstance(v, float) and np.isnan(v))
        }

    # jsonable_encoder converteix numpy.*, datetime, enums, etc.
    return jsonable_encoder(record, exclude_none=True)


# ---------- Endpoints --------------------------------------------------------
@app.get("/fitbit-data")
def fitbit_data():
    try:
        payload = get_fitbit_data()
        return JSONResponse(content=payload)
    except Exception as exc:
        log.exception("/fitbit-data failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/recommend")
def recommend(payload: dict):
    try:
        text = get_recommendation(payload)
        return {"text": text}
    except Exception as exc:
        log.exception("/recommend failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
