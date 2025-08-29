# Use Python 3.11 as base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Copy the entire project
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r IBS_CARE_AI_FINAL/backend/requirements.txt

# Install Node.js dependencies
RUN npm ci

# Build the frontend
RUN npm run build

# Create static directory and copy frontend build
RUN mkdir -p IBS_CARE_AI_FINAL/backend/app/static
RUN cp -r dist/* IBS_CARE_AI_FINAL/backend/app/static/

# Expose port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

# Start command
CMD gunicorn -w 2 -k gthread -b 0.0.0.0:$PORT IBS_CARE_AI_FINAL.backend.app.main:app
