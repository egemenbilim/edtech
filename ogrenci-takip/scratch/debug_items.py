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
                const pdfPath = 'file:///C:/Users/egeme/Downloads/8d%20deneme%20sonu%C3%A7.pdf';
                const resp = await fetch(pdfPath);
                const buf = await resp.arrayBuffer();
                const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
                const page1 = await pdf.getPage(1);
                const content = await page1.getTextContent();
                
                // Let's see all text items in the first 20 items
                return content.items.slice(0, 30).map(it => ({ str: it.str, x: Math.round(it.transform[4]), y: Math.round(it.transform[5]) }));
            }
        """)

        print("First 30 items in 8D:")
        for it in res:
            print(it)

        await browser.close()

asyncio.run(main())
