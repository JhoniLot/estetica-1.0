@echo off
title Lumi SaaS - Sistema de Gestao Premium
echo ======================================================
echo 💎  Iniciando Lumi SaaS - Gestao de Salao & Estudio  💎
echo ======================================================
echo.

:: Verificar se o Node.js esta instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] O Node.js nao esta instalado no sistema.
    echo Por favor, instale o Node.js em https://nodejs.org/ para rodar o Lumi.
    pause
    exit /b
)

:: Instalar dependencias se a pasta node_modules nao existir
if not exist node_modules (
    echo [INFO] Pasta node_modules nao encontrada. Instalando dependencias...
    call npm install
)

:: Iniciar o servidor e abrir o navegador automaticamente
echo.
echo [INFO] Iniciando servidor local na porta 3000...
echo [INFO] Abrindo o Lumi no seu navegador padrao...
echo.

:: Abrir o navegador em segundo plano
start http://localhost:3000

:: Rodar o servidor Express
npm start

pause
