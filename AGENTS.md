# 水星引力m (233002.xyz) — AI Agent Development Guide

## Project Overview

Hexo 7 + Butterfly 5.5.4 blog, deployed via Cloudflare Pages (auto-deploy on push to GitHub).
Content: tech articles, daily news digests, anime, tools, games.

**Tech stack:** Node.js 24, Python 3.11, Hexo, Stylus, Pug, Cloudflare Workers/Pages, R2.

**Repo:** `github.com/Shi-xiaotong/my-blog` (master branch)

---

## Git Workflow

### Remote
- Default: `https://github.com/Shi-xiaotong/my-blog.git`
- When HTTPS is blocked (GFW): switch to `git@github.com:Shi-xiaotong/my-blog.git` (SSH), then switch back after push
- **Always restore HTTPS after SSH push** — `git remote set-url origin https://github.com/Shi-xiaotong/my-blog.git`

### Commit Rules
- One commit per logical change (don't bundle unrelated fixes)
- Commit message format: `type: description` (e.g. `fix:`, `feat:`, `chore:`)
- **Commit before making changes** — the user workflow is: commit → make changes → preview → user approves "push" → push
- Never push without user approval unless it's an urgent fix

### Node.js

`node` 路径随机器变化，**不要照抄路径**，先确认再执行：

```
for c in node nodejs; do command -v $c && $c -v; done
```

- **Windows**: `C:\Users\Administrator\AppData\Local\nvm\v24.16.0` (nvm-windows)，切换 `nvm use 24.16.0`，PATH 前置 `PATH="/c/nvm4w/nodejs:$PATH"`
- **macOS (当前机器)**: 默认 shell 中 `node` 常不在 PATH。可用 `/Users/shixiaotong/.hermes/node/bin/node` (v22)，或 `~/.nvm/versions/node/v24.15.0/bin/node` (nvm，需先 `source ~/.zshrc`)
- Build: `npm run build` (= `hexo generate && node _scripts/post-build.js`)

---

## Build System

### `npm run build` pipeline
1. `hexo generate` — generates static HTML from markdown
2. `node _scripts/post-build.js` — CSS/JS bundling, HTML post-processing
3. 媒体上传走 `hexo deploy`（hexo-cloudflare-r2-media，配置见 `_config.yml` 的 `r2_media` + `deploy: - type: r2-media`）。**只在本地手动执行，CI / Cloudflare Pages 不跑 deploy**

### Known Build Failures

#### `post-build.js` TDZ Error (Node 24)
- **Symptom:** `ReferenceError: Cannot access 'jsHash' before initialization`
- **Cause:** `const jsBundleName = \`bundle.${jsHash}\`` uses `jsHash` before its `const` declaration on line 48
- **Fix:** Change `const jsBundleName` to `let jsBundleName = 'bundle.js'` — assign real value after `jsHash` is computed
- **File:** `_scripts/post-build.js` line 41

#### `cwebp` Not Installed
- **Symptom:** `[post-build] ⚠️ cwebp 未安装，跳过图片优化`
- **Impact:** 静默降级：本机有 cwebp 时 `public/` 内相对引用的图会被转 WebP，CI / Cloudflare Pages 无 cwebp 则跳过，线上用原图。**此本地优化与 R2 托管的图无关**（见 Deployment → 媒体 R2 上传流程）。
- **Fix:** `brew install libwebp` (macOS)；CI 需在构建前装 `webp`。注意 Cloudflare Pages 的构建命令在 CF 控制台配置，不在本仓库内，改不到就接受"线上无 WebP"这一事实。想让 R2 图也是 webp，得在放进 `source/_posts/<文章>/` 前自己转好。

---

## Daily Content Pipeline (GitHub Actions)

### How it works
- `_scripts/run_daily.py` is triggered by GitHub Actions (`daily-news.yml`) at 09:00 CST **every Monday**
- It scrapes AniList (anime), TechCrunch and GitHub Trending, generates articles via Agnes AI, commits to repo
- Cloudflare Pages auto-detects the push and rebuilds the site

### ⚠️ 题材范围（2026-10-30 起）
- **综合热搜（微博/百度/头条/抖音/知乎）已停用**，不再生成 daily-news 文章 —— 时政与社会新闻风险高、与博客定位无关
- 只生成两类：`anime`（动漫）与 `tech`（技术/开源），`editor_decide()` 只允许返回这两种 type
- `_scripts/scrapers/news_sources.py`、`hot_comments.py`、`fact_fetcher.py` 已无调用方，属死代码

### ⚠️ 标题规则（2026-10-30 起）
- 自动生成的文章标题要像**一个人在更新博客**，不要像榜单/简报/运营号
- `anime_writer.py` 与 `tech_writer.py` 的 prompt 里各有一份规则：禁止词表（当季新番、热度榜、速览、今天科技圈有点热闹…）+ 语气示例 + 10~30 字
- **光写进 prompt 不够**：两处都有 `_validate_title()` 在生成后校验，不合格就带提示重试一次，再不合格用数据里的作品名兜底
- 合格条件：不含禁用词、长度合格、且**有具体锚点**（作品名，或续作/原创/弃番/完结/制作公司这类具体现象）
- **正文必须用 `##` 小标题分节**（每部作品一个 `##`），不能用 `**加粗**` 段落冒充小标题——否则目录（TOC）为空、标题装饰显示不出来
- 生成器兜底：若 AI 仍用独占一行的 `**加粗**` 冒充（`_promote_bold_headings`），会把它们提升为 `##` 小标题

### ⚠️ 去重在数据层，不只是 prompt
- 动漫：`_filter_excluded()` 在 `format_anime_for_prompt` 之前就剔除近 60 天写过的作品
  - 两边都做简繁折叠（`_fold`，無職転生 ↔ 无职转生）和去季数后缀（`_variants`，第3期/Ⅲ/Season 2）
  - 冷门补番角度用 `fetch_top_rated` 前先过滤，不足 5 部就回退当季数据；最终不足 3 部就换数据源，仍不够就少写
- 技术：`tech_writer._filter_excluded()` 先剔主题重合的新闻，剔完没东西就不写这一期
- 抽关键词做相似度比较时**必须从原始文本抽**：`_norm()` 会吃掉空格，`Blackwell Ultra` 会变成一个词导致永远匹配不上

### ⚠️ 内容安全闸门
- `_scripts/content_guard.py`：`scan(text)` 命中敏感题材则返回规则名列表
  - `run_daily.py` 写盘前调用，命中即丢弃不生成
  - CI 在 commit 前再跑一次 `python _scripts/content_guard.py --delete <files>`，命中即删
- 规则表在 `SENSITIVE_RULES`，可按题材类别追加；项目根 `blocklist.txt`（一行一个关键词/正则）可加自定义词，无需改代码
- 注意：这是**关键词拦截，不是审核**，只能挡明显的时政/案件/灾难类，不能替代人工过目

### The AI Content Generation Flow
1. `daily-news.py` → `scrape_articles()` → `scrape_content()` → `llm_summarize()`
2. `llm_summarize()` calls Agnes API directly (NOT through `generators/call_agnes()`)
3. The response is written to `source/_posts/daily-news/{date}-digest.md`

### ⚠️ CRITICAL: AI Thinking Leakage

**Problem:** Agnes 2.5 Flash outputs its thinking/self-review process into the article content. This includes lines like:
- `Wait, constraint 6 says '话题之间用 --- 分隔线隔开'`
- `*Topic 1: FIFA前主席*`
- `Check tone per topic:`
- `Self-Correction/Refinement during thought:`

**Two separate cleaning paths exist — both must be maintained:**

#### Path 1: `generators/__init__.py` → `call_agnes()`
Used by the `generators` module for other article types. Has:
- `_clean_reasoning_output()` — regex-based cleaning of thinking patterns
- `extract_article_from_leaky_output()` — tries 4 strategies to find the real article start

#### Path 2: `daily-news.py` → `llm_summarize()`  ← **This one was broken**
`daily-news.py` has its OWN API call that bypasses `call_agnes()`. The fix was to add the same cleaning logic inline:
```python
from generators import extract_article_from_leaky_output, _clean_reasoning_output
content = _clean_reasoning_output(content)
_, cleaned = extract_article_from_leaky_output(content)
```

**When adding new content generators, ALWAYS:**
1. Use `call_agnes()` from `generators/__init__.py` if possible
2. If you must call the API directly, import and apply `extract_article_from_leaky_output` + `_clean_reasoning_output`
3. Add a `description` safety check — the AI thinking text often ends up in the `description` frontmatter field

### AGENTS.md (this file)
- When adding new rules/pitfalls to this file, also update the cleaning patterns in `_clean_reasoning_output` and `_strip_review` to match
- The following lists must be kept in sync across files:
  - `_clean_reasoning_output()` in `generators/__init__.py`
  - `_strip_review()` in `generators/__init__.py`
  - `build_post()` safety net in `generators/__init__.py`
  - `llm_summarize()` in `daily-news.py`

---

## Content Generation Rules

### Forbidden Words (AI cliché blacklist)
Must not appear in generated content:
```
聚焦于, 旨在, 折射出, 上述动态, 与此同时,
值得关注的是, 引发了广泛讨论, 综上所述, 值得一提的是,
不可忽视的是, 标志着, 进一步加剧了, 后续进展值得持续跟踪
```

### Writing Style
- System prompt: "你是「水星引力m」博客的博主"
- First-person voice, conversational tone
- At least one subjective expression per article ("我觉得"/"说实话"/"好家伙")
- Start directly, no preamble
- End casually, like chatting with a friend

### Article Format (Daily News)

```
格式模板：
# 标题（单 #，15-25字，有钩子，不用"X月X日热搜"这种通用标题）

## 话题一（## 双井号）
正文...

<!-- more -->（第一段后插入，用于首页卡片预览）

## 话题二
正文...

## 话题三
正文...

---（结尾剪刀虚线，且只在文章结尾出现一次）

互动结尾（"你们怎么看？"类问题）
```

### 严格规则（踩坑记录，不要违反）

1. **`---` 分隔线只在文章结尾出现一次**，版权声明上方。不要在话题之间加 `---`，否则每个话题后面都会出现剪刀虚线样式，破坏阅读体验。

2. **标题不要用"名词、名词、名词——今天热搜XX"的格式**。这是用户明确不喜欢的风格。标题应该聚焦一个核心话题，例如：
   - ✅ `哈兰德身价破纪录，但世界杯公信力先破了`
   - ❌ `台风登陆、医疗翻车、长辈模式劝退：今天热搜有点重`

3. **`#` 标题用单井号，话题用 `##` 双井号**。AI 经常搞混，必须检查。

4. **`<!-- more -->` 必须存在**，放在第一段之后。没有它，首页卡片不会显示预览。

5. **description 字段**必须从正文中提取，不能包含 AI 思考过程、自检内容、格式指令等。

6. **正文中不要出现任何 AI 思考痕迹**，包括：
   - `*Topic N:*` 标记
   - `Wait, constraint N says...`
   - `Check tone per topic:`
   - `Self-Correction/Refinement during thought:`
   - `Let's draft carefully.`
   - 禁用词检查列表、格式检查列表等

7. **Font Awesome 用 `all.min.css`**（完整版），不要用 `fa-subset.min.css`（子集版缺少大部分图标）。

8. **每篇文章必须有至少一句主观表达**："说实话"/"我觉得"/"好家伙"/"个人看法"。

---

## Deployment

### Cloudflare Pages
- Auto-deploys on every push to master branch
- Build command: `npm run build`
- Output directory: `public/`
- No manual deploy needed — just push to GitHub

### Workers
- `workers/src/index.js` — main worker (auth, proxy)
- `workers/src/auth-worker.js` — OAuth handling
- Deploy via `wrangler deploy` (separate from Pages)

### 媒体 / 图片：R2 上传流程

图片**不在 git 仓库**（仓库只提交 markdown 里的引用 URL），实际文件在 Cloudflare R2：
`bucket=myblog`、`key_prefix=blog`（对象键 = `blog/<文件名>`），对外域名 `https://img.233002.xyz`。
本地 `source/_posts/<分类>/<文章>/` 下的原图会随 `hexo deploy` 上传（这些原图本身也进 git）。

**自动上传（新文章推荐）**
1. 把图片（**建议直接存成 `.webp`**）放进 `source/_posts/<分类>/<文章slug>/` 目录（与 `<文章slug>.md` 同级文件夹）。
2. 文章内用相对路径引用：`![说明](./photo.webp)` 或 `![说明](photo.webp)`。
3. 加载凭证（⚠️ 无 dotenv，不会自动加载）：`set -a; source .env; set +a`
4. 上传：`npx hexo deploy`（deployer 类型 `r2-media`）。它会：
   - 把该文件夹里的媒体**原样上传**到 R2 的 `blog/<文件名>`（**不转码**）；
   - 自动把生成 HTML 里的本地相对图片 URL 改写成 `https://img.233002.xyz/blog/<文件名>`（即使文章硬编码了 R2 绝对 URL，只要原图在文件夹里仍会上传）；
   - 用 `.r2-media-manifest.json` 记哈希，未变动的跳过；
   - 默认 `delete_stale: true`：删掉 source 已不存在的图片对应的 R2 对象，并清掉 `public/` 下本地媒体。
5. 验证：`curl -I https://img.233002.xyz/blog/photo.webp` 应返回 `200`。

**关键注意**
- **不会自动转 webp**：deployer 只按原扩展名上传，不转码。要 webp 必须自己先存成 `.webp`。`_scripts/post-build.js` 的 cwebp 本地优化（转 `public/` 图 + 包 `<picture>`）与 R2 无关，且当前因缺 `cwebp` 二进制被跳过，不影响线上 R2。
- **扁平命名冲突**：对象键是 `blog/<文件名>`，**不同文章同文件名会互相覆盖**。命名加前缀（如 `jinan-`、`nvidia-`）避免撞名。
- **CI / Cloudflare Pages 不跑 `hexo deploy`**：只 push 代码不会上传新图，图片只在你本地跑 deploy 时才上 R2（这也是改引用后缀前图片 404 的原因）。
- **凭证**在 `.env`（已 gitignore）：`R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_ENDPOINT` / `R2_BUCKET` / `R2_PUBLIC_URL`；`AGNES_API_KEY`、`CF_R2_TOKEN` 当前为空。已用只读 `ListObjects` 验证可用。失效时去 Cloudflare 面板 → R2 → myblog → 管理 R2 API 令牌 重新生成。
- 历史孤儿：`blog/myblog-cover.webp`、`blog/videos/blog-intro-v3.mp4` 已删除。

---

## Common Pitfalls

- **CF 构建静默失败**：`post-build.js` / `hexo generate` 出错时，Cloudflare Pages 只报构建错误、旧站仍在。查 CF Pages 控制台构建日志。
- **GFW 挡 GitHub HTTPS**：改 SSH（`git@github.com:Shi-xiaotong/my-blog.git`），推完务必还原 HTTPS。
- **Windows CRLF 警告**：无害，仅提示。
- **Emotion/OwO**：新表情放 `source/emotion/`，跑 `node source/emotion/generate-owo.cjs` 重生成。
- **Font Awesome v7**：本地子集 `source/assets/fontawesome/css/fa-subset.min.css`，用 `inject.head` 预加载。
- **图片 / 后缀坑**：见 Deployment → 媒体 R2 上传流程；改 `.png/.jpg`→`.webp` 前先 `curl -I` 确认目标 webp 存在（同目录 `blog-feature-*` 仅 png 可达，别误改）。
- **TDZ / AI 思考泄漏**：分别见 Build System → Known Build Failures、Daily Content Pipeline → AI Thinking Leakage。

---

## File Structure Quick Reference

```
my-blog/
├── _scripts/
│   ├── daily-news.py          # Daily news generator (scrape + AI)
│   ├── run_daily.py           # Entry point for GitHub Actions
│   ├── post-build.js          # Build post-processor (CSS/JS bundling)
│   ├── generators/
│   │   └── __init__.py        # AI content generation core (cleanup, API, build_post)
│   └── scrapers/
│       └── __init__.py        # Web scraping helpers
├── source/
│   ├── _posts/
│   │   ├── daily-news/        # Daily digest articles (auto-generated)
│   │   └── tech/              # Tech articles
│   ├── tools/                 # Tool pages (standalone HTML)
│   ├── games/                 # Game pages
│   ├── anime/                 # Anime page
│   └── emotion/               # Emoticon system (OwO.json + aru/ + twemoji/)
├── workers/
│   └── src/
│       ├── index.js           # CF Worker main
│       └── auth-worker.js     # OAuth worker
├── .github/workflows/
│   └── daily-news.yml         # GitHub Actions daily content
├── _config.yml                # Hexo config
├── themes/butterfly/
│   ├── _config.yml            # Butterfly theme config (inject, menu, colors)
│   └── layout/                # Pug templates
└── AGENTS.md                  # ← This file
```

---

## Manual Post Templates (scaffolds/)

手写稿（生活 / 游戏 / 历史 / 科学 / 推荐 / 部分技术）用 Hexo 原生 `scaffolds/` 起步，**只填内容、不操心排版**：

- `hexo new post "标题"` —— 通用默认（`scaffolds/post.md`）
- `hexo new review "书名/片名/游戏名"` —— 书 / 影 / 游评（`scaffolds/review.md`）
- `hexo new essay "主题"` —— 历史 / 科普 / 随笔（`scaffolds/essay.md`）

富标签（note / label / hide / timeline / tabs / blockquote）、禁用手写 `---` 结尾（变剪刀）、必带 `<!-- more -->`、用 `##` 分节出目录等规则，见 **`docs/WRITING.md`**（写稿前先读）。

> 自动稿（anime / tech）排版写死在 `_scripts/generators/*.py` 的 prompt 里，不在此体系。