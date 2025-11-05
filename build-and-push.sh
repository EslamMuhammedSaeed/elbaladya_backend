#!/bin/bash

# Build and Push Script for Azure Container Registry
# Usage: ./build-and-push.sh [registry-name] [image-name] [tag]

set -e

# Default values
REGISTRY_NAME="${1:-albladyaregistry}"
IMAGE_NAME="${2:-albladya-backend}"
TAG="${3:-latest}"

echo "=================================================="
echo "Building and Pushing Docker Image to Azure ACR"
echo "=================================================="
echo "Registry: $REGISTRY_NAME"
echo "Image: $IMAGE_NAME"
echo "Tag: $TAG"
echo "=================================================="

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Error: Azure CLI is not installed"
    echo "Please install from: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in
echo "🔐 Checking Azure authentication..."
if ! az account show &> /dev/null; then
    echo "⚠️  Not logged in to Azure. Logging in..."
    az login
fi

# Login to ACR
echo "🔐 Logging into Azure Container Registry..."
az acr login --name "$REGISTRY_NAME"

# Build and push
echo "🏗️  Building and pushing image..."
az acr build \
    --registry "$REGISTRY_NAME" \
    --image "$IMAGE_NAME:$TAG" \
    --file Dockerfile \
    .

echo "✅ Successfully built and pushed: $REGISTRY_NAME.azurecr.io/$IMAGE_NAME:$TAG"
echo ""
echo "Next steps:"
echo "1. Run migrations: npx prisma migrate deploy"
echo "2. Deploy to ACI using the commands in BUILD_AND_DEPLOY.md"
echo "   or run: ./deploy-to-aci.sh $REGISTRY_NAME $IMAGE_NAME $TAG"

