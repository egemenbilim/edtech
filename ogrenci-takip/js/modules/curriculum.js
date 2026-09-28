/* ══════════════════════════════════════════════════════
   Öğrenci Takip Sistemi — Müfredat & Ders/Konu Taksonomisi
   LGS ve YKS (TYT, AYT Sayısal / Eşit Ağırlık / Sözel)
   Tüm derslerde "📌 Genel" sekmesi mevcuttur.
   ══════════════════════════════════════════════════════ */

import { DB } from '../state.js';

export const SINAV_TURLERI = [
  { id: 'TYT', ad: 'TYT (Temel Yeterlilik)', kademe: 'yks', renk: '#4f46e5' },
  { id: 'AYT-SAY', ad: 'AYT — Sayısal', kademe: 'yks', renk: '#0284c7' },
  { id: 'AYT-EA', ad: 'AYT — Eşit Ağırlık', kademe: 'yks', renk: '#059669' },
  { id: 'AYT-SOZ', ad: 'AYT — Sözel', kademe: 'yks', renk: '#d97706' },
  { id: 'LGS', ad: 'LGS (8. Sınıf / Ortaokul)', kademe: 'lgs', renk: '#dc2626' }
];

export const MURED_DERSLER = {
  /* ═══════════════════════ LGS ═══════════════════════ */
  'LGS': {
    'Türkçe': [
      '📌 Genel',
      'Fiilimsiler (İsim-Fiil, Sıfat-Fiil, Zarf-Fiil)',
      'Sözcükte Anlam ve Söz Grupları',
      'Deyimler, Atasözleri ve Özdeyişler',
      'Cümlenin Ögeleri (Temel ve Yardımcı Ögeler)',
      'Cümlede Anlam ve Anlatım Özellikleri',
      'Paragrafta Anlam ve Ana Düşünce',
      'Paragrafta Yapı ve Bölümler',
      'Metin Türleri ve Sanatları',
      'Fiilde Çatı (Öznesine ve Nesnesine Göre)',
      'Cümle Türleri (Yapısına ve Yüklemine Göre)',
      'Yazım Kuralları',
      'Noktalama İşaretleri',
      'Görsel, Tablo ve Grafik Okuma',
      'Sözel Mantık ve Muhakeme',
      'Anlatım Bozuklukları'
    ],
    'Matematik': [
      '📌 Genel',
      'Çarpanlar ve Katlar (EBOB - EKOK)',
      'Üslü İfadeler',
      'Kareköklü İfadeler',
      'Veri Analizi',
      'Basit Olayların Olma Olasılığı',
      'Cebirsel İfadeler ve Özdeşlikler',
      'Doğrusal Denklemler ve Grafik Çizimi',
      'Eşitsizlikler',
      'Üçgenler (Açı, Kenar, Açıortay, Kenarortay)',
      'Eşlik ve Benzerlik',
      'Dönüşüm Geometrisi',
      'Geometrik Cisimler (Prizma, Silindir, Koni, Piramit)'
    ],
    'Fen Bilimleri': [
      '📌 Genel',
      'Mevsimler ve İklim',
      'DNA ve Genetik Kod',
      'Kalıtım ve Çaprazlamalar',
      'Mutasyon, Modifikasyon, Adaptasyon, Biyoteknoloji',
      'Basınç (Katı, Sıvı, Gaz)',
      'Periyodik Sistem ve Elementlerin Sınıflandırılması',
      'Fiziksel ve Kimyasal Değişimler',
      'Kimyasal Tepkimeler ve Asitler-Bazlar',
      'Maddenin Isı ile Etkileşimi',
      'Basit Makineler (Kaldıraç, Makara, Eğik Düzlem vb.)',
      'Besin Zinciri ve Enerji Akışı',
      'Madde Döngüleri ve Çevre Sorunları',
      'Elektrik Yükleri ve Elektrik Enerjisi'
    ],
    'T.C. İnkılap Tarihi ve Atatürkçülük': [
      '📌 Genel',
      'Bir Kahraman Doğuyor (Mustafa Kemal\'in Hayatı)',
      'Millî Uyanış: Bağımsızlık Yolunda Atılan Adımlar',
      'I. Dünya Savaşı ve Mondros Ateşkesi',
      'Kuvayımilliye ve Genelgeler-Kongreler',
      'TBMM\'nin Açılması ve İsyanlar',
      'Millî Bir Destan: Ya İstiklal Ya Ölüm! (Doğu, Güney, Batı Cephesi)',
      'Mudanya ve Lozan Barış Antlaşması',
      'Atatürkçülük ve Çağdaşlaşan Türkiye (İnkılaplar)',
      'Atatürk İlkeleri',
      'Demokratikleşme Çabaları ve Çok Partili Hayat',
      'Atatürk Dönemi Türk Dış Politikası',
      'Atatürk\'ün Vefatı ve II. Dünya Savaşı Etkileri'
    ],
    'Din Kültürü ve Ahlak Bilgisi': [
      '📌 Genel',
      'Kader ve Kaza İnancı',
      'İnsanın İradesi ve Kader',
      'Zekat ve Sadaka İbadeti',
      'Din ve Hayat (Temel Hakların Korunması)',
      'Hz. Muhammed\'in Doğruluğu, Güvenilirliği ve Merhameti',
      'Hz. Muhammed\'in İstişareye Verdiği Önem ve Cesareti',
      'Kur\'an-ı Kerim ve Özellikleri (Sure ve Ayet Yorumları)'
    ],
    'İngilizce': [
      '📌 Genel',
      'Unit 1: Friendship',
      'Unit 2: Teen Life',
      'Unit 3: In the Kitchen',
      'Unit 4: On the Phone',
      'Unit 5: The Internet',
      'Unit 6: Adventures',
      'Unit 7: Tourism',
      'Unit 8: Chores',
      'Unit 9: Science',
      'Unit 10: Natural Forces'
    ]
  },

  /* ═══════════════════════ TYT ═══════════════════════ */
  'TYT': {
    'Türkçe': [
      '📌 Genel',
      'Sözcükte Anlam ve Söz Öbekleri',
      'Deyimler ve Atasözleri',
      'Cümlede Anlam ve Cümle Yorumu',
      'Paragrafta Anlam ve Ana Düşünce',
      'Paragrafta Yardımcı Düşünceler',
      'Paragrafta Yapı ve Akış',
      'Anlatım Biçimleri ve Düşünceyi Geliştirme Yolları',
      'Ses Bilgisi',
      'Yazım Kuralları',
      'Noktalama İşaretleri',
      'Sözcükte Yapı (Kök, Gövde, Ekler)',
      'İsimler (Adlar) ve Tamlamalar',
      'Sıfatlar (Ön Adlar)',
      'Zamirler (Adıllar)',
      'Zarflar (Belirteçler)',
      'Edat - Bağlaç - Ünlem',
      'Fiiller ve Ek Fiil',
      'Fiilimsiler',
      'Fiilde Çatı',
      'Cümlenin Ögeleri',
      'Cümle Türleri',
      'Anlatım Bozuklukları'
    ],
    'Temel Matematik': [
      '📌 Genel',
      'Temel Kavramlar ve Sayı Kümeleri',
      'Ardışık Sayılar ve Asal Sayılar',
      'Sayı Basamakları ve Basamak Analizi',
      'Bölme ve Bölünebilme Kuralları',
      'Asal Çarpanlara Ayırma, EBOB - EKOK',
      'Rasyonel ve Ondalık Sayılar',
      'Birinci Dereceden Denklemler',
      'Basit Eşitsizlikler',
      'Mutlak Değer',
      'Üslü İfadeler',
      'Köklü İfadeler',
      'Çarpanlara Ayırma ve Özdeşlikler',
      'Oran - Orantı',
      'Sayı ve Kesir Problemleri',
      'Yaş Problemleri',
      'İşçi ve Emek Problemleri',
      'Hız ve Hareket Problemleri',
      'Yüzde, Kâr - Zarar Problemleri',
      'Karışım Problemleri',
      'Grafik ve Tablo Problemleri',
      'Mantık',
      'Kümeler ve Kartezyen Çarpım',
      'Fonksiyonlar (Temel Düzey)',
      'Polinomlar (Temel Düzey)',
      'İkinci Dereceden Denklemler',
      'Permütasyon - Kombinasyon',
      'Binom Açılımı',
      'Olasılık',
      'Veri ve İstatistik'
    ],
    'Geometri': [
      '📌 Genel',
      'Doğruda Açılar',
      'Üçgende Açılar',
      'Özel Üçgenler (Dik, İkizkenar, Eşkenar)',
      'Üçgende Açıortay ve Kenarortay',
      'Üçgende Eşlik ve Benzerlik',
      'Üçgende Alan',
      'Açı-Kenar Bağıntıları',
      'Çokgenler ve Dörtgenler',
      'Paralelkenar ve Eşkenar Dörtgen',
      'Dikdörtgen ve Kare',
      'Yamuk ve Deltoid',
      'Çemberde Açılar',
      'Çemberde Uzunluk ve Teğet-Kiriş',
      'Dairede Alan ve Çevre',
      'Katı Cisimler (Prizma, Silindir, Piramit, Koni, Küre)',
      'Noktanın ve Doğrunun Analitiği'
    ],
    'Fizik': [
      '📌 Genel',
      'Fizik Bilimine Giriş',
      'Madde ve Özellikleri',
      'Sıvıların Kaldırma Kuvveti',
      'Basınç (Katı, Sıvı, Gaz)',
      'Isı, Sıcaklık ve İç Enerji',
      'Genleşme',
      'Doğrusal Hareket',
      'Dinamik ve Newton\'ın Hareket Yasaları',
      'İş, Güç ve Enerji',
      'Elektrostatik',
      'Elektrik Akımı ve Devreler',
      'Mıknatıslar ve Manyetizma',
      'Optik: Aydınlanma ve Gölge',
      'Optik: Düzlem ve Küresel Aynalar',
      'Optik: Kırılma ve Mercekler',
      'Optik: Prizmalar ve Renk',
      'Dalgalar (Yay, Su, Ses, Deprem)'
    ],
    'Kimya': [
      '📌 Genel',
      'Kimya Bilimi',
      'Atom Modelleri ve Atomun Yapısı',
      'Periyodik Sistem ve Özellikleri',
      'Kimyasal Türler Arası Etkileşimler (Güçlü ve Zayıf)',
      'Maddenin Halleri (Katı, Sıvı, Gaz, Plazma)',
      'Doğa ve Kimya (Su, Çevre Kimyası)',
      'Kimyanın Temel Kanunları',
      'Mol Kavramı',
      'Kimyasal Tepkimeler ve Hesaplamalar',
      'Karışımlar ve Ayrıştırma Yöntemleri',
      'Asitler, Bazlar ve Tuzlar',
      'Kimya Her Yerde (Temizlik, Yaygın Polimerler)'
    ],
    'Biyoloji': [
      '📌 Genel',
      'Canlıların Ortak Özellikleri',
      'Canlıların Temel Bileşikleri (İnorganik ve Organik)',
      'Hücre Teorisi ve Hücre Zarından Madde Geçişleri',
      'Hücre Organelleri ve Hücre İskeleti',
      'Canlılar Dünyası ve Sınıflandırma İlkeleri',
      'Hücre Bölünmeleri: Mitoz ve Eşeysiz Üreme',
      'Hücre Bölünmeleri: Mayoz ve Eşeyli Üreme',
      'Kalıtımın Temel Esasları (Mendel Genetiği)',
      'Eşeye Bağlı Kalıtım ve Soyağaçları',
      'Ekosistem Ekolojisi ve Madde Döngüleri',
      'Güncel Çevre Sorunları ve Biyoçeşitlilik'
    ],
    'Tarih': [
      '📌 Genel',
      'Tarih ve Zaman',
      'İnsanlığın İlk Dönemleri',
      'İlk ve Orta Çağlarda Türk Dünyası',
      'İslam Medeniyetinin Doğuşu ve İlk İslam Devletleri',
      'Türklerin İslamiyet\'i Kabulü ve İlk Türk-İslam Devletleri',
      'Yerleşme ve Devletleşme Sürecinde Selçuklu Türkiyesi',
      'Beylikten Devlete Osmanlı Siyaseti (1300-1453)',
      'Dünya Gücü Osmanlı (1453-1595)',
      'Değişen Dünya Dengeleri Karşısında Osmanlı (1595-1774)',
      'Uluslararası İlişkilerde Denge Stratejisi (1774-1914)',
      'XX. Yüzyıl Başlarında Osmanlı Devleti ve I. Dünya Savaşı',
      'Millî Mücadele: Hazırlık Dönemi',
      'Millî Mücadele: Cepheler ve Antlaşmalar',
      'Türk İnkılabı ve Atatürk İlkeleri',
      'Atatürk Dönemi Türk Dış Politikası'
    ],
    'Coğrafya': [
      '📌 Genel',
      'Doğa ve İnsan',
      'Dünyanın Şekli ve Hareketleri',
      'Coğrafi Konum ve Koordinat Sistemi',
      'Harita Bilgisi ve Ölçekler',
      'Atmosfer, Hava Durumu ve İklim',
      'Sıcaklık, Basınç, Rüzgarlar, Nem ve Yağış',
      'İklim Tipleri ve Bitki Örtüsü',
      'İç Kuvvetler (Orojenez, Epirojenez, Volkanizma, Seizma)',
      'Dış Kuvvetler (Akarsu, Rüzgar, Buzul, Dalga)',
      'Kayaçlar, Toprak ve Su Varlığı',
      'Nüfusun Gelişimi, Dağılışı ve Piramitler',
      'Göç Hareketleri ve Yerleşme Tipleri',
      'Bölge Türleri ve Bölge Sınırları',
      'Doğal Afetler ve Çevre'
    ],
    'Felsefe': [
      '📌 Genel',
      'Felsefeyi Tanıma ve Felsefi Düşünce',
      'Felsefe ile Düşünme ve Akıl Yürütme',
      'Varlık Felsefesi (Ontoloji)',
      'Bilgi Felsefesi (Epistemoloji)',
      'Ahlak Felsefesi (Etik)',
      'Sanat Felsefesi (Estetik)',
      'Din Felsefesi',
      'Siyaset Felsefesi',
      'Bilim Felsefesi'
    ],
    'Din Kültürü': [
      '📌 Genel',
      'İnanç: Bilgi ve İnanç, İslam\'da İnanç Esasları',
      'İbadet: İbadet Kavramı ve Başlıca İbadetler',
      'Ahlak ve Değerler: İslam Ahlakının Kaynakları',
      'Din, Kültür ve Medeniyet',
      'Vahiy ve Akıl: Kur\'an ve Özellikleri',
      'Hz. Muhammed ve Gençlik',
      'İslam ve Bilim, Estetik, Barış'
    ]
  },

  /* ═══════════════════ AYT SAYISAL ═══════════════════ */
  'AYT-SAY': {
    'Matematik': [
      '📌 Genel',
      'Polinomlar ve Polinom Fonksiyonlar',
      'İkinci Dereceden Denklemler ve Karmaşık Sayılar',
      'İkinci Dereceden Eşitsizlikler ve Grafikleri',
      'Parabol (İkinci Dereceden Fonksiyon Grafikleri)',
      'Fonksiyonlarda Uygulamalar (Öteleme, Simetri)',
      'Trigonometri: Birim Çember ve Esas Ölçü',
      'Trigonometri: Toplam-Fark ve Yarım Açı Formülleri',
      'Trigonometri: Trigonometrik Denklemler',
      'Logaritma Fonksiyonu ve Özellikleri',
      'Üstel ve Logaritmik Denklemler',
      'Diziler: Aritmetik ve Geometrik Dizi',
      'Limit ve Süreklilik',
      'Türev: Anlık Hız ve Türev Tanımı',
      'Türev: Türev Alma Kuralları ve Bileşke Türevi',
      'Türev: Teğet-Normal Denklemleri ve Fiziksel Anlam',
      'Türev: Artan-Azalan Fonksiyonlar ve Ekstremum Noktalar',
      'Türev: Maksimum - Minimum Problemleri',
      'İntegral: Belirsiz İntegral ve Değişken Değiştirme',
      'İntegral: Belirli İntegral ve Alan Hesabı',
      'Sayma, Olasılık, Binom (AYT Düzeyi)'
    ],
    'Geometri': [
      '📌 Genel',
      'Doğrunun Analitik İncelenmesi (Eğim, İki Nokta Arası Uzaklık)',
      'Çemberin Analitik İncelenmesi',
      'Dönüşümlerle Geometri (Öteleme, Dönme, Yansıma)',
      'Uzay Geometrisi ve Katı Cisimler (Prizma, Piramit, Koni, Küre)',
      'Çember ve Daire (İleri Düzey)',
      'Özel Üçgenler ve Dörtgenler (Analitik Yaklaşım)'
    ],
    'Fizik': [
      '📌 Genel',
      'Vektörler ve Bağıl Hareket',
      'Newton\'ın Hareket Yasaları (İleri Düzey)',
      'Bir ve İki Boyutta Sabit İvmeli Hareket (Atışlar)',
      'İş, Güç ve Enerji (Mekanik Enerjinin Korunumu)',
      'İtme ve Çizgisel Momentum (Çarpışmalar)',
      'Tork, Denge ve Kütle Merkezi',
      'Basit Makineler ve Verim',
      'Elektriksel Kuvvet, Elektrik Alan ve Potansiyel',
      'Düzgün Elektrik Alan ve Sığaçlar (Kondansatörler)',
      'Manyetizma ve Manyetik Kuvvet',
      'Manyetik İndüksiyon, Faraday ve Lenz Yasası',
      'Alternatif Akım ve Transformatörler',
      'Düzgün Çembersel Hareket ve Uygulamaları',
      'Dönerek Öteleme Hareketi ve Açısal Momentum',
      'Basit Harmonik Hareket',
      'Dalga Mekaniği (Girişim, Kırınım, Doppler Olayı)',
      'Atom Fiziğine Giriş ve Radyoaktivite',
      'Modern Fizik (Özel Görelilik, Foton ve Fotoelektrik, Compton)',
      'Modern Fiziğin Teknolojideki Uygulamaları (X Işınları, Lazer, Yarı İletkenler)'
    ],
    'Kimya': [
      '📌 Genel',
      'Modern Atom Teorisi ve Kuantum Sayıları',
      'Gazlar ve Gaz Yasaları, İdeal Gaz Denklemi',
      'Sıvı Çözeltiler ve Derişim Birimleri',
      'Koligatif Özellikler (Kaynama Noktası Yükselmesi vb.)',
      'Kimyasal Tepkimelerde Enerji (Entalpi ve Hess Yasası)',
      'Kimyasal Tepkimelerde Hız ve Çarpışma Teorisi',
      'Kimyasal Denge ve Dengeye Etki Eden Faktörler',
      'Asit - Baz Dengesi (pH, pOH, Tampon Çözeltiler)',
      'Çözünürlük Dengesi (KÇÇ ve Ortak İyon Etkisi)',
      'Kimya ve Elektrik (Redoks, Elektrokimyasal Piller, Nernst)',
      'Elektroliz ve Korozyon',
      'Karbon Kimyasına Giriş (Hibritleşme, VSEPR)',
      'Organik Bileşikler: Hidrokarbonlar (Alkan, Alken, Alkin, Benzen)',
      'Fonksiyonel Gruplar: Alkoller ve Eterler',
      'Fonksiyonel Gruplar: Aldehitler ve Ketonlar',
      'Fonksiyonel Gruplar: Karboksilik Asitler ve Esterler',
      'Enerji Kaynakları ve Bilimsel Gelişmeler'
    ],
    'Biyoloji': [
      '📌 Genel',
      'Sinir Sistemi, Nöronlar ve İmpuls İletimi',
      'Endokrin Sistem ve Hormonların İşleyişi',
      'Duyu Organları (Göz, Kulak, Burun, Dil, Deri)',
      'Destek ve Hareket Sistemi (Kemik, Kıkırdak, Kaslar)',
      'Sindirim Sistemi ve Emilim Mekanizmaları',
      'Dolaşım Sistemi (Kalp, Damarlar, Kan Dokusu)',
      'Bağışıklık Sistemi ve Savunma Mekanizmaları',
      'Solunum Sistemi ve Gaz Alışverişi',
      'Üriner (Boşaltım) Sistemi ve Nefronun Yapısı',
      'Üreme Sistemi ve Embriyonik Gelişim',
      'Komünite ve Popülasyon Ekolojisi',
      'Nükleik Asitler (DNA, RNA Replikasyonu)',
      'Protein Sentezi ve Genetik Şifre',
      'Hücresel Solunum (Glikoliz, Krebs, ETS)',
      'Fotosentez ve Kemosentez Reaksiyonları',
      'Bitki Biyolojisi: Bitkisel Dokular ve Organlar',
      'Bitkilerde Madde Taşınması ve Beslenme',
      'Bitkilerde Eşeyli Üreme ve Büyüme',
      'Canlılar ve Çevre (Adaptasyon, Evrimsel Mekanizmalar)'
    ]
  },

  /* ═══════════════════ AYT EŞİT AĞIRLIK ═══════════════════ */
  'AYT-EA': {
    'Matematik': [
      '📌 Genel',
      'Polinomlar ve Çarpanlara Ayırma',
      'İkinci Dereceden Denklemler ve Eşitsizlikler',
      'Parabol ve Fonksiyon Dönüşümleri',
      'Trigonometri (Temel ve İleri Formüller)',
      'Logaritma Fonksiyonu ve Denklemler',
      'Diziler (Aritmetik ve Geometrik Dizi)',
      'Limit ve Süreklilik',
      'Türev ve Geometrik Yorumu',
      'Türev ile Ekstremum ve Optimizasyon',
      'İntegral ve Alan Hesabı',
      'Sayma, Olasılık, Binom'
    ],
    'Geometri': [
      '📌 Genel',
      'Doğrunun Analitik İncelenmesi',
      'Çemberin Analitik İncelenmesi',
      'Dönüşümler Geometrisi',
      'Katı Cisimler ve Uzay Geometrisi'
    ],
    'Edebiyat': [
      '📌 Genel',
      'Şiir Bilgisi: Nazım Birimi, Ölçü, Uyak ve Redif',
      'Edebi Sanatlar (Teşbih, İstiare, Mecazımürsel vb.)',
      'Metinlerin Sınıflandırılması ve Düz Yazı Türleri',
      'İslamiyet Öncesi Türk Edebiyatı (Koşuk, Sagu, Sav, Destanlar)',
      'Geçiş Dönemi Eserleri (Kutadgu Bilig, Dîvânu Lugâti\'t-Türk vb.)',
      'Halk Edebiyatı: Anonim, Âşık ve Tekke-Tasavvuf Edebiyatı',
      'Divan Edebiyatı: Nazım Biçimleri (Gazel, Kaside, Mesnevi vb.)',
      'Divan Edebiyatı: Şairler ve Nesir Geleneği',
      'Tanzimat Edebiyatı 1. ve 2. Dönem',
      'Servet-i Fünun ve Fecr-i Âti Edebiyatı',
      'Millî Edebiyat Dönemi ve Genç Kalemler',
      'Cumhuriyet Dönemi: Saf Şiir, Yedi Meşaleciler, Serbest Nazım',
      'Cumhuriyet Dönemi: Garip Akımı ve İkinci Yeni Şiiri',
      'Cumhuriyet Dönemi: Toplumcu Gerçekçi Şiir ve Dini Değerler',
      'Cumhuriyet Dönemi Romanı: Millî Edebiyat Zevk ve Anlayışı',
      'Cumhuriyet Dönemi Romanı: Toplumcu Gerçekçiler ve Bireyin İç Dünyası',
      'Cumhuriyet Dönemi Romanı: Modernist ve Postmodernist Roman',
      'Cumhuriyet Dönemi Tiyatrosu ve Öğretici Metinler',
      'Batı Edebiyatı Akımları (Klasisizm, Romantizm, Realizm vb.)',
      'Dünya Edebiyatı ve Türkiye Dışı Çağdaş Türk Edebiyatı'
    ],
    'Tarih-1': [
      '📌 Genel',
      'Tarih ve Zaman',
      'İnsanlığın İlk Dönemleri',
      'İlk ve Orta Çağlarda Türk Dünyası',
      'İslam Medeniyetinin Doğuşu ve İlk İslam Devletleri',
      'Türk-İslam Devletleri (Karahanlı, Gazneli, Selçuklu)',
      'Türkiye Tarihi (Beylikler ve Anadolu Selçuklu)',
      'Osmanlı Siyaseti: Beylikten Devlete (1300-1453)',
      'Dünya Gücü Osmanlı (1453-1595)',
      'Osmanlı Kültür ve Medeniyeti',
      'Değişen Dünya Dengeleri Karşısında Osmanlı (1595-1774)',
      'Uluslararası İlişkilerde Denge Stratejisi (1774-1914)',
      'XX. Yüzyıl Başlarında Osmanlı ve I. Dünya Savaşı',
      'Millî Mücadele Hazırlık ve Cepheler',
      'Atatürk İlkeleri ve Türk İnkılabı',
      'Atatürk Dönemi Türk Dış Politikası'
    ],
    'Coğrafya-1': [
      '📌 Genel',
      'Biyoçeşitlilik ve Madde Döngüleri',
      'Nüfus Politikaları ve Şehirlerin Fonksiyonları',
      'Türkiye\'de Nüfus, Yerleşme ve Göç',
      'Türkiye\'de Tarım ve Hayvancılık',
      'Türkiye\'de Madenler ve Enerji Kaynakları',
      'Türkiye\'de Sanayi, Ulaşım, Ticaret ve Turizm',
      'Bölgesel Kalkınma Projeleri (GAP, DOKAP, ZBK vb.)',
      'Küresel ve Bölgesel Kuruluşlar',
      'Çevre Sorunları ve Doğal Kaynakların Sürdürülebilirliği'
    ]
  },

  /* ═══════════════════ AYT SÖZEL ═══════════════════ */
  'AYT-SOZ': {
    'Edebiyat': [
      '📌 Genel',
      'Şiir Bilgisi ve Edebi Sanatlar',
      'İslamiyet Öncesi ve Geçiş Dönemi Türk Edebiyatı',
      'Halk Edebiyatı (Anonim, Âşık, Dini-Tasavvufi)',
      'Divan Edebiyatı Nazım Biçimleri, Türleri ve Şairleri',
      'Tanzimat, Servet-i Fünun ve Fecr-i Âti Edebiyatı',
      'Millî Edebiyat Dönemi',
      'Cumhuriyet Dönemi Şiir Akımları',
      'Cumhuriyet Dönemi Roman ve Hikaye Türleri',
      'Cumhuriyet Dönemi Tiyatro, Anı, Gezi ve Deneme',
      'Edebi Akımlar ve Dünya Edebiyatı'
    ],
    'Tarih-1': [
      '📌 Genel',
      'İlk ve Orta Çağlarda Türk Dünyası',
      'İslam Medeniyeti ve Türk-İslam Devletleri',
      'Osmanlı Devleti Kuruluş ve Yükselme Dönemi',
      'Osmanlı Kültür ve Medeniyeti',
      'Osmanlı Dağılma Dönemi ve I. Dünya Savaşı',
      'Kurtuluş Savaşı ve Atatürkçülük'
    ],
    'Coğrafya-1': [
      '📌 Genel',
      'Biyoçeşitlilik, Ekosistemler ve Madde Döngüleri',
      'Şehirleşme, Sanayi ve Göç İlişkisi',
      'Türkiye Ekonomisi: Tarım, Sanayi, Hizmet Sektörleri',
      'Uluslararası Ticaret ve Turizm',
      'Çevre ve Kalkınma'
    ],
    'Tarih-2': [
      '📌 Genel',
      'Tarih Yazıcılığı ve Metodolojisi',
      'Eski Çağ Medeniyetleri (Mezopotamya, Anadolu, Mısır vb.)',
      'İlk Türk Devletlerinde Teşkilat ve Toplum',
      'Emeviler, Abbasiler ve Türk-İslam Kültürü',
      'Selçuklu Müesseseleri ve Anadolu Türk Beylikleri',
      'Osmanlı Teşkilat Yapısı (Merkez ve Taşra, Ordu)',
      'Osmanlı Toprak Düzeni, Maliye ve Eğitim Sistemi',
      'Avrupa\'da Rönesans, Reform ve Aydınlanma Çağı',
      'Sanayi Devrimi ve Fransız İhtilali\'nin Etkileri',
      'I. Dünya Savaşı ve 20. Yüzyıl Başlarında Dünya',
      'II. Dünya Savaşı ve Sonuçları',
      'Soğuk Savaş Dönemi ve Bloklaşmalar',
      'Yumuşama Dönemi (Detant) ve Bölgesel Çatışmalar',
      'Küreselleşen Dünya ve Yakın Dönem Türk Tarihi'
    ],
    'Coğrafya-2': [
      '📌 Genel',
      'Biyomlar ve Ekosistemin Unsurları',
      'İlk Medeniyet Merkezleri ve Kültür Bölgeleri',
      'Türk Kültürünün Yayılma Alanları',
      'Hammadde, Üretim ve Pazar Alanları',
      'Küresel Ticaretin Odakları ve Boğazlar-Kanallar',
      'Türkiye\'nin Jeopolitik ve Jeostratejik Konumu',
      'Bölgesel ve Küresel Çevre Sorunları',
      'Doğal Kaynakların Sürdürülebilir Yönetimi'
    ],
    'Felsefe Grubu': [
      '📌 Genel',
      'Mantık: Mantığa Giriş, Akıl İlkeleri ve Dil',
      'Mantık: Klasik Mantık (Kavram, Terim, Tanım, Önerme)',
      'Mantık: Kıyas (Çıkarım Kuralları ve Çeşitleri)',
      'Mantık: Sembolik Mantık (Önermeler ve Niceleme Mantığı)',
      'Psikoloji: Psikolojinin Tanımı, Yaklaşımları ve Alanları',
      'Psikoloji: Davranışın Biyolojik Temelleri ve Duyum-Algı',
      'Psikoloji: Öğrenme, Bellek ve Düşünme Süreçleri',
      'Psikoloji: Zeka, Kişilik ve Bireysel Farklılıklar',
      'Psikoloji: Ruh Sağlığı, Savunma Mekanizmaları ve Stres',
      'Sosyoloji: Sosyolojiye Giriş, Yöntem ve Teknikler',
      'Sosyoloji: Toplumsal Yapı, Roller ve Statüler',
      'Sosyoloji: Toplumsal Değişme, Tabakalaşma ve Hareketlilik',
      'Sosyoloji: Kültür, Toplumsallaşma ve Toplumsal Kurumlar (Aile, Eğitim, Din, Ekonomi)',
      'Klasik Felsefe: Ontoloji, Epistemoloji, Etik ve Siyaset Felsefesi'
    ],
    'Din Kültürü': [
      '📌 Genel',
      'İslam ve İbadet Felsefesi',
      'İslam Düşüncesinde Yorum Biçimleri (İtikadi, Fıkhi Mezhepler)',
      'Tasavvufi Yorumlar ve Ahlaki Boyut',
      'Din ve Laiklik, İslam ve Bilim',
      'Yaşayan Dünya Dinleri (Yahudilik, Hristiyanlık, İslam, Doğu Dinleri)'
    ]
  }
};

/* ═══════════════════════ YARDIMCI METOTLAR ═══════════════════════ */

/**
 * Öğrencinin sınıfına göre izin verilen sınav gruplarını döner.
 * 12. Sınıf öğrencisinde LGS asla açılmaz!
 * 8. Sınıf öğrencisinde sadece LGS açılır.
 */
export function ogrenciKademeBelirle(ogrenciId) {
  if (!ogrenciId) {
    return {
      kademe: 'hepsi',
      sinifAd: '',
      sinavGruplari: SINAV_TURLERI.map(s => s.id)
    };
  }

  const ogr = DB.ogrenciler.find(o => o.id === Number(ogrenciId));
  if (!ogr) {
    return { kademe: 'hepsi', sinifAd: '', sinavGruplari: SINAV_TURLERI.map(s => s.id) };
  }

  const sinif = DB.siniflar.find(s => s.id === ogr.sinifId);
  const sinifAd = sinif ? sinif.ad : '';
  const adLower = sinifAd.toLowerCase();

  // 12. Sınıf veya Mezun
  if (/\b(12|mezun|ayt|yks)\b/i.test(adLower) || adLower.includes('12') || adLower.includes('mezun')) {
    return {
      kademe: '12-mezun',
      sinifAd,
      sinavGruplari: ['TYT', 'AYT-SAY', 'AYT-EA', 'AYT-SOZ'],
      varsayilanSinav: 'TYT'
    };
  }

  // 11. Sınıf
  if (/\b(11)\b/i.test(adLower) || adLower.includes('11')) {
    return {
      kademe: '11',
      sinifAd,
      sinavGruplari: ['TYT', 'AYT-SAY', 'AYT-EA', 'AYT-SOZ'],
      varsayilanSinav: 'TYT'
    };
  }

  // 9 ve 10. Sınıf (Lise Ara Sınıflar -> TYT temeli)
  if (/\b(9|10)\b/i.test(adLower) || adLower.includes('9') || adLower.includes('10')) {
    return {
      kademe: 'lise-ara',
      sinifAd,
      sinavGruplari: ['TYT'],
      varsayilanSinav: 'TYT'
    };
  }

  // 8. Sınıf veya LGS
  if (/\b(8|lgs)\b/i.test(adLower) || adLower.includes('8') || adLower.includes('lgs')) {
    return {
      kademe: 'lgs',
      sinifAd,
      sinavGruplari: ['LGS'],
      varsayilanSinav: 'LGS'
    };
  }

  // 5, 6, 7. Sınıflar (Ortaokul)
  if (/\b(5|6|7)\b/i.test(adLower)) {
    return {
      kademe: 'ortaokul',
      sinifAd,
      sinavGruplari: ['LGS'],
      varsayilanSinav: 'LGS'
    };
  }

  // Özel veya adı tanımsız sınıf
  return {
    kademe: 'hepsi',
    sinifAd,
    sinavGruplari: ['TYT', 'AYT-SAY', 'AYT-EA', 'AYT-SOZ', 'LGS'],
    varsayilanSinav: 'TYT'
  };
}

/**
 * Belirtilen sınav grubuna ait ders listesini döner.
 */
export function getMufredatDersleri(sinavTuru) {
  const dal = MURED_DERSLER[sinavTuru] || MURED_DERSLER['TYT'];
  return Object.keys(dal);
}

/**
 * Belirtilen sınav ve derse ait konuları döner.
 * İlk eleman garanti '📌 Genel' dir.
 */
export function getMufredatKonulari(sinavTuru, ders) {
  const dal = MURED_DERSLER[sinavTuru];
  if (!dal) return ['📌 Genel'];
  const konular = dal[ders];
  if (!konular || !konular.length) return ['📌 Genel'];
  // Garanti "📌 Genel" ile başlama kontrolü
  if (!konular.includes('📌 Genel')) {
    return ['📌 Genel', ...konular];
  }
  return konular;
}
