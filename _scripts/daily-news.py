#!/usr/bin/env python3
"""Daily news blog post generator"""
import json, os, ssl, urllib.request, base64, subprocess, re, time, random
from datetime import datetime

ctx = ssl.create_default_context()

AGNES_KEY = os.environ.get("AGNES_API_KEY", "")
BLOG_DIR = os.environ.get("BLOG_DIR", ".")

# ---- 风格池：每天随机抽一种，避免千篇一律 ----
STYLES = [
    {
        "name": "毒舌吐槽",
        "system": "你是一个犀利毒舌的科技博主，说话直接带刺，喜欢用比喻和反讽。偶尔爆粗口（卧槽、他妈的），但不过度。每段吐槽角度不同，有的偏技术、有的偏商业、有的偏生活。不要每次都从同一个句式开始。输出纯Markdown。",
        "tone_words": ["毒舌", "犀利", "直白"],
    },
    {
        "name": "理性分析",
        "system": "你是一个偏理性的科技观察者，不骂人但观点鲜明。喜欢用数据和逻辑拆解事件，偶尔带点黑色幽默。语气像一个懂行的朋友在跟你聊天，不是写论文。输出纯Markdown。",
        "tone_words": ["理性", "客观", "逻辑"],
    },
    {
        "name": "段子手",
        "system": "你是一个科技圈的段子手，擅长用生活中的比喻解释技术问题。语言轻松活泼，经常自嘲。每篇文章要有至少一个让人笑出声的金句。不要板着脸说教。输出纯Markdown。",
        "tone_words": ["幽默", "段子", "比喻"],
    },
    {
        "name": "行业老炮",
        "system": "你是一个在科技行业摸爬滚打多年的老炮儿，见过太多起起落落。语气沉稳但一针见血，喜欢用\u201c我当年\u201d开头讲亲身经历。对新技术既不盲目追捧也不全盘否定，而是冷静分析利弊。输出纯Markdown。",
        "tone_words": ["老炮", "沉稳", "亲历"],
    },
    {
        "name": "极简快讯",
        "system": "你是一个极简风格的科技博主，每篇只写3件事，每件事不超过150字。不啰嗦，不铺垫，上来就干货。偶尔一句神总结。像朋友圈发动态一样自然。输出纯Markdown。",
        "tone_words": ["极简", "干练", "短句"],
    },
    {
        "name": "八卦吃瓜",
        "system": '你是一个科技圈的八卦博主，用看热闹的心态报道科技新闻。语气像一个在微信群里发吃瓜链接的朋友，"你们猜怎么着"、"离谱"、"绝了"是常用词。适当加入"据说"、"网传"等不确定表述，保持吃瓜人不站队的调性。输出纯Markdown。',
        "tone_words": ["八卦", "吃瓜", "群聊"],
    },
]

STYLE = random.choice(STYLES)


def llm_chat(prompt, max_tokens=3000):
    payload = json.dumps({
        "model": "agnes-2.0-flash",
        "messages": [
            {"role": "system", "content": STYLE["system"]},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": max_tokens,
        "temperature": 0.85
    }).encode()
    req = urllib.request.Request(
        "https://apihub.agnes-ai.com/v1/chat/completions",
        data=payload,
        headers={"Authorization": f"Bearer {AGNES_KEY}", "Content-Type": "application/json"}
    )
    resp = urllib.request.urlopen(req, timeout=120, context=ctx)
    return json.loads(resp.read())["choices"][0]["message"]["content"]


def gen_image(prompt, output_path):
    payload = json.dumps({
        "model": "agnes-image-2.1-flash",
        "prompt": prompt,
        "size": "1024x768",
        "n": 1
    }).encode()
    req = urllib.request.Request(
        "https://apihub.agnes-ai.com/v1/images/generations",
        data=payload,
        headers={"Authorization": f"Bearer {AGNES_KEY}", "Content-Type": "application/json"}
    )
    resp = urllib.request.urlopen(req, timeout=180, context=ctx)
    data = json.loads(resp.read())
    img_url = data["data"][0].get("url", "")
    if img_url:
        urllib.request.urlretrieve(img_url, output_path)
    else:
        with open(output_path, "wb") as f:
            f.write(base64.b64decode(data["data"][0].get("b64_json", "")))


def upload_r2(local_path, remote_key):
    env = os.environ.copy()
    env["CLOUDFLARE_API_TOKEN"] = env.get("CF_R2_TOKEN", "")
    env["CLOUDFLARE_ACCOUNT_ID"] = env.get("CF_ACCOUNT_ID", "")
    result = subprocess.run([
        "npx", "wrangler", "r2", "object", "put", f"myblog/{remote_key}",
        f"--file={local_path}", "--content-type", "image/png", "--remote"
    ], capture_output=True, text=True, timeout=120, cwd=BLOG_DIR, env=env)
    if result.returncode != 0:
        print(f"    R2 upload failed: {result.stderr[:200]}", flush=True)
        return ""
    return f"https://img.233002.xyz/{remote_key}"


def main():
    today = datetime.now().strftime("%Y-%m-%d")
    date_cn = datetime.now().strftime("%Y年%m月%d日")

    print(f"[1/4] Style: {STYLE['name']} | Generating article for {today}...", flush=True)
    prompt_text = (
        f"今天是{date_cn}。写一篇每日热点博客文章，选3-4个近期热门科技/AI/互联网新闻。\n"
        f"要求：\n"
        f"1. 开头用一句符合你风格的话概括当天科技圈状况\n"
        f"2. 每个事件##章节，字数灵活（100-300字），角度不要千篇一律\n"
        f"3. 结尾引导关注水星引力m公众号\n"
        f"4. 每个章节标题后写 [IMG: 英文图片描述]，文章开头写 [COVER: 英文封面描述]\n"
        f"5. 纯Markdown，不要任何额外说明"
    )
    article = llm_chat(prompt_text)
    print(f"  Article: {len(article)} chars", flush=True)

    print("[2/4] Generating images...", flush=True)
    img_prompts = re.findall(r'\[IMG:\s*(.*?)\]', article)
    cover_m = re.search(r'\[COVER:\s*(.*?)\]', article)
    all_prompts = [cover_m.group(1) if cover_m else "Breaking news collage"] + img_prompts
    while len(all_prompts) < 5:
        all_prompts.append("Daily news editorial illustration")
    all_prompts = all_prompts[:7]

    img_urls = []
    for i, p in enumerate(all_prompts):
        local = f"/tmp/daily-news-{today}-{i+1}.png"
        try:
            gen_image(p, local)
            url = upload_r2(local, f"blog/daily-news-{today}-{i+1}.png")
            img_urls.append(url)
            print(f"  Image {i+1}: OK", flush=True)
            time.sleep(2)
        except Exception as e:
            print(f"  Image {i+1}: FAIL {e}", flush=True)
            img_urls.append("")

    print("[3/4] Building article...", flush=True)
    final = re.sub(r'\[COVER:.*?\]', '', article)
    idx = 1
    def repl(m):
        nonlocal idx
        url = img_urls[idx] if idx < len(img_urls) and img_urls[idx] else ""
        idx += 1
        return f"\n![配图]({url})\n" if url else ""
    final = re.sub(r'\[IMG:.*?\]', repl, final)

    title_m = re.search(r'^#\s+(.+)', final, re.MULTILINE)
    title = title_m.group(1) if title_m else f"{date_cn}每日热点"
    tags = ["每日热点"]

    body = re.sub(r'^#\s+.*\n', '', final, count=1).strip()
    paras = body.split('\n\n')
    if len(paras) > 2:
        body = paras[0] + '\n\n<!-- more -->\n\n' + '\n\n'.join(paras[1:])

    md_lines = [
        "---",
        f"title: \"{title}\"",
        f"date: {datetime.now().strftime('%Y-%m-%d %H:%M:00')}",
        "categories:",
        "  - daily-news",
        "tags:",
    ]
    for t in tags:
        md_lines.append(f"  - {t}")
    md_lines.append(f"cover: {img_urls[0] if img_urls else ''}")
    md_lines.append("---")
    md_lines.append("")
    md_lines.append(body)
    md_lines.append("")
    md = "\n".join(md_lines)

    print("[4/4] Saving...", flush=True)
    post_dir = os.path.join(BLOG_DIR, "source", "_posts", "daily-news")
    os.makedirs(post_dir, exist_ok=True)
    path = os.path.join(post_dir, f"{today}-daily-hotspot.md")
    with open(path, "w", encoding="utf-8") as f:
        f.write(md)

    print(f"\nDone! {path}", flush=True)
    print(f"Title: {title}", flush=True)
    print(f"Images: {len([u for u in img_urls if u])}", flush=True)


if __name__ == "__main__":
    main()
