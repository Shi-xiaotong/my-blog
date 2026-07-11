#!/usr/bin/env python3
"""Anime news & recommendation writer."""

from datetime import datetime

from . import call_agnes, build_post, extract_title, strip_title_from_body, logger
from scrapers import format_date


ANIME_PROMPT_TEMPLATE = """当季动漫数据和趋势如下：

{anime_data}

部分动漫的网友讨论：
{comments_data}

要求：
1. 像给朋友安利好番一样写
2. 可以兴奋，可以夸，可以说"这集我吹爆"、"看得我头皮发麻"
3. 推荐当季热番，特别关注：焦糖味女友（就是情绪一激动就变哥斯拉的那部）、ニコニコ喵喵（ニコニコ喵喵）等当季热门
4. 网友评论、弹幕热词可以穿插，让文章有圈内氛围
5. 如果有当季新番排行榜数据，可以做个简短排名
6. 标题用 # 一级标题，吸引人
7. 禁用词表：聚焦于、旨在、折射出、随着……的快速迭代、上述动态、与此同时、值得关注的是、引发了广泛讨论、在……的背景下、综上所述、值得一提的是、不可忽视的是、标志着、进一步加剧了、后续进展值得持续跟踪
8. 每篇文章至少有一句主观表达"""


def generate_anime(anime_data: list, comments_text: str, date_str: str) -> str:
    """Generate an anime news/recommendation article."""
    date_display = format_date(date_str)

    # Format anime data for prompt
    from ..scrapers.anime_sources import format_anime_for_prompt
    anime_block = format_anime_for_prompt(anime_data)

    prompt = ANIME_PROMPT_TEMPLATE.format(
        anime_data=anime_block,
        comments_data=comments_text or "暂无",
    )

    result = call_agnes(prompt, max_tokens=4000)
    if not result:
        logger.error("动漫文章生成失败")
        return ""

    title = extract_title(result)
    body = strip_title_from_body(result) if extract_title(result) else result

    if not title:
        title = "本周动漫推荐"

    return build_post(title, body, "anime", date_str, ["动漫推荐", "新番"])