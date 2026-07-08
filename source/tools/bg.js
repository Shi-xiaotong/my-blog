/**
 * Cosmic Background — Minimal Black & White
 * Pure Canvas, zero images. Grayscale planet, orbits, stars, shooting stars.
 */
(function(){
'use strict';

var c = document.createElement('canvas');
c.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;display:block;';
document.body.insertBefore(c, document.body.firstChild);

var ctx = c.getContext('2d');
var W, H;
var DPR = Math.min(window.devicePixelRatio || 1, 2);

function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  c.width = W * DPR;
  c.height = H * DPR;
  c.style.width = W + 'px';
  c.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  planet.x = W * 0.45;
  planet.y = H * 0.58;
  planet.r = Math.max(70, Math.min(W, H) * 0.1);
  initOrbits();
}
window.addEventListener('resize', resize);

// ─── Stars ───
var stars = [];
for (var i = 0; i < 180; i++) {
  stars.push({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 1.5 + 0.3,
    phase: Math.random() * 6.28,
    speed: 0.3 + Math.random() * 1.2
  });
}

// ─── Planet (grayscale) ───
var planet = { x: 0, y: 0, r: 100 };

// Simple craters
var craters = [];
for (var i = 0; i < 10; i++) {
  craters.push({
    dx: (Math.random() - 0.5) * 0.7,
    dy: (Math.random() - 0.5) * 0.7,
    r: 3 + Math.random() * 12,
    depth: 0.15 + Math.random() * 0.4
  });
}

// ─── Moon ───
var moon = { angle: 0, speed: 0.0004, dist: 0, r: 10 };

// ─── Orbits ───
var orbitDefs = [];
function initOrbits() {
  orbitDefs.length = 0;
  var arr = [1.8, 2.6, 3.5];
  for (var i = 0; i < 3; i++) {
    var or = planet.r * arr[i];
    var n = 3 + Math.floor(Math.random() * 3);
    var bodies = [];
    for (var j = 0; j < n; j++) {
      bodies.push({
        angle: (j / n) * 6.283,
        speed: (0.08 + Math.random() * 0.1) * (i % 2 ? -1 : 1),
        size: 1.5 + Math.random() * 2.5
      });
    }
    orbitDefs.push({ r: or, tilt: (Math.random() - 0.5) * 0.35, bodies: bodies });
  }
  moon.dist = planet.r * 2.1;
}

// ─── Shooting stars ───
var shooting = [];
var shotTimer = 0;

// ─── Init ───
resize();

// ─── Draw planet (grayscale) ───
function drawPlanet() {
  var x = planet.x, y = planet.y, r = planet.r;

  // Atmosphere glow
  var glow = ctx.createRadialGradient(x, y, r * 0.95, x, y, r * 1.8);
  glow.addColorStop(0, 'rgba(200,200,220,0.03)');
  glow.addColorStop(0.5, 'rgba(200,200,220,0.02)');
  glow.addColorStop(1, 'rgba(200,200,220,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.8, 0, 6.283);
  ctx.fill();

  // Planet body (grayscale gradient)
  var grad = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.05, x, y, r);
  grad.addColorStop(0, '#555');
  grad.addColorStop(0.4, '#3a3a3a');
  grad.addColorStop(0.7, '#2a2a2a');
  grad.addColorStop(1, '#1a1a1a');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 6.283);
  ctx.fill();

  // Craters
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 6.283);
  ctx.clip();
  for (var i = 0; i < craters.length; i++) {
    var cr = craters[i];
    var cx = x + cr.dx * r;
    var cy = y + cr.dy * r;
    // Rim
    ctx.beginPath();
    ctx.arc(cx, cy, cr.r, 0, 6.283);
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.05 + cr.depth * 0.08) + ')';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // Shadow
    ctx.beginPath();
    ctx.arc(cx - 1, cy - 1, cr.r * 0.5, 0, 6.283);
    ctx.fillStyle = 'rgba(0,0,0,' + (0.15 + cr.depth * 0.2) + ')';
    ctx.fill();
  }
  ctx.restore();

  // Edge bright rim
  var edge = ctx.createRadialGradient(x, y, r * 0.97, x, y, r * 1.02);
  edge.addColorStop(0, 'rgba(180,180,200,0)');
  edge.addColorStop(0.6, 'rgba(180,180,200,0.06)');
  edge.addColorStop(1, 'rgba(180,180,200,0.15)');
  ctx.fillStyle = edge;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.02, 0, 6.283);
  ctx.fill();

  // Specular highlight
  var spec = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, 0, x - r * 0.35, y - r * 0.35, r * 0.18);
  spec.addColorStop(0, 'rgba(255,255,255,0.08)');
  spec.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = spec;
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.18, 0, 6.283);
  ctx.fill();
}

// ─── Draw Moon ───
function drawMoon() {
  var px = planet.x + Math.cos(moon.angle) * moon.dist;
  var py = planet.y + Math.sin(moon.angle) * moon.dist * 0.55;
  var mr = moon.r;

  var mg = ctx.createRadialGradient(px - mr * 0.2, py - mr * 0.2, mr * 0.05, px, py, mr);
  mg.addColorStop(0, '#999');
  mg.addColorStop(0.5, '#666');
  mg.addColorStop(1, '#333');
  ctx.fillStyle = mg;
  ctx.beginPath();
  ctx.arc(px, py, mr, 0, 6.283);
  ctx.fill();

  // Moon craters
  ctx.save();
  ctx.beginPath();
  ctx.arc(px, py, mr, 0, 6.283);
  ctx.clip();
  for (var i = 0; i < 4; i++) {
    var cx = px + (Math.random() - 0.5) * mr * 1.2;
    var cy = py + (Math.random() - 0.5) * mr * 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, 1 + Math.random() * 2, 0, 6.283);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fill();
  }
  ctx.restore();
}

// ─── Main loop ───
var lastTime = 0;

function draw(time) {
  var dt = time - lastTime;
  lastTime = time;
  var t = time * 0.001;

  ctx.fillStyle = '#07080c';
  ctx.fillRect(0, 0, W, H);

  // Stars
  for (var i = 0; i < stars.length; i++) {
    var s = stars[i];
    var alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
    ctx.beginPath();
    ctx.arc(s.x * W, s.y * H, s.r, 0, 6.283);
    ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
    ctx.fill();
  }

  // Orbits
  for (var i = 0; i < orbitDefs.length; i++) {
    var o = orbitDefs[i];
    ctx.save();
    ctx.translate(planet.x, planet.y);
    ctx.scale(1, 0.5);
    ctx.rotate(o.tilt * 0.3);
    ctx.beginPath();
    ctx.arc(0, 0, o.r, 0, 6.283);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.4;
    ctx.stroke();
    ctx.restore();

    for (var j = 0; j < o.bodies.length; j++) {
      var b = o.bodies[j];
      b.angle += b.speed * dt * 0.001;
      var bx = planet.x + o.r * Math.cos(b.angle);
      var by = planet.y + o.r * 0.5 * Math.sin(b.angle) + o.r * o.tilt * 0.15;
      ctx.beginPath();
      ctx.arc(bx, by, b.size, 0, 6.283);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fill();
    }
  }

  // Moon orbit
  moon.angle += moon.speed * dt;
  drawMoon();

  // Planet
  drawPlanet();

  // Shooting stars
  shotTimer += dt;
  if (shotTimer > 5000 + Math.random() * 10000) {
    shooting.push({
      x: Math.random() * W * 0.7 + W * 0.1,
      y: Math.random() * H * 0.2,
      dx: -2.5 - Math.random() * 5,
      dy: 0.5 + Math.random() * 3,
      life: 1,
      speed: 0.4 + Math.random() * 0.4,
      trail: []
    });
    shotTimer = 0;
  }

  for (var i = shooting.length - 1; i >= 0; i--) {
    var ss = shooting[i];
    ss.x += ss.dx * ss.speed;
    ss.y += ss.dy * ss.speed;
    ss.life -= 0.007;
    ss.trail.push({ x: ss.x, y: ss.y });
    if (ss.trail.length > 15) ss.trail.shift();

    for (var j = 1; j < ss.trail.length; j++) {
      var a = (j / ss.trail.length) * ss.life;
      ctx.beginPath();
      ctx.moveTo(ss.trail[j - 1].x, ss.trail[j - 1].y);
      ctx.lineTo(ss.trail[j].x, ss.trail[j].y);
      ctx.strokeStyle = 'rgba(255,255,255,' + (a * 0.5) + ')';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(ss.x, ss.y, 1.5, 0, 6.283);
    ctx.fillStyle = 'rgba(255,255,255,' + ss.life + ')';
    ctx.fill();

    if (ss.life <= 0 || ss.x < -50 || ss.y > H + 50) {
      shooting.splice(i, 1);
    }
  }

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

})();