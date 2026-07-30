---
title: 我的导航
layout: bookmarks-page
date: 2024-01-01 00:00:00
type: bookmarks
permalink: /bookmarks/
---

{% raw %}
<link rel="stylesheet" href="/css/bookmarks-page.css">

<div class="container">
  <!-- Header -->
  <div class="header">
    <h1>我的导航</h1>
    <div class="header-right"></div>
  </div>
  <div class="header-sub">精选好站 · 分类收藏</div>

  <!-- Navigation Bar -->
  <div class="bookmarks-nav">
    <div class="bookmarks-nav-inner">
      <button class="bookmarks-nav-item active" data-cat="all" onclick="switchCategory('all')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> 全部</button>
            <button class="bookmarks-nav-item" data-cat="search" onclick="switchCategory('search')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="7.5"/><path d="m21 21-5.2-5.2"/></svg> 搜索</button>
            <button class="bookmarks-nav-item" data-cat="ai" onclick="switchCategory('ai')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 2-2 3-2 5h-4c0-2-2-3-2-5a4 4 0 0 1 4-4Z"/><path d="M9 18h6"/><path d="M10 22h4"/></svg> AI</button>
            <button class="bookmarks-nav-item" data-cat="dev" onclick="switchCategory('dev')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> 开发</button>
            <button class="bookmarks-nav-item" data-cat="design" onclick="switchCategory('design')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><path d="M13.5 9V21"/><path d="M7.5 15.5c-2.5 0-4-1.5-4-4s2-4 4-4c2.5 0 4 2 4 5.5 0 2.5-1 4-3 4s-2-1.5-2-3.5"/><path d="M10.5 12.5C12 14 14 14.5 15.5 13c1.5-1.5 2-4 0-5.5"/></svg> 设计</button>
            <button class="bookmarks-nav-item" data-cat="learn" onclick="switchCategory('learn')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg> 学习</button>
            <button class="bookmarks-nav-item" data-cat="media" onclick="switchCategory('media')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> 娱乐</button>
            <button class="bookmarks-nav-item" data-cat="shopping" onclick="switchCategory('shopping')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> 购物</button>
            <button class="bookmarks-nav-item" data-cat="news" onclick="switchCategory('news')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9h2"/><path d="M10 6h6"/><path d="M10 10h6"/><path d="M10 14h4"/></svg> 资讯</button>
            <button class="bookmarks-nav-item" data-cat="oss" onclick="switchCategory('oss')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 17.5c-1 1-3.5 1.5-5.5 1.5s-4.5-.5-5.5-1.5"/><path d="M17.5 6.5c-1-1-3.5-1.5-5.5-1.5S7.5 5.5 6.5 6.5"/><path d="M12 12v-2"/><path d="M12 21v-2"/><circle cx="12" cy="12" r="10"/></svg> 云服务</button>
            <button class="bookmarks-nav-item" data-cat="social" onclick="switchCategory('social')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 2-2 3-2 5h-4c0-2-2-3-2-5a4 4 0 0 1 4-4Z"/><path d="M9 18h6"/><path d="M10 22h4"/></svg> 社交</button>
            <button class="bookmarks-nav-item" data-cat="cloud" onclick="switchCategory('cloud')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg> 网盘</button>
            <button class="bookmarks-nav-item" data-cat="games" onclick="switchCategory('games')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.404 10.62 2 13.145 2 16c0 2.263 1.21 4.25 3 5.28V22h14v-.72c1.79-1.03 3-3.017 3-5.28 0-2.855-.404-5.38-.685-7.258-.007-.05-.011-.1-.017-.152A4 4 0 0 0 17.32 5Z"/></svg> 游戏</button>
            <button class="bookmarks-nav-item" data-cat="wallpaper" onclick="switchCategory('wallpaper')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> 壁纸</button>
            <button class="bookmarks-nav-item" data-cat="misc" onclick="switchCategory('misc')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> 工具</button>
    </div>
    <div class="bookmarks-search">
      <input type="text" id="bookmarkSearch" placeholder="搜索站点..." />
    </div>
  </div>

  <!-- 自研项目置顶 -->
  <div class="category-section pinned-section">
    <div class="category-header">
      <h2>本站自研</h2>
      <span class="category-count">3 个</span>
    </div>
    <div class="links-grid">
      <a href="/tools/" class="link-card" target="_blank" rel="noopener noreferrer" title="在线工具箱">
        <span class="name">工具箱</span>
      </a>
      <a href="/games/" class="link-card" target="_blank" rel="noopener noreferrer" title="网页小游戏">
        <span class="name">小游戏</span>
      </a>
      <a href="/anime/" class="link-card" target="_blank" rel="noopener noreferrer" title="影视屋">
        <span class="name">影视屋</span>
      </a>
    </div>
  </div>

  <!-- Public Categories render here -->
  <div id="categoriesContainer"></div>

</div>

<script src="/js/bookmarks-page.js"></script>

{% endraw %}