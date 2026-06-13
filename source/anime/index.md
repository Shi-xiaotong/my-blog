---
title: 影视屋
date: 2026-05-31 16:00:00
type: anime
---

<style>
#anime-page{background:#0f0f1a;min-height:100vh;color:#e0e0e0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:0;margin:0}
#anime-page *{box-sizing:border-box}
#anime-page .nav-links{display:flex;justify-content:center;gap:16px;padding:10px 16px}
#anime-page .nav-links a{color:#aaa;text-decoration:none;font-size:13px;padding:4px 12px;border:1px solid #333;border-radius:16px;transition:all .2s}
#anime-page .nav-links a:hover{color:#ffd93d;border-color:#ffd93d}
#anime-page .search-bar{display:flex;max-width:700px;margin:10px auto;padding:0 16px}
#anime-page .search-bar input{flex:1;padding:10px 16px;border:1px solid #333;border-radius:20px 0 0 20px;background:#1a1a2e;color:#fff;font-size:15px;outline:none}
#anime-page .search-bar input:focus{border-color:#ffd93d}
#anime-page .search-bar button{padding:10px 24px;background:#ffd93d;color:#0f0f1a;border:none;border-radius:0 20px 20px 0;cursor:pointer;font-size:15px;font-weight:600}
#anime-page .search-bar button:hover{background:#e94560;color:#fff}
#anime-page .tabs{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;padding:10px 16px;max-width:900px;margin:0 auto}
#anime-page .tabs button{padding:6px 18px;border:1px solid #333;background:transparent;color:#aaa;border-radius:20px;cursor:pointer;font-size:14px;transition:all .2s}
#anime-page .tabs button.active{background:#ffd93d;color:#0f0f1a;border-color:#ffd93d;font-weight:600}
#anime-page .tabs button:hover{border-color:#ffd93d;color:#ffd93d}
#anime-page .card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:16px;padding:16px;max-width:1200px;margin:0 auto}
#anime-page .card{background:#1a1a2e;border-radius:8px;overflow:hidden;cursor:pointer;transition:transform .2s,box-shadow .2s;position:relative}
#anime-page .card:hover{transform:translateY(-4px);box-shadow:0 8px 24px rgba(233,69,96,.2)}
#anime-page .card img{width:100%;aspect-ratio:2/3;object-fit:cover;display:block}
#anime-page .card .card-info{padding:8px 10px}
#anime-page .card .card-title{font-size:13px;color:#e0e0e0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#anime-page .card .card-remark{position:absolute;top:6px;right:6px;background:#e94560;color:#fff;padding:2px 8px;border-radius:10px;font-size:11px}
#anime-page .pagination{display:flex;justify-content:center;align-items:center;gap:16px;padding:20px 16px}
#anime-page .pagination button{height:38px;line-height:38px;padding:0 16px;background:#1a1a2e;color:#ffd93d;border:1px solid #333;border-radius:8px;cursor:pointer;font-size:16px;text-align:center}
#anime-page .pagination button:hover{background:#ffd93d;color:#0f0f1a}
#anime-page .pagination button:disabled{opacity:.4;cursor:not-allowed}
#anime-page .page-info{color:#aaa;font-size:14px;width:auto!important;min-width:100px;line-height:38px;text-align:center}
/* Continue watching */
#anime-page .continue-card{display:none;background:linear-gradient(135deg,#1a1a2e,#16213e);border:1px solid #ffd93d;border-radius:12px;padding:16px;margin:16px auto;max-width:600px;cursor:pointer;transition:transform .2s}
#anime-page .continue-card.show{display:flex;gap:16px;align-items:center}
#anime-page .continue-card:hover{transform:translateY(-2px)}
#anime-page .continue-card img{width:80px;height:110px;object-fit:cover;border-radius:8px}
#anime-page .continue-card .cont-info h3{margin:0 0 4px;color:#ffd93d;font-size:16px}
#anime-page .continue-card .cont-info p{margin:2px 0;color:#aaa;font-size:13px}
#anime-page .continue-card .cont-info span{color:#e94560;font-size:12px}
/* Loading */
#anime-page .loading{text-align:center;padding:40px;color:#aaa}
#anime-page .loading i{animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
/* Mobile */
@media(max-width:600px){
#anime-page .card-grid{grid-template-columns:repeat(3,1fr);gap:10px;padding:10px}
#anime-page .search-bar input{font-size:14px;padding:8px 12px}
#anime-page .search-bar button{padding:8px 16px;font-size:14px}
#anime-page .tabs{gap:6px;padding:8px 10px}
#anime-page .tabs button{padding:5px 12px;font-size:12px}
#anime-page .nav-links{gap:10px;padding:8px 10px}
#anime-page .nav-links a{font-size:12px;padding:3px 10px}
#anime-page .continue-card{margin:10px;padding:12px}
#anime-page .continue-card img{width:60px;height:82px}
#anime-page .continue-card .cont-info h3{font-size:14px}
#anime-page .pagination{gap:12px;padding:16px 10px}
}
</style>

<div id="anime-page">
  <!-- Nav links -->
  <div class="nav-links">
    <a href="/anime/history/"><i class="fas fa-history"></i> 观看记录</a>
    <a href="/user/"><i class="fas fa-user"></i> 个人中心</a>
  </div>

  <!-- Search -->
  <div class="search-bar">
    <input type="text" id="searchInput" placeholder="搜索动漫、电影、电视剧...">
    <button onclick="doSearch()"><i class="fas fa-search"></i> 搜索</button>
  </div>

  <!-- Continue Watching -->
  <div class="continue-card" id="continueCard" onclick="continueWatching()">
    <img id="contPic" src="">
    <div class="cont-info">
      <h3 id="contTitle"></h3>
      <p id="contEp"></p>
      <span><i class="fas fa-play-circle"></i> 继续观看</span>
    </div>
  </div>

  <!-- Category Tabs -->
  <div class="tabs" id="tabs">
    <button class="active" data-type="">推荐</button>
    <button data-type="4">日韩动漫</button>
    <button data-type="49">国产动漫</button>
    <button data-type="3">欧美动漫</button>
    <button data-type="1">电影</button>
    <button data-type="2">连续剧</button>
    <button data-type="35">综艺</button>
  </div>

  <!-- Card Grid -->
  <div class="card-grid" id="cardGrid"></div>

  <!-- Pagination -->
  <div class="pagination" id="pagination">
    <button id="prevBtn" onclick="changePage(-1)"><i class="fas fa-chevron-left"></i></button>
    <span class="page-info" id="pageInfo">1</span>
    <button id="nextBtn" onclick="changePage(1)"><i class="fas fa-chevron-right"></i></button>
  </div>

  <!-- Loading -->
  <div class="loading" id="loading" style="display:none"><i class="fas fa-spinner"></i> 加载中...</div>
</div>

<script>
(function(){
var API_SOURCES=[
  {name:'Huya',base:'https://www.huyaapi.com',list:'/api.php/provide/vod/?ac=list'},
  {name:'FFZY',base:'https://ffzy.233002.xyz',list:'/api/ffzy?ac=videolist'},
  {name:'BDZY',base:'https://api.apibdzy.com',list:'/api.php/provide/vod/?ac=list'},
  {name:'FF22',base:'https://cj.ffzyapi.com',list:'/api.php/provide/vod/?ac=list'}
];
var API=API_SOURCES[0].base;
var currentPage=1;
var currentType='';
var currentKeyword='';
var totalPages=1;

// Auth
function getToken(){return localStorage.getItem('anime_token')||'';}
function isLoggedIn(){return !!getToken();}

// Search
window.doSearch=function(){
  var q=document.getElementById('searchInput').value.trim();
  if(!q)return;
  currentKeyword=q;currentType='';currentPage=1;
  document.querySelectorAll('#tabs button').forEach(function(b){b.classList.remove('active');});
  loadList();
};

document.getElementById('searchInput').addEventListener('keydown',function(e){
  if(e.key==='Enter')doSearch();
});

// Tabs
document.querySelectorAll('#tabs button').forEach(function(btn){
  btn.addEventListener('click',function(){
    document.querySelectorAll('#tabs button').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active');
    currentType=btn.dataset.type;
    currentKeyword='';
    currentPage=1;
    loadList();
  });
});

// Load list
async function loadList(){
  var grid=document.getElementById('cardGrid');
  var loading=document.getElementById('loading');
  grid.innerHTML='';
  loading.style.display='block';

  // Try each API source
  for(var si=0;si<API_SOURCES.length;si++){
    var src=API_SOURCES[si];
    try{
      var url=src.base+src.list+'&pg='+currentPage;
      if(currentType)url+='&t='+currentType;
      if(currentKeyword)url+='&wd='+encodeURIComponent(currentKeyword);

      var res=await fetch(url);
      var data=await res.json();
      var list=data.list||[];
      if(list.length===0&&si<API_SOURCES.length-1)continue; // try next source
      API=src.base;
      totalPages=data.pagecount||1;

    list.forEach(function(item){
      var card=document.createElement('div');
      card.className='card';
      card.innerHTML='<img src="'+(item.vod_pic||'')+'" alt="'+item.vod_name+'" loading="lazy" onerror="this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 300%22><rect fill=%22%231a1a2e%22 width=%22200%22 height=%22300%22/><text fill=%22%23555%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2214%22>No Image</text></svg>\'">'
        +'<div class="card-info"><div class="card-title">'+item.vod_name+'</div></div>'
        +(item.vod_remarks?'<span class="card-remark">'+item.vod_remarks+'</span>':'');
      card.onclick=function(){window.location.href='/anime/play/?vod_id='+item.vod_id;};
      grid.appendChild(card);
    });

      updatePagination();
      break; // found working source
    }catch(err){
      if(si===API_SOURCES.length-1){
        grid.innerHTML='<div style="text-align:center;padding:40px;color:#e94560"><i class="fas fa-exclamation-circle"></i> 所有源站均不可用</div>';
      }
    }
  }
  loading.style.display='none';
}

function updatePagination(){
  document.getElementById('pageInfo').textContent=currentPage+' / '+totalPages;
  document.getElementById('prevBtn').disabled=currentPage<=1;
  document.getElementById('nextBtn').disabled=currentPage>=totalPages;
}

window.changePage=function(delta){
  currentPage+=delta;
  if(currentPage<1)currentPage=1;
  if(currentPage>totalPages)currentPage=totalPages;
  loadList();
  window.scrollTo({top:0,behavior:'smooth'});
};

// Continue watching
window.continueWatching=function(){
  if(!isLoggedIn()){showSiteLoginModal();return;}
  // Get latest history item
  fetch(API+'/api/history',{headers:{'Authorization':'Bearer '+getToken()}})
  .then(function(r){return r.json();})
  .then(function(data){
    var items=data.list||[];
    if(items.length>0){
      var h=items[0];
      window.location.href='/anime/play/?vod_id='+h.vod_id+'&ep='+h.episode_index;
    }
  }).catch(function(){});
};

// Load continue card
async function loadContinueCard(){
  if(!isLoggedIn()){document.getElementById('continueCard').classList.remove('show');return;}
  try{
    var res=await fetch(API+'/api/history',{headers:{'Authorization':'Bearer '+getToken()}});
    var data=await res.json();
    var items=data.list||[];
    if(items.length>0){
      var h=items[0];
      document.getElementById('contPic').src=h.vod_pic||'';
      document.getElementById('contTitle').textContent=h.vod_name;
      document.getElementById('contEp').textContent='第'+(h.episode_index+1)+'集 '+(h.episode_name||'')+' · '+formatTime(h.position);
      document.getElementById('continueCard').classList.add('show');
    }
  }catch(e){}
}

function formatTime(sec){
  if(!sec||isNaN(sec))return'0:00';
  sec=Math.floor(sec);var m=Math.floor(sec/60);var s=sec%60;
  return m+':'+(s<10?'0':'')+s;
}

// Auth sync
window.addEventListener('storage',function(e){
  if(e.key==='anime_token'||e.key==='anime_user'){
    if(isLoggedIn())loadContinueCard();
    else document.getElementById('continueCard').classList.remove('show');
  }
});
window.addEventListener('focus',function(){
  if(isLoggedIn())loadContinueCard();
});

// Init
loadList();
loadContinueCard();

})();
</script>
