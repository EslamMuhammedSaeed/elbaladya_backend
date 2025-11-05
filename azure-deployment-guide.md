# Azure Container Instances Deployment Guide

This guide will help you deploy the Albladya backend application to Azure Container Instances (ACI).

## Prerequisites

1. Azure CLI installed: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
2. Docker installed: https://docs.docker.com/get-docker/
3. An Azure account with an active subscription

## Step 1: Build and Push Docker Image

### Option A: Using Azure Container Registry (ACR) - Recommended

```bash
# Login to Azure
az login

# Create a resource group (if not exists)
az group create --name albladya-rg --location eastus

# Create an Azure Container Registry
az acr create --resource-group albladya-rg \
  --name albladyaregistry \
  --sku Basic \
  --admin-enabled true

# Login to ACR
az acr login --name albladyaregistry

# Build and push image to ACR
az acr build --registry albladyaregistry \
  --image albladya-backend:latest \
  --file Dockerfile .
```

### Option B: Using Docker Hub

```bash
# Build the image
docker build -t yourusername/albladya-backend:latest .

# Login to Docker Hub
docker login

# Push the image
docker push yourusername/albladya-backend:latest
```

## Step 2: Set up PostgreSQL Database

### Option A: Azure Database for PostgreSQL (Recommended for Production)

```bash
# Create Azure Database for PostgreSQL
az postgres flexible-server create \
  --resource-group albladya-rg \
  --name albladya-db-server \
  --location eastus \
  --admin-user adminuser \
  --admin-password YourSecurePassword123! \
  --sku-name Standard_B1ms \
  --version 15 \
  --public-access 0.0.0.0-255.255.255.255

# Create database
az postgres flexible-server db create \
  --resource-group albladya-rg \
  --server-name albladya-db-server \
  --database-name albladya

# Get connection string
# Format: postgresql://adminuser:YourSecurePassword123!@albladya-db-server.postgres.database.azure.com:5432/albladya?sslmode=require
```

### Option B: External PostgreSQL (e.g., ElephantSQL, AWS RDS)

Simply use your existing database connection string.

## Step 3: Run Database Migrations

Before deploying to ACI, run Prisma migrations against your production database:

```bash
# Set your production DATABASE_URL
export DATABASE_URL="postgresql://adminuser:YourSecurePassword123!@albladya-db-server.postgres.database.azure.com:5432/albladya?sslmode=require"

# Run migrations locally
npx prisma migrate deploy

# Or run from a Docker container
docker run --rm \
  -e DATABASE_URL="$DATABASE_URL" \
  albladyaregistry.azurecr.io/albladya-backend:latest \
  npx prisma migrate deploy
```

## Step 4: Deploy to Azure Container Instances

### Using Azure CLI

```bash
# Get ACR credentials
ACR_LOGIN_SERVER=$(az acr show --name albladyaregistry --query loginServer --output tsv)
ACR_USERNAME=$(az acr credential show --name albladyaregistry --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name albladyaregistry --query passwords[0].value --output tsv)

# Deploy to ACI
az container create \
  --resource-group albladya-rg \
  --name albladya-backend \
  --image albladyaregistry.azurecr.io/albladya-backend:latest \
  --registry-login-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --dns-name-label albladya-backend \
  --ports 4000 \
  --cpu 1 \
  --memory 1.5 \
  --environment-variables \
    NODE_ENV=production \
    PORT=4000 \
    FRONTEND_URL=https://your-frontend-url.com \
  --secure-environment-variables \
    DATABASE_URL="postgresql://adminuser:YourSecurePassword123!@albladya-db-server.postgres.database.azure.com:5432/albladya?sslmode=require" \
    JWT_SECRET="your-jwt-secret" \
    AWS_ACCESS_KEY_ID="your-aws-key" \
    AWS_SECRET_ACCESS_KEY="your-aws-secret"

# Get the FQDN
az container show \
  --resource-group albladya-rg \
  --name albladya-backend \
  --query ipAddress.fqdn \
  --output tsv
```

### Using Azure Portal

1. Go to Azure Portal: https://portal.azure.com
2. Click "Create a resource" > "Containers" > "Container Instances"
3. Fill in the details:
   - **Basics Tab:**
     - Resource group: `albladya-rg`
     - Container name: `albladya-backend`
     - Region: `East US`
     - Image source: `Azure Container Registry` or `Docker Hub`
     - Image: `albladyaregistry.azurecr.io/albladya-backend:latest`
   - **Networking Tab:**
     - Networking type: `Public`
     - DNS name label: `albladya-backend`
     - Ports: `4000`
     - Port protocol: `TCP`
   - **Advanced Tab:**
     - Restart policy: `Always`
     - Environment variables: Add all required variables
     - CPU: `1`
     - Memory: `1.5 GB`
4. Click "Review + create" > "Create"

## Step 5: Verify Deployment

```bash
# Check container status
az container show \
  --resource-group albladya-rg \
  --name albladya-backend \
  --query instanceView.state

# View logs
az container logs \
  --resource-group albladya-rg \
  --name albladya-backend

# Test the endpoint
FQDN=$(az container show \
  --resource-group albladya-rg \
  --name albladya-backend \
  --query ipAddress.fqdn \
  --output tsv)

curl http://$FQDN:4000/graphql
```

## Step 6: Configure Custom Domain (Optional)

To use a custom domain with your ACI:

1. Get the public IP from ACI
2. Create an A record in your DNS provider pointing to the IP
3. Configure SSL using Azure Application Gateway or Azure Front Door

## Monitoring and Logs

### View Real-time Logs
```bash
az container logs \
  --resource-group albladya-rg \
  --name albladya-backend \
  --follow
```

### Enable Azure Monitor (Optional)
```bash
# Create Log Analytics workspace
az monitor log-analytics workspace create \
  --resource-group albladya-rg \
  --workspace-name albladya-logs

# Get workspace credentials
WORKSPACE_ID=$(az monitor log-analytics workspace show \
  --resource-group albladya-rg \
  --workspace-name albladya-logs \
  --query customerId --output tsv)

WORKSPACE_KEY=$(az monitor log-analytics workspace get-shared-keys \
  --resource-group albladya-rg \
  --workspace-name albladya-logs \
  --query primarySharedKey --output tsv)

# Recreate container with logging enabled
az container create \
  --resource-group albladya-rg \
  --name albladya-backend \
  --image albladyaregistry.azurecr.io/albladya-backend:latest \
  --log-analytics-workspace $WORKSPACE_ID \
  --log-analytics-workspace-key $WORKSPACE_KEY \
  [... other parameters ...]
```

## Updating the Application

```bash
# Build and push new image
az acr build --registry albladyaregistry \
  --image albladya-backend:latest \
  --file Dockerfile .

# Delete existing container
az container delete \
  --resource-group albladya-rg \
  --name albladya-backend \
  --yes

# Recreate with new image (use same create command from Step 4)
az container create [... same parameters as before ...]
```

## Cost Optimization

- Use `--restart-policy OnFailure` for batch jobs
- Consider Azure Container Apps for more advanced features and better pricing
- Use `--cpu 0.5 --memory 1` for lower traffic applications
- Delete containers when not in use: `az container delete --resource-group albladya-rg --name albladya-backend --yes`

## Troubleshooting

### Container won't start
```bash
# Check events
az container show \
  --resource-group albladya-rg \
  --name albladya-backend \
  --query instanceView.events

# Check logs
az container logs \
  --resource-group albladya-rg \
  --name albladya-backend
```

### Database connection issues
- Ensure PostgreSQL firewall rules allow Azure services
- Verify DATABASE_URL format includes `?sslmode=require` for Azure PostgreSQL
- Check if Prisma migrations have been run

### Memory issues
- Increase memory allocation: `--memory 2` or higher
- Check logs for memory errors

## Security Best Practices

1. **Use Azure Key Vault for secrets:**
```bash
# Create Key Vault
az keyvault create \
  --resource-group albladya-rg \
  --name albladya-keyvault

# Store secrets
az keyvault secret set \
  --vault-name albladya-keyvault \
  --name DATABASE-URL \
  --value "your-connection-string"
```

2. **Enable managed identity** for secure access to Azure resources
3. **Use private endpoints** for database connections
4. **Implement rate limiting** in your application
5. **Regular security updates**: Rebuild images regularly with updated base images

## Additional Resources

- [Azure Container Instances Documentation](https://docs.microsoft.com/en-us/azure/container-instances/)
- [Azure Container Registry Documentation](https://docs.microsoft.com/en-us/azure/container-registry/)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/deployment)

