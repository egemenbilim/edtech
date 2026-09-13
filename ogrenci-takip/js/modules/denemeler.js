/* ══════════════════════════════════════════════════════
   Öğrenci Takip Sistemi — Denemeler Modülü
   ══════════════════════════════════════════════════════ */

import {
  DB, saveDB, nid, netHesapla, DERS_TANIM,
  ALAN_ADI, dersMax, denemeBulVeyaOlustur, denemeSinifOrt
} from '../state.js';
import { $, toast, fmtTarih, ogrenciAdi } from '../utils.js';

export let AKTIF_DERSLER = [];
let topluDurum = null;

let onUpdateSelectsCallback = null;
export function setSelectUpdateCallback(cb) {
  onUpdateSelectsCallback = cb;
}
function notifySelects() {
  if (onUpdateSelectsCallback) onUpdateSelectsCallback();
}

export function aktifDersKey() {
  const t = $('denTur').value;
  return t === 'AYT' ? ($('denAlan').value || 'AYT-SAY') : t;
}

export function dersListesiniOlustur() {
  const t = $('denTur').value;
  const wrap = $('denAlanWrap');
  if (wrap) wrap.classList.toggle('hidden', t !== 'AYT');

  const key = aktifDersKey();
  AKTIF_DERSLER = DERS_TANIM[key] || [];

  $('denTurLabel').textContent = t === 'AYT' ? `AYT — ${ALAN_ADI[key]}` : t;
  $('denKural').textContent = (t === 'LGS' ? '3 yanlış 1 doğruyu götürür' : '4 yanlış 1 doğruyu götürür') +
    ' • Doğru+Yanlış+Boş toplamı ders maksimumunu aşamaz';

  const table = $('dersTablosu');
  if (!table) return;

  table.innerHTML = `
    <thead>
      <tr><th>Ders</th><th class="num">Maks. Soru</th><th class="num">Doğru</th><th class="num">Yanlış</th><th class="num">Boş</th><th class="num">Net</th></tr>
    </thead>
    <tbody>
      ${AKTIF_DERSLER.map(([d, m], i) => `
        <tr id="dr_${i}">
          <td style="font-weight:600">${d}</td>
          <td class="num mono muted">${m}</td>
          ${['d', 'y', 'b'].map(f => `
            <td class="num"><input type="number" min="0" max="${m}" value="0" id="d_${i}_${f}" style="width:64px;text-align:center" oninput="window.dNG(${i})"></td>
          `).join('')}
          <td class="num mono" id="d_${i}_n" style="color:var(--indigo)">0.00</td>
        </tr>
      `).join('')}
    </tbody>
  `;

  denUyariGuncelle();
}

export function dNG(i) {
  const d = Number($(`d_${i}_d`).value) || 0;
  const y = Number($(`d_${i}_y`).value) || 0;
  $(`d_${i}_n`).textContent = netHesapla($('denTur').value, d, y).toFixed(2);
  denUyariGuncelle();
}

export function denUyariGuncelle() {
  const bad = [];
  AKTIF_DERSLER.forEach(([ders, max], i) => {
    const de = $(`d_${i}_d`), ye = $(`d_${i}_y`), be = $(`d_${i}_b`);
    if (!de || !ye || !be) return;
    const tp = (Number(de.value) || 0) + (Number(ye.value) || 0) + (Number(be.value) || 0);
    const row = $(`dr_${i}`);
    const asim = max && tp > max;
    if (row) row.style.background = asim ? '#fef2f2' : '';
    if (asim) bad.push(`${ders} (${tp}/${max})`);
  });

  const el = $('denUyari');
  if (el) {
    if (bad.length) {
      el.textContent = '⚠️ Maksimum soru sayısı aşıldı → ' + bad.join(', ');
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  }
  return bad;
}

export function denemeKaydet() {
  const oid = Number($('denOgrenci').value);
  if (!oid) { toast('Öğrenci seçin', false); return; }

  const tur = $('denTur').value;
  const tarih = $('denTarih').value || new Date().toISOString().split('T')[0];
  const ad = $('denAd').value.trim() || `${tur} Deneme - ${fmtTarih(tarih)}`;

  const asim = denUyariGuncelle();
  if (asim.length) {
    toast('Maksimum soru sayısı aşıldı: ' + asim.join(', '), false);
    return;
  }

  const son = [];
  AKTIF_DERSLER.forEach(([ders], i) => {
    const d = Number($(`d_${i}_d`).value) || 0;
    const y = Number($(`d_${i}_y`).value) || 0;
    const b = Number($(`d_${i}_b`).value) || 0;
    if (d > 0 || y > 0 || b > 0) {
      son.push({ ders, dogru: d, yanlis: y, bos: b, net: netHesapla(tur, d, y) });
    }
  });

  if (!son.length) { toast('En az bir ders girin', false); return; }

  const { deneme, yeni } = denemeBulVeyaOlustur(ad, tur, tarih);

  if (DB.sonuclar.some(s => s.denemeId === deneme.id && s.ogrenciId === oid)) {
    toast('Bu öğrencinin bu denemede kaydı zaten var', false);
    return;
  }

  son.forEach(s => DB.sonuclar.push({ id: nid(), denemeId: deneme.id, ogrenciId: oid, ...s }));
  saveDB();
  toast(`${ogrenciAdi(oid)} — ${son.length} ders kaydedildi${yeni ? '' : ' (mevcut denemeye eklendi)'}`);

  $('denOgrenci').value = '';
  $('denAd').value = '';
  dersListesiniOlustur();
  renderDenemeler();
}

export function denemeSil(id) {
  if (!confirm('Deneme ve sonuçları silinsin mi?')) return;
  DB.denemeler = DB.denemeler.filter(d => d.id !== id);
  DB.sonuclar = DB.sonuclar.filter(s => s.denemeId !== id);
  saveDB();
  renderDenemeler();
  toast('Silindi');
}

export function renderDenemeler() {
  const container = $('denemeListesi');
  if (!container) return;

  if (!DB.denemeler.length) {
    container.innerHTML = '<div class="empty">Henüz deneme yok.</div>';
    return;
  }

  container.innerHTML = [...DB.denemeler].reverse().map(d => {
    const rows = DB.sonuclar.filter(s => s.denemeId === d.id);
    const ogrSay = new Set(rows.map(s => s.ogrenciId)).size;
    const ort = denemeSinifOrt(d.id, null);
    return `
      <div class="row">
        <div class="flex">
          <span class="badge" style="background:#fffbeb;color:var(--amber)">📝</span>
          <div>
            <b>${d.ad}</b>
            <div class="muted" style="font-size:11px">
              ${d.tur} • ${fmtTarih(d.tarih)} • ${ogrSay} öğrenci • ${rows.length} sonuç${ort !== null ? ' • Genel ort: ' + ort.toFixed(2) : ''}
            </div>
          </div>
        </div>
        <button class="btn sm red" onclick="window.denemeSil(${d.id})">🗑️</button>
      </div>
    `;
  }).join('');
}

/* ═════ DENEME TOPLU GİRİŞİ (AI PARSER) ═════ */
export function gosterOrnek() {
  $('topluMetin').value = `Sınav Türü: AYT\nSınav Tarihi: 06.03.2027\nDeneme Adı: Özdebir AYT 1\n\nÖğrenci Adı: Egemen Bilim\n"Matematik    15 / 5\n"Fizik        6 / 0\n"Kimya        1 / 3\n"Biyoloji     4 / 1\n\nÖğrenci Adı: Zeynep Kaya\n"Matematik    20 / 3\n"Fizik        8 / 1\n"Kimya        4 / 2\n"Biyoloji     5 / 0`;
  toast('Örnek yüklendi');
}

export function parseTopluMetin(text) {
  const ln = text.split(/\r?\n/);
  let tur = '', tarih = '', denAd = '';

  for (const raw of ln) {
    const s = raw.trim();
    if (!tur) {
      const m = s.match(/^Sınav Türü\s*:\s*(TYT|AYT|LGS)\s*$/i);
      if (m) tur = m[1].toUpperCase();
    }
    if (!tarih) {
      const m = s.match(/^Sınav Tarihi\s*:\s*(\d{1,2})\.(\d{1,2})\.(\d{4})\s*$/);
      if (m) tarih = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
    if (!denAd) {
      const m = s.match(/^Deneme Adı\s*:\s*(.+)/i);
      if (m) denAd = m[1].trim();
    }
  }

  if (!tur) return { error: 'Sınav Türü bulunamadı' };
  if (!tarih) return { error: 'Sınav Tarihi bulunamadı (GG.AA.YYYY)' };

  const ogr = [];
  let cur = null;

  for (const raw of ln) {
    const s = raw.trim();
    if (!s) continue;
    const mA = s.match(/^Öğrenci Adı\s*:\s*(.+)/i);
    if (mA) {
      if (cur && cur.dersler.length) ogr.push(cur);
      cur = { ogrenci: mA[1].trim(), dersler: [] };
      continue;
    }
    if (!cur) continue;
    if (/^(Sınav|Deneme|Öğrenci|Sınıf|Ders Bazlı)/i.test(s)) continue;
    if (s.indexOf(':') >= 0) continue;

    const m = s.match(/^\s*["""']?\s*(.+?)\s+(\d{1,3})\s*\/\s*(\d{0,3})\s*$/);
    if (m) {
      const d = m[1].trim().replace(/^["""']+/, '').trim();
      const dg = Number(m[2]) || 0;
      const yl = Number(m[3]) || 0;
      if (d && (dg > 0 || yl > 0)) {
        cur.dersler.push({ ders: d, dogru: dg, yanlis: yl, bos: 0 });
      }
    }
  }

  if (cur && cur.dersler.length) ogr.push(cur);
  if (!ogr.length) return { error: 'Öğrenci/ders verisi bulunamadı' };

  return { tur, tarih, denAd, ogrenciler: ogr };
}

export function topluSonuclariTemizle() {
  topluDurum = null;
  $('topluPreviewCard').classList.add('hidden');
  $('topluHata').classList.add('hidden');
  $('topluMetin').value = '';
}

export function topluDegerlendir() {
  const t = $('topluMetin').value.trim();
  if (!t) { toast('Metin boş', false); return; }

  $('topluHata').classList.add('hidden');
  const r = parseTopluMetin(t);
  if (r.error) {
    $('topluHata').textContent = '❌ ' + r.error;
    $('topluHata').classList.remove('hidden');
    toast(r.error, false);
    return;
  }

  topluDurum = r;
  $('pvTur').textContent = r.tur;
  $('pvDenAd').textContent = r.denAd || '(otomatik)';
  $('pvTarih').textContent = fmtTarih(r.tarih);
  $('pvOgrenciSay').textContent = r.ogrenciler.length;

  const asimlar = topluAsimlar(r);
  let all = '';
  if (asimlar.length) {
    all += `<div class="alert err">⚠️ Maksimum soru sayısı aşımı → ${asimlar.join(' • ')}</div>`;
  }

  r.ogrenciler.forEach((st, i) => {
    const rows = st.dersler.map(d => {
      const mx = dersMax(r.tur, d.ders);
      const tp = d.dogru + d.yanlis;
      const bad = mx && tp > mx;
      return `
        <tr style="${bad ? 'background:#fef2f2' : ''}">
          <td>${d.ders}</td>
          <td class="num muted mono">${mx || '—'}</td>
          <td class="num green">${d.dogru}</td>
          <td class="num red-c">${d.yanlis}</td>
          <td class="num mono">${netHesapla(r.tur, d.dogru, d.yanlis).toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const tot = st.dersler.reduce((a, d) => a + netHesapla(r.tur, d.dogru, d.yanlis), 0);
    all += `
      <div style="margin:10px 0">
        <h3 style="font-size:13px;color:var(--indigo)">
          ${i + 1}. ${st.ogrenci}
          <span class="muted" style="font-size:11px">(${st.dersler.length} ders • Toplam net ${tot.toFixed(2)})</span>
        </h3>
        <div style="overflow-x:auto">
          <table class="table">
            <thead><tr><th>Ders</th><th class="num">Maks.</th><th class="num">D</th><th class="num">Y</th><th class="num">Net</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  });

  $('topluDersTablosu').innerHTML = all;
  $('topluPreviewCard').classList.remove('hidden');
  toast(asimlar.length ? `Önizleme: ${r.ogrenciler.length} öğrenci • ${asimlar.length} aşım var` : `Önizleme: ${r.ogrenciler.length} öğrenci`, !asimlar.length);
}

export function topluAsimlar(r) {
  const out = [];
  r.ogrenciler.forEach(st => st.dersler.forEach(d => {
    const mx = dersMax(r.tur, d.ders);
    const tp = d.dogru + d.yanlis;
    if (mx && tp > mx) out.push(`${st.ogrenci} / ${d.ders} (${tp}/${mx})`);
  }));
  return out;
}

export function topluKaydet() {
  if (!topluDurum) { toast('Önce önizleyin', false); return; }
  const { tur, tarih, denAd, ogrenciler } = topluDurum;
  const asimlar = topluAsimlar(topluDurum);

  if (asimlar.length) {
    $('topluHata').textContent = '❌ Maksimum soru sayısı aşıldı → ' + asimlar.join(' • ');
    $('topluHata').classList.remove('hidden');
    toast('Maksimum soru sayısı aşıldı, kayıt yapılmadı', false);
    return;
  }

  const ad = denAd || `${tur} Deneme - ${fmtTarih(tarih)}`;
  const { deneme, yeni } = denemeBulVeyaOlustur(ad, tur, tarih);

  let yeniOgr = 0, total = 0, atlanan = 0;
  for (const st of ogrenciler) {
    let o = DB.ogrenciler.find(x => x.adSoyad.toLowerCase() === st.ogrenci.toLowerCase());
    if (!o) {
      if (!DB.siniflar.length) { toast('Önce sınıf ekleyin', false); return; }
      o = { id: nid(), adSoyad: st.ogrenci, sinifId: DB.siniflar[0].id, alan: '', veli: '' };
      DB.ogrenciler.push(o);
      yeniOgr++;
    }

    if (DB.sonuclar.some(s => s.denemeId === deneme.id && s.ogrenciId === o.id)) {
      atlanan++;
      continue;
    }

    st.dersler.forEach(d => DB.sonuclar.push({
      id: nid(),
      denemeId: deneme.id,
      ogrenciId: o.id,
      ders: d.ders,
      dogru: d.dogru,
      yanlis: d.yanlis,
      bos: d.bos,
      net: netHesapla(tur, d.dogru, d.yanlis)
    }));
    total += st.dersler.length;
  }

  saveDB();
  notifySelects();

  let msg = `${ogrenciler.length - atlanan} öğrenci • ${total} ders kaydedildi`;
  if (!yeni) msg += ' (mevcut denemeye eklendi)';
  if (yeniOgr) msg += ` • ${yeniOgr} yeni öğrenci`;
  if (atlanan) msg += ` • ${atlanan} mükerrer atlandı`;

  toast(msg);
  dersListesiniOlustur();
  renderDenemeler();
  topluSonuclariTemizle();
}
