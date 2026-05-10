# 🐳 Dockerfile Sênior - Flora Checkout Backend

# 1. Usamos uma imagem leve e segura
FROM node:20-slim

# 2. Criamos o diretório da aplicação
WORKDIR /usr/src/app

# 3. Copiamos os arquivos de dependências primeiro (Otimização de Cache)
COPY package*.json ./

# 4. Instalamos apenas o necessário para produção
RUN npm install --production

# 5. Copiamos o restante do código
COPY . .

# 6. Expomos a porta que o servidor usa
EXPOSE 3001

# 7. Comando para iniciar
CMD ["node", "index.js"]
