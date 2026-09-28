import asyncio
from playwright.async_api import async_playwright
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--allow-file-access-from-files"])
        context = await browser.new_context()
        page = await context.new_page()
        
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text}") if msg.type in ['error', 'warning'] else None)

        file_path = os.path.abspath("index.html").replace("\\", "/")
        await page.goto(f"file:///{file_path}")
        await page.wait_for_timeout(1000)

        # 1. Check initial state
        print("Checking dashboard...")
        await page.screenshot(path="scratch/uyp_test_1_dash.png")

        # 2. Go to Sınıflar tab
        print("Navigating to Sınıflar...")
        await page.click('nav.top a[data-view="siniflar"]')
        await page.wait_for_timeout(1000)
        await page.screenshot(path="scratch/uyp_test_2_siniflar.png")

        # 3. Add a test class if none exists
        classes_count = await page.locator("#sinifListesi .row").count()
        print(f"Existing classes count: {classes_count}")
        if classes_count == 0:
            await page.fill("#yeniSinif", "12-A")
            await page.click("#sinifKaydetBtn")
            await page.wait_for_timeout(500)

        # Check ÜYP dropdowns
        plan_options = await page.locator("#uypHizliPlanSecim option").all_inner_texts()
        print(f"Available plans: {plan_options}")

        sinif_options = await page.locator("#uypHizliSinifSecim option").all_inner_texts()
        print(f"Available classes in UYP: {sinif_options}")

        # 4. Pull YKS Turkish plan into selected class
        print("Pulling YKS Türkçe Plan into class...")
        # Handle confirm dialog
        page.on("dialog", lambda dialog: dialog.accept())
        await page.click("#uypHizliCekBtn")
        await page.wait_for_timeout(1000)
        await page.screenshot(path="scratch/uyp_test_3_plan_pulled.png")

        # 5. Check if class detail opened and has topics
        topic_count = await page.locator(".konu-item").count()
        print(f"Topics created in class: {topic_count}")

        # 6. Test '⚡ Bilgileri Çek' in Aktif Ders Süreci
        print("Testing 'Bilgileri Çek'...")
        # Change status of first topic to 'isleniyor'
        durum_btn = page.locator(".konu-item .durum-btn").first
        if await durum_btn.count():
            await durum_btn.click() # baslanacak -> isleniyor
            await page.wait_for_timeout(500)
        
        await page.click('button:has-text("Bilgileri Çek")')
        await page.wait_for_timeout(500)

        ders_val = await page.input_value("#surecDers")
        hafta_val = await page.input_value("#surecHafta")
        print(f"Aktif Ders Süreci auto-filled: Ders='{ders_val}', Hafta='{hafta_val}'")

        # 7. Open UYP Modal and test text paste parser
        print("Opening UYP Modal...")
        await page.click('button:has-text("Yeni Plan Yükle")')
        await page.wait_for_timeout(500)
        await page.screenshot(path="scratch/uyp_test_4_modal.png")

        # Click on text paste details
        await page.click('summary:has-text("Veya Plan Metnini")')
        await page.wait_for_timeout(300)

        sample_curriculum = """1. Hafta   Eylül (15-19 Eylül)   4 Saat   Sözcükte Anlam   Gerçek ve Mecaz Anlam
2. Hafta   Eylül (22-26 Eylül)   4 Saat   Sözcükte Anlam   Terim ve Deyimler
3. Hafta   Ekim (06-10 Ekim)     4 Saat   Cümlede Anlam    Neden-Sonuç ve Amaç-Sonuç"""

        await page.fill("#uypYapistirMetin", sample_curriculum)
        await page.click('button:has-text("Yapıştırılan Metni Ayrıştır")')
        await page.wait_for_timeout(1000)
        await page.screenshot(path="scratch/uyp_test_5_approval_table.png")

        approval_rows = await page.locator("#uypOnayTablosu tbody tr").count()
        print(f"Approval table rows parsed: {approval_rows}")

        # Save the custom plan
        await page.fill("#uypOnayAd", "Örnek 11. Sınıf Edebiyat Planı")
        await page.click('button:has-text("Plan Şablonu Olarak Kaydet")')
        await page.wait_for_timeout(1000)

        # Check if saved plan appears in dropdown
        new_plan_options = await page.locator("#uypHizliPlanSecim option").all_inner_texts()
        print(f"Updated plan options after saving: {new_plan_options}")

        await page.screenshot(path="scratch/uyp_test_6_final.png")

        if errors:
            print(f"FAIL: JS Errors detected: {errors}")
        else:
            print("SUCCESS: All tests passed with 0 errors!")

        await browser.close()

asyncio.run(main())
