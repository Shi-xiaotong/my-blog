(function(){
var CATEGORIES = [
  {
    id: 'search',
    icon: '\uD83D\uDD0D',
    name: '\u641C\u7D22\u5F15\u64CE',
    sites: [
      { name: 'Google', url: 'https://www.google.com', icon: 'https://www.google.com/favicon.ico' },
      { name: 'Bing', url: 'https://www.bing.com', icon: 'https://www.bing.com/favicon.ico' },
      { name: 'Baidu', url: 'https://www.baidu.com', icon: 'https://www.baidu.com/favicon.ico' },
      { name: 'DuckDuckGo', url: 'https://duckduckgo.com', icon: 'https://duckduckgo.com/favicon.ico' },
    ]
  },
  {
    id: 'ai',
    icon: '\uD83E\uDD16',
    name: 'AI \u5DE5\u5177',
    sites: [
      { name: 'ChatGPT', url: 'https://chat.openai.com', icon: 'https://chat.openai.com/favicon.ico' },
      { name: 'Claude', url: 'https://claude.ai', icon: 'https://claude.ai/favicon.ico' },
      { name: 'Gemini', url: 'https://gemini.google.com', icon: 'https://gemini.google.com/favicon.ico' },
      { name: 'DeepSeek', url: 'https://chat.deepseek.com', icon: 'https://chat.deepseek.com/favicon.ico' },
      { name: '\u901A\u4E49\u5343\u95EE', url: 'https://tongyi.aliyun.com', icon: 'https://tongyi.aliyun.com/favicon.ico' },
      { name: '\u8C46\u5305', url: 'https://www.doubao.com', icon: 'https://www.doubao.com/favicon.ico' },
      { name: 'Hugging Face', url: 'https://huggingface.co', icon: 'https://huggingface.co/favicon.ico' },
      { name: 'Perplexity', url: 'https://www.perplexity.ai', icon: 'https://www.perplexity.ai/favicon.ico' },
    ]
  },
  {
    id: 'dev',
    icon: '\uD83D\uDCBB',
    name: '\u5F00\u53D1\u8005',
    sites: [
      { name: 'GitHub', url: 'https://github.com', icon: 'https://github.com/favicon.ico' },
      { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: 'https://stackoverflow.com/favicon.ico' },
      { name: 'npm', url: 'https://www.npmjs.com', icon: 'https://www.npmjs.com/favicon.ico' },
      { name: 'Docker Hub', url: 'https://hub.docker.com', icon: 'https://hub.docker.com/favicon.ico' },
      { name: 'MDN', url: 'https://developer.mozilla.org', icon: 'https://developer.mozilla.org/favicon.ico' },
      { name: '\u6398\u91D1', url: 'https://juejin.cn', icon: 'https://juejin.cn/favicon.ico' },
      { name: 'V2EX', url: 'https://www.v2ex.com', icon: 'https://www.v2ex.com/favicon.ico' },
      { name: 'Product Hunt', url: 'https://www.producthunt.com', icon: 'https://www.producthunt.com/favicon.ico' },
    ]
  },
  {
    id: 'design',
    icon: '\uD83C\uDFA8',
    name: '\u8BBE\u8BA1\u8D44\u6E90',
    sites: [
      { name: 'Figma', url: 'https://www.figma.com', icon: 'https://www.figma.com/favicon.ico' },
      { name: 'Canva', url: 'https://www.canva.com', icon: 'https://www.canva.com/favicon.ico' },
      { name: 'Dribbble', url: 'https://dribbble.com', icon: 'https://dribbble.com/favicon.ico' },
      { name: 'Unsplash', url: 'https://unsplash.com', icon: 'https://unsplash.com/favicon.ico' },
      { name: 'IconFont', url: 'https://www.iconfont.cn', icon: 'https://www.iconfont.cn/favicon.ico' },
    ]
  },
  {
    id: 'learn',
    icon: '\uD83D\uDCDA',
    name: '\u5B66\u4E60\u5E73\u53F0',
    sites: [
      { name: 'B\u7AD9', url: 'https://www.bilibili.com', icon: 'https://www.bilibili.com/favicon.ico' },
      { name: '\u77E5\u4E4E', url: 'https://www.zhihu.com', icon: 'https://www.zhihu.com/favicon.ico' },
      { name: 'Coursera', url: 'https://www.coursera.org', icon: 'https://www.coursera.org/favicon.ico' },
      { name: 'Udemy', url: 'https://www.udemy.com', icon: 'https://www.udemy.com/favicon.ico' },
      { name: 'LeetCode', url: 'https://leetcode.cn', icon: 'https://leetcode.cn/favicon.ico' },
    ]
  },
  {
    id: 'media',
    icon: '\uD83C\uDFAC',
    name: '\u5A31\u4E50\u5F71\u97F3',
    sites: [
      { name: 'YouTube', url: 'https://www.youtube.com', icon: 'https://www.youtube.com/favicon.ico' },
      { name: 'Bilibili', url: 'https://www.bilibili.com', icon: 'https://www.bilibili.com/favicon.ico' },
      { name: 'Netflix', url: 'https://www.netflix.com', icon: 'https://www.netflix.com/favicon.ico' },
      { name: 'Spotify', url: 'https://open.spotify.com', icon: 'https://open.spotify.com/favicon.ico' },
      { name: '\u7F51\u6613\u4E91\u97F3\u4E50', url: 'https://music.163.com', icon: 'https://music.163.com/favicon.ico' },
    ]
  },
  {
    id: 'shopping',
    icon: '\uD83D\uDED2',
    name: '\u8D2D\u7269\u751F\u6D3B',
    sites: [
      { name: '\u6DD8\u5B9D', url: 'https://www.taobao.com', icon: 'https://www.taobao.com/favicon.ico' },
      { name: '\u4EAC\u4E1C', url: 'https://www.jd.com', icon: 'https://www.jd.com/favicon.ico' },
      { name: '\u62FC\u591A\u591A', url: 'https://www.pinduoduo.com', icon: 'https://www.pinduoduo.com/favicon.ico' },
      { name: '\u95F2\u9C7C', url: 'https://www.goofish.com', icon: 'https://www.goofish.com/favicon.ico' },
    ]
  },
  {
    id: 'news',
    icon: '\uD83D\uDCF0',
    name: '\u8D44\u8BAF\u9605\u8BFB',
    sites: [
      { name: '36\u6C2A', url: 'https://36kr.com', icon: 'https://36kr.com/favicon.ico' },
      { name: '\u864E\u55C5', url: 'https://www.huxiu.com', icon: 'https://www.huxiu.com/favicon.ico' },
      { name: '\u6F8E\u6E43\u65B0\u95FB', url: 'https://www.thepaper.cn', icon: 'https://www.thepaper.cn/favicon.ico' },
      { name: '\u5C11\u6570\u6D3E', url: 'https://sspai.com', icon: 'https://sspai.com/favicon.ico' },
    ]
  },
  {
    id: 'oss',
    icon: '\u2601\uFE0F',
    name: '\u4E91\u670D\u52A1 & \u8FD0\u7EF4',
    sites: [
      { name: 'Cloudflare', url: 'https://dash.cloudflare.com', icon: 'https://dash.cloudflare.com/favicon.ico' },
      { name: '\u963F\u91CC\u4E91', url: 'https://www.aliyun.com', icon: 'https://www.aliyun.com/favicon.ico' },
      { name: '\u817E\u8BAF\u4E91', url: 'https://cloud.tencent.com', icon: 'https://cloud.tencent.com/favicon.ico' },
      { name: 'Vercel', url: 'https://vercel.com', icon: 'https://vercel.com/favicon.ico' },
      { name: 'Netlify', url: 'https://app.netlify.com', icon: 'https://app.netlify.com/favicon.ico' },
    ]
  },
  {
    id: 'misc',
    icon: '\uD83D\uDD27',
    name: '\u5B9E\u7528\u5DE5\u5177',
    sites: [
      { name: 'Excalidraw', url: 'https://excalidraw.com', icon: 'https://excalidraw.com/favicon.ico' },
      { name: 'JSON.cn', url: 'https://www.json.cn', icon: 'https://www.json.cn/favicon.ico' },
      { name: 'Regex101', url: 'https://regex101.com', icon: 'https://regex101.com/favicon.ico' },
      { name: 'Carbon', url: 'https://carbon.now.sh', icon: 'https://carbon.now.sh/favicon.ico' },
      { name: 'ProcessOn', url: 'https://www.processon.com', icon: 'https://www.processon.com/favicon.ico' },
    ]
  }
];

function renderCategories(filterText, filterCategory){
  filterText = filterText || '';
  filterCategory = filterCategory || '';
  var container = document.getElementById('categoriesContainer');
  var filterSel = document.getElementById('categoryFilter');
  container.innerHTML = '';
  filterSel.innerHTML = '<option value="">\u5168\u90E8\u5206\u7C7B</option>';

  CATEGORIES.forEach(function(cat){
    filterSel.innerHTML += '<option value="' + cat.id + '">' + cat.icon + ' ' + cat.name + '</option>';

    var filtered = cat.sites.filter(function(s){
      var matchName = s.name.toLowerCase().includes(filterText.toLowerCase());
      var matchUrl = s.url.toLowerCase().includes(filterText.toLowerCase());
      var matchCat = !filterCategory || filterCategory === cat.id;
      return (matchName || matchUrl) && matchCat;
    });

    if (filterCategory && filterCategory !== cat.id) return;

    var section = document.createElement('div');
    section.className = 'category-section';
    section.dataset.category = cat.id;
    section.innerHTML = '<div class="category-header"><span class="category-icon">' + cat.icon + '</span><h2>' + cat.name + '</h2><span class="category-count">' + cat.sites.length + ' \u4E2A</span></div><div class="links-grid" id="grid-' + cat.id + '">' + filtered.map(function(s){
      return '<a href="' + s.url + '" class="link-card" target="_blank" rel="noopener noreferrer" title="' + s.name + '"><span class="favicon"><img src="' + s.icon + '" onerror="this.outerHTML=\'<i class=&quot;fas fa-globe&quot;></i>\'" alt=""></span><span class="name">' + s.name + '</span></a>';
    }).join('') + '</div>';

    if (filtered.length === 0) {
      var grid = section.querySelector('.links-grid');
      if (grid) grid.innerHTML = '<div class="empty-state">\u6CA1\u6709\u5339\u914D\u7684\u7F51\u7AD9</div>';
    }

    container.appendChild(section);
  });
}

function filterLinks(){
  var text = document.getElementById('searchInput').value;
  var cat = document.getElementById('categoryFilter').value;
  renderCategories(text, cat);
}

function getPrivateBookmarks(){
  try {
    return JSON.parse(localStorage.getItem('nav_private_bookmarks') || '[]');
  } catch(e) { return []; }
}

function savePrivateBookmarks(data){
  localStorage.setItem('nav_private_bookmarks', JSON.stringify(data));
}

function renderPrivateBookmarks(){
  var grid = document.getElementById('privateGrid');
  var bookmarks = getPrivateBookmarks();
  var editing = document.getElementById('privateSection').classList.contains('private-editing');

  if (bookmarks.length === 0) {
    grid.innerHTML = '<div class="empty-state">\u6682\u65E0\u79C1\u6709\u4E66\u7B7E\uFF0C\u70B9\u51FB\u300C\u2795 \u6DFB\u52A0\u300D\u5F00\u59CB\u6536\u85CF</div>';
    return;
  }

  grid.innerHTML = bookmarks.map(function(b, i){
    return '<a href="' + b.url + '" class="link-card" target="_blank" rel="noopener noreferrer" title="' + b.name + ' \u2014 ' + (b.tag || '') + '"><span class="favicon"><img src="https://www.google.com/s2/favicons?domain=' + encodeURIComponent(new URL(b.url).hostname) + '&sz=32" onerror="this.outerHTML=\'<i class=&quot;fas fa-link&quot;></i>\'" alt=""></span><span class="name">' + b.name + '</span>' + (editing ? '<button class="delete-btn" onclick="event.preventDefault();event.stopPropagation();deletePrivateBookmark(' + i + ')">\u2715</button>' : '') + '</a>';
  }).join('');
}

function togglePrivateEdit(){
  var s = document.getElementById('privateSection');
  var btn = document.getElementById('privateEditBtn');
  s.classList.toggle('private-editing');
  var editing = s.classList.contains('private-editing');
  btn.textContent = editing ? '\u2705 \u5B8C\u6210' : '\u270F\uFE0F \u7F16\u8F91';
  renderPrivateBookmarks();
}

function showAddForm(){
  document.getElementById('addForm').classList.add('visible');
}

function hideAddForm(){
  document.getElementById('addForm').classList.remove('visible');
  document.getElementById('newName').value = '';
  document.getElementById('newUrl').value = '';
  document.getElementById('newTag').value = '';
}

function addPrivateBookmark(){
  var name = document.getElementById('newName').value.trim();
  var url = document.getElementById('newUrl').value.trim();
  var tag = document.getElementById('newTag').value.trim();
  if (!name || !url) { showToast('\u8BF7\u586B\u5199\u540D\u79F0\u548C\u7F51\u5740', 'error'); return; }
  try { new URL(url); } catch(e) { showToast('\u8BF7\u8F93\u5165\u6709\u6548\u7F51\u5740', 'error'); return; }

  var bookmarks = getPrivateBookmarks();
  bookmarks.push({ name: name, url: url, tag: tag || '\u672A\u5206\u7C7B' });
  savePrivateBookmarks(bookmarks);
  hideAddForm();
  renderPrivateBookmarks();
  showToast('\u5DF2\u6DFB\u52A0\u300C' + name + '\u300D');
}

function deletePrivateBookmark(index){
  var bookmarks = getPrivateBookmarks();
  var name = bookmarks[index].name;
  bookmarks.splice(index, 1);
  savePrivateBookmarks(bookmarks);
  renderPrivateBookmarks();
  showToast('\u5DF2\u5220\u9664\u300C' + name + '\u300D');
}

function showToast(msg, type){
  type = type || '';
  var d = document.createElement('div');
  d.className = 'toast' + (type ? ' ' + type : '');
  d.textContent = msg;
  document.body.appendChild(d);
  setTimeout(function(){ d.remove(); }, 2000);
}

renderCategories();
document.getElementById('privateSection').classList.add('visible');
renderPrivateBookmarks();

document.addEventListener('pjax:complete', function(){
  renderCategories();
  renderPrivateBookmarks();
});
})();
