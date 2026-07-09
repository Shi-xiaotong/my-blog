---
title: 图床管理 - GitHub + jsDelivr CDN 使用指南
date: 2026-07-09
categories:
  - tech
tags:
  - 图床
  - GitHub
  - jsDelivr
  - CDN
  - 博客搭建
description: "博客自建图床：GitHub 存储 + jsDelivr CDN 加速，通过 CLI 工具管理图片，适合 AI 或终端使用。"
---

## 概述

本博客使用 **GitHub + jsDelivr CDN** 作为图片托管方案（替代之前使用的 Cloudflare R2），通过 CLI 工具管理图片的上传、压缩、删除等操作。

- **存储仓库**: [Shi-xiaotong/images](https://github.com/Shi-xiaotong/images)（公开仓库）
- **CDN 加速**: jsDelivr 全球 CDN
- **管理方式**: Python CLI 脚本（无前端页面，面向 AI / 终端使用）

## CDN 直链格式

图片按 `YYYY/MM/DD/` 日期文件夹自动存储，直链格式：

```
https://cdn.jsdelivr.net/gh/Shi-xiaotong/images@main/2026/07/09/filename.webp
```

### 各格式示例

**Markdown:**
```markdown
![图片描述](https://cdn.jsdelivr.net/gh/Shi-xiaotong/images@main/2026/07/09/example.webp)
```

**HTML:**
```html
<img src="https://cdn.jsdelivr.net/gh/Shi-xiaotong/images@main/2026/07/09/example.webp" alt="图片描述">
```

**Markdown 带大小:**
```markdown
<img src="https://cdn.jsdelivr.net/gh/Shi-xiaotong/images@main/2026/07/09/example.webp" width="800">
```

## CLI 工具

管理脚本位于 `_scripts/img-bed.py`，支持以下操作：

### 环境要求

- Python 3.8+
- Pillow 库（用于压缩功能）：`pip install Pillow`
- GitHub Token：自动从 `GH_TOKEN` 环境变量或 git credential manager 获取

### 常用命令

#### 1. 压缩并上传（推荐）

这是最常用的命令，一步完成：**缩放 → 压缩 → 上传 → 输出 CDN 链接**。

```bash
python _scripts/img-bed.py compress photo.png
```

默认参数：
- 最大尺寸：1920px（保持宽高比缩放）
- 输出格式：WebP
- 压缩质量：85
- 结果大小：通常 100-300 KB

自定义参数：
```bash
# 使用 JPEG 格式
python _scripts/img-bed.py compress photo.png --format jpeg

# 调整质量
python _scripts/img-bed.py compress photo.png --quality 75

# 限制更小尺寸
python _scripts/img-bed.py compress photo.png --max-dim 1200
```

#### 2. 直接上传（不压缩）

```bash
python _scripts/img-bed.py upload image.png
python _scripts/img-bed.py upload img1.png img2.png
```

#### 3. 列出所有图片

```bash
python _scripts/img-bed.py list
python _scripts/img-bed.py --pretty list   # 人类可读格式
```

输出包含每张图片的完整路径（如 `2026/07/09/photo.webp`）。

#### 4. 搜索图片

按文件名搜索所有文件夹：

```bash
python _scripts/img-bed.py find photo
python _scripts/img-bed.py find 1363709
```

#### 5. 获取 CDN 链接

```bash
python _scripts/img-bed.py url 2026/07/09/example.webp
```

返回 JSON，包含 CDN URL、Markdown 格式、HTML 格式。

#### 6. 删除图片

```bash
python _scripts/img-bed.py delete 2026/07/09/example.webp
```

#### 7. 查看仓库信息

```bash
python _scripts/img-bed.py info
```

### 输出格式

所有命令默认输出 JSON，适合 AI 解析和程序调用。示例：

```json
{
  "name": "photo.webp",
  "size_kb": 205.1,
  "dimensions": "1920x1076",
  "format": "WEBP",
  "quality": 85,
  "path": "2026/07/09/photo.webp",
  "cdn_url": "https://cdn.jsdelivr.net/gh/Shi-xiaotong/images@main/2026/07/09/photo.webp",
  "markdown": "![photo.webp](https://cdn.jsdelivr.net/gh/Shi-xiaotong/images@main/2026/07/09/photo.webp)",
  "html": "<img src=\"https://cdn.jsdelivr.net/gh/Shi-xiaotong/images@main/2026/07/09/photo.webp\" alt=\"photo.webp\">",
  "status": "ok"
}
```

## 性能对比

| 格式 | 原始大小 | 压缩后 | 首次加载时间 |
|------|---------|--------|------------|
| PNG | 7.3 MB | - | 54 秒 |
| JPEG (quality 75) | 7.3 MB | 190 KB | 2.7 秒 |
| WebP (quality 85) | 7.3 MB | 205 KB | 2.7 秒 |

> 结论：**大图必须压缩**。jsDelivr 首次访问会回源 GitHub，大文件会非常慢。压缩到 200KB 左右后，首次加载 2-3 秒，后续缓存命中后几乎瞬间加载。

## GitHub 仓库管理

图片仓库 [Shi-xiaotong/images](https://github.com/Shi-xiaotong/images) 是公开仓库，也可以直接在 GitHub 网页上进行可视化管理：

- 上传：点 "Add file" → "Upload files"
- 删除：进入文件 → 右上角垃圾桶
- 浏览：仓库根目录直接查看所有文件列表

## 注意事项

1. **Token 安全**：使用 fine-grained PAT，权限仅限 `Contents: Read and write` 作用于 `Shi-xiaotong/images` 仓库
2. **图片压缩**：上传前务必压缩，PNG 截图通常 5-10 MB，压缩后 100-300 KB
3. **文件名冲突**：同名文件会上传覆盖，建议文件名唯一
4. **jsDelivr 缓存**：首次访问慢，后续快。如果更新了同名文件，jsDelivr 可能缓存旧版本，可通过 `?v=2` 参数刷新