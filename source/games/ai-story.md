---
title: AI 故事接龙
layout: game-page
date: 2024-01-01 00:00:00
description: AI 故事接龙 - 小游戏
permalink: /games/ai-story.html
type: game
---
{% raw %}
<style>

.game-container { max-width: 600px; margin: 0 auto; }
.story-area { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 16px; max-height: 400px; overflow-y: auto; margin-bottom: 12px; }
.story-segment { margin-bottom: 12px; padding: 10px 14px; border-radius: 8px; font-size: 14px; line-height: 1.8; }
.story-segment.ai { background: var(--bg); border: 1px solid var(--border); }
.story-segment.user { background: var(--primary-light); border: 1px solid var(--primary); }
.story-segment .author { font-size: 12px; font-weight: 600; margin-bottom: 4px; }
.story-segment.ai .author { color: var(--primary); }
.story-segment.user .author { color: var(--accent); }
.story-segment .score-badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; margin-left: 8px; }
.story-segment .score-badge.high { background: #14532d; color: #22c55e; }
.story-segment .score-badge.mid { background: #78350f; color: #fbbf24; }
.story-segment .score-badge.low { background: #7f1d1d; color: #fca5a5; }
.input-area { margin-bottom: 12px; }
.input-area textarea { min-height: 80px; resize: vertical; font-size: 14px; line-height: 1.6; }
.status-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 14px; }
.genre-select { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; margin-bottom: 16px; }
.genre-btn { padding: 6px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--card-bg); color: var(--text); font-size: 12px; cursor: pointer; }
.genre-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.win-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; }
.win-box { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 32px; text-align: center; max-width: 400px; width: 90%; }
.win-box h2 { margin-bottom: 8px; }
.win-box p { color: var(--text-secondary); margin-bottom: 16px; }

</style>



<div class="container">
  <div class="header">
    
    <h1>AI 故事接龙</h1>
  </div>
  <div class="game-container">
    <div class="status-bar">
      <div>得分: <strong id="score">0</strong> | 回合: <strong id="round">0</strong></div>
      <div>AI 评分标准: 创意、连贯、文采</div>
    </div>

    <div class="genre-select">
      <button class="genre-btn active" onclick="setGenre('fantasy')">奇幻</button>
      <button class="genre-btn" onclick="setGenre('scifi')">科幻</button>
      <button class="genre-btn" onclick="setGenre('mystery')">悬疑</button>
      <button class="genre-btn" onclick="setGenre('romance')">言情</button>
      <button class="genre-btn" onclick="setGenre('horror')">恐怖</button>
      <button class="genre-btn" onclick="setGenre('wuxia')">武侠</button>
    </div>

    <div class="story-area" id="storyArea"></div>

    <div class="input-area">
      <textarea id="storyInput" placeholder="接下去写... 发挥你的想象力！" onkeydown="if(event.ctrlKey&&event.key==='Enter')submitSegment()"></textarea>
    </div>

    <div style="display:flex;gap:8px;justify-content:center">
      <button class="btn btn-primary" onclick="newStory()">新故事</button>
      <button class="btn btn-primary" onclick="submitSegment()">我来写 (Ctrl+Enter)</button>
      <button class="btn btn-outline" onclick="aiContinue()">AI 继续</button>
      <button class="btn btn-outline" onclick="endStory()">结束故事</button>
    </div>
    <p class="tip">和 AI 一起写故事，AI 会给你的续写打分！</p>
  </div>
</div>

<div class="win-overlay" id="overlay" style="display:none">
  <div class="win-box">
    <h2 id="winTitle"></h2>
    <p id="winMsg"></p>
    <div id="fullStory" style="max-height:200px;overflow-y:auto;text-align:left;font-size:13px;line-height:1.8;margin:12px 0;padding:12px;background:var(--bg);border-radius:8px"></div>
    <button class="btn btn-primary" onclick="closeOverlay();newStory()">新故事</button>
  </div>
</div>



<script src="/games/js/ai-story.js"></script>
{% endraw %}
