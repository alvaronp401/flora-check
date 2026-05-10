#!/bin/bash

# 🚀 SCRIPT DE DEPLOY AUTOMÁTICO - BACKEND (FLORA API)
# Professor Sênior: Modo Blindado 🛡️

echo "🎬 Iniciando deploy do Backend..."

# 1. Caminho da pasta da API no servidor
# Ajuste de acordo com a estrutura do CloudPanel (trailrunclub-api)
API_DIR="/home/trailrunclub-api/htdocs/server"

cd $API_DIR || { echo "❌ Erro: Pasta da API não encontrada!"; exit 1; }

echo "📥 Atualizando código do servidor..."
git pull origin main

echo "📦 Atualizando bibliotecas..."
npm install

echo "🐳 Reconstruindo e reiniciando containers Docker..."
# O comando '--build' garante que o Docker pegue as mudanças do código novo
docker-compose up -d --build

echo "🧹 Limpando imagens antigas (opcional)..."
docker image prune -f

echo "✅ BACKEND DOCKERIZADO E RODANDO!"
echo "📡 Endpoint: https://api.trailrunclub.com.br"
