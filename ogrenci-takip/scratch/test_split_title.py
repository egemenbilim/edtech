import asyncio
from playwright.async_api import async_playwright
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--allow-file-access-from-files'])
        page = await browser.new_page()
        file_url = 'file:///' + os.path.abspath('index.html').replace('\\\\', '/')
        await page.goto(file_url)

        res = await page.evaluate("""
            async () => {
                const fInput = document.getElementById('pdfDosyaInput');
                // Let's inspect 8D text items for the title line
                const pdfPath = 'scratch/test_8d_dummy';
                return true;
            }
        """)

        # Let's inspect test_parse_8d.py row items
        # In test_parse_8d.py, line 2 was:
        # '12.09.2026 - 8010 - TDP HBS BİRLEŞİK   İzmit - KOCAELİ - İZMİT   Genel   İl   İlçe   Şube'
        line = "12.09.2026 - 8010 - TDP HBS BİRLEŞİK   İzmit - KOCAELİ - İZMİT   Genel   İl   İlçe   Şube"
        
        # If we split by "   " (3 spaces):
        parts = [p.strip() for p in line.split("   ") if p.strip()]
        print("Split by 3 spaces:", parts)
        # parts[0] is "12.09.2026 - 8010 - TDP HBS BİRLEŞİK"!
        
        # Extract exam name:
        ad = parts[0].split(" - ")[-1].strip()
        print("Clean Exam Name:", ad)

        await browser.close()

asyncio.run(main())
