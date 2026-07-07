var AI_ENDPOINT = 'https://ai.233002.xyz';
var secretPrompt = '', imageUrl = '', score = 0, round = 0, streak = 0, attempts = 0, guessed = false;

var CATEGORIES = [
  { cat: '动物', prompts: ['A majestic lion resting on a rock in the savanna, golden hour light', 'A cute red panda sitting on a tree branch, bamboo forest background', 'A group of penguins walking on ice, arctic landscape, clear sky', 'A colorful parrot flying through a tropical rainforest', 'A sleeping cat curled up on a windowsill, rainy day outside', 'A dolphin jumping out of the ocean at sunset', 'An owl with big eyes sitting on a branch at night, moonlight', 'A butterfly landing on a colorful flower, macro photography'] },
  { cat: '风景', prompts: ['A serene mountain lake reflecting snow-capped peaks, sunrise', 'A lavender field stretching to the horizon, purple sunset', 'A waterfall hidden in a dense tropical jungle, misty atmosphere', 'A sandy beach with crystal clear turquoise water, palm trees', 'A misty forest path with sunlight filtering through trees', 'A desert with sand dunes under a starry night sky', 'A cherry blossom tree in full bloom, Japanese garden', 'A coastal cliff with crashing waves, dramatic clouds'] },
  { cat: '城市', prompts: ['A futuristic city at night with neon lights and flying cars', 'A cozy European street cafe with outdoor seating, autumn leaves', 'A busy Asian street market with colorful lanterns at dusk', 'A modern skyscraper reflecting sunset clouds, city skyline', 'A quiet cobblestone alley with old brick buildings, morning fog', 'A rooftop garden overlooking a city, urban oasis concept'] },
  { cat: '食物', prompts: ['A delicious pizza fresh from a wood-fired oven, melted cheese', 'A colorful fruit smoothie bowl topped with berries and granola', 'A steaming cup of latte with beautiful foam art, cafe setting', 'A plate of sushi arranged artistically, Japanese restaurant', 'A chocolate cake with rich ganache, professional food photography', 'Fresh bread loaves cooling on a rustic wooden rack, bakery'] },
  { cat: '奇幻', prompts: ['A dragon flying over a medieval castle, dramatic sunset sky', 'A magical forest with glowing mushrooms and fairy lights', 'A wizard casting a spell with glowing runes, dark tower background', 'An underwater city with bioluminescent buildings, deep ocean', 'A floating island with waterfalls cascading into clouds', 'A robot sitting in a garden of mechanical flowers, steampunk'] },
];

function getRandomPrompt() {
  var cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  return cat.prompts[Math.floor(Math.random() * cat.prompts.length)];
}

function addHint(msg, type) {
  var el = document.getElementById('hintArea');
  var div = document.createElement('div');
  div.className = 'msg ' + type;
  div.textContent = msg;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

async function newRound() {
  round++;
  attempts = 0;
  guessed = false;
  secretPrompt = getRandomPrompt();
  document.getElementById('round').textContent = round;
  document.getElementById('hintArea').innerHTML = '';
  document.getElementById('guessInput').value = '';
  document.getElementById('guessInput').disabled = false;
  document.getElementById('overlay').style.display = 'none';

  // Show loading
  document.getElementById('imageArea').innerHTML = '<div class="loading"><div class="spinner"></div><p>AI 正在生成图片...</p></div>';
  addHint('新的一轮开始！AI 正在画图...', 'system');

  try {
    var res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'agnes-image-2.1-flash',
        endpoint: 'images/generations',
        prompt: secretPrompt,
        size: '1024x768',
        extra_body: { response_format: 'url' }
      })
    });

    if (!res.ok) throw new Error('API error');
    var data = await res.json();
    imageUrl = data?.data?.[0]?.url;

    if (imageUrl) {
      document.getElementById('imageArea').innerHTML = `<img src="${imageUrl}" alt="AI Generated">`;
      addHint('图片已生成！猜猜它的描述词是什么？', 'system');
    } else {
      throw new Error('No image URL');
    }
  } catch (e) {
    document.getElementById('imageArea').innerHTML = '<div class="placeholder" style="color:#ef4444">图片生成失败，请重试</div>';
    addHint('生成失败: ' + e.message, 'wrong');
  }
}

async function makeGuess() {
  if (guessed) return;
  var input = document.getElementById('guessInput');
  var guess = input.value.trim();
  if (!guess) return;

  attempts++;
  addHint('你的猜测: ' + guess, 'system');

  // Use AI to evaluate the guess
  try {
    var res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'agnes-2.0-flash',
        messages: [
          { role: 'system', content: 'You are an image description evaluator. Compare the user\'s guess with the actual description. Reply with ONLY a JSON object: {"match": true/false, "similarity": 0-100, "feedback": "brief comment in Chinese"}. Be generous - if the main subject matches, consider it correct.' },
          { role: 'user', content: `Actual description: "${secretPrompt}"\nUser guess: "${guess}"` }
        ],
        temperature: 0.3,
        max_tokens: 100
      })
    });

    var data = await res.json();
    var content = data?.choices?.[0]?.message?.content || '';

    // Parse response
    var result;
    try {
      var jsonMatch = content.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      result = { match: content.includes('true'), similarity: 50, feedback: content };
    }

    if (result.match || result.similarity >= 80) {
      guessed = true;
      var points = Math.max(10, 100 - attempts * 15);
      score += points;
      streak++;
      document.getElementById('score').textContent = score;
      document.getElementById('streak').textContent = streak;
      addHint('猜对了! +' + points + ' 分', 'correct');
      input.disabled = true;

      // Show win overlay
      setTimeout(() => {
        document.getElementById('winTitle').textContent = '猜对了!';
        document.getElementById('winMsg').textContent = `答案: ${secretPrompt}\n得分: +${points} | 连胜: ${streak}`;
        document.getElementById('overlay').style.display = 'flex';
      }, 800);
    } else {
      addHint(result.feedback || '不太对，再试试', 'wrong');
      if (attempts >= 3) addHint('提示: 试试描述图片中的主要物体', 'ai');
      if (attempts >= 5) addHint('提示: ' + secretPrompt.split(' ').slice(0, 3).join(' ') + '...', 'ai');
    }
  } catch (e) {
    // Fallback: simple keyword matching
    var guessWords = guess.toLowerCase().split(/\s+/);
    var promptWords = secretPrompt.toLowerCase().split(/\s+/);
    var matches = guessWords.filter(w => promptWords.some(p => p.includes(w) || w.includes(p)));
    var similarity = matches.length / Math.max(guessWords.length, 1) * 100;

    if (similarity >= 60) {
      guessed = true;
      var points = Math.max(10, 100 - attempts * 15);
      score += points;
      streak++;
      document.getElementById('score').textContent = score;
      document.getElementById('streak').textContent = streak;
      addHint('猜对了! +' + points + ' 分', 'correct');
      input.disabled = true;
    } else {
      addHint('不太对，再试试', 'wrong');
    }
  }

  input.value = '';
}

async function getAIHint() {
  if (guessed || !secretPrompt) return;
  addHint('正在获取提示...', 'system');

  try {
    var res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'agnes-2.0-flash',
        messages: [
          { role: 'system', content: 'Give a vague one-sentence hint about the image description without revealing it directly. Use Chinese. Be brief.' },
          { role: 'user', content: `The description is: "${secretPrompt}". Give a hint.` }
        ],
        temperature: 0.8,
        max_tokens: 60
      })
    });
    var data = await res.json();
    var hint = data?.choices?.[0]?.message?.content || '无法获取提示';
    addHint('AI 提示: ' + hint, 'ai');
  } catch {
    addHint('获取提示失败', 'wrong');
  }
}

function skipRound() {
  if (!secretPrompt) return;
  guessed = true;
  streak = 0;
  document.getElementById('streak').textContent = 0;
  document.getElementById('guessInput').disabled = true;
  addHint('答案: ' + secretPrompt, 'system');
}

function closeOverlay() { document.getElementById('overlay').style.display = 'none'; }

newRound();