/**
 * CWD Comment Integration — auto-fill user info from site-auth when logged in
 * When not logged in, CWD form shows name/email/url fields for direct input
 * Depends on: site-auth.js (optional, loads if available)
 */
(function(){
  function fillCWDUserInfo(){
    var auth=window._siteAuth;
    if(!auth||!auth.isLoggedIn())return;
    var u=auth.getUser();
    if(!u)return;
    var name=u.display_name||(u.email?u.email.split('@')[0]:'user');
    var email=u.email||'';
    try{localStorage.setItem('cwd_user_info',JSON.stringify({name:name,email:email,url:''}));}catch(e){}
  }

  function init(){
    fillCWDUserInfo();
    // Re-fill when login state changes (user logs in/out)
    window.addEventListener('storage',function(e){
      if(e.key==='anime_token'||e.key==='anime_user')fillCWDUserInfo();
    });
  }

  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}
  else{init();}
  document.addEventListener('pjax:complete',function(){fillCWDUserInfo();});
})();
