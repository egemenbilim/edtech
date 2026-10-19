import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

def test_manual_matching():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--allow-file-access-from-files"])
        context = browser.new_context()
        page = context.new_page()

        errors = []
        page.on("pageerror", lambda err: errors.append(f"PageError: {err}"))
        page.on("console", lambda msg: errors.append(f"ConsoleError: {msg.text}") if msg.type == "error" else None)

        # Open application
        page.goto("file:///c:/Users/egeme/OneDrive/Desktop/CODEX/EdTech/ogrenci-takip/index.html")
        page.wait_for_timeout(1000)

        assert len(errors) == 0, f"Errors on load: {errors}"
        print("Page loaded cleanly without console errors.")

        # 1. Setup sample classes and students in DB
        page.evaluate("""() => {
            DB.siniflar = [
                { id: 1, ad: "12-A SAY" },
                { id: 2, ad: "12-B EA" }
            ];
            DB.ogrenciler = [
                { id: 10, sinifId: 1, adSoyad: "Ahmet Yılmaz", veli: "555111" },
                { id: 20, sinifId: 1, adSoyad: "Zeynep Kaya", veli: "555222" },
                { id: 30, sinifId: 2, adSoyad: "Mehmet Demir", veli: "555333" }
            ];
            DB.denemeler = [];
            DB.sonuclar = [];
            saveDB();
            goto('deneme');
            denTab('pdf');
        }""")
        page.wait_for_timeout(500)

        # 2. Simulate parsed PDF data with OCR typos
        # Ahmet: normal match
        # Zeynep: OCR error "ZEYNP KY" (won't auto match)
        # Mehmet: OCR error "M DEM R" (won't auto match)
        page.evaluate("""() => {
            const parsedData = {
                sinavTuru: 'TYT',
                sinavAdi: 'Özdebir TYT 1',
                sinavTarihi: '2026-10-05',
                ogrenciler: [
                    {
                        sira: 1,
                        ogrNo: '101',
                        adSoyad: 'AHMET YILMAZ',
                        sinif: '12-A SAY',
                        mevcutOgrenci: true,
                        eslesenOgrenciId: 10,
                        eslesmeTuru: 'auto',
                        adSim: 100,
                        soyadSim: 100,
                        toplamSim: 100,
                        seciliSinifId: 1,
                        dahilEt: true,
                        toplam: { net: 85.5 },
                        puan: 410.25,
                        dersSonuclari: [
                            { ders: 'Türkçe', dogru: 35, yanlis: 5, bos: 0, net: 33.75 },
                            { ders: 'Matematik', dogru: 32, yanlis: 3, bos: 5, net: 31.25 }
                        ]
                    },
                    {
                        sira: 2,
                        ogrNo: '102',
                        adSoyad: 'ZEYNP KY', // Typo! Unmatched
                        sinif: '12-A',
                        mevcutOgrenci: false,
                        eslesenOgrenciId: null,
                        eslesmeTuru: 'none',
                        adSim: 0,
                        soyadSim: 0,
                        toplamSim: 0,
                        seciliSinifId: 1,
                        dahilEt: true,
                        toplam: { net: 78.0 },
                        puan: 385.5,
                        dersSonuclari: [
                            { ders: 'Türkçe', dogru: 30, yanlis: 6, bos: 4, net: 28.5 },
                            { ders: 'Matematik', dogru: 28, yanlis: 4, bos: 8, net: 27.0 }
                        ]
                    },
                    {
                        sira: 3,
                        ogrNo: '103',
                        adSoyad: 'M DEM R', // Typo! Unmatched
                        sinif: '12-B',
                        mevcutOgrenci: false,
                        eslesenOgrenciId: null,
                        eslesmeTuru: 'none',
                        adSim: 0,
                        soyadSim: 0,
                        toplamSim: 0,
                        seciliSinifId: 2,
                        dahilEt: true,
                        toplam: { net: 65.0 },
                        puan: 320.0,
                        dersSonuclari: [
                            { ders: 'Türkçe', dogru: 25, yanlis: 10, bos: 5, net: 22.5 },
                            { ders: 'Matematik', dogru: 20, yanlis: 5, bos: 15, net: 18.75 }
                        ]
                    }
                ]
            };
            renderPdfOnayPaneli(parsedData);
        }""")
        page.wait_for_timeout(500)

        # Verify review panel is visible
        assert page.is_visible("#pdfOnayAlani"), "PDF Review panel must be visible"
        table_html = page.inner_html("#pdfOgrenciTablosu")

        # Confirm column header
        assert "Sistem Eşleşmesi" in table_html
        print("Review table rendered.")

        # Check initial counter values: 1 matched, 2 new
        eslesen_count = page.inner_text("#pdfSayacEslesen")
        yeni_count = page.inner_text("#pdfSayacYeni")
        print(f"Initial counters -> Eşleşen: {eslesen_count}, Yeni: {yeni_count}")
        assert eslesen_count == "1"
        assert yeni_count == "2"

        # 3. Test opening manual matching modal on Row 1 (index 1 -> ZEYNP KY)
        # Find the "İşaretle" button on row 1
        row1_btn = page.query_selector("#pdf_row_1 button:has-text('İşaretle')")
        assert row1_btn is not None, "İşaretle button must exist on row 1"
        row1_btn.click()
        page.wait_for_timeout(400)

        assert page.is_visible("#pdfManuelEslestirModal"), "Manual matching modal should be open"
        modal_info = page.inner_text("#pdfModalOgrBilgi")
        assert "ZEYNP KY" in modal_info, "Modal info must show the PDF student name"
        print("Manual matching modal opened successfully for ZEYNP KY.")

        # Take screenshot of the matching modal with suggestions
        page.screenshot(path="ogrenci-takip/scratch/test_matching_modal.png")

        # Select Zeynep Kaya (ID 20) in the modal
        zeynep_btn = page.query_selector("#pdfModalOgrListesi div:has-text('Zeynep Kaya') button")
        assert zeynep_btn is not None, "Button for Zeynep Kaya should exist"
        zeynep_btn.click()
        page.wait_for_timeout(400)

        # Modal should be closed
        assert not page.is_visible("#pdfManuelEslestirModal"), "Modal should close after selection"

        # Verify row 1 now shows Manuel: Zeynep Kaya
        row1_html = page.inner_html("#pdf_row_1")
        assert "Manuel" in row1_html and "Zeynep Kaya" in row1_html, "Row 1 must now display Manuel: Zeynep Kaya"
        print("Row 1 successfully manually mapped to Zeynep Kaya!")

        # Verify counters updated -> 2 matched, 1 new
        assert page.inner_text("#pdfSayacEslesen") == "2"
        assert page.inner_text("#pdfSayacYeni") == "1"

        # 4. Test mapping row 2 (index 2 -> M DEM R) via live search in modal
        row2_btn = page.query_selector("#pdf_row_2 button:has-text('İşaretle')")
        assert row2_btn is not None
        row2_btn.click()
        page.wait_for_timeout(300)

        # Search for "Mehmet"
        page.fill("#pdfModalOgrAra", "Mehmet")
        page.wait_for_timeout(300)

        mehmet_btn = page.query_selector("#pdfModalOgrListesi div:has-text('Mehmet Demir') button")
        assert mehmet_btn is not None, "Mehmet Demir should appear in search results"
        mehmet_btn.click()
        page.wait_for_timeout(400)

        row2_html = page.inner_html("#pdf_row_2")
        assert "Manuel" in row2_html and "Mehmet Demir" in row2_html
        print("Row 2 successfully manually mapped to Mehmet Demir!")

        # Verify counters updated -> 3 matched, 0 new
        assert page.inner_text("#pdfSayacEslesen") == "3"
        assert page.inner_text("#pdfSayacYeni") == "0"

        # 5. Test unmap functionality on Row 2 (the ✕ button on badge)
        unmap_btn = page.query_selector("#pdf_row_2 #pdf_durum_2 button:has-text('✕')")
        assert unmap_btn is not None
        unmap_btn.click()
        page.wait_for_timeout(300)

        row2_html_after = page.inner_html("#pdf_row_2")
        assert "Yeni Öğrenci Açılacak" in row2_html_after
        print("Row 2 successfully unmapped back to new student.")
        assert page.inner_text("#pdfSayacEslesen") == "2"
        assert page.inner_text("#pdfSayacYeni") == "1"

        # Re-map row 2 to Mehmet Demir using the inline select dropdown
        page.select_option("#pdf_ogrenci_2", "30")
        page.wait_for_timeout(300)
        assert "Manuel" in page.inner_html("#pdf_row_2") and "Mehmet Demir" in page.inner_html("#pdf_row_2")
        print("Inline select also successfully mapped row 2 to Mehmet Demir!")

        # 6. Click Onayla ve Sisteme Aktar
        page.click("#pdfOnayBtn")
        page.wait_for_timeout(800)

        # Check DB state
        db_check = page.evaluate("""() => {
            return {
                ogrencilerCount: DB.ogrenciler.length,
                sonuclarCount: DB.sonuclar.length,
                ahmetSonuclari: DB.sonuclar.filter(s => s.ogrenciId === 10).length,
                zeynepSonuclari: DB.sonuclar.filter(s => s.ogrenciId === 20).length,
                mehmetSonuclari: DB.sonuclar.filter(s => s.ogrenciId === 30).length,
                allOgrNames: DB.ogrenciler.map(o => o.adSoyad)
            };
        }""")
        print(f"DB verification after import: {db_check}")

        # Assert no duplicate students were created!
        assert db_check["ogrencilerCount"] == 3, f"Expected exactly 3 students, got {db_check['ogrencilerCount']}"
        assert "ZEYNP KY" not in db_check["allOgrNames"], "Duplicate ZEYNP KY should NOT be created!"
        assert "M DEM R" not in db_check["allOgrNames"], "Duplicate M DEM R should NOT be created!"

        # Assert all 3 existing students got their exam results!
        assert db_check["ahmetSonuclari"] > 0, "Ahmet Yılmaz must have exam results"
        assert db_check["zeynepSonuclari"] > 0, "Zeynep Kaya must have exam results joined"
        assert db_check["mehmetSonuclari"] > 0, "Mehmet Demir must have exam results joined"
        print("CONFIRMED: All exam results were joined directly to existing students without duplicates!")

        print("ALL TESTS PASSED SUCCESSFULLY!")
        browser.close()

if __name__ == "__main__":
    test_manual_matching()
