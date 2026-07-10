#!/usr/bin/env python3
"""GitHub Trending scraper — ported from feishu-daily-bots."""

import json
from typing import List

from . import RepoItem, fetch_url, logger


def fetch_github_trending(limit=10, since="daily") -> List[RepoItem]:
    """Fetch GitHub trending repositories."""
    url = f"https://api.github.com/search/repositories?q=created:>2024-01-01&sort=stars&order=desc&per_page={limit}"
    data = json.loads(fetch_url(
        url,
        headers={"User-Agent": "github-trending-bot/1.0", "Accept": "application/vnd.github.v3+json"},
    ))
    items = []
    for repo in data.get("items", [])[:limit]:
        name = repo.get("full_name", "")
        if name:
            items.append(RepoItem(
                name=name,
                url=repo.get("html_url", ""),
                description=repo.get("description", "") or "",
                stars=repo.get("stargazers_count", 0),
                language=repo.get("language", "") or "",
                today_stars=repo.get("stargazers_count", 0),
            ))
    return items


def fetch_github_trending_today(limit=10) -> List[RepoItem]:
    """Fetch today's trending repos via GitHub's trending page."""
    from . import HEADERS
    html = fetch_url(
        "https://github.com/trending",
        headers={**HEADERS, "Accept": "text/html"},
    )
    items = []
    import re
    # Parse trending page for repo blocks
    blocks = re.findall(
        r'<h2[^>]*class="h3[^"]*"[^>]*>.*?href="/([^"]+)".*?</h2>',
        html, re.DOTALL
    )
    for name in blocks[:limit]:
        name = name.strip()
        if name and "/" in name:
            items.append(RepoItem(
                name=name,
                url=f"https://github.com/{name}",
            ))
    return items if items else fetch_github_trending(limit)