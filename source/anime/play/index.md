---
title: 影视播放
date: 2026-06-01
type: anime
comments: false
---

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>

<style>
#play-page{background:#0f0f1a;min-height:100vh;color:#e0e0e0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:0;margin:0}
#play-page *{box-sizing:border-box}
#play-page .top-bar{display:flex;align-items:center;gap:12px;padding:12px 16px;background:#111;position:sticky;top:0;z-index:10}
#play-page .top-bar .back-btn{background:none;border:none;color:#ffd93d;font-size:18px;cursor:pointer;padding:4px 8px}
#play-page .top-bar .back-btn:hover{color:#e94560}
#play-page .top-bar .title-text{color:#ffd93d;font-size:15px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#play-page .top-bar .home-link{color:#aaa;font-size:14px;text-decoration:none;padding:4px 8px}
#play-page .top-bar .home-link:hover{color:#ffd93d}
/* Player */
#play-page .player-wrap{position:relative;width:100%;max-width:960px;margin:0 auto;background:#000}
#play-page .video-box{position:relative;width:100%;padding-top:56.25%;background:#000}
#play-page .video-box video,#play-page .video-box iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:none}
#play-page .danmaku-canvas{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2}
#play-page .speed-indicator{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.7);color:#ffd93d;padding:10px 24px;border-radius:12px;font-size:24px;font-weight:700;display:none;z-index:3}
/* Controls */
#play-page .controls{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#111;flex-wrap:wrap}
#play-page .controls button{background:none;border:none;color:#e0e0e0;cursor:pointer;font-size:16px;padding:6px}
#play-page .controls button:hover{color:#ffd93d}
#play-page .progress-wrap{flex:1;min-width:100px;height:20px;display:flex;align-items:center;cursor:pointer;position:relative}
#play-page .progress-bar{width:100%;height:4px;background:#333;border-radius:2px;position:relative}
#play-page .progress-bar .progress-fill{height:100%;background:#ffd93d;border-radius:2px;width:0;transition:width .1s}
#play-page .progress-bar .progress-buffer{position:absolute;top:0;left:0;height:100%;background:rgba(255,255,255,.2);border-radius:2px;width:0}
#play-page .progress-time{color:#aaa;font-size:12px;white-space:nowrap;margin:0 6px}
#play-page .volume-wrap{display:flex;align-items:center;gap:4px}
#play-page .volume-wrap input[type=range]{width:70px;accent-color:#ffd93d}
#play-page .speed-btn{font-size:13px!important;padding:4px 8px!important;background:#333!important;border-radius:4px;color:#ffd93d!important}
#play-page .skip-btn{font-size:12px!important;padding:4px 10px!important;background:#e94560!important;border-radius:4px;color:#fff!important;display:flex;align-items:center;gap:4px}
#play-page .skip-settings{position:relative;display:inline-block}
#play-page .skip-dropdown{display:none;position:absolute;bottom:100%;right:0;background:#222;border:1px solid #444;border-radius:6px;padding:8px;z-index:10;min-width:140px}
#play-page .skip-dropdown.show{display:block}
#play-page .skip-dropdown label{font-size:12px;color:#aaa;display:block;margin-bottom:4px}
#play-page .skip-dropdown input{width:60px;background:#111;border:1px solid #444;color:#fff;padding:3px 6px;border-radius:4px;font-size:12px}
/* Danmaku bar */
#play-page .danmaku-bar{display:flex;gap:8px;padding:8px 12px;background:#111;align-items:center;flex-wrap:wrap}
#play-page .danmaku-bar input{flex:1;min-width:150px;padding:8px 12px;background:#1a1a2e;border:1px solid #333;border-radius:20px;color:#fff;font-size:13px;outline:none}
#play-page .danmaku-bar input:focus{border-color:#ffd93d}
#play-page .danmaku-bar .color-picker{display:flex;gap:4px}
#play-page .danmaku-bar .color-dot{width:20px;height:20px;border-radius:50%;cursor:pointer;border:2px solid transparent}
#play-page .danmaku-bar .color-dot.active{border-color:#ffd93d}
#play-page .danmaku-bar .send-btn{padding:8px 18px;background:#ffd93d;color:#0f0f1a;border:none;border-radius:20px;cursor:pointer;font-size:13px;font-weight:600}
#play-page .danmaku-bar .send-btn:hover{background:#e94560;color:#fff}
/* Info section */
#play-page .info-section{max-width:960px;margin:0 auto;padding:16px}
#play-page .info-header{display:flex;gap:16px;flex-wrap:wrap}
#play-page .info-poster{width:120px;border-radius:8px;flex-shrink:0}
#play-page .info-detail{flex:1;min-width:200px}
#play-page .info-detail h2{margin:0 0 6px;color:#ffd93d;font-size:18px}
#play-page .info-detail p{margin:3px 0;color:#aaa;font-size:13px}
#play-page .info-detail .desc-text{color:#888;font-size:12px;margin-top:6px;line-height:1.6;max-height:60px;overflow:hidden;cursor:pointer}
#play-page .info-detail .desc-text.expanded{max-height:none}
/* Episodes */
#play-page .episode-section{max-width:960px;margin:0 auto;padding:0 16px 16px}
#play-page .episode-section h3{color:#ffd93d;font-size:15px;margin:0 0 10px}
#play-page .ep-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px}
#play-page .ep-btn{padding:8px 4px;background:#222;color:#ccc;border:1px solid #333;border-radius:6px;cursor:pointer;font-size:13px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:all .2s}
#play-page .ep-btn:hover,#play-page .ep-btn.active{background:#ffd93d;color:#0f0f1a;border-color:#ffd93d}
#play-page .ep-btn.watched{border-color:#e94560}
/* Source tabs */
#play-page .source-tabs{display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap}
#play-page .source-tabs button{padding:4px 14px;background:transparent;color:#aaa;border:1px solid #333;border-radius:16px;cursor:pointer;font-size:12px}
#play-page .source-tabs button.active{background:#ffd93d;color:#0f0f1a;border-color:#ffd93d;font-weight:600}
/* Loading */
#play-page .loading{text-align:center;padding:40px;color:#aaa}
#play-page .loading i{animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
/* Error */
#play-page .error-msg{text-align:center;padding:40px;color:#e94560}
@media(max-width:600px){
#play-page .ep-grid{grid-template-columns:repeat(auto-fill,minmax(64px,1fr))}
#play-page .controls{gap:4px;padding:6px 8px}
#play-page .controls button{font-size:14px;padding:5px}
#play-page .volume-wrap{display:none}
#play-page .speed-btn{font-size:11px!important;padding:3px 6px!important}
#play-page .skip-btn{font-size:11px!important;padding:3px 8px!important}
#play-page .danmaku-bar{gap:6px;padding:6px 8px}
#play-page .danmaku-bar input{padding:6px 10px;font-size:12px;min-width:100px}
#play-page .danmaku-bar .send-btn{padding:6px 14px;font-size:12px}
#play-page .info-header{flex-direction:column;align-items:center;text-align:center}
#play-page .info-poster{width:100px}
#play-page .info-section{padding:12px}
#play-page .episode-section{padding:0 12px 12px}
#play-page .top-bar{padding:8px 12px}
#play-page .top-bar .title-text{font-size:13px}
}
</style>

<div id="play-page">
  <div class="top-bar">
    <button class="back-btn" onclick="history.back()"><i class="fas fa-arrow-left"></i></button>
    <span class="title-text" id="pageTitle">加载中...</span>
    <a class="home-link" href="/anime/"><i class="fas fa-film"></i> 影视屋</a>
    <a class="home-link" href="/anime/history/"><i class="fas fa-history"></i> 历史</a>
  </div>

  <!-- Player -->
  <div class="player-wrap">
    <div class="video-box" id="videoBox">
      <video id="videoPlayer" playsinline webkit-playsinline></video>
      <canvas class="danmaku-canvas" id="danmakuCanvas"></canvas>
      <div class="speed-indicator" id="speedIndicator">3x</div>
    </div>
    <div class="controls">
      <button onclick="playPrevEp()" title="上一集(P)"><i class="fas fa-step-backward"></i></button>
      <button onclick="togglePlay()" title="播放/暂停(Space)" id="playBtn"><i class="fas fa-play"></i></button>
      <button onclick="playNextEp()" title="下一集(N)"><i class="fas fa-step-forward"></i></button>
      <span class="progress-time" id="currentTime">0:00</span>
      <div class="progress-wrap" id="progressWrap">
        <div class="progress-bar">
          <div class="progress-buffer" id="progressBuffer"></div>
          <div class="progress-fill" id="progressFill"></div>
        </div>
      </div>
      <span class="progress-time" id="duration">0:00</span>
      <div class="volume-wrap">
        <button onclick="toggleMute()" id="muteBtn"><i class="fas fa-volume-up"></i></button>
        <input type="range" min="0" max="100" value="100" id="volumeSlider" oninput="setVolume(this.value)">
      </div>
      <button class="speed-btn" onclick="cycleSpeed()" id="speedBtn" title="播放速度">1x</button>
      <button class="skip-btn" onclick="skipIntro()" title="跳过片头"><i class="fas fa-forward"></i> <span id="skipLabel">90s</span></button>
      <div class="skip-settings">
        <button onclick="toggleSkipSettings()" title="片头设置"><i class="fas fa-cog"></i></button>
        <div class="skip-dropdown" id="skipDropdown">
          <label>跳过秒数</label>
          <input type="number" id="skipInput" value="90" min="0" max="600" onchange="updateSkipTime(this.value)">
        </div>
      </div>
      <button onclick="toggleDanmaku()" title="弹幕开关(D)" id="danmakuToggle"><i class="fas fa-comments"></i></button>
      <button onclick="toggleFullscreen()" title="全屏(F)"><i class="fas fa-expand"></i></button>
    </div>
    <div class="danmaku-bar">
      <input type="text" id="danmakuInput" placeholder="发条弹幕..." maxlength="100">
      <div class="color-picker">
        <div class="color-dot active" style="background:#fff" data-color="#ffffff"></div>
        <div class="color-dot" style="background:#ffd93d" data-color="#ffd93d"></div>
        <div class="color-dot" style="background:#e94560" data-color="#e94560"></div>
        <div class="color-dot" style="background:#00d2ff" data-color="#00d2ff"></div>
        <div class="color-dot" style="background:#7bed9f" data-color="#7bed9f"></div>
      </div>
      <button class="send-btn" onclick="sendDanmaku()"><i class="fas fa-paper-plane"></i></button>
    </div>
  </div>

  <!-- Info -->
  <div class="info-section" id="infoSection" style="display:none">
    <div class="info-header">
      <img class="info-poster" id="infoPoster" src="">
      <div class="info-detail">
        <h2 id="infoTitle"></h2>
        <p id="infoYear"></p>
        <p id="infoArea"></p>
        <p id="infoScore"></p>
        <div class="desc-text" id="infoDesc" onclick="this.classList.toggle('expanded')"></div>
      </div>
    </div>
  </div>

  <!-- Episodes -->
  <div class="episode-section" id="episodeSection" style="display:none">
    <div class="source-tabs" id="sourceTabs"></div>
    <h3><i class="fas fa-list"></i> 选集</h3>
    <div class="ep-grid" id="epGrid"></div>
  </div>

  <div class="loading" id="loading"><i class="fas fa-spinner"></i> 加载中...</div>
  <div class="error-msg" id="errorMsg" style="display:none"></div>
</div>

<script>
(function(){
var API='https://ffzy.233002.xyz';
var video=document.getElementById('videoPlayer');
var canvas=document.getElementById('danmakuCanvas');
var ctx=canvas.getContext('2d');

// State
var currentDetail=null;
var sources=[];
var episodes=[];
var currentSourceIndex=0;
var currentEpIndex=0;
var hlsInstance=null;
var danmakuEnabled=true;
var danmakuList=[];
var danmakuRAF=null;
var currentDanmakuColor='#ffffff';
var playbackSpeed=1;
var speedIndex=2;
var speeds=[0.5,0.75,1,1.25,1.5,2,3];
var skipIntroTime=90;
var historyTimer=null;
var longPressTimer=null;
var isSpeedUp=false;
var spaceHeld=false;

// Auth
function getToken(){return localStorage.getItem('anime_token')||'';}
function authHeaders(){var t=getToken();return t?{'Authorization':'Bearer '+t,'Content-Type':'application/json'}:{'Content-Type':'application/json'};}
function isLoggedIn(){return !!getToken();}

// Toast
function showToast(msg,dur){
  dur=dur||2000;
  var el=document.getElementById('playToast');
  if(!el){el=document.createElement('div');el.id='playToast';el.style.cssText='position:fixed;top:60px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:#ffd93d;border:1px solid #ffd93d;padding:8px 20px;border-radius:20px;font-size:13px;z-index:1100;transition:opacity .3s;opacity:0;pointer-events:none';document.getElementById('play-page').appendChild(el);}
  el.textContent=msg;el.style.opacity='1';clearTimeout(el._t);el._t=setTimeout(function(){el.style.opacity='0';},dur);
}

// Get URL params
var params=new URLSearchParams(window.location.search);
var vodId=parseInt(params.get('vod_id'));
var startEp=parseInt(params.get('ep'))||0;

if(!vodId){
  document.getElementById('loading').style.display='none';
  document.getElementById('errorMsg').style.display='block';
  document.getElementById('errorMsg').innerHTML='<i class="fas fa-exclamation-circle"></i> 缺少影片ID<br><br><a href="/anime/" style="color:#ffd93d">返回影视屋</a>';
  return;
}

// Load detail
async function loadDetail(){
  try{
    var res=await fetch(API+'/api/ffzy?ac=detail&ids='+vodId);
    var data=await res.json();
    var item=(data.list||[])[0];
    if(!item){throw new Error('not found');}

    currentDetail=item;
    document.getElementById('pageTitle').textContent=item.vod_name;
    document.getElementById('infoSection').style.display='block';
    document.getElementById('infoPoster').src=item.vod_pic||'';
    document.getElementById('infoTitle').textContent=item.vod_name||'';
    document.getElementById('infoYear').textContent=item.vod_year?'年份: '+item.vod_year:'';
    document.getElementById('infoArea').textContent=item.vod_area?'地区: '+item.vod_area:'';
    document.getElementById('infoScore').textContent=item.vod_score?'评分: '+item.vod_score:'';
    document.getElementById('infoDesc').textContent=(item.vod_content||'').replace(/<[^>]*>/g,'').substring(0,300);

    // Parse sources
    sources=[];
    if(item.vod_play_url){
      var groups=item.vod_play_url.split('$$$');
      groups.forEach(function(group){
        var eps=group.split('#').filter(function(e){return e.includes('$');}).map(function(e){
          var idx=e.indexOf('$');
          return {name:e.substring(0,idx),url:e.substring(idx+1)};
        });
        sources.push(eps);
      });
    }

    // Source tabs
    if(sources.length>1){
      var tabsHtml='';
      sources.forEach(function(s,i){
        tabsHtml+='<button '+(i===0?'class="active"':'')+' onclick="switchSource('+i+')">线路'+(i+1)+'</button>';
      });
      document.getElementById('sourceTabs').innerHTML=tabsHtml;
    }

    // Check history for resume
    var histEp=startEp;
    if(isLoggedIn()){
      try{
        var hRes=await fetch(API+'/api/history?vod_id='+vodId,{headers:{'Authorization':'Bearer '+getToken()}});
        var hData=await hRes.json();
        if(hData&&hData.episode_index!==undefined){
          histEp=hData.episode_index;
          skipIntroTime=hData.skip_intro||90;
          // Will resume position in playEpisode
          window._savedPosition=hData.position||0;
          window._savedEpIndex=hData.episode_index;
        }
      }catch(e){}
    }

    // Use first source by default
    currentSourceIndex=0;
    switchSource(0,histEp);

    document.getElementById('loading').style.display='none';
  }catch(err){
    document.getElementById('loading').style.display='none';
    document.getElementById('errorMsg').style.display='block';
    document.getElementById('errorMsg').innerHTML='<i class="fas fa-exclamation-circle"></i> 加载失败<br><br><a href="/anime/" style="color:#ffd93d">返回影视屋</a>';
  }
}

// Switch source
window.switchSource=function(idx,epIdx){
  currentSourceIndex=idx;
  episodes=sources[idx]||[];
  // Update source tab active
  document.querySelectorAll('#sourceTabs button').forEach(function(b,i){b.classList.toggle('active',i===idx);});
  // Render episodes
  renderEpisodes();
  // Play episode
  if(epIdx===undefined) epIdx=0;
  playEpisode(epIdx);
};

function renderEpisodes(){
  if(episodes.length===0)return;
  document.getElementById('episodeSection').style.display='block';
  var grid=document.getElementById('epGrid');
  grid.innerHTML='';
  episodes.forEach(function(ep,i){
    var btn=document.createElement('button');
    btn.className='ep-btn';
    btn.textContent=ep.name;
    btn.onclick=function(){playEpisode(i);};
    grid.appendChild(btn);
  });
}

// Play episode
window.playEpisode=function(index){
  if(!episodes||index<0||index>=episodes.length)return;
  currentEpIndex=index;
  var ep=episodes[index];
  document.querySelectorAll('.ep-btn').forEach(function(b,i){b.classList.toggle('active',i===index);});

  var url=ep.url;
  var isM3U8=url.includes('.m3u8')||url.includes('/m3u8');

  stopPlayer(false);

  if(isM3U8&&Hls.isSupported()){
    hlsInstance=new Hls({maxBufferLength:30,maxMaxBufferLength:60});
    hlsInstance.loadSource(url);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED,function(){video.play().catch(function(){});});
    hlsInstance.on(Hls.Events.ERROR,function(event,data){
      if(data.fatal){fallbackToIframe(url);}
    });
  }else if(video.canPlayType('application/vnd.apple.mpegurl')){
    video.src=url;
    video.addEventListener('loadedmetadata',function(){video.play().catch(function(){});},{once:true});
  }else{
    fallbackToIframe(url);return;
  }

  loadDanmaku();
  startDanmakuLoop();
  document.getElementById('skipLabel').textContent=skipIntroTime+'s';
  document.getElementById('skipInput').value=skipIntroTime;

  // Resume position
  var resumeAt=0;
  if(window._savedEpIndex===index&&window._savedPosition>5){
    resumeAt=window._savedPosition;
    window._savedPosition=0;
  }
  if(resumeAt>0){
    video.addEventListener('loadedmetadata',function onMeta(){
      video.currentTime=resumeAt;
      video.removeEventListener('loadedmetadata',onMeta);
    });
  }

  // Update URL without reload
  var newUrl='/anime/play/?vod_id='+vodId+'&ep='+index;
  window.history.replaceState({},'',newUrl);

  // Start auto-save
  clearInterval(historyTimer);
  historyTimer=setInterval(saveHistory,10000);
};

function fallbackToIframe(url){
  var container=document.getElementById('videoBox');
  video.style.display='none';
  var iframe=document.createElement('iframe');
  iframe.src=url;iframe.allowFullscreen=true;
  iframe.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;border:none';
  container.appendChild(iframe);
}

function stopPlayer(resetVideo){
  if(hlsInstance){hlsInstance.destroy();hlsInstance=null;}
  if(historyTimer){clearInterval(historyTimer);historyTimer=null;}
  stopDanmakuLoop();
  if(resetVideo!==false){
    video.pause();video.removeAttribute('src');video.load();video.style.display='';
    document.querySelectorAll('#videoBox iframe').forEach(function(f){f.remove();});
  }
}

// History
async function saveHistory(){
  if(!isLoggedIn()||!currentDetail||video.paused&&video.currentTime===0)return;
  try{
    await fetch(API+'/api/history',{
      method:'POST',
      headers:authHeaders(),
      body:JSON.stringify({
        vod_id:currentDetail.vod_id,
        vod_name:currentDetail.vod_name,
        vod_pic:currentDetail.vod_pic,
        episode_index:currentEpIndex,
        episode_name:episodes[currentEpIndex]?.name||'',
        position:Math.floor(video.currentTime),
        duration:Math.floor(video.duration||0),
        skip_intro:skipIntroTime
      })
    });
  }catch(e){}
}

// Player controls
window.togglePlay=function(){if(video.paused)video.play();else video.pause();};
video.addEventListener('play',function(){document.getElementById('playBtn').innerHTML='<i class="fas fa-pause"></i>';});
video.addEventListener('pause',function(){document.getElementById('playBtn').innerHTML='<i class="fas fa-play"></i>';});

video.addEventListener('timeupdate',function(){
  var pct=video.duration?(video.currentTime/video.duration*100):0;
  document.getElementById('progressFill').style.width=pct+'%';
  document.getElementById('currentTime').textContent=formatTime(video.currentTime);
  document.getElementById('duration').textContent=formatTime(video.duration);
});

video.addEventListener('progress',function(){
  if(video.buffered.length>0){
    var buffEnd=video.buffered.end(video.buffered.length-1);
    var pct=video.duration?(buffEnd/video.duration*100):0;
    document.getElementById('progressBuffer').style.width=pct+'%';
  }
});

document.getElementById('progressWrap').addEventListener('click',function(e){
  var rect=e.currentTarget.getBoundingClientRect();
  var pct=(e.clientX-rect.left)/rect.width;
  video.currentTime=pct*(video.duration||0);
});

window.setVolume=function(val){video.volume=val/100;video.muted=val==0;updateMuteIcon();};
window.toggleMute=function(){video.muted=!video.muted;document.getElementById('volumeSlider').value=video.muted?0:Math.round(video.volume*100);updateMuteIcon();};
function updateMuteIcon(){var icon=video.muted||video.volume===0?'fa-volume-mute':video.volume<0.5?'fa-volume-down':'fa-volume-up';document.getElementById('muteBtn').innerHTML='<i class="fas '+icon+'"></i>';}

window.cycleSpeed=function(){speedIndex=(speedIndex+1)%speeds.length;playbackSpeed=speeds[speedIndex];video.playbackRate=playbackSpeed;document.getElementById('speedBtn').textContent=playbackSpeed+'x';};

window.toggleFullscreen=function(){
  var wrapper=document.querySelector('.player-wrap');
  if(!document.fullscreenElement){(wrapper.requestFullscreen||wrapper.webkitRequestFullscreen||wrapper.msRequestFullscreen).call(wrapper);}
  else{(document.exitFullscreen||document.webkitExitFullscreen||document.msExitFullscreen).call(document);}
};

window.skipIntro=function(){video.currentTime=Math.min(video.currentTime+skipIntroTime,video.duration||Infinity);};
window.toggleSkipSettings=function(){document.getElementById('skipDropdown').classList.toggle('show');};
window.updateSkipTime=function(val){skipIntroTime=parseInt(val)||90;document.getElementById('skipLabel').textContent=skipIntroTime+'s';};

document.addEventListener('click',function(e){if(!e.target.closest('.skip-settings')){document.getElementById('skipDropdown').classList.remove('show');}});

// Long press speed up
var videoBox=document.getElementById('videoBox');
function startSpeedUp(){if(isSpeedUp)return;isSpeedUp=true;video.playbackRate=3;document.getElementById('speedIndicator').style.display='block';}
function endSpeedUp(){if(!isSpeedUp)return;isSpeedUp=false;video.playbackRate=playbackSpeed;document.getElementById('speedIndicator').style.display='none';}

var mouseDownTime=0;
videoBox.addEventListener('mousedown',function(e){
  if(e.target.closest('.controls')||e.target.closest('.danmaku-bar'))return;
  mouseDownTime=Date.now();longPressTimer=setTimeout(startSpeedUp,300);
});
videoBox.addEventListener('mouseup',function(e){
  if(e.target.closest('.controls')||e.target.closest('.danmaku-bar'))return;
  clearTimeout(longPressTimer);
  if(isSpeedUp)endSpeedUp();
  else if(Date.now()-mouseDownTime<300)togglePlay();
});
videoBox.addEventListener('mouseleave',endSpeedUp);

var touchDownTime=0;
videoBox.addEventListener('touchstart',function(e){
  if(e.target.closest('.controls')||e.target.closest('.danmaku-bar'))return;
  touchDownTime=Date.now();longPressTimer=setTimeout(startSpeedUp,300);
},{passive:true});
videoBox.addEventListener('touchend',function(e){
  if(e.target.closest('.controls')||e.target.closest('.danmaku-bar'))return;
  clearTimeout(longPressTimer);
  if(isSpeedUp)endSpeedUp();
  else if(Date.now()-touchDownTime<300)togglePlay();
});
videoBox.addEventListener('touchcancel',endSpeedUp);

// Keyboard
document.addEventListener('keydown',function(e){
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
  switch(e.key.toLowerCase()){
    case 'n':playNextEp();break;
    case 'p':playPrevEp();break;
    case 'r':video.currentTime=0;video.play();break;
    case 'f':toggleFullscreen();break;
    case 'd':toggleDanmaku();break;
    case 'arrowleft':video.currentTime=Math.max(0,video.currentTime-10);e.preventDefault();break;
    case 'arrowright':video.currentTime=Math.min(video.duration,video.currentTime+10);e.preventDefault();break;
    case 'arrowup':video.volume=Math.min(1,video.volume+0.1);document.getElementById('volumeSlider').value=Math.round(video.volume*100);updateMuteIcon();e.preventDefault();break;
    case 'arrowdown':video.volume=Math.max(0,video.volume-0.1);document.getElementById('volumeSlider').value=Math.round(video.volume*100);updateMuteIcon();e.preventDefault();break;
  }
});

// Spacebar hold
document.addEventListener('keydown',function(e){
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
  if(e.code==='Space'&&!e.repeat){e.preventDefault();spaceHeld=true;longPressTimer=setTimeout(startSpeedUp,300);}
});
document.addEventListener('keyup',function(e){
  if(e.code==='Space'){if(spaceHeld&&!isSpeedUp)togglePlay();spaceHeld=false;clearTimeout(longPressTimer);endSpeedUp();}
});

window.playNextEp=function(){if(currentEpIndex<episodes.length-1)playEpisode(currentEpIndex+1);};
window.playPrevEp=function(){if(currentEpIndex>0)playEpisode(currentEpIndex-1);};

// Auto next
video.addEventListener('ended',function(){
  if(currentEpIndex<episodes.length-1)playEpisode(currentEpIndex+1);
  else showToast('已播放完毕');
});

// Danmaku
async function loadDanmaku(){
  if(!currentDetail)return;
  try{
    var res=await fetch(API+'/api/danmaku?vod_id='+currentDetail.vod_id+'&episode_index='+currentEpIndex);
    var data=await res.json();
    danmakuList=(data.list||[]).map(function(d){return{time:d.time,text:d.content,color:d.color||'#ffffff',x:0,y:0,speed:2+Math.random(),width:0,active:false};});
  }catch(e){danmakuList=[];}
}

window.sendDanmaku=async function(){
  if(!isLoggedIn()){showSiteLoginModal();return;}
  var input=document.getElementById('danmakuInput');
  var text=input.value.trim();
  if(!text||!currentDetail)return;
  input.value='';
  var dm={time:Math.floor(video.currentTime),text:text,color:currentDanmakuColor,x:canvas.width,y:0,speed:2+Math.random(),width:0,active:false};
  danmakuList.push(dm);
  try{await fetch(API+'/api/danmaku',{method:'POST',headers:authHeaders(),body:JSON.stringify({vod_id:currentDetail.vod_id,episode_index:currentEpIndex,time:dm.time,content:text,color:currentDanmakuColor})});}catch(e){}
};

document.querySelectorAll('.color-dot').forEach(function(dot){
  dot.addEventListener('click',function(){
    document.querySelectorAll('.color-dot').forEach(function(d){d.classList.remove('active');});
    dot.classList.add('active');currentDanmakuColor=dot.dataset.color;
  });
});
document.getElementById('danmakuInput').addEventListener('keydown',function(e){if(e.key==='Enter')sendDanmaku();});

window.toggleDanmaku=function(){
  danmakuEnabled=!danmakuEnabled;
  document.getElementById('danmakuToggle').innerHTML=danmakuEnabled?'<i class="fas fa-comments"></i>':'<i class="fas fa-comment-slash"></i>';
  if(!danmakuEnabled)ctx.clearRect(0,0,canvas.width,canvas.height);
};

function startDanmakuLoop(){
  stopDanmakuLoop();
  function render(){danmakuRAF=requestAnimationFrame(render);if(!danmakuEnabled||video.paused)return;renderDanmaku();}
  render();
}
function stopDanmakuLoop(){if(danmakuRAF){cancelAnimationFrame(danmakuRAF);danmakuRAF=null;}ctx.clearRect(0,0,canvas.width,canvas.height);}

function renderDanmaku(){
  var w=canvas.width=canvas.offsetWidth;var h=canvas.height=canvas.offsetHeight;
  ctx.clearRect(0,0,w,h);ctx.font='16px sans-serif';
  var ct=video.currentTime;
  danmakuList.forEach(function(dm){
    if(!dm.active&&ct>=dm.time&&ct<dm.time+10){
      dm.active=true;dm.x=w;dm.width=ctx.measureText(dm.text).width;
      var lane=0;dm.y=24+(lane%Math.floor((h-24)/28))*28;
    }
    if(dm.active){
      dm.x-=dm.speed;ctx.fillStyle=dm.color||'#ffffff';ctx.shadowColor='rgba(0,0,0,0.5)';ctx.shadowBlur=2;
      ctx.fillText(dm.text,dm.x,dm.y);ctx.shadowBlur=0;
      if(dm.x+dm.width<0)dm.active=false;
    }
  });
}

function formatTime(sec){
  if(!sec||isNaN(sec))return'0:00';
  sec=Math.floor(sec);var m=Math.floor(sec/60);var s=sec%60;
  return m+':'+(s<10?'0':'')+s;
}

// Init
loadDetail();

})();
</script>
