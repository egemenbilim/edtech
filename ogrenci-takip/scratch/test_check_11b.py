import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

sample_11b_lines = [
    "TYT ŞUBE NET-PUAN LİSTESİ",
    "Sınav Tarihi - Kodu - Adı   Şube - İl - İlçe   KATILIM",
    "12.09.2026 - 110300 - 11 Hız ve Renk MAARİF0 TYT   İzmit - KOCAELİ - İZMİT   Genel   İl   İlçe   Şube",
    "44   44   44   44",
    "Türkçe   Tarih   Coğrafya   Felsefe   Din Kültürü   Matematik   Geometri   Fizik   Kimya   Biyoloji   Toplam   Puan   Gnl   İl   İlçe   Şb   Snf",
    "D Y N   D Y N   D Y N   D Y N   D Y N   D Y N   D Y N   D Y N   D Y N   D Y N   D Y N   Puan   Sr   Sr   Sr   Sr   Sr",
    "1 39791 HÜSEYİN UMU ARSLAN 1112 B 28 12 25,00 4 1 3,75 5 0 5,00 2 3 1,25 3 2 2,50 31 4 30,00 5 1 4,75 4 3 3,25 5 2 4,50 4 2 3,50 91 30 83,50 382,900 1 1 1 1 1",
    "13 41657 MEHMET EFE EKER 1112 A 19 14 15,50 4 1 3,75 4 1 3,75 3 2 2,50 4 1 3,75 19 6 17,50 2 1 1,75 4 3 3,25 1 6 -0,50 2 2 1,50 62 38 52,50 274,300 13 13 13 13 13"
]

from test_full_universal_parser import parse_exam_lines
res = parse_exam_lines(sample_11b_lines)
print("=== PARSE RESULT FOR 11B (TYT) ===")
print("Tür:", res['sinavTuru'])
print("Adı:", res['sinavAdi'])
print("Tarih:", res['sinavTarihi'])
print("Öğrenci Sayısı:", res['ogrenciSayisi'])
for o in res['ogrenciler']:
    print(f" - {o['sira']}: {o['adSoyad']} ({o['sinif']}, Kit: {o['kitapcik']}) Toplam Net: {o['toplam']['n']} Puan: {o['puan']}")
    print(f"   Mat Net (Mat+Geo): {[d['n'] for d in o['dersSonuclari'] if d['ders'] == 'Matematik'][0]}")
