from fastapi import FastAPI, Response, status, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fitbit_fetch import fetch_fitbit_data
from .ai import get_daily_plan
app = FastAPI(title="Fitbit Dashboard API")
router = APIRouter()

# Allow local dev and deployed UI to talk to API
app.include_router(router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"]
)

@app.get("/fitbit-data", summary="Yesterday's Fitbit data")
async def get_fitbit_data():
    try:
        return fetch_fitbit_data()
    except Exception as exc:
        return Response(str(exc), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@router.get("/daily-plan")
def daily_plan():
    data = get_latest_data()          # funció existent que et torna el dict
    plan = get_daily_plan(data)
    return {"plan": plan, "date": data["date"]}