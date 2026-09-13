/* ══════════════════════════════════════════════════════
   Öğrenci Takip Sistemi — Dashboard Modülü
   ══════════════════════════════════════════════════════ */

import { DB } from '../state.js';
import { $ } from '../utils.js';

export function renderDashboard() {
  const container = $('dashboardStats');
  if (!container) return;

  const stats = [
    { v: DB.siniflar.length, l: 'Sınıf', c: '#6366f1' },
    { v: DB.ogrenciler.length, l: 'Öğrenci', c: '#10b981' },
    { v: DB.denemeler.length, l: 'Deneme', c: '#f59e0b' },
    { v: DB.sonuclar.length, l: 'Sonuç', c: '#2563eb' },
    { v: DB.haftalik.length, l: 'Haftalık Soru', c: '#8b5cf6' }
  ];

  container.innerHTML = stats.map(s => `
    <div class="card" style="text-align:center">
      <div style="font-size:28px;font-weight:800;color:${s.c}">${s.v}</div>
      <div style="color:var(--muted);font-size:12px">${s.l}</div>
    </div>
  `).join('');
}
