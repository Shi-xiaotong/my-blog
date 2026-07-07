var AI_ENDPOINT = 'https://ai.233002.xyz';
var secretWord = '', questionsLeft = 20, score = 0, gameOver = false;
var conversationHistory = [];

var WORDS = [
  '猫','狗','太阳','月亮','钢琴','冰箱','西瓜','蝴蝶','飞机','钻石',
  '眼镜','雨伞','狮子','火山','巧克力','显微镜','龙','圣诞树','美人鱼','机器人',
  '长城','金字塔','海绵','灯泡','蜘蛛','鲨鱼','冰淇淋','火箭','魔方','指南针',
];

function addMsg(role, content, extraClass) {
  var el = document.getElementById('chatArea');
  var div = document.createElement('div');
  div.className = 'msg ' + role;
  var avatar = role === 'ai' ? 'AI' : role === 'user' ? '?' : '';
  div.innerHTML = `<div class="avatar">${avatar}</div><div class="bubble ${extraClass || ''}">${content}</div>`;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

async function newGame() {
  gameOver = false;
  questionsLeft = 20;
  secretWord = WORDS[Math.floor(Math.random() * WORDS.length)];
  conversationHistory = [];
  document.getElementById('remaining').textContent = questionsLeft;
  document.getElementById('chatArea').innerHTML = '';
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('questionInput').value = '';

  addMsg('system', '新的一局开始！AI 心里想了一个词，你来问是非题猜出它。');
  addMsg('ai', '我已经想好了一个词，来问我吧！只能问是/否问题哦。');
}

function askFromInput() {
  var input = document.getElementById('questionInput');
  var q = input.value.trim();
  if (!q || gameOver) return;
  input.value = '';
  ask(q);
}

async function ask(question) {
  if (gameOver || questionsLeft <= 0) return;
  questionsLeft--;
  document.getElementById('remaining').textContent = questionsLeft;
  addMsg('user', question);

  try {
    var res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'agnes-2.0-flash',
        messages: [
          { role: 'system', content: `You are playing a 20 questions game. The secret word is "${secretWord}". Answer the user's yes/no questions truthfully with ONLY "是" or "否", followed by a very brief explanation (max 15 Chinese chars). Never reveal the word directly. If the user asks something that can't be answered yes/no, say "请问我是非题".` },
          { role: 'user', content: question }
        ],
        temperature: 0.3,
        max_tokens: 50
      })
    });

    var data = await res.json();
    var answer = data?.choices?.[0]?.message?.content || '无法回答';
    addMsg('ai', answer);

    // Check if user guessed the word
    if (question.includes(secretWord) || question.replace(/[?？！!。.]/g, '').trim() === '是' + secretWord) {
      // Don't auto-win on asking "is it X?" - only on explicit guess
    }
  } catch {
    addMsg('ai', '网络错误，请重试');
    questionsLeft++; // Don't count failed questions
    document.getElementById('remaining').textContent = questionsLeft;
  }
}

async function guessAnswer() {
  if (gameOver) return;
  var input = document.getElementById('questionInput');
  var guess = input.value.trim() || prompt('你的答案是？');
  if (!guess) return;
  input.value = '';

  addMsg('user', '我猜是: ' + guess);

  if (guess === secretWord || guess.includes(secretWord) || secretWord.includes(guess)) {
    gameOver = true;
    var points = questionsLeft * 5 + 20;
    score += points;
    document.getElementById('score').textContent = score;
    addMsg('ai', '猜对了！就是「' + secretWord + '」！', 'correct');
    setTimeout(() => {
      document.getElementById('winTitle').textContent = '恭喜猜对!';
      document.getElementById('winMsg').textContent = `答案: ${secretWord} | 剩余提问: ${questionsLeft} | 得分: +${points}`;
      document.getElementById('overlay').style.display = 'flex';
    }, 800);
  } else {
    addMsg('ai', '不对哦，继续猜！', 'wrong');
  }
}

function giveUp() {
  if (gameOver) return;
  gameOver = true;
  addMsg('ai', '答案是「' + secretWord + '」，下次加油！', 'wrong');
}

function closeOverlay() { document.getElementById('overlay').style.display = 'none'; }

newGame();