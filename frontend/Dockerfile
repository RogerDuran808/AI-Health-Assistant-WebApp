FROM node:20-alpine
WORKDIR /app

# només els manifestos → capa petita i caché
COPY package.json package-lock.json* ./

# instal·lació en mode prod, sense auditories
RUN npm install --prefer-offline --no-audit

# codi font (ja sense node_modules)
COPY . .

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]