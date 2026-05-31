// APlayer 音乐播放器初始化
// 使用 MetingJS 的方式加载音乐（兼容 Butterfly 主题）

function initAPlayer() {
  // 检查是否已经初始化
  if (document.querySelector('.aplayer[data-url]')) return;
  
  // 检查 APlayer 和 MetingJS 是否已加载
  if (typeof APlayer === 'undefined' || typeof loadMeting === 'undefined') {
    setTimeout(initAPlayer, 100);
    return;
  }
  
  // 创建播放器容器（使用 MetingJS 的 data 属性）
  var container = document.createElement('div');
  container.className = 'aplayer';
  container.style.cssText = 'position:fixed;bottom:0;left:0;width:100%;z-index:999;';
  
  // 设置 MetingJS 需要的 data 属性
  container.dataset.url = 'https://lanzou-api.233002.xyz/api/direct?url=https://wwbdj.lanzoul.com/iZjIP3qskyfc&pwd=bc7o';
  container.dataset.name = '背景音乐';
  container.dataset.artist = '未知';
  container.dataset.cover = '';
  container.dataset.autoplay = 'true';
  container.dataset.mutex = 'true';
  container.dataset.mini = 'true';
  container.dataset.loop = 'all';
  container.dataset.order = 'list';
  container.dataset.preload = 'auto';
  container.dataset.volume = '0.7';
  container.dataset.lrcType = '0';
  
  document.body.appendChild(container);
  
  // 调用 MetingJS 的 loadMeting 函数
  loadMeting();
  
  // 尝试自动播放
  setTimeout(function() {
    var ap = document.querySelector('.aplayer');
    if (ap && ap.aplayer) {
      ap.aplayer.play().catch(function() {
        console.log('自动播放被阻止，需要用户交互');
      });
    }
  }, 2000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initAPlayer);

// pjax 加载完成后重新初始化
document.addEventListener('pjax:complete', initAPlayer);
