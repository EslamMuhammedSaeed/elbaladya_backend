@echo off
REM Deploy to Azure Container Instances (Windows)
REM Usage: deploy-to-aci.bat [registry-name] [image-name] [tag]

setlocal enabledelayedexpansion

REM Default values
set "REGISTRY_NAME=%~1"
set "IMAGE_NAME=%~2"
set "TAG=%~3"

if "%REGISTRY_NAME%"=="" set "REGISTRY_NAME=albladyaregistry"
if "%IMAGE_NAME%"=="" set "IMAGE_NAME=albladya-backend"
if "%TAG%"=="" set "TAG=latest"

set "RESOURCE_GROUP=albladya-rg"
set "CONTAINER_NAME=albladya-backend"
set "LOCATION=eastus"

echo ==================================================
echo Deploying to Azure Container Instances
echo ==================================================
echo Registry: %REGISTRY_NAME%
echo Image: %IMAGE_NAME%:%TAG%
echo Resource Group: %RESOURCE_GROUP%
echo Container Name: %CONTAINER_NAME%
echo Location: %LOCATION%
echo ==================================================
echo.

REM Check if Azure CLI is installed
where az >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Azure CLI is not installed
    exit /b 1
)

REM Check for DATABASE_URL
if "%DATABASE_URL%"=="" (
    echo Warning: DATABASE_URL environment variable is not set
    set /p DATABASE_URL="Enter DATABASE_URL: "
)

REM Get ACR credentials
echo Getting ACR credentials...
for /f "tokens=*" %%i in ('az acr show --name %REGISTRY_NAME% --query loginServer --output tsv') do set ACR_LOGIN_SERVER=%%i
for /f "tokens=*" %%i in ('az acr credential show --name %REGISTRY_NAME% --query username --output tsv') do set ACR_USERNAME=%%i
for /f "tokens=*" %%i in ('az acr credential show --name %REGISTRY_NAME% --query passwords[0].value --output tsv') do set ACR_PASSWORD=%%i

REM Check if resource group exists
echo Checking resource group...
az group show --name %RESOURCE_GROUP% >nul 2>nul
if %errorlevel% neq 0 (
    echo Creating resource group: %RESOURCE_GROUP%
    az group create --name %RESOURCE_GROUP% --location %LOCATION%
)

REM Check if container exists
az container show --resource-group %RESOURCE_GROUP% --name %CONTAINER_NAME% >nul 2>nul
if %errorlevel% equ 0 (
    echo Container %CONTAINER_NAME% already exists
    set /p CONFIRM="Do you want to delete and recreate? (y/N): "
    if /i "!CONFIRM!"=="y" (
        echo Deleting existing container...
        az container delete --resource-group %RESOURCE_GROUP% --name %CONTAINER_NAME% --yes
    ) else (
        echo Deployment cancelled
        exit /b 1
    )
)

REM Deploy to ACI
echo Deploying to Azure Container Instances...
az container create ^
    --resource-group %RESOURCE_GROUP% ^
    --name %CONTAINER_NAME% ^
    --image %ACR_LOGIN_SERVER%/%IMAGE_NAME%:%TAG% ^
    --registry-login-server %ACR_LOGIN_SERVER% ^
    --registry-username %ACR_USERNAME% ^
    --registry-password %ACR_PASSWORD% ^
    --dns-name-label albladya-backend-%RANDOM% ^
    --ports 4000 ^
    --cpu 1 ^
    --memory 1.5 ^
    --environment-variables NODE_ENV=production PORT=4000 ^
    --secure-environment-variables DATABASE_URL="%DATABASE_URL%"

if %errorlevel% equ 0 (
    echo.
    echo Deployment successful!
    echo.
    
    REM Get FQDN
    for /f "tokens=*" %%i in ('az container show --resource-group %RESOURCE_GROUP% --name %CONTAINER_NAME% --query ipAddress.fqdn --output tsv') do set FQDN=%%i
    
    echo Application URL: http://!FQDN!:4000
    echo GraphQL Playground: http://!FQDN!:4000/graphql
    echo.
    echo View logs with:
    echo   az container logs --resource-group %RESOURCE_GROUP% --name %CONTAINER_NAME% --follow
) else (
    echo.
    echo Deployment failed
    exit /b 1
)

endlocal

