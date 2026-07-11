#!/usr/bin/env python3
"""Tech news — uses Agnes AI instead of brittle web scraping.

TechCrunch changed their site structure and broke the scraper.
Now we use the Agnes AI API to generate a summary of recent tech news.
"""

from datetime import datetime
from typing import List

from . import Article, retry, logger
from generators import call_agnes


TECH_NEWS_PROMPT = """你是一个科技新闻编辑。请根据你的知识，列出今天（{date}）最重要的 5 条全球科技新闻。

要求：
1. 每条包含：标题（中文）+ 一句话简介 + 来源
2. 覆盖不同领域（AI、硬件、互联网、芯片、新能源等）
3. 新闻必须真实，不要虚构
4. 格式：每行一条，用 | 分隔：标题 | 简介 | 来源

示例：
Apple发布M4芯片 | Apple正式发布M4系列芯片，性能提升50% | The Verge
"""


def fetch_techcrunch_articles(date_str=None, limit=5) -> List[Article]:
    """Generate tech news summaries using Agnes AI (replaces broken scraper)."""
    date_str = date_str or datetime.now().strftime("%Y-%m-%d")
    date_display = datetime.strptime(date_str, "%Y-%m-%d").strftime("%Y年%m月%d日")

    prompt = TECH_NEWS_PROMPT.format(date=date_display)
    result = call_agnes(prompt, max_tokens=2000)
    if not result:
        return []

    articles = []
    for line in result.strip().split("\n"):
        line = line.strip().strip("-* ")
        if "|" in line:
            parts = [p.strip() for p in line.split("|")]
            title = parts[0] if len(parts) > 0 else ""
            summary = parts[1] if len(parts) > 1 else ""
            source = parts[2] if len(parts) > 2 else "科技媒体"
            if title and len(title) > 5:
                articles.append(Article(
                    title=title,
                    url="",
                    content=summary,
                    source=source,
                ))
    return articles[:limit]


def fetch_techcrunch_with_content(date_str=None, limit=5) -> List[Article]:
    """Fetch tech news with summaries (AI-generated)."""
    return fetch_techcrunch_articles(date_str, limit)


def fetch_techcrunch_summary(date_str=None, limit=5) -> str:
    """Get a formatted summary of today's tech news."""
    articles = fetch_techcrunch_with_content(date_str, limit)
    if not articles:
        return ""
    parts = []
    for i, art in enumerate(articles, 1):
        parts.append(f"{i}. 标题: {art.title}")
        parts.append(f"   来源: {art.source}")
        if art.content:
            parts.append(f"   摘要: {art.content[:400]}")
    return "\n".join(parts)