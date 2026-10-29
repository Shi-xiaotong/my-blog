#!/usr/bin/env python3
"""Fact enrichment — fetch article body for hot-search topics so the AI writer
has real facts to ground on instead of inventing event mechanics.

Stdlib only (urllib + html.parser), no external deps.
Failure-tolerant: any fetch failure leaves item.summary empty (writer then
must fall back to "只写词条本身的事实" rule).
"""

import re
import time
import urllib.request
from html.parser import HTMLParser
from typing import List

from . import NewsItem, fetch_url, logger, HEADERS

# Article body extractors, in priority order (first match wins)
_CONTENT_SELECTORS = [
    "div[class*='article-content']",
    "div.article-content",
    "article",
    "div[class*='post-content']",
    "div[class*='TRS_UEDITOR']",
    "div[class*='main-content']",
    "div[id*='article']",
    "div[class*='content']",
]

# Search/list/JS-rendered pages that can't provide an article body
_SKIP_URL_PATTERNS = (
    "weibo.com", "s.weibo.com", "m.weibo.cn",
    "zhihu.com", "baidu.com/s", "top.baidu.com",
    "douyin.com", "tiktok.com",
    "bilibili.com/video/",
    "toutiao.com/trending/",  # JS-rendered, no server text
)


class _TextExtractor(HTMLParser):
    """Collect visible text from a subtree; skip script/style/nav/footer/header."""

    _SKIP_TAGS = {"script", "style", "noscript", "nav", "footer", "header", "aside", "form", "button"}
    _PARA_TAGS = {"p", "div", "section", "li", "br", "h1", "h2", "h3", "h4"}

    def __init__(self):
        super().__init__()
        self._skip_depth = 0
        self._chunks = []

    def handle_starttag(self, tag, attrs):
        if tag in self._SKIP_TAGS:
            self._skip_depth += 1
        elif tag in self._PARA_TAGS:
            if not self._skip_depth and self._chunks:
                self._chunks.append("\n")

    def handle_endtag(self, tag):
        if tag in self._SKIP_TAGS and self._skip_depth > 0:
            self._skip_depth -= 1

    def handle_data(self, data):
        if not self._skip_depth:
            self._chunks.append(data)

    def text(self):
        return "".join(self._chunks)


def _html_to_text(html: str, start_marker: str = "") -> str:
    """Extract readable plain text from HTML, preferring article body elements."""
    # Locate the best content container; fall back to whole-document text.
    target = html
    for sel in _CONTENT_SELECTORS:
        # CSS class/id matching via regex (good enough for common CMS markup)
        cls = sel.split("[", 1)[1] if "[" in sel else None
        if cls and "=" in cls:
            m = re.search(re.escape(sel), html)
        else:
            m = re.search(rf'<{re.escape(sel.split(" ", 1)[-1])}[\s>]', html)
        if m:
            target = html[m.start():]
            break

    extractor = _TextExtractor()
    try:
        extractor.feed(target)
    except Exception:
        pass
    text = re.sub(r"\s+", " ", extractor.text()).strip()
    return text


def fetch_article_text(url: str, timeout: int = 15) -> str:
    """Fetch a page and return cleaned body text (first ~800 chars). Empty on failure."""
    try:
        html = fetch_url(url, timeout=timeout)
        text = _html_to_text(html)
        # Collapse, strip leading boilerplate, cap length
        return text[:800]
    except Exception as e:
        logger.debug("正文抓取失败 [%s]: %s", url.split("/")[-1][:30], e)
        return ""


def _is_article_url(url: str) -> bool:
    if not url or not url.startswith("http"):
        return False
    for pat in _SKIP_URL_PATTERNS:
        if pat in url:
            return False
    return True


def enrich_facts(items: List[NewsItem], max_fetches: int = 8, timeout: int = 15) -> int:
    """Fetch body text for items that have a direct article URL.

    Mutates item.summary in place. Only items whose URL points at a real
    article (not a search/list page) are fetched. Caps total fetches to keep
    the pipeline fast. Returns number of items enriched.
    """
    enriched = 0
    for item in items:
        if enriched >= max_fetches:
            break
        if item.summary:
            continue  # already has facts
        if not _is_article_url(item.url):
            continue
        text = fetch_article_text(item.url, timeout=timeout)
        if len(text) >= 50:
            item.summary = text
            enriched += 1
            logger.info("  事实补充: %s → %d 字", item.title[:20], len(text))
        # Brief pacing between requests
        time.sleep(0.5)
    if enriched:
        logger.info("事实补充完成: %d/%d 条", enriched, len(items))
    return enriched


def format_facts_for_prompt(items: List[NewsItem]) -> str:
    """Format enriched facts as a prompt block. Empty string if nothing enriched."""
    lines = []
    for item in items:
        if item.summary:
            lines.append(f"- 【{item.title}】\n  事实依据: {item.summary[:400]}")
    if not lines:
        return ""
    return "以下是部分话题的文章正文摘录（事实依据，写事件经过只能基于这些内容）：\n" + "\n".join(lines)
