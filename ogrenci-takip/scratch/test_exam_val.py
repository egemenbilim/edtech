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

        # Upload 8D file and check parsed result
        pdf_8d_path = os.path.expanduser('~/Downloads/8d deneme sonuç.pdf')
        await page.click('nav.top a[data-view="deneme"]')
        await page.click('#denTabPdf')

        file_input = page.locator('#pdfDosyaInput')
        await file_input.set_input_files(pdf_8d_path)
        await page.wait_for_selector('#pdfOnayAlani:not(.hidden)', timeout=10000)

        exam_name = await page.input_value('#pdfSinavAdi')
        exam_type = await page.input_value('#pdfSinavTuru')
        print(f"Exam Name: {repr(exam_name)}")
        print(f"Exam Type: {repr(exam_type)}")

        await browser.close()

asyncio.run(main())
