---
title: R2 存储大清理：从 340MB 到 7.5MB，全站图片 WebP 化
date: 2026-07-09
categories:
  - tech
tags:
  - Cloudflare
  - R2
  - WebP
  - 性能优化
  - 踩坑
---

## 起因

几个月前为了图省事，把博客图片一股脑全丢到了 Cloudflare R2 里。日积月累，R2 里塞了 270 个文件、占了 340MB —— 虽然 10GB 免费额度还很富裕，但 90% 的文件都是废弃的（旧文章封面、daily-news 自动生成的配图、编辑器残留等等）。

正好最近博客做了一次大瘦身，去掉了大部分文章封面和重复配图，于是决定彻底清理 R2。

## 清理流程

### 1. 找出未使用的图片

先扫了一遍博客源码，把所有 `img.233002.xyz` 引用全扒出来：

```bash
grep -roh 'https://img\\.233002\\.xyz/[^"'"'"') >]*' source/ themes/ | sort -u
```

对比 R2 桶内文件列表，发现：
- **博客在用：57 张**
- **R2 未使用：214 张（261 MB）**

未使用的大头：
| 类别 | 文件数 | 占用 |
|------|--------|------|
| daily-news 配图（旧文章封面） | 134 | 181 MB |
| 根目录旧封面 | 40 | 64 MB |
| blog/ 旧文件 | 33 | 8 MB |
| 其他 | 7 | 8 MB |

用 Cloudflare API 批量删掉这 214 个文件，直接释放了 261 MB。

### 2. PNG/JPG → WebP 全面转换

R2 里在用的图片以 PNG 和 JPG 为主，单张动辄 5~6 MB（尤其是济南旅游照片）。目标是全部压缩到 **300KB 以内**并转为 **WebP 格式**。

踩了好几个坑才搞定：

**坑 1：Python 下载 403**
一开始用 `urllib` 从 `img.233002.xyz` 下载，结果返回 403 Forbidden。原因是 Python 的默认 User-Agent 被 Cloudflare 拦截了。解决方案：改用 Cloudflare API 的 R2 Object GET 直连下载，又快又稳。

**坑 2：光降质量压不动**
大照片 5~6 MB，即使 WebP quality=20 也有 1~2 MB。必须同时缩小分辨率：

```python
# 策略：最长边 ≤ 1920px，然后降质量直到 ≤300KB
MAX_DIM = 1920
if w > MAX_DIM or h > MAX_DIM:
    ratio = min(MAX_DIM/w, MAX_DIM/h)
    img = img.resize((int(w*ratio), int(h*ratio)), Lanczos)

for q in [80, 70, 60, 50, 40, 30, 20]:
    # ... save and check size
    if buf.tell() < 300 * 1024:
        break
```

有的图三轮 resize 后还是超，加了个 while 循环不断缩到 75% 直到达标。

**结果：70.7 MB → 4.5 MB，压缩比 93%**

### 3. GitHub 图床迁移

之前还搭了个 GitHub + jsDelivr 图床，放了 avatar、logo、bgm 几个文件。后来 jsDelivr 的 GitHub 路由（`/gh/`）出现了不稳定的情况 —— 存在的文件返回 200，但有些 CDN 节点会间歇性 301 重定向到 raw.githubusercontent.com。

干脆全部迁移到 R2，统一管理：

```
assets/avatar.webp
assets/logo.webp
assets/bgm.mp3
assets/zipai.webp
assets/ref-image.webp
assets/1363709.webp
```

## 最终成果

| 指标 | 之前 | 之后 |
|------|------|------|
| R2 文件数 | 270 | 56 |
| R2 占用 | 340 MB | 7.5 MB |
| 图片格式 | PNG/JPG | WebP |
| 单图上限 | 6.2 MB | ≤300KB |
| 图床依赖 | GitHub + jsDelivr | R2 统一管理 |
| 首屏加载时间 | 18~20 秒 | ~5 秒（缓存后更快） |

### 性能提升

清理前首页首次加载需要 **18~20 秒**，主要瓶颈是：

- 三大 Font Awesome 字体文件（共 236 KB）各自阻塞 4~9 秒
- 图片体积大，单张 5~6 MB
- 20+ 个 JS 文件扎堆加载

优化后首屏降至 **~5 秒**，缓存后甚至更快：

| 资源 | 优化前 | 优化后 |
|------|--------|--------|
| fa-solid-900.woff2 (114KB) | 3.96 秒 | 1.22 秒（预载 + CDN） |
| fa-brands-400.woff2 (102KB) | 8.74 秒 | 1.30 秒（预载 + CDN） |
| 页面文档 | 依赖字体加载 | 906 ms |
| search.xml | — | 1.89 秒 |
| 全部图片 | 5~6 MB / 张 | ≤300KB / 张 |

这次清理最大的体会：**存储空间不是无限的，定期清理能省很多事。** 另外 WebP 真香，同样的视觉质量体积能缩小 90%+。