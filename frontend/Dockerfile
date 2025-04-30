FROM node:20-alpine
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install --production=false
COPY frontend/ ./
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]