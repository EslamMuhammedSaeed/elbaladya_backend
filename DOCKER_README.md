# Docker Setup for Albladya Backend

This directory contains all necessary files to containerize and deploy the Albladya backend application to Azure Container Instances (ACI).

## 📁 Files Overview

- **Dockerfile** - Multi-stage Docker build configuration optimized for production
- **.dockerignore** - Excludes unnecessary files from Docker build context
- **docker-compose.yml** - Local development setup with PostgreSQL
- **env.template** - Environment variables template
- **BUILD_AND_DEPLOY.md** - Quick start commands
- **azure-deployment-guide.md** - Comprehensive Azure deployment guide

## 🚀 Quick Start

### 1. Build Docker Image

```bash
# Using npm script
npm run docker:build

# Or directly
docker build -t albladya-backend:latest .
```

### 2. Test Locally with Docker Compose

```bash
# Start both backend and PostgreSQL
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Access GraphQL Playground at: http://localhost:4000/graphql

### 3. Test with Your Own Database

```bash
# Create .env file from template
cp env.template .env

# Edit .env with your configuration
# Then run:
docker run -d \
  -p 4000:4000 \
  --env-file .env \
  --name albladya-backend \
  albladya-backend:latest
```

## 🔧 Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment mode | `production` |

### Optional Environment Variables

| Variable | Description |
|----------|-------------|
| `FRONTEND_URL` | Frontend URL for CORS |
| `JWT_SECRET` | JWT secret for authentication |
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for S3 |
| `AWS_REGION` | AWS region |
| `AWS_S3_BUCKET` | S3 bucket name |

See `env.template` for complete list.

## 🗄️ Database Migrations

Always run Prisma migrations before deploying:

```bash
# Locally
export DATABASE_URL="your-production-db-url"
npm run prisma:migrate

# In Docker
docker run --rm \
  -e DATABASE_URL="your-production-db-url" \
  albladya-backend:latest \
  npm run prisma:migrate
```

## ☁️ Deploy to Azure

### Prerequisites

```bash
# Install Azure CLI
# Windows: https://aka.ms/installazurecliwindows
# Mac: brew install azure-cli
# Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login
```

### Quick Deploy

```bash
# 1. Create resource group
az group create --name albladya-rg --location eastus

# 2. Create Azure Container Registry
az acr create --resource-group albladya-rg \
  --name albladyaregistry \
  --sku Basic \
  --admin-enabled true

# 3. Build and push image
az acr build --registry albladyaregistry \
  --image albladya-backend:latest \
  --file Dockerfile .

# 4. Create PostgreSQL database (optional, if you don't have one)
az postgres flexible-server create \
  --resource-group albladya-rg \
  --name albladya-db \
  --location eastus \
  --admin-user adminuser \
  --admin-password YourSecurePassword123! \
  --sku-name Standard_B1ms \
  --version 15

# 5. Deploy to ACI
az container create \
  --resource-group albladya-rg \
  --name albladya-backend \
  --image albladyaregistry.azurecr.io/albladya-backend:latest \
  --registry-login-server albladyaregistry.azurecr.io \
  --registry-username $(az acr credential show --name albladyaregistry --query username -o tsv) \
  --registry-password $(az acr credential show --name albladyaregistry --query passwords[0].value -o tsv) \
  --dns-name-label albladya-backend-unique \
  --ports 4000 \
  --cpu 1 \
  --memory 1.5 \
  --environment-variables NODE_ENV=production PORT=4000 \
  --secure-environment-variables DATABASE_URL="your-database-url"

# 6. Get application URL
az container show \
  --resource-group albladya-rg \
  --name albladya-backend \
  --query ipAddress.fqdn \
  --output tsv
```

## 🐳 Docker Image Details

### Multi-Stage Build

The Dockerfile uses a multi-stage build to optimize image size:

1. **Builder Stage**: Installs all dependencies and generates Prisma client
2. **Production Stage**: Copies only necessary files, installs production dependencies

### Image Features

- ✅ Based on Node.js 18 Alpine (small size)
- ✅ Non-root user for security
- ✅ Health check endpoint configured
- ✅ Optimized layer caching
- ✅ Production-ready configuration

### Image Size

Expected size: ~200-300 MB (compressed)

## 🔍 Monitoring & Debugging

### View Container Logs (Azure)

```bash
# Real-time logs
az container logs \
  --resource-group albladya-rg \
  --name albladya-backend \
  --follow

# Recent logs
az container logs \
  --resource-group albladya-rg \
  --name albladya-backend
```

### View Container Logs (Local)

```bash
# Docker Compose
docker-compose logs -f backend

# Standalone container
docker logs -f albladya-backend
```

### Check Container Health

```bash
# Azure
az container show \
  --resource-group albladya-rg \
  --name albladya-backend \
  --query instanceView

# Local
docker ps
docker inspect albladya-backend | grep -A 10 Health
```

## 🔄 Update Deployment

```bash
# 1. Rebuild and push image
az acr build --registry albladyaregistry \
  --image albladya-backend:latest \
  --file Dockerfile .

# 2. Delete old container
az container delete \
  --resource-group albladya-rg \
  --name albladya-backend \
  --yes

# 3. Recreate container with new image
# (use same 'az container create' command from deployment)
```

## 🧪 Testing the Deployment

```bash
# Get the application URL
FQDN=$(az container show \
  --resource-group albladya-rg \
  --name albladya-backend \
  --query ipAddress.fqdn \
  --output tsv)

# Test GraphQL endpoint
curl http://$FQDN:4000/graphql

# Open in browser
echo "GraphQL Playground: http://$FQDN:4000/graphql"
```

## 🛠️ Troubleshooting

### Container won't start

```bash
# Check events
az container show \
  --resource-group albladya-rg \
  --name albladya-backend \
  --query instanceView.events

# Check state
az container show \
  --resource-group albladya-rg \
  --name albladya-backend \
  --query instanceView.state
```

### Database connection issues

- Verify `DATABASE_URL` is correct
- For Azure PostgreSQL, ensure connection string includes `?sslmode=require`
- Check PostgreSQL firewall rules allow Azure services
- Ensure migrations have been run: `npm run prisma:migrate`

### Port binding issues (local)

```bash
# Check if port 4000 is in use
# Windows
netstat -ano | findstr :4000

# Linux/Mac
lsof -i :4000

# Use different port
docker run -p 5000:4000 -e PORT=4000 albladya-backend:latest
```

### Image build fails

```bash
# Clean Docker cache
docker builder prune -a

# Rebuild without cache
docker build --no-cache -t albladya-backend:latest .
```

## 📊 Performance Tuning

### Azure Container Instances

```bash
# Increase resources if needed
az container create \
  --cpu 2 \
  --memory 3 \
  [... other parameters ...]
```

### Recommended Resources

| Traffic Level | CPU | Memory |
|---------------|-----|--------|
| Low (< 100 req/min) | 0.5 | 1 GB |
| Medium (100-1000 req/min) | 1 | 1.5 GB |
| High (> 1000 req/min) | 2 | 3 GB |

## 💰 Cost Estimation (Azure)

Approximate monthly costs (East US):

- **Container Instances** (1 CPU, 1.5 GB): ~$35/month
- **Azure Database for PostgreSQL** (Basic, 1 vCore): ~$30/month
- **Container Registry** (Basic): ~$5/month
- **Total**: ~$70/month

*Note: Actual costs may vary. Use [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/) for accurate estimates.*

## 🔐 Security Best Practices

1. **Use secure environment variables** for sensitive data:
   ```bash
   --secure-environment-variables DATABASE_URL="..." JWT_SECRET="..."
   ```

2. **Store secrets in Azure Key Vault** for production

3. **Enable managed identity** for Azure resource access

4. **Use private endpoints** for database connections

5. **Regularly update base image**:
   ```bash
   docker pull node:18-alpine
   docker build -t albladya-backend:latest .
   ```

6. **Scan image for vulnerabilities**:
   ```bash
   # Using Azure Container Registry
   az acr task create \
     --registry albladyaregistry \
     --name security-scan \
     --image albladya-backend:latest \
     --cmd "trivy image albladya-backend:latest"
   ```

## 📚 Additional Resources

- [BUILD_AND_DEPLOY.md](./BUILD_AND_DEPLOY.md) - Quick commands reference
- [azure-deployment-guide.md](./azure-deployment-guide.md) - Detailed Azure guide
- [env.template](./env.template) - Environment variables template
- [Azure Container Instances Docs](https://docs.microsoft.com/azure/container-instances/)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 💬 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Azure Container Instances logs
3. Verify all environment variables are set correctly
4. Ensure database is accessible and migrations are applied

---

**Note**: Replace `albladyaregistry`, `albladya-rg`, and other placeholder values with your actual Azure resource names.

