#!/bin/bash

echo "🚔 Sistema de Abordagens de Trânsito"
echo "======================================"
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado!"
    echo "Por favor, instale o Node.js 16+ primeiro:"
    echo "https://nodejs.org/"
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js versão 16+ é necessário!"
    echo "Versão atual: $(node -v)"
    echo "Por favor, atualize o Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"
echo ""

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    echo ""
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 Instalando dependências do servidor..."
    cd server && npm install && cd ..
    echo ""
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Instalando dependências do cliente..."
    cd client && npm install && cd ..
    echo ""
fi

# Verificar se o arquivo .env existe
if [ ! -f "server/.env" ]; then
    echo "⚙️  Configurando variáveis de ambiente..."
    if [ -f "server/config.env.example" ]; then
        cp server/config.env.example server/.env
        echo "✅ Arquivo .env criado a partir do exemplo"
        echo "⚠️  IMPORTANTE: Edite o arquivo server/.env com suas configurações!"
    else
        echo "❌ Arquivo config.env.example não encontrado!"
        exit 1
    fi
    echo ""
fi

echo "🚀 Iniciando o sistema..."
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo "🔐 Login Admin: Matrícula 257, Senha definida no arquivo .env"
echo ""
echo "Pressione Ctrl+C para parar o sistema"
echo ""

# Iniciar o sistema
npm run dev
