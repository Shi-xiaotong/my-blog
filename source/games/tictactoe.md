---
title: 井字棋
layout: game-page
date: 2024-01-01 00:00:00
description: 井字棋 - 小游戏
permalink: /games/tictactoe.html
type: game
---
{% raw %}
<style>

.game-container { max-width: 400px; margin: 0 auto; text-align: center; }
.board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; max-width: 300px; margin: 20px auto; }
.cell { width: 96px; height: 96px; background: var(--card-bg); border: 2px solid var(--border); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: 700; cursor: pointer; transition: all 0.2s; user-select: none; -webkit-user-select: none; }
.cell:hover:not(.taken) { border-color: var(--primary); background: var(--primary-light); }
.cell.taken { cursor: default; }
.cell.x { color: var(--primary); }
.cell.o { color: #ef4444; }
.cell.win { animation: winPulse 0.6s ease infinite alternate; }
@keyframes winPulse { to { transform: scale(1.05); filter: brightness(1.2); } }
.status { font-size: 18px; font-weight: 600; min-height: 28px; margin: 16px 0; }
.controls { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 16px; }
.mode-btns { display: flex; gap: 8px; justify-content: center; margin-bottom: 16px; }
.mode-btns button { padding: 8px 20px; border: 1px solid var(--border); border-radius: 8px; background: var(--card-bg); color: var(--text); font-size: 14px; cursor: pointer; transition: all 0.15s; }
.mode-btns button.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.score-board { display: flex; gap: 24px; justify-content: center; margin-bottom: 20px; }
.score-item { text-align: center; }
.score-item .num { font-size: 32px; font-weight: 700; font-family: 'SF Mono', monospace; }
.score-item .lbl { font-size: 12px; color: var(--text-secondary); }
.score-x { color: var(--primary); }
.score-o { color: #ef4444; }
.score-d { color: var(--text-secondary); }
@media (max-width: 400px) { .cell { width: 80px; height: 80px; font-size: 40px; } }

</style>



<div class="container">
  <div class="header">
    
    <h1>井字棋</h1>
  </div>
  <div class="game-container">
    <div class="mode-btns">
      <button class="active" onclick="setMode('ai')">人机对战</button>
      <button onclick="setMode('pvp')">双人对战</button>
    </div>
    <div class="score-board">
      <div class="score-item"><div class="num score-x" id="scoreX">0</div><div class="lbl">X (玩家)</div></div>
      <div class="score-item"><div class="num score-d" id="scoreD">0</div><div class="lbl">平局</div></div>
      <div class="score-item"><div class="num score-o" id="scoreO">0</div><div class="lbl">O (电脑)</div></div>
    </div>
    <div class="board" id="board"></div>
    <div class="status" id="status">你的回合 (X)</div>
    <div class="controls">
      <button class="btn btn-primary" onclick="newGame()">新游戏</button>
      <button class="btn btn-outline" onclick="resetScore()">重置分数</button>
    </div>
  </div>
</div>



<script src="/games/js/tictactoe.js"></script>
{% endraw %}
