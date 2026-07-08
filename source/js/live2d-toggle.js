(function() {
  var STORAGE_KEY = 'live2d_enabled';
  var live2d_path = '/live2d/';
  var resources = ['waifu.css', 'live2d.min.js', 'waifu-tips.js', 'waifu-drag.js'];
  var loaded = false;

  function loadExternalResource(url, type) {
    return new Promise(function(resolve, reject) {
      if (type === 'css' && document.querySelector('link[href="' + url + '"]')) return resolve(url);
      if (type === 'js' && document.querySelector('script[src="' + url + '"]')) return resolve(url);
      var tag;
      if (type === 'css') {
        tag = document.createElement('link');
        tag.rel = 'stylesheet';
        tag.href = url;
      } else if (type === 'js') {
        tag = document.createElement('script');
        tag.src = url;
      }
      if (tag) {
        tag.onload = function() { resolve(url); };
        tag.onerror = function() { reject(url); };
        document.head.appendChild(tag);
      }
    });
  }

  function loadLive2D() {
    if (window.innerWidth <= 768) return;
    var promises = resources.map(function(r) {
      return loadExternalResource(live2d_path + r, r.endsWith('.css') ? 'css' : 'js');
    });
    Promise.all(promises).then(function() {
      if (typeof initWidget === 'function') {
        initWidget({
          isLocalModel: true,
          waifuPath: live2d_path + 'waifu-tips.json',
          modelsPath: live2d_path + 'model',
          modelListPath: live2d_path + 'model/model_list.json',
          drag: true,
          tools: []
        });
        loaded = true;
      }
    }).catch(function(e) {
      console.warn('Live2D load failed:', e);
    });
  }

  function unloadLive2D() {
    var waifu = document.getElementById('waifu');
    if (waifu) waifu.remove();
    loaded = false;
  }

  function toggle() {
    if (loaded || document.getElementById('waifu')) {
      unloadLive2D();
      localStorage.setItem(STORAGE_KEY, '0');
    } else {
      loadLive2D();
      localStorage.setItem(STORAGE_KEY, '1');
    }
  }

  function init() {
    var btn = document.getElementById('live2d-toggle');
    if (!btn) return;
    btn.addEventListener('click', toggle);
    if (localStorage.getItem(STORAGE_KEY) === '1') {
      loadLive2D();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  document.addEventListener('pjax:complete', init);
})();
