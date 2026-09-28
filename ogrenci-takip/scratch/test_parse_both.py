import asyncio
from playwright.async_api import async_playwright
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--allow-file-access-from-files"])
        page = await browser.new_page()

        file_url = "file:///" + os.path.abspath("index.html").replace("\\", "/")
        await page.goto(file_url)

        res = await page.evaluate("""
            async () => {
                // Test parsing logic for 8D
                const sample8d = [
                    'LGS ŞUBE NET-PUAN LİSTESİ',
                    'Sınav Tarihi - Kodu - Adı   Şube - İl - İlçe   KATILIM',
                    '12.09.2026 - 8010 - TDP HBS BİRLEŞİK   İzmit - KOCAELİ - İZMİT   Genel   İl   İlçe   Şube',
                    '44   44   44   44',
                    'Sözel   Sayısal',
                    'Öğr No   Ad Soyad   Sınıf   Kit   Türkçe   Sosyal / Hayat   Din Kült.   İngilizce   Matematik   Fen Bil.   Toplam   LGS   Gnl   İl   İlçe   Şb   Snf',
                    'D   Y   N   D   Y   N   D   Y   N   D   Y   N   D   Y   N   D   Y   N   D   Y   N   Puan   Sr   Sr   Sr   Sr   Sr',
                    '1   39233   RIFAT AL YEŞİLYURT   804   AA   14   6   12,00   7   2   6,33   9   1   8,67   8   2   7,33   6   4   4,67   11   7   8,67   55   22   47,67   333,825   27   27   27   27   1',
                    '2   43366   ELA AKBAŞ   804   AA   14   2   13,33   8   2   7,33   10   0   10,00   9   1   8,67   3   1   2,67   8   1   7,67   52   7   49,67   331,796   28   28   28   28   2',
                    '9   39836   ADA BENSEL   804   AA   12   4   10,67   9   0   9,00   8   0   8,00   2   0   2,00   0   0   0,00   4   3   3,00   35   7   32,67   277,354   36   36   36   36   9'
                ];

                return { ok: true };
            }
        """)

        print("Evaluate result:", res)
        await browser.close()

asyncio.run(main())
