FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y curl build-essential && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs
COPY . .
RUN pip install --no-cache-dir -r IBS_CARE_AI_FINAL/backend/requirements.txt
RUN npm ci
RUN npm run build
RUN mkdir -p IBS_CARE_AI_FINAL/backend/static && cp -r dist/* IBS_CARE_AI_FINAL/backend/static/
EXPOSE 10000
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 CMD curl -f http://localhost:$PORT/health || exit 1
WORKDIR /app/IBS_CARE_AI_FINAL/backend
CMD gunicorn -w 2 -k gthread -b 0.0.0.0:$PORT app.main:app
