# 🎓 Egemen's EdTech — Eğitim Yönetim & Materyal Platformu

> **Canlı Bağlantı:** [https://egemenbilim.github.io/edtech/](https://egemenbilim.github.io/edtech/)

Öğretmenler ve eğitimciler için veri odaklı öğrenci takibi, sınav hazırlığı ve yapay zekâ destekli pedagojik materyal üretimini tek çatı altında toplayan bütünleşik web platformu.

---

## 🏛️ Proje Mimarisi ve Dizin Hiyerarşisi

Proje, modern tarayıcı standartlarında çalışan **Native JavaScript ES Modules (`type="module"`)** mimarisine sahiptir. Herhangi bir derleme (build), paketleme (bundler) veya Node.js bağımlılığı gerektirmez; doğrudan GitHub Pages üzerinde çalışır.

```text
EdTech/
│
├── 🌐 index.html                       # Ana Portal / Karşılama Ekranı
├── 📄 README.md                        # Depo Dokümantasyonu
│
├── 📁 ogrenci-takip/                   # 1. Öğrenci Takip Sistemi (Modüler)
│   ├── index.html                      # Uygulama Arayüzü
│   ├── css/
│   │   └── style.css                   # Panel Stilleri ve A4 Yazdırma (Print) Kuralları
│   └── js/
│       ├── state.js                    # Veritabanı (DB), LocalStorage & Sabitler
│       ├── utils.js                    # Toast, Net Hesaplama, SVG Çizim Motorları
│       ├── main.js                     # Navigasyon, Sekmeler ve Global Orkestrasyon
│       └── modules/
│           ├── dashboard.js            # Özet İstatistik Kartları
│           ├── siniflar.js             # Sınıf Yönetimi, Konu Takibi & Aktif Ders Süreci
│           ├── ogrenciler.js           # Öğrenci Listesi, Detay Analizi, PDF & Toplu Giriş
│           ├── denemeler.js            # Tekli / AI Toplu Deneme Girişi & Parser
│           ├── haftalik.js             # Haftalık Soru Takibi, Branş Raporu & Pasta Grafik
│           ├── raporlar.js             # Gelişim Analizi, Başarı Sıralaması & Rapor PDF
│           └── backup.js               # JSON Yedekleme (Dışa/İçe Aktar)
│
├── 📁 prompt-deposu/                   # 2. Eğitim Promptları Deposu (Modüler)
│   ├── index.html                      # Prompt Üretici Arayüzü
│   ├── css/
│   │   └── style.css                   # Cyber-Neural Glow Studio (HTML5 Canvas Parçacık Ağı, 3D Tilt & Neon Işıltılar)
│   └── js/
│       ├── templates.js                # 9 Hazır Pedagojik Prompt Şablonu & Kurallar
│       ├── utils.js                    # Siber Toast Bildirimleri & Form Doğrulama
│       └── main.js                     # Canvas Parçacık Motoru, 3D Tilt, Canlı Daktilo Akışı, Konfeti & Ses Sentezleyici
│
└── 📁 egemens-testmaker/               # 3. Sınav Hazırlama Aracı (Modüler)
    ├── index.html                      # Testmaker Çalışma Alanı
    ├── css/
    │   └── style.css
    └── js/
        ├── main.js, state.js, storage.js, utils.js
        └── modules/
            ├── cropTool.js             # Görsel / PDF Soru Kırpma & OCR
            ├── equationEditor.js       # KaTeX Matematiksel Formül Editörü
            ├── pdfEngine.js            # Vektörel PDF Üretim Motoru
            ├── previewStage.js         # İnteraktif Önizleme ve Sayfa Düzenleyici
            ├── questionManager.js      # Soru Havuzu ve Sıralama Yönetimi
            ├── sidebar.js              # Şablon ve Test Ayarları (MEB / Klasik)
            ├── textModal.js            # Çoktan Seçmeli, Boşluk Doldurma & Klasik Soru
            └── wordExport.js           # DOCX (Word) Dışa Aktarma Motoru
```

---

## 🚀 Yerel Geliştirme (Localhost)

ES Modülleri güvenlik sebebiyle tarayıcıda `file:///` protokolünde kısıtlamaya tabidir. Yerel makinenizde test etmek için basit bir yerel sunucu başlatabilirsiniz:

```bash
# Python ile:
python -m http.server 8000

# veya Node.js npx ile:
npx serve .

# veya VS Code eklentisi ile:
# "Live Server" butonuna basarak açabilirsiniz.
```

---

## 📄 Lisans & İletişim

- **Geliştirici:** Egemen Bilim
- **İletişim:** [egemenbilim@gmail.com](mailto:egemenbilim@gmail.com)
- **Instagram:** [@egemenbilim](https://www.instagram.com/egemenbilim/)
