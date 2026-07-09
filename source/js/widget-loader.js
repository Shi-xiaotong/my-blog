/**
 * 侧边栏小组件懒加载器
 * 仅在页面包含对应容器时，才动态加载所需的 JS 文件
 * 避免在所有页面加载 lunar.js (426KB) 等大型库
 */
(function() {
  'use strict';

  var SCRIPTS = {
    calendar: [
      '/js/lunar.js',
      '/js/calendar-widget.js'
    ],
    weather: [
      '/js/weather-store.js',
      '/js/weather-widget.js'
    ]
  };

  function loadScript(src) {
    return new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  function loadSequence(files) {
    return files.reduce(function(promise, file) {
      return promise.then(function() { return loadScript(file); });
    }, Promise.resolve());
  }

  // Calendar: only if container exists
  if (document.getElementById('calendar-aside-container')) {
    loadSequence(SCRIPTS.calendar)['catch'](function(e) {
      console.warn('Calendar widget load failed:', e);
    });
  }

  // Weather: only if container exists
  if (document.getElementById('weather-aside-container')) {
    loadSequence(SCRIPTS.weather)['catch'](function(e) {
      console.warn('Weather widget load failed:', e);
    });
  }

})();