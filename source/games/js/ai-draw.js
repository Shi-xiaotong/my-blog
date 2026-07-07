var AI_ENDPOINT = 'https://ai.233002.xyz';
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var WORDS = [
  '太阳', '月亮', '星星', '山', '树', '花', '房子', '猫', '狗', '鱼', '鸟', '汽车', '飞机', '船',
  '苹果', '香蕉', '西瓜', '蛋糕', '冰淇淋', '咖啡', '披萨', '汉堡',
  '太阳镜', '雨伞', '时钟', '钥匙', '书', '吉他', '足球', '篮球',
  '笑脸', '爱心', '闪电', '彩虹', '云', '雪人', '蝴蝶', '蜗牛',
  '钻石', '皇冠', '火箭', '机器人', '恐龙', '独角兽', '美人鱼', '超人',
  '铅笔', '剪刀', '灯泡', '电话', '电脑', '相机', '望远镜', '显微镜',
];

var currentWord = '', score = 0, round = 0, timer = null, timeLeft = 60, drawing = false, guessed = false;
var currentColor = '#000', currentSize = 3;

ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

function setColor(c) {
  currentColor = c;
  document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.color-btn[style*="${c}"]`)?.classList.add('active');
}

function setSize(s) {
  currentSize = s;
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.size-btn')[s === 3 ? 0 : s === 6 ? 1 : 2].classList.add('active');
}

function clearCanvas() {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function getPos(e) {
  var rect = canvas.getBoundingClientRect();
  var x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
  var y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
  return { x: x * (canvas.width / rect.width), y: y * (canvas.height / rect.height) };
}

canvas.addEventListener('mousedown', e => { drawing = true; var p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); });
canvas.addEventListener('mousemove', e => { if (!drawing) return; var p = getPos(e); ctx.strokeStyle = currentColor; ctx.lineWidth = currentSize; ctx.lineTo(p.x, p.y); ctx.stroke(); });
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseleave', () => drawing = false);
canvas.addEventListener('touchstart', e => { e.preventDefault(); drawing = true; var p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); }, {passive:false});
canvas.addEventListener('touchmove', e => { e.preventDefault(); if (!drawing) return; var p = getPos(e); ctx.strokeStyle = currentColor; ctx.lineWidth = currentSize; ctx.lineTo(p.x, p.y); ctx.stroke(); }, {passive:false});
canvas.addEventListener('touchend', () => drawing = false);

function newRound() {
  round++;
  guessed = false;
  timeLeft = 60;
  currentWord = WORDS[Math.floor(Math.random() * WORDS.length)];
  document.getElementById('round').textContent = round;
  document.getElementById('wordDisplay').textContent = '画这个: ' + currentWord;
  document.getElementById('aiGuess').textContent = '等待你开始画...';
  document.getElementById('aiGuess').className = 'guess-text';
  document.getElementById('overlay').style.display = 'none';
  clearCanvas();

  clearInterval(timer);
  document.getElementById('timerFill').style.width = '100%';
  document.getElementById('timerFill').className = 'fill';
  timer = setInterval(() => {
    timeLeft--;
    var pct = (timeLeft / 60) * 100;
    var fill = document.getElementById('timerFill');
    fill.style.width = pct + '%';
    fill.className = 'fill' + (pct < 20 ? ' danger' : pct < 40 ? ' warning' : '');
    if (timeLeft <= 0) { clearInterval(timer); if (!guessed) { skipRound(); } }
  }, 1000);
}

async function askAI() {
  if (guessed) return;
  var guessEl = document.getElementById('aiGuess');
  guessEl.innerHTML = '<span class="loading"><span class="spinner"></span>AI 正在看图...</span>';

  try {
    var base64 = canvas.toDataURL('image/png').split(',')[1];
    var res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'agnes-2.0-flash',
        messages: [
          { role: 'system', content: 'You are looking at a simple drawing/sketch. Guess what it depicts in ONE or TWO Chinese words only. Just output the guess, nothing else.' },
          { role: 'user', content: [
            { type: 'text', text: 'What is this drawing of?' },
            { type: 'image_url', image_url: { url: 'data:image/png;base64,' + base64 } }
          ]}
        ],
        temperature: 0.3,
        max_tokens: 20
      })
    });

    var data = await res.json();
    var guess = (data?.choices?.[0]?.message?.content || '').trim().replace(/[。！？.\s]/g, '');

    guessEl.textContent = 'AI 猜: ' + guess;

    // Check if correct
    var wordLower = currentWord.toLowerCase();
    var guessLower = guess.toLowerCase();
    if (guessLower.includes(wordLower) || wordLower.includes(guessLower) || guessLower === wordLower) {
      guessed = true;
      clearInterval(timer);
      var points = Math.max(10, timeLeft + 20);
      score += points;
      document.getElementById('score').textContent = score;
      guessEl.className = 'guess-text correct';
      guessEl.textContent = 'AI 猜对了! ' + guess + ' (+' + points + ' 分)';
      setTimeout(() => {
        document.getElementById('winTitle').textContent = 'AI 猜对了!';
        document.getElementById('winMsg').textContent = `答案: ${currentWord} | 得分: +${points}`;
        document.getElementById('overlay').style.display = 'flex';
      }, 800);
    } else {
      guessEl.className = 'guess-text wrong';
      guessEl.textContent = 'AI 猜: ' + guess + ' (不对，继续画)';
    }
  } catch (e) {
    guessEl.textContent = 'AI 识别失败: ' + e.message;
    guessEl.className = 'guess-text wrong';
  }
}

function skipRound() {
  if (guessed) return;
  guessed = true;
  clearInterval(timer);
  document.getElementById('aiGuess').textContent = '答案: ' + currentWord;
  document.getElementById('aiGuess').className = 'guess-text';
}

function closeOverlay() { document.getElementById('overlay').style.display = 'none'; }

newRound();