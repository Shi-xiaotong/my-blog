---
title: 影视屋
date: 2026-05-31 16:00:00
type: anime
---

<style>
/* ========== 影视厅整体 ========== */
.cinema {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

/* 顶部标题 */
.cinema-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 25px;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  border-radius: 16px;
  border: 1px solid rgba(233, 69, 96, 0.3);
  position: relative;
  overflow: hidden;
}

.cinema-header::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 300%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(233, 69, 96, 0.05), transparent 30%);
  animation: cinemaShine 8s linear infinite;
}

@keyframes cinemaShine {
  to { left: 100%; }
}

.cinema-title {
  font-size: 2em;
  font-weight: 900;
  background: linear-gradient(135deg, #ffd93d, #e94560, #ffd93d);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleShimmer 3s linear infinite;
  margin-bottom: 8px;
}

@keyframes titleShimmer {
  to { background-position: 200% center; }
}

.cinema-subtitle {
  color: #8892b0;
  font-size: 0.95em;
}

/* ========== 播放器区域 ========== */
.player-section {
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 25px;
}

.player-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
  background: #000;
}

.player-wrapper iframe,
.player-wrapper video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

/* 占位状态 */
.player-placeholder {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at center, #1a1a2e 0%, #000 70%);
}

.placeholder-icon {
  font-size: 4em;
  color: #e94560;
  margin-bottom: 20px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.placeholder-text {
  color: #8892b0;
  font-size: 1.1em;
  margin-bottom: 8px;
}

.placeholder-hint {
  color: #636e72;
  font-size: 0.85em;
}

/* ========== 影片信息栏 ========== */
.video-info {
  padding: 20px;
  background: linear-gradient(180deg, #0a0a0a, #111);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.video-title {
  color: #fff;
  font-size: 1.2em;
  font-weight: 600;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.video-title i {
  color: #ffd93d;
}

.video-meta {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: #8892b0;
  font-size: 0.8em;
  padding: 4px 10px;
  border-radius: 15px;
}

.meta-tag i {
  color: #e94560;
  font-size: 0.9em;
}

/* ========== 剧集列表 ========== */
.episode-section {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
}

.episode-title {
  color: #fff;
  font-size: 1.1em;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.episode-title i {
  color: #e94560;
}

.episode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 10px;
}

.episode-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 5px;
  text-align: center;
  color: #a8b2d1;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
}

.episode-btn:hover,
.episode-btn.active {
  background: rgba(233, 69, 96, 0.2);
  border-color: #e94560;
  color: #fff;
  transform: translateY(-2px);
}

/* ========== 备注区 ========== */
.cinema-note {
  background: rgba(255, 217, 61, 0.05);
  border-left: 3px solid #ffd93d;
  border-radius: 0 10px 10px 0;
  padding: 14px 18px;
  color: #a8b2d1;
  font-size: 0.85em;
  line-height: 1.6;
}

.cinema-note i {
  color: #ffd93d;
  margin-right: 6px;
}

/* ========== 响应式 ========== */
@media (max-width: 600px) {
  .cinema-title { font-size: 1.5em; }
  .video-meta { gap: 8px; }
  .episode-grid { grid-template-columns: repeat(auto-fill, minmax(55px, 1fr)); }
}
</style>

<div class="cinema">

  <!-- 标题 -->
  <div class="cinema-header">
    <div class="cinema-title"><i class="fas fa-film"></i> 影 视 屋</div>
    <div class="cinema-subtitle">沉浸观影，享受每一帧</div>
  </div>

  <!-- 播放器 -->
  <div class="player-section">
    <div class="player-wrapper" id="player">
      <!-- 占位状态，替换为视频后隐藏 -->
      <div class="player-placeholder" id="placeholder">
        <div class="placeholder-icon"><i class="fas fa-play-circle"></i></div>
        <div class="placeholder-text">暂无片源</div>
        <div class="placeholder-hint">正在寻找好片中...</div>
      </div>
      <!-- 视频播放器（取消注释并填入地址） -->
      <!-- <video controls autoplay>
        <source src="你的视频地址" type="application/x-mpegURL">
      </video> -->
      <!-- 或 iframe 嵌入 -->
      <!-- <iframe src="你的iframe地址" allowfullscreen></iframe> -->
    </div>
    <div class="video-info">
      <div class="video-title">
        <i class="fas fa-clapperboard"></i>
        <span id="videoName">等待开播...</span>
      </div>
      <div class="video-meta">
        <span class="meta-tag"><i class="fas fa-clock"></i> --:--</span>
        <span class="meta-tag"><i class="fas fa-closed-captioning"></i> 中字</span>
        <span class="meta-tag"><i class="fas fa-star"></i> --</span>
      </div>
    </div>
  </div>

  <!-- 剧集列表（示例，可自行增删） -->
  <div class="episode-section" id="episodeSection" style="display: none;">
    <div class="episode-title"><i class="fas fa-list-ol"></i> 选集</div>
    <div class="episode-grid" id="episodeGrid">
      <!-- JS 动态生成 -->
    </div>
  </div>

  <!-- 备注 -->
  <div class="cinema-note">
    <i class="fas fa-lightbulb"></i>
    视频资源来自互联网，仅供学习交流。支持正版，请勿用于商业用途。
  </div>

</div>

<script>
// ========== 影片配置 ==========
// 修改这里添加你的视频
const VIDEO_CONFIG = {
  // 当前影片
  title: '',           // 影片名，显示在播放器下方
  src: '',             // 视频地址（m3u8/mp4/iframe均可）
  type: 'video',       // 'video' 或 'iframe'
  
  // 剧集列表（可选，留空则不显示选集）
  episodes: [
    // { name: '01', src: 'https://xxx/ep01.m3u8' },
    // { name: '02', src: 'https://xxx/ep02.m3u8' },
    // ...
  ]
};

// ========== 初始化 ==========
function initPlayer() {
  const player = document.getElementById('player');
  const placeholder = document.getElementById('placeholder');
  const videoName = document.getElementById('videoName');
  const episodeSection = document.getElementById('episodeSection');
  const episodeGrid = document.getElementById('episodeGrid');
  
  // 无视频时保持占位
  if (!VIDEO_CONFIG.src) {
    return;
  }
  
  // 隐藏占位
  placeholder.style.display = 'none';
  
  // 设置标题
  videoName.textContent = VIDEO_CONFIG.title || '正在播放';
  
  // 创建播放器
  if (VIDEO_CONFIG.type === 'iframe') {
    const iframe = document.createElement('iframe');
    iframe.src = VIDEO_CONFIG.src;
    iframe.allowFullscreen = true;
    player.appendChild(iframe);
  } else {
    const video = document.createElement('video');
    video.controls = true;
    video.autoplay = true;
    video.style.background = '#000';
    const source = document.createElement('source');
    source.src = VIDEO_CONFIG.src;
    video.appendChild(source);
    player.appendChild(video);
  }
  
  // 渲染剧集列表
  if (VIDEO_CONFIG.episodes.length > 0) {
    episodeSection.style.display = 'block';
    VIDEO_CONFIG.episodes.forEach((ep, i) => {
      const btn = document.createElement('div');
      btn.className = 'episode-btn' + (i === 0 ? ' active' : '');
      btn.textContent = ep.name;
      btn.onclick = () => switchEpisode(i);
      episodeGrid.appendChild(btn);
    });
  }
}

// 切换剧集
function switchEpisode(index) {
  const ep = VIDEO_CONFIG.episodes[index];
  if (!ep) return;
  
  const player = document.getElementById('player');
  const oldMedia = player.querySelector('video, iframe');
  if (oldMedia) oldMedia.remove();
  
  const video = document.createElement('video');
  video.controls = true;
  video.autoplay = true;
  video.style.background = '#000';
  const source = document.createElement('source');
  source.src = ep.src;
  video.appendChild(source);
  player.appendChild(video);
  
  document.getElementById('videoName').textContent = 
    VIDEO_CONFIG.title + ' - ' + ep.name;
  
  // 更新按钮状态
  document.querySelectorAll('.episode-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });
}

// 页面加载
document.addEventListener('DOMContentLoaded', initPlayer);
</script>
