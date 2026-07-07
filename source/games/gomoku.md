---
title: 五子棋
layout: game-page
date: 2024-01-01 00:00:00
description: 五子棋 - 小游戏
permalink: /games/gomoku.html
type: game
---
{% raw %}
<style>

.game-wrap { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; align-items: flex-start; }
.board-container { position: relative; }
canvas#board { display: block; border-radius: 6px; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
.side-panel { min-width: 160px; display: flex; flex-direction: column; gap: 12px; }
.panel-box { background: var(--card-bg); border: 1px solid var(--border); border-radius: 8px; padding: 12px; }
.panel-box h3 { font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; }
.status-text { font-size: 16px; font-weight: 600; text-align: center; margin: 8px 0; }
.btn-sm { padding: 4px 12px; font-size: 12px; }
.diff-btn { opacity: 0.5; }
.diff-btn.active { opacity: 1; background: var(--primary); color: #fff; border-color: var(--primary); }
.win-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; }
.win-box { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 32px; text-align: center; }
.win-box h2 { margin-bottom: 8px; }
.win-box p { color: var(--text-secondary); margin-bottom: 16px; }
@media (max-width: 640px) {
  .container { padding: 12px; }
  .game-wrap { flex-direction: column; align-items: center; gap: 12px; }
  .board-container { width: 100%; max-width: 400px; }
  canvas#board { width: 100% !important; height: auto !important; }
  .side-panel { display: grid; grid-template-columns: 1fr 1fr; width: 100%; max-width: 400px; gap: 8px; }
  .panel-box { padding: 8px; }
  .panel-box h3 { font-size: 11px; margin-bottom: 4px; }
  .panel-box .btn { width: 100%; padding: 6px 8px; font-size: 12px; }
  .panel-box .btn-sm { padding: 4px 6px; font-size: 11px; }
  .status-text { font-size: 14px; }
  .header h1 { font-size: 1.3em; }
  .header { margin-bottom: 12px; }
}

</style>



<div class="container">
  <div class="header">
    
    <h1>五子棋</h1>
  </div>
  <div class="game-wrap">
    <div class="board-container">
      <canvas id="board" width="480" height="480"></canvas>
    </div>
    <div class="side-panel">
      <div class="panel-box">
        <h3>状态</h3>
        <div class="status-text" id="status">你的回合 (黑棋)</div>
      </div>
      <div class="panel-box">
        <h3>模式</h3>
        <div style="display:flex;gap:4px;flex-direction:column">
          <button class="btn btn-primary" onclick="newGame('ai')">人机对战</button>
          <button class="btn btn-outline" onclick="newGame('pvp')">双人对战</button>
        </div>
      </div>
      <div class="panel-box" id="diffBox">
        <h3>难度</h3>
        <div style="display:flex;gap:4px">
          <button class="btn btn-sm diff-btn active" data-diff="easy" onclick="setDiff('easy')">简单</button>
          <button class="btn btn-sm diff-btn" data-diff="medium" onclick="setDiff('medium')">中等</button>
          <button class="btn btn-sm diff-btn" data-diff="hard" onclick="setDiff('hard')">困难</button>
        </div>
      </div>
      <div class="panel-box">
        <h3>操作</h3>
        <div style="display:flex;gap:4px;flex-direction:column">
          <button class="btn btn-outline" onclick="undoMove()">悔棋</button>
          <button class="btn btn-outline" onclick="newGame()">新游戏</button>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="win-overlay" id="overlay" style="display:none">
  <div class="win-box">
    <h2 id="winTitle"></h2>
    <p id="winMsg"></p>
    <button class="btn btn-primary" onclick="closeOverlay();newGame()">再来一局</button>
  </div>
</div>



<script src="/games/js/gomoku.js"></script>
{% endraw %}
