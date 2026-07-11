#!/usr/bin/env python3
"""Daily digest writer — comprehensive news summary with netizen comments."""

from datetime import datetime

from . import call_agnes, build_post, extract_title, strip_title_from_body, logger
from scrapers import format_date


DIGEST_PROMPT_TEMPLATE = """今天 {date} 各平台热搜数据如下：

{news_data}

部分话题的热门网友评论：
{comments_data}

以上数据中「多平台热议」的话题是跨平台同时出现的热点，优先写。

要求：
1. 从以上数据中挑 5-10 条最值得聊的，按重要程度排序
2. 每条写一段，不要只写"是什么"，要写"为什么值得聊"或"我的看法"
3. 如果有网友评论数据，选 1-2 条有意思的自然融入
4. 语气根据内容调整：正经事正经说，离谱事直接吐槽
5. 文章标题用 # 一级标题，不要用"X月X日信息差"这种通用标题
6. 全文用 markdown
7. 禁用词表：聚焦于、旨在、折射出、随着……的快速迭代、上述动态、与此同时、值得关注的是、引发了广泛讨论、在……的背景下、综上所述、值得一提的是、不可忽视的是、标志着、进一步加剧了、后续进展值得持续跟踪
8. 每篇文章至少有一句主观表达"""


def generate_digest(news_data: dict, comments_text: str, date_str: str) -> str:
    """Generate a daily digest article. Returns full frontmatter + markdown."""
    date_display = format_date(date_str)

    # Format news data for prompt
    news_lines = []
    for source, items in news_data.items():
        news_lines.append(f"\n[{source}]")
        for item in items:
            hot = f" (热度:{item.hot_value})" if item.hot_value else ""
            url_part = f" 链接:{item.url}" if item.url else ""
            news_lines.append(f"  - {item.title}{hot}{url_part}")

    news_block = "\n".join(news_lines)

    prompt = DIGEST_PROMPT_TEMPLATE.format(
        date=date_display,
        news_data=news_block,
        comments_data=comments_text or "暂无",
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