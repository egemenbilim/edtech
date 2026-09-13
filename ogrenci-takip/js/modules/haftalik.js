/* ══════════════════════════════════════════════════════
   Öğrenci Takip Sistemi — Haftalık Soru Kayıtları Modülü
   ══════════════════════════════════════════════════════ */

import { DB, saveDB, nid, netHesapla } from '../state.js';
import { $, toast, fmtTarih, ogrenciAdi, pastaGrafik, promptKopyala } from '../utils.js';

export function hfBitisOtomatik() {
  const b = $('hfBas').value;
  if (!b) return;
  const d = new Date(b);
  d.setDate(d.getDate() + 6);
  $('hfBit').value = d.toISOString().split('T')[0];
}

export function hfDersOnerileriGuncelle() {
  const dl = $('hfDersOneri');
  if (!dl) return;

  const set = new Set([
    'Türkçe', 'Paragraf', 'Matematik', 'Problemler', 'Geometri',
    'Fizik', 'Kimya', 'Biyoloji', 'Tarih', 'Coğrafya', 'Felsefe',
    'İngilizce', 'Edebiyat'
  ]);

  DB.haftalik.forEach(h => { if (h.ders) set.add(h.ders); });
  DB.sonuclar.forEach(s => { if (s.ders) set.add(s.ders); });

  dl.innerHTML = [...set].sort().map(d => `<option value="${d}"></option>`).join('');
}

export function hfKaydet() {
  const oid = Number($('hfOgrenci').value);
  const dersAd = $('hfDers').value.trim();

  if (!oid || !$('hfBas').value) {
    toast('Öğrenci ve tarih zorunlu', false);
    return;
  }
  if (!dersAd) {
    toast('Ders adı zorunlu', false);
    return;
  }

  DB.haftalik.push({
    id: nid(),
    ogrenciId: oid,
    ders: dersAd,
    haftaBas: $('hfBas').value,
    haftaBit: $('hfBit').value,
    soruSayisi: Number($('hfSoru').value) || 0,
    dogru: Number($('hfDogru').value) || 0,
    yanlis: Number($('hfYanlis').value) || 0,
    bos: Number($('hfBos').value) || 0,
    net: netHesapla('TYT', Number($('hfDogru').value) || 0, Number($('hfYanlis').value) || 0)
  });

  saveDB();
  toast('Eklendi');
  ['hfSoru', 'hfDogru', 'hfYanlis', 'hfBos'].forEach(i => { $(i).value = 0; });
  $('hfNet').textContent = '0.00';
  hfDersOnerileriGuncelle();
  renderHaftalik();
}

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
}

export function hfTopluEkle(c) {
  const o = DB.ogrenciler.find(x => x.adSoyad.toLowerCase() === c.ogrenci.toLowerCase());
  if (!o) { toast(`${c.ogrenci} bulunamadı`, false); return; }

  const p = c.tarih ? c.tarih.split('.').reverse().join('-') : new Date().toISOString().split('T')[0];
  const dogru = c.dogru || 0;
  const yanlis = c.yanlis || 0;
  const soru = c.soru || (dogru + yanlis);
  const bos = soru - dogru - yanlis;
  const net = netHesapla('TYT', dogru, yanlis);

  DB.haftalik.push({
    id: nid(),
    ogrenciId: o.id,
    ders: c.ders,
    haftaBas: p,
    haftaBit: p,
    soruSayisi: soru,
    dogru: dogru,
    yanlis: yanlis,
    bos: Math.max(0, bos),
    net: net
  });
  saveDB();
}

export function hfSil(id) {
  DB.haftalik = DB.haftalik.filter(h => h.id !== id);
  saveDB();
  renderHaftalik();
  toast('Silindi');
}

export function renderHaftalik() {
  const f = Number($('filtreHfOgrenci').value) || 0;
  const rk = $('hfRaporKart');
  if (rk) rk.classList.toggle('hidden', !f);

  const list = f ? DB.haftalik.filter(h => h.ogrenciId === f) : DB.haftalik;
  const container = $('haftalikTablosu');
  if (!container) return;

  if (!list.length) {
    container.innerHTML = '<div class="empty">Kayıt yok.</div>';
    return;
  }

  const rows = [...list].reverse().map(h => `
    <tr>
      <td style="font-weight:600">${ogrenciAdi(h.ogrenciId)}</td>
      <td>${h.ders}</td>
      <td style="font-size:11px;color:var(--muted)">${fmtTarih(h.haftaBas)} – ${fmtTarih(h.haftaBit)}</td>
      <td class="num">${h.soruSayisi}</td>
      <td class="num green">${h.dogru}</td>
      <td class="num red-c">${h.yanlis}</td>
      <td class="num muted">${h.bos}</td>
      <td class="num mono" style="color:var(--indigo)">${h.net.toFixed(2)}</td>
      <td class="num"><button class="btn sm red" onclick="window.hfSil(${h.id})">🗑️</button></td>
    </tr>
  `).join('');

  container.innerHTML = `
    <table class="table">
      <thead><tr><th>Öğrenci</th><th>Ders</th><th>Hafta</th><th class="num">Soru</th><th class="num">D</th><th class="num">Y</th><th class="num">B</th><th class="num">Net</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

export function hfRaporAl() {
  const oid = Number($('filtreHfOgrenci').value) || 0;
  if (!oid) { toast('Önce bir öğrenci seçin', false); return; }

  const bas = $('hfRaporBas').value, bit = $('hfRaporBit').value;
  let kayitlar = DB.haftalik.filter(h => h.ogrenciId === oid);
  if (bas) kayitlar = kayitlar.filter(h => h.haftaBas >= bas);
  if (bit) kayitlar = kayitlar.filter(h => h.haftaBas <= bit);
  kayitlar.sort((a, b) => a.haftaBas.localeCompare(b.haftaBas));

  if (!kayitlar.length) { toast('Seçilen tarihlerde kayıt yok', false); return; }

  const tabloOk = $('hfRaporTablo').checked;
  const ozetOk = $('hfRaporOzet').checked;
  const pastaOk = $('hfRaporPasta').checked;
  const ogrAd = ogrenciAdi(oid);

  let tarihAralik = '';
  if (bas && bit) tarihAralik = fmtTarih(bas) + ' – ' + fmtTarih(bit);
  else if (bas) tarihAralik = fmtTarih(bas) + ' sonrası';
  else if (bit) tarihAralik = fmtTarih(bit) + ' öncesi';
  else tarihAralik = 'Tüm kayıtlar';

  let h = `
    <div class="surec-rapor">
      <div class="sr-head">
        <div class="sr-title">${ogrAd} — Haftalık Rapor</div>
        <div class="sr-sub">${tarihAralik} • ${new Date().toLocaleDateString('tr-TR')}</div>
      </div>
  `;

  const tS = kayitlar.reduce((a, k) => a + (k.soruSayisi || 0), 0);
  const tD = kayitlar.reduce((a, k) => a + (k.dogru || 0), 0);
  const tY = kayitlar.reduce((a, k) => a + (k.yanlis || 0), 0);
  const tB = kayitlar.reduce((a, k) => a + (k.bos || 0), 0);
  const tN = kayitlar.reduce((a, k) => a + (k.net || 0), 0);

  h += `
    <table class="sr-tbl"><tbody>
      <tr><td class="sr-k">Kayıt Sayısı</td><td>${kayitlar.length}</td><td class="sr-k">Toplam Soru</td><td>${tS}</td></tr>
      <tr><td class="sr-k">Toplam Doğru</td><td>${tD}</td><td class="sr-k">Toplam Yanlış</td><td>${tY}</td></tr>
      <tr><td class="sr-k">Toplam Boş</td><td>${tB}</td><td class="sr-k">Toplam Net</td><td>${tN.toFixed(2)}</td></tr>
    </tbody></table>
  `;

  if (tabloOk) {
    h += `<div class="sr-sinif-ad" style="margin-top:8px">Detaylı Kayıtlar</div>`;
    h += `<table class="sr-tbl sr-liste"><thead><tr><th>Tarih</th><th>Ders</th><th>Soru</th><th>D</th><th>Y</th><th>B</th><th>Net</th></tr></thead><tbody>`;
    kayitlar.forEach(k => {
      h += `<tr><td>${fmtTarih(k.haftaBas)}${k.haftaBit && k.haftaBit !== k.haftaBas ? ' – ' + fmtTarih(k.haftaBit) : ''}</td><td>${k.ders}</td><td>${k.soruSayisi || 0}</td><td>${k.dogru || 0}</td><td>${k.yanlis || 0}</td><td>${k.bos || 0}</td><td>${(k.net || 0).toFixed(2)}</td></tr>`;
    });
    h += '</tbody></table>';
  }

  const dersMap = new Map();
  kayitlar.forEach(k => {
    if (!dersMap.has(k.ders)) dersMap.set(k.ders, { ders: k.ders, soru: 0, dogru: 0, yanlis: 0, bos: 0, net: 0 });
    const m = dersMap.get(k.ders);
    m.soru += k.soruSayisi || 0;
    m.dogru += k.dogru || 0;
    m.yanlis += k.yanlis || 0;
    m.bos += k.bos || 0;
    m.net += k.net || 0;
  });

  const dersOzet = [...dersMap.values()].sort((a, b) => b.soru - a.soru);
  if (ozetOk) {
    h += `<div class="sr-sinif-ad" style="margin-top:8px">Ders Bazlı Özet</div>`;
    h += `<table class="sr-tbl sr-liste"><thead><tr><th>Ders</th><th>Soru</th><th>Doğru</th><th>Yanlış</th><th>Boş</th><th>Net</th></tr></thead><tbody>`;
    dersOzet.forEach(m => {
      h += `<tr><td>${m.ders}</td><td>${m.soru}</td><td>${m.dogru}</td><td>${m.yanlis}</td><td>${m.bos}</td><td>${m.net.toFixed(2)}</td></tr>`;
    });
    h += '</tbody></table>';
  }

  if (pastaOk && dersOzet.length) {
    const toplamSoru = dersOzet.reduce((a, m) => a + m.soru, 0);
    if (toplamSoru > 0) {
      h += `<div class="sr-sinif-ad" style="margin-top:8px">Ders Dağılımı (Çözülen Soru)</div>`;
      h += pastaGrafik(dersOzet.map(m => ({ ad: m.ders, deger: m.soru })));
    }
  }

  h += `<div class="sr-foot">Belge Oluşturma Tarihi: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div></div>`;

  $('hfPrintAlan').innerHTML = h;
  document.body.classList.add('print-hf');
  const eskiBaslik = document.title;
  document.title = ogrAd + ' - Brans Raporu';

  const temizle = () => {
    document.body.classList.remove('print-hf');
    document.title = eskiBaslik;
    $('hfPrintAlan').innerHTML = '';
  };
  const after = () => {
    temizle();
    window.removeEventListener('afterprint', after);
  };
  window.addEventListener('afterprint', after);

  toast('Yazdırma penceresi açılıyor — "PDF olarak kaydet" seçin');
  setTimeout(() => {
    window.print();
    setTimeout(() => {
      if (document.body.classList.contains('print-hf')) temizle();
    }, 1500);
  }, 250);
}
