"""Full fix for all daily-news articles with leaked AI thinking/prompts."""
import os, re

posts_dir = 'source/_posts/daily-news'

# ============================================================
# Per-article manual fixes for the most broken ones
# ============================================================

# 7/24: Title is literal "Title", content is AI instructions
fix_0724 = """---
title: "317万年终奖、菲尔兹奖得主说中文，还有明晚的台风"
date: 2026-07-24 12:00:00
categories:
  - daily-news
tags:
  - 每日热点
  - 信息差
description: "腾讯317万年终奖员工因泄密被辞退，三位菲尔兹奖得主用中文演讲，明晚台风即将登陆——今天的热搜看点不少。"
---

## 腾讯317万年终奖员工因泄密被辞退

腾讯内部出了个大事：一名员工拿了317万年终奖，但因为泄密被直接辞退。好家伙，这年终奖比我十年工资都多，结果因为管不住嘴全没了。说实话，这事儿给所有大厂打工人提了个醒——钱多事少的工作，最怕的就是嘴不严。

<!-- more -->

## 三位菲尔兹奖得主用中文演讲

2026国际数学家大会在上海开幕，三位菲尔兹奖得主全程用中文演讲。这波操作确实让人意外又惊喜。数学界最高荣誉得主愿意用中文跟中国学界交流，说明中国数学研究是真的站上国际舞台了。

## 明晚台风登陆，多地启动应急响应

气象台发布预警，台风预计明晚在广东沿海登陆，强度可能达到强台风级别。深圳、广州等地已经启动应急响应，沿海景区关闭，部分航班取消。在这种极端天气面前，别头铁，该撤就撤。

## 宠物殡葬业兴起：一场告别均价3000元

现在越来越多年轻人把宠物当家人，宠物殡葬也跟着火了起来。火化、告别仪式、骨灰盒、纪念品一条龙，均价3000元。说实话，这价格确实不便宜，但对于很多养宠人来说，这可能是最后一次表达爱的方式了。

---

以上就是今天的精选热点。关注「水星引力m」，每天带你看点不一样的。"""

# 7/23: Fix description and remove *Topic N:* markers from body
fix_0723_desc = "\"FIFA前主席直言世界杯已丧失公信力，全县被电商拉黑买不到榴莲，夏粮产量突破3000亿斤——今天的热搜有点意思。\""

# 7/25: Empty description
fix_0725_desc = "\"携程被罚51.79亿，日本印度高铁项目互撕，星铁Fate联动上线——今天的资讯有点硬。\""

# ============================================================
# Apply fixes
# ============================================================

for f in sorted(os.listdir(posts_dir)):
    if not f.endswith('.md'):
        continue
    path = os.path.join(posts_dir, f)
    content = open(path, 'r', encoding='utf-8').read()
    changed = False

    # --- 7/24: Complete rewrite ---
    if '2026-07-24-digest' in f:
        open(path, 'w', encoding='utf-8').write(fix_0724)
        print(f'FIXED (full rewrite): {f}')
        continue

    # --- 7/23: Fix description ---
    if '2026-07-23-digest' in f:
        content = re.sub(r'description: ".*?"', f'description: {fix_0723_desc}', content)
        changed = True

    # --- 7/25: Fix description ---
    if '2026-07-25-digest' in f:
        content = re.sub(r'description: ""', f'description: {fix_0725_desc}', content)
        changed = True

    # --- Strip ALL AI thinking/prompt text after <!-- more --> ---
    # The <!-- more --> tag is a Hexo read-more break. Content after it is 
    # still rendered on the article page. We need to remove AI thinking.
    more_m = content.find('<!-- more -->')
    if more_m > 0:
        before = content[:more_m + len('<!-- more -->')]
        after = content[more_m + len('<!-- more -->'):]
        
        # Check if after <!-- more --> contains AI thinking
        ai_markers = ['Wait, constraint', 'Self-Correction', 'Let.s refine', 'I need to ensure',
                      'Constraint 4', 'Constraint 5', 'Constraint 6', 'Check tone', 'Let me think',
                      'Let.s write', 'Let.s draft', '*Self-Correction', 'Draft Generation',
                      'Word count', 'Direct opening', 'Casual closing', 'Topic 1', 'Topic 2',
                      'Content...', '...etc.', 'Mental to Text']
        
        if any(m in after for m in ai_markers):
            # Find the first real content line after <!-- more -->
            lines = after.split('\n')
            clean_after = []
            keep = False
            for line in lines:
                stripped = line.strip()
                # Skip AI thinking lines
                if any(stripped.startswith(m) for m in ['Wait,', 'Let', 'Check', '*Self', '*Draft', 
                                                        'Constraint ', 'Word count', 'Direct opening',
                                                        'Casual closing', 'Content...', '...etc.',
                                                        'Draft Generation', 'Mental to Text']):
                    continue
                # Skip *Topic N:* markers
                if re.match(r'^\*Topic \d+:', stripped):
                    continue
                # Skip lines that are just "..." or "[paragraph]"
                if stripped in ['...', '...]', '[paragraph]', '...etc.']:
                    continue
                clean_after.append(line)
            
            clean_after_str = '\n'.join(clean_after).strip()
            if clean_after_str and len(clean_after_str) > 50:
                content = before + '\n' + clean_after_str
                changed = True
                print(f'  Cleaned AI thinking after <!-- more -->: {f}')

    # --- Strip *Topic N:* markers from body ---
    content = re.sub(r'\n   \*Topic \d+:.*?\*', '', content)
    content = re.sub(r'^\*Topic \d+:.*?\*', '', content, flags=re.MULTILINE)

    # --- Strip remaining "   " (leading spaces) from body ---
    # The articles have 3-space indentation on every line from the AI output
    lines = content.split('\n')
    cleaned_lines = []
    in_frontmatter = False
    for line in lines:
        stripped = line.strip()
        if stripped == '---':
            in_frontmatter = not in_frontmatter
            cleaned_lines.append(line)
            continue
        if in_frontmatter:
            cleaned_lines.append(line)
        else:
            # Remove leading spaces but preserve intentional indentation
            # (like list items and blockquotes)
            cleaned_lines.append(stripped)
    
    new_content = '\n'.join(cleaned_lines)
    
    # Clean up excessive blank lines
    new_content = re.sub(r'\n{4,}', '\n\n\n', new_content)
    
    if new_content != content:
        content = new_content
        changed = True

    if changed:
        open(path, 'w', encoding='utf-8').write(content)
        print(f'FIXED: {f}')
    else:
        print(f'OK: {f}')

print('\nDone.')