/* ══════════════════════════════════════════════════════
   Öğrenci Takip Sistemi — Durum ve Veri Katmanı (State)
   ══════════════════════════════════════════════════════ */

export const STORE_KEY = 'ogrenciTakip';

export let DB = {
  siniflar: [],
  ogrenciler: [],
  denemeler: [],
  sonuclar: [],
  haftalik: [],
  konular: []
};

let nextId = 1;

export function nid() {
  return nextId++;
}

export function loadDB() {
  try {
    const r = localStorage.getItem(STORE_KEY);
    if (r) {
      DB = JSON.parse(r);
      if (!DB.siniflar) DB = { siniflar: [], ogrenciler: [], denemeler: [], sonuclar: [], haftalik: [], konular: [] };
      if (!DB.konular) DB.konular = [];
    }
  } catch (e) {
    DB = { siniflar: [], ogrenciler: [], denemeler: [], sonuclar: [], haftalik: [], konular: [] };
  }

  nextId = 1;
  ['siniflar', 'ogrenciler', 'denemeler', 'sonuclar', 'haftalik', 'konular'].forEach(k => {
    (DB[k] || []).forEach(x => {
      if (x.id >= nextId) nextId = x.id + 1;
    });
  });
}

export function saveDB() {
  localStorage.setItem(STORE_KEY, JSON.stringify(DB));
}

export function resetDB() {
  DB = { siniflar: [], ogrenciler: [], denemeler: [], sonuclar: [], haftalik: [], konular: [] };
  nextId = 1;
  saveDB();
}

/* ═════ DERS TANIMLARI & SINAV KURALLARI ═════ */
export const DERS_TANIM = {
  'TYT': [['Türkçe', 40], ['Matematik', 40], ['Fizik', 7], ['Kimya', 7], ['Biyoloji', 6], ['Tarih', 5], ['Coğrafya', 5], ['Felsefe', 5], ['Din Kültürü', 5]],
  'AYT-SAY': [['Matematik', 40], ['Fizik', 14], ['Kimya', 13], ['Biyoloji', 13]],
  'AYT-EA': [['Matematik', 40], ['Edebiyat', 24], ['Tarih-1', 10], ['Coğrafya-1', 6]],
  'AYT-SOZ': [['Edebiyat', 24], ['Tarih-1', 10], ['Coğrafya-1', 6], ['Tarih-2', 11], ['Coğrafya-2', 11], ['Felsefe Grubu', 12], ['Din Kültürü', 6]],
  'LGS': [['Türkçe', 20], ['Matematik', 20], ['Fen Bilimleri', 20], ['İnkılap Tarihi', 10], ['İngilizce', 10], ['Din Kültürü', 10]]
};

export const ALAN_ADI = {
  'AYT-SAY': 'Sayısal',
  'AYT-EA': 'Eşit Ağırlık',
  'AYT-SOZ': 'Sözel'
};

export const MAXMAP = {};
Object.entries(DERS_TANIM).forEach(([k, arr]) => {
  const base = k.startsWith('AYT') ? 'AYT' : k;
  if (!MAXMAP[base]) MAXMAP[base] = {};
  arr.forEach(([d, m]) => {
    MAXMAP[base][d] = Math.max(MAXMAP[base][d] || 0, m);
  });
});

export function dersMax(tur, ders) {
  return (MAXMAP[tur] && MAXMAP[tur][ders]) || null;
}

export const DERSLER = {
  TYT: DERS_TANIM['TYT'].map(x => x[0]),
  AYT: Object.keys(MAXMAP['AYT']),
  LGS: DERS_TANIM['LGS'].map(x => x[0])
};

export const RENKLER = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316'
];

/* ═════ ORTALAMA VE HESAPLAMA YARDIMCILARI ═════ */
export function dersSinifOrt(denemeId, ders, sinifId) {
  let rows = DB.sonuclar.filter(s => s.denemeId === denemeId && s.ders === ders);
  if (sinifId) {
    const ids = DB.ogrenciler.filter(o => o.sinifId === sinifId).map(o => o.id);
    rows = rows.filter(s => ids.includes(s.ogrenciId));
  }
  if (rows.length === 0) return null;
  return Math.round((rows.reduce((a, s) => a + s.net, 0) / rows.length) * 100) / 100;
}

export function denemeSinifOrt(denemeId, sinifId) {
  let rows = DB.sonuclar.filter(s => s.denemeId === denemeId);
  if (sinifId) {
    const ids = DB.ogrenciler.filter(o => o.sinifId === sinifId).map(o => o.id);
    rows = rows.filter(s => ids.includes(s.ogrenciId));
  }
  if (rows.length === 0) return null;
  const byO = {};
  rows.forEach(s => {
    byO[s.ogrenciId] = (byO[s.ogrenciId] || 0) + s.net;
  });
  const tot = Object.values(byO);
  return Math.round((tot.reduce((a, b) => a + b, 0) / tot.length) * 100) / 100;
}

export function ogrenciGirdiMi(ogrenciId, denemeId) {
  return DB.sonuclar.some(s => s.ogrenciId === ogrenciId && s.denemeId === denemeId);
}

export function ogrenciDenemeToplam(ogrenciId, denemeId) {
  const rows = DB.sonuclar.filter(s => s.ogrenciId === ogrenciId && s.denemeId === denemeId);
  if (!rows.length) return null;
  return Math.round(rows.reduce((a, s) => a + s.net, 0) * 100) / 100;
}

export function ogrenciDenemeleri(ogrenciId) {
  const ids = [...new Set(DB.sonuclar.filter(s => s.ogrenciId === ogrenciId).map(s => s.denemeId))];
  return ids.map(id => DB.denemeler.find(d => d.id === id)).filter(Boolean).sort((a, b) => a.tarih.localeCompare(b.tarih));
}

export function ogrenciDersNet(ogrenciId, denemeId, ders) {
  const s = DB.sonuclar.find(x => x.ogrenciId === ogrenciId && x.denemeId === denemeId && x.ders === ders);
  return s ? s.net : null;
}

export function denemeBulVeyaOlustur(ad, tur, tarih) {
  const mevcut = DB.denemeler.find(d => d.ad.trim().toLowerCase() === ad.trim().toLowerCase());
  if (mevcut) return { deneme: mevcut, yeni: false };
  const d = { id: nid(), ad: ad.trim(), tur, tarih };
  DB.denemeler.push(d);
  return { deneme: d, yeni: true };
}
