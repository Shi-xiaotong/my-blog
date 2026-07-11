#!/usr/bin/env python3
"""AI frontier news writer — TechCrunch-based AI/tech digest."""

from datetime import datetime

from . import call_agnes, build_post, extract_title, strip_title_from_body, logger
from scrapers import format_date


TECH_PROMPT_TEMPLATE = """今天 AI 圈新闻如下：

{tech_data}

要求：
1. 技术向但不晦涩，让非程序员也能看懂
2. 可以说"这个发布有点意思"、"我个人觉得这个方向……"
3. 不只写"是什么"，要写"为什么重要"、"对谁有影响"
4. 对开发者/普通用户的影响要写清楚
5. 标题用 # 一级标题，有吸引力
6. 全文 markdown
7. 禁用词表：聚焦于、旨在、折射出、随着……的快速迭代、上述动态、与此同时、值得关注的是、引发了广泛讨论、在……的背景下、综上所述、值得一提的是、不可忽视的是、标志着、进一步加剧了、后续进展值得持续跟踪
8. 每篇文章至少有一句主观表达"""


def generate_tech(tech_articles: list, date_str: str) -> str:
    """Generate an AI frontier article."""
    date_display = format_date(date_str)

    # Format tech data
    parts = []
    for i, art in enumerate(tech_articles[:5], 1):
        parts.append(f"\n{i}. 标题: {art.title}")
        parts.append(f"   链接: {art.url}")
        if art.content:
            parts.append(f"   摘要: {art.content[:500]}")
    tech_block = "\n".join(parts)

    if not tech_block:
        logger.warning("Tech数据为空")
        return ""

    prompt = TECH_PROMPT_TEMPLATE.format(tech_data=tech_block)

    result = call_agnes(prompt, max_tokens=4000)
    if not result:
        logger.error("AI前沿文章生成失败")
        return ""

    title = extract_title(result)
    body = strip_title_from_body(result) if extract_title(result) else result

    if not title:
        title = "AI圈今天有点热闹"

    return build_post(title, body, "tech", date_str, ["AI", "每日热点", "前沿技术"])