---
title: 友链
date: 2026-06-14 00:00:00
type: "links"
top_img: false
---

<div class="links-content">
  <div class="link-description">
    <p>志同道合的朋友们 🤝</p>
  </div>
  <div class="friend-links-card">
    <div class="friend-link-item">
      <div class="friend-link-avatar" data-name="笔尖">
        <img src="https://123456l.com/favicon.ico" alt="笔尖代码" onerror="this.parentElement.classList.add('no-icon');this.remove();">
      </div>
      <div class="friend-link-info">
        <a href="https://123456l.com/" target="_blank" rel="noopener noreferrer">
          <span class="friend-link-name">笔尖代码</span>
        </a>
        <span class="friend-link-desc">https://123456l.com/</span>
      </div>
    </div>
    <div class="friend-link-item">
      <div class="friend-link-avatar" data-name="他说">
        <img src="https://090909.top/assets/images/logo.ico" alt="他说" onerror="this.parentElement.classList.add('no-icon');this.remove();">
      </div>
      <div class="friend-link-info">
        <a href="https://090909.top/" target="_blank" rel="noopener noreferrer">
          <span class="friend-link-name">他说</span>
        </a>
        <span class="friend-link-desc">梁栋烨的博客网站</span>
      </div>
    </div>
    <div class="friend-link-item">
      <div class="friend-link-avatar" data-name="夏雨">
        <img src="https://xiayuze.fun/favicon.ico" alt="夏雨阁" onerror="this.parentElement.classList.add('no-icon');this.remove();">
      </div>
      <div class="friend-link-info">
        <a href="https://xiayuze.fun/" target="_blank" rel="noopener noreferrer">
          <span class="friend-link-name">夏雨阁</span>
        </a>
        <span class="friend-link-desc">https://xiayuze.fun/</span>
      </div>
    </div>
  </div>
  <div class="links-notice">
    <p>🤝 如需交换友链，请联系 <a href="mailto:505350617@qq.com">505350617@qq.com</a></p>
  </div>
</div>

<style>
.links-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.link-description {
  text-align: center;
  margin-bottom: 30px;
  font-size: 16px;
  opacity: 0.8;
}
.friend-links-card {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.friend-link-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  background: var(--card-bg, rgba(255,255,255,0.1));
  border: 1px solid var(--border-color, rgba(255,255,255,0.1));
  transition: all 0.3s ease;
  text-decoration: none;
}
.friend-link-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-color: var(--theme-color, #49b1f5);
}
.friend-link-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 12px;
  background: #f0f0f0;
}

/* 加这一行！针对图片本身进行缩放裁剪 */
.friend-link-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 关键属性：让图片铺满容器，并自动裁剪 */
  display: block;
}
.friend-link-avatar.no-icon {
  background: linear-gradient(135deg, #49b1f5, #6dc3fa);
  display: flex;
  align-items: center;
  justify-content: center;
}
.friend-link-avatar.no-icon::after {
  content: attr(data-name);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
}
.friend-link-info {
  display: flex;
  flex-direction: column;
}
.friend-link-info a {
  text-decoration: none;
  color: var(--font-color, #333);
}
.friend-link-name {
  font-size: 16px;
  font-weight: 600;
}
.friend-link-desc {
  font-size: 13px;
  opacity: 0.6;
  margin-top: 4px;
}
.links-notice {
  text-align: center;
  margin-top: 30px;
  padding: 16px;
  border-radius: 8px;
  background: var(--card-bg, rgba(255,255,255,0.05));
  font-size: 14px;
  opacity: 0.8;
}
.links-notice a {
  color: var(--theme-color, #49b1f5);
  text-decoration: none;
}
.links-notice a:hover {
  text-decoration: underline;
}
</style>
