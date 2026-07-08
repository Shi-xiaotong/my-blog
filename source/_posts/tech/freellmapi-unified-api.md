---
title: "亲测：1个工具聚合10家免费AI API，月白嫖13亿Token"
date: 2026-06-15 23:00:00
categories:
  - tech
tags:
  - AI工具
  - 免费API
  - OpenAI兼容
  - FreeLLMAPI
  - 效率
---

你有没有算过，每个月各大 AI 平台给的免费额度加起来有多少？

Gemini Flash、Cerebras、NVIDIA NIM、Groq、智谱 GLM、Cloudflare Workers AI……每家都有免费 tier，但问题是：**你得一个个注册、一个个调 API、一个个处理限流。**

直到我发现了 FreeLLMAPI 这个项目，一个工具把所有免费额度聚合成一个 OpenAI 兼容接口。我实际配了 10 家平台，**每月合计约 13 亿免费 Token**。

<!-- more -->

## 这东西到底干了啥？

简单说：你把各家的 API Key 填进去，它给你一个统一的 `/v1/chat/completions` 接口，格式跟 OpenAI 完全一样。

调用的时候随便写个 model 名，它自动路由到有额度的平台。某家 429 限流了？自动切下一家。你完全不用管后面有几个平台在转。

![FreeLLMAPI 架构示意图](https://img.233002.xyz/blog/freellmapi-arch.png)

## 我实际配了哪些平台？

折腾了一圈，最终能用的有这些：

> **可用平台（10家）**
> Gemini Proxy（2个key轮询）、Cerebras、SambaNova、GitHub Models、Cohere、智谱 GLM、NVIDIA NIM、Cloudflare Workers AI、OpenRouter、Agnes AI

> ! **翻车平台（2家）**
> Groq、Mistral — 注册页面打不开，暂时放弃

> @ **关键数据**
> Cerebras：每天 100 万 Token 免费，推理速度极快
> NVIDIA NIM：100+ 模型可选，含 Llama、DeepSeek 等
> OpenRouter：100+ 免费模型，GPT-4o 也能白嫖

![管理后台面板](https://img.233002.xyz/blog/freellmapi-dashboard.png)

## 5 分钟部署教程

整个过程比你想的简单得多。

**第一步：克隆项目**

```bash
git clone https://github.com/Shi-xiaotong/freellmapi.git
cd freellmapi
npm install
```

**第二步：配置 .env**

项目根目录有个 `.env` 文件，把各家的 API Key 填进去：

```bash
# Gemini（通过代理）
GEMINI_PROXY_URL=https://你的代理地址
GEMINI_PROXY_KEYS=key1,key2

# NVIDIA NIM
NVIDIA_API_KEY=nvapi-xxxx

# Cerebras
CEREBRAS_API_KEY=csk-xxxx

# 其他平台类似...
```

每个平台的 Key 怎么拿？都是去官网注册就行，免费 tier 不需要绑信用卡。

**第三步：启动**

```bash
npm run dev
```

打开 `http://localhost:5173`，这是管理后台。在 Keys 页面把各家 Key 添加进去（Key 存在加密 SQLite 里，比 .env 安全）。

![管理后台添加 Key](https://img.233002.xyz/blog/freellmapi-keys.png)

## 怎么用？

启动后你就有了一个 OpenAI 兼容的 API 端点。在任何支持 OpenAI 格式的工具里都能用：

```bash
# 直接 curl 测试
curl http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

写 `model: "auto"` 会自动选最优的可用模型。也可以指定具体模型名，比如 `llama-3.3-70b`。

**接入现有工具：**

> ChatGPT-Next-Web / LobeChat 等客户端：API Base URL 填 `http://localhost:3001`，API Key 随便填一个就行

> Python 项目：把 `openai.api_base` 指过来

> Cursor / VS Code Copilot：设置里改 API endpoint

![API 调用示例](https://img.233002.xyz/blog/freellmapi-usage.png)

## 踩过的坑

实话实说，折腾过程中遇到几个问题：

**1. Gemini 需要梯子**

Google 的 API 在国内被墙了。解决方案：搭了一个 Cloudflare Workers 做中转（`gemini-proxy.233002.xyz`），国内直连免翻墙。

**2. 有些平台注册就翻车**

Groq 和 Mistral 的注册页面在国内打不开，只能先放弃。但其他 10 家够用了。

**3. Key 会过期**

SambaNova 和 Cerebras 的免费 Key 有有效期，过期了要重新申请。建议定期检查后台面板的连接状态。

**4. 同一会话模型可能跳**

FreeLLMAPI 有个 30 分钟粘性会话机制，同一会话内模型不会乱跳。但超过 30 分钟可能会换平台。在意的话可以指定具体模型名。

![多平台 Key 管理](https://img.233002.xyz/blog/freellmapi-platforms.png)

## 跟 One-API 比怎么样？

经常有人拿 FreeLLMAPI 跟 One-API 比。简单说：

> @ **FreeLLMAPI 适合：** 个人用户，想白嫖免费额度，零成本
> One-API 适合：团队/商业化，需要多用户管理和计费

FreeLLMAPI 的核心优势是 **纯用免费额度**，不需要你有任何付费 Key。One-API 更像是 Key 管理+分发工具，本身不提供额度。

![对比总结](https://img.233002.xyz/blog/freellmapi-compare.png)

## 最后

这个项目帮我把之前散落在 10 个平台的免费额度统一管理起来了。写代码、写文章、做自动化脚本，都走这一个入口，不用再记一堆 API Key 和 endpoint。

如果你也有多个免费 AI 账号，推荐试试。GitHub 上搜 FreeLLMAPI 就能找到。

---

**觉得有用？点个「在看」，让更多人看到 👇**

关注「水星引力m」获取更多 AI 前沿资讯

每周更新 · 深度解读 · 不贩卖焦虑
