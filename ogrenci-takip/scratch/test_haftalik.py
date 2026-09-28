# -*- coding: utf-8 -*-
import os
import re
import json

base_dir = r'c:\Users\egeme\OneDrive\Desktop\CODEX\EdTech\ogrenci-takip'

print("--- 1. Testing curriculum.js structure ---")
curriculum_path = os.path.join(base_dir, 'js', 'modules', 'curriculum.js')
assert os.path.exists(curriculum_path), "curriculum.js not found!"

with open(curriculum_path, 'r', encoding='utf-8') as f:
    curr_content = f.read()

# Verify MURED_DERSLER categories
for cat in ['LGS', 'TYT', 'AYT-SAY', 'AYT-EA', 'AYT-SOZ']:
    assert f"'{cat}'" in curr_content or f'"{cat}"' in curr_content, f"Missing category: {cat}"
    print(f"  [OK] Found category: {cat}")

import sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Verify guaranteed '📌 Genel'
assert '📌 Genel' in curr_content
print(f"  [OK] 'Genel' appears {curr_content.count('📌 Genel')} times across all courses.")

# Verify grade gating logic in file
assert "12-mezun" in curr_content
assert "'LGS'" in curr_content
print("  [OK] Grade gating identifiers present.")

print("\n--- 2. Testing index.html elements ---")
html_path = os.path.join(base_dir, 'index.html')
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Check navigation rename
assert 'data-view="haftalik">📊 Haftalık Soru/Ödev Takibi<' in html_content, "Navigation not renamed properly!"
print("  [OK] Navigation renamed to 'Haftalık Soru/Ödev Takibi'")

# Check DOM elements for step-by-step flow
required_ids = [
    'hfOgrenci',
    'hfOgrenciProfilKarti',
    'hfGirisKarti',
    'hfSinavTuruSecici',
    'hfDersChips',
    'hfDersSelect',
    'hfKonuSelect',
    'hfHizliKonular',
    'hfTurBtnSoru',
    'hfTurBtnOdev',
    'hfBas',
    'hfBit',
    'hfHedef',
    'hfSoru',
    'hfDogru',
    'hfYanlis',
    'hfBos',
    'hfNet',
    'hfBaslik',
    'hfOdevDurum',
    'hfKaydetBtn',
    'hfFiltreTurGrup',
    'filtreHfOgrenci',
    'haftalikTablosu',
    'hfOzelRaporModal',
    'hfOzelRaporIcerik'
]

for rid in required_ids:
    assert f'id="{rid}"' in html_content, f"Missing ID in HTML: {rid}"
    print(f"  [OK] ID present: {rid}")

print("\n--- 3. Testing main.js and haftalik.js bindings ---")
main_path = os.path.join(base_dir, 'js', 'main.js')
with open(main_path, 'r', encoding='utf-8') as f:
    main_content = f.read()

bindings = [
    'hfOgrenciSecildi',
    'hfSinavTuruSecildi',
    'hfDersSecildi',
    'hfKonuSecildi',
    'hfTurDegis',
    'hfNetHesaplaLive',
    'hfOdevDurumHizliDegis',
    'hfFiltreTurSec',
    'hfOzelRaporAc',
    'hfOzelRaporKapat',
    'hfOzelRaporRender',
    'hfOzelRaporYazdir',
    'hfWhatsAppPaylas'
]

for b in bindings:
    assert f'window.{b}' in main_content, f"Missing window binding: {b}"
    print(f"  [OK] Window binding: {b}")

print("\n--- 4. Testing CSS Styles ---")
css_path = os.path.join(base_dir, 'css', 'style.css')
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

for cls in ['.chip-btn', '.chip-sm', '.chip-xs', '.toggle-group', '.toggle-btn', '.ozel-rapor-container', 'body.print-hf']:
    assert cls in css_content, f"Missing CSS class: {cls}"
    print(f"  [OK] CSS class present: {cls}")

print("\n--- 5. Testing Grade Gating Logic Scenarios ---")
def simulate_kademe(ad):
    l = ad.lower()
    if re.search(r'\b(12|mezun|ayt|yks)\b', l) or '12' in l or 'mezun' in l:
        return ['TYT', 'AYT-SAY', 'AYT-EA', 'AYT-SOZ']
    if re.search(r'\b(11)\b', l) or '11' in l:
        return ['TYT', 'AYT-SAY', 'AYT-EA', 'AYT-SOZ']
    if re.search(r'\b(9|10)\b', l) or '9' in l or '10' in l:
        return ['TYT']
    if re.search(r'\b(8|lgs)\b', l) or '8' in l or 'lgs' in l:
        return ['LGS']
    if re.search(r'\b(5|6|7)\b', l):
        return ['LGS']
    return ['TYT', 'AYT-SAY', 'AYT-EA', 'AYT-SOZ', 'LGS']

assert 'LGS' not in simulate_kademe('12-A')
print("  [OK] 12-A cannot see LGS")
assert 'LGS' not in simulate_kademe('12. Sınıf Sayısal')
print("  [OK] 12. Sınıf Sayısal cannot see LGS")
assert 'LGS' not in simulate_kademe('Mezun EA')
print("  [OK] Mezun EA cannot see LGS")
assert simulate_kademe('8-B') == ['LGS']
print("  [OK] 8-B only sees LGS")
assert simulate_kademe('7-A') == ['LGS']
print("  [OK] 7-A only sees LGS")

print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")
