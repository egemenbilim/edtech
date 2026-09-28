/* ══════════════════════════════════════════════════════
   Öğrenci Takip Sistemi — Ana Orkestrasyon (Main)
   ══════════════════════════════════════════════════════ */

import { DB, loadDB, sinifAdi } from './state.js';
import { $, toast, promptKopyala } from './utils.js';

import { renderDashboard } from './modules/dashboard.js';
import {
  sinifEkle, sinifDuzenle, sinifIptal, sinifSil, renderSiniflar,
  aktifSurecRender, aktifSurecOzetRender, aktifSurecRapor, aktifSurecOtomatikDoldur,
  sinifDetayGoster, konuEkle, konuDurumDegis, konuSil,
  konuTumunuSil, setSelectUpdateCallback as setSinifSelectCallback
} from './modules/siniflar.js';
import {
  ogrenciKaydet, ogrenciDuzenle, ogrEditKapat, ogrEditKaydet,
  ogrenciIptal, ogrenciSil, renderOgrenciler, ogrTopluAksiyonGuncelle,
  ogrenciSecTumu, ogrenciSecTemizle, ogrenciTopluSil, ogrenciTasi,
  ogrenciDetayGoster, denemeSonucDuzenle, dzNet, denemeSonucKaydet,
  ogrenciDetayPDF, topluOgrKaydet, setSelectUpdateCallback as setOgrSelectCallback
} from './modules/ogrenciler.js';
import {
  dersListesiniOlustur, dNG, denUyariGuncelle, denemeKaydet,
  denemeSil, renderDenemeler, gosterOrnek, topluSonuclariTemizle,
  topluDegerlendir, topluKaydet, setSelectUpdateCallback as setDenSelectCallback
} from './modules/denemeler.js';
import {
  hfBitisOtomatik, hfDersOnerileriGuncelle, hfKaydet,
  hfTopluKaydet, hfSil, renderHaftalik, hfRaporAl,
  hfOgrenciSecildi, hfSinavTuruSecildi, hfDersSecildi, hfKonuSecildi,
  hfTurDegis, hfNetHesaplaLive, hfOdevDurumHizliDegis, hfFiltreTurSec,
  hfOzelRaporAc, hfOzelRaporKapat, hfOzelRaporRender, hfOzelRaporYazdir,
  hfWhatsAppPaylas, seciliHfOgrenciId
} from './modules/haftalik.js';
import {
  doldurRaporFiltreleri, dersSecTumu, dersSecTemizle,
  ogrSecTumu, ogrSecTemizle, gelisimSec, gelisimTemizle,
  renderRapor, renderDetayliAnaliz, raporPDF
} from './modules/raporlar.js';
import {
  disaAktar, iceriAktar, handleFile, tumunuSil,
  renderCikti, setBackupReloadCallback
} from './modules/backup.js';
import {
  parsePdfFile, parseExamLines, renderPdfOnayPaneli,
  pdfSecTumuDegistir, pdfRowToggle, pdfTopluSinifUygula,
  pdfTemizle, pdfOnaylaVeKaydet, setPdfSelectCallback
} from './modules/pdfParser.js';
import {
  uypSelectleriGuncelle, uypPlanSecildi, uypPlaniSinifaCek,
  uypModalAc, uypPlaniOnizleModal, uypPlaniOnizleGoster,
  uypOzelPlanSil, parseUypDosya, parseUypMetin, renderUypOnayPaneli,
  uypOnaySatirSil, uypOnaySatirEkle, uypOnayVeKaydet
} from './modules/uypParser.js';

/* ═════ NAVİGASYON VE SEKME YÖNETİMİ ═════ */
export function goto(v) {
  document.querySelectorAll('nav.top a').forEach(a => {
    a.classList.toggle('active', a.dataset.view === v);
  });
  document.querySelectorAll('main section').forEach(s => {
    s.classList.toggle('hidden', s.id !== v);
  });

  if (v === 'dashboard') renderDashboard();
  if (v === 'siniflar') renderSiniflar();
  if (v === 'ogrenciler') { doldurSelectler(); renderOgrenciler(); }
  if (v === 'deneme') { doldurSelectler(); dersListesiniOlustur(); renderDenemeler(); }
  if (v === 'haftalik') {
    doldurSelectler();
    if (!seciliHfOgrenciId && DB.ogrenciler.length) {
      hfOgrenciSecildi(DB.ogrenciler[0].id);
    } else if (seciliHfOgrenciId) {
      hfOgrenciSecildi(seciliHfOgrenciId);
    } else {
      renderHaftalik();
    }
  }
  if (v === 'rapor') { doldurRaporFiltreleri(); renderRapor(); }
  if (v === 'cikti') renderCikti();
}

export function ogrTab(m) {
  $('ogrListe').classList.toggle('hidden', m !== 'liste');
  $('ogrTekli').classList.toggle('hidden', m !== 'tek');
  $('ogrToplu').classList.toggle('hidden', m !== 'toplu');
  $('ogrTabListe').className = 'tab' + (m === 'liste' ? ' on' : '');
  $('ogrTabTek').className = 'tab' + (m === 'tek' ? ' on' : '');
  $('ogrTabToplu').className = 'tab' + (m === 'toplu' ? ' on' : '');
  if (m === 'liste') renderOgrenciler();
}

export function denTab(m) {
  $('denTekli').classList.toggle('hidden', m !== 'tek');
  $('denToplu').classList.toggle('hidden', m !== 'toplu');
  const dp = $('denPdf');
  if (dp) dp.classList.toggle('hidden', m !== 'pdf');
  $('denTabTek').className = 'tab' + (m === 'tek' ? ' on' : '');
  $('denTabToplu').className = 'tab' + (m === 'toplu' ? ' on' : '');
  const tp = $('denTabPdf');
  if (tp) tp.className = 'tab' + (m === 'pdf' ? ' on' : '');
}

export function hfTab(m) {
  $('hfTekli').classList.toggle('hidden', m !== 'tek');
  $('hfToplu').classList.toggle('hidden', m !== 'toplu');
  $('hfTabTek').className = 'tab' + (m === 'tek' ? ' on' : '');
  $('hfTabToplu').className = 'tab' + (m === 'toplu' ? ' on' : '');
  if (m === 'tek') renderHaftalik();
}

/* ═════ ORTAK SELECTLERİ DOLDURMA ═════ */
export function doldurSelectler() {
  const sO = '<option value="">Sınıf seçin</option>' + DB.siniflar.map(s => `<option value="${s.id}">${s.ad}</option>`).join('');
  if ($('ogrSinif')) $('ogrSinif').innerHTML = sO;
  if ($('filtreSinif')) $('filtreSinif').innerHTML = '<option value="">Tüm Sınıflar</option>' + DB.siniflar.map(s => `<option value="${s.id}">${s.ad}</option>`).join('');

  const oO = DB.ogrenciler.map(o => `<option value="${o.id}">${o.adSoyad} (${sinifAdi(o.sinifId)})</option>`).join('');
  if ($('denOgrenci')) $('denOgrenci').innerHTML = '<option value="">Öğrenci seçin</option>' + oO;
  if ($('hfOgrenci')) $('hfOgrenci').innerHTML = '<option value="">Öğrenci seçin</option>' + oO;
  if ($('filtreHfOgrenci')) $('filtreHfOgrenci').innerHTML = '<option value="">Tüm Öğrenciler</option>' + oO;

  uypSelectleriGuncelle();
}

// Modüller arası callback bağlamaları
setSinifSelectCallback(doldurSelectler);
setOgrSelectCallback(doldurSelectler);
setDenSelectCallback(doldurSelectler);
setPdfSelectCallback(doldurSelectler);
setBackupReloadCallback(() => {
  doldurSelectler();
  aktifSurecRender();
  goto('dashboard');
});

/* ═════ INLINE HTML ETKİLEŞİMLERİ İÇİN GLOBAL WINDOW BAĞLAMASI ═════ */
window.$ = $;
window.DB = DB;
window.goto = goto;
window.ogrTab = ogrTab;
window.denTab = denTab;
window.hfTab = hfTab;

// Sınıflar
window.sinifEkle = sinifEkle;
window.sinifDuzenle = sinifDuzenle;
window.sinifIptal = sinifIptal;
window.sinifSil = sinifSil;
window.renderSiniflar = renderSiniflar;
window.sinifDetayGoster = sinifDetayGoster;
window.konuEkle = konuEkle;
window.konuDurumDegis = konuDurumDegis;
window.konuSil = konuSil;
window.konuTumunuSil = konuTumunuSil;
window.aktifSurecOzetRender = aktifSurecOzetRender;
window.aktifSurecRapor = aktifSurecRapor;
window.aktifSurecOtomatikDoldur = aktifSurecOtomatikDoldur;

// Ünitelendirilmiş Yıllık Plan (ÜYP)
window.uypSelectleriGuncelle = uypSelectleriGuncelle;
window.uypPlanSecildi = uypPlanSecildi;
window.uypPlaniSinifaCek = uypPlaniSinifaCek;
window.uypModalAc = uypModalAc;
window.uypPlaniOnizleModal = uypPlaniOnizleModal;
window.uypPlaniOnizleGoster = uypPlaniOnizleGoster;
window.uypOzelPlanSil = uypOzelPlanSil;
window.uypOnaySatirSil = uypOnaySatirSil;
window.uypOnaySatirEkle = uypOnaySatirEkle;
window.uypOnayVeKaydet = uypOnayVeKaydet;
window.uypYapistirilanMetniAyristir = function() {
  const t = ($('uypYapistirMetin') && $('uypYapistirMetin').value) || '';
  if (!t.trim()) { toast('Lütfen önce plan metnini yapıştırın', false); return; }
  const taslak = parseUypMetin(t, 'Yapıştırılan Yıllık Plan');
  if (!taslak || !taslak.haftalar.length) {
    toast('Metinden geçerli konu satırı çıkarılamadı', false);
    return;
  }
  renderUypOnayPaneli(taslak);
  toast(`✅ ${taslak.haftalar.length} satır ayrıştırıldı!`);
};

// Öğrenciler
window.ogrenciKaydet = ogrenciKaydet;
window.ogrenciDuzenle = ogrenciDuzenle;
window.ogrEditKapat = ogrEditKapat;
window.ogrEditKaydet = ogrEditKaydet;
window.ogrenciIptal = ogrenciIptal;
window.ogrenciSil = ogrenciSil;
window.renderOgrenciler = renderOgrenciler;
window.ogrTopluAksiyonGuncelle = ogrTopluAksiyonGuncelle;
window.ogrenciSecTumu = ogrenciSecTumu;
window.ogrenciSecTemizle = ogrenciSecTemizle;
window.ogrenciTopluSil = ogrenciTopluSil;
window.ogrenciTasi = ogrenciTasi;
window.ogrenciDetayGoster = ogrenciDetayGoster;
window.denemeSonucDuzenle = denemeSonucDuzenle;
window.dzNet = dzNet;
window.denemeSonucKaydet = denemeSonucKaydet;
window.ogrenciDetayPDF = ogrenciDetayPDF;
window.topluOgrKaydet = topluOgrKaydet;

// Denemeler
window.dersListesiniOlustur = dersListesiniOlustur;
window.dNG = dNG;
window.denemeKaydet = denemeKaydet;
window.denemeSil = denemeSil;
window.gosterOrnek = gosterOrnek;
window.topluDegerlendir = topluDegerlendir;
window.topluKaydet = topluKaydet;
window.topluSonuclariTemizle = topluSonuclariTemizle;

// Haftalık Soru / Ödev Takibi
window.hfBitisOtomatik = hfBitisOtomatik;
window.hfKaydet = hfKaydet;
window.hfTopluKaydet = hfTopluKaydet;
window.hfSil = hfSil;
window.renderHaftalik = renderHaftalik;
window.hfRaporAl = hfRaporAl;
window.hfOgrenciSecildi = hfOgrenciSecildi;
window.hfSinavTuruSecildi = hfSinavTuruSecildi;
window.hfDersSecildi = hfDersSecildi;
window.hfKonuSecildi = hfKonuSecildi;
window.hfTurDegis = hfTurDegis;
window.hfNetHesaplaLive = hfNetHesaplaLive;
window.hfOdevDurumHizliDegis = hfOdevDurumHizliDegis;
window.hfFiltreTurSec = hfFiltreTurSec;
window.hfOzelRaporAc = hfOzelRaporAc;
window.hfOzelRaporKapat = hfOzelRaporKapat;
window.hfOzelRaporRender = hfOzelRaporRender;
window.hfOzelRaporYazdir = hfOzelRaporYazdir;
window.hfWhatsAppPaylas = hfWhatsAppPaylas;

// Raporlar
window.dersSecTumu = dersSecTumu;
window.dersSecTemizle = dersSecTemizle;
window.ogrSecTumu = ogrSecTumu;
window.ogrSecTemizle = ogrSecTemizle;
window.gelisimSec = gelisimSec;
window.gelisimTemizle = gelisimTemizle;
window.renderRapor = renderRapor;
window.raporPDF = raporPDF;

// PDF Ayrıştırma ve Onay
window.pdfDosyaSecAc = function() {
  const inp = $('pdfDosyaInput');
  if (inp) {
    inp.value = '';
    inp.click();
  }
};

window.pdfDosyaSecildi = async function(ev) {
  const file = (ev && ev.target && ev.target.files && ev.target.files[0]) ||
               (ev && ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0]) ||
               (ev instanceof File ? ev : null);
  if (!file) return;

  const infoEl = $('pdfSecilenDosya');
  const yk = $('pdfYukleniyor');
  const ht = $('pdfHata');

  if (infoEl) {
    infoEl.textContent = `📄 Seçilen Dosya: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    infoEl.classList.remove('hidden');
  }
  if (yk) yk.classList.remove('hidden');
  if (ht) ht.classList.add('hidden');

  try {
    const parsed = await parsePdfFile(file);
    if (parsed.error) {
      if (ht) {
        ht.textContent = '❌ ' + parsed.error;
        ht.classList.remove('hidden');
      }
      toast(parsed.error, false);
    } else {
      renderPdfOnayPaneli(parsed);
      toast(`✅ PDF okundu: ${parsed.ogrenciler.length} öğrenci bulundu`);
    }
  } catch (err) {
    console.error(err);
    if (ht) {
      ht.textContent = '❌ PDF okunurken hata oluştu: ' + (err.message || err);
      ht.classList.remove('hidden');
    }
    toast('PDF okunamadı', false);
  } finally {
    if (yk) yk.classList.add('hidden');
  }
};

window.pdfMetinCozumle = function() {
  const txt = $('pdfMetinInput').value.trim();
  const ht = $('pdfHata');
  if (ht) ht.classList.add('hidden');

  if (!txt) {
    toast('Lütfen metin yapıştırın', false);
    return;
  }

  const lines = txt.split(/\r?\n/).filter(l => l.trim().length > 0);
  const parsed = parseExamLines(lines);

  if (parsed.error) {
    if (ht) {
      ht.textContent = '❌ ' + parsed.error;
      ht.classList.remove('hidden');
    }
    toast(parsed.error, false);
  } else {
    renderPdfOnayPaneli(parsed);
    toast(`✅ Metin çözümlendi: ${parsed.ogrenciler.length} öğrenci bulundu`);
  }
};

window.pdfSecTumuDegistir = pdfSecTumuDegistir;
window.pdfRowToggle = pdfRowToggle;
window.pdfTopluSinifUygula = pdfTopluSinifUygula;
window.pdfTemizle = pdfTemizle;
window.pdfOnaylaVeKaydet = pdfOnaylaVeKaydet;

// Yedek
window.disaAktar = disaAktar;
window.iceriAktar = iceriAktar;
window.tumunuSil = tumunuSil;

// Araçlar
window.promptKopyala = promptKopyala;

/* ═════ BAŞLATICI ═════ */
document.addEventListener('DOMContentLoaded', () => {
  loadDB();

  const denTarihEl = $('denTarih');
  if (denTarihEl) denTarihEl.value = new Date().toISOString().split('T')[0];

  hfDersOnerileriGuncelle();
  doldurSelectler();

  document.querySelectorAll('nav.top a').forEach(a => {
    a.onclick = () => goto(a.dataset.view);
  });

  document.addEventListener('change', e => {
    if (e.target.id === 'raporTur') doldurRaporFiltreleri();
    if (['raporSiralama', 'raporAltinda', 'raporGelisimGoster', 'raporDersIlerleyis', 'raporDetayli'].includes(e.target.id)) {
      if ($('raporSonuc') && $('raporSonuc').innerHTML.trim()) renderRapor();
    }
  });

  // Drag & drop dosya yükleme (JSON yedek ve PDF için)
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => {
    document.body.addEventListener(ev, e => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });

  document.body.addEventListener('drop', e => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length) {
      const f = files[0];
      if (f.name.endsWith('.json')) {
        handleFile(f);
      } else if (f.name.endsWith('.pdf')) {
        goto('deneme');
        denTab('pdf');
        window.pdfDosyaSecildi({ dataTransfer: { files: [f] } });
      }
    }
  }, false);

  const dropZone = $('pdfDropZone');
  if (dropZone) {
    dropZone.addEventListener('dragover', e => {
      e.preventDefault();
      dropZone.style.background = '#e0e7ff';
      dropZone.style.borderColor = 'var(--indigo2)';
    });
    dropZone.addEventListener('dragleave', e => {
      e.preventDefault();
      dropZone.style.background = '#f8fafc';
      dropZone.style.borderColor = 'var(--indigo)';
    });
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.style.background = '#f8fafc';
      dropZone.style.borderColor = 'var(--indigo)';
      const files = e.dataTransfer && e.dataTransfer.files;
      if (files && files.length) {
        window.pdfDosyaSecildi({ dataTransfer: { files: [files[0]] } });
      }
    });
  }

  // ÜYP Yıllık Plan Dosya Yükleme Eventleri
  const uypDrop = $('uypDropZone');
  const uypInput = $('uypDosyaInput');
  if (uypDrop && uypInput) {
    uypDrop.addEventListener('click', () => {
      uypInput.click();
    });
    uypInput.addEventListener('change', e => {
      if (e.target.files && e.target.files.length) {
        parseUypDosya(e.target.files[0]);
      }
    });
    uypDrop.addEventListener('dragover', e => {
      e.preventDefault();
      uypDrop.style.background = '#dcfce7';
      uypDrop.style.borderColor = '#15803d';
    });
    uypDrop.addEventListener('dragleave', e => {
      e.preventDefault();
      uypDrop.style.background = '#f0fdf4';
      uypDrop.style.borderColor = '#059669';
    });
    uypDrop.addEventListener('drop', e => {
      e.preventDefault();
      uypDrop.style.background = '#f0fdf4';
      uypDrop.style.borderColor = '#059669';
      const files = e.dataTransfer && e.dataTransfer.files;
      if (files && files.length) {
        parseUypDosya(files[0]);
      }
    });
  }

  goto('dashboard');
});
