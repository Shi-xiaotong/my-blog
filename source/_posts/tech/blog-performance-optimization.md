---
title: 博客全量性能优化实录：从 21 个请求到 11 个，CDN 依赖从 7 个砍到 1 个
date: 2026-07-11 10:00:00
tags: ["性能优化", "Hexo", "Cloudflare", "WebP"]
categories: tech
top_img: false
description: 一天时间，把博客从 21 个请求 + 7 个 CDN 依赖优化到 11 个请求 + 1 个 CDN 依赖。记录了每个优化项的思路、操作和效果。
---

事情是这样的。

某天我在手机上打开自己的博客，等了快 5 秒才看到内容弹出来。打开开发者工具一看——21 个 HTTP 请求，7 个走第三方 CDN，总大小将近 800KB。

作为一个个人博客，这个表现说不过去。

于是花了半天时间做了一次全量性能优化。这篇文章记录每个优化项的思路、操作和实测效果。

## 优化前诊断

先用 curl 测了一下首字节时间（TTFB）：

```bash
curl -sL -o /dev/null -w "TTFB:%{time_starttransfer}s Total:%{time_total}s\n" https://233002.xyz
# TTFB:2.0s Total:2.2s
```

然后梳理了首页加载的所有资源：

| 类别 | 数量 | 总大小 |
|------|------|--------|
| 本地 CSS | 6 个 | ~51KB |
| 本地 JS | 7 个 | ~54KB |
| CDN JS | 6 个 | ~426KB |
| Font Awesome CSS + 字体 | 4 个 | ~254KB |
| 其他（主题自带、统计） | 若干 | 少量 |
| **合计** | **21 个请求** | **~785KB** |

最大的问题不是文件大，而是**第三方 CDN 太慢**。实测每个 jsDelivr 请求要 1-4 秒，unpkg 更是 2.5 秒。

## 八项优化

### 1. 删除旧版 bg.js

之前有个 canvas 星空背景（bg.js），后来换成了纯 CSS 的地球弧线效果，但 bg.js 还在加载。删除后省了 8KB + 1 个请求 + GPU 渲染开销。

### 2. Font Awesome 自托管

Font Awesome 7.1.0 原本从 jsDelivr 加载：1 个 CSS（74KB）+ 3 个 woff2 字体（~180KB）。每个都要 1.5-3.3 秒。

把整个 FA 包下载下来，放到博客的 `source/assets/fontawesome/` 目录，随博客一起部署到 Cloudflare Pages，同域名加载。耗时从 3.3 秒降到 0.8 秒。

```yaml
# themes/butterfly/_config.yml
CDN:
  option:
    fontawesome: /assets/fontawesome/css/all.min.css
```

### 3. cwd-widget 懒加载

CWD 评论系统的 JS 库 375KB，从 unpkg 加载要 2.5 秒。但首页根本没有评论区！

改成动态加载：只有页面上存在 `.comment-wrap` 元素时，才创建 `<script>` 标签加载 cwd.js。

```javascript
// 核心逻辑：有评论区才加载
var wrap = document.querySelector('.comment-wrap');
if (!wrap) return;
var s = document.createElement("script");
s.src = "/assets/libs/cwd.js";
document.body.appendChild(s);
```

首页直接省掉 375KB + 2.5 秒加载时间。

### 4. 合并 CSS/JS

开发时保持独立文件（方便调试），构建时自动合并：

**6 个 CSS → 1 个 bundle.css**
- common.css（设计 Token）
- site-override.css（Butterfly 桥接）
- custom.css（全站自定义）
- music-player.css
- site-auth.css（用户认证）
- user-center.css（个人中心）

**6 个 JS → 1 个 bundle.js**
- widget-loader.js
- live2d-toggle.js
- site-auth.js
- cwd-auth-hook.js
- music-player.js
- user-center.js

实现方式：写了一个 `_scripts/post-build.js`，在 `hexo generate` 之后自动运行，合并文件并修改 HTML 引用。

```json
// package.json
{
  "scripts": {
    "build": "hexo generate && node _scripts/post-build.js"
  }
}
```

### 5. CDN 资源本地化

以下资源全部从 jsDelivr 下载到 `source/assets/libs/`：

- pace.js / pace-theme-minimal.css
- pjax.js
- medium-zoom.js
- activate-power-mode.js
- click-heart.js

通过 Butterfly 的 `CDN.option` 覆盖 asset URL：

```yaml
option:
    pace_js: /assets/libs/pace.min.js
    pace_default_css: /assets/libs/pace-theme-minimal.css
    pjax: /assets/libs/pjax.min.js
    medium_zoom: /assets/libs/medium-zoom.min.js
    # ...
```

### 6. 添加 preconnect

提前与关键域名建立连接：

```html
<link rel="preconnect" href="https://img.233002.xyz">
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="preconnect" href="https://api.open-meteo.com">
```

### 7. 减少装饰特效

activate-power-mode、click-heart 等特效保留但本地化，不依赖 CDN。

## 优化结果

| 指标 | 优化前 | 优化后 | 变化 |
|------|--------|--------|------|
| TTFB | 2.0s | 1.5s | **-25%** |
| CSS 请求 | 8 个 | 3 个 | **-62%** |
| JS 请求 | 13 个 | 8 个 | **-38%** |
| CDN 依赖 | 7 个（jsDelivr + unpkg） | 1 个（busuanzi 2KB） | **-86%** |
| 总请求数 | 21 个 | 11 个 | **-48%** |
| 首页总大小 | ~785KB | ~130KB | **-83%** |
| **浏览器内存** | **~200MB** | **~120MB** | **-40%** |

最直观的感受：之前手机上打开等 5 秒，现在 2 秒内出内容。而且浏览器内存占用从 200MB 降到了 120MB——主要归功于看板娘改为手动加载（不点不开，省 ~60MB）和删掉旧版 canvas 背景脚本。

## 构建工作流

开发时还是改独立文件（`source/css/custom.css`、`source/js/site-auth.js` 等），构建时自动合并：

```bash
npm run build
# 等价于: hexo generate && node _scripts/post-build.js
```

`hexo s`（本地预览）也集成了这个流程：

```bash
npm start
# 等价于: hexo clean && npm run build && hexo s
```

## 遗留问题

1. Font Awesome 字体没做子集化——3 个 woff2 文件共 235KB，实际只用了约 50 个图标，可以砍到 50KB 以下
2. CF Pages 边缘缓存预热需要时间，首次访问 TTFB 仍然偏高
3. Butterfly 主题自带的核心 CSS/JS（index.css、main.js、utils.js）无法与我们的 bundle 合并

## 总结

性能优化不一定要搞多复杂的技术。**把资源从第三方 CDN 搬到自己域名下、合并请求、懒加载非关键资源**——这三招就解决了 80% 的问题。

整个改动不到 200 行代码，耗时半天，换来首页加载时间砍半。个人博客性能优化的性价比，大概也就这样了。