#!/usr/bin/env python3
"""Daily news generator: Scrapling scrape + Agnes AI summary (with retry)"""
import os, re, ssl, sys, json, urllib.request, time
from datetime import datetime, timedelta
from scrapling.parser import Selector

BLOG_DIR = os.environ.get("BLOG_DIR", ".")
AGNES_KEY = os.environ.get("AGNES_API_KEY", "")
if not AGNES_KEY:
    env_path = os.path.join(BLOG_DIR, ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("AGNES_API_KEY="):
                    AGNES_KEY = line.strip().split("=", 1)[1]
                    break

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
AI_API = "https://apihub.agnes-ai.com/v1/chat/completions"
MAX_RETRIES = 3


def retry(fn, label="", max_retries=MAX_RETRIES):
    last_err = None
    for attempt in range(1, max_retries + 1):
        try:
            return fn()
        except Exception as e:
            last_err = e
            if attempt < max_retries:
                wait = min(2 ** attempt * 2, 30)
                print(f"    [RETRY {attempt}/{max_retries}] {label}: {str(e)[:60]} (wait {wait}s)", flush=True)
                time.sleep(wait)
    print(f"    [FAIL] {label}: {last_err}", flush=True)
    return None


def fetch_html(url, timeout=25):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
        return r.read().decode('utf-8', errors='replace')


def scrape_articles(date_str):
    date_path = date_str.replace('-', '/')
    urls_to_try = [
        f'https://techcrunch.com/{date_path}/',
        f'https://techcrunch.com/{date_path}',
    ]

    html = None
    for url in urls_to_try:
        result = retry(lambda u=url: fetch_html(u), label=f"fetch {url.rsplit('/', 1)[-1]}", max_retries=2)
        if result:
            html = result
            break

    if not html:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        if date_obj > datetime.now():
            print(f"    [SKIP] Future date, no archive yet")
            return []
        print(f"    Fallback: scraping front page...", flush=True)
        result = retry(lambda: fetch_html('https://techcrunch.com/', timeout=30), label="fetch front page")
        if not result:
            return []
        html = result

    page = Selector(html)
    links = page.css('a[href*="techcrunch.com/2026/"]')
    articles = []
    seen = set()
    for a in links:
        title = a.css('::text').get()
        href = a.attrib.get('href', '')
        if title and href:
            title = title.strip()
            if title and title not in seen and len(title) > 15:
                seen.add(title)
                articles.append({'title': title, 'url': href})
    return articles[:5]


def scrape_content(url):
    def _fetch():
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15, context=ctx) as r:
            raw = r.read()
            ct = r.headers.get('Content-Type', '')
            charset = 'utf-8'
            if 'charset=' in ct:
                charset = ct.split('charset=')[-1].split(';')[0].strip()
            html = raw.decode(charset, errors='replace')
        page = Selector(html)
        for sel in ['.entry-content p', 'article p']:
            paras = page.css(sel)
            texts = [p.css('::text').get() for p in paras]
            texts = [t.strip() for t in texts if t and t.strip()]
            if len(texts) >= 2:
                return '\n'.join(texts[:5])
        return ""
    result = retry(_fetch, label=f"content {url.rsplit('/', 1)[-1][:30]}")
    return result or ""


def llm_summarize(date_display, articles):
    news_block = ""
    for art in articles:
        news_block += f"- 标题: {art['title']}\n  链接: {art['url']}\n"
        if art.get('content'):
            news_block += f"  摘要: {art['content'][:400]}\n"
    prompt = f"""你是科技博客中文编辑。根据以下今天从 TechCrunch 爬取的真实新闻，写一篇中文每日热点文章。

日期: {date_display}

新闻:
{news_block}

要求：
- 选 2-4 条重要新闻
- 每条写一段中文概述（50-100字），用自己的话总结
- 每条标注「[来源](url)」
- 写开头段落和结尾
- 全文 Markdown，总字数 800-1200 字
- 文章标题用 #，用第一条新闻的标题中文翻译，不要写"X月X日科技/每日热点"这种通用标题
- 新闻用 ##
- 不要编造事实"""
    payload = json.dumps({
        "model": "agnes-2.0-flash",
        "messages": [
            {"role": "system", "content": "你是一个专业的科技新闻中文编辑，严格基于提供的新闻内容，不编造事实。回复使用纯 Markdown。"},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 12000,
        "temperature": 0.7
    }).encode()

    def _call():
        req = urllib.request.Request(
            AI_API, data=payload,
            headers={"Authorization": f"Bearer {AGNES_KEY}", "Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=120, context=ctx) as r:
            return json.loads(r.read())["choices"][0]["message"]["content"]

    return retry(_call, label="Agnes API")


def generate(date_str):
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    date_display = date_obj.strftime("%Y年%m月%d日")
    post_path = os.path.join(BLOG_DIR, "source", "_posts", "daily-news", f"{date_str}-daily-hotspot.md")
    if os.path.exists(post_path):
        print(f"[{date_str}] Exists, skip")
        return
    print(f"[{date_str}] Scraping...", flush=True)
    articles = scrape_articles(date_str)
    if not articles:
        print(f"  No articles found, creating placeholder")
        md = f"""---
title: "{date_display} 科技资讯"
date: {date_str} 12:00:00
categories:
  - daily-news
tags:
  - 每日热点
description: "{date_display} 科技资讯。"
---
暂无今日科技资讯数据。"""
        with open(post_path, "w", encoding="utf-8") as f:
            f.write(md)
        return
    print(f"  Got {len(articles)} articles, fetching content...", flush=True)
    for art in articles:
        art['content'] = scrape_content(art['url'])
    print(f"  Summarizing via AI...", flush=True)
    result = llm_summarize(date_display, articles)
    if result and result.strip():
        body = result
        title_m = re.search(r'^#\s+(.+)', body, re.MULTILINE)
        title = title_m.group(1).strip() if title_m else articles[0]['title']
        body = re.sub(r'^#\s+.*\n', '', body, count=1).strip()
    else:
        if result is not None:
            print("  [WARN] AI returned empty content (reasoning model may need more tokens), using raw fallback", flush=True)
        else:
            print("  [WARN] AI API call failed after retries, using raw fallback", flush=True)
        body_parts = ["今天的科技圈发生了这些事。\n"]
        for art in articles[:4]:
            body_parts.append(f"## {art['title']}\n")
            if art.get('content'):
                body_parts.append(art['content'][:200] + "\n")
            body_parts.append(f"[来源]({art['url']})\n")
        body_parts.append(f"---\n以上就是 {date_display} 的科技资讯精选。关注「水星引力m」，每天带你看点不一样的。\n")
        body = "\n".join(body_parts)
        title = articles[0]['title']
    if '<!-- more -->' not in body:
        paras = body.split('\n\n')
        if len(paras) > 2:
            body = paras[0] + '\n\n<!-- more -->\n\n' + '\n\n'.join(paras[1:])
    first_para = body.split('\n\n')[0].replace('\n', ' ').strip()[:120]
    desc = first_para.replace('"', "'") if len(first_para) > 10 else articles[0]['title'][:120].replace('"', "'")
    title = title.replace('"', "'")
    md = f"""---
title: "{title}"
date: {date_str} 12:00:00
categories:
  - daily-news
tags:
  - 每日热点
description: "{desc}"
---

{body}
"""
    with open(post_path, "w", encoding="utf-8") as f:
        f.write(md)
    print(f"  [OK] {post_path}", flush=True)


if __name__ == "__main__":
    dates = sys.argv[1:]
    if not dates:
        today = datetime.now().strftime("%Y-%m-%d")
        dates = [today]
    for d in dates:
        generate(d)
