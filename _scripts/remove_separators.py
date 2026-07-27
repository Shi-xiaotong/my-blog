"""Remove ALL --- lines from daily-news article bodies and add one at the very end."""
import os, re

posts_dir = 'source/_posts/daily-news'
for f in sorted(os.listdir(posts_dir)):
    if not f.endswith('.md'):
        continue
    path = os.path.join(posts_dir, f)
    content = open(path, 'r', encoding='utf-8').read()
    
    parts = content.split('---\n\n', 1)
    if len(parts) < 2:
        continue
    
    frontmatter = parts[0] + '---\n\n'
    body = parts[1]
    
    # Remove all standalone --- lines from body
    lines = body.split('\n')
    new_lines = [line for line in lines if line.strip() != '---']
    
    new_body = '\n'.join(new_lines).strip()
    new_body = re.sub(r'\n{3,}', '\n\n', new_body)
    
    new_content = frontmatter + new_body + '\n'
    if new_content != content:
        open(path, 'w', encoding='utf-8').write(new_content)
        print(f'FIXED: {f}')
    else:
        print(f'  OK: {f}')

print('Done')