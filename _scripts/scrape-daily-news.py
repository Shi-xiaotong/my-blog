#!/usr/bin/env python3
"""
Scrape real news from TechCrunch via Scrapling + Agnes AI → Generate daily-news articles.
(with retry) Usage:
  python3 _scripts/scrape-daily-news.py              # Generate missing recent dates
  python3 _scripts/scrape-daily-news.py --all         # Regenerate all 38 dates
  python3 _scripts/scrape-daily-news.py 2026-07-08   # Specific date
"""
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

# SSL verification enabled by default — no custom context needed for urllib
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}
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
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode('utf-8', errors='replace')


def fetch_html_with_encoding(url, timeout=20):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read()
        charset = 'utf-8'
        ct = r.headers.get('Content-Type', '')
        if 'charset=' in ct:
            charset = ct.split('charset=')[-1].split(';')[0].strip()
        return raw.decode(charset, errors='replace')


def scrape_date_archive(date_str):
    url = f'https://techcrunch.com/{date_str.replace("-", "/")}/'
    result = retry(lambda: fetch_html(url), label=f"archive {date_str}")
    if not result:
        return []
    page = Selector(result)
    links = page.css('a[href*="/' + datetime.now().strftime('%Y') + '/"]')
    articles = []
    seen = set()
    for a in links:
        title = a.css('::text').get()
        href = a.attrib.get('href', '')
        if title and href and 'techcrunch.com/' + datetime.now().strftime('%Y') + '/' in href:
            title = title.strip()
            if title and title not in seen and len(title) > 15:
                seen.add(title)
                articles.append({'title': title, 'url': href})
    return articles[:6]


def scrape_article_content(url):
    def _fetch():
        html = fetch_html_with_encoding(url)
        page = Selector(html)
        for sel in ['.entry-content p', 'article p', '.article-content p']:
            paras = page.css(sel)
            texts = [p.css('::text').get() for p in paras]
            texts = [t.strip() for t in texts if t and t.strip()]
            if len(texts) >= 2:
                return '\n'.join(texts[:5])
        return ""
    return retry(_fetch, label=f"content {url.rsplit('/', 1)[-1][:30]}") or ""


def llm_summarize(date_str, articles_data):
    news_block = ""
    for i, art in enumerate(articles_data, 1):
        news_block += f"\n{i}. 标题: {art['title']}\n   链接: {art['url']}\n"
        if art.get('content'):
            news_block += f"   内容摘要: {art['content'][:500]}\n"

    prompt = f"""你是「水星引力m」科技博客的中文编辑。请根据以下从 TechCrunch 爬取的真实新闻，撰写一篇中文每日热点文章。

日期: {date_str}

爬取到的新闻:
{news_block}

要求:
1. 从以上新闻中挑选 2-4 条最值得关注的（优先选 AI/科技相关）
2. 每条新闻写一段中文概述（50-100字），用自己的话总结，不要逐字翻译英文
3. 每条新闻后面标注原文来源链接（用「[来源](url)」格式）
4. 写一个简短的开头段落和高潮结尾
5. 全文用 Markdown 格式
6. 标题用 ## 二级标题
7. 总字数 800-1200 字
8. 文章标题用 # 一级标题，要吸引人

输出格式:
# 文章标题

开头段落

## 新闻标题1

中文概述

[来源](url)

## 新闻标题2

中文概述

[来源](url)

---

以上就是 {date_str} 的科技资讯精选。关注「水星引力m」，每天带你看点不一样的。"""

    payload = json.dumps({
        "model": "agnes-2.5-flash",
        "messages": [
            {"role": "system", "content": "你是一个专业的科技新闻中文编辑，擅长将英文科技新闻总结为通俗易懂的中文短文。你不编造事实，严格基于提供的新闻内容。回复使用纯 Markdown。"},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 2000,
        "temperature": 0.7
    }).encode()

    def _call():
        req = urllib.request.Request(
            AI_API, data=payload,
            headers={"Authorization": f"Bearer {AGNES_KEY}", "Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read())["choices"][0]["message"]["content"]

    return retry(_call, label="Agnes API")


def extract_title(article_text):
    m = re.search(r'^#\s+(.+)', article_text, re.MULTILINE)
    return m.group(1).strip() if m else "科技资讯精选"


def extract_description(article_text):
    lines = article_text.split('\n')
    for line in lines:
        line = line.strip()
        if line and not line.startswith('#') and not line.startswith('>') and not line.startswith('---') and not line.startswith('<!--'):
            return line[:120]
    return ""


def generate_article(date_str, force=False):
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    date_display = date_obj.strftime("%Y年%m月%d日")

    post_path = os.path.join(BLOG_DIR, "source", "_posts", "daily-news", f"{date_str}-digest.md")
    if os.path.exists(post_path) and not force:
        print(f"  [SKIP] File exists")
        return

    print(f"\n[{date_str}] Scraping TechCrunch archive...")
    articles = scrape_date_archive(date_str)

    if not articles:
        print(f"  [FAIL] No articles found")
        placeholder = f"""---
title: "{date_display} 科技资讯"
date: {date_str} 12:00:00
categories:
  - daily-news
tags:
  - 每日热点
description: "{date_display} 科技资讯。"
---

暂无可用数据。
"""
        with open(post_path, "w", encoding="utf-8") as f:
            f.write(placeholder)
        return

    print(f"  Found {len(articles)} articles, fetching content...")
    for art in articles:
        print(f"    Fetching: {art['title'][:50]}...")
        art['content'] = scrape_article_content(art['url'])

    print(f"  Feeding to Agnes AI for summarization...")
    result = llm_summarize(date_display, articles)

    if not result:
        body_parts = [f"今天的科技圈发生了这些事。\n", "<!-- more -->\n"]
        for art in articles[:4]:
            body_parts.append(f"## {art['title']}\n")
            if art.get('content'):
                body_parts.append(art['content'][:200] + "\n")
            body_parts.append(f"[来源]({art['url']})\n")
        body_parts.append(f"---\n")
        body_parts.append(f"以上就是 {date_display} 的科技资讯精选。关注「水星引力m」，每天带你看点不一样的。\n")
        body = "\n".join(body_parts)
        paras = body.split('\n\n')
        if len(paras) > 2:
            body = paras[0] + '\n\n<!-- more -->\n\n' + '\n\n'.join(paras[1:])
        body = body.replace('<!-- more -->\n\n<!-- more -->', '<!-- more -->')
        main_title = articles[0]['title'].replace('"', "'")
        desc = articles[0]['title'][:120]
    else:
        body = result
        main_title = extract_title(result)
        if '#' in main_title:
            body = re.sub(r'^#\s+.*\n', '', body, count=1).strip()
        desc = extract_description(result)

    if '<!-- more -->' not in body:
        paras = body.split('\n\n')
        if len(paras) > 2:
            body = paras[0] + '\n\n<!-- more -->\n\n' + '\n\n'.join(paras[1:])

    frontmatter = [
        "---",
        f"title: \"{main_title}\"",
        f"date: {date_str} 12:00:00",
        "categories:",
        "  - daily-news",
        "tags:",
        "  - 每日热点",
        f"description: \"{desc}\"",
        "---",
    ]

    md = "\n".join(frontmatter) + "\n\n" + body + "\n"
    os.makedirs(os.path.dirname(post_path), exist_ok=True)
    with open(post_path, "w", encoding="utf-8") as f:
        f.write(md)
    print(f"  [OK] {post_path}")


def main():
    force = '--all' in sys.argv or '--force' in sys.argv
    specific_date = None
    for arg in sys.argv[1:]:
        if re.match(r'^\d{4}-\d{2}-\d{2}$', arg):
            specific_date = arg

    if specific_date:
        generate_article(specific_date, force=True)
        return

    if '--all' in sys.argv:
        start = datetime(datetime.now().year, 6, 1)
        end = datetime.now()
    else:
        end = datetime.now()
        start = end - timedelta(days=3)

    current = start
    while current <= end:
        date_str = current.strftime("%Y-%m-%d")
        generate_article(date_str, force=force)
        current += timedelta(days=1)

    print(f"\nDone.")


if __name__ == "__main__":
    main()
