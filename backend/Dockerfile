FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN apt-get update && apt-get install -y dos2unix && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Copy the start script and make it executable
COPY start.sh /app/start.sh
# Convert line endings to Unix format and make executable
RUN dos2unix /app/start.sh && chmod +x /app/start.sh

# Set the entrypoint to the start script
CMD ["/app/start.sh"]