---
title: 关于我
date: 2026-04-28 10:52:24
type: about
---

<style>
/* ========== 角色卡 ========== */
.char-card {
  position: relative;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border: 2px solid #e94560;
  border-radius: 16px;
  padding: 30px;
  margin: 20px 0;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(233, 69, 96, 0.3);
}
.char-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(from 0deg, transparent, rgba(233, 69, 96, 0.1), transparent 30%);
  animation: cardShine 6s linear infinite;
}
@keyframes cardShine {
  to { transform: rotate(360deg); }
}
.char-card-inner {
  position: relative;
  z-index: 1;
}
.rarity {
  display: inline-block;
  background: linear-gradient(90deg, #ff6b6b, #ffd93d, #ff6b6b);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 2s linear infinite;
  font-weight: 900;
  font-size: 1.1em;
  letter-spacing: 2px;
}
@keyframes shimmer {
  to { background-position: 200% center; }
}
.char-name {
  font-size: 2em;
  font-weight: 900;
  margin: 10px 0 5px;
  background: linear-gradient(135deg, #fff, #e94560);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.char-subtitle {
  color: #8892b0;
  font-size: 0.95em;
  margin-bottom: 20px;
}
.char-card-inner .card-avatar {
  float: right;
  margin: 0 0 15px 20px;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  border: 2px solid #e94560;
  box-shadow: 0 0 20px rgba(233, 69, 96, 0.4);
  object-fit: cover;
}

/* ========== 属性面板 ========== */
.stat-bar {
  margin: 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}
.stat-label {
  min-width: 80px;
  color: #ccd6f6;
  font-size: 0.9em;
}
.stat-label i {
  margin-right: 6px;
  width: 16px;
  text-align: center;
  color: #e94560;
}
.stat-track {
  flex: 1;
  height: 8px;
  background: rgba(255,255,255,0.08);
  border-radius: 4px;
  overflow: hidden;
}
.stat-fill {
  height: 100%;
  border-radius: 4px;
  animation: fillBar 1.5s ease-out forwards;
  transform-origin: left;
}
.stat-fill.coding { width: 95%; background: linear-gradient(90deg, #e94560, #ff6b6b); }
.stat-fill.sleep { width: 30%; background: linear-gradient(90deg, #6c5ce7, #a29bfe); }
.stat-fill.caffeine { width: 99%; background: linear-gradient(90deg, #fdcb6e, #e17055); }
.stat-fill.luck { width: 60%; background: linear-gradient(90deg, #00b894, #55efc4); }
.stat-fill.social { width: 25%; background: linear-gradient(90deg, #636e72, #b2bec3); }
.stat-fill.debugging { width: 88%; background: linear-gradient(90deg, #0984e3, #74b9ff); }
@keyframes fillBar {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* ========== 技能树 ========== */
.skill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin: 15px 0;
}
.skill-item {
  background: rgba(233, 69, 96, 0.08);
  border: 1px solid rgba(233, 69, 96, 0.25);
  border-radius: 10px;
  padding: 12px 8px;
  text-align: center;
  transition: all 0.3s;
  cursor: default;
}
.skill-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(233, 69, 96, 0.3);
  border-color: #e94560;
}
.skill-icon {
  font-size: 1.8em;
  display: block;
  margin-bottom: 4px;
  color: #e94560;
}
.skill-name { font-size: 0.85em; color: #ccd6f6; }
.skill-lv { font-size: 0.7em; color: #e94560; margin-top: 2px; }

/* ========== 成就系统 ========== */
.achievement-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 15px 0;
}
.achievement {
  background: rgba(255, 217, 61, 0.08);
  border: 1px solid rgba(255, 217, 61, 0.25);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 0.85em;
  color: #ffd93d;
  transition: all 0.3s;
}
.achievement:hover {
  background: rgba(255, 217, 61, 0.15);
  transform: scale(1.05);
}
.achievement i {
  margin-right: 4px;
}

/* ========== 粒子 ========== */
.particles {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.particle {
  position: absolute;
  width: 4px; height: 4px;
  background: #e94560;
  border-radius: 50%;
  opacity: 0;
  animation: float linear infinite;
}
.particle:nth-child(1) { left: 10%; animation-duration: 8s; animation-delay: 0s; }
.particle:nth-child(2) { left: 25%; animation-duration: 12s; animation-delay: 1s; }
.particle:nth-child(3) { left: 40%; animation-duration: 10s; animation-delay: 2s; }
.particle:nth-child(4) { left: 55%; animation-duration: 9s; animation-delay: 0.5s; }
.particle:nth-child(5) { left: 70%; animation-duration: 11s; animation-delay: 3s; }
.particle:nth-child(6) { left: 85%; animation-duration: 7s; animation-delay: 1.5s; }
.particle:nth-child(7) { left: 15%; animation-duration: 13s; animation-delay: 4s; }
.particle:nth-child(8) { left: 60%; animation-duration: 9.5s; animation-delay: 2.5s; }
@keyframes float {
  0% { transform: translateY(100vh) scale(0); opacity: 0; }
  10% { opacity: 0.6; }
  90% { opacity: 0.6; }
  100% { transform: translateY(-10vh) scale(1.5); opacity: 0; }
}

/* ========== 语录 ========== */
.quote-box {
  position: relative;
  background: rgba(233, 69, 96, 0.05);
  border-left: 4px solid #e94560;
  border-radius: 0 12px 12px 0;
  padding: 16px 20px;
  margin: 15px 0;
  font-style: italic;
  color: #8892b0;
}
.quote-box::before {
  content: '「';
  position: absolute;
  top: -5px; left: 10px;
  font-size: 2.5em;
  color: rgba(233, 69, 96, 0.2);
}
.quote-box::after {
  content: '」';
  position: absolute;
  bottom: -20px; right: 10px;
  font-size: 2.5em;
  color: rgba(233, 69, 96, 0.2);
}

/* ========== 联系方式 ========== */
.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin: 15px 0;
}
.contact-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px 16px;
  transition: all 0.3s;
  text-decoration: none !important;
  color: #ccd6f6;
}
.contact-card:hover {
  border-color: #e94560;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(233, 69, 96, 0.2);
}
.contact-icon {
  font-size: 1.5em;
  color: #e94560;
  width: 36px;
  text-align: center;
}
.contact-info { font-size: 0.9em; }
.contact-info small { display: block; color: #8892b0; font-size: 0.85em; }

/* ========== 分割线 ========== */
.divider {
  text-align: center;
  margin: 30px 0;
  color: #e94560;
  font-size: 1.2em;
  letter-spacing: 8px;
  opacity: 0.5;
}

/* ========== 列表图标 ========== */
.icon-list {
  list-style: none;
  padding: 0;
}
.icon-list li {
  padding: 6px 0;
  color: #a8b2d1;
}
.icon-list li i {
  margin-right: 8px;
  color: #e94560;
  width: 20px;
  text-align: center;
}

/* ========== 响应式 ========== */
@media (max-width: 600px) {
  .char-card { padding: 20px; }
  .char-name { font-size: 1.5em; }
  .char-card-inner .card-avatar { width: 80px; height: 80px; }
  .skill-grid { grid-template-columns: repeat(3, 1fr); }
  .contact-grid { grid-template-columns: 1fr; }
}
</style>

<!-- 粒子背景 -->
<div class="particles">
  <div class="particle"></div>
  <div class="particle"></div>
  <div class="particle"></div>
  <div class="particle"></div>
  <div class="particle"></div>
  <div class="particle"></div>
  <div class="particle"></div>
  <div class="particle"></div>
</div>

<!-- 角色卡 -->
<div class="char-card">
  <div class="char-card-inner">
    <img class="card-avatar" src="/img/zipai.png" alt="avatar">
    <div class="rarity">✦ S S R ✦</div>
    <div class="char-name">Shi_xiaotong</div>
    <div class="char-subtitle">「 在 bug 的海洋中寻找 bug 之外的东西 」</div>
    <p style="color: #a8b2d1; line-height: 1.8;">
      一个被代码选中的普通少年（自封的）。白天假装在写代码，实际上在写 bug；
      晚上假装在 debug，实际上在和 <code>console.log</code> 谈心。
      <br><br>
      技能树严重偏科：前端勉强能看，后端勉强能跑，运维勉强没崩。
      唯一点满的技能是「在凌晨三点找到最后一个分号」。
      <br><br>
      人生信条：<span style="color: #e94560;">「只要我 commit 够快，bug 就追不上我。」</span>
    </p>
  </div>
</div>

<!-- 属性面板 -->
<div class="char-card" style="border-color: #6c5ce7;">
  <div class="char-card-inner">
    <h3 style="color: #fff; margin-top: 0;"><i class="fas fa-chart-bar"></i> 属性面板</h3>
    <div class="stat-bar">
      <span class="stat-label"><i class="fas fa-code"></i>编程力</span>
      <div class="stat-track"><div class="stat-fill coding"></div></div>
      <span style="color: #e94560; font-size: 0.85em;">95</span>
    </div>
    <div class="stat-bar">
      <span class="stat-label"><i class="fas fa-bed"></i>睡眠力</span>
      <div class="stat-track"><div class="stat-fill sleep"></div></div>
      <span style="color: #a29bfe; font-size: 0.85em;">30</span>
    </div>
    <div class="stat-bar">
      <span class="stat-label"><i class="fas fa-mug-hot"></i>咖啡因</span>
      <div class="stat-track"><div class="stat-fill caffeine"></div></div>
      <span style="color: #fdcb6e; font-size: 0.85em;">99</span>
    </div>
    <div class="stat-bar">
      <span class="stat-label"><i class="fas fa-dice"></i>运气</span>
      <div class="stat-track"><div class="stat-fill luck"></div></div>
      <span style="color: #00b894; font-size: 0.85em;">60</span>
    </div>
    <div class="stat-bar">
      <span class="stat-label"><i class="fas fa-users"></i>社交力</span>
      <div class="stat-track"><div class="stat-fill social"></div></div>
      <span style="color: #b2bec3; font-size: 0.85em;">25</span>
    </div>
    <div class="stat-bar">
      <span class="stat-label"><i class="fas fa-bug"></i>Debug力</span>
      <div class="stat-track"><div class="stat-fill debugging"></div></div>
      <span style="color: #74b9ff; font-size: 0.85em;">88</span>
    </div>
    <p style="color: #636e72; font-size: 0.8em; margin-bottom: 0;">
      * 社交力低是 bug，不是 feature。已反馈给策划，预计下版本修复（大概）。
    </p>
  </div>
</div>

<!-- 技能树 -->
<div class="char-card" style="border-color: #00b894;">
  <div class="char-card-inner">
    <h3 style="color: #fff; margin-top: 0;"><i class="fas fa-wand-magic-sparkles"></i> 技能树</h3>
    <div class="skill-grid">
      <div class="skill-item"><i class="fab fa-python skill-icon"></i><span class="skill-name">Python</span><span class="skill-lv">Lv.85</span></div>
      <div class="skill-item"><i class="fab fa-rust skill-icon"></i><span class="skill-name">Rust</span><span class="skill-lv">Lv.42</span></div>
      <div class="skill-item"><i class="fas fa-globe skill-icon"></i><span class="skill-name">前端</span><span class="skill-lv">Lv.78</span></div>
      <div class="skill-item"><i class="fas fa-server skill-icon"></i><span class="skill-name">后端</span><span class="skill-lv">Lv.72</span></div>
      <div class="skill-item"><i class="fab fa-linux skill-icon"></i><span class="skill-name">Linux</span><span class="skill-lv">Lv.80</span></div>
      <div class="skill-item"><i class="fas fa-cloud skill-icon"></i><span class="skill-name">Cloud</span><span class="skill-lv">Lv.68</span></div>
      <div class="skill-item"><i class="fas fa-robot skill-icon"></i><span class="skill-name">AI</span><span class="skill-lv">Lv.55</span></div>
      <div class="skill-item"><i class="fas fa-couch skill-icon"></i><span class="skill-name">摸鱼</span><span class="skill-lv">Lv.99</span></div>
    </div>
    <div class="quote-box">
      摸鱼 Lv.99 是因为我把所有时间都花在了调这该死的技能条动画上。
    </div>
  </div>
</div>

<!-- 成就 -->
<div class="char-card" style="border-color: #fdcb6e;">
  <div class="char-card-inner">
    <h3 style="color: #fff; margin-top: 0;"><i class="fas fa-trophy"></i> 已解锁成就</h3>
    <div class="achievement-list">
      <span class="achievement"><i class="fas fa-medal"></i> 连续写代码超过12小时</span>
      <span class="achievement"><i class="fas fa-skull-crossbones"></i> Debug到凌晨四点</span>
      <span class="achievement"><i class="fas fa-bug"></i> 亲手制造100个bug</span>
      <span class="achievement"><i class="fas fa-mug-hot"></i> 一天喝5杯咖啡</span>
      <span class="achievement"><i class="fas fa-rotate"></i> git push --force 并存活</span>
      <span class="achievement"><i class="fas fa-comment-dots"></i> 给博客写了看板娘</span>
      <span class="achievement"><i class="fas fa-circle-exclamation"></i> Stack Overflow提问被标记重复</span>
      <span class="achievement"><i class="fas fa-bomb"></i> 在生产环境执行 rm -rf /</span>
    </div>
    <p style="color: #636e72; font-size: 0.8em; margin-bottom: 0;">
      * 成就「在生产环境执行 rm -rf /」已被管理员撤回，改名为「差点在生产环境执行 rm -rf /」。
    </p>
  </div>
</div>

<div class="divider">✦ ✦ ✦</div>

## 关于这个博客

这里是 Shi_xiaotong 的秘密基地（其实就是一个 Hexo 博客）。

在这里你可以看到：

<ul class="icon-list">
  <li><i class="fas fa-burst"></i> 我踩过的坑（以及是怎么爬出来的）</li>
  <li><i class="fas fa-lightbulb"></i> 我学到的东西（在忘掉之前赶紧记下来）</li>
  <li><i class="fas fa-gamepad"></i> 我的瞎折腾记录（包括但不限于凌晨三点部署服务）</li>
  <li><i class="fas fa-face-laugh-beam"></i> 我的翻车合集（持续更新中）</li>
</ul>

> "Talk is cheap, show me the code."  
> —— Linus Torvalds

但其实更多时候是：

> "Code is cheap, show me the bug."  
> —— 每一个在凌晨 debug 的程序员

<div class="divider">✦ ✦ ✦</div>

## 背景音乐

页面左下角的背景音乐来自 [Bogo Cat 猫猫乐队](https://v.douyin.com/dASj3_YY95A/) 的翻唱，原曲为 Justin Bieber 的作品。

<div class="divider">✦ ✦ ✦</div>

## 联系方式

<p style="color: #8892b0; margin-bottom: 12px;">如果你想找我聊天（或者想帮我 debug），可以在这里找到我：</p>

<div class="contact-grid">
  <a href="https://github.com/Shi-xiaotong" class="contact-card" target="_blank">
    <span class="contact-icon"><i class="fab fa-github"></i></span>
    <span class="contact-info">GitHub<small>看我写的烂代码</small></span>
  </a>
  <a href="mailto:505350617@qq.com" class="contact-card">
    <span class="contact-icon"><i class="fas fa-envelope"></i></span>
    <span class="contact-info">Email<small>505350617@qq.com</small></span>
  </a>
  <a href="https://wpa.qq.com/msgrd?v=3&uin=505350617" class="contact-card" target="_blank">
    <span class="contact-icon"><i class="fab fa-qq"></i></span>
    <span class="contact-info">QQ<small>最原始的联系方式</small></span>
  </a>
</div>

---

## 致谢开源项目

本博客的搭建离不开以下优秀的开源项目和技术服务，衷心感谢每一位作者的贡献！

### 博客框架与主题

| 项目 | 说明 | 作者 |
|------|------|------|
| [Hexo](https://hexo.io) | 快速、简洁且高效的博客框架 | hexojs |
| [Butterfly](https://github.com/jerryc127/hexo-theme-butterfly) | Hexo 的美观多功能主题 | jerryc127 |
| [hexo-butterfly-extjs](https://github.com/HiWangyeah/hexo-butterfly-extjs) | Butterfly 主题扩展插件 | HiWangyeah |

### 评论系统

| 项目 | 说明 | 作者 |
|------|------|------|
| [CWD](https://github.com/anghunk/cwd) | 基于 Cloudflare Workers + D1 的轻量级评论系统 | anghunk |

### 小组件与工具

| 项目 | 说明 | 作者 |
|------|------|------|
| [Live2D Widget](https://github.com/stevenjoezhang/live2d-widget) | 网页 Live2D 看板娘组件（模型为 B站 22，版权归 bilibili 所有） | stevenjoezhang |
| [lunar-javascript](https://github.com/6tail/lunar-javascript) | 农历/阴阳历转换工具库（万年历） | 6tail |

### 基础设施与服务

| 项目 | 说明 |
|------|------|
| [GitHub](https://github.com) | 代码托管与版本控制 |
| [Cloudflare](https://cloudflare.com) | Pages 托管、Workers、D1、R2 存储、CDN |
| [Open-Meteo](https://open-meteo.com) | 开源免费天气 API |
| [Cravatar](https://cravatar.cn) | 国内通用头像服务 |
| [ipwho](https://ipwho.org) | IP 信息查询 API |
| [Hermes Agent](https://hermes-agent.nousresearch.com) | AI 自动化运维助手 |

---

<p style="text-align: center; color: #636e72; font-size: 0.85em; margin-top: 30px;">
  <i class="fas fa-shield-halved" style="margin-right: 4px;"></i>
  本站 Live2D 看板娘组件来自 [stevenjoezhang/live2d-widget](https://github.com/stevenjoezhang/live2d-widget)，<br>
  模型为 bilibili 出品的 22娘/33娘，版权归 bilibili 所有。<br>
  如有侵权，请联系删除相关内容。
</p>
