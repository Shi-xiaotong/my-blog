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
    
    <h1>📑 我的导航</h1>
    <div class="header-right"></div>
  </div>
  <div class="header-sub">精选好站 · 分类收藏 · 私人书签</div>

  <!-- Search -->
  <div class="search-bar">
    <input type="text" id="searchInput" placeholder="🔍 搜索网站名称或描述..." oninput="filterLinks()">
    <select id="categoryFilter" onchange="filterLinks()">
      <option value="">全部分类</option>
    </select>
  </div>

  <!-- Private Bookmarks Section -->
  <div class="private-section" id="privateSection">
    <div class="private-header">
      <span style="font-size:1.3em">🔒</span>
      <h2>我的私有书签</h2>
      <span style="font-size:12px;color:var(--text-secondary)">仅你可见，存在浏览器本地</span>
      <button class="edit-btn" id="privateEditBtn" onclick="togglePrivateEdit()">✏️ 编辑</button>
      <button class="edit-btn" onclick="showAddForm()">➕ 添加</button>
    </div>
    <div class="add-form" id="addForm">
      <div>
        <label>网站名称</label>
        <input type="text" id="newName" placeholder="e.g. GitHub">
      </div>
      <div>
        <label>网址</label>
        <input type="url" id="newUrl" placeholder="https://...">
      </div>
      <div>
        <label>分类标签</label>
        <input type="text" id="newTag" placeholder="e.g. 开发工具">
      </div>
      <div style="display:flex;gap:8px;align-items:end">
        <button class="btn btn-primary" onclick="addPrivateBookmark()">保存</button>
        <button class="btn btn-cancel" onclick="hideAddForm()">取消</button>
      </div>
    </div>
    <div class="links-grid" id="privateGrid"></div>
  </div>

  <!-- Public Categories render here -->
  <div id="categoriesContainer"></div>

  <!-- Footer -->
  <div style="text-align:center;padding:32px 0 16px;color:var(--text-secondary);font-size:13px">
    数据本地存储 · 
  </div>
</div>

<script src="/js/bookmarks-page.js"></script>



{% endraw %}
