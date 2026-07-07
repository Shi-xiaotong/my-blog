var SYSTEM_PROMPT = '你是一个诗人。根据用户给的关键词写诗。风格由用户指定。写完后等用户评价。用中文。';

var currentKeywords = [];
var currentStyle = '古诗';
var currentPoem = '';
var roundCount = 0;

);
});

// Star rating
var selectedStars = 0;
document.querySelectorAll('.star-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedStars = parseInt(btn.dataset.star);
    document.querySelectorAll('.star-btn').forEach(b => {
      b.classList.toggle('on', parseInt(b.dataset.star) <= selectedStars);
    });
    giveFeedback(selectedStars);
  });
});

async function generatePoem() {
  var kw1 = document.getElementById('kw1').value.trim();
  var kw2 = document.getElementById('kw2').value.trim();
  var kw3 = document.getElementById('kw3').value.trim();
  if (!kw1 || !kw2 || !kw3) { alert('请输入3个关键词'); return; }

  currentKeywords = [kw1, kw2, kw3];
  roundCount++;
  document.getElementById('roundInfo').textContent = `第 ${roundCount} 首`;

  var genBtn = document.getElementById('genBtn');
  genBtn.disabled = true;
  genBtn.textContent = 'AI创作中...';

  document.getElementById('poemArea').classList.remove('hidden');
  document.getElementById('poemDisplay').innerHTML = '创作中<span class="loading"></span>';
  document.getElementById('feedbackArea').classList.add('hidden');
  selectedStars = 0;
  document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('on'));

  try {
    var prompt = `请用"${currentStyle}"的风格，包含以下三个关键词写一首诗：${kw1}、${kw2}、${kw3}。${currentStyle === '藏头诗' ? '请确保每行第一个字组成一个有意义的词语或句子。' : ''}${currentStyle === 'rap' ? '注意押韵和节奏感。' : ''}直接输出诗歌内容，不需要额外解释。`;
    var poem = await askAI(prompt, SYSTEM_PROMPT, {temperature: 1.0, max_tokens: 400});
    currentPoem = poem;
    document.getElementById('poemDisplay').innerHTML = `<div class="poem-title">《${kw1}·${kw2}·${kw3}》 — ${currentStyle}</div>${poem}`;
  } catch(e) {
    document.getElementById('poemDisplay').innerHTML = '❌ 生成失败，请重试';
  }

  genBtn.disabled = false;
  genBtn.textContent = '🖊️ 让AI写诗';
}

async function giveFeedback(stars) {
  var area = document.getElementById('feedbackArea');
  area.classList.remove('hidden');
  document.getElementById('feedback').innerHTML = 'AI点评中<span class="loading"></span>';

  try {
    var prompt = `你写了一首${currentStyle}诗，关键词是${currentKeywords.join('、')}。诗的内容：\n${currentPoem}\n\n用户给了${stars}星评价（满分5星）。请给出简短的评价和改进建议。如果分数低，虚心接受并提出如何改进。如果分数高，表示感谢。`;
    var feedback = await askAI(prompt, SYSTEM_PROMPT, {temperature: 0.8, max_tokens: 200});
    document.getElementById('feedback').innerHTML = `💬 <b>AI点评：</b><br><br>${feedback}`;
  } catch(e) {
    document.getElementById('feedback').innerHTML = '❌ 点评生成失败';
  }
}

function changeStyle() {
  var styles = ['古诗', '现代诗', '打油诗', '藏头诗', 'rap'];
  var idx = (styles.indexOf(currentStyle) + 1) % styles.length;
  currentStyle = styles[idx];
  document.querySelectorAll('.style-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.style === currentStyle);
  });
  if (currentKeywords.length === 3) generatePoem();
}