var COLORS = [
  '#000000','#ffffff','#ff0000','#00ff00','#0000ff','#ffff00',
  '#ff00ff','#00ffff','#ff8800','#88ff00','#0088ff','#ff0088',
  '#880000','#008800','#000088','#888888','#cccccc','#444444',
  '#ff4444','#44ff44','#4444ff','#ffaa00','#aa00ff','#00aaff',
  '#ffcccc','#ccffcc','#ccccff','#ffffcc','#ffccff','#ccffff',
  '#884400','#448800','#004488','#880044','#440088','#008844',
];

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var gridSize, pixelSize, grid, currentColor, tool, showGrid, history;

function init() {
  gridSize = 32;
  pixelSize = Math.min(Math.floor((window.innerWidth - 240) / gridSize), Math.floor((window.innerHeight - 200) / gridSize));
  pixelSize = Math.max(8, Math.min(20, pixelSize));
  canvas.width = gridSize * pixelSize;
  canvas.height = gridSize * pixelSize;
  grid = Array.from({length: gridSize}, () => Array(gridSize).fill('#ffffff'));
  currentColor = '#000000';
  tool = 'pen';
  showGrid = true;
  history = [];
  document.getElementById('gridInfo').textContent = `${gridSize} x ${gridSize}`;
  renderPalette();
  draw();
}

function renderPalette() {
  var el = document.getElementById('palette');
  el.innerHTML = COLORS.map(c =>
    `<div class="color-swatch ${c === currentColor ? 'active' : ''}" style="background:${c}" onclick="setColor('${c}')"></div>`
  ).join('');
}

function setColor(c) {
  currentColor = c;
  document.getElementById('currentColor').style.background = c;
  document.getElementById('colorPicker').value = c;
  renderPalette();
}

function setTool(t) {
  tool = t;
  document.querySelectorAll('.tool-btns button').forEach(b => b.classList.remove('active'));
  document.getElementById('btn-' + t)?.classList.add('active');
}

function draw() {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Pixels
  for (var r = 0; r < gridSize; r++) for (var c = 0; c < gridSize; c++) {
    ctx.fillStyle = grid[r][c];
    ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
  }

  // Grid
  if (showGrid) {
    ctx.strokeStyle = 'rgba(128,128,128,0.2)';
    ctx.lineWidth = 0.5;
    for (var i = 0; i <= gridSize; i++) {
      ctx.beginPath(); ctx.moveTo(i * pixelSize, 0); ctx.lineTo(i * pixelSize, gridSize * pixelSize); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * pixelSize); ctx.lineTo(gridSize * pixelSize, i * pixelSize); ctx.stroke();
    }
  }
}

function getPixel(e) {
  var rect = canvas.getBoundingClientRect();
  var x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
  var y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
  var c = Math.floor(x / pixelSize * (canvas.width / rect.width));
  var r = Math.floor(y / pixelSize * (canvas.height / rect.height));
  return { r, c };
}

function saveHistory() {
  history.push(grid.map(r => [...r]));
  if (history.length > 50) history.shift();
}

function undoAction() {
  if (history.length) { grid = history.pop(); draw(); }
}

function setPixel(r, c, color) {
  if (r >= 0 && r < gridSize && c >= 0 && c < gridSize && grid[r][c] !== color) {
    grid[r][c] = color;
    draw();
  }
}

function floodFill(r, c, target, replacement) {
  if (target === replacement || r < 0 || r >= gridSize || c < 0 || c >= gridSize) return;
  if (grid[r][c] !== target) return;
  grid[r][c] = replacement;
  floodFill(r+1, c, target, replacement);
  floodFill(r-1, c, target, replacement);
  floodFill(r, c+1, target, replacement);
  floodFill(r, c-1, target, replacement);
}

var isDrawing = false;
canvas.addEventListener('mousedown', e => {
  e.preventDefault();
  var {r, c} = getPixel(e);
  if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return;
  isDrawing = true;
  saveHistory();
  if (tool === 'pen') setPixel(r, c, currentColor);
  else if (tool === 'eraser') setPixel(r, c, '#ffffff');
  else if (tool === 'fill') floodFill(r, c, grid[r][c], currentColor);
  else if (tool === 'picker') { setColor(grid[r][c]); setTool('pen'); }
});
canvas.addEventListener('mousemove', e => {
  if (!isDrawing) return;
  var {r, c} = getPixel(e);
  if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return;
  if (tool === 'pen') setPixel(r, c, currentColor);
  else if (tool === 'eraser') setPixel(r, c, '#ffffff');
});
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseleave', () => isDrawing = false);

canvas.addEventListener('touchstart', e => { e.preventDefault(); canvas.dispatchEvent(new MouseEvent('mousedown', {clientX: e.touches[0].clientX, clientY: e.touches[0].clientY})); }, {passive:false});
canvas.addEventListener('touchmove', e => { e.preventDefault(); canvas.dispatchEvent(new MouseEvent('mousemove', {clientX: e.touches[0].clientX, clientY: e.touches[0].clientY})); }, {passive:false});
canvas.addEventListener('touchend', () => isDrawing = false);

function clearCanvas() {
  saveHistory();
  grid = Array.from({length: gridSize}, () => Array(gridSize).fill('#ffffff'));
  draw();
}

function toggleGrid() { showGrid = !showGrid; draw(); }

function resizeCanvas(size) {
  gridSize = size;
  pixelSize = Math.min(Math.floor((window.innerWidth - 240) / size), Math.floor((window.innerHeight - 200) / size));
  pixelSize = Math.max(6, Math.min(20, pixelSize));
  canvas.width = size * pixelSize;
  canvas.height = size * pixelSize;
  grid = Array.from({length: size}, () => Array(size).fill('#ffffff'));
  history = [];
  document.getElementById('gridInfo').textContent = `${size} x ${size}`;
  document.querySelectorAll('.size-btns button').forEach(b => b.classList.remove('active'));
  document.querySelector(`.size-btns button[onclick="resizeCanvas(${size})"]`)?.classList.add('active');
  draw();
}

function downloadPng() {
  var exportCanvas = document.createElement('canvas');
  exportCanvas.width = gridSize;
  exportCanvas.height = gridSize;
  var ectx = exportCanvas.getContext('2d');
  for (var r = 0; r < gridSize; r++) for (var c = 0; c < gridSize; c++) {
    ectx.fillStyle = grid[r][c];
    ectx.fillRect(c, r, 1, 1);
  }
  var a = document.createElement('a');
  a.href = exportCanvas.toDataURL('image/png');
  a.download = `pixel-art-${gridSize}x${gridSize}.png`;
  a.click();
}

init();