import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=['--allow-file-access-from-files'])
    page = browser.new_page()
    page.goto('file:///c:/Users/egeme/OneDrive/Desktop/CODEX/EdTech/ogrenci-takip/index.html')
    page.wait_for_timeout(600)
    page.evaluate('''() => {
        DB.siniflar = [{ id: 1, ad: '12-A SAY' }, { id: 2, ad: '12-B EA' }];
        DB.ogrenciler = [
            { id: 10, sinifId: 1, adSoyad: 'Ahmet Yılmaz', veli: '555111' },
            { id: 20, sinifId: 1, adSoyad: 'Zeynep Kaya', veli: '555222' },
            { id: 30, sinifId: 2, adSoyad: 'Mehmet Demir', veli: '555333' }
        ];
        saveDB();
        goto('deneme');
        denTab('pdf');
        const parsedData = {
            sinavTuru: 'TYT',
            sinavAdi: 'Özdebir TYT 1',
            sinavTarihi: '2026-10-05',
            ogrenciler: [
                {
                    sira: 1, ogrNo: '101', adSoyad: 'AHMET YILMAZ', sinif: '12-A SAY',
                    mevcutOgrenci: true, eslesenOgrenciId: 10, eslesmeTuru: 'auto',
                    adSim: 100, soyadSim: 100, toplamSim: 100, seciliSinifId: 1, dahilEt: true,
                    toplam: { net: 85.5 }, puan: 410.25,
                    dersSonuclari: [{ ders: 'Türkçe', dogru: 35, yanlis: 5, bos: 0, net: 33.75 }]
                },
                {
                    sira: 2, ogrNo: '102', adSoyad: 'ZEYNP KY', sinif: '12-A',
                    mevcutOgrenci: true, eslesenOgrenciId: 20, eslesmeTuru: 'manual',
                    adSim: 67, soyadSim: 67, toplamSim: 67, seciliSinifId: 1, dahilEt: true,
                    toplam: { net: 78.0 }, puan: 385.5,
                    dersSonuclari: [{ ders: 'Türkçe', dogru: 30, yanlis: 6, bos: 4, net: 28.5 }]
                },
                {
                    sira: 3, ogrNo: '103', adSoyad: 'M DEM R', sinif: '12-B',
                    mevcutOgrenci: false, eslesenOgrenciId: null, eslesmeTuru: 'none',
                    adSim: 0, soyadSim: 0, toplamSim: 0, seciliSinifId: 2, dahilEt: true,
                    toplam: { net: 65.0 }, puan: 320.0,
                    dersSonuclari: [{ ders: 'Türkçe', dogru: 25, yanlis: 10, bos: 5, net: 22.5 }]
                }
            ]
        };
        renderPdfOnayPaneli(parsedData);
    }''')
    page.wait_for_timeout(600)
    page.screenshot(path='ogrenci-takip/scratch/test_table_with_manual_match.png')
    browser.close()
print('Table screenshot saved.')
