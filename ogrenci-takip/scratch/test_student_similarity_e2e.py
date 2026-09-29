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

        # 1. Reset DB with known base students
        print("=== 1. SETUP BASE DATABASE ===")
        setup_res = await page.evaluate("""
            () => {
                window.DB.siniflar = [
                    { id: 101, ad: '8-A' },
                    { id: 102, ad: '11-B' }
                ];
                window.DB.ogrenciler = [
                    { id: 1, adSoyad: 'Hüseyin Umut Arslan', sinifId: 102, alan: '', veli: 'Öğr No: 1001' },
                    { id: 2, adSoyad: 'Rıfat Ali Yeşilyurt', sinifId: 101, alan: '', veli: 'Öğr No: 1002' },
                    { id: 3, adSoyad: 'Ela Akbaş', sinifId: 101, alan: '', veli: 'Öğr No: 1003' },
                    { id: 4, adSoyad: 'Mehmet Efe Eker', sinifId: 102, alan: '', veli: 'Öğr No: 1004' },
                    { id: 5, adSoyad: 'Zeynep Kaya', sinifId: 102, alan: '', veli: 'Öğr No: 1005' }
                ];
                window.DB.denemeler = [];
                window.DB.sonuclar = [];
                localStorage.setItem('ogrenciTakip', JSON.stringify(window.DB));
                return { ogrenciler: window.DB.ogrenciler.length };
            }
        """)
        print(f"Base students loaded: {setup_res['ogrenciler']}")

        # 2. Go to Deneme -> PDF tab
        await page.click('nav.top a[data-view="deneme"]')
        await page.wait_for_timeout(300)
        await page.click('#denTabPdf')
        await page.wait_for_timeout(300)

        # 3. Simulate parsing a new exam text with:
        # - Row 1: "HÜSEYİN UMU ARSLAN" with DIFFERENT student no (99999) -> Should auto-match to ID 1!
        # - Row 2: "RIFAT AL YEŞİLYURT" with DIFFERENT student no (88888) -> Should auto-match to ID 2!
        # - Row 3: "ELA AKBAŞ" -> Exact match -> ID 3
        # - Row 4: "CANAN DEMİR" -> New student (no match in DB >= 60%)
        # - Row 5: "MEHMET ARDA" -> Unmatched initially, but we will test manually binding to "Mehmet Efe Eker"!
        print("\n=== 2. PARSE EXAM TEXT WITH DIFFERING NAMES & DIFFERENT STUDENT NOS ===")
        sample_exam_text = (
            "LGS ŞUBE NET-PUAN LİSTESİ\n"
            "15.10.2026 - 8020 - TDP İKİNCİ DENEME   İzmit - KOCAELİ - İZMİT\n"
            "Öğr No   Ad Soyad   Sınıf   Kit   Türkçe   Sosyal / Hayat   Din Kült.   İngilizce   Matematik   Fen Bil.   Toplam   LGS\n"
            "1   99999   HÜSEYİN UMU ARSLAN   804   AA   15   5   13,33   8   2   7,33   9   1   8,67   8   2   7,33   7   3   6,00   12   6   10,00   59   19   52,66   350,120\n"
            "2   88888   RIFAT AL YEŞİLYURT   804   AA   14   6   12,00   7   2   6,33   9   1   8,67   8   2   7,33   6   4   4,67   11   7   8,67   55   22   47,67   333,825\n"
            "3   77777   ELA AKBAŞ   804   AA   14   2   13,33   8   2   7,33   10   0   10,00   9   1   8,67   3   1   2,67   8   1   7,67   52   7   49,67   331,796\n"
            "4   66666   CANAN DEMİR   804   AA   10   5   8,33   6   2   5,33   7   1   6,67   5   2   4,33   4   2   3,33   8   4   6,67   40   16   34,66   260,000\n"
            "5   55555   MEHMET ARDA   804   AA   12   4   10,67   7   2   6,33   8   1   7,67   6   2   5,33   5   3   4,00   9   5   7,33   47   17   41,33   290,000"
        )

        await page.click('button:has-text("veya Metin Yapıştır")')
        await page.fill('#pdfMetinInput', sample_exam_text)
        await page.click('button:has-text("Metni Çözümle")')

        await page.wait_for_selector('#pdfOnayAlani:not(.hidden)', timeout=5000)

        # Check matched state
        rows_status = await page.evaluate("""
            () => {
                const rows = [];
                for (let i = 0; i < 5; i++) {
                    const sel = document.getElementById('pdf_ogrenci_' + i);
                    const durum = document.getElementById('pdf_durum_' + i);
                    const ad = document.getElementById('pdf_ad_' + i);
                    rows.push({
                        idx: i,
                        ad: ad ? ad.value : '',
                        selectedVal: sel ? sel.value : '',
                        durumText: durum ? durum.innerText.trim() : ''
                    });
                }
                return rows;
            }
        """)

        print("\n=== INITIAL MATCH EVALUATION ===")
        for r in rows_status:
            print(f"Row {r['idx']}: '{r['ad']}' -> Selected: '{r['selectedVal']}', Status: '{r['durumText']}'")

        # Verify auto-matching
        assert rows_status[0]['selectedVal'] == '1', f"Row 0 (HÜSEYİN UMU ARSLAN) should match student ID 1, got {rows_status[0]['selectedVal']}"
        assert rows_status[1]['selectedVal'] == '2', f"Row 1 (RIFAT AL YEŞİLYURT) should match student ID 2, got {rows_status[1]['selectedVal']}"
        assert rows_status[2]['selectedVal'] == '3', f"Row 2 (ELA AKBAŞ) should match student ID 3, got {rows_status[2]['selectedVal']}"
        assert rows_status[3]['selectedVal'] == 'NEW', f"Row 3 (CANAN DEMİR) should be NEW, got {rows_status[3]['selectedVal']}"
        print("✓ Auto-matching verified successfully! (Ad & Soyad %60 similarity satisfied)")

        # 4. Test User Requirement: "eşleşmeyen öğrenci adını değiştirebileyim ve daha önce verisini girdiğim öğrenci verisine dahil edeyim"
        # Let's test editing the name of Row 3 from "CANAN DEMİR" to "Zeynep Kaya":
        print("\n=== 3. TEST REAL-TIME NAME EDITING & RE-MATCHING ===")
        await page.fill('#pdf_ad_3', 'Zeynep Kay')
        await page.dispatch_event('#pdf_ad_3', 'input')
        await page.wait_for_timeout(300)

        row3_after_type = await page.evaluate("""
            () => {
                const sel = document.getElementById('pdf_ogrenci_3');
                const durum = document.getElementById('pdf_durum_3');
                return { selectedVal: sel ? sel.value : '', durumText: durum ? durum.innerText.trim() : '' };
            }
        """)
        print(f"Row 3 after typing 'Zeynep K.': Selected: '{row3_after_type['selectedVal']}', Status: '{row3_after_type['durumText']}'")
        assert row3_after_type['selectedVal'] == '5', f"Row 3 should now auto-match student ID 5 (Zeynep Kaya), got {row3_after_type['selectedVal']}"
        print("✓ Real-time name editing instantly re-matched to existing student!")

        # 5. Test User Requirement: "Yani bu şu öğrencinin diye ismini değişebileyim yahut önceden var olan öğrencinin deneme sonucu bu diye ekleyebileyim."
        # Let's test manually selecting existing student from the dropdown for Row 4 (MEHMET ARDA -> Mehmet Efe Eker, ID: 4)
        print("\n=== 4. TEST MANUAL ASSIGNMENT VIA DROPDOWN ===")
        await page.select_option('#pdf_ogrenci_4', '4')
        await page.wait_for_timeout(300)

        row4_status = await page.evaluate("""
            () => {
                const sel = document.getElementById('pdf_ogrenci_4');
                const durum = document.getElementById('pdf_durum_4');
                return { selectedVal: sel ? sel.value : '', durumText: durum ? durum.innerText.trim() : '' };
            }
        """)
        print(f"Row 4 after manual select: Selected: '{row4_status['selectedVal']}', Status: '{row4_status['durumText']}'")
        assert row4_status['selectedVal'] == '4', f"Row 4 should be bound to student ID 4, got {row4_status['selectedVal']}"
        assert 'Manuel' in row4_status['durumText']
        print("✓ Manual student binding via dropdown verified!")

        # 6. Click Save and Verify Final Database State
        print("\n=== 5. SAVE EXAM AND VERIFY NO DUPLICATES ===")
        await page.click('#pdfOnayBtn')
        await page.wait_for_timeout(1500)

        final_db = await page.evaluate("""
            () => {
                return {
                    totalStudents: window.DB.ogrenciler.length,
                    students: window.DB.ogrenciler.map(o => ({ id: o.id, adSoyad: o.adSoyad })),
                    totalExams: window.DB.denemeler.length,
                    examName: window.DB.denemeler[0]?.ad,
                    totalScores: window.DB.sonuclar.length,
                    scoresByStudent: window.DB.sonuclar.reduce((acc, s) => {
                        acc[s.ogrenciId] = (acc[s.ogrenciId] || 0) + 1;
                        return acc;
                    }, {})
                };
            }
        """)

        print(f"Total students in DB after import: {final_db['totalStudents']}")
        print(f"Students in DB: {final_db['students']}")
        print(f"Total scores saved: {final_db['totalScores']}")
        print(f"Scores by Student ID: {final_db['scoresByStudent']}")

        # Since all 5 rows were matched/bound to existing students (IDs 1, 2, 3, 5, 4):
        # NO new duplicate students should have been created! Total students should still be 5!
        assert final_db['totalStudents'] == 5, f"Expected exactly 5 students (no duplicates), found {final_db['totalStudents']}"
        assert len(final_db['scoresByStudent'].keys()) == 5, "All 5 existing students should have scores!"
        print("\n🎉 PERFECT! All results attached to existing students without any duplicates created!")

        await page.screenshot(path="scratch/test_smart_matching_result.png")
        await browser.close()

asyncio.run(main())
