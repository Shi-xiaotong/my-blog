// 站点统计展示 — 替代不蒜子
//
// 不蒜子（busuanzi.ibruce.info）是第三方免费服务，长期 502：脚本能加载、
// 数据接口取不到，侧栏统计项会永久停留在 spinner 状态。这里改读自建的
// cwd-api 统计接口，并且「拿不到数据就移除占位」，避免重蹈转圈覆辙。
(function () {
  var API = 'https://cwd-api.233002.xyz';
  var SITE_ID = 'blog';
  var UV_LABEL = '总访客数';
  var PV_LABEL = '总访问量';
  var MARKER = 'data-site-stats';

  function createItem(label) {
    var item = document.createElement('div');
    item.className = 'webinfo-item';

    var name = document.createElement('div');
    name.className = 'item-name';
    name.textContent = label + ' :';

    var count = document.createElement('div');
    count.className = 'item-count';
    count.textContent = '-';

    item.appendChild(name);
    item.appendChild(count);

    return { item: item, count: count };
  }

  function render() {
    var box = document.querySelector('.card-webinfo .webinfo');
    if (!box) return;

    // 避免 Pjax 重复切换时插入多份
    if (box.querySelector('[' + MARKER + ']')) return;

    var uv = createItem(UV_LABEL);
    var pv = createItem(PV_LABEL);
    uv.item.setAttribute(MARKER, 'uv');
    pv.item.setAttribute(MARKER, 'pv');
    box.appendChild(uv.item);
    box.appendChild(pv.item);

    fetch(API + '/api/analytics/site-summary?siteId=' + encodeURIComponent(SITE_ID), {
      credentials: 'omit'
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        uv.count.textContent = Number(data.siteUv || 0).toLocaleString();
        pv.count.textContent = Number(data.sitePv || 0).toLocaleString();
      })
      .catch(function () {
        // 取不到就撤掉占位，不留无限 spinner
        uv.item.remove();
        pv.item.remove();
      });
  }

  document.addEventListener('DOMContentLoaded', render);
  document.addEventListener('pjax:complete', render);
})();
