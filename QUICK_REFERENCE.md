# 🚀 Quick Reference Card

## Essential Commands

### 🏠 Local Development

```bash
# Start with Docker Compose (includes PostgreSQL)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Access GraphQL Playground
http://localhost:4000/graphql
```

### 🐳 Docker Commands

```bash
# Build image
npm run docker:build
# or
docker build -t albladya-backend:latest .

# Run container
docker run -d -p 4000:4000 --env-file .env albladya-backend:latest

# View logs
docker logs -f albladya-backend

# Stop container
docker stop albladya-backend
```

### ☁️ Azure - Build & Push

**Linux/Mac:**
```bash
./build-and-push.sh [registry-name] [image-name] [tag]
# Example:
./build-and-push.sh albladyaregistry albladya-backend latest
```

**Windows:**
```cmd
build-and-push.bat [registry-name] [image-name] [tag]
REM Example:
build-and-push.bat albladyaregistry albladya-backend latest
```

**Manual:**
```bash
az acr login --name albladyaregistry
az acr build --registry albladyaregistry \
  --image albladya-backend:latest \
  --file Dockerfile .
```

### ☁️ Azure - Deploy to ACI

**Linux/Mac:**
```bash
export DATABASE_URL="postgresql://user:pass@host:5432/db"
./deploy-to-aci.sh [registry-name] [image-name] [tag]
```

**Windows:**
```cmd
set DATABASE_URL=postgresql://user:pass@host:5432/db
deploy-to-aci.bat [registry-name] [image-name] [tag]
```

**Manual:**
```bash
az container create \
  --resource-group albladya-rg \
  --name albladya-backend \
  --image albladyaregistry.azurecr.io/albladya-backend:latest \
  --dns-name-label albladya-backend-unique \
  --ports 4000 \
  --cpu 1 \
  --memory 1.5 \
  --secure-environment-variables DATABASE_URL="your-db-url"
```

### 📊 Azure - Monitoring

```bash
# Get application URL
az container show \
  --resource-group albladya-rg \
  --name albladya-backend \
  --query ipAddress.fqdn

# View logs
az container logs \
  --resource-group albladya-rg \
  --name albladya-backend \
  --follow

# Check status
az container show \
  --resource-group albladya-rg \
  --name albladya-backend \
  --query instanceView.state

# Delete container
az container delete \
  --resource-group albladya-rg \
  --name albladya-backend \
  --yes
```

### 🗄️ Database Migrations

```bash
# Run migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# Open Prisma Studio
npm run prisma:studio
```

### 🔐 Azure Setup (One-Time)

```bash
# Login
az login

# Create resource group
az group create --name albladya-rg --location eastus

# Create Container Registry
az acr create --resource-group albladya-rg \
  --name albladyaregistry \
  --sku Basic \
  --admin-enabled true

# Create PostgreSQL (optional)
az postgres flexible-server create \
  --resource-group albladya-rg \
  --name albladya-db \
  --location eastus \
  --admin-user adminuser \
  --admin-password YourSecurePassword123! \
  --sku-name Standard_B1ms
```

## 🎯 Deployment Workflow

```
1. Make code changes
2. Test locally: docker-compose up
3. Run migrations: npm run prisma:migrate
4. Build & push: ./build-and-push.sh
5. Deploy: ./deploy-to-aci.sh
6. Verify: Check logs and test endpoint
```

## 📝 Environment Variables Template

```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname"
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.com
JWT_SECRET=your-secret-key
```

## 🔗 Useful URLs

- Azure Portal: https://portal.azure.com
- Azure Pricing Calculator: https://azure.microsoft.com/pricing/calculator/
- Prisma Docs: https://www.prisma.io/docs
- Docker Hub: https://hub.docker.com

## 📱 NPM Scripts

```bash
npm run dev              # Development with nodemon
npm start                # Production start
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
npm run docker:build     # Build Docker image
npm run docker:run       # Run Docker container
```

## 🆘 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Container won't start | Check logs: `az container logs ...` |
| DB connection error | Verify DATABASE_URL and firewall rules |
| Port 4000 in use | Stop other containers: `docker-compose down` |
| ACR login failed | Run: `az acr login --name albladyaregistry` |
| Image not found | Verify registry name and image tag |
| Out of memory | Increase ACI memory: `--memory 2` |

## 📞 Support Resources

| Resource | Link |
|----------|------|
| Docker Docs | https://docs.docker.com |
| Azure ACI Docs | https://aka.ms/aci-docs |
| Azure CLI Docs | https://aka.ms/az-cli |
| Prisma Deployment | https://www.prisma.io/docs/guides/deployment |

## 🎓 Learning Path

1. ✅ Test locally with Docker Compose
2. ✅ Build Docker image
3. ✅ Set up Azure account and CLI
4. ✅ Create Azure resources (RG, ACR, DB)
5. ✅ Push image to ACR
6. ✅ Deploy to ACI
7. ✅ Monitor and maintain

---

**💡 Pro Tips:**
- Always test locally before deploying
- Keep DATABASE_URL secure
- Monitor Azure costs regularly
- Enable Application Insights for production
- Use Azure Key Vault for secrets
- Set up CI/CD with GitHub Actions

**🔖 Bookmark This Page** - You'll need these commands often!

