const fs = require('fs')
const path = require('path')

const PUBLIC = path.resolve(__dirname, '..', 'public')

function cleanSearch() {
  const xmlPath = path.join(PUBLIC, 'search.xml')
  if (!fs.existsSync(xmlPath)) return
  let xml = fs.readFileSync(xmlPath, 'utf-8')

  // Fix double-slash bug from hexo-generator-searchdb
  xml = xml.replace(/<url>\/\//g, '<url>/')

  const excludePatterns = [
    /^<url>\/assets\//,
    /^<url>\/css\//,
    /^<url>\/js\//,
    /^<url>\/live2d\//,
    /^<url>\/fonts\//,
    /^<url>\/404\.html<\/url>$/,
    /^<url>\/archives\//,
    /^<url>\/categories\//,
    /^<url>\/tags\//,
    /^<url>\/page\//,
    /^<url>\/feed\.xml<\/url>$/,
    /^<url>\/sitemap\.xml<\/url>$/,
  ]
  const excludeExtensions = ['.css','.js','.woff2','.woff','.png','.jpg','.jpeg','.webp','.svg','.ico','.xml','.json']

  const entries = xml.split(/(<entry[\s\S]*?<\/entry>)/).filter(e => e.trim())
  let removed = 0
  const filtered = entries.filter(entry => {
    const m = entry.match(/<url>(.*?)<\/url>/)
    if (!m) return false
    const url = m[1]
    for (const p of excludePatterns) if (p.test('<url>' + url + '</url>')) { removed++; return false }
    for (const ext of excludeExtensions) if (url.endsWith(ext)) { removed++; return false }
    return true
  })

  fs.writeFileSync(xmlPath, filtered.join(''), 'utf-8')
  console.log(`[post-build] search.xml 清理: 删除 ${removed} 个无用 entry`)
}

module.exports = { cleanSearch, PUBLIC }