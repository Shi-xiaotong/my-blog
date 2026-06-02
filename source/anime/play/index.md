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
#play-page .video-box video,#play-page .video-box iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:none;-webkit-tap-highlight-color:transparent}
#play-page .danmaku-canvas{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2}
#play-page .speed-indicator{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.7);color:#ffd93d;padding:10px 24px;border-radius:12px;font-size:24px;font-weight:700;display:none;z-index:3}
/* Controls */
#play-page .controls{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#111;flex-wrap:wrap;position:relative;z-index:10}
#play-page .controls button{background:none;border:none;color:#e0e0e0;cursor:pointer;font-size:16px;padding:6px}
#play-page .controls button:hover{color:#ffd93d}
#play-page .progress-wrap{flex:1;min-width:100px;height:24px;display:flex;align-items:center;cursor:pointer;position:relative}
#play-page .progress-bar{width:100%;height:4px;background:#333;border-radius:2px;position:relative}
#play-page .progress-bar .progress-fill{height:100%;background:#ffd93d;border-radius:2px;width:0;transition:width .1s}
#play-page .progress-bar .progress-buffer{position:absolute;top:0;left:0;height:100%;background:rgba(255,255,255,.2);border-radius:2px;width:0}
#play-page .progress-time{color:#aaa;font-size:12px;white-space:nowrap;margin:0 6px}
#play-page .volume-wrap{display:flex;align-items:center;gap:4px}
#play-page .volume-wrap input[type=range]{width:70px;accent-color:#ffd93d}
#play-page .speed-btn{font-size:13px!important;padding:4px 8px!important;background:#333!important;border-radius:4px;color:#ffd93d!important}
#play-page .skip-btn{font-size:12px!important;padding:4px 10px!important;background:#e94560!important;border-radius:4px;color:#fff!important;display:flex;align-items:center;gap:4px}
#play-page .skip-settings{position:relative;display:inline-block}
#play-page .skip-dropdown{display:none;position:absolute;bottom:100%;right:0;background:#222;border:1px solid #444;border-radius:6px;padding:8px;z-index:20;min-width:140px;box-shadow:0 -4px 16px rgba(0,0,0,.5)}
#play-page .skip-dropdown.show{display:block}
#play-page .skip-dropdown label{font-size:12px;color:#aaa;display:block;margin-bottom:4px}
#play-page .skip-dropdown input{width:60px;background:#111;border:1px solid #444;color:#fff;padding:3px 6px;border-radius:4px;font-size:12px}
/* Double-tap hint */
#play-page .tap-hint{position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.5);color:#fff;padding:8px 16px;border-radius:8px;font-size:14px;pointer-events:none;opacity:0;transition:opacity .2s;z-index:5}
#play-page .tap-hint.left{left:15%}
#play-page .tap-hint.right{right:15%}
/* Touch overlay */
#play-page #touchOverlay{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;z-index:4;opacity:0;pointer-events:none;transition:opacity .25s}
#play-page #touchOverlay.visible{opacity:1;pointer-events:auto}
#play-page .touch-panel{display:flex;align-items:center;gap:32px}
#play-page .touch-btn{background:rgba(0,0,0,.5);border:none;color:#fff;border-radius:50%;width:48px;height:48px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;font-size:18px;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);transition:transform .15s}
#play-page .touch-btn span{font-size:9px;margin-top:1px;opacity:.7}
#play-page .touch-btn:active{transform:scale(.9)}
#play-page .touch-btn-main{width:64px;height:64px;font-size:24px;background:rgba(255,217,61,.25);border:2px solid rgba(255,217,61,.5)}
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
#play-page .ep-grid{grid-template-columns:repeat(auto-fill,minmax(56px,1fr));gap:6px}
#play-page .controls{gap:2px;padding:4px 6px;flex-wrap:nowrap;overflow:visible;-webkit-overflow-scrolling:touch}
#play-page .controls button{font-size:13px;padding:6px 4px;flex-shrink:0}
#play-page .progress-wrap{height:28px;min-width:60px}
#play-page .progress-bar{height:6px}
#play-page .progress-time{font-size:10px;margin:0 3px;flex-shrink:0}
#play-page .volume-wrap{display:none}
#play-page .speed-btn{font-size:11px!important;padding:4px 6px!important;flex-shrink:0}
#play-page .skip-btn{font-size:10px!important;padding:4px 6px!important;flex-shrink:0}
#play-page .skip-btn span{display:none}
#play-page .skip-settings{display:none}
#play-page .danmaku-bar{gap:6px;padding:6px 8px}
#play-page .danmaku-bar input{padding:6px 10px;font-size:13px;min-width:0;flex:1}
#play-page .danmaku-bar .color-picker{display:none}
#play-page .danmaku-bar .send-btn{padding:6px 14px;font-size:12px;flex-shrink:0}
#play-page .info-header{flex-direction:column;align-items:center;text-align:center}
#play-page .info-poster{width:90px}
#play-page .info-detail h2{font-size:16px}
#play-page .info-detail p{font-size:12px}
#play-page .info-section{padding:10px}
#play-page .episode-section{padding:0 10px 10px}
#play-page .episode-section h3{font-size:13px;margin:0 0 8px}
#play-page .ep-btn{padding:6px 2px;font-size:12px}
#play-page .top-bar{padding:8px 10px}
#play-page .top-bar .title-text{font-size:13px}
#play-page .top-bar .home-link{font-size:12px;padding:3px 6px}
#play-page .source-tabs button{padding:3px 10px;font-size:11px}
#play-page .tap-hint{font-size:12px;padding:6px 12px}
}
/* Gesture indicator (brightness/volume) */
#play-page .gesture-indicator{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.75);color:#ffd93d;padding:12px 28px;border-radius:14px;font-size:20px;font-weight:700;display:none;z-index:6;pointer-events:none;white-space:nowrap;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
/* Watched episode dot */
#play-page .ep-btn .watched-dot{display:inline-block;width:6px;height:6px;background:#e94560;border-radius:50%;margin-left:3px;vertical-align:middle}
/* PiP button */
#play-page .pip-btn{font-size:14px!important}
/* Long-press dropdown */
#play-page .longpress-dropdown{display:none;position:absolute;bottom:100%;right:0;background:#222;border:1px solid #444;border-radius:6px;padding:8px;z-index:10;min-width:120px}
#play-page .longpress-dropdown.show{display:block}
#play-page .longpress-dropdown label{font-size:12px;color:#aaa;display:block;margin-bottom:4px}
#play-page .lp-opt{display:block;width:100%;padding:4px 8px;background:none;border:none;color:#ccc;font-size:12px;text-align:left;cursor:pointer;border-radius:3px}
#play-page .lp-opt:hover,#play-page .lp-opt.active{background:#ffd93d;color:#0f0f1a}
/* Sleep timer */
#play-page .sleep-wrap{position:relative;display:inline-block}
#play-page .sleep-dropdown{display:none;position:absolute;bottom:100%;right:0;background:#222;border:1px solid #444;border-radius:6px;padding:8px;z-index:20;min-width:120px;box-shadow:0 -4px 16px rgba(0,0,0,.5)}
#play-page .sleep-dropdown.show{display:block}
#play-page .sleep-dropdown .sl-opt{display:block;width:100%;padding:4px 8px;background:none;border:none;color:#ccc;font-size:12px;text-align:left;cursor:pointer;border-radius:3px}
#play-page .sleep-dropdown .sl-opt:hover,#play-page .sleep-dropdown .sl-opt.active{background:#ffd93d;color:#0f0f1a}
#play-page .sleep-timer-label{font-size:10px;color:#ffd93d;margin-left:2px}
/* Danmaku settings */
#play-page .danmaku-settings-wrap{position:relative;display:inline-block}
#play-page .danmaku-settings-dropdown{display:none;position:absolute;bottom:100%;right:0;background:#222;border:1px solid #444;border-radius:6px;padding:10px;z-index:20;min-width:160px;box-shadow:0 -4px 16px rgba(0,0,0,.5)}
#play-page .danmaku-settings-dropdown.show{display:block}
#play-page .danmaku-settings-dropdown label{font-size:12px;color:#aaa;display:block;margin:6px 0 4px}
#play-page .danmaku-settings-dropdown label:first-child{margin-top:0}
#play-page .danmaku-settings-dropdown .dm-opt{display:block;width:100%;padding:4px 8px;background:none;border:none;color:#ccc;font-size:12px;text-align:left;cursor:pointer;border-radius:3px}
#play-page .danmaku-settings-dropdown .dm-opt:hover,#play-page .danmaku-settings-dropdown .dm-opt.active{background:#ffd93d;color:#0f0f1a}
/* Recommendations */
#play-page .recommend-section{max-width:960px;margin:0 auto;padding:0 16px 16px}
#play-page .recommend-section h3{color:#ffd93d;font-size:15px;margin:0 0 10px}
#play-page .recommend-grid{display:flex;gap:10px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:8px}
#play-page .recommend-grid::-webkit-scrollbar{display:none}
#play-page .recommend-card{flex-shrink:0;width:120px;cursor:pointer;text-decoration:none}
#play-page .recommend-card img{width:120px;height:160px;object-fit:cover;border-radius:8px;background:#222}
#play-page .recommend-card .rec-title{color:#ccc;font-size:12px;margin-top:6px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
/* Favorite button */
#play-page .fav-btn{background:none;border:none;color:#aaa;font-size:18px;cursor:pointer;padding:4px 8px;transition:color .2s}
#play-page .fav-btn:hover{color:#ffd93d}
#play-page .fav-btn.active{color:#e94560}
/* More menu (mobile) */
#play-page .more-wrap{position:relative;display:none}
#play-page .more-dropdown{display:none;position:absolute;bottom:100%;right:0;background:#1a1a2e;border:1px solid #444;border-radius:8px;padding:6px;z-index:30;min-width:160px;box-shadow:0 -4px 20px rgba(0,0,0,.6)}
#play-page .more-dropdown.show{display:flex;flex-direction:column;gap:2px}
#play-page .more-dropdown button{display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;background:none;border:none;color:#ccc;font-size:13px;text-align:left;cursor:pointer;border-radius:6px;white-space:nowrap}
#play-page .more-dropdown button:hover{background:#333;color:#ffd93d}
#play-page .more-dropdown button i{width:16px;text-align:center;font-size:14px}
@media(max-width:600px){
#play-page .more-wrap{display:inline-block}
#play-page .controls .speed-btn,#play-page .controls .skip-btn,#play-page .controls .skip-settings,#play-page .controls .danmaku-toggle-btn,#play-page .controls .danmaku-settings-wrap,#play-page .controls .pip-btn,#play-page .controls .sleep-wrap{display:none!important}
}
@media(max-width:600px){
#play-page .recommend-card{width:100px}
#play-page .recommend-card img{width:100px;height:133px}
#play-page .recommend-section{padding:0 10px 10px}
#play-page .recommend-section h3{font-size:13px;margin:0 0 8px}
}
</style>

<div id="play-page">
  <div class="top-bar">
    <button class="back-btn" onclick="history.back()"><i class="fas fa-arrow-left"></i></button>
    <span class="title-text" id="pageTitle">加载中...</span>
    <a class="home-link" href="/anime/"><i class="fas fa-film"></i> 影视屋</a>
    <button class="fav-btn" id="favBtn" onclick="toggleFavorite()" title="收藏"><i class="far fa-heart"></i></button>
    <a class="home-link" href="/anime/history/"><i class="fas fa-history"></i> 历史</a>
  </div>

  <!-- Player -->
  <div class="player-wrap">
    <div class="video-box" id="videoBox">
      <video id="videoPlayer" playsinline webkit-playsinline></video>
      <canvas class="danmaku-canvas" id="danmakuCanvas"></canvas>
      <div class="speed-indicator" id="speedIndicator">3x</div>
      <div class="tap-hint left" id="tapHintLeft">-10s</div>
      <div class="tap-hint right" id="tapHintRight">+10s</div>
      <div class="gesture-indicator" id="gestureIndicator"></div>
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
      <button class="danmaku-toggle-btn" onclick="toggleDanmaku()" title="弹幕开关(D)" id="danmakuToggle"><i class="fas fa-comments"></i></button>
      <div class="danmaku-settings-wrap">
        <button onclick="toggleDanmakuSettings()" title="弹幕设置"><i class="fas fa-sliders-h"></i></button>
        <div class="danmaku-settings-dropdown" id="danmakuSettingsDropdown">
          <label>密度</label>
          <button class="dm-opt" data-density="1" onclick="setDanmakuDensity(1)">全部</button>
          <button class="dm-opt" data-density="2" onclick="setDanmakuDensity(2)">1/2</button>
          <button class="dm-opt" data-density="3" onclick="setDanmakuDensity(3)">1/3</button>
          <label>字号</label>
          <button class="dm-opt" data-fontsize="12" onclick="setDanmakuFontsize(12)">12px</button>
          <button class="dm-opt" data-fontsize="14" onclick="setDanmakuFontsize(14)">14px</button>
          <button class="dm-opt" data-fontsize="16" onclick="setDanmakuFontsize(16)">16px</button>
          <button class="dm-opt" data-fontsize="18" onclick="setDanmakuFontsize(18)">18px</button>
          <button class="dm-opt" data-fontsize="20" onclick="setDanmakuFontsize(20)">20px</button>
        </div>
      </div>
      <button class="pip-btn" onclick="togglePiP()" title="画中画" id="pipBtn" style="display:none"><i class="fas fa-external-link-alt"></i></button>
      <div class="sleep-wrap">
        <button onclick="toggleSleepMenu()" title="睡眠定时" id="sleepBtn"><i class="fas fa-moon"></i><span class="sleep-timer-label" id="sleepLabel"></span></button>
        <div class="sleep-dropdown" id="sleepDropdown">
          <button class="sl-opt active" data-min="0" onclick="setSleepTimer(0)">关闭</button>
          <button class="sl-opt" data-min="15" onclick="setSleepTimer(15)">15 分钟</button>
          <button class="sl-opt" data-min="30" onclick="setSleepTimer(30)">30 分钟</button>
          <button class="sl-opt" data-min="60" onclick="setSleepTimer(60)">60 分钟</button>
          <button class="sl-opt" data-min="90" onclick="setSleepTimer(90)">90 分钟</button>
        </div>
      </div>
      <div class="skip-settings">
        <button onclick="toggleSkipSettings()" title="片头设置"><i class="fas fa-cog"></i></button>
        <div class="skip-dropdown" id="skipDropdown">
          <label>跳过秒数</label>
          <input type="number" id="skipInput" value="90" min="0" max="600" onchange="updateSkipTime(this.value)">
          <label style="margin-top:8px">长按倍速</label>
          <button class="lp-opt" data-lpspeed="2" onclick="setLongPressSpeed(2)">2x</button>
          <button class="lp-opt" data-lpspeed="3" onclick="setLongPressSpeed(3)">3x</button>
          <button class="lp-opt" data-lpspeed="4" onclick="setLongPressSpeed(4)">4x</button>
          <button class="lp-opt" data-lpspeed="5" onclick="setLongPressSpeed(5)">5x</button>
        </div>
      </div>
      <button onclick="toggleFullscreen()" title="全屏(F)"><i class="fas fa-expand"></i></button>
      <div class="more-wrap">
        <button onclick="toggleMoreMenu()" title="更多"><i class="fas fa-ellipsis-v"></i></button>
        <div class="more-dropdown" id="moreDropdown">
          <button onclick="cycleSpeed();closeMoreMenu()"><i class="fas fa-tachometer-alt"></i>倍速 <span id="moreSpeedLabel">1x</span></button>
          <button onclick="skipIntro();closeMoreMenu()"><i class="fas fa-forward"></i>跳过片头 <span id="moreSkipLabel">90s</span></button>
          <button onclick="toggleDanmaku();closeMoreMenu()"><i class="fas fa-comments"></i>弹幕开关</button>
          <button onclick="toggleDanmakuSettings();closeMoreMenu()"><i class="fas fa-sliders-h"></i>弹幕设置</button>
          <button onclick="togglePiP();closeMoreMenu()" id="morePipBtn" style="display:none"><i class="fas fa-external-link-alt"></i>画中画</button>
          <button onclick="toggleSleepMenu();closeMoreMenu()"><i class="fas fa-moon"></i>睡眠定时 <span id="moreSleepLabel"></span></button>
          <button onclick="toggleSkipSettings();closeMoreMenu()"><i class="fas fa-cog"></i>长按倍速设置</button>
        </div>
      </div>
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

  <!-- Recommendations -->
  <div class="recommend-section" id="recommendSection" style="display:none">
    <h3><i class="fas fa-magic"></i> 猜你喜欢</h3>
    <div class="recommend-grid" id="recommendGrid"></div>
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
// New feature state
var longPressSpeed=parseInt(localStorage.getItem('anime_longpress_speed'))||3;
var brightnessValue=1;
var gestureActive=false;
var gestureType=null; // 'brightness' or 'volume'
var sleepTimerId=null;
var sleepRemaining=0;
var sleepIntervalId=null;
var danmakuDensity=parseInt(localStorage.getItem('anime_danmaku_density'))||1;
var danmakuFontSize=parseInt(localStorage.getItem('anime_danmaku_fontsize'))||16;

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

// Detect best source line: test each line's first URL
async function detectBestSource(srcs){
  if(!srcs||srcs.length===0)return 0;
  if(srcs.length===1)return 0;

  showToast('检测可用线路...',2000);

  // Score each line: m3u8=2, share=1, other=0; +2 if accessible
  var scores=[];
  for(var i=0;i<srcs.length;i++){
    var eps=srcs[i];
    if(!eps||eps.length===0){scores.push(-1);continue;}
    var url=eps[0].url||'';
    var score=0;
    if(url.includes('.m3u8'))score=2;
    else if(url.includes('/share/'))score=1;
    // Test accessibility
    try{
      var ctrl=new AbortController();
      var tmr=setTimeout(function(){ctrl.abort();},5000);
      var r=await fetch(url,{method:'HEAD',mode:'no-cors',signal:ctrl.signal});
      clearTimeout(tmr);
      score+=2; // accessible
    }catch(e){
      // CORS error is OK for m3u8 (means server responded)
      // Network error means truly unreachable
      if(url.includes('.m3u8'))score+=1; // m3u8 CORS error = server alive
    }
    scores.push(score);
  }

  // Pick highest score
  var best=0,bestScore=-1;
  for(var j=0;j<scores.length;j++){
    if(scores[j]>bestScore){bestScore=scores[j];best=j;}
  }
  return best;
}

// Auto-switch to next line on playback failure
var sourceRetryCount=0;
function tryNextSource(epIndex){
  sourceRetryCount++;
  if(sourceRetryCount>=sources.length){
    showToast('所有线路均不可用',3000);
    sourceRetryCount=0;
    return false;
  }
  var next=(currentSourceIndex+1)%sources.length;
  showToast('线路'+(currentSourceIndex+1)+'失败，切换线路'+(next+1),2000);
  currentSourceIndex=next;
  episodes=sources[next]||[];
  document.querySelectorAll('#sourceTabs button').forEach(function(b,i){b.classList.toggle('active',i===next);});
  renderEpisodes();
  playEpisode(epIndex);
  return true;
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

    // Auto-detect working source line
    currentSourceIndex=await detectBestSource(sources);
    switchSource(currentSourceIndex,histEp);

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
  sourceRetryCount=0;
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
  var watched=[];
  try{watched=JSON.parse(localStorage.getItem('anime_watched_'+vodId))||[];}catch(e){}
  episodes.forEach(function(ep,i){
    var btn=document.createElement('button');
    btn.className='ep-btn';
    if(watched.indexOf(i)>=0)btn.className+=' watched';
    btn.textContent=ep.name;
    if(watched.indexOf(i)>=0)btn.innerHTML+=' <span class="watched-dot"></span>';
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

  // Save watched status
  var watched=[];
  try{watched=JSON.parse(localStorage.getItem('anime_watched_'+vodId))||[];}catch(e){}
  if(watched.indexOf(index)<0){
    watched.push(index);
    try{localStorage.setItem('anime_watched_'+vodId,JSON.stringify(watched));}catch(e){}
  }
  // Mark button as watched
  var epBtns=document.querySelectorAll('.ep-btn');
  if(epBtns[index]){
    epBtns[index].classList.add('watched');
    if(!epBtns[index].querySelector('.watched-dot')){
      var dot=document.createElement('span');dot.className='watched-dot';epBtns[index].appendChild(dot);
    }
  }

  var url=ep.url;
  var isM3U8=url.includes('.m3u8')||url.includes('/m3u8');

  stopPlayer(false);

  if(isM3U8&&Hls.isSupported()){
    hlsInstance=new Hls({maxBufferLength:30,maxMaxBufferLength:60});
    hlsInstance.loadSource(url);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED,function(){video.play().catch(function(){});});
    hlsInstance.on(Hls.Events.ERROR,function(event,data){
      if(data.fatal){
        // Try next source line first, then fallback to iframe
        if(!tryNextSource(currentEpIndex)){fallbackToIframe(url);}
      }
    });
  }else if(video.canPlayType('application/vnd.apple.mpegurl')){
    video.src=url;
    video.addEventListener('loadedmetadata',function(){video.play().catch(function(){});},{once:true});
  }else{
    fallbackToIframe(url);return;
  }

  loadDanmaku();
  startDanmakuLoop();
  video.playbackRate=playbackSpeed;
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
    video.pause();video.removeAttribute('src');try{video.load();}catch(e){}video.style.display='';
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
window.togglePlay=function(){if(video.paused)video.play().catch(function(){});else video.pause();};
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

window.cycleSpeed=function(){speedIndex=(speedIndex+1)%speeds.length;playbackSpeed=speeds[speedIndex];video.playbackRate=playbackSpeed;document.getElementById('speedBtn').textContent=playbackSpeed+'x';var msl=document.getElementById('moreSpeedLabel');if(msl)msl.textContent=playbackSpeed+'x';try{localStorage.setItem('anime_speed',playbackSpeed);}catch(e){}};

window.toggleFullscreen=function(){
  var wrapper=document.querySelector('.player-wrap');
  var vid=document.getElementById('videoPlayer');
  if(!document.fullscreenElement&&!document.webkitFullscreenElement){
    // iOS Safari: only video element supports webkitEnterFullscreen
    if(vid.webkitEnterFullscreen){
      vid.webkitEnterFullscreen();
    }else if(wrapper.requestFullscreen){
      wrapper.requestFullscreen();
    }else if(wrapper.webkitRequestFullscreen){
      wrapper.webkitRequestFullscreen();
    }
  }else{
    if(document.exitFullscreen){document.exitFullscreen();}
    else if(document.webkitExitFullscreen){document.webkitExitFullscreen();}
  }
};

window.skipIntro=function(){video.currentTime=Math.min(video.currentTime+skipIntroTime,video.duration||Infinity);};
window.toggleSkipSettings=function(){document.getElementById('skipDropdown').classList.toggle('show');document.getElementById('sleepDropdown').classList.remove('show');document.getElementById('danmakuSettingsDropdown').classList.remove('show');document.getElementById('moreDropdown').classList.remove('show');};
window.toggleMoreMenu=function(){document.getElementById('moreDropdown').classList.toggle('show');document.getElementById('skipDropdown').classList.remove('show');document.getElementById('sleepDropdown').classList.remove('show');document.getElementById('danmakuSettingsDropdown').classList.remove('show');};
window.closeMoreMenu=function(){document.getElementById('moreDropdown').classList.remove('show');};
window.updateSkipTime=function(val){skipIntroTime=parseInt(val)||90;document.getElementById('skipLabel').textContent=skipIntroTime+'s';var mskl=document.getElementById('moreSkipLabel');if(mskl)mskl.textContent=skipIntroTime+'s';try{localStorage.setItem('anime_skip_intro',skipIntroTime);}catch(e){}};

document.addEventListener('click',function(e){if(!e.target.closest('.skip-settings')){document.getElementById('skipDropdown').classList.remove('show');}if(!e.target.closest('.more-wrap')){document.getElementById('moreDropdown').classList.remove('show');}if(!e.target.closest('.sleep-wrap')){document.getElementById('sleepDropdown').classList.remove('show');}if(!e.target.closest('.danmaku-settings-wrap')){document.getElementById('danmakuSettingsDropdown').classList.remove('show');}});

// Long press speed up
var videoBox=document.getElementById('videoBox');
function startSpeedUp(){if(isSpeedUp)return;isSpeedUp=true;video.playbackRate=longPressSpeed;document.getElementById('speedIndicator').textContent=longPressSpeed+'x';document.getElementById('speedIndicator').style.display='block';}
function endSpeedUp(){if(!isSpeedUp)return;isSpeedUp=false;video.playbackRate=playbackSpeed;document.getElementById('speedIndicator').style.display='none';}

var mouseDownTime=0;
videoBox.addEventListener('mousedown',function(e){
  if(e.target.closest('.controls')||e.target.closest('.danmaku-bar'))return;
  mouseDownTime=Date.now();longPressTimer=setTimeout(startSpeedUp,500);
});
videoBox.addEventListener('mouseup',function(e){
  if(e.target.closest('.controls')||e.target.closest('.danmaku-bar'))return;
  clearTimeout(longPressTimer);
  if(isSpeedUp)endSpeedUp();
  else if(Date.now()-mouseDownTime<300)togglePlay();
});
videoBox.addEventListener('mouseleave',endSpeedUp);

var touchDownTime=0;
var lastTapTime=0;
var touchStartX=0;
var touchStartY=0;
var touchMoved=false;
var overlayHideTimer=null;

// Touch control overlay (mobile)
var touchOverlay=document.createElement('div');
touchOverlay.id='touchOverlay';
touchOverlay.innerHTML='<div class="touch-panel">'
  +'<button class="touch-btn" data-action="backward"><i class="fas fa-undo"></i><span>10s</span></button>'
  +'<button class="touch-btn touch-btn-main" data-action="play"><i class="fas fa-play"></i></button>'
  +'<button class="touch-btn" data-action="forward"><i class="fas fa-redo"></i><span>10s</span></button>'
  +'</div>';
document.getElementById('videoBox').appendChild(touchOverlay);

function showTouchOverlay(autoHide){
  touchOverlay.classList.add('visible');
  // Update play/pause icon
  var btn=touchOverlay.querySelector('[data-action="play"]');
  if(btn)btn.innerHTML=video.paused?'<i class="fas fa-play"></i>':'<i class="fas fa-pause"></i>';
  clearTimeout(overlayHideTimer);
  if(autoHide!==false){
    overlayHideTimer=setTimeout(function(){touchOverlay.classList.remove('visible');},3000);
  }
}

touchOverlay.addEventListener('click',function(e){
  var btn=e.target.closest('.touch-btn');
  if(!btn)return;
  e.stopPropagation();
  var action=btn.dataset.action;
  if(action==='play'){togglePlay();}
  else if(action==='backward'){video.currentTime=Math.max(0,video.currentTime-10);}
  else if(action==='forward'){video.currentTime=Math.min(video.duration||0,video.currentTime+10);}
  // Refresh icon
  var playBtn=touchOverlay.querySelector('[data-action="play"]');
  if(playBtn)playBtn.innerHTML=video.paused?'<i class="fas fa-play"></i>':'<i class="fas fa-pause"></i>';
  clearTimeout(overlayHideTimer);
  overlayHideTimer=setTimeout(function(){touchOverlay.classList.remove('visible');},3000);
});

// Prevent overlay from triggering video tap
touchOverlay.addEventListener('touchstart',function(e){e.stopPropagation();},{passive:true});
touchOverlay.addEventListener('touchend',function(e){e.stopPropagation();});

videoBox.addEventListener('touchstart',function(e){
  if(e.target.closest('.controls')||e.target.closest('.danmaku-bar')||e.target.closest('#touchOverlay'))return;
  touchDownTime=Date.now();
  touchMoved=false;
  gestureActive=false;
  gestureType=null;
  touchStartX=(e.touches[0]||{}).clientX||0;
  touchStartY=(e.touches[0]||{}).clientY||0;
  // Determine gesture side for brightness/volume
  var rect=videoBox.getBoundingClientRect();
  var side=touchStartX-rect.left<rect.width/2?'left':'right';
  gestureType=side==='left'?'brightness':'volume';
},{passive:false});
videoBox.addEventListener('touchmove',function(e){
  if(e.target.closest('.controls')||e.target.closest('.danmaku-bar')||e.target.closest('#touchOverlay'))return;
  var cx=((e.touches[0]||{}).clientX||0);
  var cy=((e.touches[0]||{}).clientY||0);
  var dx=Math.abs(cx-touchStartX);
  var dy=Math.abs(cy-touchStartY);
  if(dx>10||dy>10)touchMoved=true;
  // Volume/Brightness gesture: vertical swipe with clear intent
  if(dy>20&&dy>dx*1.5&&!isSpeedUp){
    e.preventDefault(); // prevent page scroll during gesture
    gestureActive=true;
    var deltaY=touchStartY-cy; // positive = swipe up
    var rect=videoBox.getBoundingClientRect();
    var pctChange=deltaY/rect.height*2; // 0..1 range
    var indicator=document.getElementById('gestureIndicator');
    if(gestureType==='brightness'){
      brightnessValue=Math.max(0.2,Math.min(2,1+pctChange));
      video.style.filter='brightness('+brightnessValue.toFixed(2)+')';
      indicator.textContent='☀ '+Math.round(brightnessValue*100)+'%';
    }else{
      var vol=Math.max(0,Math.min(1,video.volume+pctChange));
      video.volume=vol;
      video.muted=vol===0;
      document.getElementById('volumeSlider').value=Math.round(vol*100);
      updateMuteIcon();
      indicator.textContent='🔊 '+Math.round(vol*100)+'%';
    }
    indicator.style.display='block';
  }
},{passive:false});
videoBox.addEventListener('touchend',function(e){
  if(e.target.closest('.controls')||e.target.closest('.danmaku-bar')||e.target.closest('#touchOverlay'))return;
  // Hide gesture indicator
  document.getElementById('gestureIndicator').style.display='none';
  if(gestureActive){gestureActive=false;gestureType=null;return;}
  if(touchMoved)return; // ignore swipes
  var now=Date.now();
  var dt=now-touchDownTime;
  if(dt>500)return; // was long press (now unused, just ignore)
  // Single tap: show/hide touch overlay
  var singleTapTime=now;
  setTimeout(function(){
    if(lastTapTime===singleTapTime){
      if(touchOverlay.classList.contains('visible')){
        touchOverlay.classList.remove('visible');
      }else{
        showTouchOverlay();
      }
    }
  },200);
  lastTapTime=now;
});
videoBox.addEventListener('touchcancel',endSpeedUp);

function showTapHint(id){
  var el=document.getElementById(id);
  if(!el)return;
  el.style.opacity='1';
  clearTimeout(el._t);
  el._t=setTimeout(function(){el.style.opacity='0';},400);
}

// Progress bar drag (touch)
var progressWrap=document.getElementById('progressWrap');
var isDragging=false;
progressWrap.addEventListener('touchstart',function(e){
  isDragging=true;
  seekFromTouch(e);
},{passive:true});
progressWrap.addEventListener('touchmove',function(e){
  if(isDragging)seekFromTouch(e);
},{passive:true});
progressWrap.addEventListener('touchend',function(){isDragging=false;});

function seekFromTouch(e){
  var rect=progressWrap.getBoundingClientRect();
  var x=(e.touches[0]||e.changedTouches[0]).clientX-rect.left;
  var pct=Math.max(0,Math.min(1,x/rect.width));
  video.currentTime=pct*(video.duration||0);
}

// Auto-fullscreen on landscape (mobile)
function isMobile(){return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);}
if(isMobile()){
  window.addEventListener('orientationchange',function(){
    var isLandscape=screen.orientation&&(screen.orientation.type||'').includes('landscape')
      ||window.innerWidth>window.innerHeight;
    if(isLandscape&&!document.fullscreenElement&&!document.webkitFullscreenElement){
      var vid=document.getElementById('videoPlayer');
      if(vid.webkitEnterFullscreen){vid.webkitEnterFullscreen().catch(function(){});}
      else{
        var wrapper=document.querySelector('.player-wrap');
        (wrapper.requestFullscreen||wrapper.webkitRequestFullscreen||function(){}).call(wrapper).catch(function(){});
      }
    }
  });
}

// Keyboard
document.addEventListener('keydown',function(e){
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
  switch(e.key.toLowerCase()){
    case 'n':playNextEp();break;
    case 'p':playPrevEp();break;
    case 'r':video.currentTime=0;video.play().catch(function(){});break;
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
  if(e.code==='Space'&&!e.repeat){e.preventDefault();spaceHeld=true;longPressTimer=setTimeout(startSpeedUp,500);}
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
  ctx.clearRect(0,0,w,h);ctx.font=danmakuFontSize+'px sans-serif';
  var ct=video.currentTime;
  var densitySkip=danmakuDensity>1?danmakuDensity:1;
  danmakuList.forEach(function(dm,idx){
    if(danmakuDensity>1&&idx%densitySkip!==0)return; // density filter
    if(!dm.active&&ct>=dm.time&&ct<dm.time+10){
      dm.active=true;dm.x=w;dm.width=ctx.measureText(dm.text).width;
      var lane=0;dm.y=danmakuFontSize+8+(lane%Math.floor((h-danmakuFontSize-8)/(danmakuFontSize+12)))*(danmakuFontSize+12);
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

// Restore saved playback speed
var savedSpeed=localStorage.getItem('anime_speed');
if(savedSpeed){
  var sp=parseFloat(savedSpeed);
  if(!isNaN(sp)){
    playbackSpeed=sp;
    var si=speeds.indexOf(sp);
    if(si>=0)speedIndex=si;
  }
}
video.playbackRate=playbackSpeed;
document.getElementById('speedBtn').textContent=playbackSpeed+'x';

// Restore saved skip time
var savedSkip=localStorage.getItem('anime_skip_intro');
if(savedSkip){skipIntroTime=parseInt(savedSkip)||90;}
document.getElementById('skipLabel').textContent=skipIntroTime+'s';
document.getElementById('skipInput').value=skipIntroTime;

// Show PiP button if supported
if(document.pictureInPictureEnabled){document.getElementById('pipBtn').style.display='';document.getElementById('morePipBtn').style.display='';}

// === FEATURE: Picture-in-Picture ===
window.togglePiP=function(){
  if(!document.pictureInPictureEnabled)return;
  if(document.pictureInPictureElement){
    document.exitPictureInPicture().catch(function(){});
  }else{
    video.requestPictureInPicture().catch(function(){showToast('画中画不可用');});
  }
};

// === FEATURE: Long-press speed setting ===
window.setLongPressSpeed=function(speed){
  longPressSpeed=speed;
  try{localStorage.setItem('anime_longpress_speed',speed);}catch(e){}
  document.getElementById('speedIndicator').textContent=speed+'x';
  // Update active state
  document.querySelectorAll('.lp-opt').forEach(function(b){
    b.classList.toggle('active',parseInt(b.dataset.lpspeed)===speed);
  });
  showToast('长按倍速: '+speed+'x');
};
// Initialize long-press speed active state
document.querySelectorAll('.lp-opt').forEach(function(b){
  b.classList.toggle('active',parseInt(b.dataset.lpspeed)===longPressSpeed);
});

// === FEATURE: Sleep timer ===
window.toggleSleepMenu=function(){
  document.getElementById('sleepDropdown').classList.toggle('show');
  // Close other dropdowns
  document.getElementById('danmakuSettingsDropdown').classList.remove('show');
};
window.setSleepTimer=function(minutes){
  // Clear existing timers
  if(sleepTimerId){clearTimeout(sleepTimerId);sleepTimerId=null;}
  if(sleepIntervalId){clearInterval(sleepIntervalId);sleepIntervalId=null;}
  updateSleepLabel('');
  // Update active state
  document.querySelectorAll('.sl-opt').forEach(function(b){
    b.classList.toggle('active',parseInt(b.dataset.min)===minutes);
  });
  if(minutes<=0){
    showToast('睡眠定时已关闭');
    document.getElementById('sleepDropdown').classList.remove('show');
    return;
  }
  sleepRemaining=minutes*60;
  updateSleepLabel(formatSleepTime(sleepRemaining));
  sleepIntervalId=setInterval(function(){
    sleepRemaining--;
    if(sleepRemaining<=0){
      clearInterval(sleepIntervalId);sleepIntervalId=null;
      updateSleepLabel('');
    }else{
      updateSleepLabel(formatSleepTime(sleepRemaining));
    }
  },1000);
  sleepTimerId=setTimeout(function(){
    video.pause();
    showToast('睡眠定时已到，视频已暂停',3000);
    updateSleepLabel('');
    sleepTimerId=null;
  },minutes*60*1000);
  showToast('将在 '+minutes+' 分钟后暂停');
  document.getElementById('sleepDropdown').classList.remove('show');
};
function formatSleepTime(sec){
  var m=Math.floor(sec/60);var s=sec%60;
  return m+':'+(s<10?'0':'')+s;
}
function updateSleepLabel(text){
  var sl=document.getElementById('sleepLabel');if(sl)sl.textContent=text;
  var msl=document.getElementById('moreSleepLabel');if(msl)msl.textContent=text;
}

// Close sleep dropdown on outside click
document.addEventListener('click',function(e){
  if(!e.target.closest('.sleep-wrap')){document.getElementById('sleepDropdown').classList.remove('show');}
});

// === FEATURE: Danmaku density + font size ===
window.toggleDanmakuSettings=function(){
  document.getElementById('danmakuSettingsDropdown').classList.toggle('show');
  // Close other dropdowns
  document.getElementById('sleepDropdown').classList.remove('show');
};
window.setDanmakuDensity=function(d){
  danmakuDensity=d;
  try{localStorage.setItem('anime_danmaku_density',d);}catch(e){}
  document.querySelectorAll('.dm-opt[data-density]').forEach(function(b){
    b.classList.toggle('active',parseInt(b.dataset.density)===d);
  });
  showToast(d===1?'弹幕密度: 全部':'弹幕密度: 1/'+d);
};
window.setDanmakuFontsize=function(s){
  danmakuFontSize=s;
  try{localStorage.setItem('anime_danmaku_fontsize',s);}catch(e){}
  document.querySelectorAll('.dm-opt[data-fontsize]').forEach(function(b){
    b.classList.toggle('active',parseInt(b.dataset.fontsize)===s);
  });
  showToast('弹幕字号: '+s+'px');
};
// Initialize danmaku settings active states
document.querySelectorAll('.dm-opt[data-density]').forEach(function(b){
  b.classList.toggle('active',parseInt(b.dataset.density)===danmakuDensity);
});
document.querySelectorAll('.dm-opt[data-fontsize]').forEach(function(b){
  b.classList.toggle('active',parseInt(b.dataset.fontsize)===danmakuFontSize);
});
// Close danmaku settings on outside click
document.addEventListener('click',function(e){
  if(!e.target.closest('.danmaku-settings-wrap')){document.getElementById('danmakuSettingsDropdown').classList.remove('show');}
});

// === FEATURE: Favorites ===
window.toggleFavorite=function(){
  var favs=[];
  try{favs=JSON.parse(localStorage.getItem('anime_favorites'))||[];}catch(e){}
  var existingIdx=-1;
  for(var i=0;i<favs.length;i++){if(favs[i].vodId===vodId){existingIdx=i;break;}}
  if(existingIdx>=0){
    favs.splice(existingIdx,1);
    document.getElementById('favBtn').classList.remove('active');
    document.getElementById('favBtn').innerHTML='<i class="far fa-heart"></i>';
    showToast('已取消收藏');
  }else{
    favs.unshift({vodId:vodId,vodName:currentDetail?currentDetail.vod_name:'',vodPic:currentDetail?currentDetail.vod_pic:'',addedAt:Date.now()});
    document.getElementById('favBtn').classList.add('active');
    document.getElementById('favBtn').innerHTML='<i class="fas fa-heart"></i>';
    showToast('已收藏');
  }
  try{localStorage.setItem('anime_favorites',JSON.stringify(favs));}catch(e){}
};
function checkFavorite(){
  var favs=[];
  try{favs=JSON.parse(localStorage.getItem('anime_favorites'))||[];}catch(e){}
  var isFav=false;
  for(var i=0;i<favs.length;i++){if(favs[i].vodId===vodId){isFav=true;break;}}
  if(isFav){
    document.getElementById('favBtn').classList.add('active');
    document.getElementById('favBtn').innerHTML='<i class="fas fa-heart"></i>';
  }
}
// Check favorite on load (after detail loads, call checkFavorite)
var origLoadDetail=loadDetail;
loadDetail=async function(){
  await origLoadDetail();
  checkFavorite();
  loadRecommendations();
};

// === FEATURE: Related Recommendations ===
async function loadRecommendations(){
  if(!currentDetail)return;
  var genre=currentDetail.vod_class||'';
  if(!genre)return;
  // Use first genre keyword for search
  var keyword=genre.split(/[,，/]/)[0].trim();
  if(!keyword)return;
  try{
    var res=await fetch(API+'/api/ffzy?ac=list&wd='+encodeURIComponent(keyword));
    var data=await res.json();
    var list=(data.list||[]).filter(function(item){return item.vod_id!==vodId;}).slice(0,6);
    if(list.length===0)return;
    document.getElementById('recommendSection').style.display='block';
    var grid=document.getElementById('recommendGrid');
    grid.innerHTML='';
    list.forEach(function(item){
      var card=document.createElement('a');
      card.className='recommend-card';
      card.href='/anime/play/?vod_id='+item.vod_id;
      card.innerHTML='<img src="'+(item.vod_pic||'')+'" alt="'+(item.vod_name||'')+'" loading="lazy"><div class="rec-title">'+(item.vod_name||'')+'</div>';
      grid.appendChild(card);
    });
  }catch(e){}
}

// Init
loadDetail();

})();
</script>
