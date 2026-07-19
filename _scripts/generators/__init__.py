#!/usr/bin/env python3
"""Generators package — AI-powered content generation via Agnes API."""

import json
import logging
import os
import re
import ssl
import time
import urllib.request

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# SSL verification enabled by default — no custom context needed for urllib

# ── Config ──

AGNES_API = "https://apihub.agnes-ai.com/v1/chat/completions"
AGNES_KEY = os.environ.get("AGNES_API_KEY", "")

# Fallback: read from .env
if not AGNES_KEY:
    env_path = os.path.join(os.environ.get("BLOG_DIR", "."), ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("AGNES_API_KEY="):
                    AGNES_KEY = line.strip().split("=", 1)[1]
                    break

# ── Forbidden words (AI 套话黑名单) ──

FORBIDDEN_WORDS = [
    "聚焦于", "旨在", "折射出", "上述动态", "与此同时",
    "值得关注的是", "引发了广泛讨论", "综上所述", "值得一提的是",
    "不可忽视的是", "标志着", "进一步加剧了", "后续进展值得持续跟踪",
]

# ── System Persona ──

SYSTEM_PROMPT = """你是「水星引力m」博客的博主 Mercury。你经营着一个个人博客，什么话题都聊——社会热点、科技、动漫、好用工具。

你的核心原则：
- 每篇文章是你自己的记录，不是新闻搬运
- 根据内容调整语气：社会话题冷静客观，科技话题可以兴奋，动漫推荐要有热情，离谱的新闻直接吐槽
- 每篇文章至少有一句主观表达（"我觉得" / "说实话" / "个人看法" / "好家伙" / "这波操作"）
- 开头直接说事，不要铺垫
- 结尾随意收，像跟朋友聊天

以下是你的「禁用词表」，生成的文本中绝对不要出现这些词：
聚焦于 | 旨在 | 折射出 | 随着……的快速迭代 | 上述动态 | 与此同时
值得关注的是 | 引发了广泛讨论 | 在……的背景下 | 综上所述 | 值得一提的是
不可忽视的是 | 从……到…… | 标志着 | 进一步加剧了 | 后续进展值得持续跟踪"""


# ── Helpers ──

def _clean_reasoning_output(text: str) -> str:
    """Strip thinking process from reasoning model output, keep actual response."""
    # Remove markdown-style thinking blocks
    text = re.sub(r'```(?:thinking|thought|reasoning).*?```', '', text, flags=re.DOTALL)
    # Remove numbered thinking steps
    text = re.sub(r'^\d+\.\s+\*\*.*?$', '', text, flags=re.MULTILINE)
    # Remove lines starting with "Here's a thinking process" or similar
    text = re.sub(r'^Here.s a thinking process.*?(?:\n|$)', '', text, flags=re.IGNORECASE)
    text = re.sub(r'^Let me think.*?(?:\n|$)', '', text, flags=re.IGNORECASE)
    # Remove "Analyze User Input" style sections (only match thinking-specific patterns, not legitimate bold text)
    text = re.sub(r'^\s*\*\*(?:Analyze|Thought|Reasoning|Plan|Step|Check|Review|Summary|Key Point|Output|Response|Input|Context)\*\*.*?(?:\n|$)', '', text, flags=re.IGNORECASE | re.MULTILINE)
    # Remove bullet-point thinking lines
    text = re.sub(r'^\s*[-*]\s+(?:User|Input|Response|Constraint|Language|Goal|Tone).*?(?:\n|$)', '', text, flags=re.MULTILINE)
    # Clean up excessive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def extract_article_from_leaky_output(text: str) -> tuple[str, str]:
    """Extract the actual article content from model output that leaked prompt/thinking.

    Returns (original_text, cleaned_text).
    """
    # Helper: strip self-review/checklist from end of article
    def _strip_review(article):
        markers = [
            r'\n[-*]\s+(Starts directly|Role:|Core principles|Banned words|Format:|Content:|Each topic|Bold keywords|Lists|Quotes|Separators|Markdown|Pick \d|Rank by|Each paragraph|At least one|I will adjust|Let.s refine|Self-Correction|I need to ensure)',
            r'\n\*?\(?(Check|Let.s refine|Self-Correction|I will carefully)',
        ]
        for p in markers:
            m = re.search(p, article)
            if m:
                article = article[:m.start()].strip()
        return article

    # Strategy 1: Find first # heading (allow leading whitespace)
    m = re.search(r'^\s*#\s+.+', text, re.MULTILINE)
    if m:
        article = text[m.start():].strip()
        article = _strip_review(article)
        return text, article

    # Strategy 2: Backtick-wrapped ## headings
    bt = re.findall(r'`##\s+(.+?)`', text)
    if bt:
        lines = text.split('\n')
        article_lines = []
        in_article = False
        for line in lines:
            stripped = line.strip()
            if stripped.startswith('`##') or stripped.startswith('`---'):
                in_article = True
            if in_article:
                cleaned = stripped.strip('`').strip()
                if cleaned:
                    article_lines.append(cleaned)
            if in_article and re.match(r'\*?\(?(Check|Let.s refine|Self-Correction)', stripped):
                break
        if article_lines:
            return text, '\n'.join(article_lines)

    # Strategy 3: ## headings (allow leading whitespace)
    m2 = re.search(r'^\s*##\s+.+', text, re.MULTILINE)
    if m2:
        article = text[m2.start():].strip()
        article = _strip_review(article)
        return text, article

    # Strategy 4: No headings found — strip prompt/thinking prefix lines
    lines = text.split('\n')
    start = 0
    for i, line in enumerate(lines):
        s = line.strip()
        if not s or re.match(r'^[-*\d]+\s*(Role/Persona|Input Data|Forbidden|Recent Articles|Format Requirements|Content Rules|I will|Let.s|Need to|Check|Output|Self-Correction)', s):
            start = i + 1
            continue
        if s.startswith('*('):
            start = i + 1
            continue
        break
    if start > 0 and start < len(lines):
        article = '\n'.join(lines[start:]).strip()
        article = _strip_review(article)
        if len(article) > 100:
            return text, article

    return text, ""


# ── Agnes API Call ──

def call_agnes(prompt, system=SYSTEM_PROMPT, max_tokens=3000, temperature=0.7, model="agnes-2.5-flash", max_retries=3):
    """Call Agnes AI API with retry. Returns text content or None."""
    if not AGNES_KEY:
        logger.error("AGNES_API_KEY 未设置")
        return None

    payload = json.dumps({
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": max_tokens,
        "temperature": temperature,
    }).encode()

    for attempt in range(1, max_retries + 1):
        try:
            req = urllib.request.Request(
                AGNES_API, data=payload,
                headers={"Authorization": f"Bearer {AGNES_KEY}", "Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=300) as resp:
                raw = json.loads(resp.read().decode())
                content = raw["choices"][0]["message"].get("content", "")
                if content and content.strip():
                    # Check if content contains chain-of-thought / prompt leakage
                    # (e.g. starts with "Role/Persona", "Key Instruction", system prompt text)
                    _, cleaned = extract_article_from_leaky_output(content)
                    if cleaned:
                        content = cleaned
                    for word in FORBIDDEN_WORDS:
                        if word in content:
                            logger.warning("输出包含禁用词「%s」，重试...", word)
                            time.sleep(2)
                            return call_agnes(prompt, system, max_tokens, temperature + 0.1, model, max_retries - 1)
                    return content.strip()
                # Fallback: reasoning_content
                rc = raw["choices"][0]["message"].get("reasoning_content", "")
                if rc:
                    clean = _clean_reasoning_output(rc)
                    _, extracted = extract_article_from_leaky_output(clean)
                    if extracted:
                        clean = extracted
                    if clean:
                        logger.info("Using reasoning_content (cleaned) as fallback")
                        return clean
        except Exception as e:
            logger.warning("Agnes API 调用失败 (尝试 %d/%d): %s: %s", attempt, max_retries, type(e).__name__, str(e)[:80])
        if attempt < max_retries:
            logger.info("重试 %d/%d...", attempt + 1, max_retries)
            time.sleep(2 ** attempt * 2)

    logger.error("Agnes API 全部重试失败")
    return None


# ── Post Builder ──

def build_post(title, content, category, date_str, tags, description=""):
    """Build a complete Hexo markdown post with frontmatter."""
    from datetime import datetime

    # Safety net: strip any remaining self-review/checklist content
    review_m = re.search(r'\n[-*]\s+(Starts directly|Role:|Core principles|Banned words|Format:|Content:|Each topic|Bold keywords|Lists|Quotes|Separators|Markdown|Pick \d|Rank by|Each paragraph|At least one|I will adjust|Let.s refine|Self-Correction)', content)
    if review_m:
        content = content[:review_m.start()].strip()
    
    # Also strip backtick-wrapped review sections
    content = re.sub(r'\n`[^`]*`\n', '\n', content)
    
    # Clean title
    title = title.replace('"', "'").strip()

    # Extract <!-- more --> from content
    if "<!-- more -->" not in content:
        paras = content.split("\n\n")
        if len(paras) > 2:
            content = paras[0] + "\n\n<!-- more -->\n\n" + "\n\n".join(paras[1:])

    # Description from first paragraph (skip markdown headings, <!-- more -->, backticks)
    if not description:
        lines = content.split("\n\n")
        first = ""
        for line in lines:
            clean = line.replace("\n", " ").strip()
            if clean and not clean.startswith("#") and not clean.startswith("`") and clean != "<!-- more -->":
                first = clean[:120]
                break
        if not first:
            # Fallback to title if no valid paragraph found
            first = title[:120].replace('"', "'")
        description = first.replace('"', "'")

    # Tags
    tags_yaml = "\n".join(f"  - {t}" for t in tags)

    return f"""---
title: "{title}"
date: {date_str} 12:00:00
categories:
  - {category}
tags:
{tags_yaml}
description: "{description}"
---

{content}
"""


def extract_title(content):
    """Extract the first # heading from markdown content."""
    m = re.search(r"^\s*#\s+(.+)", content, re.MULTILINE)
    return m.group(1).strip() if m else ""


def strip_title_from_body(content):
    """Remove the first # heading from content."""
    return re.sub(r"^\s*#\s+.*\n", "", content, count=1).strip()