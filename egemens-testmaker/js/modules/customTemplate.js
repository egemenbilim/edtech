import { S } from '../state.js';
import { $, uid, esc, openModal, closeModal } from '../utils.js';

const TPL_STORAGE_KEY = 'testmaker_custom_templates_v1';

let customTemplates = [];
let editingTplId = null;
let onTemplateChangeCallback = null;

export function setOnTemplateChangeCallback(fn) {
  onTemplateChangeCallback = fn;
}

export function loadCustomTemplates() {
  try {
    const raw = localStorage.getItem(TPL_STORAGE_KEY);
    customTemplates = raw ? JSON.parse(raw) : [];
  } catch (e) {
    customTemplates = [];
  }
  if (!customTemplates.length) {
    customTemplates = [
      {
        id: 'tpl_default_custom',
        name: 'Kurumsal Kutulu Şablon',
        school: 'Özel Bilim Eğitim Kurumları',
        subHeader: 'Fen Bilimleri Zümresi · 2026-2027 Eğitim Öğretim Yılı',
        examTitle: '1. Dönem 2. Ortak Yazılı Sınavı',
        headerStyle: 'boxed', // 'boxed', 'double_line', 'minimal'
        logoPosition: 'left', // 'left', 'right', 'none'
        logoSrc: null,
        showName: true,
        showClass: true,
        showNo: true,
        showScore: true,
        showDate: true,
        instruction: 'Sınav süresi 40 dakikadır. Yanlış cevaplar doğru cevapları etkilememektedir.'
      }
    ];
    saveCustomTemplates();
  }
  return customTemplates;
}

export function saveCustomTemplates() {
  try {
    localStorage.setItem(TPL_STORAGE_KEY, JSON.stringify(customTemplates));
  } catch (e) {}
  if (typeof onTemplateChangeCallback === 'function') {
    onTemplateChangeCallback();
  }
}

export function getCustomTemplates() {
  return customTemplates;
}

export function getActiveCustomTemplate() {
  if (S.template !== 'custom') return null;
  return customTemplates.find(t => t.id === S.customTemplateId) || customTemplates[0] || null;
}

export function openCustomTemplateModal(tplId = null) {
  editingTplId = tplId;
  const tpl = tplId ? customTemplates.find(t => t.id === tplId) : null;
  
  if ($('customTplModalTitle')) {
    $('customTplModalTitle').textContent = tpl ? 'Sınav Şablonunu Düzenle' : 'Yeni Sınav Şablonu Oluştur';
  }

  if ($('ctplName')) $('ctplName').value = tpl ? tpl.name : 'Yeni Kurumsal Şablon';
  if ($('ctplSchool')) $('ctplSchool').value = tpl ? tpl.school : (S.school || 'Anadolu Lisesi Müdürlüğü');
  if ($('ctplSubHeader')) $('ctplSubHeader').value = tpl ? tpl.subHeader : '2026-2027 Eğitim - Öğretim Yılı';
  if ($('ctplExamTitle')) $('ctplExamTitle').value = tpl ? tpl.examTitle : 'Dönem Sonu Değerlendirme Sınavı';
  if ($('ctplStyle')) $('ctplStyle').value = tpl ? tpl.headerStyle : 'boxed';
  if ($('ctplLogoPos')) $('ctplLogoPos').value = tpl ? tpl.logoPosition : 'left';
  if ($('ctplInstruction')) $('ctplInstruction').value = tpl ? tpl.instruction : (S.description || '');

  if ($('ctplShowName')) $('ctplShowName').checked = tpl ? tpl.showName : true;
  if ($('ctplShowClass')) $('ctplShowClass').checked = tpl ? tpl.showClass : true;
  if ($('ctplShowNo')) $('ctplShowNo').checked = tpl ? tpl.showNo : true;
  if ($('ctplShowScore')) $('ctplShowScore').checked = tpl ? tpl.showScore : true;
  if ($('ctplShowDate')) $('ctplShowDate').checked = tpl ? tpl.showDate : true;

  renderCustomTemplateList();
  openModal('customTplModal');
}

export function renderCustomTemplateList() {
  const container = $('customTplCardsList');
  if (!container) return;

  container.innerHTML = customTemplates.map(t => {
    const isCurrentActive = S.template === 'custom' && S.customTemplateId === t.id;
    return `
      <div class="flex items-center justify-between rounded-xl border p-3 transition ${isCurrentActive ? 'border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-800' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] font-semibold text-slate-800 dark:text-slate-100">${esc(t.name)}</span>
            ${isCurrentActive ? '<span class="rounded bg-slate-900 px-1.5 py-0.2 text-[9px] font-semibold text-white dark:bg-white dark:text-slate-900">Aktif Şablon</span>' : ''}
          </div>
          <p class="mt-0.5 text-[11px] text-slate-400">${esc(t.school || 'Kurum')} · ${esc(t.headerStyle === 'boxed' ? 'Kutulu Çerçeve' : (t.headerStyle === 'double_line' ? 'Çift Çizgili' : 'Minimalist'))}</p>
        </div>
        <div class="flex items-center gap-1.5">
          <button type="button" class="ctpl-select-btn rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" data-select-id="${t.id}">Seç</button>
          <button type="button" class="ctpl-edit-btn rounded-lg p-1 text-[12px] text-slate-400 hover:text-slate-700" data-edit-id="${t.id}" title="Düzenle">✎</button>
          ${customTemplates.length > 1 ? `<button type="button" class="ctpl-del-btn rounded-lg p-1 text-[12px] text-slate-400 hover:text-rose-600" data-del-id="${t.id}" title="Sil">✕</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Draw Custom Exam Header on PDF canvas
export function drawCustomHeader(ctx, PW, PH, M, t, version, first, templateObj) {
  const tpl = templateObj || getActiveCustomTemplate();
  if (!tpl) return M + 10;

  const SCALE = 72 / 25.4;
  const PX = (mm) => mm * SCALE;
  const PT = (pt) => pt * (SCALE / (96 / 72));
  const setFont = (options) => {
    let font = '';
    if (options.italic) font += 'italic ';
    if (options.bold) font += 'bold ';
    font += `${options.size || 10}px 'Noto Sans', system-ui, sans-serif`;
    ctx.font = font;
  };

  const L = M + 2;
  const R = PW - M - 2;
  const W = PW - 2 * M;
  const midX = (L + R) / 2;

  let headerHeight = 24;
  if (tpl.headerStyle === 'boxed') {
    headerHeight = 26;
    ctx.strokeStyle = S.themeColor || '#0f172a';
    ctx.lineWidth = Math.max(1.2, 0.5 * SCALE);
    ctx.strokeRect(PX(M), PX(M), PX(W), PX(headerHeight));

    // Divider line between titles and student info
    ctx.beginPath();
    ctx.moveTo(PX(M), PX(M + 16));
    ctx.lineTo(PX(PW - M), PX(M + 16));
    ctx.stroke();

    // School Name
    setFont({ size: PT(10.5), bold: true });
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tpl.school || '', PX(midX), PX(M + 4.5));

    // Subheader
    setFont({ size: PT(8.5), bold: false });
    ctx.fillStyle = '#475569';
    ctx.fillText(tpl.subHeader || '', PX(midX), PX(M + 9));

    // Exam Title
    setFont({ size: PT(9.5), bold: true });
    ctx.fillStyle = S.themeColor || '#0f172a';
    ctx.fillText((tpl.examTitle || 'ORTAK YAZILI SINAVI').toLocaleUpperCase('tr-TR'), PX(midX), PX(M + 13));

    // Student Info Row
    setFont({ size: PT(8.5), bold: false });
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.fillText('Adı Soyadı: .......................................', PX(L), PX(M + 21));
    ctx.fillText('Sınıf / Şube: ..........', PX(L + W * 0.45), PX(M + 21));
    ctx.fillText('No: ..........', PX(L + W * 0.68), PX(M + 21));
    ctx.fillText('Puan: ..........', PX(L + W * 0.85), PX(M + 21));

    if (S.groups > 1) {
      setFont({ size: PT(8.5), bold: true });
      ctx.textAlign = 'right';
      ctx.fillText('Kitapçık: ' + version, PX(R), PX(M + 5));
    }
  } else if (tpl.headerStyle === 'double_line') {
    headerHeight = 28;
    // School & Subheader
    setFont({ size: PT(12), bold: true });
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tpl.school || '', PX(midX), PX(M + 4));

    setFont({ size: PT(9.5), bold: false });
    ctx.fillStyle = '#475569';
    ctx.fillText(tpl.subHeader || '', PX(midX), PX(M + 9.5));

    setFont({ size: PT(11), bold: true });
    ctx.fillStyle = S.themeColor || '#0f172a';
    ctx.fillText((tpl.examTitle || '').toLocaleUpperCase('tr-TR'), PX(midX), PX(M + 15));

    // Student Info
    setFont({ size: PT(9), bold: false });
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.fillText('Adı-Soyadı: ........................................', PX(L), PX(M + 22));
    ctx.fillText('Sınıfı: ..........', PX(L + W * 0.46), PX(M + 22));
    ctx.fillText('Okul No: ..........', PX(L + W * 0.68), PX(M + 22));
    ctx.fillText('Puan: ..........', PX(L + W * 0.86), PX(M + 22));

    // Double lines
    ctx.strokeStyle = S.themeColor || '#0f172a';
    ctx.lineWidth = Math.max(1.4, 0.6 * SCALE);
    ctx.beginPath();
    ctx.moveTo(PX(M), PX(M + 26));
    ctx.lineTo(PX(PW - M), PX(M + 26));
    ctx.stroke();

    ctx.lineWidth = Math.max(0.6, 0.25 * SCALE);
    ctx.beginPath();
    ctx.moveTo(PX(M), PX(M + 27.5));
    ctx.lineTo(PX(PW - M), PX(M + 27.5));
    ctx.stroke();
  } else {
    // Minimalist single line
    headerHeight = 24;
    setFont({ size: PT(11.5), bold: true });
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tpl.school || '', PX(midX), PX(M + 4));

    setFont({ size: PT(9), bold: false });
    ctx.fillStyle = '#475569';
    ctx.fillText((tpl.subHeader ? tpl.subHeader + ' · ' : '') + tpl.examTitle, PX(midX), PX(M + 10));

    setFont({ size: PT(9), bold: false });
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.fillText('Ad Soyad: .....................................', PX(L), PX(M + 18));
    ctx.fillText('Sınıf/No: .................', PX(L + W * 0.5), PX(M + 18));
    ctx.fillText('Not: ...........', PX(L + W * 0.85), PX(M + 18));

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = Math.max(1, 0.4 * SCALE);
    ctx.beginPath();
    ctx.moveTo(PX(M), PX(M + 22.5));
    ctx.lineTo(PX(PW - M), PX(M + 22.5));
    ctx.stroke();
  }

  let y = M + headerHeight + 2;
  if (tpl.instruction) {
    setFont({ size: PT(7.5), italic: true });
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'left';
    ctx.fillText(tpl.instruction, PX(L), PX(y + 2));
    y += 5.5;
  }

  return y;
}

export function initCustomTemplateManager() {
  loadCustomTemplates();

  // Open modal from sidebar
  const openBtn = $('openCustomTplModal');
  if (openBtn) openBtn.onclick = () => openCustomTemplateModal();

  // Close modal
  const closeBtn = $('customTplClose');
  if (closeBtn) closeBtn.onclick = () => closeModal('customTplModal');

  // Save template form
  const saveBtn = $('customTplSaveBtn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const name = ($('ctplName').value || '').trim();
      if (!name) return alert('Lütfen şablon adını girin.');

      const data = {
        name,
        school: $('ctplSchool').value.trim(),
        subHeader: $('ctplSubHeader').value.trim(),
        examTitle: $('ctplExamTitle').value.trim(),
        headerStyle: $('ctplStyle').value,
        logoPosition: $('ctplLogoPos').value,
        instruction: $('ctplInstruction').value.trim(),
        showName: $('ctplShowName').checked,
        showClass: $('ctplShowClass').checked,
        showNo: $('ctplShowNo').checked,
        showScore: $('ctplShowScore').checked,
        showDate: $('ctplShowDate').checked,
      };

      if (editingTplId) {
        const idx = customTemplates.findIndex(t => t.id === editingTplId);
        if (idx >= 0) {
          customTemplates[idx] = { ...customTemplates[idx], ...data };
        }
      } else {
        const newTpl = { id: uid(), ...data };
        customTemplates.push(newTpl);
        S.template = 'custom';
        S.customTemplateId = newTpl.id;
      }

      saveCustomTemplates();
      closeModal('customTplModal');
      alert(`"${name}" sınav şablonu başarıyla kaydedildi!`);
    };
  }

  // Template cards list click delegation
  const listContainer = $('customTplCardsList');
  if (listContainer) {
    listContainer.onclick = (e) => {
      const target = e.target;
      const selectBtn = target.closest('.ctpl-select-btn');
      if (selectBtn) {
        const id = selectBtn.dataset.selectId;
        S.template = 'custom';
        S.customTemplateId = id;
        saveCustomTemplates();
        closeModal('customTplModal');
        return;
      }
      const editBtn = target.closest('.ctpl-edit-btn');
      if (editBtn) {
        const id = editBtn.dataset.editId;
        openCustomTemplateModal(id);
        return;
      }
      const delBtn = target.closest('.ctpl-del-btn');
      if (delBtn) {
        const id = delBtn.dataset.delId;
        if (confirm('Bu şablonu silmek istediğinize emin misiniz?')) {
          customTemplates = customTemplates.filter(t => t.id !== id);
          if (S.customTemplateId === id) {
            S.customTemplateId = customTemplates[0] ? customTemplates[0].id : null;
            if (!customTemplates.length) S.template = 'none';
          }
          saveCustomTemplates();
          renderCustomTemplateList();
        }
        return;
      }
    };
  }
}
