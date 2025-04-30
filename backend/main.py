rom fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fitbit_fetch import fetch_fitbit_data

app = FastAPI(title="Fitbit Dashboard API")

# Allow local dev and deployed UI to talk to API
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