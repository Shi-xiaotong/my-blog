#!/usr/bin/env python3
"""Daily news blog post generator - runs on GitHub Actions"""
import json, os, ssl, urllib.request, base64, subprocess, re, time
from datetime import datetime

ctx = ssl.create_default_context()

# API keys from environment
NVIDIA_KEY = os.environ.get("NVIDIA_API_KEY", "")
AGNES_KEY = os.environ.get("AGNES_API_KEY", "")
CF_ACCOUNT = os.environ.get("CF_ACCOUNT_ID", "")
CF_TOKEN = os.environ.get("CF_R2_TOKEN", "")
BLOG_DIR = os.environ.get("BLOG_DIR", ".")

def nvidia_chat(prompt, max_tokens=2000):
    """Call NVIDIA LLM API"""
    payload = json.dumps({
        "model": "nvidia/llama-3.1-nemotron-70b-instruct",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": 0.7
    }).encode()
    req = urllib.request.Request(
        "https://integrate.api.nvidia.com/v1/chat/completions",
        data=payload,
        headers={"Authorization": f"Bearer {NVIDIA_KEY}", "Content-Type": "application/json"}
    )
    resp = urllib.request.urlopen(req, timeout=120, context=ctx)
    return json.loads(resp.read())["choices"][0]["message"]["content"]


def agnes_image(prompt, output_path):
    """Generate image via Agnes AI API"""
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
    # Download image
    img_url = data["data"][0]["url"] if "data" in data else data.get("url", "")
    if img_url:
        urllib.request.urlretrieve(img_url, output_path)
    else:
        # Try base64
        img_b64 = data["data"][0]["b64_json"] if "data" in data else ""
        with open(output_path, "wb") as f:
            f.write(base64.b64decode(img_b64))
    return output_path


def upload_r2(local_path, remote_key):
    """Upload file to Cloudflare R2"""
    subprocess.run([
        "npx", "wrangler", "r2", "object", "put", f"myblog/{remote_key}",
        f"--file={local_path}", "--content-type", "image/png", "--remote"
    ], capture_output=True, timeout=60, cwd=BLOG_DIR)
    return f"https://img.233002.xyz/{remote_key}"


def main():
    today = datetime.now().strftime("%Y-%m-%d")
    date_cn = datetime.now().strftime("%Y年%m月%d日")
    img_prefix = f"blog/daily-news-{today}"
    
    print(f"[1/5] Fetching hot topics for {today}...")
    
    # Step 1: Use NVIDIA LLM to research and write article
    research_prompt = f"""今天是{date_cn}。请搜索并整理今天中国互联网上最热门的3-4个新闻事件。

要求：
1. 选择有话题性、争议性、或趣味性的事件
2. 优先选择科技、互联网、AI、数码相关的新闻
3. 如果不够，可以加入社会热点
4. 每个事件需要：标题、简述、为什么值得关注

请用JSON格式返回，格式如下：
{{"topics": [{{"title": "事件标题", "summary": "100字简述", "angle": "为什么值得关注，50字"}}]}}"""

    topics_raw = nvidia_chat(research_prompt)
    # Extract JSON from response
    json_match = re.search(r'\{.*\}', topics_raw, re.DOTALL)
    topics = json.loads(json_match.group()) if json_match else {"topics": []}
    
    print(f"  Found {len(topics.get('topics', []))} topics")
    
    # Step 2: Write full article
    print("[2/5] Writing article...")
    
    topics_text = json.dumps(topics, ensure_ascii=False, indent=2)
    write_prompt = f"""你是一个毒舌但有深度的科技博主。根据以下热点新闻，写一篇博客文章。

热点数据：
{topics_text}

要求：
1. 标题要吸引人，包含关键词
2. 每个新闻事件写一个独立章节（## 标题）
3. 每个章节200-300字，有观点、有吐槽、有分析
4. 语气：轻松幽默但不低俗，像朋友聊天
5. 开头用一句话概括今天有多离谱
6. 结尾用一句话总结+引导关注
7. 在每个章节标题后标注 [IMG: 图片描述] 用于生成配图
8. 在文章开头标注 [COVER: 封面图片描述]

直接返回文章内容（Markdown格式），不要其他说明。"""

    article = nvidia_chat(write_prompt, max_tokens=3000)
    print(f"  Article: {len(article)} chars")
    
    # Step 3: Extract image prompts and generate images
    print("[3/5] Generating images...")
    
    img_prompts = re.findall(r'\[IMG:\s*(.*?)\]', article)
    cover_match = re.search(r'\[COVER:\s*(.*?)\]', article)
    cover_prompt = cover_match.group(1) if cover_match else "A dramatic news collage with bold colors, editorial illustration style"
    
    all_prompts = [cover_prompt] + img_prompts
    # Ensure 5-7 images
    while len(all_prompts) < 5:
        all_prompts.append("A minimalist daily news illustration, newspaper concept, warm colors")
    all_prompts = all_prompts[:7]  # Max 7
    
    img_urls = []
    for i, prompt in enumerate(all_prompts):
        local_path = f"/tmp/daily-news-{today}-{i+1}.png"
        try:
            agnes_image(prompt, local_path)
            url = upload_r2(local_path, f"daily-news-{today}-{i+1}.png")
            img_urls.append(url)
            print(f"  Image {i+1}: OK")
            time.sleep(2)
        except Exception as e:
            print(f"  Image {i+1}: FAIL {e}")
            img_urls.append(f"https://img.233002.xyz/blog/daily-news-placeholder.png")
    
    # Step 4: Clean article and insert image URLs
    print("[4/5] Building final article...")
    
    # Remove [IMG:...] and [COVER:...] tags, insert actual image markdown
    final_article = article
    final_article = re.sub(r'\[COVER:.*?\]', '', final_article)
    
    img_idx = 1  # 0 is cover
    def replace_img(match):
        nonlocal img_idx
        if img_idx < len(img_urls):
            url = img_urls[img_idx]
            img_idx += 1
            return f"\n![配图]({url})\n"
        return ""
    
    final_article = re.sub(r'\[IMG:.*?\]', replace_img, final_article)
    
    # Extract title from first # line
    title_match = re.search(r'^#\s+(.+)', final_article, re.MULTILINE)
    title = title_match.group(1) if title_match else f"{date_cn}每日热点"
    
    # Build frontmatter
    tags = ["每日热点"]
    for t in topics.get("topics", []):
        tag = t.get("title", "")[:10]
        if tag:
            tags.append(tag)
    
    frontmatter = f"""---
title: "{title}"
date: {datetime.now().strftime("%Y-%m-%d %H:%M:00")}
categories:
  - daily-news
tags:
  - {chr(10)+'  - '.join(tags)}
cover: {img_urls[0] if img_urls else ''}
---"""
    
    # Remove the # title from article body (frontmatter has it)
    body = re.sub(r'^#\s+.*\n', '', final_article, count=1).strip()
    
    # Insert <!-- more --> after first paragraph
    paragraphs = body.split('\n\n')
    if len(paragraphs) > 2:
        body = paragraphs[0] + '\n\n<!-- more -->\n\n' + '\n\n'.join(paragraphs[1:])
    
    full_md = f"{frontmatter}\n\n{body}\n"
    
    # Step 5: Write file
    print("[5/5] Saving article...")
    
    post_dir = os.path.join(BLOG_DIR, "source", "_posts", "daily-news")
    os.makedirs(post_dir, exist_ok=True)
    post_path = os.path.join(post_dir, f"{today}-daily-hotspot.md")
    
    with open(post_path, "w", encoding="utf-8") as f:
        f.write(full_md)
    
    print(f"\nDone! Article: {post_path}")
    print(f"Images: {len(img_urls)}")
    print(f"Title: {title}")
    
    return post_path


if __name__ == "__main__":
    main()
