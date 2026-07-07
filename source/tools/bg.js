/**
 * Cosmic Background — Black & White Space Scene
 * Pure Canvas, zero images. Renders stars, planet with craters,
 * orbiting bodies, falling astronaut, and shooting stars.
 */
(function(){
'use strict';

var c = document.createElement('canvas');
c.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;display:block;';
document.body.insertBefore(c, document.body.firstChild);

var ctx = c.getContext('2d');
var W, H;

function resize() {
  W = c.width = window.innerWidth;
  H = c.height = window.innerHeight;
  planet.x = W * 0.45;
  planet.y = H * 0.58;
  planet.r = Math.max(60, Math.min(W, H) * 0.1);
  initOrbits();
}
window.addEventListener('resize', resize);

// ─── Stars ───
var stars = [];
for (var i = 0; i < 220; i++) {
  stars.push({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 1.5 + 0.3,
    phase: Math.random() * 6.28,
    speed: 0.5 + Math.random()
  });
}

// ─── Planet ───
var planet = { x: 0, y: 0, r: 100 };

var craters = [];
for (var i = 0; i < 14; i++) {
  craters.push({
    dx: (Math.random() - 0.5) * 0.7,
    dy: (Math.random() - 0.5) * 0.7,
    r: 3 + Math.random() * 14,
    depth: 0.15 + Math.random() * 0.45
  });
}

// ─── Orbits ───
var orbitDefs = [];
function initOrbits() {
  orbitDefs.length = 0;
  var arr = [1.8, 2.6, 3.5];
  for (var i = 0; i < 3; i++) {
    var or = planet.r * arr[i];
    var n = 3 + Math.floor(Math.random() * 4);
    var bodies = [];
    for (var j = 0; j < n; j++) {
      bodies.push({
        angle: (j / n) * 6.283,
        speed: (0.12 + Math.random() * 0.1) * (i % 2 ? -1 : 1),
        size: 1.5 + Math.random() * 3
      });
    }
    orbitDefs.push({ r: or, tilt: (Math.random() - 0.5) * 0.4, bodies: bodies });
  }
}

// ─── Astronaut ───
var astro = { x: 0, y: 0, angle: 0, vy: 0, vx: 0 };

function resetAstro() {
  astro.x = W * (0.6 + Math.random() * 0.3);
  astro.y = -60 - Math.random() * 100;
  astro.vx = (Math.random() - 0.5) * 0.3;
  astro.vy = 0.3 + Math.random() * 0.2;
  astro.angle = Math.random() * 0.5 - 0.25;
}

// ─── Shooting stars ───
var shooting = [];
var shotTimer = 0;

// ─── Init ───
resize();
resetAstro();

// ─── Draw planet ───
function drawPlanet() {
  var x = planet.x, y = planet.y, r = planet.r;

  // Atmospheric glow
  var glow = ctx.createRadialGradient(x, y, r * 0.95, x, y, r * 1.8);
  glow.addColorStop(0, 'rgba(255,255,255,0.025)');
  glow.addColorStop(0.5, 'rgba(255,255,255,0.015)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.8, 0, 6.283);
  ctx.fill();

  // Planet body
  var g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#555');
  g.addColorStop(0.5, '#2a2a2a');
  g.addColorStop(1, '#0d0d0d');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 6.283);
  ctx.fill();

  // Craters (clip to planet)
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
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.08 + cr.depth * 0.12) + ')';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // Shadow
    ctx.beginPath();
    ctx.arc(cx - 1, cy - 1, cr.r * 0.6, 0, 6.283);
    ctx.fillStyle = 'rgba(0,0,0,' + (0.15 + cr.depth * 0.25) + ')';
    ctx.fill();
  }
  ctx.restore();

  // Edge glow
  var eg = ctx.createRadialGradient(x, y, r * 0.97, x, y, r * 1.02);
  eg.addColorStop(0, 'rgba(255,255,255,0.08)');
  eg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = eg;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.02, 0, 6.283);
  ctx.fill();
}

// ─── Draw astronaut ───
function drawAstronaut() {
  var px = planet.x, py = planet.y;
  var dx = px - astro.x, dy = py - astro.y;
  var dist = Math.sqrt(dx * dx + dy * dy);

  // Gravity pull
  if (dist > 1) {
    var grav = 0.0003;
    astro.vx += (dx / dist) * grav;
    astro.vy += (dy / dist) * grav;
  }
  // Downward constant drift
  astro.vy += 0.01;
  astro.x += astro.vx;
  astro.y += astro.vy;

  // Tumble toward planet
  astro.angle = Math.atan2(dy, dx) + 1.57 + Math.sin(astro.y * 0.01) * 0.15;

  // Reset if out of bounds
  if (astro.y > H + 100 || astro.x < -100 || astro.x > W + 100) {
    resetAstro();
    return;
  }

  ctx.save();
  ctx.translate(astro.x, astro.y);
  ctx.rotate(astro.angle);

  var sc = Math.min(W, H) * 0.012;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Helmet
  ctx.beginPath();
  ctx.arc(0, -sc * 2.5, sc * 1.1, 0, 6.283);
  ctx.stroke();

  // Helmet visor line
  ctx.beginPath();
  ctx.arc(0, -sc * 2.5, sc * 0.7, -0.8, 0.8);
  ctx.globalAlpha = 0.6;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Backpack
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(-sc * 0.8, -sc * 0.8, sc * 1.6, sc * 1.8);

  // Body
  ctx.beginPath();
  ctx.moveTo(0, -sc * 1.3);
  ctx.lineTo(0, sc * 1.5);
  ctx.stroke();

  // Arms (splayed)
  ctx.beginPath();
  ctx.moveTo(0, -sc * 0.2);
  ctx.lineTo(-sc * 2.2, sc * 0.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -sc * 0.2);
  ctx.lineTo(sc * 2.2, sc * 0.6);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(0, sc * 1.5);
  ctx.lineTo(-sc * 1.2, sc * 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, sc * 1.5);
  ctx.lineTo(sc * 1.2, sc * 3);
  ctx.stroke();

  // Tether (dashed line toward planet)
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 0.5;
  ctx.setLineDash([2, 4]);
  ctx.beginPath();
  ctx.moveTo(0, -sc * 0.5);
  ctx.lineTo(-sc * 6, -sc * 12);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();
}

// ─── Main loop ───
var lastTime = 0;

function draw(time) {
  var dt = time - lastTime;
  lastTime = time;
  var t = time * 0.001;

  // Background
  ctx.fillStyle = '#070708';
  ctx.fillRect(0, 0, W, H);

  // Stars
  for (var i = 0; i < stars.length; i++) {
    var s = stars[i];
    var sx = s.x * W, sy = s.y * H;
    var alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
    ctx.beginPath();
    ctx.arc(sx, sy, s.r, 0, 6.283);
    ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
    ctx.fill();
  }

  // Orbits (behind planet)
  for (var i = 0; i < orbitDefs.length; i++) {
    var o = orbitDefs[i];
    ctx.save();
    ctx.translate(planet.x, planet.y);
    ctx.scale(1, 0.55);
    ctx.rotate(o.tilt * 0.3);
    ctx.beginPath();
    ctx.arc(0, 0, o.r, 0, 6.283);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();

    // Orbiting bodies
    for (var j = 0; j < o.bodies.length; j++) {
      var b = o.bodies[j];
      b.angle += b.speed * dt * 0.001;
      var bx = planet.x + o.r * Math.cos(b.angle);
      var by = planet.y + o.r * 0.55 * Math.sin(b.angle) + o.r * o.tilt * 0.2;
      ctx.beginPath();
      ctx.arc(bx, by, b.size, 0, 6.283);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fill();
      // Tiny glow on body
      ctx.beginPath();
      ctx.arc(bx - b.size * 0.3, by - b.size * 0.3, b.size * 0.6, 0, 6.283);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fill();
    }
  }

  // Planet
  drawPlanet();

  // Astronaut (in front of planet - orbital path)
  drawAstronaut();

  // Shooting stars
  shotTimer += dt;
  if (shotTimer > 5000 + Math.random() * 8000) {
    shooting.push({
      x: Math.random() * W * 0.7 + W * 0.1,
      y: Math.random() * H * 0.25,
      dx: -3 - Math.random() * 4,
      dy: 0.5 + Math.random() * 2.5,
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
    ss.life -= 0.008;
    ss.trail.push({ x: ss.x, y: ss.y });
    if (ss.trail.length > 25) ss.trail.shift();

    // Trail
    for (var j = 1; j < ss.trail.length; j++) {
      var a = (j / ss.trail.length) * ss.life;
      ctx.beginPath();
      ctx.moveTo(ss.trail[j - 1].x, ss.trail[j - 1].y);
      ctx.lineTo(ss.trail[j].x, ss.trail[j].y);
      ctx.strokeStyle = 'rgba(255,255,255,' + (a * 0.7) + ')';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Head
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