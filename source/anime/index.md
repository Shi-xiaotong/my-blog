---
title: 影视屋
date: 2026-05-31 16:00:00
type: anime
---

<link rel="stylesheet" href="/css/anime-page.css">

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
