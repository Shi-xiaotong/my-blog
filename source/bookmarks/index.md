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
      <button class="bookmarks-nav-item active" data-cat="all" onclick="switchCategory('all')">全部</button>
      <button class="bookmarks-nav-item" data-cat="search" onclick="switchCategory('search')">&#x1F50D; 搜索</button>
      <button class="bookmarks-nav-item" data-cat="ai" onclick="switchCategory('ai')">&#x1F916; AI</button>
      <button class="bookmarks-nav-item" data-cat="dev" onclick="switchCategory('dev')">&#x1F4BB; 开发</button>
      <button class="bookmarks-nav-item" data-cat="design" onclick="switchCategory('design')">&#x1F3A8; 设计</button>
      <button class="bookmarks-nav-item" data-cat="learn" onclick="switchCategory('learn')">&#x1F4DA; 学习</button>
      <button class="bookmarks-nav-item" data-cat="media" onclick="switchCategory('media')">&#x1F3AC; 娱乐</button>
      <button class="bookmarks-nav-item" data-cat="shopping" onclick="switchCategory('shopping')">&#x1F6D2; 购物</button>
      <button class="bookmarks-nav-item" data-cat="news" onclick="switchCategory('news')">&#x1F4F0; 资讯</button>
      <button class="bookmarks-nav-item" data-cat="oss" onclick="switchCategory('oss')">&#x2601;&#xFE0F; 云服务</button>
      <button class="bookmarks-nav-item" data-cat="social" onclick="switchCategory('social')">&#x1F4AC; 社交</button>
      <button class="bookmarks-nav-item" data-cat="games" onclick="switchCategory('games')">&#x1F3AE; 游戏</button>
      <button class="bookmarks-nav-item" data-cat="misc" onclick="switchCategory('misc')">&#x1F527; 工具</button>
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