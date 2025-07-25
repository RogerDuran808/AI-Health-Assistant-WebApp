from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware

from fitbit_fetch import (
    fetch_fitbit_data,
    fetch_user_profile,
    save_user_profile,
    save_ia_report,
    fetch_ia_reports,
    update_latest_training_plan,
    fetch_latest_training_plan,
    save_macrocycle,
    fetch_latest_macrocycle,
    fetch_weekly_data,
)
from ai import get_recommendation, get_pla_estructurat, generate_macros

import numpy as np
import logging

app = FastAPI(title="FitBoard")



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


@app.get("/fitbit-weekly")
def fitbit_weekly():
    try:
        data = fetch_weekly_data()
        return JSONResponse(content=jsonable_encoder(data))
    except Exception as exc:
        log.exception("/fitbit-weekly failed")
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
        save_ia_report(text, user_id=payload.get("user_id", "CJK8XS"))
        return {"text": text}
    except Exception as exc:
        log.exception("/recommend failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/macrocycle")
def generate_macrocycle_endpoint(payload: dict):
    """Genera i desa un nou macrocicle."""
    try:
        user_id = payload.get("user_id", "CJK8XS")
        profile = fetch_user_profile(user_id)
        if not profile:
            profile = fetch_user_profile("default")
        macro = generate_macros(profile)
        save_macrocycle(macro, user_id=user_id)
        return {"text": macro}
    except Exception as exc:
        log.exception("/macrocycle failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/macrocycle")
def get_macrocycle(user_id: str = "CJK8XS"):
    """Retorna l'últim macrocicle guardat."""
    try:
        macro, _ = fetch_latest_macrocycle(user_id)
        return {"text": macro}
    except Exception as exc:
        log.exception("/macrocycle GET failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/training-plan")
def training_plan(payload: dict):
    """Genera i desa el pla d'entrenament estructurat."""
    try:
        # Obté l'user_id preferentment de les dades Fitbit
        fitbit = payload.get("fitbit", {})
        user_id = fitbit.get("user_id", payload.get("user_id", "CJK8XS"))

        # Recupera el perfil guardat (si no existeix, usa el perfil per defecte)
        profile = fetch_user_profile(user_id)
        if not profile:
            profile = fetch_user_profile("default")

        macro, macro_date = fetch_latest_macrocycle(user_id)
        if macro_date:
            from datetime import datetime
            start_dt = datetime.fromisoformat(macro_date)
            week = (datetime.now() - start_dt).days // 7 + 1
        else:
            week = 1
            macro = ""

        text = get_pla_estructurat(
            fitbit,
            payload.get("recommendation", ""),
            profile,
            macro,
            week,
        )
        update_latest_training_plan(text, user_id=user_id, week=week)
        return {"text": text}
    except Exception as exc:
        log.exception("/training-plan failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/training-plan")
def get_training_plan(user_id: str = "CJK8XS"): # Aqui poso el meu user ID, en un futur user id seria un parametre que s'extreuris de la taula de user profile
    """Recupera l'últim pla d'entrenament de la BD."""
    try:
        text = fetch_latest_training_plan(user_id=user_id)
        return {"text": text}
    except Exception as exc:
        log.exception("/training-plan GET failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc

@app.get("/ia-reports")
def ia_reports(limit: int = 10, user_id: str = "CJK8XS"): # Aqui poso el meu user ID, en un futur user id seria un parametre que s'extreuris de la taula de user profile
    """Retorna els darrers informes de la IA desats a la base de dades."""
    try:
        reports = fetch_ia_reports(user_id=user_id, limit=limit)
        return JSONResponse(content=reports)
    except Exception as exc:
        log.exception("/ia-reports failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)