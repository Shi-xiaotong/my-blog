#!/usr/bin/env python3
"""Daily digest writer — comprehensive news summary with netizen comments."""

from datetime import datetime

from . import call_agnes, build_post, extract_title, strip_title_from_body, logger
from scrapers import format_date


DIGEST_PROMPT_TEMPLATE = """今天 {date} 各平台热搜数据如下：

{news_data}

{facts_data}

部分话题的热门网友评论：
{comments_data}

以上数据中「多平台热议」的话题是跨平台同时出现的热点，优先写。

【近期已写过的文章——绝对不要重复这些话题】
{recent_topics}

【事实纪律——违反任何一条视为生成失败，必须重写】
A. 每条话题只能写上面数据里出现的事实。热搜词条只告诉你"某事上了热搜"，不告诉你经过。
B. 涉及真实人物/机构的事件经过（谁做了什么、具体场景、具体数字、具体引语）：
   - 有「事实依据」摘录的 → 只能基于摘录写，摘录里没有的细节一律不写
   - 没有「事实依据」的 → 只写词条本身陈述的事实 + 热度，不推测原因、不还原现场、不编造细节
   - 不确定的表述一律删掉，宁可少写，不可编造
C. 引用的网友评论（> 引用块）只能来自上面的「热门网友评论」数据，没有评论就不引用，禁止编造"一位网友说/一位球迷说"
D. 禁止出现数据里没有的具体数字、日期、人名、机构名、引语

格式要求（严格遵循）：
1. 文章开头用 # 一级标题（会被提取为文章标题，不要用"X月X日信息差"这种通用标题）
2. 每个话题用 ## 二级标题开头，不要用其他级别标题
3. 正文段落中可以用 **加粗** 标注重点关键词
4. 有并列信息时用 - 无序列表
5. 夸奖或引用网友评论时用 > 引用块
6. 全文必须用 markdown，纯段落不行

内容要求：
8. 从以上数据中挑 5-10 条最值得聊的，按重要程度排序
9. 每条写一段，先给事实再给判断，简洁直观，直达主题
10. 如果有网友评论数据，选 1-2 条有意思的自然融入
11. 语气克制平实：陈述为主，有观点直接给结论；不渲染、不夸张，不用感叹腔（"好家伙 / 这波操作 / 炸了 / 绝了 / 头皮发麻" 这类一律不用）
12. 禁用词表：聚焦于、旨在、折射出、随着……的快速迭代、上述动态、与此同时、值得关注的是、引发了广泛讨论、在……的背景下、综上所述、值得一提的是、不可忽视的是、标志着、进一步加剧了、后续进展值得持续跟踪、好家伙、这波操作、炸了、太炸了、绝了、头皮发麻、我吹爆、排雷、安利指南、看完不亏"""


def generate_digest(news_data: dict, comments_text: str, date_str: str, recent_topics: list = None) -> str:
    """Generate a daily digest article. Returns full frontmatter + markdown."""
    date_display = format_date(date_str)

    # Format recent topics
    recent_text = "无"
    if recent_topics:
        recent_text = "\n".join(f"  - {t['title']}" for t in recent_topics)

    # Format news data for prompt — attach official summary (百度 desc) inline
    news_lines = []
    for source, items in news_data.items():
        news_lines.append(f"\n[{source}]")
        for item in items:
            hot = f" (热度:{item.hot_value})" if item.hot_value else ""
            url_part = f" 链接:{item.url}" if item.url else ""
            news_lines.append(f"  - {item.title}{hot}{url_part}")
            # 官方摘要直接跟在词条后，作为该话题的事实依据
            if item.summary:
                news_lines.append(f"    事实依据: {item.summary[:400]}")

    news_block = "\n".join(news_lines)

    # Separate facts block (explicit 事实依据 collection for the discipline rules)
    from scrapers.fact_fetcher import format_facts_for_prompt
    all_items = [i for v in news_data.values() for i in v]
    facts_block = format_facts_for_prompt(all_items)

    prompt = DIGEST_PROMPT_TEMPLATE.format(
        date=date_display,
        news_data=news_block,
        facts_data=facts_block or "（本次数据未提供额外事实依据，请严格按「事实纪律」B 条处理：没有依据的话题只写词条本身的事实）",
        comments_data=comments_text or "暂无",
        recent_topics=recent_text,
    )

    result = call_agnes(prompt, max_tokens=4000)
    if not result:
        logger.error("综合简报生成失败")
        return ""

    title = extract_title(result)
    if title:
        body = strip_title_from_body(result)
    else:
        title = "今天信息量有点大"
        body = result

    # Pick tags based on content
    tags = ["每日热点", "信息差"]

    return build_post(title, body, "daily-news", date_str, tags)