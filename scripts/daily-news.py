#!/usr/bin/env python3
"""Daily news blog post generator"""
import json, os, ssl, urllib.request, base64, subprocess, re, time
from datetime import datetime

ctx = ssl.create_default_context()

AGNES_KEY = os.environ.get("AGNES_API_KEY", "")
BLOG_DIR = os.environ.get("BLOG_DIR", ".")


def llm_chat(prompt, max_tokens=3000):
    payload = json.dumps({
        "model": "agnes-2.0-flash",
        "messages": [
            {"role": "system", "content": "你是毒舌科技博主，输出纯Markdown。"},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": max_tokens,
        "temperature": 0.7
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
    subprocess.run([
        "npx", "wrangler", "r2", "object", "put", f"myblog/{remote_key}",
        f"--file={local_path}", "--content-type", "image/png", "--remote"
    ], capture_output=True, timeout=60, cwd=BLOG_DIR)
    return f"https://img.233002.xyz/{remote_key}"


def main():
    today = datetime.now().strftime("%Y-%m-%d")
    date_cn = datetime.now().strftime("%Y年%m月%d日")

    print(f"[1/4] Generating article for {today}...", flush=True)
    article = llm_chat(f"""今天是{date_cn}。写一篇每日热点博客文章，选3-4个近期热门新闻。
要求：科技/AI/互联网优先，每个事件##章节200-300字毒舌点评，开头一句话概括，结尾引导关注"水星引力m"。
每个章节标题后写 [IMG: 英文图片描述]，文章开头写 [COVER: 英文封面描述]。纯Markdown。""")
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
    tags = ["每日热点"] + [m.group(1)[:8] for m in re.finditer(r'^##\s+(.+)', final, re.MULTILINE)]

    body = re.sub(r'^#\s+.*\n', '', final, count=1).strip()
    paras = body.split('\n\n')
    if len(paras) > 2:
        body = paras[0] + '\n\n<!-- more -->\n\n' + '\n\n'.join(paras[1:])

    md = f"""---
title: "{title}"
date: {datetime.now().strftime("%Y-%m-%d %H:%M:00")}
categories:
  - daily-news
tags:
  - {'  - '.join(tags)}
cover: {img_urls[0] if img_urls else ''}
---

{body}
"""

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
