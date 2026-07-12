---
title: 我的博客搭建全记录：从零到AI自动化部署
date: 2026-05-23 01:30:00
tags: ["Hexo", "Cloudflare", "AI", "博客搭建", "自动化"]
categories:
  - tech
---

> 一个人，一个博客，一段从手工部署到 AI 自动化的折腾之旅。

![封面](https://img.233002.xyz/blog/myblog-cover.png)

## 前言

一直想拥有一个属于自己的博客——不被平台束缚，内容完全自主，还能折腾各种好玩的技术。经过一番调研和实践，最终形成了一套 **Hexo + GitHub + Cloudflare + AI 自动化** 的技术栈，记录下来供自己复盘，也希望能帮到有类似想法的朋友。

<!-- more -->

## 技术栈总览

先上一张整体架构图：

![技术栈总览](https://img.233002.xyz/blog/myblog1.png)

 层级 | 技术选型 | 说明 |
------|---------|------|
 框架 | Hexo 7.x | 静态博客生成器，Markdown 写作 |
 主题 | Butterfly 5.x | 功能丰富、颜值在线的中文友好主题 |
 代码管理 | GitHub | 版本控制 + CI/CD 触发源 |
 静态部署 | Cloudflare Pages | 全球 CDN 加速，自定义域名 |
 媒体存储 | Cloudflare R2 | 图片对象存储，自定义域名 img.233002.xyz |
 AI 自动化 | Hermes Agent + Mimo | AI 驱动的博客运维自动化 |

## 为什么选择 Hexo + Butterfly

选择 Hexo 的理由很简单：

- **纯静态**：生成的就是 HTML，部署到哪里都行
- **Markdown 写作**：程序员最熟悉的写作方式
- **插件生态丰富**：需要什么功能基本都有现成的插件

主题方面试了几个，最终选了 Butterfly，主要看中：

- 内置暗色模式、代码高亮、目录导航
- 支持多种评论系统和统计工具
- 中文文档完善，社区活跃
- Live2D 看板娘、天气、万年历等趣味功能

![Butterfly 主题效果](https://img.233002.xyz/blog/myblog2.png)

## GitHub 代码管理

博客的所有代码和文章都托管在 GitHub 上，好处是显而易见的：

- **版本控制**：每次修改都有迹可循
- **多端同步**：换电脑也能无缝继续
- **自动触发部署**：push 到 main 分支，Cloudflare Pages 自动构建发布

项目目录结构清晰明了：

```
my-blog/
├── _config.yml          # Hexo 主配置
├── source/
│   ├── _posts/          # 文章（按分类子文件夹组织）
│   │   ├── 技术/
│   │   ├── 历史/
│   │   ├── 动漫/
│   │   └── ...
│   └── about/           # 关于页面
└── themes/
    └── butterfly/       # 主题及自定义配置
```

![GitHub 仓库](https://img.233002.xyz/blog/myblog3.png)

## Cloudflare Pages 部署

选择 Cloudflare Pages 的原因：

- **免费额度够用**：个人博客完全够用
- **全球 CDN**：国内外访问速度都不错
- **自定义域名**：绑定自己的域名，SSL 自动配置
- **Git 集成**：GitHub push 自动构建部署

部署流程：

1. 在 Cloudflare Pages 中连接 GitHub 仓库
2. 设置构建命令：`hexo generate`
3. 输出目录：`public`
4. 绑定自定义域名 233002.xyz
5. 推送代码即自动部署

![Cloudflare Pages 部署配置](https://img.233002.xyz/blog/myblog4.png)

## Cloudflare R2 图片存储

随着文章增多，图片管理成了一个问题——放在项目仓库里会让仓库越来越臃肿，部署也变慢。于是引入了 Cloudflare R2：

- **对象存储**：专门存放图片、视频等媒体文件
- **自定义域名**：通过 img.233002.xyz 访问
- **免费额度**：10GB 存储 + 1000万次读取/月
- **S3 兼容**：标准 S3 API，生态成熟

配合 AI 自动化，实现了图片管理的零负担：

- 图片直接上传到 R2 获取 CDN 链接
- 文章中使用完整 R2 URL
- 仓库只保留 Markdown 文件，干净轻量

![Cloudflare R2 存储](https://img.233002.xyz/blog/myblog5.png)

## Hermes Agent + Mimo：AI 自动化

这是整个技术栈中最「极客」的部分。

通过安装 Hermes Agent，接入 Mimo 模型的 API，实现了用 AI 来操作博客的日常运维：

- **文章管理**：AI 帮忙写文章、整理格式、配置 frontmatter
- **自动部署**：一句指令完成 git commit + push
- **图片管理**：AI 自动上传图片到 R2 并生成链接
- **配置管理**：修改 Hexo 配置、主题配置
- **问题排查**：构建报错时自动分析和修复

整个交互体验就像是有一个懂技术的助手随时待命，只需要用自然语言描述需求，AI 就能帮你完成操作。

![Hermes Agent 交互](https://img.233002.xyz/blog/myblog6.png)

## 总结

从零搭建一个博客不难，难的是持续输出有价值的内容。技术栈只是工具，重要的是：

- **选对工具**：Hexo + Butterfly 满足了我对博客的所有想象
- **自动化一切**：Cloudflare Pages + R2 让部署零成本
- **拥抱 AI**：Hermes Agent 让日常运维变得轻松有趣

未来还计划接入更多功能：评论系统优化、SEO 增强、更多 AI 辅助写作能力。

如果你也想搭建自己的博客，希望这篇文章能给你一些参考。有问题欢迎交流！

---

*本文由 Hermes Agent 辅助生成，图片存储于 Cloudflare R2 (img.233002.xyz)。*
