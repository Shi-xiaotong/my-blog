#!/usr/bin/env node
/**
 * R2 CRUD — 博客媒体管理工具
 * 用法: node r2.js <command> [args]
 *
 * 命令:
 *   ls [prefix]         列出文件
 *   upload <file> [key] 上传文件
 *   get <key> [output]  下载文件
 *   rm <key>            删除文件
 *   info <key>          查看文件信息
 *
 * 示例:
 *   node r2.js ls assets/
 *   node r2.js upload intro.mp4 assets/intro-video.mp4
 *   node r2.js get assets/intro-video.mp4 ./download.mp4
 *   node r2.js info assets/avatar.webp
 *
 * 注意: 需要先设置 R2 S3 凭证（从 Cloudflare 面板获取）
 *   1. 打开 https://dash.cloudflare.com/?to=/:account/r2
 *   2. 点击 myblog → 管理 R2 API 令牌
 *   3. 创建令牌 → 复制到 .env
 *
 * .env 格式:
 *   R2_ACCESS_KEY_ID=your_key
 *   R2_SECRET_ACCESS_KEY=your_secret
 *   R2_ENDPOINT=https://32b5283fd99d2ea2abdc19507a5cf8d3.r2.cloudflarestorage.com
 *   R2_BUCKET=myblog
 *   R2_PUBLIC_URL=https://img.233002.xyz
 */
const { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const config = {
  endpoint: process.env.R2_ENDPOINT || 'https://32b5283fd99d2ea2abdc19507a5cf8d3.r2.cloudflarestorage.com',
  bucket: process.env.R2_BUCKET || 'myblog',
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  publicUrl: process.env.R2_PUBLIC_URL || 'https://img.233002.xyz',
};

if (!config.accessKeyId || !config.secretAccessKey) {
  console.error('❌ 需要 R2 S3 凭证');
  console.error('   1. 去 https://dash.cloudflare.com/?to=/:account/r2 创建 API 令牌');
  console.error('   2. 设置环境变量:');
  console.error('      export R2_ACCESS_KEY_ID=xxx');
  console.error('      export R2_SECRET_ACCESS_KEY=xxx');
  console.error('   或加到 .env 文件');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: config.endpoint,
  forcePathStyle: true,
  credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
});

async function main() {
  const cmd = process.argv[2];
  const args = process.argv.slice(3);
  switch (cmd) {
    case 'ls': return listObjects(args[0] || '');
    case 'upload': return uploadFile(args[0], args[1]);
    case 'get': return getObject(args[0], args[1]);
    case 'rm': return deleteObject(args[0]);
    case 'info': return headObject(args[0]);
    default:
      console.log(`用法: node r2.js <命令> [参数]

命令:
  ls [prefix]         列出文件 (默认: 根目录)
  upload <file> [key] 上传文件 (key 可选, 默认文件名)
  get <key> [output]  下载文件 (output 可选, 默认文件名)
  rm <key>            删除文件
  info <key>          查看文件信息

示例:
  node r2.js ls assets/
  node r2.js upload intro.mp4 assets/intro-video.mp4
  node r2.js info assets/avatar.webp
`);
  }
}

async function listObjects(prefix) {
  const result = await s3.send(new ListObjectsV2Command({
    Bucket: config.bucket, Prefix: prefix,
  }));
  const objects = result.Contents || [];
  if (objects.length === 0) return console.log(`(空) ${prefix}`);
  let totalSize = 0;
  for (const obj of objects) {
    const size = (obj.Size / 1024).toFixed(1);
    const date = obj.LastModified.toISOString().split('T')[0];
    console.log(`${date}  ${size.padStart(8)} KB  ${obj.Key}`);
    totalSize += obj.Size;
  }
  console.log(`\n总计: ${objects.length} 个文件, ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
}

async function uploadFile(localPath, remoteKey) {
  if (!localPath) return console.error('请指定本地文件路径');
  if (!fs.existsSync(localPath)) return console.error(`文件不存在: ${localPath}`);
  remoteKey = remoteKey || path.basename(localPath);
  const body = fs.createReadStream(localPath);
  const contentType = getContentType(localPath);
  console.log(`上传: ${localPath} → ${remoteKey}`);
  await s3.send(new PutObjectCommand({
    Bucket: config.bucket, Key: remoteKey, Body: body, ContentType: contentType,
  }));
  console.log(`✅ 完成: ${config.publicUrl}/${remoteKey}`);
}

async function getObject(key, outputPath) {
  if (!key) return console.error('请指定远程路径');
  outputPath = outputPath || path.basename(key);
  const result = await s3.send(new GetObjectCommand({ Bucket: config.bucket, Key: key }));
  const writeStream = fs.createWriteStream(outputPath);
  result.Body.pipe(writeStream);
  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
  const size = fs.statSync(outputPath).size;
  console.log(`✅ 下载完成: ${outputPath} (${(size/1024).toFixed(1)} KB)`);
}

async function deleteObject(key) {
  if (!key) return console.error('请指定远程路径');
  await s3.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
  console.log(`✅ 已删除: ${key}`);
}

async function headObject(key) {
  try {
    const result = await s3.send(new HeadObjectCommand({ Bucket: config.bucket, Key: key }));
    console.log(`Key:      ${key}`);
    console.log(`大小:     ${(result.ContentLength / 1024).toFixed(1)} KB`);
    console.log(`类型:     ${result.ContentType}`);
    console.log(`修改于:   ${result.LastModified}`);
    console.log(`URL:      ${config.publicUrl}/${key}`);
  } catch (e) {
    if (e.name === 'NotFound') return console.log(`❌ 不存在: ${key}`);
    throw e;
  }
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
    '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
    '.json': 'application/json', '.pdf': 'application/pdf',
  };
  return types[ext] || 'application/octet-stream';
}

main().catch(e => {
  console.error('❌ 错误:', e.message);
  process.exit(1);
});