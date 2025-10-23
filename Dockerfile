### Build frontend (Vite) ###
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend

# Copy only package files first for better caching
COPY frontend/package*.json ./
# Install deps and build
RUN npm install --legacy-peer-deps || npm install
    COPY frontend/ ./
    # Vite expects index.html at project root; copy public/index.html into builder root if present
    RUN if [ -f ./public/index.html ]; then cp ./public/index.html ./index.html; fi
    RUN npm run build

### Final image: Python app + built frontend ###
FROM python:3.11-slim

# Avoid generating pyc and enable unbuffered logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install minimal system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl build-essential && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY app ./app

# Copy built frontend from builder stage
COPY --from=frontend-builder /frontend/dist ./frontend_dist

# Add start script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose ports: 8000 for API, 3000 for frontend static server
EXPOSE 8000 3000

# Start both: frontend static server (port 3000) + uvicorn (port 8000)
CMD ["/start.sh"]
