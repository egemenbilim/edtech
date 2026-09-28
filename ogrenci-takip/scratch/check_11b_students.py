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
                const pdfPath = 'scratch/11b_debug';
                const fInput = document.getElementById('pdfDosyaInput');
                // We will test using parsePdfFile directly
                return true;
            }
        """)

        await page.click('nav.top a[data-view="deneme"]')
        await page.click('#denTabPdf')

        file_input = page.locator('#pdfDosyaInput')
        await file_input.set_input_files(os.path.expanduser('~/Downloads/11B DENEME SONUÇ.pdf'))
        await page.wait_for_selector('#pdfOnayAlani:not(.hidden)', timeout=10000)

        students = await page.evaluate("""
            () => {
                const rows = document.querySelectorAll('#pdfOgrenciTablosu tbody tr');
                const list = [];
                rows.forEach(r => {
                    const sira = r.cells[1].textContent.trim();
                    const no = r.querySelector('input[id^="pdf_no_"]').value;
                    const ad = r.querySelector('input[id^="pdf_ad_"]').value;
                    list.push({ sira, no, ad });
                });
                return list;
            }
        """)

        print(f"Extracted students ({len(students)}):")
        for s in students:
            print(" ", s)

        await browser.close()

asyncio.run(main())
