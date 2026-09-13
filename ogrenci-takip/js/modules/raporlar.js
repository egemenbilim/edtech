/* ══════════════════════════════════════════════════════
   Öğrenci Takip Sistemi — Raporlar Modülü
   ══════════════════════════════════════════════════════ */

import { DB, sinifAdi, ogrenciDersNet, RENKLER } from '../state.js';
import { $, toast, fmtTarih, ogrenciAdi, cizgiGrafik } from '../utils.js';

let RAPOR_DURUM = null;

export function doldurRaporFiltreleri() {
  const ogrSel = $('raporOgrenciSelect');
  if (ogrSel) {
    ogrSel.innerHTML = DB.ogrenciler.map(o => `
      <option value="${o.id}">${o.adSoyad} (${sinifAdi(o.sinifId)})</option>
    `).join('');
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

export function renderGelisimAnalizi(ogrIds, dersF) {
  const el = $('raporGelisimAnaliz');
  if (!el) return;

  el.innerHTML = '';
  el.classList.add('hidden');

  const denemeler = seciliGelisimDenemeleri();
  if (denemeler.length < 2) return;

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

  const sinifOrtEkle = true;
  const altindaEkle = $('raporAltinda') && $('raporAltinda').checked;
  const gelisimGoster = !$('raporGelisimGoster') || $('raporGelisimGoster').checked;
  const dersIlerleyisGoster = !$('raporDersIlerleyis') || $('raporDersIlerleyis').checked;

  if (!gelisimGoster && !dersIlerleyisGoster && !altindaEkle) {
    el.innerHTML = '';
    el.classList.add('hidden');
    return;
  }

  let chartKeys = analiz.map(a => a.ad);
  if (sinifOrtEkle) {
    chartData.forEach((row, idx) => {
      const d = denemeler[idx];
      if (!d) return;
      const tumSonuc = DB.sonuclar.filter(x => x.denemeId === d.id && (dersler.length ? dersler.includes(x.ders) : true));
      const perOgr = {};
      tumSonuc.forEach(x => { perOgr[x.ogrenciId] = (perOgr[x.ogrenciId] || 0) + x.net; });
      const vals = Object.values(perOgr);
      if (vals.length) row['📊 Sınıf Ort.'] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
    });
    chartKeys = [...chartKeys, '📊 Sınıf Ort.'];
  }

  let h = `
    <details style="border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:12px">
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

  if (dersIlerleyisGoster) {
    h += `
      <details style="border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:12px">
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

  if (altindaEkle) {
    h += `
      <details style="border:1px solid #fecaca;border-radius:12px;overflow:hidden;margin-bottom:12px;background:#fef2f2">
        <summary style="cursor:pointer;padding:12px 14px;background:#fee2e2;font-size:15px;font-weight:700;color:#991b1b;list-style:none;display:flex;justify-content:space-between;align-items:center">
          <span>⚠️ Sınıf Ortalaması Altında Kalanlar</span><span style="font-size:11px;color:#991b1b">▼ aç / kapat</span>
        </summary>
        <div style="padding:14px">
    `;

    const altDenemeler = denemeler;
    const etiket = `Seçili ${altDenemeler.length} Deneme (ortalama)`;

    const ogrDenemeNet = {};
    const ogrDersNetMap = {};

    altDenemeler.forEach(dd => {
      const sonuc = DB.sonuclar.filter(x => x.denemeId === dd.id && (dersler.length ? dersler.includes(x.ders) : true));
      sonuc.forEach(x => {
        if (!ogrDenemeNet[x.ogrenciId]) ogrDenemeNet[x.ogrenciId] = {};
        ogrDenemeNet[x.ogrenciId][dd.id] = (ogrDenemeNet[x.ogrenciId][dd.id] || 0) + x.net;
      });

      if (dersler.length) {
        DB.sonuclar.filter(x => x.denemeId === dd.id).forEach(x => {
          if (!ogrDersNetMap[x.ogrenciId]) ogrDersNetMap[x.ogrenciId] = {};
          if (!ogrDersNetMap[x.ogrenciId][x.ders]) ogrDersNetMap[x.ogrenciId][x.ders] = {};
          ogrDersNetMap[x.ogrenciId][x.ders][dd.id] = x.net;
        });
      }
    });

    const denemeOrtalari = altDenemeler.map(dd => {
      const perOgr = {};
      const sonuc = DB.sonuclar.filter(x => x.denemeId === dd.id && (dersler.length ? dersler.includes(x.ders) : true));
      sonuc.forEach(x => { perOgr[x.ogrenciId] = (perOgr[x.ogrenciId] || 0) + x.net; });
      const vals = Object.values(perOgr);
      return vals.length ? vals.reduce((a2, b) => a2 + b, 0) / vals.length : 0;
    });
    const sinifGenelOrt = denemeOrtalari.length ? denemeOrtalari.reduce((a2, b) => a2 + b, 0) / denemeOrtalari.length : 0;

    const genelAlt = [];
    analiz.forEach(a => {
      const netler = Object.values(ogrDenemeNet[a.oid] || {});
      const ogrNet = netler.length ? netler.reduce((a2, b) => a2 + b, 0) / netler.length : 0;
      if (ogrNet > 0 && ogrNet < sinifGenelOrt) {
        genelAlt.push({ ad: a.ad, net: ogrNet, ort: sinifGenelOrt, fark: ogrNet - sinifGenelOrt });
      }
    });

    h += `<h3 style="font-size:14px;margin-bottom:6px">📊 Genel (${etiket})</h3>`;
    if (genelAlt.length) {
      h += `
        <div style="overflow-x:auto">
          <table class="table">
            <thead><tr><th>Öğrenci</th><th class="num">Ort. Net</th><th class="num">Sınıf Ort.</th><th class="num">Fark</th><th class="num">%</th></tr></thead>
            <tbody>
              ${genelAlt.sort((a, b) => a.fark - b.fark).map(x => {
                const yuzde = x.ort === 0 ? 0 : ((x.fark / x.ort) * 100);
                return `<tr><td style="font-weight:600">${x.ad}</td><td class="num mono">${x.net.toFixed(2)}</td><td class="num mono muted">${x.ort.toFixed(2)}</td><td class="num mono red-c">${x.fark.toFixed(2)}</td><td class="num mono red-c">${yuzde.toFixed(1)}%</td></tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      h += '<p class="muted" style="font-size:12px">Tüm öğrenciler sınıf ortalamasının üstünde. 🎉</p>';
    }

    if (dersler.length) {
      h += `<h3 style="font-size:14px;margin:14px 0 6px">📚 Ders Bazlı</h3>`;
      dersler.forEach(ders => {
        const dersAlt = [];
        const dOrtalari = altDenemeler.map(dd => {
          const ds = DB.sonuclar.filter(x => x.denemeId === dd.id && x.ders === ders);
          if (!ds.length) return null;
          return ds.reduce((a2, x) => a2 + x.net, 0) / ds.length;
        }).filter(v => v !== null);
        const dSinifOrt = dOrtalari.length ? dOrtalari.reduce((a2, b) => a2 + b, 0) / dOrtalari.length : 0;

        analiz.forEach(a => {
          const oD = ogrDersNetMap[a.oid] && ogrDersNetMap[a.oid][ders] ? Object.values(ogrDersNetMap[a.oid][ders]) : [];
          const ogrNet = oD.length ? oD.reduce((a2, b) => a2 + b, 0) / oD.length : 0;
          if (ogrNet > 0 && ogrNet < dSinifOrt) {
            dersAlt.push({ ad: a.ad, net: ogrNet, ort: dSinifOrt, fark: ogrNet - dSinifOrt });
          }
        });

        h += `<div style="margin:8px 0"><b style="font-size:13px;color:var(--indigo)">${ders}</b>`;
        if (dersAlt.length) {
          h += `
            <div style="overflow-x:auto;margin-top:4px">
              <table class="table">
                <thead><tr><th>Öğrenci</th><th class="num">Ort. Net</th><th class="num">Sınıf Ort.</th><th class="num">Fark</th><th class="num">%</th></tr></thead>
                <tbody>
                  ${dersAlt.sort((a, b) => a.fark - b.fark).map(x => {
                    const yuzde = x.ort === 0 ? 0 : ((x.fark / x.ort) * 100);
                    return `<tr><td>${x.ad}</td><td class="num mono">${x.net.toFixed(2)}</td><td class="num mono muted">${x.ort.toFixed(2)}</td><td class="num mono red-c">${x.fark.toFixed(2)}</td><td class="num mono red-c">${yuzde.toFixed(1)}%</td></tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `;
        } else {
          h += '<p class="muted" style="font-size:11px;margin-top:2px">Tümü ortalamanın üstünde ✓</p>';
        }
        h += '</div>';
      });
    }

    h += '</div></details>';
  }

  el.innerHTML = h;
  el.classList.remove('hidden');
}

export function renderRapor() {
  const el = $('raporSonuc');
  const ga = $('raporGelisimAnaliz');
  if (ga) { ga.innerHTML = ''; ga.classList.add('hidden'); }
  const sr = $('raporSinifSiralama');
  if (sr) { sr.innerHTML = ''; sr.classList.add('hidden'); }

  const turF = $('raporTur').value;
  const ogrIds = [...$('raporOgrenciSelect').selectedOptions].map(o => Number(o.value)).filter(Boolean);
  const dersF = [...$('raporDersSelect').selectedOptions].map(o => o.value).filter(Boolean);
  const siralamaGoster = $('raporSiralama') && $('raporSiralama').checked;

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

  renderGelisimAnalizi(ogrIds, dersF);

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
  const doluMu = (sonucEl && sonucEl.innerHTML.trim()) ||
    (gelisimEl && !gelisimEl.classList.contains('hidden')) ||
    (siralamaEl && !siralamaEl.classList.contains('hidden'));

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
