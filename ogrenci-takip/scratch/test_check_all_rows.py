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

        file_input = page.locator('#pdfDosyaInput')
        await file_input.set_input_files(os.path.expanduser('~/Downloads/11B DENEME SONUÇ.pdf'))
        await page.wait_for_timeout(1000)

        res = await page.evaluate("""
            async () => {
                const fInput = document.getElementById('pdfDosyaInput');
                const file = fInput.files[0];
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
                
                const allLines = [];
                for (let p = 1; p <= pdf.numPages; p++) {
                    const page = await pdf.getPage(p);
                    const tc = await page.getTextContent();
                    const rowMap = new Map();
                    for (const it of tc.items) {
                        const str = (it.str || '').trim();
                        if (!str) continue;
                        const y = it.transform[5];
                        const x = it.transform[4];
                        let fKey = null;
                        for (const k of rowMap.keys()) {
                            if (Math.abs(k - y) < 4.0) { fKey = k; break; }
                        }
                        if (fKey === null) { fKey = y; rowMap.set(fKey, []); }
                        rowMap.get(fKey).push({ str: it.str, x, y, width: it.width || 0 });
                    }
                    const sortedY = [...rowMap.keys()].sort((a, b) => b - a);
                    for (const y of sortedY) {
                        const items = rowMap.get(y).sort((a, b) => a.x - b.x);
                        let lineStr = '';
                        for (let i = 0; i < items.length; i++) {
                            const cur = items[i];
                            if (i === 0) lineStr += cur.str;
                            else {
                                const prev = items[i - 1];
                                const gap = cur.x - (prev.x + prev.width);
                                if (gap < 2) lineStr += cur.str;
                                else if (gap < 12) lineStr += ' ' + cur.str;
                                else lineStr += '   ' + cur.str;
                            }
                        }
                        if (lineStr.trim()) allLines.push(lineStr.trim());
                    }
                }
                return { numPages: pdf.numPages, lines: allLines };
            }
        """)

        print(f"Total lines: {len(res['lines'])}, pages: {res['numPages']}")
        for idx, l in enumerate(res['lines']):
            print(f"[{idx}] {repr(l)}")

        await browser.close()

asyncio.run(main())
