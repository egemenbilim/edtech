/* ══════════════════════════════════════════════════════
   Öğrenci Takip Sistemi — Evrensel PDF Deneme Ayrıştırıcı ve Onay Modülü
   Desteklenen Sınav Türleri: LGS, TYT, AYT (SAY, EA, SÖZ) ve Genel Şube Listeleri
   ══════════════════════════════════════════════════════ */

import {
  DB, saveDB, nid, netHesapla, denemeBulVeyaOlustur
} from '../state.js';
import {
  $, toast, fmtTarih, ogrenciAdi, sinifAdi,
  trNormalize, enIyiOgrenciEslestir, ogrenciBenzerlikHesapla
} from '../utils.js';
import { renderDenemeler, dersListesiniOlustur } from './denemeler.js';

let aktifPdfVerisi = null;
let onUpdateSelectsCallback = null;

export function setPdfSelectCallback(cb) {
  onUpdateSelectsCallback = cb;
}

function notifySelects() {
  if (onUpdateSelectsCallback) onUpdateSelectsCallback();
}

/* ═════ TÜRKÇE KARAKTER TEMİZLEYİCİ ═════ */
export function cleanTurkishText(text) {
  if (!text) return '';
  let s = String(text);

  // PDF font eşleme sorunları için yaygın kalıplar
  const dict = {
    'HSEY  N': 'HÜSEYİN',
    'HSEYN': 'HÜSEYİN',
    'ZDEM  R': 'ÖZDEMİR',
    'ALİEFE': 'ALİ EFE',
    'ALEFE': 'ALİ EFE',
    'AL  EFE': 'ALİ EFE',
    'KA  AN': 'KAĞAN',
    'KAAN': 'KAĞAN',
    'ZAVOTU': 'ZAVOTÇU',
    'A  CA': 'AĞCA',
    'ACA': 'AĞCA',
    'TANRIVER': 'TANRIÖVER',
    'Trke': 'Türkçe',
    'Corafya': 'Coğrafya',
    'Co  rafya': 'Coğrafya',
    'Snf': 'Sınıf',
    'ube': 'Şube',
    ' l': 'İl',
    ' le': 'İlçe',
    'Snav': 'Sınav',
    'Hz': 'Hız',
    'MAAR  F0': 'MAARİF',
    'MAARF0': 'MAARİF',
    'MAAR  F': 'MAARİF',
    'MAAR İ F0': 'MAARİF0',
    'MAAR İ F': 'MAARİF',
    'KOCAEL ': 'KOCAELİ',
    ' ZM  T': 'İZMİT',
    'zmit': 'İzmit',
    'sral': 'sıralı'
  };

  for (const [k, v] of Object.entries(dict)) {
    s = s.replaceAll(k, v);
  }

  // Özel harf ve eksik 'İ' düzeltmeleri (Örn: RIFAT AL YEŞİLYURT -> RIFAT ALİ YEŞİLYURT, ama BİLAL bozulmaz):
  s = s.replace(/(?<![A-Za-zÇĞİÖŞÜçğıöşü])AL(?![A-Za-zÇĞİÖŞÜçğıöşü])/gu, 'ALİ');
  s = s.replace(/(?<![A-Za-zÇĞİÖŞÜçğıöşü])AL[İI]\s*[İI]\s*EFE(?![A-Za-zÇĞİÖŞÜçğıöşü])/gui, 'ALİ EFE');
  s = s.replace(/(?<![A-Za-zÇĞİÖŞÜçğıöşü])AL\s*[İI]\s*EFE(?![A-Za-zÇĞİÖŞÜçğıöşü])/gui, 'ALİ EFE');

  // Kelime içine yanlışlıkla tek boşlukla girmiş Türkçe harfleri kaynaştır:
  s = s.replace(/([A-ZÇĞİÖŞÜa-zçğıöşü]{2,})\s+([İĞŞÇÖÜıüğşçö])\s+([A-ZÇĞİÖŞÜa-zçğıöşü]{1,})/g, '$1$2$3');
  s = s.replace(/(\b[A-ZÇĞİÖŞÜa-zçğıöşü])\s+([İĞŞÇÖÜıüğşçö])\s+([A-ZÇĞİÖŞÜa-zçğıöşü]{2,})/g, '$1$2$3');

  // Unicode replacement karakterlerini ve fazla boşlukları temizle
  s = s.replace(/\ufffd/g, '');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

/* ═════ EVRENSEL PDF DENEME METNİ ÇÖZÜMLEME ═════ */
export function parseExamLines(lines) {
  if (!lines || !lines.length) return { error: 'PDF içeriği okunamadı veya boş.' };

  let sinavTuru = 'TYT';
  let sinavAdi = '';
  let sinavTarihi = '';
  let subeKurum = '';

  // 1. Üst bilgileri tara
  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    const l = lines[i];

    // Sınav Türü Tespiti
    if (/\bLGS\b/i.test(l)) {
      sinavTuru = 'LGS';
    } else if (/\bAYT\b/i.test(l)) {
      sinavTuru = 'AYT';
    } else if (/\bTYT\b/i.test(l) && sinavTuru !== 'LGS') {
      sinavTuru = 'TYT';
    }

    // Tarih tespiti: GG.AA.YYYY
    const tm = l.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (tm && !sinavTarihi) {
      sinavTarihi = `${tm[3]}-${tm[2].padStart(2, '0')}-${tm[1].padStart(2, '0')}`;
    }

    // Deneme Adı tespiti (örn: "12.09.2026 - 8010 - TDP HBS BİRLEŞİK" veya "12.09.2026 - 110300 - 11 Hız ve Renk MAARİF0 TYT")
    const nm = l.match(/\d{1,2}\.\d{1,2}\.\d{4}\s*-\s*\d+\s*-\s*([^\t\n\r]+)/);
    if (nm && !sinavAdi) {
      let rawAd = nm[1].split(/\s{2,}|\t/)[0].trim();
      rawAd = cleanTurkishText(rawAd);
      sinavAdi = rawAd.replace(/[\-\s]+$/, '').trim();
    } else if (/MAAR[İI]?F|H[ıiIİ]z ve Renk|[ÖO]zdebir|T[ÖO]DER|Limit|Yan[ıi]t|Apotemi|BİRLEŞ[İI]K|TDP/i.test(l)) {
      if (!sinavAdi && l.length > 5 && !/NET-PUAN|L[İI]STES[İI]|S[ıi]nav Tarihi|KATILIM/i.test(l)) {
        let rawAd = l.split(/\s{2,}|\t|\s+İzmit|\s+KOCAELİ|\s+Şube/i)[0].trim();
        let adClean = cleanTurkishText(rawAd);
        sinavAdi = adClean.replace(/^\d{2}\.\d{2}\.\d{4}\s*-\s*\d+\s*-\s*/, '')
                          .replace(/[\-\s]+$/, '')
                          .trim();
      }
    }

    // Şube / İlçe tespiti
    if (/İzmit|KOCAELİ|Şube|İlçe/i.test(l) && !subeKurum) {
      const sm = l.match(/([A-ZÇĞİÖŞÜa-zçğıöşü\s\-]+KOCAEL[İI][A-ZÇĞİÖŞÜa-zçğıöşü\s\-]+)/);
      if (sm) subeKurum = sm[1].trim();
    }
  }

  if (!sinavAdi) sinavAdi = `${sinavTuru} Deneme Sınavı`;
  if (!sinavTarihi) sinavTarihi = new Date().toISOString().split('T')[0];

  // 2. Öğrenci satırlarını tara
  const ogrenciler = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;

    // Evrensel Regex:
    // Pattern 1: SıraNo(opsiyonel) ÖğrNo AdSoyad Sınıf Kitapçık(1-4 hane örn AA, B, BB, 1) Sayılar...
    let m = raw.match(/^\s*(?:(\d+)\s+)?(\d{2,10})\s+(.+?)\s+([0-9A-Za-z\/\-\*]+)\s+([A-Za-z0-9\-]{1,4})\s+([\d\,\.\-\s]+)$/);
    let sira = 0, ogrNo = '', rawAd = '', pdfSinif = '', kitapcik = '-', rest = '';

    if (m) {
      sira = parseInt(m[1] || (ogrenciler.length + 1), 10);
      ogrNo = m[2].trim();
      rawAd = m[3].trim();
      pdfSinif = m[4].trim();
      kitapcik = m[5].trim();
      rest = m[6].trim();
    } else {
      // Pattern 2: Kitapçık alanı olmayan veya tek harfli kaynaşmış satırlar
      m = raw.match(/^\s*(?:(\d+)\s+)?(\d{2,10})\s+(.+?)\s+([0-9A-Za-z\/\-\*]+)\s+([\d\,\.\-\s]+)$/);
      if (!m) continue;
      sira = parseInt(m[1] || (ogrenciler.length + 1), 10);
      ogrNo = m[2].trim();
      rawAd = m[3].trim();
      pdfSinif = m[4].trim();
      kitapcik = '-';
      rest = m[5].trim();
    }

    const adSoyad = cleanTurkishText(rawAd);

    // Sayıları çıkar (virgülleri noktaya çevirerek)
    const tokens = rest.replace(/,/g, '.').split(/\s+/);
    const nums = [];
    for (const t of tokens) {
      const v = parseFloat(t);
      if (!isNaN(v)) nums.push(v);
    }

    // En az 15 sayı yoksa öğrenci satırı değildir
    if (nums.length < 15) continue;

    // Üçlü yardımcı fonksiyon: (Doğru, Yanlış, Net)
    const trip = (idx) => {
      const pos = idx * 3;
      if (pos + 2 < nums.length) {
        return {
          dogru: Math.round(nums[pos]),
          yanlis: Math.round(nums[pos + 1]),
          net: Math.round(nums[pos + 2] * 100) / 100
        };
      }
      return { dogru: 0, yanlis: 0, net: 0 };
    };

    let dersSonuclari = [];
    let toplam = { dogru: 0, yanlis: 0, net: 0 };
    let puan = 0;

    // Sınav türüne veya sayı adedine göre eşleştirme
    const isLgs = sinavTuru === 'LGS' || (nums.length >= 21 && nums.length <= 29);

    if (isLgs) {
      if (sinavTuru !== 'LGS') sinavTuru = 'LGS';

      const turkce = trip(0);
      const inkilap = trip(1);  // Sosyal / Hayat
      const din = trip(2);      // Din Kült.
      const ingilizce = trip(3);// İngilizce
      const mat = trip(4);      // Matematik
      const fen = trip(5);      // Fen Bil.
      toplam = trip(6);         // Toplam
      puan = nums.length > 21 ? nums[21] : 0;

      dersSonuclari = [
        { ders: 'Türkçe', ...turkce },
        { ders: 'İnkılap Tarihi', ...inkilap },
        { ders: 'Din Kültürü', ...din },
        { ders: 'İngilizce', ...ingilizce },
        { ders: 'Matematik', ...mat },
        { ders: 'Fen Bilimleri', ...fen }
      ];
    } else {
      // TYT Sınavı
      const turkce = trip(0);
      const tarih = trip(1);
      const cografya = trip(2);
      const felsefe = trip(3);
      const din = trip(4);
      const mat = trip(5);
      const geo = trip(6);
      const fizik = trip(7);
      const kimya = trip(8);
      const biyoloji = trip(9);
      toplam = trip(10);
      puan = nums.length > 33 ? nums[33] : 0;

      const matToplam = {
        dogru: mat.dogru + geo.dogru,
        yanlis: mat.yanlis + geo.yanlis,
        net: Math.round((mat.net + geo.net) * 100) / 100,
        altMat: mat,
        altGeo: geo
      };

      dersSonuclari = [
        { ders: 'Türkçe', ...turkce },
        { ders: 'Tarih', ...tarih },
        { ders: 'Coğrafya', ...cografya },
        { ders: 'Felsefe', ...felsefe },
        { ders: 'Din Kültürü', ...din },
        { ders: 'Matematik', ...matToplam },
        { ders: 'Fizik', ...fizik },
        { ders: 'Kimya', ...kimya },
        { ders: 'Biyoloji', ...biyoloji }
      ];
    }

    // Sistemde kayıtlı öğrenci var mı? (Adında ve soyadında ayrı ayrı %60 benzerlik kuralı)
    const match = enIyiOgrenciEslestir(adSoyad, DB.ogrenciler);
    const eslesenOgr = match.eslesti ? match.ogrenci : null;

    ogrenciler.push({
      dahilEt: true,
      sira,
      ogrNo,
      adSoyad,
      sinif: pdfSinif,
      seciliSinifId: eslesenOgr ? eslesenOgr.sinifId : null,
      kitapcik,
      mevcutOgrenci: !!eslesenOgr,
      eslesenOgrenciId: eslesenOgr ? eslesenOgr.id : null,
      eslesmeTuru: eslesenOgr ? 'auto' : 'none',
      adSim: match.adSim,
      soyadSim: match.soyadSim,
      toplamSim: match.toplamSim,
      dersSonuclari,
      toplam,
      puan
    });
  }

  if (!ogrenciler.length) {
    return { error: 'PDF içeriğinde tablo veya öğrenci satırı bulunamadı. Lütfen dosyanın "LGS, TYT veya AYT Şube Net-Puan Listesi" formatında olduğunu kontrol edin.' };
  }

  return {
    sinavTuru,
    sinavAdi,
    sinavTarihi,
    subeKurum,
    ogrenciler
  };
}

/* ═════ DOSYADAN OKUMA (PDF.JS) ═════ */
export async function parsePdfFile(file) {
  if (!window.pdfjsLib) {
    throw new Error('PDF okuma motoru hazır değil. Lütfen sayfayı yenileyin veya alternatif metin yapıştırma kutusunu kullanın.');
  }

  if (window.PDF_WORKER_BLOB_URL && window.pdfjsLib.GlobalWorkerOptions) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = window.PDF_WORKER_BLOB_URL;
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;

  const allLines = [];

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const content = await page.getTextContent();

    const rowMap = new Map();

    content.items.forEach(item => {
      const text = item.str;
      if (!text || !text.trim()) return;
      const x = item.transform[4];
      const y = item.transform[5];

      // Y toleransı: 4px
      let foundKey = null;
      for (const k of rowMap.keys()) {
        if (Math.abs(k - y) < 4.0) {
          foundKey = k;
          break;
        }
      }
      if (foundKey === null) {
        foundKey = y;
        rowMap.set(foundKey, []);
      }
      rowMap.get(foundKey).push({ str: text, x, y, width: item.width || 0 });
    });

    const sortedYs = Array.from(rowMap.keys()).sort((a, b) => b - a);

    sortedYs.forEach(yKey => {
      const itemsInRow = rowMap.get(yKey);
      itemsInRow.sort((a, b) => a.x - b.x);

      let lineStr = '';
      for (let i = 0; i < itemsInRow.length; i++) {
        const cur = itemsInRow[i];
        if (i === 0) {
          lineStr += cur.str;
        } else {
          const prev = itemsInRow[i - 1];
          const gap = cur.x - (prev.x + prev.width);
          if (gap < 0.5) {
            lineStr += cur.str;
          } else if (gap < 12) {
            lineStr += ' ' + cur.str;
          } else {
            lineStr += '   ' + cur.str;
          }
        }
      }

      if (lineStr.trim()) {
        allLines.push(lineStr.trim());
      }
    });
  }

  return parseExamLines(allLines);
}

let aktifFiltreTur = 'all';

/* ═════ ÖĞRENCİ ARAMA & SEÇENEK LİSTESİ OLUŞTURUCU ═════ */
export function siraliOgrenciSecenekleri(o) {
  if (!DB.ogrenciler || !DB.ogrenciler.length) return '';

  const list = DB.ogrenciler.map(ogr => {
    const sim = ogrenciBenzerlikHesapla(o.adSoyad, ogr.adSoyad);
    return { ogr, sim };
  });

  list.sort((a, b) => {
    // 1. Şu an seçili olan öğrenci en üstte
    if (a.ogr.id === o.eslesenOgrenciId) return -1;
    if (b.ogr.id === o.eslesenOgrenciId) return 1;
    // 2. Benzerlik puanı yüksek olanlar önce
    if (b.sim.toplamSim !== a.sim.toplamSim) return b.sim.toplamSim - a.sim.toplamSim;
    // 3. İsim alfabetik
    return a.ogr.adSoyad.localeCompare(b.ogr.adSoyad, 'tr');
  });

  return list.map(item => {
    const isSelected = item.ogr.id === o.eslesenOgrenciId;
    const simText = item.sim.toplamSim >= 50
      ? ` (%${item.sim.toplamSim} Benzer - Ad:%${item.sim.adSim} Soyad:%${item.sim.soyadSim})`
      : '';
    return `<option value="${item.ogr.id}" ${isSelected ? 'selected' : ''}>👤 ${item.ogr.adSoyad} (${sinifAdi(item.ogr.sinifId)})${simText}</option>`;
  }).join('');
}

export function durumBadgeHtml(o, idx = -1) {
  if (o.eslesenOgrenciId) {
    const ogr = DB.ogrenciler.find(x => x.id === o.eslesenOgrenciId);
    const ogrAd = ogr ? ogr.adSoyad : ogrenciAdi(o.eslesenOgrenciId);
    const ogrSinif = ogr ? ` (${sinifAdi(ogr.sinifId)})` : '';

    if (o.eslesmeTuru === 'manual') {
      return `
        <span class="pillbad" style="background:#eff6ff;color:#1e40af;border:1.5px solid #bfdbfe;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:6px;max-width:100%;padding:3px 8px">
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">🔗 Manuel: <b>${ogrAd}</b>${ogrSinif}</span>
          ${idx >= 0 ? `<button type="button" class="btn gray sm" onclick="window.pdfManuelEsleKaldir(${idx})" title="Eşleşmeyi kaldır, yeni öğrenci yap" style="padding:0 5px;font-size:10px;line-height:1.2;border-radius:4px;border:none;background:#dbeafe;color:#1e40af;cursor:pointer">✕</button>` : ''}
        </span>
      `;
    }
    const tip = `Ad: %${o.adSim || 100} • Soyad: %${o.soyadSim || 100}`;
    return `
      <span class="pillbad" style="background:#ecfdf5;color:#047857;border:1.5px solid #a7f3d0;font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:6px;max-width:100%;padding:3px 8px" title="${tip}">
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">🎯 Eşleşti: <b>${ogrAd}</b>${ogrSinif} (%${o.toplamSim || 100})</span>
        ${idx >= 0 ? `<button type="button" class="btn gray sm" onclick="window.pdfManuelEsleKaldir(${idx})" title="Eşleşmeyi kaldır, yeni öğrenci yap" style="padding:0 5px;font-size:10px;line-height:1.2;border-radius:4px;border:none;background:#d1fae5;color:#047857;cursor:pointer">✕</button>` : ''}
      </span>
    `;
  }
  return `<span class="pillbad" style="background:#fef3c7;color:#92400e;border:1.5px solid #fde68a;font-size:11px;font-weight:600;display:inline-block;padding:3px 8px">➕ Yeni Öğrenci Açılacak</span>`;
}

/* ═════ ONAY VE ÖNİZLEME EKRANI RENDER ═════ */
export function renderPdfOnayPaneli(parsed) {
  aktifPdfVerisi = parsed;
  aktifFiltreTur = 'all';
  const panel = $('pdfOnayAlani');
  if (!panel) return;

  panel.classList.remove('hidden');

  // Mevcut sınıflar dropdown seçenekleri
  const sinifSecenekleriHtml = DB.siniflar.map(s =>
    `<option value="${s.id}">${s.ad}</option>`
  ).join('');

  // PDF'ten çıkan benzersiz sınıf kodları
  const pdfSiniflar = [...new Set(parsed.ogrenciler.map(o => o.sinif))];
  const isLgs = parsed.sinavTuru === 'LGS';

  // Ders Başlıkları
  const dersBasliklari = isLgs
    ? ['Türkçe', 'İnkılap', 'Din K.', 'İngilizce', 'Matematik', 'Fen Bil.']
    : ['Türkçe', 'Sosyal', 'Matematik', 'Fen'];

  const total = parsed.ogrenciler.length;
  const matched = parsed.ogrenciler.filter(o => o.mevcutOgrenci).length;
  const newCount = total - matched;

  const html = `
    <div class="card" style="background:#f8fafc;border:2px solid var(--indigo);margin-bottom:16px">
      <div class="flex" style="justify-content:space-between;flex-wrap:wrap;gap:10px;align-items:center;border-bottom:1px solid var(--border);padding-bottom:12px">
        <div>
          <h2 style="margin:0;color:var(--indigo)">🔍 PDF Çözümleme Sonucu & Öğrenci Tasnif Onayı</h2>
          <p class="muted" style="font-size:12px;margin-top:2px">
            PDF'ten <b>${total} öğrenci</b> tespit edildi. Tasnif <b>ad ve soyad %60 benzerlik kuralına göre</b> otomatik yapıldı. Eşleşmeyenleri tek tıkla mevcut öğrencilere bağlayabilir veya ismini düzeltebilirsiniz.
          </p>
        </div>
        <button class="btn gray sm" onclick="window.pdfTemizle()">🧹 İptal / Kapat</button>
      </div>

      <!-- GENEL SINAV BİLGİLERİ -->
      <div class="grid-3 mt-3" style="gap:12px">
        <div class="field">
          <label>Sınav Türü *</label>
          <select id="pdfSinavTuru" style="font-weight:700">
            <option value="TYT" ${parsed.sinavTuru === 'TYT' ? 'selected' : ''}>TYT</option>
            <option value="AYT" ${parsed.sinavTuru === 'AYT' ? 'selected' : ''}>AYT</option>
            <option value="LGS" ${parsed.sinavTuru === 'LGS' ? 'selected' : ''}>LGS</option>
          </select>
        </div>
        <div class="field">
          <label>Deneme Adı *</label>
          <input id="pdfSinavAdi" value="${parsed.sinavAdi}" placeholder="Sınav Adı">
        </div>
        <div class="field">
          <label>Sınav Tarihi *</label>
          <input type="date" id="pdfSinavTarihi" value="${parsed.sinavTarihi}">
        </div>
      </div>

      <!-- ÖZET İSTATİSTİK VE FİLTRELEME ÇUBUĞU -->
      <div class="flex mt-3" style="justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;background:#f1f5f9;padding:10px 14px;border-radius:8px">
        <div class="flex" style="gap:12px;align-items:center;font-size:12.5px">
          <span>👥 Toplam: <b id="pdfSayacToplam">${total}</b></span>
          <span style="color:#047857">🎯 Eşleşen: <b id="pdfSayacEslesen">${matched}</b></span>
          <span style="color:#64748b">➕ Yeni Öğrenci: <b id="pdfSayacYeni">${newCount}</b></span>
        </div>
        <div class="flex" style="gap:6px">
          <button type="button" class="btn sm" id="pdfFiltre_all" onclick="window.pdfFiltrele('all')">Tümü (${total})</button>
          <button type="button" class="btn sm gray" id="pdfFiltre_matched" onclick="window.pdfFiltrele('matched')">🎯 Eşleşenler (${matched})</button>
          <button type="button" class="btn sm gray" id="pdfFiltre_new" onclick="window.pdfFiltrele('new')">➕ Yeni / Eşleşmeyenler (${newCount})</button>
        </div>
      </div>

      <!-- TOPLU SINIF BELİRLEME ÇUBUĞU -->
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px 14px;margin:12px 0">
        <div class="flex" style="flex-wrap:wrap;gap:12px;align-items:center">
          <span style="font-weight:600;color:var(--indigo);font-size:12.5px">🏫 Toplu Sınıf Ata:</span>
          <select id="pdfTopluSinifSecim" style="width:auto;min-width:180px;font-size:12px">
            <optgroup label="Sistemdeki Mevcut Sınıflar">
              ${sinifSecenekleriHtml}
            </optgroup>
            <optgroup label="PDF'teki Sınıf Koduyla Yeni Oluştur">
              ${pdfSiniflar.map(sc => `<option value="NEW_${sc}">➕ "${sc}" Adında Yeni Sınıf Aç</option>`).join('')}
            </optgroup>
          </select>
          <button class="btn sm" onclick="window.pdfTopluSinifUygula()">Tümüne Uygula</button>
          <span class="muted" style="font-size:11px">PDF'ten okunan sınıflar: <b>${pdfSiniflar.join(', ')}</b></span>
        </div>
      </div>

      <!-- ÖĞRENCİ ONAY TABLOSU -->
      <div style="overflow-x:auto;max-height:500px;border:1px solid var(--border);border-radius:8px">
        <table class="table" style="margin:0;font-size:12.5px" id="pdfOgrenciTablosu">
          <thead style="position:sticky;top:0;background:#fff;z-index:10;box-shadow:0 1px 2px rgba(0,0,0,0.05)">
            <tr>
              <th style="width:36px;text-align:center">
                <input type="checkbox" id="pdfSecTumu" checked onchange="window.pdfSecTumuDegistir(this.checked)">
              </th>
              <th style="width:38px">Sıra</th>
              <th style="width:70px">Öğr No</th>
              <th style="min-width:180px">Öğrenci Adı Soyadı (PDF / Düzenlenebilir)</th>
              <th style="min-width:260px">Sistem Eşleşmesi & "Şu Öğrenci Olarak İşaretle"</th>
              <th style="min-width:130px">Sınıf Seçimi</th>
              ${dersBasliklari.map(d => `<th class="num">${d}</th>`).join('')}
              <th class="num" style="color:var(--indigo);font-weight:700">Toplam Net</th>
              <th class="num">${isLgs ? 'LGS Puanı' : 'Puan'}</th>
            </tr>
          </thead>
          <tbody>
            ${parsed.ogrenciler.map((o, idx) => {
              const topNet = o.toplam.net.toFixed(2);

              let dersHücreleriHtml = '';
              if (isLgs) {
                const getNet = (dAd) => {
                  const x = o.dersSonuclari.find(d => d.ders === dAd);
                  return x ? x.net.toFixed(2) : '0.00';
                };
                dersHücreleriHtml = `
                  <td class="num mono">${getNet('Türkçe')}</td>
                  <td class="num mono">${getNet('İnkılap Tarihi')}</td>
                  <td class="num mono">${getNet('Din Kültürü')}</td>
                  <td class="num mono">${getNet('İngilizce')}</td>
                  <td class="num mono">${getNet('Matematik')}</td>
                  <td class="num mono">${getNet('Fen Bilimleri')}</td>
                `;
              } else {
                // TYT
                const getNet = (dAd) => {
                  const x = o.dersSonuclari.find(d => d.ders === dAd);
                  return x ? x.net : 0;
                };
                const turkceNet = getNet('Türkçe').toFixed(2);
                const matNet = getNet('Matematik').toFixed(2);
                const sosyalNet = (getNet('Tarih') + getNet('Coğrafya') + getNet('Felsefe') + getNet('Din Kültürü')).toFixed(2);
                const fenNet = (getNet('Fizik') + getNet('Kimya') + getNet('Biyoloji')).toFixed(2);
                dersHücreleriHtml = `
                  <td class="num mono">${turkceNet}</td>
                  <td class="num mono">${sosyalNet}</td>
                  <td class="num mono">${matNet}</td>
                  <td class="num mono">${fenNet}</td>
                `;
              }

              return `
                <tr id="pdf_row_${idx}" style="${o.mevcutOgrenci ? 'background:#fafdfb' : ''}">
                  <td style="text-align:center">
                    <input type="checkbox" class="pdf-row-chk" id="pdf_chk_${idx}" ${o.dahilEt ? 'checked' : ''} onchange="window.pdfRowToggle(${idx})">
                  </td>
                  <td class="muted">${o.sira}</td>
                  <td>
                    <input id="pdf_no_${idx}" value="${o.ogrNo}" style="width:65px;padding:4px 6px;font-size:12px;text-align:center">
                  </td>
                  <td>
                    <input id="pdf_ad_${idx}" value="${o.adSoyad}" oninput="window.pdfAdDegisti(${idx}, this.value)" style="width:100%;min-width:170px;padding:4px 8px;font-size:12.5px;font-weight:600;border:1px solid #cbd5e1;border-radius:6px">
                  </td>
                  <td>
                    <div style="min-width:250px;display:flex;flex-direction:column;gap:5px">
                      <div id="pdf_durum_${idx}" style="display:flex;align-items:center;justify-content:space-between;gap:4px;flex-wrap:wrap">
                        ${durumBadgeHtml(o, idx)}
                      </div>
                      <div style="display:flex;gap:4px;align-items:center">
                        <select id="pdf_ogrenci_${idx}" onchange="window.pdfOgrenciSecildi(${idx}, this.value)" style="flex:1;min-width:130px;padding:4px 6px;font-size:11.5px;border:1.5px solid ${o.mevcutOgrenci ? (o.eslesmeTuru === 'manual' ? 'var(--indigo)' : '#10b981') : '#cbd5e1'};border-radius:6px;background:${o.mevcutOgrenci ? (o.eslesmeTuru === 'manual' ? '#eff6ff' : '#f0fdf4') : '#fff'}">
                          <option value="NEW" ${!o.eslesenOgrenciId ? 'selected' : ''}>➕ Yeni Öğrenci Olarak Aç</option>
                          <optgroup label="Sistemdeki Kayıtlı Öğrenciler">
                            ${siraliOgrenciSecenekleri(o)}
                          </optgroup>
                        </select>
                        <button type="button" class="btn sm" onclick="window.pdfManuelEsleModalAc(${idx})" title="Öğrenci Arama & Manuel Eşleme Modalı Aç" style="padding:4px 8px;font-size:11.5px;font-weight:700;white-space:nowrap;background:${o.mevcutOgrenci ? '#eff6ff' : 'var(--indigo)'};color:${o.mevcutOgrenci ? 'var(--indigo)' : '#fff'};border:1.5px solid ${o.mevcutOgrenci ? '#bfdbfe' : 'var(--indigo)'};border-radius:6px">
                          🎯 ${o.mevcutOgrenci ? 'Değiştir' : 'İşaretle'}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select id="pdf_sinif_${idx}" style="width:100%;min-width:120px;padding:4px 6px;font-size:12px;border-radius:6px">
                      ${DB.siniflar.map(s => `
                        <option value="${s.id}" ${(o.seciliSinifId === s.id || (!o.seciliSinifId && s.ad === o.sinif)) ? 'selected' : ''}>
                          ${s.ad}
                        </option>
                      `).join('')}
                      <option value="NEW_${o.sinif}" ${!o.seciliSinifId && !DB.siniflar.some(s => s.ad === o.sinif) ? 'selected' : ''}>
                        ➕ Yeni: "${o.sinif}"
                      </option>
                    </select>
                  </td>
                  ${dersHücreleriHtml}
                  <td class="num mono" style="font-weight:700;color:var(--indigo)">${topNet}</td>
                  <td class="num mono muted">${o.puan ? o.puan.toFixed(3) : '—'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- AKSİYON BUTONLARI -->
      <div class="flex mt-4" style="justify-content:space-between;flex-wrap:wrap;gap:10px">
        <div class="flex" style="gap:8px">
          <button class="btn green" id="pdfOnayBtn" onclick="window.pdfOnaylaVeKaydet()">
            💾 Onayla ve Sisteme Aktar (<span id="pdfSeciliSayac">${parsed.ogrenciler.length}</span> Öğrenci)
          </button>
          <button class="btn gray" onclick="window.pdfTemizle()">İptal Et</button>
        </div>
        <div class="muted" style="font-size:11.5px;align-self:center">
          💡 İsim kutusuna yazarak adı düzeltebilir veya açılır kutudan dilediğiniz mevcut öğrenciye bağlayabilirsiniz.
        </div>
      </div>
    </div>
  `;

  panel.innerHTML = html;
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ═════ ÖĞRENCİ ADI DEĞİŞİNCE GERÇEK ZAMANLI AKILLI EŞLEŞTİRME ═════ */
export function pdfAdDegisti(idx, val) {
  if (!aktifPdfVerisi || !aktifPdfVerisi.ogrenciler[idx]) return;
  const o = aktifPdfVerisi.ogrenciler[idx];
  o.adSoyad = val.trim();

  // Adında ve soyadında ayrı ayrı %60 benzerlik kuralına göre ara
  const match = enIyiOgrenciEslestir(o.adSoyad, DB.ogrenciler);

  if (match.eslesti) {
    o.eslesenOgrenciId = match.ogrenci.id;
    o.mevcutOgrenci = true;
    o.eslesmeTuru = 'auto';
    o.adSim = match.adSim;
    o.soyadSim = match.soyadSim;
    o.toplamSim = match.toplamSim;
    o.seciliSinifId = match.ogrenci.sinifId;

    const sinifSel = $(`pdf_sinif_${idx}`);
    if (sinifSel) sinifSel.value = match.ogrenci.sinifId;
  } else {
    if (o.eslesmeTuru !== 'manual') {
      o.eslesenOgrenciId = null;
      o.mevcutOgrenci = false;
      o.eslesmeTuru = 'none';
      o.adSim = 0;
      o.soyadSim = 0;
      o.toplamSim = 0;
    }
  }

  // Dropdown ve badge'i güncelle
  const selEl = $(`pdf_ogrenci_${idx}`);
  if (selEl) {
    selEl.innerHTML = `
      <option value="NEW" ${!o.eslesenOgrenciId ? 'selected' : ''}>➕ Yeni Öğrenci Olarak Aç</option>
      <optgroup label="Sistemdeki Kayıtlı Öğrenciler">
        ${siraliOgrenciSecenekleri(o)}
      </optgroup>
    `;
    selEl.value = o.eslesenOgrenciId ? String(o.eslesenOgrenciId) : 'NEW';
    selEl.style.borderColor = o.mevcutOgrenci ? '#10b981' : '#cbd5e1';
    selEl.style.background = o.mevcutOgrenci ? '#f0fdf4' : '#ffffff';
  }

  const durumEl = $(`pdf_durum_${idx}`);
  if (durumEl) {
    durumEl.innerHTML = durumBadgeHtml(o, idx);
  }

  const rowEl = $(`pdf_row_${idx}`);
  if (rowEl) {
    rowEl.style.background = o.mevcutOgrenci ? '#fafdfb' : '';
  }

  pdfOzetSayaclariGuncelle();
}

/* ═════ ÖĞRENCİ AÇILIR KUTUSUNDAN HIZLI MANUEL BAĞLAMA ═════ */
export function pdfOgrenciSecildi(idx, val) {
  if (val === 'NEW') {
    pdfManuelEsleKaldir(idx);
  } else {
    pdfManuelEsleSec(idx, Number(val));
  }
}

/* ═════ MANUEL ÖĞRENCİ EŞLEŞTİRME MODAL YÖNETİMİ ═════ */
export let aktifSeciliSatirIdx = null;

export function pdfManuelEsleModalAc(idx) {
  if (!aktifPdfVerisi || !aktifPdfVerisi.ogrenciler[idx]) return;
  aktifSeciliSatirIdx = idx;
  window.aktifPdfSatirIdx = idx;
  const o = aktifPdfVerisi.ogrenciler[idx];

  // 1. Bilgi Kartını Doldur
  const bilgiEl = $('pdfModalOgrBilgi');
  if (bilgiEl) {
    const curOgr = o.eslesenOgrenciId ? DB.ogrenciler.find(x => x.id === o.eslesenOgrenciId) : null;
    bilgiEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
        <div>
          <span style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px">PDF'ten Okunan Satır (#${o.sira}):</span>
          <div style="font-size:16px;font-weight:700;color:#0f172a;margin-top:2px">
            📄 ${o.adSoyad}
          </div>
          <div style="font-size:12px;color:#475569;margin-top:4px;display:flex;gap:12px;flex-wrap:wrap">
            <span>Öğr No: <b>${o.ogrNo || '—'}</b></span>
            <span>PDF Sınıfı: <b>${o.sinif || '—'}</b></span>
            <span>Toplam Net: <b style="color:var(--indigo)">${o.toplam.net.toFixed(2)}</b></span>
          </div>
        </div>
        <div style="text-align:right">
          <span style="font-size:11px;color:#64748b;display:block">Şu Anki Eşleşme:</span>
          <div style="margin-top:4px">
            ${curOgr ? `
              <span class="badge" style="background:#eff6ff;color:#1e40af;border:1.5px solid #bfdbfe;font-weight:700;padding:4px 8px">
                🔗 ${curOgr.adSoyad} (${sinifAdi(curOgr.sinifId)})
              </span>
            ` : `
              <span class="badge" style="background:#fef3c7;color:#92400e;border:1.5px solid #fde68a;font-weight:600;padding:4px 8px">
                ➕ Yeni Öğrenci Açılacak
              </span>
            `}
          </div>
        </div>
      </div>
    `;
  }

  // 2. Arama kutusunu sıfırla
  const araEl = $('pdfModalOgrAra');
  if (araEl) araEl.value = '';

  // 3. Sınıf Filtresi Seçeneklerini Doldur
  const sinifSel = $('pdfModalSinifFiltre');
  if (sinifSel) {
    let optHtml = `<option value="ALL">Tüm Sınıflar (${DB.ogrenciler.length} Öğrenci)</option>`;
    DB.siniflar.forEach(s => {
      const sayi = DB.ogrenciler.filter(ogr => ogr.sinifId === s.id).length;
      optHtml += `<option value="${s.id}">${s.ad} (${sayi} Öğrenci)</option>`;
    });
    sinifSel.innerHTML = optHtml;

    // Sınıf ön seçimi: Halihazırda bağlı sınıf varsa veya PDF sınıf adına uyan varsa
    if (o.seciliSinifId && DB.siniflar.some(s => s.id === o.seciliSinifId)) {
      sinifSel.value = String(o.seciliSinifId);
    } else {
      const sinifMatch = DB.siniflar.find(s => s.ad.toLowerCase() === (o.sinif || '').toLowerCase());
      if (sinifMatch) sinifSel.value = String(sinifMatch.id);
      else sinifSel.value = 'ALL';
    }
  }

  // 4. Listeyi filtrele ve doldur
  pdfManuelEsleFiltrele();

  // 5. Modalı Aç ve arama kutusuna odaklan
  const modal = $('pdfManuelEslestirModal');
  if (modal) {
    modal.classList.remove('hidden');
    setTimeout(() => {
      if (araEl) araEl.focus();
    }, 50);
  }
}

export function pdfManuelEsleModalKapat() {
  const modal = $('pdfManuelEslestirModal');
  if (modal) modal.classList.add('hidden');
  aktifSeciliSatirIdx = null;
  window.aktifPdfSatirIdx = null;
}

export function pdfManuelEsleKaldirAction() {
  if (aktifSeciliSatirIdx !== null) {
    pdfManuelEsleKaldir(aktifSeciliSatirIdx);
  }
}

export function pdfManuelEsleFiltrele() {
  if (aktifSeciliSatirIdx === null || !aktifPdfVerisi || !aktifPdfVerisi.ogrenciler[aktifSeciliSatirIdx]) return;
  const o = aktifPdfVerisi.ogrenciler[aktifSeciliSatirIdx];

  const q = ($('pdfModalOgrAra')?.value || '').trim();
  const sinifF = $('pdfModalSinifFiltre')?.value || 'ALL';

  const tumAdaylar = (DB.ogrenciler || []).map(ogr => {
    const sim = ogrenciBenzerlikHesapla(o.adSoyad, ogr.adSoyad);
    const digerSatir = aktifPdfVerisi.ogrenciler.find((x, rIdx) => rIdx !== aktifSeciliSatirIdx && x.eslesenOgrenciId === ogr.id);
    return { ogr, sim, digerSatir };
  });

  // 1. Akıllı Öneriler (En benzer ilk 3 kayıt)
  const oneriler = tumAdaylar
    .filter(x => x.sim.toplamSim >= 50 || (x.sim.adSim >= 60 && x.sim.soyadSim >= 40))
    .sort((a, b) => b.sim.toplamSim - a.sim.toplamSim)
    .slice(0, 3);

  const oneriAlani = $('pdfModalOnerilenlerAlani');
  if (oneriAlani) {
    if (oneriler.length > 0) {
      oneriAlani.innerHTML = `
        <div style="background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:10px;padding:10px 14px;margin-bottom:12px">
          <div style="font-size:12px;font-weight:700;color:var(--indigo);margin-bottom:8px;display:flex;align-items:center;gap:6px">
            💡 <span>Akıllı Eşleşme Önerisi</span> <span style="font-weight:400;color:#64748b">(İsim benzerliği en yüksek kayıtlı öğrenciler)</span>:
          </div>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${oneriler.map(item => `
              <div style="display:flex;justify-content:space-between;align-items:center;background:#fff;padding:8px 12px;border-radius:8px;border:1px solid #dbeafe;gap:8px">
                <div>
                  <b style="font-size:13px;color:#0f172a">${item.ogr.adSoyad}</b>
                  <span style="font-size:11.5px;color:#64748b">(${sinifAdi(item.ogr.sinifId)})</span>
                  <span class="badge" style="background:#ecfdf5;color:#047857;font-size:10.5px;margin-left:6px">%${item.sim.toplamSim} Benzerlik</span>
                  ${item.digerSatir ? `<span class="badge" style="background:#fef3c7;color:#92400e;font-size:10px;margin-left:4px">⚠️ Satır #${item.digerSatir.sira}'de de var</span>` : ''}
                </div>
                <button type="button" class="btn sm ${item.ogr.id === o.eslesenOgrenciId ? 'gray' : 'green'}" onclick="window.pdfManuelEsleSec(${aktifSeciliSatirIdx}, ${item.ogr.id})" style="font-size:11.5px;padding:4px 12px;font-weight:700">
                  ${item.ogr.id === o.eslesenOgrenciId ? '✓ Şu an Seçili' : '✅ Bu Öğrenci Olarak İşaretle'}
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      oneriAlani.innerHTML = '';
    }
  }

  // 2. Filtreli Öğrenci Listesi
  let filtrelenenler = tumAdaylar;
  if (sinifF !== 'ALL') {
    const sId = Number(sinifF);
    filtrelenenler = filtrelenenler.filter(x => x.ogr.sinifId === sId);
  }

  if (q) {
    const nq = trNormalize(q);
    filtrelenenler = filtrelenenler.filter(x =>
      trNormalize(x.ogr.adSoyad).includes(nq) ||
      (x.ogr.veli && x.ogr.veli.toLowerCase().includes(q.toLowerCase()))
    );
  }

  // Sıralama: Seçili olan en başta, sonra benzerlik puanına göre, sonra alfabetik
  filtrelenenler.sort((a, b) => {
    if (a.ogr.id === o.eslesenOgrenciId) return -1;
    if (b.ogr.id === o.eslesenOgrenciId) return 1;
    if (b.sim.toplamSim !== a.sim.toplamSim) return b.sim.toplamSim - a.sim.toplamSim;
    return a.ogr.adSoyad.localeCompare(b.ogr.adSoyad, 'tr');
  });

  const listeEl = $('pdfModalOgrListesi');
  if (listeEl) {
    if (filtrelenenler.length === 0) {
      listeEl.innerHTML = `
        <div style="padding:24px;text-align:center;color:#64748b">
          <p style="font-size:24px;margin:0 0 6px 0">🔍</p>
          <div style="font-weight:600">Aramanıza uygun öğrenci bulunamadı</div>
          <p style="font-size:11.5px;margin:4px 0 0 0">Farklı bir sınıf seçebilir veya yeni öğrenci olarak bırakabilirsiniz.</p>
        </div>
      `;
    } else {
      listeEl.innerHTML = filtrelenenler.map(item => {
        const isSelected = item.ogr.id === o.eslesenOgrenciId;
        const simBadge = item.sim.toplamSim >= 40
          ? `<span class="badge" style="background:#f1f5f9;color:#475569;font-size:10px;margin-left:4px">%${item.sim.toplamSim} Benzer</span>`
          : '';
        const digerUyari = item.digerSatir
          ? `<span class="badge" style="background:#fef3c7;color:#92400e;font-size:10px;margin-left:4px">⚠️ Satır #${item.digerSatir.sira}'de de var</span>`
          : '';

        return `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 12px;border-bottom:1px solid #f1f5f9;background:${isSelected ? '#eff6ff' : '#fff'};gap:10px">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:32px;height:32px;border-radius:50%;background:${isSelected ? 'var(--indigo)' : '#e2e8f0'};color:${isSelected ? '#fff' : '#475569'};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px">
                ${item.ogr.adSoyad.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style="font-weight:700;font-size:13px;color:#0f172a">
                  ${item.ogr.adSoyad}
                  ${isSelected ? '<span class="badge" style="background:#10b981;color:#fff;font-size:10px;margin-left:6px">Şu an Seçili</span>' : ''}
                  ${simBadge}
                  ${digerUyari}
                </div>
                <div style="font-size:11px;color:#64748b;margin-top:1px">
                  🏫 Sınıf: <b>${sinifAdi(item.ogr.sinifId)}</b> ${item.ogr.veli ? `• ${item.ogr.veli}` : ''}
                </div>
              </div>
            </div>
            <button type="button" class="btn sm ${isSelected ? 'gray' : 'green'}" onclick="window.pdfManuelEsleSec(${aktifSeciliSatirIdx}, ${item.ogr.id})" style="font-weight:600;font-size:11.5px;padding:5px 12px;white-space:nowrap">
              ${isSelected ? '✓ Seçili' : '✅ Bu Öğrenci Olarak İşaretle'}
            </button>
          </div>
        `;
      }).join('');
    }
  }
}

export function pdfManuelEsleSec(idx, ogrenciId) {
  if (!aktifPdfVerisi || !aktifPdfVerisi.ogrenciler[idx]) return;
  const o = aktifPdfVerisi.ogrenciler[idx];
  const targetOgr = DB.ogrenciler.find(x => x.id === ogrenciId);
  if (!targetOgr) return;

  o.eslesenOgrenciId = targetOgr.id;
  o.mevcutOgrenci = true;
  o.eslesmeTuru = 'manual';
  o.seciliSinifId = targetOgr.sinifId;

  // UI Güncelle
  const durumEl = $(`pdf_durum_${idx}`);
  if (durumEl) durumEl.innerHTML = durumBadgeHtml(o, idx);

  const selEl = $(`pdf_ogrenci_${idx}`);
  if (selEl) {
    selEl.innerHTML = `
      <option value="NEW">➕ Yeni Öğrenci Olarak Aç</option>
      <optgroup label="Sistemdeki Kayıtlı Öğrenciler">
        ${siraliOgrenciSecenekleri(o)}
      </optgroup>
    `;
    selEl.value = String(targetOgr.id);
    selEl.style.borderColor = 'var(--indigo)';
    selEl.style.background = '#eff6ff';
  }

  const sinifSel = $(`pdf_sinif_${idx}`);
  if (sinifSel) sinifSel.value = targetOgr.sinifId;

  const rowEl = $(`pdf_row_${idx}`);
  if (rowEl) rowEl.style.background = '#fafdfb';

  pdfOzetSayaclariGuncelle();
  pdfManuelEsleModalKapat();
  toast(`✅ "${o.adSoyad}" ➔ "${targetOgr.adSoyad}" (${sinifAdi(targetOgr.sinifId)}) olarak işaretlendi!`, true);
}

export function pdfManuelEsleKaldir(idx) {
  if (!aktifPdfVerisi || !aktifPdfVerisi.ogrenciler[idx]) return;
  const o = aktifPdfVerisi.ogrenciler[idx];

  o.eslesenOgrenciId = null;
  o.mevcutOgrenci = false;
  o.eslesmeTuru = 'none';
  o.adSim = 0;
  o.soyadSim = 0;
  o.toplamSim = 0;

  // UI Güncelle
  const durumEl = $(`pdf_durum_${idx}`);
  if (durumEl) durumEl.innerHTML = durumBadgeHtml(o, idx);

  const selEl = $(`pdf_ogrenci_${idx}`);
  if (selEl) {
    selEl.innerHTML = `
      <option value="NEW" selected>➕ Yeni Öğrenci Olarak Aç</option>
      <optgroup label="Sistemdeki Kayıtlı Öğrenciler">
        ${siraliOgrenciSecenekleri(o)}
      </optgroup>
    `;
    selEl.value = 'NEW';
    selEl.style.borderColor = '#cbd5e1';
    selEl.style.background = '#ffffff';
  }

  const rowEl = $(`pdf_row_${idx}`);
  if (rowEl) rowEl.style.background = '';

  pdfOzetSayaclariGuncelle();
  pdfManuelEsleModalKapat();
  toast(`ℹ️ "${o.adSoyad}" yeni öğrenci olarak ayarlandı.`);
}

/* ═════ FİLTRELEME İŞLEMİ (TÜMÜ / EŞLEŞENLER / YENİLER) ═════ */
export function pdfFiltrele(tur) {
  if (!aktifPdfVerisi) return;
  aktifFiltreTur = tur;

  ['all', 'matched', 'new'].forEach(t => {
    const btn = $(`pdfFiltre_${t}`);
    if (btn) {
      btn.className = (t === tur) ? 'btn sm' : 'btn sm gray';
    }
  });

  aktifPdfVerisi.ogrenciler.forEach((o, idx) => {
    const tr = $(`pdf_row_${idx}`);
    if (!tr) return;
    if (tur === 'all') {
      tr.style.display = '';
    } else if (tur === 'matched') {
      tr.style.display = o.mevcutOgrenci ? '' : 'none';
    } else if (tur === 'new') {
      tr.style.display = !o.mevcutOgrenci ? '' : 'none';
    }
  });
}

/* ═════ SAYAC GÜNCELLEMELERİ ═════ */
export function pdfOzetSayaclariGuncelle() {
  if (!aktifPdfVerisi) return;
  const total = aktifPdfVerisi.ogrenciler.length;
  const matched = aktifPdfVerisi.ogrenciler.filter(o => o.mevcutOgrenci).length;
  const newCount = total - matched;
  const selected = aktifPdfVerisi.ogrenciler.filter(o => o.dahilEt).length;

  const elTot = $('pdfSayacToplam');
  if (elTot) elTot.textContent = total;
  const elMat = $('pdfSayacEslesen');
  if (elMat) elMat.textContent = matched;
  const elNew = $('pdfSayacYeni');
  if (elNew) elNew.textContent = newCount;
  const elSec = $('pdfSeciliSayac');
  if (elSec) elSec.textContent = selected;

  const btnAll = $('pdfFiltre_all');
  if (btnAll) btnAll.textContent = `Tümü (${total})`;
  const btnMat = $('pdfFiltre_matched');
  if (btnMat) btnMat.textContent = `🎯 Eşleşenler (${matched})`;
  const btnNew = $('pdfFiltre_new');
  if (btnNew) btnNew.textContent = `➕ Yeni / Eşleşmeyenler (${newCount})`;
}

export function pdfSecTumuDegistir(secili) {
  if (!aktifPdfVerisi) return;
  aktifPdfVerisi.ogrenciler.forEach((o, idx) => {
    o.dahilEt = secili;
    const chk = $(`pdf_chk_${idx}`);
    if (chk) chk.checked = secili;
  });
  pdfOzetSayaclariGuncelle();
}

export function pdfRowToggle(idx) {
  if (!aktifPdfVerisi || !aktifPdfVerisi.ogrenciler[idx]) return;
  const chk = $(`pdf_chk_${idx}`);
  if (chk) {
    aktifPdfVerisi.ogrenciler[idx].dahilEt = chk.checked;
  }
  pdfOzetSayaclariGuncelle();
}

export function pdfTopluSinifUygula() {
  const sel = $('pdfTopluSinifSecim');
  if (!sel || !aktifPdfVerisi) return;
  const val = sel.value;

  aktifPdfVerisi.ogrenciler.forEach((o, idx) => {
    const rowSel = $(`pdf_sinif_${idx}`);
    if (rowSel) {
      rowSel.value = val;
    }
  });

  toast('Seçilen sınıf tüm listeye uygulandı');
}

export function pdfTemizle() {
  aktifPdfVerisi = null;
  const panel = $('pdfOnayAlani');
  if (panel) {
    panel.innerHTML = '';
    panel.classList.add('hidden');
  }
  const fInput = $('pdfFileInput');
  if (fInput) fInput.value = '';
  const durum = $('pdfDurum');
  if (durum) {
    durum.innerHTML = '';
    durum.classList.add('hidden');
  }
  const badge = $('pdfDosyaAdiBadge');
  if (badge) badge.classList.add('hidden');
}

/* ═════ ONAY VE KAYIT MOTORU (AKILLI ÖĞRENCİ TASNİFİ & EŞLEŞTİRME) ═════ */
export function pdfOnaylaVeKaydet() {
  if (!aktifPdfVerisi || !aktifPdfVerisi.ogrenciler.length) {
    toast('Aktarılacak veri bulunamadı', false);
    return;
  }

  const sinavTuru = $('pdfSinavTuru') ? $('pdfSinavTuru').value : aktifPdfVerisi.sinavTuru;
  const sinavAdi = ($('pdfSinavAdi') && $('pdfSinavAdi').value.trim()) || aktifPdfVerisi.sinavAdi || `${sinavTuru} Deneme`;
  const sinavTarihi = ($('pdfSinavTarihi') && $('pdfSinavTarihi').value) || aktifPdfVerisi.sinavTarihi || new Date().toISOString().split('T')[0];

  // Aktarılacak seçili öğrencileri topla ve UI'daki düzenlemeleri al
  const aktarilacaklar = [];

  aktifPdfVerisi.ogrenciler.forEach((orig, idx) => {
    const chk = $(`pdf_chk_${idx}`);
    if (chk && !chk.checked) return;

    const adInput = $(`pdf_ad_${idx}`);
    const noInput = $(`pdf_no_${idx}`);
    const sinifSel = $(`pdf_sinif_${idx}`);
    const ogrenciSel = $(`pdf_ogrenci_${idx}`);

    const guncelAd = adInput ? adInput.value.trim() : orig.adSoyad;
    const guncelNo = noInput ? noInput.value.trim() : orig.ogrNo;
    const guncelSinifVal = sinifSel ? sinifSel.value : (orig.seciliSinifId || `NEW_${orig.sinif}`);
    const guncelOgrenciVal = ogrenciSel ? ogrenciSel.value : (orig.eslesenOgrenciId ? String(orig.eslesenOgrenciId) : 'NEW');

    if (guncelAd) {
      aktarilacaklar.push({
        ...orig,
        adSoyad: guncelAd,
        ogrNo: guncelNo,
        sinifSecim: guncelSinifVal,
        secilenOgrenciId: (guncelOgrenciVal && guncelOgrenciVal !== 'NEW') ? Number(guncelOgrenciVal) : null
      });
    }
  });

  if (!aktarilacaklar.length) {
    toast('Aktarmak için en az bir öğrenci seçmelisiniz', false);
    return;
  }

  // 1. Sınıfları hazırla / oluştur
  const sinifMap = new Map();
  aktarilacaklar.forEach(item => {
    const v = item.sinifSecim;
    if (sinifMap.has(v)) return;

    if (String(v).startsWith('NEW_')) {
      const yeniSinifAdi = v.replace('NEW_', '').trim() || 'Yeni Sınıf';
      let mevcut = DB.siniflar.find(s => s.ad.toLowerCase() === yeniSinifAdi.toLowerCase());
      if (!mevcut) {
        mevcut = { id: nid(), ad: yeniSinifAdi };
        DB.siniflar.push(mevcut);
      }
      sinifMap.set(v, mevcut.id);
    } else {
      const sid = parseInt(v, 10);
      sinifMap.set(v, sid);
    }
  });

  // 2. Öğrencileri hazırla / bağla / oluştur
  let yeniOgrSayisi = 0;
  let baglananOgrSayisi = 0;

  aktarilacaklar.forEach(item => {
    const sid = sinifMap.get(item.sinifSecim) || (DB.siniflar[0] ? DB.siniflar[0].id : 1);

    let ogr = null;

    // A) Kullanıcı veya benzerlik motoru mevcut bir öğrenciye bağlamışsa:
    if (item.secilenOgrenciId) {
      ogr = DB.ogrenciler.find(o => o.id === item.secilenOgrenciId);
      if (ogr) {
        baglananOgrSayisi++;
        if (sid && sid !== ogr.sinifId) {
          ogr.sinifId = sid;
        }
      }
    }

    // B) Eğer eşleşme seçilmediyse veya öğrenci bulunamadıysa:
    if (!ogr) {
      // Birebir aynı isimde öğrenci var mı?
      const tamAyni = DB.ogrenciler.find(o => trNormalize(o.adSoyad) === trNormalize(item.adSoyad));
      if (tamAyni) {
        ogr = tamAyni;
        baglananOgrSayisi++;
        if (sid && sid !== ogr.sinifId) {
          ogr.sinifId = sid;
        }
      } else {
        // Yeni öğrenci oluştur
        ogr = {
          id: nid(),
          adSoyad: item.adSoyad,
          sinifId: sid,
          alan: '',
          veli: item.ogrNo ? `Öğr No: ${item.ogrNo}` : ''
        };
        DB.ogrenciler.push(ogr);
        yeniOgrSayisi++;
      }
    }

    item.kaydedilenOgrenciId = ogr.id;
  });

  // 3. Denemeyi bul veya oluştur
  const { deneme, yeni: yeniDeneme } = denemeBulVeyaOlustur(sinavAdi, sinavTuru, sinavTarihi);

  // 4. Sonuçları evrensel olarak kaydet
  let kaydedilenDersSayisi = 0;
  let mukerrerSayisi = 0;

  aktarilacaklar.forEach(item => {
    const oid = item.kaydedilenOgrenciId;

    if (DB.sonuclar.some(s => s.denemeId === deneme.id && s.ogrenciId === oid)) {
      mukerrerSayisi++;
      return;
    }

    (item.dersSonuclari || []).forEach(ds => {
      if (ds.dogru > 0 || ds.yanlis > 0 || ds.net !== 0) {
        DB.sonuclar.push({
          id: nid(),
          denemeId: deneme.id,
          ogrenciId: oid,
          ders: ds.ders,
          dogru: ds.dogru,
          yanlis: ds.yanlis,
          bos: ds.bos || 0,
          net: ds.net
        });
        kaydedilenDersSayisi++;
      }
    });
  });

  saveDB();
  notifySelects();

  let msg = `✅ ${aktarilacaklar.length - mukerrerSayisi} öğrenci ve ${kaydedilenDersSayisi} ders sonucu sisteme aktarıldı!`;
  if (baglananOgrSayisi > 0) msg += ` (${baglananOgrSayisi} mevcut öğrenciye dahil edildi)`;
  if (yeniOgrSayisi > 0) msg += ` (${yeniOgrSayisi} yeni öğrenci açıldı)`;
  if (mukerrerSayisi > 0) msg += ` • ${mukerrerSayisi} mükerrer atlandı`;

  toast(msg, true);

  pdfTemizle();
  dersListesiniOlustur();
  renderDenemeler();
}
