---
title: 观看记录
date: 2026-06-01
type: anime
comments: false
---

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

<style>
#history-page{background:#0f0f1a;min-height:100vh;color:#e0e0e0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:0;margin:0}
#history-page *{box-sizing:border-box}
#history-page .top-bar{display:flex;align-items:center;gap:12px;padding:12px 16px;background:#111;position:sticky;top:0;z-index:10}
#history-page .top-bar .back-btn{background:none;border:none;color:#ffd93d;font-size:18px;cursor:pointer;padding:4px 8px}
#history-page .top-bar .back-btn:hover{color:#e94560}
#history-page .top-bar .title-text{color:#ffd93d;font-size:15px;flex:1}
#history-page .top-bar .home-link{color:#aaa;font-size:14px;text-decoration:none;padding:4px 8px}
#history-page .top-bar .home-link:hover{color:#ffd93d}
#history-page .container{max-width:800px;margin:0 auto;padding:16px}
/* Tabs */
#history-page .tabs{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}
#history-page .tabs button{padding:6px 16px;background:transparent;color:#aaa;border:1px solid #333;border-radius:20px;cursor:pointer;font-size:13px}
#history-page .tabs button.active{background:#ffd93d;color:#0f0f1a;border-color:#ffd93d;font-weight:600}
/* Cards */
#history-page .card-list{display:flex;flex-direction:column;gap:12px}
#history-page .history-card{background:#1a1a2e;border-radius:10px;overflow:hidden;display:flex;cursor:pointer;transition:transform .2s,box-shadow .2s;border:1px solid transparent}
#history-page .history-card:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(233,69,96,.15);border-color:#333}
#history-page .history-card img{width:100px;height:140px;object-fit:cover;flex-shrink:0}
#history-page .history-card .card-body{flex:1;padding:12px;display:flex;flex-direction:column;justify-content:space-between;min-width:0}
#history-page .history-card .card-title{color:#ffd93d;font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px}
#history-page .history-card .card-ep{color:#e0e0e0;font-size:13px;margin-bottom:4px}
#history-page .history-card .card-time{color:#888;font-size:12px;margin-bottom:8px}
/* Progress bar */
#history-page .progress-row{display:flex;align-items:center;gap:8px}
#history-page .progress-track{flex:1;height:4px;background:#333;border-radius:2px;overflow:hidden}
#history-page .progress-fill{height:100%;background:#ffd93d;border-radius:2px;transition:width .3s}
#history-page .progress-pct{color:#ffd93d;font-size:11px;min-width:36px;text-align:right}
/* Actions */
#history-page .card-actions{display:flex;gap:8px;margin-top:8px}
#history-page .card-actions button{padding:4px 12px;background:#333;color:#e0e0e0;border:1px solid #444;border-radius:6px;cursor:pointer;font-size:12px}
#history-page .card-actions button:hover{background:#444;color:#ffd93d}
#history-page .card-actions .delete-btn{color:#e94560;border-color:#e94560}
#history-page .card-actions .delete-btn:hover{background:#e94560;color:#fff}
/* Stats */
#history-page .stats-bar{display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap}
#history-page .stat-item{color:#aaa;font-size:13px}
#history-page .stat-item span{color:#ffd93d;font-weight:600}
/* Empty */
#history-page .empty{text-align:center;padding:60px 20px;color:#666}
#history-page .empty i{font-size:48px;margin-bottom:16px;display:block}
#history-page .empty p{margin-bottom:16px}
#history-page .empty a{color:#ffd93d;text-decoration:none}
/* Login prompt */
#history-page .login-prompt{text-align:center;padding:60px 20px}
#history-page .login-prompt i{font-size:48px;color:#555;margin-bottom:16px;display:block}
#history-page .login-prompt h3{color:#ffd93d;margin-bottom:8px}
#history-page .login-prompt p{color:#888;margin-bottom:16px}
#history-page .login-prompt button{padding:8px 24px;background:#ffd93d;color:#0f0f1a;border:none;border-radius:20px;cursor:pointer;font-size:14px;font-weight:600}
@media(max-width:600px){
#history-page .history-card img{width:70px;height:95px}
#history-page .history-card .card-body{padding:10px}
#history-page .history-card .card-title{font-size:13px}
#history-page .container{padding:12px}
#history-page .tabs{gap:6px}
#history-page .tabs button{padding:5px 12px;font-size:12px}
#history-page .stats-bar{gap:12px}
#history-page .card-actions button{padding:3px 8px;font-size:11px}
}
</style>

<div id="history-page">
  <div class="top-bar">
    <button class="back-btn" onclick="history.back()"><i class="fas fa-arrow-left"></i></button>
    <span class="title-text"><i class="fas fa-history"></i> 观看记录</span>
    <a class="home-link" href="/anime/"><i class="fas fa-film"></i> 影视屋</a>
  </div>

  <div class="container" id="historyContainer">
    <div style="text-align:center;padding:40px;color:#aaa"><i class="fas fa-spinner fa-spin"></i> 加载中...</div>
  </div>
</div>

<script>
(function(){
var API='https://ffzy.233002.xyz';
function getToken(){return localStorage.getItem('anime_token')||'';}

var container=document.getElementById('historyContainer');

if(!getToken()){
  container.innerHTML='<div class="login-prompt"><i class="fas fa-user-lock"></i><h3>请先登录</h3><p>登录后可查看观看记录</p><button onclick="showSiteLoginModal()">去登录</button></div>';
  // Re-check on login
  window.addEventListener('storage',function(e){if(e.key==='anime_token'&&getToken())loadHistory();});
  return;
}

loadHistory();

async function loadHistory(){
  try{
    var res=await fetch(API+'/api/history',{headers:{'Authorization':'Bearer '+getToken()}});
    var data=await res.json();
    var items=data.list||[];

    if(items.length===0){
      container.innerHTML='<div class="empty"><i class="fas fa-film"></i><p>暂无观看记录</p><a href="/anime/">去看看有什么好看的</a></div>';
      return;
    }

    // Stats
    var watching=items.filter(function(h){return h.duration>0&&(h.position/h.duration)<0.95;}).length;
    var finished=items.length-watching;

    var html='<div class="stats-bar">';
    html+='<div class="stat-item">共 <span>'+items.length+'</span> 部</div>';
    html+='<div class="stat-item">在看 <span>'+watching+'</span></div>';
    html+='<div class="stat-item">看完 <span>'+finished+'</span></div>';
    html+='</div>';

    html+='<div class="tabs">';
    html+='<button class="active" data-filter="all">全部</button>';
    html+='<button data-filter="watching">在看</button>';
    html+='<button data-filter="finished">看完</button>';
    html+='</div>';

    html+='<div class="card-list" id="cardList">';
    items.forEach(function(h,i){
      var pct=h.duration>0?Math.round(h.position/h.duration*100):0;
      var isFinished=pct>=95;
      var status=isFinished?'finished':'watching';
      html+='<div class="history-card" data-status="'+status+'" data-idx="'+i+'" onclick="goPlay('+h.vod_id+','+h.episode_index+')">';
      if(h.vod_pic)html+='<img src="'+h.vod_pic+'" onerror="this.style.display=\'none\'">';
      html+='<div class="card-body">';
      html+='<div class="card-title">'+h.vod_name+'</div>';
      html+='<div class="card-ep">第'+(h.episode_index+1)+'集 '+(h.episode_name||'')+'</div>';
      html+='<div class="card-time"><i class="fas fa-clock"></i> '+formatDate(h.updated_at)+'</div>';
      html+='<div class="progress-row"><div class="progress-track"><div class="progress-fill" style="width:'+pct+'%"></div></div><span class="progress-pct">'+pct+'%</span></div>';
      html+='<div class="card-actions">';
      html+='<button onclick="event.stopPropagation();goPlay('+h.vod_id+','+h.episode_index+')"><i class="fas fa-play"></i> 继续</button>';
      if(isFinished)html+='<button onclick="event.stopPropagation();goPlay('+h.vod_id+',0)"><i class="fas fa-redo"></i> 重看</button>';
      html+='<button class="delete-btn" onclick="event.stopPropagation();deleteHistory('+h.vod_id+','+i+')"><i class="fas fa-trash"></i></button>';
      html+='</div></div></div>';
    });
    html+='</div>';

    container.innerHTML=html;

    // Tab filter
    container.querySelectorAll('.tabs button').forEach(function(btn){
      btn.addEventListener('click',function(){
        container.querySelectorAll('.tabs button').forEach(function(b){b.classList.remove('active');});
        btn.classList.add('active');
        var filter=btn.dataset.filter;
        container.querySelectorAll('.history-card').forEach(function(card){
          if(filter==='all')card.style.display='';
          else card.style.display=card.dataset.status===filter?'':'none';
        });
      });
    });

  }catch(e){
    container.innerHTML='<div class="empty"><i class="fas fa-exclamation-circle"></i><p>加载失败</p></div>';
  }
}

window.goPlay=function(vodId,ep){
  window.location.href='/anime/play/?vod_id='+vodId+'&ep='+(ep||0);
};

window.deleteHistory=async function(vodId,idx){
  if(!confirm('确定删除这条记录？'))return;
  try{
    await fetch(API+'/api/history/'+vodId,{method:'DELETE',headers:{'Authorization':'Bearer '+getToken()}});
    loadHistory();
  }catch(e){}
};

function formatDate(s){
  if(!s)return'-';
  try{var d=new Date(s.endsWith('Z')?s:s+'Z');return d.toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});}catch(e){return s;}
}

})();
</script>
