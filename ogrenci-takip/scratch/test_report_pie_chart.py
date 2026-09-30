import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

def test_pie_chart():
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
        print("Page loaded cleanly.")

        # Setup test data
        page.evaluate("""() => {
            DB.siniflar = [{ id: 1, ad: "12-A SAY" }];
            DB.ogrenciler = [{ id: 1, sinifId: 1, adSoyad: "Deniz Yılmaz", veli: "5551234567" }];
            
            // Add entries representing homework / question tasks
            // 1. Given as homework (Verildi): hedef = 100, soruSayisi = 0
            // 2. Solved: soruSayisi = 80, dogru = 70, yanlis = 10, durum = 'Tamamlandı'
            // 3. Another subject: soruSayisi = 60, durum = 'Kısmi'
            DB.haftalik = [
                {
                    id: 1,
                    ogrenciId: 1,
                    tur: 'odev_soru',
                    sinavTuru: 'TYT',
                    ders: 'Matematik',
                    konu: 'Türev & İntegral',
                    haftaBas: '2026-09-20',
                    haftaBit: '2026-09-27',
                    hedef: 100,
                    soruSayisi: 0,
                    dogru: 0,
                    yanlis: 0,
                    bos: 0,
                    net: 0,
                    durum: 'Verildi',
                    ogrenmeDerecesi: 3,
                    baslik: 'Türev Fasikülü Test 1-5'
                },
                {
                    id: 2,
                    ogrenciId: 1,
                    tur: 'odev_soru',
                    sinavTuru: 'TYT',
                    ders: 'Türkçe',
                    konu: 'Paragraf',
                    haftaBas: '2026-09-22',
                    haftaBit: '2026-09-29',
                    hedef: 80,
                    soruSayisi: 80,
                    dogru: 70,
                    yanlis: 10,
                    bos: 0,
                    net: 67.5,
                    durum: 'Tamamlandı',
                    ogrenmeDerecesi: 5,
                    baslik: 'Hız ve Renk Paragraf Denemeleri'
                },
                {
                    id: 3,
                    ogrenciId: 1,
                    tur: 'odev_soru',
                    sinavTuru: 'TYT',
                    ders: 'Fizik',
                    konu: 'Elektrik',
                    haftaBas: '2026-09-24',
                    haftaBit: '2026-09-30',
                    hedef: 60,
                    soruSayisi: 60,
                    dogru: 45,
                    yanlis: 15,
                    bos: 0,
                    net: 41.25,
                    durum: 'Kısmi',
                    ogrenmeDerecesi: 4,
                    baslik: 'Elektrik Akımı & Devreler'
                }
            ];
            saveDB();
            goto('haftalik');
            $('hfOgrenci').value = '1';
            hfOgrenciSecildi('1');
        }""")
        page.wait_for_timeout(500)

        # Open the Special Report Modal for this student
        page.evaluate("hfOzelRaporAc(1)")
        page.wait_for_timeout(500)

        # Check modal is visible
        assert page.is_visible("#hfOzelRaporModal"), "Report modal should be open"
        report_html = page.inner_html("#hfOzelRaporIcerik")

        # 1. Assert "Soru verisi yok" is NOT present
        assert "Soru verisi yok" not in report_html, "Report must NOT show 'Soru verisi yok' when homework/question entries exist!"
        print("CONFIRMED: 'Soru verisi yok' error is gone!")

        # 2. Assert SVG Pie chart is present
        svg_count = page.eval_on_selector_all("#hfOzelRaporIcerik svg", "els => els.length")
        assert svg_count > 0, "SVG pie chart should be rendered in the report!"
        print(f"CONFIRMED: Pie chart SVG element exists! Count: {svg_count}")

        # 3. Assert total question count is 240 (100 + 80 + 60)
        assert "240" in report_html, "Total questions should be 240 (100 Mat + 80 Tr + 60 Fiz)"
        print("CONFIRMED: Total questions correctly summed to 240!")

        # 4. Assert all 3 subjects are in the pie chart legend / table
        assert "Matematik" in report_html, "Matematik should be in the report"
        assert "Türkçe" in report_html, "Türkçe should be in the report"
        assert "Fizik" in report_html, "Fizik should be in the report"
        print("CONFIRMED: All subjects are present in the report and chart!")

        # 5. Take screenshot of the report modal
        page.screenshot(path="ogrenci-takip/scratch/report_pie_chart_verified.png")
        print("Screenshot saved to ogrenci-takip/scratch/report_pie_chart_verified.png")

        print("ALL REPORT PIE CHART TESTS PASSED!")
        browser.close()

if __name__ == "__main__":
    test_pie_chart()
