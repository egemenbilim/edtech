with open('index.html', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'input' in line.lower() and ('file' in line.lower() or 'pdf' in line.lower()):
            print(f"{i+1}: {line.strip()}")
