#!/usr/bin/env python3
"""Anime news & recommendation writer."""

import os
import re
from datetime import datetime

from . import call_agnes, build_post, extract_title, strip_title_from_body, logger
from scrapers import format_date, BLOG_DIR


# 每期角度轮换，避免每期都是同一套"当季新番速览"
ANGLES = [
    ("新番速览", "按评分和热度挑 5-8 部当季新番，每部一两句说清看点和适合谁看"),
    ("冷门补番", "从高分但热度不高的作品里挑 5-8 部做补番推荐，说清楚为什么值得补"),
    ("完结回顾", "挑当季已完结的 3-5 部做回顾：整体评价、后半程表现、值不值得补"),
    ("制作公司与主创", "按制作公司或声优/主创串起来讲 5-8 部作品，突出风格与阵容"),
    ("季度排行榜", "按评分与热度排一个当季 Top 10，并说明排名依据"),
]

# 角度 → 标签，避免所有动漫文章标签都一样
ANGLE_TAGS = {
    "新番速览": ["新番", "追番"],
    "冷门补番": ["补番", "冷门"],
    "完结回顾": ["完结回顾", "补番"],
    "制作公司与主创": ["制作公司", "主创"],
    "季度排行榜": ["季度榜单", "追番"],
}

# 标题禁用词（生成后校验用，与 prompt 里的规则保持一致）
BANNED_TITLE_WORDS = [
    "当季新番", "本季", "热度榜", "速览", "一览", "盘点", "观察",
    "数据", "推荐", "清单", "Top", "top", "必看", "部番",
    "好家伙", "炸了", "绝了", "头皮发麻", "我吹爆",
]

# 允许"现象型标题"的锚点词：没有具体作品名时，至少要说到一个具体现象
PHENOMENON_WORDS = [
    "续作", "原创", "弃番", "完结", "制作公司", "声优", "补番",
    "新番", "季度", "评分", "追番", "片单",
]

ANIME_PROMPT_TEMPLATE = """当季动漫数据和趋势如下：

{anime_data}

【本期统计（已算好，直接可用，不要自己再算）】
{stats}

部分动漫的网友讨论：
{comments_data}

【本期角度】{angle_name} —— {angle_desc}

【近 60 天已经写过的作品，绝对不要再写】
{excluded}

要求：
1. 简洁直观，直达主题：每部作品一两句说清亮点，不渲染不夸张
2. 可以夸，但要克制——说具体哪点好，不用"我吹爆 / 头皮发麻 / 太炸了"这类感叹腔
3. **严格按「本期角度」写**，不要每期都写成同一套新番速览
4. **只写上面数据里的作品**；可写的作品如果不足 5 部，就少写几部（3 部也行），
   宁可少写也不要把「已写过的作品」换个说法再写一遍
5. 网友评论、弹幕热词挑 1-2 条穿插即可，保持圈内氛围但不刷屏
6. 排版结构（必须照做，让文章不像流水账）：
   - 开头先放一个导读卡，一句话总结本季结论：
     {{% note green %}}本季一句话：……{{% endnote %}}
   - 涉及排序/榜单时，一律用 markdown 表格（| # | 作品 | 热度 | 评分 |），不要写成 1. xxx 的有序列表
   - 每部作品单独一节：## 作品名，紧接着一行数据胶囊（热度/评分取「当季动漫数据」里的真实数字，不要编造）：
     {{% label '热度 10.4万' blue %}} {{% label '评分 85' green %}}
     然后 1-2 句点评，最后用一句 > 一句话： 提炼这一部的核心看点
   - 多部作品合写（如「其他值得一看」）时，用无序列表，每条：
     - **作品名** {{% label '评分 85' orange %}} 一句点评
   - <!-- more --> 放在导读卡和表格之后（让首页卡片预览有实质内容）
   - 不要用独占一行的加粗（**第1名：作品名**）冒充小标题
7. 标题（只写一行，以 # 开头；正文里不要再重复这个标题）：
   - 像个人博客更新，不像榜单、简报或运营号
   - 必须有一个具体锚点：至少一个具体作品名，或一个具体现象/判断（续作、原创、弃番、完结、制作公司）
   - 12~26 字，陈述句或疑问句，不用感叹号、不用 emoji
   - 角度名只用来理解任务，**不要写进标题**
   - 禁止词：当季新番、本季、热度榜、速览、一览、盘点、观察、数据、推荐、清单、Top、必看、N部番、好家伙、炸了、绝了、头皮发麻、我吹爆
   - 示例（学语气，不照抄）：
     · 边缘行者2 热度第一，评分却输给药屋少女
     · 这季榜单前列几乎全是续作，原创番去哪了
     · 追了两个月，片单定在 4 部：弃掉热度前三
8. 事实纪律：剧情/制作信息只写上面数据里有的（AniList 的评分、集数、简介、题材）；
   简介里没提的剧情发展、结局、名场面一律不写
   - 不写结局、不写关键转折、不写未播出剧情；评论里涉及剧透的内容一律不引用
   - 提到评分和热度时标注"数据截至 {date_display}"
   - 网友评论只能来自提供的评论数据，没有就不引用
9. 禁用词表：聚焦于、旨在、折射出、随着……的快速迭代、上述动态、与此同时、值得关注的是、
   引发了广泛讨论、在……的背景下、综上所述、值得一提的是、不可忽视的是、标志着、
   进一步加剧了、后续进展值得持续跟踪、好家伙、这波操作、炸了、太炸了、绝了、
   头皮发麻、我吹爆、排雷、安利指南、看完不亏"""


# ── 去重：数据层过滤 ────────────────────────────────────────────────────

# 常见繁体/日式汉字 → 简体，用于作品名比较（"无职转生" 要能匹配 "無職転生"）
_T2S = {
    "無": "无", "職": "职", "轉": "转", "転": "转", "戰": "战", "薬": "药", "學": "学",
    "園": "园", "劍": "剑", "騎": "骑", "確": "确", "續": "续", "週": "周", "動": "动",
    "畫": "画", "劇": "剧", "場": "场", "會": "会", "實": "实", "體": "体", "點": "点",
    "龍": "龙", "傳": "传", "說": "说", "讀": "读", "語": "语", "記": "记", "話": "话",
    "見": "见", "貓": "猫", "裡": "里", "餘": "余", "庫": "库", "選": "选", "邊": "边",
    "還": "还", "這": "这", "們": "们", "個": "个", "來": "来", "對": "对", "開": "开",
    "關": "关", "聽": "听", "觀": "观", "測": "测", "覺": "觉", "數": "数", "時": "时",
    "書": "书", "東": "东", "馬": "马", "鳥": "鸟", "鳴": "鸣", "黃": "黄", "歲": "岁",
    "歸": "归", "殺": "杀", "決": "决", "為": "为", "愛": "爱", "戀": "恋", "樣": "样",
    "樂": "乐", "氣": "气", "淚": "泪", "聲": "声", "寶": "宝", "財": "财", "買": "买",
    "賣": "卖", "費": "费", "賽": "赛", "車": "车", "輪": "轮", "輕": "轻", "遠": "远",
    "遊": "游", "運": "运", "過": "过", "達": "达", "醫": "医", "長": "长", "門": "门",
    "間": "间", "陽": "阳", "陰": "阴", "階": "阶", "隊": "队", "隨": "随", "險": "险",
    "難": "难", "雲": "云", "電": "电", "靜": "静", "韓": "韩", "頂": "顶", "題": "题",
    "風": "风", "飛": "飞", "飲": "饮", "館": "馆", "髪": "发", "魚": "鱼", "進": "进",
    "禍": "祸", "譚": "谭", "異": "异", "變": "变", "靈": "灵", "萬": "万", "僕": "仆",
    "姫": "姬", "悪": "恶", "經": "经", "歴": "历", "銀": "银", "鉄": "铁", "鋼": "钢",
    "優": "优", "県": "县", "郷": "乡", "桜": "樱", "櫻": "樱", "楓": "枫", "樹": "树",
    "蘭": "兰", "藍": "蓝", "螢": "萤", "蛍": "萤", "蟻": "蚁", "鯨": "鲸", "鮫": "鲛",
    "鯖": "鲭", "鰻": "鳗", "鯉": "鲤", "鮮": "鲜", "鶏": "鸡", "鷹": "鹰", "鴉": "鸦",
    "鶴": "鹤", "鷲": "鹫", "絶": "绝", "続": "续", "単": "单", "売": "卖", "駅": "站",
    "円": "元", "悪": "恶", "涙": "泪", "済": "济", "渋": "涩", "渓": "溪", "焼": "烧",
    "煙": "烟", "爆": "爆", "獣": "兽", "献": "献", "猫": "猫",
}


def _fold(s: str) -> str:
    """繁体/日式汉字折叠为简体，只用于比较，不改变输出。"""
    return "".join(_T2S.get(c, c) for c in (s or ""))


# 季数/部数后缀：無職転生Ⅲ、薬屋のひとりごと 第3期、Season 2 …
_SEASON_SUFFIX = re.compile(
    r'(第\s*[0-9一二三四五六七八九十]+\s*[期季部章]|season\s*\d+|\d+\s*(?:st|nd|rd|th)\s*season|[Ⅰ-Ⅹ]+|\d+)\s*$',
    re.I,
)


def _variants(name: str) -> set:
    """作品名的等价写法：原名、简体、去掉季数后缀。"""
    vs = set()
    for n in {name, _fold(name)}:
        n = (n or "").strip()
        if len(n) >= 3:
            vs.add(n)
        v = _SEASON_SUFFIX.sub("", n).strip()
        if len(v) >= 4:
            vs.add(v)
    return vs


def _norm_title(s: str) -> str:
    """归一化标题，用于比较（简繁折叠 + 去标点/空格/大小写）。"""
    return re.sub(r"[\s\-_:：·・!！?？,，.。'\"“”‘’《》〈〉「」『』（）()\[\]【】]", "", _fold(s).lower())


def _item_names(a) -> list:
    """取一部作品的所有可能名字（兼容 dataclass 与 dict）。"""
    keys = ("title_cn", "title_romaji", "title_english", "title", "title_native")
    names = []
    for k in keys:
        v = a.get(k) if isinstance(a, dict) else getattr(a, k, None)
        if v:
            names.append(str(v))
    return names


def _filter_excluded(anime_data: list, excluded: list) -> list:
    """在数据层剔除近 60 天写过的作品，不靠 AI 自觉。

    两边都取等价写法（简繁 + 去季数），所以"无职转生"能挡住"無職転生Ⅲ"。
    """
    blocked = set()
    for t in excluded or []:
        if not t:
            continue
        n = _norm_title(t)
        if len(n) >= 3:
            blocked.add(n)
        for v in _variants(t):
            nv = _norm_title(v)
            if len(nv) >= 4:
                blocked.add(nv)
    if not blocked:
        return list(anime_data or [])

    out = []
    for a in anime_data or []:
        names = set()
        for n in _item_names(a):
            for v in _variants(n):
                nv = _norm_title(v)
                if len(nv) >= 4:
                    names.add(nv)
        if names & blocked:
            continue
        out.append(a)
    return out


# ── 统计块：让 AI 有依据，不用自己编 ────────────────────────────────────

def _anime_stats(anime_data: list) -> str:
    total = len(anime_data or [])
    if not total:
        return "无数据"
    scores = []
    for a in anime_data:
        s = a.get("average_score") if isinstance(a, dict) else getattr(a, "average_score", 0)
        s = s or (a.get("mean_score") if isinstance(a, dict) else getattr(a, "mean_score", 0)) or 0
        if s:
            scores.append(s)
    if not scores:
        return f"共 {total} 部；暂无评分数据"
    top = max(anime_data, key=lambda a: (a.get("average_score") if isinstance(a, dict) else getattr(a, "average_score", 0)) or 0)
    top_name = _item_names(top)[0] if _item_names(top) else "未知"
    top_score = top.get("average_score") if isinstance(top, dict) else getattr(top, "average_score", 0)
    return (
        f"共 {total} 部；有评分 {len(scores)} 部；平均分 {sum(scores) / len(scores):.1f}；"
        f"最高分《{top_name}》{top_score}"
    )


# ── 角度轮换 ────────────────────────────────────────────────────────────

def _angle_for_date(date_str: str, last_angle: str = None):
    """优先按「上一篇的角度」往后推一位；读不到上一篇才按周取模。"""
    names = [a[0] for a in ANGLES]
    if last_angle in names:
        return ANGLES[(names.index(last_angle) + 1) % len(ANGLES)]
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
    except (ValueError, TypeError):
        dt = datetime.now()
    return ANGLES[(dt.isocalendar()[1] - 1) % len(ANGLES)]


def detect_last_angle() -> str:
    """从最近一篇动漫文章的标签反推它用的角度。"""
    posts_dir = os.path.join(BLOG_DIR, "source", "_posts", "anime")
    if not os.path.isdir(posts_dir):
        return None
    tag_to_angle = {}
    for angle, tags in ANGLE_TAGS.items():
        for t in tags:
            tag_to_angle[t] = angle
    for fname in sorted(os.listdir(posts_dir), reverse=True):
        if not fname.endswith(".md"):
            continue
        try:
            with open(os.path.join(posts_dir, fname), encoding="utf-8") as f:
                content = f.read()
        except Exception:
            continue
        m = re.search(r"^tags:(.*?)(?=^[A-Za-z_\-]+:)", content, re.MULTILINE | re.DOTALL)
        if not m:
            continue
        for line in m.group(1).split("\n"):
            tag = re.sub(r"^\s*-\s*", "", line).strip()
            if tag in tag_to_angle:
                return tag_to_angle[tag]
        return None  # 最近一篇没有角度标签（老文章），交给按周取模
    return None


# ── 标题校验 ────────────────────────────────────────────────────────────

def _title_has_work(title: str, anime_data: list) -> bool:
    """标题里是否出现了数据中的作品名（整名或作品名片段，如「薬屋のひとりごと」）。"""
    fragments = set()
    for a in anime_data or []:
        for n in _item_names(a):
            for v in _variants(n):
                if len(v) >= 3:
                    fragments.add(v)
            # 作品名按空格切开后，长度足够的片段也算（避免只写副标题时判不合格）
            for part in re.split(r"[\s:：·・\-—]+", n):
                if len(part) >= 3:
                    fragments.add(part)
                    fragments.add(_fold(part))
    folded = _fold(title)
    return any(f in title or f in folded for f in fragments)


def _title_has_phenomenon(title: str) -> bool:
    return any(w in title for w in PHENOMENON_WORDS)


def _validate_title(title: str, anime_data: list) -> bool:
    if not title:
        return False
    if "#" in title:
        return False
    if not (10 <= len(title) <= 30):
        return False
    if any(w in title for w in BANNED_TITLE_WORDS):
        return False
    # 必须有具体锚点：作品名 或 具体现象
    return _title_has_work(title, anime_data) or _title_has_phenomenon(title)


def _fallback_title(anime_data: list) -> str:
    names = [n for a in (anime_data or [])[:3] for n in _item_names(a)[:1]]
    if len(names) >= 2:
        return f"{names[0]} 和 {names[1]}：这期我只想聊这两部"
    if names:
        return f"{names[0]}：这期追番记录"
    return "这期追番记录"


# ── 生成 ────────────────────────────────────────────────────────────────

_HEADING_RE = re.compile(r'^\s*#{2,3}\s+\S', re.MULTILINE)
# 独占一行的加粗段落（**第1名：作品名**）——AI 常用它冒充小标题
_BOLD_ONLY_RE = re.compile(r'^\s*\*\*(.+?)\*\*\s*$', re.MULTILINE)


def _count_subheadings(text: str) -> int:
    return len(_HEADING_RE.findall(text or ""))


def _has_subheadings(text: str, min_count: int = 2) -> bool:
    """正文有没有真正的 ## 小标题。没有的话目录（TOC）是空的，标题装饰也显示不出来。"""
    return _count_subheadings(text) >= min_count


def _promote_bold_headings(body: str) -> str:
    """把独占一行的 **加粗段落** 提升成 ## 小标题（兜底用，不动文字）。"""

    def sub(m):
        t = m.group(1).strip().strip("：:")
        if 1 < len(t) <= 40:
            return f"## {t}"
        return m.group(0)

    return _BOLD_ONLY_RE.sub(sub, body)


def _looks_like_valid_article(text: str) -> bool:
    """Check if generated text looks like an actual article vs AI self-dialogue loop."""
    has_heading = bool(re.search(r'^\s*#?\s*#+\s+.+', text, re.MULTILINE))
    lines = [l for l in text.split('\n') if l.strip()]
    content_lines = [l for l in lines if
        not re.match(r'^\s*(让我|我应该|实际上|不过我|等等|我需要|我要|用户要求|现在开始撰写)', l.strip()) and
        re.search(r'[\u4e00-\u9fff]{4,}', l)
    ]
    if len(lines) < 3:
        return False
    return has_heading or (len(content_lines) / len(lines)) > 0.4


def _check_prompt_leakage(text: str) -> bool:
    """Check if the text starts with prompt-echo or instruction content."""
    prompt_markers = [
        '用户要求我', '让我先看看', '让我先看看用户',
        '当季动漫数据和趋势', '部分动漫的网友',
    ]
    head = "\n".join(text.strip().split("\n")[:5])  # 前 5 行，防止"好的，我来写"占掉第一行
    return any(marker in head for marker in prompt_markers)


_HEAT_RE = re.compile(r"热度[：: ]*([\d,]+(?:\.\d+)?\s*万?)", re.I)
_SCORE_RE = re.compile(r"评分[：: ]*(\d{1,3})", re.I)
# 像「主要趋势 / 其他值得一看 / 当季热度TOP6」这种聚合段，不要插数据胶囊
_GROUP_KW = ("趋势", "其他", "值得", "合集", "排名", "榜", "回顾", "速览", "一览",
             "总结", "题材", "主要", "中等", "低分", "聊", "说", "合写", "TOP", "杂")


def _fmt_heat(val: str) -> str:
    """'138715' -> '13.9万'；'10万+' -> '10万'；失败返回原串。"""
    s = (val or "").strip().rstrip("+")
    if "万" in s:
        return s
    s = s.replace(",", "")
    try:
        x = int(s)
    except ValueError:
        return val
    return f"{x / 10000:.1f}万" if x >= 10000 else str(x)


def enrich_layout(body: str, anime_data=None) -> str:
    """生成后兜底加料：给「含 评分+热度、且标题不像聚合段」的 ## 作品节，
    插入真实 热度/评分 数据胶囊（label）；并保证 <!-- more --> 在首个小标题之前，
    让首页卡片预览有实质内容。"""
    lines = body.split("\n")
    out, n = [], len(lines)
    i = 0
    while i < n:
        line = lines[i]
        out.append(line)
        m = re.match(r"^##\s+(.+?)\s*$", line)
        if m and not any(k in m.group(1) for k in _GROUP_KW):
            sect, j = [], i + 1
            while j < n and not re.match(r"^##\s", lines[j]):
                sect.append(lines[j])
                j += 1
            # 只看小节前 4 行，避免把别家作品的数字误挂上来
            sect_head = "\n".join(sect[:4])
            if "{% label" not in "\n".join(sect):
                hr, sc = _HEAT_RE.search(sect_head), _SCORE_RE.search(sect_head)
                if hr or sc:
                    out.append("")
                    parts = []
                    if hr:
                        parts.append(
                            f"{{% label '热度 {_fmt_heat(hr.group(1))}' blue %}}")
                    if sc:
                        parts.append(f"{{% label '评分 {sc.group(1)}' green %}}")
                    out.append(" ".join(parts))
        i += 1
    body = "\n".join(out)
    if "<!-- more -->" not in body:
        m = re.search(r"(?m)^##\s", body)
        if m:
            body = body[:m.start()] + "\n<!-- more -->\n\n" + body[m.start():]
    return body


def generate_anime(anime_data: list, comments_text: str, date_str: str,
                   excluded: list = None, last_angle: str = None) -> str:
    """Generate an anime news/recommendation article.

    excluded: 近 60 天写过的作品名，在数据层过滤（不只是写进 prompt）。
    last_angle: 上一篇的角度，用于轮换；不传则自动从最近一篇文章的标签推断。
    """
    date_display = format_date(date_str)
    excluded = [t for t in (excluded or []) if t]

    # 1) 定角度
    angle_name, angle_desc = _angle_for_date(date_str, last_angle or detect_last_angle())

    # 2) 选数据源 + 数据层去重
    data = _filter_excluded(anime_data or [], excluded)
    if angle_name == "冷门补番":
        try:
            from scrapers.anime_sources import fetch_top_rated
            top = _filter_excluded(fetch_top_rated(limit=30) or [], excluded)
            if len(top) >= 5:
                data = top
            else:
                logger.warning("高分榜过滤后不足 5 部（%d），回退当季数据", len(top))
        except Exception as e:
            logger.warning("高分榜抓取失败，回退当季数据: %s", e)

    # 3) 过滤后不足 3 部 → 换一个数据源再试
    if len(data) < 3:
        try:
            from scrapers.anime_sources import fetch_top_rated, fetch_current_season
            alt_src = fetch_current_season(limit=15) if angle_name == "冷门补番" else fetch_top_rated(limit=30)
            alt = _filter_excluded(alt_src or [], excluded)
            if len(alt) > len(data):
                logger.warning("当季数据过滤后仅 %d 部，改用备选数据源 %d 部", len(data), len(alt))
                data = alt
        except Exception as e:
            logger.warning("备选数据源抓取失败: %s", e)
        if len(data) < 3:
            logger.warning("过滤后可用作品仅 %d 部，本期改为少写几部", len(data))

    # 4) 拼 prompt
    from scrapers.anime_sources import format_anime_for_prompt
    anime_block = format_anime_for_prompt(data)
    stats_block = _anime_stats(data)
    excluded_text = "、".join(excluded) if excluded else "无"

    prompt = ANIME_PROMPT_TEMPLATE.format(
        anime_data=anime_block,
        stats=stats_block,
        comments_data=comments_text or "暂无",
        angle_name=angle_name,
        angle_desc=angle_desc,
        excluded=excluded_text,
        date_display=date_display,
    )

    result = call_agnes(prompt, max_tokens=4000)
    if not result:
        logger.error("动漫文章生成失败")
        return ""

    # 5) 安全检查
    if _check_prompt_leakage(result):
        logger.warning("动漫文章疑似 prompt 回显，丢弃")
        return ""
    if not _looks_like_valid_article(result):
        logger.warning("动漫文章疑似 AI 自我对话循环，丢弃")
        return ""

    # 6) 标题 + 小标题结构，不合格重试一次
    title = extract_title(result)
    bad_title = not _validate_title(title, data)
    bad_headings = not _has_subheadings(result)
    if bad_title or bad_headings:
        logger.warning("重试一次：标题=%r 标题不合格=%s 小标题数=%d",
                       title, bad_title, _count_subheadings(result))
        reasons = []
        if bad_title:
            reasons.append("标题必须包含一个具体作品名，或一个具体现象"
                           "（续作/原创/弃番/完结/制作公司），12~26 字，且不得出现禁用词")
        if bad_headings:
            reasons.append("每部作品单独成节，都要用 ## 小标题（小标题写作品名），"
                           "不要用加粗段落冒充小标题")
        retry_prompt = (
            prompt + "\n\n【上一次不合格，请重新输出全文】" + "；".join(reasons) + "。"
        )
        result = call_agnes(retry_prompt, max_tokens=4000)
        if result and not _check_prompt_leakage(result):
            title = extract_title(result)
        if not _validate_title(title, data):
            title = _fallback_title(data)
            logger.warning("标题仍不合格，用作品名兜底: %s", title)

    body = strip_title_from_body(result) if extract_title(result) else result

    # 6b) 小标题兜底：AI 还是拿加粗冒充小标题的话，把独占一行的加粗段落提升成 ##
    if not _has_subheadings(body):
        promoted = _promote_bold_headings(body)
        if _has_subheadings(promoted):
            logger.warning("小标题缺失，已把 %d 处加粗段落提升为 ## 小标题",
                           _count_subheadings(promoted))
            body = promoted
        else:
            logger.warning("小标题仍少于 2 个，保留原文（目录会是空的）")

    # 6c) 排版兜底：给作品节插真实 热度/评分 label，并保证 <!-- more --> 位置
    body = enrich_layout(body, data)

    # 7) 动态标签
    tags = ["动漫"] + ANGLE_TAGS.get(angle_name, ["追番"])

    return build_post(title, body, "动漫", date_str, tags)
