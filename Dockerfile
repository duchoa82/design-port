# Optimized Dockerfile for Railway deployment
FROM python:3.11-slim

WORKDIR /app

# Install only essential dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Install Python dependencies first (better caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy only necessary files
COPY server/ ./server/
COPY main.py .

# Set environment variables
ENV PORT=3001
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

EXPOSE $PORT

# Simple health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:$PORT/api/health')" || exit 1

CMD ["python", "main.py"] 