#!/usr/bin/env python3
"""Anime data scraper — AniList GraphQL API."""

import json
from typing import List

from . import AnimeItem, retry, fetch_url, logger


ANILIST_API = "https://graphql.anilist.co"

# GraphQL query: current season trending anime
CURRENT_SEASON_QUERY = """
query ($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(season: $season, seasonYear: $seasonYear, type: ANIME, sort: [TRENDING_DESC, POPULARITY_DESC]) {
      id
      title {
        romaji
        english
        native
      }
      episodes
      status
      averageScore
      meanScore
      popularity
      trending
      description(asHtml: false)
      genres
      season
      seasonYear
      siteUrl
      coverImage {
        large
      }
    }
  }
}
"""

# Query: highly rated anime of all time (for recommendations)
TOP_RATED_QUERY = """
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, sort: [SCORE_DESC, POPULARITY_DESC]) {
      id
      title {
        romaji
        english
        native
      }
      episodes
      status
      averageScore
      meanScore
      popularity
      trending
      description(asHtml: false)
      genres
      season
      seasonYear
      siteUrl
      coverImage {
        large
      }
    }
  }
}
"""


def _anilist_query(query, variables=None) -> dict:
    """Execute a GraphQL query against AniList."""
    import urllib.request
    variables = variables or {}
    payload = json.dumps({"query": query, "variables": variables}).encode()

    def _call():
        req = urllib.request.Request(
            ANILIST_API, data=payload,
            headers={"Content-Type": "application/json", "Accept": "application/json",
                     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())

    data = retry(_call, label="AniList API")
    if not data:
        return {}
    return data.get("data", {})


def _parse_media(media: dict) -> AnimeItem:
    """Parse a media object from AniList response."""
    title = media.get("title", {}) or {}
    return AnimeItem(
        title_romaji=title.get("romaji", "") or "",
        title_cn=title.get("native", "") or "",
        title_english=title.get("english", "") or "",
        episodes=media.get("episodes") or 0,
        status=media.get("status", "") or "",
        average_score=media.get("averageScore") or 0,
        mean_score=media.get("meanScore") or 0,
        popularity=media.get("popularity") or 0,
        trending=media.get("trending") or 0,
        description=media.get("description", "") or "",
        genres=media.get("genres", []) or [],
        season=media.get("season", "") or "",
        year=media.get("seasonYear") or 0,
        url=media.get("siteUrl", "") or "",
        cover=media.get("coverImage", {}).get("large", "") or "",
    )


def _get_season():
    """Determine current anime season based on date."""
    from datetime import datetime
    now = datetime.now()
    month = now.month
    if 1 <= month <= 3:
        return "WINTER"
    elif 4 <= month <= 6:
        return "SPRING"
    elif 7 <= month <= 9:
        return "SUMMER"
    else:
        return "FALL"


def fetch_current_season(limit=15) -> List[AnimeItem]:
    """Fetch current season's trending anime."""
    season = _get_season()
    from datetime import datetime
    year = datetime.now().year

    data = _anilist_query(CURRENT_SEASON_QUERY, {
        "season": season,
        "seasonYear": year,
        "page": 1,
        "perPage": limit,
    })

    items = []
    for media in data.get("Page", {}).get("media", []):
        items.append(_parse_media(media))
    return items


def fetch_top_rated(limit=10) -> List[AnimeItem]:
    """Fetch top-rated anime of all time."""
    data = _anilist_query(TOP_RATED_QUERY, {"page": 1, "perPage": limit})
    items = []
    for media in data.get("Page", {}).get("media", []):
        items.append(_parse_media(media))
    return items


def format_anime_for_prompt(anime_list: List[AnimeItem]) -> str:
    """Format anime data for inclusion in an AI prompt."""
    parts = []
    for a in anime_list:
        title = a.title_cn or a.title_romaji or a.title_english
        parts.append(
            f"- {title}\n"
            f"  评分: {a.average_score}/100 | 热度: {a.popularity} | 集数: {a.episodes}\n"
            f"  类型: {', '.join(a.genres)}\n"
            f"  简介: {a.description[:200] if a.description else '无'}"
        )
    return "\n".join(parts)