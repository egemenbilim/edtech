import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Known subject aliases to standard system names
SUBJECT_MAP = {
    'türkçe': 'Türkçe',
    'turkce': 'Türkçe',
    'matematik': 'Matematik',
    'mat': 'Matematik',
    'fen': 'Fen Bilimleri',
    'fen bil': 'Fen Bilimleri',
    'fen bil.': 'Fen Bilimleri',
    'fen bilimleri': 'Fen Bilimleri',
    'sosyal': 'İnkılap Tarihi', # For LGS
    'sosyal / hayat': 'İnkılap Tarihi',
    'sosyal bilgiler': 'İnkılap Tarihi',
    't.c. inkılap': 'İnkılap Tarihi',
    'inkılap': 'İnkılap Tarihi',
    'inkılap tarihi': 'İnkılap Tarihi',
    'din': 'Din Kültürü',
    'din kült.': 'Din Kültürü',
    'din kültürü': 'Din Kültürü',
    'din kültürü ve ahlak bilgisi': 'Din Kültürü',
    'ingilizce': 'İngilizce',
    'ing': 'İngilizce',
    'yabancı dil': 'İngilizce',
    # TYT / AYT
    'tarih': 'Tarih',
    'tarih-1': 'Tarih-1',
    'tarih-2': 'Tarih-2',
    'coğrafya': 'Coğrafya',
    'cografya': 'Coğrafya',
    'coğrafya-1': 'Coğrafya-1',
    'coğrafya-2': 'Coğrafya-2',
    'felsefe': 'Felsefe',
    'felsefe grubu': 'Felsefe Grubu',
    'geometri': 'Geometri',
    'geo': 'Geometri',
    'fizik': 'Fizik',
    'kimya': 'Kimya',
    'biyoloji': 'Biyoloji',
    'edebiyat': 'Edebiyat',
    'türk dili ve edebiyatı': 'Edebiyat'
}

def detect_subjects(header_line, sinav_turu):
    # Find subject names in the header line
    cleaned = re.sub(r'^(öğr no|ad soyad|sınıf|kit|şube|sıra)\s+', '', header_line.lower())
    
    # Split by multiple spaces
    tokens = [t.strip() for t in re.split(r'\s{2,}|\t', cleaned) if t.strip()]
    detected = []
    
    for t in tokens:
        t_clean = t.lower().replace(':', '').strip()
        if t_clean in ['toplam', 'puan', 'lgs', 'tyt', 'ayt', 'gnl', 'il', 'ilçe', 'şb', 'snf', 'sr', 'd', 'y', 'n']:
            continue
        # Find matching subject
        matched_name = None
        for alias, std_name in SUBJECT_MAP.items():
            if t_clean == alias or t_clean.startswith(alias):
                if sinav_turu == 'TYT' and alias in ['sosyal', 'tarih']:
                    matched_name = 'Tarih' if alias == 'tarih' else 'Sosyal'
                else:
                    matched_name = std_name
                break
        if matched_name and matched_name not in detected:
            detected.append(matched_name)
    
    return detected

header_8d = "Öğr No   Ad Soyad   Sınıf   Kit   Türkçe   Sosyal / Hayat   Din Kült.   İngilizce   Matematik   Fen Bil.   Toplam   LGS   Gnl   İl   İlçe   Şb   Snf"
header_11b = "Öğr No Ad Soyad Sınıf Kit Türkçe Tarih Coğrafya Felsefe Din Kültürü Matematik Geometri Fizik Kimya Biyoloji Toplam Puan Gnl İl İlçe Şb Snf"

print("8D Subjects (LGS):", detect_subjects(header_8d, 'LGS'))
print("11B Subjects (TYT):", detect_subjects(header_11b, 'TYT'))
