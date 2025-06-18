#!/bin/sh

mkdir -p /app/db

# Executeu l'script per refrescar la base de dades abans d'iniciar el servidor
echo "Actualitzant la base de dades de Fitbit..."
python fitbit_fetch.py

# Start the Uvicorn server
echo "Starting Uvicorn server for FastAPI application..."
# Temporarily removed --reload for stability during startup script execution
exec uvicorn main:app --host 0.0.0.0 --port 8000

