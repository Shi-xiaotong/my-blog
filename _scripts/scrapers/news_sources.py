#!/usr/bin/env python3
"""Chinese social media hot search scrapers — ported from feishu-daily-bots."""

import json
import re
from typing import List

from . import (
    NewsItem, fetch_url, safe_fetch, retry, logger, HEADERS
)


def fetch_weibo_hot(limit=10) -> List[NewsItem]:
    """微博热搜"""
    data = json.loads(fetch_url("https://weibo.com/ajax/side/hotSearch"))
    items = []
    for i in data.get("data", {}).get("realtime", [])[:limit]:
        word = i.get("word", "")
        if word:
            items.append(NewsItem(
                title=word,
                url=f"https://s.weibo.com/weibo?q={word}",
                source="微博",
                hot_value=str(i.get("num", "")),
            ))
    return items


def fetch_baidu_hot(limit=10) -> List[NewsItem]:
    """百度热搜"""
    html = fetch_url("https://top.baidu.com/board?tab=realtime")
    match = re.search(r"<!--s-data:(.*?)-->", html, re.DOTALL)
    if not match:
        return []
    data = json.loads(match.group(1))
    items = []
    for card in data.get("data", {}).get("cards", []):
        for item in card.get("content", []):
            word = item.get("word", "")
            if word:
                items.append(NewsItem(
                    title=word,
                    url=item.get("url", ""),
                    source="百度",
                    hot_value=str(item.get("hotScore", "")),
                ))
                if len(items) >= limit:
                    return items
    return items


def fetch_toutiao_hot(limit=10) -> List[NewsItem]:
    """头条热搜"""
    data = json.loads(fetch_url("https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc",
                                headers={**HEADERS, "Referer": "https://www.toutiao.com/"}))
    items = []
    for i in data.get("data", [])[:limit]:
        title = i.get("Title", "")
        if title:
            items.append(NewsItem(
                title=title,
                url=i.get("Url", ""),
                source="头条",
                hot_value=str(i.get("HotValue", "")),
            ))
    return items


def fetch_douyin_hot(limit=10) -> List[NewsItem]:
    """抖音热搜"""
    data = json.loads(fetch_url(
        "https://www.douyin.com/aweme/v1/web/hot/search/list/",
        headers={**HEADERS, "Referer": "https://www.douyin.com/"},
    ))
    items = []
    for i in data.get("data", {}).get("word_list", [])[:limit]:
        word = i.get("word", "")
        if word:
            items.append(NewsItem(
                title=word,
                url=f"https://www.douyin.com/search/{word}",
                source="抖音",
                hot_value=str(i.get("hot_value", "")),
            ))
    return items


def fetch_bilibili_hot(limit=10) -> List[NewsItem]:
    """B站热门"""
    data = json.loads(fetch_url(
        "https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all",
        headers={**HEADERS, "Referer": "https://www.bilibili.com/"},
    ))
    items = []
    for i in data.get("data", {}).get("list", [])[:limit]:
        title = i.get("title", "")
        if title:
            items.append(NewsItem(
                title=title,
                url=f"https://www.bilibili.com/video/{i.get('bvid', '')}",
                source="B站",
                hot_value=str(i.get("stat", {}).get("view", "")),
            ))
    return items


def fetch_zhihu_hot(limit=10) -> List[NewsItem]:
    """知乎热搜"""
    data = json.loads(fetch_url(
        "https://www.zhihu.com/api/v4/search/top_search",
        headers={**HEADERS, "Referer": "https://www.zhihu.com/"},
    ))
    items = []
    for i in data.get("top_search", {}).get("words", [])[:limit]:
        query = i.get("query", "")
        if query:
            items.append(NewsItem(
                title=query,
                url=f"https://www.zhihu.com/search?type=content&q={query}",
                source="知乎",
            ))
    return items


# ── Registry ──

ALL_NEWS_SOURCES = {
    "微博": fetch_weibo_hot,
    "百度": fetch_baidu_hot,
    "头条": fetch_toutiao_hot,
    "抖音": fetch_douyin_hot,
    "B站": fetch_bilibili_hot,
    "知乎": fetch_zhihu_hot,
}


def fetch_all_news(limit_per_source=5, sources=None) -> dict:
    """Fetch from all (or selected) sources, deduplicate, group by source."""
    if sources is None:
        sources = list(ALL_NEWS_SOURCES.keys())

    all_items = []
    for name in sources:
        func = ALL_NEWS_SOURCES.get(name)
        if not func:
            continue
        items = safe_fetch(name, func, limit_per_source)
        all_items.extend(items)

    # Deduplicate
    from . import deduplicate
    merged = deduplicate(all_items)
    merged.sort(key=lambda x: (-len(x.sources), x.title))

    # Group
    result = {}
    for item in merged:
        key = "多平台热议" if len(item.sources) > 1 else item.source
        if key not in result:
            result[key] = []
        result[key].append(item)

    return result


def fetch_all_news_flat(limit_per_source=5, sources=None) -> list:
    """Fetch from all sources, return flat deduplicated list."""
    if sources is None:
        sources = list(ALL_NEWS_SOURCES.keys())

    all_items = []
    for name in sources:
        func = ALL_NEWS_SOURCES.get(name)
        if not func:
            continue
        items = safe_fetch(name, func, limit_per_source)
        all_items.extend(items)

    from . import deduplicate
    merged = deduplicate(all_items)
    merged.sort(key=lambda x: (-len(x.sources), x.title))
    return merged