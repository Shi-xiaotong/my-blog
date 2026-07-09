#!/usr/bin/env python3
"""
img-bed.py — GitHub + jsDelivr Image Hosting CLI
=================================================

Usage:
  python _scripts/img-bed.py upload <path> [<path> ...]     Upload image(s)
  python _scripts/img-bed.py compress <path> [...options]   Compress & upload (WebP default)
  python _scripts/img-bed.py list                           List all images
  python _scripts/img-bed.py url <path>                     Get CDN URL(s)
  python _scripts/img-bed.py delete <path>                  Delete an image
  python _scripts/img-bed.py find <name>                    Find image by filename
  python _scripts/img-bed.py info                           Repo info & stats

Images stored in `YYYY/MM/DD/{filename}` folders automatically.
"""

import argparse
import base64
import io
import json
import mimetypes
import os
import subprocess
import sys
import tempfile
import time
from datetime import date
import urllib.error
import urllib.request


def try_import_pillow():
    """Import PIL, prompt install if missing."""
    try:
        from PIL import Image
        return Image
    except ImportError:
        print(json.dumps({
            "error": "Pillow required. Install: pip install Pillow"
        }))
        sys.exit(1)


# ─── Config ──────────────────────────────────────────────────────────────────
OWNER = "Shi-xiaotong"
REPO = "images"
BRANCH = "main"
API_BASE = f"https://api.github.com/repos/{OWNER}/{REPO}/contents"
TREE_API = f"https://api.github.com/repos/{OWNER}/{REPO}/git/trees/{BRANCH}?recursive=1"
CDN_BASE = f"https://cdn.jsdelivr.net/gh/{OWNER}/{REPO}@{BRANCH}"


# ─── Token resolution ────────────────────────────────────────────────────────

def get_token():
    """Get GitHub PAT: env var > git credential manager."""
    env_token = os.environ.get("GH_TOKEN")
    if env_token:
        return env_token
    try:
        proc = subprocess.run(
            ["git", "credential", "fill"],
            input="url=https://github.com\n".encode(),
            capture_output=True,
            timeout=5,
        )
        for line in proc.stdout.decode().splitlines():
            if line.startswith("password="):
                return line.split("=", 1)[1]
    except Exception:
        pass
    return None


# ─── Date path ───────────────────────────────────────────────────────────────

def _date_path():
    """Return YYYY/MM/DD for today."""
    d = date.today()
    return f"{d.year}/{d.month:02d}/{d.day:02d}"


# ─── GitHub API helpers ──────────────────────────────────────────────────────

def gh_headers():
    token = get_token()
    if not token:
        print(json.dumps({"error": "No GitHub token found. Set GH_TOKEN env var or configure git credential manager."}))
        sys.exit(1)
    return {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
    }


def gh_request(path, method="GET", body=None):
    url = f"{API_BASE}/{path.lstrip('/')}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method)
    for k, v in gh_headers().items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        try:
            return {"error": json.loads(err).get("message", err)}
        except json.JSONDecodeError:
            return {"error": err.strip() or f"HTTP {e.code}"}


def gh_tree():
    """Get all files in repo using Git Trees API (recursive)."""
    req = urllib.request.Request(TREE_API)
    for k, v in gh_headers().items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
            if "tree" not in data:
                return []
            return [
                item for item in data["tree"]
                if item["type"] == "blob" and item["path"] != "README.md"
            ]
    except Exception as e:
        return []


# ─── Upload ──────────────────────────────────────────────────────────────────

def _do_upload(filename, raw_bytes, pretty=False):
    """Upload raw bytes to YYYY/MM/DD/{filename}, return result dict."""
    folder = _date_path()
    repo_path = f"{folder}/{filename}"
    b64 = base64.b64encode(raw_bytes).decode()

    # Check existence → get SHA for overwrite
    existing = gh_request(repo_path, "GET")
    sha = existing.get("sha") if "sha" in existing else None

    result = gh_request(repo_path, "PUT", {
        "message": f"upload: {repo_path}",
        "content": b64,
        "sha": sha,
        "branch": BRANCH,
    })

    if "error" in result:
        return {
            "name": filename,
            "path": repo_path,
            "status": "error",
            "message": result["error"],
        }

    c = result.get("content", {})
    return {
        "name": c.get("name", filename),
        "path": repo_path,
        "folder": folder,
        "size": len(raw_bytes),
        "cdn_url": f"{CDN_BASE}/{repo_path}",
        "markdown": f"![{filename}]({CDN_BASE}/{repo_path})",
        "html": f'<img src="{CDN_BASE}/{repo_path}" alt="{filename}">',
        "status": "ok",
    }


def cmd_upload(paths, pretty=False):
    results = []
    for p in paths:
        if not os.path.isfile(p):
            results.append({"path": p, "status": "error", "message": "file not found"})
            continue

        with open(p, "rb") as f:
            raw = f.read()

        filename = os.path.basename(p)
        entry = _do_upload(filename, raw, pretty)
        results.append(entry)

    _output(results, pretty, "上传完成" if pretty else None)
    return results


# ─── List ────────────────────────────────────────────────────────────────────

def cmd_list(pretty=False):
    items = gh_tree()
    files = []
    for item in items:
        cdn_url = f"{CDN_BASE}/{item['path']}"
        files.append({
            "name": item["path"].split("/")[-1],
            "path": item["path"],
            "size": item.get("size", 0),
            "cdn_url": cdn_url,
        })

    if pretty:
        _output(
            {"count": len(files), "files": files},
            True, f"共 {len(files)} 张图片",
            table_cols=["path", "size"],
        )
    return files


# ─── URL ─────────────────────────────────────────────────────────────────────

def cmd_url(paths, pretty=False):
    results = []
    for path in paths:
        cdn = f"{CDN_BASE}/{path}"
        filename = path.split("/")[-1]
        results.append({
            "path": path,
            "cdn_url": cdn,
            "markdown": f"![{filename}]({cdn})",
            "html": f'<img src="{cdn}" alt="{filename}">',
        })

    if not pretty:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        for r in results:
            print(f"\n  📄 {r['path']}")
            print(f"     CDN:      {r['cdn_url']}")
            print(f"     Markdown: {r['markdown']}")
            print(f"     HTML:     {r['html']}")
    return results


# ─── Find ────────────────────────────────────────────────────────────────────

def cmd_find(name, pretty=False):
    items = gh_tree()
    matches = [
        {
            "name": item["path"].split("/")[-1],
            "path": item["path"],
            "size": item.get("size", 0),
            "cdn_url": f"{CDN_BASE}/{item['path']}",
        }
        for item in items
        if name.lower() in item["path"].lower()
    ]

    if pretty:
        _output(
            {"count": len(matches), "files": matches},
            True, f"找到 {len(matches)} 个匹配",
            table_cols=["path", "size"],
        )
    else:
        print(json.dumps({"count": len(matches), "files": matches}, ensure_ascii=False, indent=2))
    return matches


# ─── Delete ──────────────────────────────────────────────────────────────────

def cmd_delete(path, pretty=False):
    existing = gh_request(path, "GET")
    if "error" in existing:
        _output({"error": f"'{path}' not found: {existing['error']}"}, pretty)
        return None

    result = gh_request(path, "DELETE", {
        "message": f"delete: {path}",
        "sha": existing["sha"],
        "branch": BRANCH,
    })

    msg = {"path": path, "status": "ok" if "error" not in result else "error"}
    if "error" in result:
        msg["message"] = result["error"]

    _output(msg, pretty, f"已删除 {path}" if pretty else None)
    return msg


# ─── Compress & Upload ───────────────────────────────────────────────────────

def cmd_compress(path, max_dim=1920, quality=85, fmt="webp", pretty=False):
    """Resize, compress to WebP/JPEG, upload in date folder, return CDN URL."""
    Image = try_import_pillow()

    if not os.path.isfile(path):
        result = {"path": path, "status": "error", "message": "file not found"}
        _output(result, pretty)
        return result

    img = Image.open(path)
    w, h = img.size

    # Resize if needed
    if max(w, h) > max_dim:
        ratio = max_dim / max(w, h)
        new_w, new_h = int(w * ratio), int(h * ratio)
        img = img.resize((new_w, new_h), Image.LANCZOS)
        resized = f"{w}x{h} → {new_w}x{new_h}"
    else:
        resized = f"{w}x{h} (unchanged)"

    # JPEG: strip alpha
    if fmt == "jpeg" and img.mode in ("RGBA", "P"):
        bg = Image.new("RGB", img.size, (255, 255, 255))
        mask = img.split()[-1] if img.mode == "RGBA" else None
        bg.paste(img, mask=mask)
        img = bg
    elif fmt == "jpeg" and img.mode == "RGB" and hasattr(img, "info") and img.info.get("transparency") is not None:
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img)
        img = bg

    ext = "jpg" if fmt == "jpeg" else fmt
    orig_name = os.path.splitext(os.path.basename(path))[0]
    filename = f"{orig_name}.{ext}"
    buf = io.BytesIO()

    if fmt == "webp":
        img.save(buf, "WEBP", quality=quality)
    else:
        img.save(buf, "JPEG", quality=quality, optimize=True)

    size_kb = buf.tell() / 1024
    entry = _do_upload(filename, buf.getvalue(), pretty)
    buf.close()

    # Enrich with compression details
    if entry.get("status") == "ok":
        entry["size_kb"] = round(size_kb, 1)
        entry["dimensions"] = f"{img.size[0]}x{img.size[1]}"
        entry["resized"] = resized
        entry["format"] = fmt.upper()
        entry["quality"] = quality
        # Re-construct output to include all fields
        _output(entry, pretty)
    return entry


# ─── Info ────────────────────────────────────────────────────────────────────

def cmd_info(pretty=False):
    files = cmd_list(pretty=False)
    total_size = sum(f.get("size", 0) for f in files) if files else 0

    # Count by date folder
    folders = {}
    for f in files:
        parts = f["path"].split("/")
        if len(parts) >= 3:
            folder = "/".join(parts[:3])
            folders[folder] = folders.get(folder, 0) + 1

    info = {
        "repo": f"{OWNER}/{REPO}",
        "branch": BRANCH,
        "cdn_base": CDN_BASE,
        "image_count": len(files) if files else 0,
        "total_size_bytes": total_size,
        "total_size_human": _human_size(total_size),
        "folders": folders,
    }

    _output(info, pretty, title="图床信息" if pretty else None)
    return info


# ─── Output helpers ──────────────────────────────────────────────────────────

def _output(data, pretty=False, title=None, table_cols=None):
    if pretty:
        if title:
            print(f"\n{'═' * 40}")
            print(f"  {title}")
            print(f"{'═' * 40}")
        if isinstance(data, dict):
            for k, v in data.items():
                print(f"  {k}: {v}")
        elif isinstance(data, list):
            for item in data:
                if table_cols:
                    parts = [str(item.get(c, "")) for c in table_cols]
                    print("  ".join(parts))
                else:
                    print(json.dumps(item, ensure_ascii=False))
        print()
    else:
        print(json.dumps(data, ensure_ascii=False, indent=2))


def _human_size(n):
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} TB"


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="GitHub + jsDelivr Image Hosting CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--pretty", action="store_true", help="Human-readable output")

    sub = parser.add_subparsers(dest="command", required=True)

    p_upload = sub.add_parser("upload", help="Upload image(s)")
    p_upload.add_argument("paths", nargs="+", help="File path(s) to upload")

    p_compress = sub.add_parser("compress", help="Compress (WebP) & upload in one step")
    p_compress.add_argument("path", help="Image file path")
    p_compress.add_argument("--max-dim", type=int, default=1920, help="Max dimension (default: 1920)")
    p_compress.add_argument("--quality", type=int, default=85, help="Compression quality 1-100 (default: 85)")
    p_compress.add_argument("--format", choices=["webp", "jpeg"], default="webp", help="Output format (default: webp)")

    p_list = sub.add_parser("list", help="List all images (shows full paths)")
    p_list.add_argument("--json", action="store_true", help="Force JSON output")

    p_url = sub.add_parser("url", help="Get CDN URL for image path(s)")
    p_url.add_argument("paths", nargs="+", help="Repo path(s) e.g. 2026/07/09/photo.webp")

    p_find = sub.add_parser("find", help="Find image by name (searches all folders)")
    p_find.add_argument("name", help="Filename or keyword to search")

    p_del = sub.add_parser("delete", help="Delete an image by repo path")
    p_del.add_argument("path", help="Repo path e.g. 2026/07/09/photo.webp")

    p_info = sub.add_parser("info", help="Repo info & stats")

    args = parser.parse_args()

    token = get_token()
    if not token:
        print(json.dumps({"error": "No GitHub token found. Set GH_TOKEN env var or run `git credential fill` first."}))
        sys.exit(1)

    if args.command == "upload":
        cmd_upload(args.paths, args.pretty)
    elif args.command == "compress":
        cmd_compress(args.path, args.max_dim, args.quality, args.format, args.pretty)
    elif args.command == "list":
        files = cmd_list()
        if not args.pretty and not args.json:
            print(json.dumps({"count": len(files), "files": files}, ensure_ascii=False, indent=2))
        elif args.pretty:
            _output(
                {"count": len(files), "files": files},
                True, f"共 {len(files)} 张图片",
                table_cols=["path", "size"],
            )
    elif args.command == "url":
        cmd_url(args.paths, args.pretty)
    elif args.command == "find":
        cmd_find(args.name, args.pretty)
    elif args.command == "delete":
        cmd_delete(args.path, args.pretty)
    elif args.command == "info":
        cmd_info(args.pretty)


if __name__ == "__main__":
    main()