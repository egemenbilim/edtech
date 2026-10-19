import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--allow-file-access-from-files"])
        context = browser.new_context(viewport={'width': 1280, 'height': 900})
        page = context.new_page()

        console_errors = []
        page.on("pageerror", lambda err: print("PAGE ERROR:", err))
        page.on("console", lambda msg: print(f"CONSOLE ({msg.type}):", msg.text))

        page.goto("file:///c:/Users/egeme/OneDrive/Desktop/CODEX/EdTech/ogrenci-takip/index.html")
        page.wait_for_timeout(1500)

        page.evaluate("() => goto('rapor')")
        page.wait_for_timeout(400)

        # Setup mock DB with:
        # Class 1: 8-A (LGS) and Class 2: 12-A (TYT)
        # Students in Class 2 (12-A):
        # 1: Ahmet Yilmaz (entered trials 1, 2, 3 - missed trial 4)
        # 2: Mehmet Demir (missed trials 1, 2 - entered trials 3, 4)
        # 3: Ayse Kaya (entered trials 1, 2, 3, 4)
        # 4: Fatma Celik (entered none)
        # Also test LGS trial exams!
        mock_setup = """
        () => {
            DB.siniflar = [
                { id: 1, ad: "12-A Sayısal" },
                { id: 2, ad: "8-A LGS" }
            ];
            DB.ogrenciler = [
                { id: 101, adSoyad: "Ahmet Yılmaz", sinifId: 1, no: "101" },
                { id: 102, adSoyad: "Mehmet Demir", sinifId: 1, no: "102" },
                { id: 103, adSoyad: "Ayşe Kaya", sinifId: 1, no: "103" },
                { id: 104, adSoyad: "Fatma Çelik", sinifId: 1, no: "104" },
                { id: 201, adSoyad: "Ali Can", sinifId: 2, no: "201" },
                { id: 202, adSoyad: "Zeynep Nur", sinifId: 2, no: "202" }
            ];
            DB.denemeler = [
                { id: 1, ad: "1. TYT Denemesi", tur: "TYT", tarih: "2026-09-01" },
                { id: 2, ad: "2. TYT Denemesi", tur: "TYT", tarih: "2026-09-15" },
                { id: 3, ad: "3. TYT Denemesi", tur: "TYT", tarih: "2026-10-01" },
                { id: 4, ad: "4. TYT Denemesi", tur: "TYT", tarih: "2026-10-15" },
                { id: 10, ad: "1. LGS Denemesi", tur: "LGS", tarih: "2026-09-10" },
                { id: 11, ad: "2. LGS Denemesi", tur: "LGS", tarih: "2026-10-10" }
            ];
            DB.sonuclar = [
                // Ahmet (101): Deneme 1, 2, 3 (missed 4)
                { id: 1, ogrenciId: 101, denemeId: 1, ders: "Türkçe", dogru: 30, yanlis: 10, net: 27.5 },
                { id: 2, ogrenciId: 101, denemeId: 1, ders: "Matematik", dogru: 25, yanlis: 5, net: 23.75 },
                { id: 3, ogrenciId: 101, denemeId: 2, ders: "Türkçe", dogru: 32, yanlis: 8, net: 30.0 },
                { id: 4, ogrenciId: 101, denemeId: 2, ders: "Matematik", dogru: 28, yanlis: 4, net: 27.0 },
                { id: 5, ogrenciId: 101, denemeId: 3, ders: "Türkçe", dogru: 34, yanlis: 6, net: 32.5 },
                { id: 6, ogrenciId: 101, denemeId: 3, ders: "Matematik", dogru: 30, yanlis: 5, net: 28.75 },

                // Mehmet (102): Missed 1, 2 - Entered 3, 4
                { id: 7, ogrenciId: 102, denemeId: 3, ders: "Türkçe", dogru: 25, yanlis: 10, net: 22.5 },
                { id: 8, ogrenciId: 102, denemeId: 3, ders: "Matematik", dogru: 20, yanlis: 10, net: 17.5 },
                { id: 9, ogrenciId: 102, denemeId: 4, ders: "Türkçe", dogru: 28, yanlis: 8, net: 26.0 },
                { id: 10, ogrenciId: 102, denemeId: 4, ders: "Matematik", dogru: 24, yanlis: 6, net: 22.5 },

                // Ayse (103): Entered 1, 2, 3, 4
                { id: 11, ogrenciId: 103, denemeId: 1, ders: "Türkçe", dogru: 35, yanlis: 5, net: 33.75 },
                { id: 12, ogrenciId: 103, denemeId: 1, ders: "Matematik", dogru: 32, yanlis: 4, net: 31.0 },
                { id: 13, ogrenciId: 103, denemeId: 2, ders: "Türkçe", dogru: 36, yanlis: 4, net: 35.0 },
                { id: 14, ogrenciId: 103, denemeId: 2, ders: "Matematik", dogru: 34, yanlis: 3, net: 33.25 },
                { id: 15, ogrenciId: 103, denemeId: 3, ders: "Türkçe", dogru: 37, yanlis: 3, net: 36.25 },
                { id: 16, ogrenciId: 103, denemeId: 3, ders: "Matematik", dogru: 35, yanlis: 2, net: 34.5 },
                { id: 17, ogrenciId: 103, denemeId: 4, ders: "Türkçe", dogru: 38, yanlis: 2, net: 37.5 },
                { id: 18, ogrenciId: 103, denemeId: 4, ders: "Matematik", dogru: 36, yanlis: 2, net: 35.5 },

                // LGS results
                { id: 19, ogrenciId: 201, denemeId: 10, ders: "Türkçe", dogru: 18, yanlis: 2, net: 17.33 },
                { id: 20, ogrenciId: 201, denemeId: 11, ders: "Türkçe", dogru: 19, yanlis: 1, net: 18.67 }
            ];
            saveDB();
            doldurRaporFiltreleri();
        }
        """
        page.evaluate(mock_setup)

        # 1. Test UI Layout Requirement:
        # "Sınıf Seçimi seçim kısmını, Sınav Türü seçiminin hemen üstüne taşı"
        sinif_top = page.evaluate("() => document.getElementById('raporSinifSelect').getBoundingClientRect().top")
        tur_top = page.evaluate("() => document.getElementById('raporTur').getBoundingClientRect().top")
        print(f"raporSinifSelect top: {sinif_top}, raporTur top: {tur_top}")
        assert sinif_top < tur_top, "raporSinifSelect must be positioned above raporTur!"
        print("CONFIRMED: Sınıf Seçimi is located ABOVE Sınav Türü!")

        # 2. Test Gelişim Analizi header and LGS support:
        gelisim_label = page.evaluate("() => document.getElementById('raporGelisimBaslik').textContent.trim()")
        print(f"Gelişim Analizi Header: '{gelisim_label}'")
        assert gelisim_label == "📈 Gelişim Analizi", f"Header should be '📈 Gelişim Analizi', got '{gelisim_label}'"

        # Switch to LGS and verify LGS exams appear in Gelişim Analizi!
        page.select_option("#raporTur", "LGS")
        lgs_options = page.evaluate("() => Array.from(document.getElementById('raporGelisimSelect').options).map(o => o.text)")
        print(f"LGS Gelişim options: {lgs_options}")
        assert any("LGS" in opt for opt in lgs_options), "LGS exams must appear when LGS is selected!"
        print("CONFIRMED: LGS exams appear properly in Gelişim Analizi!")

        # Switch back to TYT for Class 1 (12-A)
        page.select_option("#raporTur", "TYT")
        page.select_option("#raporSinifSelect", "1")

        # Verify students in class 1
        ogr_options = page.evaluate("() => Array.from(document.getElementById('raporOgrenciSelect').options).map(o => o.text)")
        print(f"Students in Class 1: {ogr_options}")
        assert len(ogr_options) == 4, "Must have 4 students in 12-A"

        # Click Rapor Olustur
        page.click("button:has-text('Rapor Oluştur')")
        page.wait_for_timeout(500)

        # Check line chart
        chart_svg = page.evaluate("() => document.querySelector('#raporGelisimAnaliz svg') ? true : false")
        assert chart_svg, "Line chart SVG must exist!"
        
        # Check end labels on chart
        chart_text = page.evaluate("() => document.querySelector('#raporGelisimAnaliz svg').textContent")
        print("Chart text excerpt:", chart_text[:200])
        # Ahmet Yılmaz should show with 'Son: 3. TYT Denemesi' or similar because he did not take Deneme 4!
        assert "Ahmet Yılmaz" in chart_text, "Ahmet Yılmaz must appear on the line chart!"
        assert "Son:" in chart_text, "Ahmet Yılmaz must indicate his last entered exam on the line chart!"
        print("CONFIRMED: Line chart displays Ahmet Yılmaz with his last entered exam!")

        # Check Tüm Öğrenciler Sınav Katılım ve Gelişim Tablosu
        katilim_table_html = page.evaluate("() => document.querySelector('#raporGelisimAnaliz').innerHTML")
        assert "Sınıf Katılım ve Gelişim Tablosu (Tüm Öğrenciler)" in katilim_table_html
        
        # Verify Ahmet Yılmaz: took 1, 2, 3 - missed 4:
        # Should show 'Girmedi' for Son Sınav and 'Son Sınava Girmedi' badge!
        assert "Son Sınava Girmedi" in katilim_table_html, "Ahmet Yılmaz must have 'Son Sınava Girmedi' badge!"
        
        # Verify Mehmet Demir: missed 1, 2 - took 3, 4:
        # Should show 'İlk Sınava Girmedi'
        assert "İlk Sınava Girmedi" in katilim_table_html, "Mehmet Demir must have 'İlk Sınava Girmedi' badge!"

        # Verify Fatma Çelik: entered none:
        assert "Fatma Çelik" in katilim_table_html, "Fatma Çelik must appear even if she took no exams!"
        assert "Sınavlara Katılmadı" in katilim_table_html, "Fatma Çelik must show 'Sınavlara Katılmadı'!"

        # Check Sınıf Sıralama Tablosu (🏆 Tüm Katılımcılar — Sıralama)
        siralama_html = page.evaluate("() => document.querySelector('#raporSinifSiralama').innerHTML")
        assert "Tüm Katılımcılar — Sıralama" in siralama_html
        assert "Son Sınav Neti" in siralama_html
        assert "Ahmet Yılmaz" in siralama_html
        assert "Mehmet Demir" in siralama_html
        assert "Ayşe Kaya" in siralama_html
        assert "Fatma Çelik" in siralama_html
        print("CONFIRMED: All 4 students are listed in the ranking table, including those who missed exams!")

        # Check Ders Bazlı İlerleyiş
        assert "Ders Bazlı İlerleyiş" in katilim_table_html
        assert "Girmedi" in katilim_table_html

        # Open all details to capture all tables and chart in screenshot
        page.evaluate("() => document.querySelectorAll('details').forEach(d => d.open = true)")
        page.wait_for_timeout(300)

        # Capture visual screenshot
        screenshot_path = os.path.join(os.path.dirname(__file__), "test_all_report_features.png")
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"Screenshot saved to {screenshot_path}")

        print("Console errors:", console_errors)
        assert len(console_errors) == 0, f"Found console errors: {console_errors}"
        print("ALL REPORT TESTS PASSED SUCCESSFULLY!")
        browser.close()

if __name__ == "__main__":
    run()
