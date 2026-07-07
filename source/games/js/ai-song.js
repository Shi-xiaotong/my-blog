var SYSTEM_PROMPT = '你是一个猜歌名游戏主持人。描述一首歌但不说歌名。玩家猜对说"恭喜猜对！"，猜错给提示。描述要有趣，包含歌词片段、歌手信息、年代等线索。用中文。';

var attempts = 0;
var maxAttempts = 5;
var difficulty = '中等';
var hintCount = 0;
var songContext = '';
var gameActive = false;

`;
  attempts = 0;
  hintCount = 0;
  gameActive = true;
  updateAttemptStat();

  try {
    var diffGuide = {'简单': '选择一首非常著名的华语流行歌曲，给很明显的线索', '中等': '选择一首有一定知名度的歌曲，给中等难度的线索', '困难': '选择一首比较小众或冷门的歌曲，给较隐晦的线索'}[diff];
    var clue = await askAI(`请描述一首歌。${diffGuide}。描述中包含：歌词片段（不直接引用歌名）、歌手特征、发行年代、风格等线索。不要说出歌名。直接给出描述。`, SYSTEM_PROMPT, {temperature: 1.1, max_tokens: 300});
    songContext = clue;
    document.getElementById('clueCard').innerHTML = `💡 <b>线索：</b><br><br>${clue}`;
  } catch(e) {
    document.getElementById('clueCard').innerHTML = '❌ 生成失败，请刷新重试';
  }
}

async function makeGuess() {
  var input = document.getElementById('guessInput');
  var guess = input.value.trim();
  if (!guess || !gameActive) return;
  input.value = '';
  attempts++;
  updateAttemptStat();

  var loader = document.createElement('div');
  loader.className = 'history-item';
  loader.innerHTML = `${guess} <span>判断中<span class="loading"></span></span>`;
  document.getElementById('history').appendChild(loader);

  document.getElementById('guessBtn').disabled = true;
  try {
    var prompt = `歌曲线索：${songContext}\n\n玩家猜的歌名是："${guess}"\n\n请判断是否正确。如果正确回答"正确"开头。如果很接近（如歌手对但歌名错，或歌名部分正确）回答"接近"开头。如果错误回答"错误"开头并给一个小提示。`;
    var result = await askAI(prompt, SYSTEM_PROMPT, {temperature: 0.5, max_tokens: 150});

    if (result.startsWith('正确') || result.includes('恭喜')) {
      loader.className = 'history-item correct';
      loader.innerHTML = `${guess} <span>✅ 正确！</span>`;
      gameActive = false;
      showResult(true, result);
    } else if (result.startsWith('接近') || result.includes('接近')) {
      loader.className = 'history-item close';
      loader.innerHTML = `${guess} <span>🟡 接近了！</span>`;
      addClue(result);
    } else {
      loader.className = 'history-item wrong';
      loader.innerHTML = `${guess} <span>❌ 不对</span>`;
      addClue(result);
    }

    if (attempts >= maxAttempts && gameActive) {
      gameActive = false;
      giveUp();
    }
  } catch(e) {
    loader.innerHTML = `${guess} <span>⚠️ 判断失败</span>`;
    attempts--;
    updateAttemptStat();
  }
  document.getElementById('guessBtn').disabled = false;
}

function addClue(text) {
  var card = document.getElementById('clueCard');
  card.innerHTML += `<br><br>💬 ${text}`;
}

async function getHint() {
  if (!gameActive) return;
  hintCount++;
  try {
    var hint = await askAI(`歌曲线索：${songContext}\n\n请再给一个提示帮助玩家猜出歌名。不要直接说出歌名。提示要和之前的线索不重复。`, SYSTEM_PROMPT, {temperature: 0.9, max_tokens: 100});
    addClue(`🔍 提示${hintCount}：${hint}`);
  } catch(e) { }
}

async function giveUp() {
  if (!gameActive && attempts < maxAttempts) return;
  gameActive = false;
  document.getElementById('guessInput').disabled = true;
  document.getElementById('guessBtn').disabled = true;

  try {
    var answer = await askAI(`歌曲线索：${songContext}\n\n玩家放弃了，请直接说出歌名和歌手，一句话介绍这首歌。`, SYSTEM_PROMPT, {temperature: 0.5, max_tokens: 100});
    showResult(false, answer);
  } catch(e) {
    showResult(false, '无法获取答案');
  }
}

function showResult(win, text) {
  var area = document.getElementById('resultArea');
  area.classList.remove('hidden');
  area.className = `result ${win ? 'win' : 'lose'}`;
  area.innerHTML = win ? `🎉 ${text}` : `🏳️ 答案揭晓：${text}`;
  document.getElementById('guessArea').classList.add('hidden');
  document.getElementById('newGameBtn').classList.remove('hidden');
}

function updateAttemptStat() {
  document.getElementById('attemptStat').textContent = `猜测次数：${attempts}/${maxAttempts}`;
}