import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

sample_lines_8d = [
    "1   39233   RIFAT AL YEŞİLYURT   804   AA   14   6   12,00   7   2   6,33   9   1   8,67   8   2   7,33   6   4   4,67   11   7   8,67   55   22   47,67   333,825   27   27   27   27   1",
    "2   43366   ELA AKBAŞ   804   AA   14   2   13,33   8   2   7,33   10   0   10,00   9   1   8,67   3   1   2,67   8   1   7,67   52   7   49,67   331,796   28   28   28   28   2",
    "9   39836   ADA BENSEL   804   AA   12   4   10,67   9   0   9,00   8   0   8,00   2   0   2,00   0   0   0,00   4   3   3,00   35   7   32,67   277,354   36   36   36   36   9"
]

sample_lines_11b = [
    "1 39791 HÜSEYİN UMU ARSLAN 1112 B 28 12 25,00 4 1 3,75 5 0 5,00 2 3 1,25 3 2 2,50 31 4 30,00 5 1 4,75 4 3 3,25 5 2 4,50 4 2 3,50 91 30 83,50 382,900 1 1 1 1 1",
    "13 41657 MEHMET EFE EKER 1112 A 19 14 15,50 4 1 3,75 4 1 3,75 3 2 2,50 4 1 3,75 19 6 17,50 2 1 1,75 4 3 3,25 1 6 -0,50 2 2 1,50 62 38 52,50 274,300 13 13 13 13 13"
]

def parse_line(line):
    # Regex that matches:
    # 1. Sıra No (optional or 1-4 digits)
    # 2. Öğr No (3-10 digits)
    # 3. Ad Soyad (names with Turkish chars)
    # 4. Sınıf (digits or letters/hyphen)
    # 5. Kitapçık (1-3 letters or hyphen or absent)
    # 6. Score numbers
    m = re.match(r'^\s*(?:(\d+)\s+)?(\d{3,10})\s+(.+?)\s+([0-9A-Za-z\/\-\*]+)\s+([A-Za-z0-9\-]{1,4})\s+([\d\,\.\-\s]+)$', line.strip())
    if not m:
        # Fallback if kitapçık is omitted or attached
        m = re.match(r'^\s*(?:(\d+)\s+)?(\d{3,10})\s+(.+?)\s+([0-9A-Za-z\/\-\*]+)\s+([\d\,\.\-\s]+)$', line.strip())
        if m:
            sira = m.group(1) or '1'
            ogrNo = m.group(2)
            ad = m.group(3)
            sinif = m.group(4)
            kitapcik = '-'
            scores = m.group(5)
            return sira, ogrNo, ad, sinif, kitapcik, scores
        return None
    
    return m.group(1) or '1', m.group(2), m.group(3), m.group(4), m.group(5), m.group(6)

print("=== TESTING 8D LINES ===")
for l in sample_lines_8d:
    res = parse_line(l)
    print("Match:", res is not None, res[:5] if res else None)

print("\n=== TESTING 11B LINES ===")
for l in sample_lines_11b:
    res = parse_line(l)
    print("Match:", res is not None, res[:5] if res else None)
