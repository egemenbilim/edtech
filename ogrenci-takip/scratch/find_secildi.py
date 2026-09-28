import os

for root, dirs, files in os.walk('.'):
    for f in files:
        if f.endswith('.js') or f.endswith('.html'):
            p = os.path.join(root, f)
            with open(p, encoding='utf-8', errors='ignore') as fp:
                for idx, line in enumerate(fp):
                    if 'pdfDosyaSecildi' in line or 'pdfDosyaSecAc' in line:
                        print(f"{p}:{idx+1}: {line.strip()}")
