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
