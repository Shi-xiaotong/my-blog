#!/usr/bin/env python3
"""AI frontier news writer — TechCrunch-based AI/tech digest."""

from datetime import datetime

from . import call_agnes, build_post, extract_title, strip_title_from_body, logger
from scrapers import format_date


TECH_PROMPT_TEMPLATE = """今天 AI 圈新闻如下：

{tech_data}

【近 60 天已经写过的主题，绝对不要再写】
{excluded}

要求：
1. 技术向但不晦涩，让非程序员也能看懂
2. 简洁直观，直达主题：先讲事实，再讲为什么重要，说明白对谁有影响
3. 有观点直接给结论，不渲染、不夸张；可以写"我个人觉得"，但不要用感叹腔
4. 标题规则（最重要的一条）：
   - 语气要像一个人在记技术笔记，不要像新闻简报或运营号
   - 写**具体的事**：这次到底变了什么、对你/对开发者意味着什么
   - 12~26 字，可以口语、可以疑问，不要堆感叹号，不要 emoji
   - **禁止**出现：今天/本周/今日 + 科技圈/AI圈 + 有点热闹、值得看看、一览、速览、盘点、观察
   - 参考语气（只学语气）：推理比训练更烧钱，Blackwell Ultra 这次动的就是它
   - 标题用 # 一级标题，与正文首行一致
5. 全文 markdown
6. **优先写「近 60 天没写过的」发布会/产品**；如果今天的数据里只有重复内容，就只挑真正有新进展的 1-2 条写，宁可短也不要换个说法重写一遍
7. 事实纪律：只写上面提供的标题/摘要/来源里出现的事实。摘要里没有的性能数字、参数、日期、引语一律不写，不凭记忆补充。来源名（The Verge 等）只引用数据里出现的，不虚构出处
8. 禁用词表：聚焦于、旨在、折射出、随着……的快速迭代、上述动态、与此同时、值得关注的是、引发了广泛讨论、在……的背景下、综上所述、值得一提的是、不可忽视的是、标志着、进一步加剧了、后续进展值得持续跟踪、好家伙、这波操作、炸了、太炸了、绝了、头皮发麻、我吹爆、排雷、安利指南、看完不亏"""


def generate_tech(tech_articles: list, date_str: str, excluded: list = None) -> str:
    """Generate an AI frontier article.

    excluded: 近 60 天写过的主题标题，写进 prompt 强制排除。
    """
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

    excluded = [t for t in (excluded or []) if t]
    excluded_text = "、".join(excluded) if excluded else "无"

    prompt = TECH_PROMPT_TEMPLATE.format(tech_data=tech_block, excluded=excluded_text)

    result = call_agnes(prompt, max_tokens=4000)
    if not result:
        logger.error("AI前沿文章生成失败")
        return ""

    title = extract_title(result)
    body = strip_title_from_body(result) if extract_title(result) else result

    if not title:
        title = "这周记几条值得留意的技术进展"

    return build_post(title, body, "技术", date_str, ["AI", "前沿技术"])