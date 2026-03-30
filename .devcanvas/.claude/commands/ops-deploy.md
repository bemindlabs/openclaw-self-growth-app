---
title: "Deploy Application"
tags: [ai, claude, anthropic]
aliases: ["Deploy Application"]
---

# Deploy Application

Deploy the application to various environments.

## Instructions

### 1. Pre-Deployment Checks

```bash
# Run full quality gate
make zero-qa-full

# Build packages
make build

# Build Docker image
make docker-build-prod
```

### 2. Docker Deployment

#### Local/Development
```bash
# Start all services
make docker-up

# View logs
make docker-logs

# Check status
make docker-ps
```

#### Production Build
```bash
# Build production image
docker build -f infra/docker/Dockerfile -t monorepo-api:latest .

# Tag for registry
docker tag monorepo-api:latest ghcr.io/bemindlabs/monorepo-api:latest
docker tag monorepo-api:latest ghcr.io/bemindlabs/monorepo-api:v$(cat VERSION)

# Push to registry
docker push ghcr.io/bemindlabs/monorepo-api:latest
docker push ghcr.io/bemindlabs/monorepo-api:v$(cat VERSION)
```

### 3. Kubernetes Deployment

#### Development
```bash
# Deploy to dev cluster
kubectl apply -k infra/k8s/overlays/development

# Check status
kubectl get pods -n monorepo-dev
kubectl get svc -n monorepo-dev
```

#### Staging
```bash
# Deploy to staging
kubectl apply -k infra/k8s/overlays/staging

# Check status
kubectl get pods -n monorepo-staging
```

#### Production
```bash
# Deploy to production
kubectl apply -k infra/k8s/overlays/production

# Check rollout status
kubectl rollout status deployment/prod-monorepo-api -n monorepo-prod

# Check pods
kubectl get pods -n monorepo-prod
```

### 4. Rollback (if needed)

```bash
# View rollout history
kubectl rollout history deployment/prod-monorepo-api -n monorepo-prod

# Rollback to previous
kubectl rollout undo deployment/prod-monorepo-api -n monorepo-prod

# Rollback to specific revision
kubectl rollout undo deployment/prod-monorepo-api -n monorepo-prod --to-revision=2
```

### 5. Environment-Specific Configurations

| Environment | Replicas | Resources | Log Level |
|-------------|----------|-----------|-----------|
| Development | 1 | 256Mi/512Mi | DEBUG |
| Staging | 2 | 256Mi/512Mi | INFO |
| Production | 3 | 512Mi/1Gi | WARNING |

### 6. Deployment Checklist

#### Pre-Deploy
- [ ] All tests pass
- [ ] Quality gates pass
- [ ] Docker image builds
- [ ] Environment variables configured
- [ ] Secrets/credentials set up

#### Deploy
- [ ] Deploy to target environment
- [ ] Verify pods are running
- [ ] Check logs for errors
- [ ] Run health checks

#### Post-Deploy
- [ ] Verify application responds
- [ ] Check monitoring/alerts
- [ ] Validate key functionality
- [ ] Update deployment status

### 7. Quick Commands

```bash
# Kubernetes
make k8s-dev         # Deploy to dev
make k8s-staging     # Deploy to staging
make k8s-prod        # Deploy to production
make k8s-status      # Check status

# Docker
make docker-up       # Start local
make docker-down     # Stop local
make docker-build    # Build images
```
