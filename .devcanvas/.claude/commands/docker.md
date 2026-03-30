---
description: Docker — build, run, compose, images, volumes, networks, debug, and clean
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
argument-hint: [build|run|compose|images|volumes|networks|debug|clean] [action]
---

# Docker

Unified command for Docker builds, containers, Compose, images, volumes, networks, debugging, and cleanup.

## Instructions

### Route by Subcommand

Parse `$ARGUMENTS` to determine the area and action:

- `build [action]` — Build images (single, multi-stage, buildx)
- `run [action]` — Run and manage containers
- `compose [action]` — Docker Compose operations
- `images [action]` — Image management
- `volumes [action]` — Volume management
- `networks [action]` — Network management
- `debug [action]` — Debugging and troubleshooting
- `clean [action]` — Cleanup and pruning
- No arguments — Show Docker overview

---

## Overview (default, no arguments)

Show Docker environment status:

```bash
# Docker version
docker --version
docker compose version

# Running containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"

# Images
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | head -15

# Disk usage
docker system df
```

Display format:
```
Docker Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Docker:      v27.x.x
Compose:     v2.x.x
Runtime:     containerd

Containers:  3 running, 1 stopped
Images:      12 (4.2 GB)
Volumes:     5 (1.8 GB)
Networks:    4

Running:
  NAME          STATUS       PORTS              IMAGE
  app           Up 2h        0.0.0.0:3000->3000 my-app:latest
  postgres      Up 2h        0.0.0.0:5432->5432 postgres:16
  redis         Up 2h        0.0.0.0:6379->6379 redis:7-alpine

Quick Actions:
  /docker compose up    Start services
  /docker build         Build image
  /docker debug         Troubleshoot
  /docker clean         Free disk space
```

---

## Build — Build Images

### `build` — Build image from Dockerfile

```bash
docker build -t <name>:<tag> .
# e.g.: docker build -t my-app:latest .
```

### `build --no-cache` — Build without cache

```bash
docker build --no-cache -t <name>:<tag> .
```

### `build multi` — Multi-stage build

```bash
# Target specific stage
docker build --target <stage> -t <name>:<tag> .
# e.g.: docker build --target production -t my-app:prod .
```

### `build buildx` — Multi-platform build

```bash
# Create builder
docker buildx create --name multiarch --use

# Build for multiple platforms
docker buildx build --platform linux/amd64,linux/arm64 -t <name>:<tag> --push .
```

### `build review` — Review Dockerfile

Read Dockerfile and check:

**Best Practices:**
- [ ] Specific base image version (not `latest`)
- [ ] Multi-stage build used
- [ ] `.dockerignore` present
- [ ] Non-root user
- [ ] Minimal layers (combined RUN)
- [ ] COPY before RUN for cache efficiency
- [ ] No secrets in build args
- [ ] HEALTHCHECK defined
- [ ] Appropriate EXPOSE ports

**Layer Optimization:**
```dockerfile
# Good — dependencies cached separately
COPY package.json package-lock.json ./
RUN npm ci --production
COPY . .

# Bad — cache busted on every code change
COPY . .
RUN npm ci --production
```

### Build Options

| Option | Description |
|--------|-------------|
| `-t name:tag` | Tag the image |
| `-f Dockerfile.prod` | Specify Dockerfile |
| `--target stage` | Build specific stage |
| `--no-cache` | Disable cache |
| `--build-arg KEY=VAL` | Build argument |
| `--platform linux/amd64` | Target platform |
| `--progress plain` | Verbose output |
| `--squash` | Squash layers |

### Dockerfile Templates

**Node.js (multi-stage):**
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s CMD wget -q --spider http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
```

**Python (multi-stage):**
```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
RUN pip install uv
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

FROM python:3.12-slim AS runner
WORKDIR /app
RUN adduser --system --no-create-home appuser
COPY --from=builder /app/.venv ./.venv
COPY . .
USER appuser
ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8000
HEALTHCHECK --interval=30s CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Go:**
```dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./cmd/server

FROM scratch
COPY --from=builder /app/server /server
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
EXPOSE 8080
ENTRYPOINT ["/server"]
```

---

## Run — Container Management

### `run` — Run a container

```bash
docker run -d --name <name> -p <host>:<container> <image>
# e.g.: docker run -d --name my-app -p 3000:3000 my-app:latest
```

### `run interactive` — Run interactively

```bash
docker run -it --rm <image> /bin/sh
```

### `run ls` or `run ps` — List containers

```bash
# Running containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"

# All containers (including stopped)
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"
```

### `run stop` — Stop container(s)

```bash
docker stop <name>
# Stop all:
docker stop $(docker ps -q)
```

### `run start` — Start stopped container

```bash
docker start <name>
```

### `run restart` — Restart container

```bash
docker restart <name>
```

### `run rm` — Remove container

```bash
docker rm <name>
# Force remove running:
docker rm -f <name>
```

### `run exec` — Execute command in container

```bash
docker exec -it <name> /bin/sh
docker exec <name> <command>
```

### `run logs` — View container logs

```bash
docker logs <name>
docker logs -f <name>           # Follow
docker logs --tail 100 <name>   # Last 100 lines
docker logs --since 1h <name>   # Last hour
```

### `run stats` — Container resource usage

```bash
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
```

### Run Options

| Option | Description |
|--------|-------------|
| `-d` | Detached mode |
| `-it` | Interactive + TTY |
| `--rm` | Remove on exit |
| `--name` | Container name |
| `-p 3000:3000` | Port mapping |
| `-v /host:/container` | Volume mount |
| `-e KEY=VAL` | Environment variable |
| `--env-file .env` | Env file |
| `--network` | Network |
| `--restart unless-stopped` | Restart policy |
| `--memory 512m` | Memory limit |
| `--cpus 1.5` | CPU limit |

---

## Compose — Docker Compose

### `compose up` — Start services

```bash
docker compose up -d
# Specific services:
docker compose up -d app postgres redis
# With build:
docker compose up -d --build
```

### `compose down` — Stop and remove services

```bash
docker compose down
# Remove volumes too:
docker compose down -v
# Remove images too:
docker compose down --rmi all
```

### `compose restart` — Restart services

```bash
docker compose restart
docker compose restart <service>
```

### `compose ps` — List services

```bash
docker compose ps
```

### `compose logs` — View service logs

```bash
docker compose logs
docker compose logs -f <service>
docker compose logs --tail 100 <service>
```

### `compose exec` — Execute in service

```bash
docker compose exec <service> /bin/sh
docker compose exec <service> <command>
```

### `compose build` — Build services

```bash
docker compose build
docker compose build --no-cache
docker compose build <service>
```

### `compose pull` — Pull latest images

```bash
docker compose pull
```

### `compose config` — Validate and view config

```bash
docker compose config
```

### `compose review` — Review docker-compose.yml

Read `docker-compose.yml` / `compose.yaml` and check:
- [ ] Specific image versions (not `latest`)
- [ ] Health checks defined
- [ ] Restart policies set
- [ ] Resource limits configured
- [ ] Networks properly defined
- [ ] Volumes for persistent data
- [ ] Environment variables from `.env`
- [ ] No secrets in plain text
- [ ] Depends_on with conditions
- [ ] Proper service naming

### Compose Template

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/mydb
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "1.0"

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d mydb"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

---

## Images — Image Management

### `images` or `images ls` — List images

```bash
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}"
```

### `images inspect` — Inspect image

```bash
docker inspect <image>
docker history <image>
```

### `images pull` — Pull image

```bash
docker pull <image>:<tag>
```

### `images push` — Push image

```bash
docker push <image>:<tag>
```

### `images tag` — Tag image

```bash
docker tag <source> <target>:<tag>
```

### `images rm` — Remove image

```bash
docker rmi <image>
# Force:
docker rmi -f <image>
```

### `images save` — Export image

```bash
docker save -o <file>.tar <image>
```

### `images load` — Import image

```bash
docker load -i <file>.tar
```

---

## Volumes — Volume Management

### `volumes` or `volumes ls` — List volumes

```bash
docker volume ls --format "table {{.Name}}\t{{.Driver}}\t{{.Mountpoint}}"
```

### `volumes create` — Create volume

```bash
docker volume create <name>
```

### `volumes inspect` — Inspect volume

```bash
docker volume inspect <name>
```

### `volumes rm` — Remove volume

```bash
docker volume rm <name>
```

### `volumes backup` — Backup volume

```bash
docker run --rm -v <volume>:/data -v $(pwd):/backup alpine tar czf /backup/<volume>-backup.tar.gz -C /data .
```

### `volumes restore` — Restore volume

```bash
docker run --rm -v <volume>:/data -v $(pwd):/backup alpine tar xzf /backup/<volume>-backup.tar.gz -C /data
```

---

## Networks — Network Management

### `networks` or `networks ls` — List networks

```bash
docker network ls
```

### `networks create` — Create network

```bash
docker network create <name>
# Bridge with subnet:
docker network create --driver bridge --subnet 172.20.0.0/16 <name>
```

### `networks inspect` — Inspect network

```bash
docker network inspect <name>
```

### `networks connect` — Connect container to network

```bash
docker network connect <network> <container>
```

### `networks disconnect` — Disconnect from network

```bash
docker network disconnect <network> <container>
```

### `networks rm` — Remove network

```bash
docker network rm <name>
```

---

## Debug — Troubleshooting

### `debug` — Run diagnostics

1. **System Info**
   ```bash
   docker info
   docker system df
   ```

2. **Running Containers**
   ```bash
   docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
   ```

3. **Recent Errors**
   ```bash
   docker ps -a --filter "status=exited" --format "table {{.Names}}\t{{.Status}}"
   ```

4. **Resource Usage**
   ```bash
   docker stats --no-stream
   ```

### `debug <container>` — Debug specific container

```bash
# Logs
docker logs --tail 100 <container>

# Inspect
docker inspect <container>

# Resource usage
docker stats --no-stream <container>

# Processes
docker top <container>

# Shell into container
docker exec -it <container> /bin/sh
```

### `debug build` — Debug build issues

```bash
# Build with verbose output
docker build --progress plain -t <name> .

# Build specific stage
docker build --target <stage> -t <name>-debug .

# Check build context size
du -sh . --exclude=node_modules --exclude=.git
cat .dockerignore
```

### `debug network` — Debug networking

```bash
# Inspect network
docker network inspect bridge

# Test connectivity between containers
docker exec <container1> ping <container2>
docker exec <container1> wget -q --spider http://<container2>:<port>

# Check port bindings
docker port <container>
```

### `debug compose` — Debug Compose issues

```bash
# Validate config
docker compose config

# Check service status
docker compose ps

# Check logs for all services
docker compose logs --tail 50

# Check depends_on health
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | `lsof -i :<port>` — stop conflicting process |
| Build cache stale | `docker build --no-cache` |
| Container keeps restarting | `docker logs <name>` — check error |
| Out of disk space | `/docker clean all` |
| Network unreachable | Check network and DNS settings |
| Permission denied | Check user/group in Dockerfile |
| OOM killed | Increase memory limit or optimize app |
| Slow build | Optimize `.dockerignore`, layer caching |
| Can't connect to DB | Check service name in compose network |
| Volume data lost | Use named volumes, not anonymous |

---

## Clean — Cleanup and Pruning

### `clean` — Safe cleanup (unused resources)

```bash
# Remove stopped containers
docker container prune -f

# Remove dangling images
docker image prune -f

# Remove unused networks
docker network prune -f
```

### `clean all` — Aggressive cleanup

```bash
# Remove ALL unused resources
docker system prune -a -f

# Also remove volumes (CAREFUL — data loss!)
docker system prune -a -f --volumes
```

### `clean images` — Clean images only

```bash
# Dangling images
docker image prune -f

# All unused images
docker image prune -a -f
```

### `clean containers` — Clean containers only

```bash
docker container prune -f
```

### `clean volumes` — Clean volumes only

```bash
# WARNING: removes data
docker volume prune -f
```

### `clean builder` — Clean build cache

```bash
docker builder prune -f
# All build cache:
docker builder prune -a -f
```

### Disk Usage Report

```bash
docker system df -v
```

```
Clean Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before:
  Images:      12 (4.2 GB)
  Containers:  5 (120 MB)
  Volumes:     8 (1.8 GB)
  Build Cache: 2.1 GB
  Total:       8.2 GB

Cleaned:
  Images:      -3 (1.1 GB freed)
  Containers:  -2 (80 MB freed)
  Build Cache: -1.5 GB freed
  Total freed: 2.7 GB

After:
  Total:       5.5 GB
```

---

## Arguments

- `$ARGUMENTS` — Subcommand and action. Examples:
  - _(empty)_ — Show Docker overview
  - `build` / `build --no-cache` / `build multi` / `build buildx` / `build review`
  - `run` / `run ls` / `run stop` / `run exec` / `run logs` / `run stats`
  - `compose up` / `compose down` / `compose logs` / `compose ps` / `compose build` / `compose review`
  - `images` / `images ls` / `images pull` / `images push` / `images rm`
  - `volumes` / `volumes ls` / `volumes create` / `volumes backup` / `volumes restore`
  - `networks` / `networks ls` / `networks create` / `networks inspect`
  - `debug` / `debug <container>` / `debug build` / `debug network` / `debug compose`
  - `clean` / `clean all` / `clean images` / `clean volumes` / `clean builder`

## Output

Docker management across builds, containers, Compose, images, volumes, networks, debugging, and cleanup.
