@echo off
REM Build and Push Script for Azure Container Registry (Windows)
REM Usage: build-and-push.bat [registry-name] [image-name] [tag]

setlocal enabledelayedexpansion

REM Default values
set "REGISTRY_NAME=%~1"
set "IMAGE_NAME=%~2"
set "TAG=%~3"

if "%REGISTRY_NAME%"=="" set "REGISTRY_NAME=albladyaregistry"
if "%IMAGE_NAME%"=="" set "IMAGE_NAME=albladya-backend"
if "%TAG%"=="" set "TAG=latest"

echo ==================================================
echo Building and Pushing Docker Image to Azure ACR
echo ==================================================
echo Registry: %REGISTRY_NAME%
echo Image: %IMAGE_NAME%
echo Tag: %TAG%
echo ==================================================
echo.

REM Check if Azure CLI is installed
where az >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Azure CLI is not installed
    echo Please install from: https://docs.microsoft.com/cli/azure/install-azure-cli
    exit /b 1
)

REM Check if logged in
echo Checking Azure authentication...
az account show >nul 2>nul
if %errorlevel% neq 0 (
    echo Not logged in to Azure. Logging in...
    az login
)

REM Login to ACR
echo Logging into Azure Container Registry...
az acr login --name %REGISTRY_NAME%
if %errorlevel% neq 0 (
    echo Error: Failed to login to ACR
    exit /b 1
)

REM Build and push
echo Building and pushing image...
az acr build ^
    --registry %REGISTRY_NAME% ^
    --image %IMAGE_NAME%:%TAG% ^
    --file Dockerfile ^
    .

if %errorlevel% equ 0 (
    echo.
    echo Successfully built and pushed: %REGISTRY_NAME%.azurecr.io/%IMAGE_NAME%:%TAG%
    echo.
    echo Next steps:
    echo 1. Run migrations: npx prisma migrate deploy
    echo 2. Deploy to ACI using the commands in BUILD_AND_DEPLOY.md
) else (
    echo.
    echo Error: Build and push failed
    exit /b 1
)

endlocal

