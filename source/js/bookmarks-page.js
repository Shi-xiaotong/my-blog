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
      { name: 'Kimi', url: 'https://kimi.moonshot.cn', icon: 'https://kimi.moonshot.cn/favicon.ico' },
      { name: '\u6587\u5FC3\u4E00\u8A00', url: 'https://yiyan.baidu.com', icon: 'https://yiyan.baidu.com/favicon.ico' },
      { name: '\u8FE5\u98DE\u661F\u706B', url: 'https://xinghuo.xfyun.cn', icon: 'https://xinghuo.xfyun.cn/favicon.ico' },
      { name: 'Coze', url: 'https://www.coze.com', icon: 'https://www.coze.com/favicon.ico' },
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
      { name: 'GitLab', url: 'https://gitlab.com', icon: 'https://gitlab.com/favicon.ico' },
      { name: 'Gitee', url: 'https://gitee.com', icon: 'https://gitee.com/favicon.ico' },
      { name: 'CodePen', url: 'https://codepen.io', icon: 'https://codepen.io/favicon.ico' },
      { name: 'Replit', url: 'https://replit.com', icon: 'https://replit.com/favicon.ico' },
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
      { name: '\u4EBA\u6C11\u65E5\u62A5', url: 'https://www.people.com.cn', icon: 'https://www.people.com.cn/favicon.ico' },
      { name: '\u65B0\u6D6A\u65B0\u95FB', url: 'https://news.sina.com.cn', icon: 'https://news.sina.com.cn/favicon.ico' },
      { name: 'Hacker News', url: 'https://news.ycombinator.com', icon: 'https://news.ycombinator.com/favicon.ico' },
      { name: 'TechCrunch', url: 'https://techcrunch.com', icon: 'https://techcrunch.com/favicon.ico' },
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
      { name: 'AWS', url: 'https://aws.amazon.com', icon: 'https://aws.amazon.com/favicon.ico' },
      { name: 'Google Cloud', url: 'https://cloud.google.com', icon: 'https://cloud.google.com/favicon.ico' },
      { name: 'Azure', url: 'https://portal.azure.com', icon: 'https://portal.azure.com/favicon.ico' },
      { name: '\u534E\u4E3A\u4E91', url: 'https://www.huaweicloud.com', icon: 'https://www.huaweicloud.com/favicon.ico' },
    ]
  },
  {
    id: 'social',
    icon: '\uD83D\uDCAC',
    name: '\u793E\u4EA4\u5A92\u4F53',
    sites: [
      { name: '\u5FAE\u535A', url: 'https://weibo.com', icon: 'https://weibo.com/favicon.ico' },
      { name: '\u5C0F\u7EA2\u4E66', url: 'https://www.xiaohongshu.com', icon: 'https://www.xiaohongshu.com/favicon.ico' },
      { name: '\u6296\u97F3', url: 'https://www.douyin.com', icon: 'https://www.douyin.com/favicon.ico' },
      { name: '\u5FAE\u4FE1\u516C\u4F17\u5E73\u53F0', url: 'https://mp.weixin.qq.com', icon: 'https://mp.weixin.qq.com/favicon.ico' },
      { name: 'X (Twitter)', url: 'https://x.com', icon: 'https://x.com/favicon.ico' },
      { name: 'Telegram', url: 'https://web.telegram.org', icon: 'https://telegram.org/favicon.ico' },
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
      { name: 'Wikipedia', url: 'https://www.wikipedia.org', icon: 'https://www.wikipedia.org/favicon.ico' },
      { name: 'DeepL', url: 'https://www.deepl.com', icon: 'https://www.deepl.com/favicon.ico' },
      { name: '\u767E\u5EA6\u7F51\u76D8', url: 'https://pan.baidu.com', icon: 'https://pan.baidu.com/favicon.ico' },
      { name: '\u963F\u91CC\u4E91\u76D8', url: 'https://www.aliyundrive.com', icon: 'https://www.aliyundrive.com/favicon.ico' },
      { name: 'OneDrive', url: 'https://onedrive.live.com', icon: 'https://onedrive.live.com/favicon.ico' },
    ]
  }
];

function renderCategories(){
  var container = document.getElementById('categoriesContainer');
  container.innerHTML = '';

  CATEGORIES.forEach(function(cat){
    var section = document.createElement('div');
    section.className = 'category-section';
    section.dataset.category = cat.id;
    section.innerHTML = '<div class="category-header"><h2>' + cat.name + '</h2><span class="category-count">' + cat.sites.length + ' \u4E2A</span></div><div class="links-grid" id="grid-' + cat.id + '">' + cat.sites.map(function(s){
      return '<a href="' + s.url + '" class="link-card" target="_blank" rel="noopener noreferrer" title="' + s.name + '"><span class="name">' + s.name + '</span></a>';
    }).join('') + '</div>';
    container.appendChild(section);
  });
}

renderCategories();

document.addEventListener('pjax:complete', function(){
  renderCategories();
});
})();
