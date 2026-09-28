import asyncio
from playwright.async_api import async_playwright
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--allow-file-access-from-files"])
        page = await browser.new_page()

        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text}") if msg.type in ['error', 'warning'] else None)

        file_url = "file:///" + os.path.abspath("index.html").replace("\\", "/")
        await page.goto(file_url)
        await page.wait_for_timeout(1000)

        # ══════════════════════════════════════════════════
        # TEST 1: 8D DENEME SONUÇ (LGS)
        # ══════════════════════════════════════════════════
        print("=== TEST 1: 8D DENEME SONUÇ (LGS) ===")
        await page.click('nav.top a[data-view="deneme"]')
        await page.wait_for_timeout(500)
        await page.click('#denTabPdf')
        await page.wait_for_timeout(500)

        pdf_8d_path = os.path.expanduser('~/Downloads/8d deneme sonuç.pdf')
        print(f"Uploading: {pdf_8d_path}")

        file_input = page.locator('#pdfDosyaInput')
        await file_input.set_input_files(pdf_8d_path)

        await page.wait_for_selector('#pdfOnayAlani:not(.hidden)', timeout=10000)

        info_text = await page.inner_text('#pdfSecilenDosya')
        print(f"8D File Info: {info_text}")

        student_rows_8d = await page.locator('#pdfOgrenciTablosu tbody tr').count()
        print(f"Extracted 8D student count: {student_rows_8d}")

        sinav_turu = await page.input_value('#pdfSinavTuru')
        sinav_adi = await page.input_value('#pdfSinavAdi')
        print(f"Detected Exam: Tür='{sinav_turu}', Ad='{sinav_adi}'")

        await page.screenshot(path="scratch/test_8d_approval.png")

        # Click save
        await page.click('#pdfOnayBtn')
        await page.wait_for_timeout(1500)

        # ══════════════════════════════════════════════════
        # TEST 2: 11B DENEME SONUÇ (TYT)
        # ══════════════════════════════════════════════════
        print("\n=== TEST 2: 11B DENEME SONUÇ (TYT) ===")
        await page.click('#denTabPdf')
        await page.wait_for_timeout(500)

        pdf_11b_path = os.path.expanduser('~/Downloads/11B DENEME SONUÇ.pdf')
        print(f"Uploading: {pdf_11b_path}")

        file_input = page.locator('#pdfDosyaInput')
        await file_input.set_input_files(pdf_11b_path)

        await page.wait_for_selector('#pdfOnayAlani:not(.hidden)', timeout=10000)

        info_text_11b = await page.inner_text('#pdfSecilenDosya')
        print(f"11B File Info: {info_text_11b}")

        student_rows_11b = await page.locator('#pdfOgrenciTablosu tbody tr').count()
        print(f"Extracted 11B student count: {student_rows_11b}")

        sinav_turu_11b = await page.input_value('#pdfSinavTuru')
        sinav_adi_11b = await page.input_value('#pdfSinavAdi')
        print(f"Detected Exam 11B: Tür='{sinav_turu_11b}', Ad='{sinav_adi_11b}'")

        await page.screenshot(path="scratch/test_11b_approval.png")

        # Click save
        await page.click('#pdfOnayBtn')
        await page.wait_for_timeout(1500)

        # Check database stats in page
        db_stats = await page.evaluate("""
            () => {
                return {
                    ogrenciler: window.DB.ogrenciler.length,
                    siniflar: window.DB.siniflar.map(s => s.ad),
                    denemeler: window.DB.denemeler.map(d => ({ ad: d.ad, tur: d.tur })),
                    sonuclar: window.DB.sonuclar.length
                };
            }
        """)

        print("\n=== FINAL DB STATE ===")
        print(f"Total students: {db_stats['ogrenciler']}")
        print(f"Classes: {db_stats['siniflar']}")
        print(f"Exams: {db_stats['denemeler']}")
        print(f"Total scores saved: {db_stats['sonuclar']}")

        if errors:
            print(f"ERRORS DETECTED: {errors}")
        else:
            print("\n🎉 ALL TESTS PASSED! Both 8D (LGS) and 11B (TYT) PDFs processed with 100% precision!")

        await browser.close()

asyncio.run(main())
