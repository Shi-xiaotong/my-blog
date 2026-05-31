---
title: 影视屋
date: 2026-05-31 16:00:00
type: anime
---

<style>
.cinema {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.cinema-header {
  text-align: center;
  margin-bottom: 25px;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  border: 1px solid rgba(233, 69, 96, 0.2);
}

.cinema-title {
  font-size: 1.8em;
  font-weight: 900;
  background: linear-gradient(135deg, #ffd93d, #e94560);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 6px;
}

.cinema-subtitle {
  color: #8892b0;
  font-size: 0.9em;
}

.player-section {
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  margin-bottom: 20px;
}

.player-wrapper {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  background: #000;
}

.player-wrapper iframe {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  border: none;
}

.video-info {
  padding: 15px 20px;
  background: #111;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.video-title {
  color: #fff;
  font-size: 1.1em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.video-title i { color: #ffd93d; }

.video-meta {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.meta-tag {
  background: rgba(255, 255, 255, 0.05);
  color: #8892b0;
  font-size: 0.8em;
  padding: 3px 10px;
  border-radius: 12px;
}

.episode-section {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.section-title {
  color: #fff;
  font-size: 1em;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title i { color: #e94560; }

.episode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(65px, 1fr));
  gap: 8px;
}

.episode-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 5px;
  text-align: center;
  color: #a8b2d1;
  font-size: 0.85em;
  cursor: pointer;
  transition: all 0.3s;
}

.episode-btn:hover,
.episode-btn.active {
  background: rgba(233, 69, 96, 0.2);
  border-color: #e94560;
  color: #fff;
}

.cinema-note {
  background: rgba(255, 217, 61, 0.05);
  border-left: 3px solid #ffd93d;
  border-radius: 0 10px 10px 0;
  padding: 12px 16px;
  color: #a8b2d1;
  font-size: 0.85em;
}

.cinema-note i {
  color: #ffd93d;
  margin-right: 6px;
}

@media (max-width: 600px) {
  .cinema-title { font-size: 1.4em; }
  .episode-grid { grid-template-columns: repeat(auto-fill, minmax(55px, 1fr)); }
}
</style>

<div class="cinema">

  <div class="cinema-header">
    <div class="cinema-title"><i class="fas fa-film"></i> 影 视 屋</div>
    <div class="cinema-subtitle">火影忍者 疾风传 全集在线观看</div>
  </div>

  <div class="player-section">
    <div class="player-wrapper">
      <iframe id="mainPlayer" src="https://www.yhpdm.com/play/2755/1/1" allowfullscreen></iframe>
    </div>
    <div class="video-info">
      <div class="video-title">
        <i class="fas fa-dragon"></i>
        <span id="videoName">火影忍者 第1集</span>
      </div>
      <div class="video-meta">
        <span class="meta-tag">720集全</span>
        <span class="meta-tag">日语中字</span>
        <span class="meta-tag">经典动漫</span>
      </div>
    </div>
  </div>

  <div class="episode-section">
    <div class="section-title"><i class="fas fa-list-ol"></i> 选集（1-100集）</div>
    <div class="episode-grid" id="episodeGrid"></div>
  </div>

  <div class="cinema-note">
    <i class="fas fa-lightbulb"></i>
    资源来自互联网，仅供学习交流。火影忍者版权归岸本齐史和集英社所有。支持正版，请勿用于商业用途。
  </div>

</div>

<script>
// 火影忍者剧集配置
const BASE_URL = 'https://www.yhpdm.com/play/2755/1/';
const EPISODES = [];

// 生成1-100集
for (let i = 1; i <= 100; i++) {
  EPISODES.push({
    num: i,
    title: `火影忍者 第${i}集`,
    url: `${BASE_URL}${i}`
  });
}

function renderEpisodes() {
  const grid = document.getElementById('episodeGrid');
  EPISODES.forEach((ep, i) => {
    const btn = document.createElement('div');
    btn.className = 'episode-btn' + (i === 0 ? ' active' : '');
    btn.textContent = ep.num;
    btn.onclick = () => playEpisode(i);
    grid.appendChild(btn);
  });
}

function playEpisode(index) {
  const ep = EPISODES[index];
  document.getElementById('mainPlayer').src = ep.url;
  document.getElementById('videoName').textContent = ep.title;
  
  document.querySelectorAll('.episode-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });
  
  document.querySelector('.player-section').scrollIntoView({ 
    behavior: 'smooth', block: 'start' 
  });
}

document.addEventListener('DOMContentLoaded', renderEpisodes);
</script>
