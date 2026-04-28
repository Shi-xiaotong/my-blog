---
title: Linux常用命令总结
date: 2026-04-28 14:30:00
cover:
tags:
  - Linux
  - 运维
categories:
  - 技术
toc: true
---

# 常用Linux命令总结

作为后端开发者，Linux服务器是日常工作中打交道最多的环境。熟练掌握常用命令能提升工作效率，在排查问题时更加得心应手。

## 文件操作基础

### 创建、复制、移动、删除

```bash
# 创建空文件
touch app.log

# 复制文件
cp config.example.json config.json

# 复制整个目录
cp -r /data/backup /data/backup_new

# 移动/重命名
mv old_name.txt new_name.txt

# 删除文件
rm app.log

# 强制删除
rm -f temp.txt

# 删除目录及其内容
rm -rf old_project/
```

> 注意：`rm -rf` 加上根目录时很危险，操作前确认好路径。

### 软链接和硬链接

```bash
# 创建软链接
ln -s /usr/local/python3.9/bin/python python

# 创建硬链接
ln file.txt file_link.txt
```

## 目录操作

```bash
pwd                          # 查看当前目录
cd /var/log                   # 进入目录
cd ..                         # 返回上级目录
cd ~                          # 返回用户主目录
cd -                          # 回到上一个目录
mkdir project                  # 创建目录
mkdir -p /path/to/nested/dir   # 递归创建
ls                            # 列出内容
ls -l                         # 显示详细信息
ls -la                        # 显示隐藏文件
ls -lh                        # 人性化显示大小
ls -lt                        # 按修改时间排序
```

## 文件内容查看

```bash
cat app.log                    # 查看整个文件
head -n 20 app.log             # 显示前20行
tail app.log                   # 显示最后10行
tail -n 50 app.log             # 显示最后50行
tail -f app.log                 # 实时追踪日志

# 搜索关键词
grep "ERROR" app.log
grep -n -i "error" app.log     # 显示行号，忽略大小写
grep -rn "password" ./config/  # 递归搜索

# 分页查看大文件
less app.log
wc -l app.log                  # 统计行数
```

## 文件搜索

```bash
find / -name "nginx.conf"      # 全局查找
find . -name "*.log"           # 当前目录查找
find . -type d -name "node_modules"   # 查找目录
find . -size +100M             # 按大小查找
find . -mtime -7               # 按修改时间查找

locate nginx.conf              # 快速搜索（需updatedb）
which python                   # 查找命令位置
```

## 权限管理

```bash
ls -l app.py                   # 查看权限

chmod 755 script.sh            # 修改权限
chmod 644 app.py
chmod +x start.sh
chmod -R 755 dir/

chown user app.py              # 修改所有者
chown user:group app.py
chown -R user:group dir/
```

| 数值  | 权限        |
|-----|-----------|
| 777 | rwxrwxrwx |
| 755 | rwxr-xr-x |
| 644 | rw-r--r-- |
| 600 | rw------- |

## 用户和用户组

```bash
whoami                         # 查看当前用户
who                            # 查看登录用户
su - newuser                   # 切换用户
sudo apt update                # 以管理员执行
useradd -m newuser             # 添加用户
passwd newuser                 # 设置密码
usermod -aG docker username     # 添加到用户组
```

## 进程管理

```bash
ps aux                         # 查看所有进程
ps aux | grep nginx            # 查找特定进程
top / htop                     # 动态查看
kill 1234                      # 终止进程
kill -9 1234                   # 强制杀死
pkill nginx                    # 按名称终止
nohup ./script.sh &            # 后台运行
```

## 网络命令

```bash
ping google.com                # 测试连通性
ifconfig / ip addr            # 查看网络接口
netstat -tulnp / ss -tulnp     # 查看端口占用
curl https://api.example.com  # 发送请求
wget https://example.com/file.zip
ssh user@server.com            # 远程连接
scp file.txt user@server:/path/   # 远程复制
```

## 系统管理

### 日期时间

```bash
date                           # 查看当前时间
date -s "2026-04-28 10:00:00"  # 修改系统时间
sudo ntpdate -u pool.ntp.org  # 同步时间
sudo hwclock -w                # 同步硬件时间
```

### 重启关机

```bash
sudo reboot                    # 重启
sudo shutdown -h now           # 关机
```

### 安装更新

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install <package>

# CentOS/RHEL
sudo yum update
sudo yum install <package>

# Fedora
sudo dnf update
sudo dnf install <package>
```

## 防火墙

### ufw（Ubuntu）

```bash
sudo ufw status                # 检查状态
sudo ufw allow 80/tcp          # 开放端口
sudo ufw deny 3306/tcp         # 拒绝端口
sudo ufw delete allow 80/tcp  # 删除规则
sudo ufw enable                # 启用防火墙
sudo ufw disable               # 禁用防火墙
```

### firewalld（CentOS/RHEL）

```bash
systemctl status firewalld.service     # 查看防火墙状态
systemctl list-unit-files|grep firewalld.service

firewall-cmd --list-all                # 查看所有规则
firewall-cmd --query-port=8080/tcp     # 查询端口是否开放
firewall-cmd --permanent --add-port=8080/tcp    # 开放端口
firewall-cmd --permanent --remove-port=8080/tcp  # 移除端口
firewall-cmd --reload                  # 重启防火墙

sudo systemctl stop firewalld          # 关闭防火墙
sudo systemctl start firewalld         # 开启防火墙
sudo systemctl restart firewalld       # 重启防火墙
```

## 压缩和解压

```bash
# tar
tar -cvf archive.tar dir/          # 打包
tar -xvf archive.tar               # 解包
tar -czvf archive.tar.gz dir/      # gzip压缩
tar -xzvf archive.tar.gz           # gzip解压
tar -cjvf archive.tar.bz2 dir/     # bzip2压缩
tar -xjvf archive.tar.bz2          # bzip2解压

# zip
zip -r archive.zip dir/
unzip archive.zip
unzip archive.zip -d /target/dir/
```

## 磁盘管理

```bash
df -h                           # 查看磁盘使用
df -h /home                     # 查看指定目录
du -sh dir/                     # 目录总大小
du -h --max-depth=1             # 一级子目录大小
mount /dev/sdb1 /mnt            # 挂载
umount /mnt                     # 卸载
```

## 实用技巧

### 管道和重定向

```bash
# 管道：前输出作为后输入
cat app.log | grep ERROR | tail -20
grep ERROR app.log | wc -l

# 重定向
echo "hello" > file.txt         # 覆盖
echo "world" >> file.txt         # 追加
command > output.log 2>&1       # 保存所有输出
command > /dev/null 2>&1        # 丢弃输出
```

### 快捷键

| 快捷键          | 作用           |
|--------------|--------------|
| `Ctrl + C`   | 终止当前命令       |
| `Ctrl + Z`   | 暂停命令         |
| `Ctrl + D`   | 退出shell      |
| `Ctrl + L`   | 清屏           |
| `Ctrl + R`   | 搜索历史命令       |
| `Ctrl + A/E` | 光标到行首/行尾     |
| `Ctrl + U`   | 删除整行         |
| `Tab`        | 自动补全         |
| `!!`         | 执行上一条命令      |
| `!abc`       | 执行最近abc开头的命令 |

## 常见场景

### 端口被占用

```bash
# 1. 查看8080端口被哪个进程占用
lsof -i:8080
netstat -tulnp | grep 8080
ss -tulnp | grep 8080

# 2. 杀掉占用端口的进程
kill -9 <PID>

# 3. 或者直接根据进程名杀掉
pkill -f "java"        # 杀掉所有java进程
killall <进程名>
```

### 进程运行状况

```bash
# 查看进程资源占用，按CPU排序
top
# 按M排序内存，按P恢复CPU排序

# 更友好的进程监控
htop

# 查看特定进程
ps aux | grep nginx

# 查看进程树
pstree -p <PID>

# 查看进程打开的文件
lsof -p <PID>

# 查看进程的网络连接
netstat -antp | grep <PID>

# 实时监控日志
tail -f app.log
# 搜索错误并实时追踪
tail -f app.log | grep ERROR
```

### 服务管理

```bash
# systemd（CentOS 7+/Ubuntu 16.04+）
sudo systemctl start nginx      # 启动
sudo systemctl stop nginx       # 停止
sudo systemctl restart nginx     # 重启
sudo systemctl reload nginx     # 重载配置
sudo systemctl status nginx     # 查看状态
sudo systemctl enable nginx    # 开机启动
sudo systemctl disable nginx   # 取消开机启动

# init.d（老系统）
sudo service nginx start
sudo service nginx stop
sudo service nginx restart
sudo service nginx status
```

### 排查服务器负载高

```bash
# 1. 查看负载
uptime
# load average: 0.5, 0.8, 1.0  分别代表1/5/15分钟的负载

# 2. 查看CPU和内存
top -c

# 3. 查看内存
free -h

# 4. 查看IO
iostat -x 1

# 5. 查看磁盘
df -h

# 6. 查看网络
iftop          # 需要安装，按流量排序
nethogs        # 按进程排序
```

### 日志分析

```bash
# 统计错误数量
grep -c "ERROR" app.log

# 统计每个IP的访问次数
awk '{print $1}' access.log | sort | uniq -c | sort -nr | head -20

# 查看访问量最高的IP
cat access.log | awk '{print $1}' | sort | uniq -c | sort -nr | head -10

# 统计接口响应时间
grep "api/" access.log | awk '{sum+=$NF; count++} END {print sum/count}'

# 查看最近N小时的日志
awk -v start=$(date -d '2 hours ago' +%s) '$0 ~ /^\w+ \d+ \d+:\d+:\d+/ {
    gsub(/\[|\]/,"",$4);
    cmd="date -d \""$4"\" +%s"; cmd | getline ts; close(cmd);
    if (ts > start) print
}' app.log
```

### 数据库相关

```bash
# 连接MySQL
mysql -u root -p
mysql -h host -P 3306 -u user -p database

# 连接Redis
redis-cli
redis-cli -h host -p 6379

# PostgreSQL
psql -U user -d database

# 查看数据库连接数
netstat -an | grep 3306 | wc -l
```

### 文件传输

```bash
# 本地到远程
scp file.txt user@server:/path/
scp -r dir/ user@server:/path/

# 远程到本地
scp user@server:/path/file.txt ./

# 限速传输
scp -l 1000 file.txt user@server:/path/   # 限制1000Kbps

# 同步目录
rsync -avz dir/ user@server:/path/
rsync -avz --delete dir/ user@server:/path/   # 完全同步，删除目标多余文件
```

### 查看大文件

```bash
# 找出大于100M的文件
find . -type f -size +100M -exec ls -lh {} \;

# 找出最占空间的目录
du -sh */ | sort -hr | head -10

# 查看文件大小
ls -lh file.txt

# 统计目录大小
du -sh dir/
```
