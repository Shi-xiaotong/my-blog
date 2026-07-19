var AI_ENDPOINT = 'https://ai.233002.xyz';
var genre = 'fantasy', score = 0, round = 0, storySegments = [], storyEnded = false;

var GENRES = {
  fantasy: '奇幻冒险', scifi: '科幻未来', mystery: '悬疑推理',
  romance: '浪漫爱情', horror: '恐怖惊悚', wuxia: '武侠江湖'
};

function setGenre(g) {
  genre = g;
  document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.genre-btn[onclick="setGenre('${g}')"]`).classList.add('active');
}

function addSegment(author, text, scoreVal) {
  var el = document.getElementById('storyArea');
  var div = document.createElement('div');
  div.className = 'story-segment ' + (author === 'AI' ? 'ai' : 'user');
  var scoreHtml = '';
  if (scoreVal !== undefined && scoreVal !== null) {
    var cls = scoreVal >= 8 ? 'high' : scoreVal >= 5 ? 'mid' : 'low';
    var scoreSpan = document.createElement('span');
    scoreSpan.className = 'score-badge ' + cls;
    scoreSpan.textContent = scoreVal + '/10';
    scoreHtml = scoreSpan.outerHTML;
  }
  var authorDiv = document.createElement('div');
  authorDiv.className = 'author';
  var authorSpan = document.createElement('span');
  authorSpan.textContent = author;
  authorDiv.appendChild(authorSpan);
  if (scoreHtml) {
    var scoreBadge = document.createElement('span');
    scoreBadge.className = 'score-badge ' + cls;
    scoreBadge.textContent = scoreVal + '/10';
    authorDiv.appendChild(scoreBadge);
  }
  var textDiv = document.createElement('div');
  textDiv.textContent = text;
  div.appendChild(authorDiv);
  div.appendChild(textDiv);
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
  storySegments.push({ author, text });
}

async function newStory() {
  round = 0;
  storySegments = [];
  storyEnded = false;
  document.getElementById('storyArea').innerHTML = '';
  document.getElementById('storyInput').value = '';
  document.getElementById('overlay').style.display = 'none';

  addSegment('系统', `题材: ${GENRES[genre]} | AI 正在构思开头...`);

  try {
    var res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'agnes-2.0-flash',
        messages: [
          { role: 'system', content: `你是一个创意写作AI。写一个${GENRES[genre]}故事的开头，2-3句话，设置悬念，让玩家能接着写。只输出故事内容，不要其他说明。` },
          { role: 'user', content: '开始一个故事' }
        ],
        temperature: 1.0,
        max_tokens: 200
      })
    });

    var data = await res.json();
    var opening = data?.choices?.[0]?.message?.content || '从前有座山...';
    // Remove the system message
    document.getElementById('storyArea').innerHTML = '';
    storySegments = [];
    addSegment('AI', opening);
  } catch {
    document.getElementById('storyArea').innerHTML = '';
    storySegments = [];
    addSegment('AI', '从前有座山，山里有座庙，庙里有个老和尚在讲故事...');
  }
}

async function submitSegment() {
  if (storyEnded) return;
  var input = document.getElementById('storyInput');
  var text = input.value.trim();
  if (!text) return;
  input.value = '';
  round++;

  addSegment('你', text);

  // AI evaluates and continues
  var storyContext = storySegments.map(s => `${s.author}: ${s.text}`).join('\n');

  try {
    var res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'agnes-2.0-flash',
        messages: [
          { role: 'system', content: `你是故事接龙的AI伙伴。玩家续写了故事，你需要：
1. 给玩家的续写打分(1-10)，考虑创意、连贯性、文采
2. 然后续写2-3句话推进故事
回复格式严格为JSON: {"score": 数字, "comment": "一句话点评", "continuation": "你的续写"}` },
          { role: 'user', content: `故事背景: ${GENRES[genre]}\n\n${storyContext}\n\n请评价最后一段并继续。` }
        ],
        temperature: 0.9,
        max_tokens: 300
      })
    });

    var data = await res.json();
    var content = data?.choices?.[0]?.message?.content || '';

    var result;
    try {
      var jsonMatch = content.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      result = { score: 5, comment: '', continuation: content };
    }

    var s = parseInt(result.score) || 5;
    score += s;
    document.getElementById('score').textContent = score;
    document.getElementById('round').textContent = round;

    addSegment('AI', result.continuation || '...', s);
    if (result.comment) addSegment('系统', result.comment);
  } catch {
    addSegment('AI', '(AI 暂时无法回应)');
  }
}

async function aiContinue() {
  if (storyEnded) return;
  var storyContext = storySegments.map(s => `${s.author}: ${s.text}`).join('\n');

  try {
    var res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'agnes-2.0-flash',
        messages: [
          { role: 'system', content: `你是故事接龙的AI。继续推进故事，写2-3句话。保持风格一致，制造悬念或转折。只输出故事内容。` },
          { role: 'user', content: `题材: ${GENRES[genre]}\n\n${storyContext}\n\n继续写。` }
        ],
        temperature: 1.0,
        max_tokens: 200
      })
    });

    var data = await res.json();
    var continuation = data?.choices?.[0]?.message?.content || '...';
    addSegment('AI', continuation);
  } catch {
    addSegment('AI', '(AI 暂时无法回应)');
  }
}

function endStory() {
  if (!storySegments.length) return;
  storyEnded = true;
  var fullText = storySegments.filter(s => s.author !== '系统').map(s => `[${s.author}] ${s.text}`).join('\n\n');
  document.getElementById('winTitle').textContent = '故事完结';
  document.getElementById('winMsg').textContent = `总回合: ${round} | 总得分: ${score}`;
  document.getElementById('fullStory').textContent = fullText;
  document.getElementById('overlay').style.display = 'flex';
}

function closeOverlay() { document.getElementById('overlay').style.display = 'none'; }

newStory();