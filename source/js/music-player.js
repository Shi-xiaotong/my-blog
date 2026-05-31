// 音乐播放器 - 唱碟样式
(function() {
  'use strict';
  
  const MUSIC_URL = 'https://lanzou-api.233002.xyz/api/direct?url=https://wwbdj.lanzoul.com/iZjIP3qskyfc&pwd=bc7o';
  
  let audio = null;
  let isPlaying = false;
  let playerElement = null;
  
  // 创建播放器 HTML
  function createPlayer() {
    const player = document.createElement('div');
    player.className = 'music-player';
    player.innerHTML = `
      <div class="disc-container">
        <div class="tonearm"></div>
        <div class="play-icon">
          <svg viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <div class="pause-icon">
          <svg viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </div>
      </div>
      <div class="music-notes">
        <span class="music-note">♪</span>
        <span class="music-note">♫</span>
        <span class="music-note">♩</span>
      </div>
    `;
    return player;
  }
  
  // 初始化音频
  function initAudio() {
    if (audio) return;
    
    audio = new Audio();
    audio.src = MUSIC_URL;
    audio.preload = 'auto';
    audio.loop = true;
    audio.volume = 0.7;
    
    audio.addEventListener('ended', function() {
      audio.currentTime = 0;
      audio.play();
    });
    
    audio.addEventListener('error', function(e) {
      console.error('音频加载失败:', e);
    });
  }
  
  // 播放/暂停切换
  function togglePlay() {
    if (!audio) {
      initAudio();
    }
    
    if (isPlaying) {
      audio.pause();
      playerElement.classList.remove('playing');
      isPlaying = false;
    } else {
      audio.play().then(function() {
        playerElement.classList.add('playing');
        isPlaying = true;
      }).catch(function(error) {
        console.log('播放失败:', error);
      });
    }
  }
  
  // 初始化播放器
  function initPlayer() {
    // 检查是否已初始化
    if (document.querySelector('.music-player')) return;
    
    playerElement = createPlayer();
    document.body.appendChild(playerElement);
    
    // 绑定点击事件
    playerElement.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      togglePlay();
    });
    
    // 初始化音频
    initAudio();
  }
  
  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayer);
  } else {
    initPlayer();
  }
  
  // pjax 加载完成后重新初始化
  document.addEventListener('pjax:complete', function() {
    // 重置状态
    isPlaying = false;
    if (playerElement) {
      playerElement.classList.remove('playing');
    }
    initPlayer();
  });
  
})();
