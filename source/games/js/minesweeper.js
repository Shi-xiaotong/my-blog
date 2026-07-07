var DIFFS = {
  beginner: { cols:9, rows:9, mines:10 },
  intermediate: { cols:16, rows:16, mines:40 },
  expert: { cols:30, rows:16, mines:99 }
};

var diff = 'beginner';
var board, revealed, flagged, mineMap;
var cols, rows, mineCount;
var gameOver, win, flagCount, revealedCount;
var seconds, timerInterval, started;

var MINE_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/><line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" stroke-width="2"/><line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" stroke-width="2"/><line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" stroke-width="2"/><line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2"/></svg>';
var FLAG_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>';

function setDiff(d) {
  diff = d;
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.toggle('active', b.dataset.diff === d));
  newGame();
}

function newGame() {
  var cfg = DIFFS[diff];
  cols = cfg.cols; rows = cfg.rows; mineCount = cfg.mines;
  board = Array.from({length: rows}, () => Array(cols).fill(0));
  revealed = Array.from({length: rows}, () => Array(cols).fill(false));
  flagged = Array.from({length: rows}, () => Array(cols).fill(false));
  mineMap = Array.from({length: rows}, () => Array(cols).fill(false));
  gameOver = false; win = false; flagCount = 0; revealedCount = 0;
  seconds = 0; started = false;
  clearInterval(timerInterval); timerInterval = null;
  document.getElementById('timer').textContent = '0';
  document.getElementById('mineCount').textContent = mineCount;
  document.getElementById('faceBtn').textContent = ':-)';
  document.getElementById('gameMsg').innerHTML = '';
  render();
}

function placeMines(safeR, safeC) {
  var placed = 0;
  while (placed < mineCount) {
    var r = Math.floor(Math.random() * rows);
    var c = Math.floor(Math.random() * cols);
    if (mineMap[r][c] || (Math.abs(r-safeR)<=1 && Math.abs(c-safeC)<=1)) continue;
    mineMap[r][c] = true; placed++;
  }
  for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
    if (mineMap[r][c]) { board[r][c] = -1; continue; }
    var count = 0;
    for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) {
      var nr = r+dr, nc = c+dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && mineMap[nr][nc]) count++;
    }
    board[r][c] = count;
  }
}

function reveal(r, c) {
  if (r < 0 || r >= rows || c < 0 || c >= cols || revealed[r][c] || flagged[r][c] || gameOver) return;
  revealed[r][c] = true; revealedCount++;

  if (mineMap[r][c]) {
    gameOver = true; win = false;
    for (var i = 0; i < rows; i++) for (var j = 0; j < cols; j++) if (mineMap[i][j]) revealed[i][j] = true;
    render(); endGame();
    return;
  }

  if (board[r][c] === 0) {
    for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) reveal(r+dr, c+dc);
  }

  if (revealedCount === rows * cols - mineCount) {
    gameOver = true; win = true;
    for (var i = 0; i < rows; i++) for (var j = 0; j < cols; j++) if (mineMap[i][j]) flagged[i][j] = true;
    render(); endGame();
  }
}

function toggleFlag(r, c) {
  if (revealed[r][c] || gameOver) return;
  flagged[r][c] = !flagged[r][c];
  flagCount += flagged[r][c] ? 1 : -1;
  document.getElementById('mineCount').textContent = mineCount - flagCount;
  render();
}

function endGame() {
  clearInterval(timerInterval);
  document.getElementById('faceBtn').textContent = win ? 'B-)' : 'X-(';
  var msg = document.getElementById('gameMsg');
  msg.innerHTML = win
    ? `<div class="game-over-msg win">恭喜通关! 用时 ${seconds} 秒</div>`
    : `<div class="game-over-msg lose">踩雷了! 游戏结束</div>`;

  var bestKey = 'best_minesweeper_' + diff;
  var best = localStorage.getItem(bestKey);
  if (win && (!best || seconds < parseInt(best))) { localStorage.setItem(bestKey, seconds); }
}

function render() {
  var boardEl = document.getElementById('board');
  boardEl.style.gridTemplateColumns = `repeat(${cols}, 32px)`;
  var html = '';
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      if (revealed[r][c]) {
        if (mineMap[r][c]) {
          html += `<div class="cell mine">${MINE_SVG}</div>`;
        } else {
          var v = board[r][c];
          html += `<div class="cell revealed">${v ? '<span class="n'+v+'">'+v+'</span>' : ''}</div>`;
        }
      } else if (flagged[r][c]) {
        html += `<div class="cell hidden flagged" onclick="reveal(${r},${c})" oncontextmenu="event.preventDefault();toggleFlag(${r},${c})" ontouchstart="startLongPress(event,${r},${c})" ontouchend="cancelLongPress()">${FLAG_SVG}</div>`;
      } else {
        html += `<div class="cell hidden" onclick="handleClick(${r},${c})" oncontextmenu="event.preventDefault();toggleFlag(${r},${c})" ontouchstart="startLongPress(event,${r},${c})" ontouchend="cancelLongPress()"></div>`;
      }
    }
  }
  boardEl.innerHTML = html;

  // Adjust cell size on mobile
  if (window.innerWidth < 640 && cols > 16) {
    var size = Math.floor((window.innerWidth - 60) / cols);
    boardEl.style.gridTemplateColumns = `repeat(${cols}, ${size}px)`;
    boardEl.querySelectorAll('.cell').forEach(c => { c.style.width = size+'px'; c.style.height = size+'px'; c.style.fontSize = (size > 20 ? 12 : 10)+'px'; });
  }
}

var longPressTimer = null;
function startLongPress(e, r, c) {
  longPressTimer = setTimeout(() => { e.preventDefault(); toggleFlag(r, c); }, 400);
}
function cancelLongPress() { clearTimeout(longPressTimer); }

function handleClick(r, c) {
  if (!started) { started = true; placeMines(r, c); timerInterval = setInterval(() => { seconds++; document.getElementById('timer').textContent = seconds; }, 1000); }
  reveal(r, c);
  render();
}

newGame();