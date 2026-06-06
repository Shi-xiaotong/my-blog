#!/usr/bin/env python3
"""一键更新影视屋播放源。域名挂了运行这个就行。

用法: python3 scripts/update-anime-source.py
"""
import json, re, sys, os

API_URL = "https://cj.ffzyapi.com/api.php/provide/vod?ac=detail&ids=28458"
PAGE = os.path.join(os.path.dirname(__file__), "..", "source", "anime", "index.md")

try:
    import urllib.request
    req = urllib.request.Request(API_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read())
except Exception as e:
    print(f"API请求失败: {e}")
    sys.exit(1)

play = data["list"][0].get("vod_play_url", "")
first_source = play.split("$$$")[0]
hashes = []
for ep in first_source.split("#"):
    idx = ep.find("$")
    if idx > 0:
        name, url = ep[:idx], ep[idx+1:]
        if "/share/" in url:
            base = url.split("/share/")[0]
            hashes.append(url.split("/share/")[1])
        elif ".m3u8" in url:
            hashes.append(url)
        if len(hashes) >= 720:
            break

print(f"获取到 {len(hashes)} 集")

# 提取播放域名
play_domain = ""
if hashes and not hashes[0].startswith("http"):
    play_domain = "https://" + play.split("//")[1].split("/share/")[0] + "/share/"
    print(f"播放域名: {play_domain}")

# 更新页面
with open(PAGE, "r") as f:
    content = f.read()

# 替换 hash 数组
new_hashes = json.dumps(hashes[:720], separators=(",", ":"))
content = re.sub(r"var H = \[.*?\];", f"var H = {new_hashes};", content, flags=re.DOTALL)

# 替换播放域名
if play_domain:
    content = re.sub(r'var S = "https?://[^"]+/";', f'var S = "{play_domain}";', content)
    content = re.sub(r'src="https?://[^"]+/share/[^"]*"', f'src="{play_domain}{hashes[0]}"', content, count=1)

with open(PAGE, "w") as f:
    f.write(content)

print(f"已更新 {PAGE}")
print(f"首集: {hashes[0][:20]}...")
print(f"末集: {hashes[-1][:20]}...")
