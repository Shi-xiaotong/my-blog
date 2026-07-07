var grid, score, best, prevGrid, prevScore;

function init() {
  document.getElementById('gridBg').innerHTML = Array.from({length:16}, () => '<div class="cell"></div>').join('');
  best = parseInt(localStorage.getItem('best_2048')) || 0;
  document.getElementById('best').textContent = best;
  newGame();
}

function newGame() {
  grid = Array.from({length:4}, () => Array(4).fill(0));
  score = 0;
  prevGrid = null;
  prevScore = 0;
  document.getElementById('gameOver').style.display = 'none';
  addRandom(); addRandom();
  render();
}

function addRandom() {
  var empty = [];
  for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) if (!grid[r][c]) empty.push([r, c]);
  if (!empty.length) return;
  var [r, c] = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function render() {
  var layer = document.getElementById('tileLayer');
  var html = '';
  for (var r = 0; r < 4; r++) {
    for (var c = 0; c < 4; c++) {
      var v = grid[r][c];
      if (v) {
        var cls = v <= 2048 ? 't' + v : 'tsuper';
        html += `<div class="tile ${cls}">${v}</div>`;
      } else {
        html += '<div></div>';
      }
    }
  }
  layer.innerHTML = html;
  document.getElementById('score').textContent = score;
  if (score > best) { best = score; localStorage.setItem('best_2048', best); }
  document.getElementById('best').textContent = best;
}

function slide(row) {
  var arr = row.filter(v => v);
  var merged = false;
  for (var i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) { arr[i] *= 2; score += arr[i]; arr.splice(i + 1, 1); merged = true; }
  }
  while (arr.length < 4) arr.push(0);
  return { result: arr, moved: row.some((v, i) => v !== arr[i]) };
}

function move(dir) {
  prevGrid = grid.map(r => [...r]);
  prevScore = score;
  var moved = false;

  if (dir === 'left') {
    for (var r = 0; r < 4; r++) { var s = slide(grid[r]); if (s.moved) moved = true; grid[r] = s.result; }
  } else if (dir === 'right') {
    for (var r = 0; r < 4; r++) { var s = slide([...grid[r]].reverse()); if (s.moved) moved = true; grid[r] = s.result.reverse(); }
  } else if (dir === 'up') {
    for (var c = 0; c < 4; c++) { var col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]]; var s = slide(col); if (s.moved) moved = true; for (var r = 0; r < 4; r++) grid[r][c] = s.result[r]; }
  } else if (dir === 'down') {
    for (var c = 0; c < 4; c++) { var col = [grid[3][c], grid[2][c], grid[1][c], grid[0][c]]; var s = slide(col); if (s.moved) moved = true; for (var r = 0; r < 4; r++) grid[3 - r][c] = s.result[r]; }
  }

  if (moved) { addRandom(); render(); if (isGameOver()) showGameOver(); }
}

function isGameOver() {
  for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
    if (!grid[r][c]) return false;
    if (c < 3 && grid[r][c] === grid[r][c + 1]) return false;
    if (r < 3 && grid[r][c] === grid[r + 1][c]) return false;
  }
  return true;
}

function showGameOver() {
  document.getElementById('finalScore').textContent = '得分: ' + score;
  document.getElementById('gameOver').style.display = 'flex';
}

function undoMove() {
  if (prevGrid) { grid = prevGrid; score = prevScore; prevGrid = null; render(); document.getElementById('gameOver').style.display = 'none'; }
}

// Keyboard
document.addEventListener('keydown', e => {
  var map = { ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down', a:'left', d:'right', w:'up', s:'down' };
  if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
});

// Touch
var touchX, touchY;
var container = document.getElementById('gameContainer');
container.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, {passive:true});
container.addEventListener('touchend', e => {
  var dx = e.changedTouches[0].clientX - touchX;
  var dy = e.changedTouches[0].clientY - touchY;
  var absDx = Math.abs(dx), absDy = Math.abs(dy);
  if (Math.max(absDx, absDy) < 30) return;
  if (absDx > absDy) move(dx > 0 ? 'right' : 'left');
  else move(dy > 0 ? 'down' : 'up');
}, {passive:true});

init();