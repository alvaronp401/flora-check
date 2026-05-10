#!/bin/bash

# 🚀 SCRIPT DE DEPLOY AUTOMÁTICO - FRONTEND (FLORA CHECKOUT)
# Professor Sênior: Modo Blindado 🛡️

set -e # Para se der erro

echo "🎬 Iniciando deploy do Frontend..."

# 1. Ajuste o caminho para a pasta onde o projeto foi clonado
# No CloudPanel, assumimos que você está na raiz do htdocs
PROJECT_DIR="/home/trailrunclub/htdocs"
SITE_PUBLIC_DIR="/home/trailrunclub/htdocs/trailrunclub.com.br"

cd $PROJECT_DIR

echo "📥 Baixando as últimas atualizações do GitHub..."
git pull origin main

echo "📦 Instalando dependências..."
npm install

echo "🏗️ Gerando o Build de produção..."
# O Vite vai criar a pasta 'dist'
npm run build

echo "🧹 Limpando e atualizando a pasta do site..."
# Move os arquivos do build para a pasta que o CloudPanel expõe
rm -rf $SITE_PUBLIC_DIR/*
cp -r dist/* $SITE_PUBLIC_DIR/

echo "✅ DEPLOY CONCLUÍDO COM SUCESSO! 🚀"
echo "🌐 Acesse: https://trailrunclub.com.br"
