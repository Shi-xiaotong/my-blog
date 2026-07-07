---
title: 弹球台
layout: game-page
date: 2024-01-01 00:00:00
description: 弹球台 - 小游戏
permalink: /games/pinball.html
type: game
---
{% raw %}
<style>

.game-container { max-width: 400px; margin: 0 auto; }
.game-area { display: flex; justify-content: center; margin: 16px 0; }
.game-area canvas { border-radius: 12px; border: 2px solid var(--border); touch-action: none; }
.controls { display: flex; gap: 8px; justify-content: center; margin-top: 12px; }
.flipper-btns { display: none; gap: 8px; justify-content: center; margin-top: 12px; }
.flipper-btns button { flex: 1; max-width: 150px; height: 60px; border: 1px solid var(--border); border-radius: 12px; background: var(--card-bg); color: var(--text); font-size: 16px; font-weight: 600; cursor: pointer; }
.flipper-btns button:active { background: var(--primary); color: #fff; }
.tip { text-align: center; font-size: 13px; color: var(--text-secondary); margin-top: 8px; }
@media (hover: none) and (pointer: coarse) { .flipper-btns { display: flex; } }

</style>



<div class="container">
  <div class="header">
    
    <h1>弹球台</h1>
  </div>
  <div class="score-bar">
    <div class="score-item"><div class="score-label">分数</div><div class="score-value" id="score">0</div></div>
    <div class="score-item"><div class="score-label">最高</div><div class="score-value" id="best">0</div></div>
    <div class="score-item"><div class="score-label">球数</div><div class="score-value" id="balls">3</div></div>
  </div>
  <div class="game-container">
    <div class="game-area"><canvas id="canvas" width="360" height="540"></canvas></div>
    <div class="flipper-btns">
      <button onmousedown="leftDown=true" onmouseup="leftDown=false" ontouchstart="leftDown=true" ontouchend="leftDown=false">左挡板</button>
      <button onmousedown="rightDown=true" onmouseup="rightDown=false" ontouchstart="rightDown=true" ontouchend="rightDown=false">右挡板</button>
    </div>
    <div class="controls">
      <button class="btn btn-primary" onclick="launchBall()">发射</button>
      <button class="btn btn-outline" onclick="newGame()">新游戏</button>
    </div>
    <p class="tip">A/左箭头 = 左挡板 | D/右箭头 = 右挡板 | 空格 = 发射</p>
  </div>
</div>



<script src="/games/js/pinball.js"></script>
{% endraw %}
