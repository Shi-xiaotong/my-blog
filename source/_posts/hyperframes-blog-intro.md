---
title: "从零到一：用 HyperFrames 给博客做个介绍视频"
date: 2026-07-11 14:00:00
categories:
  - tech
tags:
  - HyperFrames
  - 视频制作
  - AI
  - 踩坑
description: "偶然发现 HyperFrames 这个能把 HTML 渲染成 MP4 的开源项目，于是动手给博客做了个介绍视频。从 38 秒的粗糙第一版到 74 秒的全功能最终版，中间经历了几次迭代和无数踩坑。"
---

> 本文记录了用 HyperFrames 给自己的博客做一个介绍视频的完整过程，包括踩坑实录和最终效果。

## 前言

前几天在逛 GitHub 的时候，偶然发现了一个叫 [HyperFrames](https://hyperframes.heygen.com) 的开源项目——它可以把 **HTML + CSS + JavaScript** 直接渲染成 **MP4 视频**。

等等...HTML 渲染成视频？那不是可以用前端技术写动画，然后一键导出成视频？这不就是我一直想要的东西吗？

我的博客 [233002.xyz](https://233002.xyz) 从搭建到现在一直在迭代：性能优化、加工具箱、加小游戏、加影视屋、加看板娘、搞每日热点自动化……功能越来越多，但我从来没有一个像样的介绍视频。每次给人安利都是"你去看看就知道了"。

于是我决定：**用 HyperFrames 给我的博客做一个完整的介绍视频，展示所有功能模块。**

## HyperFrames 是什么

简单说，HyperFrames 是一个**视频渲染引擎**：你写一个 HTML 文件，用 `data-start`、`data-duration`、`data-track-index` 这些属性标记每个元素的出现时间，用 GSAP 做动画，然后它就能渲染成一个 1920×1080 的 MP4 视频。

工作流大概是这样：

![HyperFrames 工作流](/images/hyperframes-workflow.webp)

核心概念就几个：
- **Clip** — 一个有起止时间的可视元素
- **Track** — 叠加层级（类似 PS 的图层）
- **Composition** — 整个视频的根容器
- **Timeline** — GSAP 的 `paused: true` 时间线

## 接入 Hermes Agent

我日常用 [Hermes Agent](https://hermes-agent.nousresearch.com) 管理博客（对，之前那篇性能优化文章也是它帮我写的），所以这次也直接让 Hermes 帮我干活。

第一件事是 capture 网站，获取视觉素材：

```bash
npx hyperframes capture https://233002.xyz --output capture/
```

这条命令会启动 Headless Chrome，截取页面截图，提取设计 Token（颜色、字体、间距），下载所有素材文件。输出文件夹里能看到：

```
capture/
├── screenshots/       # 5张滚动截图
├── extracted/         # 设计Token、可见文本、资产描述
│   ├── tokens.json
│   ├── design-styles.json
│   └── visible-text.txt
├── assets/            # Logo、头像、SVG等
└── AGENTS.md          # 自动生成的代理指南
```

然后初始化项目：

```bash
npx hyperframes init blog-intro --example blank
```

这一步会自动安装 20 个 HyperFrames 工作流技能（capture、动画、音频、媒体处理等）。

## 第一版：38 秒的粗糙尝试

第一版我写了 5 个场景，38 秒，涵盖了 Logo 开场、博客概览、特色功能、每日热点和结尾。

但问题很多：
- ❌ 运行时有一个 GSAP 错误导致检查失败
- ❌ 没有配音，纯画面
- ❌ 很多功能没覆盖到（评论系统、性能优化、看板娘等）
- ❌ 背景是纯紫色渐变，非常丑

我决定全部推倒重来。

## 代码审计：先修博客本身

在重新做视频之前，我让 Hermes 对博客代码做了一次**全面的逐行审计**。

好家伙，查出一堆问题：

| 问题 | 严重程度 | 说明 |
|------|---------|------|
| CWD 评论加载两次 | 🔴 | unpkg CDN + 本地懒加载同时生效 |
| JS 文件重复注入 | 🟡 | widget-loader.js 在两个配置文件中各注入一次 |
| OAuth token 注入风险 | 🔴 | URL 参数直接写 localStorage，无校验 |
| 音乐播放器内存泄漏 | 🟡 | pjax 导航后旧 Audio 对象未销毁 |
| CSS 分页样式重复定义 | 🟢 | 两组选择器互相覆盖 |
| 无用依赖 | 🟢 | `hexo-theme-landscape` 未使用 |
| 搜索引擎推送插件空配置 | 🟢 | token 为空，插件空跑 |

修完之后博客清爽多了，也顺便清理了 3.5MB 的 `db.json` 缓存文件和没用的依赖。

![视频迭代历程](/images/video-iterations.webp)

## 第二版：45 秒的全功能版

有了代码审计的经验，我开始重新写视频。这次规划了 **10 个场景**，每个场景 4-5 秒：

| 场景 | 时间 | 内容 |
|------|------|------|
| Logo 开场 | 0-4s | 太空主题品牌展示 |
| 博客概览 | 4-9s | 首页截图 + 数据统计 |
| 文章系统 | 9-14s | Tech / Daily News / Anime |
| 工具箱+游戏+影视屋 | 14-19s | 三大功能模块 |
| 日历+天气 Widget | 19-23s | 侧边栏实用工具 |
| 评论+用户系统 | 23-27s | 登录/个人中心/评论 |
| 每日热点 | 27-31s | AI 自动生成科技新闻 |
| 性能优化 | 31-35s | 请求砍半、CDN归零 |
| 音乐+看板娘 | 35-39s | 黑胶唱片 + Live2D |
| 结尾 | 39-45s | 233002.xyz |

加了 TTS 配音（Edge TTS）和背景音乐，背景用了和博客一致的太空主题（深空渐变 + 星星 + 地球弧线）。

结果用户反馈：**语速太快了，话没讲完画面就切了**。

## 踩坑实录

### 坑 1：TTS 语速和时长

第一次用 `--rate +30%` 加速 TTS，3.98 秒说完"欢迎来到水星引力m"。用户说"说话速度有点快"。

改成 `+20%` → 4.30 秒，`+10%` → 4.70 秒，最终用 `+10%`，自然多了。

但更大的问题是音频时长不匹配。HTML 里写的 `data-duration` 比实际音频文件短，结果话没讲完就被切断了。

**教训：** TTS 的 `data-duration` 必须用 ffprobe 测出实际时长，而且要比原始时长多加 0.2-0.3 秒缓冲。

```python
# 用 ffprobe 获取实际音频时长
result = subprocess.run([
    "ffprobe", "-v", "error", "-show_entries",
    "format=duration", "-of", "default=noprint_wrappers=1:nokey=1",
    "assets/tts_s8.mp3"
], capture_output=True, text=True)
dur = float(result.stdout.strip())  # 6.86s
```

### 坑 2：卡片布局重叠

视频中用毛玻璃卡片展示功能模块，但弹性布局 `display: flex` 配合 `position: absolute` 在视频渲染时会产生定位冲突。

**解决方案：** 所有卡片用精确的像素坐标 `position: absolute; left: XXXpx; top: YYYpx`，避免依赖 flexbox 布局计算。

### 坑 3：GSAP CSS transform 冲突

如果一个元素在 CSS 里设了 `transform: translateX(-50%)` 居中，而 GSAP 也动画化了 `xPercent` 属性，GSAP 会**覆盖** CSS 的 transform，导致居中失效。

**解决方案：** 统一用 GSAP 的 `tl.set()` 来居中，不在 CSS 里用 transform 做定位。

```javascript
// ✅ 正确做法：GSAP 统一管理 transform
tl.set("#s1-disclaimer", { xPercent: -50 }, 0);
// ❌ 错误做法：CSS 和 GSAP 各管各的
```

### 坑 4：Lint 通过但运行时失败

HyperFrames 的 lint 能查出很多常见问题（重叠 clip、同轨道冲突、GSAP transform 冲突），但有些**玄学问题**只有渲染出来才知道。比如 `tl.to({}, { duration: 8 })` 这种空选择器会导致运行时错误，lint 却检查不出来。

**教训：** 每改一次都必须 `npx hyperframes check` + `npx hyperframes render` 两步验证。

## 第三版：74 秒的最终版

经过三轮迭代，最终版本是这样的：

- ⏱ **时长**：74 秒（10 个场景，话说完才切）
- 🎤 **配音**：Edge TTS +10% 自然语速，每句留 1.5 秒缓冲
- 🎵 **BGM**：环境背景音乐（降噪低频循环）
- 🎨 **视觉**：博客同款太空背景（深空渐变 + 星星 + 地球弧线）
- 🪟 **卡片**：毛玻璃效果，统一布局，不重叠
- 🖼 **截图**：使用博客真实页面截图作为背景
- ✅ **检查**：Lint 0 错误，Runtime 0 错误

渲染参数：

| 参数 | 值 |
|------|-----|
| 分辨率 | 1920 × 1080 |
| 帧率 | 30fps |
| 总帧数 | 1350 |
| 静态帧复用 | 40%（540 帧） |
| 渲染时间 | 32.6 秒 |
| 文件大小 | 4.9 MB |
| 编码 | H.264 |

## 最终效果

[查看最终成品视频](https://233002.xyz/)

视频路径：`/Users/shixiaotong/Documents/dev/projects/blog-intro/blog-intro/output/blog-intro-v3.mp4`

## 总结

这次做视频最大的收获不是技术本身，而是**「好视频是改出来的」**这个道理。

第一版 38 秒 → 推翻重来 → 45 秒有配音 → 74 秒最终版，中间经历了好几次"用户说不行→我改→再渲染→再看"的循环。

每次迭代都在解决具体问题：
1. 语速快了 → 降速至 +10%
2. 话没讲完 → 用 ffprobe 测准确时长
3. 背景太丑 → 复用博客的太空设计系统
4. 卡片重叠 → 用精确坐标替代 flexbox
5. 标题不居中 → 统一 GSAP 管理 transform

如果你也在用 HyperFrames 做视频，记住一句话：**先渲染个能看的，再迭代到好看的。** 渲染只要 30 秒，改一次的成本很低。

最后，欢迎来 [233002.xyz](https://233002.xyz) 逛逛，或者直接在评论区聊聊你的视频制作经验 👇