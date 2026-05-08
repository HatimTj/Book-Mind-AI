#!/bin/bash
# Start the BookMind AI FastAPI backend
cd "$(dirname "$0")"
uvicorn main:app --reload --port 8001 --host 0.0.0.0
