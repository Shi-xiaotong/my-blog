var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var cellSize, cols, rows, grid, nextGrid, generation, running, speed, animFrame;

var PATTERNS = {
  glider: [[0,1],[1,2],[2,0],[2,1],[2,2]],
  blinker: [[0,0],[0,1],[0,2]],
  pulsar: [[0,2],[0,3],[0,4],[0,8],[0,9],[0,10],[2,0],[2,5],[2,7],[2,12],[3,0],[3,5],[3,7],[3,12],[4,0],[4,5],[4,7],[4,12],[5,2],[5,3],[5,4],[5,8],[5,9],[5,10],[7,2],[7,3],[7,4],[7,8],[7,9],[7,10],[8,0],[8,5],[8,7],[8,12],[9,0],[9,5],[9,7],[9,12],[10,0],[10,5],[10,7],[10,12],[12,2],[12,3],[12,4],[12,8],[12,9],[12,10]],
  gosper: [[0,24],[1,22],[1,24],[2,12],[2,13],[2,20],[2,21],[2,34],[2,35],[3,11],[3,15],[3,20],[3,21],[3,34],[3,35],[4,0],[4,1],[4,10],[4,16],[4,20],[4,21],[5,0],[5,1],[5,10],[5,14],[5,16],[5,17],[5,22],[5,24],[6,10],[6,16],[6,24],[7,11],[7,15],[8,12],[8,13]],
  lwss: [[0,1],[0,4],[1,0],[2,0],[2,4],[3,0],[3,1],[3,2],[3,3]],
  pentadecathlon: [[0,0],[1,0],[2,-1],[2,1],[3,0],[4,0],[5,0],[6,-1],[6,1],[7,0],[8,0],[9,0],[10,-1],[10,1],[11,0],[12,0],[13,0],[14,-1],[14,1],[15,0]]
};

function init() {
  cellSize = parseInt(document.getElementById('cellSize').value);
  cols = Math.floor(660 / cellSize);
  rows = Math.floor(500 / cellSize);
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;
  grid = Array.from({length: rows}, () => Array(cols).fill(0));
  nextGrid = Array.from({length: rows}, () => Array(cols).fill(0));
  generation = 0;
  running = false;
  speed = parseInt(document.getElementById('speed').value);
  draw();
  updateStats();
}

function resizeGrid() {
  var newCellSize = parseInt(document.getElementById('cellSize').value);
  var newCols = Math.floor(660 / newCellSize);
  var newRows = Math.floor(500 / newCellSize);
  var newGrid = Array.from({length: newRows}, () => Array(newCols).fill(0));
  // Copy existing cells
  for (var r = 0; r < Math.min(rows, newRows); r++) for (var c = 0; c < Math.min(cols, newCols); c++) newGrid[r][c] = grid[r][c];
  cellSize = newCellSize; cols = newCols; rows = newRows;
  canvas.width = cols * cellSize; canvas.height = rows * cellSize;
  grid = newGrid;
  nextGrid = Array.from({length: rows}, () => Array(cols).fill(0));
  draw();
}

function countNeighbors(r, c) {
  var count = 0;
  for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) {
    if (dr === 0 && dc === 0) continue;
    var nr = (r + dr + rows) % rows, nc = (c + dc + cols) % cols;
    count += grid[nr][nc];
  }
  return count;
}

function step() {
  for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
    var n = countNeighbors(r, c);
    nextGrid[r][c] = grid[r][c] ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);
  }
  [grid, nextGrid] = [nextGrid, grid];
  generation++;
  draw();
  updateStats();
}

function draw() {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 0.5;
  for (var x = 0; x <= cols; x++) { ctx.beginPath(); ctx.moveTo(x*cellSize, 0); ctx.lineTo(x*cellSize, rows*cellSize); ctx.stroke(); }
  for (var y = 0; y <= rows; y++) { ctx.beginPath(); ctx.moveTo(0, y*cellSize); ctx.lineTo(cols*cellSize, y*cellSize); ctx.stroke(); }

  // Cells
  for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
    if (grid[r][c]) {
      var n = countNeighbors(r, c);
      var brightness = Math.min(255, 100 + n * 30);
      ctx.fillStyle = `rgb(${brightness}, ${Math.round(brightness * 0.8)}, ${Math.round(brightness * 0.4)})`;
      ctx.fillRect(c * cellSize + 1, r * cellSize + 1, cellSize - 2, cellSize - 2);
    }
  }
}

function updateStats() {
  var alive = 0;
  for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) alive += grid[r][c];
  document.getElementById('gen').textContent = generation;
  document.getElementById('alive').textContent = alive;
  document.getElementById('density').textContent = (alive / (rows * cols) * 100).toFixed(1) + '%';
}

function togglePlay() {
  running = !running;
  document.getElementById('playBtn').textContent = running ? '暂停' : '开始';
  if (running) runLoop();
}

function runLoop() {
  if (!running) return;
  step();
  setTimeout(runLoop, 1000 / speed);
}

function updateSpeed() { speed = parseInt(document.getElementById('speed').value); }

function randomFill() {
  for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) grid[r][c] = Math.random() < 0.3 ? 1 : 0;
  generation = 0; draw(); updateStats();
}

function clearGrid() {
  for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) grid[r][c] = 0;
  generation = 0; draw(); updateStats();
}

function loadPattern(name) {
  clearGrid();
  var pattern = PATTERNS[name];
  var cx = Math.floor(cols / 2), cy = Math.floor(rows / 2);
  pattern.forEach(([r, c]) => {
    var nr = cy + r, nc = cx + c;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) grid[nr][nc] = 1;
  });
  draw(); updateStats();
}

// Mouse/touch drawing
var isDrawing = false, drawValue = 1;

function getCell(e) {
  var rect = canvas.getBoundingClientRect();
  var x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
  var y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
  return { c: Math.floor(x / cellSize * (canvas.width / rect.width)), r: Math.floor(y / cellSize * (canvas.height / rect.height)) };
}

canvas.addEventListener('mousedown', e => {
  e.preventDefault();
  var {r, c} = getCell(e);
  if (r >= 0 && r < rows && c >= 0 && c < cols) { isDrawing = true; drawValue = grid[r][c] ? 0 : 1; grid[r][c] = drawValue; draw(); updateStats(); }
});
canvas.addEventListener('mousemove', e => {
  if (!isDrawing) return;
  var {r, c} = getCell(e);
  if (r >= 0 && r < rows && c >= 0 && c < cols) { grid[r][c] = drawValue; draw(); updateStats(); }
});
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseleave', () => isDrawing = false);
canvas.addEventListener('contextmenu', e => e.preventDefault());

canvas.addEventListener('touchstart', e => { e.preventDefault(); var {r, c} = getCell(e); if (r >= 0 && r < rows && c >= 0 && c < cols) { isDrawing = true; drawValue = grid[r][c] ? 0 : 1; grid[r][c] = drawValue; draw(); updateStats(); } }, {passive:false});
canvas.addEventListener('touchmove', e => { e.preventDefault(); if (!isDrawing) return; var {r, c} = getCell(e); if (r >= 0 && r < rows && c >= 0 && c < cols) { grid[r][c] = drawValue; draw(); updateStats(); } }, {passive:false});
canvas.addEventListener('touchend', () => isDrawing = false);

document.addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
  if (e.key === 'n') { e.preventDefault(); step(); }
  if (e.key === 'c') { e.preventDefault(); clearGrid(); }
  if (e.key === 'r') { e.preventDefault(); randomFill(); }
});

init();
randomFill();