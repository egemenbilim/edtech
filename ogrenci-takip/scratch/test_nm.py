import re

l = "12.09.2026 - 8010 - TDP HBS BİRLEŞİK   İzmit - KOCAELİ - İZMİT   Genel   İl   İlçe   Şube"
nm = re.search(r'\d{1,2}\.\d{1,2}\.\d{4}\s*-\s*\d+\s*-\s*([^\t\n\r]+)', l)
if nm:
    print("nm[1]:", repr(nm.group(1)))
    rawAd = re.split(r'\s{2,}|\t', nm.group(1))[0].strip()
    print("rawAd:", repr(rawAd))

l2 = "12.09.2026 - 110300 - 11 Hız ve Renk MAARİF0 TYT   İzmit - KOCAELİ - İZMİT   Genel   İl   İlçe   Şube"
nm2 = re.search(r'\d{1,2}\.\d{1,2}\.\d{4}\s*-\s*\d+\s*-\s*([^\t\n\r]+)', l2)
if nm2:
    print("nm2[1]:", repr(nm2.group(1)))
    rawAd2 = re.split(r'\s{2,}|\t', nm2.group(1))[0].strip()
    print("rawAd2:", repr(rawAd2))
