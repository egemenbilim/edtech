import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def parse_exam_lines(lines):
    sinavTuru = 'TYT'
    sinavAdi = ''
    sinavTarihi = ''
    subeKurum = ''

    # 1. Detect headers
    for i in range(min(len(lines), 30)):
        l = lines[i]
        if re.search(r'\bLGS\b', l, re.IGNORECASE):
            sinavTuru = 'LGS'
        elif re.search(r'\bAYT\b', l, re.IGNORECASE):
            sinavTuru = 'AYT'
        elif re.search(r'\bTYT\b', l, re.IGNORECASE) and sinavTuru != 'LGS':
            sinavTuru = 'TYT'

        # Date: GG.AA.YYYY
        tm = re.search(r'(\d{1,2})\.(\d{1,2})\.(\d{4})', l)
        if tm and not sinavTarihi:
            sinavTarihi = f"{tm.group(3)}-{tm.group(2).zfill(2)}-{tm.group(1).zfill(2)}"

        # Exam Name: e.g. "12.09.2026 - 8010 - TDP HBS BİRLEŞİK" or "12.09.2026 - 110300 - 11 Hız ve Renk MAARİF0 TYT"
        nm = re.search(r'\d{1,2}\.\d{1,2}\.\d{4}\s*-\s*\d+\s*-\s*([^\t\n\r]+)', l)
        if nm and not sinavAdi:
            raw_ad = nm.group(1).strip()
            # Clean off trailing city/district or score numbers
            raw_ad = re.split(r'\s+(?:İzmit|KOCAELİ|Şube|\d{2}\s+\d{2})|\bİzmit\b', raw_ad)[0].strip()
            sinavAdi = raw_ad

    if not sinavAdi:
        sinavAdi = f"{sinavTuru} Deneme Sınavı"

    # 2. Parse student rows
    ogrenciler = []

    for line in lines:
        raw = line.strip()
        if not raw:
            continue

        # Universal student row regex
        # Sıra No (optional) + Öğr No (2-10 digits) + Ad Soyad + Sınıf + Kitapçık + Numbers
        m = re.match(r'^\s*(?:(\d+)\s+)?(\d{2,10})\s+(.+?)\s+([0-9A-Za-z\/\-\*]+)\s+([A-Za-z0-9\-]{1,4})\s+([\d\,\.\-\s]+)$', raw)
        if not m:
            m = re.match(r'^\s*(?:(\d+)\s+)?(\d{2,10})\s+(.+?)\s+([0-9A-Za-z\/\-\*]+)\s+([\d\,\.\-\s]+)$', raw)
            if not m:
                continue
            sira = int(m.group(1) or len(ogrenciler) + 1)
            ogrNo = m.group(2).strip()
            adSoyad = m.group(3).strip()
            pdfSinif = m.group(4).strip()
            kitapcik = '-'
            rest = m.group(5).strip()
        else:
            sira = int(m.group(1) or len(ogrenciler) + 1)
            ogrNo = m.group(2).strip()
            adSoyad = m.group(3).strip()
            pdfSinif = m.group(4).strip()
            kitapcik = m.group(5).strip()
            rest = m.group(6).strip()

        # Parse numbers
        tokens = rest.replace(',', '.').split()
        nums = []
        for t in tokens:
            try:
                nums.append(float(t))
            except ValueError:
                pass

        if len(nums) < 15:
            continue

        def trip(idx):
            pos = idx * 3
            if pos + 2 < len(nums):
                return {
                    'd': round(nums[pos]),
                    'y': round(nums[pos + 1]),
                    'n': round(nums[pos + 2] * 100) / 100
                }
            return {'d': 0, 'y': 0, 'n': 0}

        dersSonuclari = []
        toplam = {'d': 0, 'y': 0, 'n': 0}
        puan = 0

        if sinavTuru == 'LGS':
            turkce = trip(0)
            inkilap = trip(1)
            din = trip(2)
            ing = trip(3)
            mat = trip(4)
            fen = trip(5)
            toplam = trip(6)
            puan = nums[21] if len(nums) > 21 else 0

            dersSonuclari = [
                {'ders': 'Türkçe', **turkce},
                {'ders': 'İnkılap Tarihi', **inkilap},
                {'ders': 'Din Kültürü', **din},
                {'ders': 'İngilizce', **ing},
                {'ders': 'Matematik', **mat},
                {'ders': 'Fen Bilimleri', **fen}
            ]
        elif sinavTuru == 'TYT':
            turkce = trip(0)
            tarih = trip(1)
            cografya = trip(2)
            felsefe = trip(3)
            din = trip(4)
            mat = trip(5)
            geo = trip(6)
            fizik = trip(7)
            kimya = trip(8)
            biyoloji = trip(9)
            toplam = trip(10)
            puan = nums[33] if len(nums) > 33 else 0

            matToplam = {
                'd': mat['d'] + geo['d'],
                'y': mat['y'] + geo['y'],
                'n': round((mat['n'] + geo['n']) * 100) / 100
            }

            dersSonuclari = [
                {'ders': 'Türkçe', **turkce},
                {'ders': 'Tarih', **tarih},
                {'ders': 'Coğrafya', **cografya},
                {'ders': 'Felsefe', **felsefe},
                {'ders': 'Din Kültürü', **din},
                {'ders': 'Matematik', **matToplam},
                {'ders': 'Fizik', **fizik},
                {'ders': 'Kimya', **kimya},
                {'ders': 'Biyoloji', **biyoloji}
            ]

        ogrenciler.append({
            'sira': sira,
            'ogrNo': ogrNo,
            'adSoyad': adSoyad,
            'sinif': pdfSinif,
            'kitapcik': kitapcik,
            'dersSonuclari': dersSonuclari,
            'toplam': toplam,
            'puan': puan
        })

    return {
        'sinavTuru': sinavTuru,
        'sinavAdi': sinavAdi,
        'sinavTarihi': sinavTarihi,
        'ogrenciSayisi': len(ogrenciler),
        'ogrenciler': ogrenciler
    }

# Test with 8D sample
sample_8d_lines = [
    'LGS ŞUBE NET-PUAN LİSTESİ',
    'Sınav Tarihi - Kodu - Adı   Şube - İl - İlçe   KATILIM',
    '12.09.2026 - 8010 - TDP HBS BİRLEŞİK   İzmit - KOCAELİ - İZMİT   Genel   İl   İlçe   Şube',
    '44   44   44   44',
    'Sözel   Sayısal',
    'Öğr No   Ad Soyad   Sınıf   Kit   Türkçe   Sosyal / Hayat   Din Kült.   İngilizce   Matematik   Fen Bil.   Toplam   LGS   Gnl   İl   İlçe   Şb   Snf',
    'D   Y   N   D   Y   N   D   Y   N   D   Y   N   D   Y   N   D   Y   N   D   Y   N   Puan   Sr   Sr   Sr   Sr   Sr',
    '1   39233   RIFAT AL YEŞİLYURT   804   AA   14   6   12,00   7   2   6,33   9   1   8,67   8   2   7,33   6   4   4,67   11   7   8,67   55   22   47,67   333,825   27   27   27   27   1',
    '2   43366   ELA AKBAŞ   804   AA   14   2   13,33   8   2   7,33   10   0   10,00   9   1   8,67   3   1   2,67   8   1   7,67   52   7   49,67   331,796   28   28   28   28   2',
    '3   39735   DURU KILIÇ   804   BB   16   4   14,67   8   2   7,33   8   2   7,33   8   2   7,33   4   3   3,00   10   8   7,33   54   21   47,00   330,458   29   29   29   29   3',
    '4   39863   ALİ AR KILIÇARSLAN   804   AA   12   8   9,33   9   1   8,67   10   0   10,00   8   2   7,33   5   2   4,33   10   8   7,33   54   21   47,00   322,022   30   30   30   30   4',
    '5   44730   HAMZA YAMAN   804   BB   11   9   8,00   9   1   8,67   9   1   8,67   8   2   7,33   6   9   3,00   10   9   7,00   53   31   42,67   306,046   32   32   32   32   5',
    '6   44026   ALİ ASAF ÖZDEMİR   804   BB   9   8   6,33   9   1   8,67   7   3   6,00   5   5   3,33   8   8   5,33   10   9   7,00   48   34   36,67   299,146   33   33   33   33   6',
    '7   41641   HÜSEYİN TUG TUNÇEL   804   BB   11   8   8,33   7   3   6,00   5   4   3,67   4   4   2,67   6   4   4,67   9   6   7,00   42   29   32,33   294,500   34   34   34   34   7',
    '8   42909   EMİRHAN ÖZÇELİK   804   AA   14   5   12,33   6   4   4,67   7   2   6,33   5   3   4,00   4   9   1,00   7   11   3,33   43   34   31,67   283,798   35   35   35   35   8',
    '9   39836   ADA BENSEL   804   AA   12   4   10,67   9   0   9,00   8   0   8,00   2   0   2,00   0   0   0,00   4   3   3,00   35   7   32,67   277,354   36   36   36   36   9'
]

res = parse_exam_lines(sample_8d_lines)
print("=== PARSE RESULT FOR 8D ===")
print("Tür:", res['sinavTuru'])
print("Adı:", res['sinavAdi'])
print("Tarih:", res['sinavTarihi'])
print("Öğrenci Sayısı:", res['ogrenciSayisi'])
for o in res['ogrenciler']:
    print(f" - {o['sira']}: {o['adSoyad']} ({o['sinif']}, Kit: {o['kitapcik']}) Toplam Net: {o['toplam']['n']} Puan: {o['puan']}")
    print(f"   Dersler: {', '.join(f'{d['ders']}: {d['n']}' for d in o['dersSonuclari'])}")
