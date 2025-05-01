FROM node:20-alpine
WORKDIR /app

# Copiamos solo lo necesario para instalar dependencias
COPY package.json package-lock.json* ./

# 👉 Instala TODAS las dependencias, incluidas las de desarrollo
RUN npm install --prefer-offline --no-audit

# Copiamos el resto del código
COPY . .

# Vite en modo desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]