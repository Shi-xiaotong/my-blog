---
title: 零成本给博客加邮箱验证码：Resend + Cloudflare Email Routing 踩坑全记录
date: 2026-11-03 22:00:00
tags: ["Cloudflare", "Resend", "邮件", "DMARC", "DNS", "博客搭建", "Worker"]
categories:
  - 技术
---

> 博客自己做账号系统，注册 / 登录 / 找回密码都得发邮箱验证码。本文记录如何**不花一分钱**把这套发信跑通，以及过程中踩到的三个真实坑。

## 背景

我的博客（`233002.xyz`）有一个自建的认证 Worker（`auth.233002.xyz`），负责注册、登录、重置密码，全部依赖**邮箱验证码**。之前这功能一直处于"点了显示已发送、其实没收到"的半残状态。趁着今天有空，把整条链路从根上修通。

核心诉求只有一句：**用自己域名发信 + 完全零成本**。

<!-- more -->

## 坑一：Cloudflare 从 Worker 发信要付费

一开始我想走 Cloudflare 官方推荐的路子：在 `wrangler.toml` 里加

```toml
[[send_email]]
name = "EMAIL"
```

然后 `env.EMAIL.send({ from, to, subject, html })`。代码改完、准备部署时，翻到 Cloudflare 的提示才发现：**Cloudflare 的「从 Worker 发信（Email 发送）」是 Workers Paid 专属功能**，免费版根本用不了（控制台也明确提示需要绑定付费计划）。于是连部署都没进行就回滚了。

于是果断改用第三方免费邮件服务。**结论：免费路线别碰 Cloudflare 自带发信。**

## 选型：Resend 免费版

对比了一圈免费额度：

| 服务 | 免费额度 | 是否改 DNS |
|---|---|---|
| **Resend** | 100 封/天 | 要（免费） |
| SendGrid | 100 封/天 | Single Sender 可免 |
| Brevo | 300 封/天 | 要域名认证 |

Resend 对自定义域名最友好、代码改动最小，最终选它。注册**免信用卡**，自定义域名 `233002.xyz` 直接验证。

> 别走 MailChannels——它给 Cloudflare Worker 的免费发信早已停止，现在也收费。

## 坑二：真正的故障不是选型，而是"没配 + 假成功"

排查下来，之前"点了重置密码却显示已发送、收件箱空空"的根因是**三个叠加**：

1. **Worker 没配 `RESEND_API_KEY`**——发信直接失败；
2. **域名没在 Resend 验证**——即使有 key，Resend 也会拒绝发送；
3. **代码有个"假成功" bug**：旧版 `sendEmail` 在缺少密钥时只是 `console.log` 后静默 `return 200`，前端自然就显示"已发送"了，等于骗自己。

修法分两端：

**后端**（缺密钥就抛错，不再静默）：

```js
async function sendEmail(env, to, subject, html) {
  const key = env.RESEND_API_KEY;
  if (!key) {
    console.error('[email] RESEND_API_KEY 未配置，邮件未发送');
    throw new Error('邮件服务未配置（RESEND_API_KEY 缺失）');
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.EMAIL_FROM || '水星引力m 博客 <noreply@233002.xyz>', to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('[email] send failed:', err.slice(0, 500));
    throw new Error('邮件发送失败');
  }
}
```

**前端**（先校验 HTTP 状态，任何 400 都显示真实错误，不再误判成功）：

```js
.then(function(r){
  return r.json().then(function(d){return {ok:r.ok,d:d};})
                 .catch(function(){return {ok:r.ok,d:{}};});
})
.then(function(x){
  if(!x.ok || (x.d && x.d.error)){
    err.textContent = (x.d && x.d.error) || '邮件发送失败，请稍后重试';
    err.style.color = '#e94560'; btn.disabled = false; return;
  }
  // ...显示成功
})
```

修完本地提交，部署上线：

```bash
cd workers
wrangler secret put RESEND_API_KEY --name my-blog-auth   # 写入 key
wrangler deploy                                          # 部署修复后的代码
wrangler tail --name my-blog-auth                        # 看日志
```

日志里出现 `[email] sent messageId=...` 就说明真发出去了。

## 坑三（也是最值钱的认知）：DNS 到底该怎么配

邮件相关的 DNS 我全梳理了一遍，关键结论和直觉相反：

### 收件：Cloudflare Email Routing

| 记录 | 值 | 作用 |
|---|---|---|
| MX ×3 | `route*.mx.cloudflare.net` | 收件 |
| TXT `@` | `v=spf1 include:_spf.mx.cloudflare.net ~all` | **收件** SPF |
| TXT `cf2024-1._domainkey` | Cloudflare 给的 DKIM | 转发签名 |
| TXT `_dmarc` | `v=DMARC1; p=reject; ...` | 反 spoofing |

这套其实是**早前邮件对接时配的**（Cloudflare Email Routing 收件套件），并非原生必备；但既然已经配好就留着——它只管**收件**，跟 Resend 发件无关。

### 发件：Resend

Resend 在控制台验证域名时给的记录是**三条**，不是"合并进根 SPF"：

| 记录 | 值 | 作用 |
|---|---|---|
| TXT `resend._domainkey` | Resend 给的公钥 | 发信 DKIM |
| CNAME `rsend` | `rsend-euw1.forge.rmta.net` | 发信 SPF / return-path |
| CNAME `send` | `send.forge.rmta.net` | 发信 SPF / return-path |

**重点来了**：Resend 的 SPF 机制是**专属子域 CNAME**，**不要**把它合并进根域那条 SPF（`v=spf1 include:_spf.mx.cloudflare.net ~all`）。根域 SPF 只给 Cloudflare Email Routing 收件用，动它反而会丢收件授权。

### 为什么 `DMARC p=reject` + `aspf=s`（严格 SPF）还能收到信？

这是今天最有意思的一点。我的 DMARC 是 `p=reject; adkim=s; aspf=s`（严格）。

- Resend 发信时，envelope-from 用的是 `rsend.233002.xyz`（子域），根域 `aspf=s` 下**SPF 对齐是失败的**；
- 但它用 `resend._domainkey` 的 DKIM 签名，`d=233002.xyz` 与邮件头 From 严格对齐 → **DKIM 对齐通过**；
- DMARC 的规则是「SPF 对齐 **或** DKIM 对齐任一通过即可」。所以**靠 DKIM 照样 PASS**，`p=reject` 不会把信拒掉。

换句话说：**根域那条 SPF 不是给 Resend 用的，Resend 靠自己的子域 CNAME + DKIM 完成认证**。这一点搞清楚后，之前担心的"SPF 没包含 Resend 会不会被拒"纯属多虑。

（可选增强：想连 SPF 也对齐更稳，可把 DMARC 改成 `aspf=r`。不改也能收。）

## 收尾与几个安全提醒

- 🔐 **API key 别贴进聊天 / 提交**：key 一旦暴露就立刻去 Resend 后台删掉重建，再 `wrangler secret put` 覆盖；
- 🧹 若 DNS 列表里还有早期那条空的 `*._domainkey`（`v=DKIM1; p=`），直接删掉即可，它没用；
- 🧪 自测不想真发信时，给 Worker 设 `DEV_MODE=true`，发码接口会直接回显验证码，绕过邮件把流程走通。

## 总结

一条**全免费**的博客发信链路就跑通了：

```
浏览器 → auth.233002.xyz(Worker) → Resend API → 用户邮箱
收件(@233002.xyz) → Cloudflare Email Routing
```

- 发信：Resend 免费版（100 封/天，DKIM 对齐过 DMARC）；
- 收件：Cloudflare Email Routing（免费，早前邮件对接时配的）；
- 认证逻辑 + 用户库：Cloudflare Workers + D1（免费）；
- 反伪造：DMARC `p=reject`（免费）。

花了多少钱？**零**。踩的坑主要是「Worker 自带发信要付费」和「代码假成功掩盖了配置缺失」——希望这篇能帮你省下这几个小时的折腾。
