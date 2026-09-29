import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

def run_tests():
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

        print("Checking initial load...")
        assert len(errors) == 0, f"Errors on load: {errors}"
        print("Initial load OK - no errors.")

        # 1. Setup sample class and student if DB is empty
        page.evaluate("""() => {
            if (DB.siniflar.length === 0) {
                DB.siniflar.push({ id: 1, ad: "12-A SAY" });
                saveDB();
            }
            if (DB.ogrenciler.length === 0) {
                DB.ogrenciler.push({ id: 1, sinifId: 1, adSoyad: "Ahmet Yılmaz", veli: "5551112233" });
                DB.ogrenciler.push({ id: 2, sinifId: 1, adSoyad: "Ayşe Kaya", veli: "5552223344" });
                saveDB();
            }
            goto('haftalik');
        }""")
        page.wait_for_timeout(500)

        # Verify haftalik section is visible
        assert page.is_visible("#haftalik"), "Haftalik section should be visible"
        print("Haftalik section visible.")

        # Check Star selector
        page.click("#hfYildizSecici .hf-star[data-val='4']")
        etiket_text = page.inner_text("#hfYildizEtiket")
        print(f"Star label after clicking 4: {etiket_text}")
        assert "4" in etiket_text, "Star label should reflect 4"

        # Check that 'Soru Sayısı' label exists
        soru_labels = page.eval_on_selector_all("label", "els => els.map(e => e.innerText)")
        assert any("Soru Sayısı" in l for l in soru_labels), "Soru Sayısı label must exist"
        print("Soru Sayısı label confirmed.")

        # Add a test homework with status 'Verildi'
        page.evaluate("""() => {
            $('hfBas').value = '2026-09-25';
            $('hfBit').value = '2026-10-02';
            $('hfHedef').value = '100';
            $('hfOdevDurum').value = 'Verildi';
            $('hfBaslik').value = '3D Paragraf Test 1-4';
            hfYildizSec(0);
            hfKaydet();
        }""")
        page.wait_for_timeout(500)

        # Check table
        tablo_html = page.inner_html("#haftalikTablosu")
        assert "3D Paragraf Test 1-4" in tablo_html, "Added homework should be in table"
        assert "Kontrol Bekliyor" in tablo_html, "Status should be Kontrol Bekliyor"
        assert "Soru Sayısı" in tablo_html, "Table header should have Soru Sayısı"
        print("Homework added and rendered in table with Kontrol Bekliyor.")

        # Click status button to cycle status
        status_btn = page.query_selector("#haftalikTablosu button.pillbad")
        assert status_btn is not None
        status_btn.click()
        page.wait_for_timeout(300)
        tablo_html = page.inner_html("#haftalikTablosu")
        assert "Tam Yapıldı" in tablo_html, "Status should cycle to Tam Yapıldı"
        print("Status cycled successfully to Tam Yapıldı.")

        # Open Kontrol Modal
        edit_btn = page.query_selector("#haftalikTablosu button:has-text('Kontrol Et')")
        assert edit_btn is not None
        edit_btn.click()
        page.wait_for_timeout(300)
        assert page.is_visible("#hfKontrolModal"), "Kontrol modal should be visible"

        # Change details in modal
        page.evaluate("""() => {
            $('hfKntSoru').value = '80';
            $('hfKntDogru').value = '75';
            $('hfKntYanlis').value = '5';
            hfKntNetHesapla();
            hfKntYildizSec(5);
            hfKontrolKaydet();
        }""")
        page.wait_for_timeout(500)
        tablo_html = page.inner_html("#haftalikTablosu")
        assert "73.75" in tablo_html or "80" in tablo_html, "Updated Net / Soru count should be in table"
        print("Kontrol modal updated record successfully.")

        # Test Date Filters
        page.click("button:has-text('Son 1 Hafta')")
        page.wait_for_timeout(300)
        bas_val = page.input_value("#hfFiltreBas")
        bit_val = page.input_value("#hfFiltreBit")
        assert bas_val != "" and bit_val != "", "Date filters should be set by Son 1 Hafta"
        print(f"Son 1 Hafta button set dates: {bas_val} - {bit_val}")

        page.click("button[title='Tarih Filtresini Sıfırla']")
        page.wait_for_timeout(300)
        assert page.input_value("#hfFiltreBas") == "", "Date filters should be cleared"
        print("Tarih filtresi sıfırlandı.")

        # 2. Test Raporlar tab
        page.evaluate("goto('rapor')")
        page.wait_for_timeout(500)
        assert page.is_visible("#rapor"), "Rapor section should be visible"

        # Check student select is disabled before class is chosen
        is_disabled = page.eval_on_selector("#raporOgrenciSelect", "el => el.disabled")
        print(f"raporOgrenciSelect disabled before class select: {is_disabled}")
        assert is_disabled is True, "raporOgrenciSelect should be disabled before class selection"

        # Select class
        page.select_option("#raporSinifSelect", "1")
        page.wait_for_timeout(300)
        is_disabled_after = page.eval_on_selector("#raporOgrenciSelect", "el => el.disabled")
        print(f"raporOgrenciSelect disabled after class select: {is_disabled_after}")
        assert is_disabled_after is False, "raporOgrenciSelect should be enabled after class selection"
        ogr_opts = page.eval_on_selector_all("#raporOgrenciSelect option", "els => els.map(e => e.text)")
        print(f"Students in class 1: {ogr_opts}")
        assert any("Ahmet Yılmaz" in o for o in ogr_opts), "Ahmet Yılmaz should be listed"

        # 3. Test Gelişim Analizi with student absent in first exam
        page.evaluate("""() => {
            DB.denemeler = [
                { id: 101, ad: "Deneme 1", tur: "TYT", tarih: "2026-09-01" },
                { id: 102, ad: "Deneme 2", tur: "TYT", tarih: "2026-09-15" }
            ];
            // Ahmet entered both exams
            // Ayşe ONLY entered Deneme 2
            DB.sonuclar = [
                { id: 1, ogrenciId: 1, denemeId: 101, ders: "Türkçe", dogru: 30, yanlis: 10, net: 27.5 },
                { id: 2, ogrenciId: 1, denemeId: 102, ders: "Türkçe", dogru: 35, yanlis: 5, net: 33.75 },
                { id: 3, ogrenciId: 2, denemeId: 102, ders: "Türkçe", dogru: 40, yanlis: 0, net: 40.0 }
            ];
            saveDB();
            doldurRaporFiltreleri();
            $('raporSinifSelect').value = '1';
            raporSinifDegisti('1');
            renderRapor();
        }""")
        page.wait_for_timeout(500)

        gelisim_html = page.inner_html("#raporGelisimAnaliz")
        print("Gelisim Analiz rendered.")
        # Ahmet should be in gelisen
        assert "Ahmet Yılmaz" in gelisim_html, "Ahmet Yılmaz should be in gelişim analizi"
        # Ayşe should NOT be in gelişim analizi because she didn't take Deneme 1!
        assert "Ayşe Kaya" not in gelisim_html, "Ayşe Kaya must NOT be in gelişim analizi because she was absent in the first exam!"
        print("CONFIRMED: Ayşe Kaya (absent in first exam) was correctly excluded and not given a fake +100% boost!")

        # Take screenshot for visual verification
        page.screenshot(path="ogrenci-takip/scratch/test_report_and_weekly_verified.png", full_page=True)
        print("Screenshot saved to ogrenci-takip/scratch/test_report_and_weekly_verified.png")

        print("ALL TESTS PASSED!")
        browser.close()

if __name__ == "__main__":
    run_tests()
