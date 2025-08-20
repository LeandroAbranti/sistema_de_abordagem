@echo off
chcp 65001 >nul
echo 🚔 Sistema de Abordagens de Trânsito
echo ======================================
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não está instalado!
    echo Por favor, instale o Node.js 16+ primeiro:
    echo https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detectado
echo.

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm install
    echo.
)

if not exist "server\node_modules" (
    echo 📦 Instalando dependências do servidor...
    cd server && npm install && cd ..
    echo.
)

if not exist "client\node_modules" (
    echo 📦 Instalando dependências do cliente...
    cd client && npm install && cd ..
    echo.
)

REM Verificar se o arquivo .env existe
if not exist "server\.env" (
    echo ⚙️  Configurando variáveis de ambiente...
    if exist "server\config.env.example" (
        copy "server\config.env.example" "server\.env" >nul
        echo ✅ Arquivo .env criado a partir do exemplo
        echo ⚠️  IMPORTANTE: Edite o arquivo server\.env com suas configurações!
    ) else (
        echo ❌ Arquivo config.env.example não encontrado!
        pause
        exit /b 1
    )
    echo.
)

echo 🚀 Iniciando o sistema...
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5000
echo 🔐 Login Admin: Matrícula 257, Senha definida no arquivo .env
echo.
echo Pressione Ctrl+C para parar o sistema
echo.

REM Iniciar o sistema
npm run dev
