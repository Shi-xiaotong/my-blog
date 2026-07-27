import re

with open('_scripts/generators/__init__.py', 'r') as f:
    content = f.read()

# Fix indentation issue
content = content.replace(
    '        review_m = re.search',
    '    review_m = re.search'
)

# Add Wait, and Constraint patterns to the safety net regex
old_pattern = "Self-Correction)', content)"
new_pattern = "Self-Correction|Wait,|Constraint \\\\d)', content)"
content = content.replace(old_pattern, new_pattern)

with open('_scripts/generators/__init__.py', 'w') as f:
    f.write(content)

print('Fixed')