# Mercury Blog (233002.xyz) — AI Agent Development Guide

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
- Node v24 is at `/c/nvm4w/nodejs/node` (nvm4w)
- PATH must be prepended: `PATH="/c/nvm4w/nodejs:$PATH"`
- Build: `npm run build` (= `hexo generate && node _scripts/post-build.js && node _scripts/r2-upload.js`)

---

## Build System

### `npm run build` pipeline
1. `hexo generate` — generates static HTML from markdown
2. `node _scripts/post-build.js` — CSS/JS bundling, HTML post-processing
3. `node _scripts/r2-upload.js` — uploads assets to R2 (skipped if no credentials)

### Known Build Failures

#### `post-build.js` TDZ Error (Node 24)
- **Symptom:** `ReferenceError: Cannot access 'jsHash' before initialization`
- **Cause:** `const jsBundleName = \`bundle.${jsHash}\`` uses `jsHash` before its `const` declaration on line 48
- **Fix:** Change `const jsBundleName` to `let jsBundleName = 'bundle.js'` — assign real value after `jsHash` is computed
- **File:** `_scripts/post-build.js` line 41

#### `cwebp` Not Installed
- **Symptom:** `[post-build] ⚠️ cwebp 未安装，跳过图片优化`
- **Impact:** None — image optimization is skipped, everything else works fine
- **Fix:** `brew install libwebp` (macOS only, not needed on Windows)

---

## Daily Content Pipeline (GitHub Actions)

### How it works
- `_scripts/run_daily.py` is triggered by GitHub Actions (`daily-news.yml`) at 09:00 CST daily
- It scrapes TechCrunch and other sources, generates articles via Agnes AI, commits to repo
- Cloudflare Pages auto-detects the push and rebuilds the site

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
- System prompt: "你是「水星引力m」博客的博主 Mercury"
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

9. **禁用词检查**：`聚焦于, 旨在, 折射出, 上述动态, 与此同时, 值得关注的是, 引发了广泛讨论, 综上所述, 值得一提的是, 不可忽视的是, 标志着, 进一步加剧了, 后续进展值得持续跟踪`

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

### R2 Media Storage
- Bucket: `myblog` (key_prefix: `blog`)
- Domain: `img.233002.xyz`
- Images must be < 300 KB (10 GB free tier limit)
- Upload: `node _scripts/r2-upload.js` (needs credentials, skipped in CI)

---

## Common Pitfalls

### 1. post-build.js TDZ (Node 24)
`const` variables are not hoisted. `jsHash` must be declared before `jsBundleName`.

### 2. AI Thinking Leakage
Agnes 2.5 Flash leaks thinking. Always clean output. See the "AI Content Generation Flow" section above.

### 3. Two Separate AI Call Paths
`daily-news.py` has its own API call that doesn't use `generators/call_agnes()`. Both paths need cleaning.

### 4. Cloudflare Build Fails Silently
If `post-build.js` or `hexo generate` fails, Cloudflare Pages shows a build error but the old site stays up. Check Cloudflare Pages dashboard for build logs.

### 5. GitHub Push via HTTPS Blocked
Chinese GFW sometimes blocks HTTPS to GitHub. Fallback: SSH (`git@github.com:Shi-xiaotong/my-blog.git`). Always restore HTTPS after push.

### 6. LF/CRLF Warnings
Git on Windows shows "LF will be replaced by CRLF" warnings. Harmless — just informational.

### 7. Emotion/OwO System
New emoticons go in `source/emotion/` with `OwO.json` config. Run `node source/emotion/generate-owo.cjs` to regenerate.

### 8. Font Awesome v7
Local subset at `source/assets/fontawesome/css/fa-subset.min.css`. Preload fonts via inject.head in `themes/butterfly/_config.yml`.

---

## File Structure Quick Reference

```
my-blog/
├── _scripts/
│   ├── daily-news.py          # Daily news generator (scrape + AI)
│   ├── run_daily.py           # Entry point for GitHub Actions
│   ├── post-build.js          # Build post-processor (CSS/JS bundling)
│   ├── r2-upload.js           # R2 asset upload
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