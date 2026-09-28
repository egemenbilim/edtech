/* ══════════════════════════════════════════════════════
   Öğrenci Takip Sistemi — Ünitelendirilmiş Yıllık Plan (ÜYP) Modülü
   Desteklenen Formatlar: PDF, Excel (.xlsx, .xls), Word (.docx), Metin/Tablo
   ══════════════════════════════════════════════════════ */

import { DB, saveDB, nid, sinifAdi } from '../state.js';
import { $, toast, fmtTarih } from '../utils.js';

/* ═════ HAZIR / VARSAYILAN YILLIK PLANLAR ═════ */
export const VARSAYILAN_PLANLAR = [
  {
    id: 'uyp_yks_turkce',
    ad: '📘 YKS Türkçe Yıllık Planı (TYT/AYT — 36 Hafta)',
    ders: 'Türkçe',
    kademe: 'YKS (TYT/AYT)',
    ogretimYili: '2025-2026',
    aciklama: 'MEB ve ÖSYM güncel müfredatına tam uyumlu; Sözcükte Anlam, Cümlede Anlam, Paragraf, Dil Bilgisi ve Edebiyat konularını kapsayan 36 haftalık kapsamlı plan.',
    haftalar: [
      { hafta: 1, ay: 'Eylül', tarih: '08-12 Eylül', saat: 4, unite: 'Sözcükte Anlam', konu: 'Sözcükte Anlam (Gerçek, Yan, Mecaz Anlam)', alt: false },
      { hafta: 1, ay: 'Eylül', tarih: '08-12 Eylül', saat: 4, unite: 'Sözcükte Anlam', konu: 'Sözcükler Arası Anlam İlişkileri (Eş/Zıt Anlam, Eş Seslilik)', alt: true },
      { hafta: 2, ay: 'Eylül', tarih: '15-19 Eylül', saat: 4, unite: 'Sözcükte Anlam', konu: 'Terim Anlam, Somutlaştırma, Soyutlaştırma ve Güzel Adlandırma', alt: false },
      { hafta: 2, ay: 'Eylül', tarih: '15-19 Eylül', saat: 4, unite: 'Sözcükte Anlam', konu: 'Deyimler ve Atasözlerinin Cümleye Kattığı Anlamlar', alt: true },
      { hafta: 3, ay: 'Eylül', tarih: '22-26 Eylül', saat: 4, unite: 'Sözcükte Anlam', konu: 'Söz Öbekleri ve İkilemelerin Anlam Özellikleri', alt: false },
      { hafta: 4, ay: 'Eylül', tarih: '29 Eylül - 03 Ekim', saat: 4, unite: 'Cümlede Anlam', konu: 'Cümlede Anlam İlişkileri (Neden-Sonuç, Amaç-Sonuç, Koşul)', alt: false },
      { hafta: 5, ay: 'Ekim', tarih: '06-10 Ekim', saat: 4, unite: 'Cümlede Anlam', konu: 'Cümlede Anlatım Özellikleri (Öznel-Nesnel, Doğrudan-Dolaylı Anlatım)', alt: false },
      { hafta: 6, ay: 'Ekim', tarih: '13-17 Ekim', saat: 4, unite: 'Cümlede Anlam', konu: 'Cümlenin İfade Ettiği Anlamlar (Varsayım, Olasılık, Eleştiri, Ön Yargı)', alt: false },
      { hafta: 7, ay: 'Ekim', tarih: '20-24 Ekim', saat: 4, unite: 'Paragrafta Anlam', konu: 'Paragrafta Konu, Başlık ve Ana Düşünce', alt: false },
      { hafta: 8, ay: 'Ekim', tarih: '27-31 Ekim', saat: 4, unite: 'Paragrafta Anlam', konu: 'Paragrafta Yardımcı Düşünceler ve Çıkarımlar (29 Ekim)', alt: false },
      { hafta: 9, ay: 'Kasım', tarih: '03-07 Kasım', saat: 4, unite: 'Paragrafta Yapı', konu: 'Paragrafın Yapısı (Giriş-Gelişme-Sonuç, Akışı Bozan Cümle, İkiye Bölme)', alt: false },
      { hafta: 10, ay: 'Kasım', tarih: '10-14 Kasım', saat: 4, unite: 'Ara Tatil & Deneme', konu: '1. Dönem Ara Tatili & TYT Anlam Bilgisi Deneme Analizi', alt: false },
      { hafta: 11, ay: 'Kasım', tarih: '17-21 Kasım', saat: 4, unite: 'Paragrafta Anlatım', konu: 'Anlatım Biçimleri ve Düşünceyi Geliştirme Yolları', alt: false },
      { hafta: 12, ay: 'Kasım', tarih: '24-28 Kasım', saat: 4, unite: 'Ses Bilgisi', konu: 'Ünlü Uyumları, Ünlü Düşmesi ve Ünlü Daralması', alt: false },
      { hafta: 13, ay: 'Aralık', tarih: '01-05 Aralık', saat: 4, unite: 'Ses Bilgisi', konu: 'Ünsüz Benzeşmesi, Ünsüz Yumuşaması ve Ünsüz Türemesi', alt: false },
      { hafta: 14, ay: 'Aralık', tarih: '08-12 Aralık', saat: 4, unite: 'Yazım Kuralları', konu: 'Büyük Harflerin Yazımı, Sayıların ve Kısaltmaların Yazımı', alt: false },
      { hafta: 15, ay: 'Aralık', tarih: '15-19 Aralık', saat: 4, unite: 'Yazım Kuralları', konu: '\'de\', \'ki\', \'mi\' Yazımı ve Birleşik Sözcüklerin Yazımı', alt: false },
      { hafta: 16, ay: 'Aralık', tarih: '22-26 Aralık', saat: 4, unite: 'Noktalama İşaretleri', konu: 'Nokta, Virgül, Noktalı Virgül ve İki Nokta Kullanımı', alt: false },
      { hafta: 17, ay: 'Aralık', tarih: '29 Aralık - 02 Ocak', saat: 4, unite: 'Noktalama İşaretleri', konu: 'Üç Nokta, Soru, Ünlem, Tırnak ve Parantez İşaretleri', alt: false },
      { hafta: 18, ay: 'Ocak', tarih: '05-09 Ocak', saat: 4, unite: 'Sözcükte Yapı', konu: 'Kökler, Gövdeler ve Yapım Ekleri (İsimden/Fiilden Türetme)', alt: false },
      { hafta: 19, ay: 'Ocak', tarih: '12-16 Ocak', saat: 4, unite: 'Sözcükte Yapı', konu: 'Çekim Ekleri (Çokluk, İyelik, Hal ve Zaman Ekleri)', alt: false },
      { hafta: 20, ay: 'Ocak', tarih: '19-23 Ocak', saat: 4, unite: 'Dönem Sonu Kampı', konu: '1. Dönem Genel Değerlendirmesi, TYT Türkçe Soru Kampı & Yarıyıl Tatili', alt: false },
      { hafta: 21, ay: 'Şubat', tarih: '09-13 Şubat', saat: 4, unite: 'Sözcük Türleri', konu: 'İsimler (Adlar) ve İsim Tamlamaları', alt: false },
      { hafta: 22, ay: 'Şubat', tarih: '16-20 Şubat', saat: 4, unite: 'Sözcük Türleri', konu: 'Sıfatlar (Ön Adlar) ve Sıfat Tamlamaları', alt: false },
      { hafta: 23, ay: 'Şubat', tarih: '23-27 Şubat', saat: 4, unite: 'Sözcük Türleri', konu: 'Zamirler (Adıllar) ve Zarflar (Belirteçler)', alt: false },
      { hafta: 24, ay: 'Mart', tarih: '02-06 Mart', saat: 4, unite: 'Sözcük Türleri', konu: 'Edat (İlgeç), Bağlaç ve Ünlem', alt: false },
      { hafta: 25, ay: 'Mart', tarih: '09-13 Mart', saat: 4, unite: 'Fiiller', konu: 'Fiiller (Eylemler), Anlam Özellikleri ve Fiil Çekimi', alt: false },
      { hafta: 26, ay: 'Mart', tarih: '16-20 Mart', saat: 4, unite: 'Fiiller & Ek Fiil', konu: 'Ek Fiil (Ek Eylem) ve Görevleri', alt: false },
      { hafta: 27, ay: 'Mart', tarih: '23-27 Mart', saat: 4, unite: 'Fiilimsiler', konu: 'Fiilimsiler (İsim-Fiil, Sıfat-Fiil, Zarf-Fiil)', alt: false },
      { hafta: 28, ay: 'Mart', tarih: '30 Mart - 03 Nisan', saat: 4, unite: 'Fiilde Çatı', konu: 'Öznesine ve Nesnesine Göre Fiilde Çatı', alt: false },
      { hafta: 29, ay: 'Nisan', tarih: '06-10 Nisan', saat: 4, unite: 'Ara Tatil & Tekrar', konu: '2. Dönem Ara Tatili & Fiil/Çatı Soru Çözümleri', alt: false },
      { hafta: 30, ay: 'Nisan', tarih: '13-17 Nisan', saat: 4, unite: 'Cümlenin Ögeleri', konu: 'Temel Ögeler (Özne, Yüklem) ve Yardımcı Ögeler (Nesne, Tümleç)', alt: false },
      { hafta: 31, ay: 'Nisan', tarih: '20-24 Nisan', saat: 4, unite: 'Cümle Türleri', konu: 'Yapılarına Göre Cümleler (Basit, Birleşik, Sıralı, Bağlı)', alt: false },
      { hafta: 32, ay: 'Nisan', tarih: '27 Nisan - 01 Mayıs', saat: 4, unite: 'Anlatım Bozuklukları', konu: 'Anlamsal ve Yapısal Anlatım Bozuklukları', alt: false },
      { hafta: 33, ay: 'Mayıs', tarih: '04-08 Mayıs', saat: 4, unite: 'AYT Edebiyat Geçiş', konu: 'Şiir Bilgisi, Nazım Biçimleri ve Edebi Sanatlar', alt: false },
      { hafta: 34, ay: 'Mayıs', tarih: '11-15 Mayıs', saat: 4, unite: 'Edebiyat Dönemleri', konu: 'İslamiyet Öncesi, Halk, Divan ve Tanzimat Edebiyatı Özeti', alt: false },
      { hafta: 35, ay: 'Mayıs', tarih: '18-22 Mayıs', saat: 4, unite: 'Genel Tekrar & Deneme', konu: 'YKS Çıkmış Soruların Analizi ve TYT Branş Denemeleri (19 Mayıs)', alt: false },
      { hafta: 36, ay: 'Mayıs', tarih: '25-29 Mayıs', saat: 4, unite: 'Sınav Provası', konu: 'Zaman Yönetimi, Sınav Taktikleri ve Son Genel Tekrar', alt: false }
    ]
  },
  {
    id: 'uyp_tyt_matematik',
    ad: '📐 TYT Matematik Yıllık Planı (36 Hafta)',
    ders: 'Matematik',
    kademe: 'TYT',
    ogretimYili: '2025-2026',
    aciklama: 'Temel Kavramlardan Problemler ve Olasılığa kadar tüm TYT Matematik konularını içeren yıllık plan.',
    haftalar: [
      { hafta: 1, ay: 'Eylül', tarih: '08-12 Eylül', saat: 6, unite: 'Temel Kavramlar', konu: 'Sayı Kümeleri, Tek-Çift ve Pozitif-Negatif Sayılar', alt: false },
      { hafta: 2, ay: 'Eylül', tarih: '15-19 Eylül', saat: 6, unite: 'Temel Kavramlar', konu: 'Ardışık Sayılar ve Asal Sayılar', alt: false },
      { hafta: 3, ay: 'Eylül', tarih: '22-26 Eylül', saat: 6, unite: 'Basamak Kavramı', konu: 'Sayı Basamakları ve Çözümleme', alt: false },
      { hafta: 4, ay: 'Eylül', tarih: '29 Eylül - 03 Ekim', saat: 6, unite: 'Bölünebilme', konu: 'Bölme ve Bölünebilme Kuralları', alt: false },
      { hafta: 5, ay: 'Ekim', tarih: '06-10 Ekim', saat: 6, unite: 'EBOB - EKOK', konu: 'Asal Çarpanlara Ayırma, EBOB ve EKOK Problemleri', alt: false },
      { hafta: 6, ay: 'Ekim', tarih: '13-17 Ekim', saat: 6, unite: 'Rasyonel Sayılar', konu: 'Rasyonel ve Ondalık Sayılarda İşlemler', alt: false },
      { hafta: 7, ay: 'Ekim', tarih: '20-24 Ekim', saat: 6, unite: 'Denklem & Eşitsizlik', konu: 'Birinci Dereceden Denklemler ve Basit Eşitsizlikler', alt: false },
      { hafta: 8, ay: 'Ekim', tarih: '27-31 Ekim', saat: 6, unite: 'Mutlak Değer', konu: 'Mutlak Değer Özellikleri ve Denklemleri', alt: false },
      { hafta: 9, ay: 'Kasım', tarih: '03-07 Kasım', saat: 6, unite: 'Üslü İfadeler', konu: 'Üslü Sayıların Özellikleri ve Denklemleri', alt: false },
      { hafta: 10, ay: 'Kasım', tarih: '10-14 Kasım', saat: 6, unite: 'Ara Tatil', konu: '1. Dönem Ara Tatili & İlk Konular Tekrar Kampı', alt: false },
      { hafta: 11, ay: 'Kasım', tarih: '17-21 Kasım', saat: 6, unite: 'Köklü İfadeler', konu: 'Köklü Sayıların Özellikleri ve Dört İşlem', alt: false },
      { hafta: 12, ay: 'Kasım', tarih: '24-28 Kasım', saat: 6, unite: 'Çarpanlara Ayırma', konu: 'Ortak Parantez, Özdeşlikler ve Sadeleştirme', alt: false },
      { hafta: 13, ay: 'Aralık', tarih: '01-05 Aralık', saat: 6, unite: 'Oran - Orantı', konu: 'Doğru ve Ters Orantı, Aritmetik ve Geometrik Ortalama', alt: false },
      { hafta: 14, ay: 'Aralık', tarih: '08-12 Aralık', saat: 6, unite: 'Problemler', konu: 'Sayı ve Kesir Problemleri', alt: false },
      { hafta: 15, ay: 'Aralık', tarih: '15-19 Aralık', saat: 6, unite: 'Problemler', konu: 'Yaş Problemleri', alt: false },
      { hafta: 16, ay: 'Aralık', tarih: '22-26 Aralık', saat: 6, unite: 'Problemler', konu: 'İşçi ve Havuz Problemleri', alt: false },
      { hafta: 17, ay: 'Aralık', tarih: '29 Aralık - 02 Ocak', saat: 6, unite: 'Problemler', konu: 'Hız ve Hareket Problemleri', alt: false },
      { hafta: 18, ay: 'Ocak', tarih: '05-09 Ocak', saat: 6, unite: 'Problemler', konu: 'Yüzde, Kâr - Zarar Problemleri', alt: false },
      { hafta: 19, ay: 'Ocak', tarih: '12-16 Ocak', saat: 6, unite: 'Problemler', konu: 'Karışım ve Grafik Problemleri', alt: false },
      { hafta: 20, ay: 'Ocak', tarih: '19-23 Ocak', saat: 6, unite: 'Yarıyıl Tatili', konu: 'Problemler Kampı & 1. Dönem TYT Matematik Denemesi', alt: false },
      { hafta: 21, ay: 'Şubat', tarih: '09-13 Şubat', saat: 6, unite: 'Kümeler', konu: 'Küme İşlemleri ve Küme Problemleri', alt: false },
      { hafta: 22, ay: 'Şubat', tarih: '16-20 Şubat', saat: 6, unite: 'Kartezyen Çarpım', konu: 'Sıralı İkili, Kartezyen Çarpım ve Bağıntı', alt: false },
      { hafta: 23, ay: 'Şubat', tarih: '23-27 Şubat', saat: 6, unite: 'Fonksiyonlar', konu: 'Fonksiyon Tanımı, Değer Bulma ve Grafik Okuma', alt: false },
      { hafta: 24, ay: 'Mart', tarih: '02-06 Mart', saat: 6, unite: 'Fonksiyonlar', konu: 'Bileşke Fonksiyon ve Ters Fonksiyon', alt: false },
      { hafta: 25, ay: 'Mart', tarih: '09-13 Mart', saat: 6, unite: 'Polinomlar', konu: 'Polinom Tanımı, Derece ve Dört İşlem', alt: false },
      { hafta: 26, ay: 'Mart', tarih: '16-20 Mart', saat: 6, unite: 'Polinomlar', konu: 'Polinomlarda Kalan Bulma Teoremi', alt: false },
      { hafta: 27, ay: 'Mart', tarih: '23-27 Mart', saat: 6, unite: '2. Dereceden Denklemler', konu: 'Diskriminant ve Kökler Bağıntısı', alt: false },
      { hafta: 28, ay: 'Mart', tarih: '30 Mart - 03 Nisan', saat: 6, unite: 'Karmaşık Sayılar', konu: 'Sanal Birim \'i\' ve Karmaşık Sayılarda İşlemler', alt: false },
      { hafta: 29, ay: 'Nisan', tarih: '06-10 Nisan', saat: 6, unite: 'Ara Tatil', konu: '2. Dönem Ara Tatili & Fonksiyon/Polinom Kampı', alt: false },
      { hafta: 30, ay: 'Nisan', tarih: '13-17 Nisan', saat: 6, unite: 'Sayma Yöntemleri', konu: 'Toplama ve Çarpma Yoluyla Sayma, Faktöriyel', alt: false },
      { hafta: 31, ay: 'Nisan', tarih: '20-24 Nisan', saat: 6, unite: 'Permütasyon', konu: 'Permütasyon ve Tekrarlı Permütasyon', alt: false },
      { hafta: 32, ay: 'Nisan', tarih: '27 Nisan - 01 Mayıs', saat: 6, unite: 'Kombinasyon', konu: 'Kombinasyon ve Geometrik Uygulamaları', alt: false },
      { hafta: 33, ay: 'Mayıs', tarih: '04-08 Mayıs', saat: 6, unite: 'Binom Açılımı', konu: 'Binom Katsayıları ve Açılımı', alt: false },
      { hafta: 34, ay: 'Mayıs', tarih: '11-15 Mayıs', saat: 6, unite: 'Olasılık', konu: 'Basit ve Koşullu Olasılık', alt: false },
      { hafta: 35, ay: 'Mayıs', tarih: '18-22 Mayıs', saat: 6, unite: 'Veri & İstatistik', konu: 'Mod, Medyan, Aritmetik Ortalama ve Standart Sapma', alt: false },
      { hafta: 36, ay: 'Mayıs', tarih: '25-29 Mayıs', saat: 6, unite: 'TYT Genel Prova', konu: 'TYT Matematik Tam Deneme Sınavları ve Genel Tekrar', alt: false }
    ]
  },
  {
    id: 'uyp_lgs_turkce',
    ad: '📘 LGS 8. Sınıf Türkçe Yıllık Planı (36 Hafta)',
    ders: 'Türkçe',
    kademe: 'LGS / 8. Sınıf',
    ogretimYili: '2025-2026',
    aciklama: 'Fiilimsiler, Cümlenin Ögeleri, Paragraf, Görsel Okuma ve Sözel Mantık konularını içeren MEB 8. sınıf planı.',
    haftalar: [
      { hafta: 1, ay: 'Eylül', tarih: '08-12 Eylül', saat: 5, unite: 'Fiilimsiler', konu: 'İsim-Fiil (Mastar) Ekleri ve Özellikleri', alt: false },
      { hafta: 2, ay: 'Eylül', tarih: '15-19 Eylül', saat: 5, unite: 'Fiilimsiler', konu: 'Sıfat-Fiil (Ortaç) Ekleri ve Adlaşmış Sıfat-Fiil', alt: false },
      { hafta: 3, ay: 'Eylül', tarih: '22-26 Eylül', saat: 5, unite: 'Fiilimsiler', konu: 'Zarf-Fiil (Ulaç/Bağ-Fiil) Ekleri ve Cümleye Kattığı Anlam', alt: false },
      { hafta: 4, ay: 'Eylül', tarih: '29 Eylül - 03 Ekim', saat: 5, unite: 'Sözcükte Anlam', konu: 'Sözcükte Anlam ve Söz Gruplarında Anlam', alt: false },
      { hafta: 5, ay: 'Ekim', tarih: '06-10 Ekim', saat: 5, unite: 'Deyim & Atasözü', konu: 'Deyimler, Atasözleri ve Özdeyişler', alt: false },
      { hafta: 6, ay: 'Ekim', tarih: '13-17 Ekim', saat: 5, unite: 'Cümlenin Ögeleri', konu: 'Temel Ögeler: Yüklem ve Özne', alt: false },
      { hafta: 7, ay: 'Ekim', tarih: '20-24 Ekim', saat: 5, unite: 'Cümlenin Ögeleri', konu: 'Yardımcı Ögeler: Nesne, Yer Tamlayıcısı, Zarf Tamlayıcısı', alt: false },
      { hafta: 8, ay: 'Ekim', tarih: '27-31 Ekim', saat: 5, unite: 'Cümlenin Ögeleri', konu: 'Cümle Dışı Unsurlar ve Ara Sözler (29 Ekim)', alt: false },
      { hafta: 9, ay: 'Kasım', tarih: '03-07 Kasım', saat: 5, unite: 'Cümlede Anlam', konu: 'Öznel-Nesnel Anlatım, Neden-Sonuç, Amaç-Sonuç, Koşul', alt: false },
      { hafta: 10, ay: 'Kasım', tarih: '10-14 Kasım', saat: 5, unite: 'Ara Tatil', konu: '1. Dönem Ara Tatili & Fiilimsiler/Ögeler Soru Çözümü', alt: false },
      { hafta: 11, ay: 'Kasım', tarih: '17-21 Kasım', saat: 5, unite: 'Paragrafta Anlam', konu: 'Paragrafta Ana Düşünce, Başlık ve Yardımcı Düşünceler', alt: false },
      { hafta: 12, ay: 'Kasım', tarih: '24-28 Kasım', saat: 5, unite: 'Paragrafta Yapı', konu: 'Paragrafın Bölümleri, Akışı Bozan Cümle ve İkiye Bölme', alt: false },
      { hafta: 13, ay: 'Aralık', tarih: '01-05 Aralık', saat: 5, unite: 'Metin Türleri', konu: 'Olay ve Düşünce Yazıları (Fıkra, Makale, Deneme, vb.)', alt: false },
      { hafta: 14, ay: 'Aralık', tarih: '08-12 Aralık', saat: 5, unite: 'Söz Sanatları', konu: 'Teşbih (Benzetme), Teşhis (Kişileştirme), Tezat, İntak', alt: false },
      { hafta: 15, ay: 'Aralık', tarih: '15-19 Aralık', saat: 5, unite: 'Fiilde Çatı', konu: 'Öznesine Göre Fiiller (Etken, Edilgen)', alt: false },
      { hafta: 16, ay: 'Aralık', tarih: '22-26 Aralık', saat: 5, unite: 'Fiilde Çatı', konu: 'Nesnesine Göre Fiiller (Geçişli, Geçişsiz)', alt: false },
      { hafta: 17, ay: 'Aralık', tarih: '29 Aralık - 02 Ocak', saat: 5, unite: 'Yazım Kuralları', konu: 'Büyük Harflerin ve Kısaltmaların Yazımı', alt: false },
      { hafta: 18, ay: 'Ocak', tarih: '05-09 Ocak', saat: 5, unite: 'Yazım Kuralları', konu: '\'de\', \'ki\', \'mi\' ve Sayıların Yazımı', alt: false },
      { hafta: 19, ay: 'Ocak', tarih: '12-16 Ocak', saat: 5, unite: 'Noktalama', konu: 'Noktalama İşaretleri (Nokta, Virgül, Noktalı Virgül, İki Nokta)', alt: false },
      { hafta: 20, ay: 'Ocak', tarih: '19-23 Ocak', saat: 5, unite: 'Yarıyıl Tatili', konu: '1. Dönem Genel LGS Denemesi ve Değerlendirmesi', alt: false },
      { hafta: 21, ay: 'Şubat', tarih: '09-13 Şubat', saat: 5, unite: 'Cümle Türleri', konu: 'Yüklemin Türüne ve Yerine Göre Cümleler', alt: false },
      { hafta: 22, ay: 'Şubat', tarih: '16-20 Şubat', saat: 5, unite: 'Cümle Türleri', konu: 'Yapısına Göre Cümleler (Tek Yüklemli, Fiilimsili, vb.)', alt: false },
      { hafta: 23, ay: 'Şubat', tarih: '23-27 Şubat', saat: 5, unite: 'Görsel Okuma', konu: 'Tablo, Grafik ve İnfografik Yorumlama', alt: false },
      { hafta: 24, ay: 'Mart', tarih: '02-06 Mart', saat: 5, unite: 'Sözel Mantık', konu: 'Sıralama ve Eşleştirme Soruları Çözüm Taktikleri', alt: false },
      { hafta: 25, ay: 'Mart', tarih: '09-13 Mart', saat: 5, unite: 'Sözel Mantık', konu: 'Tablo Kurma ve Önerme Yorumlama', alt: false },
      { hafta: 26, ay: 'Mart', tarih: '16-20 Mart', saat: 5, unite: 'Anlatım Bozuklukları', konu: 'Anlama Dayalı Anlatım Bozuklukları', alt: false },
      { hafta: 27, ay: 'Mart', tarih: '23-27 Mart', saat: 5, unite: 'Anlatım Bozuklukları', konu: 'Dil Bilgisine Dayalı Anlatım Bozuklukları', alt: false },
      { hafta: 28, ay: 'Mart', tarih: '30 Mart - 03 Nisan', saat: 5, unite: 'Metin Analizi', konu: 'Şiir ve Düz Yazıda Ahenk Unsurları', alt: false },
      { hafta: 29, ay: 'Nisan', tarih: '06-10 Nisan', saat: 5, unite: 'Ara Tatil', konu: '2. Dönem Ara Tatili & Sözel Mantık / Paragraf Kampı', alt: false },
      { hafta: 30, ay: 'Nisan', tarih: '13-17 Nisan', saat: 5, unite: 'LGS Deneme Kampı', konu: 'MEB Örnek Sorularının Ayrıntılı Çözümü', alt: false },
      { hafta: 31, ay: 'Nisan', tarih: '20-24 Nisan', saat: 5, unite: 'Genel Tekrar', konu: 'Dil Bilgisi Özet Tekrarı (23 Nisan)', alt: false },
      { hafta: 32, ay: 'Nisan', tarih: '27 Nisan - 01 Mayıs', saat: 5, unite: 'Paragraf Taktikleri', konu: 'Yeni Nesil Çeldiricileri Eleme Yöntemleri', alt: false },
      { hafta: 33, ay: 'Mayıs', tarih: '04-08 Mayıs', saat: 5, unite: 'LGS Branş Denemesi', konu: 'Süre Taktikli Türkçe Branş Denemeleri', alt: false },
      { hafta: 34, ay: 'Mayıs', tarih: '11-15 Mayıs', saat: 5, unite: 'Çıkmış Sorular', konu: 'Son 5 Yılın LGS Türkçe Çıkmış Soru Çözümleri', alt: false },
      { hafta: 35, ay: 'Mayıs', tarih: '18-22 Mayıs', saat: 5, unite: 'Hata Analizi', konu: 'Kişisel Hata Defteri İncelemeleri (19 Mayıs)', alt: false },
      { hafta: 36, ay: 'Mayıs', tarih: '25-29 Mayıs', saat: 5, unite: 'Sınav Provası', konu: 'Son Moral, Motivasyon ve Optik Kodlama Provası', alt: false }
    ]
  }
];

/* ═════ GEÇİCİ TASLAK DURUMU ═════ */
export let taslakUyp = null;

/* ═════ TÜM PLANLARI LİSTELEME ═════ */
export function tumPlanlariGetir() {
  const ozel = (DB.yillikPlanlar || []);
  return [...VARSAYILAN_PLANLAR, ...ozel];
}

export function planBul(id) {
  return tumPlanlariGetir().find(p => String(p.id) === String(id)) || null;
}

/* ═════ PLAN SEÇİM SELECTİNİ DOLDURMA ═════ */
export function uypSelectleriGuncelle() {
  const pSel = $('uypHizliPlanSecim');
  if (pSel) {
    const onceki = pSel.value;
    const planlar = tumPlanlariGetir();
    pSel.innerHTML = planlar.map(p => {
      const isOzel = (DB.yillikPlanlar || []).some(x => String(x.id) === String(p.id));
      const etiket = isOzel ? '⭐ [Özel] ' : '';
      return `<option value="${p.id}">${etiket}${p.ad} (${p.ders})</option>`;
    }).join('');
    if (onceki && planlar.some(p => String(p.id) === String(onceki))) {
      pSel.value = onceki;
    }
  }

  const sSel = $('uypHizliSinifSecim');
  if (sSel) {
    const oncekiS = sSel.value;
    sSel.innerHTML = DB.siniflar.length
      ? DB.siniflar.map(s => `<option value="${s.id}">${s.ad}</option>`).join('')
      : '<option value="">Henüz sınıf yok</option>';
    if (oncekiS && DB.siniflar.some(s => String(s.id) === String(oncekiS))) {
      sSel.value = oncekiS;
    }
  }

  uypPlanSecildi();
}

/* ═════ PLAN SEÇİLDİĞİNDE BİLGİ ROZETİ ═════ */
export function uypPlanSecildi() {
  const pSel = $('uypHizliPlanSecim');
  const bRozet = $('uypBilgiRozeti');
  if (!pSel || !bRozet) return;

  const plan = planBul(pSel.value);
  if (!plan) {
    bRozet.innerHTML = '';
    return;
  }

  const haftaSayisi = new Set((plan.haftalar || []).map(h => h.hafta)).size;
  const konuSayisi = (plan.haftalar || []).length;
  bRozet.innerHTML = `
    <span><b>Müfredat:</b> ${plan.ders} (${plan.kademe || 'Genel'})</span>
    <span>•</span>
    <span><b>Toplam:</b> ${haftaSayisi} Hafta / ${konuSayisi} Konu</span>
    ${plan.aciklama ? `<span>• <i style="color:#047857">${plan.aciklama}</i></span>` : ''}
  `;
}

/* ═════ SEÇİLİ SINIFINA PLANI ÇEK (ASIL FONKSİYON) ═════ */
export function uypPlaniSinifaCek(planId, sinifId, secenekler = {}) {
  const pId = planId || ($('uypHizliPlanSecim') && $('uypHizliPlanSecim').value);
  const sId = Number(sinifId || ($('uypHizliSinifSecim') && $('uypHizliSinifSecim').value));

  if (!pId) { toast('Lütfen bir yıllık plan seçin', false); return; }
  if (!sId) { toast('Lütfen hedef sınıf seçin', false); return; }

  const plan = planBul(pId);
  if (!plan) { toast('Seçilen plan bulunamadı', false); return; }

  const sinif = DB.siniflar.find(s => s.id === sId);
  if (!sinif) { toast('Seçilen sınıf bulunamadı', false); return; }

  const mevcutDersKonulari = (DB.konular || []).filter(k => k.sinifId === sId && (k.ders || '').toLowerCase() === (plan.ders || '').toLowerCase());

  let temizleVeYukle = false;
  if (mevcutDersKonulari.length > 0 && secenekler.temizleVeYukle === undefined) {
    const onay = confirm(`"${sinif.ad}" sınıfında zaten ${mevcutDersKonulari.length} adet "${plan.ders}" konusu var.\n\n[TAMAM] derseniz mevcut "${plan.ders}" konuları silinip yıllık plan sıfırdan yüklenecektir.\n[İPTAL] derseniz yeni plan konuları mevcutların sonuna eklenecektir.`);
    temizleVeYukle = onay;
  } else if (secenekler.temizleVeYukle === true) {
    temizleVeYukle = true;
  }

  if (temizleVeYukle) {
    DB.konular = (DB.konular || []).filter(k => !(k.sinifId === sId && (k.ders || '').toLowerCase() === (plan.ders || '').toLowerCase()));
  }

  if (!DB.konular) DB.konular = [];
  const mevcut = DB.konular.filter(k => k.sinifId === sId);
  let sira = mevcut.length ? Math.max(...mevcut.map(k => k.sira || 0)) + 1 : 0;

  let eklenen = 0;
  (plan.haftalar || []).forEach(item => {
    const haftaStr = item.hafta ? `${item.hafta}. Hafta` : '';
    const tarihStr = item.tarih ? item.tarih : (item.ay || '');
    const etiketParcalar = [];
    if (haftaStr) etiketParcalar.push(haftaStr);
    if (tarihStr) etiketParcalar.push(tarihStr);
    const etiket = etiketParcalar.length ? `[${etiketParcalar.join(' • ')}]` : '';

    DB.konular.push({
      id: nid(),
      sinifId: sId,
      ders: plan.ders || 'Genel',
      hafta: item.hafta || null,
      ay: item.ay || '',
      tarih: item.tarih || '',
      saat: item.saat || null,
      unite: item.unite || '',
      etiket: etiket,
      baslik: item.konu || item.baslik || '',
      alt: !!item.alt,
      durum: 'baslanacak',
      sira: sira++
    });
    eklenen++;
  });

  saveDB();
  toast(`🎉 ${plan.ad} başarıyla "${sinif.ad}" sınıfına aktarıldı! (${eklenen} konu/kazanım)`);

  // Sınıf listesini ve detayını güncelle
  if (window.renderSiniflar) window.renderSiniflar();
  if (window.sinifDetayGoster) window.sinifDetayGoster(sId, 'ders');

  // Modal açıksa kapat
  const m = $('uypModal');
  if (m) m.classList.add('hidden');
}

/* ═════ MODAL YÖNETİMİ ═════ */
export function uypModalAc(sekme = 'yukle') {
  const m = $('uypModal');
  if (!m) return;
  m.classList.remove('hidden');

  const yuklePanel = $('uypModalYuklePanel');
  const yonetPanel = $('uypModalYonetPanel');
  const onizlePanel = $('uypModalOnizlePanel');

  if (yuklePanel) yuklePanel.classList.toggle('hidden', sekme !== 'yukle');
  if (yonetPanel) yonetPanel.classList.toggle('hidden', sekme !== 'yonet');
  if (onizlePanel) onizlePanel.classList.toggle('hidden', sekme !== 'onizle');

  const tabYukle = $('uypTabYukle');
  const tabYonet = $('uypTabYonet');
  const tabOnizle = $('uypTabOnizle');
  if (tabYukle) tabYukle.className = 'tab' + (sekme === 'yukle' ? ' on' : '');
  if (tabYonet) tabYonet.className = 'tab' + (sekme === 'yonet' ? ' on' : '');
  if (tabOnizle) tabOnizle.className = 'tab' + (sekme === 'onizle' ? ' on' : '');

  if (sekme === 'yonet') uypYonetimListesiRender();
  if (sekme === 'onizle') {
    const pSel = $('uypHizliPlanSecim');
    if (pSel && pSel.value) uypPlaniOnizleGoster(pSel.value);
  }
}

export function uypPlaniOnizleModal() {
  const pSel = $('uypHizliPlanSecim');
  if (!pSel || !pSel.value) { toast('Lütfen bir plan seçin', false); return; }
  uypModalAc('onizle');
  uypPlaniOnizleGoster(pSel.value);
}

/* ═════ PLAN ÖNİZLEME ═════ */
export function uypPlaniOnizleGoster(planId) {
  const plan = planBul(planId);
  const alan = $('uypOnizleIcerik');
  if (!alan) return;

  if (!plan) {
    alan.innerHTML = '<div class="empty">Plan bulunamadı.</div>';
    return;
  }

  let h = `
    <div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
      <div>
        <h3 style="margin:0;font-size:16px;color:#1e293b">${plan.ad}</h3>
        <p class="muted" style="margin:2px 0 0;font-size:12px">Ders: <b>${plan.ders}</b> • Kademe: ${plan.kademe || 'Genel'} • Toplam ${plan.haftalar.length} Hafta/Kazanım</p>
      </div>
      <button class="btn green sm" onclick="window.uypPlaniSinifaCek('${plan.id}')">📥 Bu Planı Sınıfa Çek</button>
    </div>
    <div style="max-height:55vh;overflow-y:auto;border:1px solid var(--border);border-radius:8px">
      <table class="table" style="font-size:12px">
        <thead>
          <tr style="position:sticky;top:0;background:#f8fafc;z-index:2">
            <th style="width:50px">Hafta</th>
            <th style="width:110px">Ay / Tarih</th>
            <th style="width:50px">Saat</th>
            <th style="width:130px">Ünite</th>
            <th>Konu / Kazanım</th>
          </tr>
        </thead>
        <tbody>
  `;

  (plan.haftalar || []).forEach(row => {
    h += `
      <tr style="${row.alt ? 'background:#fafafa' : ''}">
        <td style="font-weight:700;color:var(--indigo)">${row.hafta || '—'}</td>
        <td class="muted">${row.ay || ''} ${row.tarih ? `<br><small>${row.tarih}</small>` : ''}</td>
        <td>${row.saat ? row.saat + 's' : '—'}</td>
        <td style="font-weight:600;color:#0f766e">${row.unite || '—'}</td>
        <td>
          ${row.alt ? '<span class="muted" style="margin-right:4px">↳</span>' : ''}
          <b>${row.konu}</b>
        </td>
      </tr>
    `;
  });

  h += '</tbody></table></div>';
  alan.innerHTML = h;
}

/* ═════ PLANLARI YÖNETME LİSTESİ ═════ */
export function uypYonetimListesiRender() {
  const alan = $('uypYonetimListesi');
  if (!alan) return;

  const ozel = DB.yillikPlanlar || [];
  let h = '';

  h += '<h4 style="margin:0 0 8px;font-size:13px;color:var(--muted)">Sistem Varsayılan Planları (Sabit)</h4>';
  h += VARSAYILAN_PLANLAR.map(p => `
    <div class="row" style="background:#f8fafc;margin-bottom:6px">
      <div>
        <b>${p.ad}</b>
        <div class="muted" style="font-size:11px">${p.ders} • ${p.haftalar.length} Konu/Hafta • ${p.kademe || 'Genel'}</div>
      </div>
      <div class="flex" style="gap:4px">
        <button class="btn sm gray" onclick="window.uypPlaniOnizleGoster('${p.id}'); window.uypModalAc('onizle')">👁️ İncele</button>
      </div>
    </div>
  `).join('');

  h += '<h4 style="margin:16px 0 8px;font-size:13px;color:var(--indigo)">Yüklediğiniz Özel Planlar</h4>';
  if (!ozel.length) {
    h += '<div class="empty" style="padding:16px">Henüz yüklediğiniz özel bir plan yok. "Yeni Plan Yükle" sekmesinden dosya yükleyebilirsiniz.</div>';
  } else {
    h += ozel.map(p => `
      <div class="row" style="margin-bottom:6px">
        <div>
          <b style="color:var(--indigo)">${p.ad}</b>
          <div class="muted" style="font-size:11px">${p.ders} • ${p.haftalar.length} Konu/Hafta • Eklenme: ${p.eklenmeTarihi || '—'}</div>
        </div>
        <div class="flex" style="gap:4px">
          <button class="btn sm gray" onclick="window.uypPlaniOnizleGoster('${p.id}'); window.uypModalAc('onizle')">👁️ İncele</button>
          <button class="btn sm red" onclick="window.uypOzelPlanSil('${p.id}')">🗑️ Sil</button>
        </div>
      </div>
    `).join('');
  }

  alan.innerHTML = h;
}

export function uypOzelPlanSil(id) {
  const p = (DB.yillikPlanlar || []).find(x => String(x.id) === String(id));
  if (!p) return;
  if (!confirm(`"${p.ad}" adlı özel planı silmek istediğinize emin misiniz?`)) return;

  DB.yillikPlanlar = (DB.yillikPlanlar || []).filter(x => String(x.id) !== String(id));
  saveDB();
  toast('Özel plan silindi');
  uypSelectleriGuncelle();
  uypYonetimListesiRender();
}

/* ═════ DOSYA YÜKLEME VE AYRIŞTIRMA (PARSER ENGINE) ═════ */
export async function parseUypDosya(file) {
  if (!file) return;

  const durumEl = $('uypYukleDurum');
  if (durumEl) {
    durumEl.classList.remove('hidden');
    durumEl.innerHTML = `<span style="display:inline-block;animation:spin 1s infinite">⏳</span> <b>"${file.name}"</b> ayrıştırılıyor, lütfen bekleyin...`;
  }

  try {
    const ext = file.name.split('.').pop().toLowerCase();
    let taslak = null;

    if (ext === 'pdf') {
      taslak = await parseUypPdf(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
      taslak = await parseUypExcel(file);
    } else if (ext === 'docx') {
      taslak = await parseUypWord(file);
    } else {
      // txt, csv or json
      const text = await file.text();
      taslak = parseUypMetin(text, file.name);
    }

    if (!taslak || !taslak.haftalar || taslak.haftalar.length === 0) {
      throw new Error('Dosyada geçerli haftalık plan veya konu satırı tespit edilemedi. Lütfen dosya formatını kontrol edin veya tablo metnini yapıştırmayı deneyin.');
    }

    taslakUyp = taslak;
    if (durumEl) durumEl.classList.add('hidden');
    renderUypOnayPaneli(taslak);
    toast(`✅ ${taslak.haftalar.length} haftalık konu başarıyla okundu! Lütfen kontrol edip onaylayın.`);
  } catch (err) {
    console.error('ÜYP Ayrıştırma Hatası:', err);
    if (durumEl) {
      durumEl.innerHTML = `<span style="color:var(--red)">⚠️ Hata: ${err.message || 'Dosya okunamadı'}</span>`;
    }
    toast(err.message || 'Dosya ayrıştırılamadı', false);
  }
}

/* ═════ 1. PDF ÜYP AYRIŞTIRICI ═════ */
async function parseUypPdf(file) {
  if (!window.pdfjsLib) throw new Error('PDF kütüphanesi yüklenemedi');

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const numPages = pdf.numPages;

  let allLines = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const items = content.items;

    // Y koordinatına göre satırları grupla
    const rowMap = new Map();
    items.forEach(item => {
      const text = (item.str || '').trim();
      if (!text) return;
      const y = Math.round(item.transform[5]);
      const x = Math.round(item.transform[4]);

      // Yakın Y değerlerini aynı satırda birleştir (tolerans: 4px)
      let foundY = null;
      for (const existingY of rowMap.keys()) {
        if (Math.abs(existingY - y) <= 4) {
          foundY = existingY;
          break;
        }
      }
      const targetY = foundY !== null ? foundY : y;
      if (!rowMap.has(targetY)) rowMap.set(targetY, []);
      rowMap.get(targetY).push({ x, text });
    });

    // Satırları Y (yukarıdan aşağıya) ve X (soldan sağa) sırala
    const sortedY = [...rowMap.keys()].sort((a, b) => b - a);
    sortedY.forEach(y => {
      const itemsInRow = rowMap.get(y).sort((a, b) => a.x - b.x);
      const rowText = itemsInRow.map(it => it.text).join('   ');
      allLines.push(rowText);
    });
  }

  return parseLinesIntoUyp(allLines, file.name);
}

/* ═════ 2. EXCEL (.xlsx / .xls) ÜYP AYRIŞTIRICI ═════ */
async function parseUypExcel(file) {
  if (!window.XLSX) throw new Error('Excel kütüphanesi hazır değil');

  const arrayBuffer = await file.arrayBuffer();
  const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  // 2D Array olarak al
  const rawRows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (!rawRows || !rawRows.length) throw new Error('Excel sayfası boş');

  // Başlık satırını tespit et
  let headerIdx = -1;
  let colMap = { ay: -1, hafta: -1, saat: -1, unite: -1, konu: -1, tarih: -1 };

  for (let i = 0; i < Math.min(rawRows.length, 15); i++) {
    const row = rawRows[i].map(c => String(c).trim().toLowerCase());
    const rowStr = row.join(' ');
    if (rowStr.includes('hafta') || rowStr.includes('kazanım') || rowStr.includes('konu') || rowStr.includes('ünite')) {
      headerIdx = i;
      row.forEach((cell, idx) => {
        if (cell.includes('ay')) colMap.ay = idx;
        if (cell.includes('hafta')) colMap.hafta = idx;
        if (cell.includes('saat') || cell.includes('süre')) colMap.saat = idx;
        if (cell.includes('ünite') || cell.includes('öğrenme alanı') || cell.includes('tema')) colMap.unite = idx;
        if (cell.includes('kazanım') || cell.includes('konu') || cell.includes('alt öğrenme')) {
          if (colMap.konu === -1) colMap.konu = idx;
        }
        if (cell.includes('tarih') || cell.includes('gün')) colMap.tarih = idx;
      });
      break;
    }
  }

  const haftalar = [];
  let aktifAy = 'Eylül';
  let aktifUnite = 'Genel';
  let haftaSayaci = 1;

  const baslangic = headerIdx !== -1 ? headerIdx + 1 : 0;

  for (let i = baslangic; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || !row.some(c => String(c).trim().length > 0)) continue;

    let cellAy = colMap.ay !== -1 ? String(row[colMap.ay] || '').trim() : '';
    let cellHafta = colMap.hafta !== -1 ? String(row[colMap.hafta] || '').trim() : '';
    let cellSaat = colMap.saat !== -1 ? Number(row[colMap.saat]) || 4 : 4;
    let cellUnite = colMap.unite !== -1 ? String(row[colMap.unite] || '').trim() : '';
    let cellKonu = colMap.konu !== -1 ? String(row[colMap.konu] || '').trim() : '';
    let cellTarih = colMap.tarih !== -1 ? String(row[colMap.tarih] || '').trim() : '';

    // Kolon haritası tam tutmadıysa en uzun metni konu kabul et
    if (!cellKonu) {
      const textCells = row.map(c => String(c).trim()).filter(c => c.length > 5);
      if (textCells.length) cellKonu = textCells[textCells.length - 1];
    }

    if (!cellKonu || cellKonu.toLowerCase().includes('toplam') || cellKonu.toLowerCase().includes('imza')) continue;

    if (cellAy) aktifAy = cellAy;
    if (cellUnite) aktifUnite = cellUnite;

    let haftaNum = parseInt(cellHafta.replace(/\D/g, '')) || haftaSayaci;
    if (haftaNum > 0) haftaSayaci = haftaNum + 1;

    haftalar.push({
      hafta: haftaNum || haftaSayaci++,
      ay: cellAy || aktifAy,
      tarih: cellTarih || '',
      saat: cellSaat || 4,
      unite: cellUnite || aktifUnite,
      konu: cellKonu,
      alt: false
    });
  }

  // Plan adını türet
  const dosyaAdiTemiz = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  return {
    id: 'uyp_' + Date.now(),
    ad: dosyaAdiTemiz || 'Yüklenen Yıllık Plan',
    ders: dosyaAdiTemiz.toLowerCase().includes('matematik') ? 'Matematik' : 'Türkçe',
    kademe: 'YKS / Lise',
    eklenmeTarihi: new Date().toLocaleDateString('tr-TR'),
    haftalar
  };
}

/* ═════ 3. WORD (.docx) ÜYP AYRIŞTIRICI ═════ */
async function parseUypWord(file) {
  if (!window.mammoth) throw new Error('Word okuma kütüphanesi hazır değil');

  const arrayBuffer = await file.arrayBuffer();
  const res = await window.mammoth.convertToHtml({ arrayBuffer });
  const html = res.value;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const rows = doc.querySelectorAll('tr');

  if (!rows || !rows.length) {
    // Tablo yoksa paragrafları satır olarak al
    const lines = [...doc.querySelectorAll('p')].map(p => p.textContent.trim()).filter(Boolean);
    return parseLinesIntoUyp(lines, file.name);
  }

  const allLines = [];
  rows.forEach(tr => {
    const cells = [...tr.querySelectorAll('td, th')].map(td => td.textContent.trim()).filter(Boolean);
    if (cells.length) allLines.push(cells.join('   '));
  });

  return parseLinesIntoUyp(allLines, file.name);
}

/* ═════ 4. METİN / TABLO SATIRLARI ÜZERİNDEN GENEL AKILLI AYRIŞTIRMA ═════ */
export function parseLinesIntoUyp(lines, dosyaAdi = 'Yıllık Plan') {
  const AYLAR = ['eylül', 'ekim', 'kasım', 'aralık', 'ocak', 'şubat', 'mart', 'nisan', 'mayıs', 'haziran'];
  let aktifAy = 'Eylül';
  let aktifUnite = 'Genel';
  let haftaSayac = 1;

  const haftalar = [];

  lines.forEach(raw => {
    const line = raw.trim();
    if (!line || line.length < 3) return;

    const lower = line.toLowerCase();

    // Önemsiz başlık satırlarını atla
    if (lower.includes('ünitelendirilmiş yıllık plan') || lower.includes('t.c. millî eğitim') || lower.includes('ders saati') && lower.includes('öğrenme alanı')) {
      return;
    }

    // Ay tespiti
    for (const ay of AYLAR) {
      if (lower.startsWith(ay) || lower.includes(` ${ay} `) || lower.includes(`${ay}:`)) {
        aktifAy = ay.charAt(0).toUpperCase() + ay.slice(1);
        break;
      }
    }

    // Hafta tespiti (örn: "1. HAFTA", "12. Hafta", "Hafta 3", "1.Hafta")
    let hNum = null;
    const mHafta = line.match(/(\d{1,2})\s*\.?\s*hafta/i) || line.match(/hafta\s*(\d{1,2})/i);
    if (mHafta) {
      hNum = parseInt(mHafta[1], 10);
      haftaSayac = hNum + 1;
    }

    // Tarih aralığı tespiti (örn: 15-19 Eylül, 22.09-26.09)
    let tarih = '';
    const mTarih = line.match(/(\d{1,2}\s*[-–\/]\s*\d{1,2}\s+[a-zçğıöşü]+)/i) || line.match(/(\d{1,2}\.\d{1,2}\s*[-–]\s*\d{1,2}\.\d{1,2})/);
    if (mTarih) {
      tarih = mTarih[1].trim();
    }

    // Saat tespiti
    let saat = 4;
    const mSaat = line.match(/\b([2-6])\s*(?:saat|s\b)/i);
    if (mSaat) saat = parseInt(mSaat[1], 10);

    // Ünite tespiti
    const mUnite = line.match(/(?:ünite|öğrenme alanı|tema)\s*[:\-]?\s*([^\d\n\r]+)/i);
    if (mUnite && mUnite[1].trim().length > 3) {
      aktifUnite = mUnite[1].trim();
    }

    // Konu / Kazanım metnini temizle
    let konuMetni = line;
    // Ay, hafta, saat gibi belirteçleri konudan arındır
    konuMetni = konuMetni.replace(/(\d{1,2})\s*\.?\s*hafta/gi, '');
    konuMetni = konuMetni.replace(/\b(eylül|ekim|kasım|aralık|ocak|şubat|mart|nisan|mayıs|haziran)\b/gi, '');
    konuMetni = konuMetni.replace(/\b([2-6])\s*(?:saat|s\b)/gi, '');
    if (tarih) konuMetni = konuMetni.replace(tarih, '');
    konuMetni = konuMetni.replace(/^[\s\-\–•*|:;\t]+/g, '').replace(/[\s\-\–•*|:;\t]+$/g, '').trim();

    if (konuMetni.length >= 4 && !konuMetni.match(/^(toplam|imza|onay|okul müdürü|zümre başkanı)/i)) {
      haftalar.push({
        hafta: hNum || haftaSayac++,
        ay: aktifAy,
        tarih: tarih,
        saat: saat,
        unite: aktifUnite,
        konu: konuMetni,
        alt: false
      });
    }
  });

  const dosyaAdiTemiz = dosyaAdi.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  return {
    id: 'uyp_' + Date.now(),
    ad: dosyaAdiTemiz || 'Yıllık Plan',
    ders: dosyaAdiTemiz.toLowerCase().includes('matematik') ? 'Matematik' : 'Türkçe',
    kademe: 'YKS / Lise',
    eklenmeTarihi: new Date().toLocaleDateString('tr-TR'),
    haftalar
  };
}

export function parseUypMetin(text, dosyaAdi = 'Yapıştırılan Plan') {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  return parseLinesIntoUyp(lines, dosyaAdi);
}

/* ═════ ONAY VE DÜZENLEME PANELİ RENDER ═════ */
export function renderUypOnayPaneli(taslak) {
  const panel = $('uypOnayAlani');
  if (!panel) return;

  panel.classList.remove('hidden');

  let h = `
    <div class="card" style="border:2px solid #059669;background:#f0fdf4;margin-top:14px">
      <div class="flex" style="justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <div>
          <h3 style="margin:0;color:#065f46">📑 Yıllık Plan İnceleme ve Onay Masası</h3>
          <p style="font-size:12px;color:#047857;margin:2px 0 0">
            Ayrıştırılan ${taslak.haftalar.length} satırı aşağıdan kontrol edebilir, düzenleyebilir ve sisteme kaydedebilirsiniz.
          </p>
        </div>
        <div class="flex" style="gap:6px">
          <button class="btn green sm" onclick="window.uypOnayVeKaydet(false)">💾 Plan Şablonu Olarak Kaydet</button>
          <button class="btn indigo sm" onclick="window.uypOnayVeKaydet(true)">🚀 Kaydet & Sınıfa Aktar</button>
          <button class="btn gray sm" onclick="$('uypOnayAlani').classList.add('hidden')">✕ İptal</button>
        </div>
      </div>

      <!-- Plan Üst Bilgileri -->
      <div class="grid-3 mt-3" style="background:#ffffff;padding:12px;border-radius:8px;border:1px solid #a7f3d0">
        <div>
          <label style="font-size:11px;font-weight:700;color:#065f46">Plan Adı *</label>
          <input id="uypOnayAd" value="${taslak.ad}" style="width:100%;font-size:13px">
        </div>
        <div>
          <label style="font-size:11px;font-weight:700;color:#065f46">Ders Adı *</label>
          <input id="uypOnayDers" value="${taslak.ders}" list="hfDersOneri" style="width:100%;font-size:13px">
        </div>
        <div>
          <label style="font-size:11px;font-weight:700;color:#065f46">Kademe / Seviye</label>
          <input id="uypOnayKademe" value="${taslak.kademe || 'YKS'}" style="width:100%;font-size:13px">
        </div>
      </div>

      <!-- Düzenlenebilir Tablo -->
      <div style="max-height:45vh;overflow-y:auto;margin-top:12px;border:1px solid #cbd5e1;border-radius:8px;background:#ffffff">
        <table class="table" id="uypOnayTablosu" style="font-size:12px">
          <thead>
            <tr style="position:sticky;top:0;background:#f8fafc;z-index:2">
              <th style="width:55px">Hafta</th>
              <th style="width:90px">Ay</th>
              <th style="width:110px">Tarih</th>
              <th style="width:60px">Saat</th>
              <th style="width:140px">Ünite</th>
              <th>Konu / Kazanım Metni</th>
              <th style="width:40px">Alt?</th>
              <th style="width:40px">Sil</th>
            </tr>
          </thead>
          <tbody>
  `;

  taslak.haftalar.forEach((row, idx) => {
    h += `
      <tr data-idx="${idx}">
        <td><input class="uyp-edit-h" value="${row.hafta || ''}" style="width:45px;padding:3px;font-size:11px;text-align:center"></td>
        <td><input class="uyp-edit-ay" value="${row.ay || ''}" style="width:80px;padding:3px;font-size:11px"></td>
        <td><input class="uyp-edit-tarih" value="${row.tarih || ''}" placeholder="örn: 15-19 Eylül" style="width:105px;padding:3px;font-size:11px"></td>
        <td><input class="uyp-edit-saat" type="number" value="${row.saat || 4}" style="width:50px;padding:3px;font-size:11px;text-align:center"></td>
        <td><input class="uyp-edit-unite" value="${row.unite || ''}" style="width:130px;padding:3px;font-size:11px"></td>
        <td><input class="uyp-edit-konu" value="${row.konu.replace(/"/g, '&quot;')}" style="width:100%;padding:3px;font-size:12px"></td>
        <td style="text-align:center"><input type="checkbox" class="uyp-edit-alt" ${row.alt ? 'checked' : ''}></td>
        <td><button class="btn sm red" onclick="window.uypOnaySatirSil(${idx})" style="padding:2px 6px">🗑️</button></td>
      </tr>
    `;
  });

  h += `
          </tbody>
        </table>
      </div>
      <div class="flex mt-3" style="justify-content:space-between">
        <button class="btn sm gray" onclick="window.uypOnaySatirEkle()">➕ Yeni Satır / Hafta Ekle</button>
        <span class="muted" style="font-size:11px">💡 Tablodaki tüm alanlar düzenlenebilir durumdadır.</span>
      </div>
    </div>
  `;

  panel.innerHTML = h;
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

export function uypOnaySatirSil(idx) {
  if (!taslakUyp || !taslakUyp.haftalar) return;
  taslakUyp.haftalar.splice(idx, 1);
  renderUypOnayPaneli(taslakUyp);
}

export function uypOnaySatirEkle() {
  if (!taslakUyp) return;
  const sonHafta = taslakUyp.haftalar.length ? (taslakUyp.haftalar[taslakUyp.haftalar.length - 1].hafta || 0) + 1 : 1;
  taslakUyp.haftalar.push({
    hafta: sonHafta,
    ay: 'Eylül',
    tarih: '',
    saat: 4,
    unite: 'Yeni Ünite',
    konu: 'Yeni Konu Başlığı',
    alt: false
  });
  renderUypOnayPaneli(taslakUyp);
}

/* ═════ ONAYLAYIP KAYDETME ═════ */
export function uypOnayVeKaydet(dogrudanSinifaAktar = false) {
  if (!taslakUyp) return;

  const ad = $('uypOnayAd').value.trim() || 'Özel Yıllık Plan';
  const ders = $('uypOnayDers').value.trim() || 'Genel';
  const kademe = $('uypOnayKademe').value.trim() || 'Genel';

  const rows = document.querySelectorAll('#uypOnayTablosu tbody tr');
  const guncelHaftalar = [];

  rows.forEach(tr => {
    const h = parseInt(tr.querySelector('.uyp-edit-h').value, 10) || null;
    const ay = tr.querySelector('.uyp-edit-ay').value.trim();
    const tarih = tr.querySelector('.uyp-edit-tarih').value.trim();
    const saat = parseInt(tr.querySelector('.uyp-edit-saat').value, 10) || 4;
    const unite = tr.querySelector('.uyp-edit-unite').value.trim();
    const konu = tr.querySelector('.uyp-edit-konu').value.trim();
    const alt = tr.querySelector('.uyp-edit-alt').checked;

    if (konu) {
      guncelHaftalar.push({ hafta: h, ay, tarih, saat, unite, konu, alt });
    }
  });

  if (!guncelHaftalar.length) {
    toast('Hiç geçerli konu satırı bulunamadı', false);
    return;
  }

  const yeniPlan = {
    id: 'uyp_' + Date.now(),
    ad: ad,
    ders: ders,
    kademe: kademe,
    eklenmeTarihi: new Date().toLocaleDateString('tr-TR'),
    haftalar: guncelHaftalar
  };

  if (!DB.yillikPlanlar) DB.yillikPlanlar = [];
  DB.yillikPlanlar.push(yeniPlan);
  saveDB();

  uypSelectleriGuncelle();
  $('uypOnayAlani').classList.add('hidden');
  taslakUyp = null;

  toast(`💾 "${yeniPlan.ad}" planı başarıyla kaydedildi!`);

  if (dogrudanSinifaAktar) {
    const sSel = $('uypHizliSinifSecim');
    const hedefSinifId = sSel ? Number(sSel.value) : (DB.siniflar[0] ? DB.siniflar[0].id : null);
    if (hedefSinifId) {
      uypPlaniSinifaCek(yeniPlan.id, hedefSinifId);
    } else {
      toast('Önce bir sınıf eklemelisiniz', false);
    }
  }
}
