// Batch add meta descriptions to tool pages
const fs = require('fs');
const path = require('path');

const tools = [
  { file: 'base-convert.html', desc: '在线进制转换工具，支持二进制、八进制、十进制、十六进制互相转换，纯浏览器端运行。' },
  { file: 'base32.html', desc: 'Base32 编码与解码工具，纯浏览器端运行，无需上传数据。' },
  { file: 'base36.html', desc: 'Base36 编码与解码工具，支持字母数字混合编码，纯浏览器端运行。' },
  { file: 'base58.html', desc: 'Base58 编码与解码工具，常用于比特币等加密货币，纯浏览器端运行。' },
  { file: 'base64-image.html', desc: '图片与 Base64 互转工具，支持实时预览和下载，纯浏览器端运行。' },
  { file: 'base64.html', desc: 'Base64 编码与解码工具，支持中文编码，纯浏览器端运行。' },
  { file: 'base64url.html', desc: 'Base64 URL 安全编码与解码，使用 - 和 _ 替代 + 和 /，适合 URL 传输。' },
  { file: 'byte-converter.html', desc: '字节大小单位换算工具，支持 B/KB/MB/GB/TB/PB/bit 互转。' },
  { file: 'case-convert.html', desc: '文本大小写转换工具，支持 UPPER/lower/camelCase/snake_case/kebab-case 等格式互转。' },
  { file: 'cipher.html', desc: '经典密码编码与解码工具，支持 ROT13、凯撒密码、摩斯电码。' },
  { file: 'code-highlight.html', desc: '代码语法高亮工具，支持多种编程语言，一键复制高亮代码。' },
  { file: 'color.html', desc: '颜色转换器，支持 HEX/RGB/HSL 互转，可视化拾色器。' },
  { file: 'contrast.html', desc: '颜色对比度检测工具，符合 WCAG 无障碍标准，支持 AA/AAA 级别检测。' },
  { file: 'cron.html', desc: 'Cron 表达式可视化解析工具，显示未来执行时间，支持常见定时任务格式。' },
  { file: 'css-minify.html', desc: 'CSS 代码压缩与格式化工具，减小文件大小或提升可读性。' },
  { file: 'css-unit.html', desc: 'CSS 单位换算工具，支持 px/rem/em/vw/% 实时换算。' },
  { file: 'csv-json.html', desc: 'CSV 与 JSON 数据互相转换工具，支持表格数据与结构化数据互转。' },
  { file: 'csv-to-json.html', desc: 'CSV 表格数据转换为 JSON 数组工具，自动识别表头。' },
  { file: 'csv-to-yaml.html', desc: 'CSV 表格数据转换为 YAML 格式工具，自动识别表头。' },
  { file: 'date-diff.html', desc: '日期差值计算器，计算两个日期之间的天数、周数、月数和年数。' },
  { file: 'emoji-cleaner.html', desc: 'Emoji 表情清理工具，支持移除、提取和替换文本中的 Emoji。' },
  { file: 'generator-pack.html', desc: '常用配置文件生成器，支持 Gitignore、Robots.txt、Sitemap、Meta 标签一键生成。' },
  { file: 'gradient.html', desc: '渐变色生成器，可视化创建线性/径向 CSS 渐变，实时预览和代码复制。' },
  { file: 'hash.html', desc: '哈希生成工具，支持 MD5、SHA-1、SHA-256、SHA-512 算法。' },
  { file: 'hex-encode.html', desc: '十六进制编码与解码工具，文本与 HEX 字符串互相转换。' },
  { file: 'html-escape.html', desc: 'HTML 实体编码与反转义工具，安全处理 HTML 特殊字符。' },
  { file: 'http-status.html', desc: 'HTTP 状态码速查工具，支持搜索，涵盖所有常见状态码含义。' },
  { file: 'image-compress.html', desc: '在线图片压缩工具，支持质量可调，减小图片体积。' },
  { file: 'image-convert.html', desc: '图片格式转换工具，支持 PNG/JPG/WebP/BMP 格式互转。' },
  { file: 'image-crop.html', desc: '图片裁剪工具，拖拽选区裁剪图片，支持多种导出格式。' },
  { file: 'json-formatter.html', desc: 'JSON 格式化工具，支持格式化、压缩、转义、校验，纯浏览器端运行。' },
  { file: 'json-key-sort.html', desc: 'JSON 键名排序工具，递归排序 JSON 对象的键名，支持升序降序。' },
  { file: 'json-stringify.html', desc: 'JSON 字符串转义与反转义工具，处理 JSON 中的特殊字符。' },
  { file: 'json-to-csv.html', desc: 'JSON 数据转换为 CSV 表格工具，支持嵌套数组。' },
  { file: 'json-to-table.html', desc: 'JSON 数组转换为 Markdown 表格工具，自动生成表头和分隔行。' },
  { file: 'json-to-xml.html', desc: 'JSON 格式转换为 XML 工具，支持嵌套对象和数组。' },
  { file: 'json-ts.html', desc: 'JSON 自动生成 TypeScript 接口类型工具，一键生成类型定义。' },
  { file: 'json-yaml.html', desc: 'JSON 与 YAML 格式互相转换工具，支持嵌套结构和数组。' },
  { file: 'jsonl.html', desc: 'JSON Lines 转换器，JSONL 与 JSON 数组互相转换。' },
  { file: 'jwt-decode.html', desc: 'JWT Token 解析工具，查看 Header 和 Payload 内容，纯浏览器端运行。' },
  { file: 'line-numbers.html', desc: '文本行号添加器，批量为代码或文本添加/去除行号。' },
  { file: 'lorem-ipsum.html', desc: 'Lorem Ipsum 占位文本生成器，用于设计和原型填充。' },
  { file: 'markdown.html', desc: 'Markdown 实时预览渲染工具，所见即所得编辑体验。' },
  { file: 'md-table.html', desc: 'Markdown 表格生成器，可视化编辑生成 Markdown 格式表格。' },
  { file: 'md-to-wechat.html', desc: 'Markdown 转微信公众号排版工具，生成可直接粘贴的 HTML 代码。' },
  { file: 'mock.html', desc: 'Mock 数据生成工具，生成用户、地址、商品等测试假数据。' },
  { file: 'multi-calculator.html', desc: '综合计算器工具，支持 BMI 指数计算、税后工资计算、房贷月供计算。' },
  { file: 'nanoid-ulid.html', desc: 'NanoID 和 ULID 标识符生成器，支持多种字符集和批量生成。' },
  { file: 'password-gen.html', desc: '安全密码生成器，支持自定义长度、字符规则和强度要求。' },
  { file: 'password-strength.html', desc: '密码强度检测工具，评估密码安全性并给出改进建议。' },
  { file: 'percentage.html', desc: '百分比计算器，支持 A 的 B% 计算、数值增减百分比等。' },
  { file: 'qr-code.html', desc: '二维码生成器，支持文本和网址生成，可下载 SVG/PNG 格式。' },
  { file: 'random.html', desc: '随机数生成器、随机抽取器和掷骰子工具，支持自定义范围和数量。' },
  { file: 'regex.html', desc: '正则表达式在线测试工具，高亮显示匹配结果，内置常用正则预设。' },
  { file: 'text-binary.html', desc: '文本与二进制互转工具，支持 UTF-8 编码的文本转换。' },
  { file: 'text-diff.html', desc: '两段文本差异对比工具，高亮显示不同之处，支持逐行对比。' },
  { file: 'text-tools.html', desc: '文本处理工具合集，支持去重、排序、去空行、加行号、反转等操作。' },
  { file: 'timer.html', desc: '在线倒计时器，支持自定义时/分/秒，时间到提醒，带进度条显示。' },
  { file: 'timestamp.html', desc: 'Unix 时间戳与日期互转工具，支持秒和毫秒两种单位。' },
  { file: 'tsv-to-json.html', desc: 'TSV 制表符分隔数据转换为 JSON 工具，自动识别表头。' },
  { file: 'ua-parser.html', desc: 'User-Agent 解析工具，识别浏览器、操作系统和设备类型。' },
  { file: 'unicode.html', desc: 'Unicode 与中文互转工具，支持中文编码与解码。' },
  { file: 'unit-converter.html', desc: '通用单位换算器，支持长度、重量、温度、速度、存储、面积换算。' },
  { file: 'url-codec.html', desc: 'URL 编码与解码工具，支持中文等特殊字符的 URL 编码转换。' },
  { file: 'url-param.html', desc: 'URL 查询参数生成器，可视化添加键值对，自动生成完整 URL。' },
  { file: 'url-slug.html', desc: 'URL Slug 生成器，支持中文文本转 URL 友好的 slug 格式。' },
  { file: 'uuid.html', desc: 'UUID v4 批量生成器，一键复制，支持自定义数量。' },
  { file: 'watermark-remove.html', desc: '图片去水印工具，涂抹选区去除图片中的水印。' },
  { file: 'watermark.html', desc: '图片加水印工具，支持文字和水印图片，可调节位置和透明度。' },
  { file: 'word-count.html', desc: '字数统计工具，支持中英文字符数、单词数、行数、段落数统计。' },
  { file: 'xml-to-json.html', desc: 'XML 格式转换为 JSON 工具，支持嵌套节点和属性。' },
  { file: 'yaml-to-csv.html', desc: 'YAML 数据转换为 CSV 表格工具，自动提取键名为表头。' },
  { file: 'yaml-to-json.html', desc: 'YAML 格式转换为 JSON 工具，支持嵌套结构和数组。' },
];

const dir = path.resolve(__dirname, '..', 'source', 'tools');

tools.forEach(({ file, desc }) => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (not found): ${file}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  // Only add if no meta description exists
  if (content.includes('meta name="description"')) {
    console.log(`SKIP (already has desc): ${file}`);
    return;
  }
  // Insert after <meta name="viewport"...>
  const viewportPattern = /(<meta name="viewport"[^>]*>)/;
  const replacement = '$1\n<meta name="description" content="' + desc.replace(/"/g, '&quot;') + '">';
  content = content.replace(viewportPattern, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`OK: ${file}`);
});

console.log('\nDone.');
