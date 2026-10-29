// Lightweight page visit tracker for CWD analytics
// Sends a beacon to CWD API on page load (non-blocking)
(function(){
  var API = 'https://cwd-api.233002.xyz';
  var SITE_ID = 'blog';
  var slug = location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  var title = document.title || '';
  var url = location.href;
  var payload = JSON.stringify({ postSlug: slug, postTitle: title, postUrl: url, siteId: SITE_ID });
  // 不能用 sendBeacon: 它强制带 credentials，而 cwd-api 的响应是
  // Access-Control-Allow-Origin: * —— 凭证模式下浏览器拒绝通配符，上报会全部失败。
  // 统计上报不需要 cookie，显式 omit 即可通过。
  fetch(API + '/api/analytics/visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    credentials: 'omit',
    keepalive: true
  }).catch(function(){});
})();
