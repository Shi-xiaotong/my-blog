'use strict';

/**
 * 本地图片 → 压缩转 WebP → 上传 Cloudflare R2
 *
 * 设计原则：图片不进 git 仓库。本脚本只做「转换 + 上传」，
 * 源图放在仓库外的任意目录（如 ~/Pictures、U 盘），转出的临时 webp 也只在 /tmp。
 *
 * 用法:
 *   node scripts/r2-upload.js 照片1.jpg 照片2.png
 *   node scripts/r2-upload.js --dir ~/Pictures/jinan
 *   node scripts/r2-upload.js --prefix assets 头像.webp        # 非 blog 资源
 *   node scripts/r2-upload.js --q 75 大图.png                   # 调低质量换更小体积
 *
 * 转换工具优先级: cwebp > ImageMagick(magick) > sharp(node)
 * 上传目标 key: <prefix>/<原文件名去扩展名>.webp  (默认 prefix=blog)
 * 凭证: 读仓库根 .env (R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_ENDPOINT / R2_BUCKET)
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// ---------- 加载 .env（无 dotenv 依赖）----------
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

// ---------- 转 WebP（带压缩）----------
function toWebp(inputPath, outPath, quality) {
  // 1) cwebp（最优 webp 编码器）
  try {
    execFileSync('cwebp', ['-q', String(quality), '-m', '6', inputPath, '-o', outPath], { stdio: 'ignore' });
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 0) return 'cwebp';
  } catch (_) {}
  // 2) ImageMagick
  try {
    execFileSync('magick', [inputPath, '-quality', String(quality), outPath], { stdio: 'ignore' });
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 0) return 'magick';
  } catch (_) {}
  // 3) sharp（node）
  try {
    const sharp = require('sharp');
    sharp(fs.readFileSync(inputPath)).webp({ quality }).toFileSync(outPath);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 0) return 'sharp';
  } catch (_) {}
  throw new Error('没有可用的 WebP 转换工具（需安装 cwebp / ImageMagick / 或 npm i sharp）');
}

// ---------- S3 / R2 客户端 ----------
function getClient() {
  const cfg = {
    endpoint: process.env.R2_ENDPOINT,
    bucket: process.env.R2_BUCKET,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    publicUrl: process.env.R2_PUBLIC_URL || 'https://img.233002.xyz',
  };
  if (!cfg.accessKeyId || !cfg.secretAccessKey || !cfg.endpoint || !cfg.bucket) {
    console.error('❌ 缺少 R2 凭证，检查仓库根 .env：');
    console.error('   R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_ENDPOINT / R2_BUCKET');
    process.exit(1);
  }
  const client = new S3Client({
    region: 'auto',
    endpoint: cfg.endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
  });
  return { cfg, client };
}

const IMG_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp', '.avif']);

async function main() {
  loadEnv();
  const { cfg, client } = getClient();

  const files = [];
  let prefix = 'blog';
  let quality = 82;
  let dir = null;

  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dir') dir = argv[++i];
    else if (a === '--prefix') prefix = argv[++i];
    else if (a === '--q') quality = parseInt(argv[++i], 10);
    else if (a === '--help' || a === '-h') {
      console.log('用法: node scripts/r2-upload.js <文件...> [--dir <目录>] [--prefix blog] [--q 82]');
      process.exit(0);
    } else files.push(a);
  }

  if (dir) {
    if (!fs.existsSync(dir)) { console.error('目录不存在:', dir); process.exit(1); }
    for (const f of fs.readdirSync(dir)) {
      if (IMG_EXT.has(path.extname(f).toLowerCase())) files.push(path.join(dir, f));
    }
  }

  if (files.length === 0) {
    console.error('未指定要上传的图片。用法见 --help');
    process.exit(1);
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'r2up-'));
  const uploaded = [];

  for (const f of files) {
    if (!fs.existsSync(f)) { console.error('跳过(不存在):', f); continue; }
    const ext = path.extname(f).toLowerCase();
    if (!IMG_EXT.has(ext)) { console.error('跳过(非图片):', f); continue; }

    const stem = path.basename(f, ext);
    const webpTmp = path.join(tmpDir, stem + '.webp');
    const tool = toWebp(f, webpTmp, quality);
    const webpBuf = fs.readFileSync(webpTmp);
    const origSize = fs.statSync(f).size;
    const newSize = webpBuf.length;
    const ratio = ((1 - newSize / origSize) * 100).toFixed(0);

    const key = `${prefix}/${stem}.webp`;
    await client.send(new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: webpBuf,
      ContentType: 'image/webp',
    }));

    const url = `${cfg.publicUrl.replace(/\/$/, '')}/${key}`;
    console.log(`✅ ${path.basename(f)} → ${url}`);
    console.log(`   ${tool} | 原 ${(origSize/1024).toFixed(0)}KB → webp ${(newSize/1024).toFixed(0)}KB (省 ${ratio}%)`);
    uploaded.push(url);
  }

  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log(`\n完成 ${uploaded.length} 张。把上面的 URL 粘进文章即可（博客图统一放 blog/ 前缀）。`);
}

// 仅当直接 `node scripts/r2-upload.js` 运行时才执行；
// 被 Hexo 作为 scripts/ 扩展加载时（require.main !== module）只定义函数，不误跑。
if (require.main === module) {
  main().catch(e => { console.error('❌', e.message); process.exit(1); });
}
