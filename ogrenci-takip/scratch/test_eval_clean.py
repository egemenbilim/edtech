import asyncio
from playwright.async_api import async_playwright
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--allow-file-access-from-files'])
        page = await browser.new_page()
        file_url = 'file:///' + os.path.abspath('index.html').replace('\\', '/')
        await page.goto(file_url)
        
        # Test cleanTurkishText on the actual strings
        res = await page.evaluate("""
            async () => {
                const mod = await import('./js/modules/pdfParser.js');
                return {
                    out1: mod.cleanTurkishText('TDP HBS BİRLEŞİK'),
                    out2: mod.cleanTurkishText('11 Hız ve Renk MAARİF0 TYT'),
                    out3: mod.cleanTurkishText('12.09.2026 - 8010 - TDP HBS BİRLEŞİK')
                };
            }
        """)
        print("Result:", res)
        await browser.close()

asyncio.run(main())
