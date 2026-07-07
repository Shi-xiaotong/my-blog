---
title: AI 谜语
layout: game-page
date: 2024-01-01 00:00:00
description: AI 谜语 - 小游戏
permalink: /games/ai-riddle.html
type: game
---
{% raw %}
<style>

.game-container { max-width: 600px; margin: 0 auto; }
.riddle-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin: 16px 0; text-align: center; min-height: 150px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.riddle-card .riddle-text { font-size: 18px; line-height: 1.8; font-weight: 500; }
.riddle-card .riddle-num { font-size: 12px; color: var(--text-secondary); margin-bottom: 12px; }
.guess-area { display: flex; gap: 8px; margin-bottom: 16px; }
.guess-area input { flex: 1; padding: 12px 16px; border: 2px solid var(--border); border-radius: 10px; font-size: 15px; background: var(--card-bg); color: var(--text); outline: none; }
.guess-area input:focus { border-color: var(--primary); }
.result-msg { text-align: center; font-size: 16px; font-weight: 600; min-height: 28px; margin: 12px 0; }
.result-msg.correct { color: var(--accent); }
.result-msg.wrong { color: var(--danger); }
.answer-reveal { background: var(--primary-light); border: 1px solid var(--primary); border-radius: 8px; padding: 12px; margin: 12px 0; text-align: center; display: none; }
.answer-reveal .answer { font-size: 20px; font-weight: 700; color: var(--primary); }
.answer-reveal .explain { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
.difficulty-select { display: flex; gap: 8px; justify-content: center; margin-bottom: 16px; }
.diff-btn { padding: 6px 16px; border: 1px solid var(--border); border-radius: 8px; background: var(--card-bg); color: var(--text); font-size: 13px; cursor: pointer; }
.diff-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.win-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; }
.win-box { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 32px; text-align: center; max-width: 360px; }
.win-box h2 { margin-bottom: 8px; }
.win-box p { color: var(--text-secondary); margin-bottom: 16px; }

</style>



<div class="container">
  <div class="header">
    
    <h1>AI 谜语</h1>
  </div>
  <div class="game-container">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div>得分: <strong id="score">0</strong> | 连对: <strong id="streak">0</strong></div>
      <div>第 <strong id="round">0</strong> 题</div>
    </div>

    <div class="difficulty-select">
      <button class="diff-btn active" onclick="setDiff('easy')">简单</button>
      <button class="diff-btn" onclick="setDiff('medium')">中等</button>
      <button class="diff-btn" onclick="setDiff('hard')">困难</button>
    </div>

    <div class="riddle-card">
      <div class="riddle-num" id="riddleNum">点击「出题」开始</div>
      <div class="riddle-text" id="riddleText">AI 准备了各种谜语等你来猜</div>
    </div>

    <div class="result-msg" id="resultMsg"></div>
    <div class="answer-reveal" id="answerReveal">
      <div class="answer" id="answerText"></div>
      <div class="explain" id="answerExplain"></div>
    </div>

    <div class="guess-area">
      <input type="text" id="guessInput" placeholder="输入你的答案..." onkeydown="if(event.key==='Enter')checkAnswer()">
      <button class="btn btn-primary" onclick="checkAnswer()">猜</button>
    </div>

    <div style="display:flex;gap:8px;justify-content:center">
      <button class="btn btn-primary" onclick="newRiddle()">出题</button>
      <button class="btn btn-outline" onclick="showHint()">提示</button>
      <button class="btn btn-outline" onclick="revealAnswer()">看答案</button>
    </div>
  </div>
</div>

<div class="win-overlay" id="overlay" style="display:none">
  <div class="win-box">
    <h2 id="winTitle"></h2>
    <p id="winMsg"></p>
    <button class="btn btn-primary" onclick="closeOverlay();newRiddle()">下一题</button>
  </div>
</div>



<script src="/games/js/ai-riddle.js"></script>
{% endraw %}
