/* ══════════════════════════════════════════════════════
   Öğrenci Takip Sistemi — Öğrenciler Modülü
   ══════════════════════════════════════════════════════ */

import {
  DB, saveDB, nid, sinifAdi, ogrenciDenemeleri,
  ogrenciDenemeToplam, denemeSinifOrt, dersSinifOrt, netHesapla
} from '../state.js';
import { $, toast, fmtTarih, cizgiGrafik, promptKopyala } from '../utils.js';

let OGR_EDIT_ACIK = null;
let DUZENLE_AKTIF = null;

let onUpdateSelectsCallback = null;
export function setSelectUpdateCallback(cb) {
  onUpdateSelectsCallback = cb;
}
function notifySelects() {
  if (onUpdateSelectsCallback) onUpdateSelectsCallback();
}

/* ═════ ÖĞRENCİ TEKLİ İŞLEMLER ═════ */
export function ogrenciKaydet() {
  const ad = $('ogrAd').value.trim();
  const sid = Number($('ogrSinif').value);
  const eid = Number($('ogrEditId').value);

  if (!ad || !sid) {
    toast('Ad ve sınıf zorunlu', false);
    return;
  }

  if (eid) {
    const o = DB.ogrenciler.find(x => x.id === eid);
    if (o) {
      o.adSoyad = ad;
      o.sinifId = sid;
      o.veli = $('ogrVeli').value.trim();
      toast('Güncellendi');
    }
  } else {
    if (DB.ogrenciler.find(o => o.adSoyad.toLowerCase() === ad.toLowerCase())) {
      toast('Bu öğrenci zaten kayıtlı', false);
      return;
    }
    DB.ogrenciler.push({
      id: nid(),
      adSoyad: ad,
      sinifId: sid,
      alan: '',
      veli: $('ogrVeli').value.trim()
    });
    toast('Eklendi');
  }

  saveDB();
  ogrenciIptal();
  notifySelects();
  renderOgrenciler();
}

export function ogrenciDuzenle(id, ev) {
  if (ev) ev.stopPropagation();
  const o = DB.ogrenciler.find(x => x.id === id);
  if (!o) return;

  if (OGR_EDIT_ACIK && OGR_EDIT_ACIK !== id) {
    const e = $('ogrEditSatir_' + OGR_EDIT_ACIK);
    if (e) e.innerHTML = '';
  }

  const panel = $('ogrEditSatir_' + id);
  if (!panel) return;

  if (OGR_EDIT_ACIK === id) {
    panel.innerHTML = '';
    OGR_EDIT_ACIK = null;
    return;
  }

  OGR_EDIT_ACIK = id;
  const sinifOpts = DB.siniflar.map(sn => `
    <option value="${sn.id}" ${sn.id === o.sinifId ? 'selected' : ''}>${sn.ad}</option>
  `).join('');

  panel.innerHTML = `
    <div class="card" style="margin:0 0 8px;border:2px solid var(--indigo);padding:12px">
      <div class="flex" style="justify-content:space-between">
        <b style="font-size:13px;color:var(--indigo)">✏️ Öğrenci Düzenle</b>
        <button class="btn gray sm" onclick="window.ogrEditKapat(${id})">✕</button>
      </div>
      <div class="grid-2" style="margin-top:8px">
        <div class="field"><label>Ad Soyad *</label><input id="ogrEditAd_${id}" value="${(o.adSoyad || '').replace(/"/g, '&quot;')}"></div>
        <div class="field"><label>Sınıf *</label><select id="ogrEditSinif_${id}">${sinifOpts}</select></div>
        <div class="field" style="grid-column:1/-1"><label>Veli Bilgisi / Telefon</label><input id="ogrEditVeli_${id}" value="${(o.veli || '').replace(/"/g, '&quot;')}"></div>
      </div>
      <button class="btn green sm" onclick="window.ogrEditKaydet(${id})">💾 Kaydet</button>
    </div>
  `;
}

export function ogrEditKapat(id) {
  const e = $('ogrEditSatir_' + id);
  if (e) e.innerHTML = '';
  OGR_EDIT_ACIK = null;
}

export function ogrEditKaydet(id) {
  const o = DB.ogrenciler.find(x => x.id === id);
  if (!o) return;
  const ad = $('ogrEditAd_' + id).value.trim();
  const sid = Number($('ogrEditSinif_' + id).value);

  if (!ad || !sid) {
    toast('Ad ve sınıf zorunlu', false);
    return;
  }

  o.adSoyad = ad;
  o.sinifId = sid;
  o.veli = $('ogrEditVeli_' + id).value.trim();

  saveDB();
  OGR_EDIT_ACIK = null;
  notifySelects();
  renderOgrenciler();
  toast('Güncellendi');
}

export function ogrenciIptal() {
  $('ogrEditId').value = '';
  $('ogrAd').value = '';
  $('ogrSinif').value = '';
  $('ogrVeli').value = '';
  $('ogrenciFormBaslik').textContent = '➕ Yeni Öğrenci Ekle';
  $('ogrKaydetBtn').textContent = '➕ Ekle';
  $('ogrIptalBtn').classList.add('hidden');
}

export function ogrenciSil(id, ad, ev) {
  if (ev) ev.stopPropagation();
  if (!confirm(`"${ad}" silinsin mi?`)) return;

  DB.ogrenciler = DB.ogrenciler.filter(o => o.id !== id);
  DB.sonuclar = DB.sonuclar.filter(s => s.ogrenciId !== id);
  DB.haftalik = DB.haftalik.filter(h => h.ogrenciId !== id);

  saveDB();
  notifySelects();
  renderOgrenciler();
  const detay = $('ogrenciDetay');
  if (detay) detay.innerHTML = '';
  toast('Silindi');
}

export function renderOgrenciler() {
  const f = Number($('filtreSinif').value) || 0;
  const list = f ? DB.ogrenciler.filter(o => o.sinifId === f) : DB.ogrenciler;
  const container = $('ogrenciListesi');
  if (!container) return;

  if (!list.length) {
    container.innerHTML = '<div class="empty">Henüz öğrenci yok.</div>';
    ogrTopluAksiyonGuncelle();
    return;
  }

  container.innerHTML = list.map(o => {
    const dn = ogrenciDenemeleri(o.id).length;
    return `
      <div class="row">
        <label class="chk-wrap" style="margin:0">
          <input type="checkbox" value="${o.id}" onclick="event.stopPropagation(); window.ogrTopluAksiyonGuncelle()">
        </label>
        <div class="flex" style="flex:1;cursor:pointer" onclick="window.ogrenciDetayGoster(${o.id})">
          <span class="badge" style="background:#ecfdf5;color:var(--emerald)">👩‍🎓</span>
          <div>
            <b>${o.adSoyad}</b>
            <div class="muted" style="font-size:11px">
              ${sinifAdi(o.sinifId)}${o.veli ? ' • ' + o.veli : ''} • ${dn} deneme
            </div>
          </div>
        </div>
        <div class="flex">
          <button class="btn sm gray" onclick="window.ogrenciDuzenle(${o.id}, event)">✏️</button>
          <button class="btn sm red" onclick="window.ogrenciSil(${o.id}, '${o.adSoyad.replace(/'/g, "\\'")}', event)">🗑️</button>
        </div>
      </div>
      <div id="ogrEditSatir_${o.id}"></div>
    `;
  }).join('');

  ogrTopluAksiyonGuncelle();
}

export function ogrTopluAksiyonGuncelle() {
  const cbx = document.querySelectorAll('#ogrenciListesi input[type="checkbox"]:checked');
  const n = cbx.length;
  const aksiyon = $('ogrTopluAksiyon');
  if (!aksiyon) return;

  if (n > 0) {
    aksiyon.classList.remove('hidden');
    $('ogrSecilenSayi').textContent = n;
  } else {
    aksiyon.classList.add('hidden');
  }

  const tSel = $('ogrTasimaSinif');
  if (tSel) {
    tSel.innerHTML = DB.siniflar.map(s => `<option value="${s.id}">${s.ad}</option>`).join('');
  }
}

export function ogrenciSecTumu() {
  document.querySelectorAll('#ogrenciListesi input[type="checkbox"]').forEach(c => c.checked = true);
  ogrTopluAksiyonGuncelle();
}

export function ogrenciSecTemizle() {
  document.querySelectorAll('#ogrenciListesi input[type="checkbox"]').forEach(c => c.checked = false);
  ogrTopluAksiyonGuncelle();
}

export function ogrenciSecilenleri() {
  return [...document.querySelectorAll('#ogrenciListesi input[type="checkbox"]:checked')].map(c => Number(c.value));
}

export function ogrenciTopluSil() {
  const ids = ogrenciSecilenleri();
  if (!ids.length) { toast('Seçili öğrenci yok', false); return; }
  if (!confirm(`${ids.length} öğrenci silinsin mi? Tüm deneme kayıtları da silinir.`)) return;

  ids.forEach(id => {
    DB.ogrenciler = DB.ogrenciler.filter(o => o.id !== id);
    DB.sonuclar = DB.sonuclar.filter(s => s.ogrenciId !== id);
    DB.haftalik = DB.haftalik.filter(h => h.ogrenciId !== id);
  });

  saveDB();
  notifySelects();
  renderOgrenciler();
  const detay = $('ogrenciDetay');
  if (detay) detay.innerHTML = '';
  toast(`${ids.length} öğrenci silindi`);
}

export function ogrenciTasi() {
  const ids = ogrenciSecilenleri();
  const yeniSinifId = Number($('ogrTasimaSinif').value) || 0;
  if (!ids.length) { toast('Seçili öğrenci yok', false); return; }
  if (!yeniSinifId) { toast('Hedef sınıf seçilmedi', false); return; }

  const yeniAd = sinifAdi(yeniSinifId);
  if (!confirm(`${ids.length} öğrenci "${yeniAd}" sınıfına taşınsın mı?`)) return;

  ids.forEach(id => {
    const o = DB.ogrenciler.find(x => x.id === id);
    if (o) o.sinifId = yeniSinifId;
  });

  saveDB();
  notifySelects();
  renderOgrenciler();
  toast(`${ids.length} öğrenci "${yeniAd}" sınıfına taşındı`);
}

/* ═════ ÖĞRENCİ DETAY PANELİ ═════ */
export function ogrenciDetayGoster(id) {
  const o = DB.ogrenciler.find(x => x.id === id);
  if (!o) return;
  const el = $('ogrenciDetay');
  if (!el) return;

  const sinifOgrIds = DB.ogrenciler.filter(x => x.sinifId === o.sinifId).map(x => x.id);
  const sinifDenemeIds = new Set(DB.sonuclar.filter(s => sinifOgrIds.includes(s.ogrenciId)).map(s => s.denemeId));
  const denemeler = [...sinifDenemeIds]
    .map(did => DB.denemeler.find(d => d.id === did))
    .filter(Boolean)
    .sort((a, b) => a.tarih.localeCompare(b.tarih));

  if (!denemeler.length) {
    el.innerHTML = `
      <div class="card">
        <h2>📊 ${o.adSoyad}</h2>
        <div class="empty">Bu öğrenci için henüz deneme verisi yok.</div>
      </div>
    `;
    el.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  const chkOzet = `chk_ozet_${id}`;
  const chkTurler = {};
  ['TYT', 'AYT', 'LGS'].forEach(t => { chkTurler[t] = `chk_${t}_${id}`; });

  let h = `
    <div class="card">
      <div class="flex" style="justify-content:space-between;flex-wrap:wrap;gap:8px">
        <h2 style="margin:0">📊 ${o.adSoyad} — Detay Analiz</h2>
        <div class="flex">
          <button class="btn green sm" onclick="window.ogrenciDetayPDF(${id})">📄 PDF İndir</button>
          <button class="btn gray sm" onclick="$('ogrenciDetay').innerHTML=''">Kapat</button>
        </div>
      </div>
      <div class="grid-2 mt-3">
        <div class="stat"><div class="v">${sinifAdi(o.sinifId)}</div><div class="l">Sınıf</div></div>
        <div class="stat" style="background:#fffbeb"><div class="v" style="color:var(--amber);font-size:12px">${o.veli || '—'}</div><div class="l">Veli / Telefon</div></div>
      </div>
      <div style="margin:12px 0;padding:10px;background:#f8fafc;border-radius:8px;border:1px solid var(--border)">
        <b style="font-size:12px;color:var(--indigo)">📋 Rapor'a Dahil Et:</b>
        <label class="chk-wrap"><input type="checkbox" id="${chkOzet}" checked> Deneme Özetleri</label>
        <label class="chk-wrap"><input type="checkbox" id="chk_combo_${id}" checked> TYT/AYT Grafiği</label>
        <label class="chk-wrap"><input type="checkbox" id="chk_ders_${id}" checked> Ders Bazlı Gelişim</label>
        <label class="chk-wrap"><input type="checkbox" id="${chkTurler.TYT}" checked> TYT Analizi</label>
        <label class="chk-wrap"><input type="checkbox" id="${chkTurler.AYT}" checked> AYT Analizi</label>
        <label class="chk-wrap"><input type="checkbox" id="${chkTurler.LGS}" checked> LGS Analizi</label>
        <span class="muted" style="font-size:11px;margin-left:8px">Sadece işaretli bölümler PDF'e dahil edilir</span>
      </div>
  `;

  const ozetDenemeler = [...denemeler].sort((a, b) => b.tarih.localeCompare(a.tarih));
  h += `
    <details id="${chkOzet}_div" style="margin-top:14px;border:1px solid var(--border);border-radius:10px;overflow:hidden">
      <summary style="cursor:pointer;padding:10px 12px;background:#f8fafc;font-size:14px;font-weight:600;list-style:none;display:flex;justify-content:space-between;align-items:center">
        <span>🧾 Deneme Özetleri <span class="muted" style="font-size:11px;font-weight:400">(satıra tıklayarak netleri düzenleyin)</span></span>
        <span style="font-size:11px;color:var(--muted)">▼ aç / kapat</span>
      </summary>
      <div style="padding:12px">
  `;

  const tytDen = ozetDenemeler.filter(d => d.tur === 'TYT');
  const aytDen = ozetDenemeler.filter(d => d.tur === 'AYT');
  const digDen = ozetDenemeler.filter(d => d.tur !== 'TYT' && d.tur !== 'AYT');

  function rOzet(liste, baslik, turEt) {
    if (!liste.length) return '';
    const netler = liste.map(d => ogrenciDenemeToplam(id, d.id)).filter(x => x !== null);
    const ortNet = netler.length ? netler.reduce((a, b) => a + b, 0) / netler.length : 0;
    const girilen = netler.length;
    const toplam = liste.length;
    const ortEt = turEt
      ? `<span style="margin-left:8px;padding:2px 9px;border-radius:11px;background:#eef2ff;color:var(--indigo);font-size:11px;font-weight:600">${turEt} Ortalama Net: ${ortNet.toFixed(2)}</span>`
      : '';

    let t = `
      <h4 style="font-size:13px;margin:14px 0 6px;color:var(--indigo)">${baslik} <span class="muted" style="font-weight:400">(${girilen}/${toplam} denemeye girildi)</span>${ortEt}</h4>
      <div style="overflow-x:auto">
        <table class="table">
          <thead><tr><th>Deneme Adı</th><th>Tarih</th><th class="num">Toplam Net</th><th class="num">Sınıf Ort.</th><th class="num">Fark</th><th></th></tr></thead>
          <tbody>
    `;

    liste.forEach(d => {
      const on = ogrenciDenemeToplam(id, d.id);
      const so = denemeSinifOrt(d.id, o.sinifId);
      if (on === null) {
        t += `<tr style="opacity:0.6"><td style="font-weight:600">${d.ad}</td><td>${fmtTarih(d.tarih)}</td><td colspan="3" class="num muted" style="font-style:italic">Denemeye Girmedi</td><td class="num"></td></tr>`;
      } else {
        const fark = so === null ? null : Math.round((on - so) * 100) / 100;
        t += `
          <tr>
            <td style="font-weight:600">${d.ad}</td>
            <td>${fmtTarih(d.tarih)}</td>
            <td class="num mono">${on.toFixed(2)}</td>
            <td class="num mono muted">${so === null ? '—' : so.toFixed(2)}</td>
            <td class="num mono ${fark > 0 ? 'green' : fark < 0 ? 'red-c' : ''}">${fark === null ? '—' : (fark > 0 ? '+' : '') + fark.toFixed(2)}</td>
            <td class="num"><button class="btn sm gray" onclick="window.denemeSonucDuzenle(${id}, ${d.id})">✏️</button></td>
          </tr>
        `;
      }
    });
    t += '</tbody></table></div>';
    return t;
  }

  if (tytDen.length) h += rOzet(tytDen, '📘 TYT Denemeleri', 'TYT');
  if (aytDen.length) h += rOzet(aytDen, '📙 AYT Denemeleri', 'AYT');
  if (digDen.length) h += rOzet(digDen, '📕 Diğer Denemeleri', '');
  h += `<div id="denemeDuzenlePanel_${id}"></div></div></details>`;

  /* TYT / AYT Birleşik İlerleyiş Grafiği */
  const tytVar = denemeler.some(d => d.tur === 'TYT');
  const aytVar = denemeler.some(d => d.tur === 'AYT');
  if (tytVar || aytVar) {
    const comboMap = new Map();
    [...denemeler].sort((a, b) => a.tarih.localeCompare(b.tarih)).forEach(d => {
      if (d.tur !== 'TYT' && d.tur !== 'AYT') return;
      const t = fmtTarih(d.tarih);
      if (!comboMap.has(t)) comboMap.set(t, { tarih: t, __denemeAd: d.ad });
      const val = ogrenciDenemeToplam(id, d.id);
      if (val !== null) comboMap.get(t)[d.tur === 'TYT' ? 'TYT Net' : 'AYT Net'] = val;
    });

    const comboData = [...comboMap.values()];
    const comboKeys = [];
    if (tytVar) comboKeys.push('TYT Net');
    if (aytVar) comboKeys.push('AYT Net');

    h += `
      <details id="chk_combo_${id}_div" style="margin-top:12px;border:1px solid var(--border);border-radius:10px;overflow:hidden">
        <summary style="cursor:pointer;padding:10px 12px;background:#f8fafc;font-size:14px;font-weight:600;list-style:none;display:flex;justify-content:space-between;align-items:center">
          <span>📈 TYT / AYT İlerleyişini Gör (Birleşik Grafik)</span>
          <span style="font-size:11px;color:var(--muted)">▼ aç / kapat</span>
        </summary>
        <div style="padding:12px">${cizgiGrafik(comboData, comboKeys)}</div>
      </details>
    `;
  }

  /* Ders Bazlı Gelişim Raporu */
  const dersMap = new Map();
  denemeler.forEach(d => {
    const son = DB.sonuclar.filter(s => s.denemeId === d.id && s.ogrenciId === id);
    son.forEach(s => {
      if (!dersMap.has(s.ders)) dersMap.set(s.ders, { ders: s.ders, denemeler: [] });
      const onceki = dersMap.get(s.ders).denemeler.find(x => x.denemeId === d.id);
      if (!onceki) dersMap.get(s.ders).denemeler.push({ denemeId: d.id, tarih: d.tarih, ad: d.ad, net: s.net });
    });
  });

  if (dersMap.size) {
    h += `
      <details id="chk_ders_${id}_div" style="margin-top:12px;border:1px solid var(--border);border-radius:10px;overflow:hidden">
        <summary style="cursor:pointer;padding:10px 12px;background:#f8fafc;font-size:14px;font-weight:600;list-style:none;display:flex;justify-content:space-between;align-items:center">
          <span>📚 Ders Bazlı Gelişim Raporu</span>
          <span style="font-size:11px;color:var(--muted)">▼ aç / kapat</span>
        </summary>
        <div style="padding:12px">
          <div style="overflow-x:auto">
            <table class="table">
              <thead><tr><th>Ders</th><th class="num">İlk Net</th><th class="num">Son Net</th><th class="num">Net Δ</th><th class="num">%</th><th>Trend</th></tr></thead>
              <tbody>
    `;
    [...dersMap.values()].forEach(grup => {
      const sorted = grup.denemeler.sort((a, b) => a.tarih.localeCompare(b.tarih));
      const ilk = sorted[0].net, son = sorted[sorted.length - 1].net;
      const delta = Math.round((son - ilk) * 100) / 100;
      const yuzde = ilk === 0 ? (son > 0 ? 100 : 0) : Math.round(((delta / ilk) * 100) * 100) / 100;
      const trend = delta > 0 ? '📈 +' : delta < 0 ? '📉 ' : '➡️ ';
      h += `
        <tr>
          <td style="font-weight:600">${grup.ders}</td>
          <td class="num mono">${ilk.toFixed(2)}</td>
          <td class="num mono">${son.toFixed(2)}</td>
          <td class="num mono ${delta >= 0 ? 'green' : 'red-c'}">${delta >= 0 ? '+' : ''}${delta.toFixed(2)}</td>
          <td class="num mono ${yuzde >= 0 ? 'green' : 'red-c'}">${yuzde >= 0 ? '+' : ''}${yuzde.toFixed(1)}%</td>
          <td>${trend}${Math.abs(delta).toFixed(1)}</td>
        </tr>
      `;
    });
    h += '</tbody></table></div></div></details>';
  }

  /* Tür Bazında Analizler (TYT / AYT / LGS) */
  const turSirasi = ['TYT', 'AYT', 'LGS'];
  const mevcutTurler = turSirasi.filter(t => denemeler.some(d => d.tur === t));
  const turRenk = { TYT: 'var(--blue)', AYT: 'var(--indigo)', LGS: 'var(--amber)' };

  mevcutTurler.forEach(tur => {
    const turDenemeleri = denemeler.filter(d => d.tur === tur).sort((a, b) => a.tarih.localeCompare(b.tarih));
    if (!turDenemeleri.length) return;

    h += `
      <details id="${chkTurler[tur]}_div" style="margin-top:16px;border:2px solid var(--border);border-radius:12px;overflow:hidden">
        <summary style="cursor:pointer;padding:12px 14px;background:#f8fafc;font-size:15px;font-weight:700;color:${turRenk[tur]};list-style:none;display:flex;align-items:center;justify-content:space-between">
          <span>🎓 ${tur} Analizi <span class="muted" style="font-weight:400;font-size:12px">• ${turDenemeleri.length} deneme</span></span>
          <span style="font-size:12px;color:var(--muted)">▼ aç / kapat</span>
        </summary>
        <div style="padding:14px">
    `;

    const chartData = turDenemeleri.map(d => {
      const row = { tarih: fmtTarih(d.tarih), __denemeAd: d.ad };
      const on = ogrenciDenemeToplam(id, d.id);
      if (on !== null) row[o.adSoyad] = on;
      const so = denemeSinifOrt(d.id, o.sinifId);
      if (so !== null) row['Sınıf Ortalaması'] = so;
      return row;
    });

    h += `<h4 style="font-size:13px;margin:12px 0 6px">📈 ${tur} Toplam Net Gelişimi (Sınıf Ortalamasıyla)</h4>`;
    h += cizgiGrafik(chartData, [o.adSoyad, 'Sınıf Ortalaması']);

    const son3 = turDenemeleri.slice(-3);
    h += `<h4 style="font-size:13px;margin:16px 0 6px">🎯 ${tur} — Son ${son3.length} Deneme — Sınıf Ortalamasına Göre Konum</h4>`;
    h += '<div style="overflow-x:auto"><table class="table"><thead><tr><th>Deneme</th><th>Tarih</th><th class="num">Öğrenci Net</th><th class="num">Sınıf Ort.</th><th class="num">Fark</th><th>Durum</th></tr></thead><tbody>';

    son3.forEach(d => {
      const on = ogrenciDenemeToplam(id, d.id);
      const so = denemeSinifOrt(d.id, o.sinifId);
      if (on === null) {
        h += `<tr style="opacity:0.6"><td>${d.ad}</td><td>${fmtTarih(d.tarih)}</td><td colspan="4" class="num muted" style="font-style:italic">Denemeye Girmedi</td></tr>`;
        return;
      }
      if (so === null) {
        h += `<tr><td>${d.ad}</td><td>${fmtTarih(d.tarih)}</td><td class="num mono">${on.toFixed(2)}</td><td class="num muted">—</td><td class="num muted">—</td><td class="muted">Karşılaştırma yok</td></tr>`;
        return;
      }
      const fark = Math.round((on - so) * 100) / 100;
      const cls = fark > 0 ? 'up' : fark < 0 ? 'down' : 'eq';
      const txt = fark > 0 ? '▲ Sınıf ortalamasının ÜSTÜNDE' : fark < 0 ? '▼ Sınıf ortalamasının ALTINDA' : '● Ortalama ile aynı';
      h += `
        <tr>
          <td style="font-weight:600">${d.ad}</td>
          <td>${fmtTarih(d.tarih)}</td>
          <td class="num mono">${on.toFixed(2)}</td>
          <td class="num mono muted">${so.toFixed(2)}</td>
          <td class="num mono ${fark > 0 ? 'green' : fark < 0 ? 'red-c' : ''}">${fark > 0 ? '+' : ''}${fark.toFixed(2)}</td>
          <td><span class="pillbad ${cls}">${txt}</span></td>
        </tr>
      `;
    });
    h += '</tbody></table></div>';

    h += `<h4 style="font-size:13px;margin:16px 0 6px">📚 ${tur} — Son ${son3.length} Deneme — Ders Bazlı Başarı</h4>`;
    const turDers = [...new Set(DB.sonuclar.filter(s => s.ogrenciId === id && son3.some(d => d.id === s.denemeId)).map(s => s.ders))];
    if (!turDers.length) {
      h += '<p class="muted" style="font-size:12px">Ders verisi yok.</p>';
    } else {
      h += '<div style="overflow-x:auto"><table class="table"><thead><tr><th>Ders</th>';
      son3.forEach(d => {
        h += `<th class="num">${fmtTarih(d.tarih)}<br><span style="font-weight:400;font-size:10px">${d.ad.substring(0, 16)}</span></th>`;
      });
      h += '<th class="num">Sınıf Ort. (son)</th><th>Durum</th></tr></thead><tbody>';

      turDers.forEach(ders => {
        h += `<tr><td style="font-weight:600">${ders}</td>`;
        son3.forEach(d => {
          const s = DB.sonuclar.find(x => x.ogrenciId === id && x.denemeId === d.id && x.ders === ders);
          h += `<td class="num mono">${s ? s.net.toFixed(2) : '—'}</td>`;
        });
        const sonD = son3[son3.length - 1];
        const sOrt = dersSinifOrt(sonD.id, ders, o.sinifId);
        const sOgr = DB.sonuclar.find(x => x.ogrenciId === id && x.denemeId === sonD.id && x.ders === ders);
        if (sOrt === null || !sOgr) {
          h += '<td class="num muted">—</td><td class="muted">—</td>';
        } else {
          const fk = Math.round((sOgr.net - sOrt) * 100) / 100;
          const cl = fk > 0 ? 'up' : fk < 0 ? 'down' : 'eq';
          h += `<td class="num mono muted">${sOrt.toFixed(2)}</td><td><span class="pillbad ${cl}">${fk > 0 ? '▲ +' + fk.toFixed(2) : fk < 0 ? '▼ ' + fk.toFixed(2) : '● 0'}</span></td>`;
        }
        h += '</tr>';
      });
      h += '</tbody></table></div>';
    }
    h += '</div></details>';
  });

  h += '</div>';
  el.innerHTML = h;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function denemeSonucDuzenle(ogrenciId, denemeId) {
  const panel = $(`denemeDuzenlePanel_${ogrenciId}`);
  if (!panel) return;

  if (DUZENLE_AKTIF === `${ogrenciId}_${denemeId}`) {
    panel.innerHTML = '';
    DUZENLE_AKTIF = null;
    return;
  }
  DUZENLE_AKTIF = `${ogrenciId}_${denemeId}`;

  const dn = DB.denemeler.find(d => d.id === denemeId);
  if (!dn) return;
  const sonuclar = DB.sonuclar.filter(s => s.denemeId === denemeId && s.ogrenciId === ogrenciId);

  let h = `
    <div class="card" style="margin-top:10px;border:2px solid var(--indigo)">
      <div class="flex" style="justify-content:space-between">
        <h3 style="margin:0;font-size:14px;color:var(--indigo)">✏️ ${dn.ad} — Netleri Düzenle <span class="muted" style="font-weight:400">(${dn.tur} • ${fmtTarih(dn.tarih)})</span></h3>
        <button class="btn gray sm" onclick="$('denemeDuzenlePanel_${ogrenciId}').innerHTML=''; window.DUZENLE_AKTIF=null">✕ Kapat</button>
      </div>
      <div style="overflow-x:auto;margin-top:8px">
        <table class="table">
          <thead><tr><th>Ders</th><th class="num">Doğru</th><th class="num">Yanlış</th><th class="num">Boş</th><th class="num">Net</th></tr></thead>
          <tbody>
  `;

  sonuclar.forEach(s => {
    h += `
      <tr>
        <td style="font-weight:600">${s.ders}</td>
        <td class="num"><input type="number" min="0" value="${s.dogru}" id="dz_${s.id}_d" style="width:60px;text-align:center" oninput="window.dzNet(${s.id}, '${dn.tur}')"></td>
        <td class="num"><input type="number" min="0" value="${s.yanlis}" id="dz_${s.id}_y" style="width:60px;text-align:center" oninput="window.dzNet(${s.id}, '${dn.tur}')"></td>
        <td class="num"><input type="number" min="0" value="${s.bos || 0}" id="dz_${s.id}_b" style="width:60px;text-align:center"></td>
        <td class="num mono" id="dz_${s.id}_n" style="color:var(--indigo)">${s.net.toFixed(2)}</td>
      </tr>
    `;
  });

  h += `
          </tbody>
        </table>
      </div>
      <div class="flex mt-3">
        <button class="btn green sm" onclick="window.denemeSonucKaydet(${ogrenciId}, ${denemeId})">💾 Değişiklikleri Kaydet</button>
      </div>
    </div>
  `;

  panel.innerHTML = h;
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

export function dzNet(sonucId, tur) {
  const d = Number($(`dz_${sonucId}_d`).value) || 0;
  const y = Number($(`dz_${sonucId}_y`).value) || 0;
  $(`dz_${sonucId}_n`).textContent = netHesapla(tur, d, y).toFixed(2);
}

export function denemeSonucKaydet(ogrenciId, denemeId) {
  const dn = DB.denemeler.find(d => d.id === denemeId);
  if (!dn) return;
  const sonuclar = DB.sonuclar.filter(s => s.denemeId === denemeId && s.ogrenciId === ogrenciId);

  sonuclar.forEach(s => {
    const d = Number($(`dz_${s.id}_d`).value) || 0;
    const y = Number($(`dz_${s.id}_y`).value) || 0;
    const b = Number($(`dz_${s.id}_b`).value) || 0;
    s.dogru = d;
    s.yanlis = y;
    s.bos = b;
    s.net = netHesapla(dn.tur, d, y);
  });

  saveDB();
  DUZENLE_AKTIF = null;
  toast('Netler güncellendi');
  ogrenciDetayGoster(ogrenciId);
}

export function ogrenciDetayPDF(id) {
  const o = DB.ogrenciler.find(x => x.id === id);
  if (!o) return;
  const detayEl = $('ogrenciDetay');
  if (!detayEl || !detayEl.innerHTML.trim()) { toast('Önce öğrenci detayını açın', false); return; }

  const chkOzetEl = $('chk_ozet_' + id);
  const chkComboEl = $('chk_combo_' + id);
  const chkDersEl = $('chk_ders_' + id);
  const chkT = {};
  ['TYT', 'AYT', 'LGS'].forEach(t => { const c = $('chk_' + t + '_' + id); chkT[t] = c ? c.checked : true; });

  const ozetOk = chkOzetEl ? chkOzetEl.checked : true;
  const comboOk = chkComboEl ? chkComboEl.checked : true;
  const dersOk = chkDersEl ? chkDersEl.checked : true;

  const gizlenen = [];
  const gizle = (el) => { if (el) { gizlenen.push([el, el.style.display]); el.style.display = 'none'; } };
  if (!ozetOk) gizle($('chk_ozet_' + id + '_div'));
  if (!comboOk) gizle($('chk_combo_' + id + '_div'));
  if (!dersOk) gizle($('chk_ders_' + id + '_div'));
  ['TYT', 'AYT', 'LGS'].forEach(t => { if (!chkT[t]) gizle($('chk_' + t + '_' + id + '_div')); });

  const kapaliDetails = [...detayEl.querySelectorAll('details:not([open])')];
  kapaliDetails.forEach(d => d.open = true);

  const tmp = document.createElement('div');
  tmp.id = 'tmpPDFBaslik';
  tmp.innerHTML = `
    <div style="text-align:center;margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid #4f46e5">
      <h1 style="font-size:22px;color:#4f46e5">🎓 ${o.adSoyad} — Öğrenci Gelişim Raporu</h1>
      <p style="font-size:13px;color:#64748b">${sinifAdi(o.sinifId)}${o.veli ? ' • Veli: ' + o.veli : ''} • ${new Date().toLocaleString('tr-TR')}</p>
    </div>
  `;
  detayEl.insertBefore(tmp, detayEl.firstChild);

  document.body.classList.add('print-ogrenci');
  document.title = o.adSoyad + ' - ' + new Date().toISOString().split('T')[0];

  const temizle = () => {
    document.body.classList.remove('print-ogrenci');
    document.title = 'Öğrenci Takip Sistemi';
    tmp.remove();
    gizlenen.forEach(([el, v]) => { el.style.display = v; });
    kapaliDetails.forEach(d => d.open = false);
  };
  const afterPrint = () => {
    temizle();
    window.removeEventListener('afterprint', afterPrint);
  };
  window.addEventListener('afterprint', afterPrint);

  toast('Yazdırma penceresi açılıyor — "PDF olarak kaydet" seçin');
  setTimeout(() => {
    window.print();
    setTimeout(() => {
      if (document.body.classList.contains('print-ogrenci')) temizle();
    }, 1500);
  }, 250);
}

/* ═════ ÖĞRENCİ TOPLU GİRİŞİ (AI PROMPT PARSER) ═════ */
export function parseTopluOgrenci(text) {
  const ln = text.split(/\r?\n/);
  const out = [];
  let cur = null;

  const ekleVeli = (c, v) => {
    v = v.trim();
    if (!v) return;
    c.veli = c.veli ? (c.veli + ' / ' + v) : v;
  };

  for (const raw of ln) {
    const s = raw.trim();
    if (!s) {
      if (cur && cur.ad) out.push(cur);
      cur = null;
      continue;
    }
    const mA = s.match(/^Öğrenci\s*Ad[ıi]?\s*:\s*(.+)/i);
    const mS = s.match(/^S[ıi]n[ıi]f[ıi]?\s*:\s*(.+)/i);
    const mV = s.match(/^(?:Veli(?:\s*(?:Ad[ıi]|Bilgisi|Telefon(?:\s*No)?|No|Numaras[ıi]))?|Telefon(?:\s*No)?|Numara|Tel)\s*[\/:]*\s*(?:Telefon\s*)?(?:No\.?)?\s*:\s*(.+)/i);

    if (mA) {
      if (cur && cur.ad) out.push(cur);
      cur = { ad: mA[1].trim(), sinif: '', veli: '' };
    } else if (mS && cur) {
      cur.sinif = mS[1].trim();
    } else if (mV && cur) {
      ekleVeli(cur, mV[1]);
    }
  }

  if (cur && cur.ad) out.push(cur);
  return out;
}

export function topluOgrKaydet() {
  const t = $('topluOgrMetin').value.trim();
  if (!t) { toast('Metin boş', false); return; }

  const p = parseTopluOgrenci(t);
  if (!p.length) { toast('Öğrenci bulunamadı', false); return; }

  let ek = 0, dup = 0, yeniSinif = 0;
  for (const x of p) {
    if (DB.ogrenciler.find(o => o.adSoyad.toLowerCase() === x.ad.toLowerCase())) {
      dup++;
      continue;
    }
    let sid = 0;
    if (x.sinif) {
      let s = DB.siniflar.find(y => y.ad.toLowerCase() === x.sinif.toLowerCase());
      if (!s) {
        s = { id: nid(), ad: x.sinif };
        DB.siniflar.push(s);
        yeniSinif++;
      }
      sid = s.id;
    } else if (DB.siniflar.length) {
      sid = DB.siniflar[0].id;
    } else {
      const s = { id: nid(), ad: 'Genel' };
      DB.siniflar.push(s);
      yeniSinif++;
      sid = s.id;
    }

    DB.ogrenciler.push({
      id: nid(),
      adSoyad: x.ad,
      sinifId: sid,
      alan: '',
      veli: x.veli
    });
    ek++;
  }

  saveDB();
  notifySelects();

  let msg = `✅ ${ek} öğrenci eklendi`;
  if (yeniSinif) msg += ` • ${yeniSinif} sınıf otomatik oluşturuldu`;
  if (dup) msg += ` • ${dup} mükerrer atlandı`;

  $('topluOgrSonuc').innerHTML = `
    <div class="alert ok">${msg}</div>
    <div class="mt-3">
      ${p.map(x => `
        <div class="row" style="padding:7px 10px">
          <b>${x.ad}</b>
          <span class="muted" style="font-size:12px">${x.sinif || '—'}${x.veli ? ' • ' + x.veli : ''}</span>
        </div>
      `).join('')}
    </div>
  `;

  toast(`${ek} öğrenci eklendi`);
}
