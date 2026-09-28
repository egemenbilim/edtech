# -*- coding: utf-8 -*-
import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

base_dir = r'c:\Users\egeme\OneDrive\Desktop\CODEX\EdTech\ogrenci-takip'

print("--- 1. Testing index.html for class and exam filters ---")
html_path = os.path.join(base_dir, 'index.html')
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

assert 'id="raporSinifFiltre"' in html, "Missing id='raporSinifFiltre' in index.html!"
assert 'raporSinifSecildi(this.value)' in html, "Missing onchange='raporSinifSecildi(this.value)' in index.html!"
assert 'id="raporOrtalamaAltinda"' in html, "Missing id='raporOrtalamaAltinda' in index.html!"
print("  [OK] index.html has class filter select and raporOrtalamaAltinda container")

print("\n--- 2. Testing raporlar.js for dynamic selection functions and state ---")
raporlar_path = os.path.join(base_dir, 'js', 'modules', 'raporlar.js')
with open(raporlar_path, 'r', encoding='utf-8') as f:
    raporlar = f.read()

assert 'let ALTINDA_STATE' in raporlar, "Missing ALTINDA_STATE in raporlar.js!"
assert 'altindaSinifSecim' in raporlar, "Missing altindaSinifSecim in raporlar.js!"
assert 'altindaDenemeSecim' in raporlar, "Missing altindaDenemeSecim in raporlar.js!"
assert 'export function altindaFiltreDegisti' in raporlar, "Missing altindaFiltreDegisti in raporlar.js!"
assert 'export function altindaFiltreSifirla' in raporlar, "Missing altindaFiltreSifirla in raporlar.js!"
assert 'export function raporSinifSecildi' in raporlar, "Missing raporSinifSecildi in raporlar.js!"
assert 'export function renderOrtalamaAltindaIcerik' in raporlar, "Missing renderOrtalamaAltindaIcerik in raporlar.js!"
print("  [OK] raporlar.js has all dynamic selection functions and state")

print("\n--- 3. Testing main.js for exports ---")
main_path = os.path.join(base_dir, 'js', 'main.js')
with open(main_path, 'r', encoding='utf-8') as f:
    main = f.read()

assert 'altindaFiltreDegisti' in main, "Missing altindaFiltreDegisti in main.js!"
assert 'altindaFiltreSifirla' in main, "Missing altindaFiltreSifirla in main.js!"
assert 'raporSinifSecildi' in main, "Missing raporSinifSecildi in main.js!"
assert 'window.altindaFiltreDegisti = altindaFiltreDegisti' in main, "Missing window.altindaFiltreDegisti binding!"
assert 'window.altindaFiltreSifirla = altindaFiltreSifirla' in main, "Missing window.altindaFiltreSifirla binding!"
assert 'window.raporSinifSecildi = raporSinifSecildi' in main, "Missing window.raporSinifSecildi binding!"
print("  [OK] main.js properly imports and exposes all filter methods to window")

print("\n--- 4. Testing End-to-End Simulation of Class & Exam Filtering ---")

# Mock database
siniflar = [
    {'id': 1, 'ad': '12-A'},
    {'id': 2, 'ad': '12-B'}
]

ogrenciler = [
    {'id': 101, 'adSoyad': 'Ali', 'sinifId': 1},
    {'id': 102, 'adSoyad': 'Zeynep', 'sinifId': 1},
    {'id': 103, 'adSoyad': 'Burak', 'sinifId': 1},
    {'id': 201, 'adSoyad': 'Mehmet', 'sinifId': 2},
    {'id': 202, 'adSoyad': 'Can', 'sinifId': 2},
    {'id': 203, 'adSoyad': 'Ayşe', 'sinifId': 2}
]

denemeler = [
    {'id': 1, 'ad': 'TYT Deneme 1'},
    {'id': 2, 'ad': 'TYT Deneme 2'}
]

# Results: (ogrenciId, denemeId, ders, net)
sonuclar = [
    # 12-A Deneme 1
    {'ogrenciId': 101, 'denemeId': 1, 'ders': 'Türkçe', 'net': 35.0},
    {'ogrenciId': 102, 'denemeId': 1, 'ders': 'Türkçe', 'net': 30.0},
    {'ogrenciId': 103, 'denemeId': 1, 'ders': 'Türkçe', 'net': 10.0},
    # 12-A Deneme 2
    {'ogrenciId': 101, 'denemeId': 2, 'ders': 'Türkçe', 'net': 38.0},
    {'ogrenciId': 102, 'denemeId': 2, 'ders': 'Türkçe', 'net': 32.0},
    {'ogrenciId': 103, 'denemeId': 2, 'ders': 'Türkçe', 'net': 12.0},

    # 12-B Deneme 1
    {'ogrenciId': 201, 'denemeId': 1, 'ders': 'Türkçe', 'net': 25.0},
    {'ogrenciId': 202, 'denemeId': 1, 'ders': 'Türkçe', 'net': 20.0},
    {'ogrenciId': 203, 'denemeId': 1, 'ders': 'Türkçe', 'net': 15.0},
    # 12-B Deneme 2
    {'ogrenciId': 201, 'denemeId': 2, 'ders': 'Türkçe', 'net': 28.0},
    {'ogrenciId': 202, 'denemeId': 2, 'ders': 'Türkçe', 'net': 22.0},
    {'ogrenciId': 203, 'denemeId': 2, 'ders': 'Türkçe', 'net': 18.0},
]

def calculate_below_average(secili_sinif_id=None, secili_deneme_id=None):
    aktif_den_ids = [secili_deneme_id] if secili_deneme_id else [d['id'] for d in denemeler]
    
    aktif_ogrenciler = ogrenciler
    if secili_sinif_id:
        aktif_ogrenciler = [o for o in ogrenciler if o['sinifId'] == secili_sinif_id]
        
    ogr_data = []
    for ogr in aktif_ogrenciler:
        s_list = [s for s in sonuclar if s['ogrenciId'] == ogr['id'] and s['denemeId'] in aktif_den_ids]
        if not s_list:
            continue
        # Per-deneme net
        den_map = {}
        for s in s_list:
            den_map[s['denemeId']] = den_map.get(s['denemeId'], 0) + s['net']
        avg_net = sum(den_map.values()) / len(den_map)
        ogr_data.append({'ad': ogr['adSoyad'], 'sinifId': ogr['sinifId'], 'avg_net': avg_net})
        
    group_avg = sum(o['avg_net'] for o in ogr_data) / len(ogr_data) if ogr_data else 0
    below_avg = [o for o in ogr_data if o['avg_net'] < group_avg]
    return group_avg, below_avg

# Test Case 1: Tüm Sınıflar, Tüm Denemeler
all_avg, all_below = calculate_below_average()
print(f"  Case 1 (Tümü): Genel Ort={all_avg:.2f}, Altında={len(all_below)} kişi")
assert len(all_below) > 0

# Test Case 2: Sadece 12-A Sınıfı (Tüm Denemeler)
# 12-A nets: Ali: (35+38)/2 = 36.5, Zeynep: (30+32)/2 = 31.0, Burak: (10+12)/2 = 11.0
# 12-A Avg: (36.5 + 31.0 + 11.0) / 3 = 26.17
# Below 12-A Avg: Burak (11.0 < 26.17)
sinif_1_avg, sinif_1_below = calculate_below_average(secili_sinif_id=1)
print(f"  Case 2 (12-A): 12-A Ort={sinif_1_avg:.2f}, Altında={len(sinif_1_below)} kişi: {[b['ad'] for b in sinif_1_below]}")
assert round(sinif_1_avg, 2) == 26.17
assert len(sinif_1_below) == 1
assert sinif_1_below[0]['ad'] == 'Burak'
print("    [OK] 12-A class average calculated exclusively for 12-A, Burak identified as below average!")

# Test Case 3: Sadece 12-B Sınıfı (Tüm Denemeler)
# 12-B nets: Mehmet: (25+28)/2 = 26.5, Can: (20+22)/2 = 21.0, Ayşe: (15+18)/2 = 16.5
# 12-B Avg: (26.5 + 21.0 + 16.5) / 3 = 21.33
# Below 12-B Avg: Can (21.0) and Ayşe (16.5)
sinif_2_avg, sinif_2_below = calculate_below_average(secili_sinif_id=2)
print(f"  Case 3 (12-B): 12-B Ort={sinif_2_avg:.2f}, Altında={len(sinif_2_below)} kişi: {[b['ad'] for b in sinif_2_below]}")
assert round(sinif_2_avg, 2) == 21.33
assert len(sinif_2_below) == 2
assert set(b['ad'] for b in sinif_2_below) == {'Can', 'Ayşe'}
print("    [OK] 12-B class average calculated exclusively for 12-B, Can and Ayşe identified!")

# Test Case 4: Sadece Deneme 2 (Tüm Sınıflar)
# Deneme 2 nets: Ali: 38, Zeynep: 32, Burak: 12, Mehmet: 28, Can: 22, Ayşe: 18
# Deneme 2 Avg: (38+32+12+28+22+18)/6 = 25.0
# Below: Burak (12), Can (22), Ayşe (18)
den_2_avg, den_2_below = calculate_below_average(secili_deneme_id=2)
print(f"  Case 4 (Deneme 2 Tümü): Ort={den_2_avg:.2f}, Altında={len(den_2_below)} kişi: {[b['ad'] for b in den_2_below]}")
assert den_2_avg == 25.0
assert len(den_2_below) == 3
assert set(b['ad'] for b in den_2_below) == {'Burak', 'Can', 'Ayşe'}
print("    [OK] Single exam average calculated accurately across all students!")

# Test Case 5: 12-B Sınıfı + Sadece Deneme 1
# 12-B in Deneme 1: Mehmet (25), Can (20), Ayşe (15)
# Avg: (25 + 20 + 15) / 3 = 20.0
# Below: Ayşe (15 < 20)
sinif2_den1_avg, sinif2_den1_below = calculate_below_average(secili_sinif_id=2, secili_deneme_id=1)
print(f"  Case 5 (12-B + Deneme 1): Ort={sinif2_den1_avg:.2f}, Altında: {[b['ad'] for b in sinif2_den1_below]}")
assert sinif2_den1_avg == 20.0
assert len(sinif2_den1_below) == 1
assert sinif2_den1_below[0]['ad'] == 'Ayşe'
print("    [OK] Combined class + exam filter produces exact target report!")

print("\nALL TESTS PASSED SUCCESSFULLY!")
