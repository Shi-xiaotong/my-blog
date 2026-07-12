(function(){
try{
var API='https://auth.233002.xyz';
var token=localStorage.getItem('anime_token')||'';
var user=JSON.parse(localStorage.getItem('anime_user')||'null');
var countdown=0;
var currentView='login';

function isLoggedIn(){return !!token;}

function render(){
  var bar=document.getElementById('site-auth-bar');
  if(!bar)return;
  if(isLoggedIn()){
    var avatarHtml=user&&user.avatar_url?'<span class="auth-avatar-sm"><img src="'+user.avatar_url+'" alt=""></span>':'<span class="auth-avatar-sm"><i class="fas fa-user" style="font-size:10px"></i></span>';
    var name=user?(user.display_name||(user.email?user.email.split('@')[0]:'User')):'';
    bar.innerHTML='<div class="menus_item auth-user-info">'
      +'<span class="site-page child" onclick="window.location.href=\'/user/\'" title="个人中心">'
      +  avatarHtml
      +  '<span> '+name+'</span>'
      +'</span>'
      +'<button class="auth-logout" onclick="siteAuthLogout()" title="退出"><i class="fas fa-sign-out-alt"></i></button>'
      +'</div>';
  }else{
    bar.innerHTML='<a class="site-page auth-login-btn" style="cursor:pointer" onclick="showSiteLoginModal()"><i class="fas fa-fw fa-user"></i><span> 登录</span></a>';
  }
}

function showLoginModal(){
  var m=document.getElementById('site-login-modal');
  if(m){m.classList.add('show');switchView('login');resetLoginForm();}
}

function hideLoginModal(){
  var m=document.getElementById('site-login-modal');if(m)m.classList.remove('show');
}

function resetLoginForm(){
  var err=document.getElementById('slmError');if(err)err.textContent='';
  var els=['slmEmailInput','slmPasswordInput','slmRegEmailInput','slmRegCodeInput','slmRegPasswordInput',
    'slmResetEmailInput','slmResetCodeInput','slmResetPasswordInput'];
  els.forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  var codeWrap=document.getElementById('slmRegCodeWrap');if(codeWrap)codeWrap.style.display='none';
  var resetCodeWrap=document.getElementById('slmResetCodeWrap');if(resetCodeWrap)resetCodeWrap.style.display='none';
  var btn=document.getElementById('slmSendBtn');if(btn){btn.disabled=false;btn.textContent='发送验证码';}
  var resetBtn=document.getElementById('slmResetSendBtn');if(resetBtn){resetBtn.disabled=false;resetBtn.textContent='发送验证码';}
  countdown=0;currentView='login';
}

function logout(){
  fetch(API+'/api/auth/logout',{method:'POST',headers:{'Authorization':'Bearer '+token}}).catch(function(){});
  token='';user=null;
  localStorage.removeItem('anime_token');
  localStorage.removeItem('anime_user');
  render();
}

function switchView(view){
  currentView=view;
  var loginView=document.getElementById('slmLoginView');
  var regView=document.getElementById('slmRegView');
  var resetView=document.getElementById('slmResetView');
  var tabs=document.querySelectorAll('.slm-tab');
  if(loginView)loginView.style.display=view==='login'?'':'none';
  if(regView)regView.style.display=view==='register'?'':'none';
  if(resetView)resetView.style.display=view==='reset'?'':'none';
  tabs.forEach(function(tab){tab.classList.toggle('active',tab.dataset.view===view);});
  var err=document.getElementById('slmError');if(err)err.textContent='';
}

// Login with email + password
function login(){
  var email=document.getElementById('slmEmailInput').value.trim();
  var password=document.getElementById('slmPasswordInput').value;
  var err=document.getElementById('slmError');
  if(!email||email.indexOf('@')<0){err.textContent='请输入有效邮箱';err.style.color='#e94560';return;}
  if(!password){err.textContent='请输入密码';err.style.color='#e94560';return;}
  err.textContent='登录中...';err.style.color='#aaa';
  var btn=document.getElementById('slmLoginBtn');if(btn)btn.disabled=true;
  fetch(API+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email,password:password})})
  .then(function(r){return r.json()})
  .then(function(data){
    if(btn)btn.disabled=false;
    if(data.error){
      if(data.need_reset){
        err.textContent='请先设置密码，点击"忘记密码"重置';err.style.color='#2563EB';
      }else{
        err.textContent=data.error;err.style.color='#e94560';
      }
      return;
    }
    token=data.token;user=data.user;
    localStorage.setItem('anime_token',token);
    localStorage.setItem('anime_user',JSON.stringify(user));
    render();hideLoginModal();
  })
  .catch(function(){if(btn)btn.disabled=false;err.textContent='网络错误';err.style.color='#e94560';});
}

// Register - send code
function regSendCode(){
  var email=document.getElementById('slmRegEmailInput').value.trim();
  var err=document.getElementById('slmError');
  var btn=document.getElementById('slmSendBtn');
  if(!email||email.indexOf('@')<0){err.textContent='请输入有效邮箱';err.style.color='#e94560';return;}
  err.textContent='发送中...';err.style.color='#aaa';
  btn.disabled=true;
  fetch(API+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email,type:'register'})})
  .then(function(r){return r.json()})
  .then(function(data){
    if(data.error){err.textContent=data.error;err.style.color='#e94560';btn.disabled=false;return;}
    if(data.dev_code){
      err.textContent='验证码已发送 (开发模式: '+data.dev_code+')';err.style.color='#4ecdc4';
    }else{
      err.textContent='验证码已发送到邮箱';err.style.color='#4ecdc4';
    }
    document.getElementById('slmRegCodeWrap').style.display='flex';
    document.getElementById('slmRegCodeInput').focus();
    countdown=60;
    var timer=setInterval(function(){
      countdown--;
      if(countdown<=0){clearInterval(timer);btn.disabled=false;btn.textContent='发送验证码';}
      else{btn.textContent=countdown+'s';}
    },1000);
  })
  .catch(function(){err.textContent='网络错误';err.style.color='#e94560';btn.disabled=false;});
}

// Register - verify code + create account
function regVerify(){
  var email=document.getElementById('slmRegEmailInput').value.trim();
  var code=document.getElementById('slmRegCodeInput').value.trim();
  var password=document.getElementById('slmRegPasswordInput').value;
  var err=document.getElementById('slmError');
  if(!code){err.textContent='请输入验证码';err.style.color='#e94560';return;}
  if(!password||password.length<6){err.textContent='密码至少6位';err.style.color='#e94560';return;}
  err.textContent='注册中...';err.style.color='#aaa';
  var btn=document.getElementById('slmRegSubmitBtn');if(btn)btn.disabled=true;
  fetch(API+'/api/auth/register/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email,code:code,password:password})})
  .then(function(r){return r.json()})
  .then(function(data){
    if(btn)btn.disabled=false;
    if(data.error){err.textContent=data.error;err.style.color='#e94560';return;}
    token=data.token;user=data.user;
    localStorage.setItem('anime_token',token);
    localStorage.setItem('anime_user',JSON.stringify(user));
    render();hideLoginModal();
  })
  .catch(function(){if(btn)btn.disabled=false;err.textContent='网络错误';err.style.color='#e94560';});
}

// Forgot password - send reset code
function resetSendCode(){
  var email=document.getElementById('slmResetEmailInput').value.trim();
  var err=document.getElementById('slmError');
  var btn=document.getElementById('slmResetSendBtn');
  if(!email||email.indexOf('@')<0){err.textContent='请输入有效邮箱';err.style.color='#e94560';return;}
  err.textContent='发送中...';err.style.color='#aaa';
  btn.disabled=true;
  fetch(API+'/api/auth/password/reset',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email,type:'reset'})})
  .then(function(r){return r.json()})
  .then(function(data){
    if(data.error){err.textContent=data.error;err.style.color='#e94560';btn.disabled=false;return;}
    if(data.dev_code){
      err.textContent='验证码已发送 (开发模式: '+data.dev_code+')';err.style.color='#4ecdc4';
    }else{
      err.textContent='验证码已发送到邮箱';err.style.color='#4ecdc4';
    }
    document.getElementById('slmResetCodeWrap').style.display='flex';
    document.getElementById('slmResetCodeInput').focus();
    countdown=60;
    var timer=setInterval(function(){
      countdown--;
      if(countdown<=0){clearInterval(timer);btn.disabled=false;btn.textContent='发送验证码';}
      else{btn.textContent=countdown+'s';}
    },1000);
  })
  .catch(function(){err.textContent='网络错误';err.style.color='#e94560';btn.disabled=false;});
}

// Forgot password - verify code + set new password
function resetVerify(){
  var email=document.getElementById('slmResetEmailInput').value.trim();
  var code=document.getElementById('slmResetCodeInput').value.trim();
  var password=document.getElementById('slmResetPasswordInput').value;
  var err=document.getElementById('slmError');
  if(!code){err.textContent='请输入验证码';err.style.color='#e94560';return;}
  if(!password||password.length<6){err.textContent='密码至少6位';err.style.color='#e94560';return;}
  err.textContent='重置中...';err.style.color='#aaa';
  var btn=document.getElementById('slmResetSubmitBtn');if(btn)btn.disabled=true;
  fetch(API+'/api/auth/password/reset/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email,code:code,password:password})})
  .then(function(r){return r.json()})
  .then(function(data){
    if(btn)btn.disabled=false;
    if(data.error){err.textContent=data.error;err.style.color='#e94560';return;}
    token=data.token;user=data.user;
    localStorage.setItem('anime_token',token);
    localStorage.setItem('anime_user',JSON.stringify(user));
    render();hideLoginModal();
  })
  .catch(function(){if(btn)btn.disabled=false;err.textContent='网络错误';err.style.color='#e94560';});
}

function handleOAuthCallback(){
  var params=new URLSearchParams(window.location.search);
  var authParam=params.get('auth');
  if(authParam){
    try{
      var data=JSON.parse(decodeURIComponent(authParam));
      if(data.token && data.user && data.user.email){
        token=data.token;user=data.user;
        localStorage.setItem('anime_token',token);
        localStorage.setItem('anime_user',JSON.stringify(user));
        render();
        // 通知 user-center 重新加载
        try{window.dispatchEvent(new Event('anime_login_change'));}catch(e){}
      }
    }catch(e){}
    var url=new URL(window.location.href);
    url.searchParams.delete('auth');
    window.history.replaceState({},'',url.toString());
  }
}

function validate(){
  if(!token){render();return;}
  fetch(API+'/api/auth/me',{headers:{'Authorization':'Bearer '+token}})
  .then(function(r){if(!r.ok)throw new Error();return r.json();})
  .then(function(data){
    if(data.user){user=data.user;localStorage.setItem('anime_user',JSON.stringify(user));}
    if(data.has_password===false){
      var u=JSON.parse(localStorage.getItem('anime_user')||'{}');
      u._no_password=true;localStorage.setItem('anime_user',JSON.stringify(u));
    }
  })
  .catch(function(){token='';user=null;localStorage.removeItem('anime_token');localStorage.removeItem('anime_user');})
  .then(function(){render();});
}

function init(){
  handleOAuthCallback();
  ensureBar();
  ensureModal();
  validate();
}

function ensureBar(){
  if(document.getElementById('site-auth-bar')){render();return;}
  var nav=document.getElementById('nav')
    || document.querySelector('#nav .menus_items')
    || document.querySelector('.menus_items')
    || document.getElementById('nav-container');
  if(nav){
    var bar=document.createElement('div');
    bar.id='site-auth-bar';
    nav.appendChild(bar);
  }
  render();
}

function ensureModal(){
  if(document.getElementById('site-login-modal'))return;
  var modal=document.createElement('div');modal.id='site-login-modal';
  modal.innerHTML='<div class="slm-box">'
    +'<h3>Mercury 博客</h3>'
    +'<div class="slm-tabs">'
    +'<button class="slm-tab active" data-view="login" onclick="siteSwitchView(\'login\')">登录</button>'
    +'<button class="slm-tab" data-view="register" onclick="siteSwitchView(\'register\')">注册</button>'
    +'<button class="slm-tab" data-view="reset" onclick="siteSwitchView(\'reset\')">重置密码</button>'
    +'</div>'
    +'<div class="slm-error" id="slmError"></div>'
    // Login view
    +'<div id="slmLoginView">'
    +'<div class="slm-oauth">'
    +'<button class="slm-oauth-btn github" onclick="siteGithubLogin()"><span class="slm-icon"><i class="fab fa-github"></i></span> GitHub 登录</button>'
    +'<button class="slm-oauth-btn google" onclick="siteGoogleLogin()"><span class="slm-icon"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg></span> Google 登录</button>'
    +'</div>'
    +'<div class="slm-divider">或使用邮箱登录</div>'
    +'<div class="slm-email-form">'
    +'<form onsubmit="return false">'
    +'<input type="email" id="slmEmailInput" placeholder="邮箱地址" autocomplete="email" onkeydown="if(event.key===\'Enter\')siteLogin()">'
    +'<input type="password" id="slmPasswordInput" placeholder="密码" autocomplete="current-password" onkeydown="if(event.key===\'Enter\')siteLogin()">'
    +'<button class="slm-submit" id="slmLoginBtn" onclick="siteLogin()">登录</button>'
    +'<div class="slm-form-footer">'
    +'<span class="slm-link" onclick="siteSwitchView(\'register\')">注册账号</span>'
    +'<span class="slm-link" onclick="siteSwitchView(\'reset\')">忘记密码</span>'
    +'</div>'
    +'</form>'
    +'</div>'
    +'</div>'
    // Register view
    +'<div id="slmRegView" style="display:none">'
    +'<div class="slm-email-form">'
    +'<form onsubmit="return false">'
    +'<input type="email" id="slmRegEmailInput" placeholder="邮箱地址" autocomplete="email" onkeydown="if(event.key===\'Enter\')siteRegSendCode()">'
    +'<div class="slm-email-row"><button class="slm-send-btn" id="slmSendBtn" onclick="siteRegSendCode()">发送验证码</button></div>'
    +'<div class="slm-email-row" id="slmRegCodeWrap" style="display:none">'
    +'<input type="text" id="slmRegCodeInput" placeholder="输入6位验证码" maxlength="6" autocomplete="one-time-code" onkeydown="if(event.key===\'Enter\')document.getElementById(\'slmRegPasswordInput\').focus()">'
    +'</div>'
    +'<input type="password" id="slmRegPasswordInput" placeholder="设置密码（至少6位）" autocomplete="new-password" onkeydown="if(event.key===\'Enter\')siteRegVerify()" style="margin-top:8px">'
    +'<button class="slm-submit" id="slmRegSubmitBtn" onclick="siteRegVerify()" style="margin-top:8px">注册</button>'
    +'<div class="slm-form-footer"><span class="slm-link" onclick="siteSwitchView(\'login\')">已有账号？去登录</span></div>'
    +'</form>'
    +'</div>'
    +'</div>'
    // Reset password view
    +'<div id="slmResetView" style="display:none">'
    +'<p class="slm-sub">输入注册邮箱，我们将发送验证码</p>'
    +'<div class="slm-email-form">'
    +'<form onsubmit="return false">'
    +'<input type="email" id="slmResetEmailInput" placeholder="邮箱地址" autocomplete="email" onkeydown="if(event.key===\'Enter\')siteResetSendCode()">'
    +'<div class="slm-email-row"><button class="slm-send-btn" id="slmResetSendBtn" onclick="siteResetSendCode()">发送验证码</button></div>'
    +'<div class="slm-email-row" id="slmResetCodeWrap" style="display:none">'
    +'<input type="text" id="slmResetCodeInput" placeholder="输入6位验证码" maxlength="6" autocomplete="one-time-code" onkeydown="if(event.key===\'Enter\')document.getElementById(\'slmResetPasswordInput\').focus()">'
    +'</div>'
    +'<input type="password" id="slmResetPasswordInput" placeholder="新密码（至少6位）" autocomplete="new-password" onkeydown="if(event.key===\'Enter\')siteResetVerify()" style="margin-top:8px">'
    +'<button class="slm-submit" id="slmResetSubmitBtn" onclick="siteResetVerify()" style="margin-top:8px">重置密码</button>'
    +'<div class="slm-form-footer"><span class="slm-link" onclick="siteSwitchView(\'login\')">想起密码？去登录</span></div>'
    +'</form>'
    +'</div>'
    +'</div>'
    +'<button class="slm-cancel" onclick="hideSiteLoginModal()">取消</button>'
    +'</div>';
  document.body.appendChild(modal);
  modal.addEventListener('click',function(e){if(e.target===this)hideLoginModal();});
  switchView('login');
}

// Expose globals
window.showSiteLoginModal=showLoginModal;
window.hideSiteLoginModal=hideLoginModal;
window.siteGithubLogin=function(){window.location.href=API+'/api/auth/github';};
window.siteGoogleLogin=function(){window.location.href=API+'/api/auth/google';};
window.siteLogin=login;
window.siteSwitchView=switchView;
window.siteRegSendCode=regSendCode;
window.siteRegVerify=regVerify;
window.siteResetSendCode=resetSendCode;
window.siteResetVerify=resetVerify;
window.siteAuthLogout=logout;
window._siteAuth={isLoggedIn:isLoggedIn,getUser:function(){return user;},getToken:function(){return token;},showLogin:showLoginModal};

if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
document.addEventListener('pjax:complete',function(){init();});
window.addEventListener('storage',function(e){if(e.key==='anime_token'||e.key==='anime_user'){token=localStorage.getItem('anime_token')||'';user=JSON.parse(localStorage.getItem('anime_user')||'null');render();}});
window.addEventListener('focus',function(){var t=localStorage.getItem('anime_token')||'';if(t!==token){token=t;user=JSON.parse(localStorage.getItem('anime_user')||'null');render();}});
}catch(e){console.error('[site-auth] init error:',e);}
})();
