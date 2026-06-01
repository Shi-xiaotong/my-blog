---
title: 影视屋
date: 2026-05-31 16:00:00
type: anime
---

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>

<style>
#anime-page{background:#0f0f1a;min-height:100vh;color:#e0e0e0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:0;margin:0}
#anime-page *{box-sizing:border-box}
#anime-page .search-bar{display:flex;max-width:700px;margin:20px auto;padding:0 16px}
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
#anime-page .pagination button{min-width:120px;height:38px;line-height:38px;padding:0 32px;background:#1a1a2e;color:#ffd93d;border:1px solid #333;border-radius:8px;cursor:pointer;font-size:14px;text-align:center}
#anime-page .pagination button:hover{background:#ffd93d;color:#0f0f1a}
#anime-page .pagination button:disabled{opacity:.4;cursor:not-allowed}
#anime-page .page-info{color:#aaa;font-size:14px;width:auto!important;min-width:100px;line-height:38px;text-align:center}
/* Overlay */
#anime-page .overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.92);z-index:1000;overflow-y:auto;padding:20px 16px}
#anime-page .overlay.show{display:block}
#anime-page .overlay-inner{max-width:900px;margin:0 auto;background:#1a1a2e;border-radius:12px;overflow:hidden}
#anime-page .overlay-close{position:fixed;top:16px;right:20px;background:none;border:none;color:#aaa;font-size:28px;cursor:pointer;z-index:1001}
#anime-page .overlay-close:hover{color:#e94560}
#anime-page .detail-header{display:flex;gap:20px;padding:20px;flex-wrap:wrap}
#anime-page .detail-poster{width:160px;border-radius:8px;flex-shrink:0}
#anime-page .detail-info{flex:1;min-width:200px}
#anime-page .detail-info h2{margin:0 0 8px;color:#ffd93d;font-size:20px}
#anime-page .detail-info p{margin:4px 0;color:#aaa;font-size:13px}
#anime-page .continue-btn{display:inline-block;margin-top:10px;padding:8px 20px;background:#e94560;color:#fff;border:none;border-radius:20px;cursor:pointer;font-size:14px}
/* Player */
#anime-page .player-section{padding:0 20px 20px}
#anime-page .player-wrapper{position:relative;width:100%;max-width:900px;margin:0 auto;background:#000;border-radius:8px;overflow:hidden}
#anime-page .video-container{position:relative;width:100%;padding-top:56.25%;background:#000}
#anime-page .video-container video,#anime-page .video-container iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:none}
#anime-page .danmaku-canvas{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2}
#anime-page .speed-indicator{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.7);color:#ffd93d;padding:10px 24px;border-radius:12px;font-size:24px;font-weight:700;display:none;z-index:3}
/* Controls */
#anime-page .player-controls{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#111;flex-wrap:wrap}
#anime-page .player-controls button{background:none;border:none;color:#e0e0e0;cursor:pointer;font-size:16px;padding:6px}
#anime-page .player-controls button:hover{color:#ffd93d}
#anime-page .progress-wrap{flex:1;min-width:100px;height:20px;display:flex;align-items:center;cursor:pointer;position:relative}
#anime-page .progress-bar{width:100%;height:4px;background:#333;border-radius:2px;position:relative}
#anime-page .progress-bar .progress-fill{height:100%;background:#ffd93d;border-radius:2px;width:0;transition:width .1s}
#anime-page .progress-bar .progress-buffer{position:absolute;top:0;left:0;height:100%;background:rgba(255,255,255,.2);border-radius:2px;width:0}
#anime-page .progress-time{color:#aaa;font-size:12px;white-space:nowrap;margin:0 6px}
#anime-page .volume-wrap{display:flex;align-items:center;gap:4px}
#anime-page .volume-wrap input[type=range]{width:70px;accent-color:#ffd93d}
#anime-page .speed-btn{font-size:13px!important;padding:4px 8px!important;background:#333!important;border-radius:4px;color:#ffd93d!important}
#anime-page .skip-btn{font-size:12px!important;padding:4px 10px!important;background:#e94560!important;border-radius:4px;color:#fff!important;display:flex;align-items:center;gap:4px}
#anime-page .skip-settings{position:relative;display:inline-block}
#anime-page .skip-dropdown{display:none;position:absolute;bottom:100%;right:0;background:#222;border:1px solid #444;border-radius:6px;padding:8px;z-index:10;min-width:140px}
#anime-page .skip-dropdown.show{display:block}
#anime-page .skip-dropdown label{font-size:12px;color:#aaa;display:block;margin-bottom:4px}
#anime-page .skip-dropdown input{width:60px;background:#111;border:1px solid #444;color:#fff;padding:3px 6px;border-radius:4px;font-size:12px}
/* Danmaku input */
#anime-page .danmaku-bar{display:flex;gap:8px;padding:8px 12px;background:#111;align-items:center;flex-wrap:wrap}
#anime-page .danmaku-bar input{flex:1;min-width:150px;padding:8px 12px;background:#1a1a2e;border:1px solid #333;border-radius:20px;color:#fff;font-size:13px;outline:none}
#anime-page .danmaku-bar input:focus{border-color:#ffd93d}
#anime-page .danmaku-bar .color-picker{display:flex;gap:4px}
#anime-page .danmaku-bar .color-dot{width:20px;height:20px;border-radius:50%;cursor:pointer;border:2px solid transparent}
#anime-page .danmaku-bar .color-dot.active{border-color:#ffd93d}
#anime-page .danmaku-bar .send-btn{padding:8px 18px;background:#ffd93d;color:#0f0f1a;border:none;border-radius:20px;cursor:pointer;font-size:13px;font-weight:600}
#anime-page .danmaku-bar .send-btn:hover{background:#e94560;color:#fff}
/* Episode grid */
#anime-page .episode-section{padding:0 20px 20px;max-width:900px;margin:0 auto}
#anime-page .episode-section h3{color:#ffd93d;font-size:15px;margin:0 0 10px}
#anime-page .episode-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px}
#anime-page .ep-btn{padding:8px 4px;background:#222;color:#ccc;border:1px solid #333;border-radius:6px;cursor:pointer;font-size:13px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:all .2s}
#anime-page .ep-btn:hover,#anime-page .ep-btn.active{background:#ffd93d;color:#0f0f1a;border-color:#ffd93d}
/* Continue watching */
#anime-page .continue-card{display:none;background:linear-gradient(135deg,#1a1a2e,#16213e);border:1px solid #ffd93d;border-radius:12px;padding:16px;margin:16px auto;max-width:600px;cursor:pointer;transition:transform .2s}
#anime-page .continue-card.show{display:flex;gap:16px;align-items:center}
#anime-page .continue-card:hover{transform:translateY(-2px)}
#anime-page .continue-card img{width:80px;height:110px;object-fit:cover;border-radius:8px}
#anime-page .continue-card .cont-info h3{margin:0 0 4px;color:#ffd93d;font-size:16px}
#anime-page .continue-card .cont-info p{margin:2px 0;color:#aaa;font-size:13px}
#anime-page .continue-card .cont-info span{color:#e94560;font-size:12px}
/* Auth */
#anime-page .auth-bar{position:fixed;top:16px;right:16px;z-index:999;display:flex;align-items:center;gap:8px}
#anime-page .auth-bar .login-btn{padding:6px 16px;background:rgba(255,217,61,.15);color:#ffd93d;border:1px solid rgba(255,217,61,.3);border-radius:20px;cursor:pointer;font-size:13px;transition:all .2s}
#anime-page .auth-bar .login-btn:hover{background:rgba(255,217,61,.3)}
#anime-page .auth-bar .user-info{display:flex;align-items:center;gap:6px;padding:4px 12px;background:rgba(26,26,46,.9);border:1px solid #333;border-radius:20px;font-size:13px;color:#aaa}
#anime-page .auth-bar .user-info .user-email{color:#ffd93d;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#anime-page .auth-bar .user-info .logout-btn{background:none;border:none;color:#888;cursor:pointer;font-size:12px;padding:2px 4px}
#anime-page .auth-bar .user-info .logout-btn:hover{color:#e94560}
#anime-page .login-modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.7);z-index:1002;align-items:center;justify-content:center}
#anime-page .login-modal.show{display:flex}
#anime-page .login-modal .login-box{background:#1a1a2e;border:1px solid #333;border-radius:16px;padding:32px;width:340px;max-width:90vw;text-align:center}
#anime-page .login-modal .login-box h3{color:#ffd93d;margin:0 0 8px;font-size:18px}
#anime-page .login-modal .login-box p{color:#888;font-size:13px;margin:0 0 20px}
#anime-page .login-modal .login-box input{width:100%;padding:10px 16px;background:#0f0f1a;border:1px solid #333;border-radius:8px;color:#fff;font-size:14px;outline:none;margin-bottom:12px}
#anime-page .login-modal .login-box input:focus{border-color:#ffd93d}
#anime-page .login-modal .login-box .login-submit{width:100%;padding:10px;background:#ffd93d;color:#0f0f1a;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer}
#anime-page .login-modal .login-box .login-submit:hover{background:#e94560;color:#fff}
#anime-page .login-modal .login-box .login-cancel{background:none;border:none;color:#888;cursor:pointer;font-size:13px;margin-top:8px}
#anime-page .login-modal .login-box .login-cancel:hover{color:#ffd93d}
#anime-page .login-modal .login-box .login-error{color:#e94560;font-size:12px;margin-bottom:8px;min-height:16px}
/* Profile modal */
#anime-page .profile-modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.92);z-index:1003;overflow-y:auto}
#anime-page .profile-modal.show{display:block}
#anime-page .profile-inner{max-width:800px;margin:0 auto;padding:20px 16px}
#anime-page .profile-header{display:flex;align-items:center;gap:16px;padding:20px;background:#1a1a2e;border-radius:12px;margin-bottom:16px}
#anime-page .profile-avatar{width:64px;height:64px;border-radius:50%;background:#333;display:flex;align-items:center;justify-content:center;font-size:28px;color:#ffd93d;flex-shrink:0;overflow:hidden}
#anime-page .profile-avatar img{width:100%;height:100%;object-fit:cover}
#anime-page .profile-meta{flex:1}
#anime-page .profile-meta .name-row{display:flex;align-items:center;gap:8px;margin-bottom:4px}
#anime-page .profile-meta .display-name{color:#ffd93d;font-size:18px;font-weight:600}
#anime-page .profile-meta .edit-name-btn{background:none;border:none;color:#888;cursor:pointer;font-size:12px}
#anime-page .profile-meta .edit-name-btn:hover{color:#ffd93d}
#anime-page .profile-meta .email-text{color:#888;font-size:13px}
#anime-page .profile-meta .joined-text{color:#666;font-size:12px;margin-top:2px}
#anime-page .profile-close{position:fixed;top:16px;right:20px;background:none;border:none;color:#aaa;font-size:28px;cursor:pointer;z-index:1004}
#anime-page .profile-close:hover{color:#e94560}
#anime-page .profile-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}
#anime-page .profile-stat{background:#1a1a2e;border-radius:10px;padding:16px;text-align:center}
#anime-page .profile-stat .stat-num{color:#ffd93d;font-size:24px;font-weight:700}
#anime-page .profile-stat .stat-label{color:#888;font-size:12px;margin-top:4px}
#anime-page .profile-tabs{display:flex;gap:8px;margin-bottom:12px;overflow-x:auto}
#anime-page .profile-tabs button{padding:6px 16px;background:transparent;color:#aaa;border:1px solid #333;border-radius:20px;cursor:pointer;font-size:13px;white-space:nowrap}
#anime-page .profile-tabs button.active{background:#ffd93d;color:#0f0f1a;border-color:#ffd93d;font-weight:600}
#anime-page .profile-list{display:flex;flex-direction:column;gap:8px}
#anime-page .profile-list .list-item{background:#1a1a2e;border-radius:8px;padding:12px;display:flex;gap:12px;align-items:center}
#anime-page .profile-list .list-item img{width:50px;height:70px;object-fit:cover;border-radius:4px;flex-shrink:0}
#anime-page .profile-list .list-item .item-info{flex:1;min-width:0}
#anime-page .profile-list .list-item .item-title{color:#e0e0e0;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#anime-page .profile-list .list-item .item-sub{color:#888;font-size:12px;margin-top:2px}
#anime-page .profile-list .list-item .item-time{color:#666;font-size:11px;white-space:nowrap}
#anime-page .profile-list .empty-hint{text-align:center;color:#666;padding:30px;font-size:13px}
#anime-page .name-edit-row{display:flex;gap:8px;align-items:center}
#anime-page .name-edit-row input{background:#0f0f1a;border:1px solid #444;color:#ffd93d;padding:4px 10px;border-radius:6px;font-size:14px;outline:none;width:140px}
#anime-page .name-edit-row input:focus{border-color:#ffd93d}
#anime-page .name-edit-row button{padding:4px 12px;border:none;border-radius:6px;cursor:pointer;font-size:12px}
#anime-page .name-edit-row .save-btn{background:#ffd93d;color:#0f0f1a}
#anime-page .name-edit-row .cancel-btn{background:#333;color:#aaa}
@media(max-width:600px){
#anime-page .profile-stats{grid-template-columns:repeat(3,1fr);gap:8px}
#anime-page .profile-stat{padding:12px 8px}
#anime-page .profile-stat .stat-num{font-size:20px}
#anime-page .profile-header{flex-direction:column;text-align:center}
}
/* Loading */
#anime-page .loading{text-align:center;padding:40px;color:#aaa}
#anime-page .loading i{animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
/* Mobile */
@media(max-width:600px){
#anime-page .card-grid{grid-template-columns:repeat(3,1fr);gap:10px;padding:10px}
#anime-page .detail-header{flex-direction:column;align-items:center;text-align:center}
#anime-page .detail-poster{width:120px}
#anime-page .episode-grid{grid-template-columns:repeat(auto-fill,minmax(64px,1fr))}
#anime-page .player-controls{gap:4px;padding:6px 8px}
#anime-page .volume-wrap input[type=range]{width:50px}
}
</style>

<div id="anime-page">
  <!-- Profile Modal -->
  <div class="profile-modal" id="profileModal">
    <button class="profile-close" onclick="hideProfile()"><i class="fas fa-times"></i></button>
    <div class="profile-inner">
      <div class="profile-header">
        <div class="profile-avatar" id="profileAvatar"><i class="fas fa-user"></i></div>
        <div class="profile-meta">
          <div class="name-row">
            <span class="display-name" id="profileName"></span>
            <button class="edit-name-btn" onclick="editName()"><i class="fas fa-pen"></i> 编辑</button>
          </div>
          <div class="email-text" id="profileEmail"></div>
          <div class="joined-text" id="profileJoined"></div>
        </div>
      </div>
      <div class="profile-stats">
        <div class="profile-stat"><div class="stat-num" id="statHistory">0</div><div class="stat-label">观看记录</div></div>
        <div class="profile-stat"><div class="stat-num" id="statDanmaku">0</div><div class="stat-label">弹幕</div></div>
        <div class="profile-stat"><div class="stat-num" id="statComments">-</div><div class="stat-label">评论</div></div>
      </div>
      <div class="profile-tabs" id="profileTabs">
        <button class="active" data-tab="history"><i class="fas fa-clock"></i> 观看历史</button>
        <button data-tab="danmaku"><i class="fas fa-comments"></i> 弹幕</button>
        <button data-tab="comments"><i class="fas fa-comment"></i> 评论</button>
      </div>
      <div class="profile-list" id="profileList"></div>
    </div>
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
    <button id="prevBtn" onclick="changePage(-1)"><i class="fas fa-chevron-left"></i> 上一页</button>
    <span class="page-info" id="pageInfo">1</span>
    <button id="nextBtn" onclick="changePage(1)">下一页 <i class="fas fa-chevron-right"></i></button>
  </div>

  <!-- Loading -->
  <div class="loading" id="loading" style="display:none"><i class="fas fa-spinner"></i> 加载中...</div>

  <!-- Detail Overlay -->
  <div class="overlay" id="overlay">
    <button class="overlay-close" onclick="closeOverlay()"><i class="fas fa-times"></i></button>
    <div class="overlay-inner">
      <div class="detail-header">
        <img class="detail-poster" id="detailPoster" src="">
        <div class="detail-info">
          <h2 id="detailTitle"></h2>
          <p id="detailYear"></p>
          <p id="detailArea"></p>
          <p id="detailScore"></p>
          <p id="detailDesc"></p>
          <button class="continue-btn" id="detailContinue" style="display:none" onclick="playEpisode(currentHistory.episode_index)"><i class="fas fa-play"></i> 继续播放</button>
        </div>
      </div>
      <!-- Player -->
      <div class="player-section" id="playerSection" style="display:none">
        <div class="player-wrapper">
          <div class="video-container" id="videoContainer">
            <video id="videoPlayer" playsinline webkit-playsinline></video>
            <canvas class="danmaku-canvas" id="danmakuCanvas"></canvas>
            <div class="speed-indicator" id="speedIndicator">3x</div>
          </div>
          <div class="player-controls">
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
      </div>
      <!-- Episodes -->
      <div class="episode-section" id="episodeSection" style="display:none">
        <h3><i class="fas fa-list"></i> 选集</h3>
        <div class="episode-grid" id="episodeGrid"></div>
      </div>
    </div>
  </div>
</div>

<script>
(function(){
const API = 'https://ffzy.233002.xyz';
let currentPage = 1;
let currentType = '';
let currentKeyword = '';
let totalPages = 1;
let currentDetail = null;
let currentEpIndex = 0;
let episodes = [];
let sources = []; // array of source groups
let currentSourceIndex = 1; // use second source by default
let hlsInstance = null;
let danmakuEnabled = true;
let danmakuList = [];
let danmakuRAF = null;
let currentDanmakuColor = '#ffffff';
let playbackSpeed = 1;
let longPressTimer = null;
let isLongPress = false;
let isSpeedUp = false;
let currentHistory = null;
let skipIntroTime = 90;
let historyTimer = null;
let spaceHeld = false;

// ── Toast ──
window.showToast = function(msg, duration) {
  duration = duration || 2000;
  let el = document.getElementById('animeToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'animeToast';
    el.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:#ffd93d;border:1px solid #ffd93d;padding:8px 20px;border-radius:20px;font-size:13px;z-index:1100;transition:opacity .3s;opacity:0;pointer-events:none';
    document.getElementById('anime-page').appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.opacity = '0'; }, duration);
};

// ── Auth state (sync with global site-auth.js) ──
let authToken = localStorage.getItem('anime_token') || '';
let currentUser = JSON.parse(localStorage.getItem('anime_user') || 'null');

function authHeaders() {
  return authToken ? { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

function isLoggedIn() { return !!authToken; }

function syncAuth() {
  authToken = localStorage.getItem('anime_token') || '';
  currentUser = JSON.parse(localStorage.getItem('anime_user') || 'null');
}

// Re-sync auth state when localStorage changes (e.g. login from global bar)
window.addEventListener('storage', function(e) {
  if (e.key === 'anime_token' || e.key === 'anime_user') {
    syncAuth();
    if (isLoggedIn()) loadContinueCard();
    else document.getElementById('continueCard').classList.remove('show');
  }
});

// Also check on focus (for same-tab login via global modal)
window.addEventListener('focus', syncAuth);

// ── Profile ──
let profileTab = 'history';

window.showProfile = async function() {
  if (!isLoggedIn()) { showSiteLoginModal(); return; }
  document.getElementById('profileModal').classList.add('show');
  document.body.style.overflow = 'hidden';
  loadProfileData();
};

window.hideProfile = function() {
  document.getElementById('profileModal').classList.remove('show');
  document.body.style.overflow = '';
};

async function loadProfileData() {
  try {
    const res = await fetch(`${API}/api/auth/profile`, { headers: { 'Authorization': `Bearer ${authToken}` } });
    const data = await res.json();
    if (!data.user) return;
    const u = data.user;
    document.getElementById('profileName').textContent = u.display_name || u.email.split('@')[0];
    document.getElementById('profileEmail').textContent = u.email;
    document.getElementById('profileJoined').textContent = '注册于 ' + formatDate(u.created_at);
    document.getElementById('statHistory').textContent = data.stats?.history || 0;
    document.getElementById('statDanmaku').textContent = data.stats?.danmaku || 0;
    if (u.avatar_url) {
      document.getElementById('profileAvatar').innerHTML = `<img src="${u.avatar_url}" alt="avatar">`;
    } else {
      document.getElementById('profileAvatar').innerHTML = '<i class="fas fa-user"></i>';
    }
  } catch(e) {}
  loadProfileTab(profileTab);
}

// Profile tabs
document.getElementById('profileTabs').addEventListener('click', function(e) {
  const btn = e.target.closest('button');
  if (!btn || !btn.dataset.tab) return;
  profileTab = btn.dataset.tab;
  this.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.tab === profileTab));
  loadProfileTab(profileTab);
});

async function loadProfileTab(tab) {
  const list = document.getElementById('profileList');
  list.innerHTML = '<div class="empty-hint"><i class="fas fa-spinner fa-spin"></i> 加载中...</div>';

  if (tab === 'history') {
    try {
      const res = await fetch(`${API}/api/history`, { headers: { 'Authorization': `Bearer ${authToken}` } });
      const data = await res.json();
      const items = data.list || [];
      if (items.length === 0) {
        list.innerHTML = '<div class="empty-hint">暂无观看记录</div>';
        return;
      }
      list.innerHTML = items.map(h => `
        <div class="list-item">
          <img src="${h.vod_pic || ''}" onerror="this.style.display='none'">
          <div class="item-info">
            <div class="item-title">${h.vod_name}</div>
            <div class="item-sub">第${h.episode_index + 1}集 ${h.episode_name || ''} · ${formatTime(h.position)}/${formatTime(h.duration)}</div>
          </div>
          <div class="item-time">${formatDate(h.updated_at)}</div>
        </div>
      `).join('');
    } catch { list.innerHTML = '<div class="empty-hint">加载失败</div>'; }
  }

  if (tab === 'danmaku') {
    try {
      const res = await fetch(`${API}/api/user/danmaku`, { headers: { 'Authorization': `Bearer ${authToken}` } });
      const data = await res.json();
      const items = data.list || [];
      if (items.length === 0) {
        list.innerHTML = '<div class="empty-hint">暂无弹幕</div>';
        return;
      }
      list.innerHTML = items.map(d => `
        <div class="list-item">
          <div class="item-info">
            <div class="item-title" style="color:${d.color || '#fff'}">${d.content}</div>
            <div class="item-sub">第${d.episode_index + 1}集 · ${formatTime(d.time)}</div>
          </div>
          <div class="item-time">${formatDate(d.created_at)}</div>
        </div>
      `).join('');
    } catch { list.innerHTML = '<div class="empty-hint">加载失败</div>'; }
  }

  if (tab === 'comments') {
    try {
      const res = await fetch(`${API}/api/user/comments`, { headers: { 'Authorization': `Bearer ${authToken}` } });
      const data = await res.json();
      const items = data.list || [];
      if (items.length === 0) {
        list.innerHTML = '<div class="empty-hint">暂无评论</div>';
        return;
      }
      list.innerHTML = items.map(c => `
        <div class="list-item" style="flex-direction:column;align-items:flex-start">
          <div class="item-title" style="white-space:normal;line-height:1.5">${c.content_text || ''}</div>
          <div class="item-sub">${c.post_slug || ''} · ${formatDate(c.created ? new Date(c.created).toISOString() : '')}</div>
        </div>
      `).join('');
    } catch { list.innerHTML = '<div class="empty-hint">加载失败</div>'; }
  }
}

window.editName = function() {
  const current = document.getElementById('profileName').textContent;
  const row = document.querySelector('#profileModal .name-row');
  row.innerHTML = `
    <div class="name-edit-row">
      <input type="text" id="editNameInput" value="${current}" maxlength="20">
      <button class="save-btn" onclick="saveName()">保存</button>
      <button class="cancel-btn" onclick="cancelEditName('${current}')">取消</button>
    </div>
  `;
  document.getElementById('editNameInput').focus();
};

window.saveName = async function() {
  const name = document.getElementById('editNameInput').value.trim();
  if (!name) return;
  try {
    const res = await fetch(`${API}/api/auth/profile`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ display_name: name })
    });
    const data = await res.json();
    if (data.success) {
      currentUser = data.user;
      localStorage.setItem('anime_user', JSON.stringify(currentUser));
      showToast('昵称已更新');
      loadProfileData();
    }
  } catch { showToast('更新失败'); }
};

window.cancelEditName = function(name) {
  const row = document.querySelector('#profileModal .name-row');
  row.innerHTML = `<span class="display-name" id="profileName">${name}</span><button class="edit-name-btn" onclick="editName()"><i class="fas fa-pen"></i> 编辑</button>`;
};

function formatDate(s) {
  if (!s) return '-';
  try {
    const d = new Date(s.endsWith('Z') ? s : s + 'Z');
    return d.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return s; }
}

const video = document.getElementById('videoPlayer');
const canvas = document.getElementById('danmakuCanvas');
const ctx = canvas.getContext('2d');

// Category type mapping
const categoryMap = {
  '': {type: ''},
  '4': {type: '4'},
  '49': {type: '49'},
  '3': {type: '3'},
  '1': {type: '1'},
  '2': {type: '2'},
  '35': {type: '35'}
};

// Init tabs
document.querySelectorAll('#tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentType = btn.dataset.type;
    currentKeyword = '';
    currentPage = 1;
    loadList();
  });
});

// Search
window.doSearch = function() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return;
  currentKeyword = q;
  currentType = '';
  currentPage = 1;
  document.querySelectorAll('#tabs button').forEach(b => b.classList.remove('active'));
  loadList();
};

document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});

// Load list
async function loadList() {
  const grid = document.getElementById('cardGrid');
  const loading = document.getElementById('loading');
  grid.innerHTML = '';
  loading.style.display = 'block';

  try {
    let url = `${API}/api/ffzy?ac=videolist&pg=${currentPage}`;
    if (currentType) url += `&t=${currentType}`;
    if (currentKeyword) url += `&wd=${encodeURIComponent(currentKeyword)}`;

    const res = await fetch(url);
    const data = await res.json();
    const list = data.list || [];
    totalPages = data.pagecount || 1;

    list.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${item.vod_pic || ''}" alt="${item.vod_name}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 300%22><rect fill=%22%231a1a2e%22 width=%22200%22 height=%22300%22/><text fill=%22%23555%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2214%22>No Image</text></svg>'">
        <div class="card-info"><div class="card-title">${item.vod_name}</div></div>
        ${item.vod_remarks ? `<span class="card-remark">${item.vod_remarks}</span>` : ''}
      `;
      card.onclick = () => openDetail(item.vod_id);
      grid.appendChild(card);
    });

    updatePagination();
  } catch (err) {
    grid.innerHTML = '<div style="text-align:center;padding:40px;color:#e94560"><i class="fas fa-exclamation-circle"></i> 加载失败，请稍后重试</div>';
  }
  loading.style.display = 'none';
}

function updatePagination() {
  document.getElementById('pageInfo').textContent = `${currentPage} / ${totalPages}`;
  document.getElementById('prevBtn').disabled = currentPage <= 1;
  document.getElementById('nextBtn').disabled = currentPage >= totalPages;
}

window.changePage = function(delta) {
  currentPage += delta;
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;
  loadList();
  window.scrollTo({top: 0, behavior: 'smooth'});
};

// Detail
async function openDetail(vodId) {
  const overlay = document.getElementById('overlay');
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';

  // Reset
  document.getElementById('playerSection').style.display = 'none';
  document.getElementById('episodeSection').style.display = 'none';
  document.getElementById('detailContinue').style.display = 'none';
  stopPlayer();

  try {
    const res = await fetch(`${API}/api/ffzy?ac=detail&ids=${vodId}`);
    const data = await res.json();
    const item = (data.list || [])[0];
    if (!item) return;

    currentDetail = item;
    document.getElementById('detailPoster').src = item.vod_pic || '';
    document.getElementById('detailTitle').textContent = item.vod_name || '';
    document.getElementById('detailYear').textContent = item.vod_year ? `年份: ${item.vod_year}` : '';
    document.getElementById('detailArea').textContent = item.vod_area ? `地区: ${item.vod_area}` : '';
    document.getElementById('detailScore').textContent = item.vod_score ? `评分: ${item.vod_score}` : '';
    document.getElementById('detailDesc').textContent = (item.vod_content || '').replace(/<[^>]*>/g, '').substring(0, 200);

    // Parse sources
    sources = [];
    if (item.vod_play_url) {
      const groups = item.vod_play_url.split('$$$');
      groups.forEach((group, gi) => {
        const eps = group.split('#').filter(e => e.includes('$')).map(e => {
          const idx = e.indexOf('$');
          return { name: e.substring(0, idx), url: e.substring(idx + 1) };
        });
        sources.push(eps);
      });
    }

    // Use second source (index 1) if available, else first
    currentSourceIndex = sources.length > 1 ? 1 : 0;
    episodes = sources[currentSourceIndex] || sources[0] || [];

    // Check history
    let hist = null;
    if (isLoggedIn()) {
      try {
        const hRes = await fetch(`${API}/api/history?vod_id=${vodId}`, { headers: { 'Authorization': `Bearer ${authToken}` } });
        const hData = await hRes.json();
        if (hData && hData.episode_index !== undefined) hist = hData;
      } catch(e) {}
    }

    currentHistory = hist;

    if (hist) {
      const btn = document.getElementById('detailContinue');
      btn.textContent = `从第${hist.episode_index + 1}集 ${formatTime(hist.position)} 继续播放`;
      btn.style.display = 'inline-block';
      skipIntroTime = hist.skip_intro || 90;
    }

    // Render episodes
    if (episodes.length > 0) {
      document.getElementById('episodeSection').style.display = 'block';
      const grid = document.getElementById('episodeGrid');
      grid.innerHTML = '';
      episodes.forEach((ep, i) => {
        const btn = document.createElement('button');
        btn.className = 'ep-btn';
        btn.textContent = ep.name;
        btn.onclick = () => playEpisode(i);
        grid.appendChild(btn);
      });
    }
  } catch (err) {
    console.error('Detail load error:', err);
  }
}

window.closeOverlay = function() {
  document.getElementById('overlay').classList.remove('show');
  document.body.style.overflow = '';
  stopPlayer();
};

// Play episode
window.playEpisode = function(index) {
  if (!episodes || index < 0 || index >= episodes.length) return;
  currentEpIndex = index;
  const ep = episodes[index];

  // Update UI
  document.getElementById('playerSection').style.display = 'block';
  document.querySelectorAll('.ep-btn').forEach((b, i) => b.classList.toggle('active', i === index));

  // Setup video
  const url = ep.url;
  const isM3U8 = url.includes('.m3u8') || url.includes('/m3u8');

  stopPlayer(false);

  if (isM3U8 && Hls.isSupported()) {
    hlsInstance = new Hls({maxBufferLength: 30, maxMaxBufferLength: 60});
    hlsInstance.loadSource(url);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(() => {});
    });
    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        console.error('HLS fatal error, falling back to iframe');
        fallbackToIframe(url);
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
    video.addEventListener('loadedmetadata', () => video.play().catch(() => {}), {once: true});
  } else {
    fallbackToIframe(url);
    return;
  }

  // Load danmaku
  loadDanmaku();
  startDanmakuLoop();

  // Update skip label
  document.getElementById('skipLabel').textContent = skipIntroTime + 's';
  document.getElementById('skipInput').value = skipIntroTime;

  // Scroll to player
  document.getElementById('playerSection').scrollIntoView({behavior: 'smooth'});

  // Resume position from history
  if (currentHistory && currentHistory.episode_index === index && currentHistory.position > 5) {
    video.addEventListener('loadedmetadata', function onMeta() {
      video.currentTime = currentHistory.position;
      video.removeEventListener('loadedmetadata', onMeta);
    });
  }

  // Start auto-save
  clearInterval(historyTimer);
  historyTimer = setInterval(saveHistory, 10000);
};

function fallbackToIframe(url) {
  const container = document.getElementById('videoContainer');
  video.style.display = 'none';
  // Try share URL as iframe
  let iframeSrc = url;
  // Replace play url patterns with share/iframe patterns if possible
  const iframe = document.createElement('iframe');
  iframe.src = iframeSrc;
  iframe.allowFullscreen = true;
  iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none';
  container.appendChild(iframe);
}

function stopPlayer(resetVideo = true) {
  if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }
  if (historyTimer) { clearInterval(historyTimer); historyTimer = null; }
  stopDanmakuLoop();
  if (resetVideo) {
    video.pause();
    video.removeAttribute('src');
    video.load();
    video.style.display = '';
    // Remove any fallback iframes
    document.querySelectorAll('#videoContainer iframe').forEach(f => f.remove());
  }
}

// History
async function saveHistory() {
  if (!isLoggedIn() || !currentDetail || video.paused && video.currentTime === 0) return;
  try {
    await fetch(`${API}/api/history`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        vod_id: currentDetail.vod_id,
        vod_name: currentDetail.vod_name,
        vod_pic: currentDetail.vod_pic,
        episode_index: currentEpIndex,
        episode_name: episodes[currentEpIndex]?.name || '',
        position: Math.floor(video.currentTime),
        duration: Math.floor(video.duration || 0),
        skip_intro: skipIntroTime
      })
    });
  } catch(e) {}
}

window.continueWatching = async function() {
  if (!isLoggedIn()) { showSiteLoginModal(); return; }
  try {
    const res = await fetch(`${API}/api/history`, { headers: { 'Authorization': `Bearer ${authToken}` } });
    const hist = await res.json();
    if (hist && hist.vod_id) {
      openDetail(hist.vod_id);
    }
  } catch(e) {}
};

// Load continue card on page load
async function loadContinueCard() {
  if (!isLoggedIn()) { document.getElementById('continueCard').classList.remove('show'); return; }
  try {
    const res = await fetch(`${API}/api/history`, { headers: { 'Authorization': `Bearer ${authToken}` } });
    const hist = await res.json();
    if (hist && hist.vod_id && hist.vod_name) {
      document.getElementById('contPic').src = hist.vod_pic || '';
      document.getElementById('contTitle').textContent = hist.vod_name;
      document.getElementById('contEp').textContent = `第${hist.episode_index + 1}集 ${hist.episode_name || ''} · ${formatTime(hist.position)}`;
      document.getElementById('continueCard').classList.add('show');
      currentHistory = hist;
    }
  } catch(e) {}
}

// Player controls
window.togglePlay = function() {
  if (video.paused) video.play(); else video.pause();
};

video.addEventListener('play', () => {
  document.getElementById('playBtn').innerHTML = '<i class="fas fa-pause"></i>';
});
video.addEventListener('pause', () => {
  document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i>';
});

video.addEventListener('timeupdate', () => {
  const pct = video.duration ? (video.currentTime / video.duration * 100) : 0;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('currentTime').textContent = formatTime(video.currentTime);
  document.getElementById('duration').textContent = formatTime(video.duration);
});

video.addEventListener('progress', () => {
  if (video.buffered.length > 0) {
    const buffEnd = video.buffered.end(video.buffered.length - 1);
    const pct = video.duration ? (buffEnd / video.duration * 100) : 0;
    document.getElementById('progressBuffer').style.width = pct + '%';
  }
});

// Progress bar click
document.getElementById('progressWrap').addEventListener('click', e => {
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  video.currentTime = pct * (video.duration || 0);
});

// Volume
window.setVolume = function(val) {
  video.volume = val / 100;
  video.muted = val == 0;
  updateMuteIcon();
};

window.toggleMute = function() {
  video.muted = !video.muted;
  document.getElementById('volumeSlider').value = video.muted ? 0 : Math.round(video.volume * 100);
  updateMuteIcon();
};

function updateMuteIcon() {
  const icon = video.muted || video.volume === 0 ? 'fa-volume-mute' : video.volume < 0.5 ? 'fa-volume-down' : 'fa-volume-up';
  document.getElementById('muteBtn').innerHTML = `<i class="fas ${icon}"></i>`;
}

// Speed
const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];
let speedIndex = 2;
window.cycleSpeed = function() {
  speedIndex = (speedIndex + 1) % speeds.length;
  playbackSpeed = speeds[speedIndex];
  video.playbackRate = playbackSpeed;
  document.getElementById('speedBtn').textContent = playbackSpeed + 'x';
};

// Fullscreen
window.toggleFullscreen = function() {
  const wrapper = document.querySelector('.player-wrapper');
  if (!document.fullscreenElement) {
    (wrapper.requestFullscreen || wrapper.webkitRequestFullscreen || wrapper.msRequestFullscreen).call(wrapper);
  } else {
    (document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen).call(document);
  }
};

// Skip intro
window.skipIntro = function() {
  video.currentTime = Math.min(video.currentTime + skipIntroTime, video.duration || Infinity);
};

window.toggleSkipSettings = function() {
  document.getElementById('skipDropdown').classList.toggle('show');
};

window.updateSkipTime = function(val) {
  skipIntroTime = parseInt(val) || 90;
  document.getElementById('skipLabel').textContent = skipIntroTime + 's';
};

// Close skip dropdown on outside click
document.addEventListener('click', e => {
  if (!e.target.closest('.skip-settings')) {
    document.getElementById('skipDropdown').classList.remove('show');
  }
});

// Long press speed up
const videoContainer = document.getElementById('videoContainer');

function startSpeedUp() {
  if (isSpeedUp) return;
  isSpeedUp = true;
  video.playbackRate = 3;
  document.getElementById('speedIndicator').style.display = 'block';
}

function endSpeedUp() {
  if (!isSpeedUp) return;
  isSpeedUp = false;
  video.playbackRate = playbackSpeed;
  document.getElementById('speedIndicator').style.display = 'none';
}

// Mouse: short click = play/pause, long press = speed up
let mouseDownTime = 0;
videoContainer.addEventListener('mousedown', e => {
  if (e.target.closest('.player-controls') || e.target.closest('.danmaku-bar')) return;
  mouseDownTime = Date.now();
  longPressTimer = setTimeout(() => startSpeedUp(), 300);
});
videoContainer.addEventListener('mouseup', e => {
  if (e.target.closest('.player-controls') || e.target.closest('.danmaku-bar')) return;
  clearTimeout(longPressTimer);
  if (isSpeedUp) {
    endSpeedUp();
  } else if (Date.now() - mouseDownTime < 300) {
    togglePlay();
  }
});
videoContainer.addEventListener('mouseleave', endSpeedUp);

// Touch: short tap = play/pause, long press = speed up
let touchDownTime = 0;
videoContainer.addEventListener('touchstart', e => {
  if (e.target.closest('.player-controls') || e.target.closest('.danmaku-bar')) return;
  touchDownTime = Date.now();
  longPressTimer = setTimeout(() => startSpeedUp(), 300);
}, {passive: true});
videoContainer.addEventListener('touchend', e => {
  if (e.target.closest('.player-controls') || e.target.closest('.danmaku-bar')) return;
  clearTimeout(longPressTimer);
  if (isSpeedUp) {
    endSpeedUp();
  } else if (Date.now() - touchDownTime < 300) {
    togglePlay();
  }
});
videoContainer.addEventListener('touchcancel', endSpeedUp);

// Spacebar hold
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.code === 'Space' && !e.repeat) {
    e.preventDefault();
    spaceHeld = true;
    longPressTimer = setTimeout(() => startSpeedUp(), 300);
  }
});
document.addEventListener('keyup', e => {
  if (e.code === 'Space') {
    if (spaceHeld && !isSpeedUp) {
      // Short press = toggle play
      togglePlay();
    }
    spaceHeld = false;
    clearTimeout(longPressTimer);
    endSpeedUp();
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  switch(e.key.toLowerCase()) {
    case 'n': playNextEp(); break;
    case 'p': playPrevEp(); break;
    case 'r': video.currentTime = 0; video.play(); break;
    case 'f': toggleFullscreen(); break;
    case 'd': toggleDanmaku(); break;
    case 'arrowleft': video.currentTime = Math.max(0, video.currentTime - 10); e.preventDefault(); break;
    case 'arrowright': video.currentTime = Math.min(video.duration, video.currentTime + 10); e.preventDefault(); break;
    case 'arrowup': video.volume = Math.min(1, video.volume + 0.1); document.getElementById('volumeSlider').value = Math.round(video.volume * 100); updateMuteIcon(); e.preventDefault(); break;
    case 'arrowdown': video.volume = Math.max(0, video.volume - 0.1); document.getElementById('volumeSlider').value = Math.round(video.volume * 100); updateMuteIcon(); e.preventDefault(); break;
    case 'escape':
      if (document.getElementById('profileModal').classList.contains('show')) hideProfile();
      else if (document.getElementById('site-login-modal') && document.getElementById('site-login-modal').classList.contains('show')) hideSiteLoginModal();
      else closeOverlay();
      break;
  }
});

window.playNextEp = function() {
  if (currentEpIndex < episodes.length - 1) playEpisode(currentEpIndex + 1);
};

window.playPrevEp = function() {
  if (currentEpIndex > 0) playEpisode(currentEpIndex - 1);
};

// Auto next episode
video.addEventListener('ended', () => {
  if (currentEpIndex < episodes.length - 1) {
    playEpisode(currentEpIndex + 1);
  }
});

// Danmaku
async function loadDanmaku() {
  if (!currentDetail) return;
  try {
    const res = await fetch(`${API}/api/danmaku?vod_id=${currentDetail.vod_id}&episode_index=${currentEpIndex}`);
    const data = await res.json();
    danmakuList = (data || []).map(d => ({
      time: d.time,
      text: d.content,
      color: d.color || '#ffffff',
      x: 0,
      y: 0,
      speed: 2 + Math.random(),
      width: 0,
      active: false
    }));
  } catch(e) {
    danmakuList = [];
  }
}

window.sendDanmaku = async function() {
  if (!isLoggedIn()) {
    showSiteLoginModal();
    return;
  }
  const input = document.getElementById('danmakuInput');
  const text = input.value.trim();
  if (!text || !currentDetail) return;
  input.value = '';

  const dm = {
    time: Math.floor(video.currentTime),
    text: text,
    color: currentDanmakuColor,
    x: canvas.width,
    y: 0,
    speed: 2 + Math.random(),
    width: 0,
    active: false
  };
  danmakuList.push(dm);

  try {
    await fetch(`${API}/api/danmaku`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        vod_id: currentDetail.vod_id,
        episode_index: currentEpIndex,
        time: dm.time,
        content: text,
        color: currentDanmakuColor
      })
    });
  } catch(e) {}
};

// Danmaku color picker
document.querySelectorAll('.color-dot').forEach(dot => {
  dot.addEventListener('click', () => {
    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
    currentDanmakuColor = dot.dataset.color;
  });
});

// Enter to send danmaku
document.getElementById('danmakuInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendDanmaku();
});

window.toggleDanmaku = function() {
  danmakuEnabled = !danmakuEnabled;
  document.getElementById('danmakuToggle').innerHTML = danmakuEnabled
    ? '<i class="fas fa-comments"></i>'
    : '<i class="fas fa-comment-slash"></i>';
  if (!danmakuEnabled) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
};

function startDanmakuLoop() {
  stopDanmakuLoop();
  function render() {
    danmakuRAF = requestAnimationFrame(render);
    if (!danmakuEnabled || video.paused) return;
    renderDanmaku();
  }
  render();
}

function stopDanmakuLoop() {
  if (danmakuRAF) { cancelAnimationFrame(danmakuRAF); danmakuRAF = null; }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function renderDanmaku() {
  const w = canvas.width = canvas.offsetWidth;
  const h = canvas.height = canvas.offsetHeight;
  ctx.clearRect(0, 0, w, h);
  ctx.font = '16px sans-serif';

  const currentTime = video.currentTime;
  const lanes = []; // track occupied lanes

  danmakuList.forEach(dm => {
    // Activate danmaku when video time passes its timestamp
    if (!dm.active && currentTime >= dm.time && currentTime < dm.time + 10) {
      dm.active = true;
      dm.x = w;
      dm.width = ctx.measureText(dm.text).width;
      // Find a lane
      let lane = 0;
      for (let i = 0; i < lanes.length; i++) {
        if (lanes[i] < dm.x + 20) { lane = i + 1; }
      }
      dm.y = 24 + (lane % Math.floor((h - 24) / 28)) * 28;
      lanes[lane] = dm.x;
    }

    if (dm.active) {
      dm.x -= dm.speed;
      ctx.fillStyle = dm.color || '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 2;
      ctx.fillText(dm.text, dm.x, dm.y);
      ctx.shadowBlur = 0;

      if (dm.x + dm.width < 0) {
        dm.active = false;
      }
    }
  });
}

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  sec = Math.floor(sec);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

// Init
loadList();
loadContinueCard();

})();
</script>
