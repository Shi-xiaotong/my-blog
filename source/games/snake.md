---
title: 贪吃蛇
layout: game-page
date: 2024-01-01 00:00:00
description: 贪吃蛇 - 小游戏
permalink: /games/snake.html
type: game
---
{% raw %}
<style>

.game-container { max-width: 420px; margin: 0 auto; }
.game-area { display: flex; justify-content: center; margin: 16px 0; }
.game-area canvas { border-radius: 8px; border: 2px solid var(--border); background: #0f172a; }
.controls { display: flex; gap: 8px; margin-top: 12px; justify-content: center; flex-wrap: wrap; }
.dpad { display: none; grid-template-columns: repeat(3, 50px); grid-template-rows: repeat(3, 50px); gap: 4px; justify-content: center; margin-top: 12px; }
.dpad button { width: 50px; height: 50px; border: 1px solid var(--border); border-radius: 8px; background: var(--card-bg); color: var(--text); font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.dpad button:active { background: var(--primary); color: #fff; }
.dpad .empty { visibility: hidden; }
.tip { text-align: center; font-size: 13px; color: var(--text-secondary); margin-top: 8px; }
@media (hover: none) and (pointer: coarse) { .dpad { display: grid; } }

</style>



<div class="container">
  <div class="header">
    
    <h1>贪吃蛇</h1>
  </div>
  <div class="score-bar">
    <div class="score-item"><div class="score-label">分数</div><div class="score-value" id="score">0</div></div>
    <div class="score-item"><div class="score-label">最高</div><div class="score-value" id="best">0</div></div>
    <div class="score-item"><div class="score-label">长度</div><div class="score-value" id="length">3</div></div>
  </div>
  <div class="game-container">
    <div class="game-area"><canvas id="canvas" width="400" height="400"></canvas></div>
    <div class="dpad">
      <div class="empty"></div>
      <button onclick="setDir(0,-1)">&#9650;</button>
      <div class="empty"></div>
      <button onclick="setDir(-1,0)">&#9664;</button>
      <div class="empty"></div>
      <button onclick="setDir(1,0)">&#9654;</button>
      <div class="empty"></div>
      <button onclick="setDir(0,1)">&#9660;</button>
      <div class="empty"></div>
    </div>
    <div class="controls">
      <button class="btn btn-primary" onclick="newGame()">新游戏</button>
      <button class="btn btn-outline" id="pauseBtn" onclick="togglePause()">暂停</button>
    </div>
    <p class="tip">方向键 / WASD / 滑动控制方向</p>
  </div>
</div>



<script src="/games/js/snake.js"></script>
{% endraw %}
