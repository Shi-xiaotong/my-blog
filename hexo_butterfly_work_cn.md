# Hexo + Butterfly 个人博客响应式开发规范

适用于：

- Hexo 静态博客
- Butterfly 主题
- 自定义组件开发
- 页面重构
- AI Agent 自动开发
- 移动端适配
- 暗色模式适配
- 日历 / 卡片 / 看板 / Widget 开发

项目：

- 博客地址：https://233002.xyz
- 技术栈：Hexo + Butterfly

---

# 一、核心开发原则（必须遵守）

## 1. 不修改 Butterfly 源码

禁止：

- 直接修改 `/themes/butterfly/`
- 修改主题内部 layout
- 修改主题内部 stylus
- 覆盖主题核心 JS

原因：

- 更新主题会冲突
- 无法维护
- Git diff 混乱
- 容易破坏主题响应式

推荐：

- 使用 `/source/css/custom.css`
- 使用 `/source/css/_custom/`
- 使用 inject 注入
- 使用独立组件样式

---

# 2. 所有开发默认 Mobile First

必须先开发移动端。

开发顺序：

```text
移动端 → 平板 → 桌面端
```

禁止：

```css
width: 1200px;
height: 800px;
```

推荐：

```css
width: 100%;
max-width: 1200px;
```

---

# 3. 不允许固定布局

禁止：

```css
position: absolute;
left: 300px;
```

除非：

- tooltip
- modal
- animation
- 特殊视觉效果

推荐：

- Flex
- Grid
- gap
- padding
- margin auto

---

# 4. 所有组件必须响应式

每个组件必须支持：

- 手机（320px~768px）
- 平板（768px~1024px）
- 桌面（1024px+）

必须包含：

```css
@media screen and (max-width: 768px)
```

---

# 5. 所有组件必须支持暗色模式

禁止写死颜色：

```css
color: #000;
background: white;
```

必须使用 Butterfly 变量：

```css
color: var(--font-color);
background: var(--card-bg);
```

---

# 二、推荐目录结构

```text
source/
├── css/
│   ├── custom.css
│   └── components/
│       ├── calendar.css
│       ├── widget.css
│       ├── timeline.css
│       └── card.css
│
├── js/
│   ├── calendar.js
│   ├── widget.js
│   └── utils.js
│
├── lib/
│   └── calendar/
│
└── pages/
```

规则：

- 一个组件对应一个 css
- 一个组件对应一个 js
- 禁止把所有代码堆进 custom.css

---

# 三、统一布局规范

# 1. 页面容器

统一使用：

```css
.page-container {
    width: min(100%, 1200px);
    margin: auto;
    padding: 16px;
    box-sizing: border-box;
}
```

禁止：

```css
width: 1200px;
```

---

# 2. 卡片规范

统一：

```css
.custom-card {
    background: var(--card-bg);
    border-radius: 16px;
    box-shadow: var(--card-box-shadow);
    padding: 20px;
}
```

移动端：

```css
@media screen and (max-width: 768px) {

    .custom-card {
        padding: 14px;
        border-radius: 12px;
    }

}
```

---

# 3. 间距规范

统一 spacing：

```text
4px
8px
12px
16px
20px
24px
32px
```

禁止出现：

```css
margin: 17px;
padding: 23px;
```

---

# 四、响应式开发规范

# 1. 推荐断点

```css
/* 手机 */
@media screen and (max-width: 768px)

/* 平板 */
@media screen and (min-width: 768px) and (max-width: 1024px)

/* 桌面 */
@media screen and (min-width: 1024px)
```

---

# 2. 字体规范

必须使用：

```css
font-size: clamp(14px, 2vw, 18px);
```

标题：

```css
font-size: clamp(24px, 5vw, 42px);
```

禁止：

```css
font-size: 38px;
```

---

# 3. 图片规范

必须：

```css
img {
    max-width: 100%;
    height: auto;
}
```

---

# 4. iframe 规范

必须响应式：

```css
iframe {
    width: 100%;
    max-width: 100%;
}
```

---

# 五、组件开发规范

# 1. 日历组件开发规范

推荐技术：

```text
HTML + CSS Grid + Vanilla JS
```

禁止：

- table 布局
- jQuery 依赖
- 重型日历库
- FullCalendar

原因：

- 太重
- 不适合博客
- 响应式困难
- 风格不统一

---

# 2. 日历布局规范

必须使用 Grid：

```css
.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
}
```

---

# 3. 日历单元格规范

```css
.calendar-day {
    aspect-ratio: 1;
    border-radius: 12px;
    padding: 6px;
}
```

禁止：

```css
height: 120px;
```

---

# 4. 移动端信息降级

移动端必须隐藏部分信息。

PC：

- 农历
- 节日
- 节气
- 标签
- hover 信息

移动端：

- 只显示日期
- 重点节日

示例：

```css
@media screen and (max-width: 768px) {

    .lunar-text,
    .solar-term,
    .festival-label {
        display: none;
    }

}
```

---

# 六、推荐布局方案

# 1. Flex 适合：

- 卡片
- 导航栏
- Widget
- 工具栏

示例：

```css
.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}
```

---

# 2. Grid 适合：

- 日历
- 图片墙
- 卡片列表
- Dashboard

示例：

```css
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
}
```

---

# 七、动画规范

推荐：

```css
transition: all .25s ease;
```

禁止：

```css
transition: all 2s;
```

移动端禁止：

- 大范围动画
- 高模糊
- 大阴影
- 高频动画

原因：

- 手机掉帧
- 耗电
- 卡顿

---

# 八、暗色模式规范

必须使用 CSS 变量。

推荐：

```css
background: var(--card-bg);
color: var(--font-color);
border: 1px solid var(--light-grey);
```

禁止：

```css
background: white;
```

---

# 九、开发流程（AI Agent 必须遵守）

# Step 1：分析组件类型

必须先判断：

```text
这是：
- 卡片？
- Widget？
- 日历？
- 信息流？
- 页面？
```

然后决定：

- Flex
- Grid
- 单列
- 双列

---

# Step 2：先写移动端

默认宽度：

```css
width: 100%;
```

禁止先写 PC。

---

# Step 3：加入响应式断点

必须包含：

```css
@media screen and (max-width: 768px)
```

---

# Step 4：适配 Butterfly 风格

必须使用：

```css
var(--card-bg)
var(--font-color)
var(--text-bg-hover)
var(--theme-color)
```

禁止自定义随机颜色。

---

# Step 5：适配暗色模式

必须测试：

- 白天模式
- 夜间模式

---

# Step 6：移动端测试

必须测试：

```text
320px
375px
390px
430px
768px
```

---

# Step 7：检查信息密度

移动端必须减少：

- 标签
- hover
- 描述
- 阴影
- 动画

核心原则：

```text
移动端优先阅读效率
不是信息完整度
```

---

# 十、禁止事项

禁止：

- Bootstrap
- jQuery UI
- 重型 UI 框架
- 双端两套页面
- iframe 固定宽度
- fixed px 布局
- 魔法数字定位
- z-index 混乱

---

# 十一、推荐技术栈

推荐：

```text
HTML
CSS Grid
Flexbox
Vanilla JS
CSS Variables
clamp()
```

---

# 十二、推荐视觉风格

博客风格目标：

```text
轻量
统一
低信息噪音
高阅读性
移动端友好
```

避免：

```text
后台管理风
企业系统风
高密度 dashboard 风
```

---

# 十三、最终设计原则

核心原则：

```text
小屏幕不是大屏幕缩小版
而是另一种阅读场景
```

因此：

移动端必须：

- 减少信息
- 增加留白
- 简化交互
- 降低复杂度

而不是：

- 缩小所有元素
- 强行塞进手机

---

# 十四、AI Agent 开发最终规则

Agent 在开发任何组件前必须：

1. 先阅读本规范
2. 默认 Mobile First
3. 使用 Butterfly CSS Variables
4. 不允许固定宽度
5. 使用 Flex/Grid
6. 必须有响应式断点
7. 必须适配暗色模式
8. 必须适配移动端
9. 优先阅读体验
10. 不修改 Butterfly 源码

如果与规范冲突：

```text
本规范优先级最高
```

