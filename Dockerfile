FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar TODAS as dependências (incluindo dev) para o build
RUN npm install

# Copiar código
COPY . .

# Cloud Run injeta PORT automaticamente (8080)
# Não precisa definir ENV PORT

EXPOSE 8080

# Iniciar apenas o backend
CMD ["node", "api/index.js"]
