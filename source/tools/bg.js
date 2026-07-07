/**
 * Cosmic Background v2 — Enhanced Planet + Atmospheric Effects
 * Pure Canvas, zero images. Renders an earth-like planet with continents,
 * cloud layers, glowing atmosphere, orbiting moon, stars, shooting stars,
 * and a falling astronaut.
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
  planet.r = Math.max(80, Math.min(W, H) * 0.11);
  initOrbits();
}
window.addEventListener('resize', resize);

// ─── Stars ───
var stars = [];
for (var i = 0; i < 350; i++) {
  var colorRand = Math.random();
  stars.push({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 1.8 + 0.2,
    phase: Math.random() * 6.28,
    speed: 0.3 + Math.random() * 1.2,
    // Color variety: mostly white, some blue/warm tint
    color: colorRand < 0.7 ? '#fff' : colorRand < 0.85 ? '#a8d8ff' : '#ffd8a8'
  });
}

// ─── Planet ───
var planet = { x: 0, y: 0, r: 120 };

// Continent shapes (random blobs)
var continents = [];
for (var i = 0; i < 8; i++) {
  var pts = [];
  var n = 6 + Math.floor(Math.random() * 8);
  var cx = (Math.random() - 0.5) * 0.8;
  var cy = (Math.random() - 0.5) * 0.8;
  for (var j = 0; j < n; j++) {
    var a = (j / n) * 6.283;
    var dist = 0.08 + Math.random() * 0.18;
    pts.push({ x: cx + Math.cos(a) * dist, y: cy + Math.sin(a) * dist });
  }
  continents.push(pts);
}

// Craters (moon-like, fewer but more prominent)
var craters = [];
for (var i = 0; i < 10; i++) {
  craters.push({
    dx: (Math.random() - 0.5) * 0.65,
    dy: (Math.random() - 0.5) * 0.65,
    r: 4 + Math.random() * 12,
    depth: 0.15 + Math.random() * 0.4
  });
}

// ─── Moon ───
var moon = { angle: 0, speed: 0.0004, dist: 0, r: 12 };

// ─── Orbits ───
var orbitDefs = [];
function initOrbits() {
  orbitDefs.length = 0;
  var arr = [1.9, 2.8, 3.7];
  for (var i = 0; i < 3; i++) {
    var or = planet.r * arr[i];
    var n = 4 + Math.floor(Math.random() * 4);
    var bodies = [];
    for (var j = 0; j < n; j++) {
      bodies.push({
        angle: (j / n) * 6.283,
        speed: (0.1 + Math.random() * 0.12) * (i % 2 ? -1 : 1),
        size: 1.5 + Math.random() * 3,
        phase: Math.random() * 6.283
      });
    }
    orbitDefs.push({ r: or, tilt: (Math.random() - 0.5) * 0.35, bodies: bodies });
  }
  moon.dist = planet.r * 2.2;
}

// ─── Astronaut ───
var astro = { x: 0, y: 0, angle: 0, vy: 0, vx: 0, tumble: 0 };

function resetAstro() {
  astro.x = W * (0.6 + Math.random() * 0.3);
  astro.y = -80 - Math.random() * 150;
  astro.vx = (Math.random() - 0.5) * 0.35;
  astro.vy = 0.25 + Math.random() * 0.25;
  astro.tumble = Math.random() * 6.283;
}

// ─── Shooting stars ───
var shooting = [];
var shotTimer = 0;

// ─── Init ───
resize();
resetAstro();

// ─── Draw planet (enhanced) ───
function drawPlanet(time) {
  var x = planet.x, y = planet.y, r = planet.r;
  var t = time * 0.001;

  // Outer atmospheric glow (wide, soft)
  var outerGlow = ctx.createRadialGradient(x, y, r * 0.9, x, y, r * 2.5);
  outerGlow.addColorStop(0, 'rgba(100,180,255,0.04)');
  outerGlow.addColorStop(0.4, 'rgba(100,180,255,0.025)');
  outerGlow.addColorStop(1, 'rgba(100,180,255,0)');
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(x, y, r * 2.5, 0, 6.283);
  ctx.fill();

  // Atmosphere ring (limb glow)
  var atmoGlow = ctx.createRadialGradient(x, y, r * 0.88, x, y, r);
  atmoGlow.addColorStop(0, 'rgba(100,180,255,0)');
  atmoGlow.addColorStop(0.7, 'rgba(100,180,255,0.05)');
  atmoGlow.addColorStop(0.9, 'rgba(100,200,255,0.12)');
  atmoGlow.addColorStop(1, 'rgba(100,200,255,0.2)');
  ctx.fillStyle = atmoGlow;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 6.283);
  ctx.fill();

  // Planet body (ocean base)
  var bodyGrad = ctx.createRadialGradient(x - r * 0.25, y - r * 0.3, r * 0.05, x, y, r);
  bodyGrad.addColorStop(0, '#4a90d9');
  bodyGrad.addColorStop(0.3, '#2d6bb4');
  bodyGrad.addColorStop(0.6, '#1a4f8a');
  bodyGrad.addColorStop(1, '#0f2d4f');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 6.283);
  ctx.fill();

  // Continents (clipped to planet)
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 6.283);
  ctx.clip();

  for (var i = 0; i < continents.length; i++) {
    var pts = continents[i];
    // Perlin-noise-like green gradient for each continent
    var shade = 0.2 + Math.random() * 0.15;
    ctx.beginPath();
    ctx.moveTo(x + pts[0].x * r, y + pts[0].y * r);
    for (var j = 1; j < pts.length; j++) {
      var cx1 = x + pts[j].x * r;
      var cy1 = y + pts[j].y * r;
      ctx.lineTo(cx1, cy1);
    }
    ctx.closePath();
    var cg = ctx.createRadialGradient(x + pts[0].x * r, y + pts[0].y * r, 2, x + pts[0].x * r, y + pts[0].y * r, r * 0.25);
    cg.addColorStop(0, '#4a8c5c');
    cg.addColorStop(0.5, '#3a7a4a');
    cg.addColorStop(1, '#2a5a3a');
    ctx.fillStyle = cg;
    ctx.fill();
  }

  // Add some random "city lights" on dark side (small dots)
  for (var i = 0; i < 30; i++) {
    var lx = (Math.random() - 0.5) * 1.7;
    var ly = (Math.random() - 0.5) * 1.7;
    var dist = Math.sqrt(lx * lx + ly * ly);
    if (dist > 0.95) continue;
    // Only on the "right" side (simulating night side)
    if (lx < 0.1) continue;
    ctx.beginPath();
    ctx.arc(x + lx * r * 0.85, y + ly * r * 0.85, 0.8 + Math.random() * 0.8, 0, 6.283);
    ctx.fillStyle = 'rgba(255,220,150,' + (0.15 + Math.random() * 0.3) + ')';
    ctx.fill();
  }

  // Craters (for the "moon-like" parts)
  for (var i = 0; i < craters.length; i++) {
    var cr = craters[i];
    var cx = x + cr.dx * r;
    var cy = y + cr.dy * r;
    // Crater rim
    ctx.beginPath();
    ctx.arc(cx, cy, cr.r, 0, 6.283);
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.06 + cr.depth * 0.1) + ')';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // Crater shadow
    ctx.beginPath();
    ctx.arc(cx - 1.5, cy - 1.5, cr.r * 0.5, 0, 6.283);
    ctx.fillStyle = 'rgba(0,0,0,' + (0.1 + cr.depth * 0.2) + ')';
    ctx.fill();
  }

  ctx.restore();

  // Thin edge bright rim (light catching)
  var edgeGlow = ctx.createRadialGradient(x, y, r * 0.96, x, y, r * 1.02);
  edgeGlow.addColorStop(0, 'rgba(180,220,255,0)');
  edgeGlow.addColorStop(0.6, 'rgba(180,220,255,0.05)');
  edgeGlow.addColorStop(1, 'rgba(180,220,255,0.15)');
  ctx.fillStyle = edgeGlow;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.02, 0, 6.283);
  ctx.fill();

  // Specular highlight (sun reflection)
  var specGrad = ctx.createRadialGradient(x - r * 0.4, y - r * 0.35, 0, x - r * 0.4, y - r * 0.35, r * 0.2);
  specGrad.addColorStop(0, 'rgba(255,255,255,0.08)');
  specGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(x - r * 0.4, y - r * 0.35, r * 0.2, 0, 6.283);
  ctx.fill();
}

// ─── Draw cloud layer ───
function drawClouds(time) {
  var x = planet.x, y = planet.y, r = planet.r;
  var t = time * 0.001;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r * 0.97, 0, 6.283);
  ctx.clip();

  // Cloud wisps
  for (var i = 0; i < 12; i++) {
    var cx = x + (Math.sin(i * 2.1 + t * 0.02) * 0.7) * r;
    var cy = y + (Math.cos(i * 1.7 + t * 0.015) * 0.6) * r;
    var cw = 15 + Math.sin(i * 3.3) * 8;
    var ch = 4 + Math.sin(i * 2.5) * 2;

    for (var k = -3; k <= 3; k++) {
      var px = cx + k * cw * 0.3;
      var py = cy + Math.sin(k * 0.8 + t * 0.01) * ch;
      var alpha = 0.04 + 0.06 * (1 - Math.abs(k) / 4);
      ctx.beginPath();
      ctx.ellipse(px, py, cw * 0.5, ch * 0.3, 0, 0, 6.283);
      ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
      ctx.fill();
    }
  }
  ctx.restore();
}

// ─── Draw Moon ───
function drawMoon(time) {
  var t = time * 0.001;
  var px = planet.x + Math.cos(moon.angle) * moon.dist;
  var py = planet.y + Math.sin(moon.angle) * moon.dist * 0.55;
  var mr = moon.r;

  // Moon glow
  var mg = ctx.createRadialGradient(px, py, mr * 0.5, px, py, mr * 2);
  mg.addColorStop(0, 'rgba(200,200,220,0.03)');
  mg.addColorStop(1, 'rgba(200,200,220,0)');
  ctx.fillStyle = mg;
  ctx.beginPath();
  ctx.arc(px, py, mr * 2, 0, 6.283);
  ctx.fill();

  // Moon body
  var moonGrad = ctx.createRadialGradient(px - mr * 0.2, py - mr * 0.2, mr * 0.05, px, py, mr);
  moonGrad.addColorStop(0, '#aaa');
  moonGrad.addColorStop(0.5, '#777');
  moonGrad.addColorStop(1, '#444');
  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(px, py, mr, 0, 6.283);
  ctx.fill();

  // Moon craters
  ctx.save();
  ctx.beginPath();
  ctx.arc(px, py, mr, 0, 6.283);
  ctx.clip();
  for (var i = 0; i < 5; i++) {
    var cx = px + (Math.random() - 0.5) * mr * 1.2;
    var cy = py + (Math.random() - 0.5) * mr * 1.2;
    var cr = 1 + Math.random() * 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, 6.283);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fill();
  }
  ctx.restore();
}

// ─── Draw astronaut ───
function drawAstronaut(time) {
  var px = planet.x, py = planet.y;
  var dx = px - astro.x, dy = py - astro.y;
  var dist = Math.sqrt(dx * dx + dy * dy);

  // Gravity pull
  if (dist > 1) {
    var grav = 0.00035;
    astro.vx += (dx / dist) * grav;
    astro.vy += (dy / dist) * grav;
  }
  astro.vy += 0.012;
  astro.x += astro.vx;
  astro.y += astro.vy;

  // Tumble rotation
  astro.tumble += 0.008;
  astro.angle = Math.atan2(dy, dx) + 1.57 + Math.sin(astro.tumble) * 0.3;

  if (astro.y > H + 120 || astro.x < -120 || astro.x > W + 120) {
    resetAstro();
    return;
  }

  ctx.save();
  ctx.translate(astro.x, astro.y);
  ctx.rotate(astro.angle);

  var sc = Math.min(W, H) * 0.013;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Helmet (sphere)
  ctx.beginPath();
  ctx.arc(0, -sc * 2.5, sc * 1.2, 0, 6.283);
  ctx.stroke();
  // Helmet fill
  ctx.beginPath();
  ctx.arc(0, -sc * 2.5, sc * 0.9, 0, 6.283);
  ctx.fillStyle = 'rgba(150,200,255,0.08)';
  ctx.fill();

  // Visor reflection
  ctx.beginPath();
  ctx.arc(0, -sc * 2.5, sc * 0.7, -0.6, 0.6);
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Backpack
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  var bp = sc * 0.9;
  ctx.beginPath();
  ctx.roundRect(-bp, -sc * 0.8, bp * 2, sc * 2, 2);
  ctx.fill();

  // Body line
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -sc * 1.2);
  ctx.lineTo(0, sc * 1.5);
  ctx.stroke();

  // Arms
  ctx.beginPath();
  ctx.moveTo(0, -sc * 0.2);
  ctx.lineTo(-sc * 2.5, sc * 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -sc * 0.2);
  ctx.lineTo(sc * 2.5, sc * 0.8);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(0, sc * 1.5);
  ctx.lineTo(-sc * 1.3, sc * 3.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, sc * 1.5);
  ctx.lineTo(sc * 1.3, sc * 3.2);
  ctx.stroke();

  // Tether
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 0.5;
  ctx.setLineDash([3, 5]);
  ctx.beginPath();
  ctx.moveTo(0, -sc * 0.3);
  ctx.lineTo(-sc * 7, -sc * 14);
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
  ctx.fillStyle = '#07080c';
  ctx.fillRect(0, 0, W, H);

  // Stars
  for (var i = 0; i < stars.length; i++) {
    var s = stars[i];
    var sx = s.x * W, sy = s.y * H;
    var alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
    ctx.beginPath();
    ctx.arc(sx, sy, s.r, 0, 6.283);
    ctx.fillStyle = s.color;
    ctx.globalAlpha = alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Orbits (behind planet)
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
      ctx.beginPath();
      ctx.arc(bx - b.size * 0.3, by - b.size * 0.3, b.size * 0.5, 0, 6.283);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fill();
    }
  }

  // Moon orbit
  moon.angle += moon.speed * dt;
  drawMoon(time);

  // Planet
  drawPlanet(time);
  drawClouds(time);

  // Astronaut
  drawAstronaut(time);

  // Shooting stars
  shotTimer += dt;
  if (shotTimer > 4000 + Math.random() * 10000) {
    shooting.push({
      x: Math.random() * W * 0.7 + W * 0.1,
      y: Math.random() * H * 0.2,
      dx: -2.5 - Math.random() * 5,
      dy: 0.5 + Math.random() * 3,
      life: 1,
      speed: 0.4 + Math.random() * 0.4,
      trail: [],
      hue: 200 + Math.random() * 40
    });
    shotTimer = 0;
  }

  for (var i = shooting.length - 1; i >= 0; i--) {
    var ss = shooting[i];
    ss.x += ss.dx * ss.speed;
    ss.y += ss.dy * ss.speed;
    ss.life -= 0.007;
    ss.trail.push({ x: ss.x, y: ss.y });
    if (ss.trail.length > 30) ss.trail.shift();

    // Trail
    for (var j = 1; j < ss.trail.length; j++) {
      var a = (j / ss.trail.length) * ss.life;
      ctx.beginPath();
      ctx.moveTo(ss.trail[j - 1].x, ss.trail[j - 1].y);
      ctx.lineTo(ss.trail[j].x, ss.trail[j].y);
      ctx.strokeStyle = 'hsla(' + ss.hue + ',80%,70%,' + (a * 0.6) + ')';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Glow
    ctx.beginPath();
    ctx.arc(ss.x, ss.y, 3, 0, 6.283);
    ctx.fillStyle = 'hsla(' + ss.hue + ',80%,70%,' + (ss.life * 0.3) + ')';
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(ss.x, ss.y, 1.5, 0, 6.283);
    ctx.fillStyle = 'hsla(' + ss.hue + ',100%,90%,' + ss.life + ')';
    ctx.fill();

    if (ss.life <= 0 || ss.x < -50 || ss.y > H + 50) {
      shooting.splice(i, 1);
    }
  }

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

})();