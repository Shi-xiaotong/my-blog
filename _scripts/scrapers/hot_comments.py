#!/usr/bin/env python3
"""Hot comments scraper — fetch top comments from social media for trending topics."""

import json
import urllib.parse
from typing import List, Dict

from . import NewsItem, fetch_url, retry, logger, HEADERS


def fetch_weibo_comments(topic: str, limit=3) -> List[str]:
    """Fetch top comments from Weibo for a given topic."""
    try:
        encoded = urllib.parse.quote(topic)
        url = f"https://weibo.com/ajax/statuses/search?q={encoded}&type=comment&page=1"
        data = json.loads(fetch_url(url, timeout=10))
        comments = []
        for status in data.get("data", [])[:limit]:
            text = status.get("text", "")
            if text:
                import re
                clean = re.sub(r"<[^>]+>", "", text).strip()
                if clean:
                    comments.append(clean)
        return comments
    except Exception as e:
        logger.debug("微博评论抓取失败 [%s]: %s", topic[:20], e)
        return []


def fetch_bilibili_comments(bvid: str, limit=3) -> List[str]:
    """Fetch top comments from a Bilibili video."""
    try:
        url = f"https://api.bilibili.com/x/v2/medialist/resource/comments?type=1&biz_id={bvid}&ps={limit}"
        data = json.loads(fetch_url(
            url,
            headers={**HEADERS, "Referer": "https://www.bilibili.com/"},
            timeout=10,
        ))
        comments = []
        for reply in data.get("data", {}).get("replies", [])[:limit]:
            content = reply.get("content", {}).get("message", "")
            if content:
                comments.append(content)
        return comments
    except Exception as e:
        logger.debug("B站评论抓取失败 [%s]: %s", bvid, e)
        return []


def fetch_hot_comments(news_items: List[NewsItem], max_topics=5, comments_per_topic=2) -> Dict[str, List[str]]:
    """
    Fetch hot comments for the top N news topics.
    Returns {topic_title: [comment_text, ...]}
    """
    result = {}
    for item in news_items[:max_topics]:
        topic = item.title
        if not topic:
            continue

        comments = []

        # Try Weibo comments first
        if item.source in ("微博", "多平台热议", ""):
            wb_comments = fetch_weibo_comments(topic, comments_per_topic)
            comments.extend(wb_comments)

        # Try Bilibili comments if it's a B站 item
        if item.source == "B站":
            # Extract BVID from URL
            bvid = item.url.split("/")[-1] if item.url else ""
            if bvid and bvid.startswith("BV"):
                bl_comments = fetch_bilibili_comments(bvid, comments_per_topic)
                comments.extend(bl_comments)

        if comments:
            result[topic] = comments[:comments_per_topic]

    logger.info("热评: 获取 %d 个话题的评论", len(result))
    return result


def format_comments_for_prompt(comments: Dict[str, List[str]]) -> str:
    """Format hot comments for inclusion in an AI prompt."""
    if not comments:
        return ""
    parts = ["以下是部分话题的网友评论（可作为素材）："]
    for topic, texts in comments.items():
        for t in texts:
            parts.append(f"- [{topic}] \"{t}\"")
    return "\n".join(parts)