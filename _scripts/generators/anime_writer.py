#!/usr/bin/env python3
"""Anime news & recommendation writer."""

import re
from datetime import datetime

from . import call_agnes, build_post, extract_title, strip_title_from_body, logger
from scrapers import format_date


# 每期角度轮换（按一年中的第几周取模），避免每期都是同一套"当季新番速览"
ANGLES = [
    ("新番速览", "按评分和热度挑 5-8 部当季新番，每部一两句说清看点和适合谁看"),
    ("冷门补番", "从高分但热度不高的作品里挑 5-8 部做补番推荐，说清楚为什么值得补"),
    ("完结回顾", "挑当季已完结的 3-5 部做回顾：整体评价、后半程表现、值不值得补"),
    ("制作公司与主创", "按制作公司或声优/主创串起来讲 5-8 部作品，突出风格与阵容"),
    ("季度排行榜", "按评分与热度排一个当季 Top 10，并说明排名依据"),
]

ANIME_PROMPT_TEMPLATE = """当季动漫数据和趋势如下：

{anime_data}

部分动漫的网友讨论：
{comments_data}

【本期角度】{angle_name} —— {angle_desc}

【近 60 天已经写过的作品，绝对不要再写】
{excluded}

要求：
1. 简洁直观，直达主题：每部作品一两句说清亮点，不渲染不夸张
2. 可以夸，但要克制——说具体哪点好，不用"我吹爆 / 头皮发麻 / 太炸了"这类感叹腔
3. **严格按「本期角度」写**，不要每期都写成同一套新番速览
4. **优先挑上面没写过的作品**；如果数据里未写过的作品不够，就少写几部（3 部也行），
   宁可少写也不要把「已写过的作品」换个说法再写一遍
5. 网友评论、弹幕热词挑 1-2 条穿插即可，保持圈内氛围但不刷屏
6. 标题用 # 一级标题，平实直接，标题里体现本期角度
7. 事实纪律：剧情/制作信息只写上面数据里有的（AniList 的评分、集数、简介、题材）；
   简介里没提的剧情发展、结局、名场面一律不写。网友评论只能来自提供的评论数据，没有就不引用
8. 禁用词表：聚焦于、旨在、折射出、随着……的快速迭代、上述动态、与此同时、值得关注的是、
   引发了广泛讨论、在……的背景下、综上所述、值得一提的是、不可忽视的是、标志着、
   进一步加剧了、后续进展值得持续跟踪、好家伙、这波操作、炸了、太炸了、绝了、
   头皮发麻、我吹爆、排雷、安利指南、看完不亏"""


def _angle_for_date(date_str: str):
    """按周数轮换角度，保证相邻几期不重样。"""
    from datetime import datetime
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        dt = datetime.now()
    week = dt.isocalendar()[1]
    return ANGLES[(week - 1) % len(ANGLES)]


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


def generate_anime(anime_data: list, comments_text: str, date_str: str, excluded: list = None) -> str:
    """Generate an anime news/recommendation article.

    excluded: 近 60 天写过作品名，写进 prompt 强制排除，避免重复推荐。
    """
    date_display = format_date(date_str)

    # 补番角度换成"高分榜"数据源，别每期都用同一份当季新番
    angle_name, angle_desc = _angle_for_date(date_str)
    if angle_name == "冷门补番":
        try:
            from scrapers.anime_sources import fetch_top_rated
            top = fetch_top_rated(limit=15)
            if top:
                anime_data = top
        except Exception as e:  # 抓不到就退回当季数据
            logger.warning("高分榜抓取失败，回退当季数据: %s", e)

    # Format anime data for prompt
    from scrapers.anime_sources import format_anime_for_prompt
    anime_block = format_anime_for_prompt(anime_data)

    excluded = [t for t in (excluded or []) if t]
    excluded_text = "、".join(excluded) if excluded else "无"

    prompt = ANIME_PROMPT_TEMPLATE.format(
        anime_data=anime_block,
        comments_data=comments_text or "暂无",
        angle_name=angle_name,
        angle_desc=angle_desc,
        excluded=excluded_text,
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

    return build_post(title, body, "动漫", date_str, ["动漫推荐", "新番"])