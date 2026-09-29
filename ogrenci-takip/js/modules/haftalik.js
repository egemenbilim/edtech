/* ══════════════════════════════════════════════════════
   Öğrenci Takip Sistemi — Haftalık Soru/Ödev Takibi Modülü
   Öğrenci odaklı, kademeli (YKS / AYT / LGS) müfredat entegreli,
   ders ve konu seçimli (her derste "📌 Genel"),
   özel detaylı rapor ve veli bildirim özellikli takip sistemi.
   ══════════════════════════════════════════════════════ */

import { DB, saveDB, nid, netHesapla, sinifAdi } from '../state.js';
import { $, toast, fmtTarih, ogrenciAdi, pastaGrafik, promptKopyala } from '../utils.js';
import {
  SINAV_TURLERI,
  ogrenciKademeBelirle,
  getMufredatDersleri,
  getMufredatKonulari
} from './curriculum.js';

// Modül içi aktif durum
export let seciliHfOgrenciId = null;
export let aktifTur = 'odev_soru'; // 'odev_soru' | 'soru' | 'odev'
export let seciliSinavTuru = 'TYT';
export let seciliDers = 'Türkçe';
export let seciliKonu = '📌 Genel';
export let filtreTur = 'hepsi';
export let filtreDurum = 'hepsi'; // 'hepsi' | 'Verildi' | 'Tamamlandı' | 'Kısmi' | 'Yapılmadı'
export let seciliYildiz = 0;
export let seciliKntYildiz = 0;

export const YILDIZ_METINLERI = [
  'Henüz Derecelendirilmedi',
  '⭐ 1 - Öğrenilmedi',
  '⭐⭐ 2 - Zayıf',
  '⭐⭐⭐ 3 - Orta (Pekiştirilmeli)',
  '⭐⭐⭐⭐ 4 - İyi (Kavrandı)',
  '⭐⭐⭐⭐⭐ 5 - Çok İyi Öğrenildi'
];

/* ═════ ÖĞRENCİ SEÇİMİ VE KADEME UYARLAMASI ═════ */

/**
 * Kullanıcı öğrenci seçtiğinde tetiklenir ("1. Önce öğrenci seçilsin")
 */
export function hfOgrenciSecildi(oid) {
  const parsedId = Number(oid || ($('hfOgrenci') && $('hfOgrenci').value)) || 0;
  seciliHfOgrenciId = parsedId;

  // Filtre selectini de senkronize et
  if ($('filtreHfOgrenci') && $('filtreHfOgrenci').value != parsedId) {
    $('filtreHfOgrenci').value = parsedId || '';
  }
  if ($('hfOgrenci') && $('hfOgrenci').value != parsedId) {
    $('hfOgrenci').value = parsedId || '';
  }

  // Öğrenci Kademe / Sınıf Analizi
  const kademeBilgi = ogrenciKademeBelirle(seciliHfOgrenciId);
  const izinliSinavlar = kademeBilgi.sinavGruplari || ['TYT'];

  // Eğer mevcut seçili sınav grubu bu öğrenciye uygun değilse (örn. 12. sınıfta LGS kalmışsa)
  if (!izinliSinavlar.includes(seciliSinavTuru)) {
    seciliSinavTuru = kademeBilgi.varsayilanSinav || izinliSinavlar[0];
  }

  // Arayüzü güncelle
  renderOgrenciProfilKarti(kademeBilgi);
  renderSinavTuruSecici(izinliSinavlar);
  hfDersListesiGuncelle();
  renderHaftalik();
}

/**
 * Seçili öğrencinin özet profil kartını çizer
 */
function renderOgrenciProfilKarti(kademeBilgi) {
  const container = $('hfOgrenciProfilKarti');
  if (!container) return;

  if (!seciliHfOgrenciId) {
    container.innerHTML = `
      <div class="empty-student-prompt" style="padding:16px;text-align:center;background:#f8fafc;border:2px dashed #cbd5e1;border-radius:12px;color:#64748b">
        <span style="font-size:26px;display:block;margin-bottom:6px">👩‍🎓</span>
        <b style="color:#334155;font-size:14px">Lütfen Takip Yapmak İstediğiniz Öğrenciyi Seçin</b>
        <p style="font-size:12px;margin:4px 0 0">Ödev veya soru girişi yapabilmek için yukarıdaki listeden öğrenci seçiniz.</p>
      </div>
    `;
    const formKart = $('hfGirisKarti');
    if (formKart) formKart.style.opacity = '0.5';
    return;
  }

  const formKart = $('hfGirisKarti');
  if (formKart) formKart.style.opacity = '1';

  const ogr = DB.ogrenciler.find(o => o.id === seciliHfOgrenciId);
  if (!ogr) return;

  // İstatistikler
  const kayitlar = DB.haftalik.filter(h => h.ogrenciId === seciliHfOgrenciId);
  const toplamSoru = kayitlar.reduce((a, b) => a + (b.soruSayisi || 0), 0);
  const toplamNet = kayitlar.reduce((a, b) => a + (b.net || 0), 0);
  const bekleyenOdev = kayitlar.filter(h => h.durum === 'Verildi').length;
  const tamamlananOdev = kayitlar.filter(h => h.durum === 'Tamamlandı').length;
  const toplamOdev = kayitlar.length;

  const puanliKayitlar = kayitlar.filter(h => h.ogrenmeDerecesi && h.ogrenmeDerecesi > 0);
  const ortalamaPuan = puanliKayitlar.length
    ? (puanliKayitlar.reduce((a, b) => a + b.ogrenmeDerecesi, 0) / puanliKayitlar.length).toFixed(1)
    : '—';

  const sinifAd = sinifAdi(ogr.sinifId);
  const kademeRozet = kademeBilgi.kademe.includes('lgs') || kademeBilgi.kademe.includes('orta')
    ? '<span class="pillbad red">🎯 LGS Grubu</span>'
    : '<span class="pillbad" style="background:#e0e7ff;color:#3730a3">🎓 YKS Grubu</span>';

  container.innerHTML = `
    <div class="card" style="background:linear-gradient(135deg,#ffffff 0%,#f8fafc 100%);border:1.5px solid #e2e8f0;border-radius:12px;padding:14px 16px;box-shadow:0 2px 4px rgba(0,0,0,.02)">
      <div class="flex" style="justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:44px;height:44px;border-radius:50%;background:#e0e7ff;color:#4338ca;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">
            ${ogr.adSoyad.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <h3 style="margin:0;font-size:16px;color:#0f172a;font-weight:700">${ogr.adSoyad}</h3>
              <span class="pillbad gray" style="font-weight:600">${sinifAd}</span>
              ${kademeRozet}
            </div>
            <div style="font-size:11.5px;color:#64748b;margin-top:2px">
              ${ogr.veli ? `📞 Veli: ${ogr.veli}` : 'Kayıtlı Veli Bilgisi Yok'}
            </div>
          </div>
        </div>

        <!-- Hızlı İstatistik Rozetleri -->
        <div class="flex" style="gap:8px;flex-wrap:wrap;align-items:center">
          <div style="background:#f1f5f9;padding:6px 12px;border-radius:8px;text-align:center">
            <span style="font-size:10.5px;color:#64748b;display:block">Toplam Soru</span>
            <b style="font-size:14px;color:#0f172a">${toplamSoru.toLocaleString()}</b>
          </div>
          <div style="background:#fef9c3;padding:6px 12px;border-radius:8px;text-align:center;border:1px solid #fef08a">
            <span style="font-size:10.5px;color:#854d0e;display:block">Kontrol Bekleyen</span>
            <b style="font-size:14px;color:#a16207">${bekleyenOdev} Ödev</b>
          </div>
          <div style="background:#f0fdf4;padding:6px 12px;border-radius:8px;text-align:center;border:1px solid #bbf7d0">
            <span style="font-size:10.5px;color:#166534;display:block">Ödev Başarısı</span>
            <b style="font-size:14px;color:#15803d">${tamamlananOdev}/${toplamOdev}</b>
          </div>
          <div style="background:#eff6ff;padding:6px 12px;border-radius:8px;text-align:center;border:1px solid #bfdbfe">
            <span style="font-size:10.5px;color:#1d4ed8;display:block">Toplam Net</span>
            <b style="font-size:14px;color:#1e40af" class="mono">${toplamNet.toFixed(1)}</b>
          </div>
          <div style="background:#fffbeb;padding:6px 12px;border-radius:8px;text-align:center;border:1px solid #fde68a">
            <span style="font-size:10.5px;color:#b45309;display:block">Öğrenme Puanı</span>
            <b style="font-size:14px;color:#d97706">${ortalamaPuan !== '—' ? `⭐ ${ortalamaPuan}/5` : '—'}</b>
          </div>

          <!-- ÖZEL RAPOR OLUŞTURMA BUTONU -->
          <button class="btn" onclick="window.hfOzelRaporAc(${ogr.id})" style="background:linear-gradient(135deg,#4f46e5,#3b82f6);color:#fff;border:none;box-shadow:0 2px 6px rgba(79,70,229,.3);white-space:nowrap;padding:9px 15px;font-weight:600">
            📑 Bu Öğrenciye Özel Rapor
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * İzin verilen sınav türü çiplerini / butonlarını çizer
 * (Örn: 12. sınıfta LGS seçenekleri asla gösterilmez!)
 */
function renderSinavTuruSecici(izinliSinavlar) {
  const container = $('hfSinavTuruSecici');
  if (!container) return;

  const sinavlar = SINAV_TURLERI.filter(s => izinliSinavlar.includes(s.id));

  container.innerHTML = sinavlar.map(s => {
    const seciliMi = s.id === seciliSinavTuru;
    return `
      <button type="button" 
        class="chip-btn ${seciliMi ? 'active' : ''}" 
        onclick="window.hfSinavTuruSecildi('${s.id}')"
        style="${seciliMi ? `background:${s.renk};color:#fff;border-color:${s.renk}` : ''}">
        ${s.ad}
      </button>
    `;
  }).join('');
}

export function hfSinavTuruSecildi(sinavId) {
  seciliSinavTuru = sinavId;
  const kademeBilgi = ogrenciKademeBelirle(seciliHfOgrenciId);
  renderSinavTuruSecici(kademeBilgi.sinavGruplari || ['TYT']);
  hfDersListesiGuncelle();
}

/**
 * Sınav grubuna ait dersleri doldurur
 */
export function hfDersListesiGuncelle() {
  const dersler = getMufredatDersleri(seciliSinavTuru);
  if (!dersler.includes(seciliDers)) {
    seciliDers = dersler[0] || 'Türkçe';
  }

  // Ders Çiplerini veya Selectini çiz
  const container = $('hfDersChips');
  if (container) {
    container.innerHTML = dersler.map(d => {
      const active = d === seciliDers;
      return `
        <button type="button" class="chip-sm ${active ? 'active' : ''}" onclick="window.hfDersSecildi('${d}')">
          ${d}
        </button>
      `;
    }).join('');
  }

  const sel = $('hfDersSelect');
  if (sel) {
    sel.innerHTML = dersler.map(d => `<option value="${d}" ${d === seciliDers ? 'selected' : ''}>${d}</option>`).join('');
  }

  hfKonuListesiGuncelle();
}

export function hfDersSecildi(dersAd) {
  seciliDers = dersAd;
  const dersler = getMufredatDersleri(seciliSinavTuru);
  const container = $('hfDersChips');
  if (container) {
    container.innerHTML = dersler.map(d => `
      <button type="button" class="chip-sm ${d === seciliDers ? 'active' : ''}" onclick="window.hfDersSecildi('${d}')">
        ${d}
      </button>
    `).join('');
  }
  const sel = $('hfDersSelect');
  if (sel) sel.value = dersAd;

  hfKonuListesiGuncelle();
}

/**
 * Seçili derse ait konuları doldurur (Her dersin 1. konusu GARANTİ "📌 Genel"dir)
 */
export function hfKonuListesiGuncelle() {
  const konular = getMufredatKonulari(seciliSinavTuru, seciliDers);
  if (!konular.includes(seciliKonu)) {
    seciliKonu = '📌 Genel';
  }

  const sel = $('hfKonuSelect');
  if (sel) {
    sel.innerHTML = konular.map(k => {
      const isGenel = k === '📌 Genel';
      return `<option value="${k}" ${k === seciliKonu ? 'selected' : ''} style="${isGenel ? 'font-weight:700;color:var(--indigo)' : ''}">${k}</option>`;
    }).join('');
  }

  // Hızlı Seçim İçin Konu Çipleri (İlk 6 konu + Genel)
  const chipsEl = $('hfHizliKonular');
  if (chipsEl) {
    const onemliKonular = konular.slice(0, 6);
    chipsEl.innerHTML = onemliKonular.map(k => `
      <span class="chip-xs ${k === seciliKonu ? 'active' : ''}" onclick="window.hfKonuSecildi('${k}')" style="cursor:pointer">
        ${k}
      </span>
    `).join('');
  }
}

export function hfKonuSecildi(konuAd) {
  seciliKonu = konuAd;
  const sel = $('hfKonuSelect');
  if (sel) sel.value = konuAd;

  const chipsEl = $('hfHizliKonular');
  if (chipsEl) {
    const konular = getMufredatKonulari(seciliSinavTuru, seciliDers).slice(0, 6);
    chipsEl.innerHTML = konular.map(k => `
      <span class="chip-xs ${k === seciliKonu ? 'active' : ''}" onclick="window.hfKonuSecildi('${k}')" style="cursor:pointer">
        ${k}
      </span>
    `).join('');
  }
}

/* ═════ GİRİŞ TÜRÜ VE YILDIZ SEÇİMLERİ ═════ */

export function hfTurDegis(yeniTur) {
  aktifTur = yeniTur || 'odev_soru';
}

export function hfYildizSec(val) {
  seciliYildiz = Number(val) || 0;
  const stars = document.querySelectorAll('#hfYildizSecici .hf-star');
  stars.forEach(s => {
    const v = Number(s.dataset.val);
    s.classList.toggle('active', v <= seciliYildiz);
  });
  const etiket = $('hfYildizEtiket');
  if (etiket) etiket.textContent = YILDIZ_METINLERI[seciliYildiz] || 'Henüz Derecelendirilmedi';
}

export function hfKntYildizSec(val) {
  seciliKntYildiz = Number(val) || 0;
  const stars = document.querySelectorAll('#hfKntYildizSecici .hf-knt-star');
  stars.forEach(s => {
    const v = Number(s.dataset.val);
    s.classList.toggle('active', v <= seciliKntYildiz);
  });
  const etiket = $('hfKntYildizEtiket');
  if (etiket) etiket.textContent = YILDIZ_METINLERI[seciliKntYildiz] || 'Henüz Derecelendirilmedi';
}

export function hfHizliYildizAyarla(id, val) {
  const k = DB.haftalik.find(h => h.id === id);
  if (!k) return;
  k.ogrenmeDerecesi = Number(val) || 0;
  saveDB();
  const kademeBilgi = ogrenciKademeBelirle(seciliHfOgrenciId);
  renderOgrenciProfilKarti(kademeBilgi);
  renderHaftalik();
  toast(`⭐ Öğrenme Derecesi: ${k.ogrenmeDerecesi > 0 ? k.ogrenmeDerecesi + '/5' : 'Sıfırlandı'}`);
}

/* ═════ TARİH & DURUM FİLTRELERİ ═════ */

export function hfFiltreSon1Hafta() {
  const bugun = new Date();
  const birHaftaOnce = new Date();
  birHaftaOnce.setDate(birHaftaOnce.getDate() - 7);

  const bitStr = bugun.toISOString().split('T')[0];
  const basStr = birHaftaOnce.toISOString().split('T')[0];

  if ($('hfFiltreBas')) $('hfFiltreBas').value = basStr;
  if ($('hfFiltreBit')) $('hfFiltreBit').value = bitStr;
  renderHaftalik();
  toast('📅 Son 1 haftalık veriler listelendi');
}

export function hfFiltreTarihTemizle() {
  if ($('hfFiltreBas')) $('hfFiltreBas').value = '';
  if ($('hfFiltreBit')) $('hfFiltreBit').value = '';
  renderHaftalik();
}

export function hfFiltreDurumSec(durum) {
  filtreDurum = durum;
  document.querySelectorAll('#hfFiltreDurumGrup button').forEach(b => {
    b.classList.toggle('active', b.dataset.durum === durum);
  });
  renderHaftalik();
}

export function hfFiltreTurSec(tur) {
  // Geriye dönük uyumluluk
  filtreDurum = tur;
  renderHaftalik();
}

/* ═════ KONTROL & DÜZENLEME MODALI ═════ */

export function hfKontrolModalAc(id) {
  const k = DB.haftalik.find(h => h.id === id);
  if (!k) return;

  const modal = $('hfKontrolModal');
  if (!modal) return;

  const ogrAd = ogrenciAdi(k.ogrenciId);
  if ($('hfKntOgrenciBilgi')) $('hfKntOgrenciBilgi').textContent = `Öğrenci: ${ogrAd}`;
  if ($('hfKntKayitId')) $('hfKntKayitId').value = k.id;
  if ($('hfKntDersKonu')) $('hfKntDersKonu').textContent = `${k.ders} • ${k.konu || '📌 Genel'}`;
  
  const trhStr = `${fmtTarih(k.haftaBas)}${k.haftaBit && k.haftaBit !== k.haftaBas ? ' – ' + fmtTarih(k.haftaBit) : ''}${k.hedef ? ' • Hedef: ' + k.hedef + ' Soru' : ''}`;
  if ($('hfKntTarihBilgi')) $('hfKntTarihBilgi').textContent = `Tarih: ${trhStr}`;

  if ($('hfKntDurum')) $('hfKntDurum').value = k.durum || 'Tamamlandı';
  if ($('hfKntBaslik')) $('hfKntBaslik').value = k.baslik || k.notlar || '';
  if ($('hfKntSoru')) $('hfKntSoru').value = k.soruSayisi || 0;
  if ($('hfKntDogru')) $('hfKntDogru').value = k.dogru || 0;
  if ($('hfKntYanlis')) $('hfKntYanlis').value = k.yanlis || 0;
  if ($('hfKntNet')) $('hfKntNet').textContent = (typeof k.net === 'number' ? k.net : 0).toFixed(2);

  hfKntYildizSec(k.ogrenmeDerecesi || 0);

  modal.classList.remove('hidden');
}

export function hfKontrolModalKapat() {
  const modal = $('hfKontrolModal');
  if (modal) modal.classList.add('hidden');
}

export function hfKntNetHesapla() {
  const d = Number($('hfKntDogru') ? $('hfKntDogru').value : 0) || 0;
  const y = Number($('hfKntYanlis') ? $('hfKntYanlis').value : 0) || 0;
  const s = Number($('hfKntSoru') ? $('hfKntSoru').value : 0) || 0;
  const net = netHesapla('TYT', d, y);
  if ($('hfKntNet')) $('hfKntNet').textContent = net.toFixed(2);
}

export function hfKontrolKaydet() {
  const id = Number($('hfKntKayitId')?.value) || 0;
  const k = DB.haftalik.find(h => h.id === id);
  if (!k) return;

  const durum = $('hfKntDurum')?.value || 'Tamamlandı';
  const baslik = $('hfKntBaslik')?.value.trim() || '';
  const soruSayisi = Number($('hfKntSoru')?.value) || 0;
  const dogru = Number($('hfKntDogru')?.value) || 0;
  const yanlis = Number($('hfKntYanlis')?.value) || 0;
  const bos = Math.max(0, soruSayisi - (dogru + yanlis));
  const netVal = netHesapla(k.sinavTuru === 'LGS' ? 'LGS' : 'TYT', dogru, yanlis);

  k.durum = durum;
  k.baslik = baslik;
  k.notlar = baslik;
  k.soruSayisi = soruSayisi;
  k.dogru = dogru;
  k.yanlis = yanlis;
  k.bos = bos;
  k.net = netVal;
  k.ogrenmeDerecesi = seciliKntYildiz || 0;

  saveDB();
  hfKontrolModalKapat();

  const kademeBilgi = ogrenciKademeBelirle(seciliHfOgrenciId);
  renderOgrenciProfilKarti(kademeBilgi);
  renderHaftalik();
  toast('✅ Ödev kontrol kaydı güncellendi');
}

/* ═════ HESAPLAMA VE YARDIMCILAR ═════ */

export function hfBitisOtomatik() {
  const b = $('hfBas').value;
  if (!b) return;
  const d = new Date(b);
  d.setDate(d.getDate() + 6);
  $('hfBit').value = d.toISOString().split('T')[0];
}

export function hfNetHesaplaLive() {
  const d = Number($('hfDogru').value) || 0;
  const y = Number($('hfYanlis').value) || 0;
  const s = Number($('hfSoru').value) || 0;

  // Boş otomatik güncelle
  if (s > 0 && (d + y) <= s) {
    $('hfBos').value = Math.max(0, s - (d + y));
  }

  const net = netHesapla(seciliSinavTuru === 'LGS' ? 'LGS' : 'TYT', d, y);
  const netEl = $('hfNet');
  if (netEl) netEl.textContent = net.toFixed(2);
}

export function hfDersOnerileriGuncelle() {
  hfDersListesiGuncelle();
}

/* ═════ KAYIT EKLEME & YÖNETİMİ ═════ */

export function hfKaydet() {
  if (!seciliHfOgrenciId) {
    toast('Lütfen önce bir öğrenci seçin!', false);
    if ($('hfOgrenci')) $('hfOgrenci').focus();
    return;
  }

  const basTarih = $('hfBas').value;
  if (!basTarih) {
    toast('Hafta başlangıç / veriliş tarihi zorunludur', false);
    return;
  }

  const bitTarih = $('hfBit').value || basTarih;
  const soruSayisi = Number($('hfSoru').value) || 0;
  const dogru = Number($('hfDogru').value) || 0;
  const yanlis = Number($('hfYanlis').value) || 0;
  const bos = Number($('hfBos').value) || Math.max(0, soruSayisi - (dogru + yanlis));
  const netVal = netHesapla(seciliSinavTuru === 'LGS' ? 'LGS' : 'TYT', dogru, yanlis);

  const hedef = Number($('hfHedef') ? $('hfHedef').value : 0) || 0;
  const durum = $('hfOdevDurum') ? $('hfOdevDurum').value : 'Verildi';
  const baslik = $('hfBaslik') ? $('hfBaslik').value.trim() : '';

  const yeniKayit = {
    id: nid(),
    ogrenciId: seciliHfOgrenciId,
    tur: 'odev_soru',
    sinavTuru: seciliSinavTuru,
    ders: seciliDers,
    konu: seciliKonu || '📌 Genel',
    baslik: baslik,
    haftaBas: basTarih,
    haftaBit: bitTarih,
    hedef: hedef,
    soruSayisi: soruSayisi,
    dogru: dogru,
    yanlis: yanlis,
    bos: bos,
    net: netVal,
    durum: durum,
    ogrenmeDerecesi: seciliYildiz || 0,
    notlar: baslik
  };

  DB.haftalik.push(yeniKayit);
  saveDB();

  toast(durum === 'Verildi' ? '⏳ Ödev verildi olarak kaydedildi' : '✅ Ödev / Soru kaydı eklendi');

  // Form alanlarını sıfırla
  ['hfSoru', 'hfDogru', 'hfYanlis', 'hfBos', 'hfHedef'].forEach(i => {
    if ($(i)) $(i).value = 0;
  });
  if ($('hfBaslik')) $('hfBaslik').value = '';
  if ($('hfNet')) $('hfNet').textContent = '0.00';
  hfYildizSec(0);

  // Profili ve tabloyu yenile
  const kademeBilgi = ogrenciKademeBelirle(seciliHfOgrenciId);
  renderOgrenciProfilKarti(kademeBilgi);
  renderHaftalik();
}

export function hfSil(id) {
  if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
  DB.haftalik = DB.haftalik.filter(h => h.id !== id);
  saveDB();
  const kademeBilgi = ogrenciKademeBelirle(seciliHfOgrenciId);
  renderOgrenciProfilKarti(kademeBilgi);
  renderHaftalik();
  toast('Kayıt silindi');
}

export function hfOdevDurumHizliDegis(id) {
  const k = DB.haftalik.find(h => h.id === id);
  if (!k) return;
  const silsile = ['Verildi', 'Tamamlandı', 'Kısmi', 'Yapılmadı'];
  const curIdx = silsile.indexOf(k.durum || 'Verildi');
  k.durum = silsile[(curIdx + 1) % silsile.length];
  saveDB();
  const kademeBilgi = ogrenciKademeBelirle(seciliHfOgrenciId);
  renderOgrenciProfilKarti(kademeBilgi);
  renderHaftalik();
  
  const mapLabel = {
    'Verildi': '⏳ Kontrol Bekliyor',
    'Tamamlandı': '✅ Tam Yapıldı',
    'Kısmi': '⚠️ Eksik Yapıldı',
    'Yapılmadı': '❌ Yapılmadı'
  };
  toast(`Durum: ${mapLabel[k.durum] || k.durum}`);
}

/* ═════ TABLO VE KAYIT LİSTELEME ═════ */

function renderYildizHtml(id, derece) {
  const d = Number(derece) || 0;
  let html = `<div class="star-clickable-row" title="Öğrenme Derecesi: ${d > 0 ? d + '/5' : 'Derecelendirilmedi'} (Değiştirmek için tıklayın)">`;
  for (let s = 1; s <= 5; s++) {
    const dolu = s <= d;
    html += `<span onclick="event.stopPropagation();window.hfHizliYildizAyarla(${id},${s === d ? 0 : s})" style="color:${dolu ? '#f59e0b' : '#cbd5e1'};font-size:16px;line-height:1">★</span>`;
  }
  html += `</div>`;
  return html;
}

function renderDurumBadge(id, durum) {
  const dur = durum || 'Verildi';
  if (dur === 'Verildi') {
    return `<button class="pillbad yellow" onclick="window.hfOdevDurumHizliDegis(${id})" title="Durumu değiştirmek için tıklayın" style="cursor:pointer;border:none">⏳ Kontrol Bekliyor</button>`;
  } else if (dur === 'Tamamlandı') {
    return `<button class="pillbad green" onclick="window.hfOdevDurumHizliDegis(${id})" title="Durumu değiştirmek için tıklayın" style="cursor:pointer;border:none">✅ Tam Yapıldı</button>`;
  } else if (dur === 'Kısmi') {
    return `<button class="pillbad orange" onclick="window.hfOdevDurumHizliDegis(${id})" title="Durumu değiştirmek için tıklayın" style="cursor:pointer;border:none">⚠️ Eksik Yapıldı</button>`;
  } else {
    return `<button class="pillbad red" onclick="window.hfOdevDurumHizliDegis(${id})" title="Durumu değiştirmek için tıklayın" style="cursor:pointer;border:none">❌ Yapılmadı</button>`;
  }
}

export function renderHaftalik() {
  const container = $('haftalikTablosu');
  if (!container) return;

  const fOgr = seciliHfOgrenciId || Number($('filtreHfOgrenci') && $('filtreHfOgrenci').value) || 0;
  let list = DB.haftalik;

  if (fOgr) {
    list = list.filter(h => h.ogrenciId === fOgr);
  }

  // Durum Filtresi (Hepsi / Verildi / Tamamlandı / Kısmi / Yapılmadı)
  if (filtreDurum && filtreDurum !== 'hepsi') {
    list = list.filter(h => (h.durum || 'Tamamlandı') === filtreDurum);
  }

  // Tarih Filtresi
  const basF = $('hfFiltreBas') ? $('hfFiltreBas').value : '';
  const bitF = $('hfFiltreBit') ? $('hfFiltreBit').value : '';
  if (basF) {
    list = list.filter(h => (h.haftaBas >= basF) || (h.haftaBit && h.haftaBit >= basF));
  }
  if (bitF) {
    list = list.filter(h => h.haftaBas <= bitF);
  }

  if (!list.length) {
    container.innerHTML = `
      <div class="empty" style="padding:32px 16px;text-align:center;background:#fff;border-radius:12px;border:1px solid #e2e8f0">
        <div style="font-size:32px;margin-bottom:6px">📋</div>
        <p style="color:#64748b;font-weight:600">Seçilen filtrelere uygun kayıtlı soru veya ödev bulunamadı.</p>
        <span style="font-size:12px;color:#94a3b8">Yukarıdaki panelden yeni ödev/soru ekleyebilir veya filtreleri temizleyebilirsiniz.</span>
      </div>
    `;
    return;
  }

  // Tablo Satırları
  const rows = [...list].reverse().map(h => {
    const isGenel = (h.konu || '').includes('Genel');
    const konuStr = h.konu || '📌 Genel';

    return `
      <tr>
        <td style="font-weight:600;white-space:nowrap">${ogrenciAdi(h.ogrenciId)}</td>
        <td>
          <b style="color:#0f172a">${h.ders}</b>
          <div style="font-size:11.5px;color:${isGenel ? 'var(--indigo)' : '#475569'};font-weight:${isGenel ? '600' : '400'}">
            ${konuStr}
          </div>
        </td>
        <td>
          <div style="font-size:12px;color:#334155;max-width:240px">${h.baslik || h.notlar || '<span class="muted">—</span>'}</div>
        </td>
        <td style="font-size:11.5px;color:#64748b;white-space:nowrap">
          ${fmtTarih(h.haftaBas)}${h.haftaBit && h.haftaBit !== h.haftaBas ? `<br>– ${fmtTarih(h.haftaBit)}` : ''}
        </td>
        <td class="num">
          <b>${h.soruSayisi || 0}</b>
          ${h.hedef ? `<span class="muted" style="font-size:10.5px"> / ${h.hedef}</span>` : ''}
        </td>
        <td class="num green">${h.dogru || 0}</td>
        <td class="num red-c">${h.yanlis || 0}</td>
        <td class="num muted">${h.bos || 0}</td>
        <td class="num mono" style="color:var(--indigo);font-weight:700">
          ${typeof h.net === 'number' ? h.net.toFixed(2) : '—'}
        </td>
        <td>${renderYildizHtml(h.id, h.ogrenmeDerecesi)}</td>
        <td>${renderDurumBadge(h.id, h.durum)}</td>
        <td class="num" style="white-space:nowrap">
          <button class="btn sm" onclick="window.hfKontrolModalAc(${h.id})" title="Ödevi Kontrol Et / Düzenle" style="background:#e0e7ff;color:#3730a3;padding:4px 8px;margin-right:4px">✏️ Kontrol Et</button>
          <button class="btn sm red" onclick="window.hfSil(${h.id})" title="Sil" style="padding:4px 8px">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
      <table class="table" style="margin:0">
        <thead>
          <tr>
            <th>Öğrenci</th>
            <th>Ders & Konu</th>
            <th>Ödev Tanımı / Not</th>
            <th>Tarih</th>
            <th class="num">Soru Sayısı</th>
            <th class="num">D</th>
            <th class="num">Y</th>
            <th class="num">B</th>
            <th class="num">Net</th>
            <th>Öğrenme Seviyesi</th>
            <th>Durum</th>
            <th class="num">İşlemler</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

/* ═════ ÖZEL RAPOR OLUŞTURMA & YAZDIRMA (DEDICATED REPORT) ═════ */

/**
 * SADECE Haftalık Soru / Ödev Takibine Özel Rapor Modalı
 */
export function hfOzelRaporAc(oid) {
  const parsedId = Number(oid || seciliHfOgrenciId || ($('filtreHfOgrenci') && $('filtreHfOgrenci').value)) || 0;
  if (!parsedId) {
    toast('Lütfen raporunu almak istediğiniz öğrenciyi seçin!', false);
    return;
  }

  seciliHfOgrenciId = parsedId;
  const modal = $('hfOzelRaporModal');
  if (!modal) return;

  modal.classList.remove('hidden');
  hfOzelRaporRender();
}

export function hfOzelRaporKapat() {
  const modal = $('hfOzelRaporModal');
  if (modal) modal.classList.add('hidden');
}

/**
 * Özel Haftalık Soru / Ödev Raporunun İçeriğini Üretir
 */
export function hfOzelRaporRender() {
  const container = $('hfOzelRaporIcerik');
  if (!container || !seciliHfOgrenciId) return;

  const ogr = DB.ogrenciler.find(o => o.id === seciliHfOgrenciId);
  if (!ogr) return;

  const basTarih = $('hfRaporFiltreBas') ? $('hfRaporFiltreBas').value : '';
  const bitTarih = $('hfRaporFiltreBit') ? $('hfRaporFiltreBit').value : '';
  const tipFiltre = $('hfRaporFiltreTip') ? $('hfRaporFiltreTip').value : 'hepsi';

  let kayitlar = DB.haftalik.filter(h => h.ogrenciId === seciliHfOgrenciId);
  if (basTarih) kayitlar = kayitlar.filter(h => h.haftaBas >= basTarih);
  if (bitTarih) kayitlar = kayitlar.filter(h => h.haftaBas <= bitTarih);
  if (tipFiltre !== 'hepsi') kayitlar = kayitlar.filter(h => (h.tur || 'soru') === tipFiltre);

  kayitlar.sort((a, b) => a.haftaBas.localeCompare(b.haftaBas));

  if (!kayitlar.length) {
    container.innerHTML = `
      <div style="padding:40px;text-align:center;color:#64748b">
        <div style="font-size:36px;margin-bottom:8px">📭</div>
        <h3>Seçilen Filtrelere Uygun Kayıt Bulunamadı</h3>
        <p style="font-size:12px">Lütfen tarih aralığını genişletin veya yeni kayıt girin.</p>
      </div>
    `;
    return;
  }

  // İstatistikler
  const soruKayitlari = kayitlar.filter(h => (h.tur || 'soru') === 'soru');
  const odevKayitlari = kayitlar.filter(h => h.tur === 'odev');

  const toplamSoru = soruKayitlari.reduce((a, b) => a + (b.soruSayisi || 0), 0);
  const toplamDogru = soruKayitlari.reduce((a, b) => a + (b.dogru || 0), 0);
  const toplamYanlis = soruKayitlari.reduce((a, b) => a + (b.yanlis || 0), 0);
  const toplamBos = soruKayitlari.reduce((a, b) => a + (b.bos || 0), 0);
  const toplamNet = soruKayitlari.reduce((a, b) => a + (b.net || 0), 0);
  const dogrulukOrani = toplamSoru > 0 ? Math.round((toplamDogru / toplamSoru) * 100) : 0;

  const toplamOdev = odevKayitlari.length;
  const tamamlananOdev = odevKayitlari.filter(h => h.durum === 'Tamamlandı').length;
  const kismiOdev = odevKayitlari.filter(h => h.durum === 'Kısmi').length;
  const yapilmayanOdev = odevKayitlari.filter(h => h.durum === 'Yapılmadı').length;
  const odevBasariOrani = toplamOdev > 0 ? Math.round((tamamlananOdev / toplamOdev) * 100) : 100;

  // Ders Dağılım Map
  const dersMap = new Map();
  kayitlar.forEach(k => {
    if (!dersMap.has(k.ders)) {
      dersMap.set(k.ders, {
        ders: k.ders,
        soru: 0,
        dogru: 0,
        yanlis: 0,
        bos: 0,
        net: 0,
        konular: new Set(),
        odevSayisi: 0
      });
    }
    const m = dersMap.get(k.ders);
    if ((k.tur || 'soru') === 'soru') {
      m.soru += k.soruSayisi || 0;
      m.dogru += k.dogru || 0;
      m.yanlis += k.yanlis || 0;
      m.bos += k.bos || 0;
      m.net += k.net || 0;
    } else {
      m.odevSayisi += 1;
    }
    if (k.konu) m.konular.add(k.konu);
  });

  const dersListesi = [...dersMap.values()].sort((a, b) => b.soru - a.soru);

  // Tarih Başlığı
  let tarihMetni = 'Tüm Kayıtlar';
  if (basTarih && bitTarih) tarihMetni = `${fmtTarih(basTarih)} — ${fmtTarih(bitTarih)}`;
  else if (basTarih) tarihMetni = `${fmtTarih(basTarih)} Sonrası`;
  else if (bitTarih) tarihMetni = `${fmtTarih(bitTarih)} Öncesi`;

  const kademeBilgi = ogrenciKademeBelirle(ogr.id);
  const sinifAd = sinifAdi(ogr.sinifId);

  // HTML Üretimi
  let html = `
    <div class="ozel-rapor-container" style="background:#fff;padding:24px;border-radius:12px;color:#1e293b">
      <!-- Rapor Başlığı -->
      <div style="border-bottom:2px solid #e2e8f0;padding-bottom:16px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px">
        <div>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:26px">🎓</span>
            <div>
              <h2 style="margin:0;font-size:20px;color:#0f172a;letter-spacing:-0.3px">Haftalık Soru ve Ödev Takip Raporu</h2>
              <div style="font-size:12px;color:#64748b;margin-top:2px">Egemen's EdTech • Bireysel Öğrenci Gelişim Çizelgesi</div>
            </div>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-size:14px;font-weight:700;color:var(--indigo)">${ogr.adSoyad}</div>
          <div style="font-size:12px;color:#64748b">${sinifAd} • ${tarihMetni}</div>
          <div style="font-size:11px;color:#94a3b8">Oluşturulma: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>

      <!-- KPI ÖZET KARTLARI -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:20px">
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px;text-align:center">
          <span style="font-size:11px;color:#1e40af;font-weight:600;display:block">TOPLAM SORU</span>
          <b style="font-size:22px;color:#1d4ed8">${toplamSoru.toLocaleString()}</b>
          <span style="font-size:10px;color:#60a5fa;display:block;margin-top:2px">%${dogrulukOrani} Doğruluk</span>
        </div>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:12px;text-align:center">
          <span style="font-size:11px;color:#166534;font-weight:600;display:block">TOPLAM NET</span>
          <b style="font-size:22px;color:#15803d" class="mono">${toplamNet.toFixed(2)}</b>
          <span style="font-size:10px;color:#4ade80;display:block;margin-top:2px">${toplamDogru} D / ${toplamYanlis} Y</span>
        </div>
        <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:12px;text-align:center">
          <span style="font-size:11px;color:#92400e;font-weight:600;display:block">ÖDEV BAŞARISI</span>
          <b style="font-size:22px;color:#b45309">%${odevBasariOrani}</b>
          <span style="font-size:10px;color:#f59e0b;display:block;margin-top:2px">${tamamlananOdev} / ${toplamOdev} Tamam</span>
        </div>
        <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:12px;text-align:center">
          <span style="font-size:11px;color:#5b21b6;font-weight:600;display:block">ÇALIŞILAN DERS</span>
          <b style="font-size:22px;color:#6d28d9">${dersListesi.length}</b>
          <span style="font-size:10px;color:#a78bfa;display:block;margin-top:2px">${kayitlar.length} Toplam Kayıt</span>
        </div>
      </div>

      <!-- GRAFİK VE DERS DAĞILIMI -->
      <div style="display:flex;gap:18px;margin-bottom:20px;flex-wrap:wrap">
        <div style="flex:1.2;min-width:280px">
          <h4 style="font-size:14px;color:#0f172a;margin-bottom:10px;display:flex;align-items:center;gap:6px">
            📊 Ders Bazlı Soru ve Net Analizi
          </h4>
          <table class="table" style="font-size:12px">
            <thead>
              <tr>
                <th>Ders</th>
                <th class="num">Soru</th>
                <th class="num">D</th>
                <th class="num">Y</th>
                <th class="num">Net</th>
                <th class="num">Başarı</th>
              </tr>
            </thead>
            <tbody>
              ${dersListesi.map(d => {
                const basari = d.soru > 0 ? Math.round((d.dogru / d.soru) * 100) : 0;
                return `
                  <tr>
                    <td><b>${d.ders}</b></td>
                    <td class="num">${d.soru}</td>
                    <td class="num green">${d.dogru}</td>
                    <td class="num red-c">${d.yanlis}</td>
                    <td class="num mono" style="color:var(--indigo);font-weight:700">${d.net.toFixed(2)}</td>
                    <td class="num">
                      <div style="display:flex;align-items:center;gap:4px;justify-content:flex-end">
                        <span style="font-size:11px;font-weight:600">${basari}%</span>
                        <div style="width:40px;height:5px;background:#e2e8f0;border-radius:3px;overflow:hidden">
                          <div style="width:${basari}%;height:100%;background:${basari >= 70 ? '#10b981' : basari >= 40 ? '#f59e0b' : '#ef4444'}"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- PASTA GRAFİK -->
        <div style="flex:0.8;min-width:220px;background:#f8fafc;padding:12px;border-radius:10px;border:1px solid #e2e8f0;text-align:center">
          <h4 style="font-size:13px;color:#0f172a;margin-bottom:6px">Ders Soru Dağılımı</h4>
          ${toplamSoru > 0 ? pastaGrafik(dersListesi.filter(d => d.soru > 0).map(d => ({ ad: d.ders, deger: d.soru }))) : '<div class="muted" style="padding:40px 0">Soru verisi yok</div>'}
        </div>
      </div>

      <!-- DETAYLI ÇALIŞMA & KONU LİSTESİ -->
      <div style="margin-bottom:20px">
        <h4 style="font-size:14px;color:#0f172a;margin-bottom:10px;display:flex;align-items:center;gap:6px">
          📝 Çalışılan Konular ve Ödev Detayları
        </h4>
        <table class="table" style="font-size:12px">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Ders & Konu</th>
              <th>Ödev Tanımı / Not</th>
              <th class="num">Soru Sayısı</th>
              <th class="num">Net</th>
              <th>Öğrenme Seviyesi</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            ${kayitlar.map(k => {
              const dur = k.durum || 'Tamamlandı';
              let durBadge = '';
              if (dur === 'Verildi') durBadge = '<span class="pillbad yellow" style="font-size:10px">⏳ Kontrol Bekliyor</span>';
              else if (dur === 'Tamamlandı') durBadge = '<span class="pillbad green" style="font-size:10px">✅ Tam Yapıldı</span>';
              else if (dur === 'Kısmi') durBadge = '<span class="pillbad orange" style="font-size:10px">⚠️ Eksik Yapıldı</span>';
              else durBadge = '<span class="pillbad red" style="font-size:10px">❌ Yapılmadı</span>';

              const yildizStr = k.ogrenmeDerecesi > 0 
                ? `<span style="color:#f59e0b;font-size:13px">${'★'.repeat(k.ogrenmeDerecesi)}${'☆'.repeat(5 - k.ogrenmeDerecesi)}</span>` 
                : '<span class="muted">—</span>';

              return `
                <tr>
                  <td style="color:#64748b;white-space:nowrap">${fmtTarih(k.haftaBas)}</td>
                  <td>
                    <b>${k.ders}</b>
                    <div style="color:${(k.konu || '').includes('Genel') ? 'var(--indigo)' : '#475569'};font-size:11px">
                      ${k.konu || '📌 Genel'}
                    </div>
                  </td>
                  <td>${k.baslik || k.notlar || '<span class="muted">—</span>'}</td>
                  <td class="num">${k.soruSayisi || 0}${k.hedef ? ` / ${k.hedef}` : ''}</td>
                  <td class="num mono" style="color:var(--indigo);font-weight:600">${typeof k.net === 'number' ? k.net.toFixed(2) : '—'}</td>
                  <td>${yildizStr}</td>
                  <td>${durBadge}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- ÖĞRETMEN DEĞERLENDİRMESİ VE İMZA ALANI -->
      <div style="border-top:1.5px dashed #cbd5e1;padding-top:14px;margin-top:16px;display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap">
        <div style="flex:2;min-width:240px">
          <b style="font-size:12px;color:#334155;display:block;margin-bottom:4px">📝 Öğretmen Görüşü & Notlar:</b>
          <div style="min-height:50px;border:1px solid #e2e8f0;background:#f8fafc;border-radius:8px;padding:8px;font-size:12px;color:#475569">
            ${toplamSoru >= 300
              ? 'Tebrikler, bu hafta hedef soru barajı başarıyla aşıldı. Yanlış yapılan soruların analizine devam edilmelidir.'
              : 'Öğrencinin belirlenen konu eksiklerini kapatması için soru sayısının ve ödev disiplininin artırılması önerilir.'}
          </div>
        </div>
        <div style="text-align:center;min-width:140px">
          <div style="border-bottom:1px solid #94a3b8;width:140px;margin-bottom:4px;height:36px"></div>
          <span style="font-size:11px;color:#64748b">Öğretmen / Danışman İmza</span>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Yazdırma & PDF Çıktısı (Yalnızca Bu Özel Raporu Yazdırır)
 */
export function hfOzelRaporYazdir() {
  const container = $('hfOzelRaporIcerik');
  if (!container || !container.innerHTML.trim()) return;

  const ogr = DB.ogrenciler.find(o => o.id === seciliHfOgrenciId);
  const ogrAd = ogr ? ogr.adSoyad : 'Ogrenci';

  $('hfPrintAlan').innerHTML = container.innerHTML;
  document.body.classList.add('print-hf');
  const eskiTitle = document.title;
  document.title = `${ogrAd}_Haftalik_Soru_Odev_Raporu`;

  const temizle = () => {
    document.body.classList.remove('print-hf');
    document.title = eskiTitle;
    $('hfPrintAlan').innerHTML = '';
  };

  const after = () => {
    temizle();
    window.removeEventListener('afterprint', after);
  };
  window.addEventListener('afterprint', after);

  toast('🖨️ Yazdırma penceresi açılıyor — "PDF olarak kaydet" seçebilirsiniz');
  setTimeout(() => {
    window.print();
    setTimeout(() => {
      if (document.body.classList.contains('print-hf')) temizle();
    }, 1500);
  }, 200);
}

/**
 * WhatsApp / Veli Mesajı Kopyalama
 */
export function hfWhatsAppPaylas() {
  const ogr = DB.ogrenciler.find(o => o.id === seciliHfOgrenciId);
  if (!ogr) return;

  const basTarih = $('hfRaporFiltreBas') ? $('hfRaporFiltreBas').value : '';
  const bitTarih = $('hfRaporFiltreBit') ? $('hfRaporFiltreBit').value : '';
  let kayitlar = DB.haftalik.filter(h => h.ogrenciId === seciliHfOgrenciId);
  if (basTarih) kayitlar = kayitlar.filter(h => h.haftaBas >= basTarih);
  if (bitTarih) kayitlar = kayitlar.filter(h => h.haftaBas <= bitTarih);

  const soruKayitlari = kayitlar.filter(h => (h.tur || 'soru') === 'soru');
  const odevKayitlari = kayitlar.filter(h => h.tur === 'odev');
  const toplamSoru = soruKayitlari.reduce((a, b) => a + (b.soruSayisi || 0), 0);
  const toplamNet = soruKayitlari.reduce((a, b) => a + (b.net || 0), 0);
  const tamamlananOdev = odevKayitlari.filter(h => h.durum === 'Tamamlandı').length;

  let msg = `🎓 *ÖĞRENCİ HAFTALIK SORU & ÖDEV BİLGİLENDİRMESİ*\n`;
  msg += `👤 *Öğrenci:* ${ogr.adSoyad} (${sinifAdi(ogr.sinifId)})\n`;
  msg += `📅 *Dönem:* ${basTarih && bitTarih ? `${fmtTarih(basTarih)} - ${fmtTarih(bitTarih)}` : 'Haftalık Değerlendirme'}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📊 *Çözülen Toplam Soru:* ${toplamSoru} Adet\n`;
  msg += `🎯 *Toplam Net:* ${toplamNet.toFixed(2)}\n`;
  if (odevKayitlari.length > 0) {
    msg += `📝 *Ödev Takibi:* ${tamamlananOdev}/${odevKayitlari.length} Ödev Tamamlandı\n`;
  }
  msg += `\n*Ders Detayları:*\n`;

  const dersMap = new Map();
  soruKayitlari.forEach(k => {
    dersMap.set(k.ders, (dersMap.get(k.ders) || 0) + (k.soruSayisi || 0));
  });
  dersMap.forEach((soru, ders) => {
    msg += `• ${ders}: ${soru} soru\n`;
  });

  msg += `\nİyi çalışmalar dileriz. ✨`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(msg).then(() => {
      toast('📋 WhatsApp mesaj formatı panoya kopyalandı!');
    });
  } else {
    promptKopyala('Veli Bilgilendirme Metni', msg);
  }
}

/* ═════ GERİYE DÖNÜK UYUMLU TOPLU GİRİŞ VE KLASİK RAPOR ═════ */

export function hfTopluKaydet() {
  const t = $('hfTopluMetin').value.trim();
  if (!t) { toast('Metin boş', false); return; }

  const ln = t.split(/\r?\n/);
  let cur = {};
  let ek = 0;

  ln.forEach(raw => {
    const s = raw.trim();
    if (!s) {
      if (cur.ogrenci && cur.ders) {
        hfTopluEkle(cur);
        ek++;
      }
      cur = {};
      return;
    }
    const mA = s.match(/^Öğrenci Adı\s*:\s*(.+)/i);
    const mT = s.match(/^Tarih\s*:\s*(\d{1,2}\.\d{1,2}\.\d{4})/i);
    const mD = s.match(/^Ders\s*:\s*(.+)/i);
    const mK = s.match(/^Konu\s*:\s*(.+)/i);
    const mS = s.match(/^Soru Sayısı\s*:\s*(\d+)/i);
    const mDG = s.match(/^Doğru Sayısı\s*:\s*(\d+)/i);
    const mYG = s.match(/^Yanlış Sayısı\s*:\s*(\d+)/i);

    if (mA) {
      if (cur.ogrenci && cur.ders) {
        hfTopluEkle(cur);
        ek++;
      }
      cur = { ogrenci: mA[1].trim() };
    } else if (mT && cur) cur.tarih = mT[1];
    else if (mD && cur) cur.ders = mD[1].trim();
    else if (mK && cur) cur.konu = mK[1].trim();
    else if (mS && cur) cur.soru = Number(mS[1]) || 0;
    else if (mDG && cur) cur.dogru = Number(mDG[1]) || 0;
    else if (mYG && cur) cur.yanlis = Number(mYG[1]) || 0;
  });

  if (cur.ogrenci && cur.ders) {
    hfTopluEkle(cur);
    ek++;
  }

  $('hfTopluMetin').value = '';
  toast(`${ek} kayıt eklendi`);
  window.hfTab('tek');
  renderHaftalik();
}

export function hfTopluEkle(c) {
  const o = DB.ogrenciler.find(x => x.adSoyad.toLowerCase() === c.ogrenci.toLowerCase());
  if (!o) { toast(`${c.ogrenci} bulunamadı`, false); return; }

  const p = c.tarih ? c.tarih.split('.').reverse().join('-') : new Date().toISOString().split('T')[0];
  const dogru = c.dogru || 0;
  const yanlis = c.yanlis || 0;
  const soru = c.soru || (dogru + yanlis);
  const bos = Math.max(0, soru - dogru - yanlis);
  const net = netHesapla('TYT', dogru, yanlis);

  DB.haftalik.push({
    id: nid(),
    ogrenciId: o.id,
    tur: 'soru',
    sinavTuru: 'TYT',
    ders: c.ders,
    konu: c.konu || '📌 Genel',
    haftaBas: p,
    haftaBit: p,
    soruSayisi: soru,
    dogru: dogru,
    yanlis: yanlis,
    bos: bos,
    net: net,
    durum: 'Tamamlandı'
  });
  saveDB();
}

export function hfRaporAl() {
  // Eski rapor çağrısını yeni modern modal ve özel rapor sistemine yönlendir
  hfOzelRaporAc(seciliHfOgrenciId);
}
