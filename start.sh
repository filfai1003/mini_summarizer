
#!/bin/sh
# Start frontend static server and backend uvicorn server in background
# Serve built frontend from /app/frontend_dist on port 3000

# Start simple static server for frontend
if [ -d "/app/frontend_dist" ]; then
  (cd /app/frontend_dist && python -m http.server 3000 &) || true
else
  echo "Warning: /app/frontend_dist not found, frontend will not be served"
fi

# Start uvicorn for FastAPI
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
