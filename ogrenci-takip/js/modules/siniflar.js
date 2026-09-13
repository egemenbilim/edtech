/* ══════════════════════════════════════════════════════
   Öğrenci Takip Sistemi — Sınıflar & Ders Takip Modülü
   ══════════════════════════════════════════════════════ */

import { DB, saveDB, nid, sinifAdi, ogrenciDenemeleri, ogrenciDenemeToplam } from '../state.js';
import { $, toast, fmtTarih, promptKopyala } from '../utils.js';

let SINIF_DETAY_TAB = 'ogrenci';
let SURUKLENEN = null;

let onUpdateSelectsCallback = null;
export function setSelectUpdateCallback(cb) {
  onUpdateSelectsCallback = cb;
}
function notifySelects() {
  if (onUpdateSelectsCallback) onUpdateSelectsCallback();
}

export function sinifEkle() {
  const ad = $('yeniSinif').value.trim();
  if (!ad) { toast('Sınıf adı boş', false); return; }

  const eid = Number($('sinifEditId').value) || 0;
  if (eid) {
    const s = DB.siniflar.find(x => x.id === eid);
    if (!s) return;
    if (DB.siniflar.find(x => x.id !== eid && x.ad.toLowerCase() === ad.toLowerCase())) {
      toast('Bu isimde başka sınıf var', false);
      return;
    }
    s.ad = ad;
    saveDB();
    sinifIptal();
    renderSiniflar();
    notifySelects();
    toast('Sınıf güncellendi');
    return;
  }

  if (DB.siniflar.find(s => s.ad.toLowerCase() === ad.toLowerCase())) {
    toast('Bu sınıf zaten var', false);
    return;
  }

  DB.siniflar.push({ id: nid(), ad });
  saveDB();
  $('yeniSinif').value = '';
  renderSiniflar();
  notifySelects();
  toast('Sınıf eklendi');
}

export function sinifDuzenle(id) {
  const s = DB.siniflar.find(x => x.id === id);
  if (!s) return;
  $('sinifEditId').value = s.id;
  $('yeniSinif').value = s.ad;
  $('sinifFormBaslik').textContent = '✏️ Sınıfı Düzenle';
  $('sinifKaydetBtn').textContent = '💾 Güncelle';
  $('sinifIptalBtn').classList.remove('hidden');
  $('yeniSinif').focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function sinifIptal() {
  $('sinifEditId').value = '';
  $('yeniSinif').value = '';
  $('sinifFormBaslik').textContent = '➕ Yeni Sınıf Ekle';
  $('sinifKaydetBtn').textContent = 'Ekle';
  $('sinifIptalBtn').classList.add('hidden');
}

export function sinifSil(id, ad) {
  if (!confirm(`"${ad}" silinsin mi? Öğrencileri de silinir.`)) return;
  DB.siniflar = DB.siniflar.filter(s => s.id !== id);
  const ids = DB.ogrenciler.filter(o => o.sinifId === id).map(o => o.id);
  DB.ogrenciler = DB.ogrenciler.filter(o => o.sinifId !== id);
  DB.sonuclar = DB.sonuclar.filter(s => !ids.includes(s.ogrenciId));
  DB.haftalik = DB.haftalik.filter(h => !ids.includes(h.ogrenciId));
  DB.konular = (DB.konular || []).filter(k => k.sinifId !== id);

  saveDB();
  renderSiniflar();
  notifySelects();
  const detay = $('sinifDetay');
  if (detay) detay.innerHTML = '';
  toast('Silindi');
}

export function renderSiniflar() {
  const sayisiEl = $('sinifSayisi');
  if (sayisiEl) sayisiEl.textContent = '(' + DB.siniflar.length + ')';

  const listEl = $('sinifListesi');
  if (!listEl) return;

  if (!DB.siniflar.length) {
    listEl.innerHTML = '<div class="empty">Henüz sınıf yok.</div>';
    return;
  }

  listEl.innerHTML = DB.siniflar.map(s => {
    const ogrSay = DB.ogrenciler.filter(o => o.sinifId === s.id).length;
    const konular = (DB.konular || []).filter(k => k.sinifId === s.id);
    const islendi = konular.filter(k => k.durum === 'islendi').length;
    return `
      <div class="row clickable" onclick="window.sinifDetayGoster(${s.id})">
        <div class="flex">
          <span class="badge">${s.ad.charAt(0)}</span>
          <div>
            <b>${s.ad}</b>
            <div class="muted" style="font-size:11px">
              ${ogrSay} öğrenci${konular.length ? ' • ' + islendi + '/' + konular.length + ' konu işlendi' : ''}
            </div>
          </div>
        </div>
        <div class="flex">
          <button class="btn sm gray" onclick="event.stopPropagation(); window.sinifDuzenle(${s.id})">✏️</button>
          <button class="btn sm red" onclick="event.stopPropagation(); window.sinifSil(${s.id}, '${s.ad.replace(/'/g, "\\'")}')">🗑️</button>
        </div>
      </div>
    `;
  }).join('');

  aktifSurecRender();
}

/* ═════ AKTİF DERS SÜRECİ ═════ */
export function aktifSurecRender() {
  const kap = $('surecSinifSecim');
  if (kap) {
    const seciliOnce = new Set([...kap.querySelectorAll('input:checked')].map(c => Number(c.value)));
    kap.innerHTML = DB.siniflar.length
      ? DB.siniflar.map(s => `
          <label class="chk-wrap">
            <input type="checkbox" value="${s.id}" ${seciliOnce.size === 0 || seciliOnce.has(s.id) ? 'checked' : ''} onchange="window.aktifSurecOzetRender()"> ${s.ad}
          </label>
        `).join('')
      : '<span class="muted" style="font-size:12px">Sınıf yok</span>';
  }

  const dKap = $('surecDersSecim');
  if (dKap) {
    const seciliDersOnce = new Set([...dKap.querySelectorAll('input:checked')].map(c => c.value));
    const tumKonuDersleri = [...new Set((DB.konular || []).map(k => k.ders || 'Genel'))].sort();
    dKap.innerHTML = tumKonuDersleri.length
      ? tumKonuDersleri.map(d => `
          <label class="chk-wrap">
            <input type="checkbox" value="${d}" ${seciliDersOnce.size === 0 || seciliDersOnce.has(d) ? 'checked' : ''} onchange="window.aktifSurecOzetRender()"> ${d}
          </label>
        `).join('')
      : '<span class="muted" style="font-size:12px">Henüz konu eklenmedi</span>';
  }

  aktifSurecOzetRender();
}

export function surecSonDurum(sinifId, seciliDersler) {
  let liste = (DB.konular || []).filter(k => k.sinifId === sinifId);
  if (seciliDersler && seciliDersler.length) {
    liste = liste.filter(k => seciliDersler.includes(k.ders || 'Genel'));
  }
  liste.sort((a, b) => a.sira - b.sira);

  const islendiler = liste.filter(k => k.durum === 'islendi');
  const yeniBitti = islendiler.length ? islendiler[islendiler.length - 1] : null;
  const isleniyor = liste.filter(k => k.durum === 'isleniyor');
  const baslanacak = liste.filter(k => k.durum === 'baslanacak');

  let sonAktifIdx = -1;
  liste.forEach((k, i) => {
    if (k.durum === 'islendi' || k.durum === 'isleniyor') sonAktifIdx = i;
  });

  let onumuzdeki = null;
  for (let i = sonAktifIdx + 1; i < liste.length; i++) {
    if (liste[i].durum === 'baslanacak') {
      onumuzdeki = liste[i];
      break;
    }
  }
  if (!onumuzdeki) onumuzdeki = baslanacak.length ? baslanacak[0] : null;

  return { liste, yeniBitti, isleniyor, baslanacak, onumuzdeki, islendiSayi: islendiler.length };
}

export function konuTamAd(k) {
  return (k.etiket ? k.etiket + ' ' : '') + k.baslik;
}

export function aktifSurecOzetRender() {
  const el = $('aktifSurecOzet');
  if (!el) return;

  const secili = [...document.querySelectorAll('#surecSinifSecim input:checked')].map(c => Number(c.value));
  const seciliDersler = [...document.querySelectorAll('#surecDersSecim input:checked')].map(c => c.value);
  const hedef = secili.length ? DB.siniflar.filter(s => secili.includes(s.id)) : DB.siniflar;

  if (!hedef.length) {
    el.innerHTML = '<div class="empty">Sınıf seçilmedi.</div>';
    return;
  }

  el.innerHTML = hedef.map(s => {
    const d = surecSonDurum(s.id, seciliDersler);
    const bitti = d.yeniBitti ? konuTamAd(d.yeniBitti) : '—';
    const isleniyorTxt = d.isleniyor.length ? d.isleniyor.map(konuTamAd).join(', ') : '—';
    return `
      <div class="row" style="align-items:flex-start">
        <div class="flex" style="align-items:flex-start;flex:1">
          <span class="badge">${s.ad.charAt(0)}</span>
          <div style="flex:1">
            <b>${s.ad}</b>
            <div style="font-size:12px;margin-top:3px"><span style="color:var(--emerald);font-weight:600">Yeni Bitti:</span> <span class="muted">${bitti}</span></div>
            <div style="font-size:12px;margin-top:2px"><span style="color:var(--amber);font-weight:600">İşleniyor:</span> <span class="muted">${isleniyorTxt}</span></div>
            <div style="font-size:12px;margin-top:2px"><span style="color:var(--indigo);font-weight:600">Önümüzdeki Konu:</span> <span class="muted">${d.onumuzdeki ? konuTamAd(d.onumuzdeki) : '—'}</span></div>
          </div>
        </div>
        <span class="muted" style="font-size:11px;white-space:nowrap">${d.islendiSayi}/${d.liste.length} işlendi</span>
      </div>
    `;
  }).join('');
}

export function aktifSurecRapor() {
  const secili = [...document.querySelectorAll('#surecSinifSecim input:checked')].map(c => Number(c.value));
  const seciliDersler = [...document.querySelectorAll('#surecDersSecim input:checked')].map(c => c.value);
  const hedef = secili.length ? DB.siniflar.filter(s => secili.includes(s.id)) : DB.siniflar;

  if (!hedef.length) { toast('En az bir sınıf seçin', false); return; }

  const dIslendi = $('surecDurumIslendi').checked;
  const dIsleniyor = $('surecDurumIsleniyor').checked;
  const dBaslanacak = $('surecDurumBaslanacak').checked;

  if (!dIslendi && !dIsleniyor && !dBaslanacak) {
    toast('En az bir durum seçin', false);
    return;
  }

  const dersAdInput = $('surecDers').value.trim();
  const ogretmen = $('surecOgretmen').value.trim();
  const hafta = $('surecHafta').value.trim();
  const bas = $('surecBas').value;
  const bit = $('surecBit').value;

  let tarihAralik = '';
  if (bas && bit) tarihAralik = fmtTarih(bas) + ' – ' + fmtTarih(bit);
  else if (bas) tarihAralik = fmtTarih(bas) + ' –';
  else if (bit) tarihAralik = '– ' + fmtTarih(bit);

  const dersIsimEtiket = seciliDersler.length ? seciliDersler.join(', ') : (dersAdInput || '');

  const baslikParca = [];
  if (dersIsimEtiket) baslikParca.push(dersIsimEtiket);
  if (hafta) baslikParca.push(hafta);
  if (tarihAralik) baslikParca.push(tarihAralik);
  const anaBaslik = baslikParca.length ? baslikParca.join(' — ') : 'Aktif Ders Süreci Raporu';
  const durumAd = { islendi: 'İşlendi', isleniyor: 'İşleniyor', baslanacak: 'Başlanacak' };

  let h = `
    <div class="surec-rapor">
      <div class="sr-head">
        <div class="sr-title">${anaBaslik}</div>
        <div class="sr-sub">${ogretmen ? `Öğretmen: ${ogretmen} • ` : ''}Sınıf: ${hedef.map(x => x.ad).join(', ')}${seciliDersler.length ? ` • Ders: ${seciliDersler.join(', ')}` : ''}</div>
      </div>
  `;

  hedef.forEach(s => {
    const d = surecSonDurum(s.id, seciliDersler);
    h += `
      <div class="sr-sinif">
        <div class="sr-sinif-ad">${s.ad}</div>
        <table class="sr-tbl"><tbody>
          <tr><td class="sr-k">Yeni Bitti</td><td>${d.yeniBitti ? konuTamAd(d.yeniBitti) : '—'}</td></tr>
          <tr><td class="sr-k">İşleniyor</td><td>${d.isleniyor.length ? d.isleniyor.map(konuTamAd).join(', ') : '—'}</td></tr>
          <tr><td class="sr-k">Önümüzdeki Konu</td><td>${d.onumuzdeki ? konuTamAd(d.onumuzdeki) : '—'}</td></tr>
          <tr><td class="sr-k">İlerleme</td><td>${d.islendiSayi} / ${d.liste.length} konu işlendi</td></tr>
        </tbody></table>
    `;

    const gosterilecek = [];
    if (dIslendi) gosterilecek.push('islendi');
    if (dIsleniyor) gosterilecek.push('isleniyor');
    if (dBaslanacak) gosterilecek.push('baslanacak');

    const konular = d.liste.filter(k => gosterilecek.includes(k.durum));
    if (konular.length) {
      h += `
        <table class="sr-tbl sr-liste">
          <thead><tr><th style="width:62%">Konu</th><th style="width:38%">Durum</th></tr></thead>
          <tbody>
      `;
      konular.forEach(k => {
        h += `<tr><td${k.alt ? ' class="sr-alt"' : ''}>${k.alt ? '– ' : ''}${konuTamAd(k)}</td><td>${durumAd[k.durum]}</td></tr>`;
      });
      h += '</tbody></table>';
    } else {
      h += '<div class="sr-bos">Seçilen durumlarda konu bulunmuyor.</div>';
    }
    h += '</div>';
  });

  h += `
      <div class="sr-foot">Belge Oluşturma Tarihi: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
    </div>
  `;

  $('surecPrintAlan').innerHTML = h;
  document.body.classList.add('print-surec');
  const eskiBaslik = document.title;
  document.title = 'Aktif Ders Sureci - ' + new Date().toISOString().split('T')[0];

  const temizle = () => {
    document.body.classList.remove('print-surec');
    document.title = eskiBaslik;
    $('surecPrintAlan').innerHTML = '';
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
      if (document.body.classList.contains('print-surec')) temizle();
    }, 1500);
  }, 250);
}

/* ═════ SINIF DETAY + DERS TAKİP ═════ */
export function sinifDetayGoster(sinifId, tab) {
  const sn = DB.siniflar.find(x => x.id === sinifId);
  if (!sn) return;
  if (tab) SINIF_DETAY_TAB = tab;

  const el = $('sinifDetay');
  const ogrenciler = DB.ogrenciler.filter(o => o.sinifId === sinifId);
  const konular = (DB.konular || []).filter(k => k.sinifId === sinifId).sort((a, b) => a.sira - b.sira);

  let h = `
    <div class="card" style="border:2px solid var(--indigo)">
      <div class="flex" style="justify-content:space-between;flex-wrap:wrap;gap:8px">
        <h2 style="margin:0">🏫 ${sn.ad} — Sınıf Detayı</h2>
        <button class="btn gray sm" onclick="$('sinifDetay').innerHTML=''">✕ Kapat</button>
      </div>
      <div class="tabbar" style="margin-top:10px">
        <div class="tab ${SINIF_DETAY_TAB === 'ogrenci' ? 'on' : ''}" onclick="window.sinifDetayGoster(${sinifId}, 'ogrenci')">👩‍🎓 Öğrenciler (${ogrenciler.length})</div>
        <div class="tab ${SINIF_DETAY_TAB === 'ders' ? 'on' : ''}" onclick="window.sinifDetayGoster(${sinifId}, 'ders')">📚 Ders Takip (${konular.length})</div>
      </div>
  `;

  if (SINIF_DETAY_TAB === 'ogrenci') {
    if (!ogrenciler.length) {
      h += '<div class="empty">Bu sınıfta öğrenci yok.</div>';
    } else {
      h += `
        <div style="overflow-x:auto">
          <table class="table">
            <thead>
              <tr><th>Öğrenci</th><th>Veli / Telefon</th><th class="num">Deneme</th><th class="num">TYT Ort. Net</th><th class="num">AYT Ort. Net</th></tr>
            </thead>
            <tbody>
      `;
      ogrenciler.forEach(o => {
        const dn = ogrenciDenemeleri(o.id);
        const turOrt = (tur) => {
          const ds = dn.filter(d => d.tur === tur);
          if (!ds.length) return null;
          const nets = ds.map(d => ogrenciDenemeToplam(o.id, d.id)).filter(x => x !== null);
          if (!nets.length) return null;
          return nets.reduce((a, b) => a + b, 0) / nets.length;
        };
        const tytO = turOrt('TYT');
        const aytO = turOrt('AYT');
        h += `
          <tr>
            <td style="font-weight:600">${o.adSoyad}</td>
            <td class="muted">${o.veli || '—'}</td>
            <td class="num">${dn.length}</td>
            <td class="num mono">${tytO === null ? '—' : tytO.toFixed(2)}</td>
            <td class="num mono">${aytO === null ? '—' : aytO.toFixed(2)}</td>
          </tr>
        `;
      });
      h += '</tbody></table></div>';
    }
  } else {
    h += `
      <details style="margin:10px 0;border:1px solid var(--border);border-radius:10px;overflow:hidden">
        <summary style="cursor:pointer;padding:10px 14px;background:#f8fafc;font-weight:600;font-size:14px;list-style:none;display:flex;justify-content:space-between;align-items:center">
          <span>📥 Ders Veri Girişi Alanı</span>
          <span style="font-size:11px;color:var(--muted)">▼ aç / kapat</span>
        </summary>
        <div style="padding:14px">
          <details style="margin-bottom:10px;border:1px dashed var(--indigo);border-radius:10px">
            <summary style="cursor:pointer;padding:8px 12px;font-weight:600;font-size:12px;color:var(--indigo);list-style:none">🤖 Konu girişlerini uygun forma çevirmek için bu istemi kullanabilirsiniz</summary>
            <div class="prompt-box" style="margin:0 12px 12px">
              <button class="prompt-copy" onclick="window.promptKopyala('konuPrompt', this)">📋 Kopyala</button>
              <pre id="konuPrompt">Sana verdiğim verileri aşağıdaki formata uygun hale getir.

Ders konularınızı yapay zeka aracına atarak 1. Fiiller
a. Fiilde Çatı
b. Fiil Çekim ekleri vb. şeklinde konu ve konu alt başlıklarını düzenle.</pre>
            </div>
          </details>
          <div class="grid-2">
            <div class="field"><label style="font-size:12px;font-weight:700;color:var(--indigo)">📚 Ders Adı *</label><input id="konuDers_${sinifId}" placeholder="Ders Adı (örn: Türkçe, Matematik)" list="hfDersOneri"></div>
            <div class="field"><label style="font-size:12px;font-weight:700;color:var(--indigo)">ℹ️ İpucu</label><div class="muted" style="font-size:11px;padding-top:6px">Farklı dersler yazarak ders bazlı konular ekleyebilirsiniz.</div></div>
          </div>
          <label style="font-size:12px;font-weight:700;color:var(--indigo);margin-top:6px">📥 Konu Girişi (her satır yeni konu)</label>
          <textarea id="konuMetin_${sinifId}" class="copy-area" style="min-height:110px;margin-top:6px" placeholder="1. Fiiller&#10;1.a) Fiilde Çatı&#10;1.b) Fiil Çekim ekleri&#10;2. İsimler&#10;2.a) İsim Tamlamaları"></textarea>
          <div class="flex mt-3">
            <button class="btn green sm" onclick="window.konuEkle(${sinifId})">➕ Konuları Ekle</button>
            <button class="btn gray sm" onclick="$('konuMetin_${sinifId}').value=''">🧹 Temizle</button>
            ${konular.length ? `<button class="btn red sm" onclick="window.konuTumunuSil(${sinifId})">🗑️ Tüm Konuları Sil</button>` : ''}
          </div>
        </div>
      </details>
    `;

    if (!konular.length) {
      h += '<div class="empty mt-3">Henüz konu eklenmemiş.</div>';
    } else {
      h += `<p class="muted" style="font-size:11px;margin:10px 0 6px">💡 Sürükleyerek sıralayın • Ana konu taşınınca alt başlıkları da taşınır • Duruma tıklayarak değiştirin</p>`;

      const dersGruplari = new Map();
      konular.forEach(k => {
        const dAd = k.ders || 'Genel';
        if (!dersGruplari.has(dAd)) dersGruplari.set(dAd, []);
        dersGruplari.get(dAd).push(k);
      });

      dersGruplari.forEach((kList, dAd) => {
        const dIslendi = kList.filter(k => k.durum === 'islendi').length;
        const dIsleniyor = kList.filter(k => k.durum === 'isleniyor').length;
        const dBaslanacak = kList.length - dIslendi - dIsleniyor;
        h += `
          <details class="card mt-3" style="border:1px solid var(--indigo)">
            <summary class="flex" style="justify-content:space-between;cursor:pointer;list-style:none">
              <b style="color:var(--indigo);font-size:14px">📚 ${dAd} <span class="muted" style="font-weight:400;font-size:11px">(${dIslendi}/${kList.length} konu)</span></b>
              <span style="font-size:11px;color:var(--muted)">▼</span>
            </summary>
            <div style="display:flex;gap:6px;margin:8px 0">
              <span class="durum-btn durum-islendi" style="cursor:default;font-size:10px">✓ ${dIslendi}</span>
              <span class="durum-btn durum-isleniyor" style="cursor:default;font-size:10px">◐ ${dIsleniyor}</span>
              <span class="durum-btn durum-baslanacak" style="cursor:default;font-size:10px">○ ${dBaslanacak}</span>
            </div>
            <div id="konuListe_${sinifId}_${dAd.replace(/\s+/g, '_')}">
        `;

        kList.forEach(k => {
          const dCls = k.durum === 'islendi' ? 'durum-islendi' : k.durum === 'isleniyor' ? 'durum-isleniyor' : 'durum-baslanacak';
          const dTxt = k.durum === 'islendi' ? '✓ İşlendi' : k.durum === 'isleniyor' ? '◐ İşleniyor' : '○ Başlanacak';
          h += `
            <div class="konu-item${k.alt ? ' alt' : ''}" draggable="true" data-id="${k.id}" data-sinif="${sinifId}" data-alt="${k.alt ? 1 : 0}">
              <span class="konu-tut">⠿</span>
              <span class="konu-metin">${k.alt ? '<span class="muted">↳</span> ' : '<b>'}${k.etiket ? k.etiket + ' ' : ''}${k.baslik}${k.alt ? '' : '</b>'}</span>
              <button class="durum-btn ${dCls}" onclick="window.konuDurumDegis(${k.id}, ${sinifId})">${dTxt}</button>
              <button class="btn sm red" onclick="window.konuSil(${k.id}, ${sinifId})">🗑️</button>
            </div>
          `;
        });

        h += '</div></details>';
      });
    }
  }

  h += '</div>';
  el.innerHTML = h;
  if (SINIF_DETAY_TAB === 'ders') konuSurukleBagla(sinifId);
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

export function konuEkle(sinifId) {
  const dersAd = ($('konuDers_' + sinifId) && $('konuDers_' + sinifId).value.trim()) || 'Genel';
  const t = $('konuMetin_' + sinifId).value.trim();
  if (!t) { toast('Konu metni boş', false); return; }

  if (!DB.konular) DB.konular = [];
  const mevcut = DB.konular.filter(k => k.sinifId === sinifId);
  let sira = mevcut.length ? Math.max(...mevcut.map(k => k.sira)) + 1 : 0;
  let ek = 0;

  t.split(/\r?\n/).forEach(raw => {
    const line = raw.trim();
    if (!line) return;

    let alt = false, etiket = '', baslik = line;
    const mAltNum = line.match(/^(\d+\s*\.\s*[a-zçğıöşü]\s*[\).])\s*(.+)$/i);
    const mAltHarf = line.match(/^([a-zçğıöşü]\s*[\).])\s*(.+)$/i);
    const mAltTire = line.match(/^([-•*])\s*(.+)$/);
    const mAna = line.match(/^(\d+\s*[\).]?)\s*(.+)$/);

    if (mAltNum) { alt = true; etiket = mAltNum[1].replace(/\s+/g, ''); baslik = mAltNum[2].trim(); }
    else if (mAltHarf) { alt = true; etiket = mAltHarf[1].replace(/\s+/g, ''); baslik = mAltHarf[2].trim(); }
    else if (mAltTire) { alt = true; etiket = mAltTire[1]; baslik = mAltTire[2].trim(); }
    else if (mAna) { alt = false; etiket = mAna[1].replace(/\s+/g, ''); baslik = mAna[2].trim(); }

    if (!baslik) return;
    DB.konular.push({ id: nid(), sinifId, ders: dersAd, baslik, etiket, alt, durum: 'baslanacak', sira: sira++ });
    ek++;
  });

  saveDB();
  $('konuMetin_' + sinifId).value = '';
  toast(`${ek} konu eklendi`);
  sinifDetayGoster(sinifId, 'ders');
  renderSiniflar();
}

export function konuDurumDegis(konuId, sinifId) {
  const k = DB.konular.find(x => x.id === konuId);
  if (!k) return;
  k.durum = k.durum === 'baslanacak' ? 'isleniyor' : k.durum === 'isleniyor' ? 'islendi' : 'baslanacak';
  saveDB();
  sinifDetayGoster(sinifId, 'ders');
  renderSiniflar();
  aktifSurecOzetRender();
}

export function konuSil(konuId, sinifId) {
  const k = DB.konular.find(x => x.id === konuId);
  if (!k) return;

  if (!k.alt) {
    const liste = DB.konular.filter(x => x.sinifId === sinifId).sort((a, b) => a.sira - b.sira);
    const idx = liste.findIndex(x => x.id === konuId);
    const silinecek = [konuId];
    for (let i = idx + 1; i < liste.length && liste[i].alt; i++) silinecek.push(liste[i].id);
    if (silinecek.length > 1 && !confirm(`Bu ana konu ve ${silinecek.length - 1} alt başlığı silinsin mi?`)) return;
    DB.konular = DB.konular.filter(x => !silinecek.includes(x.id));
  } else {
    DB.konular = DB.konular.filter(x => x.id !== konuId);
  }

  saveDB();
  sinifDetayGoster(sinifId, 'ders');
  renderSiniflar();
  aktifSurecOzetRender();
  toast('Silindi');
}

export function konuTumunuSil(sinifId) {
  if (!confirm('Bu sınıfın TÜM konuları silinsin mi?')) return;
  DB.konular = (DB.konular || []).filter(k => k.sinifId !== sinifId);
  saveDB();
  sinifDetayGoster(sinifId, 'ders');
  renderSiniflar();
  aktifSurecOzetRender();
  toast('Tüm konular silindi');
}

export function konuSurukleBagla(sinifId) {
  const kap = $('sinifDetay');
  if (!kap) return;

  kap.querySelectorAll('.konu-item').forEach(el => {
    el.addEventListener('dragstart', e => {
      SURUKLENEN = Number(el.dataset.id);
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      kap.querySelectorAll('.konu-item').forEach(x => x.classList.remove('drag-over'));
      SURUKLENEN = null;
    });
    el.addEventListener('dragover', e => {
      e.preventDefault();
      if (Number(el.dataset.id) !== SURUKLENEN) el.classList.add('drag-over');
    });
    el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
    el.addEventListener('drop', e => {
      e.preventDefault();
      el.classList.remove('drag-over');
      const hedefId = Number(el.dataset.id);
      if (!SURUKLENEN || SURUKLENEN === hedefId) return;
      konuTasi(sinifId, SURUKLENEN, hedefId);
    });
  });
}

export function konuTasi(sinifId, kaynakId, hedefId) {
  let liste = DB.konular.filter(k => k.sinifId === sinifId).sort((a, b) => a.sira - b.sira);
  const kIdx = liste.findIndex(k => k.id === kaynakId);
  const hIdxOrj = liste.findIndex(k => k.id === hedefId);
  if (kIdx < 0 || hIdxOrj < 0) return;

  const kaynak = liste[kIdx];
  let grup = [kaynak];
  if (!kaynak.alt) {
    for (let i = kIdx + 1; i < liste.length && liste[i].alt; i++) grup.push(liste[i]);
  }
  const grupIds = grup.map(g => g.id);
  if (grupIds.includes(hedefId)) return;

  const asagiTasima = hIdxOrj > kIdx;
  liste = liste.filter(k => !grupIds.includes(k.id));

  let hIdx = liste.findIndex(k => k.id === hedefId);
  if (hIdx < 0) return;

  if (asagiTasima) {
    const hedef = liste[hIdx];
    let son = hIdx;
    if (!hedef.alt) {
      for (let i = hIdx + 1; i < liste.length && liste[i].alt; i++) son = i;
    }
    hIdx = son + 1;
  }

  liste.splice(hIdx, 0, ...grup);
  liste.forEach((k, i) => { k.sira = i; });
  saveDB();
  sinifDetayGoster(sinifId, 'ders');
}
