var COLS = 10, ROWS = 20, CELL = 30;
var COLORS = ['#00f0f0','#f0f000','#a000f0','#f0a000','#00f000','#f00000','#0000f0'];
var SHAPES = [
  [[0,0],[1,0],[2,0],[3,0]], // I
  [[0,0],[1,0],[0,1],[1,1]], // O
  [[1,0],[0,1],[1,1],[2,1]], // T
  [[0,0],[1,0],[1,1],[2,1]], // S
  [[1,0],[2,0],[0,1],[1,1]], // Z
  [[0,0],[0,1],[1,1],[2,1]], // L
  [[2,0],[0,1],[1,1],[2,1]], // J
];

var canvas = document.getElementById('board');
var ctx = canvas.getContext('2d');
var nextCanvas = document.getElementById('next');
var nextCtx = nextCanvas.getContext('2d');

var grid, current, currentX, currentY, currentType, nextType;
var score, level, lines, best, paused, gameOver, dropInterval, timer;

function init() {
  best = parseInt(localStorage.getItem('best_tetris')) || 0;
  document.getElementById('best').textContent = best;
  newGame();
}

function newGame() {
  grid = Array.from({length:ROWS}, () => Array(COLS).fill(0));
  score = 0; level = 1; lines = 0; paused = false; gameOver = false;
  dropInterval = 800;
  document.getElementById('gameOver').style.display = 'none';
  document.getElementById('pauseBtn').textContent = '暂停';
  nextType = Math.floor(Math.random() * 7);
  spawnPiece();
  clearInterval(timer);
  timer = setInterval(tick, dropInterval);
  render();
}

function spawnPiece() {
  currentType = nextType;
  nextType = Math.floor(Math.random() * 7);
  current = SHAPES[currentType].map(p => [...p]);
  currentX = 3; currentY = 0;
  if (collides(current, currentX, currentY)) { endGame(); }
  renderNext();
}

function collides(piece, px, py) {
  return piece.some(([x, y]) => {
    var nx = px + x, ny = py + y;
    return nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && grid[ny][nx]);
  });
}

function merge() {
  current.forEach(([x, y]) => {
    var nx = currentX + x, ny = currentY + y;
    if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) grid[ny][nx] = currentType + 1;
  });
}

function clearLines() {
  var cleared = 0;
  for (var r = ROWS - 1; r >= 0; r--) {
    if (grid[r].every(c => c)) { grid.splice(r, 1); grid.unshift(Array(COLS).fill(0)); cleared++; r++; }
  }
  if (cleared) {
    var pts = [0, 100, 300, 500, 800];
    score += (pts[cleared] || 0) * level;
    lines += cleared;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(50, 800 - (level - 1) * 70);
    clearInterval(timer);
    timer = setInterval(tick, dropInterval);
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
  }
}

function movePiece(dx, dy) {
  if (paused || gameOver) return;
  if (!collides(current, currentX + dx, currentY + dy)) { currentX += dx; currentY += dy; render(); return true; }
  return false;
}

function rotatePiece() {
  if (paused || gameOver) return;
  var rotated = current.map(([x, y]) => [-y, x]);
  // Wall kick
  var kicks = [0, -1, 1, -2, 2];
  for (var kick of kicks) {
    if (!collides(rotated, currentX + kick, currentY)) { current = rotated; currentX += kick; render(); return; }
  }
}

function hardDrop() {
  if (paused || gameOver) return;
  while (movePiece(0, 1)) {}
  lockPiece();
}

function lockPiece() {
  merge();
  clearLines();
  spawnPiece();
  render();
}

function tick() {
  if (paused || gameOver) return;
  if (!movePiece(0, 1)) lockPiece();
}

function togglePause() {
  paused = !paused;
  document.getElementById('pauseBtn').textContent = paused ? '继续' : '暂停';
}

function endGame() {
  gameOver = true;
  clearInterval(timer);
  if (score > best) { best = score; localStorage.setItem('best_tetris', best); }
  document.getElementById('best').textContent = best;
  document.getElementById('finalScore').textContent = '得分: ' + score;
  document.getElementById('gameOver').style.display = 'flex';
}

function render() {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (var x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x*CELL, 0); ctx.lineTo(x*CELL, ROWS*CELL); ctx.stroke(); }
  for (var y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y*CELL); ctx.lineTo(COLS*CELL, y*CELL); ctx.stroke(); }

  // Locked cells
  for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
    if (grid[r][c]) drawCell(ctx, c, r, COLORS[grid[r][c] - 1]);
  }

  // Ghost piece
  var ghostY = currentY;
  while (!collides(current, currentX, ghostY + 1)) ghostY++;
  if (ghostY !== currentY) {
    current.forEach(([x, y]) => {
      var px = (currentX + x) * CELL, py = (ghostY + y) * CELL;
      ctx.strokeStyle = COLORS[currentType] + '44';
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 1, py + 1, CELL - 2, CELL - 2);
    });
  }

  // Current piece
  current.forEach(([x, y]) => drawCell(ctx, currentX + x, currentY + y, COLORS[currentType]));
}

function drawCell(c, x, y, color) {
  var px = x * CELL, py = y * CELL;
  c.fillStyle = color;
  c.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
  c.fillStyle = 'rgba(255,255,255,0.2)';
  c.fillRect(px + 1, py + 1, CELL - 2, 3);
  c.fillRect(px + 1, py + 1, 3, CELL - 2);
  c.fillStyle = 'rgba(0,0,0,0.15)';
  c.fillRect(px + 1, py + CELL - 4, CELL - 2, 3);
  c.fillRect(px + CELL - 4, py + 1, 3, CELL - 2);
}

function renderNext() {
  nextCtx.fillStyle = '#0f172a';
  nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
  var shape = SHAPES[nextType];
  var minX = Math.min(...shape.map(p => p[0]));
  var maxX = Math.max(...shape.map(p => p[0]));
  var minY = Math.min(...shape.map(p => p[1]));
  var maxY = Math.max(...shape.map(p => p[1]));
  var w = maxX - minX + 1, h = maxY - minY + 1;
  var ox = (4 - w) / 2 - minX, oy = (4 - h) / 2 - minY;
  shape.forEach(([x, y]) => drawCell(nextCtx, x + ox, y + oy, COLORS[nextType]));
}

document.addEventListener('keydown', e => {
  if (gameOver) return;
  var map = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowDown:[0,1],a:[-1,0],d:[1,0],s:[0,1]};
  if (map[e.key]) { e.preventDefault(); movePiece(...map[e.key]); }
  if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); rotatePiece(); }
  if (e.key === ' ') { e.preventDefault(); hardDrop(); }
  if (e.key === 'p') { e.preventDefault(); togglePause(); }
});

init();