(function(){
var API='https://ffzy.233002.xyz';
var token=localStorage.getItem('anime_token')||'';
var user=JSON.parse(localStorage.getItem('anime_user')||'null');
var countdown=0;

function isLoggedIn(){return !!token;}

function render(){
  var bar=document.getElementById('site-auth-bar');
  if(!bar)return;
  if(isLoggedIn()){
    var avatarHtml=user&&user.avatar_url?'<img src="'+user.avatar_url+'" alt="">':'<i class="fas fa-user" style="font-size:10px"></i>';
    var name=user?(user.display_name||user.email.split('@')[0]):'';
    bar.innerHTML='<div class="auth-user-info">'
      +'<div class="auth-avatar-sm" onclick="window.location.href=\'/anime/\'" title="个人中心">'+avatarHtml+'</div>'
      +'<span class="auth-name" onclick="window.location.href=\'/anime/\'" title="个人中心">'+name+'</span>'
      +'<button class="auth-logout" onclick="siteAuthLogout()" title="退出"><i class="fas fa-sign-out-alt"></i></button>'
      +'</div>';
  }else{
    bar.innerHTML='<button class="auth-login-btn" onclick="showSiteLoginModal()"><i class="fas fa-user"></i> 登录</button>';
  }
}

window.showSiteLoginModal=function(){
  var m=document.getElementById('site-login-modal');
  if(m){m.classList.add('show');resetEmailForm();}
};
function hideSiteLoginModal(){
  var m=document.getElementById('site-login-modal');if(m)m.classList.remove('show');
}
window.hideSiteLoginModal=hideSiteLoginModal;

function resetEmailForm(){
  var inp=document.getElementById('slmEmailInput');
  var codeInp=document.getElementById('slmCodeInput');
  var err=document.getElementById('slmError');
  if(inp)inp.value='';
  if(codeInp)codeInp.value='';
  if(err)err.textContent='';
  var btn=document.getElementById('slmSendBtn');
  if(btn){btn.disabled=false;btn.textContent='发送验证码';}
  countdown=0;
}

// GitHub login
window.siteGithubLogin=function(){window.location.href=API+'/api/auth/github';};

// Google login
window.siteGoogleLogin=function(){window.location.href=API+'/api/auth/google';};

// Email: send code
window.siteSendCode=function(){
  var email=document.getElementById('slmEmailInput').value.trim();
  var err=document.getElementById('slmError');
  var btn=document.getElementById('slmSendBtn');
  if(!email||email.indexOf('@')<0){err.textContent='请输入有效邮箱';err.style.color='#e94560';return;}
  err.textContent='发送中...';err.style.color='#aaa';
  btn.disabled=true;
  fetch(API+'/api/auth/email/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email})})
  .then(function(r){return r.json()})
  .then(function(data){
    if(data.error){err.textContent=data.error;err.style.color='#e94560';btn.disabled=false;return;}
    if(data.dev_code){
      err.textContent='验证码已发送 (开发模式: '+data.dev_code+')';err.style.color='#4ecdc4';
    }else{
      err.textContent='验证码已发送到邮箱';err.style.color='#4ecdc4';
    }
    // Show code input
    document.getElementById('slmCodeWrap').style.display='flex';
    document.getElementById('slmCodeInput').focus();
    // Countdown
    countdown=60;
    var timer=setInterval(function(){
      countdown--;
      if(countdown<=0){clearInterval(timer);btn.disabled=false;btn.textContent='发送验证码';}
      else{btn.textContent=countdown+'s';}
    },1000);
  })
  .catch(function(){err.textContent='网络错误';err.style.color='#e94560';btn.disabled=false;});
};

// Email: verify code
window.siteVerifyCode=function(){
  var email=document.getElementById('slmEmailInput').value.trim();
  var code=document.getElementById('slmCodeInput').value.trim();
  var err=document.getElementById('slmError');
  if(!code){err.textContent='请输入验证码';err.style.color='#e94560';return;}
  err.textContent='验证中...';err.style.color='#aaa';
  fetch(API+'/api/auth/email/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email,code:code})})
  .then(function(r){return r.json()})
  .then(function(data){
    if(data.error){err.textContent=data.error;err.style.color='#e94560';return;}
    token=data.token;user=data.user;
    localStorage.setItem('anime_token',token);
    localStorage.setItem('anime_user',JSON.stringify(user));
    render();hideSiteLoginModal();
  })
  .catch(function(){err.textContent='网络错误';err.style.color='#e94560';});
};

// Logout
window.siteAuthLogout=function(){
  fetch(API+'/api/auth/logout',{method:'POST',headers:{'Authorization':'Bearer '+token}}).catch(function(){});
  token='';user=null;
  localStorage.removeItem('anime_token');
  localStorage.removeItem('anime_user');
  render();
};

// Handle OAuth callback
function handleOAuthCallback(){
  var params=new URLSearchParams(window.location.search);
  var authParam=params.get('auth');
  if(authParam){
    try{
      var data=JSON.parse(decodeURIComponent(authParam));
      if(data.token&&data.user){
        token=data.token;user=data.user;
        localStorage.setItem('anime_token',token);
        localStorage.setItem('anime_user',JSON.stringify(user));
        render();
      }
    }catch(e){}
    // Clean URL
    var url=new URL(window.location.href);
    url.searchParams.delete('auth');
    window.history.replaceState({},'',url.toString());
  }
}

// Validate token
function validate(){
  if(!token){render();return;}
  fetch(API+'/api/auth/me',{headers:{'Authorization':'Bearer '+token}})
  .then(function(r){if(!r.ok)throw new Error();return r.json();})
  .then(function(data){if(data.user){user=data.user;localStorage.setItem('anime_user',JSON.stringify(user));}})
  .catch(function(){token='';user=null;localStorage.removeItem('anime_token');localStorage.removeItem('anime_user');})
  .then(function(){render();});
}

function init(){
  handleOAuthCallback();
  if(!document.getElementById('site-login-modal')){
    var modal=document.createElement('div');modal.id='site-login-modal';
    modal.innerHTML='<div class="slm-box">'
      +'<h3>登录 Mercury 博客</h3>'
      +'<p class="slm-sub">选择登录方式，已有账户自动关联</p>'
      +'<div class="slm-error" id="slmError"></div>'
      +'<div class="slm-oauth">'
      +'<button class="slm-oauth-btn github" onclick="siteGithubLogin()"><span class="slm-icon"><i class="fab fa-github"></i></span> 使用 GitHub 登录</button>'
      +'<button class="slm-oauth-btn google" onclick="siteGoogleLogin()"><span class="slm-icon"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg></span> 使用 Google 登录</button>'
      +'</div>'
      +'<div class="slm-divider">或使用邮箱验证码</div>'
      +'<div class="slm-email-form">'
      +'<div class="slm-email-row"><input type="email" id="slmEmailInput" placeholder="your@email.com" onkeydown="if(event.key===\'Enter\')siteSendCode()"><button class="slm-send-btn" id="slmSendBtn" onclick="siteSendCode()">发送验证码</button></div>'
      +'<div class="slm-email-row" id="slmCodeWrap" style="display:none"><input type="text" id="slmCodeInput" placeholder="输入6位验证码" maxlength="6" onkeydown="if(event.key===\'Enter\')siteVerifyCode()"><button class="slm-submit" style="width:auto;padding:10px 20px" onclick="siteVerifyCode()">验证</button></div>'
      +'</div>'
      +'<button class="slm-cancel" onclick="hideSiteLoginModal()">取消</button>'
      +'</div>';
    document.body.appendChild(modal);
    modal.addEventListener('click',function(e){if(e.target===this)hideSiteLoginModal();});
  }
  validate();
}

if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
document.addEventListener('pjax:complete',function(){if(!document.getElementById('site-auth-bar'))init();});
window.addEventListener('storage',function(e){if(e.key==='anime_token'||e.key==='anime_user'){token=localStorage.getItem('anime_token')||'';user=JSON.parse(localStorage.getItem('anime_user')||'null');render();}});
window.addEventListener('focus',function(){var t=localStorage.getItem('anime_token')||'';if(t!==token){token=t;user=JSON.parse(localStorage.getItem('anime_user')||'null');render();}});
})();
