var AI_ENDPOINT = 'https://ai.233002.xyz';
var currentAnswer = '', currentExplanation = '', score = 0, streak = 0, round = 0, difficulty = 'easy', answered = false;

function setDiff(d) {
  difficulty = d;
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.diff-btn[onclick="setDiff('${d}')"]`).classList.add('active');
}

async function newRiddle() {
  round++;
  answered = false;
  document.getElementById('round').textContent = round;
  document.getElementById('riddleNum').textContent = '第 ' + round + ' 题 - 加载中...';
  document.getElementById('riddleText').textContent = 'AI 正在想谜语...';
  document.getElementById('resultMsg').textContent = '';
  document.getElementById('resultMsg').className = 'result-msg';
  document.getElementById('answerReveal').style.display = 'none';
  document.getElementById('guessInput').value = '';
  document.getElementById('overlay').style.display = 'none';

  var diffDesc = difficulty === 'easy' ? '简单常见' : difficulty === 'medium' ? '中等难度' : '困难冷门';

  try {
    var res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'agnes-2.0-flash',
        messages: [
          { role: 'system', content: `你是一个谜语出题者。生成一个${diffDesc}的中文谜语。回复格式严格为JSON: {"riddle": "谜面", "answer": "谜底(2-4个字)", "explain": "解释(一句话)"}` },
          { role: 'user', content: '出一个谜语' }
        ],
        temperature: 1.0,
        max_tokens: 150
      })
    });

    var data = await res.json();
    var content = data?.choices?.[0]?.message?.content || '';

    var result;
    try {
      var jsonMatch = content.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      result = { riddle: content, answer: '未知', explain: '' };
    }

    currentAnswer = result.answer || '未知';
    currentExplanation = result.explain || '';

    document.getElementById('riddleNum').textContent = '第 ' + round + ' 题';
    document.getElementById('riddleText').textContent = result.riddle || '谜语加载失败';
  } catch (e) {
    document.getElementById('riddleText').textContent = '加载失败，请重试';
  }
}

function checkAnswer() {
  if (answered) return;
  var input = document.getElementById('guessInput');
  var guess = input.value.trim();
  if (!guess) return;

  var resultMsg = document.getElementById('resultMsg');
  var answerReveal = document.getElementById('answerReveal');

  var isCorrect = guess === currentAnswer ||
    guess.includes(currentAnswer) ||
    currentAnswer.includes(guess) ||
    levenshtein(guess, currentAnswer) <= 1;

  if (isCorrect) {
    answered = true;
    var diffBonus = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
    var points = diffBonus + streak * 5;
    score += points;
    streak++;
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;
    resultMsg.textContent = '答对了! +' + points + ' 分';
    resultMsg.className = 'result-msg correct';
    answerReveal.style.display = 'block';
    document.getElementById('answerText').textContent = '答案: ' + currentAnswer;
    document.getElementById('answerExplain').textContent = currentExplanation;
    input.value = '';
  } else {
    resultMsg.textContent = '不对哦，再想想';
    resultMsg.className = 'result-msg wrong';
  }
}

function levenshtein(a, b) {
  var m = a.length, n = b.length;
  var dp = Array.from({length: m+1}, () => Array(n+1).fill(0));
  for (var i = 0; i <= m; i++) dp[i][0] = i;
  for (var j = 0; j <= n; j++) dp[0][j] = j;
  for (var i = 1; i <= m; i++) for (var j = 1; j <= n; j++) {
    dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1;
  }
  return dp[m][n];
}

async function showHint() {
  if (answered || !currentAnswer) return;
  try {
    var res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'agnes-2.0-flash',
        messages: [
          { role: 'system', content: '给一个关于谜底的简短提示，不要直接说出答案。用中文，不超过15字。' },
          { role: 'user', content: `谜底是"${currentAnswer}"，给一个提示` }
        ],
        temperature: 0.8,
        max_tokens: 30
      })
    });
    var data = await res.json();
    var hint = data?.choices?.[0]?.message?.content || '无法获取提示';
    document.getElementById('resultMsg').textContent = '提示: ' + hint;
    document.getElementById('resultMsg').className = 'result-msg';
  } catch {
    document.getElementById('resultMsg').textContent = '获取提示失败';
  }
}

function revealAnswer() {
  if (!currentAnswer) return;
  answered = true;
  streak = 0;
  document.getElementById('streak').textContent = 0;
  document.getElementById('resultMsg').textContent = '答案揭晓';
  document.getElementById('resultMsg').className = 'result-msg';
  document.getElementById('answerReveal').style.display = 'block';
  document.getElementById('answerText').textContent = '答案: ' + currentAnswer;
  document.getElementById('answerExplain').textContent = currentExplanation;
}

function closeOverlay() { document.getElementById('overlay').style.display = 'none'; }

newRiddle();