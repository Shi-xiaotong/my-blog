---
title: Linux常用命令总结
date: 2025-12-05 14:30:00
cover: https://img.233002.xyz/linux-commands.png
tags:
  - Linux
  - 运维
categories:
  - 技术
toc: true
---

# Linux常用命令总结

## 文件操作

创建空文件

```bash
touch app.log
```

复制文件

```bash
cp config.example.json config.json
```

复制整个目录

```bash
cp -r /data/backup /data/backup_new
```

移动/重命名文件

```bash
mv old_name.txt new_name.txt
```

删除文件

```bash
rm app.log
```

强制删除文件

```bash
rm -f temp.txt
```

删除目录及内容

```bash
rm -rf old_project/
```

> 注意：`rm -rf` 加上根目录时很危险，操作前确认好路径。

创建软链接

```bash
ln -s /path/to/target link_name
```

## 目录操作

进入目录

```bash
cd /var/log
```

返回上级目录

```bash
cd ..
```

返回主目录

```bash
cd ~
```

返回上一个目录

```bash
cd -
```

创建目录

```bash
mkdir project
```

递归创建目录

```bash
mkdir -p /path/to/nested/dir
```

列出当前目录内容

```bash
ls
```

显示详细信息

```bash
ls -l
```

显示隐藏文件

```bash
ls -la
```

人性化显示大小

```bash
ls -lh
```

## 文件查看

查看整个文件

```bash
cat app.log
```

显示前20行

```bash
head -n 20 app.log
```

显示后50行

```bash
tail -n 50 app.log
```

实时追踪日志

```bash
tail -f app.log
```

搜索关键词

```bash
grep "ERROR" app.log
```

搜索并显示行号，忽略大小写

```bash
grep -n -i "error" app.log
```

递归搜索

```bash
grep -rn "password" ./config/
```

分页查看大文件

```bash
less app.log
```

统计行数

```bash
wc -l app.log
```

## 文件搜索

按名称查找

```bash
find . -name "*.log"
```

查找目录

```bash
find . -type d -name "node_modules"
```

按大小查找

```bash
find . -size +100M
```

按修改时间查找

```bash
find . -mtime -7
```

快速搜索（需updatedb）

```bash
locate nginx.conf
```

查找命令位置

```bash
which python
```

## 权限管理

修改权限

```bash
chmod 755 script.sh
```

添加执行权限

```bash
chmod +x start.sh
```

修改所有者

```bash
chown user:group app.py
```

| 数值  | 权限        |
|-----|-----------|
| 777 | rwxrwxrwx |
| 755 | rwxr-xr-x |
| 644 | rw-r--r-- |

## 用户和用户组

查看当前用户

```bash
whoami
```

切换用户

```bash
su - newuser
```

以管理员执行

```bash
sudo apt update
```

添加用户

```bash
useradd -m newuser
```

添加到用户组

```bash
usermod -aG docker username
```

## 进程管理

查看所有进程

```bash
ps aux
```

查找特定进程

```bash
ps aux | grep nginx
```

动态查看进程

```bash
top
```

更友好的进程监控

```bash
htop
```

终止进程

```bash
kill 1234
```

强制杀死进程

```bash
kill -9 1234
```

按名称终止进程

```bash
pkill nginx
```

后台运行

```bash
nohup ./script.sh &
```

## 网络命令

测试连通性

```bash
ping google.com
```

发送HTTP请求

```bash
curl https://api.example.com
```

远程连接

```bash
ssh user@server.com
```

远程复制文件

```bash
scp file.txt user@server:/path/
```

查看端口占用

```bash
netstat -tulnp
```

查看端口占用（新版）

```bash
ss -tulnp
```

查看指定端口占用

```bash
lsof -i:8080
```

## 系统管理

重启系统

```bash
sudo reboot
```

关机

```bash
sudo shutdown -h now
```

更新软件包

```bash
sudo apt update && sudo apt upgrade
```

安装软件（Ubuntu）

```bash
sudo apt install <package>
```

安装软件（CentOS）

```bash
sudo yum install <package>
```

查看磁盘使用

```bash
df -h
```

查看内存使用

```bash
free -h
```

查看系统负载

```bash
uptime
```

## 防火墙

查看防火墙状态（Ubuntu）

```bash
sudo ufw status
```

开放端口（Ubuntu）

```bash
sudo ufw allow 80/tcp
```

拒绝端口（Ubuntu）

```bash
sudo ufw deny 3306/tcp
```

启用防火墙（Ubuntu）

```bash
sudo ufw enable
```

查看所有规则（CentOS）

```bash
firewall-cmd --list-all
```

开放端口（CentOS）

```bash
firewall-cmd --permanent --add-port=8080/tcp
```

重载防火墙配置（CentOS）

```bash
firewall-cmd --reload
```

## 压缩解压

tar压缩

```bash
tar -czvf archive.tar.gz dir/
```

tar解压

```bash
tar -xzvf archive.tar.gz
```

zip压缩

```bash
zip -r archive.zip dir/
```

zip解压

```bash
unzip archive.zip
```

## 管道和重定向

管道组合命令

```bash
cat app.log | grep ERROR | tail -20
```

覆盖写入文件

```bash
echo "hello" > file.txt
```

追加写入文件

```bash
echo "world" >> file.txt
```

## 快捷键

| 快捷键 | 作用 |
|-------|------|
| `Ctrl + C` | 终止命令 |
| `Ctrl + Z` | 暂停命令 |
| `Ctrl + L` | 清屏 |
| `Ctrl + R` | 搜索历史 |
| `Tab` | 自动补全 |
| `!!` | 执行上一条 |

## 常见场景

### 端口被占用

查看端口占用

```bash
netstat -tulnp | grep 8080
```

查看端口占用（lsof）

```bash
lsof -i:8080
```

杀死占用进程

```bash
kill -9 <PID>
```

### 服务管理

启动服务

```bash
sudo systemctl start nginx
```

停止服务

```bash
sudo systemctl stop nginx
```

重启服务

```bash
sudo systemctl restart nginx
```

查看服务状态

```bash
sudo systemctl status nginx
```

设置开机启动

```bash
sudo systemctl enable nginx
```

### 日志分析

统计错误数量

```bash
grep -c "ERROR" app.log
```

实时追踪错误

```bash
tail -f app.log | grep ERROR
```

统计访问量Top10

```bash
awk '{print $1}' access.log | sort | uniq -c | sort -nr | head -10
```

### 数据库连接

连接MySQL

```bash
mysql -u root -p
```

连接Redis

```bash
redis-cli
```

连接PostgreSQL

```bash
psql -U user -d database
```

### 文件传输

上传到远程

```bash
scp file.txt user@server:/path/
```

从远程下载

```bash
scp user@server:/path/file.txt ./
```

同步目录

```bash
rsync -avz dir/ user@server:/path/
```
