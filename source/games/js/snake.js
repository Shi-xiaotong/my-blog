var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var CELL = 20, COLS = 20, ROWS = 20;
var snake, dir, nextDir, food, score, best, speed, timer, paused, alive;

function init() {
  best = parseInt(localStorage.getItem('best_snake')) || 0;
  document.getElementById('best').textContent = best;
  newGame();
}

function newGame() {
  snake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
  dir = {x:1,y:0}; nextDir = {x:1,y:0};
  score = 0; speed = 120; paused = false; alive = true;
  document.getElementById('pauseBtn').textContent = '暂停';
  placeFood();
  render();
  clearInterval(timer);
  timer = setInterval(tick, speed);
}

function placeFood() {
  var occupied = new Set(snake.map(s => s.x + ',' + s.y));
  var pos;
  do { pos = {x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS)}; } while (occupied.has(pos.x+','+pos.y));
  food = pos;
}

function setDir(dx, dy) {
  if (dir.x === -dx && dir.y === -dy) return;
  nextDir = {x:dx, y:dy};
}

function tick() {
  if (paused || !alive) return;
  dir = nextDir;
  var head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS || snake.some(s => s.x === head.x && s.y === head.y)) {
    alive = false;
    clearInterval(timer);
    if (score > best) { best = score; localStorage.setItem('best_snake', best); }
    document.getElementById('best').textContent = best;
    render();
    return;
  }

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    placeFood();
    if (speed > 50) { speed -= 2; clearInterval(timer); timer = setInterval(tick, speed); }
  } else {
    snake.pop();
  }
  render();
}

function render() {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (var i = 0; i <= COLS; i++) { ctx.beginPath(); ctx.moveTo(i*CELL, 0); ctx.lineTo(i*CELL, ROWS*CELL); ctx.stroke(); }
  for (var i = 0; i <= ROWS; i++) { ctx.beginPath(); ctx.moveTo(0, i*CELL); ctx.lineTo(COLS*CELL, i*CELL); ctx.stroke(); }

  // Food
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(food.x*CELL + CELL/2, food.y*CELL + CELL/2, CELL/2 - 2, 0, Math.PI*2);
  ctx.fill();

  // Snake
  snake.forEach((s, i) => {
    var ratio = 1 - i / snake.length * 0.4;
    var g = Math.round(180 * ratio);
    ctx.fillStyle = i === 0 ? '#22c55e' : `rgb(34, ${g}, 94)`;
    var pad = i === 0 ? 1 : 2;
    ctx.beginPath();
    ctx.roundRect(s.x*CELL + pad, s.y*CELL + pad, CELL - pad*2, CELL - pad*2, i === 0 ? 6 : 4);
    ctx.fill();
  });

  // Eyes on head
  var h = snake[0];
  ctx.fillStyle = '#fff';
  var ex = h.x*CELL + CELL/2 + dir.x*4;
  var ey = h.y*CELL + CELL/2 + dir.y*4;
  ctx.beginPath(); ctx.arc(ex - dir.y*3, ey + dir.x*3, 2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(ex + dir.y*3, ey - dir.x*3, 2, 0, Math.PI*2); ctx.fill();

  document.getElementById('score').textContent = score;
  document.getElementById('length').textContent = snake.length;

  if (!alive) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 20);
    ctx.font = '18px -apple-system, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('得分: ' + score, canvas.width/2, canvas.height/2 + 15);
  }
}

function togglePause() {
  paused = !paused;
  document.getElementById('pauseBtn').textContent = paused ? '继续' : '暂停';
}

document.addEventListener('keydown', e => {
  var map = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],a:[-1,0],d:[1,0],w:[0,-1],s:[0,1]};
  if (map[e.key]) { e.preventDefault(); setDir(...map[e.key]); }
  if (e.key === ' ' || e.key === 'p') { e.preventDefault(); togglePause(); }
});

var touchX, touchY;
canvas.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, {passive:true});
canvas.addEventListener('touchend', e => {
  var dx = e.changedTouches[0].clientX - touchX;
  var dy = e.changedTouches[0].clientY - touchY;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
  if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0);
  else setDir(0, dy > 0 ? 1 : -1);
}, {passive:true});

init();