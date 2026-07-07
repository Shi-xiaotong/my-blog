)()

var SIZE = 15;
var canvas = document.getElementById('board');
var ctx = canvas.getContext('2d');
var PADDING = 20;
var CELL = (canvas.width - PADDING * 2) / (SIZE - 1);
var STONE_R = CELL * 0.42;

var board, currentPlayer, gameOver, mode, history, winCells, moveCount, hoverPos, difficulty;
var EMPTY = 0, BLACK = 1, WHITE = 2;

// Star points (天元 + 星位)
var STAR_POINTS = [[3,3],[3,11],[7,7],[11,3],[11,11],[3,7],[7,3],[7,11],[11,7]];

function setDiff(d) {
  difficulty = d;
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.toggle('active', b.dataset.diff === d));
}

function init() { difficulty = 'easy'; newGame('ai'); }

function newGame(m) {
  mode = m || mode;
  board = Array.from({length: SIZE}, () => Array(SIZE).fill(EMPTY));
  currentPlayer = BLACK;
  gameOver = false;
  history = [];
  winCells = [];
  moveCount = 0;
  hoverPos = null;
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('diffBox').style.display = mode === 'ai' ? '' : 'none';
  setStatus(mode === 'ai' ? '你的回合 (黑棋)' : '黑棋落子');
  draw();
}

function setStatus(msg) { document.getElementById('status').textContent = msg; }

function toCanvas(r, c) { return [PADDING + c * CELL, PADDING + r * CELL]; }
function fromCanvas(x, y) {
  var c = Math.round((x - PADDING) / CELL);
  var r = Math.round((y - PADDING) / CELL);
  if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return null;
  return [r, c];
}

function draw() {
  var dpr = window.devicePixelRatio || 1;
  var w = canvas.width;
  var h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Board background
  ctx.fillStyle = '#d4a574';
  ctx.fillRect(0, 0, w, h);

  // Grid lines
  ctx.strokeStyle = '#8b6914';
  ctx.lineWidth = 1;
  for (var i = 0; i < SIZE; i++) {
    var [x1, y1] = toCanvas(i, 0);
    var [x2, y2] = toCanvas(i, SIZE - 1);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    var [x3, y3] = toCanvas(0, i);
    var [x4, y4] = toCanvas(SIZE - 1, i);
    ctx.beginPath(); ctx.moveTo(x3, y3); ctx.lineTo(x4, y4); ctx.stroke();
  }

  // Star points
  ctx.fillStyle = '#8b6914';
  for (var [r, c] of STAR_POINTS) {
    var [x, y] = toCanvas(r, c);
    ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
  }

  // Hover indicator
  if (hoverPos && !gameOver) {
    var [r, c] = hoverPos;
    if (board[r][c] === EMPTY) {
      var [x, y] = toCanvas(r, c);
      ctx.fillStyle = currentPlayer === BLACK ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)';
      ctx.beginPath(); ctx.arc(x, y, STONE_R, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Stones
  for (var r = 0; r < SIZE; r++) for (var c = 0; c < SIZE; c++) {
    if (board[r][c] === EMPTY) continue;
    var [x, y] = toCanvas(r, c);
    var isBlack = board[r][c] === BLACK;
    var isLast = history.length && history[history.length-1][0] === r && history[history.length-1][1] === c;
    var isWin = winCells.some(([wr, wc]) => wr === r && wc === c);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.arc(x + 2, y + 2, STONE_R, 0, Math.PI * 2); ctx.fill();

    // Stone body
    var grad = ctx.createRadialGradient(x - STONE_R * 0.3, y - STONE_R * 0.3, STONE_R * 0.1, x, y, STONE_R);
    if (isBlack) {
      grad.addColorStop(0, '#666');
      grad.addColorStop(1, '#111');
    } else {
      grad.addColorStop(0, '#fff');
      grad.addColorStop(1, '#ccc');
    }
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(x, y, STONE_R, 0, Math.PI * 2); ctx.fill();

    // Last move marker
    if (isLast) {
      ctx.fillStyle = 'rgba(239,68,68,0.7)';
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    }

    // Win highlight
    if (isWin) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(x, y, STONE_R + 2, 0, Math.PI * 2); ctx.stroke();
    }
  }
}

// Mouse events
canvas.addEventListener('mousemove', (e) => {
  var rect = canvas.getBoundingClientRect();
  var scaleX = canvas.width / rect.width;
  var scaleY = canvas.height / rect.height;
  var pos = fromCanvas((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  hoverPos = pos;
  draw();
});

canvas.addEventListener('mouseleave', () => { hoverPos = null; draw(); });

canvas.addEventListener('click', (e) => {
  var rect = canvas.getBoundingClientRect();
  var scaleX = canvas.width / rect.width;
  var scaleY = canvas.height / rect.height;
  var pos = fromCanvas((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  if (pos) placeStone(pos[0], pos[1]);
});

// Touch events
canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  var rect = canvas.getBoundingClientRect();
  var touch = e.changedTouches[0];
  var scaleX = canvas.width / rect.width;
  var scaleY = canvas.height / rect.height;
  var pos = fromCanvas((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
  if (pos) placeStone(pos[0], pos[1]);
});

function placeStone(r, c, isAi) {
  if (gameOver || board[r][c] !== EMPTY) return;
  if (!isAi && mode === 'ai' && currentPlayer === WHITE) return;

  board[r][c] = currentPlayer;
  history.push([r, c, currentPlayer]);
  moveCount++;

  var win = checkWin(r, c, currentPlayer);
  if (win) {
    winCells = win;
    gameOver = true;
    draw();
    var isBlack = currentPlayer === BLACK;
    var title = mode === 'ai' ? (isBlack ? '你赢了!' : 'AI 赢了!') : (isBlack ? '黑棋获胜!' : '白棋获胜!');
    showOverlay(title, moveCount + ' 手');
    return;
  }

  if (moveCount >= SIZE * SIZE) {
    gameOver = true;
    draw();
    showOverlay('平局', '棋盘已满');
    return;
  }

  currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
  draw();

  if (mode === 'ai' && currentPlayer === WHITE) {
    setStatus('AI 思考中...');
    setTimeout(aiMove, 30);
  } else {
    setStatus(currentPlayer === BLACK ? '黑棋落子' : '白棋落子');
  }
}

function checkWin(r, c, player) {
  var dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (var [dr,dc] of dirs) {
    var cells = [[r,c]];
    for (var i = 1; i < 5; i++) { var nr = r+dr*i, nc = c+dc*i; if (nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr][nc]===player) cells.push([nr,nc]); else break; }
    for (var i = 1; i < 5; i++) { var nr = r-dr*i, nc = c-dc*i; if (nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr][nc]===player) cells.push([nr,nc]); else break; }
    if (cells.length >= 5) return cells;
  }
  return null;
}

function undoMove() {
  if (!history.length || gameOver) return;
  if (mode === 'ai') {
    if (history.length >= 2) {
      var [r2,c2] = history.pop(); board[r2][c2] = EMPTY;
      var [r1,c1] = history.pop(); board[r1][c1] = EMPTY;
      moveCount -= 2;
    } else {
      var [r,c] = history.pop(); board[r][c] = EMPTY;
      moveCount--;
    }
  } else {
    var [r,c] = history.pop(); board[r][c] = EMPTY;
    moveCount--;
    currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
  }
  setStatus(mode === 'ai' ? '你的回合 (黑棋)' : (currentPlayer === BLACK ? '黑棋落子' : '白棋落子'));
  draw();
}

function showOverlay(title, msg) {
  document.getElementById('winTitle').textContent = title;
  document.getElementById('winMsg').textContent = msg;
  document.getElementById('overlay').style.display = 'flex';
  if (mode === 'ai' && typeof getGameComment === 'function') {
    var won = title.includes('你赢');
    getGameComment('五子棋', moveCount + '手', won).then(c => {
      if (c) document.getElementById('winMsg').textContent = msg + ' | ' + c;
    });
  }
}
function closeOverlay() { document.getElementById('overlay').style.display = 'none'; }

// ===== AI =====
var DIRS = [[0,1],[1,0],[1,1],[1,-1]];

function scorePoint(r, c, player) {
  var total = 0;
  for (var [dr, dc] of DIRS) {
    var count = 1, openEnds = 0;
    for (var i = 1; i < 5; i++) {
      var nr = r + dr*i, nc = c + dc*i;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) break;
      if (board[nr][nc] === player) count++;
      else { if (board[nr][nc] === EMPTY) openEnds++; break; }
    }
    for (var i = 1; i < 5; i++) {
      var nr = r - dr*i, nc = c - dc*i;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) break;
      if (board[nr][nc] === player) count++;
      else { if (board[nr][nc] === EMPTY) openEnds++; break; }
    }
    if (count >= 5) total += 10000000;
    else if (count === 4) total += openEnds >= 1 ? 1000000 : 100000;
    else if (count === 3) total += openEnds === 2 ? 10000 : openEnds === 1 ? 1000 : 100;
    else if (count === 2) total += openEnds === 2 ? 100 : openEnds === 1 ? 10 : 1;
  }
  return total;
}

function getNeighbors() {
  var neighbors = new Set();
  for (var r = 0; r < SIZE; r++) for (var c = 0; c < SIZE; c++) {
    if (board[r][c] !== EMPTY) {
      for (var dr = -2; dr <= 2; dr++) for (var dc = -2; dc <= 2; dc++) {
        if (dr === 0 && dc === 0) continue;
        var nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === EMPTY) {
          neighbors.add(nr * SIZE + nc);
        }
      }
    }
  }
  return [...neighbors].map(idx => [Math.floor(idx / SIZE), idx % SIZE]);
}

function evalBoard(player) {
  var score = 0;
  for (var r = 0; r < SIZE; r++) for (var c = 0; c < SIZE; c++) {
    if (board[r][c] === player) score += scorePoint(r, c, player);
  }
  return score;
}

function checkWinFast(r, c, player) {
  for (var [dr, dc] of DIRS) {
    var count = 1;
    for (var i = 1; i < 5; i++) { var nr = r+dr*i, nc = c+dc*i; if (nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr][nc]===player) count++; else break; }
    for (var i = 1; i < 5; i++) { var nr = r-dr*i, nc = c-dc*i; if (nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr][nc]===player) count++; else break; }
    if (count >= 5) return true;
  }
  return false;
}

// --- Easy: random near existing stones ---
function getEasyMove() {
  var neighbors = getNeighbors();
  if (!neighbors.length) return [7, 7];
  // 80% random, 20% best heuristic
  if (Math.random() < 0.8) {
    return neighbors[Math.floor(Math.random() * neighbors.length)];
  }
  return getMediumMove();
}

// --- Medium: heuristic scoring ---
function getMediumMove() {
  if (moveCount === 0) return [7, 7];
  var neighbors = getNeighbors();
  if (!neighbors.length) return [7, 7];

  var scored = neighbors.map(([r, c]) => {
    board[r][c] = WHITE;
    var a = scorePoint(r, c, WHITE);
    board[r][c] = BLACK;
    var b = scorePoint(r, c, BLACK);
    board[r][c] = EMPTY;
    return { r, c, score: a * 1.1 + b };
  }).sort((a, b) => b.score - a.score);

  // Check instant win
  for (var {r, c} of scored) {
    board[r][c] = WHITE;
    if (checkWinFast(r, c, WHITE)) { board[r][c] = EMPTY; return [r, c]; }
    board[r][c] = EMPTY;
  }
  // Check must block
  for (var {r, c} of scored) {
    board[r][c] = BLACK;
    if (checkWinFast(r, c, BLACK)) { board[r][c] = EMPTY; return [r, c]; }
    board[r][c] = EMPTY;
  }
  return [scored[0].r, scored[0].c];
}

// --- Hard: heuristic + minimax depth 2 ---
function minimax(depth, alpha, beta, isMax) {
  if (depth === 0) return evalBoard(WHITE) - evalBoard(BLACK);

  var neighbors = getNeighbors();
  if (!neighbors.length) return 0;

  // Score and sort candidates for better pruning
  var scored = neighbors.map(([r, c]) => {
    board[r][c] = isMax ? WHITE : BLACK;
    var s = scorePoint(r, c, isMax ? WHITE : BLACK);
    board[r][c] = EMPTY;
    return [r, c, s];
  }).sort((a, b) => b[2] - a[2]).slice(0, 12);

  if (isMax) {
    var best = -Infinity;
    for (var [r, c] of scored) {
      board[r][c] = WHITE;
      if (checkWinFast(r, c, WHITE)) { board[r][c] = EMPTY; return 10000000; }
      var val = minimax(depth - 1, alpha, beta, false);
      board[r][c] = EMPTY;
      best = Math.max(best, val);
      alpha = Math.max(alpha, val);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    var best = Infinity;
    for (var [r, c] of scored) {
      board[r][c] = BLACK;
      if (checkWinFast(r, c, BLACK)) { board[r][c] = EMPTY; return -10000000; }
      var val = minimax(depth - 1, alpha, beta, true);
      board[r][c] = EMPTY;
      best = Math.min(best, val);
      beta = Math.min(beta, val);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function getHardMove() {
  if (moveCount === 0) return [7, 7];
  var neighbors = getNeighbors();
  if (!neighbors.length) return [7, 7];

  // Score candidates
  var scored = neighbors.map(([r, c]) => {
    board[r][c] = WHITE;
    var a = scorePoint(r, c, WHITE);
    board[r][c] = BLACK;
    var b = scorePoint(r, c, BLACK);
    board[r][c] = EMPTY;
    return { r, c, score: a * 1.1 + b };
  }).sort((a, b) => b.score - a.score).slice(0, 15);

  // Check instant win
  for (var {r, c} of scored) {
    board[r][c] = WHITE;
    if (checkWinFast(r, c, WHITE)) { board[r][c] = EMPTY; return [r, c]; }
    board[r][c] = EMPTY;
  }
  // Check must block
  for (var {r, c} of scored) {
    board[r][c] = BLACK;
    if (checkWinFast(r, c, BLACK)) { board[r][c] = EMPTY; return [r, c]; }
    board[r][c] = EMPTY;
  }

  // Minimax on top candidates
  var bestScore = -Infinity, bestMove = [scored[0].r, scored[0].c];
  for (var {r, c} of scored.slice(0, 10)) {
    board[r][c] = WHITE;
    var score = minimax(2, -Infinity, Infinity, false);
    board[r][c] = EMPTY;
    if (score > bestScore) { bestScore = score; bestMove = [r, c]; }
  }
  return bestMove;
}

function getBestMove() {
  if (difficulty === 'easy') return getEasyMove();
  if (difficulty === 'hard') return getHardMove();
  return getMediumMove();
}

function aiMove() {
  if (gameOver) return;
  var [r, c] = getBestMove();
  placeStone(r, c, true);
}

init();