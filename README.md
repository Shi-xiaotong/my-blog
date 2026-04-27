# 我的个人博客

基于 [Hexo](https://hexo.io/) + [Butterfly](https://butterfly.js.org/) 主题的个人博客

## 快速开始

```bash
git clone https://github.com/Shi-xiaotong/home.git
```

### 安装依赖

```bash
npm install
```
### 启动

```bash
hexo server
# 或简写
hexo s
```

### 本地预览

```bash
http://localhost:4000/
```

### 创建新文章

```bash
hexo new "文章标题"
```

### 生成静态文件

```bash
hexo generate
# 或简写
hexo g
```

### 部署到服务器

```bash
hexo deploy
# 或简写
hexo d
```

## 项目结构

```
my-blog/
├── source/          # 博客文章和资源
│   └── _posts/      # 文章目录
├── scaffolds/       # 文章模板
├── themes/          # 主题文件
│   └── butterfly/   # Butterfly 主题
├── _config.yml      # 网站配置
└── package.json     # 项目依赖
```

## 部署

博客使用 GitHub Actions 自动部署到 GitHub Pages。每次推送到 main 分支后会自动构建并发布。

## 自定义配置

- **网站信息**：编辑 `_config.yml` 中的 `title`、`author` 等字段
- **主题配置**：编辑 `themes/butterfly/_config.yml`
- **文章模板**：编辑 `scaffolds/` 下的模板文件
