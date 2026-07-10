#!/usr/bin/env python3
"""Tech news scraper — TechCrunch, extracted from existing daily-news.py."""

import re
from typing import List

from . import (
    Article, retry, fetch_url, logger, HEADERS, CTX
)


def fetch_techcrunch_articles(date_str=None, limit=5) -> List[Article]:
    """Scrape TechCrunch for articles on a given date."""
    from datetime import datetime
    date_str = date_str or datetime.now().strftime("%Y-%m-%d")
    date_path = date_str.replace("-", "/")

    urls = [
        f"https://techcrunch.com/{date_path}/",
        f"https://techcrunch.com/{date_path}",
    ]

    html = None
    for url in urls:
        result = retry(lambda u=url: fetch_url(u), label=f"TC {url.rsplit('/', 1)[-1]}", max_retries=2)
        if result:
            html = result
            break

    if not html:
        # Fallback to front page
        result = retry(lambda: fetch_url("https://techcrunch.com/"), label="TC front page")
        if not result:
            return []
        html = result

    # Parse articles
    from scrapling.parser import Selector
    page = Selector(html, ignore_parser_errors=True)
    links = page.css('a[href*="techcrunch.com/202"]')
    articles = []
    seen = set()
    for a in links:
        title = a.css("::text").get()
        href = a.attrib.get("href", "")
        if title and href and "techcrunch.com/202" in href:
            title = title.strip()
            if title and title not in seen and len(title) > 15:
                seen.add(title)
                url_clean = href.split("?")[0].split("#")[0]
                articles.append(Article(title=title, url=url_clean, source="TechCrunch"))
    return articles[:limit]


def fetch_techcrunch_with_content(date_str=None, limit=5) -> List[Article]:
    """Fetch TechCrunch articles with full content."""
    articles = fetch_techcrunch_articles(date_str, limit)
    for art in articles:
        art.content = scrape_article_content(art.url)
    return articles


def scrape_article_content(url) -> str:
    """Scrape full text content from a TechCrunch article."""
    def _fetch():
        html = fetch_url(url)
        from scrapling.parser import Selector
        page = Selector(html, ignore_parser_errors=True)
        for sel in [".entry-content p", "article p", ".article-content p"]:
            paras = page.css(sel)
            texts = [p.css("::text").get() for p in paras]
            texts = [t.strip() for t in texts if t and t.strip()]
            if len(texts) >= 2:
                return "\n".join(texts[:5])
        return ""
    return retry(_fetch, label=f"content {url.rsplit('/', 1)[-1][:30]}") or ""


def fetch_techcrunch_summary(date_str=None, limit=5) -> str:
    """Get a formatted summary of today's TechCrunch articles."""
    articles = fetch_techcrunch_with_content(date_str, limit)
    if not articles:
        return ""
    parts = []
    for i, art in enumerate(articles, 1):
        parts.append(f"{i}. 标题: {art.title}")
        parts.append(f"   链接: {art.url}")
        if art.content:
            parts.append(f"   摘要: {art.content[:400]}")
    return "\n".join(parts)