// 构建后处理 — CSS/JS 合并打包 + HTML 替换 + 去重 + 图片 WebP 优化
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { execSync } = require('child_process')

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

function contentHash(content) {
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 8)
}

fs.mkdirSync(path.join(PUBLIC, 'assets'), { recursive: true })

const cssContent = concat(cssFiles, SOURCE)
const cssHash = contentHash(cssContent)
const cssBundleName = `bundle.${cssHash}.css`
const jsBundleName = `bundle.${jsHash}` // placeholder, set after JS concat below

fs.writeFileSync(path.join(PUBLIC, 'assets', cssBundleName), cssContent)
fs.copyFileSync(path.join(PUBLIC, 'assets', cssBundleName), path.join(PUBLIC, 'assets', 'bundle.css'))
console.log(`[post-build] bundle.css → ${cssBundleName} + bundle.css (${(cssContent.length / 1024).toFixed(1)} KB)`)

const jsContent = concat(jsFiles, SOURCE)
const jsHash = contentHash(jsContent)
jsBundleName = `bundle.${jsHash}.js`

fs.writeFileSync(path.join(PUBLIC, 'assets', jsBundleName), jsContent)
fs.copyFileSync(path.join(PUBLIC, 'assets', jsBundleName), path.join(PUBLIC, 'assets', 'bundle.js'))
console.log(`[post-build] bundle.js → ${jsBundleName} + bundle.js (${(jsContent.length / 1024).toFixed(1)} KB)`)

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
// ===== 图片 WebP 优化模块 =====
const IMAGE_OPTIMIZE_TEMP = path.join(ROOT, '.temp', 'images')
const MIN_IMAGE_SIZE = 5 * 1024 // 跳过 < 5KB 的小图标/emoji
const WEBP_QUALITY = 82

// 检测 cwebp 是否可用
let hasCwebp = false
try {
  execSync('cwebp -version', { stdio: 'ignore' })
  hasCwebp = true
} catch (_) { hasCwebp = false }

/**
 * 从 HTML 中提取所有 img src，转换为 WebP 并替换为 <picture> 标签
 * @param {string} html - 原始 HTML
 * @returns {{ processed: number, skipped: number }}
 */
function optimizeImages(html) {
  if (!hasCwebp) {
    console.log('[post-build] ⚠️ cwebp 未安装，跳过图片优化（brew install libwebp）')
    return { processed: 0, skipped: 0 }
  }

  fs.mkdirSync(IMAGE_OPTIMIZE_TEMP, { recursive: true })

  let processed = 0
  let skipped = 0

  // 匹配 <img ... src="URL" ...> （支持单引号、双引号）
  const imgRegex = /(<img\b[^>]*\bsrc\s*=\s*)(["'])([^"']+?)\2([^>]*\/?>)/gi

  html = html.replace(imgRegex, (match, prefix, quote, src, suffix) => {
    // 跳过非 jpg/jpeg/png 格式
    const ext = path.extname(src).toLowerCase()
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) return match

    // 跳过 data: URI
    if (src.startsWith('data:')) return match

    try {
      const result = convertImageToWebP(src)
      if (!result) {
        skipped++
        return match
      }

      processed++
      return buildPictureTag(match, quote, src, result.webpUrl)
    } catch (e) {
      console.warn(`[post-build] 🖼️ 处理失败: ${src} (${e.message})`)
      skipped++
      return match
    }
  })

  return { processed, skipped }
}

/**
 * 将单张图片转换为 WebP，返回 WebP URL 和原始 URL
 */
function convertImageToWebP(src) {
  const ext = path.extname(src).toLowerCase()
  const baseName = path.basename(src, ext)
  const webpFileName = `${baseName}.webp`

  let localFilePath = null
  const isRemote = src.startsWith('http://') || src.startsWith('https://')

  if (isRemote) {
    // 下载远程图片到临时目录
    localFilePath = path.join(IMAGE_OPTIMIZE_TEMP, `${baseName}${ext}`)
    if (!fs.existsSync(localFilePath)) {
      try {
        execSync(`curl -fsSL --max-time 30 -o "${localFilePath}" "${src}"`, { stdio: 'pipe' })
      } catch (e) {
        console.warn(`[post-build] 🖼️ 下载失败: ${src}`)
        return null
      }
    }
  } else {
    // 本地文件路径
    localFilePath = path.join(PUBLIC, src)
    if (!fs.existsSync(localFilePath)) return null
  }

  // 跳过太小文件
  const stats = fs.statSync(localFilePath)
  if (stats.size < MIN_IMAGE_SIZE) return null

  // 生成 WebP 输出路径
  const webpLocalPath = path.join(IMAGE_OPTIMIZE_TEMP, webpFileName)

  // 已存在则跳过转换
  if (!fs.existsSync(webpLocalPath)) {
    try {
      execSync(`cwebp -q ${WEBP_QUALITY} -m 6 "${localFilePath}" -o "${webpLocalPath}"`, { stdio: 'pipe' })
    } catch (e) {
      console.warn(`[post-build] 🖼️ cwebp 转换失败: ${src}`)
      return null
    }
  }

  // 无 R2 凭证时，将 WebP 复制到 public 目录对应位置
  // 有 R2 凭证时由 r2-upload.js 后续上传（本脚本只负责转换和本地缓存）
  let webpUrl
  if (isRemote) {
    // CDN 图片：生成同路径的 .webp URL
    const urlObj = new URL(src)
    webpUrl = urlObj.origin + urlObj.pathname.replace(new RegExp(`${ext}$`), '.webp')
  } else {
    // 本地文件：复制到 public 目录
    const publicDir = path.dirname(path.join(PUBLIC, src))
    fs.mkdirSync(publicDir, { recursive: true })
    const publicWebpPath = path.join(publicDir, webpFileName)
    fs.copyFileSync(webpLocalPath, publicWebpPath)
    const urlPath = path.relative(PUBLIC, publicWebpPath).split(path.sep).join('/')
    webpUrl = `/${urlPath}`
  }

  return { originalSrc: src, webpUrl }
}

/**
 * 将 <img src="..."> 转换为 <picture><source webp><img fallback>
 * 保留原始 img 的所有属性
 */
function buildPictureTag(originalMatch, quote, src, webpSrc) {
  // 移除 src 属性，保留其他属性
  const withoutSrc = originalMatch.replace(
    new RegExp('\\bsrc\\s*=\\s*' + quote + '[^' + quote + ']*' + quote, 'i'),
    ''
  )

  // 清理可能残留的空格
  const cleanAttrs = withoutSrc.replace(/\s{2,}/g, ' ').replace(/^\s+/, '').replace(/\s+$/, '')

  return `<picture>\n  <source type="image/webp" srcset="${webpSrc}">\n  <img${cleanAttrs}src="${quote}${src}${quote}">\n</picture>`
}

// ===== 递归遍历 HTML 文件 =====
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name !== 'assets') walk(fp)
    } else if (e.name.endsWith('.html')) {
      let html = fs.readFileSync(fp, 'utf-8')
      let mod = false

      // 替换独立文件引用为带 hash 的 bundle
      for (const r of cssRefs) {
        while (html.includes(r)) { html = html.replace(r, `/assets/${cssBundleName}`); mod = true }
      }
      for (const r of jsRefs) {
        while (html.includes(r)) { html = html.replace(r, `/assets/${jsBundleName}`); mod = true }
      }

      // 清理: 去掉 bundle.css 上残留的 ?v=N
      html = html.replace(new RegExp(`href="/assets/bundle\\.css\\?v=\\d+"`, 'g'), `href="/assets/bundle.css"`)

      // 去重 bundle.css：保留第一个，删后续
      const cssTag = `href="/assets/${cssBundleName}"`
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
      const jsTag = `src="/assets/${jsBundleName}"`
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

      // ===== 图片 WebP 优化 =====
      const imgStats = optimizeImages(html)
      if (imgStats.processed > 0) {
        mod = true
        console.log(`[post-build] 🖼️ ${imgStats.processed} 张图片已生成 WebP（${imgStats.skipped} 跳过）`)
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

// 共享的 search.xml 清理逻辑（也是 scripts/hexo-init.js 的钩子目标）
const { cleanSearch } = require('./clean-search.js')
// 独立运行（npm run build 也会触发）
cleanSearch()