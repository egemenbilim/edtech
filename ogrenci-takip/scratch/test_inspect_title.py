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

        await page.click('nav.top a[data-view="deneme"]')
        await page.click('#denTabPdf')

        # Add console logger
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

        await page.evaluate("""
            () => {
                const origParseExamLines = window.parseExamLines;
            }
        """)

        # Upload 8D file
        file_input = page.locator('#pdfDosyaInput')
        await file_input.set_input_files(os.path.expanduser('~/Downloads/8d deneme sonuç.pdf'))
        await page.wait_for_selector('#pdfOnayAlani:not(.hidden)', timeout=10000)

        res = await page.evaluate("""
            () => {
                const sinavAdi = document.getElementById('pdfSinavAdi').value;
                return { sinavAdi };
            }
        """)
        print("Page exam title:", res)

        await browser.close()

asyncio.run(main())
