/**
 * 游戏页公共脚本 — 主题按钮
 * 背景: d7e616c 为 Pjax 兼容删除了各游戏页内联的 theme-toggle 按钮,
 * 导致所有游戏页失去白天/黑夜切换。此脚本统一注入按钮 + 恢复主题,
 * 已自带按钮的页面 (ai-*.html 的 .theme-btn) 自动跳过注入。
 *
 * 用法: <script src="/games/theme.js"></script> 放 </body> 前
 * 新增游戏页记得引用这一行, 不用再手写按钮。
 */
(function () {
  'use strict';

  var KEY = 'game-theme'; // 与原有各游戏页一致, 偏好互相继承
  var SUNE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function toggleTheme() {
    var h = document.documentElement;
    var isLight = h.getAttribute('data-theme') === 'light';
    h.setAttribute('data-theme', isLight ? '' : 'light');
    localStorage.setItem(KEY, isLight ? 'dark' : 'light');
    setBtnIcon(isLight); // 现在是暗色 -> 显示月亮(切到亮色), 反之显示太阳
  }

  function setBtnIcon(isLight) {
    var btn = document.querySelector('.theme-toggle');
    if (btn) btn.innerHTML = isLight ? MOON : SUNE;
  }

  function ensureToggle() {
    // 已有按钮 (本页 .theme-toggle 或 ai 页 .theme-btn) 则只恢复主题, 不重复注入
    if (document.querySelector('.theme-toggle, .theme-btn')) return;
    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.title = '切换白天/黑夜';
    btn.setAttribute('aria-label', '切换白天/黑夜');
    btn.innerHTML = SUNE;
    btn.addEventListener('click', toggleTheme);
    document.body.appendChild(btn);
  }

  function restore() {
    var saved = localStorage.getItem(KEY);
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      setBtnIcon(true);
    } else {
      setBtnIcon(false);
    }
  }

  function init() {
    ensureToggle();
    restore();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Pjax 场景: 页面内容被替换后重挂按钮
  document.addEventListener('pjax:complete', function () {
    setTimeout(init, 0);
  });
})();
