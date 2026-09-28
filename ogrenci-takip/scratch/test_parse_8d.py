import asyncio
from playwright.async_api import async_playwright
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--allow-file-access-from-files"])
        page = await browser.new_page()

        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

        file_url = "file:///" + os.path.abspath("index.html").replace("\\", "/")
        await page.goto(file_url)
        await page.wait_for_timeout(1000)

        pdf_path = os.path.expanduser('~/Downloads/8d deneme sonuç.pdf')
        print(f"Testing PDF upload on: {pdf_path}")

        # Go to deneme -> pdf
        await page.click('nav.top a[data-view="deneme"]')
        await page.wait_for_timeout(500)
        await page.click('#denTabPdf')
        await page.wait_for_timeout(500)

        # Upload the file
        file_input = page.locator('#pdfFileInput')
        await file_input.set_input_files(pdf_path)

        await page.wait_for_timeout(3000)

        durum_text = await page.inner_text('#pdfDurum')
        print(f"Status text: {durum_text}")

        # Check if table appeared
        onay_hidden = await page.locator('#pdfOnayAlani').get_attribute('class')
        print(f"pdfOnayAlani class: {onay_hidden}")

        # Also let's inspect the lines extracted by parsePdfFile
        # Run custom evaluation in browser
        res = await page.evaluate("""
            async () => {
                const fInput = document.getElementById('pdfFileInput');
                const file = fInput.files[0];
                if (!file) return { error: 'no file' };
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
                const page1 = await pdf.getPage(1);
                const tc = await page1.getTextContent();
                
                // Group by Y
                const rowMap = new Map();
                for (const it of tc.items) {
                    const text = (it.str || '').trim();
                    if (!text) continue;
                    const y = Math.round(it.transform[5]);
                    const x = Math.round(it.transform[4]);
                    let foundY = null;
                    for (const existingY of rowMap.keys()) {
                        if (Math.abs(existingY - y) <= 4) { foundY = existingY; break; }
                    }
                    const targetY = foundY !== null ? foundY : y;
                    if (!rowMap.has(targetY)) rowMap.set(targetY, []);
                    rowMap.get(targetY).push({ x, text, raw: it.str });
                }
                const sortedY = [...rowMap.keys()].sort((a, b) => b - a);
                const rows = [];
                for (const y of sortedY) {
                    const items = rowMap.get(y).sort((a, b) => a.x - b.x);
                    rows.push(items.map(i => i.text).join('   '));
                }
                return { totalItems: tc.items.length, numPages: pdf.numPages, rows: rows.slice(0, 35) };
            }
        """)

        print("--- EXTRACTED ROWS ---")
        for r in res.get("rows", []):
            print(repr(r))

        await browser.close()

asyncio.run(main())
