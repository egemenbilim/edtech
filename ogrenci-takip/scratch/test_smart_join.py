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

        # Upload 8D file and check items with widths
        await page.click('nav.top a[data-view="deneme"]')
        await page.click('#denTabPdf')

        file_input = page.locator('#pdfDosyaInput')
        await file_input.set_input_files(os.path.expanduser('~/Downloads/8d deneme sonuç.pdf'))
        await page.wait_for_timeout(1000)

        res = await page.evaluate("""
            async () => {
                const fInput = document.getElementById('pdfDosyaInput');
                const file = fInput.files[0];
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
                const page1 = await pdf.getPage(1);
                const tc = await page1.getTextContent();
                
                // Group by Y
                const rowMap = new Map();
                for (const it of tc.items) {
                    const text = (it.str || '').trim();
                    if (!text) continue;
                    const y = it.transform[5];
                    const x = it.transform[4];
                    let fKey = null;
                    for (const k of rowMap.keys()) {
                        if (Math.abs(k - y) < 4.0) { fKey = k; break; }
                    }
                    if (fKey === null) { fKey = y; rowMap.set(fKey, []); }
                    rowMap.get(fKey).push({ str: it.str, x, y, width: it.width });
                }

                // Check title line (Y around row 2)
                const sortedYs = Array.from(rowMap.keys()).sort((a, b) => b - a);
                const titleItems = rowMap.get(sortedYs[2]); // line 2
                titleItems.sort((a, b) => a.x - b.x);

                let smartLine = '';
                for (let i = 0; i < titleItems.length; i++) {
                    const cur = titleItems[i];
                    if (i === 0) {
                        smartLine += cur.str;
                    } else {
                        const prev = titleItems[i - 1];
                        const gap = cur.x - (prev.x + prev.width);
                        if (gap < 2) {
                            smartLine += cur.str;
                        } else if (gap < 14) {
                            smartLine += ' ' + cur.str;
                        } else {
                            smartLine += '   ' + cur.str;
                        }
                    }
                }

                return {
                    rawItems: titleItems.map(t => ({ str: t.str, x: Math.round(t.x), w: Math.round(t.width) })),
                    smartLine: smartLine
                };
            }
        """)

        print("Title items:")
        for r in res['rawItems']:
            print(" ", r)
        print("Smart line:", repr(res['smartLine']))

        await browser.close()

asyncio.run(main())
