# Quick Start: Build and Deploy Docker Image

This guide provides quick commands to build and deploy your Docker image.

## Local Testing

### 1. Build the Docker image locally

```bash
docker build -t albladya-backend:latest .
```

### 2. Test locally with Docker Compose (includes PostgreSQL)

```bash
docker-compose up -d
```

Access the application at: http://localhost:4000/graphql

### 3. Test locally with existing database

```bash
docker run -d \
  -p 4000:4000 \
  -e DATABASE_URL="postgres://postgres:Bright@Vision2023@147.93.20.250:5432/albladya" \
  -e NODE_ENV=production \
  -e PORT=4000 \
  --name albladya-backend \
  albladya-backend:latest
```

### 4. View logs

```bash
docker logs -f albladya-backend
```

### 5. Stop and remove container

```bash
docker stop albladya-backend
docker rm albladya-backend
```

## Push to Docker Hub

```bash
# Login
docker login

# Tag image
docker tag albladya-backend:latest yourusername/albladya-backend:latest

# Push
docker push yourusername/albladya-backend:latest
```

## Push to Azure Container Registry

```bash
# Login to Azure
az login

# Create ACR (if not exists)
az acr create --resource-group albladya-rg \
  --name albladyaregistry \
  --sku Basic \
  --admin-enabled true

# Login to ACR
az acr login --name albladyaregistry

# Build and push in one command
az acr build --registry albladyaregistry \
  --image albladya-backend:latest \
  --file Dockerfile .
```

## Run Database Migrations

Before deploying, ensure your database migrations are applied:

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Or run from Docker
docker run --rm \
  -e DATABASE_URL="$DATABASE_URL" \
  albladya-backend:latest \
  npx prisma migrate deploy
```

## Deploy to Azure ACI (Quick)

```bash
# Get ACR credentials
ACR_PASSWORD=$(az acr credential show --name albladyaregistry --query passwords[0].value --output tsv)

# Deploy
az container create \
  --resource-group albladya-rg \
  --name albladya-backend \
  --image albladyaregistry.azurecr.io/albladya-backend:latest \
  --registry-password $ACR_PASSWORD \
  --dns-name-label albladya-backend \
  --ports 4000 \
  --cpu 1 \
  --memory 1.5 \
  --environment-variables NODE_ENV=production PORT=4000 \
  --secure-environment-variables DATABASE_URL="your-database-url"
```

## Important Environment Variables

Make sure to set these when deploying:

- `DATABASE_URL` - PostgreSQL connection string (required)
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment mode (production/development)
- `FRONTEND_URL` - Frontend URL for CORS
- `JWT_SECRET` - Secret for JWT tokens (if using auth)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` - For S3 uploads (if using)

See `env.template` file for complete list.

## Health Check

After deployment, verify the application is running:

```bash
# Get the URL
FQDN=$(az container show \
  --resource-group albladya-rg \
  --name albladya-backend \
  --query ipAddress.fqdn \
  --output tsv)

# Test endpoint
curl http://$FQDN:4000/graphql

# Or open in browser
echo "Visit: http://$FQDN:4000/graphql"
```

## Troubleshooting

### Check container status

```bash
az container show \
  --resource-group albladya-rg \
  --name albladya-backend \
  --query instanceView.state
```

### View logs

```bash
az container logs \
  --resource-group albladya-rg \
  --name albladya-backend \
  --follow
```

### Rebuild and redeploy

```bash
# Build new image
az acr build --registry albladyaregistry \
  --image albladya-backend:latest \
  --file Dockerfile .

# Delete old container
az container delete --resource-group albladya-rg --name albladya-backend --yes

# Deploy new container (use create command above)
```

For detailed deployment instructions, see `azure-deployment-guide.md`.
