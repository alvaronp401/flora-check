#!/bin/bash

# 🚀 SCRIPT DE DEPLOY AUTOMÁTICO - FRONTEND (FLORA CHECKOUT)
# Professor Sênior: Modo Blindado 🛡️

set -e # Para se der erro

echo "🎬 Iniciando deploy do Frontend..."

# 1. Caminhos no servidor (Usuário trailrunclub)
# O repositório está na raiz do htdocs
PROJECT_DIR="/home/trailrunclub/htdocs"
# A pasta que o CloudPanel exibe o site
SITE_PUBLIC_DIR="/home/trailrunclub/htdocs/trailrunclub.com.br"

cd $PROJECT_DIR

echo "📥 Baixando as últimas atualizações do GitHub..."
git pull origin main

echo "📦 Instalando dependências (npm install)..."
# Usamos '--include=dev' porque o Vite é uma dependência de desenvolvimento
npm install

echo "🏗️ Gerando o Build de produção (npm run build)..."
npm run build

echo "🧹 Limpando a pasta pública e movendo o novo build..."
# Remove o index.html antigo e coloca os arquivos novos do 'dist/'
rm -rf $SITE_PUBLIC_DIR/*
cp -r dist/* $SITE_PUBLIC_DIR/

echo "✅ DEPLOY CONCLUÍDO COM SUCESSO! 🚀"
echo "🌐 Acesse: https://trailrunclub.com.br"
