import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=['--allow-file-access-from-files'])
    page = browser.new_page()
    page.goto('file:///c:/Users/egeme/OneDrive/Desktop/CODEX/EdTech/ogrenci-takip/index.html')
    page.wait_for_timeout(500)
    page.evaluate('''() => {
        if (DB.siniflar.length === 0) DB.siniflar.push({ id: 1, ad: '12-A SAY' });
        if (DB.ogrenciler.length === 0) DB.ogrenciler.push({ id: 1, sinifId: 1, adSoyad: 'Ahmet Yılmaz', veli: '5551112233' });
        saveDB();
        goto('haftalik');
        $('hfOgrenci').value = '1';
        hfOgrenciSecildi('1');
        $('hfBas').value = '2026-09-25';
        $('hfBit').value = '2026-10-02';
        $('hfHedef').value = '120';
        $('hfOdevDurum').value = 'Verildi';
        $('hfBaslik').value = 'Trigonometri Test 1-5 & Fasikül Tekrarı';
        hfYildizSec(4);
        hfKaydet();
    }''')
    page.wait_for_timeout(500)
    page.screenshot(path='ogrenci-takip/scratch/haftalik_view.png', full_page=True)
    browser.close()
print('Haftalik screenshot saved successfully.')
