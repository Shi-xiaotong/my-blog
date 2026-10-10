#!/usr/bin/env python3
"""Anime news & recommendation writer."""

import re
from datetime import datetime

from . import call_agnes, build_post, extract_title, strip_title_from_body, logger
from scrapers import format_date


ANIME_PROMPT_TEMPLATE = """当季动漫数据和趋势如下：

{anime_data}

部分动漫的网友讨论：
{comments_data}

要求：
1. 简洁直观，直达主题：每部作品一两句说清亮点，不渲染不夸张
2. 可以夸，但要克制——说具体哪点好，不用"我吹爆 / 头皮发麻 / 太炸了"这类感叹腔
3. 推荐当季热番，特别关注：焦糖味女友（就是情绪一激动就变哥斯拉的那部）、ニコニコ喵喵（ニコニコ喵喵）等当季热门
4. 网友评论、弹幕热词挑 1-2 条穿插即可，保持圈内氛围但不刷屏
5. 如果有当季新番排行榜数据，做个简短排名
6. 标题用 # 一级标题，平实直接
7. 禁用词表：聚焦于、旨在、折射出、随着……的快速迭代、上述动态、与此同时、值得关注的是、引发了广泛讨论、在……的背景下、综上所述、值得一提的是、不可忽视的是、标志着、进一步加剧了、后续进展值得持续跟踪、好家伙、这波操作、炸了、太炸了、绝了、头皮发麻、我吹爆、排雷、安利指南、看完不亏"""


def _looks_like_valid_article(text: str) -> bool:
    """Check if generated text looks like an actual article vs AI self-dialogue loop."""
    # Must have either a # heading, or substantial Chinese content paragraphs
    has_heading = bool(re.search(r'^\s*#?\s*#+\s+.+', text, re.MULTILINE))
    # Count non-blank, non-thought lines (lines with meaningful Chinese content)
    lines = [l for l in text.split('\n') if l.strip()]
    content_lines = [l for l in lines if
        not re.match(r'^\s*(让我|我应该|实际上|不过我|等等|我需要|我要|用户要求|现在开始撰写)', l.strip()) and
        re.search(r'[\u4e00-\u9fff]{4,}', l)
    ]
    # If fewer than 40% of lines are real content, it's a thinking loop
    if len(lines) < 3:
        return False
    content_ratio = len(content_lines) / len(lines)
    return has_heading or content_ratio > 0.4


def _check_prompt_leakage(text: str) -> bool:
    """Check if the text starts with prompt-echo or instruction content."""
    prompt_markers = [
        '用户要求我', '让我先看看', '让我先看看用户',
        '当季动漫数据和趋势', '部分动漫的网友',
    ]
    first_line = text.strip().split('\n')[0].strip()
    return any(marker in first_line for marker in prompt_markers)


def generate_anime(anime_data: list, comments_text: str, date_str: str) -> str:
    """Generate an anime news/recommendation article."""
    date_display = format_date(date_str)

    # Format anime data for prompt
    from scrapers.anime_sources import format_anime_for_prompt
    anime_block = format_anime_for_prompt(anime_data)

    prompt = ANIME_PROMPT_TEMPLATE.format(
        anime_data=anime_block,
        comments_data=comments_text or "暂无",
    )

    result = call_agnes(prompt, max_tokens=4000)
    if not result:
        logger.error("动漫文章生成失败")
        return ""

    # Safety: check for prompt echo / thinking loop
    if _check_prompt_leakage(result):
        logger.warning("动漫文章疑似 prompt 回显，丢弃")
        return ""
    if not _looks_like_valid_article(result):
        logger.warning("动漫文章疑似 AI 自我对话循环，丢弃")
        return ""

    title = extract_title(result)
    body = strip_title_from_body(result) if title else result

    if not title:
        title = "本周动漫推荐"

    return build_post(title, body, "anime", date_str, ["动漫推荐", "新番"])