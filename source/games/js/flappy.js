var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var W = canvas.width, H = canvas.height;

var bird, pipes, score, best, gameState, frameCount, gravity, jumpForce, pipeSpeed, pipeGap, pipeWidth, pipeInterval;

best = parseInt(localStorage.getItem('best_flappy')) || 0;
document.getElementById('best').textContent = best;

function initBird() {
  bird = { x: 80, y: H / 2, vy: 0, radius: 12, rotation: 0 };
}

function resetGame() {
  initBird();
  pipes = [];
  score = 0;
  frameCount = 0;
  aiComment = '';
  gravity = 0.35;
  jumpForce = -6.5;
  pipeSpeed = 2.2;
  pipeGap = 130;
  pipeWidth = 50;
  pipeInterval = 90;
  document.getElementById('score').textContent = '0';
  document.getElementById('startOverlay').style.display = 'none';
  gameState = 'playing';
}

function startGame() {
  resetGame();
  gameLoop();
}

function flap() {
  if (gameState === 'idle') { startGame(); return; }
  if (gameState === 'playing') { bird.vy = jumpForce; }
  if (gameState === 'dead') { resetGame(); gameLoop(); }
}

function spawnPipe() {
  var gapY = 80 + Math.random() * (H - pipeGap - 160);
  pipes.push({ x: W, gapY, scored: false });
}

function update() {
  if (gameState !== 'playing') return;
  frameCount++;

  // Bird physics
  bird.vy += gravity;
  bird.y += bird.vy;
  bird.rotation = Math.min(Math.max(bird.vy * 3, -30), 90) * Math.PI / 180;

  // Spawn pipes
  if (frameCount % pipeInterval === 0) spawnPipe();

  // Update pipes
  pipes.forEach(p => p.x -= pipeSpeed);
  pipes = pipes.filter(p => p.x + pipeWidth > -10);

  // Score
  pipes.forEach(p => {
    if (!p.scored && p.x + pipeWidth < bird.x) { p.scored = true; score++; document.getElementById('score').textContent = score; }
  });

  // Collision detection
  var b = bird;
  // Ground / ceiling
  if (b.y + b.radius > H || b.y - b.radius < 0) { die(); return; }
  // Pipes
  for (var p of pipes) {
    if (b.x + b.radius > p.x && b.x - b.radius < p.x + pipeWidth) {
      if (b.y - b.radius < p.gapY || b.y + b.radius > p.gapY + pipeGap) { die(); return; }
    }
  }
}

var aiComment = '';

async function die() {
  gameState = 'dead';
  if (score > best) { best = score; localStorage.setItem('best_flappy', best); document.getElementById('best').textContent = best; }
  // AI 点评
  if (typeof getGameComment === 'function') {
    getGameComment('Flappy Bird', score, score > 10).then(msg => { if (msg) aiComment = msg; });
  }
}

function draw() {
  // Sky
  var grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#70c5ce');
  grad.addColorStop(1, '#d4f1f4');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Ground
  ctx.fillStyle = '#ded895';
  ctx.fillRect(0, H - 20, W, 20);
  ctx.fillStyle = '#5d8a3c';
  ctx.fillRect(0, H - 20, W, 5);

  // Pipes
  ctx.fillStyle = '#73bf2e';
  pipes.forEach(p => {
    // Top pipe
    ctx.fillStyle = '#73bf2e';
    ctx.fillRect(p.x, 0, pipeWidth, p.gapY);
    ctx.fillStyle = '#5da825';
    ctx.fillRect(p.x - 3, p.gapY - 20, pipeWidth + 6, 20);
    // Bottom pipe
    ctx.fillStyle = '#73bf2e';
    ctx.fillRect(p.x, p.gapY + pipeGap, pipeWidth, H - p.gapY - pipeGap);
    ctx.fillStyle = '#5da825';
    ctx.fillRect(p.x - 3, p.gapY + pipeGap, pipeWidth + 6, 20);
  });

  // Bird
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(bird.rotation);
  // Body
  ctx.fillStyle = '#f7dc6f';
  ctx.beginPath();
  ctx.ellipse(0, 0, bird.radius, bird.radius - 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d4ac0d';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Eye
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(5, -3, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(6, -3, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Beak
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.moveTo(bird.radius, -2);
  ctx.lineTo(bird.radius + 8, 2);
  ctx.lineTo(bird.radius, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Game over text
  if (gameState === 'dead') {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', W/2, H/2 - 30);
    ctx.font = '18px -apple-system, sans-serif';
    ctx.fillStyle = '#ddd';
    ctx.fillText('得分: ' + score, W/2, H/2 + 10);
    ctx.font = '14px -apple-system, sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.fillText('点击重新开始', W/2, H/2 + 40);
    if (aiComment) {
      ctx.font = '13px -apple-system, sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(aiComment, W/2, H/2 + 65);
    }
  }
}

function gameLoop() {
  update();
  draw();
  if (gameState === 'playing') requestAnimationFrame(gameLoop);
  else if (gameState === 'dead') draw();
}

canvas.addEventListener('click', flap);
canvas.addEventListener('touchstart', e => { e.preventDefault(); flap(); }, {passive: false});
document.addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); flap(); } });

// Initial draw
initBird();
draw();