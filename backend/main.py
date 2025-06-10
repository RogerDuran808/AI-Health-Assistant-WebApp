from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware

from fitbit_fetch import fetch_fitbit_data, fetch_user_profile, save_user_profile
from ai import get_recommendation

import numpy as np
import logging

app = FastAPI(title="Fit Dashboard")



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("FastAPI application startup: Running fitbit_fetch_data...")
    try:
        fetch_fitbit_data()
        print("fitbit_fetch_data completed successfully during startup.")
    except Exception as e:
        print(f"Error during fitbit_fetch_data on startup: {e}")

log = logging.getLogger(__name__)

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


def get_user_profile() -> dict:
    """Obté el perfil d'usuari de la BD i el prepara per enviar."""
    profile = fetch_user_profile()
    return jsonable_encoder(profile, exclude_none=True)


# ---------- Endpoints --------------------------------------------------------
@app.get("/fitbit-data")
def fitbit_data():
    try:
        payload = get_fitbit_data()
        return JSONResponse(content=payload)
    except Exception as exc:
        log.exception("/fitbit-data failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/user-profile")
def user_profile():
    try:
        payload = get_user_profile()
        return JSONResponse(content=payload)
    except Exception as exc:
        log.exception("/user-profile failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/user-profile")
def update_user_profile(payload: dict):
    """Rep un perfil i l'emmagatzema a la BD."""
    try:
        ok = save_user_profile(payload)
        if not ok:
            raise HTTPException(status_code=500, detail="No s'ha pogut guardar el perfil")
        return {"status": "ok"}
    except Exception as exc:
        log.exception("/user-profile POST failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/recommend")
def recommend(payload: dict):
    """Genera una recomanació personalitzada a partir de les dades Fitbit."""
    try:
        text = get_recommendation(payload)
        return {"text": text}
    except Exception as exc:
        log.exception("/recommend failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
