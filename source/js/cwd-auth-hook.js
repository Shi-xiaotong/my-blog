(function(){
  var CWD_API = 'https://cwd-api.233002.xyz';
  var ADMIN_EMAIL = '505350617@qq.com';
  var STORAGE_KEY = 'cwd_admin_auth';
  var SALT = 'cwd-salt';

  function xorEncode(str) {
    if (!str) return '';
    var saltCodes = SALT.split('').map(function(c){ return c.charCodeAt(0); });
    var xorAll = saltCodes.reduce(function(a,b){ return a ^ b; }, 0);
    return str.split('').map(function(c){
      var code = c.charCodeAt(0) ^ xorAll;
      return ('0' + code.toString(16)).slice(-2);
    }).join('');
  }

  function xorDecode(hex) {
    if (!hex) return '';
    var saltCodes = SALT.split('').map(function(c){ return c.charCodeAt(0); });
    var xorAll = saltCodes.reduce(function(a,b){ return a ^ b; }, 0);
    var result = '';
    for (var i = 0; i < hex.length; i += 2) {
      var code = parseInt(hex.substr(i, 2), 16) ^ xorAll;
      result += String.fromCharCode(code);
    }
    return result;
  }

  function hasAdminToken() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (Date.now() - data.timestamp > 259200000) {
        localStorage.removeItem(STORAGE_KEY);
        return false;
      }
      return !!data.adminToken;
    } catch(e) {
      return false;
    }
  }

  function saveAdminToken(key) {
    var encoded = xorEncode(key);
    var data = { adminToken: encoded, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getAdminToken() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (Date.now() - data.timestamp > 259200000) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return xorDecode(data.adminToken);
    } catch(e) {
      return null;
    }
  }

  function clearAdminToken() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function showAdminVerifyModal() {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center';

    var box = document.createElement('div');
    box.style.cssText = 'background:#fff;border-radius:12px;padding:28px 32px;width:360px;max-width:90vw;box-shadow:0 8px 32px rgba(0,0,0,0.25);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';

    var title = document.createElement('h3');
    title.textContent = '管理员验证';
    title.style.cssText = 'margin:0 0 8px;font-size:18px;color:#333';

    var desc = document.createElement('p');
    desc.textContent = '请输入 CWD 评论系统管理员密钥';
    desc.style.cssText = 'margin:0 0 16px;font-size:14px;color:#888';

    var input = document.createElement('input');
    input.type = 'password';
    input.placeholder = '管理员密钥';
    input.style.cssText = 'width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:8px;font-size:14px;outline:none;box-sizing:border-box';

    var errorEl = document.createElement('div');
    errorEl.style.cssText = 'color:#e94560;font-size:13px;margin-top:8px;display:none';

    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:12px;margin-top:20px';

    var cancelBtn = document.createElement('button');
    cancelBtn.textContent = '取消';
    cancelBtn.style.cssText = 'padding:8px 20px;border:1px solid #ddd;border-radius:8px;background:#fff;color:#666;font-size:14px;cursor:pointer';

    var verifyBtn = document.createElement('button');
    verifyBtn.textContent = '验证';
    verifyBtn.style.cssText = 'padding:8px 20px;border:none;border-radius:8px;background:#e94560;color:#fff;font-size:14px;cursor:pointer';

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(verifyBtn);

    box.appendChild(title);
    box.appendChild(desc);
    box.appendChild(input);
    box.appendChild(errorEl);
    box.appendChild(btnRow);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    input.focus();

    function close() {
      document.body.removeChild(overlay);
    }

    function doVerify() {
      var key = input.value.trim();
      if (!key) {
        errorEl.textContent = '请输入管理员密钥';
        errorEl.style.display = '';
        return;
      }
      verifyBtn.disabled = true;
      verifyBtn.textContent = '验证中...';
      errorEl.style.display = 'none';

      fetch(CWD_API + '/api/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminToken: key })
      })
      .then(function(r){
        if (!r.ok) {
          return r.json().then(function(d){ throw new Error(d.message || '验证失败'); });
        }
        return r.json();
      })
      .then(function(){
        saveAdminToken(key);
        close();
        // Reload page to re-init CWD with admin token
        location.reload();
      })
      .catch(function(err){
        errorEl.textContent = err.message || '验证失败';
        errorEl.style.display = '';
        verifyBtn.disabled = false;
        verifyBtn.textContent = '验证';
      });
    }

    cancelBtn.addEventListener('click', close);
    verifyBtn.addEventListener('click', doVerify);
    input.addEventListener('keydown', function(e){
      if (e.key === 'Enter') doVerify();
    });
    overlay.addEventListener('click', function(e){
      if (e.target === overlay) close();
    });
  }

  function fillCWDUserInfo(){
    var auth = window._siteAuth;
    if (!auth || !auth.isLoggedIn()) return;
    var u = auth.getUser();
    if (!u) return;
    var name = u.display_name || (u.email ? u.email.split('@')[0] : 'user');
    var email = u.email || '';
    try {
      localStorage.setItem('cwd_user_info', JSON.stringify({ name: name, email: email, url: '' }));
    } catch(e) {}
  }

  function addVerifyButton() {
    // Only show for the admin user logged in via site-auth
    var auth = window._siteAuth;
    if (!auth || !auth.isLoggedIn()) return;
    var u = auth.getUser();
    if (!u || u.email !== ADMIN_EMAIL) return;
    if (hasAdminToken()) return;
    setTimeout(function(){
      var commentArea = document.querySelector('#cwd-comments') || document.querySelector('.comment-wrap');
      if (!commentArea) return;
      var existing = document.getElementById('cwd-verify-btn');
      if (existing) return;
      var btn = document.createElement('button');
      btn.id = 'cwd-verify-btn';
      btn.textContent = '🔑 管理员验证';
      btn.style.cssText = 'display:inline-block;margin:8px 0;padding:6px 16px;border:1px solid #e94560;border-radius:6px;background:#fff;color:#e94560;font-size:13px;cursor:pointer';
      btn.onclick = showAdminVerifyModal;
      commentArea.parentNode.insertBefore(btn, commentArea);
    }, 1000);
  }

  function init() {
    fillCWDUserInfo();
    addVerifyButton();
    window.addEventListener('storage', function(e){
      if (e.key === 'anime_token' || e.key === 'anime_user') fillCWDUserInfo();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  document.addEventListener('pjax:complete', function(){
    fillCWDUserInfo();
    addVerifyButton();
  });
})();
