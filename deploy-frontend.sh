#!/bin/bash

# 🚀 SCRIPT DE DEPLOY AUTOMÁTICO - FRONTEND (FLORA CHECKOUT)
# Professor Sênior: Modo Segurança Máxima 🛡️

set -e 

echo "🎬 Iniciando deploy do Frontend..."

# 1. Caminhos Organizados
# O código fonte fica na pasta 'repo'
PROJECT_DIR="/home/trailrunclub/htdocs/repo"
# A pasta pública que o mundo vê
SITE_PUBLIC_DIR="/home/trailrunclub/htdocs/trailrunclub.com.br"

cd $PROJECT_DIR

echo "📥 Baixando as últimas atualizações do GitHub..."
git pull origin main

echo "📦 Instalando dependências..."
npm install

echo "🏗️ Gerando o Build de produção..."
npm run build

echo "🧹 Limpando e atualizando a pasta pública..."
# Remove tudo da pasta do site e coloca o novo build
rm -rf $SITE_PUBLIC_DIR/*
cp -r dist/* $SITE_PUBLIC_DIR/

echo "✅ DEPLOY CONCLUÍDO COM SUCESSO! 🚀"
echo "🌐 Acesse: https://trailrunclub.com.br"
