import pypdf
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
pdf_path = os.path.expanduser('~/Downloads/8d deneme sonuç.pdf')
print("Reading:", pdf_path)
reader = pypdf.PdfReader(pdf_path)
print("Pages:", len(reader.pages))

for idx, page in enumerate(reader.pages):
    print(f"\n=== PAGE {idx+1} ===")
    text = page.extract_text()
    lines = text.split("\n")
    print(f"Total lines: {len(lines)}")
    for l in lines[:40]:
        print(repr(l))
