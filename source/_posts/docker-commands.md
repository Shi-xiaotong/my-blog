---
title: Docker常用命令总结
date: 2025-12-10 10:00:00
cover:
tags:
  - Docker
  - 运维
categories:
  - 技术
toc: true
---

# Docker常用命令总结

## 镜像管理

搜索镜像

```bash
docker search nginx
```

拉取镜像

```bash
docker pull nginx:1.25
```

拉取精简镜像

```bash
docker pull redis:alpine
```

查看本地镜像

```bash
docker images
```

格式化显示镜像

```bash
docker images --format "{{.Repository}}:{{.Tag}} {{.Size}}"
```

删除镜像

```bash
docker rmi nginx
```

清理悬空镜像

```bash
docker image prune
```

清理所有未使用镜像

```bash
docker image prune -a
```

构建镜像

```bash
docker build -t myapp:v1.0 .
```

无缓存构建

```bash
docker build --no-cache -t myapp:v2.0 .
```

## 容器管理

前台运行容器

```bash
docker run nginx
```

后台运行容器

```bash
docker run -d nginx
```

交互模式运行

```bash
docker run -it ubuntu bash
```

停止后自动删除

```bash
docker run --rm nginx
```

常用选项运行

```bash
docker run -d --name myapp -p 8080:80 -v /data:/data nginx
```

查看运行中的容器

```bash
docker ps
```

查看所有容器

```bash
docker ps -a
```

实时查看日志

```bash
docker logs -f myapp
```

查看最近100行日志

```bash
docker logs --tail 100 myapp
```

启动容器

```bash
docker start myapp
```

停止容器

```bash
docker stop myapp
```

重启容器

```bash
docker restart myapp
```

删除容器

```bash
docker rm myapp
```

强制删除容器

```bash
docker rm -f myapp
```

进入容器

```bash
docker exec -it myapp bash
```

执行单条命令

```bash
docker exec myapp ls /app
```

## 数据管理

创建卷

```bash
docker volume create mydata
```

使用卷运行容器

```bash
docker run -v mydata:/data nginx
```

挂载当前目录

```bash
docker run -v $(pwd):/app nginx
```

只读挂载

```bash
docker run -v /host:/container:ro nginx
```

## 网络管理

查看网络

```bash
docker network ls
```

创建网络

```bash
docker network create mynet
```

创建自定义网段

```bash
docker network create --subnet 172.20.0.0/16 mynet
```

容器加入网络

```bash
docker network connect mynet mycontainer
```

## Docker Compose

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

重启服务

```bash
docker-compose restart
```

运行多个实例

```bash
docker-compose up -d --scale web=3
```

进入容器执行命令

```bash
docker-compose exec web sh
```

非交互执行命令

```bash
docker-compose exec -T web cat config.js
```

## 清理资源

清理未使用资源

```bash
docker system prune
```

清理所有（包括镜像）

```bash
docker system prune -a
```

查看磁盘使用

```bash
docker system df
```

批量删除所有容器

```bash
docker stop $(docker ps -q) && docker rm $(docker ps -aq)
```

## 快速启动常用服务

启动Nginx

```bash
docker run -d --name nginx -p 80:80 nginx:alpine
```

启动MySQL

```bash
docker run -d --name mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=myapp \
  -v mysql_data:/var/lib/mysql \
  -p 3306:3306 \
  mysql:8
```

启动Redis

```bash
docker run -d --name redis \
  -v redis_data:/data \
  -p 6379:6379 \
  redis:alpine
```

启动PostgreSQL

```bash
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=secret \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15-alpine
```

## 常见问题

查看容器日志

```bash
docker logs mycontainer
```

查看容器详情

```bash
docker inspect mycontainer
```

查看端口占用

```bash
netstat -tulnp | grep 8080
```

清理磁盘

```bash
docker system prune -a
```

清理未使用卷

```bash
docker volume prune
```
