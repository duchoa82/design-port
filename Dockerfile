# Ultra-lightweight Dockerfile for Railway
FROM python:3.11-alpine

WORKDIR /app

# Install minimal dependencies
RUN apk add --no-cache gcc musl-dev

# Copy and install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy only essential files
COPY server/ ./server/
COPY main.py .

# Set environment
ENV PORT=3001
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

EXPOSE $PORT

CMD ["python", "main.py"] 