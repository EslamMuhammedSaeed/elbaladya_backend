#!/bin/bash

# Deploy to Azure Container Instances
# Usage: ./deploy-to-aci.sh [registry-name] [image-name] [tag]

set -e

# Default values
REGISTRY_NAME="${1:-albladyaregistry}"
IMAGE_NAME="${2:-albladya-backend}"
TAG="${3:-latest}"
RESOURCE_GROUP="albladya-rg"
CONTAINER_NAME="albladya-backend"
DNS_LABEL="albladya-backend-$(date +%s)"
LOCATION="eastus"

echo "=================================================="
echo "Deploying to Azure Container Instances"
echo "=================================================="
echo "Registry: $REGISTRY_NAME"
echo "Image: $IMAGE_NAME:$TAG"
echo "Resource Group: $RESOURCE_GROUP"
echo "Container Name: $CONTAINER_NAME"
echo "Location: $LOCATION"
echo "=================================================="
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Error: Azure CLI is not installed"
    exit 1
fi

# Check for required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  Warning: DATABASE_URL environment variable is not set"
    read -p "Enter DATABASE_URL: " DATABASE_URL
fi

# Get ACR credentials
echo "🔐 Getting ACR credentials..."
ACR_LOGIN_SERVER=$(az acr show --name "$REGISTRY_NAME" --query loginServer --output tsv)
ACR_USERNAME=$(az acr credential show --name "$REGISTRY_NAME" --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name "$REGISTRY_NAME" --query passwords[0].value --output tsv)

# Check if resource group exists
echo "📦 Checking resource group..."
if ! az group show --name "$RESOURCE_GROUP" &> /dev/null; then
    echo "Creating resource group: $RESOURCE_GROUP"
    az group create --name "$RESOURCE_GROUP" --location "$LOCATION"
fi

# Check if container already exists
if az container show --resource-group "$RESOURCE_GROUP" --name "$CONTAINER_NAME" &> /dev/null; then
    echo "⚠️  Container $CONTAINER_NAME already exists"
    read -p "Do you want to delete and recreate? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Deleting existing container..."
        az container delete --resource-group "$RESOURCE_GROUP" --name "$CONTAINER_NAME" --yes
    else
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Deploy to ACI
echo "🚀 Deploying to Azure Container Instances..."
az container create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$CONTAINER_NAME" \
    --image "$ACR_LOGIN_SERVER/$IMAGE_NAME:$TAG" \
    --registry-login-server "$ACR_LOGIN_SERVER" \
    --registry-username "$ACR_USERNAME" \
    --registry-password "$ACR_PASSWORD" \
    --dns-name-label "$DNS_LABEL" \
    --ports 4000 \
    --cpu 1 \
    --memory 1.5 \
    --environment-variables \
        NODE_ENV=production \
        PORT=4000 \
    --secure-environment-variables \
        DATABASE_URL="$DATABASE_URL"

# Get the FQDN
echo ""
echo "✅ Deployment successful!"
echo ""
FQDN=$(az container show \
    --resource-group "$RESOURCE_GROUP" \
    --name "$CONTAINER_NAME" \
    --query ipAddress.fqdn \
    --output tsv)

echo "🌐 Application URL: http://$FQDN:4000"
echo "📊 GraphQL Playground: http://$FQDN:4000/graphql"
echo ""
echo "View logs with:"
echo "  az container logs --resource-group $RESOURCE_GROUP --name $CONTAINER_NAME --follow"

