#!/bin/bash

# 🚀 SCRIPT DE DEPLOY AUTOMÁTICO - FRONTEND (FLORA CHECKOUT)
# Professor Sênior: Modo Blindado 🛡️

echo "🎬 Iniciando deploy do Frontend..."

# 1. Entrar na pasta do projeto (Ajuste o caminho se necessário no servidor)
# Geralmente no CloudPanel fica em: /home/trailrunclub/htdocs
PROJECT_DIR="/home/trailrunclub/htdocs"

cd $PROJECT_DIR || { echo "❌ Erro: Pasta do projeto não encontrada!"; exit 1; }

echo "📥 Baixando as últimas atualizações do GitHub..."
git pull origin main

echo "📦 Instalando dependências (npm install)..."
npm install

echo "🏗️ Gerando o Build de produção (npm run build)..."
# Aqui o Vite vai transformar todo o React em arquivos HTML/JS/CSS puros
npm run build

echo "🧹 Limpando a pasta pública e movendo o novo build..."
# O CloudPanel serve o que está na raiz do htdocs ou em subpastas configuradas.
# Vamos garantir que os arquivos do 'dist/' vao para o lugar certo.
cp -r dist/* .

echo "✅ DEPLOY CONCLUÍDO COM SUCESSO! O site está no ar."
echo "🌐 Acesse: https://trailrunclub.com.br"
