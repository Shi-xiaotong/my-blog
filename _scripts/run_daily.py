#!/usr/bin/env python3
"""
Daily Content Generator — main orchestrator.

Workflow:
  1. Scrape all data sources (news, tech, anime, trending, comments)
  2. AI editor decides what to write today
  3. Generate articles based on decisions
  4. Save to source/_posts/

Environment:
  AGNES_API_KEY  — required
  BLOG_DIR       — blog root dir (default: cwd)
"""

import logging
import os
import sys
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# ── Force script dir into path ──
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if _SCRIPT_DIR not in sys.path:
    sys.path.insert(0, _SCRIPT_DIR)


def main():
    from datetime import datetime, timedelta

    today = datetime.now().strftime("%Y-%m-%d")
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    logger.info("=" * 60)
    logger.info("每日内容生成 [%s]", today)
    logger.info("=" * 60)

    # ── Step 1: Scrape all data sources ──
    logger.info("[Step 1] 开始采集数据...")

    from scrapers.news_sources import fetch_all_news, fetch_all_news_flat
    from scrapers.tech_sources import fetch_techcrunch_with_content
    from scrapers.anime_sources import fetch_current_season
    from scrapers.trending_sources import fetch_github_trending
    from scrapers.hot_comments import fetch_hot_comments, format_comments_for_prompt

    # 1a. Chinese hot search
    news_data = fetch_all_news(limit_per_source=5)
    news_flat = fetch_all_news_flat(limit_per_source=5)
    total_news = sum(len(v) for v in news_data.values())
    logger.info("  热搜数据: %d 条, 来自 %d 个板块", total_news, len(news_data))

    # 1b. Tech news
    tech_articles = fetch_techcrunch_with_content(today, limit=5)
    if not tech_articles:
        # Try yesterday if today has no articles yet (early morning)
        tech_articles = fetch_techcrunch_with_content(yesterday, limit=5)
    logger.info("  科技新闻: %d 条", len(tech_articles))

    # 1c. Anime data
    anime_data = fetch_current_season(limit=15)
    logger.info("  动漫数据: %d 部当季新番", len(anime_data))

    # 1d. GitHub trending
    trending_data = fetch_github_trending(limit=10)
    logger.info("  GitHub趋势: %d 个项目", len(trending_data))

    # 1e. Hot comments
    comments = fetch_hot_comments(news_flat[:5], max_topics=5, comments_per_topic=2)
    comments_text = format_comments_for_prompt(comments)
    logger.info("  热评数据: %d 个话题", len(comments))

    # ── Step 2: AI editor decides ──
    logger.info("[Step 2] AI 编辑决策...")
    from generators.editor import editor_decide
    decisions = editor_decide(news_data, tech_articles, anime_data, trending_data)
    logger.info("  决策结果: %d 篇", len(decisions))

    if not decisions:
        logger.warning("没有文章需要生成")
        return

    # ── Step 3: Generate articles ──
    logger.info("[Step 3] 开始生成文章...")
    from scrapers import save_post
    from generators.digest_writer import generate_digest
    from generators.anime_writer import generate_anime
    from generators.tech_writer import generate_tech

    generated = []

    for decision in decisions:
        dtype = decision["type"]
        reason = decision.get("reason", "")
        est_len = decision.get("estimated_length", "medium")
        logger.info("  生成 [%s]: %s", dtype, reason)

        if dtype == "digest":
            md = generate_digest(news_data, comments_text, today)
            if md:
                save_post("daily-news", f"{today}-digest.md", md)
                generated.append(f"daily-news/{today}-digest.md")

        elif dtype == "anime":
            md = generate_anime(anime_data, comments_text, today)
            if md:
                save_post("anime", f"{today}-anime-digest.md", md)
                generated.append(f"anime/{today}-anime-digest.md")

        elif dtype == "tech":
            md = generate_tech(tech_articles, today)
            if md:
                save_post("tech", f"{today}-ai-frontier.md", md)
                generated.append(f"tech/{today}-ai-frontier.md")

    # ── Done ──
    logger.info("=" * 60)
    if generated:
        logger.info("完成！生成 %d 篇:", len(generated))
        for g in generated:
            logger.info("  ✅ source/_posts/%s", g)
    else:
        logger.warning("没有文章被生成")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()