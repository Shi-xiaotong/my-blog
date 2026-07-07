---
title: 打字速度
layout: game-page
date: 2024-01-01 00:00:00
description: 打字速度 - 小游戏
permalink: /games/typing.html
type: game
---
{% raw %}
<style>

.game-container { max-width: 700px; margin: 0 auto; }
.mode-select { display: flex; gap: 8px; margin-bottom: 16px; justify-content: center; flex-wrap: wrap; }
.mode-btn { padding: 6px 16px; border: 1px solid var(--border); border-radius: 8px; background: var(--card-bg); color: var(--text); cursor: pointer; font-size: 13px; transition: all 0.15s; }
.mode-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.text-display { background: var(--card-bg); border: 2px solid var(--border); border-radius: 10px; padding: 20px; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 18px; line-height: 1.8; margin-bottom: 16px; height: 280px; overflow-y: auto; position: relative; cursor: text; word-break: break-word; }
.text-display .char { transition: color 0.05s; display: inline; }
.text-display .char.space { display: inline; }
.text-display .char.space.current { background: var(--primary); border-radius: 2px; }
.text-display .char.correct { color: var(--accent); }
.text-display .char.wrong { color: var(--danger); background: rgba(239,68,68,0.15); border-radius: 2px; }
.text-display .char.current { border-bottom: 2px solid var(--primary); }
.text-display .char.pending { color: var(--text-secondary); }
.hidden-input { position: fixed; top: -100px; left: -100px; opacity: 0; width: 1px; height: 1px; }
.stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.stat-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 8px; padding: 12px; text-align: center; }
.stat-card .num { font-size: 28px; font-weight: 700; font-family: 'SF Mono', monospace; color: var(--primary); }
.stat-card .lbl { font-size: 12px; color: var(--text-secondary); margin-top: 4px; }
.result-panel { background: var(--card-bg); border: 2px solid var(--primary); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 16px; display: none; }
.result-panel h2 { font-size: 1.5em; margin-bottom: 12px; }
.result-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 16px 0; }
.result-item .num { font-size: 32px; font-weight: 700; font-family: 'SF Mono', monospace; color: var(--primary); }
.result-item .lbl { font-size: 13px; color: var(--text-secondary); }
.tip { text-align: center; font-size: 13px; color: var(--text-secondary); margin-top: 8px; }
@media (max-width: 640px) { .stats-bar { grid-template-columns: repeat(2, 1fr); } .text-display { font-size: 15px; } }

</style>



<div class="container">
  <div class="header">
    
    <h1>打字速度</h1>
  </div>
  <div class="game-container">
    <div class="mode-select">
      <button class="mode-btn active" data-mode="english" onclick="setMode('english')">英文</button>
      <button class="mode-btn" data-mode="code" onclick="setMode('code')">代码</button>
      <button class="mode-btn" data-mode="mixed" onclick="setMode('mixed')">混合</button>
    </div>
    <div class="stats-bar">
      <div class="stat-card"><div class="num" id="wpm">0</div><div class="lbl">WPM</div></div>
      <div class="stat-card"><div class="num" id="accuracy">100%</div><div class="lbl">准确率</div></div>
      <div class="stat-card"><div class="num" id="chars">0</div><div class="lbl">字符数</div></div>
      <div class="stat-card"><div class="num" id="time">0s</div><div class="lbl">用时</div></div>
    </div>
    <div class="text-display" id="textDisplay" onclick="focusInput()">
      <span id="textContent"></span>
    </div>
    <input class="hidden-input" id="hiddenInput" oninput="onInput(event)" onkeydown="onKeyDown(event)" autofocus>
    <div class="result-panel" id="resultPanel">
      <h2>测试完成</h2>
      <div class="result-grid">
        <div class="result-item"><div class="num" id="resWpm">0</div><div class="lbl" id="resWpmLabel">WPM (每分钟字数)</div></div>
        <div class="result-item"><div class="num" id="resAccuracy">0%</div><div class="lbl">准确率</div></div>
        <div class="result-item"><div class="num" id="resChars">0</div><div class="lbl">总字符</div></div>
        <div class="result-item"><div class="num" id="resTime">0s</div><div class="lbl">用时</div></div>
      </div>
      <p id="resBest" style="color:var(--warning);margin-bottom:16px"></p>
      <button class="btn btn-primary" onclick="newTest()">再来一次</button>
    </div>
    <div style="text-align:center">
      <button class="btn btn-primary" onclick="newTest()">换一段</button>
      <button class="btn btn-outline" id="aiBtn" onclick="aiGenerate()">AI 生成</button>
    </div>
    <p class="tip">点击文本区域开始输入，完成后自动结算</p>
  </div>
</div>



<script src="/games/js/typing.js"></script>
{% endraw %}
