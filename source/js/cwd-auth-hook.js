/**
 * CWD Comment Integration — auto-fill user info from site-auth, check login before submit
 * Depends on: site-auth.js (must load after it)
 */
(function(){
  function fillCWDUserInfo(){
    var auth=window._siteAuth;
    if(!auth||!auth.isLoggedIn())return;
    var u=auth.getUser();
    if(!u)return;
    var name=u.display_name||u.email?u.email.split('@')[0]:'user';
    var email=u.email||'';
    try{localStorage.setItem('cwd_user_info',JSON.stringify({name:name,email:email,url:''}));}catch(e){}
  }

  // Intercept CWD submit — check login
  function interceptCWD(){
    var host=document.querySelector('#cwd-comments');
    if(!host||!host.shadowRoot)return;
    var sr=host.shadowRoot;

    // Find submit buttons and add click handlers
    function hookButtons(){
      var btns=sr.querySelectorAll('.cwd-btn-primary');
      btns.forEach(function(btn){
        if(btn._authHooked)return;
        btn._authHooked=true;
        btn.addEventListener('click',function(e){
          var auth=window._siteAuth;
          if(!auth||!auth.isLoggedIn()){
            e.preventDefault();e.stopPropagation();
            if(auth&&auth.showLogin)auth.showLogin();
            return false;
          }
        },true);
      });
    }

    // Observer to re-fill on DOM changes
    var obs=new MutationObserver(function(){
      fillCWDUserInfo();
      hookButtons();
    });
    obs.observe(sr,{childList:true,subtree:true});
    hookButtons();
  }

  function init(){
    fillCWDUserInfo();
    // Wait for CWD shadow root
    var tries=0;
    var timer=setInterval(function(){
      tries++;
      var host=document.querySelector('#cwd-comments');
      if(host&&host.shadowRoot){clearInterval(timer);interceptCWD();}
      if(tries>50)clearInterval(timer);
    },200);
  }

  // Re-init on pjax
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}
  else{init();}
  document.addEventListener('pjax:complete',function(){fillCWDUserInfo();setTimeout(interceptCWD,1000);});
  // Re-fill when login state changes
  window.addEventListener('storage',function(e){if(e.key==='anime_token')fillCWDUserInfo();});
})();
