---
title: 俄罗斯方块
layout: game-page
date: 2024-01-01 00:00:00
description: 俄罗斯方块 - 小游戏
permalink: /games/tetris.html
type: game
---
{% raw %}
<style>

.game-wrap { display: flex; gap: 20px; justify-content: center; align-items: flex-start; flex-wrap: wrap; }
.main-board { position: relative; }
.main-board canvas { border-radius: 4px; border: 2px solid var(--border); }
.side-panel { display: flex; flex-direction: column; gap: 12px; min-width: 120px; }
.panel-box { background: var(--card-bg); border: 1px solid var(--border); border-radius: 8px; padding: 12px; text-align: center; }
.panel-box .label { font-size: 11px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
.panel-box .value { font-size: 20px; font-weight: 700; font-family: 'SF Mono', monospace; color: var(--primary); }
.panel-box canvas { margin: 0 auto; display: block; }
.controls { display: flex; gap: 8px; justify-content: center; margin-top: 16px; flex-wrap: wrap; }
.dpad { display: none; grid-template-columns: repeat(5, 48px); grid-template-rows: repeat(2, 48px); gap: 4px; justify-content: center; margin-top: 12px; }
.dpad button { width: 48px; height: 48px; border: 1px solid var(--border); border-radius: 8px; background: var(--card-bg); color: var(--text); font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.dpad button:active { background: var(--primary); color: #fff; }
.dpad .empty { visibility: hidden; }
.tip { text-align: center; font-size: 13px; color: var(--text-secondary); margin-top: 8px; }
.game-over-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 4px; z-index: 10; }
.game-over-overlay h2 { font-size: 2em; margin-bottom: 8px; }
.game-over-overlay p { color: var(--text-secondary); margin-bottom: 16px; }
@media (hover: none) and (pointer: coarse) { .dpad { display: grid; } }
@media (max-width: 640px) {
  .side-panel { flex-direction: row; min-width: auto; }
  .panel-box { flex: 1; }
  .main-board canvas { width: 100%; height: auto; }
}

</style>



<div class="container">
  <div class="header">
    
    <h1>俄罗斯方块</h1>
  </div>
  <div class="score-bar">
    <div class="score-item"><div class="score-label">分数</div><div class="score-value" id="score">0</div></div>
    <div class="score-item"><div class="score-label">等级</div><div class="score-value" id="level">1</div></div>
    <div class="score-item"><div class="score-label">消行</div><div class="score-value" id="lines">0</div></div>
    <div class="score-item"><div class="score-label">最高</div><div class="score-value" id="best">0</div></div>
  </div>
  <div class="game-wrap">
    <div class="main-board">
      <canvas id="board" width="300" height="600"></canvas>
      <div class="game-over-overlay" id="gameOver" style="display:none">
        <h2>Game Over</h2>
        <p id="finalScore"></p>
        <button class="btn btn-primary" onclick="newGame()">再来一局</button>
      </div>
    </div>
    <div class="side-panel">
      <div class="panel-box"><div class="label">下一个</div><canvas id="next" width="120" height="120"></canvas></div>
    </div>
  </div>
  <div class="controls">
    <button class="btn btn-primary" onclick="newGame()">新游戏</button>
    <button class="btn btn-outline" id="pauseBtn" onclick="togglePause()">暂停</button>
  </div>
  <div class="dpad">
    <div class="empty"></div>
    <button onclick="rotatePiece()">&#8635;</button>
    <button onclick="hardDrop()">&#8681;</button>
    <button onclick="togglePause()">| |</button>
    <div class="empty"></div>
    <div class="empty"></div>
    <button onclick="movePiece(-1,0)">&#9664;</button>
    <button onclick="movePiece(0,1)">&#9660;</button>
    <button onclick="movePiece(1,0)">&#9654;</button>
    <div class="empty"></div>
  </div>
  <p class="tip">方向键/WASD 移动 | 上/W 旋转 | 空格 硬降</p>
</div>



<script src="/games/js/tetris.js"></script>
{% endraw %}
