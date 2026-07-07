var ICONS = [
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="12" r="10"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15 8.5 22 9.3 17 14 18 21 12 17.8 6 21 7 14 2 9.3 9 8.5"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6v6l4 2"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
];

var COLORS = ['#3b82f6','#ef4444','#22c55e','#f59e0b','#a855f7','#ec4899','#06b6d4','#f97316','#84cc16','#6366f1','#14b8a6','#e11d48','#0ea5e9','#d946ef','#8b5cf6','#fbbf24','#10b981','#e74c3c'];

var BACK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>';

var difficulty = 'easy';
var cards = [], flipped = [], matched = new Set();
var moves = 0, pairs = 0, totalPairs = 0;
var seconds = 0, timerInterval = null;
var locked = false;

var diffConfig = { easy: {cols:4, rows:4}, medium: {cols:5, rows:4}, hard: {cols:6, rows:6} };

function setDifficulty(d) {
  difficulty = d;
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.toggle('active', b.dataset.diff === d));
  newGame();
}

function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}

function newGame() {
  var {cols, rows} = diffConfig[difficulty];
  totalPairs = (cols * rows) / 2;
  var iconIndices = shuffle([...Array(ICONS.length).keys()]).slice(0, totalPairs);
  var pairsArr = shuffle([...iconIndices, ...iconIndices]);

  cards = pairsArr.map((iconIdx, i) => ({ id: i, iconIdx, color: COLORS[iconIdx] }));
  flipped = []; matched = new Set(); moves = 0; pairs = 0; seconds = 0; locked = false;

  clearInterval(timerInterval);
  timerInterval = null;
  document.getElementById('timer').textContent = '0:00';
  render();
}

function render() {
  var {cols, rows} = diffConfig[difficulty];
  var board = document.getElementById('board');
  board.className = 'board ' + difficulty;

  board.innerHTML = cards.map((c, i) => {
    var isFlipped = flipped.includes(i) || matched.has(i);
    var isMatched = matched.has(i);
    return `<div class="card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}" onclick="flipCard(${i})">
      <div class="card-face"><div style="color:${c.color}">${ICONS[c.iconIdx]}</div></div>
      <div class="card-back">${BACK_ICON}</div>
    </div>`;
  }).join('');

  document.getElementById('moves').textContent = moves;
  document.getElementById('pairs').textContent = pairs + '/' + totalPairs;
}

function flipCard(i) {
  if (locked || flipped.includes(i) || matched.has(i) || flipped.length >= 2) return;

  if (!timerInterval) {
    timerInterval = setInterval(() => { seconds++; var m = Math.floor(seconds/60); var s = seconds%60; document.getElementById('timer').textContent = m + ':' + String(s).padStart(2,'0'); }, 1000);
  }

  flipped.push(i);
  render();

  if (flipped.length === 2) {
    moves++;
    var [a, b] = flipped;
    if (cards[a].iconIdx === cards[b].iconIdx) {
      matched.add(a); matched.add(b);
      pairs++;
      flipped = [];
      render();
      if (pairs === totalPairs) { clearInterval(timerInterval); setTimeout(showWin, 500); }
    } else {
      locked = true;
      setTimeout(() => { flipped = []; locked = false; render(); }, 800);
    }
  }
}

function showWin() {
  document.getElementById('winMoves').textContent = moves;
  var m = Math.floor(seconds/60), s = seconds%60;
  document.getElementById('winTime').textContent = m + ':' + String(s).padStart(2,'0');
  document.getElementById('winOverlay').style.display = 'flex';
}

function closeWin() { document.getElementById('winOverlay').style.display = 'none'; }

newGame();