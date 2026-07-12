#!/usr/bin/env node
/**
 * 构建后脚本：上传 source/videos/ 中的视频到 R2
 * 在 CF Pages 构建环境中运行（R2 凭证已注入）
 */
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const VIDEOS_DIR = path.resolve(__dirname, '..', 'source', 'videos');
const config = {
  endpoint: process.env.R2_ENDPOINT || 'https://32b5283fd99d2ea2abdc19507a5cf8d3.r2.cloudflarestorage.com',
  bucket: process.env.R2_BUCKET || 'myblog',
  accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY,
  publicUrl: process.env.R2_PUBLIC_URL || 'https://img.233002.xyz',
};

if (!config.accessKeyId || !config.secretAccessKey) {
  console.log('[r2-upload] 跳过: 无 R2 凭证');
  process.exit(0);
}

if (!fs.existsSync(VIDEOS_DIR)) {
  console.log('[r2-upload] 跳过: 无 videos 目录');
  process.exit(0);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: config.endpoint,
  forcePathStyle: true,
  credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
});

async function upload(filePath) {
  const fileName = path.basename(filePath);
  const key = `assets/${fileName}`;
  const stats = fs.statSync(filePath);
  // 跳过小于 1KB 的文件
  if (stats.size < 1024) return;
  
  console.log(`[r2-upload] 上传: ${fileName} (${(stats.size/1024/1024).toFixed(1)} MB)`);
  await s3.send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: fs.createReadStream(filePath),
    ContentType: getContentType(filePath),
  }));
  console.log(`[r2-upload] ✅ ${config.publicUrl}/${key}`);
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = { '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime' };
  return map[ext] || 'application/octet-stream';
}

async function main() {
  const files = fs.readdirSync(VIDEOS_DIR).filter(f => f.endsWith('.mp4'));
  if (files.length === 0) { console.log('[r2-upload] 无需上传'); return; }
  for (const f of files) await upload(path.join(VIDEOS_DIR, f));
}

main().catch(e => console.error('[r2-upload] 错误:', e.message));