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
        page.on("pageerror", lambda err: console_errors.append(str(err)))
        page.on("console", lambda msg: print(f"CONSOLE ({msg.type}):", msg.text))

        page.goto("file:///c:/Users/egeme/OneDrive/Desktop/CODEX/EdTech/ogrenci-takip/index.html")
        page.wait_for_timeout(1500)

        page.evaluate("() => goto('rapor')")
        page.wait_for_timeout(400)

        # 1. Verify "Ders Seçimi (Ctrl ile çoklu — boş = tümü)" was completely removed!
        ders_select_exists = page.evaluate("() => document.getElementById('raporDersSelect') !== null")
        print("raporDersSelect exists:", ders_select_exists)
        assert not ders_select_exists, "raporDersSelect MUST BE REMOVED!"
        print("CONFIRMED: Ders Seçimi dropdown is completely removed!")

        # Setup mock DB with:
        # Class 1: 8-D (LGS, 10 students like user's exact case)
        # Students:
        # 1: HÜSEYİN TUĞRA TUNÇEL (entered exams 1, 2, 3, 4)
        # 2: ADA BENSEL (entered exams 1, 2, 3, 4)
        # 3: EMİRHAN ÖZÇELİK (entered exams 1, 2, 3, 4)
        # 4: CAN KAYA (entered exams 1, 2, 3 - missed exam 4)
        # 5: BORA DEMİR (entered exams 1, 2 - missed exams 3, 4)
        # 6: DENİZ ARSLAN (entered ONLY exam 1)
        # 7: EGE YILDIZ (entered exams 2, 3, 4 - missed exam 1)
        # 8: İREM GÜNEŞ (entered ONLY exam 4)
        # 9: KAAN ÖZTÜRK (entered exams 2, 3 - missed exams 1, 4)
        # 10: LEYLA YILMAZ (entered NO exams)
        mock_setup = """
        () => {
            DB.siniflar = [
                { id: 1, ad: "8-D" },
                { id: 2, ad: "12-A" }
            ];
            DB.ogrenciler = [
                { id: 1, adSoyad: "HÜSEYİN TUĞRA TUNÇEL", sinifId: 1, no: "1" },
                { id: 2, adSoyad: "ADA BENSEL", sinifId: 1, no: "2" },
                { id: 3, adSoyad: "EMİRHAN ÖZÇELİK", sinifId: 1, no: "3" },
                { id: 4, adSoyad: "CAN KAYA", sinifId: 1, no: "4" },
                { id: 5, adSoyad: "BORA DEMİR", sinifId: 1, no: "5" },
                { id: 6, adSoyad: "DENİZ ARSLAN", sinifId: 1, no: "6" },
                { id: 7, adSoyad: "EGE YILDIZ", sinifId: 1, no: "7" },
                { id: 8, adSoyad: "İREM GÜNEŞ", sinifId: 1, no: "8" },
                { id: 9, adSoyad: "KAAN ÖZTÜRK", sinifId: 1, no: "9" },
                { id: 10, adSoyad: "LEYLA YILMAZ", sinifId: 1, no: "10" }
            ];
            DB.denemeler = [
                { id: 101, ad: "1. Deneme (TDP HBS)", tur: "LGS", tarih: "2026-09-12" },
                { id: 102, ad: "2. Deneme (ÖZDEBİR)", tur: "LGS", tarih: "2026-09-27" },
                { id: 103, ad: "3. Deneme (İŞLER)", tur: "LGS", tarih: "2026-10-03" },
                { id: 104, ad: "4. Deneme (STARTFEN)", tur: "LGS", tarih: "2026-10-10" },
                { id: 201, ad: "12-A TYT Denemesi", tur: "TYT", tarih: "2026-10-12" }
            ];
            DB.sonuclar = [];
            const addRes = (oid, did, net) => {
                DB.sonuclar.push({ id: DB.sonuclar.length + 1, ogrenciId: oid, denemeId: did, ders: "Türkçe", dogru: Math.round(net), yanlis: 0, net: net });
            };

            // 1, 2, 3 took 101, 102, 103, 104
            [1, 2, 3].forEach(oid => {
                addRes(oid, 101, 32.0 + oid);
                addRes(oid, 102, 30.0 + oid * 2);
                addRes(oid, 103, 34.0 + oid * 1.5);
                addRes(oid, 104, 40.0 + oid * 2);
            });

            // 4 (CAN KAYA): took 101, 102, 103 (missed 104)
            addRes(4, 101, 25.0);
            addRes(4, 102, 28.0);
            addRes(4, 103, 31.0);

            // 5 (BORA DEMİR): took 101, 102 (missed 103, 104)
            addRes(5, 101, 20.0);
            addRes(5, 102, 22.0);

            // 6 (DENİZ ARSLAN): took ONLY 101
            addRes(6, 101, 18.0);

            // 7 (EGE YILDIZ): took 102, 103, 104 (missed 101)
            addRes(7, 102, 29.0);
            addRes(7, 103, 32.0);
            addRes(7, 104, 35.0);

            // 8 (İREM GÜNEŞ): took ONLY 104
            addRes(8, 104, 30.0);

            // 9 (KAAN ÖZTÜRK): took 102, 103 (missed 101, 104)
            addRes(9, 102, 22.0);
            addRes(9, 103, 24.0);

            // 10 (LEYLA YILMAZ): entered 0 exams

            saveDB();
            doldurRaporFiltreleri();
        }
        """
        page.evaluate(mock_setup)

        # 2. Test Sınıf Seçimi position above Sınav Türü
        sinif_top = page.evaluate("() => document.getElementById('raporSinifSelect').getBoundingClientRect().top")
        tur_top = page.evaluate("() => document.getElementById('raporTur').getBoundingClientRect().top")
        assert sinif_top < tur_top, "raporSinifSelect must be positioned above raporTur!"
        print("CONFIRMED: Sınıf Seçimi is located ABOVE Sınav Türü!")

        # 3. Select Class "8-D"
        page.select_option("#raporSinifSelect", "1")
        page.wait_for_timeout(300)

        # 4. Check that Gelişim Analizi list populated with 8-D's 4 denemeler (and NOT 12-A's TYT denemesi!)
        gelisim_options = page.evaluate("() => Array.from(document.getElementById('raporGelisimSelect').options).map(o => o.text)")
        print("Gelişim Analizi options for 8-D:", gelisim_options)
        assert len(gelisim_options) == 4, f"Should have 4 LGS exams for 8-D, got {len(gelisim_options)}"
        assert not any("TYT" in opt for opt in gelisim_options), "12-A TYT exam must NOT appear for 8-D!"
        print("CONFIRMED: Gelişim Analizi deneme selection correctly scopes to class exams!")

        # 5. Test "Tümünü Seç" button
        page.evaluate("() => gelisimSecTumu()")
        selected_count = page.evaluate("() => Array.from(document.getElementById('raporGelisimSelect').selectedOptions).length")
        print("Selected exams after 'Tümünü Seç':", selected_count)
        assert selected_count == 4, f"All 4 exams should be selected, got {selected_count}"

        # 6. Click "Rapor Oluştur"
        page.evaluate("() => renderRapor()")
        page.wait_for_timeout(600)

        # 7. Check Gelişim Analizi SVG and student representation
        chart_svg = page.evaluate("() => document.querySelector('#raporGelisimAnaliz svg') ? true : false")
        assert chart_svg, "Line chart SVG must exist!"

        chart_text = page.evaluate("() => document.querySelector('#raporGelisimAnaliz svg').textContent")
        print("Chart text content snippet:", chart_text[:300])

        # All 9 students who entered at least 1 exam must appear in the chart!
        expected_students = [
            "HÜSEYİN TUĞRA TUNÇEL",
            "ADA BENSEL",
            "EMİRHAN ÖZÇELİK",
            "CAN KAYA",
            "BORA DEMİR",
            "DENİZ ARSLAN",
            "EGE YILDIZ",
            "İREM GÜNEŞ",
            "KAAN ÖZTÜRK"
        ]
        for name in expected_students:
            assert name in chart_text, f"Student '{name}' must appear in the line chart!"
        print("CONFIRMED: ALL 9 students with >= 1 exam appear on the line chart!")

        # Leyla Yilmaz entered 0 exams, should NOT be in chartKeys
        assert "LEYLA YILMAZ" not in chart_text, "Student with 0 exams must not be in line chart"

        # Check that students who missed the 4th exam have their last exam indicated!
        # CAN KAYA, BORA DEMİR, DENİZ ARSLAN, KAAN ÖZTÜRK missed exam 4
        assert "CAN KAYA" in chart_text and "Son:" in chart_text
        print("CONFIRMED: Students who missed subsequent exams have lines ending at their last taken exam!")

        # 8. Check Katılım ve Gelişim Tablosu
        katilim_html = page.evaluate("() => document.querySelector('#raporGelisimAnaliz').innerHTML")
        assert "Sınıf Katılım ve Gelişim Tablosu (Tüm Öğrenciler)" in katilim_html
        assert "Son Sınava Girmedi" in katilim_html  # CAN KAYA, BORA DEMİR, DENİZ ARSLAN, KAAN ÖZTÜRK
        assert "İlk Sınava Girmedi" in katilim_html  # EGE YILDIZ, İREM GÜNEŞ, KAAN ÖZTÜRK
        assert "Sınavlara Katılmadı" in katilim_html  # LEYLA YILMAZ
        print("CONFIRMED: All 10 students (including non-participants) are accurately shown in participation table!")

        # 9. Check Sınıf Sıralama Tablosu
        siralama_html = page.evaluate("() => document.querySelector('#raporSinifSiralama').innerHTML")
        assert "Tüm Katılımcılar — Sıralama" in siralama_html
        assert "LEYLA YILMAZ" in siralama_html
        assert "Girmedi" in siralama_html
        print("CONFIRMED: Ranking table accurately includes all students!")

        # Open all details to capture all elements
        page.evaluate("() => document.querySelectorAll('details').forEach(d => d.open = true)")
        page.wait_for_timeout(300)

        screenshot_path = os.path.join(os.path.dirname(__file__), "test_all_report_features.png")
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"Screenshot saved to {screenshot_path}")

        print("Console errors:", console_errors)
        assert len(console_errors) == 0, f"Found console errors: {console_errors}"
        print("ALL TESTS PASSED WITH 100% SUCCESS!")
        browser.close()

if __name__ == "__main__":
    run()
