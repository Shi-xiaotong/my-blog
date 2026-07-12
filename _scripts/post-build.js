// 构建后处理 — CSS/JS 合并打包 + HTML 替换 + 去重
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const PUBLIC = path.join(ROOT, 'public')
const SOURCE = path.join(ROOT, 'source')

const cssFiles = [
  'tools/common.css', 'tools/site-override.css',
  'css/custom.css', 'css/music-player.css',
  'css/site-auth.css', 'css/user-center.css',
]

const jsFiles = [
  'js/typed-polyfill.js', 'js/widget-loader.js', 'js/live2d-toggle.js',
  'js/site-auth.js', 'js/cwd-auth-hook.js',
  'js/music-player.js', 'js/user-center.js',
]

function concat(files, baseDir) {
  let content = ''
  for (const f of files) {
    try { content += fs.readFileSync(path.join(baseDir, f), 'utf-8') + '\n' }
    catch (e) { console.warn(`[post-build] 跳过: ${f} (${e.code})`) }
  }
  return content
}

fs.mkdirSync(path.join(PUBLIC, 'assets'), { recursive: true })

const cssContent = concat(cssFiles, SOURCE)
fs.writeFileSync(path.join(PUBLIC, 'assets', 'bundle.css'), cssContent)
console.log(`[post-build] bundle.css: ${(cssContent.length / 1024).toFixed(1)} KB`)

const jsContent = concat(jsFiles, SOURCE)
fs.writeFileSync(path.join(PUBLIC, 'assets', 'bundle.js'), jsContent)
console.log(`[post-build] bundle.js: ${(jsContent.length / 1024).toFixed(1)} KB`)

const cssRefs = [
  '/tools/common.css', '/tools/site-override.css',
  '/css/custom.css', '/css/music-player.css',
  '/css/site-auth.css', '/css/user-center.css',
]
const jsRefs = [
  '/js/typed-polyfill.js', '/js/widget-loader.js', '/js/live2d-toggle.js',
  '/js/site-auth.js', '/js/cwd-auth-hook.js',
  '/js/music-player.js', '/js/user-center.js',
]

let count = 0

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name !== 'assets') walk(fp)
    } else if (e.name.endsWith('.html')) {
      let html = fs.readFileSync(fp, 'utf-8')
      let mod = false

      // 替换独立文件引用为 bundle
      for (const r of cssRefs) {
        while (html.includes(r)) { html = html.replace(r, '/assets/bundle.css'); mod = true }
      }
      for (const r of jsRefs) {
        while (html.includes(r)) { html = html.replace(r, '/assets/bundle.js'); mod = true }
      }

      // 清理: 去掉 bundle.css 上残留的 ?v=N
      html = html.replace(/href="\/assets\/bundle\.css\?v=\d+"/g, 'href="/assets/bundle.css"')

      // 去重 bundle.css：保留第一个，删后续
      const cssTag = 'href="/assets/bundle.css"'
      const fc = html.indexOf(cssTag)
      if (fc !== -1) {
        while (true) {
          const next = html.indexOf(cssTag, fc + cssTag.length)
          if (next === -1) break
          html = html.substring(0, next) + html.substring(next + cssTag.length)
          mod = true
        }
      }

      // 去重 bundle.js：保留第一个，删后续
      const jsTag = 'src="/assets/bundle.js"'
      const fj = html.indexOf(jsTag)
      if (fj !== -1) {
        while (true) {
          const next = html.indexOf(jsTag, fj + jsTag.length)
          if (next === -1) break
          html = html.substring(0, next) + html.substring(next + jsTag.length)
          mod = true
        }
      }

      // 清理空标签: 去重导致的空 <script> 和空 <link>
      const before = html.length
      html = html.replace(/<script\s*><\/script>/g, '')
      html = html.replace(/<link[^>]*?\s+href=""[^>]*?>/g, '')
      // 清理没有 href 属性的空 <link> 标签
      html = html.replace(/<link\s[^>]*?rel="stylesheet"[^>]*?\/?>/g, (match) => {
        return match.includes('href=') ? match : ''
      })
      if (html.length !== before) mod = true

      // 在 utils.js 之前注入 typed polyfill（subtitle.effect=false 时 typed 未定义，Pjax 会抛 ReferenceError）
      const utilsJsTag = '<script src="/js/utils.js?v=5.5.4"></script>'
      const utilsIdx = html.indexOf(utilsJsTag)
      if (utilsIdx !== -1) {
        const polyfill = '<script>if(typeof typed==="undefined"){window.typed={destroy:function(){}};window.typedDestroy=function(){}}</script>'
        html = html.substring(0, utilsIdx) + polyfill + html.substring(utilsIdx)
        mod = true
      }

      if (mod) {
        fs.writeFileSync(fp, html)
        count++
      }
    }
  }
}

walk(PUBLIC)
console.log(`[post-build] 已修改 ${count} 个 HTML`)