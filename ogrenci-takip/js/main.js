/* ══════════════════════════════════════════════════════
   Öğrenci Takip Sistemi — Ana Orkestrasyon (Main)
   ══════════════════════════════════════════════════════ */

import { DB, loadDB, sinifAdi } from './state.js';
import { $, toast, promptKopyala } from './utils.js';

import { renderDashboard } from './modules/dashboard.js';
import {
  sinifEkle, sinifDuzenle, sinifIptal, sinifSil, renderSiniflar,
  aktifSurecRender, aktifSurecOzetRender, aktifSurecRapor,
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
  hfTopluKaydet, hfSil, renderHaftalik, hfRaporAl
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
  if (v === 'haftalik') { doldurSelectler(); renderHaftalik(); }
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
  $('denTabTek').className = 'tab' + (m === 'tek' ? ' on' : '');
  $('denTabToplu').className = 'tab' + (m === 'toplu' ? ' on' : '');
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
  if ($('hfOgrenci')) $('hfOgrenci').innerHTML = '<option value="">Öğrenci seçin</option>' + DB.ogrenciler.map(o => `<option value="${o.id}">${o.adSoyad}</option>`).join('');
  if ($('filtreHfOgrenci')) $('filtreHfOgrenci').innerHTML = '<option value="">Tüm Öğrenciler</option>' + DB.ogrenciler.map(o => `<option value="${o.id}">${o.adSoyad}</option>`).join('');
}

// Modüller arası callback bağlamaları
setSinifSelectCallback(doldurSelectler);
setOgrSelectCallback(doldurSelectler);
setDenSelectCallback(doldurSelectler);
setBackupReloadCallback(() => {
  doldurSelectler();
  aktifSurecRender();
  goto('dashboard');
});

/* ═════ INLINE HTML ETKİLEŞİMLERİ İÇİN GLOBAL WINDOW BAĞLAMASI ═════ */
window.$ = $;
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

// Haftalık
window.hfBitisOtomatik = hfBitisOtomatik;
window.hfKaydet = hfKaydet;
window.hfTopluKaydet = hfTopluKaydet;
window.hfSil = hfSil;
window.renderHaftalik = renderHaftalik;
window.hfRaporAl = hfRaporAl;

// Raporlar
window.dersSecTumu = dersSecTumu;
window.dersSecTemizle = dersSecTemizle;
window.ogrSecTumu = ogrSecTumu;
window.ogrSecTemizle = ogrSecTemizle;
window.gelisimSec = gelisimSec;
window.gelisimTemizle = gelisimTemizle;
window.renderRapor = renderRapor;
window.raporPDF = raporPDF;

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

  // Drag & drop dosya yükleme (JSON yedek için)
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
      }
    }
  }, false);

  goto('dashboard');
});
