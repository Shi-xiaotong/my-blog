#!/bin/bash
# R2 媒体上传脚本
# 用法: ./scripts/r2-upload.sh
# 自动扫描 source/_posts/*/ 下的资源文件夹，上传新图片到 R2

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
MANIFEST="$PROJECT_DIR/.r2-manifest.json"
POSTS_DIR="$PROJECT_DIR/source/_posts"

# R2 配置（从 _config.yml 读取或使用默认值）
R2_BUCKET="myblog"
R2_ENDPOINT="https://32b5283fd99d2ea2abdc19507a5cf8d3.r2.cloudflarestorage.com"
R2_PUBLIC_BASE="https://img.233002.xyz"
R2_ACCESS_KEY="836c8a05e7faba14f3aaef9ce5a717c0"
R2_SECRET_KEY="85aabfd7412c190a58544cd1a63a709cc53d1392c79f974c5fe782dd2773e2cc"
R2_PREFIX="blog"

# 初始化 manifest
if [ ! -f "$MANIFEST" ]; then
    echo '{}' > "$MANIFEST"
fi

upload_count=0
skip_count=0

# 扫描所有资源文件夹
for category_dir in "$POSTS_DIR"/*/; do
    [ -d "$category_dir" ] || continue
    category=$(basename "$category_dir")
    
    for asset_dir in "$category_dir"*/; do
        [ -d "$asset_dir" ] || continue
        
        for file in "$asset_dir"*.{png,jpg,jpeg,gif,webp,svg} 2>/dev/null; do
            [ -f "$file" ] || continue
            filename=$(basename "$file")
            object_key="${R2_PREFIX}/${filename}"
            
            # 计算文件哈希
            file_hash=$(shasum -a 256 "$file" | cut -d' ' -f1)
            file_size=$(stat -f%z "$file")
            
            # 检查 manifest
            manifest_hash=$(python3 -c "
import json, sys
with open('$MANIFEST') as f:
    d = json.load(f)
print(d.get('$object_key', {}).get('hash', ''))
" 2>/dev/null || echo "")
            
            if [ "$manifest_hash" = "$file_hash" ]; then
                skip_count=$((skip_count + 1))
                continue
            fi
            
            # 上传到 R2
            content_type=$(file --brief --mime-type "$file")
            echo "上传: $filename -> ${R2_PUBLIC_BASE}/${object_key}"
            
            # 使用 curl + AWS Signature V4 上传
            # 简化方案：使用 aws cli 或 rclone
            if command -v aws &> /dev/null; then
                aws s3 cp "$file" "s3://${R2_BUCKET}/${object_key}" \
                    --endpoint-url "$R2_ENDPOINT" \
                    --content-type "$content_type" \
                    --no-sign-request 2>/dev/null || \
                AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY" \
                AWS_SECRET_ACCESS_KEY="$R2_SECRET_KEY" \
                aws s3 cp "$file" "s3://${R2_BUCKET}/${object_key}" \
                    --endpoint-url "$R2_ENDPOINT" \
                    --content-type "$content_type"
            else
                echo "警告: 需要安装 aws cli 来上传文件"
                echo "  brew install awscli"
                exit 1
            fi
            
            # 更新 manifest
            python3 -c "
import json
with open('$MANIFEST', 'r') as f:
    d = json.load(f)
d['$object_key'] = {'hash': '$file_hash', 'size': $file_size}
with open('$MANIFEST', 'w') as f:
    json.dump(d, f, indent=2)
"
            upload_count=$((upload_count + 1))
        done
    done
done

echo ""
echo "完成! 上传: $upload_count, 跳过: $skip_count"
echo "图片地址: ${R2_PUBLIC_BASE}/${R2_PREFIX}/<filename>"
