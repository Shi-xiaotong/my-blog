// Lightweight page visit tracker for CWD analytics
// Sends a beacon to CWD API on page load (non-blocking)
(function(){
  var API = 'https://cwd-api.233002.xyz';
  var SITE_ID = 'blog';
  var slug = location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  var title = document.title || '';
  var url = location.href;
  var payload = JSON.stringify({ postSlug: slug, postTitle: title, postUrl: url, siteId: SITE_ID });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(API + '/api/analytics/visit', new Blob([payload], { type: 'application/json' }));
  } else {
    fetch(API + '/api/analytics/visit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(function(){});
  }
})();
