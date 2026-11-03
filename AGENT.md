# AGENT.md — 水星引力m 博客（233002.xyz）配置与服务速查

本仓库是一个 **全免费路线** 的博客 + 自建认证系统。本文档汇总服务、各处配置、DNS 解析记录（共 20 条，以 Cloudflare 控制台为准），供 agent / 维护者快速定位。

---

## 一、服务总览

| 用途 | 服务 | 方案 | 状态 |
|---|---|---|---|
| 发信（验证码） | **Resend** | 免费 100 封/天 | ✅ key 已设 + 域名 `verified` |
| 收件（`@233002.xyz`） | **Cloudflare Email Routing** | 免费 | ✅ DNS 已配 |
| 认证 API | **Cloudflare Workers** `my-blog-auth` | 免费 | ✅ 已部署 |
| 用户库 | **Cloudflare D1** | 免费 | ✅ |
| 第三方登录 | **GitHub / Google OAuth** | 免费 | ✅ secrets 已设 |
| 博客站点 | **Hexo → Cloudflare Pages** | 免费 | ✅ `www` / 根域 |
| 反伪造 | **DMARC** `p=reject` | 免费 | ✅ |
| 图片 | **Cloudflare R2**（`img.233002.xyz`） | 免费额度 | ✅ |
| 其他子域服务 | **Cloudflare Workers / Pages**（ai/admin/hls/cwd-api/ffzy/location） | 免费 | ✅ |

> ⚠️ 历史坑：Cloudflare「从 Worker 发信（send_email 绑定）」**仅 Workers Paid 可用**，免费版不可用——曾尝试后已回滚为 Resend。

---

## 二、认证 Worker（`auth.233002.xyz`）

- **源码 / 配置**：`workers/src/index.js`、`workers/wrangler.toml`
- **wrangler.toml 关键项**：
  - `name = "my-blog-auth"`、`main = "src/index.js"`、`compatibility_date = "2025-04-01"`、`workers_dev = true`
  - `[vars]`：`WORKER_URL = "https://auth.233002.xyz"`、`SITE_URL = "https://www.233002.xyz"`
  - `[[d1_databases]]`：`DB` → D1 `my-blog-auth`（database_id `f08bf70a-1daa-48c1-ba9a-6e13304156a5`）
- **Secrets（已设）**：`RESEND_API_KEY`、`GITHUB_CLIENT_ID`、`GITHUB_CLIENT_SECRET`、`GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`
- **可选变量（当前未设）**：
  - `DEV_MODE`（设 `"true"` 时接口回显 `dev_code`，供自测绕开邮件）
  - `EMAIL_FROM`（默认 `水星引力m 博客 <noreply@233002.xyz>`）
- **端点**：
  - `/api/auth/register`、`/api/auth/login`、`/api/auth/password/reset`、`/api/auth/verify`
  - `/api/auth/code`（邮箱登录验证码）
  - `/api/auth/github` + `/api/auth/github/callback`
  - `/api/auth/google` + `/api/auth/google/callback`
- **自定义域接线方式**：`auth.233002.xyz` 是 **CNAME → `my-blog-auth.233002.workers.dev`**（已代理），不是 wrangler.toml 里的 `routes`/`domains`。

### 发信逻辑
- `sendEmail(env, to, subject, html)` 调用 **Resend**（`https://api.resend.com/emails`，Bearer `env.RESEND_API_KEY`）。
- `RESEND_API_KEY` 缺失时**抛错**（不再静默假成功）；三条验证码路径（注册/重置/登录码）统一走此函数。
- 本地修复已提交 `6967062`（未推送）。

---

## 三、DNS 解析记录（Cloudflare，`233002.xyz`，共 20 条）

### 3.1 邮件相关（已全部 verified）
| 名称 | 类型 | 值 | 作用 |
|---|---|---|---|
| `@` | MX | `route1/2/3.mx.cloudflare.net` | Cloudflare Email Routing 收件 |
| `@` | TXT | `v=spf1 include:_spf.mx.cloudflare.net ~all` | **收件** SPF（Cloudflare Email Routing，非 Resend） |
| `cf2024-1._domainkey` | TXT | Cloudflare 给的 DKIM | Email Routing 转发签名 |
| `resend._domainkey` | TXT | Resend 给的公钥 `p=...` | **Resend 发信 DKIM**（已 verified） |
| `rsend` | CNAME | `rsend-euw1.forge.rmta.net` | **Resend 发信 SPF/return-path**（已 verified） |
| `send` | CNAME | `send.forge.rmta.net` | **Resend 发信 SPF/return-path**（已 verified） |
| `_dmarc` | TXT | `v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s; rua=mailto:sxtcyq@gmail.com,mailto:sxtcyq@qq.com` | 反 spoofing |

> **SPF/DKIM/DMARC 说明（重要）**：Resend 的 SPF 机制是专属子域 CNAME（`rsend`/`send`），**不**要求把 Resend 合并进根域 SPF。根域 SPF 只给 Cloudflare Email Routing 收件用。Resend 发信靠 `resend._domainkey` 的 DKIM 让 `d=233002.xyz` 与 From 严格对齐 → **DMARC 靠 DKIM 通过**，根域 `aspf=s` 不影响送达。
> - 可选增强：若想连 SPF 也对齐（更稳），可把 DMARC 改 `aspf=r`（relaxed）。不改也能收。
> - 早期提到的空 `*._domainkey` 记录现已不在列表中，无需处理。

### 3.2 站点 / 服务相关
| 名称 | 类型 | 值 | 用途 |
|---|---|---|---|
| `@` | CNAME（扁平化） | `my-blog-3fj.pages.dev` | 博客站根域（已代理，与 MX/TXT 共存靠 CNAME 扁平化） |
| `www` | CNAME | `my-blog-3fj.pages.dev` | 博客站（已代理） |
| `admin` | CNAME | `cwd-admin-8pe.pages.dev` | 管理后台（已代理） |
| `ai` | CNAME | `ai-proxy.233002.workers.dev` | 博客上 AI 小游戏/工具 API 后端（已代理） |
| `auth` | CNAME | `my-blog-auth.233002.workers.dev` | 博客登录认证 API（已代理） |
| `hls` | CNAME | `hls-proxy.32b5283fd99d2ea2abdc19507a5cf8d3.workers.dev` | 直播源代理（已代理） |
| `img` | R2 | bucket `myblog` | 图片资源（已代理） |
| `cwd-api` | Worker | `cwd-api` | API 后端（已代理） |
| `ffzy` | Worker | `ffzy-proxy` | 代理（已代理） |
| `location` | Worker | `ip-api` | IP/位置 API（已代理） |

### 3.3 站点验证
| 名称 | 类型 | 值 | 用途 |
|---|---|---|---|
| `@` | TXT | `google-site-verification=JTqEC0k1y3zppBng3GYG0E4ZYimlunEGQpJ8-Xpcw04` | Google Search Console 站点验证 |

> 注：读取完整 DNS 列表需 `dns_records:read` 权限（本机 wrangler OAuth token 仅 `zone:read`），以上来自人工核对的控制台导出。

---

## 四、外部服务配置要点

- **Resend**：域名 `233002.xyz` 已 `verified` / `sending: enabled`（region `eu-west-1`）；发件人 `noreply@233002.xyz`；API key = Worker secret `RESEND_API_KEY`。Resend 要求的 3 条记录（`resend._domainkey` TXT、`rsend` CNAME、`send` CNAME）均已添加且 verified。
- **GitHub OAuth App**：`GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`（secrets）；回调必须填 `https://auth.233002.xyz/api/auth/github/callback`。
- **Google OAuth App**：`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`（secrets）；回调 `https://auth.233002.xyz/api/auth/google/callback`。
- **Cloudflare Email Routing**：收件已启用，建议有 catch-all `*` 或显式规则把 `@233002.xyz` 转发到真实邮箱。
- **Google Search Console**：通过根域 TXT `google-site-verification=...` 验证。

---

## 五、代码位置

| 内容 | 路径 |
|---|---|
| Worker 逻辑 | `workers/src/index.js` |
| Worker 配置 | `workers/wrangler.toml` |
| 前端认证 UI / 请求 | `source/js/site-auth.js`（API 地址 = `window.SITE_CFG.AUTH_API \|\| 'https://auth.233002.xyz'`） |
| 博客（Hexo） | 根 `_config.yml` 等 |
| 未部署死文件 | `workers/src/auth-worker.js`（SendGrid 版，从未部署，可删可留） |

---

## 六、当前状态 & 待办

- ✅ **发信已通**：Resend key 已设、域名已 verified（3 条记录均 verified），测试信已成功发出（返回 `messageId`）。若收件箱没有，先查**垃圾箱**或 Resend 后台 Logs（状态 delivered/bounced）。
- 🔐 **Resend key 轮换**：key 曾在聊天里贴出暴露，建议去 Resend 后台删旧建新 → `wrangler secret put RESEND_API_KEY` 覆盖；并清本机可能记录的命令历史。
- 📦 **前端修复待上线**：`69cc9b0`（发码时校验 HTTP 状态，杜绝“假已发送”）已提交，但线上站点需**重新构建部署博客（Hexo→Pages）**才生效。不紧急——旧前端也会显示 `{error}` 报错。
- 🧪 **自测绕过邮件**：临时 `wrangler secret put DEV_MODE`（值 `true`）后接口回显 `dev_code`。
- 🗑️ **可清理**：`workers/src/auth-worker.js`（SendGrid 死文件）。
- 📤 **未推送提交**：Worker 修复 `6967062`（`main` 领先 1）。推送按约定走 SSH，结束还原 HTTPS。

---

## 七、常用命令

```bash
# Worker 相关（需先 export PATH 到 nvm node，例如：
# export PATH="/Users/shixiaotong/.nvm/versions/node/v24.15.0/bin:$PATH"）
cd workers
npx wrangler secret put RESEND_API_KEY --name my-blog-auth   # 写/更新密钥
npx wrangler secret list --name my-blog-auth                 # 列出密钥
npx wrangler deploy                                          # 部署
npx wrangler tail --name my-blog-auth                        # 实时日志（看 [email] 发信）

# 本地 git 状态
git --no-pager log --oneline origin/main..HEAD               # 未推送提交
```
