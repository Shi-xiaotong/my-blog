// typed polyfill — 主题 utils.js 在 Pjax 切换时调用 typed.destroy()，
// 但本站 subtitle.effect=false，typed.js 未加载，导致 ReferenceError → JS 中断 → 评论区渲染失败。
// 在 bundle.js 开头定义，确保主题脚本之前可用。
if (typeof window.typed === 'undefined') {
  window.typed = { destroy: function() {} };
}
if (typeof window.typedDestroy === 'undefined') {
  window.typedDestroy = function() {};
}
