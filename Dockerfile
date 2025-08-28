# Multi-stage build for React frontend + Python backend
FROM node:18-alpine AS frontend-builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Python backend stage
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements and install
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy backend code
COPY server/ ./server/
COPY main.py .

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/dist ./public

# Set environment variables
ENV PORT=3001
ENV PYTHONPATH=/app

EXPOSE $PORT

CMD ["python", "main.py"] 