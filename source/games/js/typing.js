var TEXTS = {
  english: [
    "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.",
    "Programming is the art of telling another human being what one wants the computer to do. Software is a great combination of artistry and engineering.",
    "In the beginning there was nothing. Then there was everything. The universe is not only queerer than we suppose, but queerer than we can suppose.",
    "Technology is best when it brings people together. Innovation distinguishes between a leader and a follower. Stay hungry, stay foolish.",
    "The best time to plant a tree was twenty years ago. The second best time is now. Every great developer you know got there by solving problems they were unqualified to solve.",
  ],
  code: [
    'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconsole.log(fibonacci(10));',
    'var arr = [1, 2, 3, 4, 5];\nconst doubled = arr.map(x => x * 2);\nconst sum = arr.reduce((a, b) => a + b, 0);\nconsole.log(doubled, sum);',
    'async function fetchData(url) {\n  var res = await fetch(url);\n  var data = await res.json();\n  return data;\n}',
    'class Animal {\n  constructor(name) {\n    this.name = name;\n  }\n  speak() {\n    return `${this.name} makes a sound.`;\n  }\n}',
    'for (var i = 0; i < 10; i++) {\n  if (i % 3 === 0) continue;\n  if (i % 5 === 0) break;\n  console.log(i);\n}',
  ],
  mixed: [
    'The HTTP status code 200 means "OK". A 404 error means the resource was not found. Use fetch() to make API requests.',
    'Docker containers are lightweight and portable. Run "docker build -t myapp ." to build an image, then "docker run -p 3000:3000 myapp".',
    'Git is a distributed version control system. Common commands: git add, git commit, git push, git pull, git branch, git merge.',
    'CSS Grid and Flexbox are powerful layout tools. Use display: grid for 2D layouts and display: flex for 1D layouts.',
    'REST APIs use HTTP methods: GET to read, POST to create, PUT to update, DELETE to remove. Status codes indicate success or failure.',
  ]
};

var mode = 'english';
var targetText = '';
var charStates = [];
var cursorPos = 0;
var startTime = null;
var totalTyped = 0;
var totalCorrect = 0;
var finished = false;
var timer = null;

function setMode(m) {
  mode = m;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === m));
  newTest();
}

function pickText() {
  var pool = TEXTS[mode];
  return pool[Math.floor(Math.random() * pool.length)];
}

function newTest() {
  targetText = pickText();
  charStates = Array(targetText.length).fill('pending');
  cursorPos = 0; startTime = null; totalTyped = 0; totalCorrect = 0; finished = false;
  clearInterval(timer);
  document.getElementById('wpm').textContent = '0';
  document.getElementById('accuracy').textContent = '100%';
  document.getElementById('chars').textContent = '0';
  document.getElementById('time').textContent = '0s';
  document.getElementById('resultPanel').style.display = 'none';
  document.getElementById('textDisplay').scrollTop = 0;
  renderText();
  focusInput();
}

function focusInput() {
  document.getElementById('hiddenInput').focus();
}

async function aiGenerate() {
  if (typeof generateTypingText !== 'function') return;
  var btn = document.getElementById('aiBtn');
  btn.textContent = '生成中...';
  btn.disabled = true;
  var text = await generateTypingText();
  if (text) {
    targetText = text.trim();
    charStates = Array(targetText.length).fill('pending');
    cursorPos = 0; startTime = null; totalTyped = 0; totalCorrect = 0; finished = false;
    clearInterval(timer);
    document.getElementById('wpm').textContent = '0';
    document.getElementById('accuracy').textContent = '100%';
    document.getElementById('chars').textContent = '0';
    document.getElementById('time').textContent = '0s';
    document.getElementById('resultPanel').style.display = 'none';
    document.getElementById('textDisplay').scrollTop = 0;
    renderText();
    focusInput();
  }
  btn.textContent = 'AI 生成';
  btn.disabled = false;
}

function renderText() {
  var el = document.getElementById('textContent');
  el.innerHTML = targetText.split('').map((ch, i) => {
    var cls = charStates[i];
    if (ch === '\n') return '<br>';
    if (ch === ' ') return `<span class="char space ${cls} ${i === cursorPos && !finished ? 'current' : ''}"> </span>`;
    return `<span class="char ${cls} ${i === cursorPos && !finished ? 'current' : ''}">${escapeHtml(ch)}</span>`;
  }).join('');
  // Auto-scroll to keep current character visible
  scrollToCurrent();
}

function scrollToCurrent() {
  var el = document.getElementById('textDisplay');
  var currentChar = document.getElementById('textContent').querySelector('.current');
  if (!currentChar) return;
  var elRect = el.getBoundingClientRect();
  var charRect = currentChar.getBoundingClientRect();
  // If char is below visible area, scroll down; if above, scroll up
  if (charRect.bottom > elRect.bottom) {
    el.scrollTop += charRect.bottom - elRect.bottom + 40;
  } else if (charRect.top < elRect.top) {
    el.scrollTop -= elRect.top - charRect.top + 40;
  }
}

function escapeHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function onKeyDown(e) {
  if (finished) return;
  if (e.key === 'Backspace') {
    e.preventDefault();
    if (cursorPos > 0) { cursorPos--; charStates[cursorPos] = 'pending'; renderText(); }
    return;
  }
  if (e.key === 'Tab') { e.preventDefault(); return; }
}

function onInput(e) {
  if (finished) return;
  var val = e.target.value;
  e.target.value = '';
  if (!val) return;
  processInput(val);
}

function processInput(val) {
  if (finished || !val) return;

  if (!startTime) { startTime = Date.now(); startTimer(); }

  for (var ch of val) {
    if (cursorPos >= targetText.length) break;
    totalTyped++;
    if (ch === targetText[cursorPos]) { charStates[cursorPos] = 'correct'; totalCorrect++; }
    else { charStates[cursorPos] = 'wrong'; }
    cursorPos++;
  }

  renderText();
  updateStats();

  if (cursorPos >= targetText.length) finishTest();
}

function startTimer() {
  timer = setInterval(() => {
    var elapsed = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('time').textContent = elapsed + 's';
    updateStats();
  }, 200);
}

function updateStats() {
  if (!startTime) return;
  var elapsed = (Date.now() - startTime) / 1000 / 60;
  var wpm = elapsed > 0 ? Math.round((totalCorrect / 5) / elapsed) : 0;
  var accuracy = totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 100) : 100;
  document.getElementById('wpm').textContent = wpm;
  document.getElementById('accuracy').textContent = accuracy + '%';
  document.getElementById('chars').textContent = totalTyped;
}

function finishTest() {
  finished = true;
  clearInterval(timer);
  var elapsed = Math.floor((Date.now() - startTime) / 1000);
  var elapsedMin = elapsed / 60;
  var wpm = elapsedMin > 0 ? Math.round((totalCorrect / 5) / elapsedMin) : 0;
  var accuracy = totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 100) : 100;

  document.getElementById('resWpm').textContent = wpm;
  document.getElementById('resAccuracy').textContent = accuracy + '%';
  document.getElementById('resChars').textContent = totalTyped;
  document.getElementById('resTime').textContent = elapsed + 's';

  var bestKey = 'best_wpm';
  var best = localStorage.getItem(bestKey);
  var bestEl = document.getElementById('resBest');
  if (!best || wpm > parseInt(best)) {
    localStorage.setItem(bestKey, wpm);
    bestEl.textContent = '新纪录!';
  } else {
    bestEl.textContent = '最高记录: ' + best + ' WPM';
  }

  document.getElementById('resultPanel').style.display = 'block';
}

newTest();