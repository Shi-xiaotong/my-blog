---
title: AI 海龟汤
layout: game-page
date: 2024-01-01 00:00:00
description: AI 海龟汤 - 小游戏
permalink: /games/ai-turtle-soup.html
type: game
---
{% raw %}
<style>

body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; min-height: 100vh; background: var(--bg); color: var(--text); }
:root { --bg: #0f0f0f; --text: #e0e0e0; --card: #1a1a2e; --accent: #e94560; --ai-bg: #16213e; --user-bg: #1a1a2e; --border: #2a2a4a; }
body.light { --bg: #f5f5f5; --text: #222; --card: #fff; --accent: #e94560; --ai-bg: #e8eaf6; --user-bg: #e3f2fd; --border: #ddd; }
.container { max-width: 700px; margin: 0 auto; padding: 16px; }
.header { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border); margin-bottom: 16px; }
.header a { color: var(--accent); text-decoration: none; font-size: 14px; }
.theme-btn { background: var(--card); border: 1px solid var(--border); color: var(--text); padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; }
h1 { text-align: center; font-size: 1.6em; margin: 20px 0; }
.chat-box { max-height: 50vh; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.msg { max-width: 80%; padding: 10px 14px; border-radius: 12px; font-size: 15px; line-height: 1.6; word-wrap: break-word; }
.msg.ai { align-self: flex-start; background: var(--ai-bg); border-bottom-left-radius: 4px; }
.msg.user { align-self: flex-end; background: var(--user-bg); border-bottom-right-radius: 4px; }
.msg.system { align-self: center; background: var(--card); color: #aaa; font-size: 13px; border: 1px solid var(--border); }
.stats { text-align: center; font-size: 13px; color: #888; margin: 8px 0; }
.input-area { display: flex; gap: 8px; margin-top: 12px; }
.input-area input { flex: 1; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border); background: var(--card); color: var(--text); font-size: 15px; outline: none; }
.input-area input:focus { border-color: var(--accent); }
.btn { padding: 10px 18px; border-radius: 8px; border: none; background: var(--accent); color: #fff; font-size: 15px; cursor: pointer; white-space: nowrap; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn.secondary { background: var(--card); border: 1px solid var(--border); color: var(--text); }
.actions { display: flex; gap: 8px; justify-content: center; margin-top: 12px; flex-wrap: wrap; }
.start-screen { text-align: center; padding: 60px 20px; }
.start-screen p { color: #888; margin: 16px 0; }
.hidden { display: none; }
@keyframes blink { 50% { opacity: 0.3; } }
.loading::after { content: '...'; animation: blink 1s infinite; }

</style>


<div class="container">
  <div class="header">
    
    <button class="theme-btn" onclick="toggleTheme()">🌓 主题</button>
  </div>

  <h1>🍲 AI海龟汤</h1>

  <div id="startScreen" class="start-screen">
    <p>海龟汤是一种情境猜谜游戏。<br>AI会给你一个谜面，你需要通过问是非题来推理出真相。</p>
    <button class="btn" onclick="startGame()">开始游戏</button>
  </div>

  <div id="gameArea" class="hidden">
    <div class="stats" id="stats">提问次数：0</div>
    <div class="chat-box" id="chatBox"></div>
    <div class="input-area">
      <input type="text" id="questionInput" placeholder="输入你的是非题..." 
             onkeydown="if(event.key==='Enter')askQuestion()" maxlength="200">
      <button class="btn" onclick="askQuestion()" id="askBtn">提问</button>
    </div>
    <div class="actions">
      <button class="btn secondary" onclick="revealAnswer()">揭晓答案</button>
      <button class="btn secondary hidden" id="newGameBtn" onclick="startGame()">再来一局</button>
    </div>
  </div>
</div>

<script src="ai.js"></script>


<script src="/games/js/ai-turtle-soup.js"></script>
{% endraw %}
