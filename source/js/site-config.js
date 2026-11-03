// 影视屋 / 全站自定义页共享配置
// 集中管理硬编码域名与管理员标识：改域名只需改这里。
// 消费方一律用 (window.SITE_CFG && window.SITE_CFG.X) || '默认值' 兜底，
// 即使本文件未加载也不会报错（回退到内置默认域名）。
(function () {
  window.SITE_CFG = {
    AUTH_API: 'https://auth.233002.xyz',
    CWD_API: 'https://cwd-api.233002.xyz',
    ADMIN_EMAIL: '505350617@qq.com'
  };
})();
