#!/usr/bin/env python3
"""AI Editor — decides what content to write today based on available data."""

import json
import re
from datetime import datetime

from . import call_agnes, logger


EDITOR_PROMPT_TEMPLATE = """你是一个博客编辑。以下是今天所有数据源的情况：

【AI/科技新闻】
{tech_summary}

【动漫数据】
{anime_summary}

【GitHub 趋势】
{trending_summary}

【近期已写过的文章——请避免重复这些话题】
{recent_topics}

请判断今天应该发几篇文章，每篇什么主题。

判断依据：
- **绝对不要写和「近期已写过的文章」重复的话题**
- 如果动漫数据有看点 → 写动漫
- 如果 AI 有重磅发布（GPT/Claude 级别）→ 写技术
- 如果都不突出 → 写技术（GitHub 趋势/开源项目盘点）
- 最多写 2 篇，最少 1 篇
- 题材范围仅限：动漫、技术、开源项目，不要涉及社会新闻与时政

请按以下 JSON 格式输出（不要其他内容）：
[
  {{
    "type": "anime",
    "reason": "为什么选这个主题的一句话理由",
    "estimated_length": "medium"
  }}
]

type 只能是: anime, tech（不要输出 digest）
estimated_length 只能是: short, medium, long"""


def editor_decide(news_data: dict, tech_data: list, anime_data: list, trending_data: list, recent_topics: list = None) -> list:
    """news_data 保留仅为兼容旧调用；综合热搜已停用，请传 {}。"""
    """Ask AI editor what to write today. Returns list of {type, reason, estimated_length}."""
    today = datetime.now().strftime("%Y-%m-%d")

    # Build summaries
    tech_summary = _summarize_tech(tech_data)
    anime_summary = _summarize_anime(anime_data)
    trending_summary = _summarize_trending(trending_data)

    # Format recent topics
    recent_text = "无"
    if recent_topics:
        recent_text = "\n".join(f"  - {t['title']}" for t in recent_topics)

    prompt = EDITOR_PROMPT_TEMPLATE.format(
        tech_summary=tech_summary or "无数据",
        anime_summary=anime_summary or "无数据",
        trending_summary=trending_summary or "无数据",
        recent_topics=recent_text,
    )

    result = call_agnes(prompt, max_tokens=1000, temperature=0.3)
    if not result:
        logger.warning("编辑决策失败，默认发一篇技术盘点")
        return [{"type": "tech", "reason": "默认决策", "estimated_length": "medium"}]

    # Parse JSON from response
    decisions = _parse_decision(result)
    if not decisions:
        logger.warning("决策解析失败，默认发一篇技术盘点")
        return [{"type": "tech", "reason": "默认决策", "estimated_length": "medium"}]

    logger.info("编辑决策: %s", decisions)
    return decisions


def _summarize_news(news_data: dict) -> str:
    if not news_data:
        return ""
    parts = []
    for source, items in news_data.items():
        titles = [f"  - {item.title}" + (f" (热度:{item.hot_value})" if item.hot_value else "") for item in items[:5]]
        parts.append(f"[{source}]")
        parts.extend(titles)
    return "\n".join(parts)


def _summarize_tech(tech_data: list) -> str:
    if not tech_data:
        return ""
    parts = [f"共 {len(tech_data)} 条新闻"]
    for art in tech_data[:5]:
        parts.append(f"  - {art.title}")
    return "\n".join(parts)


def _summarize_anime(anime_data: list) -> str:
    if not anime_data:
        return ""
    parts = [f"共 {len(anime_data)} 部当季新番"]
    for a in anime_data[:8]:
        title = a.title_cn or a.title_romaji or a.title_english
        parts.append(f"  - {title} (评分:{a.average_score} 热度:{a.popularity})")
    return "\n".join(parts)


def _summarize_trending(trending_data: list) -> str:
    if not trending_data:
        return ""
    parts = [f"共 {len(trending_data)} 个热门项目"]
    for r in trending_data[:5]:
        parts.append(f"  - {r.name} ({r.language}) ⭐{r.stars}")
    return "\n".join(parts)


def _parse_decision(text: str) -> list:
    """Parse JSON array from editor response."""
    # Try to extract JSON from markdown code block first
    m = re.search(r"```(?:json)?\s*(\[[\s\S]*?\])\s*```", text)
    if m:
        text = m.group(1)
    else:
        # Try to find raw JSON array
        m = re.search(r"(\[[\s\S]*?\])", text)
        if m:
            text = m.group(1)

    try:
        decisions = json.loads(text)
        if isinstance(decisions, list):
            validated = []
            for d in decisions:
                if d.get("type") in ("anime", "tech"):
                    validated.append({
                        "type": d["type"],
                        "reason": d.get("reason", ""),
                        "estimated_length": d.get("estimated_length", "medium"),
                    })
            return validated
    except json.JSONDecodeError:
        pass
    return []