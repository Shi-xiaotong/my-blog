(function(){
var API='https://ffzy.233002.xyz';
var $=function(id){return document.getElementById(id);};

function init(){
var token=function(){return localStorage.getItem('anime_token')||'';};

function api(path,opt){
  opt=opt||{};
  var headers=opt.headers||{'Content-Type':'application/json'};
  var t=token();if(t)headers['Authorization']='Bearer '+t;
  var ctrl=new AbortController();
  var timer=setTimeout(function(){ctrl.abort();},10000);
  return fetch(API+path,{method:opt.method||'GET',headers:headers,body:opt.body?JSON.stringify(opt.body):undefined,signal:ctrl.signal})
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
  if(u.auth_type)parts.push('主要登录: '+u.auth_type);
  var mt=$('ucMeta');if(mt)mt.textContent=parts.join(' · ');

  var linked=data.linked||[];
  var types={};
  linked.forEach(function(a){types[a.auth_type]=a.auth_id;});
  setStatus('github',types.github||null);
  setStatus('google',types.google||null);
  setStatus('email',u.email||null);
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
  window.location.href=API+'/api/auth/'+type+'?link_token='+encodeURIComponent(token());
}

function unlinkAccount(type){
  if(!confirm('确定要解绑'+type+'账户吗？'))return;
  api('/api/auth/unlink',{method:'POST',body:{type:type}}).then(function(d){
    if(d.error){alert(d.error);return;}
    load();
  });
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

var lb=$('ucLogoutBtn');
if(lb)lb.onclick=function(){
  if(!confirm('确定退出登录？'))return;
  fetch(API+'/api/auth/logout',{method:'POST',headers:{'Authorization':'Bearer '+token()}}).catch(function(){});
  localStorage.removeItem('anime_token');localStorage.removeItem('anime_user');
  window.location.href='/';
};

var db=$('ucDeleteBtn');
if(db)db.onclick=function(){
  if(!confirm('确定要注销账号？所有数据将被删除且无法恢复！'))return;
  if(!confirm('最后确认：真的要永久删除你的账号吗？'))return;
  api('/api/auth/account',{method:'DELETE'}).then(function(d){
    if(d.error){alert(d.error);return;}
    localStorage.removeItem('anime_token');localStorage.removeItem('anime_user');
    alert('账号已注销');window.location.href='/';
  });
};

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
  }).catch(function(){
    var el=$('ucLoading');if(el)el.style.display='none';
    var nl=$('ucNotLogin');if(nl)nl.style.display='';
  });
}

load();
}

// Wait for DOM element then init
var tries=0;
var timer=setInterval(function(){
  tries++;
  if(document.getElementById('ucLoading')){clearInterval(timer);init();}
  if(tries>100){clearInterval(timer);}
},200);
})();
