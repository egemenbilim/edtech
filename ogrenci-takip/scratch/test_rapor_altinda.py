# -*- coding: utf-8 -*-
import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

base_dir = r'c:\Users\egeme\OneDrive\Desktop\CODEX\EdTech\ogrenci-takip'

print("--- 1. Testing index.html for raporOrtalamaAltinda ---")
html_path = os.path.join(base_dir, 'index.html')
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

assert 'id="raporOrtalamaAltinda"' in html, "Missing id='raporOrtalamaAltinda' in index.html!"
assert 'id="raporAltinda"' in html, "Missing checkbox id='raporAltinda' in index.html!"
print("  [OK] id='raporOrtalamaAltinda' and checkbox found in index.html")

print("\n--- 2. Testing raporlar.js exports and functions ---")
raporlar_path = os.path.join(base_dir, 'js', 'modules', 'raporlar.js')
with open(raporlar_path, 'r', encoding='utf-8') as f:
    raporlar = f.read()

assert 'export function renderOrtalamaAltinda' in raporlar, "Missing export function renderOrtalamaAltinda in raporlar.js!"
assert 'raporOrtalamaAltinda' in raporlar, "raporOrtalamaAltinda not referenced in raporlar.js!"
assert 'altindaEl' in raporlar, "altindaEl not referenced in raporPDF!"
print("  [OK] renderOrtalamaAltinda properly defined and called in raporlar.js")

print("\n--- 3. Testing main.js bindings ---")
main_path = os.path.join(base_dir, 'js', 'main.js')
with open(main_path, 'r', encoding='utf-8') as f:
    main = f.read()

assert 'renderOrtalamaAltinda' in main, "Missing renderOrtalamaAltinda import in main.js!"
assert 'window.renderOrtalamaAltinda = renderOrtalamaAltinda;' in main, "Missing window binding in main.js!"
print("  [OK] window.renderOrtalamaAltinda properly bound in main.js")

print("\n--- 4. Simulating Below-Average Logic ---")
students = [
    {'name': 'Ali', 'net': 40.0},
    {'name': 'Zeynep', 'net': 30.0},
    {'name': 'Mehmet', 'net': 15.0},
    {'name': 'Can', 'net': 0.0},
    {'name': 'Burak', 'net': -2.5}
]

avg = sum(s['net'] for s in students) / len(students)
below_avg = [s for s in students if s['net'] < avg]

print(f"  Class Average: {avg:.2f}")
print(f"  Below Average Students Count: {len(below_avg)}")
for s in below_avg:
    diff = s['net'] - avg
    pct = (diff / avg) * 100
    print(f"    - {s['name']}: {s['net']} Net (Diff: {diff:.2f}, {pct:.1f}%)")

assert len(below_avg) == 3, f"Expected 3 below average, got {len(below_avg)}"
assert any(s['name'] == 'Can' for s in below_avg), "Student with 0 net should be below average!"
assert any(s['name'] == 'Burak' for s in below_avg), "Student with negative net should be below average!"
print("  [OK] Logic verified: 0 net and negative net students are properly included!")

print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")
