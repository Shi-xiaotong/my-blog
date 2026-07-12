// Hexo 7 after_generate 钩子在文件写入磁盘前触发，不能用于修改 public/ 文件
// search.xml 清理由 npm run build 中的 node _scripts/post-build.js 独立完成
// 此文件保留为 hexo 插件入口，备后续扩展