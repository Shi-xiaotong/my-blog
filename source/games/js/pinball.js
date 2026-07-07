var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var W = canvas.width, H = canvas.height;

var ball, flippers, bumpers, score, best, balls, leftDown, rightDown, launched, particles;

best = parseInt(localStorage.getItem('best_pinball')) || 0;
document.getElementById('best').textContent = best;

function init() {
  flippers = {
    left: { x: 100, y: 480, angle: 0.4, length: 60, width: 10 },
    right: { x: 260, y: 480, angle: Math.PI - 0.4, length: 60, width: 10 }
  };
  bumpers = [
    { x: 100, y: 180, r: 25, color: '#ef4444', points: 100 },
    { x: 180, y: 140, r: 20, color: '#f59e0b', points: 150 },
    { x: 260, y: 180, r: 25, color: '#22c55e', points: 100 },
    { x: 140, y: 260, r: 18, color: '#3b82f6', points: 200 },
    { x: 220, y: 260, r: 18, color: '#a855f7', points: 200 },
    { x: 180, y: 320, r: 22, color: '#ec4899', points: 150 },
  ];
  particles = [];
  newGame();
}

function newGame() {
  score = 0; balls = 3; launched = false;
  leftDown = false; rightDown = false;
  document.getElementById('score').textContent = '0';
  document.getElementById('balls').textContent = '3';
  resetBall();
}

function resetBall() {
  launched = false;
  ball = { x: 340, y: 450, vx: 0, vy: 0, r: 8 };
}

function launchBall() {
  if (launched) return;
  launched = true;
  ball.vy = -8 - Math.random() * 3;
  ball.vx = -1 - Math.random() * 2;
}

function addParticles(x, y, color, count) {
  for (var i = 0; i < count; i++) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 1 + Math.random() * 3;
    particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color });
  }
}

function update() {
  if (!launched) return;

  // Gravity
  ball.vy += 0.15;

  // Move
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Damping
  ball.vx *= 0.999;

  // Wall collisions
  if (ball.x - ball.r < 10) { ball.x = 10 + ball.r; ball.vx = Math.abs(ball.vx) * 0.8; }
  if (ball.x + ball.r > W - 10) { ball.x = W - 10 - ball.r; ball.vx = -Math.abs(ball.vx) * 0.8; }
  if (ball.y - ball.r < 10) { ball.y = 10 + ball.r; ball.vy = Math.abs(ball.vy) * 0.8; }

  // Bumper collisions
  bumpers.forEach(b => {
    var dx = ball.x - b.x, dy = ball.y - b.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < ball.r + b.r) {
      var nx = dx / dist, ny = dy / dist;
      var relVel = ball.vx * nx + ball.vy * ny;
      if (relVel < 0) {
        ball.vx -= 1.8 * relVel * nx;
        ball.vy -= 1.8 * relVel * ny;
      }
      ball.x = b.x + (b.r + ball.r + 1) * nx;
      ball.y = b.y + (b.r + ball.r + 1) * ny;
      score += b.points;
      document.getElementById('score').textContent = score;
      addParticles(b.x, b.y, b.color, 8);
    }
  });

  // Flipper update
  var leftTarget = leftDown ? -0.6 : 0.4;
  var rightTarget = rightDown ? Math.PI + 0.6 : Math.PI - 0.4;
  flippers.left.angle += (leftTarget - flippers.left.angle) * 0.3;
  flippers.right.angle += (rightTarget - flippers.right.angle) * 0.3;

  // Flipper collisions
  [flippers.left, flippers.right].forEach(f => {
    var ex = f.x + Math.cos(f.angle) * f.length;
    var ey = f.y + Math.sin(f.angle) * f.length;
    // Line segment collision
    var dx = ex - f.x, dy = ey - f.y;
    var len2 = dx * dx + dy * dy;
    var t = ((ball.x - f.x) * dx + (ball.y - f.y) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    var cx = f.x + t * dx, cy = f.y + t * dy;
    var distX = ball.x - cx, distY = ball.y - cy;
    var dist = Math.sqrt(distX * distX + distY * distY);
    if (dist < ball.r + f.width / 2) {
      var nx = distX / dist, ny = distY / dist;
      var speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      var flipSpeed = (leftDown || rightDown) ? 12 : 4;
      ball.vx = nx * flipSpeed + (leftDown || rightDown ? (f === flippers.left ? 2 : -2) : 0);
      ball.vy = ny * flipSpeed - 2;
      ball.x = cx + (ball.r + f.width / 2 + 1) * nx;
      ball.y = cy + (ball.r + f.width / 2 + 1) * ny;
    }
  });

  // Ball lost
  if (ball.y > H + 20) {
    balls--;
    document.getElementById('balls').textContent = balls;
    if (balls <= 0) {
      if (score > best) { best = score; localStorage.setItem('best_pinball', best); document.getElementById('best').textContent = best; }
      setTimeout(() => alert('游戏结束! 得分: ' + score), 100);
      newGame();
    } else {
      resetBall();
    }
  }

  // Particles
  particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.03; p.vy += 0.05; });
  particles = particles.filter(p => p.life > 0);
}

function draw() {
  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, W, H);

  // Walls
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(10, 10); ctx.lineTo(10, H); ctx.moveTo(W-10, 10); ctx.lineTo(W-10, H); ctx.moveTo(10, 10); ctx.lineTo(W-10, 10);
  ctx.stroke();

  // Guide rails
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(10, 400); ctx.lineTo(60, 460);
  ctx.moveTo(W-10, 400); ctx.lineTo(W-60, 460);
  ctx.stroke();

  // Bumpers
  bumpers.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = b.color + '44';
    ctx.fill();
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px -apple-system';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.points, b.x, b.y);
  });

  // Flippers
  [flippers.left, flippers.right].forEach(f => {
    var ex = f.x + Math.cos(f.angle) * f.length;
    var ey = f.y + Math.sin(f.angle) * f.length;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = f.width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(f.x, f.y); ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.width / 2 + 2, 0, Math.PI * 2);
    ctx.fillStyle = '#64748b';
    ctx.fill();
  });

  // Particles
  particles.forEach(p => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Ball
  if (ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Shine
    ctx.beginPath();
    ctx.arc(ball.x - 2, ball.y - 2, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();
  }

  // Launch indicator
  if (!launched) {
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '14px -apple-system';
    ctx.textAlign = 'center';
    ctx.fillText('按空格发射', W/2, 500);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', e => {
  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') leftDown = true;
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') rightDown = true;
  if (e.key === ' ') { e.preventDefault(); launchBall(); }
});
document.addEventListener('keyup', e => {
  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') leftDown = false;
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') rightDown = false;
});

init();
gameLoop();