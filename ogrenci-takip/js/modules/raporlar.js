/* ══════════════════════════════════════════════════════
   Öğrenci Takip Sistemi — Raporlar Modülü
   ══════════════════════════════════════════════════════ */

import { DB, sinifAdi, ogrenciDersNet, RENKLER } from '../state.js';
import { $, toast, fmtTarih, ogrenciAdi, cizgiGrafik } from '../utils.js';

let RAPOR_DURUM = null;

export function doldurRaporFiltreleri() {
  const sinifSel = $('raporSinifFiltre');
  if (sinifSel) {
    const curVal = sinifSel.value;
    sinifSel.innerHTML = '<option value="">Tüm Sınıflar</option>' + DB.siniflar.map(s => `
      <option value="${s.id}" ${String(s.id) === String(curVal) ? 'selected' : ''}>${s.ad}</option>
    `).join('');
  }

  const ogrSel = $('raporOgrenciSelect');
  if (ogrSel) {
    ogrSel.innerHTML = DB.ogrenciler.map(o => `
      <option value="${o.id}">${o.adSoyad} (${sinifAdi(o.sinifId)})</option>
    `).join('');
  }
}

export function raporSinifSecildi(sinifId) {
  const ogrSel = $('raporOgrenciSelect');
  if (!ogrSel) return;
  if (!sinifId) {
    [...ogrSel.options].forEach(o => o.selected = false);
    return;
  }
  const sinifOgrIds = new Set(DB.ogrenciler.filter(o => String(o.sinifId) === String(sinifId)).map(o => String(o.id)));
  [...ogrSel.options].forEach(o => {
    o.selected = sinifOgrIds.has(String(o.value));
  });
}

  const ds = new Set();
  DB.sonuclar.forEach(s => ds.add(s.ders));
  (DB.konular || []).forEach(k => { if (k.ders) ds.add(k.ders); });

  const dersSel = $('raporDersSelect');
  if (dersSel) {
    dersSel.innerHTML = [...ds].sort().map(d => `<option value="${d}">${d}</option>`).join('');
  }

  const turF = $('raporTur') ? $('raporTur').value : '';
  let gelisimPool = [...DB.denemeler];
  if (turF) gelisimPool = gelisimPool.filter(d => d.tur === turF);

  const tytPool = gelisimPool.filter(d => d.tur === 'TYT').sort((a, b) => b.tarih.localeCompare(a.tarih));
  const aytPool = gelisimPool.filter(d => d.tur === 'AYT').sort((a, b) => b.tarih.localeCompare(a.tarih));

  const gTyt = $('raporGelisimTYT');
  if (gTyt) gTyt.innerHTML = tytPool.map(d => `<option value="${d.id}">${fmtTarih(d.tarih)} • ${d.ad}</option>`).join('');

  const gAyt = $('raporGelisimAYT');
  if (gAyt) gAyt.innerHTML = aytPool.map(d => `<option value="${d.id}">${fmtTarih(d.tarih)} • ${d.ad}</option>`).join('');
}

export function dersSecTumu() {
  [...$('raporDersSelect').options].forEach(o => o.selected = true);
}
export function dersSecTemizle() {
  [...$('raporDersSelect').options].forEach(o => o.selected = false);
}
export function ogrSecTumu() {
  [...$('raporOgrenciSelect').options].forEach(o => o.selected = true);
}
export function ogrSecTemizle() {
  [...$('raporOgrenciSelect').options].forEach(o => o.selected = false);
}
export function gelisimSec(tur) {
  [...$('raporGelisim' + tur).options].forEach((o, i) => o.selected = i < 10);
}
export function gelisimTemizle(tur) {
  [...$('raporGelisim' + tur).options].forEach(o => o.selected = false);
}

export function seciliGelisimDenemeleri() {
  const turF = $('raporTur').value;
  let denPool = DB.denemeler.slice();
  if (turF) denPool = denPool.filter(d => d.tur === turF);

  let ids = [
    ...[...$('raporGelisimTYT').selectedOptions].map(o => Number(o.value)),
    ...[...$('raporGelisimAYT').selectedOptions].map(o => Number(o.value))
  ].filter(Boolean);

  if (ids.length === 0) {
    ids = [...denPool].sort((a, b) => b.tarih.localeCompare(a.tarih)).slice(0, 20).map(d => d.id);
  }

  if (ids.length > 20) {
    ids = ids.slice(0, 20);
    toast('Gelişim analizi en fazla 20 deneme ile sınırlandı', false);
  }

  return ids.map(id => DB.denemeler.find(d => d.id === id)).filter(Boolean).sort((a, b) => a.tarih.localeCompare(b.tarih));
}

export function renderGelisimAnalizi(denemeler, ogrIds, dersF, gelisimGoster, dersIlerleyisGoster) {
  const el = $('raporGelisimAnaliz');
  if (!el) return;

  el.innerHTML = '';
  el.classList.add('hidden');

  if (!gelisimGoster && !dersIlerleyisGoster) return;

  if (!denemeler || denemeler.length < 2) {
    el.innerHTML = `
      <div class="card" style="padding:14px;background:#f8fafc;border:1px solid var(--border);border-radius:12px;font-size:12.5px;color:var(--muted)">
        ℹ️ <b>Gelişim / Düşüş Analizi:</b> Zaman içindeki net değişimini ve ilerleme grafiğini görüntülemek için en az 2 deneme sonucu gereklidir (Şu an değerlendirilen ${denemeler ? denemeler.length : 0} deneme bulundu).
      </div>
    `;
    el.classList.remove('hidden');
    return;
  }

  const denIds = new Set(denemeler.map(d => d.id));
  let ogrenciIds = ogrIds.length ? ogrIds : [...new Set(DB.sonuclar.filter(s => denIds.has(s.denemeId)).map(s => s.ogrenciId))];
  let dersler = dersF.length ? dersF : [...new Set(DB.sonuclar.filter(s => denIds.has(s.denemeId)).map(s => s.ders))].sort();

  const ilk = denemeler[0], son = denemeler[denemeler.length - 1];
  const analiz = [];

  ogrenciIds.forEach(oid => {
    const ogr = DB.ogrenciler.find(o => o.id === oid);
    if (!ogr) return;

    const ilkTop = dersler.reduce((a, d) => a + (ogrenciDersNet(oid, ilk.id, d) || 0), 0);
    const sonTop = dersler.reduce((a, d) => a + (ogrenciDersNet(oid, son.id, d) || 0), 0);
    const fark = Math.round((sonTop - ilkTop) * 100) / 100;
    const yuzde = ilkTop === 0 ? (sonTop > 0 ? 100 : 0) : Math.round(((fark / ilkTop) * 100) * 100) / 100;

    const dersDetay = dersler.map(d => {
      const i = ogrenciDersNet(oid, ilk.id, d) || 0;
      const s = ogrenciDersNet(oid, son.id, d) || 0;
      const df = Math.round((s - i) * 100) / 100;
      const yp = i === 0 ? (s > 0 ? 100 : 0) : Math.round(((df / i) * 100) * 100) / 100;
      return { ders: d, ilk: i, son: s, fark: df, yuzde: yp };
    }).sort((a, b) => Math.abs(b.fark) - Math.abs(a.fark));

    analiz.push({ oid, ad: ogr.adSoyad, ilkTop, sonTop, fark, yuzde, dersDetay });
  });

  if (!analiz.length) return;

  const gelisen = [...analiz].sort((a, b) => b.fark - a.fark).slice(0, 5);
  const dusen = [...analiz].sort((a, b) => a.fark - b.fark).slice(0, 5);

  const chartData = denemeler.map(d => {
    const row = { tarih: fmtTarih(d.tarih), __denemeAd: d.ad };
    analiz.forEach(a => {
      const rows0 = DB.sonuclar.filter(x => x.ogrenciId === a.oid && x.denemeId === d.id);
      const rows = dersler.length ? rows0.filter(x => dersler.includes(x.ders)) : rows0;
      if (rows.length) {
        row[a.ad] = Math.round(rows.reduce((sum, x) => sum + x.net, 0) * 100) / 100;
      }
    });
    return row;
  });

  chartData.forEach((row, idx) => {
    const d = denemeler[idx];
    if (!d) return;
    const tumSonuc = DB.sonuclar.filter(x => x.denemeId === d.id && (dersler.length ? dersler.includes(x.ders) : true));
    const perOgr = {};
    tumSonuc.forEach(x => { perOgr[x.ogrenciId] = (perOgr[x.ogrenciId] || 0) + x.net; });
    const vals = Object.values(perOgr);
    if (vals.length) row['📊 Sınıf Ort.'] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
  });

  let chartKeys = [...analiz.map(a => a.ad), '📊 Sınıf Ort.'];

  let h = '';

  if (gelisimGoster) {
    h += `
      <details class="card" open style="border:1px solid var(--border);border-radius:12px;overflow:hidden;padding:0;margin-bottom:12px">
        <summary style="cursor:pointer;padding:12px 14px;background:#f8fafc;font-size:15px;font-weight:700;list-style:none;display:flex;justify-content:space-between;align-items:center">
          <span>🚀 Gelişim / Düşüş Analizi</span><span style="font-size:11px;color:var(--muted)">▼ aç / kapat</span>
        </summary>
        <div style="padding:14px">
          <p class="muted" style="font-size:12px;margin-bottom:10px">Analiz aralığı: <b>${fmtTarih(ilk.tarih)} - ${ilk.ad}</b> → <b>${fmtTarih(son.tarih)} - ${son.ad}</b> • Deneme sayısı: ${denemeler.length} • Ders: ${dersler.join(', ') || 'Tümü'}</p>
          <h3 style="font-size:14px;margin:10px 0 6px">📈 Seçili Denemelerde İlerleme Grafiği <span class="muted" style="font-size:11px;font-weight:400">(öğrenci isimleri çizgi sonunda gösterilir)</span></h3>
          ${cizgiGrafik(chartData, chartKeys, { endLabels: true })}
          <div class="grid-2 mt-3">
            <div>
              <h3 style="font-size:14px;margin-bottom:6px;color:var(--emerald)">⬆️ En Çok Gelişim Gösterenler</h3>
              <div style="overflow-x:auto">
                <table class="table">
                  <thead><tr><th>Öğrenci</th><th class="num">İlk</th><th class="num">Son</th><th class="num">Net Artışı</th><th class="num">%</th></tr></thead>
                  <tbody>
                    ${gelisen.map(a => `<tr><td style="font-weight:600">${a.ad}</td><td class="num mono">${a.ilkTop.toFixed(2)}</td><td class="num mono">${a.sonTop.toFixed(2)}</td><td class="num mono green">${a.fark > 0 ? '+' : ''}${a.fark.toFixed(2)}</td><td class="num mono green">${a.yuzde > 0 ? '+' : ''}${a.yuzde.toFixed(2)}%</td></tr>`).join('')}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h3 style="font-size:14px;margin-bottom:6px;color:var(--red)">⬇️ En Çok Düşüş veya En Az Yükseliş Gösterenler</h3>
              <div style="overflow-x:auto">
                <table class="table">
                  <thead><tr><th>Öğrenci</th><th class="num">İlk</th><th class="num">Son</th><th class="num">Net Farkı</th><th class="num">%</th></tr></thead>
                  <tbody>
                    ${dusen.map(a => `<tr><td style="font-weight:600">${a.ad}</td><td class="num mono">${a.ilkTop.toFixed(2)}</td><td class="num mono">${a.sonTop.toFixed(2)}</td><td class="num mono ${a.fark < 0 ? 'red-c' : 'green'}">${a.fark > 0 ? '+' : ''}${a.fark.toFixed(2)}</td><td class="num mono ${a.yuzde < 0 ? 'red-c' : 'green'}">${a.yuzde > 0 ? '+' : ''}${a.yuzde.toFixed(2)}%</td></tr>`).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </details>
    `;
  }

  if (dersIlerleyisGoster) {
    h += `
      <details class="card" open style="border:1px solid var(--border);border-radius:12px;overflow:hidden;padding:0;margin-bottom:12px">
        <summary style="cursor:pointer;padding:12px 14px;background:#f8fafc;font-size:15px;font-weight:700;list-style:none;display:flex;justify-content:space-between;align-items:center">
          <span>📚 Ders Bazlı İlerleyiş (Net ve Yüzde Değişim)</span><span style="font-size:11px;color:var(--muted)">▼ aç / kapat</span>
        </summary>
        <div style="padding:14px">
    `;

    analiz.sort((a, b) => b.fark - a.fark).forEach(a => {
      h += `
        <div style="margin:10px 0;padding:10px;border:1px solid var(--border);border-radius:10px">
          <b>${a.ad}</b> <span class="pillbad ${a.fark >= 0 ? 'up' : 'down'}">${a.fark >= 0 ? '+' : ''}${a.fark.toFixed(2)} net • ${a.yuzde >= 0 ? '+' : ''}${a.yuzde.toFixed(2)}%</span>
          <div style="overflow-x:auto;margin-top:6px">
            <table class="table">
              <thead><tr><th>Ders</th><th class="num">İlk</th><th class="num">Son</th><th class="num">Net Farkı</th><th class="num">%</th></tr></thead>
              <tbody>
                ${a.dersDetay.map(d => `<tr><td>${d.ders}</td><td class="num mono">${d.ilk.toFixed(2)}</td><td class="num mono">${d.son.toFixed(2)}</td><td class="num mono ${d.fark >= 0 ? 'green' : 'red-c'}">${d.fark >= 0 ? '+' : ''}${d.fark.toFixed(2)}</td><td class="num mono ${d.yuzde >= 0 ? 'green' : 'red-c'}">${d.yuzde >= 0 ? '+' : ''}${d.yuzde.toFixed(2)}%</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    });
    h += '</div></details>';
  }

  el.innerHTML = h;
  el.classList.remove('hidden');
}

let ALTINDA_STATE = {
  denemeler: [],
  ogrIds: [],
  dersF: [],
  seciliSinifId: '',
  seciliDenemeId: ''
};

export function altindaFiltreDegisti() {
  const sSinif = $('altindaSinifSecim');
  const sDeneme = $('altindaDenemeSecim');
  if (sSinif) ALTINDA_STATE.seciliSinifId = sSinif.value;
  if (sDeneme) ALTINDA_STATE.seciliDenemeId = sDeneme.value;
  renderOrtalamaAltindaIcerik();
}

export function altindaFiltreSifirla() {
  ALTINDA_STATE.seciliSinifId = '';
  ALTINDA_STATE.seciliDenemeId = '';
  const sSinif = $('altindaSinifSecim');
  const sDeneme = $('altindaDenemeSecim');
  if (sSinif) sSinif.value = '';
  if (sDeneme) sDeneme.value = '';
  renderOrtalamaAltindaIcerik();
}

export function renderOrtalamaAltinda(denemeler, ogrIds, dersF) {
  ALTINDA_STATE.denemeler = denemeler || [];
  ALTINDA_STATE.ogrIds = ogrIds || [];
  ALTINDA_STATE.dersF = dersF || [];

  if (ALTINDA_STATE.seciliSinifId && !DB.siniflar.some(s => String(s.id) === String(ALTINDA_STATE.seciliSinifId))) {
    ALTINDA_STATE.seciliSinifId = '';
  }
  if (ALTINDA_STATE.seciliDenemeId && !ALTINDA_STATE.denemeler.some(d => String(d.id) === String(ALTINDA_STATE.seciliDenemeId))) {
    ALTINDA_STATE.seciliDenemeId = '';
  }

  renderOrtalamaAltindaIcerik();
}

export function renderOrtalamaAltindaIcerik() {
  const el = $('raporOrtalamaAltinda');
  if (!el) return;

  const altindaGoster = !$('raporAltinda') || $('raporAltinda').checked;
  if (!altindaGoster) {
    el.innerHTML = '';
    el.classList.add('hidden');
    return;
  }

  const { denemeler, ogrIds, dersF, seciliSinifId, seciliDenemeId } = ALTINDA_STATE;
  if (!denemeler || !denemeler.length) {
    el.innerHTML = '';
    el.classList.add('hidden');
    return;
  }

  const allDenIds = new Set(denemeler.map(d => d.id));
  const tumSonuclar = DB.sonuclar.filter(s => allDenIds.has(s.denemeId));
  if (!tumSonuclar.length) {
    el.innerHTML = '';
    el.classList.add('hidden');
    return;
  }

  // Değerlendirilecek tüm dersler
  const dersler = dersF.length ? dersF : [...new Set(tumSonuclar.map(s => s.ders))].sort();

  // Genel havuza katılan tüm öğrenciler
  const tumKatilanOgrIds = ogrIds.length ? ogrIds : [...new Set(tumSonuclar.map(s => s.ogrenciId))];

  // Aktif denemeler (Deneme seçimi filtresi)
  const aktifDenemeler = seciliDenemeId 
    ? denemeler.filter(d => String(d.id) === String(seciliDenemeId))
    : denemeler;
  const aktifDenIds = new Set(aktifDenemeler.map(d => d.id));

  // Aktif öğrenciler (Sınıf seçimi filtresi)
  let aktifOgrIds = tumKatilanOgrIds;
  if (seciliSinifId) {
    aktifOgrIds = aktifOgrIds.filter(oid => {
      const o = DB.ogrenciler.find(x => x.id === oid);
      return o && String(o.sinifId) === String(seciliSinifId);
    });
  }

  // Öğrenci bazında net hesaplama
  const ogrData = [];
  const ogrDersMap = {}; // oid -> { ders: { sum: X, count: Y } }

  aktifOgrIds.forEach(oid => {
    const ogr = DB.ogrenciler.find(o => o.id === oid);
    if (!ogr) return;

    const ogrSonuclar = DB.sonuclar.filter(s => s.ogrenciId === oid && aktifDenIds.has(s.denemeId) && dersler.includes(s.ders));
    if (!ogrSonuclar.length) return;

    const denemeNetler = {};
    ogrSonuclar.forEach(s => {
      denemeNetler[s.denemeId] = (denemeNetler[s.denemeId] || 0) + s.net;

      if (!ogrDersMap[oid]) ogrDersMap[oid] = {};
      if (!ogrDersMap[oid][s.ders]) ogrDersMap[oid][s.ders] = { sum: 0, count: 0 };
      ogrDersMap[oid][s.ders].sum += s.net;
      ogrDersMap[oid][s.ders].count += 1;
    });

    const netValues = Object.values(denemeNetler);
    const ortalamaNet = netValues.length ? netValues.reduce((a, b) => a + b, 0) / netValues.length : 0;

    ogrData.push({
      oid,
      ad: ogr.adSoyad,
      sinifId: ogr.sinifId,
      sinifAd: sinifAdi(ogr.sinifId),
      ortalamaNet,
      sinavSayisi: netValues.length
    });
  });

  // Seçili Filtre Başlıkları & Etiketleri
  const seciliSinifObj = seciliSinifId ? DB.siniflar.find(s => String(s.id) === String(seciliSinifId)) : null;
  const sinifEtiket = seciliSinifObj ? `${seciliSinifObj.ad} Sınıfı` : 'Tüm Sınıflar (Genel Kurum)';

  const seciliDenemeObj = seciliDenemeId ? denemeler.find(d => String(d.id) === String(seciliDenemeId)) : null;
  const denemeEtiket = seciliDenemeObj ? `${seciliDenemeObj.ad} (${fmtTarih(seciliDenemeObj.tarih)})` : `Tüm Seçili Denemeler (${denemeler.length} Sınav Ort.)`;

  // Sınıf seçenekleri
  const sinifSecenekleri = DB.siniflar.map(s => {
    const sayi = tumKatilanOgrIds.filter(oid => {
      const o = DB.ogrenciler.find(x => x.id === oid);
      return o && o.sinifId === s.id;
    }).length;
    const sel = String(s.id) === String(seciliSinifId) ? 'selected' : '';
    return `<option value="${s.id}" ${sel}>${s.ad} (${sayi} Katılımcı)</option>`;
  }).join('');

  // Deneme seçenekleri
  const denemeSecenekleri = denemeler.map(d => {
    const sel = String(d.id) === String(seciliDenemeId) ? 'selected' : '';
    return `<option value="${d.id}" ${sel}>${fmtTarih(d.tarih)} • ${d.ad} (${d.tur})</option>`;
  }).join('');

  // Filtre Araç Çubuğu HTML
  const filtreBarHtml = `
    <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:12px 14px;margin-bottom:14px">
      <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end">
        <!-- 1. Sınıf Seçimi -->
        <div style="flex:1;min-width:210px">
          <label style="font-size:11.5px;font-weight:700;color:#334155;display:flex;align-items:center;gap:4px;margin-bottom:4px">
            <span>🏫 Sınıf Seçimi:</span>
          </label>
          <select id="altindaSinifSecim" onchange="window.altindaFiltreDegisti()" style="width:100%;font-size:13px;font-weight:600;padding:8px 10px;border-radius:8px;border:1.5px solid #cbd5e1;background:#fff;color:#0f172a;cursor:pointer;min-height:42px">
            <option value="">Tüm Sınıflar (Genel Kurum Ortalaması)</option>
            ${sinifSecenekleri}
          </select>
        </div>

        <!-- 2. Deneme Seçimi -->
        <div style="flex:1.3;min-width:240px">
          <label style="font-size:11.5px;font-weight:700;color:#334155;display:flex;align-items:center;gap:4px;margin-bottom:4px">
            <span>📝 Deneme Seçimi:</span>
          </label>
          <select id="altindaDenemeSecim" onchange="window.altindaFiltreDegisti()" style="width:100%;font-size:13px;font-weight:600;padding:8px 10px;border-radius:8px;border:1.5px solid #cbd5e1;background:#fff;color:#0f172a;cursor:pointer;min-height:42px">
            <option value="">Tüm Değerlendirilen Denemeler (${denemeler.length} Deneme Ortalaması)</option>
            ${denemeSecenekleri}
          </select>
        </div>

        <!-- 3. Sıfırla Butonu -->
        <div>
          <button type="button" class="btn gray sm" onclick="window.altindaFiltreSifirla()" style="padding:8px 14px;font-size:12.5px;font-weight:600;min-height:42px" title="Filtreleri sıfırla (Tüm Sınıflar & Tüm Denemeler)">
            🔄 Sıfırla
          </button>
        </div>
      </div>

      <!-- Filtre Bilgi Şeridi -->
      <div style="margin-top:10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:11.5px;color:#64748b;border-top:1px dashed #e2e8f0;padding-top:8px">
        <div>
          <span>🎯 Kapsam: <b style="color:#0f172a">${sinifEtiket}</b></span>
          <span style="margin:0 6px">•</span>
          <span>Sınav: <b style="color:#0f172a">${denemeEtiket}</b></span>
          <span style="margin:0 6px">•</span>
          <span>Değerlendirilen Öğrenci: <b style="color:#0f172a">${ogrData.length}</b></span>
        </div>
        <div style="color:#4338ca;font-weight:600">
          💡 Sınıf veya deneme seçerek analizi anında daraltıp genişletebilirsiniz
        </div>
      </div>
    </div>
  `;

  // Eğer filtre sonucunda öğrenci yoksa:
  if (!ogrData.length) {
    let h = `
      <details class="card" open style="border:1.5px solid #fecaca;border-radius:12px;overflow:hidden;padding:0;background:#ffffff;margin-bottom:12px">
        <summary style="cursor:pointer;padding:12px 16px;background:#fef2f2;font-size:15px;font-weight:700;color:#991b1b;list-style:none;display:flex;justify-content:space-between;align-items:center">
          <span style="display:flex;align-items:center;gap:8px">
            <span style="font-size:18px">⚠️</span>
            <span>Sınıf Ortalaması Altında Kalanlar</span>
            <span class="pillbad" style="background:#fee2e2;color:#991b1b;font-size:11px;font-weight:700">0 Öğrenci</span>
          </span>
          <span style="font-size:11px;color:#991b1b">▼ aç / kapat</span>
        </summary>
        <div style="padding:16px">
          ${filtreBarHtml}
          <div style="padding:20px;background:#fff5f5;border:1px solid #fed7d7;border-radius:10px;color:#991b1b;margin-top:10px;text-align:center">
            <div style="font-size:32px;margin-bottom:6px">📭</div>
            <b style="font-size:14px">Değerlendirilecek Veri Bulunamadı</b>
            <p style="font-size:12px;color:#7f1d1d;margin-top:4px">
              <b>${sinifEtiket}</b> için <b>${denemeEtiket}</b> kapsamında öğrenci sınav sonucu bulunamadı.<br>
              Lütfen yukarıdaki menüden farklı bir sınıf veya deneme seçiniz ya da "Sıfırla" butonuna tıklayınız.
            </p>
          </div>
        </div>
      </details>
    `;
    el.innerHTML = h;
    el.classList.remove('hidden');
    return;
  }

  // Seçili Cohort Genel Net Ortalaması
  const sinifGenelOrt = ogrData.reduce((a, b) => a + b.ortalamaNet, 0) / ogrData.length;

  // Ortalamanın Altında Kalan Öğrenciler
  const genelAltinda = ogrData
    .filter(o => typeof o.ortalamaNet === 'number' && o.ortalamaNet < sinifGenelOrt)
    .map(o => ({
      ...o,
      fark: Math.round((o.ortalamaNet - sinifGenelOrt) * 100) / 100,
      yuzde: sinifGenelOrt !== 0 ? Math.round(((o.ortalamaNet - sinifGenelOrt) / Math.abs(sinifGenelOrt)) * 1000) / 10 : 0
    }))
    .sort((a, b) => a.fark - b.fark);

  // Ders Bazlı Sınıf Ortalamaları ve Altında Kalanlar
  const dersAltindaMap = [];
  dersler.forEach(ders => {
    const dersOgrData = [];
    aktifOgrIds.forEach(oid => {
      const ogr = DB.ogrenciler.find(o => o.id === oid);
      if (!ogr) return;
      const dInfo = ogrDersMap[oid] && ogrDersMap[oid][ders];
      if (dInfo && dInfo.count > 0) {
        const dOrt = dInfo.sum / dInfo.count;
        dersOgrData.push({ oid, ad: ogr.adSoyad, sinifAd: sinifAdi(ogr.sinifId), dOrt });
      }
    });

    if (dersOgrData.length > 0) {
      const dSinifOrt = dersOgrData.reduce((a, b) => a + b.dOrt, 0) / dersOgrData.length;
      const dAltindalar = dersOgrData
        .filter(o => typeof o.dOrt === 'number' && o.dOrt < dSinifOrt)
        .map(o => ({
          ...o,
          fark: Math.round((o.dOrt - dSinifOrt) * 100) / 100,
          yuzde: dSinifOrt !== 0 ? Math.round(((o.dOrt - dSinifOrt) / Math.abs(dSinifOrt)) * 1000) / 10 : 0
        }))
        .sort((a, b) => a.fark - b.fark);

      dersAltindaMap.push({
        ders,
        sinifOrt: dSinifOrt,
        katilimciSayisi: dersOgrData.length,
        altindalar: dAltindalar
      });
    }
  });

  let h = `
    <details class="card" open style="border:1.5px solid #fecaca;border-radius:12px;overflow:hidden;padding:0;background:#ffffff;margin-bottom:12px">
      <summary style="cursor:pointer;padding:12px 16px;background:#fef2f2;font-size:15px;font-weight:700;color:#991b1b;list-style:none;display:flex;justify-content:space-between;align-items:center">
        <span style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="font-size:18px">⚠️</span>
          <span>Sınıf Ortalaması Altında Kalanlar</span>
          <span class="pillbad red" style="font-size:11px;font-weight:700">${genelAltinda.length} Öğrenci Ort. Altında</span>
          <span class="pillbad" style="background:#f1f5f9;color:#334155;font-size:11px;font-weight:600">${seciliSinifObj ? seciliSinifObj.ad : 'Tüm Sınıflar'} • ${seciliDenemeObj ? seciliDenemeObj.ad : 'Tüm Sınavlar'}</span>
        </span>
        <span style="font-size:11px;color:#991b1b">▼ aç / kapat</span>
      </summary>
      <div style="padding:16px">
        <!-- Filtre Araç Çubuğu -->
        ${filtreBarHtml}

        <!-- Özet KPI Kartları -->
        <div class="grid-3" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:14px">
          <div class="stat" style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px;text-align:center">
            <div class="l" style="font-size:11px;color:#991b1b;font-weight:600">${seciliSinifObj ? `${seciliSinifObj.ad} Net Ort.` : 'Referans Net Ort.'}</div>
            <div class="v mono" style="font-size:20px;font-weight:700;color:#dc2626">${sinifGenelOrt.toFixed(2)}</div>
            <span style="font-size:10px;color:#ef4444">${seciliDenemeObj ? 'Bu Denemedeki Ortalama' : `${aktifDenemeler.length} Deneme Ortalaması`}</span>
          </div>
          <div class="stat" style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px;text-align:center">
            <div class="l" style="font-size:11px;color:#92400e;font-weight:600">Ortalama Altı Öğrenci</div>
            <div class="v mono" style="font-size:20px;font-weight:700;color:#b45309">${genelAltinda.length} / ${ogrData.length}</div>
            <span style="font-size:10px;color:#d97706">%${Math.round((genelAltinda.length / ogrData.length) * 100)} Oran</span>
          </div>
          <div class="stat" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;text-align:center">
            <div class="l" style="font-size:11px;color:#475569;font-weight:600">Değerlendirilen Dersler</div>
            <div class="v mono" style="font-size:20px;font-weight:700;color:#334155">${dersler.length}</div>
            <span style="font-size:10px;color:#64748b">${dersler.slice(0, 3).join(', ')}${dersler.length > 3 ? '...' : ''}</span>
          </div>
        </div>

        <!-- 1. GENEL NET ORTALAMASI ALTINDA KALANLAR -->
        <h3 style="font-size:14px;margin:14px 0 8px;color:#991b1b;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
          <span>📊 Genel Net Ortalaması Altında Kalan Öğrenciler</span>
          <span style="font-size:11.5px;color:#64748b;font-weight:400">Ortalama: <b class="mono" style="color:#991b1b">${sinifGenelOrt.toFixed(2)} Net</b></span>
        </h3>
  `;

  if (genelAltinda.length > 0) {
    h += `
      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;margin-bottom:18px">
        <table class="table" style="font-size:12.5px;min-width:620px">
          <thead>
            <tr>
              <th style="width:40px">#</th>
              <th>Öğrenci Adı</th>
              <th>Sınıfı</th>
              <th class="num">${seciliDenemeObj ? 'Sınav Neti' : 'Öğrenci Ort. Net'}</th>
              <th class="num">${seciliSinifObj ? `${seciliSinifObj.ad} Ort.` : 'Referans Ort.'}</th>
              <th class="num">Net Farkı</th>
              <th class="num">Yüzdesel Fark</th>
              <th style="text-align:center;width:120px">Durum</th>
            </tr>
          </thead>
          <tbody>
            ${genelAltinda.map((x, idx) => {
              const kritikMi = x.fark <= -10;
              return `
                <tr style="background:${idx % 2 === 0 ? '#fff5f5' : '#ffffff'}">
                  <td style="font-weight:700;color:#991b1b">${idx + 1}</td>
                  <td style="font-weight:600;color:#1e293b">
                    <a href="javascript:void(0)" onclick="window.ogrenciDetayGoster(${x.oid})" style="color:#1e293b;text-decoration:underline;text-decoration-color:#cbd5e1" title="Öğrenci profilini ve detaylı analizini aç">
                      ${x.ad}
                    </a>
                  </td>
                  <td><span class="pillbad" style="font-size:10.5px;background:#f1f5f9;color:#475569">${x.sinifAd}</span></td>
                  <td class="num mono" style="font-weight:700;color:#dc2626">${x.ortalamaNet.toFixed(2)}</td>
                  <td class="num mono muted">${sinifGenelOrt.toFixed(2)}</td>
                  <td class="num mono red-c" style="font-weight:700">${x.fark > 0 ? '+' : ''}${x.fark.toFixed(2)}</td>
                  <td class="num mono red-c" style="font-weight:700">${x.yuzde > 0 ? '+' : ''}${x.yuzde.toFixed(1)}%</td>
                  <td style="text-align:center">
                    ${kritikMi 
                      ? '<span class="pillbad red" style="font-size:10px;font-weight:700">🚨 Kritik Destek</span>' 
                      : '<span class="pillbad" style="background:#fee2e2;color:#991b1b;font-size:10px">⚠️ Takip Edilmeli</span>'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    h += `
      <div style="padding:14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;color:#166534;margin-bottom:16px;font-size:13px;display:flex;align-items:center;gap:8px">
        <span style="font-size:20px">🎉</span>
        <div>
          <b>Tebrikler!</b> Seçili kapsamda (${sinifEtiket}, ${denemeEtiket}) tüm öğrencilerin neti referans ortalamanın (${sinifGenelOrt.toFixed(2)}) üzerinde veya eşit.
        </div>
      </div>
    `;
  }

  // 2. DERS BAZINDA ORTALAMANIN ALTINDA KALANLAR
  if (dersAltindaMap.length > 0) {
    h += `
      <h3 style="font-size:14px;margin:18px 0 10px;color:#1e293b;border-top:1px solid #fee2e2;padding-top:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <span style="display:flex;align-items:center;gap:6px">
          <span>📚 Ders Bazında ${seciliSinifObj ? `${seciliSinifObj.ad} Sınıf` : 'Sınıf'} Ortalaması Altında Kalanlar</span>
        </span>
        <span style="font-size:11.5px;color:#64748b;font-weight:400">
          Kapsam: <b>${sinifEtiket}</b> • <b>${denemeEtiket}</b>
        </span>
      </h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">
        ${dersAltindaMap.map(dItem => {
          const hasAlt = dItem.altindalar.length > 0;
          return `
            <div style="border:1px solid ${hasAlt ? '#fecaca' : '#bbf7d0'};border-radius:10px;padding:12px;background:${hasAlt ? '#fffbfb' : '#f0fdf4'}">
              <div class="flex" style="justify-content:space-between;align-items:center;margin-bottom:6px">
                <b style="font-size:13px;color:#0f172a">${dItem.ders}</b>
                <span class="pillbad ${hasAlt ? 'red' : 'green'}" style="font-size:10.5px">
                  ${hasAlt ? `${dItem.altindalar.length} Kişi Geride` : 'Herkes Başarılı ✓'}
                </span>
              </div>
              <div style="font-size:11.5px;color:#64748b;margin-bottom:8px">
                ${seciliSinifObj ? `${seciliSinifObj.ad} Ortalaması:` : 'Ders Ortalaması:'} <b class="mono" style="color:var(--indigo)">${dItem.sinifOrt.toFixed(2)} Net</b>
                <span style="margin-left:6px;font-size:10.5px;color:#94a3b8">(${dItem.katilimciSayisi} Öğrenci)</span>
              </div>
              ${hasAlt ? `
                <div style="overflow-x:auto;-webkit-overflow-scrolling:touch">
                  <table class="table" style="font-size:11.5px;margin:0">
                    <thead>
                      <tr>
                        <th>Öğrenci</th>
                        <th class="num">Net</th>
                        <th class="num">Fark</th>
                        <th class="num">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${dItem.altindalar.map(st => `
                        <tr>
                          <td style="font-weight:600">
                            <a href="javascript:void(0)" onclick="window.ogrenciDetayGoster(${st.oid})" style="color:#0f172a;text-decoration:none" title="Detay">
                              ${st.ad}
                            </a>
                          </td>
                          <td class="num mono">${st.dOrt.toFixed(2)}</td>
                          <td class="num mono red-c">${st.fark > 0 ? '+' : ''}${st.fark.toFixed(2)}</td>
                          <td class="num mono red-c">${st.yuzde > 0 ? '+' : ''}${st.yuzde.toFixed(1)}%</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              ` : `
                <p style="font-size:11.5px;color:#15803d;margin:4px 0 0">Tüm öğrenciler sınıf ortalamasının üzerinde veya eşit ✓</p>
              `}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  h += `</div></details>`;

  el.innerHTML = h;
  el.classList.remove('hidden');
}

export function renderRapor() {
  const el = $('raporSonuc');
  const ga = $('raporGelisimAnaliz');
  if (ga) { ga.innerHTML = ''; ga.classList.add('hidden'); }
  const sr = $('raporSinifSiralama');
  if (sr) { sr.innerHTML = ''; sr.classList.add('hidden'); }
  const oa = $('raporOrtalamaAltinda');
  if (oa) { oa.innerHTML = ''; oa.classList.add('hidden'); }

  const turF = $('raporTur').value;
  const ogrIds = [...$('raporOgrenciSelect').selectedOptions].map(o => Number(o.value)).filter(Boolean);
  const dersF = [...$('raporDersSelect').selectedOptions].map(o => o.value).filter(Boolean);

  const gelisimGoster = !$('raporGelisimGoster') || $('raporGelisimGoster').checked;
  const dersIlerleyisGoster = !$('raporDersIlerleyis') || $('raporDersIlerleyis').checked;
  const altindaGoster = !$('raporAltinda') || $('raporAltinda').checked;
  const siralamaGoster = !$('raporSiralama') || $('raporSiralama').checked;
  const detayliGoster = !$('raporDetayli') || $('raporDetayli').checked;

  const seciliGelisimIds = [
    ...[...$('raporGelisimTYT').selectedOptions].map(o => Number(o.value)),
    ...[...$('raporGelisimAYT').selectedOptions].map(o => Number(o.value))
  ].filter(Boolean);

  let denemeler;
  if (seciliGelisimIds.length) {
    denemeler = seciliGelisimIds.map(id => DB.denemeler.find(d => d.id === id)).filter(Boolean);
  } else {
    denemeler = DB.denemeler.slice();
    if (turF) denemeler = denemeler.filter(d => d.tur === turF);
  }
  denemeler.sort((a, b) => a.tarih.localeCompare(b.tarih));
  const denIds = new Set(denemeler.map(d => d.id));

  let sonuc = DB.sonuclar.filter(s => denIds.has(s.denemeId));
  if (ogrIds.length) sonuc = sonuc.filter(s => ogrIds.includes(s.ogrenciId));
  if (dersF.length) sonuc = sonuc.filter(s => dersF.includes(s.ders));

  if (!sonuc.length) {
    el.innerHTML = '<div class="empty mt-6"><p style="font-size:36px">📭</p><p>Filtrelere uygun veri yok.</p></div>';
    return;
  }

  const printTarih = $('printTarih');
  if (printTarih) {
    printTarih.textContent = `Oluşturma: ${new Date().toLocaleString('tr-TR')} • ${sonuc.length} kayıt`;
  }

  // 1. Gelişim / Düşüş Analizi & Ders Bazlı İlerleyiş
  renderGelisimAnalizi(denemeler, ogrIds, dersF, gelisimGoster, dersIlerleyisGoster);

  if (siralamaGoster) {
    const rows = sonuc;
    if (rows.length) {
      const byO = {};
      rows.forEach(s => {
        if (!byO[s.ogrenciId]) byO[s.ogrenciId] = { ogrenciId: s.ogrenciId, ad: ogrenciAdi(s.ogrenciId), denemeNet: {} };
        byO[s.ogrenciId].denemeNet[s.denemeId] = (byO[s.ogrenciId].denemeNet[s.denemeId] || 0) + s.net;
      });

      const rk = Object.values(byO).map(r => {
        const netler = Object.values(r.denemeNet);
        const toplam = netler.reduce((a, b) => a + b, 0);
        const sinavSayisi = netler.length;
        return { ogrenciId: r.ogrenciId, ad: r.ad, toplam, sinavSayisi, ortalama: sinavSayisi ? toplam / sinavSayisi : 0 };
      }).sort((a, b) => b.ortalama - a.ortalama);

      const genelOrt = rk.length ? rk.reduce((a, r) => a + r.ortalama, 0) / rk.length : 0;
      const secilenDenemeIds = [...new Set(rows.map(s => s.denemeId))];
      const denemeOrtlari = secilenDenemeIds.map(did => {
        const dRows = rows.filter(s => s.denemeId === did);
        const perOgr = {};
        dRows.forEach(s => { perOgr[s.ogrenciId] = (perOgr[s.ogrenciId] || 0) + s.net; });
        const vals = Object.values(perOgr);
        return { did, ort: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0, ogrSayisi: vals.length };
      });
      const secilenGenelOrt = denemeOrtlari.length ? denemeOrtlari.reduce((a, d) => a + d.ort, 0) / denemeOrtlari.length : 0;

      let h = `
        <details class="card" style="border:1px solid var(--border);border-radius:12px;overflow:hidden;padding:0">
          <summary style="cursor:pointer;padding:12px 14px;background:#f8fafc;font-size:15px;font-weight:700;list-style:none;display:flex;justify-content:space-between;align-items:center">
            <span>🏆 Tüm Katılımcılar — Sıralama</span><span style="font-size:11px;color:var(--muted)">▼ aç / kapat</span>
          </summary>
          <div style="padding:14px">
            <div class="grid-3 mt-3" style="margin-bottom:10px">
              <div class="stat"><div class="v mono">${genelOrt.toFixed(2)}</div><div class="l">Sınıf Net Ortalaması (öğrenci bazlı)</div></div>
              <div class="stat" style="background:#f0fdf4"><div class="v mono" style="color:var(--emerald)">${secilenGenelOrt.toFixed(2)}</div><div class="l">Seçili Sınavların Sınıf Toplam Net Ort.</div></div>
              <div class="stat" style="background:#fffbeb"><div class="v mono" style="color:var(--amber)">${secilenDenemeIds.length}</div><div class="l">Değerlendirilen Sınav Sayısı</div></div>
            </div>
            <div style="overflow-x:auto">
              <table class="table">
                <thead><tr><th>#</th><th>Öğrenci</th><th class="num">Toplam Net Ortalaması</th><th class="num">Girdiği Sınav</th><th class="num">Sınıf</th><th class="num">Sınıf Ort. Farkı</th></tr></thead>
                <tbody>
                  ${rk.map((r, i) => {
                    const fark = r.ortalama - genelOrt;
                    return `
                      <tr class="${i === 0 ? 'rank1' : i === 1 ? 'rank2' : i === 2 ? 'rank3' : ''}">
                        <td class="mono" style="font-weight:800">${i + 1}</td>
                        <td style="font-weight:600">${r.ad}</td>
                        <td class="num mono" style="font-weight:700;color:var(--indigo)">${r.ortalama.toFixed(2)}</td>
                        <td class="num">${r.sinavSayisi}</td>
                        <td class="num mono muted">${sinifAdi(DB.ogrenciler.find(o => o.id === r.ogrenciId)?.sinifId || 0)}</td>
                        <td class="num mono ${fark > 0 ? 'green' : fark < 0 ? 'red-c' : ''}">${fark > 0 ? '+' : ''}${fark.toFixed(2)}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
      `;

      if (denemeOrtlari.length) {
        h += `
          <h3 style="font-size:13px;margin:14px 0 6px">📋 Seçili Sınavların Sınıf Ortalamaları</h3>
          <div style="overflow-x:auto">
            <table class="table">
              <thead><tr><th>Deneme</th><th>Tür</th><th>Tarih</th><th class="num">Katılan Öğrenci</th><th class="num">Sınıf Toplam Net Ort.</th></tr></thead>
              <tbody>
                ${denemeOrtlari.map(x => ({ ...x, d: DB.denemeler.find(dd => dd.id === x.did) })).filter(x => x.d)
                  .sort((a, b) => b.d.tarih.localeCompare(a.d.tarih))
                  .map(x => `
                    <tr>
                      <td style="font-weight:600">${x.d.ad}</td>
                      <td><span class="pillbad eq">${x.d.tur}</span></td>
                      <td>${fmtTarih(x.d.tarih)}</td>
                      <td class="num">${x.ogrSayisi}</td>
                      <td class="num mono">${x.ort.toFixed(2)}</td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }

      h += '</div></details>';
      sr.innerHTML = h;
      sr.classList.remove('hidden');
    }
  }

  // 3. Sınıf Ortalaması Altında Kalanlar
  if (altindaGoster) {
    renderOrtalamaAltinda(denemeler, ogrIds, dersF);
  }

  const map = new Map();
  sonuc.forEach(s => {
    const d = DB.denemeler.find(x => x.id === s.denemeId);
    if (!d) return;
    const k = s.ogrenciId + '|' + s.ders;
    if (!map.has(k)) map.set(k, { ogrenciId: s.ogrenciId, ogrenciAd: ogrenciAdi(s.ogrenciId), ders: s.ders, denemeler: [] });
    map.get(k).denemeler.push({ tarih: d.tarih, ad: d.ad, net: s.net, dogru: s.dogru, yanlis: s.yanlis });
  });
  map.forEach(v => v.denemeler.sort((a, b) => a.tarih.localeCompare(b.tarih)));

  RAPOR_DURUM = { map, ogrIds, dersF };

  let html = '';
  const detayliGoster = !$('raporDetayli') || $('raporDetayli').checked;
  if (detayliGoster) {
    html += `
      <details class="card mt-4" style="border:1px solid var(--border);border-radius:12px;overflow:hidden;padding:0">
        <summary style="cursor:pointer;padding:12px 14px;background:#f8fafc;font-size:15px;font-weight:700;list-style:none;display:flex;justify-content:space-between;align-items:center">
          <span>📊 Ders Başarı Analizi</span><span style="font-size:11px;color:var(--muted)">▼ aç / kapat</span>
        </summary>
        <div style="padding:14px">
          <p class="muted" style="font-size:11px;margin-bottom:6px" id="detayModAciklama"></p>
          <div id="detayliAnalizIcerik" class="grid-3"></div>
        </div>
      </details>
    `;
  }

  el.innerHTML = html;
  if (detayliGoster) renderDetayliAnaliz();
}

export function renderDetayliAnaliz() {
  if (!RAPOR_DURUM || !RAPOR_DURUM.map) {
    const el = $('detayliAnalizIcerik');
    if (el) el.innerHTML = '<p class="muted">Veri yok</p>';
    return;
  }
  const { map } = RAPOR_DURUM;
  const el = $('detayliAnalizIcerik');
  if (!el) return;

  const aciklama = $('detayModAciklama');
  const entries = [...map.values()];
  if (!entries.length) {
    el.innerHTML = '<p class="muted">Analiz edilecek veri bulunamadı</p>';
    return;
  }

  if (aciklama) aciklama.textContent = 'Her ders için o dersi alan tüm öğrencilerin başarı sıralaması gösterilir.';

  const byDers = new Map();
  entries.forEach(e => {
    if (!byDers.has(e.ders)) byDers.set(e.ders, { ders: e.ders, ogrenciler: [] });
    byDers.get(e.ders).ogrenciler.push(e);
  });

  let idx = 0;
  el.innerHTML = [...byDers.values()].map(grup => {
    const c = RENKLER[idx % RENKLER.length];
    idx++;

    const ogrSirali = grup.ogrenciler.map(d => {
      const dNets = d.denemeler.map(x => x.net);
      const dOrt = dNets.reduce((a, b) => a + b, 0) / (dNets.length || 1);
      return { ...d, dOrt };
    }).sort((a, b) => b.dOrt - a.dOrt);

    const ogrSatir = ogrSirali.map((d, siraIdx) => {
      const dNets = d.denemeler.map(x => x.net);
      const tr = dNets.length >= 2
        ? (dNets[dNets.length - 1] > dNets[dNets.length - 2] ? '📈' : dNets[dNets.length - 1] < dNets[dNets.length - 2] ? '📉' : '➡️')
        : '➡️';
      const mx = Math.max(...dNets.map(Math.abs), 1);
      const bars = d.denemeler.map(dn => `
        <div class="bar-row">
          <span style="width:44px">${fmtTarih(dn.tarih)}</span>
          <div class="bar" style="width:${Math.max(5, (Math.abs(dn.net) / mx) * 100)}%;background:${c};opacity:.7"></div>
          <span class="mono">${dn.net.toFixed(1)}</span>
        </div>
      `).join('');

      return `
        <div style="margin-top:8px;padding-top:6px;border-top:1px solid var(--border)">
          <div class="flex" style="justify-content:space-between">
            <b style="font-size:12px"><span class="muted" style="font-size:10px;font-weight:400">${siraIdx + 1}.</span> ${d.ogrenciAd}</b>
            <span style="font-size:11px;color:var(--muted)">${tr} Ort: ${d.dOrt.toFixed(2)}</span>
          </div>
          <div style="margin-top:4px">${bars}</div>
        </div>
      `;
    }).join('');

    return `<div class="card"><b style="font-size:14px;color:var(--indigo)">${grup.ders}</b>${ogrSatir}</div>`;
  }).join('');
}

export function raporPDF() {
  const sonucEl = $('raporSonuc');
  const gelisimEl = $('raporGelisimAnaliz');
  const siralamaEl = $('raporSinifSiralama');
  const altindaEl = $('raporOrtalamaAltinda');
  const doluMu = (sonucEl && sonucEl.innerHTML.trim()) ||
    (gelisimEl && !gelisimEl.classList.contains('hidden')) ||
    (siralamaEl && !siralamaEl.classList.contains('hidden')) ||
    (altindaEl && !altindaEl.classList.contains('hidden'));

  if (!doluMu) {
    toast('Önce rapor oluşturun', false);
    return;
  }

  const raporSec = $('rapor');
  const kapaliDetails = [...raporSec.querySelectorAll('details:not([open])')];
  kapaliDetails.forEach(d => d.open = true);

  document.body.classList.add('print-rapor');
  document.title = 'Rapor - ' + new Date().toISOString().split('T')[0];

  const temizle = () => {
    document.body.classList.remove('print-rapor');
    document.title = 'Öğrenci Takip Sistemi';
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
      if (document.body.classList.contains('print-rapor')) temizle();
    }, 1500);
  }, 250);
}
