---
title: "一次全面安全审计：我的 Hexo 博客从 P0 到 P2 的修复之旅"
date: 2026-07-19
tags: [安全, Hexo, Cloudflare Workers]
description: 对 Hexo + Butterfly 博客进行全方位安全审计，发现并修复了 SSL、SSRF、XSS、CSP 等 8 个安全问题，以及 Font Awesome subset 和 bundle hash 性能优化。
---

<!-- more -->

## 一次全面安全审计：我的 Hexo 博客从 P0 到 P2 的修复之旅

上周我对自己维护的 Hexo 博客做了一次彻底的安全审计。结果发现了不少问题——有些是显式的，有些是隐式的。今天就把整个过程记录下来，既是复盘，也是给同样做个人项目的开发者一个参考。

---

### 为什么要做这次审计？

事情起因很简单：我用了 Cloudflare Workers + D1 + R2 的架构，博客有评论系统、视频代理、AI 游戏等多个功能模块。随着功能增多，安全隐患也在累积。

特别是这几个场景：
- **视频代理**：用户传入任意 URL，Worker 帮转发
- **AI 游戏**：用户输入直接拼进 prompt 和 DOM
- **每日热点脚本**：爬取多个数据源，没有 rate limit
- **前端资源**：Font Awesome 全量加载，CSS/JS 无缓存版本控制

这些问题单独看都不大，但凑在一起就是攻击面。

---

### P0：必须立刻修的安全漏洞

#### 1. SSL 验证被关闭

这是最基础的，但我居然没注意到。

在 `_scripts/daily-news.py`、`_scripts/scrape-daily-news.py`、`_scripts/generators/__init__.py`、`_scripts/scrapers/__init__.py` 这四个文件里，都有类似的代码：

```python
import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
```

这意味着所有 HTTPS 请求都跳过了证书验证。MITM 攻击可以直接中间人拦截 API 调用，窃取 API key 或篡改数据。

**修复**：删除这些自定义 SSL context，让 urllib 使用默认验证。

```bash
# 修复前
grep -rn 'check_hostname\|CERT_NONE' _scripts/
# 4 处匹配

# 修复后
grep -rn 'check_hostname\|CERT_NONE' _scripts/
# 0 处匹配
```

#### 2. SSRF 绕过：fetch 用了原始 URL

这是本次审计发现的最严重问题。

`workers/src/index.js` 的 `/m3u8` 和 `/ts` 端点有 SSRF 防护：

```javascript
let targetUrl;
try {
  targetUrl = new URL(target);
} catch {
  return badRequest("invalid url");
}
// Only allow https, block private/internal IPs
if (targetUrl.protocol !== "https:") return badRequest("only https allowed");
const hostname = targetUrl.hostname.toLowerCase();
if (/^(localhost|127\.\d+\.\d+\.\d+|...)/i.test(hostname)) {
  return badRequest("internal hosts not allowed");
}
```

看起来没问题对吧？但关键在这里：

```javascript
const resp = await fetch(target, ...);  // ← 用的是原始字符串！
```

校验的是 `targetUrl.hostname`，但实际请求用的是 `target` 原始字符串。JavaScript 的 `URL` 构造函数会做规范化/解码，可能导致校验用的 hostname 与实际请求的 hostname 不一致。

**修复**：改用 `targetUrl.href` 作为 fetch 参数。

```javascript
const resp = await fetch(targetUrl.href, ...);
```

同时加了 DNS 重绑定防护：解析 hostname 到 IP 后二次检查私有 IP 范围。

#### 3. DB Schema 不一致

`workers/schema.sql` 定义的是通用 auth 表（`users`, `oauth_accounts`），但代码实际用的是 `anime_users`, `anime_sessions` 等带 anime 前缀的表。而且两个文件都没有完整的 CREATE TABLE 语句。

**修复**：重写 `schema.sql` 与代码对齐，在 `ensureTables()` 和 `migrate()` 中都补建所有核心表。

---

### P1：重要但不紧急的安全问题

#### 4. XSS 漏洞

6 个 AI 游戏页面大量使用 `innerHTML` 渲染用户输入和 AI 回复：

| 文件 | 风险等级 |
|------|---------|
| `ai-poem-game.js` | 🔴 高危 |
| `ai-song.js` | 🔴 高危 |
| `ai-20q.js` | 🔴 高危 |
| `ai-turtle-soup.js` | 🔴 高危 |
| `ai-story.js` | 🔴 高危 |
| `ai-guess.js` | 🟡 中危 |

攻击链：用户输入 → 拼入 prompt → AI 返回（可能包含恶意 payload）→ `innerHTML` 执行。

**修复**：全部改为 `textContent` 或 `createElement` + `appendChild`。

```javascript
// 修复前
document.getElementById('feedback').innerHTML = feedback;

// 修复后
document.getElementById('feedback').textContent = feedback;
```

容器清空（`innerHTML = ''`）保留，这是安全的。

#### 5. CSP 头缺失

Worker 响应只有 CORS 头，没有 Content-Security-Policy。

**修复**：添加完整 CSP：

```javascript
const CSP = {
  "Content-Security-Policy": 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "img-src 'self' data: https://img.233002.xyz ...; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://ai.233002.xyz ...; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
};
```

注意：Hexo 博客有内联脚本，所以 `script-src` 需要 `'unsafe-inline'`；Butterfly 主题需要 `style-src 'unsafe-eval'`。

#### 6. Rate Limit 缺失

每日热点脚本爬取 6 个热搜源，请求之间没有任何 delay。GitHub API 有 60 req/hr 的限制，微博、抖音等平台也可能触发封禁。

**修复**：在 `safe_fetch()` 入口加随机延迟：

```python
def rate_limit_delay():
    time.sleep(random.uniform(1, 3))
```

每个源增加约 1-3 秒延迟，总计多花 6-18 秒，但能避免被限流。

---

### P2：性能优化

#### 7. Font Awesome Subset

博客实际只用了 37 个图标，但加载了完整的 Font Awesome 字体包：

- `fa-solid-900.woff2`: 111KB
- `fa-brands-400.woff2`: 99KB
- `fa-regular-400.woff2`: 19KB

**修复**：生成 subset CSS，只包含实际使用的图标。

```bash
# 修复前
source/assets/fontawesome/css/all.min.css          # 72.6 KB

# 修复后
source/assets/fontawesome/css/fa-subset.min.css    # 2.9 KB
```

节省 **96%** 体积。

#### 8. Bundle Content Hash

CSS/JS bundle 输出固定文件名，缓存失效靠手动清 CDN。

**修复**：计算内容 MD5 hash 前 8 位，输出 `bundle.{hash}.css` 和 `bundle.{hash}.js`，HTML 引用同步更新。

```javascript
const cssHash = crypto.createHash('md5').update(cssContent).digest('hex').slice(0, 8);
const cssBundleName = `bundle.${cssHash}.css`;
```

同时保留原文件名作为兼容（copy 一份）。

---

### Commit 记录

```bash
5423871 fix(security): SSL verification, SSRF protection, DB schema consistency
dd411a6 fix(security): SSRF bypass via raw fetch URL + DNS rebinding
fb49a0d fix(security): XSS, CSP, rate limit, bundle hash
2a55f5f perf: Font Awesome subset, bundle hash, rate limit, CSP
```

---

### 审计方法论

这次审计用了三个并行子任务：

1. **SSRF 分析** — 检查代理端点的 URL 校验完整性
2. **SQL 注入 + OAuth CSRF** — 检查 D1 parameterized binding、字符串拼接 SQL、state 验证
3. **XSS 风险** — 检查用户输入 sanitization、前端渲染方式、CSP

子任务完成后，我手动验证了所有修改：
- Python: `py_compile`
- JS: `node --check`
- Git: `git status --short` 确认变更范围

---

### 剩余优化项（后续处理）

- **WebP pipeline**：构建流程中无任何图片压缩/WebP 转换
- **Font Awesome subset 字体文件**：当前只精简了 CSS，字体文件还是全量（但 CSS 已经只引用需要的 unicode range）

---

### 总结

这次审计发现的安全问题按优先级排列：

| 级别 | 问题 | 影响 |
|------|------|------|
| P0 | SSL 验证关闭 | MITM 攻击 |
| P0 | SSRF 绕过 | 内网访问 |
| P1 | XSS | 客户端代码执行 |
| P1 | CSP 缺失 | 缺乏浏览器层防护 |
| P2 | Font Awesome 全量 | 性能浪费 |
| P2 | Bundle 无 hash | 缓存失效困难 |

**建议**：定期做类似审计，尤其是涉及用户输入、外部 URL 代理、数据库查询的代码。安全不是"做完就完"，而是持续的过程。

---

*博客由 Agnes 2.5 Flash 辅助写作。*
