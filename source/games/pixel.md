---
title: 像素画板
layout: game-page
date: 2024-01-01 00:00:00
description: 像素画板 - 小游戏
permalink: /games/pixel.html
type: game
---
{% raw %}
<style>

.game-wrap { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
.canvas-wrap { position: relative; }
.canvas-wrap canvas { border: 1px solid var(--border); cursor: crosshair; image-rendering: pixelated; }
.toolbar { display: flex; flex-direction: column; gap: 12px; min-width: 180px; }
.tool-section { background: var(--card-bg); border: 1px solid var(--border); border-radius: 8px; padding: 12px; }
.tool-section h3 { font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
.color-palette { display: grid; grid-template-columns: repeat(6, 1fr); gap: 3px; }
.color-swatch { width: 24px; height: 24px; border-radius: 4px; cursor: pointer; border: 2px solid transparent; transition: all 0.1s; }
.color-swatch:hover { transform: scale(1.15); }
.color-swatch.active { border-color: var(--text); box-shadow: 0 0 0 2px var(--bg); }
.color-preview { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.color-preview .current { width: 32px; height: 32px; border-radius: 6px; border: 1px solid var(--border); }
.color-preview input[type="color"] { width: 32px; height: 32px; border: none; border-radius: 6px; cursor: pointer; padding: 0; }
.tool-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.tool-btns button { padding: 6px; border: 1px solid var(--border); border-radius: 6px; background: var(--card-bg); color: var(--text); font-size: 12px; cursor: pointer; transition: all 0.1s; }
.tool-btns button:hover { border-color: var(--primary); }
.tool-btns button.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.tool-btns.full { grid-template-columns: 1fr; }
.size-btns { display: flex; gap: 4px; flex-wrap: wrap; }
.size-btns button { padding: 4px 10px; border: 1px solid var(--border); border-radius: 4px; background: var(--card-bg); color: var(--text); font-size: 12px; cursor: pointer; }
.size-btns button.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.grid-info { font-size: 12px; color: var(--text-secondary); text-align: center; margin-top: 4px; }
@media (max-width: 640px) { .game-wrap { flex-direction: column; align-items: center; } .toolbar { flex-direction: row; flex-wrap: wrap; min-width: auto; } .tool-section { flex: 1; min-width: 140px; } }

</style>



<div class="container">
  <div class="header">
    
    <h1>像素画板</h1>
  </div>
  <div class="game-wrap">
    <div class="canvas-wrap">
      <canvas id="canvas"></canvas>
      <div class="grid-info" id="gridInfo">32 x 32</div>
    </div>
    <div class="toolbar">
      <div class="tool-section">
        <h3>画笔</h3>
        <div class="tool-btns">
          <button class="active" id="btn-pen" onclick="setTool('pen')">画笔</button>
          <button id="btn-eraser" onclick="setTool('eraser')">橡皮擦</button>
          <button id="btn-fill" onclick="setTool('fill')">油漆桶</button>
          <button id="btn-picker" onclick="setTool('picker')">取色器</button>
        </div>
      </div>
      <div class="tool-section">
        <h3>颜色</h3>
        <div class="color-preview">
          <div class="current" id="currentColor" style="background:#000000"></div>
          <input type="color" id="colorPicker" value="#000000" oninput="setColor(this.value)">
        </div>
        <div class="color-palette" id="palette"></div>
      </div>
      <div class="tool-section">
        <h3>画布大小</h3>
        <div class="size-btns">
          <button onclick="resizeCanvas(16)">16x16</button>
          <button class="active" onclick="resizeCanvas(32)">32x32</button>
          <button onclick="resizeCanvas(48)">48x48</button>
          <button onclick="resizeCanvas(64)">64x64</button>
        </div>
      </div>
      <div class="tool-section">
        <h3>操作</h3>
        <div class="tool-btns full">
          <button onclick="undoAction()">撤销</button>
          <button onclick="clearCanvas()">清空</button>
          <button onclick="downloadPng()">导出 PNG</button>
          <button onclick="toggleGrid()">网格线</button>
        </div>
      </div>
    </div>
  </div>
</div>



<script src="/games/js/pixel.js"></script>
{% endraw %}
