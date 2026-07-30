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
      { name: 'Perplexity', url: 'https://www.perplexity.ai', icon: 'https://www.perplexity.ai/favicon.ico' },
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
      { name: 'Kimi', url: 'https://kimi.moonshot.cn', icon: 'https://kimi.moonshot.cn/favicon.ico' },
      { name: '\u6587\u5FC3\u4E00\u8A00', url: 'https://yiyan.baidu.com', icon: 'https://yiyan.baidu.com/favicon.ico' },
      { name: '\u8FE5\u98DE\u661F\u706B', url: 'https://xinghuo.xfyun.cn', icon: 'https://xinghuo.xfyun.cn/favicon.ico' },
      { name: 'Coze', url: 'https://www.coze.com', icon: 'https://www.coze.com/favicon.ico' },
      { name: '\u54E9\u5E03\u54E9\u5E03AI', url: 'https://www.liblib.art', icon: 'https://www.liblib.art/favicon.ico' },
      { name: 'Midjourney', url: 'https://www.midjourney.com', icon: 'https://www.midjourney.com/favicon.ico' },
      { name: 'Runway', url: 'https://runwayml.com', icon: 'https://runwayml.com/favicon.ico' },
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
      { name: 'TypeScript', url: 'https://www.typescriptlang.org', icon: 'https://www.typescriptlang.org/favicon.ico' },
      { name: 'Node.js', url: 'https://nodejs.org', icon: 'https://nodejs.org/favicon.ico' },
      { name: 'Vue.js', url: 'https://vuejs.org', icon: 'https://vuejs.org/favicon.ico' },
      { name: 'React', url: 'https://react.dev', icon: 'https://react.dev/favicon.ico' },
      { name: 'Next.js', url: 'https://nextjs.org', icon: 'https://nextjs.org/favicon.ico' },
      { name: 'Vite', url: 'https://vitejs.dev', icon: 'https://vitejs.dev/favicon.ico' },
      { name: 'Tailwind CSS', url: 'https://tailwindcss.com', icon: 'https://tailwindcss.com/favicon.ico' },
      { name: 'Spring', url: 'https://spring.io', icon: 'https://spring.io/favicon.ico' },
      { name: 'IntelliJ IDEA', url: 'https://www.jetbrains.com/idea', icon: 'https://www.jetbrains.com/favicon.ico' },
      { name: 'VS Code', url: 'https://code.visualstudio.com', icon: 'https://code.visualstudio.com/favicon.ico' },
      { name: 'Docker', url: 'https://www.docker.com', icon: 'https://www.docker.com/favicon.ico' },
      { name: 'Kubernetes', url: 'https://kubernetes.io', icon: 'https://kubernetes.io/favicon.ico' },
      { name: 'Postman', url: 'https://www.postman.com', icon: 'https://www.postman.com/favicon.ico' },
      { name: 'LeetCode', url: 'https://leetcode.cn', icon: 'https://leetcode.cn/favicon.ico' },
      { name: 'Regex101', url: 'https://regex101.com', icon: 'https://regex101.com/favicon.ico' },
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
      { name: 'Behance', url: 'https://www.behance.net', icon: 'https://www.behance.net/favicon.ico' },
      { name: 'Unsplash', url: 'https://unsplash.com', icon: 'https://unsplash.com/favicon.ico' },
      { name: 'IconFont', url: 'https://www.iconfont.cn', icon: 'https://www.iconfont.cn/favicon.ico' },
      { name: 'Coolors', url: 'https://coolors.co', icon: 'https://coolors.co/favicon.ico' },
      { name: 'Storyset', url: 'https://storyset.com', icon: 'https://storyset.com/favicon.ico' },
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
      { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org', icon: 'https://www.freecodecamp.org/favicon.ico' },
      { name: '\u4E2D\u56FD\u5927\u5B66MOOC', url: 'https://www.icourse163.org', icon: 'https://www.icourse163.org/favicon.ico' },
      { name: '\u5B66\u5802\u5728\u7EBF', url: 'https://www.xuetangx.com', icon: 'https://www.xuetangx.com/favicon.ico' },
      { name: '\u56FD\u5BB6\u667A\u6167\u6559\u80B2\u5E73\u53F0', url: 'https://www.smartedu.cn', icon: 'https://www.smartedu.cn/favicon.ico' },
      { name: '\u83DC\u9E1F\u6559\u7A0B', url: 'https://www.runoob.com', icon: 'https://www.runoob.com/favicon.ico' },
      { name: '\u6155\u8BFE\u7F51', url: 'https://www.imooc.com', icon: 'https://www.imooc.com/favicon.ico' },
      { name: '\u7F51\u6613\u4E91\u8BFE\u5802', url: 'https://study.163.com', icon: 'https://study.163.com/favicon.ico' },
      { name: '\u7F51\u6613\u516C\u5F00\u8BFE', url: 'https://open.163.com', icon: 'https://open.163.com/favicon.ico' },
      { name: '\u5B66\u4E60\u5F3A\u56FD', url: 'https://www.xuexi.cn', icon: 'https://www.xuexi.cn/favicon.ico' },
      { name: '\u8003\u8BD5\u9177', url: 'https://www.examcoo.com', icon: 'https://www.examcoo.com/favicon.ico' },
      { name: '\u8D85\u661F\u5C14\u96C5', url: 'https://erya.mooc.chaoxing.com', icon: 'https://erya.mooc.chaoxing.com/favicon.ico' },
      { name: 'Khan Academy', url: 'https://www.khanacademy.org', icon: 'https://www.khanacademy.org/favicon.ico' },
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
      { name: 'Disney+', url: 'https://www.disneyplus.com', icon: 'https://www.disneyplus.com/favicon.ico' },
      { name: '\u817E\u8BAF\u89C6\u9891', url: 'https://v.qq.com', icon: 'https://v.qq.com/favicon.ico' },
      { name: '\u7231\u5947\u827A', url: 'https://www.iqiyi.com', icon: 'https://www.iqiyi.com/favicon.ico' },
      { name: '\u4F18\u9177', url: 'https://www.youku.com', icon: 'https://www.youku.com/favicon.ico' },
      { name: '\u8292\u679CTV', url: 'https://www.mgtv.com', icon: 'https://www.mgtv.com/favicon.ico' },
      { name: '\u8C46\u74E3', url: 'https://www.douban.com', icon: 'https://www.douban.com/favicon.ico' },
      { name: 'Spotify', url: 'https://open.spotify.com', icon: 'https://open.spotify.com/favicon.ico' },
      { name: '\u7F51\u6613\u4E91\u97F3\u4E50', url: 'https://music.163.com', icon: 'https://music.163.com/favicon.ico' },
      { name: '\u7535\u5F71\u5929\u5802', url: 'https://www.xl720.com', icon: 'https://www.xl720.com/favicon.ico' },
      { name: '6v\u7535\u5F71\u7F51', url: 'https://www.6vdy.com', icon: 'https://www.6vdy.com/favicon.ico' },
      { name: '\u4F4E\u8C03\u5F71\u89C6', url: 'https://ddys.tv', icon: 'https://ddys.tv/favicon.ico' },
      { name: 'Animex\u52A8\u6F2B\u793E', url: 'https://www.animetox.com', icon: 'https://www.animetox.com/favicon.ico' },
      { name: '\u6A31\u4E4B\u7A7A', url: 'https://skr.skr2.cc:666', icon: 'https://skr.skr2.cc:666/favicon.ico' },
      { name: '\u5189\u6B21\u5143', url: 'https://www.jiongciyuan.com', icon: 'https://www.jiongciyuan.com/favicon.ico' },
      { name: '\u52A8\u6F2B\u5171\u548C\u56FD', url: 'https://www.dongmanrg.com', icon: 'https://www.dongmanrg.com/favicon.ico' },
      { name: 'Age\u52A8\u6F2B', url: 'https://www.agefans.cc', icon: 'https://www.agefans.cc/favicon.ico' },
      { name: '\u6A31\u82B1\u52A8\u6F2B', url: 'https://www.yinghuacd.com', icon: 'https://www.yinghuacd.com/favicon.ico' },
      { name: '\u98CE\u8F66\u52A8\u6F2B', url: 'https://www.fengche.tv', icon: 'https://www.fengche.tv/favicon.ico' },
      { name: 'Zzzfun', url: 'https://www.zzzfun.com', icon: 'https://www.zzzfun.com/favicon.ico' },
      { name: '\u871C\u67D1\u8BA1\u5212', url: 'https://mikanani.me', icon: 'https://mikanani.me/favicon.ico' },
      { name: '\u52A8\u6F2B\u82B1\u56ED', url: 'https://www.dmhy.org', icon: 'https://www.dmhy.org/favicon.ico' },
      { name: 'Bangumi', url: 'https://bangumi.tv', icon: 'https://bangumi.tv/favicon.ico' },
      { name: 'AcFun', url: 'https://www.acfun.cn', icon: 'https://www.acfun.cn/favicon.ico' },
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
      { name: 'The Verge', url: 'https://www.theverge.com', icon: 'https://www.theverge.com/favicon.ico' },
      { name: 'BBC News', url: 'https://www.bbc.com/news', icon: 'https://www.bbc.com/favicon.ico' },
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
    id: 'cloud',
    icon: '\u2601\uFE0F',
    name: '\u7F51\u76D8\u8D44\u6E90',
    sites: [
      { name: '\u767E\u5EA6\u7F51\u76D8', url: 'https://pan.baidu.com', icon: 'https://pan.baidu.com/favicon.ico' },
      { name: '\u963F\u91CC\u4E91\u76D8', url: 'https://www.aliyundrive.com', icon: 'https://www.aliyundrive.com/favicon.ico' },
      { name: '\u5938\u514B\u7F51\u76D8', url: 'https://pan.quark.cn', icon: 'https://pan.quark.cn/favicon.ico' },
      { name: 'OneDrive', url: 'https://onedrive.live.com', icon: 'https://onedrive.live.com/favicon.ico' },
      { name: '3y\u8BBA\u575B', url: 'https://www.3ylt.xyz', icon: 'https://www.3ylt.xyz/favicon.ico' },
      { name: '\u5149\u9E2D\u8D44\u6E90\u793E', url: 'https://www.guangya.cc', icon: 'https://www.guangya.cc/favicon.ico' },
      { name: '\u7F51\u76D8\u8D44\u6E90\u793E', url: 'https://wpzys.org', icon: 'https://wpzys.org/favicon.ico' },
      { name: '\u9752\u6668\u8D44\u6E90\u7AD9', url: 'https://qingchen86.com', icon: 'https://qingchen86.com/favicon.ico' },
      { name: '\u4E91\u76D8\u8D44\u6E90\u793E', url: 'https://yunpans.com', icon: 'https://yunpans.com/favicon.ico' },
      { name: '\u5938\u514B\u7F51\u76D8\u793E', url: 'https://kuakes.com', icon: 'https://kuakes.com/favicon.ico' },
      { name: 'BT\u78C1\u529B', url: 'https://www.btbtla.com', icon: 'https://www.btbtla.com/favicon.ico' },
      { name: '\u7EB8\u9E33\u78C1\u529B', url: 'https://magnet.kiteyuan.info', icon: 'https://magnet.kiteyuan.info/favicon.ico' },
    ]
  },
  {
    id: 'games',
    icon: '\uD83C\uDFAE',
    name: '\u5728\u7EBF\u6E38\u620F',
    sites: [
      { name: 'survev.io', url: 'https://survev.io', icon: 'https://survev.io/favicon.ico' },
      { name: 'Narrow One', url: 'https://narrow.one', icon: 'https://narrow.one/favicon.ico' },
    ]
  },
  {
    id: 'wallpaper',
    icon: '\uD83D\uDDBC',
    name: '\u58C1\u7EB8',
    sites: [
      { name: '\u6545\u5BAB\u58C1\u7EB8', url: 'https://www.dpm.org.cn/lights/royal.html', icon: 'https://www.dpm.org.cn/favicon.ico' },
      { name: '\u58C1\u7EB8\u6C47', url: 'https://www.bizhihui.com', icon: 'https://www.bizhihui.com/favicon.ico' },
      { name: 'Pexels', url: 'https://www.pexels.com', icon: 'https://www.pexels.com/favicon.ico' },
      { name: '\u62FE\u5149\u58C1\u7EB8', url: 'https://gallery.timeline.ink', icon: 'https://gallery.timeline.ink/favicon.ico' },
      { name: '\u54F2\u98CE\u58C1\u7EB8', url: 'https://haowallpaper.com', icon: 'https://haowallpaper.com/favicon.ico' },
      { name: '\u81F4\u7F8E\u5316', url: 'https://zhutix.com', icon: 'https://zhutix.com/favicon.ico' },
      { name: '\u58C1\u7EB8\u6E56', url: 'https://bizihu.com', icon: 'https://bizihu.com/favicon.ico' },
      { name: 'Wallhaven', url: 'https://wallhaven.cc', icon: 'https://wallhaven.cc/favicon.ico' },
      { name: 'Alphacoders', url: 'https://wall.alphacoders.com', icon: 'https://wall.alphacoders.com/favicon.ico' },
      { name: 'WallpapersHome', url: 'https://wallpapershome.com', icon: 'https://wallpapershome.com/favicon.ico' },
    ]
  },
  {
    id: 'misc',
    icon: '\uD83D\uDD27',
    name: '\u5B9E\u7528\u5DE5\u5177',
    sites: [
      { name: '\u5728\u7EBF\u65B0\u534E\u5B57\u5178', url: 'https://zd.hwxnet.com', icon: 'https://zd.hwxnet.com/favicon.ico' },
      { name: 'Excalidraw', url: 'https://excalidraw.com', icon: 'https://excalidraw.com/favicon.ico' },
      { name: 'JSON.cn', url: 'https://www.json.cn', icon: 'https://www.json.cn/favicon.ico' },
      { name: 'Carbon', url: 'https://carbon.now.sh', icon: 'https://carbon.now.sh/favicon.ico' },
      { name: 'ProcessOn', url: 'https://www.processon.com', icon: 'https://www.processon.com/favicon.ico' },
      { name: 'Wikipedia', url: 'https://www.wikipedia.org', icon: 'https://www.wikipedia.org/favicon.ico' },
      { name: 'DeepL', url: 'https://www.deepl.com', icon: 'https://www.deepl.com/favicon.ico' },
    ]
  }
];

function renderCategories(filter){
  var container = document.getElementById('categoriesContainer');
  if (!container) return;
  container.innerHTML = '';

  var filtered = CATEGORIES;
  if (filter && filter !== 'all') {
    filtered = CATEGORIES.filter(function(c){ return c.id === filter; });
  }

  var searchInput = document.getElementById('bookmarkSearch');
  var searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';

  filtered.forEach(function(cat){
    var sites = cat.sites;
    if (searchTerm) {
      sites = sites.filter(function(s){
        return s.name.toLowerCase().includes(searchTerm) || s.url.toLowerCase().includes(searchTerm);
      });
    }
    if (sites.length === 0) return;

    var section = document.createElement('div');
    section.className = 'category-section';
    section.dataset.category = cat.id;
    section.innerHTML = '<div class="category-header"><h2>' + cat.name + '</h2><span class="category-count">' + sites.length + ' \u4E2A</span></div><div class="links-grid" id="grid-' + cat.id + '">' + sites.map(function(s){
      return '<a href="' + s.url + '" class="link-card" target="_blank" rel="noopener noreferrer" title="' + s.name + '"><span class="name">' + s.name + '</span></a>';
    }).join('') + '</div>';
    container.appendChild(section);
  });
}

function switchCategory(catId){
  document.querySelectorAll('.bookmarks-nav-item').forEach(function(el){
    el.classList.toggle('active', el.dataset.cat === catId);
  });
  renderCategories(catId === 'all' ? null : catId);
}
window.switchCategory = switchCategory;

function initBookmarks(){
  renderCategories();
  var searchInput = document.getElementById('bookmarkSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function(){
      var active = document.querySelector('.bookmarks-nav-item.active');
      var cat = active ? active.dataset.cat : 'all';
      renderCategories(cat === 'all' ? null : cat);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBookmarks);
} else {
  initBookmarks();
}

document.addEventListener('pjax:complete', function(){
  if (document.getElementById('categoriesContainer')) {
    initBookmarks();
  }
});
})();