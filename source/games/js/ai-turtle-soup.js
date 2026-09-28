
const SYSTEM_PROMPT = '你是一个海龟汤游戏主持人。给出一个谜面，隐藏汤底。玩家会问是非题，你只能回答：是、不是、不相关、接近了。当玩家猜到关键信息时给予肯定。谜题要有趣、有反转。用中文。';

let conversationHistory = [];
let questionCount = 0;
let gameActive = false;

function toggleTheme() {
  document.body.classList.toggle('light');
  localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
}
if (localStorage.getItem('theme') === 'light') document.body.classList.add('light');

function addMsg(text, type) {
  const box = document.getElementById('chatBox');
  const div = document.createElement('div');
  div.className = `msg ${type}`;
  div.innerHTML = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  return div;
}

async function startGame() {
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('gameArea').classList.remove('hidden');
  document.getElementById('newGameBtn').classList.add('hidden');
  document.getElementById('chatBox').innerHTML = '';
  document.getElementById('questionInput').value = '';
  document.getElementById('questionInput').disabled = false;
  document.getElementById('askBtn').disabled = false;
  questionCount = 0;
  gameActive = true;
  conversationHistory = [];
  updateStats();

  const loader = addMsg('AI正在构思谜题<span class="loading"></span>', 'system');
  try {
    const puzzle = await askAI('请给出一个海龟汤谜题的谜面（情境描述），不要给出汤底（答案）。谜面要简短有趣，有反转。直接给出谜面即可。', SYSTEM_PROMPT, {temperature: 1.2, max_tokens: 300});
    conversationHistory.push({role: 'user', content: '请给出一个海龟汤谜题'});
    conversationHistory.push({role: 'assistant', content: puzzle});
    loader.remove();
    addMsg(puzzle, 'ai');
  } catch(e) {
    loader.innerHTML = '❌ 生成失败，请重试';
  }
}

async function askQuestion() {
  const input = document.getElementById('questionInput');
  const q = input.value.trim();
  if (!q || !gameActive) return;
  input.value = '';
  questionCount++;
  updateStats();
  addMsg(q, 'user');
  conversationHistory.push({role: 'user', content: q});

  const loader = addMsg('思考中<span class="loading"></span>', 'system');
  document.getElementById('askBtn').disabled = true;
  try {
    const ctx = conversationHistory.map(m => `${m.role === 'user' ? '玩家' : '主持人'}: ${m.content}`).join('\n');
    const prompt = `之前的对话:\n${ctx}\n\n玩家问: "${q}"\n\n请根据谜题情境回答。只能回答以下之一：是、不是、不相关、接近了。如果回答"是"或"接近了"且涉及关键真相，可以稍微多给一点提示。回答要简洁。`;
    const answer = await askAI(prompt, SYSTEM_PROMPT, {temperature: 0.7, max_tokens: 100});
    conversationHistory.push({role: 'assistant', content: answer});
    loader.remove();
    addMsg(answer, 'ai');
  } catch(e) {
    loader.innerHTML = '❌ 出错了，请重试';
    questionCount--;
    updateStats();
  }
  document.getElementById('askBtn').disabled = false;
}

async function revealAnswer() {
  if (!gameActive) return;
  gameActive = false;
  document.getElementById('questionInput').disabled = true;
  document.getElementById('askBtn').disabled = true;

  const loader = addMsg('揭晓答案中<span class="loading"></span>', 'system');
  try {
    const ctx = conversationHistory.map(m => `${m.role === 'user' ? '玩家' : '主持人'}: ${m.content}`).join('\n');
    const prompt = `之前的对话:\n${ctx}\n\n现在揭晓汤底（答案）。请给出完整的汤底，并简要解释这个谜题的逻辑。回答要有趣。`;
    const answer = await askAI(prompt, SYSTEM_PROMPT, {temperature: 0.9, max_tokens: 500});
    loader.remove();
    addMsg(`🍲 <b>汤底揭晓</b><br><br>${answer}`, 'ai');
    document.getElementById('newGameBtn').classList.remove('hidden');
  } catch(e) {
    loader.innerHTML = '❌ 出错了，请点击"再来一局"';
    document.getElementById('newGameBtn').classList.remove('hidden');
  }
}

function updateStats() {
  document.getElementById('stats').textContent = `提问次数：${questionCount}`;
}
