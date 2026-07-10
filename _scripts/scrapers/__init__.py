#!/usr/bin/env python3
"""Scrapers package — unified data source layer for daily blog content."""

import json
import logging
import os
import re
import ssl
import sys
import time
import urllib.request
from dataclasses import dataclass, field
from datetime import datetime
from difflib import SequenceMatcher
from typing import List, Tuple, Optional

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# ── Globals ──

MAX_RETRIES = 3
RETRY_DELAY_BASE = 2
REQUEST_TIMEOUT = 20

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://weibo.com",
}

BLOG_DIR = os.environ.get("BLOG_DIR", ".")


# ── Data Models ──

@dataclass
class NewsItem:
    title: str
    url: str = ""
    source: str = ""
    hot_value: str = ""
    summary: str = ""
    sources: list = field(default_factory=list)

    def __post_init__(self):
        if not self.sources:
            self.sources = [self.source] if self.source else []


@dataclass
class Article:
    title: str
    url: str
    content: str = ""
    source: str = ""


@dataclass
class AnimeItem:
    title_romaji: str = ""
    title_cn: str = ""
    title_english: str = ""
    episodes: int = 0
    status: str = ""
    average_score: int = 0
    mean_score: int = 0
    popularity: int = 0
    trending: int = 0
    description: str = ""
    genres: list = field(default_factory=list)
    season: str = ""
    year: int = 0
    url: str = ""
    cover: str = ""


@dataclass
class RepoItem:
    name: str = ""
    url: str = ""
    description: str = ""
    stars: int = 0
    language: str = ""
    today_stars: int = 0


# ── Utility Functions ──

def retry(fn, label="", max_retries=MAX_RETRIES):
    last_err = None
    for attempt in range(1, max_retries + 1):
        try:
            return fn()
        except Exception as e:
            last_err = e
            if attempt < max_retries:
                wait = min(2 ** attempt * 2, 30)
                logger.warning("[RETRY %d/%d] %s: %s (wait %ds)", attempt, max_retries, label, str(e)[:80], wait)
                time.sleep(wait)
    logger.error("[FAIL] %s: %s", label, last_err)
    return None


def fetch_url(url, headers=None, timeout=REQUEST_TIMEOUT, decode=True):
    hdrs = headers or HEADERS
    req = urllib.request.Request(url, headers=hdrs)
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as resp:
        raw = resp.read()
        if decode:
            charset = "utf-8"
            ct = resp.headers.get("Content-Type", "")
            if "charset=" in ct:
                charset = ct.split("charset=")[-1].split(";")[0].strip()
            return raw.decode(charset, errors="replace")
        return raw


def safe_fetch(name, func, limit=10):
    try:
        items = func(limit)
        logger.info("%s: 获取 %d 条", name, len(items))
        return items or []
    except Exception as e:
        logger.warning("%s 失败: %s", name, e)
        return []


def deduplicate(items, threshold=0.6):
    """Merge near-duplicate NewsItems by title similarity."""
    merged = []
    for item in items:
        matched = False
        for existing in merged:
            if similarity(item.title, existing.title) >= threshold:
                for s in item.sources:
                    if s not in existing.sources:
                        existing.sources.append(s)
                if not existing.url and item.url:
                    existing.url = item.url
                matched = True
                break
        if not matched:
            merged.append(item)
    return merged


def similarity(a, b):
    a_clean = re.sub(r"[^\u4e00-\u9fa5a-zA-Z0-9]", "", a.lower())
    b_clean = re.sub(r"[^\u4e00-\u9fa5a-zA-Z0-9]", "", b.lower())
    if not a_clean or not b_clean:
        return 0.0
    return SequenceMatcher(None, a_clean, b_clean).ratio()


def format_date(date_str=None):
    dt = datetime.strptime(date_str, "%Y-%m-%d") if date_str else datetime.now()
    weekdays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
    return f"{dt.month}月{dt.day}日 {weekdays[dt.weekday()]}"


def save_post(category, filename, content):
    """Write a markdown post to source/_posts/{category}/{filename}"""
    post_dir = os.path.join(BLOG_DIR, "source", "_posts", category)
    os.makedirs(post_dir, exist_ok=True)
    path = os.path.join(post_dir, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    logger.info("[OK] %s", path)
    return path