(function(){
var AUTH_API='https://auth.233002.xyz';
var DATA_API='https://auth.233002.xyz';
var $=function(id){return document.getElementById(id);};

function init(){
var token=function(){return localStorage.getItem('anime_token')||'';};

function api(path,opt){
  opt=opt||{};
  var headers=opt.headers||{'Content-Type':'application/json'};
  var t=token();if(t)headers['Authorization']='Bearer '+t;
  var ctrl=new AbortController();
  var timer=setTimeout(function(){ctrl.abort();},10000);
  var base=path.indexOf('/api/auth/')===0?AUTH_API:DATA_API;
  return fetch(base+path,{method:opt.method||'GET',headers:headers,body:opt.body?JSON.stringify(opt.body):undefined,signal:ctrl.signal})
    .then(function(r){clearTimeout(timer);return r.json();})
    .catch(function(e){clearTimeout(timer);throw e;});
}

function render(data){
  var el=$('ucLoading');if(el)el.style.display='none';
  if(!token()){
    var nl=$('ucNotLogin');if(nl)nl.style.display='';
    return;
  }
  var mm=$('ucMain');if(mm)mm.style.display='';
  var u=data.user;
  var av=$('ucAvatar');
  if(av){
    if(u.avatar_url)av.innerHTML='<img src="'+u.avatar_url+'" alt="">';
    else av.innerHTML='<i class="fas fa-user"></i>';
  }
  var ne=$('ucName');if(ne)ne.textContent=u.display_name||u.email.split('@')[0];
  var em=$('ucEmail');if(em)em.textContent=u.email||'未绑定邮箱';
  var parts=[];
  if(u.created_at)parts.push('注册于 '+u.created_at.split('T')[0]);
  var mt=$('ucMeta');if(mt)mt.textContent=parts.join(' · ');

    // Comment info section
    var cn=$('ucCommentName');if(cn)cn.textContent=u.display_name||u.email.split('@')[0];
    var ce=$('ucCommentEmail');if(ce)ce.textContent=u.email||'未绑定邮箱';
    var cw=$('ucCommentWebsite');if(cw)cw.textContent=u.website||'未设置';

    var linked=data.linked||[];
  var types={};
  linked.forEach(function(a){types[a.auth_type]=a.auth_id;});
  setStatus('github',types.github||null);
  setStatus('google',types.google||null);
  setStatus('email',u.email||null);

  // Password section
  var ps=$('ucPasswordSection');
  if(ps){
    if(data.has_password){
      ps.innerHTML='<h3 class="uc-card-title"><i class="fas fa-lock"></i> 密码管理</h3>'
        +'<button class="uc-btn uc-btn-secondary" onclick="ucShowChangePwdModal()"><i class="fas fa-key"></i> 修改密码</button>';
    }else{
      ps.innerHTML='<h3 class="uc-card-title"><i class="fas fa-lock"></i> 密码管理</h3>'
        +'<p class="uc-hint" style="text-align:left;padding:0 0 8px;color:#ffd93d">你还没有设置密码，请设置密码以便邮箱登录</p>'
        +'<button class="uc-btn uc-btn-primary" onclick="ucShowSetPwdModal()"><i class="fas fa-key"></i> 设置密码</button>';
    }
  }
}

function capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1);}

function setStatus(type,val){
  var s=$('uc'+capitalize(type)+'Status');
  var b=$('uc'+capitalize(type)+'Btn');
  if(type==='email'){
    if(s){s.textContent=val||'未绑定';s.className='uc-account-status'+(val?' linked':'');}
    return;
  }
  if(!s||!b)return;
  if(val){
    s.textContent='已关联';s.className='uc-account-status linked';
    b.textContent='解绑';b.className='uc-btn uc-btn-sm uc-btn-danger';
    b.onclick=function(){unlinkAccount(type);};
  }else{
    s.textContent='未关联';s.className='uc-account-status';
    b.textContent='关联';b.className='uc-btn uc-btn-sm';
    b.onclick=function(){linkAccount(type);};
  }
}

function linkAccount(type){
  window.location.href=AUTH_API+'/api/auth/'+type+'?link_token='+encodeURIComponent(token());
}

function unlinkAccount(type){
  if(!confirm('确定要解绑'+type+'账户吗？'))return;
  api('/api/auth/unlink',{method:'POST',body:{type:type}}).then(function(d){
    if(d.error){alert(d.error);return;}
    load();
  });
}

// Show change password modal
function showChangePwdModal(){
  var m=$('ucPwdModal');if(!m)return;
  m.classList.add('show');
  $('ucPwdOldInput').value='';
  $('ucPwdNewInput').value='';
  $('ucPwdConfirmInput').value='';
  $('ucPwdError').textContent='';
  $('ucPwdTitle').textContent='修改密码';
  $('ucPwdOldWrap').style.display='';
  $('ucPwdOldInput').focus();
}

function showSetPwdModal(){
  var m=$('ucPwdModal');if(!m)return;
  m.classList.add('show');
  $('ucPwdOldInput').value='';
  $('ucPwdNewInput').value='';
  $('ucPwdConfirmInput').value='';
  $('ucPwdError').textContent='';
  $('ucPwdTitle').textContent='设置密码';
  $('ucPwdOldWrap').style.display='none';
  $('ucPwdNewInput').focus();
}

function changePassword(){
  var oldPwd=$('ucPwdOldInput')?$('ucPwdOldInput').value:'';
  var newPwd=$('ucPwdNewInput').value;
  var confirmPwd=$('ucPwdConfirmInput').value;
  var err=$('ucPwdError');
  if(!newPwd||newPwd.length<6){err.textContent='密码至少6位';return;}
  if(newPwd!==confirmPwd){err.textContent='两次密码不一致';return;}
  var isSet=$('ucPwdOldWrap').style.display==='none';
  var body=isSet?{new_password:newPwd}:{old_password:oldPwd,new_password:newPwd};
  var btn=$('ucPwdSaveBtn');if(btn)btn.disabled=true;
  api('/api/auth/password',{method:'PUT',body:body}).then(function(d){
    if(btn)btn.disabled=false;
    if(d.error){err.textContent=d.error;return;}
    alert('密码'+(isSet?'设置':'修改')+'成功');
    $('ucPwdModal').classList.remove('show');
    load();
  }).catch(function(){if(btn)btn.disabled=false;err.textContent='网络错误';});
}

// Bind events safely
var ne=$('ucNameEdit');
if(ne)ne.onclick=function(){
  var ni=$('ucNameInput'),nn=$('ucName'),nm=$('ucNameModal');
  if(ni&&nn)ni.value=nn.textContent;
  if(nm)nm.classList.add('show');
  if(ni)ni.focus();
};

var nc=$('ucNameCancel');
if(nc)nc.onclick=function(){var m=$('ucNameModal');if(m)m.classList.remove('show');};

var ns=$('ucNameSave');
if(ns)ns.onclick=function(){
  var ni=$('ucNameInput');if(!ni)return;
  var name=ni.value.trim();if(!name)return;
  api('/api/auth/profile',{method:'PUT',body:{display_name:name}}).then(function(d){
    if(d.error){alert(d.error);return;}
    var nn=$('ucName');if(nn)nn.textContent=name;
    var u=JSON.parse(localStorage.getItem('anime_user')||'{}');
    u.display_name=name;localStorage.setItem('anime_user',JSON.stringify(u));
    var m=$('ucNameModal');if(m)m.classList.remove('show');
  });
};

var nm=$('ucNameModal');
if(nm)nm.addEventListener('click',function(e){if(e.target===this){var m=$('ucNameModal');if(m)m.classList.remove('show');}});

var ae=$('ucAvatarEdit');
if(ae)ae.onclick=function(){
  var am=$('ucAvatarModal'),ai=$('ucAvatarInput');
  if(am)am.classList.add('show');
  if(ai)ai.focus();
};

var ac=$('ucAvatarCancel');
if(ac)ac.onclick=function(){var m=$('ucAvatarModal');if(m)m.classList.remove('show');};

var as=$('ucAvatarSave');
if(as)as.onclick=function(){
  var ai=$('ucAvatarInput');if(!ai)return;
  var url=ai.value.trim();
  api('/api/auth/profile',{method:'PUT',body:{avatar_url:url}}).then(function(d){
    if(d.error){alert(d.error);return;}
    var av=$('ucAvatar');
    if(av){if(url)av.innerHTML='<img src="'+url+'" alt="">';else av.innerHTML='<i class="fas fa-user"></i>';}
    var u=JSON.parse(localStorage.getItem('anime_user')||'{}');
    u.avatar_url=url;localStorage.setItem('anime_user',JSON.stringify(u));
    var m=$('ucAvatarModal');if(m)m.classList.remove('show');
  });
};

var am=$('ucAvatarModal');
if(am)am.addEventListener('click',function(e){if(e.target===this){var m=$('ucAvatarModal');if(m)m.classList.remove('show');}});

// Website modal events
var we=$('ucWebsiteEdit');
if(we)we.onclick=function(){
  var wm=$('ucWebsiteModal'),wi=$('ucWebsiteInput'),cw=$('ucCommentWebsite');
  if(wm)wm.classList.add('show');
  if(wi&&cw)wi.value=cw.textContent!=='未设置'?cw.textContent:'';
  if(wi)wi.focus();
};
var wc=$('ucWebsiteCancel');
if(wc)wc.onclick=function(){var m=$('ucWebsiteModal');if(m)m.classList.remove('show');};
var ws=$('ucWebsiteSave');
if(ws)ws.onclick=function(){
  var wi=$('ucWebsiteInput');if(!wi)return;
  var url=wi.value.trim();
  api('/api/auth/profile',{method:'PUT',body:{website:url}}).then(function(d){
    if(d.error){alert(d.error);return;}
    var cw=$('ucCommentWebsite');if(cw)cw.textContent=url||'未设置';
    var u=JSON.parse(localStorage.getItem('anime_user')||'{}');
    u.website=url;localStorage.setItem('anime_user',JSON.stringify(u));
    var m=$('ucWebsiteModal');if(m)m.classList.remove('show');
  });
};
var wm=$('ucWebsiteModal');
if(wm)wm.addEventListener('click',function(e){if(e.target===this)this.classList.remove('show');});

// Password modal events
var pwdModal=$('ucPwdModal');
if(pwdModal){
  pwdModal.addEventListener('click',function(e){if(e.target===this)this.classList.remove('show');});
  var pwdCancel=$('ucPwdCancel');
  if(pwdCancel)pwdCancel.onclick=function(){pwdModal.classList.remove('show');};
  var pwdSave=$('ucPwdSaveBtn');
  if(pwdSave)pwdSave.onclick=changePassword;
}

var lb=$('ucLogoutBtn');
if(lb)lb.onclick=function(){
  if(!confirm('确定退出登录？'))return;
  fetch(AUTH_API+'/api/auth/logout',{method:'POST',headers:{'Authorization':'Bearer '+token()}}).catch(function(){});
  localStorage.removeItem('anime_token');localStorage.removeItem('anime_user');
  window.location.href='/';
};

var db=$('ucDeleteBtn');
if(db)db.onclick=function(){
  var m=$('ucDeleteModal');
  if(m)m.classList.add('show');
};

var dc=$('ucDeleteCancel');
if(dc)dc.onclick=function(){var m=$('ucDeleteModal');if(m)m.classList.remove('show');};

var dk=$('ucDeleteConfirm');
if(dk)dk.onclick=function(){
  var pwdInput=$('ucDeletePwdInput');
  var pwd=pwdInput?pwdInput.value:'';
  var err=$('ucDeleteError');
  api('/api/auth/account',{method:'DELETE',body:{password:pwd}}).then(function(d){
    if(d.error){if(err)err.textContent=d.error;return;}
    localStorage.removeItem('anime_token');localStorage.removeItem('anime_user');
    alert('账号已注销');window.location.href='/';
  }).catch(function(){if(err)err.textContent='网络错误';});
};

var dm=$('ucDeleteModal');
if(dm)dm.addEventListener('click',function(e){if(e.target===this)this.classList.remove('show');});

var lg=$('ucLoginBtn');
if(lg)lg.onclick=function(){if(window.showSiteLoginModal)showSiteLoginModal();};

function load(){
  api('/api/auth/me').then(function(d){
    if(d.error||!d.user){
      var el=$('ucLoading');if(el)el.style.display='none';
      var nl=$('ucNotLogin');if(nl)nl.style.display='';
      return;
    }
    render(d);
    loadHistory();
  }).catch(function(){
    var el=$('ucLoading');if(el)el.style.display='none';
    var nl=$('ucNotLogin');if(nl)nl.style.display='';
  });
}

// 监听登录状态变化，自动刷新
try{window.addEventListener('anime_login_change', load);}catch(e){}

function loadHistory(){
  api('/api/history').then(function(d){
    var list=d.list||[];
    var el=$('ucHistoryList');
    if(!el)return;
    if(!d.logged_in||list.length===0){
      el.innerHTML='<div class="uc-hint">暂无观看记录</div>';
      return;
    }
    var html='';
    var show=list.slice(0,5);
    show.forEach(function(h){
      var pct=h.duration>0?Math.round(h.position/h.duration*100):0;
      html+='<div class="uc-history-item" onclick="window.location.href=\'/anime/play/?vod_id='+h.vod_id+'&ep='+h.episode_index+'\'">';
      if(h.vod_pic)html+='<img src="'+h.vod_pic+'" onerror="this.style.display=\'none\'">';
      html+='<div class="uc-history-info">';
      html+='<div class="uc-history-title">'+h.vod_name+'</div>';
      html+='<div class="uc-history-ep">第'+(h.episode_index+1)+'集 '+(h.episode_name||'')+'</div>';
      html+='<div class="uc-history-time"><i class="fas fa-clock"></i> '+formatDate(h.updated_at)+'</div>';
      html+='<div class="uc-history-progress"><div class="uc-pbar"><div class="uc-pfill" style="width:'+pct+'%"></div></div><span class="uc-ppct">'+pct+'%</span></div>';
      html+='</div></div>';
    });
    if(list.length>5){
      html+='<div class="uc-history-more"><a href="/anime/history/">查看全部 '+list.length+' 条记录 →</a></div>';
    }
    el.innerHTML=html;
  }).catch(function(){
    var el=$('ucHistoryList');if(el)el.innerHTML='<div class="uc-hint">加载失败</div>';
  });
}

function formatDate(s){
  if(!s)return'-';
  try{var d=new Date(s.endsWith('Z')?s:s+'Z');return d.toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});}catch(e){return s;}
}

load();
}

// 等待 DOM 元素就绪后 init
function waitForElement(selector, callback, maxTries) {
  maxTries = maxTries || 50;
  var el = document.getElementById(selector);
  if (el) { callback(); return; }
  var tries = 0;
  var timer = setInterval(function() {
    tries++;
    el = document.getElementById(selector);
    if (el) { clearInterval(timer); callback(); return; }
    if (tries >= maxTries) { clearInterval(timer); }
  }, 200);
}
waitForElement('ucLoading', init);

// Expose functions for HTML onclick
window.ucShowChangePwdModal=function(){
  var m=document.getElementById('ucPwdModal');if(!m)return;
  m.classList.add('show');
  var o=document.getElementById('ucPwdOldInput');if(o){o.value='';o.focus();}
  var n=document.getElementById('ucPwdNewInput');if(n)n.value='';
  var c=document.getElementById('ucPwdConfirmInput');if(c)c.value='';
  var e=document.getElementById('ucPwdError');if(e)e.textContent='';
  var t=document.getElementById('ucPwdTitle');if(t)t.textContent='修改密码';
  var w=document.getElementById('ucPwdOldWrap');if(w)w.style.display='';
};
window.ucShowSetPwdModal=function(){
  var m=document.getElementById('ucPwdModal');if(!m)return;
  m.classList.add('show');
  var o=document.getElementById('ucPwdOldInput');if(o)o.value='';
  var n=document.getElementById('ucPwdNewInput');if(n){n.value='';n.focus();}
  var c=document.getElementById('ucPwdConfirmInput');if(c)c.value='';
  var e=document.getElementById('ucPwdError');if(e)e.textContent='';
  var t=document.getElementById('ucPwdTitle');if(t)t.textContent='设置密码';
  var w=document.getElementById('ucPwdOldWrap');if(w)w.style.display='none';
};
window.ucChangePassword=function(){
  var oldPwd=(document.getElementById('ucPwdOldInput')||{}).value||'';
  var newPwd=(document.getElementById('ucPwdNewInput')||{}).value;
  var confirmPwd=(document.getElementById('ucPwdConfirmInput')||{}).value;
  var err=document.getElementById('ucPwdError');
  if(!newPwd||newPwd.length<6){if(err)err.textContent='密码至少6位';return;}
  if(newPwd!==confirmPwd){if(err)err.textContent='两次密码不一致';return;}
  var isSet=(document.getElementById('ucPwdOldWrap')||{}).style.display==='none';
  var tkn=localStorage.getItem('anime_token')||'';
  var body=isSet?{new_password:newPwd}:{old_password:oldPwd,new_password:newPwd};
  fetch('https://auth.233002.xyz/api/auth/password',{method:'PUT',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tkn},body:JSON.stringify(body)})
  .then(function(r){return r.json()})
  .then(function(d){
    if(d.error){if(err)err.textContent=d.error;return;}
    alert('密码'+(isSet?'设置':'修改')+'成功');
    var m=document.getElementById('ucPwdModal');if(m)m.classList.remove('show');
    window.location.reload();
  }).catch(function(){if(err)err.textContent='网络错误';});
};
})();
