#!/usr/bin/env python3
"""AI frontier news writer — TechCrunch-based AI/tech digest."""

import re
from datetime import datetime

from . import call_agnes, build_post, extract_title, strip_title_from_body, logger
from scrapers import format_date


# 标题禁用词（生成后校验用，与 prompt 规则保持一致）
BANNED_TITLE_WORDS = [
    "有点热闹", "值得看看", "一览", "速览", "盘点", "观察",
    "科技圈", "AI圈", "今日", "今天", "本周", "这周",
    "好家伙", "炸了", "绝了", "头皮发麻", "我吹爆",
]


def _norm(s: str) -> str:
    return re.sub(r"[\s\-_:：·・!！?？,，.。'\"“”‘’《》〈〉「」『』（）()\[\]【】]", "", (s or "").lower())


# 英文停用词：抽"锚点词"时要排除，否则 for/with 这种会把所有标题判成合格
_STOPWORDS = {
    "the", "for", "and", "with", "that", "this", "from", "into", "about", "your",
    "are", "was", "were", "will", "its", "has", "have", "had", "not", "but", "now",
    "new", "how", "why", "what", "when", "more", "than", "their", "they", "them",
    "you", "can", "get", "out", "over", "after", "before", "all", "any", "one",
    "two", "use", "using", "via", "com", "www", "http", "https", "html",
}


def _keywords(text: str) -> set:
    """抽取实词，用于判断两篇讲的是不是同一件事。必须从原始文本抽：
    先 _norm 会把空格吃光，导致整句变成一个"词"，永远匹配不上。
    保留 M4 / Max 这类短词，所以下限取 2，靠停用词表过滤噪声。"""
    raw = text or ""
    words = {w.lower() for w in re.findall(r"[A-Za-z0-9]{2,}", raw)}
    words |= set(re.findall(r"[\u4e00-\u9fff]{2,6}", raw))
    return {w for w in words if len(w) >= 2 and w.lower() not in _STOPWORDS}


def _filter_excluded(tech_articles: list, excluded: list) -> list:
    """数据层剔除近 60 天写过的主题（标题级重合即判定重复）。"""
    if not excluded:
        return list(tech_articles or [])
    # 注意：关键词必须从原始文本抽。_norm 会吃掉空格，
    # "Blackwell Ultra" 会变成 blackwellultra 一个词，再也匹配不上。
    pairs = [(_norm(t), _keywords(t)) for t in excluded if t]
    out = []
    for art in tech_articles or []:
        raw = getattr(art, "title", "") or ""
        title = _norm(raw)
        kw = _keywords(raw)
        dup = False
        for b, bk in pairs:
            if b and title and (title in b or b in title):
                dup = True
                break
            if kw and bk and len(kw & bk) >= 2:
                dup = True
                break
        if not dup:
            out.append(art)
    return out


def _title_has_anchor(title: str, tech_articles: list) -> bool:
    """标题里必须出现数据里的具体产品/公司/技术名。"""
    keys = set()
    for art in tech_articles or []:
        keys |= _keywords(getattr(art, "title", ""))
    t = _norm(title)
    return any(_norm(k) in t for k in keys if len(k) >= 3)


def _validate_title(title: str, tech_articles: list) -> bool:
    if not title or "#" in title:
        return False
    if not (10 <= len(title) <= 30):
        return False
    if any(w in title for w in BANNED_TITLE_WORDS):
        return False
    return _title_has_anchor(title, tech_articles)


def _fallback_title(tech_articles: list) -> str:
    titles = [getattr(a, "title", "") for a in (tech_articles or [])]
    titles = [t for t in titles if t]
    if not titles:
        return "这周记几条值得留意的技术进展"
    return f"{titles[0][:20]}：说清楚它变了什么"


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
   - 标题只写一行，以 # 开头；正文里不要再重复这个标题
5. 全文 markdown
6. **优先写「近 60 天没写过的」发布会/产品**；如果今天的数据里只有重复内容，就只挑真正有新进展的 1-2 条写，宁可短也不要换个说法重写一遍
7. 事实纪律：只写上面提供的标题/摘要/来源里出现的事实。摘要里没有的性能数字、参数、日期、引语一律不写，不凭记忆补充。来源名（The Verge 等）只引用数据里出现的，不虚构出处
8. 禁用词表：聚焦于、旨在、折射出、随着……的快速迭代、上述动态、与此同时、值得关注的是、引发了广泛讨论、在……的背景下、综上所述、值得一提的是、不可忽视的是、标志着、进一步加剧了、后续进展值得持续跟踪、好家伙、这波操作、炸了、太炸了、绝了、头皮发麻、我吹爆、排雷、安利指南、看完不亏"""


def generate_tech(tech_articles: list, date_str: str, excluded: list = None) -> str:
    """Generate an AI frontier article.

    excluded: 近 60 天写过的主题标题，写进 prompt 强制排除。
    """
    date_display = format_date(date_str)

    # 数据层去重：先剔掉近 60 天写过的主题，再决定写不写
    tech_articles = _filter_excluded(tech_articles or [], excluded)
    excluded = [t for t in (excluded or []) if t]
    if not tech_articles:
        logger.warning("剔重后没有可用的技术新闻，跳过本期")
        return ""

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

    excluded_text = "、".join(excluded) if excluded else "无"

    prompt = TECH_PROMPT_TEMPLATE.format(tech_data=tech_block, excluded=excluded_text)

    result = call_agnes(prompt, max_tokens=4000)
    if not result:
        logger.error("AI前沿文章生成失败")
        return ""

    # 标题校验，不合格重试一次
    title = extract_title(result)
    used = tech_articles[:5]
    if not _validate_title(title, used):
        logger.warning("技术文章标题不合格，重试一次: %s", title)
        retry_prompt = (
            prompt + "\n\n【上一次的标题不合格】必须包含数据里的具体产品/公司/技术名，"
                     "12~26 字，且不得出现「科技圈有点热闹」这类简报腔。请重新输出全文。"
        )
        result = call_agnes(retry_prompt, max_tokens=4000)
        if result:
            title = extract_title(result)
        if not _validate_title(title, used):
            title = _fallback_title(used)
            logger.warning("标题仍不合格，用数据兜底: %s", title)

    body = strip_title_from_body(result) if extract_title(result) else result

    return build_post(title, body, "技术", date_str, ["AI", "前沿技术"])