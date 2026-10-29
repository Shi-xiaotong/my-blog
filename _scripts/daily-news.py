#!/usr/bin/env python3
"""Daily news generator: Scrapling scrape + Agnes AI summary (with retry)"""
import os, re, ssl, sys, json, urllib.request, time
from datetime import datetime, timedelta
from scrapling.parser import Selector

BLOG_DIR = os.environ.get("BLOG_DIR", ".")
AGNES_KEY = os.environ.get("AGNES_API_KEY", "")
if not AGNES_KEY:
    env_path = os.path.join(BLOG_DIR, ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("AGNES_API_KEY="):
                    AGNES_KEY = line.strip().split("=", 1)[1]
                    break

# SSL verification enabled by default — no custom context needed for urllib
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
AI_API = "https://apihub.agnes-ai.com/v1/chat/completions"
MAX_RETRIES = 3


def retry(fn, label="", max_retries=MAX_RETRIES):
    last_err = None
    for attempt in range(1, max_retries + 1):
        try:
            return fn()
        except Exception as e:
            last_err = e
            if attempt < max_retries:
                wait = min(2 ** attempt * 2, 30)
                print(f"    [RETRY {attempt}/{max_retries}] {label}: {str(e)[:60]} (wait {wait}s)", flush=True)
                time.sleep(wait)
    print(f"    [FAIL] {label}: {last_err}", flush=True)
    return None


def fetch_html(url, timeout=25):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode('utf-8', errors='replace')


def scrape_articles(date_str):
    date_path = date_str.replace('-', '/')
    urls_to_try = [
        f'https://techcrunch.com/{date_path}/',
        f'https://techcrunch.com/{date_path}',
    ]

    html = None
    for url in urls_to_try:
        result = retry(lambda u=url: fetch_html(u), label=f"fetch {url.rsplit('/', 1)[-1]}", max_retries=2)
        if result:
            html = result
            break

    if not html:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        if date_obj > datetime.now():
            print(f"    [SKIP] Future date, no archive yet")
            return []
        print(f"    Fallback: scraping front page...", flush=True)
        result = retry(lambda: fetch_html('https://techcrunch.com/', timeout=30), label="fetch front page")
        if not result:
            return []
        html = result

    page = Selector(html)
    links = page.css('a[href*="techcrunch.com/' + datetime.now().strftime('%Y') + '/"]')
    articles = []
    seen = set()
    for a in links:
        title = a.css('::text').get()
        href = a.attrib.get('href', '')
        if title and href:
            title = title.strip()
            if title and title not in seen and len(title) > 15:
                seen.add(title)
                articles.append({'title': title, 'url': href})
    return articles[:5]


def scrape_content(url):
    def _fetch():
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as r:
            raw = r.read()
            ct = r.headers.get('Content-Type', '')
            charset = 'utf-8'
            if 'charset=' in ct:
                charset = ct.split('charset=')[-1].split(';')[0].strip()
            html = raw.decode(charset, errors='replace')
        page = Selector(html)
        for sel in ['.entry-content p', 'article p']:
            paras = page.css(sel)
            texts = [p.css('::text').get() for p in paras]
            texts = [t.strip() for t in texts if t and t.strip()]
            if len(texts) >= 2:
                return '\n'.join(texts[:5])
        return ""
    result = retry(_fetch, label=f"content {url.rsplit('/', 1)[-1][:30]}")
    return result or ""


def llm_summarize(date_display, articles):
    news_block = ""
    for art in articles:
        news_block += f"- 标题: {art['title']}\n  链接: {art['url']}\n"
        if art.get('content'):
            news_block += f"  摘要: {art['content'][:1200]}\n"
    prompt = f"""你是科技博客中文编辑。根据以下今天从 TechCrunch 爬取的真实新闻，写一篇中文每日热点文章。

日期: {date_display}

新闻:
{news_block}

要求：
- 选 2-4 条重要新闻
- 每条写一段中文概述（150-250字），只复述上面「摘要」里已有的内容
- 每条标注「[来源](url)」
- 全文 Markdown
- 不要为了凑字数补充信息，宁可短也不许编

【事实铁律】（违反即视为失败输出）
- 只能复述上面「摘要」中出现过的事实。摘要里没有的信息，一律不许写。
- 严禁补充：具体数字（金额/百分比/排名/日期）、人物姓名与职务、公司名、地点、事件起因与结果、直接引语。
- 严禁“合理推断”：不能根据标题猜测细节，不能把常识当作该新闻的事实。
- 某条新闻的摘要不足以支撑一段时，只写一句概述。
- 禁用“据报道”“据知情人士”“业内认为”等无出处表述。

【标题规则】（最重要）
标题用 #，必须是第一条新闻的中文直译，禁止任何创作发挥：
- 禁止口语化：不能用"这波操作/真服了/绝了/说实话/好家伙/我直接"
- 禁止悬念钩子：不能用"今天热搜看下来/心情像坐过山车"
- 禁止日期前缀：不能用"今天/今日/周末"开头
- 禁止主观评价：不能用"炸场/硬核/有点猛/有点意思"
- 正确示例：
  - "郑钦文2:0战胜斯瓦泰克晋级决赛"
  - "中秋放假3天不调休但高速不免费"
  - "多国从美国运回黄金储备"

【副标题规则】
标题后紧接一行副标题（即文章开头段落），用作卡片摘要：
- 一句话，不超过 50 字
- 正常平实的描述，客观概括第一条新闻的核心事实
- 禁止口语、禁止主观表达（不用"说实话/我觉得/好家伙"）
- 禁止夸张（不用"千分之一概率/离谱/炸场"）
- 正确示例："郑钦文在半决赛中2:0战胜世界第一斯瓦泰克，晋级决赛"

其他：
- 新闻用 ##
- 结尾一句话互动提问即可，不要长篇总结
- 正文全程使用中文，禁止中英混杂
- 不要编造事实"""
    import os as _os
    model = _os.environ.get("AGNES_MODEL", "agnes-2.5-flash")
    payload = json.dumps({
        "model": model,
        "messages": [
            {"role": "system", "content": "你是一个专业的科技新闻中文编辑。你的唯一素材是用户提供的「摘要」，严禁编造、严禁推断、严禁补充摘要中不存在的任何细节（数字、人名、职务、公司、地点、引语、因果）。摘要不足时宁可写短，也不许凑字数。回复使用纯 Markdown，不要输出任何思考过程、自我检查、约束条件、格式说明——只输出文章本身。"},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 12000,
        "temperature": 0.3
    }).encode()

    def _call():
        req = urllib.request.Request(
            AI_API, data=payload,
            headers={"Authorization": f"Bearer {AGNES_KEY}", "Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=120) as r:
            raw = json.loads(r.read())
            content = raw["choices"][0]["message"].get("content", "")
            if not content or not content.strip():
                return None
            # Clean leaked thinking/self-review from AI output
            from generators import extract_article_from_leaky_output, _clean_reasoning_output
            content = _clean_reasoning_output(content)
            _, cleaned = extract_article_from_leaky_output(content)
            if cleaned:
                content = cleaned
            return content.strip()

    return retry(_call, label="Agnes API")


# ─── 事实自检 ────────────────────────────────────────────────────────────────
# 正文里的数字与英文实体必须能在抓取原文中找到；找不到说明是 AI 编的，该话题降级。

_ENTITY_STOPWORDS = {
    "The", "This", "That", "These", "Those", "There", "Their", "Then", "They",
    "And", "But", "For", "With", "From", "When", "While", "What", "Which",
    "However", "Meanwhile", "Also", "Although", "Because", "After", "Before",
    "According", "Source", "Sources", "More", "Read", "Update", "Note",
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December",
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
}


def _extract_fact_entities(text):
    """提取可核实的事实性实体：带单位的数字 + 英文专有名词。"""
    nums = re.findall(
        r'\d[\d,\.]*\s*(?:%|亿|万|千|美元|欧元|英镑|日元|元|个|家|位|名|倍|台|款|条|年|月|日|GB|TB|MB|kg)',
        text,
    )
    terms = re.findall(r'\b[A-Z][A-Za-z0-9\.\-]{2,}\b', text)
    return {n.replace(' ', '') for n in nums} | {t for t in terms if t not in _ENTITY_STOPWORDS}


def verify_facts(body, articles):
    """把未通过事实核验的话题降级为短概述，返回 (body, 未核实实体列表)。"""
    source_text = " ".join(
        (a.get('content') or '') + " " + (a.get('title') or '') for a in articles
    ).replace(' ', '')

    parts = re.split(r'^(## .+)$', body, flags=re.MULTILINE)
    if len(parts) < 3:
        return body, []

    unverified = []
    out = []
    for i in range(1, len(parts), 2):
        heading = parts[i]
        content = parts[i + 1] if i + 1 < len(parts) else ''
        bad = [e for e in _extract_fact_entities(content)
               if e.replace(' ', '') not in source_text]
        if bad:
            unverified.extend(bad)
            url_m = re.search(r'\[来源\]\((https?://[^\)]+)\)', content)
            note = "（此条未通过事实核验，细节已省略）"
            if url_m:
                note += f"\n\n[来源]({url_m.group(1)})"
            content = "\n\n" + note + "\n"
        out.append(heading + content)
    return parts[0] + "".join(out), unverified


def generate(date_str):
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    date_display = date_obj.strftime("%Y年%m月%d日")
    post_path = os.path.join(BLOG_DIR, "source", "_posts", "daily-news", f"{date_str}-digest.md")
    if os.path.exists(post_path):
        print(f"[{date_str}] Exists, skip")
        return
    print(f"[{date_str}] Scraping...", flush=True)
    articles = scrape_articles(date_str)
    if not articles:
        print(f"  No articles found, creating placeholder")
        md = f"""---
title: "{date_display} 科技资讯"
date: {date_str} 12:00:00
categories:
  - 每日热点
tags:
  - 每日热点
description: "{date_display} 科技资讯。"
---
暂无今日科技资讯数据。"""
        with open(post_path, "w", encoding="utf-8") as f:
            f.write(md)
        return
    print(f"  Got {len(articles)} articles, fetching content...", flush=True)
    for art in articles:
        art['content'] = scrape_content(art['url'])
    print(f"  Summarizing via AI...", flush=True)
    result = llm_summarize(date_display, articles)
    if result and result.strip():
        body = result
        title_m = re.search(r'^#\s+(.+)', body, re.MULTILINE)
        title = title_m.group(1).strip() if title_m else articles[0]['title']
        body = re.sub(r'^#\s+.*\n', '', body, count=1).strip()
    else:
        if result is not None:
            print("  [WARN] AI returned empty content (reasoning model may need more tokens), using raw fallback", flush=True)
        else:
            print("  [WARN] AI API call failed after retries, using raw fallback", flush=True)
        body_parts = ["今天的科技圈发生了这些事。\n"]
        for art in articles[:4]:
            body_parts.append(f"## {art['title']}\n")
            if art.get('content'):
                body_parts.append(art['content'][:200] + "\n")
            body_parts.append(f"[来源]({art['url']})\n")
        body_parts.append(f"---\n以上就是 {date_display} 的科技资讯精选。关注「水星引力m」，每天带你看点不一样的。\n")
        body = "\n".join(body_parts)
        title = articles[0]['title']
    # Strip --- separators between topics (keep only the last one at the end)
    import re as _re
    body = _re.sub(r'\n---\n\s*(?=\n?## )', '\n', body)
    body = _re.sub(r'\n---\n\s*(?=\n?---)', '\n', body)
    body = _re.sub(r'\n{3,}', '\n\n', body)
    # 事实自检：正文中的数字/英文实体必须能在抓取原文中找到
    body, unverified = verify_facts(body, articles)
    if unverified:
        print(f"  [FACT-CHECK] 降级 {len(unverified)} 处不可核实内容: {unverified[:8]}", flush=True)
    if '<!-- more -->' not in body:
        paras = body.split('\n\n')
        if len(paras) > 2:
            body = paras[0] + '\n\n<!-- more -->\n\n' + '\n\n'.join(paras[1:])
    # Extract description: skip <!-- more -->, --- separators, and empty lines
    paras = body.split('\n\n')
    first_para = ''
    for p in paras:
        p = p.replace('\n', ' ').strip()
        if p and p != '<!-- more -->' and p != '---' and not p.startswith('#'):
            first_para = p[:120]
            break
    if not first_para:
        first_para = articles[0]['title'][:120].replace('"', "'")
    desc = first_para.replace('"', "'")
    title = title.replace('"', "'")
    md = f"""---
title: "{title}"
date: {date_str} 12:00:00
categories:
  - 每日热点
tags:
  - 每日热点
description: "{desc}"
---

{body}
"""
    with open(post_path, "w", encoding="utf-8") as f:
        f.write(md)
    print(f"  [OK] {post_path}", flush=True)


if __name__ == "__main__":
    dates = sys.argv[1:]
    if not dates:
        today = datetime.now().strftime("%Y-%m-%d")
        dates = [today]
    for d in dates:
        generate(d)
