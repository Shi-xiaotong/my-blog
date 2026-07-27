import os, re

posts_dir = 'source/_posts/daily-news'
for f in sorted(os.listdir(posts_dir)):
    if not f.endswith('.md'):
        continue
    path = os.path.join(posts_dir, f)
    content = open(path, 'r', encoding='utf-8').read()
    
    # Check if description has leaked thinking
    desc_m = re.search(r'description: "(.+?)"', content)
    if desc_m:
        desc = desc_m.group(1)
        markers = ['Wait, constraint', 'Self-Correction', 'Constraint 4', 'Constraint 5', 'Constraint 6', '*Topic', 'Check tone', 'Let.s refine', 'I need to ensure']
        if any(m in desc for m in markers):
            print(f'FIX description: {f}')
            # Use the first real paragraph from body as description
            body_start = content.find('---\n\n')
            body = content[body_start+4:] if body_start > 0 else content
            lines = body.split('\n')
            for line in lines:
                stripped = line.strip()
                if stripped and not stripped.startswith('#') and not stripped.startswith('*') and not stripped.startswith('`') and stripped != '<!-- more -->' and not stripped.startswith('---'):
                    new_desc = stripped[:120].replace('"', "'")
                    content = content.replace(f'description: "{desc}"', f'description: "{new_desc}"')
                    print(f'  new: {new_desc[:60]}...')
                    break
    
    open(path, 'w', encoding='utf-8').write(content)

print('Done')