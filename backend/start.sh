#!/bin/sh

# Run the Fitbit data fetch script
echo "Executing main.py to update database..."
python fitbit_fetch.py
python main.py

FETCH_STATUS=$?

if [ $FETCH_STATUS -ne 0 ]; then
    echo "Warning: main.py exited with status $FETCH_STATUS. Continuing to start Uvicorn..."
fi

# Start the Uvicorn server
echo "Starting Uvicorn server for FastAPI application..."
# Temporarily removed --reload for stability during startup script execution
exec uvicorn main:app --host 0.0.0.0 --port 8000
