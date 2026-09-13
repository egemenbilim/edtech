/* ══════════════════════════════════════════════════════
   Öğrenci Takip Sistemi — Yardımcı Fonksiyonlar (Utils)
   ══════════════════════════════════════════════════════ */

import { DB, RENKLER } from './state.js';

export const $ = id => document.getElementById(id);

export function toast(m, ok = true) {
  const t = $('toast');
  if (!t) return;
  t.textContent = (ok ? '✅ ' : '❌ ') + m;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

export function netHesapla(tur, d, y) {
  return Math.round(Math.max(0, d - y / (tur === 'LGS' ? 3 : 4)) * 100) / 100;
}

export function fmtTarih(d) {
  if (!d) return '—';
  const p = d.split('-');
  return p[2] + '.' + p[1] + '.' + p[0];
}

export function ogrenciAdi(id) {
  const o = DB.ogrenciler.find(x => x.id === id);
  return o ? o.adSoyad : '—';
}

export function sinifAdi(id) {
  const s = DB.siniflar.find(x => x.id === id);
  return s ? s.ad : '—';
}

/* ═════ PROMPT KOPYALAMA ═════ */
export function promptKopyala(elId, btn) {
  const target = $(elId);
  if (!target) return;
  const txt = target.textContent;
  const eskiMetin = btn.textContent;
  const basari = () => {
    btn.textContent = '✓ Kopyalandı';
    setTimeout(() => { btn.textContent = eskiMetin; }, 1500);
    toast('İstem panoya kopyalandı');
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(basari).catch(() => fallbackKopya(txt, basari));
  } else {
    fallbackKopya(txt, basari);
  }
}

export function fallbackKopya(txt, cb) {
  const ta = document.createElement('textarea');
  ta.value = txt;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    cb();
  } catch (e) {
    toast('Kopyalanamadı, elle seçin', false);
  }
  document.body.removeChild(ta);
}

/* ═════ ÇİZGİ GRAFİK (SVG) ═════ */
export function cizgiGrafik(data, keys, opt = {}) {
  if (!data.length) return '<p class="muted">Grafik için veri yetersiz.</p>';
  const endLabels = !!opt.endLabels;
  const W = endLabels ? 1100 : 800;
  const H = endLabels ? Math.max(340, keys.length * 26 + 120) : 340;
  const pL = 44, pR = endLabels ? 280 : 14, pT = 18, pB = 38;
  const cw = W - pL - pR, ch = H - pT - pB;

  let max = 0;
  data.forEach(r => keys.forEach(k => {
    if (typeof r[k] === 'number') max = Math.max(max, r[k]);
  }));
  if (max === 0) max = 1;

  const xs = cw / Math.max(1, data.length - 1);
  const yF = v => pT + ch - (v / max) * ch;
  const cO = i => RENKLER[i % RENKLER.length];

  let pl = '', dt = '', lg = '';
  const endPts = [];

  keys.forEach((k, i) => {
    const valid = data.filter(r => typeof r[k] === 'number');
    let seg = [];
    const flush = () => {
      if (seg.length >= 2) {
        pl += `<polyline points="${seg.join(' ')}" fill="none" stroke="${cO(i)}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
      } else if (seg.length === 1) {
        pl += `<line x1="${seg[0].split(',')[0]}" y1="${seg[0].split(',')[1]}" x2="${seg[0].split(',')[0]}" y2="${seg[0].split(',')[1]}" stroke="${cO(i)}" stroke-width="0"/>`;
      }
      seg = [];
    };

    data.forEach((r, xi) => {
      if (typeof r[k] === 'number') {
        seg.push(`${(pL + xi * xs).toFixed(1)},${yF(r[k]).toFixed(1)}`);
        dt += `<circle cx="${pL + xi * xs}" cy="${yF(r[k])}" r="3" fill="${cO(i)}"/>`;
      } else {
        flush();
      }
    });
    flush();

    if (endLabels && valid.length) {
      const lastR = valid[valid.length - 1];
      const xi = data.indexOf(lastR);
      endPts.push({ key: k, color: cO(i), x: pL + xi * xs, y: yF(lastR[k]), val: lastR[k] });
    }

    if (!endLabels) {
      lg += `<span style="display:inline-flex;align-items:center;margin-right:14px;font-size:12px;font-weight:600"><svg width="22" height="10" style="margin-right:5px;flex-shrink:0"><line x1="0" y1="5" x2="22" y2="5" stroke="${cO(i)}" stroke-width="3"/><circle cx="11" cy="5" r="3.5" fill="${cO(i)}"/></svg><span style="color:${cO(i)}">${k}</span></span>`;
    }
  });

  let endLbl = '';
  if (endLabels && endPts.length) {
    const minGap = 15;
    const sorted = [...endPts].sort((a, b) => a.y - b.y);
    let prevY = -Infinity;
    sorted.forEach(p => {
      let ly = Math.max(p.y, prevY + minGap);
      ly = Math.min(ly, H - pB - 2);
      p.labelY = ly;
      prevY = ly;
    });

    for (let i = sorted.length - 1; i > 0; i--) {
      if (sorted[i].labelY - sorted[i - 1].labelY < minGap) {
        sorted[i - 1].labelY = sorted[i].labelY - minGap;
      }
    }

    const lblX = W - pR + 16;
    sorted.forEach(p => {
      const isim = p.key.length > 22 ? p.key.slice(0, 21) + '…' : p.key;
      endLbl += `<path d="M ${p.x.toFixed(1)} ${p.y.toFixed(1)} L ${(lblX - 4).toFixed(1)} ${p.labelY.toFixed(1)}" fill="none" stroke="${p.color}" stroke-width="1" opacity="0.3" stroke-dasharray="2 2"/>`;
      endLbl += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="${p.color}"/>`;
      endLbl += `<text x="${lblX}" y="${(p.labelY + 3).toFixed(1)}" font-size="10" font-weight="600" fill="${p.color}">${isim} (${p.val.toFixed(1)})</text>`;
    });
  }

  let g = '';
  for (let i = 0; i <= 5; i++) {
    const y = pT + (ch / 5) * i;
    g += `<line x1="${pL}" y1="${y}" x2="${W - pR}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="3 3"/><text x="${pL - 6}" y="${y + 3}" text-anchor="end" font-size="9" fill="#64748b">${(max * (1 - i / 5)).toFixed(1)}</text>`;
  }

  let xl = '';
  data.forEach((r, xi) => {
    const bx = pL + xi * xs;
    const dnAd = r.__denemeAd ? String(r.__denemeAd) : '';
    const tipMetin = dnAd ? `${dnAd} — ${r.tarih}` : r.tarih;
    xl += `<g class="x-tick" style="cursor:${dnAd ? 'help' : 'default'}"><rect x="${(bx - 26).toFixed(1)}" y="${H - pB + 3}" width="52" height="16" fill="transparent"/><text x="${bx.toFixed(1)}" y="${H - pB + 14}" text-anchor="middle" font-size="9" fill="#64748b" style="${dnAd ? 'text-decoration:underline dotted #cbd5e1;text-underline-offset:2px' : ''}">${r.tarih}</text><title>${tipMetin.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title></g>`;
  });

  const legendHtml = endLabels ? '' : `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">${lg}</div>`;
  return `${legendHtml}<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px;height:auto" xmlns="http://www.w3.org/2000/svg">${g}${xl}${pl}${dt}${endLbl}</svg>`;
}

/* ═════ PASTA GRAFİK (SVG) ═════ */
export function pastaGrafik(veri) {
  const toplam = veri.reduce((a, v) => a + v.deger, 0);
  if (!toplam) return '';
  const renkler = [
    '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
    '#14b8a6', '#a855f7', '#eab308', '#22c55e', '#f43f5e',
    '#0ea5e9', '#d946ef', '#84e127', '#fb923c', '#60a5fa'
  ];
  const cx = 70, cy = 70, r = 60;
  let a0 = -Math.PI / 2;
  let dilim = '', lejant = '';

  veri.forEach((v, i) => {
    const oran = v.deger / toplam;
    const a1 = a0 + oran * 2 * Math.PI;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const buyuk = oran > 0.5 ? 1 : 0;
    const renk = renkler[i % renkler.length];

    if (veri.length === 1) {
      dilim = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${renk}"/>`;
    } else {
      dilim += `<path d="M ${cx} ${cy} L ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${buyuk} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${renk}" stroke="#fff" stroke-width="1"/>`;
    }
    lejant += `<div style="display:flex;align-items:center;gap:5px;font-size:9px;margin-bottom:2px"><span style="width:9px;height:9px;background:${renk};display:inline-block;border:1px solid #999"></span>${v.ad}: ${v.deger} (${(oran * 100).toFixed(1)}%)</div>`;
    a0 = a1;
  });

  return `<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-top:4px"><svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">${dilim}</svg><div style="flex:1"><div style="font-size:10px;font-weight:700;margin-bottom:4px">Toplam Soru: ${toplam}</div>${lejant}</div></div>`;
}
