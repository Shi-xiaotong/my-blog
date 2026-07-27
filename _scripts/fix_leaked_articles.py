import os, re

posts_dir = 'source/_posts/daily-news'
for f in sorted(os.listdir(posts_dir)):
    if not f.endswith('.md'):
        continue
    path = os.path.join(posts_dir, f)
    content = open(path, 'r', encoding='utf-8').read()
    
    markers = ['Wait, constraint', 'Self-Correction', 'Let.s refine', 'I need to ensure', 'Starts directly', 'Constraint 4', 'Constraint 5', 'Constraint 6', '*Topic', 'Check tone']
    has_leak = any(m in content for m in markers)
    
    if has_leak:
        print(f'FIXING: {f}')
        
        desc_m = re.search(r'description: "(.+?)"', content)
        if desc_m:
            old_desc = desc_m.group(1)
            clean_desc = re.sub(r'Wait, constraint.*?\\n|\\*Topic.*?\\*|Check tone.*?$|Self-Correction.*?$', '', old_desc, flags=re.DOTALL).strip()
            if len(clean_desc) > 120:
                clean_desc = clean_desc[:120]
            content = content.replace(f'description: "{old_desc}"', f'description: "{clean_desc}"')
        
        body_start = content.find('---\n\n')
        if body_start > 0:
            body = content[body_start+4:]
        else:
            body = content
        
        lines = body.split('\n')
        cleaned_lines = []
        in_article = False
        for line in lines:
            stripped = line.strip()
            if stripped.startswith('## '):
                in_article = True
            if in_article:
                cleaned_lines.append(line)
            elif not stripped or stripped.startswith('*') or stripped.startswith('Wait') or stripped.startswith('Check') or stripped.startswith('---'):
                continue
            else:
                cleaned_lines.append(line)
        
        new_body = '\n'.join(cleaned_lines)
        
        review_m = re.search(r'\n[-*]\s+(Starts directly|Role:|Core principles|Banned words|Format:|Content:|Each topic|Bold keywords|Lists|Quotes|Separators|Markdown|Pick \d|Rank by|Each paragraph|At least one|I will adjust|Let.s refine|Self-Correction|I need to ensure|Wait,|Constraint \d)', new_body)
        if review_m:
            new_body = new_body[:review_m.start()].strip()
        
        new_body = re.sub(r'\n`[^`]*`\n', '\n', new_body)
        new_body = re.sub(r'\n\*Topic \d+:.*?\*', '', new_body)
        new_body = re.sub(r'\n{3,}', '\n\n', new_body)
        
        new_content = content[:body_start+4] + new_body
        open(path, 'w', encoding='utf-8').write(new_content)
        print(f'  OK')
    else:
        print(f'  OK: {f}')