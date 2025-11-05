# 🐳 Docker & Azure Deployment - Albladya Backend

> Complete Docker containerization and Azure Container Instances deployment setup

## 📋 What's Included

This repository now includes everything needed to containerize your Node.js GraphQL backend and deploy it to Azure Container Instances (ACI).

### 🎯 Created Files

#### Docker Configuration
- ✅ **Dockerfile** - Multi-stage production-ready Docker image
- ✅ **.dockerignore** - Optimized build context
- ✅ **docker-compose.yml** - Local development environment with PostgreSQL

#### Documentation
- ✅ **DOCKER_README.md** - Comprehensive Docker guide (START HERE)
- ✅ **BUILD_AND_DEPLOY.md** - Quick command reference
- ✅ **azure-deployment-guide.md** - Detailed Azure deployment guide
- ✅ **DEPLOYMENT_SUMMARY.md** - Overview of all deployment files
- ✅ **QUICK_REFERENCE.md** - Essential commands cheat sheet
- ✅ **README_DOCKER.md** - This file

#### Helper Scripts
- ✅ **build-and-push.sh** / **.bat** - Automated build and push to ACR
- ✅ **deploy-to-aci.sh** / **.bat** - Automated deployment to ACI

#### Configuration
- ✅ **env.template** - Environment variables template
- ✅ **package.json** - Updated with Docker and Prisma scripts

## 🚀 Getting Started

### Step 1: Choose Your Path

**Path A: Test Locally First** (Recommended)
```bash
# Start with Docker Compose
docker-compose up -d

# Access GraphQL Playground
open http://localhost:4000/graphql
```

**Path B: Deploy Directly to Azure**
```bash
# Follow azure-deployment-guide.md
# or use the helper scripts (see below)
```

### Step 2: Read the Documentation

Start with these files in order:

1. **DOCKER_README.md** - Complete setup and deployment guide
2. **QUICK_REFERENCE.md** - Essential commands
3. **BUILD_AND_DEPLOY.md** - Quick deployment commands
4. **azure-deployment-guide.md** - Comprehensive Azure guide

## ⚡ Quick Commands

### Local Testing
```bash
# Start everything (backend + PostgreSQL)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

### Build Docker Image
```bash
npm run docker:build
```

### Deploy to Azure (Automated)

**Linux/Mac:**
```bash
# Make scripts executable (first time only)
chmod +x build-and-push.sh deploy-to-aci.sh

# Build and push to Azure Container Registry
./build-and-push.sh albladyaregistry

# Deploy to Azure Container Instances
export DATABASE_URL="your-database-url"
./deploy-to-aci.sh albladyaregistry
```

**Windows:**
```cmd
REM Build and push to Azure Container Registry
build-and-push.bat albladyaregistry

REM Deploy to Azure Container Instances
set DATABASE_URL=your-database-url
deploy-to-aci.bat albladyaregistry
```

## 🗂️ File Guide

| Need to... | Read this file |
|------------|---------------|
| Understand everything | `DOCKER_README.md` |
| Get quick commands | `QUICK_REFERENCE.md` |
| Deploy to Azure quickly | `BUILD_AND_DEPLOY.md` |
| Detailed Azure setup | `azure-deployment-guide.md` |
| See what was created | `DEPLOYMENT_SUMMARY.md` |
| Configure environment | `env.template` |

## 📦 Docker Image Details

- **Base Image:** Node.js 18 Alpine
- **Size:** ~200-300 MB
- **Architecture:** Multi-stage build
- **Security:** Non-root user
- **Health Check:** Included
- **Optimizations:** Layer caching, production dependencies only

## ☁️ Azure Resources Needed

1. **Azure Container Registry (ACR)** - Store your Docker images
2. **Azure Container Instances (ACI)** - Run your containers
3. **Azure Database for PostgreSQL** - Your database (or use external)

**Estimated Cost:** ~$70/month (Basic tier)

## 🔧 Configuration

### Required Environment Variables

```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname"
PORT=4000
NODE_ENV=production
```

### Optional but Recommended

```bash
FRONTEND_URL="https://your-frontend.com"
JWT_SECRET="your-secret-key"
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
```

See `env.template` for complete list with examples.

## 🎓 Deployment Workflow

```
┌─────────────────┐
│  1. Code Changes │
└────────┬─────────┘
         ▼
┌─────────────────┐
│  2. Test Locally │  ← docker-compose up
└────────┬─────────┘
         ▼
┌─────────────────┐
│ 3. Run Migrations│  ← npm run prisma:migrate
└────────┬─────────┘
         ▼
┌─────────────────┐
│ 4. Build & Push  │  ← ./build-and-push.sh
└────────┬─────────┘
         ▼
┌─────────────────┐
│ 5. Deploy to ACI │  ← ./deploy-to-aci.sh
└────────┬─────────┘
         ▼
┌─────────────────┐
│ 6. Verify & Test │  ← Check logs and endpoint
└─────────────────┘
```

## 🛠️ NPM Scripts Added

```json
{
  "start": "node server.js",              // Production start
  "prisma:generate": "prisma generate",   // Generate Prisma client
  "prisma:migrate": "prisma migrate deploy", // Run migrations
  "prisma:studio": "prisma studio",       // Open Prisma Studio
  "docker:build": "docker build ...",     // Build Docker image
  "docker:run": "docker run ..."          // Run Docker container
}
```

## 🔍 Testing Your Deployment

After deployment, verify everything works:

```bash
# Get your application URL
az container show \
  --resource-group albladya-rg \
  --name albladya-backend \
  --query ipAddress.fqdn

# Test the GraphQL endpoint
curl http://[YOUR-FQDN]:4000/graphql

# Or open in browser
http://[YOUR-FQDN]:4000/graphql
```

## 📊 Architecture

```
┌───────────────────────────────────────────┐
│           Azure Container Registry         │
│        (Store Docker Images)              │
└───────────────┬───────────────────────────┘
                │
                │ Pull Image
                ▼
┌───────────────────────────────────────────┐
│      Azure Container Instances            │
│  ┌─────────────────────────────────┐     │
│  │   Albladya Backend Container    │     │
│  │                                 │     │
│  │  - Node.js 18                  │     │
│  │  - Apollo GraphQL Server       │     │
│  │  - Express                     │     │
│  │  - Prisma ORM                  │     │
│  └────────────┬────────────────────┘     │
└───────────────┼───────────────────────────┘
                │
                │ Connect
                ▼
┌───────────────────────────────────────────┐
│    Azure Database for PostgreSQL         │
│         (or External DB)                  │
└───────────────────────────────────────────┘
```

## 🎯 Next Steps

### For First-Time Users

1. ✅ Read `DOCKER_README.md`
2. ✅ Set up environment variables (use `env.template`)
3. ✅ Test locally with `docker-compose up`
4. ✅ Install Azure CLI
5. ✅ Follow `azure-deployment-guide.md`

### For Experienced Users

1. ✅ Review `QUICK_REFERENCE.md`
2. ✅ Use helper scripts to build and deploy
3. ✅ Monitor with Azure Portal or CLI

## 💡 Tips & Best Practices

- **Test locally first** - Always use `docker-compose up` before deploying
- **Run migrations** - Execute `npm run prisma:migrate` before deployment
- **Secure secrets** - Use Azure Key Vault for production secrets
- **Monitor costs** - Check Azure costs regularly
- **Enable logging** - Set up Azure Log Analytics for production
- **Use CI/CD** - Automate deployments with GitHub Actions
- **Regular updates** - Rebuild images to get security updates

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Container won't start | Check logs: `az container logs ...` |
| Database errors | Verify DATABASE_URL and run migrations |
| Port conflicts | Stop other containers: `docker-compose down` |
| Build fails | Clean cache: `docker builder prune -a` |
| ACR login issues | Run: `az acr login --name [registry]` |

See `DOCKER_README.md` for detailed troubleshooting.

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com)
- [Azure Container Instances](https://docs.microsoft.com/azure/container-instances/)
- [Azure CLI Reference](https://docs.microsoft.com/cli/azure/)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment/deployment)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Docker image builds successfully
- [ ] Application runs locally with Docker Compose
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Azure resources created (ACR, ACI, PostgreSQL)
- [ ] Image pushed to Azure Container Registry
- [ ] Container deployed to Azure Container Instances
- [ ] Health check passes
- [ ] GraphQL Playground accessible
- [ ] All GraphQL queries work
- [ ] CORS configured correctly
- [ ] Secrets stored securely
- [ ] Monitoring/logging configured

## 🎉 Success!

Your backend is now:
- ✅ Fully containerized with Docker
- ✅ Ready to deploy to Azure Container Instances
- ✅ Configured for production use
- ✅ Documented and maintainable
- ✅ Scalable and secure

## 📞 Support

For questions or issues:
1. Check the troubleshooting sections in the documentation
2. Review Azure Container Instances logs
3. Verify environment variables and database connection
4. Consult the official documentation links above

---

**Version:** 1.0  
**Created:** November 4, 2025  
**Platform:** Azure Container Instances  
**Application:** Albladya Backend  
**Stack:** Node.js + Express + Apollo GraphQL + Prisma + PostgreSQL

Happy Deploying! 🚀

