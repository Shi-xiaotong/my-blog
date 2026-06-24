---
title: Docker Compose快速指南
date: 2025-12-15 11:00:00
cover: https://img.233002.xyz/docker-compose.png
tags:
  - Docker
  - Docker Compose
categories:
  - tech
---

# Docker Compose快速指南

## 最小示例

```yaml
version: '3.8'
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
```

## 核心配置

### 镜像与构建

```yaml
services:
  web:
    image: nginx:alpine
  api:
    build:
      context: ./app
      dockerfile: Dockerfile.prod
      args:
        - VERSION=1.0
```

### 端口与环境变量

```yaml
services:
  web:
    ports:
      - "80:80"
      - "443:443"
      - "8080:8000"
  api:
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PASSWORD=${DB_PASSWORD}
```

### 卷挂载

```yaml
services:
  db:
    volumes:
      - db_data:/var/lib/postgresql/data
      - ./config:/app/config
      - ./static:/app/static:ro
volumes:
  db_data:
```

### 服务依赖

```yaml
services:
  web:
    depends_on:
      - db
      - redis
  db:
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
```

### 重启策略

```yaml
services:
  web:
    restart: unless-stopped
```

可选值：`always` / `on-failure:3` / `no`

## 命令速查

> 注：新版Docker（v2+）使用 `docker compose`，旧版使用 `docker-compose`

后台启动服务

```bash
docker-compose up -d
```

重新构建并启动

```bash
docker-compose up --build
```

停止并删除服务

```bash
docker-compose down
```

同时删除卷

```bash
docker-compose down -v
```

重启服务

```bash
docker-compose restart
```

查看服务状态

```bash
docker-compose ps
```

实时查看日志

```bash
docker-compose logs -f
```

查看指定服务日志

```bash
docker-compose logs -f web
```

查看最近日志

```bash
docker-compose logs --tail 100
```

进入容器

```bash
docker-compose exec web sh
```

非交互执行命令

```bash
docker-compose exec -T web cat config.js
```

运行多个实例

```bash
docker-compose up -d --scale web=3
```

## 实战模板

### Node.js + MongoDB

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://db:27017/myapp
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      db:
        condition: service_healthy
    command: npm run dev
  db:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - app
volumes:
  mongo_data:
```

### 微服务基础架构

```yaml
version: '3.8'
services:
  gateway:
    build: ./gateway
    ports:
      - "8080:8080"
  user-service:
    build: ./services/user
    depends_on:
      postgres:
        condition: service_healthy
  order-service:
    build: ./services/order
    depends_on:
      postgres:
        condition: service_healthy
  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
  redis:
    image: redis:7-alpine
volumes:
  postgres_data:
```

## 多环境配置

### 使用override（自动应用）

基础配置

```yaml
# docker-compose.yml
services:
  web:
    image: myapp:v1
    ports:
      - "80:80"
```

开发覆写（自动应用）

```yaml
# docker-compose.override.yml
services:
  web:
    volumes:
      - ./src:/app/src
    command: npm run dev
```

生产环境

```yaml
# docker-compose.prod.yml
services:
  web:
    image: myapp:prod
    restart: always
```

### 环境变量

.env文件

```bash
# .env
COMPOSE_PROJECT_NAME=myapp
DB_PASSWORD=secret123
```

启动

```bash
docker-compose up -d
```

## 常用技巧

命令别名

```bash
alias dc='docker-compose'
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
```

重建服务

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

清理资源

```bash
docker-compose down -v --remove-orphans
docker system prune -f
```
