#!/bin/bash

# 🚀 SCRIPT DE DEPLOY BLINDADO - BACKEND (FLORA API)
# Professor Sênior: Modo Segurança Máxima 🛡️

# 'set -e' faz o script parar imediatamente se qualquer comando der erro
set -e

echo "🎬 Iniciando deploy do Backend..."

# 1. Caminho da pasta da API
API_DIR="/home/trailrunclub-api/htdocs/server"
cd $API_DIR

echo "📥 Atualizando código do servidor..."
git pull origin main

# 2. Verificação crucial do .env
if [ ! -f .env ]; then
    echo "❌ ERRO: Arquivo .env não encontrado em $API_DIR"
    echo "Crie o arquivo .env com as chaves necessárias antes de continuar."
    exit 1
fi

echo "📦 Atualizando bibliotecas..."
npm install --production

echo "🐳 Gerenciando containers Docker..."

# Tenta usar 'docker compose' (v2), se falhar usa 'docker-compose' (v1)
if docker compose version >/dev/null 2>&1; then
    echo "Usando Docker Compose V2..."
    docker compose down || true
    docker compose up -d --build
else
    echo "Usando Docker Compose V1..."
    docker-compose down || true
    docker-compose up -d --build
fi

echo "🧹 Limpando imagens antigas..."
docker image prune -f

echo "✅ DEPLOY CONCLUÍDO COM SUCESSO! 🚀"
echo "📡 Verifique em: https://api.trailrunclub.com.br"
