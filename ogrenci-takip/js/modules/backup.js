/* ══════════════════════════════════════════════════════
   Öğrenci Takip Sistemi — Yedekleme (Backup) Modülü
   ══════════════════════════════════════════════════════ */

import { DB, saveDB, resetDB, loadDB } from '../state.js';
import { $, toast } from '../utils.js';

let onReloadCallback = null;
export function setBackupReloadCallback(cb) {
  onReloadCallback = cb;
}

export function disaAktar() {
  const exportData = {
    exportTarihi: new Date().toISOString(),
    versiyon: '2.0',
    siniflar: DB.siniflar || [],
    ogrenciler: DB.ogrenciler || [],
    denemeler: DB.denemeler || [],
    sonuclar: DB.sonuclar || [],
    haftalik: DB.haftalik || [],
    konular: DB.konular || [],
    _meta: {
      sinifSayisi: (DB.siniflar || []).length,
      ogrenciSayisi: (DB.ogrenciler || []).length,
      denemeSayisi: (DB.denemeler || []).length,
      sonucSayisi: (DB.sonuclar || []).length,
      haftalikSayisi: (DB.haftalik || []).length,
      konuSayisi: (DB.konular || []).length
    }
  };

  const b = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const u = URL.createObjectURL(b);
  const simdi = new Date();
  const gg = String(simdi.getDate()).padStart(2, '0');
  const aa = String(simdi.getMonth() + 1).padStart(2, '0');
  const yyyy = simdi.getFullYear();
  const ss = String(simdi.getHours()).padStart(2, '0');
  const dd = String(simdi.getMinutes()).padStart(2, '0');
  const dosyaAdi = `${gg}/${aa}/${yyyy} - ${ss}:${dd} - ÖTS.json`;

  const a = document.createElement('a');
  a.href = u;
  a.download = dosyaAdi;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(u);
  toast('Kayıt dosyası indirildi');
}

export function iceriAktar(ev) {
  const f = ev.target.files[0];
  if (!f) return;
  handleFile(f);
}

export function handleFile(f) {
  const r = new FileReader();
  r.onload = e => {
    try {
      const d = JSON.parse(e.target.result);
      if (d.exportTarihi || d.siniflar) {
        DB.siniflar = d.siniflar || [];
        DB.ogrenciler = d.ogrenciler || [];
        DB.denemeler = d.denemeler || [];
        DB.sonuclar = d.sonuclar || [];
        DB.haftalik = d.haftalik || [];
        DB.konular = d.konular || [];
      } else {
        throw new Error('Geçersiz format');
      }

      saveDB();
      loadDB(); // ID senkronizasyonu için
      toast('Kayıt dosyası geri yüklendi ✓');
      if (onReloadCallback) onReloadCallback();
    } catch (err) {
      toast('Geçersiz dosya', false);
    }
  };
  r.readAsText(f);
}

export function tumunuSil() {
  if (!confirm('TÜM veriler silinecek!')) return;
  if (!confirm('Son onay: Geri alınamaz!')) return;

  resetDB();
  toast('Silindi');
  if (onReloadCallback) onReloadCallback();
}

export function renderCikti() {
  const container = $('ciktiOzet');
  if (!container) return;

  container.innerHTML = [
    { l: 'Sınıf', v: DB.siniflar.length },
    { l: 'Öğrenci', v: DB.ogrenciler.length },
    { l: 'Deneme', v: DB.denemeler.length },
    { l: 'Sonuç', v: DB.sonuclar.length },
    { l: 'Haftalık Soru', v: DB.haftalik.length },
    { l: 'Ders Takip', v: (DB.konular || []).length }
  ].map(s => `
    <div class="stat">
      <div class="v">${s.v}</div>
      <div class="l">${s.l}</div>
    </div>
  `).join('');
}
