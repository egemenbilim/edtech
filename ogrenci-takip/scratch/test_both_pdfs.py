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

        # Test both PDF files with our logic inside browser
        pdf_8d = os.path.expanduser('~/Downloads/8d deneme sonuç.pdf')
        pdf_11b = os.path.expanduser('~/Downloads/11B DENEME SONUÇ.pdf')

        res = await page.evaluate("""
            async ([path8d, path11b]) => {
                // Read and extract lines for 8D
                async function extractPdfLines(url) {
                    const resp = await fetch(url);
                    const buf = await resp.arrayBuffer();
                    const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
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
                            rowMap.get(fKey).push({ str, x, y });
                        }
                        const sortedY = [...rowMap.keys()].sort((a, b) => b - a);
                        for (const y of sortedY) {
                            const items = rowMap.get(y).sort((a, b) => a.x - b.x);
                            allLines.push(items.map(i => i.str).join('   '));
                        }
                    }
                    return allLines;
                }

                return { ok: true };
            }
        """, [pdf_8d, pdf_11b])

        print("Browser evaluation ready")
        await browser.close()

asyncio.run(main())
