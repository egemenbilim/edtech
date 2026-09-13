/**
 * Egemen's Testmaker — Offline / file:// & Web Standalone Bundle
 * Otomatik oluşturulmuş tek dosya dağıtım paketi.
 * Hem yerel dosya sisteminden (file://) doğrudan çift tıklamayla
 * hem de HTTP/HTTPS sunuculardan CORS kısıtlaması olmadan çalışır.
 */
(function() {
  'use strict';
  const __modules = {};
  const __cache = {};

  function __define(id, fn) {
    __modules[id] = fn;
  }

  function __require(id) {
    if (__cache[id]) return __cache[id];
    if (!__modules[id]) {
      throw new Error('Modül bulunamadı: ' + id);
    }
    const module = { exports: {} };
    __cache[id] = module.exports;
    __modules[id](module.exports, function(dep) {
      return __require(dep);
    }, module);
    __cache[id] = module.exports;
    return module.exports;
  }


__define('state.js', function(__exports, __require, __module) {
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const MAX = 100;

const S = {
  testType: 'yazili',
  groups: 1,
  columns: 2,
  pageSize: 'a4',
  orientation: 'portrait',
  margin: 5,
  spacing: false,
  spacingValue: 10,
  smartLayout: false,
  watermark: '',
  watermarkAngle: 45,
  watermarkSize: 44,
  watermarkDivider: false,
  themeColor: '#1d4ed8',
  optic: false,
  showAnswerKey: true,
  konuKapsami: '',
  denemeNo: '',
  template: 'none',
  mebYear: '2026 - 2027 Eğitim - Öğretim Yılı',
  mebSchool: '',
  mebDate: '',
  mebLesson: '',
  mebGrade: '',
  mebExam: '',
  mebNameLbl: 'Adı-Soyadı:',
  mebClassLbl: 'Sınıfı:',
  mebNoLbl: 'Okul No.:',
  mebScoreLbl: 'Puan:',
  mebLogo: true,
  logoChoice: 'meb',
  logoW: 22,
  logoH: 22,
  logoX: null,
  logoY: null,
  mebPos: null,
  title: '',
  school: '',
  lesson: '2025-2026 EĞİTİM ÖĞRETİM YILI',
  description: 'Aşağıdaki soruları dikkatlice okuyunuz. Her soru 10 Puan olmakla birlikte sınav süreniz 40 dakikadır.',
  // Yeni özellik durumları
  customTemplateId: null,
  showQuestionAreaGuide: false,
  activeBankId: null
};

const PRESET_COLORS = [
  { name: 'MEB Bordo', hex: '#b91c1c' },
  { name: 'Resmî Lacivert', hex: '#1e3a8a' },
  { name: 'Zümrüt Yeşili', hex: '#0f766e' },
  { name: 'Canlandırıcı Turuncu', hex: '#ea580c' },
  { name: 'Kurşunî Antrasit', hex: '#334155' }
];

const questions = [];

function setQuestions(newArr) {
  questions.length = 0;
  if (Array.isArray(newArr)) {
    questions.push(...newArr);
  }
}

function clearQuestions() {
  questions.length = 0;
}


// Module Exports
__exports['LETTERS'] = LETTERS;
__exports['MAX'] = MAX;
__exports['S'] = S;
__exports['PRESET_COLORS'] = PRESET_COLORS;
__exports['questions'] = questions;
__exports['setQuestions'] = setQuestions;
__exports['clearQuestions'] = clearQuestions;

});

__define('utils.js', function(__exports, __require, __module) {
const $ = (id) => document.getElementById(id);

const uid = () => 'q' + Math.random().toString(36).slice(2, 10);

function esc(s) {
  return String(s || '')
    .replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
    .replace(/\n/g, '<br>');
}

function slugForFile(s) {
  const map = {
    'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G', 'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O', 'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U'
  };
  return String(s || '')
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (m) => map[m] || m)
    .replace(/[^a-zA-Z0-9 _-]+/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

function defaultBaseName(cleanTitle, S) {
  const base = slugForFile(cleanTitle);
  if (base) return base;
  if (S && S.template === 'meb') {
    const combo = slugForFile([S.mebSchool, S.mebLesson, S.mebGrade, S.mebExam].filter(Boolean).join(' - '));
    if (combo) return combo;
  }
  return 'Sinav';
}

function todayStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function parseTags(title) {
  const tags = (title.match(/\[[A-Z_]+\]/g) || []);
  return {
    clean: title.replace(/\[[A-Z_]+\]/g, '').trim(),
    noPageNumber: tags.includes('[NO_PAGENUMBER]'),
    noDescription: tags.includes('[NO_DESCRIPTION]'),
    noUppercase: tags.includes('[NO_UPPERCASE]'),
    centerDescription: tags.includes('[CENTER_DESCRIPTION]'),
    hideVersion: tags.includes('[HIDE_VERSION]'),
    negativeAngle: tags.includes('[NEGATIVE_WATERMARK_ANGLE]')
  };
}

function shuffle(a) {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.random() * (i + 1) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function toBlocks(qs) {
  const seen = new Set(), out = [];
  qs.forEach(q => {
    if (seen.has(q.id)) return;
    if (q.groupId) {
      const g = qs.filter(x => x.groupId === q.groupId);
      g.forEach(x => seen.add(x.id));
      out.push(g);
    } else {
      seen.add(q.id);
      out.push([q]);
    }
  });
  return out;
}

function booklet(qs, i) {
  const b = toBlocks(qs);
  return i === 0 ? b.flat() : shuffle(b).map(g => g.length > 1 ? shuffle(g) : g).flat();
}

function jpegBytes(dataURL) {
  const b = atob(dataURL.split(',')[1]);
  const a = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
  return a;
}

function openModal(id) {
  const el = $(id);
  if (!el) return;
  el.classList.remove('hidden');
  el.classList.add('flex');
}

function closeModal(id) {
  const el = $(id);
  if (!el) return;
  el.classList.add('hidden');
  el.classList.remove('flex', 'above');
}

function warnText(msg) {
  const w = $('txtWarn');
  if (w) {
    w.textContent = msg;
    w.classList.remove('on');
    void w.offsetWidth;
    w.classList.add('on');
  }
  try { window.alert(msg); } catch (e) {}
}

function clearWarn() {
  const w = $('txtWarn');
  if (w) {
    w.classList.remove('on');
    w.textContent = '';
  }
}

function setProgress(d, t) {
  const p = $('progress');
  if (!p) return;
  if (t === null) {
    p.classList.add('hidden');
    return;
  }
  p.classList.remove('hidden');
  p.innerHTML = `Yükleniyor ${d} / ${t}<div class="mt-1.5 h-1 w-32 overflow-hidden rounded-full bg-white/20"><div class="h-1 rounded-full bg-white transition-all" style="width:${d / t * 100}%"></div></div>`;
}


// Module Exports
__exports['$'] = $;
__exports['uid'] = uid;
__exports['esc'] = esc;
__exports['slugForFile'] = slugForFile;
__exports['defaultBaseName'] = defaultBaseName;
__exports['todayStr'] = todayStr;
__exports['parseTags'] = parseTags;
__exports['shuffle'] = shuffle;
__exports['toBlocks'] = toBlocks;
__exports['booklet'] = booklet;
__exports['jpegBytes'] = jpegBytes;
__exports['openModal'] = openModal;
__exports['closeModal'] = closeModal;
__exports['warnText'] = warnText;
__exports['clearWarn'] = clearWarn;
__exports['setProgress'] = setProgress;

});

__define('modules/customTemplate.js', function(__exports, __require, __module) {
const { S } = __require('state.js');
const { $, uid, esc, openModal, closeModal } = __require('utils.js');

const TPL_STORAGE_KEY = 'testmaker_custom_templates_v1';

let customTemplates = [];
let editingTplId = null;
let onTemplateChangeCallback = null;

function setOnTemplateChangeCallback(fn) {
  onTemplateChangeCallback = fn;
}

function loadCustomTemplates() {
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

function saveCustomTemplates() {
  try {
    localStorage.setItem(TPL_STORAGE_KEY, JSON.stringify(customTemplates));
  } catch (e) {}
  if (typeof onTemplateChangeCallback === 'function') {
    onTemplateChangeCallback();
  }
}

function getCustomTemplates() {
  return customTemplates;
}

function getActiveCustomTemplate() {
  if (S.template !== 'custom') return null;
  return customTemplates.find(t => t.id === S.customTemplateId) || customTemplates[0] || null;
}

function openCustomTemplateModal(tplId = null) {
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

function renderCustomTemplateList() {
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
function drawCustomHeader(ctx, PW, PH, M, t, version, first, templateObj) {
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

function initCustomTemplateManager() {
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


// Module Exports
__exports['setOnTemplateChangeCallback'] = setOnTemplateChangeCallback;
__exports['loadCustomTemplates'] = loadCustomTemplates;
__exports['saveCustomTemplates'] = saveCustomTemplates;
__exports['getCustomTemplates'] = getCustomTemplates;
__exports['getActiveCustomTemplate'] = getActiveCustomTemplate;
__exports['openCustomTemplateModal'] = openCustomTemplateModal;
__exports['renderCustomTemplateList'] = renderCustomTemplateList;
__exports['drawCustomHeader'] = drawCustomHeader;
__exports['initCustomTemplateManager'] = initCustomTemplateManager;

});

__define('modules/pdfEngine.js', function(__exports, __require, __module) {
const { questions, S, LETTERS } = __require('state.js');
const { $, parseTags, booklet, jpegBytes, defaultBaseName, todayStr } = __require('utils.js');
const { drawCustomHeader, getActiveCustomTemplate } = __require('modules/customTemplate.js');

const SCALE = 6;
const FONT = "'Noto Sans', 'DejaVu Sans', Arial, sans-serif";
const PX = (mm) => mm * SCALE;
const PT = (pt) => (pt * 25.4 / 72) * SCALE;
const LH_MM = 5.2;

const TR_FONT_SAMPLE = 'AaBbCcÇçDdEeFfGgĞğHhIıİiJjKkLlMmNnOoÖöPpRrSsŞşTtUuÜüVvWwXxYyZz0123456789 —–…!?.,:;()[]«»°·•×÷+−=%&$#@_<>*/';

let fontReady = null;
async function ensureFont() {
  if (fontReady) return fontReady;
  fontReady = (async () => {
    try {
      if (document.fonts && document.fonts.load) {
        await Promise.all([
          document.fonts.load("400 16px 'Noto Sans'", TR_FONT_SAMPLE),
          document.fonts.load("700 16px 'Noto Sans'", TR_FONT_SAMPLE),
          document.fonts.load("italic 400 16px 'Noto Sans'", TR_FONT_SAMPLE),
          document.fonts.load("italic 700 16px 'Noto Sans'", TR_FONT_SAMPLE),
        ]);
        await document.fonts.ready;
      }
    } catch (e) {}
    try { await ensureMebLogo(); } catch (e) {}
  })();
  return fontReady;
}

function pageSizeMM() {
  const s = { a4: [210, 297], a5: [148, 210], letter: [216, 279] }[S.pageSize] || [210, 297];
  return S.orientation === 'landscape' ? [s[1], s[0]] : s;
}

function createPage(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(4, Math.round(w * SCALE));
  c.height = Math.max(4, Math.round(h * SCALE));
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, c.width, c.height);
  return { w, h, canvas: c, ctx };
}

function setFont(ctx, o = {}) {
  const size = o.size || PT(10);
  ctx.font = (o.italic ? 'italic ' : 'normal ') + (o.bold ? '700 ' : '400 ') + size + 'px ' + FONT;
  return size;
}

const LATEX_SYMS = {
  '\\times':'×', '\\cdot':'·', '\\div':'÷', '\\pm':'±', '\\mp':'∓',
  '\\leq':'≤', '\\le':'≤', '\\geq':'≥', '\\ge':'≥', '\\neq':'≠', '\\ne':'≠',
  '\\approx':'≈', '\\equiv':'≡', '\\sim':'∼', '\\propto':'∝',
  '\\infty':'∞', '\\partial':'∂', '\\nabla':'∇', '\\forall':'∀', '\\exists':'∃',
  '\\in':'∈', '\\notin':'∉', '\\ni':'∋', '\\subset':'⊂', '\\subseteq':'⊆',
  '\\supset':'⊃', '\\supseteq':'⊇', '\\cup':'∪', '\\cap':'∩', '\\setminus':'∖',
  '\\emptyset':'∅', '\\varnothing':'∅', '\\complement':'∁',
  '\\to':'→', '\\rightarrow':'→', '\\leftarrow':'←', '\\leftrightarrow':'↔',
  '\\Rightarrow':'⇒', '\\Leftarrow':'⇐', '\\Leftrightarrow':'⇔',
  '\\circ':'°', '\\degree':'°', '\\perp':'⊥', '\\parallel':'∥', '\\angle':'∠',
  '\\triangle':'△', '\\therefore':'∴', '\\because':'∵',
  '\\alpha':'α', '\\beta':'β', '\\gamma':'γ', '\\delta':'δ', '\\epsilon':'ε',
  '\\varepsilon':'ε', '\\zeta':'ζ', '\\eta':'η', '\\theta':'θ', '\\vartheta':'ϑ',
  '\\iota':'ι', '\\kappa':'κ', '\\lambda':'λ', '\\mu':'μ', '\\nu':'ν', '\\xi':'ξ',
  '\\pi':'π', '\\rho':'ρ', '\\sigma':'σ', '\\tau':'τ', '\\upsilon':'υ',
  '\\phi':'φ', '\\varphi':'φ', '\\chi':'χ', '\\psi':'ψ', '\\omega':'ω',
  '\\Gamma':'Γ', '\\Delta':'Δ', '\\Theta':'Θ', '\\Lambda':'Λ', '\\Xi':'Ξ',
  '\\Pi':'Π', '\\Sigma':'Σ', '\\Phi':'Φ', '\\Psi':'Ψ', '\\Omega':'Ω',
  '\\ldots':'…', '\\dots':'…', '\\cdots':'⋯', '\\vdots':'⋮', '\\ddots':'⋱',
  '\\quad':'  ', '\\qquad':'    ', '\\,':' ', '\\;':' ', '\\:':' ', '\\ ':' ',
  '\\%':'%', '\\_':'_', '\\&':'&', '\\#':'#',
};

function latexParse(src) {
  let i = 0;
  const n = src.length;
  function peek() { return src[i]; }
  function readCommand() {
    let j = i + 1;
    if (j < n && !/[a-zA-Z]/.test(src[j])) { i = j + 1; return '\\' + src[j - 1]; }
    let cmd = '';
    while (j < n && /[a-zA-Z]/.test(src[j])) { cmd += src[j]; j++; }
    i = j;
    return '\\' + cmd;
  }
  function readGroup() {
    if (peek() === '{') {
      i++;
      const node = readRow('}');
      if (peek() === '}') i++;
      return node;
    }
    if (peek() === '\\') {
      const cmd = readCommand();
      return atomFromCommand(cmd);
    }
    const ch = peek();
    i++;
    return { type: 'text', value: ch || '' };
  }
  function atomFromCommand(cmd) {
    if (LATEX_SYMS[cmd] !== undefined) return { type: 'text', value: LATEX_SYMS[cmd] };
    if (cmd === '\\frac') {
      const num = readGroup();
      const den = readGroup();
      return { type: 'frac', num, den };
    }
    if (cmd === '\\sqrt') {
      let idx = null;
      if (peek() === '[') {
        i++;
        let s = '';
        while (i < n && peek() !== ']') { s += src[i]; i++; }
        if (peek() === ']') i++;
        idx = s;
      }
      const rad = readGroup();
      return { type: 'sqrt', idx, rad };
    }
    if (cmd === '\\left') {
      let delim = '';
      if (peek()) { delim = peek(); i++; }
      const inner = readRow('\\right');
      if (src.slice(i, i + 6) === '\\right') {
        i += 6;
        let rdelim = '';
        if (peek()) { rdelim = peek(); i++; }
        return { type: 'delim', l: delim, r: rdelim, inner };
      }
      return { type: 'delim', l: delim, r: '', inner };
    }
    if (cmd === '\\vec') return { type: 'vec', body: readGroup() };
    if (cmd === '\\overline' || cmd === '\\bar') return { type: 'overline', body: readGroup() };
    if (cmd === '\\hat') return { type: 'hat', body: readGroup() };
    if (cmd === '\\sum' || cmd === '\\int' || cmd === '\\prod' || cmd === '\\oint' || cmd === '\\lim') {
      const glyph = { '\\sum': 'Σ', '\\int': '∫', '\\prod': 'Π', '\\oint': '∮', '\\lim': 'lim' }[cmd];
      return { type: 'bigop', glyph, isLim: cmd === '\\lim' };
    }
    if (cmd === '\\log' || cmd === '\\ln' || cmd === '\\sin' || cmd === '\\cos' || cmd === '\\tan' ||
        cmd === '\\cot' || cmd === '\\sec' || cmd === '\\csc' || cmd === '\\arcsin' || cmd === '\\arccos' ||
        cmd === '\\arctan' || cmd === '\\min' || cmd === '\\max' || cmd === '\\det' || cmd === '\\gcd') {
      return { type: 'func', name: cmd.slice(1) };
    }
    if (cmd === '\\begin') {
      let env = '';
      if (peek() === '{') { i++; while (i < n && peek() !== '}') { env += src[i]; i++; } if (peek() === '}') i++; }
      const rows = [];
      let curRow = [];
      const endTag = '\\end{' + env + '}';
      while (i < n && src.slice(i, i + endTag.length) !== endTag) {
        if (src.slice(i, i + 2) === '\\\\') { rows.push(curRow); curRow = []; i += 2; continue; }
        if (peek() === '&') { curRow.push({ type: 'text', value: '   ' }); i++; continue; }
        curRow.push(readAtom());
      }
      if (curRow.length) rows.push(curRow);
      if (src.slice(i, i + endTag.length) === endTag) i += endTag.length;
      return { type: 'env', env, rows };
    }
    return { type: 'text', value: cmd.replace('\\', '') };
  }
  function readAtom() {
    if (peek() === '^') { i++; const g = readGroup(); return { type: '_sup_pending', g }; }
    if (peek() === '_') { i++; const g = readGroup(); return { type: '_sub_pending', g }; }
    if (peek() === '{') return readGroup();
    if (peek() === '\\') return atomFromCommand(readCommand());
    if (peek() === "'") { i++; return { type: 'text', value: '′' }; }
    const ch = peek();
    i++;
    return { type: 'text', value: ch === undefined ? '' : ch };
  }
  function readRow(stopStr) {
    const atoms = [];
    while (i < n) {
      if (stopStr === '}' && peek() === '}') break;
      if (stopStr === '\\right' && src.slice(i, i + 6) === '\\right') break;
      let atom = readAtom();
      if (atom.type === '_sup_pending') {
        const base = atoms.pop() || { type: 'text', value: '' };
        atoms.push({ type: 'sup', base, sup: atom.g });
      } else if (atom.type === '_sub_pending') {
        const base = atoms.pop() || { type: 'text', value: '' };
        atoms.push({ type: 'sub', base, sub: atom.g });
      } else {
        atoms.push(atom);
      }
    }
    return { type: 'row', atoms };
  }
  try {
    return readRow(null);
  } catch (e) {
    return { type: 'row', atoms: [{ type: 'text', value: src }] };
  }
}

function measureLatexNode(ctx, node, size) {
  const savedFont = ctx.font;
  const fs = size;
  ctx.font = fs + 'px ' + FONT;
  let res;
  switch (node.type) {
    case 'text': {
      const w = ctx.measureText(node.value).width;
      res = { w, asc: fs * 0.72, desc: fs * 0.22 };
      break;
    }
    case 'row': {
      let w = 0, asc = fs * 0.72, desc = fs * 0.22;
      node.atoms.forEach((a) => {
        const m = measureLatexNode(ctx, a, size);
        w += m.w;
        asc = Math.max(asc, m.asc); desc = Math.max(desc, m.desc);
      });
      res = { w, asc, desc };
      break;
    }
    case 'frac': {
      const subSize = size;
      const mn = measureLatexNode(ctx, node.num, subSize * 0.92);
      const md = measureLatexNode(ctx, node.den, subSize * 0.92);
      const w = Math.max(mn.w, md.w) + fs * 0.28;
      const asc = mn.asc + mn.desc + fs * 0.14;
      const desc = md.asc + md.desc + fs * 0.14;
      res = { w, asc, desc };
      break;
    }
    case 'sqrt': {
      const mi = node.idx ? (() => { ctx.font = (fs * 0.55) + 'px ' + FONT; return ctx.measureText(node.idx).width; })() : 0;
      const mr = measureLatexNode(ctx, node.rad, size * 0.95);
      const w = mi + fs * 0.55 + mr.w + fs * 0.12;
      const asc = mr.asc + fs * 0.22;
      const desc = mr.desc;
      res = { w, asc, desc };
      break;
    }
    case 'sup': {
      const mb = measureLatexNode(ctx, node.base, size);
      const ms = measureLatexNode(ctx, node.sup, size * 0.62);
      const w = mb.w + ms.w + fs * 0.06;
      const asc = mb.asc + ms.asc * 0.85 + fs * 0.06;
      res = { w, asc, desc: mb.desc };
      break;
    }
    case 'sub': {
      const mb = measureLatexNode(ctx, node.base, size);
      const ms = measureLatexNode(ctx, node.sub, size * 0.62);
      const w = mb.w + ms.w + fs * 0.06;
      const desc = mb.desc + ms.asc * 0.7 + fs * 0.06;
      res = { w, asc: mb.asc, desc: Math.max(mb.desc, desc) };
      break;
    }
    case 'delim': {
      const mi = measureLatexNode(ctx, node.inner, size);
      const dw = fs * 0.32;
      res = { w: mi.w + dw * (node.l ? 1 : 0) + dw * (node.r ? 1 : 0), asc: mi.asc, desc: mi.desc };
      break;
    }
    case 'vec': case 'overline': case 'hat': {
      const mb = measureLatexNode(ctx, node.body, size);
      res = { w: mb.w, asc: mb.asc + fs * 0.16, desc: mb.desc };
      break;
    }
    case 'bigop': {
      ctx.font = (fs * 1.35) + 'px ' + FONT;
      const w = ctx.measureText(node.glyph).width + fs * 0.14;
      res = { w, asc: fs * 0.85, desc: fs * 0.35 };
      break;
    }
    case 'func': {
      ctx.font = fs + 'px ' + FONT;
      const w = ctx.measureText(node.name).width + fs * 0.1;
      res = { w, asc: fs * 0.72, desc: fs * 0.22 };
      break;
    }
    case 'env': {
      let maxW = 0, totalH = 0;
      const rowH = size * 1.35;
      node.rows.forEach((r) => {
        let rw = 0;
        r.forEach((a) => { rw += measureLatexNode(ctx, a, size * 0.92).w; });
        maxW = Math.max(maxW, rw);
        totalH += rowH;
      });
      const bracketW = node.env === 'cases' ? fs * 0.45 : fs * 0.5;
      res = { w: maxW + bracketW, asc: totalH / 2 + rowH / 2, desc: totalH / 2 - rowH / 2 + size * 0.2, rowH, isEnv: true };
      break;
    }
    default:
      res = { w: 0, asc: fs * 0.72, desc: fs * 0.22 };
  }
  ctx.font = savedFont;
  return res;
}

function drawLatexNode(ctx, node, x, y, size, color) {
  const fs = size;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  switch (node.type) {
    case 'text': {
      ctx.font = fs + 'px ' + FONT;
      ctx.fillText(node.value, x, y);
      return x + ctx.measureText(node.value).width;
    }
    case 'row': {
      let cx = x;
      node.atoms.forEach((a) => { cx = drawLatexNode(ctx, a, cx, y, size, color); });
      return cx;
    }
    case 'frac': {
      const subSize = size * 0.92;
      const mn = measureLatexNode(ctx, node.num, subSize);
      const md = measureLatexNode(ctx, node.den, subSize);
      const w = Math.max(mn.w, md.w) + fs * 0.28;
      const cx = x + w / 2;
      const barY = y - fs * 0.32;
      drawLatexNode(ctx, node.num, cx - mn.w / 2, barY - fs * 0.14 - mn.desc, subSize, color);
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, fs * 0.045);
      ctx.beginPath();
      ctx.moveTo(x + fs * 0.06, barY);
      ctx.lineTo(x + w - fs * 0.06, barY);
      ctx.stroke();
      drawLatexNode(ctx, node.den, cx - md.w / 2, barY + fs * 0.14 + md.asc, subSize, color);
      return x + w;
    }
    case 'sqrt': {
      const radSize = size * 0.95;
      const mr = measureLatexNode(ctx, node.rad, radSize);
      const stemW = fs * 0.55;
      const h = mr.asc + mr.desc + fs * 0.22;
      const topY = y - mr.asc - fs * 0.22;
      const botY = y + mr.desc;
      let ix = x;
      if (node.idx) {
        ctx.font = (fs * 0.55) + 'px ' + FONT;
        ctx.fillText(node.idx, ix, topY + fs * 0.3);
        ix += ctx.measureText(node.idx).width + fs * 0.05;
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, fs * 0.045);
      ctx.beginPath();
      ctx.moveTo(ix, y - h * 0.32);
      ctx.lineTo(ix + stemW * 0.28, botY);
      ctx.lineTo(ix + stemW * 0.5, topY);
      ctx.lineTo(ix + stemW + mr.w + fs * 0.1, topY);
      ctx.stroke();
      drawLatexNode(ctx, node.rad, ix + stemW, y, radSize, color);
      return ix + stemW + mr.w + fs * 0.1;
    }
    case 'sup': {
      const mb = measureLatexNode(ctx, node.base, size);
      const supSize = size * 0.62;
      const bx = drawLatexNode(ctx, node.base, x, y, size, color);
      drawLatexNode(ctx, node.sup, bx + fs * 0.03, y - mb.asc * 0.55, supSize, color);
      const ms = measureLatexNode(ctx, node.sup, supSize);
      return bx + ms.w + fs * 0.06;
    }
    case 'sub': {
      const bx = drawLatexNode(ctx, node.base, x, y, size, color);
      const subSize = size * 0.62;
      drawLatexNode(ctx, node.sub, bx + fs * 0.03, y + fs * 0.28, subSize, color);
      const ms = measureLatexNode(ctx, node.sub, subSize);
      return bx + ms.w + fs * 0.06;
    }
    case 'delim': {
      const mi = measureLatexNode(ctx, node.inner, size);
      const dw = fs * 0.32;
      let cx = x;
      ctx.font = (fs * 1.05) + 'px ' + FONT;
      if (node.l) { ctx.fillText(delimGlyph(node.l), cx, y + mi.desc * 0.3); cx += dw; }
      cx = drawLatexNode(ctx, node.inner, cx, y, size, color);
      if (node.r) { ctx.font = (fs * 1.05) + 'px ' + FONT; ctx.fillText(delimGlyph(node.r), cx, y + mi.desc * 0.3); cx += dw; }
      return cx;
    }
    case 'vec': {
      const mb = measureLatexNode(ctx, node.body, size);
      const bx = drawLatexNode(ctx, node.body, x, y, size, color);
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, fs * 0.04);
      const ay = y - mb.asc - fs * 0.1;
      ctx.beginPath(); ctx.moveTo(x, ay); ctx.lineTo(x + mb.w, ay); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + mb.w - fs * 0.08, ay - fs * 0.06); ctx.lineTo(x + mb.w, ay); ctx.lineTo(x + mb.w - fs * 0.08, ay + fs * 0.06); ctx.stroke();
      return bx;
    }
    case 'overline': {
      const mb = measureLatexNode(ctx, node.body, size);
      const bx = drawLatexNode(ctx, node.body, x, y, size, color);
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, fs * 0.04);
      const ay = y - mb.asc - fs * 0.08;
      ctx.beginPath(); ctx.moveTo(x, ay); ctx.lineTo(x + mb.w, ay); ctx.stroke();
      return bx;
    }
    case 'hat': {
      const mb = measureLatexNode(ctx, node.body, size);
      const bx = drawLatexNode(ctx, node.body, x, y, size, color);
      ctx.font = (fs * 0.7) + 'px ' + FONT;
      ctx.fillText('^', x + mb.w / 2 - fs * 0.12, y - mb.asc - fs * 0.02);
      return bx;
    }
    case 'bigop': {
      if (node.isLim) {
        ctx.font = 'italic ' + fs + 'px ' + FONT;
        ctx.fillText('lim', x, y);
        return x + ctx.measureText('lim').width + fs * 0.1;
      }
      ctx.font = (fs * 1.35) + 'px ' + FONT;
      ctx.fillText(node.glyph, x, y + fs * 0.1);
      return x + ctx.measureText(node.glyph).width + fs * 0.14;
    }
    case 'func': {
      ctx.font = 'normal ' + fs + 'px ' + FONT;
      ctx.fillText(node.name, x, y);
      return x + ctx.measureText(node.name).width + fs * 0.1;
    }
    case 'env': {
      const rowH = size * 1.35 * 0.92;
      const totalH = node.rows.length * rowH;
      let topY = y - totalH / 2 + rowH * 0.7;
      const bracketW = fs * (node.env === 'cases' ? 0.45 : 0.5);
      if (node.env === 'cases') {
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(1, fs * 0.045);
        ctx.beginPath();
        ctx.moveTo(x + bracketW * 0.7, y - totalH / 2);
        ctx.quadraticCurveTo(x, y - totalH / 2, x, y - rowH * 0.3);
        ctx.quadraticCurveTo(x, y, x - fs * 0.08, y);
        ctx.quadraticCurveTo(x, y, x, y + rowH * 0.3);
        ctx.quadraticCurveTo(x, y + totalH / 2, x + bracketW * 0.7, y + totalH / 2);
        ctx.stroke();
      }
      let cx = x + bracketW;
      node.rows.forEach((r) => {
        let rx = cx;
        r.forEach((a) => { rx = drawLatexNode(ctx, a, rx, topY, size * 0.92, color); });
        topY += rowH;
      });
      return x + bracketW + (measureLatexNode(ctx, node, size).w - bracketW);
    }
    default:
      return x;
  }
}

function delimGlyph(d) {
  const map = { '|': '|', '(': '(', ')': ')', '[': '[', ']': ']', '\\{': '{', '\\}': '}', '.': '' };
  return map[d] !== undefined ? map[d] : d;
}

function tokenizeLatexSegments(text) {
  const raw = String(text || '');
  const parts = raw.split(/(\$[^$]+\$)/g);
  const segs = [];
  parts.forEach((p) => {
    if (!p) return;
    if (/^\$[^$]+\$$/.test(p)) {
      segs.push({ latex: true, src: p.slice(1, -1) });
    } else {
      segs.push({ latex: false, src: p });
    }
  });
  return segs.length ? segs : [{ latex: false, src: '' }];
}

function wrapRichText(ctx, text, maxW) {
  const paras = String(text || '').split(/\n/);
  const lines = [];
  for (const para of paras) {
    if (!para.trim()) { lines.push([]); continue; }
    const segs = tokenizeLatexSegments(para);
    let cur = [];
    let curW = 0;
    const pushLine = () => { lines.push(cur); cur = []; curW = 0; };
    segs.forEach((seg) => {
      if (seg.latex) {
        const node = latexParse(seg.src);
        const savedFont = ctx.font;
        const m = measureLatexNode(ctx, node, parseFloat(ctx.font) || PT(9.5));
        ctx.font = savedFont;
        if (curW + m.w > maxW && cur.length) pushLine();
        cur.push({ latex: true, node, w: m.w, asc: m.asc, desc: m.desc });
        curW += m.w;
      } else {
        const words = seg.src.split(/(\s+)/);
        words.forEach((w) => {
          if (!w) return;
          const ww = ctx.measureText(w).width;
          if (curW + ww > maxW && curW > 0 && !/^\s+$/.test(w)) pushLine();
          if (!/^\s+$/.test(w) || curW > 0) { cur.push({ latex: false, text: w, w: ww }); curW += ww; }
        });
      }
    });
    pushLine();
  }
  return lines.length ? lines : [[]];
}

function drawRichLine(ctx, tokens, x, y, fontSize, color, fontSpec) {
  let cx = x;
  tokens.forEach((tok) => {
    if (tok.latex) {
      cx = drawLatexNode(ctx, tok.node, cx, y, fontSize, color);
    } else {
      ctx.font = fontSpec;
      ctx.fillStyle = color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(tok.text, cx, y);
      cx += tok.w;
    }
  });
}

function wrapText(ctx, text, maxW) {
  const paras = String(text || '').split(/\n/);
  const lines = [];
  for (const para of paras) {
    if (!para.trim()) { lines.push(''); continue; }
    const words = para.split(/\s+/);
    let cur = '';
    for (const w of words) {
      const t = cur ? cur + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; }
      else cur = t;
    }
    if (cur) lines.push(cur);
  }
  return lines.length ? lines : [''];
}

function drawText(ctx, str, x, y, o = {}) {
  const size = setFont(ctx, o);
  const lh = o.lineH || size * 1.45;
  ctx.fillStyle = o.color || '#111111';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = o.align || 'left';
  const maxW = o.maxW != null ? o.maxW : null;
  const hasLatex = /\$[^$]+\$/.test(String(str || ''));
  if (hasLatex) {
    const fontSpec = ctx.font;
    const lines = wrapRichText(ctx, str, maxW != null ? maxW : 1e6);
    lines.forEach((tokens, i) => {
      let lineW = 0;
      tokens.forEach((t) => (lineW += t.w));
      let lx = x * SCALE;
      if (o.align === 'center') lx = x * SCALE - lineW / 2;
      else if (o.align === 'right') lx = x * SCALE - lineW;
      const prevAlign = ctx.textAlign;
      ctx.textAlign = 'left';
      drawRichLine(ctx, tokens, lx, y * SCALE + i * lh, size, o.color || '#111111', fontSpec);
      ctx.textAlign = prevAlign;
    });
    ctx.font = fontSpec;
    return (lines.length * lh) / SCALE;
  }
  const lines = maxW != null ? wrapText(ctx, str, maxW) : [String(str)];
  lines.forEach((l, i) => { ctx.fillText(l, x * SCALE, y * SCALE + i * lh); });
  return (lines.length * lh) / SCALE;
}

const imgCache = {};
function getImg(q) {
  return new Promise((res) => {
    if (imgCache[q.id]) return res(imgCache[q.id]);
    const src = q.imgSrc || q.src;
    if (!src) return res(null);
    const im = new Image();
    im.onload = () => { imgCache[q.id] = im; res(im); };
    im.onerror = () => res(null);
    im.src = src;
  });
}

const MEB_LOGO_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Milli_E%C4%9Fitim_Bakanl%C4%B1%C4%9F%C4%B1_Logo.svg/500px-Milli_E%C4%9Fitim_Bakanl%C4%B1%C4%9F%C4%B1_Logo.svg.png';
let mebLogoImg = null, mebLogoReady = null;
let customLogoSrc = null, customLogoImg = null;

function setCustomLogo(src, img) {
  customLogoSrc = src;
  customLogoImg = img;
}

function ensureMebLogo() {
  if (mebLogoReady) return mebLogoReady;
  mebLogoReady = new Promise((resolve) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => { mebLogoImg = im; resolve(); };
    im.onerror = () => { mebLogoImg = null; resolve(); };
    im.src = MEB_LOGO_URL;
  });
  return mebLogoReady;
}

function mebLogoVisible() {
  const choice = S.logoChoice || 'meb';
  return choice !== 'none' && (choice === 'meb' || (choice === 'custom' && customLogoImg));
}

function getMebLogoBox(M) {
  const defaultX = M + 2;
  const defaultY = M + 2;
  return {
    show: mebLogoVisible(),
    x: S.logoX != null ? S.logoX : defaultX,
    y: S.logoY != null ? S.logoY : defaultY,
    w: S.logoW || 22,
    h: S.logoH || 22
  };
}

function activeLogoAspect() {
  const choice = S.logoChoice || 'meb';
  if (choice === 'custom' && customLogoImg && customLogoImg.naturalWidth && customLogoImg.naturalHeight) {
    return customLogoImg.naturalWidth / customLogoImg.naturalHeight;
  }
  return 1;
}

function fixLogoAspect(refreshFn) {
  const ar = activeLogoAspect();
  let h = S.logoH || 26;
  let w = h * ar;
  const maxW = 60;
  if (w > maxW) { w = maxW; h = w / ar; }
  S.logoW = Math.max(8, w);
  S.logoH = Math.max(8, h);
  if (refreshFn) refreshFn();
}

function trimLogoImage(src, cb) {
  const im = new Image();
  im.onload = () => {
    const w = im.naturalWidth, h = im.naturalHeight;
    if (!w || !h) return cb(src);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(im, 0, 0);
    let data;
    try { data = ctx.getImageData(0, 0, w, h).data; } catch (e) { return cb(src); }
    const isBlank = (i) => {
      const a = data[i + 3];
      if (a < 12) return true;
      return data[i] > 244 && data[i + 1] > 244 && data[i + 2] > 244;
    };
    let top = 0, bottom = h - 1, left = 0, right = w - 1;
    const rowBlank = (y) => { for (let x = 0; x < w; x++) if (!isBlank((y * w + x) * 4)) return false; return true; };
    const colBlank = (x) => { for (let y = top; y <= bottom; y++) if (!isBlank((y * w + x) * 4)) return false; return true; };
    while (top < bottom && rowBlank(top)) top++;
    while (bottom > top && rowBlank(bottom)) bottom--;
    while (left < right && colBlank(left)) left++;
    while (right > left && colBlank(right)) right--;
    const pad = 1;
    top = Math.max(0, top - pad); left = Math.max(0, left - pad);
    bottom = Math.min(h - 1, bottom + pad); right = Math.min(w - 1, right + pad);
    const nw = right - left + 1, nh = bottom - top + 1;
    if (nw < 4 || nh < 4 || (nw === w && nh === h)) return cb(src);
    const o = document.createElement('canvas');
    o.width = nw; o.height = nh;
    o.getContext('2d').drawImage(c, left, top, nw, nh, 0, 0, nw, nh);
    cb(o.toDataURL('image/png'));
  };
  im.onerror = () => cb(src);
  im.src = src;
}

function drawMEBLogo(ctx, x, y, w, h) {
  const choice = S.logoChoice || 'meb';
  if (choice === 'none') return;
  if (choice === 'custom' && customLogoImg) {
    ctx.drawImage(customLogoImg, PX(x), PX(y), PX(w), PX(h));
    return;
  }
  if (mebLogoImg) {
    ctx.drawImage(mebLogoImg, PX(x), PX(y), PX(w), PX(h));
    return;
  }
  drawMEBLogoVector(ctx, x + w / 2, y + h / 2, Math.min(w, h) / 2);
}

function drawMEBLogoVector(ctx, cx, cy, r) {
  const RED = '#d32b2b';
  const X = PX(cx), Y = PX(cy), R = PX(r);
  ctx.save();
  ctx.translate(X, Y);
  ctx.strokeStyle = RED; ctx.fillStyle = RED;
  ctx.lineWidth = Math.max(1, R * 0.035);
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = Math.max(1, R * 0.02);
  ctx.beginPath(); ctx.arc(0, 0, R * 0.93, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = Math.max(0.6, R * 0.026);
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2, rr1 = R * 0.945, rr2 = R * 0.995, sk = 0.05;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * rr1, Math.sin(a) * rr1);
    ctx.lineTo(Math.cos(a + sk) * rr2, Math.sin(a + sk) * rr2);
    ctx.stroke();
  }
  ctx.lineWidth = Math.max(1, R * 0.022);
  ctx.beginPath(); ctx.arc(0, 0, R * 0.7, 0, Math.PI * 2); ctx.stroke();
  const ring = (text, radius, startA, endA, size, flip) => {
    setFont(ctx, { size, bold: true });
    ctx.fillStyle = RED; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const n = text.length; if (!n) return;
    for (let i = 0; i < n; i++) {
      const p = n === 1 ? 0.5 : i / (n - 1);
      const a = startA + (endA - startA) * p;
      ctx.save();
      ctx.translate(Math.cos(a) * radius, Math.sin(a) * radius);
      ctx.rotate(a + (flip ? -Math.PI / 2 : Math.PI / 2));
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  };
  ring('TÜRKİYE CUMHURİYETİ MİLLİ EĞİTİM BAKANLIĞI', R * 0.82, Math.PI * 0.86, Math.PI * 0.14, R * 0.115, true);
  const star = (a, sr) => {
    const px = Math.cos(a) * R * 0.82, py = Math.sin(a) * R * 0.82;
    ctx.save(); ctx.translate(px, py); ctx.beginPath();
    for (let k = 0; k < 5; k++) {
      const oa = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
      const ia = oa + Math.PI / 5;
      ctx.lineTo(Math.cos(oa) * sr, Math.sin(oa) * sr);
      ctx.lineTo(Math.cos(ia) * sr * 0.42, Math.sin(ia) * sr * 0.42);
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
  };
  [0.24, 0.36, 0.5, 0.64, 0.76].forEach((f) => star(Math.PI * f, R * 0.075));
  ctx.lineWidth = Math.max(1, R * 0.03);
  ctx.beginPath();
  ctx.moveTo(-R * 0.42, R * 0.3); ctx.quadraticCurveTo(-R * 0.2, R * 0.18, 0, R * 0.3);
  ctx.quadraticCurveTo(R * 0.2, R * 0.18, R * 0.42, R * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-R * 0.42, R * 0.3); ctx.lineTo(-R * 0.42, R * 0.44);
  ctx.quadraticCurveTo(-R * 0.2, R * 0.32, 0, R * 0.44);
  ctx.quadraticCurveTo(R * 0.2, R * 0.32, R * 0.42, R * 0.44);
  ctx.lineTo(R * 0.42, R * 0.3);
  ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, R * 0.3); ctx.lineTo(0, R * 0.44); ctx.stroke();
  ctx.lineWidth = Math.max(1, R * 0.05);
  ctx.beginPath(); ctx.moveTo(0, R * 0.28); ctx.lineTo(0, -R * 0.05); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -R * 0.05);
  ctx.bezierCurveTo(-R * 0.22, -R * 0.16, -R * 0.14, -R * 0.4, 0, -R * 0.5);
  ctx.bezierCurveTo(R * 0.14, -R * 0.4, R * 0.22, -R * 0.16, 0, -R * 0.05);
  ctx.closePath(); ctx.fill();
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(0, -R * 0.28, R * 0.115, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = RED;
  ctx.beginPath(); ctx.arc(R * 0.035, -R * 0.28, R * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.restore();
}

function getMEBHeaderItems(ctx, PW, PH, M, t, version) {
  const L = M + 2, R = PW - M - 2;
  const logoBox = getMebLogoBox(M);
  const showLogo = logoBox.show;
  // Başlık metinleri logodan tamamen bağımsız olarak sayfa genişliğinin tam ortasına hizalanır:
  const textCx = (L + R) / 2;
  let y = M + 3.5;
  ctx.save();

  setFont(ctx, { size: PT(12), bold: true });
  const wYear = ctx.measureText(S.mebYear || '').width / SCALE;
  const defYear = { x: textCx - wYear / 2, y: y, w: wYear, h: 4.8 };
  y += 6.5;

  setFont(ctx, { size: PT(12), bold: true });
  const wSchool = ctx.measureText(S.mebSchool || '').width / SCALE;
  const defSchool = { x: textCx - wSchool / 2, y: y, w: wSchool, h: 4.8 };
  y += 6.5;

  const dash = (v) => (v && String(v).trim() ? String(v).trim() : '...............');
  const lessonText = dash(S.mebLesson);
  const gradeText = dash(S.mebGrade) + ' Sınıf';
  const examOnly = S.mebExam && String(S.mebExam).trim() ? String(S.mebExam).trim() : '............... Sınavı';
  const examText = gradeText + ' ' + examOnly;

  setFont(ctx, { size: PT(11), bold: true });
  const gapMM = 2.5;
  const wLesson = ctx.measureText(lessonText).width / SCALE;
  const wExam = ctx.measureText(examText).width / SCALE;
  const totalW = wLesson + gapMM + wExam;
  const rowStartX = textCx - totalW / 2;
  const defLesson = { x: rowStartX, y, w: wLesson, h: 4.8 };
  const defExam = { x: rowStartX + wLesson + gapMM, y, w: wExam, h: 4.8 };

  const dateStr = (S.mebDate || '').trim();
  setFont(ctx, { size: PT(10.5), bold: true });
  const wDate = dateStr ? ctx.measureText(dateStr).width / SCALE : 18;
  const defDate = { x: R - wDate, y, w: wDate, h: 4.4 };

  // Öğrenci kimlik satırı logonun ASLA üstüne gelmeyecek şekilde logonun bitişinin altına yerleştirilir:
  const minStudentY = showLogo ? (logoBox.y + logoBox.h + 3.5) : (M + 22);
  y = Math.max(y + 6.5, minStudentY);

  setFont(ctx, { size: PT(10.5), bold: true });
  const wName = S.mebNameLbl ? ctx.measureText(S.mebNameLbl).width / SCALE : 20;
  const wClass = S.mebClassLbl ? ctx.measureText(S.mebClassLbl).width / SCALE : 12;
  const wNo = S.mebNoLbl ? ctx.measureText(S.mebNoLbl).width / SCALE : 16;
  const wScore = S.mebScoreLbl ? ctx.measureText(S.mebScoreLbl).width / SCALE : 10;
  const defName = { x: L, y, w: wName, h: 4.4 };
  const defClass = { x: L + (PW - 2 * M) * 0.36, y, w: wClass, h: 4.4 };
  const defNo = { x: L + (PW - 2 * M) * 0.55, y, w: wNo, h: 4.4 };
  const defScore = { x: L + (PW - 2 * M) * 0.78, y, w: wScore, h: 4.4 };
  ctx.restore();

  const p = S.mebPos || {};
  const make = (id, text, size, bold, def) => ({ id, text, size, bold, align: 'left', x: p[id]?.x != null ? p[id].x : def.x, y: p[id]?.y != null ? p[id].y : def.y, w: def.w, h: def.h });
  return {
    mebYear: make('mebYear', S.mebYear, 12, true, defYear),
    mebSchool: make('mebSchool', S.mebSchool, 12, true, defSchool),
    mebLesson: make('mebLesson', lessonText, 12, true, defLesson),
    mebExam: make('mebExam', examText, 12, true, defExam),
    mebDate: make('mebDate', dateStr, 10.5, true, defDate),
    mebNameLbl: make('mebNameLbl', S.mebNameLbl || 'Adı-Soyadı:', 10.5, true, defName),
    mebClassLbl: make('mebClassLbl', S.mebClassLbl || 'Sınıfı:', 10.5, true, defClass),
    mebNoLbl: make('mebNoLbl', S.mebNoLbl || 'Okul No.:', 10.5, true, defNo),
    mebScoreLbl: make('mebScoreLbl', S.mebScoreLbl || 'Puan:', 10.5, true, defScore),
  };
}

function drawMEBHeader(ctx, PW, PH, M, t, version, first) {
  const logoBox = getMebLogoBox(M);
  if (logoBox.show) drawMEBLogo(ctx, logoBox.x, logoBox.y, logoBox.w, logoBox.h);
  const items = getMEBHeaderItems(ctx, PW, PH, M, t, version);

  ['mebYear', 'mebSchool', 'mebLesson', 'mebExam', 'mebDate', 'mebNameLbl', 'mebClassLbl', 'mebNoLbl', 'mebScoreLbl'].forEach((key) => {
    const it = items[key];
    if (!it || !it.text) return;
    drawText(ctx, it.text, it.x, it.y + (it.size >= 12 ? 3.8 : 3.5), { size: PT(it.size), bold: it.bold });
  });

  const labelY = Math.max(items.mebNameLbl.y, items.mebClassLbl.y, items.mebNoLbl.y, items.mebScoreLbl.y);
  let y = labelY + 4.5;
  if (!t.hideVersion && S.groups > 1) {
    drawText(ctx, 'Kitapçık: ' + version, PW - M - 2, y - 6.2, { size: PT(9), bold: true, align: 'right' });
  }
  ctx.strokeStyle = '#111';
  ctx.lineWidth = Math.max(1, 0.4 * SCALE);
  ctx.beginPath();
  ctx.moveTo(PX(M), PX(y));
  ctx.lineTo(PX(PW - M), PX(y));
  ctx.stroke();
  y += 3.5;
  if (!t.noDescription && S.description) {
    y += drawText(ctx, S.description, M + 1, y, {
      size: PT(7.5), italic: true, color: '#475569', maxW: PX(PW - 2 * M - 2),
    }) + 1.5;
  }
  return y + 1;
}

function drawHeader(ctx, PW, PH, M, t, version, title, first) {
  if (S.watermark && !S.watermarkDivider) {
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#505050';
    setFont(ctx, { size: PT(S.watermarkSize || 44), bold: true });
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate((PW / 2) * SCALE, (PH / 2) * SCALE);
    const wmAngle = t.negativeAngle ? -Math.abs(S.watermarkAngle ?? 45) : (S.watermarkAngle ?? 45);
    ctx.rotate((wmAngle * Math.PI) / 180);
    ctx.fillText(S.watermark, 0, 0);
    ctx.restore();
  }
  if (S.template === 'meb') {
    if (!first) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = Math.max(1, 0.3 * SCALE);
      ctx.beginPath();
      ctx.moveTo(PX(M), PX(M + 5));
      ctx.lineTo(PX(PW - M), PX(M + 5));
      ctx.stroke();
      drawText(ctx, S.mebSchool || S.school || '', M, M + 4, { size: PT(7.5), color: '#475569' });
      const dash2 = (v) => (v && String(v).trim() ? String(v).trim() : '');
      const mid = [dash2(S.mebLesson), dash2(S.mebGrade), dash2(S.mebExam)].filter(Boolean).join(' · ');
      if (mid) drawText(ctx, mid, PW / 2, M + 4, { size: PT(8), bold: true, align: 'center' });
      if (!t.hideVersion && S.groups > 1) drawText(ctx, 'Kitapçık: ' + version, PW - M, M + 4, { size: PT(7.5), align: 'right' });
      return M + 8;
    }
    return drawMEBHeader(ctx, PW, PH, M, t, version, first);
  }
  if (S.template === 'custom') {
    if (!first) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = Math.max(1, 0.3 * SCALE);
      ctx.beginPath();
      ctx.moveTo(PX(M), PX(M + 5));
      ctx.lineTo(PX(PW - M), PX(M + 5));
      ctx.stroke();
      const tpl = getActiveCustomTemplate();
      drawText(ctx, (tpl ? tpl.school : S.school) || '', M, M + 4, { size: PT(7.5), color: '#475569' });
      const mid = (tpl ? tpl.examTitle : S.title) || 'Sınav';
      drawText(ctx, mid, PW / 2, M + 4, { size: PT(8), bold: true, align: 'center' });
      if (!t.hideVersion && S.groups > 1) drawText(ctx, 'Kitapçık: ' + version, PW - M, M + 4, { size: PT(7.5), align: 'right' });
      return M + 8;
    }
    return drawCustomHeader(ctx, PW, PH, M, t, version, first);
  }
  if (S.testType === 'yazili') {
    if (!first) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = Math.max(1, 0.3 * SCALE);
      ctx.beginPath();
      ctx.moveTo(PX(M), PX(M + 5));
      ctx.lineTo(PX(PW - M), PX(M + 5));
      ctx.stroke();
      drawText(ctx, S.school, M, M + 4, { size: PT(7.5), color: '#475569' });
      drawText(ctx, title + ' YAZILI SINAVI', PW / 2, M + 4, { size: PT(8), bold: true, align: 'center' });
      if (!t.hideVersion && S.groups > 1) drawText(ctx, 'Kitapçık: ' + version, PW - M, M + 4, { size: PT(7.5), align: 'right' });
      return M + 8;
    }
    const boxH = 15;
    ctx.strokeStyle = S.themeColor || '#1e293b';
    ctx.lineWidth = Math.max(1.2, 0.5 * SCALE);
    ctx.strokeRect(PX(M), PX(M), PX(PW - 2 * M), PX(boxH));
    ctx.beginPath();
    ctx.moveTo(PX(M), PX(M + 7.5));
    ctx.lineTo(PX(PW - M), PX(M + 7.5));
    ctx.stroke();
    const topText = (S.school ? S.school.toLocaleUpperCase('tr-TR') + ' • ' : '') + (S.lesson ? S.lesson + ' • ' : '') + title + ' YAZILI SINAVI';
    drawText(ctx, topText, PW / 2, M + 5.2, { size: PT(8.5), bold: true, align: 'center', color: '#0f172a' });
    if (!t.hideVersion && S.groups > 1) drawText(ctx, 'Kitapçık: ' + version, PW - M - 2.5, M + 5.2, { size: PT(8.5), bold: true, align: 'right' });
    drawText(ctx, 'Adı Soyadı: .......................................', M + 2.5, M + 12.2, { size: PT(8.2) });
    drawText(ctx, 'Sınıfı / Şubesi: .........', PW / 2 - 12, M + 12.2, { size: PT(8.2) });
    drawText(ctx, 'No: .........', PW / 2 + 28, M + 12.2, { size: PT(8.2) });
    drawText(ctx, 'Puan: .........', PW - M - 2.5, M + 12.2, { size: PT(8.5), bold: true, align: 'right' });
    let y = M + boxH + 2.5;
    if (!t.noDescription && S.description) {
      y += drawText(ctx, S.description, t.centerDescription ? PW / 2 : M + 1, y, {
        size: PT(8), italic: true, color: '#475569', maxW: PX(PW - 2 * M - 2), align: t.centerDescription ? 'center' : 'left',
      }) + 1.5;
    }
    return y;
  }
  if (S.testType === 'yaprak') {
    const headerTop = first ? M : M + 3;
    drawText(ctx, (S.school || 'BİLİM AKADEMİ').toLocaleUpperCase('tr-TR'), M, headerTop + 4, { size: PT(14), bold: true, color: '#2c3e50' });
    drawText(ctx, title.toLocaleUpperCase('tr-TR'), PW - M, headerTop + 4, { size: PT(16), bold: true, align: 'right', color: '#000' });
    if (!t.hideVersion && S.groups > 1) {
      drawText(ctx, version + ' KİTAPÇIĞI', PW - M, headerTop + 10, { size: PT(7), bold: true, align: 'right', color: '#555' });
    }
    ctx.strokeStyle = '#333';
    ctx.lineWidth = Math.max(1.5, 0.5 * SCALE);
    ctx.beginPath();
    ctx.moveTo(PX(M), PX(headerTop + 13));
    ctx.lineTo(PX(PW - M), PX(headerTop + 13));
    ctx.stroke();
    let currentY = headerTop + 18;
    if (first && S.konuKapsami) {
      const topics = S.konuKapsami.split(',').map((s) => s.trim()).filter(Boolean);
      if (topics.length) {
        const topicText = '> ' + topics.join(' > ');
        ctx.fillStyle = '#f1f3f5';
        ctx.fillRect(PX(M), PX(currentY), PX(PW - 2 * M), PX(8));
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = Math.max(1, 0.25 * SCALE);
        ctx.strokeRect(PX(M), PX(currentY), PX(PW - 2 * M), PX(8));
        drawText(ctx, topicText, PW / 2, currentY + 5, { size: PT(9), bold: true, align: 'center', color: '#333' });
        currentY += 12;
      }
    }
    if (first && !t.noDescription && S.description) {
      currentY += drawText(ctx, S.description, M + 1, currentY, { size: PT(8), italic: true, color: '#475569', maxW: PX(PW - 2 * M - 2) }) + 1.5;
    }
    return currentY + 2;
  }
  return M + 8;
}

function splitBlanks(text) {
  const parts = String(text || '').split(/(\.{3,}|_{2,})/g);
  return parts.map((p) => ({ text: p, isBlank: /^(\.{3,}|_{2,})$/.test(p) }));
}

function wrapBlankSegments(ctx, text, maxW, blankW) {
  const segs = splitBlanks(text);
  const lines = [];
  let cur = [];
  let curW = 0;
  const pushLine = () => { if (cur.length) lines.push(cur); cur = []; curW = 0; };
  segs.forEach((seg) => {
    if (seg.isBlank) {
      if (curW + blankW > maxW) pushLine();
      cur.push({ blank: true, w: blankW });
      curW += blankW;
      return;
    }
    const words = seg.text.split(/(\s+)/);
    words.forEach((w) => {
      if (!w) return;
      const ww = ctx.measureText(w).width;
      if (curW + ww > maxW && curW > 0) pushLine();
      if (!/^\s+$/.test(w) || curW > 0) { cur.push({ blank: false, text: w, w: ww }); curW += ww; }
    });
  });
  pushLine();
  return lines.length ? lines : [[]];
}

function wrapAuto(ctx, text, maxW) {
  if (/\$[^$]+\$/.test(String(text || ''))) return wrapRichText(ctx, text, maxW);
  return wrapText(ctx, text, maxW);
}

function drawAutoLine(ctx, line, x, y, fontSize, color, fontSpec) {
  if (Array.isArray(line)) {
    drawRichLine(ctx, line, x, y, fontSize, color, fontSpec);
    return;
  }
  ctx.font = fontSpec;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(line, x, y);
}

function prepText(it, ctx) {
  const q = it.q;
  const contentW = it.w * SCALE - PX(7);
  if (q.kind === 'bosluk') {
    setFont(ctx, { size: PT(9.5), bold: false });
    it.blankLines = wrapBlankSegments(ctx, q.blankText || '', contentW, PX(22));
    let h = it.blankLines.length * LH_MM + 2;
    it.imgHeight = 0;
    if (q.imgSrc && imgCache[q.id]) {
      const im = imgCache[q.id];
      it.imgHeight = Math.min((im.height / Math.max(1, im.width)) * (contentW / SCALE), 45);
      h += it.imgHeight + 2;
    }
    if ((q.wordBank || []).length && !q.bankShared) {
      setFont(ctx, { size: PT(8.5) });
      it.bankLines = wrapText(ctx, '( ' + q.wordBank.join('  /  ') + ' )', contentW);
      h += it.bankLines.length * 4.4 + 2.5;
    } else it.bankLines = [];
    it.h = Math.max(h + 1, 8);
    return;
  }
  setFont(ctx, { size: PT(9.5) });
  it.preambleLines = q.text ? wrapAuto(ctx, q.text, contentW) : [];
  setFont(ctx, { size: PT(9.5), bold: true });
  it.rootLines = q.root ? wrapAuto(ctx, q.root, contentW) : [];
  if (!it.rootLines.length && it.preambleLines.length) { it.rootLines = it.preambleLines; it.preambleLines = []; }
  const opts = (q.options || []).filter(Boolean);
  setFont(ctx, { size: PT(9) });
  it.optLines = opts.map((o, k) => ({
    letter: LETTERS[k] + ')',
    lines: wrapAuto(ctx, o, q.layout === 'h' ? (it.w / Math.max(1, opts.length) - 4) * SCALE : contentW - PX(5)),
  }));
  it.imgHeight = 0;
  if (q.imgSrc && imgCache[q.id]) {
    const im = imgCache[q.id];
    it.imgHeight = Math.min((im.height / Math.max(1, im.width)) * (contentW / SCALE), 45);
  }
  let h = 0;
  if (it.imgHeight) h += it.imgHeight + 2;
  if (it.preambleLines.length) h += it.preambleLines.length * LH_MM;
  if (it.preambleLines.length && it.rootLines.length) h += 1.2;
  if (it.rootLines.length) h += it.rootLines.length * LH_MM;
  if ((it.preambleLines.length || it.rootLines.length) && it.optLines.length) h += 1.5;
  if (it.optLines.length) {
    if (q.layout === 'h') h += Math.max(...it.optLines.map((o) => o.lines.length), 1) * 4.4 + 1;
    else it.optLines.forEach((o) => (h += o.lines.length * 4.4 + 0.8));
  }
  if (q.blank) h += q.blank + 2;
  it.h = Math.max(h + 1, 8);
}

function drawQ(ctx, it, x, y) {
  const q = it.q;
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  setFont(ctx, { size: PT(10), bold: true });
  ctx.fillText(it.num + '.', PX(x + 0.5), PX(y + 4.2));

  if (q.type === 'text' && q.kind === 'bosluk') {
    let ty = y + 4.2;
    const textX = x + 6.5;
    if (q.imgSrc && imgCache[q.id]) {
      const im = imgCache[q.id];
      const imgW = it.w - 6;
      const imgH = it.imgHeight || Math.min((im.height / Math.max(1, im.width)) * imgW, 45);
      ctx.drawImage(im, PX(textX), PX(ty), PX(imgW), PX(imgH));
      ty += imgH + 2;
    }
    setFont(ctx, { size: PT(9.5) });
    ctx.fillStyle = '#1e293b';
    (it.blankLines || []).forEach((line) => {
      let lx = PX(textX);
      line.forEach((seg) => {
        if (seg.blank) {
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = Math.max(1, 0.3 * SCALE);
          ctx.beginPath();
          ctx.moveTo(lx + PX(1), PX(ty + 0.8));
          ctx.lineTo(lx + seg.w - PX(1), PX(ty + 0.8));
          ctx.stroke();
        } else {
          setFont(ctx, { size: PT(9.5) });
          ctx.fillStyle = '#1e293b';
          ctx.fillText(seg.text, lx, PX(ty));
        }
        lx += seg.w;
      });
      ty += LH_MM;
    });
    if ((it.bankLines || []).length) {
      ty += 1.5;
      setFont(ctx, { size: PT(8.5), italic: true });
      ctx.fillStyle = '#92400e';
      it.bankLines.forEach((l) => { ctx.fillText(l, PX(textX), PX(ty)); ty += 4.4; });
    }
    return;
  }

  if (q.type === 'text') {
    let ty = y + 4.2;
    const textX = x + 6.5;
    const imgW = it.w - 6;
    if (q.imgSrc && imgCache[q.id]) {
      const im = imgCache[q.id];
      const imgH = it.imgHeight || Math.min((im.height / Math.max(1, im.width)) * imgW, 45);
      ctx.drawImage(im, PX(textX), PX(ty), PX(imgW), PX(imgH));
      ty += imgH + 2;
    }
    if (it.preambleLines && it.preambleLines.length) {
      const fSize = PT(9.5);
      const fSpec = setFont(ctx, { size: fSize }) && ctx.font;
      it.preambleLines.forEach((l) => { drawAutoLine(ctx, l, PX(textX), PX(ty), fSize, '#1e293b', fSpec); ty += LH_MM; });
      if (it.rootLines && it.rootLines.length) ty += 1.2;
    }
    if (it.rootLines && it.rootLines.length) {
      const fSize = PT(9.5);
      setFont(ctx, { size: fSize, bold: true });
      const fSpec = ctx.font;
      it.rootLines.forEach((l) => { drawAutoLine(ctx, l, PX(textX), PX(ty), fSize, '#0f172a', fSpec); ty += LH_MM; });
      ty += 1.5;
    }
    if (it.optLines && it.optLines.length) {
      if (q.layout === 'h') {
        const cw = it.w / Math.max(1, it.optLines.length);
        let maxL = 1;
        it.optLines.forEach((o, k) => {
          const colX = x + 5.5 + k * cw;
          setFont(ctx, { size: PT(9), bold: true });
          ctx.fillStyle = '#0f172a';
          ctx.textAlign = 'left';
          ctx.fillText(o.letter, PX(colX), PX(ty));
          const fSize = PT(9);
          setFont(ctx, { size: fSize });
          const fSpec = ctx.font;
          o.lines.forEach((l, j) => { drawAutoLine(ctx, l, PX(colX + 5), PX(ty + j * 4.4), fSize, '#334155', fSpec); });
          maxL = Math.max(maxL, o.lines.length);
        });
        ty += maxL * 4.4 + 1;
      } else {
        it.optLines.forEach((o) => {
          setFont(ctx, { size: PT(9), bold: true });
          ctx.fillStyle = '#0f172a';
          ctx.textAlign = 'left';
          ctx.fillText(o.letter, PX(x + 6.5), PX(ty));
          const fSize = PT(9);
          setFont(ctx, { size: fSize });
          const fSpec = ctx.font;
          o.lines.forEach((l, j) => { drawAutoLine(ctx, l, PX(x + 12), PX(ty + j * 4.4), fSize, '#334155', fSpec); });
          ty += o.lines.length * 4.4 + 0.8;
        });
      }
    }
    if (q.blank) {
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = Math.max(1, 0.25 * SCALE);
      for (let ly = ty + 4; ly < ty + q.blank; ly += 6) {
        ctx.beginPath();
        ctx.moveTo(PX(textX), PX(ly));
        ctx.lineTo(PX(x + it.w), PX(ly));
        ctx.stroke();
      }
    }
  } else {
    const im = imgCache[q.id];
    if (im) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(im, PX(x + 6), PX(y), PX(it.w), PX(it.h));
    }
  }
}

function drawStemBox(ctx, stem, x, y, w) {
  setFont(ctx, { size: PT(8.5), bold: true });
  const lines = wrapAuto(ctx, stem, w * SCALE - PX(4));
  const boxH = lines.length * 4.2 + 2;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(PX(x), PX(y), PX(w), PX(boxH));
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(PX(x), PX(y), PX(1.5), PX(boxH));
  const fSize = PT(8.5);
  setFont(ctx, { size: fSize, bold: true, italic: true });
  const fSpec = ctx.font;
  lines.forEach((l, i) => { drawAutoLine(ctx, l, PX(x + 3), PX(y + 3.8 + i * 4.2), fSize, '#1e293b', fSpec); });
  return boxH + 2;
}

function finishPage(page, PW, PH, M, pageNo, isFirst, contentTop, subTop, bottom, isWritten) {
  const ctx = page.ctx;
  if (S.columns === 2) {
    const midX = PW / 2;
    const topY = isFirst ? contentTop : subTop;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = Math.max(1, 0.3 * SCALE);
    ctx.beginPath();
    ctx.moveTo(PX(midX), PX(topY));
    ctx.lineTo(PX(midX), PX(bottom));
    ctx.stroke();
    if (S.watermark && S.watermarkDivider) {
      ctx.save();
      ctx.globalAlpha = 0.09;
      ctx.fillStyle = '#64748b';
      setFont(ctx, { size: PT(S.watermarkSize || 12), bold: true });
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.translate(PX(midX), PX((topY + bottom) / 2));
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(S.watermark, 0, 0);
      ctx.restore();
    }
  }
  const t = parseTags(S.title);
  if (!t.noPageNumber) {
    if (S.template !== 'meb' && S.testType === 'yaprak') {
      const footerY = PH - M + 3;
      ctx.strokeStyle = '#333';
      ctx.lineWidth = Math.max(1.5, 0.5 * SCALE);
      ctx.beginPath();
      ctx.moveTo(PX(M), PX(footerY - 4));
      ctx.lineTo(PX(PW - M), PX(footerY - 4));
      ctx.stroke();
      drawText(ctx, (S.school || 'BİLİM AKADEMİ').toLocaleUpperCase('tr-TR'), M, footerY, { size: PT(9), bold: true, color: '#000' });
      drawText(ctx, String(pageNo), PW - M, footerY, { size: PT(9), bold: true, align: 'right', color: '#000' });
    } else {
      drawText(ctx, '— ' + pageNo + ' —', PW / 2, PH - M + 3, { size: PT(8), align: 'center', color: '#64748b' });
      if (isWritten && pageNo === 1) {
        drawText(ctx, 'Başarılar dileriz.', PW - M, PH - M + 3, { size: PT(7.5), italic: true, align: 'right', color: '#64748b' });
      }
    }
  }
}

function drawOptic(ctx, PW, count, title, version, answers) {
  const isKey = Array.isArray(answers);
  drawText(ctx, isKey ? 'OPTİK CEVAP FORMU — CEVAP ANAHTARI' : 'OPTİK CEVAP FORMU', PW / 2, 18, { size: PT(14), bold: true, align: 'center' });
  drawText(ctx, title, PW / 2, 25, { size: PT(10), align: 'center', color: '#334155' });
  if (isKey) drawText(ctx, 'Kitapçık: ' + version + '  ·  Doğru şıklar işaretlenmiştir', 15, 33, { size: PT(9), color: '#334155' });
  else drawText(ctx, 'Adı Soyadı: .............................   No: ........   Kitapçık: ' + version, 15, 33, { size: PT(9) });
  const perCol = 25;
  const cols = Math.max(1, Math.ceil(count / perCol));
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = Math.max(1, 0.35 * SCALE);
  for (let i = 0; i < count; i++) {
    const c = Math.floor(i / perCol), r = i % perCol;
    const x = 16 + c * ((PW - 32) / cols), y = 44 + r * 8.5;
    drawText(ctx, String(i + 1).padStart(2, '0'), x, y + 1.8, { size: PT(8), bold: true });
    const correct = isKey ? answers[i] : null;
    for (let k = 0; k < 5; k++) {
      const cx = x + 10 + k * 6.5;
      const isCorrect = correct && LETTERS[k] === correct;
      ctx.beginPath();
      ctx.arc(PX(cx), PX(y), PX(2.3), 0, Math.PI * 2);
      if (isCorrect) {
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        drawText(ctx, LETTERS[k], cx, y + 1, { size: PT(6.5), align: 'center', color: '#ffffff', bold: true });
      } else {
        ctx.stroke();
        drawText(ctx, LETTERS[k], cx, y + 1, { size: PT(6.5), align: 'center' });
      }
    }
  }
}

function smartItemTotalH(it, ctx, colW) {
  let th = it.h;
  if (it.q && it.q.stem && ctx) {
    setFont(ctx, { size: PT(8.5), bold: true });
    th += wrapAuto(ctx, it.q.stem, colW * SCALE - PX(4)).length * 4.2 + 4;
  }
  return th;
}

function smartOrder(items, colH, gap, ctx, colW) {
  const pool = items.map((it) => ({ it, th: smartItemTotalH(it, ctx, colW) }));
  const out = [];
  let rem = colH;
  let fresh = true;
  while (pool.length) {
    let pickI = -1, bestLeft = Infinity;
    for (let i = 0; i < pool.length; i++) {
      if (pool[i].th <= rem) {
        const left = rem - pool[i].th;
        if (left < bestLeft) { bestLeft = left; pickI = i; }
      }
    }
    if (pickI === -1) {
      if (fresh) {
        pool.sort((a, b) => b.th - a.th);
        pickI = 0;
      } else {
        rem = colH;
        fresh = true;
        continue;
      }
    }
    const pick = pool.splice(pickI, 1)[0];
    out.push(pick.it);
    rem -= pick.th + gap;
    fresh = false;
  }
  return out;
}

function imgItem(q, w, maxH) {
  const ar0 = q.h / Math.max(1, q.w);
  const custom = (q.scale != null && q.scale !== 1) || q.aspect != null;
  if (!custom) {
    let h = ar0 * w;
    if (h > maxH) h = maxH;
    return { q, w, h };
  }
  let iw = w * (q.scale || 1);
  if (iw > w) iw = w;
  if (iw < 8) iw = 8;
  let ih = (q.aspect != null ? q.aspect : ar0) * iw;
  if (ih > maxH) ih = maxH;
  return { q, w: iw, h: ih };
}

function buildPDF(pages) {
  const ptPerPx = 72 / (SCALE * 25.4);
  const W = +(pages[0].canvas.width * ptPerPx).toFixed(2);
  const H = +(pages[0].canvas.height * ptPerPx).toFixed(2);
  const enc = (s) => {
    const a = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i) & 0xff;
    return a;
  };
  const parts = [];
  let offset = 0;
  const write = (data) => {
    const bytes = typeof data === 'string' ? enc(data) : data;
    parts.push(bytes);
    offset += bytes.length;
  };
  const offsets = [0];
  write('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  offsets[1] = offset;
  write('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  const pageObjNums = pages.map((_, i) => 3 + i * 3);
  offsets[2] = offset;
  write('2 0 obj\n<< /Type /Pages /Kids [' + pageObjNums.map((n) => n + ' 0 R').join(' ') + '] /Count ' + pages.length + ' >>\nendobj\n');
  pages.forEach((pg, i) => {
    const pageNo = 3 + i * 3, imgNo = pageNo + 1, contentNo = pageNo + 2;
    const content = 'q\n' + W + ' 0 0 ' + H + ' 0 0 cm\n/Im0 Do\nQ\n';
    offsets[pageNo] = offset;
    write(pageNo + ' 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Resources << /XObject << /Im0 ' + imgNo + ' 0 R >> >> /Contents ' + contentNo + ' 0 R >>\nendobj\n');
    offsets[imgNo] = offset;
    write(imgNo + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + pg.canvas.width + ' /Height ' + pg.canvas.height + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + pg.bytes.length + ' >>\nstream\n');
    write(pg.bytes);
    write('\nendstream\nendobj\n');
    offsets[contentNo] = offset;
    write(contentNo + ' 0 obj\n<< /Length ' + content.length + ' >>\nstream\n' + content + 'endstream\nendobj\n');
  });
  const xrefStart = offset;
  const totalObjs = 2 + pages.length * 3;
  let xref = 'xref\n0 ' + (totalObjs + 1) + '\n0000000000 65535 f \n';
  for (let i = 1; i <= totalObjs; i++) xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  xref += 'trailer\n<< /Size ' + (totalObjs + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefStart + '\n%%EOF\n';
  write(xref);
  return new Blob(parts, { type: 'application/pdf' });
}

async function renderPaperToBlob(idx) {
  await ensureFont();
  const t = parseTags(S.title);
  const [PW, PH] = pageSizeMM();
  const M = S.margin || 10;
  const version = LETTERS[idx];
  const gap = S.spacing ? Math.max(5, S.spacingValue) : 7;
  const ordered = booklet(questions, idx);
  const title = t.noUppercase ? t.clean : t.clean.toLocaleUpperCase('tr-TR');
  const pages = [createPage(PW, PH)];
  let page = pages[0];
  const contentTop = drawHeader(page.ctx, PW, PH, M, t, version, title, true);
  const isMeb = S.template === 'meb';
  const footerH = t.noPageNumber ? 0 : (!isMeb && S.testType === 'yaprak' ? 10 : 5);
  const subTop = !isMeb && S.testType === 'yaprak' ? M + 16 : M + 8;
  const wantsFooterNote = isMeb || S.testType === 'yazili';
  const bottomAdj = PH - M - footerH;
  const usableH = bottomAdj - contentTop;
  const maxH = Math.max(20, usableH * 0.88);
  const numCols = S.columns || 2;
  const colGap = 8;
  const colW = (PW - 2 * M - colGap * (numCols - 1)) / numCols;
  await Promise.all(ordered.filter((q) => q.type !== 'text' || q.imgSrc).map(getImg));
  const sharedBank = [];
  ordered.forEach((q) => { if (q.kind === 'bosluk' && q.bankShared) (q.wordBank || []).forEach((w) => { if (!sharedBank.includes(w)) sharedBank.push(w); }); });
  let sharedBankDrawn = false;
  const yStart = contentTop;
  let items = ordered.map((q) => {
    const w = colW - 6;
    if (q.type === 'text') { const it = { q, w, h: maxH }; prepText(it, page.ctx); it.h = Math.min(it.h, maxH); return it; }
    return imgItem(q, w, maxH);
  });
  if (S.smartLayout && numCols > 1) items = smartOrder(items, bottomAdj - yStart, gap, page.ctx, colW).map((it, i) => ({ ...it, num: i + 1 }));
  let c = 0, y = yStart, firstPage = true, pageIndex = 1, placedThisPage = 0;
  for (let n = 0; n < items.length; n++) {
    const it = items[n]; if (it.num === undefined) it.num = n + 1;
    let stemH = 0;
    if (it.q.stem) { setFont(page.ctx, { size: PT(8.5), bold: true }); stemH = wrapAuto(page.ctx, it.q.stem, colW * SCALE - PX(4)).length * 4.2 + 4; }
    if (y + stemH + it.h > bottomAdj && placedThisPage > 0) {
      c++;
      if (c >= numCols) {
        finishPage(page, PW, PH, M, pageIndex, firstPage, yStart, subTop, bottomAdj, wantsFooterNote);
        pageIndex++; page = createPage(PW, PH); pages.push(page); firstPage = false;
        drawHeader(page.ctx, PW, PH, M, t, version, title, false); c = 0; placedThisPage = 0;
      }
      y = firstPage ? yStart : subTop;
    }
    const x = M + c * (colW + colGap);
    if (!sharedBankDrawn && sharedBank.length && it.q.kind === 'bosluk') {
      setFont(page.ctx, { size: PT(8.5) });
      const bankLines = wrapText(page.ctx, sharedBank.join('   •   '), (colW - 6) * SCALE);
      const bankBoxH = bankLines.length * 4.6 + 8;
      if (y + bankBoxH + it.h > bottomAdj && placedThisPage > 0) {
        c++;
        if (c >= numCols) {
          finishPage(page, PW, PH, M, pageIndex, firstPage, yStart, subTop, bottomAdj, wantsFooterNote);
          pageIndex++; page = createPage(PW, PH); pages.push(page); firstPage = false;
          drawHeader(page.ctx, PW, PH, M, t, version, title, false); c = 0; placedThisPage = 0;
        }
        y = firstPage ? yStart : subTop;
      }
      const bx = M + c * (colW + colGap);
      page.ctx.fillStyle = '#fffbeb'; page.ctx.fillRect(PX(bx), PX(y), PX(colW), PX(bankBoxH));
      page.ctx.strokeStyle = '#f59e0b'; page.ctx.lineWidth = Math.max(1, 0.35 * SCALE);
      page.ctx.strokeRect(PX(bx), PX(y), PX(colW), PX(bankBoxH));
      drawText(page.ctx, 'KELİME HAVUZU', bx + 3, y + 4.5, { size: PT(8), bold: true, color: '#92400e' });
      bankLines.forEach((l, i) => { drawText(page.ctx, l, bx + 3, y + 9.5 + i * 4.6, { size: PT(8.5), color: '#78350f' }); });
      y += bankBoxH + 3; sharedBankDrawn = true;
    }
    if (it.q.stem) y += drawStemBox(page.ctx, it.q.stem, x, y, colW);
    drawQ(page.ctx, it, x, y);
    y += it.h + gap;
    placedThisPage++;
  }
  finishPage(page, PW, PH, M, pageIndex, firstPage, yStart, subTop, bottomAdj, wantsFooterNote);
  if (S.optic) { const op = createPage(PW, PH); drawOptic(op.ctx, PW, items.length, title, version); pages.push(op); }
  pages.forEach((p) => { p.bytes = jpegBytes(p.canvas.toDataURL('image/jpeg', 0.93)); });
  return { blob: buildPDF(pages), order: items.map((i) => i.q.id) };
}

async function renderAnswerKeyBlob(orders) {
  await ensureFont();
  const t = parseTags(S.title);
  const [PW, PH] = pageSizeMM();
  const pages = [createPage(PW, PH)];
  let page = pages[0]; let y = 40;
  drawText(page.ctx, 'CEVAP ANAHTARI', PW / 2, 22, { size: PT(16), bold: true, align: 'center' });
  drawText(page.ctx, t.clean, PW / 2, 30, { size: PT(12), align: 'center' });
  orders.forEach((order, bi) => {
    if (y > 250) { page = createPage(PW, PH); pages.push(page); y = 22; }
    y += drawText(page.ctx, LETTERS[bi] + ' Kitapçığı', 15, y, { size: PT(11), bold: true }) + 6;
    const rowH = 7.5, perRow = 5;
    order.forEach((id, i) => {
      const q = questions.find((x) => x.id === id);
      const col = i % perRow, row = Math.floor(i / perRow), cellW = (PW - 30) / perRow;
      drawText(page.ctx, (i + 1) + ') ' + (q && q.answer ? String(q.answer) : '-'), 15 + col * cellW, y + row * rowH, { size: PT(9), maxW: PX(cellW - 3) });
    });
    y += Math.ceil(order.length / perRow) * rowH + 6;
    if (bi > 0) {
      const map = order.map((id, i) => (i + 1) + '\u2190A' + (questions.findIndex((q) => q.id === id) + 1)).join('   ');
      y += drawText(page.ctx, 'A kitapçığı eşleşmesi: ' + map, 15, y, { size: PT(8), maxW: PX(PW - 30) }) + 6;
    }
    if (S.optic) {
      const opticPage = createPage(PW, PH); pages.push(opticPage);
      const answers = order.map((id) => { const q = questions.find((x) => x.id === id); return q && q.answer && /^[A-E]$/i.test(q.answer) ? q.answer.toUpperCase() : null; });
      drawOptic(opticPage.ctx, PW, order.length, t.clean, LETTERS[bi], answers);
    }
  });
  pages.forEach((p) => { p.bytes = jpegBytes(p.canvas.toDataURL('image/jpeg', 0.92)); });
  return buildPDF(pages);
}

function showResult(files) {
  const list = $('resultList');
  list.innerHTML = '';
  files.forEach((f) => {
    const url = URL.createObjectURL(f.blob);
    const row = document.createElement('div');
    row.className = 'flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 dark:border-slate-700';
    row.innerHTML = '<span class="flex-1 truncate text-[13px] font-medium text-slate-700 dark:text-slate-300">' + f.name + '</span>' +
      '<a href="' + url + '" download="' + f.name + '" class="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700">İndir</a>' +
      '<button class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-900 dark:border-slate-700 dark:text-slate-300">Önizle</button>';
    row.querySelector('button').onclick = () => window.open(url, '_blank');
    list.appendChild(row);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
  $('resultModal').classList.replace('hidden', 'flex');
}

async function buildPreviewPages() {
  await ensureFont();
  const t = parseTags(S.title);
  const [PW, PH] = pageSizeMM();
  const M = S.margin || 10;
  const version = LETTERS[0];
  const gap = S.spacing ? Math.max(5, S.spacingValue) : 7;
  const ordered = booklet(questions, 0);
  const title = t.noUppercase ? t.clean : t.clean.toLocaleUpperCase('tr-TR');
  const pages = [createPage(PW, PH)];
  pages[0].items = [];

  if (S.template === 'meb') {
    const lb = getMebLogoBox(M);
    if (lb.show) pages[0].logoBox = lb;
    const tempCanvas = createPage(PW, PH).canvas;
    const tempCtx = tempCanvas.getContext('2d');
    pages[0].mebHeaderItems = getMEBHeaderItems(tempCtx, PW, PH, M, t, version);
  }

  let page = pages[0];
  const contentTop = drawHeader(page.ctx, PW, PH, M, t, version, title, true);
  const isMeb = S.template === 'meb';
  const footerH = t.noPageNumber ? 0 : (!isMeb && S.testType === 'yaprak' ? 10 : 5);
  const subTop = !isMeb && S.testType === 'yaprak' ? M + 16 : M + 8;
  const wantsFooterNote = isMeb || S.testType === 'yazili';
  const bottomAdj = PH - M - footerH;
  const usableH = bottomAdj - contentTop;
  const maxH = Math.max(20, usableH * 0.88);
  const numCols = S.columns || 2;
  const colGap = 8;
  const colW = (PW - 2 * M - colGap * (numCols - 1)) / numCols;
  await Promise.all(ordered.filter((q) => q.type !== 'text' || q.imgSrc).map(getImg));
  const sharedBank = [];
  ordered.forEach((q) => { if (q.kind === 'bosluk' && q.bankShared) (q.wordBank || []).forEach((w) => { if (!sharedBank.includes(w)) sharedBank.push(w); }); });
  let sharedBankDrawn = false;
  const yStart = contentTop;
  let items = ordered.map((q) => {
    const w = colW - 6;
    if (q.type === 'text') { const it = { q, w, h: maxH }; prepText(it, page.ctx); it.h = Math.min(it.h, maxH); return it; }
    return imgItem(q, w, maxH);
  });
  if (S.smartLayout && numCols > 1) items = smartOrder(items, bottomAdj - yStart, gap, page.ctx, colW).map((it, i) => ({ ...it, num: i + 1 }));
  let c = 0, y = yStart, firstPage = true, pageIndex = 1, placedThisPage = 0;
  for (let n = 0; n < items.length; n++) {
    const it = items[n]; if (it.num === undefined) it.num = n + 1;
    let stemH = 0;
    if (it.q.stem) { setFont(page.ctx, { size: PT(8.5), bold: true }); stemH = wrapAuto(page.ctx, it.q.stem, colW * SCALE - PX(4)).length * 4.2 + 4; }
    if (y + stemH + it.h > bottomAdj && placedThisPage > 0) {
      c++;
      if (c >= numCols) {
        finishPage(page, PW, PH, M, pageIndex, firstPage, yStart, subTop, bottomAdj, wantsFooterNote);
        pageIndex++; page = createPage(PW, PH); pages.push(page); firstPage = false;
        drawHeader(page.ctx, PW, PH, M, t, version, title, false); c = 0; placedThisPage = 0;
      }
      y = firstPage ? yStart : subTop;
    }
    const x = M + c * (colW + colGap);
    if (!sharedBankDrawn && sharedBank.length && it.q.kind === 'bosluk') {
      setFont(page.ctx, { size: PT(8.5) });
      const bankLines = wrapText(page.ctx, sharedBank.join('   •   '), (colW - 6) * SCALE);
      const bankBoxH = bankLines.length * 4.6 + 8;
      if (y + bankBoxH + it.h > bottomAdj && placedThisPage > 0) {
        c++;
        if (c >= numCols) {
          finishPage(page, PW, PH, M, pageIndex, firstPage, yStart, subTop, bottomAdj, wantsFooterNote);
          pageIndex++; page = createPage(PW, PH); pages.push(page); firstPage = false;
          drawHeader(page.ctx, PW, PH, M, t, version, title, false); c = 0; placedThisPage = 0;
        }
        y = firstPage ? yStart : subTop;
      }
      const bx = M + c * (colW + colGap);
      page.ctx.fillStyle = '#fffbeb'; page.ctx.fillRect(PX(bx), PX(y), PX(colW), PX(bankBoxH));
      page.ctx.strokeStyle = '#f59e0b'; page.ctx.lineWidth = Math.max(1, 0.35 * SCALE);
      page.ctx.strokeRect(PX(bx), PX(y), PX(colW), PX(bankBoxH));
      drawText(page.ctx, 'KELİME HAVUZU', bx + 3, y + 4.5, { size: PT(8), bold: true, color: '#92400e' });
      bankLines.forEach((l, i) => { drawText(page.ctx, l, bx + 3, y + 9.5 + i * 4.6, { size: PT(8.5), color: '#78350f' }); });
      y += bankBoxH + 3; sharedBankDrawn = true;
    }
    if (it.q.stem) y += drawStemBox(page.ctx, it.q.stem, x, y, colW);
    drawQ(page.ctx, it, x, y);
    if (!page.items) page.items = [];
    page.items.push({ q: it.q, x, y, w: it.w, h: it.h, num: it.num, p: pageIndex });
    y += it.h + gap;
    placedThisPage++;
  }
  finishPage(page, PW, PH, M, pageIndex, firstPage, yStart, subTop, bottomAdj, wantsFooterNote);
  if (S.optic) { const op = createPage(PW, PH); drawOptic(op.ctx, PW, items.length, title, version); pages.push(op); }
  return pages;
}

function initMakePdfButton(collectFn) {
  const MAKE_BTN_DEFAULT_HTML = '<span class="pvMakeSpark">✨</span> Sınav Kağıdını Oluştur';
  const makeBtn = $('makeBtn');
  if (!makeBtn) return;

  makeBtn.onclick = async () => {
    if (typeof collectFn === 'function') collectFn();
    if (!questions.length) return alert('Önce soru yükleyin.');
    makeBtn.disabled = true;
    makeBtn.innerHTML = '⏳ Hazırlanıyor...';
    try {
      await ensureFont();
      const count = S.groups;
      const files = [];
      const orders = [];
      const tParsed = parseTags(S.title);
      const baseName = defaultBaseName(tParsed.clean, S);
      const dateStr = todayStr();
      for (let i = 0; i < count; i++) {
        const r = await renderPaperToBlob(i);
        orders.push(r.order);
        const suffix = count > 1 ? ' (' + LETTERS[i] + ' Kitapçığı)' : '';
        files.push({ name: baseName + ' - ' + dateStr + suffix + '.pdf', blob: r.blob });
      }
      if (S.showAnswerKey && questions.some((q) => q.answer)) {
        files.push({ name: baseName + ' - ' + dateStr + ' - Cevap Anahtarı.pdf', blob: await renderAnswerKeyBlob(orders) });
      }
      showResult(files);
    } catch (e) {
      alert('PDF oluşturulurken hata oluştu: ' + (e && e.message ? e.message : e));
      console.error(e);
    }
    makeBtn.disabled = false;
    makeBtn.innerHTML = MAKE_BTN_DEFAULT_HTML;
  };

  $('resultClose').onclick = () => $('resultModal').classList.replace('flex', 'hidden');
}

function calculateQuestionBounds() {
  const [PW, PH] = pageSizeMM();
  const M = S.margin || 10;
  const t = parseTags(S.title || '');
  const title = t.noUppercase ? t.clean : t.clean.toLocaleUpperCase('tr-TR');
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = PX(PW);
  tempCanvas.height = PX(PH);
  const tempCtx = tempCanvas.getContext('2d');
  const contentTop = drawHeader(tempCtx, PW, PH, M, t, LETTERS[0], title, true);
  const isMeb = S.template === 'meb';
  const footerH = t.noPageNumber ? 0 : (!isMeb && S.testType === 'yaprak' ? 10 : 5);
  const bottomAdj = PH - M - footerH;
  const usableH = Math.max(20, bottomAdj - contentTop);
  const numCols = S.columns || 2;
  const colGap = 8;
  const colW = (PW - 2 * M - colGap * (numCols - 1)) / numCols;
  return {
    PW, PH, M, contentTop, bottomAdj, usableH, numCols, colGap, colW,
    left: M,
    right: PW - M,
    width: PW - 2 * M
  };
}


// Module Exports
__exports['SCALE'] = SCALE;
__exports['FONT'] = FONT;
__exports['PX'] = PX;
__exports['PT'] = PT;
__exports['LH_MM'] = LH_MM;
__exports['TR_FONT_SAMPLE'] = TR_FONT_SAMPLE;
__exports['LATEX_SYMS'] = LATEX_SYMS;
__exports['imgCache'] = imgCache;
__exports['MEB_LOGO_URL'] = MEB_LOGO_URL;
__exports['ensureFont'] = ensureFont;
__exports['pageSizeMM'] = pageSizeMM;
__exports['createPage'] = createPage;
__exports['setFont'] = setFont;
__exports['latexParse'] = latexParse;
__exports['measureLatexNode'] = measureLatexNode;
__exports['drawLatexNode'] = drawLatexNode;
__exports['delimGlyph'] = delimGlyph;
__exports['tokenizeLatexSegments'] = tokenizeLatexSegments;
__exports['wrapRichText'] = wrapRichText;
__exports['drawRichLine'] = drawRichLine;
__exports['wrapText'] = wrapText;
__exports['drawText'] = drawText;
__exports['getImg'] = getImg;
__exports['setCustomLogo'] = setCustomLogo;
__exports['ensureMebLogo'] = ensureMebLogo;
__exports['mebLogoVisible'] = mebLogoVisible;
__exports['getMebLogoBox'] = getMebLogoBox;
__exports['activeLogoAspect'] = activeLogoAspect;
__exports['fixLogoAspect'] = fixLogoAspect;
__exports['trimLogoImage'] = trimLogoImage;
__exports['drawMEBLogo'] = drawMEBLogo;
__exports['drawMEBLogoVector'] = drawMEBLogoVector;
__exports['getMEBHeaderItems'] = getMEBHeaderItems;
__exports['drawMEBHeader'] = drawMEBHeader;
__exports['drawHeader'] = drawHeader;
__exports['splitBlanks'] = splitBlanks;
__exports['wrapBlankSegments'] = wrapBlankSegments;
__exports['wrapAuto'] = wrapAuto;
__exports['drawAutoLine'] = drawAutoLine;
__exports['prepText'] = prepText;
__exports['drawQ'] = drawQ;
__exports['drawStemBox'] = drawStemBox;
__exports['finishPage'] = finishPage;
__exports['drawOptic'] = drawOptic;
__exports['smartItemTotalH'] = smartItemTotalH;
__exports['smartOrder'] = smartOrder;
__exports['imgItem'] = imgItem;
__exports['buildPDF'] = buildPDF;
__exports['renderPaperToBlob'] = renderPaperToBlob;
__exports['renderAnswerKeyBlob'] = renderAnswerKeyBlob;
__exports['showResult'] = showResult;
__exports['buildPreviewPages'] = buildPreviewPages;
__exports['initMakePdfButton'] = initMakePdfButton;
__exports['calculateQuestionBounds'] = calculateQuestionBounds;
Object.defineProperty(__exports, 'mebLogoImg', { get: () => mebLogoImg, set: (v) => { mebLogoImg = v; }, enumerable: true, configurable: true });
Object.defineProperty(__exports, 'customLogoSrc', { get: () => customLogoSrc, set: (v) => { customLogoSrc = v; }, enumerable: true, configurable: true });

});

__define('modules/geometryDrawer.js', function(__exports, __require, __module) {
const { $, openModal, closeModal } = __require('utils.js');

/**
 * Vektörel Geometri Çizim Aracı ve KaTeX Denklem Tuvali
 * - 'Şekil Çiz' (Otomatik Açı Tespiti & $90^\circ$ Diklik Sembolü)
 * - Açı Yazılarını Açma / Kapatma (Sadece Yay Gösterme Modu)
 * - Şekil Üstüne Çizim & Manyetik Köşe/Kenar Yakalama (Vertex Snap)
 * - KaTeX Formül Tuvali & 2x Retina PNG Export
 */

let fabricCanvas = null;
let onInsertCallback = null;
let activeTool = 'select';

// Çizim & Stil Durumu
const currentStyle = {
  strokeColor: '#0f172a',
  fillColor: 'transparent',
  baseFillColor: 'transparent',
  fillOpacity: 0.35,
  strokeWidth: 2,
  isDashed: false,
  fontSize: 20,
  angleDisplayMode: 'all' // 'all' | 'arc_only' | 'hidden'
};

function hexToRgba(hex, alpha = 1) {
  if (!hex || hex === 'transparent') return 'transparent';
  if (hex.startsWith('rgba')) {
    return hex.replace(/rgba?\(([^)]+)\)/, (match, val) => {
      const parts = val.split(',').map(s => s.trim());
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
    });
  }
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return hex;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function escHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);
}

let gridEnabled = true;
let snapEnabled = true;
let zoomLevel = 100;

// Geri Al / İleri Al Yığını
const historyStack = [];
let historyIndex = -1;
let isHistoryUpdating = false;

// Şekil Çiz (Shape / Polygon) Durumu
let shapePoints = [];
let shapeTempLine = null;
let shapeMarkers = [];
let shapeSegments = [];

// Doğru Çizim Durumu
let drawingLine = null;
let isDrawingLine = false;

// Manyetik Kilitlenme Göstergesi
let snapIndicator = null;

// Renk Paletleri
const STROKE_COLORS = [
  '#0f172a', '#475569', '#94a3b8', '#1e3a8a',
  '#2563eb', '#0284c7', '#16a34a', '#059669',
  '#ca8a04', '#ea580c', '#dc2626', '#7c3aed'
];

const FILL_COLORS = [
  'transparent', '#ffffff', '#f8fafc', '#fef3c7',
  '#dbeafe', '#dcfce7', '#fee2e2', '#f3e8ff',
  '#ffedd5', '#cffafe', '#f1f5f9', '#e2e8f0'
];

// KaTeX Formül Sekmeleri
const FORMULA_TABS = {
  basic: [
    { latex: '\\sqrt{x}', display: '√x' },
    { latex: '\\sqrt[n]{x}', display: 'ⁿ√x' },
    { latex: '\\frac{a}{b}', display: 'a/b' },
    { latex: 'x^{2}', display: 'x²' },
    { latex: 'x_{1}', display: 'x₁' },
    { latex: 'x^{n}', display: 'xⁿ' },
    { latex: '\\pm', display: '±' },
    { latex: '\\cdot', display: '·' },
    { latex: '2\\sqrt{3}', display: '2√3' },
    { latex: 'x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}', display: 'Kök Formülü' }
  ],
  symbols: [
    { latex: '\\pi', display: 'π' },
    { latex: '\\alpha', display: 'α' },
    { latex: '\\beta', display: 'β' },
    { latex: '\\theta', display: 'θ' },
    { latex: '\\Delta', display: 'Δ' },
    { latex: '60^\\circ', display: '60°' },
    { latex: '90^\\circ', display: '90°' },
    { latex: '\\perp', display: '⊥' },
    { latex: '\\parallel', display: '∥' },
    { latex: '\\le', display: '≤' },
    { latex: '\\ge', display: '≥' },
    { latex: '\\ne', display: '≠' },
    { latex: '\\approx', display: '≈' },
    { latex: '\\infty', display: '∞' }
  ],
  placeholders: [
    { latex: '\\vec{v}', display: 'v⃗' },
    { latex: '|x|', display: '|x|' },
    { latex: '\\overline{AB}', display: 'AB̄' },
    { latex: '\\widehat{ABC}', display: 'ABĈ' },
    { latex: '\\left( \\frac{a}{b} \\right)', display: '(a/b)' }
  ],
  calculus: [
    { latex: '\\int f(x) dx', display: '∫ f(x)dx' },
    { latex: '\\int_{a}^{b} f(x) dx', display: '∫ₐᵇ f(x)dx' },
    { latex: '\\sum_{i=1}^{n} x_i', display: '∑ xᵢ' },
    { latex: '\\lim_{x \\to \\infty}', display: 'lim x→∞' },
    { latex: '\\frac{dy}{dx}', display: 'dy/dx' }
  ]
};

let activeFormulaTab = 'basic';
let formulaColor = '#0f172a';
let formulaSize = 26;

// ============================================================================
// MODAL AÇILIŞ VE DIŞA AKTARIM FONKSİYONLARI
// ============================================================================

let onGeometryCancelCallback = null;

function setOnGeometryInsertCallback(fn) {
  onInsertCallback = fn;
}

function openGeometryModal(callback, onCancel) {
  if (typeof callback === 'function') {
    onInsertCallback = callback;
  }
  if (typeof onCancel === 'function') {
    onGeometryCancelCallback = onCancel;
  } else {
    onGeometryCancelCallback = null;
  }
  // Yazılı soru ekle modalı açıksa tuval etkileşimini engellememesi için kapat
  closeModal('textModal');
  openModal('geoModal');

  setTimeout(() => {
    initFabricCanvasIfNeeded();
    resetToolState();
    if (fabricCanvas) {
      fabricCanvas.calcOffset();
      fabricCanvas.renderAll();
    }
  }, 60);
}

function syncControlsFromState() {}

// ============================================================================
// FABRIC.JS TUVAL BAŞLATMA VE YÖNETİMİ
// ============================================================================

function initFabricCanvasIfNeeded() {
  const canvasEl = $('geoFabricCanvas');
  if (!canvasEl) return;

  const fabric = window.fabric;
  if (!fabric) {
    console.error('Fabric.js kütüphanesi yüklenemedi!');
    return;
  }

  if (fabricCanvas) {
    fabricCanvas.calcOffset();
    return;
  }

  fabricCanvas = new fabric.Canvas('geoFabricCanvas', {
    width: 760,
    height: 490,
    selection: true,
    preserveObjectStacking: true,
    fireRightClick: true,
    stopContextMenu: true
  });

  updateGridBackground(gridEnabled);
  saveHistoryState();

  // Seçim Olayları
  fabricCanvas.on('selection:created', (e) => onObjectSelected(e.selected ? e.selected[0] : null));
  fabricCanvas.on('selection:updated', (e) => onObjectSelected(e.selected ? e.selected[0] : null));
  fabricCanvas.on('selection:cleared', () => onObjectSelected(null));
  fabricCanvas.on('object:modified', () => {
    onObjectSelected(fabricCanvas.getActiveObject());
    saveHistoryState();
  });

  // Fare Olayları
  fabricCanvas.on('mouse:down', onCanvasMouseDown);
  fabricCanvas.on('mouse:move', onCanvasMouseMove);
  fabricCanvas.on('mouse:up', onCanvasMouseUp);
  fabricCanvas.on('mouse:dblclick', () => {
    if (activeTool === 'shape' && shapePoints.length >= 3) {
      finishShape();
    }
  });

  window.addEventListener('keydown', onGlobalKeyDown);
}

function updateGridBackground(enabled) {
  if (!fabricCanvas) return;
  const fabric = window.fabric;
  if (!fabric) return;

  if (!enabled) {
    fabricCanvas.setBackgroundColor('#ffffff', fabricCanvas.renderAll.bind(fabricCanvas));
    return;
  }

  const gridSize = 20;
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = gridSize;
  patternCanvas.height = gridSize;
  const pctx = patternCanvas.getContext('2d');
  if (pctx) {
    pctx.strokeStyle = '#e2e8f0';
    pctx.lineWidth = 0.8;
    pctx.beginPath();
    pctx.moveTo(gridSize, 0);
    pctx.lineTo(gridSize, gridSize);
    pctx.lineTo(0, gridSize);
    pctx.stroke();
  }

  const pattern = new fabric.Pattern({
    source: patternCanvas,
    repeat: 'repeat'
  });
  fabricCanvas.setBackgroundColor(pattern, fabricCanvas.renderAll.bind(fabricCanvas));
}

// ============================================================================
// MANYETİK KÖŞE / TEPE YAKALAMA (VERTEX SNAPPING)
// ============================================================================

function getAllCanvasVertices() {
  if (!fabricCanvas) return [];
  const fabric = window.fabric;
  const vertices = [];

  fabricCanvas.forEachObject((obj) => {
    if (obj.isHelper || obj === snapIndicator) return;

    if (obj.type === 'polygon' && Array.isArray(obj.points)) {
      const matrix = obj.calcTransformMatrix();
      obj.points.forEach((pt) => {
        const trans = fabric.util.transformPoint(
          new fabric.Point(pt.x - obj.pathOffset.x, pt.y - obj.pathOffset.y),
          matrix
        );
        vertices.push({ x: trans.x, y: trans.y });
      });
    } else if (obj.type === 'group' && Array.isArray(obj._objects)) {
      // Grup içindeki poligonları bul
      obj._objects.forEach((sub) => {
        if (sub.type === 'polygon' && Array.isArray(sub.points)) {
          const subMatrix = sub.calcTransformMatrix();
          sub.points.forEach((pt) => {
            const trans = fabric.util.transformPoint(
              new fabric.Point(pt.x - sub.pathOffset.x, pt.y - sub.pathOffset.y),
              subMatrix
            );
            vertices.push({ x: trans.x, y: trans.y });
          });
        }
      });
    } else if (obj.type === 'line') {
      vertices.push({ x: obj.x1, y: obj.y1 });
      vertices.push({ x: obj.x2, y: obj.y2 });
    }
  });

  return vertices;
}

function getSnappedPoint(rawPt, threshold = 16) {
  let pt = {
    x: snapEnabled ? Math.round(rawPt.x / 10) * 10 : rawPt.x,
    y: snapEnabled ? Math.round(rawPt.y / 10) * 10 : rawPt.y
  };

  if (!snapEnabled) return pt;

  // Mevcut şekillerin köşelerine bak
  const vertices = getAllCanvasVertices();
  let minDist = threshold;
  let snapped = null;

  for (const v of vertices) {
    const d = Math.hypot(rawPt.x - v.x, rawPt.y - v.y);
    if (d < minDist) {
      minDist = d;
      snapped = { x: v.x, y: v.y };
    }
  }

  if (snapped) {
    showSnapIndicator(snapped.x, snapped.y);
    return snapped;
  } else {
    hideSnapIndicator();
    return pt;
  }
}

function showSnapIndicator(x, y) {
  if (!fabricCanvas) return;
  const fabric = window.fabric;
  if (!snapIndicator) {
    snapIndicator = new fabric.Circle({
      radius: 6,
      fill: 'rgba(16, 185, 129, 0.3)',
      stroke: '#10b981',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      selectable: false,
      isHelper: true
    });
    fabricCanvas.add(snapIndicator);
  }
  snapIndicator.set({ left: x, top: y });
  snapIndicator.bringToFront();
}

function hideSnapIndicator() {
  if (snapIndicator && fabricCanvas) {
    fabricCanvas.remove(snapIndicator);
    snapIndicator = null;
  }
}

// ============================================================================
// OTOMATİK AÇI VE DİKLİK HESAPLAMA ÇEKİRDEĞİ
// ============================================================================

function calculatePolygonAngles(points, arcRadius = 26) {
  const n = points.length;
  if (n < 3) return [];

  const results = [];

  for (let i = 0; i < n; i++) {
    const pPrev = points[(i - 1 + n) % n];
    const pCurr = points[i];
    const pNext = points[(i + 1) % n];

    const vPrev = { x: pPrev.x - pCurr.x, y: pPrev.y - pCurr.y };
    const vNext = { x: pNext.x - pCurr.x, y: pNext.y - pCurr.y };

    const lenPrev = Math.hypot(vPrev.x, vPrev.y);
    const lenNext = Math.hypot(vNext.x, vNext.y);

    if (lenPrev === 0 || lenNext === 0) continue;

    const u1 = { x: vPrev.x / lenPrev, y: vPrev.y / lenPrev };
    const u2 = { x: vNext.x / lenNext, y: vNext.y / lenNext };

    const dot = Math.max(-1.0, Math.min(1.0, u1.x * u2.x + u1.y * u2.y));
    const angleRad = Math.acos(dot);
    const angleDegrees = Math.round((angleRad * 180) / Math.PI);
    const isRightAngle = Math.abs(angleDegrees - 90) <= 2;

    // u1'den u2'ye dönüş yönü (ekran koordinatlarında cross product)
    const cp = u1.x * u2.y - u1.y * u2.x;
    const sweepFlag = cp > 0 ? 1 : 0;

    // Açı ortay birim vektörü (her zaman açının içine doğru yönelir)
    const bRaw = { x: u1.x + u2.x, y: u1.y + u2.y };
    const bLen = Math.hypot(bRaw.x, bRaw.y);
    const uBisector = bLen > 1e-4
      ? { x: bRaw.x / bLen, y: bRaw.y / bLen }
      : { x: -u1.y, y: u1.x };

    const boxSize = 16;
    if (isRightAngle) {
      // 90° Diklik Sembolü: Köşede kare + nokta
      const corner1 = { x: pCurr.x + u1.x * boxSize, y: pCurr.y + u1.y * boxSize };
      const corner2 = {
        x: pCurr.x + (u1.x + u2.x) * boxSize,
        y: pCurr.y + (u1.y + u2.y) * boxSize
      };
      const corner3 = { x: pCurr.x + u2.x * boxSize, y: pCurr.y + u2.y * boxSize };

      const dotPos = {
        x: pCurr.x + (u1.x + u2.x) * (boxSize * 0.5),
        y: pCurr.y + (u1.y + u2.y) * (boxSize * 0.5)
      };

      const labelDist = boxSize + 14;
      const labelPos = {
        x: pCurr.x + uBisector.x * labelDist,
        y: pCurr.y + uBisector.y * labelDist
      };

      results.push({
        vertex: pCurr,
        angleDegrees: 90,
        isRightAngle: true,
        rightAngleBoxPoints: [corner1, corner2, corner3],
        dotPosition: dotPos,
        labelPosition: labelPos
      });
    } else {
      // Standart Açı Yayı ve Derece
      const sX = pCurr.x + u1.x * arcRadius;
      const sY = pCurr.y + u1.y * arcRadius;
      const eX = pCurr.x + u2.x * arcRadius;
      const eY = pCurr.y + u2.y * arcRadius;

      // İç açı her zaman <= 180° olduğundan large-arc-flag 0'dır
      const arcPath = `M ${sX.toFixed(1)} ${sY.toFixed(1)} A ${arcRadius} ${arcRadius} 0 0 ${sweepFlag} ${eX.toFixed(1)} ${eY.toFixed(1)}`;

      const labelDist = arcRadius + 14;
      const labelPos = {
        x: pCurr.x + uBisector.x * labelDist,
        y: pCurr.y + uBisector.y * labelDist
      };

      results.push({
        vertex: pCurr,
        angleDegrees,
        isRightAngle: false,
        arcPathString: arcPath,
        labelPosition: labelPos
      });
    }
  }

  return results;
}

// ============================================================================
// ARAÇ YÖNETİMİ & REHBER METİNLERİ
// ============================================================================

function setTool(tool) {
  // 'polygon' isteklerini 'shape' ile eşleştir
  if (tool === 'polygon') tool = 'shape';
  activeTool = tool;

  document.querySelectorAll('[data-tool]').forEach((btn) => {
    const isAct = btn.dataset.tool === tool || (btn.dataset.tool === 'polygon' && tool === 'shape');
    if (isAct) {
      btn.className = 'active flex h-12 w-full flex-col items-center justify-center rounded-xl transition bg-blue-50 text-blue-600 font-bold border border-blue-200 shadow-sm dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-400';
    } else {
      btn.className = 'flex h-12 w-full flex-col items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition';
    }
  });

  const guidanceEl = $('geoGuidanceText');
  const shapeFinishBtn = $('geoPolygonFinishBtn');

  if (shapeFinishBtn) {
    shapeFinishBtn.classList.toggle('hidden', tool !== 'shape');
    shapeFinishBtn.classList.toggle('flex', tool === 'shape');
  }

  if (guidanceEl) {
    switch (tool) {
      case 'select':
        guidanceEl.textContent = 'Nesneleri seçmek, taşımak, boyutlandırmak ve açı modunu değiştirmek için tıklayın.';
        break;
      case 'shape':
        guidanceEl.textContent = 'Köşeleri sırayla tıklayarak şekli çizin. Bittiğinde iç açılar (90° diklik kutusu veya yay) otomatik oluşturulur.';
        break;
      case 'line':
        guidanceEl.textContent = 'Yükseklik, açıortay veya doğru çizmek için sürükleyin. Köşelere manyetik kenetlenir.';
        break;
      case 'circle':
        guidanceEl.textContent = 'Merkez noktasını belirleyip dışa sürükleyerek çember oluşturun.';
        break;
      case 'text':
        guidanceEl.textContent = 'Metin veya köşe harfi (A, B, C) eklemek istediğiniz konuma tıklayın.';
        break;
      default:
        guidanceEl.textContent = 'Vektörel çizim aracını kullanmaya hazırsınız.';
    }
  }

  if (fabricCanvas) {
    if (tool === 'select') {
      fabricCanvas.selection = true;
      fabricCanvas.defaultCursor = 'default';
      fabricCanvas.forEachObject((obj) => {
        if (!obj.isHelper) {
          obj.selectable = true;
          obj.evented = true;
        }
      });
    } else {
      fabricCanvas.selection = false;
      fabricCanvas.defaultCursor = 'crosshair';
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
    }
  }
}

function resetToolState() {
  cleanupShapeDrawing();
  hideSnapIndicator();
  setTool('select');
  hideFloatingToolbar();
}

// ============================================================================
// ÇİZİM ETKİLEŞİMLERİ (CANVAS MOUSE EVENTS)
// ============================================================================

function onCanvasMouseDown(opt) {
  if (!fabricCanvas) return;
  const fabric = window.fabric;
  const pointer = fabricCanvas.getPointer(opt.e);
  const pt = getSnappedPoint(pointer);

  if (activeTool === 'select') {
    let clickedAngleIdx = undefined;
    let angleGroup = null;

    if (opt.subTargets && opt.subTargets.length > 0) {
      const sub = opt.subTargets.find((s) => s.angleIndex !== undefined);
      if (sub) {
        clickedAngleIdx = sub.angleIndex;
        angleGroup = opt.target && opt.target.type === 'group' ? opt.target : sub.group;
      }
    } else if (opt.target && opt.target.angleIndex !== undefined) {
      clickedAngleIdx = opt.target.angleIndex;
      angleGroup = opt.target.group || opt.target;
    }

    if (clickedAngleIdx !== undefined && angleGroup) {
      showQuickAngleEditor(angleGroup, clickedAngleIdx, opt.e.clientX, opt.e.clientY);
    } else {
      hideQuickAngleEditor();
    }
  } else if (activeTool === 'shape') {
    // İlk noktaya yakın tıklandıysa şekli tamamla
    if (shapePoints.length >= 3) {
      const firstPt = shapePoints[0];
      const dist = Math.hypot(pt.x - firstPt.x, pt.y - firstPt.y);
      if (dist < 20) {
        finishShape();
        return;
      }
    }

    shapePoints.push(pt);

    // Kırmızı köşe işareti
    const marker = new fabric.Circle({
      left: pt.x,
      top: pt.y,
      radius: 4.5,
      fill: '#ef4444',
      stroke: '#ffffff',
      strokeWidth: 1.5,
      originX: 'center',
      originY: 'center',
      selectable: false,
      isHelper: true
    });
    fabricCanvas.add(marker);
    shapeMarkers.push(marker);

    // Tıklanan noktaları birleştiren canlı kenar çizgisi
    if (shapePoints.length >= 2) {
      const pPrev = shapePoints[shapePoints.length - 2];
      const segment = new fabric.Line([pPrev.x, pPrev.y, pt.x, pt.y], {
        stroke: currentStyle.strokeColor,
        strokeWidth: currentStyle.strokeWidth,
        strokeDashArray: currentStyle.isDashed ? [6, 6] : null,
        selectable: false,
        isHelper: true
      });
      fabricCanvas.add(segment);
      shapeSegments.push(segment);
    }

    // Canlı kauçuk bant çizgi (fareyi takip eden sonraki kenar)
    if (!shapeTempLine) {
      shapeTempLine = new fabric.Line([pt.x, pt.y, pt.x, pt.y], {
        stroke: currentStyle.strokeColor,
        strokeWidth: currentStyle.strokeWidth,
        strokeDashArray: [4, 4],
        selectable: false,
        isHelper: true
      });
      fabricCanvas.add(shapeTempLine);
    } else {
      shapeTempLine.set({ x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y });
    }
    fabricCanvas.renderAll();
  } else if (activeTool === 'line') {
    isDrawingLine = true;
    drawingLine = new fabric.Line([pt.x, pt.y, pt.x, pt.y], {
      stroke: currentStyle.strokeColor,
      strokeWidth: currentStyle.strokeWidth,
      strokeDashArray: currentStyle.isDashed ? [6, 6] : null,
      selectable: true,
      cornerColor: '#2563eb',
      cornerSize: 8,
      transparentCorners: false
    });
    fabricCanvas.add(drawingLine);
  } else if (activeTool === 'circle') {
    const circle = new fabric.Circle({
      left: pt.x,
      top: pt.y,
      radius: 45,
      fill: currentStyle.fillColor,
      stroke: currentStyle.strokeColor,
      strokeWidth: currentStyle.strokeWidth,
      originX: 'center',
      originY: 'center',
      selectable: true,
      cornerColor: '#2563eb',
      cornerSize: 8,
      transparentCorners: false
    });
    fabricCanvas.add(circle);
    fabricCanvas.setActiveObject(circle);
    fabricCanvas.renderAll();
    saveHistoryState();
    setTool('select');
  } else if (activeTool === 'text') {
    const text = new fabric.IText('A', {
      left: pt.x,
      top: pt.y,
      fontSize: currentStyle.fontSize,
      fontFamily: 'Noto Sans, sans-serif',
      fontWeight: 'bold',
      fill: currentStyle.strokeColor,
      selectable: true
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    text.enterEditing();
    fabricCanvas.renderAll();
    saveHistoryState();
    setTool('select');
  }
}

function onCanvasMouseMove(opt) {
  if (!fabricCanvas) return;
  const pointer = fabricCanvas.getPointer(opt.e);
  const pt = getSnappedPoint(pointer);

  if (isDrawingLine && drawingLine) {
    drawingLine.set({ x2: pt.x, y2: pt.y });
    fabricCanvas.renderAll();
  } else if (activeTool === 'shape' && shapeTempLine) {
    if (shapePoints.length >= 3) {
      const firstPt = shapePoints[0];
      const dist = Math.hypot(pointer.x - firstPt.x, pointer.y - firstPt.y);
      if (dist < 22) {
        showSnapIndicator(firstPt.x, firstPt.y);
        shapeTempLine.set({ x2: firstPt.x, y2: firstPt.y });
        fabricCanvas.renderAll();
        return;
      }
    }
    shapeTempLine.set({ x2: pt.x, y2: pt.y });
    fabricCanvas.renderAll();
  }
}

function onCanvasMouseUp() {
  hideSnapIndicator();

  if (isDrawingLine && drawingLine) {
    isDrawingLine = false;
    drawingLine.setCoords();
    fabricCanvas.setActiveObject(drawingLine);
    fabricCanvas.renderAll();
    saveHistoryState();
    setTool('select');
    drawingLine = null;
  }
}

// ============================================================================
// ŞEKİL BİTİRME & OTOMATİK AÇI OLUŞTURMA
// ============================================================================

function finishShape() {
  if (!fabricCanvas || shapePoints.length < 3) {
    cleanupShapeDrawing();
    return;
  }

  const fabric = window.fabric;
  const pts = [...shapePoints];
  cleanupShapeDrawing();

  const polyFill = currentStyle.baseFillColor && currentStyle.baseFillColor !== 'transparent' && currentStyle.fillOpacity > 0
    ? hexToRgba(currentStyle.baseFillColor, currentStyle.fillOpacity)
    : (currentStyle.fillColor || 'transparent');

  // 1. Ana Poligon Şekli
  const polygon = new fabric.Polygon(pts, {
    fill: polyFill,
    stroke: currentStyle.strokeColor,
    strokeWidth: currentStyle.strokeWidth,
    strokeDashArray: currentStyle.isDashed ? [6, 6] : null,
    selectable: true
  });

  // 2. Otomatik Açıları Hesapla
  const angles = calculatePolygonAngles(pts, 26);
  const angleElements = [];
  const anglesData = [];

  angles.forEach((ang, idx) => {
    const angleInfo = {
      index: idx,
      vertex: ang.vertex,
      origDegrees: ang.angleDegrees,
      text: ang.isRightAngle ? '' : `${ang.angleDegrees}°`,
      displayMode: 'all',
      isRightAngle: ang.isRightAngle,
      labelPos: ang.labelPosition || ang.dotPosition,
      arcPathString: ang.arcPathString,
      rightAngleBoxPoints: ang.rightAngleBoxPoints,
      dotPosition: ang.dotPosition
    };
    anglesData.push(angleInfo);

    if (ang.isRightAngle && ang.rightAngleBoxPoints && ang.dotPosition) {
      // 90° Diklik Karesi
      const box = new fabric.Polyline(ang.rightAngleBoxPoints, {
        fill: 'transparent',
        stroke: currentStyle.strokeColor,
        strokeWidth: 1.5,
        selectable: false,
        isAngleComponent: true,
        angleIndex: idx
      });

      const dot = new fabric.Circle({
        left: ang.dotPosition.x,
        top: ang.dotPosition.y,
        radius: 2,
        fill: currentStyle.strokeColor,
        originX: 'center',
        originY: 'center',
        selectable: false,
        isAngleComponent: true,
        angleIndex: idx
      });

      const lblPos = ang.labelPosition || ang.dotPosition;
      const lbl = new fabric.IText('', {
        left: lblPos.x,
        top: lblPos.y,
        fontSize: 14,
        fontFamily: 'Noto Sans, sans-serif',
        fontWeight: 'bold',
        fill: currentStyle.strokeColor,
        originX: 'center',
        originY: 'center',
        selectable: false,
        visible: false,
        isAngleComponent: true,
        isAngleLabel: true,
        angleIndex: idx
      });

      angleElements.push(box, dot, lbl);
    } else if (ang.arcPathString) {
      // Açı Yayı
      const arc = new fabric.Path(ang.arcPathString, {
        stroke: currentStyle.strokeColor,
        strokeWidth: 1.5,
        fill: 'transparent',
        selectable: false,
        isAngleComponent: true,
        isAngleArc: true,
        angleIndex: idx
      });

      // Açı Derecesi Metni
      const lbl = new fabric.IText(`${ang.angleDegrees}°`, {
        left: ang.labelPosition.x,
        top: ang.labelPosition.y,
        fontSize: 14,
        fontFamily: 'Noto Sans, sans-serif',
        fontWeight: 'bold',
        fill: currentStyle.strokeColor,
        originX: 'center',
        originY: 'center',
        selectable: false,
        visible: currentStyle.angleDisplayMode === 'all',
        isAngleComponent: true,
        isAngleLabel: true,
        angleIndex: idx
      });

      angleElements.push(arc, lbl);
    }
  });

  // Ana şekil ve açı elemanlarını tek bir grup olarak tuvale ekle
  const group = new fabric.Group([polygon, ...angleElements], {
    selectable: true,
    subTargetCheck: true,
    cornerColor: '#2563eb',
    cornerSize: 8,
    transparentCorners: false,
    hasAutoAngles: true,
    angleDisplayMode: currentStyle.angleDisplayMode || 'all',
    anglesData: anglesData
  });

  fabricCanvas.add(group);
  fabricCanvas.setActiveObject(group);
  fabricCanvas.renderAll();
  saveHistoryState();
  setTool('select');
  onObjectSelected(group);
}

function updateSpecificAngle(group, angleIndex, updates, skipRenderList = false) {
  if (!group || !group.anglesData || !group.anglesData[angleIndex]) return;
  const ang = group.anglesData[angleIndex];

  if (updates.text !== undefined) {
    ang.text = updates.text;
  }
  if (updates.displayMode !== undefined) {
    ang.displayMode = updates.displayMode;
  }

  if (Array.isArray(group._objects)) {
    group._objects.forEach((sub) => {
      if (sub.angleIndex === angleIndex) {
        if (sub.isAngleLabel) {
          if (updates.text !== undefined) {
            sub.set('text', updates.text);
          }
          const shouldShow = (ang.displayMode === 'all') && Boolean(ang.text && ang.text.trim());
          sub.set('visible', shouldShow);
        } else if (sub.isAngleComponent || sub.isAngleArc) {
          const shouldShow = (ang.displayMode !== 'hidden');
          sub.set('visible', shouldShow);
        }
        sub.dirty = true;
      }
    });
    group.dirty = true;
  }

  fabricCanvas.renderAll();
  saveHistoryState();
  if (!skipRenderList) {
    renderIndividualAnglesList(group);
  }
}

function renderIndividualAnglesList(group) {
  const container = $('geoIndividualAnglesList');
  if (!container) return;
  container.innerHTML = '';

  if (!group || !group.anglesData || group.anglesData.length === 0) {
    container.innerHTML = '<div class="text-xs text-slate-400 py-1 text-center">Bu şekilde otomatik açı bulunmuyor.</div>';
    return;
  }

  group.anglesData.forEach((ang, i) => {
    const row = document.createElement('div');
    row.className = 'rounded-lg border border-slate-200 bg-slate-50/80 p-2 text-xs dark:border-slate-800 dark:bg-slate-800/70';

    const currentMode = ang.displayMode || 'all';
    const isModeAll = currentMode === 'all';
    const isModeArc = currentMode === 'arc_only';
    const isModeHidden = currentMode === 'hidden';

    row.innerHTML = `
      <div class="flex items-center justify-between mb-1.5">
        <span class="font-bold text-slate-800 dark:text-slate-200">Açı ${i + 1} <span class="font-normal text-[10px] text-slate-400">(${ang.origDegrees}°)</span></span>
        <div class="flex items-center gap-1">
          <button type="button" data-act-mode="all" data-idx="${i}" class="px-1.5 py-0.5 rounded text-[10px] font-semibold transition ${isModeAll ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'}" title="Yazı ve yay açık">Yazılı</button>
          <button type="button" data-act-mode="arc_only" data-idx="${i}" class="px-1.5 py-0.5 rounded text-[10px] font-semibold transition ${isModeArc ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'}" title="Sadece yay, yazıyı gizle">Yay</button>
          <button type="button" data-act-mode="hidden" data-idx="${i}" class="px-1.5 py-0.5 rounded text-[10px] font-semibold transition ${isModeHidden ? 'bg-rose-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'}" title="Bu açıyı tamamen gizle">Gizle</button>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <input type="text" data-ang-input="${i}" class="flex-1 min-w-0 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-900 placeholder-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white" value="${escHtml(ang.text || '')}" placeholder="x, 60°, α">
        <div class="flex items-center gap-0.5 shrink-0">
          <button type="button" data-ang-sym="x" data-idx="${i}" class="px-1.5 py-0.5 rounded bg-white hover:bg-blue-50 hover:text-blue-600 border border-slate-200 text-[10px] font-bold dark:bg-slate-900 dark:border-slate-700">x</button>
          <button type="button" data-ang-sym="α" data-idx="${i}" class="px-1.5 py-0.5 rounded bg-white hover:bg-blue-50 hover:text-blue-600 border border-slate-200 text-[10px] font-bold dark:bg-slate-900 dark:border-slate-700">α</button>
          <button type="button" data-ang-sym="?" data-idx="${i}" class="px-1.5 py-0.5 rounded bg-white hover:bg-blue-50 hover:text-blue-600 border border-slate-200 text-[10px] font-bold dark:bg-slate-900 dark:border-slate-700">?</button>
          <button type="button" data-ang-sym="°" data-idx="${i}" class="px-1.5 py-0.5 rounded bg-white hover:bg-blue-50 hover:text-blue-600 border border-slate-200 text-[10px] font-bold dark:bg-slate-900 dark:border-slate-700">°</button>
        </div>
      </div>
    `;

    container.appendChild(row);
  });

  // Attach input events
  container.querySelectorAll('[data-ang-input]').forEach((inp) => {
    const idx = +inp.dataset.angInput;
    inp.oninput = () => {
      updateSpecificAngle(group, idx, { text: inp.value }, true);
    };
  });

  // Attach mode buttons
  container.querySelectorAll('[data-act-mode]').forEach((btn) => {
    const idx = +btn.dataset.idx;
    const mode = btn.dataset.actMode;
    btn.onclick = () => {
      updateSpecificAngle(group, idx, { displayMode: mode });
    };
  });

  // Attach symbols
  container.querySelectorAll('[data-ang-sym]').forEach((btn) => {
    const idx = +btn.dataset.idx;
    const sym = btn.dataset.angSym;
    btn.onclick = () => {
      const inp = container.querySelector(`[data-ang-input="${idx}"]`);
      if (inp) {
        inp.value = sym === '°' ? inp.value + '°' : sym;
        updateSpecificAngle(group, idx, { text: inp.value }, false);
      }
    };
  });
}

let currentEditingAngleGroup = null;
let currentEditingAngleIndex = null;

function showQuickAngleEditor(group, angleIndex, screenX, screenY) {
  const editor = $('geoQuickAngleEditor');
  if (!editor || !group || !group.anglesData || !group.anglesData[angleIndex]) return;

  editor.onclick = (e) => e.stopPropagation();
  editor.onmousedown = (e) => e.stopPropagation();

  currentEditingAngleGroup = group;
  currentEditingAngleIndex = angleIndex;
  const ang = group.anglesData[angleIndex];

  const titleEl = $('geoQuickAngleLabelText');
  if (titleEl) titleEl.textContent = `Açı ${angleIndex + 1} (${ang.origDegrees}°)`;

  const inputEl = $('geoQuickAngleInput');
  if (inputEl) {
    inputEl.value = ang.text || '';
    inputEl.oninput = () => {
      updateSpecificAngle(group, angleIndex, { text: inputEl.value }, true);
    };
  }

  const container = $('geoCanvasContainer');
  if (container) {
    const cRect = container.getBoundingClientRect();
    let left = screenX - cRect.left;
    let top = screenY - cRect.top - 80;

    left = Math.max(10, Math.min(left, cRect.width - 270));
    top = Math.max(10, Math.min(top, cRect.height - 180));

    editor.style.left = `${left}px`;
    editor.style.top = `${top}px`;
    editor.classList.remove('hidden');
  }

  const btnAll = $('geoQuickModeAll');
  const btnArc = $('geoQuickModeArc');
  const btnHide = $('geoQuickModeHide');

  const updateModeStyles = () => {
    const mode = ang.displayMode || 'all';
    if (btnAll) btnAll.className = mode === 'all' ? 'flex-1 py-1 rounded-md bg-blue-600 text-white font-bold' : 'flex-1 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold dark:border-slate-700 dark:text-slate-300';
    if (btnArc) btnArc.className = mode === 'arc_only' ? 'flex-1 py-1 rounded-md bg-amber-500 text-white font-bold' : 'flex-1 py-1 rounded-md border border-slate-200 text-amber-700 hover:bg-amber-50 font-semibold dark:border-slate-700 dark:text-amber-400';
    if (btnHide) btnHide.className = mode === 'hidden' ? 'flex-1 py-1 rounded-md bg-rose-500 text-white font-bold' : 'flex-1 py-1 rounded-md border border-slate-200 text-rose-600 hover:bg-rose-50 font-semibold dark:border-slate-700 dark:text-rose-400';
  };
  updateModeStyles();

  if (btnAll) btnAll.onclick = () => { updateSpecificAngle(group, angleIndex, { displayMode: 'all' }); updateModeStyles(); };
  if (btnArc) btnArc.onclick = () => { updateSpecificAngle(group, angleIndex, { displayMode: 'arc_only' }); updateModeStyles(); };
  if (btnHide) btnHide.onclick = () => { updateSpecificAngle(group, angleIndex, { displayMode: 'hidden' }); updateModeStyles(); };

  const symBtns = editor.querySelectorAll('.geo-sym-btn');
  symBtns.forEach((b) => {
    b.onclick = () => {
      const sym = b.dataset.sym;
      if (sym === '°') {
        inputEl.value = inputEl.value + '°';
      } else {
        inputEl.value = sym;
      }
      updateSpecificAngle(group, angleIndex, { text: inputEl.value }, false);
    };
  });

  const closeBtn = $('geoQuickAngleClose');
  if (closeBtn) {
    closeBtn.onclick = () => hideQuickAngleEditor();
  }
}

function hideQuickAngleEditor() {
  const editor = $('geoQuickAngleEditor');
  if (editor) editor.classList.add('hidden');
  currentEditingAngleGroup = null;
  currentEditingAngleIndex = null;
}

function cleanupShapeDrawing() {
  if (!fabricCanvas) return;
  if (shapeTempLine) {
    fabricCanvas.remove(shapeTempLine);
    shapeTempLine = null;
  }
  shapeMarkers.forEach((m) => fabricCanvas.remove(m));
  shapeMarkers = [];
  shapeSegments.forEach((s) => fabricCanvas.remove(s));
  shapeSegments = [];
  shapePoints = [];
  fabricCanvas.renderAll();
}

// ============================================================================
// AÇI GÖSTERİM MODU KONTROLÜ (TÜMÜ / SADECE YAY / GİZLİ)
// ============================================================================

function setAngleDisplayMode(mode) {
  currentStyle.angleDisplayMode = mode;
  if (!fabricCanvas) return;

  const active = fabricCanvas.getActiveObject();
  if (active && active.type === 'group' && Array.isArray(active._objects)) {
    active.angleDisplayMode = mode;

    if (Array.isArray(active.anglesData)) {
      active.anglesData.forEach((a) => {
        a.displayMode = mode;
      });
    }

    active._objects.forEach((obj) => {
      if (obj.isAngleLabel) {
        const ang = active.anglesData?.[obj.angleIndex];
        const hasText = ang ? Boolean(ang.text && ang.text.trim()) : true;
        obj.set('visible', mode === 'all' && hasText);
      } else if (obj.isAngleArc || obj.isAngleComponent) {
        obj.set('visible', mode !== 'hidden');
      }
    });

    fabricCanvas.renderAll();
    saveHistoryState();
    renderIndividualAnglesList(active);
  }

  // Floating toolbar etiketini güncelle
  updateAngleButtonLabel(mode);
}

function updateAngleButtonLabel(mode) {
  const lbl = $('geoFloatAngleLabel');
  if (!lbl) return;

  if (mode === 'all') {
    lbl.textContent = 'Açı: Değerli';
  } else if (mode === 'arc_only') {
    lbl.textContent = 'Açı: Sadece Yay';
  } else {
    lbl.textContent = 'Açı: Gizli';
  }
}

function updateFillPreviewUI(fillColor, baseColor, opacity) {
  const fillPreview = $('geoFloatFillPreview');
  const fillHexLabel = $('geoFloatFillHex');
  const opacityLabel = $('geoFloatOpacityLabel');
  const opacitySlider = $('geoFloatOpacitySlider');

  if (fillPreview) {
    if (!fillColor || fillColor === 'transparent' || opacity === 0) {
      fillPreview.textContent = '✕';
      fillPreview.parentElement.style.backgroundColor = 'transparent';
    } else {
      fillPreview.textContent = '';
      fillPreview.parentElement.style.backgroundColor = fillColor;
    }
  }
  if (fillHexLabel) {
    fillHexLabel.textContent = (!baseColor || baseColor === 'transparent' || opacity === 0) ? 'Şeffaf' : baseColor;
  }
  if (opacityLabel) {
    opacityLabel.textContent = `%${Math.round(opacity * 100)}`;
  }
  if (opacitySlider && document.activeElement !== opacitySlider) {
    opacitySlider.value = Math.round(opacity * 100);
  }
}

// ============================================================================
// KAYAN ŞEKİL BİÇİMLENDİRME ARAÇ ÇUBUĞU (FLOATING TOOLBAR)
// ============================================================================

function onObjectSelected(target) {
  const toolbar = $('geoFloatingToolbar');
  if (!toolbar) return;

  if (!target) {
    hideFloatingToolbar();
    return;
  }

  const bound = target.getBoundingRect(true);
  const container = $('geoCanvasContainer');
  if (!container) return;

  const top = Math.max(10, bound.top - 50);
  const left = Math.max(10, bound.left + bound.width / 2);

  toolbar.style.top = `${top}px`;
  toolbar.style.left = `${left}px`;
  toolbar.style.transform = 'translateX(-50%)';
  toolbar.classList.remove('hidden');
  toolbar.classList.add('flex');

  // Açı kontrol butonunu göster / gizle
  const angleWrapper = $('geoAngleControlWrapper');
  const hasAngles = target.hasAutoAngles || (target.type === 'group' && Array.isArray(target.anglesData) && target.anglesData.length > 0);
  if (angleWrapper) {
    angleWrapper.classList.toggle('hidden', !hasAngles);
    if (hasAngles) {
      const mode = target.angleDisplayMode || 'all';
      updateAngleButtonLabel(mode);
      renderIndividualAnglesList(target);
    }
  }

  // Renk ve kalınlık önizlemeleri
  let strokeColor = target.stroke;
  let fillColor = target.fill;
  let strokeW = target.strokeWidth;
  let isDashed = Array.isArray(target.strokeDashArray) && target.strokeDashArray.length > 0;

  if (target.type === 'group' && Array.isArray(target._objects)) {
    const mainPoly = target._objects.find((o) => o.type === 'polygon' || o.type === 'rect' || o.type === 'circle' || o.type === 'path');
    if (mainPoly) {
      if (mainPoly.stroke) strokeColor = mainPoly.stroke;
      if (mainPoly.fill) fillColor = mainPoly.fill;
      if (mainPoly.strokeWidth) strokeW = mainPoly.strokeWidth;
      if (mainPoly.strokeDashArray) isDashed = Array.isArray(mainPoly.strokeDashArray) && mainPoly.strokeDashArray.length > 0;
    }
  }

  strokeColor = strokeColor || currentStyle.strokeColor;
  fillColor = fillColor !== undefined ? fillColor : currentStyle.fillColor;
  strokeW = strokeW || currentStyle.strokeWidth;

  const strokePreview = $('geoFloatStrokePreview');
  if (strokePreview) strokePreview.style.backgroundColor = strokeColor;

  // Opaklık ve Dolgu Rengini Çözümle
  let objOpacity = currentStyle.fillOpacity;
  let objBaseColor = currentStyle.baseFillColor;

  if (!fillColor || fillColor === 'transparent' || fillColor === 'rgba(0, 0, 0, 0)') {
    objBaseColor = 'transparent';
    objOpacity = 0;
  } else if (typeof fillColor === 'string' && fillColor.startsWith('rgba')) {
    const m = fillColor.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
    if (m) {
      const r = parseInt(m[1], 10);
      const g = parseInt(m[2], 10);
      const b = parseInt(m[3], 10);
      objOpacity = parseFloat(m[4]);
      objBaseColor = '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
    }
  } else if (typeof fillColor === 'string' && fillColor.startsWith('#')) {
    objBaseColor = fillColor;
    objOpacity = 1;
  }

  currentStyle.fillColor = fillColor || 'transparent';
  currentStyle.baseFillColor = objBaseColor;
  currentStyle.fillOpacity = objOpacity;

  updateFillPreviewUI(fillColor, objBaseColor, objOpacity);

  const widthLabel = $('geoFloatWidthLabel');
  if (widthLabel) widthLabel.textContent = `${strokeW}px`;

  const dashedCheck = $('geoFloatDashed');
  if (dashedCheck) dashedCheck.checked = isDashed;
}

function hideFloatingToolbar() {
  const toolbar = $('geoFloatingToolbar');
  if (toolbar) {
    toolbar.classList.add('hidden');
    toolbar.classList.remove('flex');
  }
  closeAllFloatingPopovers();
  hideQuickAngleEditor();
}

function closeAllFloatingPopovers() {
  const p0 = $('geoFloatAnglePopover');
  const p1 = $('geoFloatStrokePopover');
  const p2 = $('geoFloatFillPopover');
  const p3 = $('geoFloatWidthPopover');
  if (p0) p0.classList.add('hidden');
  if (p1) p1.classList.add('hidden');
  if (p2) p2.classList.add('hidden');
  if (p3) p3.classList.add('hidden');
}

function updateActiveObjectStyle(updates) {
  if (!fabricCanvas) return;
  const activeObjs = fabricCanvas.getActiveObjects();
  if (!activeObjs || activeObjs.length === 0) return;

  activeObjs.forEach((obj) => {
    if (obj.type === 'group' && Array.isArray(obj._objects)) {
      // Grup içindeki ana çokgene stili uygula
      const mainPoly = obj._objects.find((o) => o.type === 'polygon' || o.type === 'rect' || o.type === 'circle' || o.type === 'path');
      if (mainPoly) {
        if (updates.stroke !== undefined) mainPoly.set('stroke', updates.stroke);
        if (updates.fill !== undefined) mainPoly.set('fill', updates.fill);
        if (updates.strokeWidth !== undefined) mainPoly.set('strokeWidth', updates.strokeWidth);
        if (updates.strokeDashArray !== undefined) mainPoly.set('strokeDashArray', updates.strokeDashArray);
        mainPoly.dirty = true;
      }
      obj.dirty = true;
    } else {
      if (updates.stroke !== undefined) obj.set('stroke', updates.stroke);
      if (updates.fill !== undefined) obj.set('fill', updates.fill);
      if (updates.strokeWidth !== undefined) obj.set('strokeWidth', updates.strokeWidth);
      if (updates.strokeDashArray !== undefined) obj.set('strokeDashArray', updates.strokeDashArray);
      obj.dirty = true;
    }
    obj.setCoords();
  });

  fabricCanvas.renderAll();
  saveHistoryState();
}

function duplicateActiveObject() {
  if (!fabricCanvas) return;
  const active = fabricCanvas.getActiveObject();
  if (!active) return;

  active.clone((cloned) => {
    fabricCanvas.discardActiveObject();
    cloned.set({
      left: cloned.left + 20,
      top: cloned.top + 20,
      evented: true
    });
    if (cloned.type === 'activeSelection') {
      cloned.canvas = fabricCanvas;
      cloned.forEachObject((obj) => fabricCanvas.add(obj));
      cloned.setCoords();
    } else {
      fabricCanvas.add(cloned);
    }
    fabricCanvas.setActiveObject(cloned);
    fabricCanvas.renderAll();
    saveHistoryState();
  });
}

function deleteActiveObjects() {
  if (!fabricCanvas) return;
  const activeObjs = fabricCanvas.getActiveObjects();
  if (!activeObjs || activeObjs.length === 0) return;

  activeObjs.forEach((obj) => fabricCanvas.remove(obj));
  fabricCanvas.discardActiveObject();
  fabricCanvas.renderAll();
  saveHistoryState();
  hideFloatingToolbar();
}

// ============================================================================
// HAZIR GEOMETRİ ŞABLONLARI
// ============================================================================

function insertTemplate(tplName) {
  const fabric = window.fabric;
  if (!fabric || !fabricCanvas) return;

  if (tplName === 'dik_ucgen') {
    // 3-4-5 Dik Üçgen (Otomatik Açılı)
    const pts = [
      { x: 260, y: 150 },
      { x: 260, y: 350 },
      { x: 520, y: 350 }
    ];
    shapePoints = pts;
    finishShape();
  } else if (tplName === 'ozel_30_60') {
    // 30-60-90 Üçgeni
    const pts = [
      { x: 280, y: 140 },
      { x: 280, y: 360 },
      { x: 490, y: 360 }
    ];
    shapePoints = pts;
    finishShape();
  } else if (tplName === 'eskenar') {
    // Eşkenar Üçgen (60°-60°-60°)
    const pts = [
      { x: 380, y: 150 },
      { x: 260, y: 358 },
      { x: 500, y: 358 }
    ];
    shapePoints = pts;
    finishShape();
  } else if (tplName === 'oklid') {
    // Öklid Dik Üçgeni + Hipotenüs Dikmesi [AH]
    const pts = [
      { x: 350, y: 150 },
      { x: 220, y: 360 },
      { x: 540, y: 360 }
    ];
    shapePoints = pts;
    finishShape();

    // Dikme h çizgisi ekle
    setTimeout(() => {
      const hLine = new fabric.Line([350, 150, 350, 360], {
        stroke: '#4f46e5',
        strokeWidth: 2,
        strokeDashArray: [4, 4],
        selectable: true
      });
      const hLbl = new fabric.IText('h', {
        left: 360,
        top: 240,
        fontSize: 16,
        fontWeight: 'bold',
        fill: '#4f46e5'
      });
      fabricCanvas.add(hLine, hLbl);
      fabricCanvas.renderAll();
      saveHistoryState();
    }, 50);
  } else if (tplName === 'cember_dilim') {
    const circle = new fabric.Circle({
      left: 380,
      top: 240,
      radius: 90,
      fill: 'transparent',
      stroke: '#0f172a',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center'
    });

    const centerPoint = new fabric.Circle({
      left: 380,
      top: 240,
      radius: 3.5,
      fill: '#0f172a',
      originX: 'center',
      originY: 'center'
    });

    const centerLbl = new fabric.IText('O', { left: 365, top: 245, fontSize: 16, fontWeight: 'bold' });
    const rLine1 = new fabric.Line([380, 240, 470, 240], { stroke: '#0f172a', strokeWidth: 1.8 });
    const rLine2 = new fabric.Line([380, 240, 425, 162], { stroke: '#0f172a', strokeWidth: 1.8 });

    const group = new fabric.Group([circle, centerPoint, centerLbl, rLine1, rLine2], {
      left: 280,
      top: 140,
      selectable: true
    });
    fabricCanvas.add(group);
    fabricCanvas.setActiveObject(group);
    fabricCanvas.renderAll();
    saveHistoryState();
  } else if (tplName === 'dikdortgen') {
    const pts = [
      { x: 240, y: 160 },
      { x: 520, y: 160 },
      { x: 520, y: 320 },
      { x: 240, y: 320 }
    ];
    shapePoints = pts;
    finishShape();
  } else {
    // 3'gen şablonu
    const pts = [
      { x: 380, y: 160 },
      { x: 260, y: 340 },
      { x: 500, y: 340 }
    ];
    shapePoints = pts;
    finishShape();
  }

  $('geoTemplateDrawer')?.classList.add('hidden');
}

// ============================================================================
// KATEX DENKLEM MODÜLÜ ENTEGRASYONU
// ============================================================================

function setupKatexFormulaModule() {
  const tabsContainer = $('geoFormulaTabs');
  const buttonsGrid = $('geoFormulaButtonsGrid');
  const inputEl = $('geoFormulaInput');
  const previewEl = $('geoFormulaPreview');
  const sizeSelect = $('geoFormulaSize');

  if (!tabsContainer || !buttonsGrid || !inputEl || !previewEl) return;

  tabsContainer.querySelectorAll('[data-ftab]').forEach((btn) => {
    btn.onclick = () => {
      activeFormulaTab = btn.dataset.ftab;
      tabsContainer.querySelectorAll('[data-ftab]').forEach((b) => {
        b.className = 'ftab-btn rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800';
      });
      btn.className = 'ftab-btn active rounded-lg px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white shadow-sm';
      renderFormulaButtons();
    };
  });

  function renderFormulaButtons() {
    buttonsGrid.innerHTML = '';
    const items = FORMULA_TABS[activeFormulaTab] || [];
    items.forEach((item) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50/80 px-2 text-xs font-semibold text-slate-800 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-slate-800 transition shadow-sm active:scale-95';
      b.textContent = item.display;
      b.onclick = () => {
        const val = inputEl.value;
        inputEl.value = val ? `${val} ${item.latex}` : item.latex;
        updateFormulaPreview();
        inputEl.focus();
      };
      buttonsGrid.appendChild(b);
    });
  }

  function updateFormulaPreview() {
    const latex = inputEl.value.trim() || ' ';
    const katex = window.katex;
    if (katex) {
      try {
        katex.render(latex, previewEl, {
          displayMode: true,
          throwOnError: false
        });
      } catch (err) {
        previewEl.innerText = latex;
      }
    } else {
      previewEl.innerText = latex;
    }
    previewEl.style.color = formulaColor;
  }

  inputEl.oninput = updateFormulaPreview;

  const colorOptions = $('geoFormulaColorOptions');
  if (colorOptions) {
    colorOptions.querySelectorAll('[data-color]').forEach((btn) => {
      btn.onclick = () => {
        formulaColor = btn.dataset.color;
        colorOptions.querySelectorAll('[data-color]').forEach((b) => b.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-1'));
        btn.classList.add('ring-2', 'ring-blue-500', 'ring-offset-1');
        updateFormulaPreview();
      };
    });
  }

  if (sizeSelect) {
    sizeSelect.onchange = (e) => {
      formulaSize = parseInt(e.target.value, 10) || 26;
    };
  }

  const closeBtn = $('geoFormulaClose');
  const cancelBtn = $('geoFormulaCancel');
  if (closeBtn) closeBtn.onclick = () => closeModal('geoFormulaModal');
  if (cancelBtn) cancelBtn.onclick = () => closeModal('geoFormulaModal');

  const insertBtn = $('geoFormulaInsertBtn');
  if (insertBtn) {
    insertBtn.onclick = async () => {
      const latex = inputEl.value.trim();
      if (!latex) return;
      await addKatexFormulaToCanvas(latex, formulaColor, formulaSize);
      closeModal('geoFormulaModal');
    };
  }

  renderFormulaButtons();
  updateFormulaPreview();
}

async function addKatexFormulaToCanvas(latex, color = '#0f172a', fontSize = 26) {
  const fabric = window.fabric;
  const katex = window.katex;
  if (!fabric || !fabricCanvas || !katex) return;

  try {
    const htmlString = katex.renderToString(latex, {
      displayMode: true,
      throwOnError: false
    });

    const wrapper = document.createElement('div');
    wrapper.style.display = 'inline-block';
    wrapper.style.fontSize = `${fontSize}px`;
    wrapper.style.color = color;
    wrapper.style.fontFamily = 'KaTeX_Main, Times New Roman, serif';
    wrapper.style.padding = '8px 12px';
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '-9999px';
    wrapper.innerHTML = htmlString;
    document.body.appendChild(wrapper);

    const rect = wrapper.getBoundingClientRect();
    const width = Math.max(Math.ceil(rect.width) + 8, 30);
    const height = Math.max(Math.ceil(rect.height) + 8, 24);
    document.body.removeChild(wrapper);

    const scale = 2;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width} ${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:${fontSize}px; color:${color}; font-family: KaTeX_Main, Times New Roman, serif; display:flex; align-items:center; justify-content:center; height:100%;">
            ${htmlString}
          </div>
        </foreignObject>
      </svg>
    `;

    const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

    const imgEl = new Image();
    imgEl.onload = () => {
      const c = document.createElement('canvas');
      c.width = width * scale;
      c.height = height * scale;
      const ctx = c.getContext('2d');
      ctx.drawImage(imgEl, 0, 0);
      const pngUrl = c.toDataURL('image/png');

      fabric.Image.fromURL(pngUrl, (fImg) => {
        fImg.set({
          left: 380,
          top: 240,
          originX: 'center',
          originY: 'center',
          selectable: true,
          hasControls: true,
          hasBorders: true,
          transparentCorners: false,
          cornerColor: '#2563eb',
          cornerSize: 8,
          scaleX: 0.5,
          scaleY: 0.5
        });
        fabricCanvas.add(fImg);
        fabricCanvas.setActiveObject(fImg);
        fabricCanvas.renderAll();
        saveHistoryState();
        setTool('select');
      });
    };
    imgEl.src = svgDataUrl;
  } catch (err) {
    console.error('KaTeX to Canvas hatası:', err);
  }
}

// ============================================================================
// TARİHÇE VE KLAVYE KISAYOLLARI
// ============================================================================

function saveHistoryState() {
  if (!fabricCanvas || isHistoryUpdating) return;
  const json = JSON.stringify(fabricCanvas.toJSON());
  if (historyIndex < historyStack.length - 1) {
    historyStack.splice(historyIndex + 1);
  }
  historyStack.push(json);
  historyIndex++;
}

function handleUndo() {
  if (!fabricCanvas || historyIndex <= 0) return;
  isHistoryUpdating = true;
  historyIndex--;
  fabricCanvas.loadFromJSON(historyStack[historyIndex], () => {
    fabricCanvas.renderAll();
    isHistoryUpdating = false;
    hideFloatingToolbar();
  });
}

function handleRedo() {
  if (!fabricCanvas || historyIndex >= historyStack.length - 1) return;
  isHistoryUpdating = true;
  historyIndex++;
  fabricCanvas.loadFromJSON(historyStack[historyIndex], () => {
    fabricCanvas.renderAll();
    isHistoryUpdating = false;
    hideFloatingToolbar();
  });
}

function onGlobalKeyDown(e) {
  const modal = $('geoModal');
  if (!modal || modal.classList.contains('hidden')) return;
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

  if (e.key === 'Escape') {
    resetToolState();
  } else if (e.key === 'Enter' && activeTool === 'shape') {
    if (shapePoints.length >= 3) {
      finishShape();
    }
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    deleteActiveObjects();
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    if (e.shiftKey) handleRedo();
    else handleUndo();
    e.preventDefault();
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
    handleRedo();
    e.preventDefault();
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
    duplicateActiveObject();
    e.preventDefault();
  }
}

// ============================================================================
// DIŞA AKTARMA (2X RETINA PNG EXPORT)
// ============================================================================

function exportGeometryAsPNG() {
  if (!fabricCanvas) return null;
  hideSnapIndicator();
  fabricCanvas.discardActiveObject();

  // Izgara desenini geçici kaldırıp temiz beyaz arka planla dışa aktar
  const prevBg = fabricCanvas.backgroundColor;
  fabricCanvas.setBackgroundColor('#ffffff', () => {});
  fabricCanvas.renderAll();

  const dataUrl = fabricCanvas.toDataURL({
    format: 'png',
    multiplier: 2
  });

  // Izgarayı geri yükle
  if (gridEnabled) {
    updateGridBackground(true);
  } else {
    fabricCanvas.setBackgroundColor(prevBg || '#ffffff', () => {});
    fabricCanvas.renderAll();
  }

  return dataUrl;
}

// ============================================================================
// EVENT LISTENERS KURULUMU
// ============================================================================

function setupGeometryEventListeners() {
  // Araç Butonları
  const toolBtns = [
    { id: 'geoToolSelect', tool: 'select' },
    { id: 'geoToolShape', tool: 'shape' },
    { id: 'geoToolPolygon', tool: 'shape' },
    { id: 'geoToolLine', tool: 'line' },
    { id: 'geoToolCircle', tool: 'circle' },
    { id: 'geoToolText', tool: 'text' }
  ];

  toolBtns.forEach(({ id, tool }) => {
    const btn = $(id);
    if (btn) {
      btn.onclick = () => setTool(tool);
    }
  });

  // Şekli Tamamla Butonu
  const polyFinishBtn = $('geoPolygonFinishBtn');
  if (polyFinishBtn) {
    polyFinishBtn.onclick = () => finishShape();
  }

  // KaTeX Aç Butonu
  const openFormulaBtn = $('geoOpenFormulaBtn');
  if (openFormulaBtn) {
    openFormulaBtn.onclick = () => openModal('geoFormulaModal');
  }

  // Şablon Çekmecesini Aç/Kapat
  const toggleTplBtn = $('geoToggleTplBtn');
  const tplDrawer = $('geoTemplateDrawer');
  const closeDrawerBtn = $('geoCloseDrawerBtn');
  if (toggleTplBtn && tplDrawer) {
    toggleTplBtn.onclick = () => tplDrawer.classList.toggle('hidden');
  }
  if (closeDrawerBtn && tplDrawer) {
    closeDrawerBtn.onclick = () => tplDrawer.classList.add('hidden');
  }

  if (tplDrawer) {
    tplDrawer.querySelectorAll('[data-tpl]').forEach((btn) => {
      btn.onclick = () => insertTemplate(btn.dataset.tpl);
    });
  }

  // Floating Toolbar Kurulumu
  setupFloatingToolbarPalettes();

  // Zoom
  const zoomIn = $('geoZoomIn');
  const zoomOut = $('geoZoomOut');
  const zoomLbl = $('geoZoomLabel');
  if (zoomIn && zoomOut) {
    zoomIn.onclick = () => {
      if (!fabricCanvas) return;
      zoomLevel = Math.min(200, zoomLevel + 10);
      fabricCanvas.setZoom(zoomLevel / 100);
      fabricCanvas.renderAll();
      if (zoomLbl) zoomLbl.textContent = `%${zoomLevel}`;
    };
    zoomOut.onclick = () => {
      if (!fabricCanvas) return;
      zoomLevel = Math.max(50, zoomLevel - 10);
      fabricCanvas.setZoom(zoomLevel / 100);
      fabricCanvas.renderAll();
      if (zoomLbl) zoomLbl.textContent = `%${zoomLevel}`;
    };
  }

  // Izgara & Snap
  const toggleGridBtn = $('geoToggleGrid');
  if (toggleGridBtn) {
    toggleGridBtn.onclick = () => {
      gridEnabled = !gridEnabled;
      updateGridBackground(gridEnabled);
      toggleGridBtn.className = gridEnabled
        ? 'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300 transition'
        : 'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 transition';
    };
  }

  const toggleSnapBtn = $('geoToggleSnap');
  if (toggleSnapBtn) {
    toggleSnapBtn.onclick = () => {
      snapEnabled = !snapEnabled;
      toggleSnapBtn.className = snapEnabled
        ? 'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300 transition'
        : 'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 transition';
    };
  }

  // Geri Al / İleri Al / Temizle
  const undoBtn = $('geoBtnUndo');
  const redoBtn = $('geoBtnRedo');
  const clearBtn = $('geoBtnClear');
  if (undoBtn) undoBtn.onclick = handleUndo;
  if (redoBtn) redoBtn.onclick = handleRedo;
  if (clearBtn) {
    clearBtn.onclick = () => {
      if (!fabricCanvas) return;
      fabricCanvas.clear();
      updateGridBackground(gridEnabled);
      saveHistoryState();
      hideFloatingToolbar();
    };
  }

  // Kapatma & İptal
  const closeBtn = $('geoModalClose');
  const cancelBtn = $('geoModalCancel');
  const handleGeoClose = () => {
    closeModal('geoModal');
    if (typeof onGeometryCancelCallback === 'function') {
      const cb = onGeometryCancelCallback;
      onGeometryCancelCallback = null;
      onInsertCallback = null;
      cb();
    }
  };
  if (closeBtn) closeBtn.onclick = handleGeoClose;
  if (cancelBtn) cancelBtn.onclick = handleGeoClose;

  // Soruya Ekle Butonu
  const insertBtn = $('geoInsertBtn');
  if (insertBtn) {
    insertBtn.onclick = () => {
      const dataUrl = exportGeometryAsPNG();
      closeModal('geoModal');
      const cb = onInsertCallback;
      onInsertCallback = null;
      onGeometryCancelCallback = null;
      if (dataUrl && typeof cb === 'function') {
        cb(dataUrl);
      }
    };
  }

  setupKatexFormulaModule();
}

function setupFloatingToolbarPalettes() {
  const angleBtn = $('geoFloatAngleBtn');
  const anglePop = $('geoFloatAnglePopover');

  const strokeBtn = $('geoFloatStrokeBtn');
  const strokePop = $('geoFloatStrokePopover');
  const strokeGrid = $('geoStrokeGrid');

  const fillBtn = $('geoFloatFillBtn');
  const fillPop = $('geoFloatFillPopover');
  const fillGrid = $('geoFillGrid');

  const widthBtn = $('geoFloatWidthBtn');
  const widthPop = $('geoFloatWidthPopover');
  const dashedCheck = $('geoFloatDashed');

  const dupBtn = $('geoFloatDupBtn');
  const delBtn = $('geoFloatDelBtn');

  const opacitySlider = $('geoFloatOpacitySlider');
  const opacityLabel = $('geoFloatOpacityLabel');

  // Açı Gösterim Popover
  if (angleBtn && anglePop) {
    angleBtn.onclick = (e) => {
      e.stopPropagation();
      const active = fabricCanvas?.getActiveObject();
      if (active) {
        renderIndividualAnglesList(active);
      }
      anglePop.classList.toggle('hidden');
      if (strokePop) strokePop.classList.add('hidden');
      if (fillPop) fillPop.classList.add('hidden');
      if (widthPop) widthPop.classList.add('hidden');
    };

    anglePop.querySelectorAll('[data-angle-mode]').forEach((b) => {
      b.onclick = () => {
        setAngleDisplayMode(b.dataset.angleMode);
      };
    });
  }

  // Çizgi Rengi Grid
  if (strokeGrid) {
    strokeGrid.innerHTML = '';
    STROKE_COLORS.forEach((color) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'h-5 w-5 rounded-full border border-black/10 transition hover:scale-125';
      b.style.backgroundColor = color;
      b.onclick = () => {
        currentStyle.strokeColor = color;
        updateActiveObjectStyle({ stroke: color });
        const strokePreview = $('geoFloatStrokePreview');
        if (strokePreview) strokePreview.style.backgroundColor = color;
        strokePop.classList.add('hidden');
      };
      strokeGrid.appendChild(b);
    });
  }

  // Dolgu Rengi ve Saydamlık Uygulama Fonksiyonu
  function applyFillAndOpacity(baseColor, opacity) {
    currentStyle.baseFillColor = baseColor;
    currentStyle.fillOpacity = opacity;
    let finalFill = 'transparent';
    if (baseColor && baseColor !== 'transparent' && opacity > 0) {
      finalFill = hexToRgba(baseColor, opacity);
    } else {
      finalFill = 'transparent';
    }
    currentStyle.fillColor = finalFill;
    updateActiveObjectStyle({ fill: finalFill });
    updateFillPreviewUI(finalFill, baseColor, opacity);
  }

  // Dolgu Rengi Grid
  if (fillGrid) {
    fillGrid.innerHTML = '';
    FILL_COLORS.forEach((color) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'h-5 w-5 rounded-full border border-slate-300 transition hover:scale-125 relative flex items-center justify-center';
      b.style.backgroundColor = color === 'transparent' ? '#ffffff' : color;
      if (color === 'transparent') {
        b.innerHTML = '<span class="text-[10px] text-red-500 font-bold">✕</span>';
      }
      b.onclick = (e) => {
        e.stopPropagation();
        if (color === 'transparent') {
          applyFillAndOpacity('transparent', 0);
        } else {
          const op = currentStyle.fillOpacity > 0 ? currentStyle.fillOpacity : 0.35;
          applyFillAndOpacity(color, op);
        }
      };
      fillGrid.appendChild(b);
    });
  }

  // Saydamlık Slider
  if (opacitySlider) {
    opacitySlider.oninput = (e) => {
      e.stopPropagation();
      const op = parseInt(e.target.value, 10) / 100;
      let base = currentStyle.baseFillColor;
      if ((!base || base === 'transparent') && op > 0) {
        base = '#3b82f6';
      }
      applyFillAndOpacity(base, op);
    };
  }

  // Saydamlık Hızlı Butonları (0, 25, 50, 75, 100)
  document.querySelectorAll('.geo-op-btn').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const op = parseFloat(btn.dataset.op);
      let base = currentStyle.baseFillColor;
      if (op === 0) {
        applyFillAndOpacity('transparent', 0);
      } else {
        if (!base || base === 'transparent') base = '#3b82f6';
        applyFillAndOpacity(base, op);
      }
    };
  });

  if (strokeBtn && strokePop) {
    strokeBtn.onclick = (e) => {
      e.stopPropagation();
      strokePop.classList.toggle('hidden');
      if (anglePop) anglePop.classList.add('hidden');
      if (fillPop) fillPop.classList.add('hidden');
      if (widthPop) widthPop.classList.add('hidden');
    };
  }

  if (fillBtn && fillPop) {
    fillBtn.onclick = (e) => {
      e.stopPropagation();
      fillPop.classList.toggle('hidden');
      if (anglePop) anglePop.classList.add('hidden');
      if (strokePop) strokePop.classList.add('hidden');
      if (widthPop) widthPop.classList.add('hidden');
    };
  }

  if (widthBtn && widthPop) {
    widthBtn.onclick = (e) => {
      e.stopPropagation();
      widthPop.classList.toggle('hidden');
      if (anglePop) anglePop.classList.add('hidden');
      if (strokePop) strokePop.classList.add('hidden');
      if (fillPop) fillPop.classList.add('hidden');
    };
  }

  const widthContainer = $('geoWidthButtons');
  if (widthContainer) {
    widthContainer.querySelectorAll('[data-w]').forEach((btn) => {
      btn.onclick = () => {
        const w = parseInt(btn.dataset.w, 10);
        currentStyle.strokeWidth = w;
        updateActiveObjectStyle({ strokeWidth: w });
        widthContainer.querySelectorAll('[data-w]').forEach((b) => {
          b.className = 'flex-1 rounded-md py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800';
        });
        btn.className = 'flex-1 rounded-md py-1 text-xs font-bold bg-blue-600 text-white';
        const widthLabel = $('geoFloatWidthLabel');
        if (widthLabel) widthLabel.textContent = `${w}px`;
      };
    });
  }

  if (dashedCheck) {
    dashedCheck.onchange = (e) => {
      currentStyle.isDashed = e.target.checked;
      updateActiveObjectStyle({
        strokeDashArray: e.target.checked ? [6, 6] : null
      });
    };
  }

  if (dupBtn) dupBtn.onclick = duplicateActiveObject;
  if (delBtn) delBtn.onclick = deleteActiveObjects;
}

const initGeometryDrawer = setupGeometryEventListeners;


// Module Exports
__exports['initGeometryDrawer'] = initGeometryDrawer;
__exports['setOnGeometryInsertCallback'] = setOnGeometryInsertCallback;
__exports['openGeometryModal'] = openGeometryModal;
__exports['syncControlsFromState'] = syncControlsFromState;
__exports['exportGeometryAsPNG'] = exportGeometryAsPNG;
__exports['setupGeometryEventListeners'] = setupGeometryEventListeners;

});

__define('modules/science/overlayEngine.js', function(__exports, __require, __module) {
/**
 * Egemen's Testmaker — Fen & Coğrafya İnteraktif Tuval ve Katman Motoru
 * Soru içi değişkenler, devre sembolleri (direnç, pil, vb.), KaTeX formülleri,
 * serbest yazı, oklar, pinler ve organel sürükle-bırak yönetim katmanı.
 */

function escSvg(str) {
  return String(str || '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);
}

let activeSelectedId = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let currentDragTarget = null; // { type: 'overlay' | 'organelle' | 'mapPin', key: string | number }

function getSelectedOverlayId() {
  return activeSelectedId;
}

function setSelectedOverlayId(id) {
  activeSelectedId = id;
}

// ============================================================================
// 1. SEMBOLLER, FORMÜLLER VE İŞARETLEYİCİLER İÇİN SVG RENDER
// ============================================================================

function renderKaTeXSvg(text, x, y, size = 16, color = '#0f172a', isSelected = false) {
  const safeText = escSvg(text);
  const formatted = formatMathString(safeText);
  const selAttr = isSelected ? 'filter="url(#sciSelectGlow)"' : '';
  const textWidth = Math.max(text.length * (size * 0.58) + 16, 40);
  
  return `
    <g class="sci-draggable sci-overlay-item" data-overlay-id="${escSvg(text)}" data-overlay-type="formula" transform="translate(${x},${y})" ${selAttr}>
      <rect x="-8" y="-${size + 6}" width="${textWidth}" height="${size + 12}" rx="5" fill="#ffffff" fill-opacity="0.95" stroke="${isSelected ? '#2563eb' : '#cbd5e1'}" stroke-width="${isSelected ? '2.5' : '1.2'}" />
      <text x="0" y="0" font-family="'KaTeX_Math', 'Times New Roman', serif" font-size="${size}" font-style="italic" fill="${color}">
        ${formatted}
      </text>
    </g>
  `;
}

function formatMathString(str) {
  return str
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\pi/g, 'π')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\times/g, '×')
    .replace(/\\pm/g, '±')
    .replace(/\\to/g, '→')
    .replace(/\\approx/g, '≈')
    .replace(/_([0-9a-zA-Z]+)/g, '<tspan dy="4" font-size="0.75em">$1</tspan><tspan dy="-4"> </tspan>')
    .replace(/\^([0-9a-zA-Z+-]+)/g, '<tspan dy="-6" font-size="0.75em">$1</tspan><tspan dy="6"> </tspan>');
}

function renderCircuitSymbolSvg(item, isSelected = false) {
  const { id, symbol, x, y, label = '', val = '', rot = 0 } = item;
  const selAttr = isSelected ? 'filter="url(#sciSelectGlow)"' : '';

  let body = '';
  switch (symbol) {
    case 'resistor': // Kutu tip direnç
    default:
      body = `
        <line x1="-36" y1="0" x2="-20" y2="0" stroke="#0f172a" stroke-width="2.5" />
        <rect x="-20" y="-10" width="40" height="20" rx="2" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" />
        <line x1="20" y1="0" x2="36" y2="0" stroke="#0f172a" stroke-width="2.5" />
      `;
      break;
    case 'resistor_zigzag': // Zigzag tip direnç
      body = `
        <line x1="-36" y1="0" x2="-24" y2="0" stroke="#0f172a" stroke-width="2.5" />
        <path d="M -24 0 L -18 -10 L -6 10 L 6 -10 L 18 10 L 24 0" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linejoin="round" />
        <line x1="24" y1="0" x2="36" y2="0" stroke="#0f172a" stroke-width="2.5" />
      `;
      break;
    case 'battery': // Pil / Üreteç
      body = `
        <line x1="-30" y1="0" x2="-6" y2="0" stroke="#0f172a" stroke-width="2.5" />
        <line x1="-6" y1="-18" x2="-6" y2="18" stroke="#0f172a" stroke-width="3.5" />
        <line x1="6" y1="-10" x2="6" y2="10" stroke="#0f172a" stroke-width="3" />
        <line x1="6" y1="0" x2="30" y2="0" stroke="#0f172a" stroke-width="2.5" />
        <text x="-12" y="-14" font-size="11" font-weight="bold" fill="#dc2626">+</text>
        <text x="10" y="-14" font-size="11" font-weight="bold" fill="#0f172a">-</text>
      `;
      break;
    case 'switch_open': // Açık Anahtar
      body = `
        <line x1="-30" y1="0" x2="-12" y2="0" stroke="#0f172a" stroke-width="2.5" />
        <circle cx="-12" cy="0" r="3" fill="#0f172a" />
        <line x1="-12" y1="0" x2="10" y2="-15" stroke="#0f172a" stroke-width="2.5" />
        <circle cx="12" cy="0" r="3" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
        <line x1="12" y1="0" x2="30" y2="0" stroke="#0f172a" stroke-width="2.5" />
      `;
      break;
    case 'switch_closed': // Kapalı Anahtar
      body = `
        <line x1="-30" y1="0" x2="-12" y2="0" stroke="#0f172a" stroke-width="2.5" />
        <circle cx="-12" cy="0" r="3" fill="#0f172a" />
        <line x1="-12" y1="0" x2="12" y2="0" stroke="#0f172a" stroke-width="2.5" />
        <circle cx="12" cy="0" r="3" fill="#0f172a" />
        <line x1="12" y1="0" x2="30" y2="0" stroke="#0f172a" stroke-width="2.5" />
      `;
      break;
    case 'bulb': // Lamba
      body = `
        <line x1="-30" y1="0" x2="-15" y2="0" stroke="#0f172a" stroke-width="2.5" />
        <circle cx="0" cy="0" r="15" fill="#fef08a" stroke="#0f172a" stroke-width="2.5" />
        <line x1="-10.5" y1="-10.5" x2="10.5" y2="10.5" stroke="#0f172a" stroke-width="2" />
        <line x1="-10.5" y1="10.5" x2="10.5" y2="-10.5" stroke="#0f172a" stroke-width="2" />
        <line x1="15" y1="0" x2="30" y2="0" stroke="#0f172a" stroke-width="2.5" />
      `;
      break;
    case 'voltmeter': // Voltmetre
      body = `
        <line x1="-30" y1="0" x2="-14" y2="0" stroke="#0f172a" stroke-width="2.5" />
        <circle cx="0" cy="0" r="14" fill="#ffffff" stroke="#2563eb" stroke-width="2.5" />
        <text x="0" y="5" text-anchor="middle" font-size="13" font-weight="bold" fill="#2563eb">V</text>
        <line x1="14" y1="0" x2="30" y2="0" stroke="#0f172a" stroke-width="2.5" />
      `;
      break;
    case 'ammeter': // Ampermetre
      body = `
        <line x1="-30" y1="0" x2="-14" y2="0" stroke="#0f172a" stroke-width="2.5" />
        <circle cx="0" cy="0" r="14" fill="#ffffff" stroke="#059669" stroke-width="2.5" />
        <text x="0" y="5" text-anchor="middle" font-size="13" font-weight="bold" fill="#059669">A</text>
        <line x1="14" y1="0" x2="30" y2="0" stroke="#0f172a" stroke-width="2.5" />
      `;
      break;
    case 'capacitor': // Sığaç (Kapasitör)
      body = `
        <line x1="-30" y1="0" x2="-6" y2="0" stroke="#0f172a" stroke-width="2.5" />
        <line x1="-6" y1="-15" x2="-6" y2="15" stroke="#0f172a" stroke-width="3" />
        <line x1="6" y1="-15" x2="6" y2="15" stroke="#0f172a" stroke-width="3" />
        <line x1="6" y1="0" x2="30" y2="0" stroke="#0f172a" stroke-width="2.5" />
      `;
      break;
  }

  return `
    <g class="sci-draggable sci-overlay-item" data-overlay-id="${id}" data-overlay-type="symbol" transform="translate(${x},${y}) rotate(${rot})" ${selAttr}>
      ${isSelected ? `<rect x="-40" y="-24" width="80" height="48" rx="6" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="3,3" />` : ''}
      ${body}
      ${label ? `<text x="0" y="-16" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f172a">${escSvg(label)}</text>` : ''}
      ${val ? `<text x="0" y="24" text-anchor="middle" font-size="11" font-weight="bold" fill="#2563eb">${escSvg(val)}</text>` : ''}
    </g>
  `;
}

function renderArrowSvg(item, isSelected = false) {
  const { id, x1 = 100, y1 = 100, x2 = 200, y2 = 150, label = '', color = '#dc2626' } = item;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 12;
  const hx1 = x2 - headLen * Math.cos(angle - Math.PI / 6);
  const hy1 = y2 - headLen * Math.sin(angle - Math.PI / 6);
  const hx2 = x2 - headLen * Math.cos(angle + Math.PI / 6);
  const hy2 = y2 - headLen * Math.sin(angle + Math.PI / 6);

  return `
    <g class="sci-draggable sci-overlay-item" data-overlay-id="${id}" data-overlay-type="arrow">
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${isSelected ? '3' : '2.4'}" stroke-linecap="round" />
      <polygon points="${x2},${y2} ${hx1},${hy1} ${hx2},${hy2}" fill="${color}" />
      <circle cx="${x1}" cy="${y1}" r="3.5" fill="${color}" />
      ${isSelected ? `<circle cx="${x1}" cy="${y1}" r="6" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="2,2" />` : ''}
      ${isSelected ? `<circle cx="${x2}" cy="${y2}" r="6" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="2,2" />` : ''}
      ${label ? `
        <g transform="translate(${midX},${midY - 10})">
          <rect x="-${label.length * 4 + 6}" y="-10" width="${label.length * 8 + 12}" height="18" rx="4" fill="#ffffff" stroke="${color}" stroke-width="1.2" />
          <text x="0" y="3" text-anchor="middle" font-size="11" font-weight="bold" fill="${color}">${escSvg(label)}</text>
        </g>
      ` : ''}
    </g>
  `;
}

function renderPinSvg(item, isSelected = false) {
  const { id, x, y, label = 'I', text = '', color = '#dc2626' } = item;
  const selGlow = isSelected ? 'filter="url(#sciSelectGlow)"' : '';

  return `
    <g class="sci-draggable sci-overlay-item" data-overlay-id="${id}" data-overlay-type="pin" transform="translate(${x},${y})" ${selGlow}>
      <path d="M 0 0 C -10 -14 -12 -22 -12 -28 A 12 12 0 1 1 12 -28 C 12 -22 10 -14 0 0 Z" fill="${color}" stroke="#ffffff" stroke-width="2" />
      <circle cx="0" cy="-28" r="6.5" fill="#ffffff" />
      <text x="0" y="-24.5" text-anchor="middle" font-size="8.5" font-weight="bold" fill="${color}">${escSvg(label)}</text>
      ${isSelected ? `<circle cx="0" cy="-28" r="14" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="3,3" />` : ''}
      ${text ? `
        <rect x="14" y="-36" width="${text.length * 7 + 12}" height="20" rx="4" fill="#ffffff" fill-opacity="0.95" stroke="${color}" stroke-width="1.2" />
        <text x="${20 + (text.length * 3.5)}" y="-22" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f172a">${escSvg(text)}</text>
      ` : ''}
    </g>
  `;
}

function renderTextAnnotationSvg(item, isSelected = false) {
  const { id, x, y, text = '', size = 14, color = '#0f172a' } = item;
  const selAttr = isSelected ? 'filter="url(#sciSelectGlow)"' : '';

  return `
    <g class="sci-draggable sci-overlay-item" data-overlay-id="${id}" data-overlay-type="text" transform="translate(${x},${y})" ${selAttr}>
      <rect x="-4" y="-${size + 2}" width="${text.length * (size * 0.55) + 12}" height="${size + 8}" rx="4" fill="#ffffff" fill-opacity="0.95" stroke="${isSelected ? '#2563eb' : '#cbd5e1'}" stroke-width="${isSelected ? '2' : '1'}" />
      <text x="2" y="0" font-family="'Noto Sans', sans-serif" font-size="${size}" font-weight="bold" fill="${color}">
        ${escSvg(text)}
      </text>
    </g>
  `;
}

// ============================================================================
// 2. TÜM KATMANLARIN SVG'YE ENJEKTE EDİLMESİ
// ============================================================================

function injectOverlaysIntoSvg(svgStr, currentParams) {
  const overlays = currentParams._overlays || [];
  const selectedId = activeSelectedId;

  const defsInjection = `
    <defs>
      <filter id="sciSelectGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#2563eb" flood-opacity="0.7"/>
      </filter>
    </defs>
  `;

  let overlaysSvg = `<g id="sciOverlayLayer">`;

  overlays.forEach(item => {
    const isSel = String(item.id) === String(selectedId);
    if (item.type === 'symbol') {
      overlaysSvg += renderCircuitSymbolSvg(item, isSel);
    } else if (item.type === 'formula') {
      overlaysSvg += renderKaTeXSvg(item.text, item.x, item.y, item.size || 16, item.color || '#0f172a', isSel);
    } else if (item.type === 'arrow') {
      overlaysSvg += renderArrowSvg(item, isSel);
    } else if (item.type === 'pin') {
      overlaysSvg += renderPinSvg(item, isSel);
    } else if (item.type === 'text') {
      overlaysSvg += renderTextAnnotationSvg(item, isSel);
    }
  });

  overlaysSvg += `</g>`;

  const lastIndex = svgStr.lastIndexOf('</svg>');
  if (lastIndex !== -1) {
    return svgStr.slice(0, lastIndex) + defsInjection + overlaysSvg + svgStr.slice(lastIndex);
  }
  return svgStr;
}

// ============================================================================
// 3. İNTERAKTİF SÜRÜKLE-BIRAK VE TIKLAMA YÖNETİCİSİ
// ============================================================================

function setupStageInteractions(stageEl, currentParams, onUpdate, onSelect) {
  if (!stageEl) return;

  stageEl.onpointerdown = (e) => {
    const svgEl = stageEl.querySelector('svg');
    if (!svgEl) return;

    const pt = getSvgCoordinates(svgEl, e.clientX, e.clientY);

    // 1. Organel tutamacı mı?
    const organelleTarget = e.target.closest('[data-organelle-key]');
    if (organelleTarget) {
      const key = organelleTarget.getAttribute('data-organelle-key');
      currentDragTarget = { type: 'organelle', key };
      activeSelectedId = `org_${key}`;
      isDragging = true;
      const org = currentParams.organelles?.[key];
      if (org) {
        dragOffset = { x: pt.x - org.x, y: pt.y - org.y };
      }
      if (typeof onSelect === 'function') onSelect({ type: 'organelle', key, org });
      stageEl.setPointerCapture?.(e.pointerId);
      e.stopPropagation();
      return;
    }

    // 2. Harita pini veya Overlay elemanı mı?
    const overlayTarget = e.target.closest('.sci-overlay-item') || e.target.closest('[data-map-pin-id]');
    if (overlayTarget) {
      const ovId = overlayTarget.getAttribute('data-overlay-id') || overlayTarget.getAttribute('data-map-pin-id');
      const ovType = overlayTarget.getAttribute('data-overlay-type') || 'pin';
      activeSelectedId = ovId;
      isDragging = true;

      if (overlayTarget.hasAttribute('data-map-pin-id')) {
        const pin = (currentParams.pins || []).find(p => String(p.id) === String(ovId));
        if (pin) {
          currentDragTarget = { type: 'mapPin', key: pin.id };
          dragOffset = { x: pt.x - pin.x, y: pt.y - pin.y };
        }
      } else {
        const item = (currentParams._overlays || []).find(o => String(o.id) === String(ovId));
        if (item) {
          currentDragTarget = { type: 'overlay', key: item.id };
          dragOffset = { x: pt.x - item.x, y: pt.y - item.y };
        }
      }

      if (typeof onSelect === 'function') onSelect({ type: ovType, id: ovId });
      stageEl.setPointerCapture?.(e.pointerId);
      e.stopPropagation();
      return;
    }

    activeSelectedId = null;
    currentDragTarget = null;
    if (typeof onSelect === 'function') onSelect(null);
  };

  stageEl.onpointermove = (e) => {
    if (!isDragging || !currentDragTarget) return;
    const svgEl = stageEl.querySelector('svg');
    if (!svgEl) return;

    const pt = getSvgCoordinates(svgEl, e.clientX, e.clientY);
    const newX = Math.round(pt.x - dragOffset.x);
    const newY = Math.round(pt.y - dragOffset.y);

    if (currentDragTarget.type === 'organelle') {
      if (currentParams.organelles && currentParams.organelles[currentDragTarget.key]) {
        currentParams.organelles[currentDragTarget.key].x = Math.max(30, Math.min(500, newX));
        currentParams.organelles[currentDragTarget.key].y = Math.max(40, Math.min(350, newY));
        if (typeof onUpdate === 'function') onUpdate();
      }
    } else if (currentDragTarget.type === 'mapPin') {
      const pin = (currentParams.pins || []).find(p => String(p.id) === String(currentDragTarget.key));
      if (pin) {
        pin.x = Math.max(20, Math.min(580, newX));
        pin.y = Math.max(20, Math.min(320, newY));
        if (typeof onUpdate === 'function') onUpdate();
      }
    } else if (currentDragTarget.type === 'overlay') {
      const item = (currentParams._overlays || []).find(o => String(o.id) === String(currentDragTarget.key));
      if (item) {
        if (item.type === 'arrow') {
          const dx = newX - item.x1;
          const dy = newY - item.y1;
          item.x1 = newX;
          item.y1 = newY;
          item.x2 += dx;
          item.y2 += dy;
        } else {
          item.x = newX;
          item.y = newY;
        }
        if (typeof onUpdate === 'function') onUpdate();
      }
    }
  };

  stageEl.onpointerup = (e) => {
    isDragging = false;
    currentDragTarget = null;
    try { stageEl.releasePointerCapture?.(e.pointerId); } catch (err) {}
  };
}

function getSvgCoordinates(svg, clientX, clientY) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (ctm) {
    return pt.matrixTransform(ctm.inverse());
  }
  const rect = svg.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
}

// ============================================================================
// 4. KATMAN ARAÇLARI (EKLE, SİL, SIFIRLA)
// ============================================================================

function addOverlayItem(currentParams, type, customData = {}) {
  if (!currentParams._overlays) currentParams._overlays = [];
  const id = 'ov_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

  let newItem = { id, type, x: 260, y: 180, ...customData };
  currentParams._overlays.push(newItem);
  activeSelectedId = id;
  return newItem;
}

function deleteSelectedOverlayItem(currentParams) {
  if (!activeSelectedId) return false;

  if (currentParams._overlays) {
    const idx = currentParams._overlays.findIndex(o => String(o.id) === String(activeSelectedId));
    if (idx !== -1) {
      currentParams._overlays.splice(idx, 1);
      activeSelectedId = null;
      return true;
    }
  }

  if (currentParams.pins) {
    const pIdx = currentParams.pins.findIndex(p => String(p.id) === String(activeSelectedId));
    if (pIdx !== -1) {
      currentParams.pins.splice(pIdx, 1);
      activeSelectedId = null;
      return true;
    }
  }

  return false;
}

function resetAllOverlays(currentParams) {
  currentParams._overlays = [];
  activeSelectedId = null;
}


// Module Exports
__exports['escSvg'] = escSvg;
__exports['getSelectedOverlayId'] = getSelectedOverlayId;
__exports['setSelectedOverlayId'] = setSelectedOverlayId;
__exports['renderKaTeXSvg'] = renderKaTeXSvg;
__exports['renderCircuitSymbolSvg'] = renderCircuitSymbolSvg;
__exports['renderArrowSvg'] = renderArrowSvg;
__exports['renderPinSvg'] = renderPinSvg;
__exports['renderTextAnnotationSvg'] = renderTextAnnotationSvg;
__exports['injectOverlaysIntoSvg'] = injectOverlaysIntoSvg;
__exports['setupStageInteractions'] = setupStageInteractions;
__exports['addOverlayItem'] = addOverlayItem;
__exports['deleteSelectedOverlayItem'] = deleteSelectedOverlayItem;
__exports['resetAllOverlays'] = resetAllOverlays;

});

__define('modules/science/mapData.js', function(__exports, __require, __module) {
/**
 * Egemen's Testmaker — Otantik Vektörel Coğrafya Harita Veritabanı
 * Gerçek GIS ve Wikimedia Commons harita projeksiyonlarından derlenmiş dilsiz harita verileri.
 */

const TURKEY_VECTOR_PATH = "M 365.6,15.4 L 362.8,15.8 L 362.4,17.9 L 358.6,22.1 L 354.3,23.3 L 348.1,22.9 L 346.1,21.8 L 343.1,22.0 L 338.5,22.9 L 335.2,22.3 L 328.8,21.4 L 320.0,21.6 L 304.9,19.5 L 300.6,19.8 L 288.4,24.5 L 287.5,26.1 L 283.5,27.6 L 276.4,28.8 L 273.5,29.3 L 268.8,30.8 L 267.0,32.3 L 263.3,34.4 L 260.7,35.1 L 258.0,37.5 L 254.9,41.2 L 250.7,43.4 L 245.5,45.9 L 240.3,49.3 L 235.8,52.7 L 231.1,54.5 L 228.0,56.3 L 226.4,57.2 L 226.1,59.0 L 226.4,61.9 L 225.5,63.9 L 223.1,66.8 L 219.0,67.6 L 211.9,69.4 L 203.4,69.0 L 199.2,66.7 L 194.6,65.9 L 188.6,64.2 L 183.8,62.2 L 182.5,62.3 L 181.8,63.4 L 180.4,64.6 L 178.6,66.0 L 171.7,65.7 L 167.2,66.0 L 164.4,64.9 L 160.8,64.5 L 157.7,63.9 L 156.1,64.3 L 150.1,62.3 L 148.4,62.3 L 145.5,61.4 L 142.5,61.5 L 139.8,61.7 L 139.0,60.6 L 137.4,60.0 L 134.9,60.1 L 130.8,59.0 L 123.8,55.2 L 120.6,54.4 L 105.0,45.3 L 102.3,42.2 L 100.4,39.6 L 100.8,38.2 L 98.8,35.8 L 98.5,34.4 L 95.6,29.3 L 96.4,27.5 L 98.1,27.9 L 98.7,27.5 L 98.6,25.6 L 98.2,23.5 L 97.8,22.0 L 96.4,22.3 L 95.3,21.8 L 92.7,22.4 L 91.2,21.2 L 90.0,21.5 L 89.3,21.8 L 89.6,22.9 L 89.7,23.9 L 87.7,23.5 L 85.7,22.5 L 84.0,22.7 L 81.6,23.9 L 79.9,24.9 L 79.4,26.2 L 77.2,23.4 L 76.2,23.7 L 74.6,22.4 L 72.9,20.7 L 71.5,18.1 L 70.6,17.9 L 69.1,16.2 L 67.1,15.9 L 66.2,16.2 L 65.6,16.9 L 65.5,17.8 L 62.4,17.4 L 60.5,16.4 L 58.9,16.9 L 58.6,17.9 L 57.8,19.1 L 57.1,19.3 L 56.0,21.1 L 53.8,21.8 L 52.3,21.4 L 51.8,22.6 L 50.0,21.8 L 48.3,22.9 L 45.1,22.8 L 43.2,22.4 L 41.0,25.1 L 41.6,26.0 L 41.3,27.4 L 41.5,28.0 L 40.9,28.2 L 40.0,30.5 L 33.5,30.6 L 31.7,34.7 L 33.0,36.5 L 33.3,36.5 L 33.6,36.7 L 33.7,37.2 L 34.7,37.7 L 35.9,38.1 L 36.2,37.7 L 36.7,38.4 L 37.3,38.7 L 38.2,38.5 L 38.2,39.1 L 37.9,39.2 L 38.0,39.5 L 39.6,41.3 L 41.0,41.8 L 42.0,41.9 L 42.3,43.3 L 41.8,43.9 L 42.1,44.2 L 42.0,44.7 L 42.2,45.2 L 41.9,46.2 L 42.5,47.6 L 42.5,48.2 L 42.2,48.7 L 42.8,49.6 L 42.8,51.7 L 43.4,51.9 L 43.5,52.8 L 43.6,54.5 L 43.3,56.0 L 41.8,57.3 L 39.7,56.1 L 39.2,56.3 L 38.8,56.7 L 38.4,57.0 L 37.9,57.8 L 37.2,58.3 L 36.8,59.2 L 36.0,59.5 L 34.7,60.8 L 33.1,60.8 L 32.3,60.6 L 31.6,60.9 L 31.5,61.9 L 32.0,62.5 L 31.6,64.2 L 31.1,64.6 L 32.1,66.4 L 31.6,67.1 L 31.1,68.1 L 31.9,68.5 L 31.4,69.8 L 32.0,71.9 L 33.2,72.9 L 32.7,74.7 L 31.9,74.6 L 32.0,75.4 L 33.0,77.0 L 31.9,77.1 L 30.8,78.0 L 30.3,77.8 L 30.7,79.3 L 30.1,79.7 L 29.3,78.7 L 28.8,80.2 L 28.3,80.2 L 28.0,80.3 L 27.9,80.1 L 28.1,80.1 L 28.0,79.9 L 27.8,79.9 L 27.7,80.2 L 27.8,81.2 L 27.2,81.2 L 27.2,81.5 L 27.5,81.6 L 27.4,81.9 L 27.1,81.8 L 27.2,82.3 L 27.5,82.2 L 27.6,82.5 L 27.5,82.6 L 27.3,82.7 L 27.3,83.0 L 27.2,83.3 L 27.0,83.0 L 26.9,83.2 L 27.1,83.6 L 26.9,83.6 L 26.7,83.3 L 26.4,83.6 L 26.1,83.6 L 26.0,83.8 L 25.7,84.0 L 25.5,84.4 L 25.3,84.2 L 24.7,85.1 L 24.6,85.4 L 24.3,85.8 L 24.1,86.2 L 24.2,87.0 L 24.0,87.8 L 22.6,88.1 L 22.1,88.6 L 21.5,88.4 L 20.5,88.4 L 19.9,88.8 L 20.1,91.6 L 21.0,94.6 L 23.8,96.4 L 28.1,96.7 L 33.8,96.5 L 38.1,96.8 L 40.7,95.8 L 44.7,94.8 L 48.6,95.1 L 49.8,94.0 L 50.7,96.0 L 47.6,97.0 L 46.1,99.0 L 43.1,99.3 L 37.4,102.3 L 33.5,105.5 L 27.5,108.8 L 26.9,110.0 L 27.8,111.0 L 27.6,111.9 L 29.1,113.5 L 29.4,115.0 L 28.0,118.6 L 25.2,123.4 L 25.4,125.0 L 26.4,125.2 L 27.7,124.8 L 29.8,123.4 L 31.5,122.0 L 32.6,120.9 L 34.0,119.8 L 33.9,119.0 L 33.7,117.7 L 33.7,116.8 L 35.6,115.8 L 37.7,114.3 L 39.1,112.4 L 41.5,110.9 L 42.4,110.0 L 43.7,108.3 L 44.1,106.7 L 45.0,106.0 L 46.4,104.8 L 46.6,103.6 L 49.2,102.1 L 53.4,100.1 L 57.8,98.2 L 59.9,96.0 L 63.1,95.2 L 65.6,93.8 L 68.6,91.7 L 70.6,89.4 L 71.1,87.1 L 76.0,82.4 L 76.2,80.3 L 76.9,77.7 L 78.4,76.2 L 82.5,75.0 L 86.1,74.4 L 89.1,74.7 L 90.3,76.3 L 93.1,76.8 L 94.7,76.8 L 95.6,76.0 L 96.3,74.2 L 97.6,72.8 L 101.1,71.6 L 103.6,71.6 L 107.4,71.6 L 113.2,73.5 L 116.3,75.6 L 117.8,75.2 L 119.1,76.4 L 120.6,76.8 L 123.3,76.7 L 125.5,76.1 L 127.6,77.2 L 128.9,76.5 L 130.2,76.4 L 131.4,75.4 L 133.8,74.5 L 134.8,75.7 L 137.0,77.1 L 138.4,77.9 L 139.4,79.9 L 137.7,79.2 L 137.2,78.2 L 135.7,78.2 L 135.8,79.7 L 135.9,80.9 L 138.1,81.8 L 138.0,83.6 L 138.9,84.2 L 139.6,83.4 L 140.7,82.6 L 140.8,81.1 L 143.0,81.5 L 143.6,83.0 L 143.7,84.9 L 145.0,85.2 L 146.6,84.9 L 147.2,86.5 L 148.0,87.8 L 150.1,87.6 L 153.3,86.5 L 154.6,86.9 L 156.5,87.2 L 159.0,87.0 L 162.4,86.9 L 163.1,88.3 L 160.4,88.7 L 155.9,89.6 L 155.4,87.4 L 153.0,87.8 L 150.7,89.7 L 150.0,88.9 L 148.6,89.5 L 146.1,90.6 L 143.0,90.7 L 139.2,91.4 L 133.6,91.9 L 131.9,94.2 L 127.1,95.9 L 125.5,97.8 L 125.7,99.7 L 128.0,100.8 L 129.2,101.9 L 133.0,103.5 L 136.8,102.8 L 138.5,104.1 L 137.2,105.1 L 136.4,106.9 L 133.7,107.3 L 131.8,106.9 L 127.9,105.3 L 123.2,105.6 L 120.0,106.8 L 115.8,105.4 L 110.8,105.4 L 105.2,105.3 L 99.5,106.0 L 94.6,107.4 L 93.3,106.4 L 93.9,105.9 L 95.9,104.9 L 97.1,104.2 L 97.8,103.1 L 98.3,103.3 L 99.6,103.6 L 100.2,103.0 L 100.5,102.0 L 100.0,101.7 L 99.1,102.0 L 98.1,102.3 L 98.2,101.6 L 97.4,100.7 L 94.5,99.7 L 91.4,99.1 L 87.3,98.7 L 84.7,98.9 L 84.3,99.5 L 83.7,100.4 L 83.9,102.0 L 84.4,102.6 L 85.3,103.2 L 86.2,103.7 L 86.1,104.7 L 87.5,105.8 L 87.9,106.7 L 87.4,107.5 L 88.0,107.5 L 88.7,107.0 L 89.2,106.3 L 90.5,107.0 L 91.2,107.4 L 89.2,108.5 L 87.3,110.2 L 86.4,110.3 L 84.6,110.0 L 83.6,110.4 L 82.8,110.0 L 81.6,109.5 L 80.2,110.1 L 78.5,110.9 L 75.7,110.2 L 72.8,108.7 L 69.8,106.7 L 69.9,105.9 L 71.0,105.6 L 70.6,104.6 L 70.4,103.6 L 69.4,102.7 L 69.1,101.7 L 68.5,101.7 L 67.6,102.3 L 66.7,102.9 L 65.2,103.6 L 64.0,102.8 L 63.3,102.5 L 62.2,102.8 L 61.2,103.3 L 60.2,103.8 L 59.7,104.7 L 59.0,105.1 L 59.0,105.8 L 58.1,106.2 L 56.3,106.4 L 55.1,105.8 L 54.3,105.4 L 53.5,105.7 L 52.6,105.6 L 51.2,105.8 L 50.2,105.5 L 49.1,105.4 L 48.0,105.4 L 46.8,106.2 L 46.0,106.5 L 46.1,107.1 L 45.7,107.3 L 45.5,108.0 L 45.2,108.5 L 43.9,109.5 L 43.1,110.8 L 42.4,111.8 L 41.4,111.8 L 40.4,112.7 L 39.9,114.1 L 38.5,115.7 L 37.2,116.1 L 36.1,116.5 L 35.5,116.3 L 34.8,116.3 L 34.3,116.7 L 34.5,117.1 L 34.4,117.9 L 34.6,118.7 L 34.2,119.0 L 34.3,119.7 L 34.5,120.7 L 34.1,121.1 L 33.4,121.2 L 32.9,121.7 L 32.8,122.7 L 32.4,123.8 L 31.7,125.2 L 29.1,125.9 L 25.6,126.2 L 24.2,129.3 L 24.2,133.1 L 23.3,136.7 L 22.8,134.9 L 20.6,134.0 L 17.8,134.4 L 17.1,136.3 L 18.2,138.1 L 20.8,139.4 L 23.3,138.5 L 23.7,142.1 L 23.7,145.8 L 21.7,148.3 L 21.3,153.2 L 20.8,155.8 L 23.4,157.0 L 30.6,154.8 L 33.1,155.1 L 34.0,154.4 L 36.7,153.0 L 43.5,151.3 L 45.7,150.9 L 47.9,150.5 L 49.6,150.3 L 50.8,151.1 L 52.5,150.7 L 53.1,149.8 L 53.9,149.4 L 55.2,150.3 L 55.1,151.3 L 54.5,153.7 L 53.6,154.4 L 52.2,154.3 L 51.7,155.4 L 51.4,156.6 L 50.7,156.4 L 49.7,156.8 L 49.4,157.9 L 49.8,158.9 L 49.0,159.5 L 48.4,159.8 L 48.1,160.5 L 47.5,160.7 L 47.6,159.9 L 47.2,159.7 L 46.7,159.4 L 46.8,158.7 L 46.9,158.0 L 46.3,158.1 L 46.1,158.8 L 46.2,159.5 L 45.7,160.1 L 45.9,161.0 L 45.3,160.8 L 44.9,160.5 L 45.3,159.5 L 44.9,159.0 L 44.0,158.8 L 43.0,158.8 L 42.1,158.5 L 41.1,159.0 L 40.9,159.9 L 41.4,160.2 L 41.6,161.0 L 41.2,161.5 L 40.1,161.9 L 39.6,162.5 L 39.3,163.1 L 39.7,163.3 L 40.6,162.8 L 41.8,162.6 L 42.9,162.8 L 43.0,163.7 L 41.9,163.4 L 41.6,164.2 L 41.2,165.2 L 41.6,165.6 L 42.2,165.7 L 43.5,166.2 L 45.3,166.4 L 46.7,167.1 L 46.7,167.8 L 46.8,168.7 L 48.3,171.3 L 49.7,172.1 L 51.6,174.0 L 52.7,176.0 L 50.5,177.0 L 49.2,178.2 L 48.6,179.3 L 49.0,180.6 L 49.5,182.5 L 49.7,184.2 L 50.8,185.3 L 51.7,185.3 L 53.1,184.8 L 54.2,184.0 L 54.9,184.4 L 55.6,184.3 L 56.3,184.4 L 57.9,185.0 L 58.7,185.5 L 58.3,186.4 L 57.1,187.2 L 56.2,188.0 L 55.5,188.5 L 54.1,189.0 L 53.1,188.9 L 53.2,189.8 L 54.2,191.6 L 53.8,192.3 L 53.3,193.4 L 52.5,192.6 L 51.8,192.7 L 51.7,192.3 L 50.9,192.2 L 49.7,193.0 L 48.5,193.0 L 47.5,193.3 L 46.2,194.4 L 45.9,195.5 L 46.3,196.5 L 46.4,197.4 L 46.8,197.9 L 46.6,198.4 L 46.9,198.7 L 47.8,200.3 L 48.8,200.7 L 50.0,201.8 L 50.8,202.9 L 50.3,204.1 L 51.3,205.6 L 52.5,206.3 L 53.5,207.2 L 53.7,208.7 L 55.0,209.4 L 55.0,210.1 L 55.5,210.6 L 56.8,210.3 L 57.1,209.7 L 58.3,209.5 L 58.8,209.6 L 59.0,209.2 L 60.3,209.1 L 61.4,209.6 L 62.5,209.4 L 62.3,210.2 L 61.3,211.5 L 60.6,210.8 L 59.1,210.5 L 58.1,210.6 L 57.0,211.3 L 55.1,212.0 L 53.3,212.4 L 51.1,213.1 L 50.0,213.3 L 50.2,211.9 L 50.2,210.8 L 49.5,210.3 L 49.3,209.6 L 49.0,208.8 L 48.4,208.5 L 48.4,207.6 L 48.0,206.6 L 47.9,205.6 L 47.5,204.4 L 46.4,203.5 L 45.7,203.7 L 45.5,204.8 L 45.7,206.5 L 45.6,207.7 L 46.4,208.1 L 46.8,209.1 L 46.1,209.6 L 45.2,210.6 L 45.0,211.9 L 44.5,213.3 L 43.9,212.3 L 43.6,211.1 L 42.7,210.2 L 42.9,209.0 L 44.2,208.6 L 44.3,207.6 L 43.8,204.7 L 42.4,203.9 L 41.6,202.3 L 41.0,200.8 L 40.1,199.3 L 39.9,198.0 L 39.4,197.4 L 38.5,197.4 L 37.7,196.8 L 36.7,196.9 L 35.3,196.5 L 34.3,197.2 L 32.7,197.8 L 32.6,199.4 L 32.4,202.0 L 33.1,204.1 L 33.4,205.3 L 33.9,206.1 L 34.5,207.4 L 33.9,208.4 L 33.5,209.3 L 33.3,208.5 L 32.3,208.7 L 31.4,209.3 L 31.3,209.9 L 30.7,210.3 L 30.9,210.9 L 31.3,211.3 L 32.5,211.0 L 33.5,210.8 L 34.4,211.0 L 34.9,209.8 L 35.7,208.4 L 36.5,208.9 L 38.4,210.1 L 38.1,210.7 L 37.4,209.9 L 36.5,210.0 L 36.3,210.8 L 36.4,211.3 L 36.0,211.6 L 35.4,212.0 L 35.5,212.7 L 36.3,212.9 L 36.1,213.5 L 35.6,214.1 L 34.7,214.4 L 34.1,214.1 L 33.7,214.9 L 33.4,215.9 L 33.0,215.2 L 32.3,214.9 L 32.1,214.1 L 31.7,213.1 L 31.4,212.5 L 30.6,213.0 L 30.1,212.2 L 29.5,212.2 L 29.6,212.9 L 29.5,214.3 L 29.9,215.2 L 29.7,215.7 L 29.8,216.9 L 29.0,217.2 L 28.1,216.8 L 27.8,217.5 L 28.0,219.2 L 28.8,219.3 L 30.2,219.7 L 30.9,221.0 L 32.1,221.3 L 33.9,221.2 L 34.9,222.2 L 35.9,223.6 L 36.5,223.6 L 36.5,223.1 L 37.2,223.6 L 38.5,224.3 L 39.2,226.4 L 41.0,227.1 L 41.6,227.8 L 42.4,228.0 L 43.2,227.5 L 43.4,226.2 L 43.9,225.2 L 43.9,223.7 L 44.1,222.6 L 45.8,222.5 L 47.2,222.5 L 48.1,221.8 L 48.6,223.0 L 48.7,224.3 L 49.3,225.0 L 50.4,225.1 L 50.6,226.2 L 51.4,227.2 L 51.3,228.6 L 51.5,229.8 L 52.1,231.1 L 52.6,231.7 L 53.2,232.2 L 53.6,231.9 L 53.5,231.1 L 53.6,230.4 L 55.1,229.6 L 56.7,229.4 L 58.0,230.4 L 59.6,230.8 L 60.0,232.0 L 60.7,232.6 L 61.5,232.9 L 62.6,234.0 L 63.8,234.3 L 65.5,233.8 L 66.9,234.3 L 67.8,236.2 L 67.5,236.9 L 67.4,238.2 L 67.2,239.4 L 66.7,240.2 L 66.6,241.3 L 66.7,242.4 L 67.6,242.9 L 67.6,244.3 L 66.6,247.0 L 65.5,247.8 L 63.7,248.6 L 61.8,249.2 L 59.6,249.3 L 58.6,249.1 L 58.2,249.1 L 58.0,249.6 L 57.6,250.3 L 57.5,251.2 L 57.7,251.8 L 58.5,252.0 L 59.8,252.3 L 61.5,252.7 L 62.4,253.8 L 63.7,255.8 L 63.4,257.0 L 64.4,258.0 L 64.2,259.1 L 64.4,261.0 L 65.3,261.3 L 65.2,260.5 L 65.7,260.5 L 65.7,262.3 L 65.8,264.0 L 65.5,264.5 L 65.5,265.3 L 64.7,266.5 L 64.7,267.3 L 65.9,268.0 L 67.0,268.4 L 68.1,268.5 L 68.3,267.9 L 69.1,267.9 L 69.8,268.4 L 70.1,269.2 L 70.6,269.0 L 70.9,267.9 L 70.8,266.9 L 71.4,266.8 L 72.1,265.7 L 72.6,264.9 L 73.4,265.5 L 72.0,266.9 L 72.1,268.1 L 72.7,269.2 L 73.4,270.0 L 74.4,270.3 L 75.8,269.4 L 76.3,269.6 L 74.8,272.0 L 75.0,272.7 L 75.3,273.0 L 77.1,272.3 L 76.5,273.5 L 76.9,274.2 L 78.2,274.0 L 78.3,273.6 L 79.3,273.4 L 79.6,272.8 L 79.6,271.9 L 80.7,272.0 L 80.2,273.1 L 79.4,274.2 L 78.6,275.0 L 77.4,275.3 L 77.5,275.9 L 78.0,276.4 L 77.7,276.8 L 76.8,276.9 L 76.4,277.5 L 76.0,278.6 L 75.6,279.4 L 75.6,279.9 L 76.2,279.7 L 76.7,278.9 L 77.3,278.6 L 78.1,278.9 L 77.5,279.4 L 76.2,280.3 L 75.8,281.1 L 75.5,280.5 L 75.1,279.8 L 74.6,278.9 L 74.0,278.6 L 73.3,278.4 L 73.0,277.7 L 72.3,277.0 L 72.0,276.4 L 71.3,276.1 L 70.9,276.7 L 71.4,277.1 L 71.2,277.7 L 70.9,277.5 L 70.3,277.2 L 69.9,277.5 L 70.0,278.0 L 69.5,278.7 L 69.0,279.0 L 68.7,278.4 L 68.4,277.9 L 67.8,278.3 L 67.2,278.8 L 67.3,279.9 L 67.6,280.2 L 68.2,280.1 L 67.6,280.7 L 67.1,280.8 L 66.5,281.0 L 66.5,281.4 L 66.5,282.0 L 66.2,282.6 L 66.4,283.4 L 66.6,284.1 L 67.0,284.7 L 67.3,285.4 L 67.4,286.4 L 67.1,287.3 L 67.9,288.2 L 69.4,288.9 L 70.0,288.7 L 70.1,287.7 L 70.7,286.7 L 71.3,286.0 L 71.6,286.3 L 72.5,286.9 L 72.8,286.3 L 72.9,285.2 L 74.2,285.5 L 73.5,286.4 L 74.1,287.1 L 75.1,288.1 L 76.2,288.4 L 77.0,287.8 L 77.4,287.1 L 78.4,287.3 L 80.2,288.0 L 81.2,288.0 L 81.5,287.4 L 83.3,287.3 L 83.6,286.5 L 85.8,286.7 L 88.2,286.8 L 89.4,286.0 L 93.2,285.3 L 95.0,285.3 L 96.4,285.1 L 99.1,285.6 L 100.6,285.7 L 101.3,284.8 L 103.9,284.5 L 107.1,283.9 L 108.2,284.1 L 106.0,284.9 L 104.3,285.5 L 103.7,286.0 L 103.3,286.7 L 103.5,287.2 L 103.2,287.8 L 102.5,288.2 L 101.4,288.7 L 100.9,288.7 L 99.4,288.4 L 97.6,288.9 L 96.8,289.5 L 96.3,290.4 L 96.6,291.2 L 97.0,292.0 L 96.2,292.7 L 96.1,294.2 L 96.2,294.8 L 96.9,295.4 L 98.0,295.4 L 97.7,296.0 L 96.6,296.2 L 95.6,295.9 L 94.5,295.9 L 93.2,295.8 L 92.2,295.5 L 90.6,295.5 L 89.3,295.4 L 87.9,295.8 L 87.2,296.5 L 84.5,296.5 L 84.3,296.1 L 83.1,295.6 L 82.3,295.5 L 81.4,296.3 L 81.2,297.3 L 81.0,297.9 L 79.8,297.7 L 79.0,298.2 L 77.1,298.6 L 76.2,298.3 L 75.8,297.6 L 75.2,297.6 L 75.1,298.5 L 74.5,298.9 L 73.5,299.2 L 73.0,299.5 L 73.5,300.3 L 73.0,301.0 L 72.3,300.8 L 71.3,301.0 L 71.2,302.0 L 71.4,303.0 L 72.6,303.4 L 72.8,304.0 L 74.0,304.0 L 75.3,304.5 L 76.0,305.0 L 76.9,304.6 L 77.8,304.3 L 78.3,304.0 L 79.5,303.6 L 80.8,303.5 L 82.7,304.2 L 84.1,304.5 L 84.0,304.0 L 84.0,302.9 L 84.4,302.1 L 84.9,301.1 L 85.0,299.9 L 86.0,298.9 L 86.7,299.3 L 87.3,299.4 L 88.8,299.2 L 89.4,299.4 L 90.0,299.9 L 91.7,299.9 L 93.0,300.1 L 94.0,299.8 L 95.1,299.4 L 96.3,299.1 L 97.9,298.8 L 99.0,298.9 L 99.0,299.6 L 98.2,299.5 L 97.3,299.9 L 95.9,300.2 L 95.6,300.8 L 95.1,301.3 L 94.5,302.6 L 94.4,303.5 L 95.5,303.6 L 96.8,303.9 L 97.2,304.5 L 97.9,305.1 L 97.6,305.6 L 97.7,306.3 L 96.9,306.3 L 95.9,306.1 L 95.0,306.2 L 94.1,306.8 L 94.6,307.5 L 94.3,307.9 L 94.9,309.0 L 95.1,309.9 L 96.0,309.4 L 96.8,309.5 L 97.6,309.8 L 98.2,309.1 L 98.9,307.9 L 99.0,308.2 L 99.7,308.2 L 100.5,307.7 L 101.1,307.7 L 101.4,307.0 L 101.5,306.2 L 102.1,305.1 L 103.0,303.3 L 104.0,303.1 L 105.0,302.7 L 105.2,302.2 L 106.1,301.6 L 106.5,300.8 L 107.4,301.0 L 108.0,300.1 L 107.9,299.2 L 107.0,298.9 L 106.9,298.3 L 106.5,297.7 L 106.4,296.9 L 106.7,297.3 L 107.6,297.2 L 108.6,297.0 L 108.5,296.4 L 109.6,296.9 L 110.6,297.6 L 111.6,297.6 L 112.1,297.1 L 112.6,296.2 L 113.0,294.7 L 113.2,295.3 L 113.7,296.2 L 114.6,296.2 L 114.8,296.9 L 115.6,297.4 L 116.7,297.6 L 117.5,297.0 L 117.3,296.3 L 117.8,296.0 L 118.5,296.2 L 118.6,296.8 L 119.3,296.9 L 119.6,297.4 L 119.3,298.3 L 119.6,299.1 L 119.3,299.6 L 119.3,300.3 L 119.5,301.0 L 119.9,302.0 L 120.7,302.0 L 121.3,301.6 L 121.6,302.4 L 122.4,302.6 L 123.1,302.3 L 124.1,301.9 L 126.1,302.9 L 126.2,303.6 L 126.6,304.7 L 127.5,304.6 L 127.8,305.3 L 127.2,306.3 L 128.1,307.4 L 128.7,308.1 L 129.6,307.6 L 130.1,307.2 L 130.2,306.5 L 131.1,305.2 L 131.9,304.1 L 132.8,303.3 L 132.2,302.6 L 132.6,302.2 L 132.8,301.0 L 133.7,301.3 L 134.4,302.0 L 134.6,302.4 L 135.5,302.4 L 135.5,302.9 L 135.3,303.6 L 136.0,304.3 L 136.5,304.5 L 136.9,304.3 L 137.0,304.7 L 137.1,305.5 L 136.6,305.7 L 136.0,305.7 L 135.6,306.4 L 134.9,307.7 L 135.4,308.5 L 135.8,309.2 L 134.5,310.0 L 135.0,310.5 L 136.3,310.7 L 137.2,310.6 L 137.6,309.9 L 138.3,310.2 L 138.9,310.4 L 138.9,311.3 L 138.6,312.6 L 138.2,313.5 L 138.4,314.0 L 138.7,314.7 L 139.1,315.8 L 138.9,316.5 L 138.4,317.1 L 138.1,318.3 L 138.7,319.0 L 139.4,319.4 L 139.6,319.8 L 140.5,320.6 L 141.1,321.1 L 142.1,321.7 L 143.2,322.0 L 145.7,324.8 L 146.4,326.0 L 147.5,326.3 L 148.4,327.0 L 147.8,327.4 L 147.9,327.9 L 148.1,327.9 L 148.7,327.6 L 149.1,327.2 L 149.2,326.9 L 148.9,326.5 L 149.2,326.0 L 149.2,325.2 L 149.7,325.3 L 150.2,325.4 L 150.0,325.8 L 149.9,326.4 L 150.4,327.2 L 150.8,326.9 L 151.6,326.9 L 151.6,327.2 L 151.2,327.8 L 151.2,328.3 L 151.5,328.4 L 151.5,328.3 L 151.8,327.9 L 152.3,327.5 L 152.9,327.8 L 154.0,327.9 L 155.5,327.9 L 156.1,328.1 L 156.8,328.4 L 156.9,328.8 L 157.1,329.2 L 157.6,329.2 L 158.3,329.1 L 158.5,328.6 L 159.0,328.5 L 159.4,328.9 L 158.9,329.2 L 158.5,329.9 L 158.3,330.2 L 158.4,331.0 L 159.1,331.1 L 159.1,331.8 L 159.7,332.2 L 160.3,332.1 L 160.9,332.3 L 161.7,331.7 L 162.4,331.0 L 163.2,331.1 L 162.6,332.4 L 163.0,332.6 L 163.9,332.4 L 165.0,331.8 L 166.6,330.5 L 167.7,330.6 L 168.8,330.1 L 169.9,329.2 L 170.2,328.4 L 169.8,327.9 L 169.9,327.2 L 170.6,327.4 L 171.5,327.7 L 172.9,327.7 L 173.2,327.1 L 174.8,326.0 L 175.8,325.7 L 176.9,326.0 L 177.6,326.1 L 178.2,325.5 L 179.2,324.7 L 179.3,323.3 L 180.1,322.7 L 183.8,322.4 L 185.8,324.2 L 187.0,324.8 L 188.2,324.9 L 188.1,325.8 L 188.0,327.6 L 188.4,329.6 L 188.8,330.1 L 189.1,329.6 L 189.1,328.4 L 189.5,327.6 L 190.3,326.6 L 190.7,326.0 L 191.4,327.0 L 191.8,326.7 L 191.7,326.1 L 191.3,325.3 L 192.2,323.9 L 192.3,323.2 L 192.4,322.3 L 193.7,321.8 L 193.8,321.1 L 193.6,320.3 L 193.0,320.0 L 192.7,319.0 L 192.2,318.3 L 192.2,316.9 L 193.1,315.7 L 193.7,314.8 L 194.5,314.9 L 194.6,314.4 L 194.3,314.1 L 193.6,314.2 L 193.5,313.7 L 194.4,311.7 L 195.4,310.9 L 195.4,310.0 L 196.3,308.0 L 196.2,306.7 L 195.5,306.8 L 195.1,306.4 L 195.2,304.2 L 195.6,301.5 L 195.2,300.3 L 196.0,296.7 L 196.5,295.7 L 197.2,294.6 L 198.3,293.4 L 199.4,292.4 L 199.9,292.9 L 201.2,294.0 L 202.4,294.5 L 203.2,294.3 L 204.1,294.4 L 210.7,293.9 L 212.9,294.2 L 215.5,294.9 L 218.4,295.4 L 224.1,296.4 L 225.6,297.4 L 225.6,298.0 L 226.4,298.8 L 227.4,299.1 L 232.2,301.1 L 234.0,302.5 L 236.0,304.1 L 236.8,305.0 L 237.8,305.0 L 239.7,305.4 L 240.5,306.6 L 241.2,307.2 L 242.3,307.8 L 243.4,307.8 L 245.4,308.6 L 246.8,309.4 L 248.2,309.6 L 248.9,310.0 L 249.3,311.0 L 250.0,311.1 L 250.6,310.6 L 253.6,313.5 L 254.5,315.0 L 255.2,315.9 L 256.8,318.3 L 258.3,321.6 L 259.8,323.3 L 260.2,324.4 L 260.6,326.0 L 261.5,326.9 L 262.9,327.7 L 264.6,330.3 L 266.2,331.5 L 268.8,333.3 L 270.5,334.1 L 271.7,334.1 L 274.3,336.0 L 275.8,337.0 L 279.7,337.7 L 280.9,338.4 L 281.6,337.3 L 282.3,337.0 L 283.2,336.1 L 284.5,335.0 L 285.4,334.6 L 286.2,334.3 L 286.9,333.8 L 289.4,334.3 L 290.4,334.3 L 291.0,334.9 L 291.4,335.4 L 292.0,335.0 L 292.5,334.0 L 293.5,332.2 L 294.6,332.0 L 296.0,332.4 L 298.6,332.3 L 300.2,332.1 L 301.1,331.7 L 302.2,332.0 L 303.1,331.8 L 303.5,332.6 L 304.9,331.8 L 306.1,331.0 L 307.2,331.2 L 308.5,331.8 L 308.6,332.8 L 310.0,332.6 L 310.6,331.8 L 311.0,330.9 L 311.6,329.6 L 312.6,329.3 L 313.5,329.3 L 313.7,330.4 L 313.9,331.1 L 314.5,332.0 L 315.2,332.2 L 315.6,330.8 L 315.6,329.9 L 316.3,329.2 L 317.4,328.2 L 317.2,329.0 L 317.6,329.6 L 318.3,329.7 L 318.7,329.1 L 318.7,328.2 L 318.0,327.7 L 319.4,326.8 L 319.9,325.9 L 321.2,324.5 L 321.2,323.9 L 322.1,322.7 L 323.4,322.9 L 324.5,324.6 L 324.4,325.8 L 324.9,326.8 L 325.7,326.7 L 326.2,325.4 L 327.8,323.5 L 328.5,323.8 L 329.5,323.1 L 330.3,321.7 L 330.2,319.9 L 330.5,317.3 L 331.7,316.4 L 332.1,315.4 L 333.4,314.7 L 333.8,314.1 L 334.3,313.0 L 335.9,311.2 L 336.3,310.6 L 337.0,309.2 L 338.5,307.7 L 339.6,307.1 L 339.9,306.3 L 343.5,304.3 L 344.2,303.6 L 345.2,302.1 L 347.1,300.5 L 348.2,300.0 L 348.3,299.0 L 349.0,298.4 L 350.7,297.6 L 351.8,297.5 L 351.8,296.8 L 353.7,296.5 L 356.6,296.2 L 360.4,298.5 L 361.3,300.2 L 361.6,300.8 L 363.2,300.8 L 365.3,301.5 L 377.7,309.6 L 377.9,310.4 L 378.4,310.6 L 379.7,309.9 L 380.8,309.5 L 381.3,308.8 L 381.5,308.0 L 384.1,308.2 L 386.3,309.1 L 387.3,309.4 L 387.9,308.0 L 389.1,307.6 L 390.1,306.4 L 390.1,304.4 L 390.5,303.5 L 393.0,301.8 L 393.4,300.5 L 393.2,300.4 L 392.8,301.0 L 391.8,301.0 L 390.2,301.4 L 389.4,301.0 L 390.4,299.5 L 391.5,298.8 L 392.7,298.9 L 394.3,298.7 L 395.8,298.9 L 396.8,298.0 L 398.0,297.2 L 399.7,295.5 L 400.5,294.1 L 401.6,293.7 L 401.4,292.9 L 404.2,290.1 L 405.5,290.7 L 408.2,292.5 L 409.5,294.1 L 410.9,297.2 L 411.5,297.8 L 411.0,298.6 L 410.8,300.1 L 410.9,301.2 L 411.1,302.7 L 411.8,304.6 L 411.1,305.3 L 411.2,307.0 L 410.4,306.9 L 409.2,307.3 L 405.2,310.0 L 404.7,311.3 L 403.9,312.0 L 402.8,313.3 L 400.2,314.8 L 399.5,316.4 L 398.4,317.4 L 398.2,318.9 L 396.7,319.2 L 396.4,320.4 L 395.5,321.0 L 395.1,322.0 L 395.3,323.3 L 398.0,327.9 L 399.7,331.3 L 400.9,333.5 L 402.8,338.3 L 402.3,338.8 L 401.9,339.5 L 401.1,340.2 L 400.6,341.2 L 400.7,342.4 L 401.0,342.9 L 402.7,342.3 L 403.8,341.9 L 404.4,342.5 L 404.2,343.9 L 403.8,344.9 L 406.1,345.3 L 407.9,346.2 L 408.8,346.9 L 409.4,348.6 L 410.0,348.9 L 410.5,347.2 L 410.6,344.3 L 410.7,342.2 L 412.2,341.3 L 413.8,340.7 L 414.8,341.8 L 415.3,340.8 L 414.9,339.6 L 415.1,338.3 L 416.3,339.2 L 417.2,339.2 L 418.5,338.2 L 418.4,337.3 L 418.7,336.3 L 418.4,335.0 L 418.8,334.6 L 418.4,333.6 L 418.7,333.8 L 418.7,333.3 L 418.3,333.3 L 418.5,333.0 L 418.2,332.9 L 418.1,332.6 L 418.5,332.7 L 418.1,332.3 L 418.4,332.2 L 418.3,332.0 L 418.7,331.9 L 418.7,331.5 L 418.8,331.2 L 418.4,331.0 L 418.3,330.7 L 418.5,330.6 L 418.0,330.5 L 418.0,329.9 L 418.2,329.7 L 418.0,329.3 L 418.4,329.2 L 418.7,328.8 L 418.7,329.1 L 418.9,328.8 L 419.2,328.7 L 419.1,328.4 L 419.0,328.4 L 418.9,328.1 L 419.1,328.1 L 418.9,327.7 L 418.8,327.8 L 418.9,327.5 L 418.5,327.5 L 418.6,327.4 L 419.0,326.9 L 420.4,327.9 L 421.4,327.9 L 421.4,328.1 L 421.8,328.3 L 422.1,328.1 L 422.0,327.7 L 422.3,327.4 L 422.6,327.2 L 422.5,326.5 L 423.1,326.9 L 423.2,326.7 L 423.1,326.0 L 424.4,325.8 L 425.0,327.0 L 425.5,326.6 L 425.5,326.3 L 426.6,327.0 L 427.8,327.4 L 428.0,327.0 L 428.0,326.6 L 427.8,326.3 L 428.1,326.2 L 429.2,326.7 L 429.5,326.7 L 429.4,326.3 L 429.7,326.3 L 430.0,326.5 L 430.1,326.2 L 430.6,325.9 L 430.4,325.0 L 430.0,324.4 L 430.1,323.9 L 430.6,323.5 L 430.6,323.1 L 430.2,323.2 L 430.0,323.0 L 429.1,323.0 L 429.1,322.2 L 429.4,321.6 L 429.1,321.0 L 428.5,321.0 L 427.9,320.6 L 427.8,321.1 L 427.4,321.1 L 427.1,321.4 L 426.9,320.4 L 427.7,320.0 L 426.9,319.1 L 427.1,318.9 L 427.1,318.1 L 426.4,318.1 L 425.6,316.4 L 425.3,314.4 L 424.8,312.4 L 425.7,310.8 L 426.5,307.8 L 426.0,306.1 L 425.9,303.8 L 427.3,302.7 L 428.2,301.1 L 427.3,299.4 L 428.5,297.3 L 429.7,296.2 L 429.5,294.9 L 432.5,295.4 L 434.0,296.4 L 437.4,297.4 L 438.6,297.7 L 439.2,297.4 L 440.1,297.9 L 441.5,298.6 L 442.1,298.3 L 442.2,299.6 L 444.0,300.0 L 444.1,300.8 L 443.9,301.8 L 442.9,302.0 L 443.0,303.6 L 444.4,304.2 L 444.8,304.8 L 445.7,305.2 L 446.4,303.4 L 447.2,303.5 L 447.7,303.0 L 448.7,304.0 L 450.5,303.1 L 452.7,303.7 L 453.1,303.4 L 457.8,304.6 L 459.3,305.1 L 460.6,305.4 L 461.2,304.2 L 461.2,303.2 L 465.3,301.1 L 467.4,299.2 L 468.5,299.4 L 469.2,298.7 L 472.5,299.1 L 473.1,298.4 L 477.2,297.0 L 478.2,295.5 L 480.9,294.8 L 481.9,294.9 L 481.9,293.4 L 483.3,292.9 L 484.6,292.1 L 487.0,291.2 L 487.2,290.6 L 489.0,290.6 L 490.3,289.9 L 492.9,290.8 L 494.9,291.3 L 496.1,291.1 L 502.2,294.2 L 502.9,295.2 L 503.4,295.0 L 503.5,296.1 L 509.0,301.3 L 512.9,301.6 L 517.9,301.5 L 520.6,301.2 L 527.3,303.4 L 532.0,302.8 L 534.2,302.2 L 539.0,301.5 L 542.9,300.6 L 545.2,300.0 L 546.8,298.9 L 551.3,298.7 L 552.5,297.6 L 558.3,295.2 L 559.5,294.6 L 560.2,293.5 L 564.6,292.4 L 566.7,290.5 L 570.3,288.5 L 572.1,287.3 L 573.3,285.0 L 578.1,284.4 L 580.4,282.7 L 582.0,282.1 L 584.4,280.5 L 586.9,279.8 L 587.3,279.2 L 588.8,279.4 L 589.9,280.2 L 590.2,279.4 L 592.4,279.0 L 600.5,280.8 L 603.6,281.4 L 603.9,282.4 L 604.5,282.6 L 605.0,282.1 L 608.4,281.7 L 614.9,281.6 L 617.0,281.4 L 620.1,279.9 L 622.4,279.5 L 624.5,279.5 L 629.1,278.4 L 633.2,277.3 L 636.0,276.0 L 638.0,274.8 L 639.6,272.5 L 641.8,270.4 L 642.4,269.2 L 643.3,268.9 L 642.5,271.0 L 643.7,270.9 L 644.6,271.4 L 645.5,271.1 L 646.1,272.0 L 648.0,273.6 L 647.6,274.5 L 647.0,276.1 L 647.8,278.4 L 648.2,279.5 L 648.2,280.6 L 648.2,280.4 L 648.4,280.2 L 648.5,279.7 L 648.8,279.8 L 649.1,279.8 L 649.5,280.1 L 650.1,279.9 L 650.3,279.4 L 650.7,279.4 L 651.0,279.2 L 651.4,279.1 L 651.4,279.0 L 651.6,278.8 L 651.7,278.6 L 651.9,278.6 L 652.2,278.8 L 652.3,278.6 L 652.6,278.5 L 653.3,278.7 L 653.4,278.6 L 653.8,278.6 L 654.0,278.4 L 654.5,278.2 L 655.0,278.5 L 655.4,278.1 L 656.0,277.9 L 656.5,278.3 L 656.9,278.1 L 657.2,276.8 L 658.4,275.3 L 658.3,274.6 L 658.8,274.3 L 659.8,272.8 L 659.6,272.3 L 659.8,271.9 L 660.1,271.5 L 660.7,271.5 L 661.4,270.4 L 661.2,269.6 L 662.7,269.0 L 663.0,268.0 L 664.8,265.9 L 666.4,266.2 L 666.3,267.4 L 667.3,267.6 L 671.6,269.3 L 672.5,268.7 L 674.1,267.2 L 676.2,266.5 L 678.6,266.2 L 679.5,266.9 L 680.6,266.9 L 681.6,267.7 L 682.1,267.5 L 682.9,268.5 L 683.6,268.6 L 683.5,269.2 L 685.1,269.7 L 685.8,268.7 L 687.0,268.5 L 687.5,269.5 L 688.1,269.9 L 691.4,272.0 L 692.8,273.2 L 694.9,272.3 L 696.0,273.6 L 696.4,273.3 L 697.2,274.3 L 698.6,273.9 L 700.1,273.5 L 700.9,273.3 L 703.4,273.8 L 704.3,274.2 L 705.1,275.5 L 705.9,273.9 L 707.5,274.2 L 709.3,273.0 L 709.9,271.2 L 710.0,270.6 L 711.2,269.9 L 712.2,268.5 L 714.0,268.8 L 714.8,269.4 L 716.2,269.0 L 717.7,269.9 L 719.2,270.5 L 720.4,271.2 L 721.2,272.7 L 722.0,273.1 L 721.8,275.7 L 722.3,277.0 L 720.3,277.5 L 718.6,280.5 L 720.4,283.4 L 720.4,284.7 L 721.4,286.8 L 723.4,287.8 L 724.2,286.3 L 725.5,284.5 L 725.1,283.6 L 726.3,282.8 L 727.0,283.2 L 728.9,282.0 L 731.5,280.4 L 731.5,279.8 L 732.1,279.4 L 732.7,279.1 L 733.4,277.5 L 735.1,276.5 L 735.8,275.9 L 737.7,276.8 L 739.2,276.8 L 740.7,277.2 L 741.7,278.2 L 741.7,276.8 L 741.0,276.2 L 740.7,273.8 L 741.8,272.3 L 742.6,271.9 L 742.9,271.0 L 742.2,269.5 L 741.0,268.4 L 740.1,268.1 L 739.7,267.3 L 739.3,266.8 L 739.3,265.9 L 736.7,265.3 L 735.8,262.9 L 734.0,262.4 L 734.1,260.7 L 734.9,260.3 L 734.0,259.1 L 735.1,257.0 L 734.7,256.2 L 735.2,255.8 L 734.7,255.0 L 735.2,254.2 L 733.6,252.0 L 733.5,250.6 L 735.5,248.5 L 734.2,245.3 L 732.2,244.4 L 729.6,245.4 L 728.6,244.9 L 728.8,243.3 L 728.2,243.6 L 726.8,242.3 L 727.0,240.8 L 725.3,240.0 L 724.1,239.5 L 722.0,239.7 L 720.1,239.0 L 720.4,236.8 L 721.2,235.9 L 720.8,234.9 L 722.0,231.7 L 723.4,230.9 L 723.3,229.9 L 723.8,229.7 L 723.4,229.2 L 724.2,228.6 L 724.3,227.8 L 725.4,227.5 L 725.2,225.9 L 726.7,225.1 L 727.2,221.2 L 726.8,220.0 L 729.2,217.6 L 730.7,216.7 L 730.8,215.4 L 731.3,215.0 L 730.6,214.6 L 730.5,213.9 L 729.5,214.1 L 728.8,212.6 L 725.9,213.9 L 725.5,213.1 L 724.1,213.3 L 723.3,212.1 L 723.7,211.3 L 723.3,209.3 L 723.7,207.4 L 723.9,206.3 L 723.5,205.2 L 723.6,202.7 L 724.1,202.2 L 723.9,199.8 L 722.1,198.8 L 722.4,197.4 L 721.5,194.9 L 722.3,194.0 L 722.4,193.4 L 722.6,191.5 L 723.5,190.2 L 723.0,189.3 L 723.2,188.6 L 722.1,187.8 L 721.3,188.0 L 720.8,186.8 L 719.7,185.5 L 720.0,184.6 L 719.2,184.2 L 719.0,183.4 L 719.2,182.7 L 718.6,182.3 L 718.8,181.1 L 718.2,180.5 L 718.4,179.5 L 719.7,179.0 L 719.0,177.7 L 719.5,177.2 L 718.8,176.2 L 719.4,175.4 L 720.3,175.1 L 719.6,173.7 L 719.7,172.8 L 718.2,170.7 L 716.1,170.0 L 715.4,169.1 L 715.5,167.1 L 714.8,166.7 L 715.7,165.0 L 714.5,164.3 L 714.4,162.2 L 713.9,161.6 L 713.0,160.7 L 712.7,159.8 L 713.7,159.4 L 713.5,158.6 L 715.0,158.3 L 716.4,158.6 L 716.3,159.4 L 717.6,158.9 L 719.1,158.7 L 719.0,158.1 L 720.1,157.9 L 720.8,158.4 L 721.1,158.9 L 721.8,159.0 L 722.5,160.0 L 723.6,159.4 L 724.6,159.4 L 726.2,158.3 L 727.9,158.1 L 728.2,156.7 L 727.4,155.1 L 728.4,153.3 L 727.6,150.5 L 728.2,149.7 L 730.1,147.7 L 730.4,145.9 L 729.9,145.6 L 730.0,144.9 L 729.7,143.8 L 735.0,138.8 L 736.4,141.4 L 737.7,142.2 L 739.0,142.4 L 740.6,144.3 L 742.1,145.8 L 742.6,146.9 L 742.9,146.1 L 742.9,145.4 L 742.5,145.2 L 742.3,144.5 L 742.2,143.6 L 741.9,144.0 L 741.7,143.1 L 741.1,142.7 L 741.0,142.2 L 740.3,142.1 L 740.1,141.1 L 739.8,140.4 L 739.1,140.5 L 738.8,139.2 L 737.8,138.9 L 738.2,138.2 L 737.2,137.9 L 735.9,137.1 L 735.1,136.4 L 734.7,136.1 L 734.2,134.4 L 733.0,133.3 L 732.9,132.2 L 732.1,131.2 L 730.9,130.2 L 729.6,128.4 L 728.9,128.0 L 727.7,126.9 L 726.2,126.3 L 725.0,125.8 L 723.5,125.2 L 722.4,124.6 L 721.2,124.3 L 719.8,124.7 L 718.5,125.2 L 715.8,125.4 L 714.2,125.2 L 712.4,125.7 L 711.3,125.6 L 710.3,126.0 L 708.7,125.8 L 707.5,125.7 L 706.4,125.1 L 705.4,124.6 L 704.5,124.4 L 704.5,123.5 L 702.6,122.4 L 701.6,122.8 L 700.8,122.6 L 699.7,121.9 L 698.7,121.5 L 698.2,120.2 L 698.8,119.0 L 699.8,118.6 L 700.6,118.5 L 700.5,117.8 L 699.6,116.8 L 699.1,116.1 L 698.4,115.3 L 699.3,115.0 L 699.3,114.0 L 698.7,112.8 L 697.8,112.4 L 697.4,111.3 L 696.4,109.7 L 695.9,108.4 L 696.2,107.2 L 696.8,106.2 L 696.9,104.7 L 696.0,103.4 L 695.1,102.8 L 694.4,102.1 L 694.9,100.8 L 696.1,100.2 L 696.9,99.7 L 697.5,99.4 L 697.4,98.5 L 697.8,98.8 L 697.9,97.6 L 698.4,97.0 L 700.5,93.6 L 701.0,92.0 L 701.9,91.4 L 701.7,89.9 L 701.6,89.2 L 701.9,88.3 L 700.2,83.2 L 699.2,82.2 L 699.2,80.7 L 699.2,79.5 L 699.0,78.8 L 699.3,77.8 L 695.8,74.7 L 694.5,74.4 L 693.2,73.3 L 692.0,73.3 L 691.2,72.6 L 691.2,70.8 L 690.6,69.9 L 690.3,68.8 L 690.8,67.8 L 691.3,67.6 L 690.3,64.7 L 688.9,64.3 L 687.4,63.3 L 685.7,63.6 L 684.1,64.2 L 681.9,64.9 L 682.2,64.4 L 680.5,60.7 L 679.8,60.7 L 678.8,61.1 L 678.4,60.8 L 678.0,60.7 L 680.0,59.6 L 680.5,59.1 L 681.3,58.8 L 681.3,57.9 L 680.1,58.0 L 679.2,57.4 L 678.0,57.0 L 677.2,55.5 L 675.7,54.8 L 674.7,54.1 L 674.3,54.4 L 673.9,54.2 L 673.1,52.7 L 672.5,52.3 L 672.5,51.6 L 671.7,51.1 L 671.9,50.2 L 670.6,49.5 L 670.0,49.0 L 669.1,48.6 L 669.1,47.5 L 668.2,47.6 L 667.5,49.2 L 666.4,48.6 L 665.4,47.6 L 665.3,46.6 L 666.3,44.5 L 667.0,43.0 L 666.4,42.8 L 664.9,43.1 L 664.7,43.5 L 662.9,42.5 L 660.8,42.3 L 657.8,43.1 L 656.4,44.3 L 656.9,45.5 L 656.5,46.3 L 656.6,47.2 L 655.2,48.1 L 654.5,49.1 L 654.7,51.0 L 653.7,50.7 L 652.7,51.0 L 650.8,50.2 L 649.7,49.3 L 647.5,49.3 L 644.8,47.9 L 642.5,48.1 L 641.5,46.9 L 640.1,47.3 L 637.9,47.1 L 636.3,48.0 L 634.4,47.4 L 634.1,46.5 L 633.1,46.3 L 631.2,47.7 L 631.1,48.0 L 630.5,48.7 L 630.6,48.9 L 630.3,49.2 L 630.0,49.8 L 628.7,50.4 L 628.6,50.8 L 627.8,51.2 L 627.5,51.1 L 627.1,50.5 L 626.5,50.3 L 626.4,49.7 L 625.8,49.7 L 625.0,49.2 L 623.4,49.0 L 623.6,48.7 L 623.7,48.2 L 623.4,47.9 L 622.0,48.6 L 620.5,48.4 L 620.0,47.6 L 618.6,47.2 L 618.5,46.8 L 618.1,46.6 L 617.5,46.7 L 616.7,46.4 L 615.0,48.3 L 613.5,49.6 L 612.1,52.1 L 610.7,53.1 L 607.4,54.4 L 603.7,57.7 L 601.2,59.0 L 598.1,61.7 L 592.9,63.8 L 590.3,64.1 L 586.8,66.0 L 584.9,68.7 L 582.1,69.9 L 578.3,71.9 L 577.2,71.3 L 571.5,72.3 L 569.3,75.1 L 565.1,77.7 L 561.4,78.1 L 560.5,76.0 L 558.1,74.6 L 553.0,75.5 L 551.2,74.0 L 547.5,72.5 L 545.3,73.3 L 542.9,72.7 L 540.5,70.4 L 538.1,68.3 L 535.3,67.6 L 532.9,68.8 L 529.5,70.4 L 528.5,69.4 L 526.0,69.2 L 524.1,69.3 L 521.4,71.2 L 519.1,71.4 L 516.0,71.1 L 513.6,72.4 L 511.7,72.7 L 509.7,74.4 L 507.4,75.7 L 506.0,74.9 L 504.0,75.2 L 501.3,77.2 L 497.5,77.5 L 494.4,77.2 L 492.5,76.3 L 489.9,76.6 L 487.1,76.1 L 484.1,74.7 L 477.1,74.0 L 476.0,73.0 L 474.1,71.9 L 472.9,69.9 L 473.8,67.1 L 470.3,66.9 L 468.1,66.2 L 466.4,68.2 L 464.6,71.8 L 462.4,71.8 L 461.3,70.2 L 459.0,69.0 L 457.7,67.6 L 454.4,67.1 L 453.6,65.8 L 448.6,65.3 L 444.3,63.8 L 444.2,61.6 L 443.4,58.7 L 437.3,55.2 L 429.7,53.1 L 427.9,53.4 L 426.1,56.4 L 424.1,59.8 L 420.2,60.4 L 417.8,58.3 L 416.6,56.4 L 413.8,54.8 L 411.0,50.6 L 409.3,48.4 L 409.8,45.3 L 409.3,42.0 L 407.6,37.9 L 404.5,35.5 L 401.7,34.5 L 396.9,36.6 L 391.9,39.1 L 386.4,39.5 L 382.6,38.3 L 380.8,37.0 L 376.9,35.0 L 374.3,33.1 L 374.1,31.9 L 373.0,30.1 L 369.8,26.2 L 369.8,23.8 L 370.7,21.0 L 373.9,21.2 L 374.1,20.3 L 373.3,18.9 L 371.9,18.2 L 370.1,19.3 L 368.2,18.9 L 367.7,16.7 L 365.6,15.4 Z M 65.7,281.1 L 65.6,281.2 L 65.5,281.5 L 65.6,281.7 L 65.7,281.7 L 66.0,281.5 L 66.0,281.3 L 65.9,281.1 L 65.7,281.1 Z M 66.2,285.1 L 65.9,285.1 L 65.7,285.3 L 65.7,285.6 L 65.5,285.8 L 65.2,286.2 L 65.1,286.3 L 65.3,286.3 L 65.8,286.2 L 66.0,286.0 L 66.2,285.8 L 66.4,285.5 L 66.4,285.2 L 66.2,285.1 Z M 66.7,286.5 L 66.5,286.6 L 66.4,286.8 L 66.7,287.0 L 66.7,286.9 L 66.7,286.5 Z M 65.5,283.1 L 65.2,283.2 L 65.2,283.3 L 65.4,283.5 L 65.6,283.4 L 65.7,283.2 L 65.5,283.1 Z M 64.7,285.5 L 64.5,285.5 L 64.6,285.7 L 64.7,285.7 L 64.8,285.6 L 64.7,285.5 Z M 72.0,270.7 L 71.7,270.7 L 71.5,271.1 L 71.8,271.1 L 72.0,270.9 L 72.0,270.7 Z M 53.7,186.9 L 53.5,186.9 L 53.2,187.3 L 52.8,187.7 L 52.8,187.8 L 52.9,188.2 L 53.5,188.3 L 53.5,187.8 L 53.6,187.3 L 53.7,186.9 Z M 54.3,185.6 L 54.1,185.6 L 54.1,185.9 L 54.1,186.0 L 54.4,185.9 L 54.3,185.6 Z M 21.5,130.1 L 21.2,130.5 L 21.1,130.7 L 21.3,130.9 L 21.6,130.8 L 22.1,130.8 L 22.4,130.4 L 22.3,130.2 L 22.0,130.3 L 21.5,130.1 Z M 22.6,131.2 L 22.3,131.3 L 22.0,131.2 L 21.9,131.4 L 22.1,131.5 L 22.4,131.5 L 22.6,131.5 L 22.7,131.3 L 22.6,131.2 Z M 16.2,113.9 L 14.7,114.5 L 12.9,115.4 L 11.1,115.4 L 8.2,117.1 L 7.2,118.1 L 6.4,118.5 L 6.0,120.7 L 7.3,121.4 L 8.3,122.0 L 8.8,122.7 L 9.7,122.4 L 10.7,122.5 L 11.6,122.0 L 13.0,122.1 L 14.6,121.4 L 16.6,120.6 L 17.4,120.9 L 19.0,120.4 L 20.1,119.5 L 20.2,118.6 L 19.6,118.2 L 19.1,118.3 L 18.4,118.6 L 18.7,117.9 L 18.6,116.3 L 18.5,115.1 L 17.7,114.8 L 17.3,113.9 L 16.2,113.9 Z M 81.8,91.4 L 80.5,91.5 L 79.3,92.2 L 78.8,91.9 L 77.7,92.6 L 77.6,92.8 L 77.7,94.5 L 77.8,95.5 L 78.3,95.9 L 79.1,96.6 L 80.1,96.8 L 81.7,96.8 L 83.4,96.1 L 83.7,95.5 L 84.4,95.2 L 85.9,94.3 L 87.0,93.9 L 87.3,93.4 L 86.3,93.0 L 85.7,92.6 L 84.5,92.1 L 84.0,91.8 L 83.6,91.5 L 82.5,91.4 L 81.8,91.4 Z M 80.4,98.8 L 79.7,99.3 L 79.4,100.8 L 79.8,101.3 L 79.7,102.4 L 79.8,103.0 L 81.7,103.1 L 83.2,103.8 L 83.6,103.4 L 83.5,102.5 L 83.2,102.0 L 82.7,102.4 L 82.4,102.1 L 83.0,100.7 L 82.8,100.1 L 82.1,100.2 L 81.6,99.6 L 80.7,99.9 L 80.4,98.8 Z M 76.2,92.7 L 76.0,92.9 L 76.2,93.3 L 76.5,93.3 L 76.7,93.1 L 76.5,92.7 L 76.2,92.7 Z M 77.2,97.5 L 76.3,97.5 L 75.4,97.9 L 75.5,98.7 L 75.6,99.0 L 76.2,98.6 L 76.8,98.5 L 76.4,99.9 L 75.9,100.2 L 75.7,101.0 L 76.2,101.7 L 76.1,102.2 L 76.6,102.7 L 77.2,102.1 L 78.4,101.5 L 78.8,101.0 L 78.3,100.4 L 79.0,99.9 L 79.1,99.4 L 78.8,99.1 L 78.1,98.6 L 77.6,98.0 L 77.2,97.5 Z M 117.3,96.8 L 116.1,96.8 L 115.6,97.2 L 116.0,98.3 L 115.6,99.4 L 116.1,100.3 L 117.2,100.2 L 117.6,99.4 L 117.2,98.2 L 117.6,97.8 L 117.8,97.0 L 117.3,96.8 Z";

const WORLD_VECTOR_PATH = "M781.68,324.4l-2.31,8.68l-12.53,4.23l-3.75-4.4l-1.82,0.5l3.4,13.12l5.09,0.57l6.79,2.57v2.57l3.11-0.57l4.53-6.27v-5.13l2.55-5.13l2.83,0.57l-3.4-7.13l-0.52-4.59L781.68,324.4L781.68,324.4z M852.76,348.29l-0.37,24.44l3.52-0.19l4.63-5.41l3.89,0.19l2.5,2.24l0.83,6.9l7.96,4.2l2.04-0.75v-2.52l-6.39-5.32l-3.15-7.28l2.5-1.21l-1.85-4.01l-3.7-0.09l-0.93-4.29l-9.81-6.62L852.76,348.29L852.76,348.29z M137.49,225.43l4.83,15.21l-2.25,1.26l0.25,3.02l4.25,3.27v6.05l5.25,5.04l-2.25-14.86l-3-9.83l0.75-6.8l2.5,0.25l1,2.27l-1,5.79l13,25.44v9.07l10.5,12.34l11.5,5.29l4.75-2.77l6.75,5.54l4-4.03l-1.75-4.54l5.75-1.76l1.75,1.01l1.75-1.76h2.75l5-8.82l-2.5-2.27l-9.75,2.27l-2.25,6.55l-5.75,1.01l-6.75-2.77l-3-9.57l2.27-12.07l-4.64-2.89l-2.21-11.59l-1.85-0.79l-3.38,3.43l-3.88-2.07l-1.52-7.73l-15.37-1.61l-7.94-5.97L137.49,225.43L137.49,225.43z M517.77,143.66l-5.6-0.2l-3.55,2.17l-0.05,1.61l2.3,2.17l7.15,1.21L517.77,143.66L517.77,143.66z M473.88,227.49l-4.08-1.37l-16.98,3.19l-3.7,2.81l2.26,11.67l-6.75,0.27l-4.06,6.53l-9.67,2.32l0.03,4.75l31.85,24.35l5.43,0.46l18.11-14.15l-1.81-2.28l-3.4-0.46l-2.04-3.42v-14.15l-1.36-1.37l0.23-3.65l-3.62-3.65l-0.45-3.88l1.58-1.14l-0.68-4.11L473.88,227.49L473.88,227.49z M448.29,232.28h-11.55l-2.26,5.02l-5.21,2.51l-4.3,11.64l-8.38,5.02l-11.77,19.39l11.55-0.23l0.45-5.7h2.94v-7.76h10.19l0.23-10.04l9.74-2.28l4.08-6.62l6.34-0.23L448.29,232.28L448.29,232.28z M404.9,276.66l2.18,2.85l-0.45,12.32l3.17-2.28l2.26-0.46l3.17,1.14l3.62,5.02l3.4-2.28l16.53-0.23l-4.08-27.61l4.38-0.02l-8.16-6.25l0.01,4.06l-10.33,0.01l-0.05,7.75l-2.97-0.01l-0.38,5.72L404.9,276.66L404.9,276.66z M410.12,290.32l-3.94,2.86l-0.9,1.6l-0.28,1.6l1.45,1.04l4.84-0.07l3.11-0.84l0.35,1.53l-0.28,2.02l2.97,1.46l0.62,0.7l3.94,0.14l0.14-1.74l-3.6-4.32l-4.01-5.43l-2.49-1.04L410.12,290.32L410.12,290.32z M406.89,298.34l-0.13,1.11l6.92-0.1l0.35-1.03l-0.15-1.04l-1.99,0.81L406.89,298.34L406.89,298.34z M406.79,300.22l1.24,3.01l0.69-1.86l8.41,0.88l-3.64-1.87L406.79,300.22L406.79,300.22z M408.6,304.53l1.4,2.77l3.93-3.38l0.04-1.04l-4.63-0.67L408.6,304.53L408.6,304.53z M410.42,307.94l3.04,4.68l3.96-3.44l4.06-0.18l3.38,4.49l2.87,1.89l1.08-2.1l0.96-0.54l-0.07-4.62l-1.91-5.48l-5.86,0.65l-7.25-0.58l-0.04,1.86L410.42,307.94L410.42,307.94z M413.93,313.13l5.65,5.46l4.03-4.89l-2.52-3.95l-3.47,0.35L413.93,313.13L413.93,313.13z M420.17,319.19l10.98,7.34l-0.26-5.56l-3.32-3.91l-3.24-2.87L420.17,319.19L420.17,319.19z M432.07,326.75l4.28-3.03l5.32-0.93l5.43,1.17l-2.77-4.19l-0.81-2.56l0.81-7.57l-4.85,0.23l-2.2-2.1l-4.62,0.12l-2.2,0.35l0.23,5.12l-1.16,0.47l-1.39,2.56l3.58,4.19L432.07,326.75L432.07,326.75z M419.46,295.84l3.08-2.11l17.12-0.1l-3.96-27.54l4.52-0.13l21.87,16.69l2.94,0.42l-1.11,9.28l-13.75,1.25l-10.61,7.92l-1.93,5.42l-7.37,0.31l-1.88-5.41l-5.65,0.4l0.22-1.77L419.46,295.84L419.46,295.84z M450.59,294.28l3.64-0.29l5.97,8.44l-5.54,4.18l-4.01-1.03l-5.39,0.07l-0.87,3.16l-4.52,0.22l-1.24-1.69l1.6-5.14L450.59,294.28L450.59,294.28z M460.89,302l2.55-0.06l2.3-3.45l3.86-0.69l4.11,2.51l8.77,0.25l6.78-2.76l2.55-2.19l0.19-2.88l4.73-4.77l1.25-10.53l-3.11-6.52l-7.96-1.94l-18.42,14.36l-2.61-0.25l-1.12,9.97l-9.4,0.94L460.89,302L460.89,302z M444.34,317.05l1.12,2.63l2.92,4.58l1.62-0.06l4.42-2.51l-0.31-14.29l-3.42-1l-4.79,0.13L444.34,317.05L444.34,317.05z M455.22,321.25l2.68-1.57l-0.06-10.35l-1.74-2.82l-1.12,0.94L455.22,321.25L455.22,321.25z M458.71,319.49h2.12l0.12-6.02l2.68-3.89l-0.12-6.77l-2.43-0.06l-4.17,3.26l1.74,3.32L458.71,319.49L458.71,319.49z M461.57,319.37l3.92,0.19l4.73,5.27l2.3,0.63l1.8-0.88l2.74-0.38l0.93-3.82l3.73-2.45l4.04-0.19l7.4-13.61l-0.12-3.07l-3.42-2.63l-6.84,3.01l-9.15-0.13l-4.36-2.76l-3.11,0.69l-1.62,2.82l-0.12,7.96l-2.61,3.7L461.57,319.37L461.57,319.37z M474.91,227.33l5.53-2.23l1.82,1.18l0.07,1.44l-0.85,1.11l0.13,1.97l0.85,0.46v3.54l-0.98,1.64l0.13,1.05l3.71,1.31l-2.99,4.65l-1.17-0.07l-0.2,3.74l-1.3,0.2l-1.11-0.98l0.26-3.8l-3.64-3.54l-0.46-3.08l1.76-1.38L474.91,227.33L474.91,227.33z M480.05,248.03l1.56-0.26l0.46-3.6h0.78l3.19-5.24l7.87,2.29l2.15,3.34l7.74,3.54l4.03-1.7l-0.39-1.7l-1.76-1.7l0.2-1.18l2.86-2.42h5.66l2.15,2.88l4.55,0.66l0.59,36.89l-3.38-0.13l-20.42-10.62l-2.21,1.25l-8.39-2.1l-2.28-3.01l-3.32-0.46l-1.69-3.01L480.05,248.03L480.05,248.03z M521.93,243.06l2.67,0.07l5.2,1.44l2.47,0.07l3.06-2.56h1.43l2.6,1.44h3.29l0.59-0.04l2.08,5.98l0.59,1.93l0.55,2.89l-0.98,0.72l-1.69-0.85l-1.95-6.36l-1.76-0.13l-0.13,2.16l1.17,3.74l9.37,11.6l0.2,4.98l-2.73,3.15L522.32,273L521.93,243.06L521.93,243.06z M492.79,296l0.13-2.95l4.74-4.61l1.27-11.32l-3.16-6.04l2.21-1.13l21.4,11.15l-0.13,10.94l-3.77,3.21v5.64l2.47,4.78h-4.36l-7.22,7.14l-0.19,2.16l-5.33-0.07l-0.07,0.98l-3.04-0.4l-2.08-3.93l-1.56-0.77l0.2-1.2l1.96-1.5v-7.02l-2.71-0.42l-3.27-2.43L492.79,296L492.79,296L492.79,296z M477.82,324.28l3.22,2.96l-0.23,4.58l17.66-0.41l1.44-1.62l-5.06-5.45l-0.75-1.97l3.22-6.03l-2.19-4l-1.84-0.99v-2.03l2.13-1.39l0.12-6.32l-1.69-0.19l-0.03,3.32l-7.42,13.85l-4.54,0.23l-3.11,2.14L477.82,324.28L477.82,324.28z M556.71,294.7l-0.25-5.89l3.96-4.62l1.07,0.82l1.95,6.52l9.36,6.97l-1.7,2.09l-6.85-5.89H556.71L556.71,294.7z M571.48,301.54l-0.57,3.36l3.96-0.06l0.06-4.94l-1.45-0.89L571.48,301.54L571.48,301.54z M549.49,311.76l7.28-16.2l7.23,0.04l6.41,5.57l-0.45,4.59h4.97l0.51,2.76l8.04,4.81l4.96,0.25l-9.43,10.13l-12.95,3.99h-3.21l-5.72-4.88l-2.26-0.95l-4.38-6.45l-2.89,0.04l-0.34-2.96L549.49,311.76L549.49,311.76z M575.74,305.04l4.08,2.78l1.21-0.06l10.13-3.48l1.15,3.71l-0.81,3.13l-2.19,1.74l-5.47-0.35l-7.83-4.81L575.74,305.04L575.74,305.04z M599.62,299.65l2.13,2.38l2.88-1.74l1.04-0.35l-1.32-1.28l-2.53,0.75L599.62,299.65L599.62,299.65z M591.97,304.05l4.37-1.68l1.55,0.93l-0.17,3.88l-4.03,11.48l-21.81,23.36l-2.53-1.74l-0.17-9.86l3.28-3.77l6.96-2.15l10.21-10.78l2.67-2.38l0.75-3.48L591.97,304.05L591.97,304.05z M495.66,324.05l4.66,5.04l1.84-2.38l2.93,0.12l0.63-2.32l2.88-1.8l5.98,4.12l3.45-3.42l13.39,0.59L519,311.18l1.67-1.04l0.23-2.26l-2.82-1.33h-4.14l-6.67,6.61l-0.23,2.72l-5.29-0.17l-0.17,1.16l-3.45-0.35l-3.11,5.91L495.66,324.05L495.66,324.05z M470.74,337.15l1.15-0.58l0.86,0.7l-0.86,1.33l-1.04-0.41L470.74,337.15L470.74,337.15z M473.05,333.5l1.73-0.29l0.58,1.1l-0.86,0.93l-0.86-0.12L473.05,333.5L473.05,333.5z M476.84,327.41l-0.46,1.97l1.38,0.75l1.32-0.99l-0.46-2.03L476.84,327.41L476.84,327.41z M486.39,332.63l-0.12,2.49l-5.64-0.12l-3.45,6.67l8.11,8.87l2.01-1.68l-0.06-1.74l-1.38-0.64v-1.22l3.11-1.97l2.76,2.09l3.05,0.06l-0.06-10.49l-4.83-0.23l-0.06-2.2L486.39,332.63L486.39,332.63z M480.99,332.69l-0.06,1.39l4.54,0.23l-0.06-1.57L480.99,332.69L480.99,332.69z M491,332.52l-0.06,1.45l4.78,0.12l0.17,12.41l-4.37-0.12l-2.53-1.97l-1.96,1.1l-0.09,0.55l1.01,0.49l0.29,2.55l-2.7,2.32l0.58,1.22l2.99-2.32h1.44l0.46,1.39l1.9,0.81l6.1-5.16l-0.12-3.77l1.27-3.07l3.91-2.9l1.05-9.81l-2.78,0.01l-3.22,4.41L491,332.52L491,332.52z M486.55,353.23l1.74,2.26l2.25-2.13l-0.66-2.21l-0.56-0.04L486.55,353.23L486.55,353.23z M489.38,355.71l10.31-0.18l2.09,2.97l-0.08,2.19l0.77,0.7h5.12l1.47-2.89h2.09l0.85,0.86l2.87-0.08l0.85,10.08l4.96,0.16v0.78l13.33,6.01l0.62,1.17h2.79l-0.31-4.22l-5.04-2.42l0.31-3.2l2.17-5.08l4.96-0.16l-4.26-14.14l0.08-6.01l6.74-10.54l0.08-1.48l-1.01-0.55l0.04-2.86l-1.23-0.11l-1.24-1.58l-20.35-0.92l-3.73,3.63l-6.11-4.02l-2.15,1.32l-1.56,13.13l-3.86,2.98l-1.16,2.64l0.21,3.91l-6.96,5.69l-1.85-0.84l0.25,1.09L489.38,355.71L489.38,355.71z M537.82,339.9l2.81,2.59l-0.12,2.77l-4.36,0.09v-3.06L537.82,339.9L537.82,339.9z M536.21,346.21l4.27-0.09l-1.11,3.74l-1.08,0.94h-1.32l-0.94-2.53L536.21,346.21L536.21,346.21z M538.3,339.09l3.03,2.84l1.9-1.21l5.14-0.84l0.88,0.09l0.33-1.95l2.9-6.1l-2.44-5.08l-7.91,0.05l-0.05,2.09l1.06,1.02l-0.16,2.09L538.3,339.09L538.3,339.09z M550.83,326.52l2.66,5.19l-3.19,6.69l-0.42,2.03l15.93,9.85l4.94-7.76l-2.5-2.03l-0.05-10.22l3.13-3.42l-4.99,1.66l-3.77,0.05l-5.9-4.98l-1.86-0.8l-3.45,0.32l-0.61,1.02L550.83,326.52L550.83,326.52z M550.57,371.42l17.47-2.14l-3.93-7.6l-0.21-7.28l1.27-3.48l-16.62-10.44l-5.21,0.86l-1.81,1.34l-0.16,3.05l-1.17,4.23l-1.22,1.45l-1.75,0.16l3.35,11.61l5.47,2.57l3.77,0.11L550.57,371.42L550.57,371.42z M514.55,384.7l3.17,4.4l4.91,0.3l1.74,0.96l5.14,0.06l4.43-6.21l12.38-5.54l1.08-4.88l-1.44-6.99l-6.46-3.68l-4.31,0.3l-2.15,4.76l0.06,2.17l5.08,2.47l0.3,5.37l-4.37,0.24l-1.08-1.81l-12.14-5.18l-0.36,3.98l-5.74,0.18L514.55,384.7L514.55,384.7z M488.62,356.71l3.41,12.73l-0.08,4.02l-4.99,5.36l-0.75,8.71l19.2,0.17l6.24,2.26l5.15-0.67l-3-3.76l0.01-10.74l5.9-0.25v-4.19l-4.79-0.2l-0.96-9.92l-2.02,0.03l-1.09-0.98l-1.19,0.06l-1.58,3.06H502l-1.41-1.42l0.42-2.01l-1.66-2.43L488.62,356.71L488.62,356.71z M547.16,379.4l3.11,3.25l-0.06,4.16l0.6,1.75l4.13-4.46l-0.48-5.67l-2.21-1.69l-1.97-9.95l-3.41-0.12l1.55,7.17L547.16,379.4L547.16,379.4z M541.17,413.28l2.69,2.23l6.34-3.86l1.02-5.73v-9.46l10.17-8.32l1.74,0.06l6.16-5.91l-0.96-12.18L552,372.17l0.48,3.68l2.81,2.17l0.66,6.63l-5.5,5.37l-1.32-3.01l0.24-3.98l-3.17-3.44l-7.78,3.62l7.24,3.68l0.24,10.73l-4.79,7.11L541.17,413.28L541.17,413.28z M524.66,392.3l8.97,10.13l6.88,1.75l4.61-7.23l-0.36-9.58l-7.48-3.86l-2.81,1.27l-4.19,6.39l-5.8-0.06L524.66,392.3L524.66,392.3z M496.55,421.96l3.35,0.24l1.97,1.99l4.67,0.06l1.14-13.26v-8.68l2.99-0.6l1.14-9.1l7.6-0.24l2.69-2.23l-4.55-0.18l-6.16,0.84l-6.64-2.41h-18.66l0.48,5.3l6.22,9.16l-1.08,4.7l0.06,2.47L496.55,421.96L496.55,421.96z M508.51,411.23l2.15,0.66l-0.3,6.15l2.21,0.3l5.08-4.58l6.1,0.66l1.62-4.1l7.72-7.05l-9.27-10.67l-0.12-1.75l-1.02-0.3l-2.81,2.59l-7.3,0.18l-1.02,9.1l-2.87,0.66L508.51,411.23L508.51,411.23z M540.87,414l-2.51,0.42l-1.08,2.95l1.92,1.75h2.33l1.97-2.83L540.87,414L540.87,414z M527.41,425.39l3.05-2.35l1.44,0.06l1.74,2.17l-0.18,2.17l-2.93,1.08v0.84l-3.23-0.18l-0.78-2.35L527.41,425.39L527.41,425.39z M534.16,403.63l-7.9,7.3l-1.88,4.51l-6.26-0.78l-5.21,4.63l-3.46-0.34l0.28-6.4l-1.23-0.43l-0.86,13.09l-6.14-0.06l-1.85-2.18l-2.71-0.03l2.47,7.09l4.41,4.17l-3.15,3.67l2.04,4.6l4.72,1.8l3.76-3.2l10.77,0.06l0.77-0.96l4.78-0.84l16.17-16.1l-0.06-5.07l-1.73,2.24h-2.59l-3.15-2.64l1.6-3.98l2.75-0.56l-0.25-8.18L534.16,403.63L534.16,403.63z M530.37,422.13l1.51-0.06l2.45,2.66l-0.07,3.08l-2.87,1.45l-0.18,1.02l-4.38,0.05l-1.37-3.3l1.25-2.42L530.37,422.13L530.37,422.13z M321.13,50.07l-1.36,2.17l2.45,2.45l-1.09,2.45l3.54,4.62l4.35-1.36l5.71-0.54l6.53,7.07l4.35,11.69l-3.53,7.34l4.89-0.82l2.72,1.63l0.27,3.54l-5.98,0.27l3.26,3.26l4.08,0.82l-8.97,11.96l-1.09,7.34l1.9,5.98l-1.36,3.54l2.45,7.61l4.62,5.17l1.36-0.27l2.99-0.82l0.27,4.35l1.9,2.72l3.53-0.27l2.72-10.06l8.16-10.06l12.24-4.89l7.61-9.52l3.53,1.63h7.34l5.98-5.98l7.34-2.99l0.82-4.62l-4.62-4.08l-4.08-1.36l-2.18-5.71l5.17-2.99l8.16,4.35l2.72-2.99l-4.35-2.45l9.25-12.51l-1.63-5.44l-4.35-0.27l1.63-4.89l5.44-2.45l11.15-9.79l-3.26-3.53l-12.51,1.09l-6.53,6.53l3.81-8.43l-4.35-1.09l-2.45,4.35l-3.53-2.99l-9.79,1.09l2.72-4.35l16.04-0.54l-4.08-5.44l-17.4-3.26l-7.07,1.09l0.27,3.54l-7.34-2.45l0.27-2.45l-5.17,1.09l-1.09,2.72l5.44,1.9l-5.71,4.08l-4.08-4.62l-5.71-1.63l-0.82,4.35h-5.71l-2.18-4.62l-8.97-1.36l-4.89,2.45l-0.27,3.26l-6.25-0.82l-3.81,1.63l0.27,3.81v1.9l-7.07,1.36l-3.26-2.17l-2.18,3.53l3.26,3.54l6.8-0.82l0.54,2.18l-5.17,2.45L321.13,50.07L321.13,50.07z M342.89,92.49l1.63,2.45l-0.82,2.99h-1.63l-2.18-2.45l0.54-1.9L342.89,92.49L342.89,92.49z M410.87,85.69l4.62,1.36l-0.27,3.81l-4.89-2.45l-1.09-1.36L410.87,85.69L410.87,85.69z M388.52,622.99l3.83-5.11l14.89-7.66l2.55-5.53l6.38-1.28l5.96-7.66l5.96-0.43l1.28-5.96l5.11-3.83l4.26,1.28l12.34-3.83l2.98,2.98l5.53,0.43l5.11-2.55l30.64-0.43l11.06,2.98l14.04-2.98l4.68,0.43l1.28-4.26h4.68l6.38,6.81l11.92-7.66l13.19-3.83l4.68,2.98l0.43-5.96l6.81-0.85l7.23,3.4v3.4l18.3,7.66l5.11-0.43l2.13,2.55l-5.96,6.81v4.68l5.53,2.98l1.28-2.98l25.11-9.79l18.3-1.7l3.83,2.13l14.47,2.13l3.4,1.28l4.68-2.55l6.81-0.43l6.38,4.68l0.43,5.11l14.47-2.98l2.13,0.85l0.85,4.68l13.19,4.26l4.26-2.98l0.43,3.83l4.68,0.43l6.38,5.11l5.96-2.55l5.11,0.43h3.83l2.55-0.43l0.43,6.81l8.51,5.11L388.52,622.99L388.52,622.99z M260.01,622.99l13.62-3.83l0.85-3.83l14.47-3.4l8.51,2.13l18.72-7.66l-0.43-8.08l-5.53-8.51l1.28-2.13l-2.13-5.53v-5.96h3.4l-2.13-4.26l15.32-13.19l-0.43,5.96l-2.98,0.85l-2.98,5.11l2.98,1.28l-2.98,4.26l-3.4-0.85l-1.7,3.83l0.43,5.11l5.11-0.43l3.4,4.68l1.28,5.96l6.81,8.51l0.43,10.64l-2.55,1.28l2.13,5.53l-1.28,2.13L260.01,622.99L260.01,622.99z M250.22,615.33l5.11-0.85l2.13,1.7l-0.85,2.13l-0.43,2.55l-2.98,1.28l-2.13-2.55h-8.51v-1.7l3.83-0.85L250.22,615.33L250.22,615.33z M304.69,587.67l-4.26,0.85l2.55,4.68l2.98,1.28l-1.28,2.55v1.7l-8.09,2.13l0.85,2.55l3.4,1.28l3.83-2.98l3.4,0.85l-2.13,3.4l1.28,0.85l3.83-1.7l2.98-5.53L304.69,587.67L304.69,587.67z M295.75,606.82l-3.4,2.98l2.98,0.85l3.83,0.85l3.83-2.55l-3.83-0.85L295.75,606.82L295.75,606.82z M319.57,556.47l-2.49,0.5l-0.55,2.55l4.76-0.7L319.57,556.47L319.57,556.47z M323.59,552.54l-2.99,0.57l0.57,2.31l3.64-0.13L323.59,552.54L323.59,552.54z M328.34,557.17l0.02,3.56l2.05,0.09l1.66-2.64L328.34,557.17L328.34,557.17z M329.33,547.24l-2.16,0.85l-0.55,2.04l1.87,0.68l3.14-2.16L329.33,547.24L329.33,547.24z M761.17,427.98l-0.35,25.38l-3.9,2.86l-0.35,2.5l5.32,3.57l13.13-2.5h6.74l2.48-3.58l14.9-2.86l10.64,3.22l-0.71,4.29l1.42,4.29l8.16-1.43l0.35,2.14l-5.32,3.93l1.77,1.43l3.9-1.43l-1.06,11.8l7.45,5.72l4.26-1.43l2.13,2.14l12.42-1.79l11.71-18.95l4.26-1.07l8.51-15.73l2.13-13.58l-5.32-6.79l2.13-1.43l-4.26-13.23l-4.61-3.22l0.71-17.87l-4.26-3.22l-1.06-10.01h-2.13l-7.1,23.59l-3.9,0.36l-8.87-8.94l4.97-13.23l-9.22-1.79l-10.29,2.86l-2.84,8.22l-4.61,1.07l-0.35-5.72l-18.8,11.44l0.35,4.29l-2.84,3.93h-7.1l-15.26,6.43L761.17,427.98L761.17,427.98z M825.74,496.26l-1.77,7.15l0.35,5l5.32-0.36l6.03-9.29L825.74,496.26L825.74,496.26z M913.02,481.96l1.06,11.8l-1.42,5.36l-5.32,3.93l0.35,4.65v5l1.42,1.79l14.55-12.51v-2.86h-3.55l-4.97-16.8L913.02,481.96L913.02,481.96z M902.38,507.7l2.84,5.36l-7.81,7.51l-0.71,3.93l-5.32,0.71l-8.87,8.22l-8.16-3.93l-0.71-2.86l14.9-6.43L902.38,507.7L902.38,507.7z M906.64,420.47l-0.35,1.79l4.61,6.43l2.48,1.07l0.35-2.5L906.64,420.47L906.64,420.47z M722.48,317.57l-0.28,2.28l6.79,11.41h1.98l14.15,23.67l5.66,0.57l2.83-8.27l-4.53-2.85l-0.85-4.56L722.48,317.57L722.48,317.57z M764.14,332.92l3.02,3.49l11.58-4.01l2.29-8.84l5.16-0.37l4.72-3.42l-6.12-4.46l-1.4-2.45l-3.02,5.57l1.11,3.2l-1.84,2.67l-3.47-0.89l-8.41,6.17l0.22,3.57L764.14,332.92L764.14,332.92z M779.77,319.25l-2.88,3.49l2.36,0.74l1.33-1.86L779.77,319.25L779.77,319.25z M789.53,349.11l2.26,2.77l-1.47,4.16v0.79h3.34l1.18-10.4l1.08,0.3l1.96,9.5l1.87,0.5l1.77-4.06l-1.77-6.14l-1.47-2.67l4.62-3.37l-1.08-1.49l-4.42,2.87h-1.18l-2.16-3.17l0.69-1.39l3.64-1.78l5.5,1.68l1.67-0.1l4.13-3.86l-1.67-1.68l-3.83,2.97h-2.46l-3.73-1.78l-2.65,0.1l-2.95,4.75l-1.87,8.22L789.53,349.11L789.53,349.11z M814.19,330.5l-1.87,4.55l2.95,3.86h0.98l1.28-2.57l0.69-0.89l-1.28-1.39l-1.87-0.69L814.19,330.5L814.19,330.5z M819.99,345.45l-4.03,0.89l-1.18,1.29l0.98,1.68l2.65-0.99l1.67-0.99l2.46,1.98l1.08-0.89l-1.96-2.38L819.99,345.45L819.99,345.45z M753.17,358.32l-2.75,1.88l0.59,1.58l8.75,1.98l4.42,0.79l1.87,1.98l5.01,0.4l2.36,1.98l2.16-0.5l1.97-1.78l-3.64-1.68l-3.14-2.67l-8.16-1.98L753.17,358.32L753.17,358.32z M781.77,366.93l-2.16,1.19l1.28,1.39l3.14-1.19L781.77,366.93L781.77,366.93z M785.5,366.04l0.39,1.88l2.26,0.59l0.88-1.09l-0.98-1.49L785.5,366.04L785.5,366.04z M790.91,370.99l-2.75,0.4l2.46,2.08h1.96L790.91,370.99L790.91,370.99z M791.69,367.72l-0.59,1.19l4.42,0.69l3.44-1.98l-1.96-0.59l-3.14,0.89l-1.18-0.99L791.69,367.72L791.69,367.72z M806.14,368.42l-5.11,4.26l0.49,1.09l2.16-0.4l2.55-2.38l5.01-0.69l-0.98-1.68L806.14,368.42L806.14,368.42z M880.48,349l-0.88,1.25l4.81,4.26l0.66,2.5l1.31-0.15l0.15-2.57l-1.46-1.32L880.48,349L880.48,349z M882.89,355.03l-0.95,0.22l-0.58,2.57l-1.82,1.18l-5.47,0.96l0.22,2.06l5.76-0.29l3.65-2.28l-0.22-3.97L882.89,355.03L882.89,355.03z M889.38,359.51l1.24,3.45l2.19,2.13l0.66-0.59l-0.22-2.28l-2.48-3.01L889.38,359.51L889.38,359.51z M895.43,364.65l0.15,2.28l1.39,1.32l1.31-0.81l-1.17-2.43L895.43,364.65L895.43,364.65z M897.18,370.31l-1.17,1.25l1.24,2.28l1.46,0.44l-0.07-1.54L897.18,370.31L897.18,370.31z M900.03,368.99l1.02,2.5l1.97,2.35l1.09-1.76l-1.46-2.5L900.03,368.99L900.03,368.99z M905.14,372.74l0.58,3.09l1.39,1.91l1.17-2.42L905.14,372.74L905.14,372.74z M906.74,379.65l-0.51,0.88l1.68,2.21l1.17,0.07l-0.73-2.87L906.74,379.65L906.74,379.65z M903.02,384.05l-1.75,0.81l1.53,2.13l1.31-0.74L903.02,384.05L903.02,384.05z M920.87,397.22l-1.24,1.66l0.52,1.87l0.62,0.42l1.13-1.46L920.87,397.22L920.87,397.22z M921.49,402.31l0.1,1.35l1.34,0.42l0.93-0.52l-0.93-1.46L921.49,402.31L921.49,402.31z M923.45,414.37l-0.62,0.94l0.93,1.04l1.55-0.52L923.45,414.37L923.45,414.37z M948.62,412.29l-1.24,1.66l-0.1,1.87l1.44,1.46L948.62,412.29L948.62,412.29z M789.37,297.53l-0.86,1.64l-0.48,2.02l-4.78,6.07l0.29,1.25l2.01-0.29l6.21-6.94L789.37,297.53L789.37,297.53z M797.11,295.22l-0.1,5.01l1.82,1.83l0.67,3.56l1.82,0.39l0.86-2.22l-1.43-1.06l-0.38-6.26L797.11,295.22L797.11,295.22z M802.28,297.15l-0.1,4.43l1.05,1.73l1.82-2.12l-0.48-3.85L802.28,297.15L802.28,297.15z M803.42,293.29l1.82,2.41l0.86,2.31h1.63l-0.29-3.95l-1.82-1.25L803.42,293.29L803.42,293.29z M806.96,302.35l0.38,2.89l-3.35,2.7l-2.77,0.29l-2.96,3.18l0.1,1.45l2.77-0.87l1.91-1.25l1.63,4.14l2.87,2.02l1.15-0.39l1.05-1.25l-2.29-2.31l1.34-1.06l1.53,1.25l1.05-1.73l-1.05-2.12l-0.19-4.72L806.96,302.35L806.96,302.35z M791.38,272.97l-2.58,1.83l-0.29,5.78l4.02,7.8l1.34,1.06l1.72-1.16l2.96,0.48l0.57,2.6l2.2,0.19l1.05-1.44l-1.34-1.83l-1.63-1.54l-3.44-0.38l-1.82-2.99l2.1-3.18l0.19-2.79l-1.43-3.56L791.38,272.97L791.38,272.97z M792.72,290.21l0.76,2.7l1.34,0.87l0.96-1.25l-1.53-2.12L792.72,290.21L792.72,290.21z M759.83,270.17l-2.39,0.67l-1.72,2.12l1.43,2.79l2.1,0.19l2.39-2.12l0.57-2.79L759.83,270.17L759.83,270.17z M787.46,248.31l-3.54,2.7l-0.19,5.2l3.06,3.56l0.76-0.67L787.46,248.31L787.46,248.31z M803.23,216.42l-1.63,1.64l0.67,2.31l1.43,0.1l0.96,5.01l1.15,1.25l2.01-1.83l0.86-3.28l-2.49-3.56L803.23,216.42L803.23,216.42z M812.03,213.15l-2.77,2.6l-0.1,2.99l0.67,0.87l3.73-3.18l-0.29-3.18L812.03,213.15L812.03,213.15z M808.2,206.98l-4.88,5.59l0.86,1.35l2.39,0.29l4.49-3.47l3.16-0.58l2.87,3.37l2.2-0.77l0.86-3.28l4.11-0.1l4.02-4.82l-2.1-8l-0.96-4.24l2.1-1.73l-4.78-7.22l-1.24,0.1l-2.58,2.89v2.41l1.15,1.35l0.38,6.36l-2.96,3.66l-1.72-1.06l-1.34,2.99l-0.29,2.79l1.05,1.64l-0.67,1.25l-2.2-1.83h-1.53l-1.34,0.77L808.2,206.98L808.2,206.98z M816.43,163.44l-1.53,1.35l0.77,2.89l1.34,1.35l-0.1,4.43l-1.72,0.67l-1.34,2.99l3.92,5.39l2.58-0.87l0.48-1.35l-2.77-2.5l1.72-2.22l1.82,0.29l1.43,1.54l0.1-3.18l3.92-3.18l2.2-0.58l-1.82-3.08l-0.86-1.35l-1.43,0.96l-1.24,1.54l-2.68-0.58l-2.77-1.83L816.43,163.44L816.43,163.44z M830.86,160.45l-2.68,3.76l0.19,1.83l1.34-0.58l3.15-3.95L830.86,160.45L830.86,160.45z M834.4,154.96l-0.96,2.6l0.1,1.73l1.63-1.06l1.53-3.08V154L834.4,154.96L834.4,154.96z M840.04,132.03l-1.24,1.54l0.1,2.41l1.15-0.1l1.91-3.37L840.04,132.03L840.04,132.03z M837.75,137.91v4.24l1.34,0.48l0.96-1.54v-3.27L837.75,137.91L837.75,137.91z M798.64,122.59l-0.09,6.17l7.74,11.95l2.77,10.4l4.88,9.25l1.91,0.67l1.63-1.35l0.76-2.22l-6.98-7.61l0.19-3.95l1.53-0.67l0.38-2.31l-13.67-19.36L798.64,122.59L798.64,122.59z M852.57,103.42l-1.91,0.19l1.15,1.64l2.39,1.64l0.67-0.77L852.57,103.42L852.57,103.42z M856.29,104.58l0.29,1.64l2.96,0.87l0.29-1.16L856.29,104.58L856.29,104.58z M872.54,110.87l1.25,2.24l2.08-0.14l0.42-1.54L872.54,110.87L872.54,110.87z M893.51,114.37l1.67,3.08l1.25-1.4v-2.1L893.51,114.37L893.51,114.37z M907.81,104.57l-2.36,3.08l0.55,1.4l2.92-1.82l0.28-1.82L907.81,104.57L907.81,104.57z M919.61,94.92l-2.08,2.52l2.22,0.84L919.61,94.92L919.61,94.92z M922.53,90.72l-1.39,2.24l0.14,2.24l1.94-0.84L922.53,90.72L922.53,90.72z M881.29,38.39l-2.36,1.54l-0.56,1.96l1.11,1.26l2.5-0.84l2.5,0.84l1.39,0.42l-0.14-4.62L881.29,38.39L881.29,38.39z M69.17,53.35l3.46,6.47l2.22-0.5v-2.24L69.17,53.35L69.17,53.35z M883.4,17.54l-4.22,7.57l8.08,5.11l9.05-7.59l5.5,9.17l-5.74,1.18l-2.27,5.88l12.71,17.22l7.65,1.27l11.03,2.17l1.36-4L930.4,57l0.73,16.75L924,85.62l3.44,0.75l8.98-18.92l2.73-14.16l-5.54-2.59l-0.89-19l4.27,0.83l-0.04,11.43l4.66,4.07l2.72-9.93l-2.18-5.9l6.58,3.15l0.69-34.99L873.66,0.5l-4.36,3.35l0.59,6.77l13.43,1.84l10.31-2.35l-3.7,6.92L883.4,17.54L883.4,17.54z M1.17,54.95l14.01,1.57l2.34,4.84l11.16-6.54l18.68-2.61l1.3-9.67l9.34-3.4l6.1-5.75v7.84l6.23,8.5L83.3,41.5l-6.23-7.06L69.29,13.4L59.94,2.67l-6.62-0.52L53.06,7.9l-5.45,2.75l-1.69-3.4l3.24-6.93L1.3,0.45L1.17,54.95L1.17,54.95z M78.49,3.32L74.6,6.85l1.17,2.61l2.08-1.44l1.17,1.31L82.9,7.9l-0.13-2.22L78.49,3.32L78.49,3.32z M49.66,110.26l-0.17,3.01l2.16-0.5v-1.34L49.66,110.26L49.66,110.26z M46.34,111.6l-4.32,2.18l0.67,2.34l1.66-1.34l3.32-1.51L46.34,111.6L46.34,111.6z M28.39,114.44l-2.99-0.67l-0.5,1.34l0.33,2.51L28.39,114.44L28.39,114.44z M22.07,114.28l-2.83-1.17l-1,1.84l1.83,1.84L22.07,114.28L22.07,114.28z M12.27,111.6l-1.33-1.84l-1.33,0.5v2.51l1.5,1L12.27,111.6L12.27,111.6z M1.47,99.71l1.66,1.17l-0.5,1.34H1.47V99.71L1.47,99.71z M622.76,499.62l-0.15,4.29l5.94,1.38l1.37-3.53l-2.13,0.61l-2.74,0.61l-0.76-3.22L622.76,499.62L622.76,499.62z M613.01,398.99l-1.52,1.99l0.3,2.15l3.2-2.61L613.01,398.99L613.01,398.99z M607.38,402.37l-2.28,0.15l-0.15,1.99l1.52,0.31l2.28-1.07L607.38,402.37L607.38,402.37z M592.3,372.92l-2.13,5.06l-3.65,6.44l-6.39,0.46l-2.74,3.22l0.46,9.82l-3.96,4.6l0.46,7.82l3.35,3.83l3.96-0.46l3.96-2.92l-0.91-4.6l9.13-15.8l-1.83-1.99l1.83-3.83l1.98,0.61l0.61-1.53l-1.83-7.82l-1.07-3.22L592.3,372.92L592.3,372.92z M577.69,371.23l0.46,1.53l1.98,0.31l0.76-1.99L577.69,371.23L577.69,371.23z M580.58,374.3l0.76,1.69h1.22l0.61-2.15L580.58,374.3L580.58,374.3z M602.35,358.34l-0.61,1.23l1.67,1.38l1.22-1.38L602.35,358.34L602.35,358.34z M610.88,349.14l-1.83,1.23l1.37,2.15h1.83L610.88,349.14L610.88,349.14z M611.64,354.51l-1.22,1.38l0.91,1.38l1.67,0.31l0.15-2.92L611.64,354.51L611.64,354.51z M656.4,320.76l0.3,2.61l1.67,0.61l0.3-2.3L656.4,320.76L656.4,320.76z M658.53,326.28l-0.15,3.22l1.22,0.61l1.07-2.15L658.53,326.28L658.53,326.28z M658.84,332.57l-1.07,1.07l1.22,1.07l1.52-1.07L658.84,332.57L658.84,332.57z M372.64,217.02l-1.36,1.37l2.44,1.37l0.27-1.91L372.64,217.02L372.64,217.02z M379.97,216.2l-1.63,1.09l1.36,1.09l2.17-0.55L379.97,216.2L379.97,216.2z M381.05,220.03l-0.81,2.19l1.08,1.37l1.36-1.09L381.05,220.03L381.05,220.03z M387.56,224.4l-0.54,1.37l0.81,0.82l2.17-1.37L387.56,224.4L387.56,224.4z M408.18,236.42l-1.08,1.37l1.08,1.37l1.63-0.82L408.18,236.42L408.18,236.42z M415.62,253.73l-1.75,1.01l0.81,0.82L415.62,253.73L415.62,253.73z M409.54,253.92l-2.17,0.55l1.08,1.64h1.63L409.54,253.92L409.54,253.92z M404.38,252.28l-1.36,1.37l1.9,1.64l1.08-2.46L404.38,252.28L404.38,252.28z M387.56,290.54l-1.9,1.09l1.36,1.09l1.63-0.82L387.56,290.54L387.56,290.54z M392.23,292.74l-1.24,1.1l0.88,1.63l2.12-0.95L392.23,292.74L392.23,292.74z M389.52,295.83l-1.59,0.95l1.71,2.29l1.35-0.71L389.52,295.83L389.52,295.83z M10,248.7l-0.14,2.33l2.04,1.37l1.22-1.09L10,248.7L10,248.7z M15.29,252.13l-1.9,1.37l1.63,2.05l1.9-1.64L15.29,252.13L15.29,252.13z M19.1,255.41l-1.63,2.19l0.54,1.37l2.31-1.09L19.1,255.41L19.1,255.41z M21.81,259.65l-0.95,5.47l0.95,2.05l3.12-0.96l1.63-2.74l-3.4-3.15L21.81,259.65L21.81,259.65z M27.25,402.68l-1.9-0.14l-0.14,1.78l1.49,0.96l1.77-1.09L27.25,402.68L27.25,402.68z M33.77,404.6l-2.72,1.78l2.04,2.46l1.77-0.41l0.95-1.23L33.77,404.6L33.77,404.6z M276.6,283.37l-1.5,0.62l0.53,1.33l1.76-1.15l-0.35-0.36L276.6,283.37L276.6,283.37z M279.07,284.88l-0.88,1.87l1.06,1.42l1.32-1.15L279.07,284.88L279.07,284.88z M282.07,290.03l-1.06,0.98l0.79,1.6l1.5-0.44L282.07,290.03L282.07,290.03z M281.98,294.03l-0.71,1.51l1.15,1.24l1.5-0.8L281.98,294.03L281.98,294.03z M282.07,297.85l-1.23,0.89l0.97,1.78l1.59-0.89L282.07,297.85L282.07,297.85z M280.57,301.31l-1.15,1.15l0.44,0.71h1.41l0.44-1.16L280.57,301.31L280.57,301.31z M282.24,304.78l-1.06,0.98l-1.15,0.18v1.42l2.12,1.95l0.88-1.42l0.53-1.6l-0.18-1.33L282.24,304.78L282.24,304.78z M271.05,281.06l-2.64-0.89l-2.12,1.33l1.06,1.24l3.61,0.53L271.05,281.06L271.05,281.06z M250.87,275.38l-1.67,1.71l1.91,0.78l0.28,2.39l-4.23,0.37l0.43,2.3l1.23,0.09l0.71-1.06l4.94,0.16l0.89,1.71l1.14-1.34l3.33-0.9l2.93,0.62l0.34-1.77l-5.28-3.45l-3.42-1.28L250.87,275.38L250.87,275.38z M263.11,280.44l-5.29-3.46l-2.5-0.85l-0.84,6l0.88,1.69l1.15-1.33l3.35-0.89l2.91,0.62L263.11,280.44L263.11,280.44z M250.86,275.38l3.44,0.36l-0.41,4.22l-0.34,2.22l-4.01-0.22l-0.71,1.07l-1.23-0.09l-0.44-2.31l4.23-0.35l-0.26-2.4l-1.94-0.8L250.86,275.38L250.86,275.38z M307.95,508.18l-2.63-0.29l-2.62,1.76l1.9,2.06L307.95,508.18L307.95,508.18z M310.57,506.86l-0.87,2.79l-2.48,2.2l0.15,0.73l4.23-1.62l1.75-2.2L310.57,506.86L310.57,506.86z M406.36,117.31l-1.96-1.11l-2.64,1.67l-2.27,2.1l0.06,1.17l2.94,0.37l-0.18,2.1l-1.04,1.05l0.25,0.68l2.94,0.19v3.4l4.23,0.74l2.51,1.42l2.82,0.12l4.84-2.41l3.74-4.94l0.06-3.34l-2.27-1.92l-1.9-1.61l-0.86,0.62l-1.29,1.67l-1.47-0.19l-1.47-1.61l-1.9,0.18l-2.76,2.29l-1.66,1.79l-0.92-0.8l-0.06-1.98l0.92-0.62L406.36,117.31L406.36,117.31z M488.26,53.96l-1.65-1.66l-3.66,1.78h-6.72L475.17,58l3.77,3.33l1.65-0.24l2.36-4.04l2,1.43l-1.42,2.85l-0.71,4.16l1.65,2.61l3.54-5.94l4.6-5.59l-1.77-1.54L488.26,53.96L488.26,53.96z M490.26,46.83l-2.95,2.73l1.77,2.73h3.18l1.3,1.78l3.89,2.02l4.48-2.61l3.07-2.61l-1.06-2.14l-3.07-1.78l-2.24,2.02l-1.53-1.9l-1.18,0.12l-1.53,3.33l-2.24-2.26l-0.24-1.54L490.26,46.83L490.26,46.83z M496.98,59.07l-2.36,2.14l-2,1.54l0.94,1.66l1.89,0.59l3.07-1.43l1.42-1.78l-1.3-2.14L496.98,59.07L496.98,59.07z M547.82,38.79l1.72,0.69l-1.21,2.08v2.95l-2.58,1.56H543l-1.55-1.91l0.17-2.08l1.21-1.56h2.41L547.82,38.79L547.82,38.79z M554.36,36.88v2.08l1.72,1.39l2.41-0.17l2.07-1.91v-1.39h-1.89l-1.55,0.52l-1.21-1.39L554.36,36.88L554.36,36.88z M564.18,37.06l1.21,2.6l2.41,0.17l1.72-0.69l-0.86-2.43l-2.24-0.52L564.18,37.06L564.18,37.06z M573.99,33.59l-1.89-0.35l-1.72,1.74l0.86,1.56l0.52,2.43l2.24-1.73l0.52-1.91L573.99,33.59L573.99,33.59z M584.49,51.98l-0.52,2.43l-3.96,3.47l-8.44,1.91l-6.89,11.45l-1.21,3.3l6.89,1.74l1.03-4.16l2.07-6.42l5.34-2.78l4.48-3.47l3.27-1.39h1.72v-4.68L584.49,51.98L584.49,51.98z M562.28,77.31l4.65,0.52l1.55,5.38l3.96,4.16l-1.38,2.78h-2.41l-2.24-2.6l-4.99-0.17l-2.07-2.78v-1.91l3.1-0.87L562.28,77.31L562.28,77.31z M634.95,18.15l-2.24-1.39h-2.58l-0.52,1.56l-2.75,1.56l-2.07,0.69l-0.34,2.08l4.82,0.35L634.95,18.15L634.95,18.15z M640.28,18.67l-1.21,2.6l-2.41-0.17l-3.79,2.78l-1.03,3.47h2.41l1.38-2.26l3.27,2.43l3.1-1.39l2.24-1.91l-0.86-2.95l-1.21-2.08L640.28,18.67L640.28,18.67z M645.28,20.58l1.21,4.86l1.89,4.51l2.07-3.64l3.96-0.87v-2.6l-2.58-1.91L645.28,20.58L645.28,20.58z M739.76,12.8l2.69,2.26l1.91-0.79l0.56-3.17L741,8.39l-2.58,1.7l-6.28,0.57v2.83l-6.62,0.11v4.63l7.74,5.76l2.02-1.47l-0.45-4.07l4.94-1.24l-1.01-1.92l-1.79-1.81L739.76,12.8L739.76,12.8z M746.94,10.09l1.79,3.39l6.96-0.79l1.91-2.49l-0.45-2.15l-1.91-0.79l-1.79,1.36l-5.16,1.13L746.94,10.09L746.94,10.09z M746.49,23.31l-3.48-0.9L741,24.56l-0.9,2.94l4.71-0.45l3.59-1.81L746.49,23.31L746.49,23.31z M836.68,3.76l-2.92-0.9L830.4,4.1l-1.68,2.49l2.13,2.83l5.61-2.49l1.12-1.24L836.68,3.76L836.68,3.76z M680.54,308.05l0.25,2.72l0.25,1.98l-1.47,0.25l0.74,4.45l2.21,1.24l3.43-1.98l-0.98-4.69l0.25-1.73l-3.19-2.96L680.54,308.05L680.54,308.05z M220.85,266.92v1.27l5.32,0.1l2.51-1.46l0.39,1.07l5.22,1.27l4.64,4.19l-1.06,1.46l0.19,1.66l3.87,0.97l3.87-1.75l1.74-1.75l-2.51-1.27l-12.95-7.6l-4.54-0.49L220.85,266.92L220.85,266.92z M239.61,259.13l-1.26-0.39l-0.1,2.43l1.55,1.56l1.06-1.56L239.61,259.13L239.61,259.13z M242.12,262.93l-1.74,0.97l1.64,2.34l0.87-1.17L242.12,262.93L242.12,262.93z M247.73,264.68l-1.84-0.1l0.19,1.17l1.35,1.95l1.16-1.27L247.73,264.68L247.73,264.68z M246.86,262.35l-3-1.27l-0.58-3.02l1.16-0.49l1.16,2.34l1.16,0.88L246.86,262.35L246.86,262.35z M243.96,256.21l-1.55-0.39l-0.29-1.95l-1.64-0.58l1.06-1.07l1.93,0.68l1.45,0.88L243.96,256.21L243.96,256.21z M238.93,279.59l-3.48,0.88v0.97l2.03,1.17h2.13l1.35-1.56L238.93,279.59L238.93,279.59z M831.93,339.34l-4.17,0.47l-2.68,1.96l1.11,2.24l4.54,0.84v0.84l-2.87,2.33l1.39,4.85l1.39,0.09l1.2-4.76h2.22l0.93,4.66l10.83,8.96l0.28,7l3.7,4.01l1.67-0.09l0.37-24.72l-6.29-4.38l-5.93,4.01l-2.13,1.31l-3.52-2.24l-0.09-7.09L831.93,339.34L831.93,339.34z M93.11,44.89l-8.39,1.99l1.73,9.45l9.13,2.49l0.49,1.99L82.5,65.04l-7.65,12.68l2.71,13.43L82,94.13l3.46-3.23l0.99,1.99l-4.2,4.97l-16.29,7.46l-10.37,2.49l-0.25,3.73l23.94-6.96l9.87-2.74l9.13-11.19l10.12-6.71l-5.18,8.7l5.68,0.75l9.63-4.23l1.73,6.96l6.66,1.49l6.91,6.71l0.49,4.97l-0.99,1.24l1.23,4.72h1.73l0.25-7.96h1.97l0.49,19.64l4.94-4.23l-3.46-20.39h-5.18l-5.68-7.21l27.89-47.25l-27.64-21.63l-30.85,5.97l-1.23,9.45l6.66,3.98l-2.47,6.47L93.11,44.89L93.11,44.89z M194.97,338.18l-0.62,2.75l-1.15,1.16l0.79,1.42l2.03-0.8l0.97-1.69l-0.62-1.78L194.97,338.18L194.97,338.18z M203.73,35.89l0.22,4.02l-7.98,8.27l2,6.7l5.76-1.56l3.33-4.92l8.42-3.13l6.87-0.45l-5.32-5.81l-2.66,2.01l-2-0.67l-1.11-2.46l-2.44-2.46L203.73,35.89L203.73,35.89z M214.15,24.05l-1.77,3.13l8.65,3.13l3.1-4.69l1.33,3.13h2.22l4.21-4.69l-5.1-1.34l-2-1.56l-2.66,2.68L214.15,24.05L214.15,24.05z M229.23,30.31l-6.87,2.9v2.23l8.87,3.35l-2,2.23l1.33,2.9l5.54-2.46h4.66l2.22,3.57l3.77-3.8l-0.89-3.58l-3.1,1.12l-0.44-4.47l1.55-2.68h-1.55l-2.44,1.56l-1.11,0.89l0.67,3.13l-1.77,1.34l-2.66-0.22l-0.67-4.02L229.23,30.31L229.23,30.31z M238.32,23.38l-0.67,2.23l4.21,2.01l3.1-1.79l-0.22-1.34L238.32,23.38L238.32,23.38z M241.64,19.58l-3.1,1.12l0.22,1.56l6.87-0.45l-0.22-1.56L241.64,19.58L241.64,19.58z M256.5,23.38l-0.44,1.56l-1.11,1.56v2.23l4.21-0.67l4.43,3.8h1.55v-3.8l-4.43-4.92L256.5,23.38L256.5,23.38z M267.81,27.85l1.77,2.01l-1.55,2.68l1.11,2.9l4.88-2.68v-2.01l-2.88-3.35L267.81,27.85L267.81,27.85z M274.24,22.71l0.22,3.57h5.99l1.55,1.34l-0.22,1.56l-5.32,0.67l3.77,5.14l5.1,0.89l7.09-3.13l-10.2-15.42l-3.1,2.01l0.22,2.68l-3.55-1.34L274.24,22.71L274.24,22.71z M222.58,47.96l-8.42,2.23l-4.88,4.25l0.44,4.69l8.87,2.68l-2,4.47l-6.43-4.02l-1.77,3.35l4.21,2.9l-0.22,4.69l6.43,1.79l7.76-0.45l1.33-2.46l5.76,6.48l3.99-1.34l0.67-4.47l2.88,2.01l0.44-4.47l-3.55-2.23l0.22-14.07l-3.1-2.46L231.89,56L222.58,47.96L222.58,47.96z M249.63,57.79l-2.88-1.34l-1.55,2.01l3.1,4.92l0.22,4.69l6.65-4.02v-5.81l2.44-2.46l-2.44-1.79h-3.99L249.63,57.79L249.63,57.79z M263.82,55.78l-4.66,3.8l1.11,4.69h2.88l1.33-2.46l2,2.01l2-0.22l5.32-4.47L263.82,55.78L263.82,55.78z M263.37,48.4l-1.11,2.23l4.88,1.79l1.33-2.01L263.37,48.4L263.37,48.4z M260.49,39.91l-4.88,0.67l-2.88,2.68l5.32,0.22l-1.55,4.02l1.11,1.79l1.55-0.22l3.77-6.03L260.49,39.91L260.49,39.91z M268.92,38.35l-2.66,0.89l0.44,3.57l4.43,2.9l0.22,2.23l-1.33,1.34l0.67,4.47l17.07,5.58l4.66,1.56l4.66-4.02l-5.54-4.47l-5.1,1.34l-7.09-0.67l-2.66-2.68l-0.67-7.37l-4.43-2.23L268.92,38.35L268.92,38.35z M282.88,61.59L278,61.14l-5.76,2.23l-3.1,4.24l0.89,11.62l9.53,0.45l9.09,4.47l6.43,7.37l4.88-0.22l-1.33,6.92l-4.43,7.37l-4.88,2.23l-3.55-0.67l-1.77-1.56l-2.66,3.57l1.11,3.57l3.77,0.22l4.66-2.23l3.99,10.28l9.98,6.48l6.87-8.71l-5.76-9.38l3.33-3.8l4.66,7.82l8.42-7.37l-1.55-3.35l-5.76,1.79l-3.99-10.95l3.77-6.25l-7.54-8.04l-4.21,2.9l-3.99-8.71l-8.42,1.12l-2.22-10.5l-6.87,4.69l-0.67,5.81h-3.77l0.44-5.14L282.88,61.59L282.88,61.59z M292.86,65.61l-1.77,1.79l1.55,2.46l7.32,0.89l-4.66-4.92L292.86,65.61L292.86,65.61z M285.77,40.36v2.01l-4.88,1.12l1.33,2.23l5.54,2.23l6.21,0.67l4.43,3.13l4.43-2.46l-3.1-3.13h3.99l2.44-2.68l5.99-0.89v-1.34l-3.33-2.23l0.44-2.46l9.31,1.56l13.75-5.36l-5.1-1.56l1.33-1.79h10.64l1.77-1.79l-21.51-7.6l-5.1-1.79l-5.54,4.02l-6.21-5.14l-3.33-0.22l-0.67,4.25l-4.21-3.8l-4.88,1.56l0.89,2.46l7.32,1.56l-0.44,3.57l3.99,2.46l9.76-2.46l0.22,3.35l-7.98,3.8l-4.88-3.8l-4.43,0.45l4.43,6.26l-2.22,1.12l-3.33-2.9l-2.44,1.56l2.22,4.24h3.77l-0.89,4.02l-3.1-0.45l-3.99-4.25L285.77,40.36L285.77,40.36z M266.01,101.85l-4.23,5.32l-0.26,5.86l3.7-2.13h4.49l3.17,2.93l2.91-2.4L266.01,101.85L266.01,101.85z M317.52,171.05l-10.57,10.12l1.06,2.4l12.94,4.79l1.85-3.19l-1.06-5.32l-4.23,0.53l-2.38-2.66l3.96-3.99L317.52,171.05L317.52,171.05z M158.22,48.66l1.99,3.01l1,4.02l4.98,1.25l3.49-3.76l2.99,1.51l8.47,0.75l5.98-2.51l1,8.28h3.49V57.7l3.49,0.25l8.72,10.29l5.73,3.51l-2.99,4.77l1.25,1.25L219,80.03l0.25,5.02l2.99,0.5l0.75-7.53l4.73-1.25l3.49,5.27l7.47,3.51l3.74,0.75l2.49-3.01l0.25-4.77l4.48-2.76l1.49,4.02l-3.99,7.03l0.5,3.51l2.24-3.51l4.48-4.02l0.25-5.27l-2.49-4.02l0.75-3.26l5.98-3.01l2.74,2.01l0.5,17.57l4.23-3.76l2.49,1.51l-3.49,6.02l4.48,1l6.48-10.04l5.48,5.77l-2.24,10.29l-5.48,3.01l-5.23-2.51l-9.46,2.01l1,3.26l-2.49,4.02l-7.72,1.76l-8.72,6.78l-7.72,10.29l-1,3.26l5.23,2.01l1.99,5.02l7.22,7.28l11.46,5.02l-2.49,11.54l-0.25,3.26l2.99,2.01l3.99-5.27l0.5-10.04l6.23-0.25l2.99-5.77l0.5-8.78l7.97-15.56l9.96,3.51l5.23,7.28l-2.24,7.28l3.99,2.26l9.71-6.53l2.74,17.82l8.97,10.79l0.25,5.52l-9.96,2.51l-4.73,5.02l-9.96-2.26l-4.98-0.25l-8.72,6.78l5.23-1.25l6.48-1.25l1.25,1.51l-1.74,5.52l0.25,5.02l2.99,2.01l2.99-0.75l1.5-2.26h1.99l-3.24,6.02l-6.23,0.25l-2.74,4.02h-3.49l-1-3.01l4.98-5.02l-5.98,2.01l-0.27-8.53l-1.72-1l-5.23,2.26l-0.5,4.27h-11.96l-10.21,7.03l-13.7,4.52l-1.49-2.01l6.9-10.3l-3.92-3.77l-2.49-4.78l-5.07-3.87l-5.44-0.45l-9.75-6.83l-70.71-11.62l-1.17-4.79l-6.48-6.02v-5.02l1-4.52l-0.5-2.51l-2.49-2.51l-0.5-4.02l6.48-4.52l-3.99-21.58l-5.48-0.25l-4.98-6.53L158.22,48.66L158.22,48.66z M148.76,158.34l-1,4.02l-3.49-2.26h-1.74l-1,4.27l-12.21,27.36l3.24,23.84l3.99,2.01l0.75,6.53h8.22l7.97,6.02l15.69,1.51l1.74,8.03l2.49,1.76l3.49-3.51l2.74,1.25l2.49,11.54l4.23,2.76l3.49-6.53l10.71-7.78l6.97,3.26l5.98,0.5l0.25-3.76l12.45,0.25l2.49,2.76l0.5,6.27l-1.49,3.51l1.74,6.02h3.74l3.74-5.77l-1.49-2.76l-1.49-6.02l2.24-6.78l10.21-8.78l7.72-2.26l-1-7.28l10.71-11.55l10.71-1.76L272.8,199l10.46-6.02v-8.03l-1-0.5l-3.74,1.25l-0.5,4.92l-12.43,0.15l-9.74,6.47l-15.29,5l-2.44-2.99l6.94-10.5l-3.43-3.27l-2.33-4.44l-4.83-3.88l-5.25-0.44l-9.92-6.77L148.76,158.34L148.76,158.34z M133.83,128.41l-1.7,3.26l0.59,2.31l1.11,0.69l-0.26,0.94l-1.19,0.34l0.34,3.43l1.28,1.29l1.02-1.11l-1.28-3.34l0.76-2.66l1.87-2.49l-1.36-2.31L133.83,128.41L133.83,128.41z M139.45,147.95l-1.53,0.6l2.81,3.26l0.68,3.86l2.81,3l2.38-0.43v-3.94l-2.89-1.8L139.45,147.95L139.45,147.95z M194.88,291.52l5.93,4.34l5.98-7.43l-1.02-1.54l-2.04-0.07v-4.35l-1.53-0.93l-4.63,1.38l1.77,4.08L194.88,291.52L194.88,291.52z M207.55,288.78l9.24-0.35l2.74,3.26l-1.71-0.39l-3.29,0.14l-4.3,4.04l-1.84,4.09l-1.21-0.64l-0.01-4.48l-2.66-1.78L207.55,288.78L207.55,288.78z M201.65,296.27l4.7,2.34l-0.07-3.71l-2.41-1.47L201.65,296.27L201.65,296.27z M217.74,292.11l2.19,0.44l0.07,4.49l-2.55,7.28l-6.87-0.68l-1.53-3.51l2.04-4.26l3.87-3.6L217.74,292.11L217.74,292.11z M217.38,304.98l1.39,2.72l1.13,1.5l-1.52,4.51l-2.9-2.04l-4.74-4.34v-2.87L217.38,304.98L217.38,304.98z M220.59,309.61l-1.46,4.56l4.82,1.25l2.99,0.59l0.51-3.53l3.21-1.62l2.85,1.47l1.12,1.79l1.36-0.16l1.07-3.25l-3.56-1.47l-2.7-1.47l-2.7,1.84l-3.21,1.62l-3.28-1.32L220.59,309.61L220.59,309.61z M253.73,299.78l-2.06-0.21l-13.62,11.23l-1.44,3.95l-1.86,0.21l0.83,8.73l-4.75,11.65l5.16,4.37l6.61,0.42l4.54,6.66l6.6,0.21l-0.21,4.99H256l2.68-9.15l-2.48-3.12l0.62-5.82l5.16-0.42l-0.62-13.52l-11.56-3.74l-2.68-7.28L253.73,299.78L253.73,299.78z M250.46,305.92l0.44,2.59l3.25,1.03l0.74-4.77l3.43-3.55l3.43,4.02l7.89,2.15l6.68-1.4l4.55,5.61l3.43,2.15l-3.76,5.73l1.26,4.34l-2.15,2.66l-2.23,1.87l-4.83-2.43l-1.11,1.12v3.46l3.53,1.68l-2.6,2.81l-2.6,2.81l-3.43-0.28l-3.45-3.79l-0.73-14.26l-11.78-4.02l-2.14-6.27L250.46,305.92L250.46,305.92z M285.05,314.13l7.22,6.54l-2.87,3.32l-0.23,1.97l3.77,3.89l-0.09,3.74l-6.56,2.5l-3.93-5.31l0.84-6.38l-1.68-4.75L285.05,314.13L285.05,314.13z M293.13,321.14l2.04,1.87l3.16-1.96l2.88,0.09l-0.37,1.12l-1.21,2.52l-0.19,6.27l-5.75,2.34l0.28-4.02l-3.71-3.46l0.19-1.78L293.13,321.14L293.13,321.14z M302.13,321.8l5.85,3.65l-3.06,6.08l-1.11,1.4l-3.25-1.87l0.09-6.55L302.13,321.8L302.13,321.8z M230.2,335.85l-4.73,2.94l-0.34,4.36l-0.95,1.43l2.98,2.86l-1.29,1.41l0.3,3.6l5.33,1.27l8.07-9.55l-0.02-3.33l-3.87-0.25L230.2,335.85L230.2,335.85z M225.03,349.52l-1.94,1.96l0.13,3.13l16.94,30.88l17.59,11.34l2.72-4.56l0.65-10.03l-1.42-6.25l-4.79-8.08l-2.85,0.91l-1.29,1.43l-5.69-6.52l1.42-7.69l6.6-4.3l-0.52-4.04l-6.72-0.26l-3.49-5.86l-1.94-0.65l0.13,3.52l-8.66,10.29l-6.47-1.56L225.03,349.52L225.03,349.52z M258.71,372.79l8.23-3.59l2.72,0.26l1.81,7.56l12.54,4.17l2.07,6.39l5.17,0.65l2.2,5.47l-1.55,4.95l-8.41,0.65l-3.1,7.95l-6.6-0.13l-2.07-0.39l-3.81,3.7l-1.88-0.18l-6.47-14.99l1.79-2.68l0.63-10.6l-1.6-6.31L258.71,372.79L258.71,372.79z M291.76,399.51l2.2,2.4l-0.26,5.08l6.34-0.39l4.79,6.13l-0.39,5.47l-3.1,4.69l-6.34,0.26l-0.26-2.61l1.81-4.3l-6.21-3.91h-5.17l-3.88-4.17l2.82-8.06L291.76,399.51L291.76,399.51z M300.36,431.93l-2.05,2.19l0.85,11.78l6.44,1.87l8.19-8.21L300.36,431.93L300.36,431.93z M305.47,418.2l1.94,1.82l-7.37,10.95l-2.59,2.87l0.9,12.51l5.69,6.91l-4.78,8.34l-3.62,1.56h-4.14l1.16,6.51l-6.47,2.22l1.55,5.47l-3.88,12.38l4.79,3.91l-2.59,6.38l-4.4,6.91l2.33,4.82l-5.69,0.91l-4.66-5.73l-0.78-17.85l-7.24-30.32l2.19-10.6l-4.66-13.55l3.1-17.59l2.85-3.39l-0.7-2.57l3.66-3.34l8.16,0.56l4.56,4.87l5.27,0.09l5.4,3.3l-1.59,3.72l0.38,3.76l7.65-0.36L305.47,418.2L305.47,418.2z M285.04,514.1l-4.27,9.38l7.37,0.78l0.13-6.25L285.04,514.1L285.04,514.1z M288.92,518.79l0.26,5.73l4.4-0.39l3.75-2.48l-6.34-1.3L288.92,518.79L288.92,518.79z M283.59,512.63l-3.21,3.55l-0.39,4.17l-6.21-3.52l-6.6-9.51l-1.94-3.39l2.72-3.52l-0.26-4.43l-3.1-1.3l-2.46-1.82l0.52-2.48l3.23-0.91l0.65-14.33l-5.04-2.87l-3.29-74.59l0.85-1.48l6.44,14.85l2.06,0.04l0.67,2.37l-2.74,3.32l-3.15,17.87l4.48,13.76l-2.07,10.42l7.3,30.64l0.77,17.92l5.23,6.05L283.59,512.63L283.59,512.63z M262.28,475.14l-1.29,1.95l0.65,3.39l1.29,0.13l0.65-4.3L262.28,475.14L262.28,475.14z M314.24,438.85l6.25-12.02l0.23-10.1l11.66-7.52h6.53l5.13-8.69l0.93-16.68l-2.1-4.46l12.36-11.28l0.47-12.45l-16.79-8.22l-20.28-6.34l-9.56-0.94l2.57-5.4l-0.7-8.22l-2.09-0.69l-3.09,6.14l-1.62,2.03l-4.16-1.84l-13.99,4.93l-4.66-5.87l0.75-6.13l-4.4,4.48l-4.86-2.62l-0.49,0.69l0.01,2.13l4.19,2.25l-6.29,6.63l-3.97-0.04l-4.02-4.09l-4.55,0.14l-0.56,4.86l2.61,3.17l-3.08,9.87l-3.6,0.28l-5.73,3.62l-1.4,7.11l4.97,5.32l0.91-1.03l3.49-0.94l2.98,5.02l8.53-3.66l3.31,0.19l2.28,8.07l12.17,3.86l2.1,6.44l5.18,0.62l2.47,6.15l-1.67,5.47l2.18,2.86l-0.32,4.26l5.84-0.55l5.35,6.76l-0.42,4.75l3.17,2.68l-7.6,11.51L314.24,438.85L314.24,438.85z M204.56,282.4l-0.05,3.65h0.84l2.86-5.34h-1.94L204.56,282.4L204.56,282.4z M817.97,72.93l1.76,6.08l3.52,1.01l3.52-5.57l-2.01-3.8l0.75-3.29h5.28l-1.26,2.53l0.5,9.12l-7.54,18.74l0.75,4.05l-0.25,6.84l14.07,20.51l2.76,0.76l0.25-16.71l2.76-2.53l-3.02-6.58l2.51-2.79l-5.53-7.34l-3.02,0.25l-1-12.15l7.79-2.03l0.5-3.55l4.02-1.01l2.26,2.03l2.76-11.14l4.77-8.1l3.77-2.03l3.27,0.25v-3.8l-5.28-1.01l-7.29-6.08l3.52-4.05l-3.02-6.84l2.51-2.53l3.02,4.05l7.54,2.79l8.29,0.76l1.01-3.54l-4.27-4.3l4.77-6.58l-10.81-3.8l-2.76,5.57l-3.52-4.56l-19.85-6.84l-18.85,3.29l-2.76,1.52v1.52l4.02,2.03l-0.5,4.81l-7.29-3.04l-16.08,6.33l-2.76-5.82h-11.06l-5.03,5.32l-17.84-4.05l-16.33,3.29l-2.01,5.06l2.51,0.76l-0.25,3.8l-15.83,1.77l1.01,5.06l-14.58-2.53l3.52-6.58l-14.83-0.76l1.26,6.84l-4.77,2.28l-4.02-3.8l-16.33,2.79l-6.28,5.82l-0.25,3.54l-4.02,0.25l-0.5-4.05l12.82-11.14v-7.6l-8.29-2.28l-10.81,3.54l-4.52-4.56h-2.01l-2.51,5.06l2.01,2.28l-14.33,7.85l-12.31,9.37l-7.54,10.38v4.3l8.04,3.29l-4.02,3.04l-8.54-3.04l-3.52,3.04l-5.28-6.08l-1.01,2.28l5.78,18.23l1.51,0.51l4.02-2.03l2.01,1.52v3.29l-3.77-1.52l-2.26,1.77l1.51,3.29l-1.26,8.61l-7.79,0.76l-0.5-2.79l4.52-2.79l1.01-7.6l-5.03-6.58l-1.76-11.39l-8.04-1.27l-0.75,4.05l1.51,2.03l-3.27,2.79l1.26,7.6l4.77,2.03l1.01,5.57l-4.78-3.04l-12.31-2.28l-1.51,4.05l-9.8,3.54l-1.51-2.53l-12.82,7.09l-0.25,4.81l-5.03,0.76l1.51-3.54v-3.54l-5.03-1.77l-3.27,1.27l2.76,5.32l2.01,3.54v2.79l-3.77-0.76l-0.75-0.76l-3.77,4.05l2.01,3.54l-8.54-0.25l2.76,3.55l-0.75,1.52h-4.52l-3.27-2.28l-0.75-6.33l-5.28-2.03v-2.53l11.06,2.28l6.03,0.51l2.51-3.8l-2.26-4.05l-16.08-6.33l-5.55,1.38l-1.9,1.63l0.59,3.75l2.36,0.41l-0.55,5.9l7.28,17.1l-5.26,8.34l-0.36,1.88l2.67,1.88l-2.41,1.59l-1.6,0.03l0.3,7.35l2.21,3.13l0.03,3.04l2.83,0.26l4.33,1.65l4.58,6.3l0.05,1.66l-1.49,2.55l3.42-0.19l3.33,0.96l4.5,6.37l11.08,1.01l-0.48,7.58l-3.82,3.27l0.79,1.28l-3.77,4.05l-1,3.8l2.26,3.29l7.29,2.53l3.02-1.77l19.35,7.34l0.75-2.03l-4.02-3.8v-4.81l-2.51-0.76l0.5-4.05l4.02-4.81l-7.21-5.4l0.5-7.51l7.71-5.07l9.05,0.51l1.51,2.79l9.3,0.51l6.79-3.8l-3.52-3.8l0.75-7.09l17.59-8.61l13.53,6.1l4.52-4.05l13.32,12.66l10.05-1.01l3.52,3.54l9.55,1.01l6.28-8.61l8.04,3.55l4.27,0.76l4.27-3.8l-3.77-2.53l3.27-5.06l9.3,3.04l2.01,4.05l4.02,0.25l2.51-1.77l6.79-0.25l0.75,1.77l7.79,0.51l5.28-5.57l10.81,1.27l3.27-1.27l1-6.08l-3.27-7.34l3.27-2.79h10.3l9.8,11.65l12.56,7.09h3.77l0.5-3.04l4.52-2.79l0.5,16.46l-4.02,0.25v4.05l2.26,2.79l-0.42,3.62l1.67,0.69l1.01-2.53l1.51,0.51l1,1.01l4.52-1.01l4.52-13.17l0.5-16.46l-5.78-13.17l-7.29-8.86l-3.52,0.51v2.79l-8.54-3.29l3.27-7.09l2.76-18.74l11.56-3.54l5.53-3.54h6.03L805.86,96l1.51,2.53l5.28-5.57l3.02,0.25l-0.5-3.29l-4.78-1.01l3.27-11.9L817.97,72.93L817.97,72.93z M670.4,170.07l-3.46,8.7l-4.77-0.25l-5.03,11.01l4.27,5.44l-8.8,12.15l-4.52-0.76l-3.02,3.8l0.75,2.28l3.52,0.25l1.76,4.05l3.52,0.76l10.81,13.93v7.09l5.28,3.29l5.78-1.01l7.29,4.3l8.8,2.53l4.27-0.51l4.78-0.51l10.05-6.58l3.27,0.51l1.25,2.97l2.77,0.83l3.77,5.57l-2.51,5.57l1.51,3.8l4.27,1.52l0.75,4.56l5.03,0.51l0.75-2.28l7.29-3.8l4.52,0.25l5.28,5.82l3.52-1.52l2.26,0.25l1.01,2.79l1.76,0.25l2.51-3.54l10.05-3.8l9.05-10.89l3.02-10.38l-0.25-6.84l-3.77-0.76l2.26-2.53l-0.5-4.05l-9.55-9.62v-4.81l2.76-3.54l2.76-1.27l0.25-2.79h-7.04l-1.26,3.8l-3.27-0.76l-4.02-4.3l2.51-6.58l3.52-3.8l3.27,0.25l-0.5,5.82l1.76,1.52l4.27-4.3l1.51-0.25l-0.5-3.29l4.02-4.81l3.02,0.25l1.76-5.57l2.06-1.09l0.21-3.47l-2-2.1l-0.17-5.48l3.85-0.25l-0.25-14.13l-2.7,1.62l-1.01,3.62l-4.51-0.01l-13.07-7.35l-9.44-11.38l-9.58-0.1l-2.44,2.12l3.1,7.1l-1.08,6.66l-3.86,1.6l-2.17-0.17l-0.16,6.59l2.26,0.51l4.02-1.77l5.28,2.53v2.53l-3.77,0.25l-3.02,6.58l-2.76,0.25l-9.8,12.91l-10.3,4.56l-7.04,0.51l-4.77-3.29l-6.79,3.55l-7.29-2.28l-1.76-4.81l-12.31-0.76l-6.53-10.63h-2.76l-2.22-4.93L670.4,170.07z M673.8,170.17l5.82-7.72l6.99,3.23l4.75,1.27l5.82-5.34l-3.95-2.91l2.6-3.67l7.76,2.74l2.69,4.41l4.86,0.13l2.54-1.89l5.23-0.21l1.14,1.94l8.69,0.44l5.5-5.61l7.61,0.8l-0.44,7.64l3.33,0.76l4.09-1.86l4.33,2.14l-0.1,1.08l-3.14,0.09l-3.27,6.86l-2.54,0.25l-9.88,12.91l-10.09,4.45l-6.31,0.49l-5.24-3.38l-6.7,3.58l-6.6-2.05l-1.87-4.79l-12.5-0.88l-6.4-10.85l-3.11-0.2L673.8,170.17L673.8,170.17z M778.28,194.27l1.84,0.77l0.56,6.44l3.65,0.21l3.44-4.03l-1.19-1.06l0.14-4.32l3.16-3.82l-1.61-2.9l1.05-1.2l0.58-3l-1.83-0.83l-1.56,0.79l-1.93,5.86l-3.12-0.27l-3.61,4.26L778.28,194.27L778.28,194.27z M788.34,198.2l6.18,5.04l1.05,4.88l-0.21,2.62l-3.02,3.4l-2.6,0.14l-2.95-6.37l-1.12-3.04l1.19-0.92l-0.28-1.27l-1.47-0.66L788.34,198.2L788.34,198.2z M576.69,188.62l4.1-1.75l4.58-0.16l0.32,7h-2.68l-2.05,3.34l2.68,4.45l3.95,2.23l0.36,2.55l1.45-0.48l1.34-1.59l2.21,0.48l1.11,2.23h2.84v-2.86l-1.74-5.09l-0.79-4.13l5.05-2.23l6.79,1.11l4.26,4.29l9.63-0.95l5.37,7.63l6.31,0.32l1.74-2.86l2.21-0.48l0.32-3.18l3.31-0.16l1.74,2.07l1.74-4.13l14.99,2.07l2.52-3.34l-4.26-5.25l5.68-12.4l4.58,0.32l3.16-7.63l-6.31-0.64l-3.63-3.5l-10,1.16l-12.88-12.45l-4.54,4.03l-13.77-6.25l-16.89,8.27l-0.47,5.88l3.95,4.61l-7.7,4.35l-9.99-0.22l-2.09-3.07l-7.83-0.43l-7.42,4.77l-0.16,6.52L576.69,188.62L576.69,188.62z M593.85,207.59l-0.62,2.63h-4.15v3.56l4.46,2.94l-1.38,4.03v1.86l1.85,0.31l2.46-3.25l5.54-1.24l11.84,4.49l0.15,3.25l6.61,0.62l7.38-7.75l-0.92-2.48l-4.92-1.08l-13.84-8.99l-0.62-3.25h-5.23l-2.31,4.34h-2.31L593.85,207.59L593.85,207.59z M628.92,219.06l3.08,0.16v-5.27l-2.92-1.7l4.92-6.2h2l2,2.33l5.23-2.01l-7.23-2.48l-0.28-1.5l-1.72,0.42l-1.69,2.94l-7.29-0.24l-5.35-7.57l-9.4,0.93l-4.48-4.44l-6.2-1.05l-4.5,1.83l2.61,8.68l0.03,2.92l1.9,0.04l2.33-4.44l6.2,0.08l0.92,3.41l13.29,8.82l5.14,1.18L628.92,219.06L628.92,219.06z M630.19,211.84l4.11-5.1h1.55l0.54,1.14l-1.9,1.38v1.14l1.25,0.9l6.01,0.36l1.96-0.84l0.89,0.18l0.6,1.92l3.57,0.36l1.79,3.78l-0.54,1.14l-0.71,0.06l-0.71-1.44l-1.55-0.12l-2.68,0.36l-0.18,2.52l-2.68-0.18l0.12-3.18l-1.96-1.92l-2.98,2.46l0.06,1.62l-2.62,0.9h-1.55l0.12-5.58L630.19,211.84L630.19,211.84z M636.81,199.21l-0.31,2.53l0.25,1.56l8.7,2.92l-7.64,3.08l-0.87-0.72l-1.65,1.06l0.08,0.58l0.88,0.4l5.36,0.14l2.72-0.82l3.49-4.4l4.37,0.76l5.27-7.3l-14.1-1.92l-1.95,4.73l-2.46-2.64L636.81,199.21L636.81,199.21z M614.12,227.05l1.59,12.46l3.96,0.87l0.37,2.24l-2.84,2.37l5.29,4.27l10.28-3.7l0.82-4.38l6.47-4.04l2.48-9.36l1.85-1.99l-1.92-3.34l6.26-3.87l-0.8-1.12l-2.89,0.18l-0.26,2.66l-3.88-0.04l-0.07-3.55l-1.25-1.49l-2.1,1.91l0.06,1.75l-3.17,1.2l-5.85-0.37l-7.6,7.96L614.12,227.05L614.12,227.05z M623.13,249.84l2.6,3.86l-0.25,1.99l-3.46,1.37l-0.25,3.24h3.96l1.36-1.12h7.54l6.8,5.98l0.87-2.87h5.07l0.12-3.61l-5.19-4.98l1.11-2.74l5.32-0.37l7.17-14.95l-3.96-3.11l-1.48-5.23l9.64-0.87l-5.69-8.1l-3.03-0.82l-1.24,1.5l-0.93,0.07l-5.69,3.61l1.86,3.12l-2.1,2.24l-2.6,9.59l-6.43,4.11l-0.87,4.49L623.13,249.84L623.13,249.84z M670.98,313.01l4.58-2.24l2.72-9.84l-0.12-12.08l15.58-16.82v-3.99l3.21-1.25l-0.12-4.61l-3.46-6.73l1.98-3.61l4.33,3.99l5.56,0.25v2.24l-1.73,1.87l0.37,1l2.97,0.12l0.62,3.36h0.87l2.23-3.99l1.11-10.46l3.71-2.62l0.12-3.61l-1.48-2.87l-2.35-0.12l-9.2,6.08l0.58,3.91l-6.46-0.02l-2.28-2.79l-1.24,0.16l0.42,3.88l-13.97-1l-8.66-3.86l-0.46-4.75l-5.77-3.58l-0.07-7.37l-3.96-4.53l-9.1,0.87l0.99,3.96l4.46,3.61l-7.71,15.78l-5.16,0.39l-0.85,1.9l5.08,4.7l-0.25,4.75l-5.19-0.08l-0.56,2.36l4.31-0.19l0.12,1.87l-3.09,1.62l1.98,3.74l3.83,1.25l2.35-1.74l1.11-3.11l1.36-0.62l1.61,1.62l-0.49,3.99l-1.11,1.87l0.25,3.24L670.98,313.01L670.98,313.01z M671.19,242.56l0.46,4.27l8.08,3.66l12.95,0.96l-0.49-3.13l-8.65-2.38l-7.34-4.37L671.19,242.56L671.19,242.56z M695.4,248.08l1.55,2.12l5.24,0.04l-0.53-2.9L695.4,248.08L695.4,248.08z M695.57,253.11l-1.31,2.37l3.4,6.46l0.1,5.04l0.62,1.35l3.99,0.07l2.26-2.17l1.64,0.99l0.33,3.07l1.31-0.82l0.08-3.92l-1.1-0.13l-0.69-3.33l-2.78-0.1l-0.69-1.85l1.7-2.27l0.03-1.12h-4.94L695.57,253.11L695.57,253.11z M729.44,303.65l-2.77-4.44l2.01-2.82l-1.9-3.49l-1.79-0.34l-0.34-5.86l-2.68-5.19l-0.78,1.24l-1.79,3.04l-2.24,0.34l-1.12-1.47l-0.56-3.95l-1.68-3.16l-6.84-6.45l1.68-1.11l0.31-4.67l2.5-4.2l1.08-10.45l3.62-2.47l0.12-3.81l2.17,0.72l3.42,4.95l-2.54,5.44l1.71,4.27l4.23,1.66l0.77,4.65l5.68,0.88l-1.57,2.71l-7.16,2.82l-0.78,4.62l5.26,6.76l0.22,3.61l-1.23,1.24l0.11,1.13l3.92,5.75l0.11,5.97L729.44,303.65L729.44,303.65z M730.03,270.47l3.24,4.17v5.07l1.12,0.56l5.15-2.48l1.01,0.34l6.15,7.1l-0.22,4.85l-2.01-0.34l-1.79-1.13l-1.34,0.11l-2.35,3.94l0.45,2.14l1.9,1.01l-0.11,2.37l-1.34,0.68l-4.59-3.16v-2.82l-1.9-0.11l-0.78,1.24l-0.4,12.62l2.97,5.42l5.26,5.07l-0.22,1.47l-2.8-0.11l-2.57-3.83h-2.69l-3.36-2.71l-1.01-2.82l1.45-2.37l0.5-2.14l1.58-2.8l-0.07-6.44l-3.86-5.58l-0.16-0.68l1.25-1.26l-0.29-4.43l-5.14-6.51l0.6-3.75L730.03,270.47L730.03,270.47z M732.71,315.45l2.01,4.51l0.45,5.86l2.69,4.17l6.49,3.94l2.46,0.23l-0.45-4.06l-2.13-5.18l-3.12-6.63l-0.26,1.16l-3.76-0.17l-2.7-3.88L732.71,315.45L732.71,315.45z M740.48,299.47l4.09,4.37l7.61-5.64l0.67-8.9l-3.93,2.71l-2.04-1.14l-2.77-0.37l-1.55-1.09l-0.75,0.04l-2.03,3.33l0.33,1.54l2.06,1.15l-0.25,3.13L740.48,299.47L740.48,299.47z M735.47,262.93l-2.42,1.23l-2.01,5.86l3.36,4.28l-0.56,4.73l0.56,0.23l5.59-2.71l7.5,8.38l-0.18,5.28l1.63,0.88l4.03-3.27l-0.33-2.59l-11.63-11.05l0.11-1.69l1.45-1.01l-1.01-2.82l-4.81-0.79L735.47,262.93L735.47,262.93z M745.06,304.45l1.19,1.87l0.22,2.14l3.13,0.34l3.8-5.07l3.58-1.01l1.9-5.18l-0.89-8.34l-3.69-5.07l-3.89-3.11l-4.95-8.5l3.55-5.94l-5.08-5.83l-4.07-0.18l-3.66,1.97l1.09,4.71l4.88,0.86l1.31,3.63l-1.72,1.12l0.11,0.9l11.45,11.2l0.45,3.29l-0.69,10.4L745.06,304.45L745.06,304.45z M555.46,204.16l3.27,4.27l4.08,1.88l2.51-0.01l4.31-1.17l1.08-1.69l-12.75-4.77L555.46,204.16L555.46,204.16z M569.72,209.89l4.8,6.26l-1.41,1.65l-3.4-0.59l-4.22-3.78l0.23-2.48L569.72,209.89L569.72,209.89z M571.41,207.72l-1.01,1.72l4.71,6.18l1.64-0.53l2.7,2.83l1.17-4.96l2.93,0.47l-0.12-1.42l-4.82-4.22l-0.92,2.48L571.41,207.72L571.41,207.72z M569.65,217.95l-1.22,1.27l0.12,2.01l1.52,2.13l5.39,5.9l-0.82,2.36h-0.94l-0.47,2.36l3.05,3.9l2.81,0.24l5.63,7.79l3.16,0.24l2.46,1.77l0.12,3.54l9.73,5.67h3.63l2.23-1.89l2.81-0.12l1.64,3.78l10.51,1.46l0.31-3.86l3.48-1.26l0.16-1.38l-2.77-3.78l-6.17-4.96l3.24-2.95l-0.23-1.3l-4.06-0.63l-1.72-13.7l-0.2-3.15l-11.01-4.21l-4.88,1.1l-2.73,3.35l-2.42-0.16l-0.7,0.59l-5.39-0.35l-6.8-4.96l-2.53-2.77l-1.16,0.28l-2.09,2.39L569.65,217.95L569.65,217.95z M558.7,209.19l-2.23,2.36l-8.2-0.24l-4.92-2.95l-4.8-0.12l-5.51,3.9l-5.16,0.24l-0.47,2.95h-5.86l-2.34,2.13v1.18l1.41,1.18v1.3l-0.59,1.54l0.59,1.3l1.88-0.94l1.88,2.01l-0.47,1.42l-0.7,0.95l1.05,1.18l5.16,1.06l3.63-1.54v-2.24l1.76,0.35l4.22,2.48l4.57-0.71l1.99-1.89l1.29,0.47v2.13h1.76l1.52-2.95l13.36-1.42l5.83-0.71l-1.54-2.02l-0.03-2.73l1.17-1.4l-4.26-3.42l0.23-2.95h-2.34L558.7,209.19L558.7,209.19z M571.99,289.23l1.44,4.28v4.18l3.46,3.14l24.38-9.93l0.23-2.73l-3.91-7.02l-9.81,3.13l-5.63,5.54l-6.53-3.86L571.99,289.23L571.99,289.23z M598.38,280.84l7.39-4.26l1.31-6.25l-1.62-0.93l0.67-6.7l1.41-0.82l1.51,2.37l8.99,4.7v2.61l-10.89,16.03l-5.01,0.17L598.38,280.84L598.38,280.84z M594.01,264.94l0.87,3.48l9.86,0.87l0.69-7.14l1.9-1.04l0.52-2.61l-3.11,0.87l-3.46,5.23L594.01,264.94L594.01,264.94z M592.63,259.02l-0.52,4.01l1.54,1.17l1.4-0.13l0.52-5.05l-1.21-0.87L592.63,259.02L592.63,259.02z M583.29,247.17l-2.25-1.22l-1.56,1.57l0.17,3.14l3.63,1.39L583.29,247.17L583.29,247.17z M584,253.24l7.01,9.77l2.26,1.8l1.01,4.38l10.79,0.85l1.22,0.64l-1.21,5.4l-7.09,4.18l-10.37,3.14l-5.53,5.4l-6.57-3.83l-3.98,3.48L566,279.4l-3.8-1.74l-1.38-2.09v-4.53l-13.83-16.72l-0.52-2.96h3.98l4.84-4.18l0.17-2.09l-1.38-1.39l2.77-2.26l5.88,0.35l10.03,8.36l5.92-0.27l0.38,1.46L584,253.24L584,253.24z M546.67,229.13l-0.35,2.54l2.82,1.18l-0.12,7.04l2.82-0.06l2.82-2.13l1.06-0.18l6.4-5.09l1.29-7.39l-12.79,1.3l-1.35,2.96L546.67,229.13L546.67,229.13z M564.31,225.03l-1.56,7.71l-6.46,5.38l0.41,2.54l6.31,0.43l10.05,8.18l5.62-0.16l0.15-1.89l2.06-2.21l2.88,1.63l0.38-0.36l-5.57-7.41l-2.64-0.16l-3.51-4.51l0.7-3.32l1.07-0.14l0.37-1.47l-4.78-5.03L564.31,225.03L564.31,225.03z M548.9,240.78l-2.46,8.58l-0.11,1.31h3.87l4.33-3.82l0.11-1.45l-1.77-1.81l3.17-2.63l-0.46-2.44l-0.87,0.2l-2.64,1.89L548.9,240.78L548.9,240.78z M546.2,232.44l0.06,1.95l-0.82,2.96l2.82,0.24l0.18-4.2L546.2,232.44L546.2,232.44z M545.32,238.06l-1.58,5.03l2.05,6.03l2.35-8.81v-1.89L545.32,238.06L545.32,238.06z M543.21,229.84l1.23,0.89l-3.81,3.61l-1.82-0.06l-1.35-0.95l0.18-1.77l2.76-0.18L543.21,229.84L543.21,229.84z M515.46,102.14l2.02-1.48L517.3,99l-1.28-0.74l0.18-2.03h1.1v-1.11l-4.77-1.29l-7.15,0.74l-0.73,3.14L503,97.16l-1.1-1.85l-3.49,0.18L498.04,99l-1.65,0.74l-0.92-1.85l-7.34,5.91l1.47,1.66l-2.75,1.29l-6.24,12.38l-2.2,1.48l0.18,1.11l2.2,1.11l-0.55,2.4l-3.67-0.19l-1.1-1.29l-2.38,2.77l-1.47,1.11l-0.37,2.59l-1.28,0.74l-3.3,0.74l-1.65,5.18l1.1,8.5l1.28,3.88l1.47,1.48l3.3-0.18l4.77-4.62l1.83-3.14l0.55,4.62l3.12-5.54l0.18-15.53l2.54-1.6l0.76-8.57l7.7-11.09l3.67-1.29l1.65-2.03l5.5,1.29l2.75,1.66l0.92-4.62l4.59-2.77L515.46,102.14L515.46,102.14z M446.12,149.08l-1.83,2.77l0.73,1.11h4.22v1.85l-1.1,1.48l0.73,3.88l2.38,4.62l1.83,4.25l2.93,1.11l1.28,2.22l-0.18,2.03l-1.83,1.11l-0.18,0.92l1.28,0.74l-1.1,1.48l-2.57,1.11l-4.95-0.55l-7.71,3.51l-2.57-1.29l7.34-4.25l-0.92-0.55l-3.85-0.37l2.38-3.51l0.37-2.96l3.12-0.37l-0.55-5.73l-3.67-0.18l-1.1-1.29l0.18-4.25l-2.2,0.18l2.2-7.39l4.04-2.96L446.12,149.08L446.12,149.08z M438.42,161.47l-3.3,0.37l-0.18,2.96l2.2,1.48l2.38-0.55l0.92-1.66L438.42,161.47L438.42,161.47z M439.51,166.55l-0.91,6l-8.07,2.96h-2.57l-1.83-1.29v-1.11l4.04-2.59l-1.1-2.22l0.18-3.14l3.49,0.18l1.6-3.76l-0.21,3.34l2.71,2.15L439.51,166.55L439.51,166.55z M497.72,104.58l1.96,1.81h3.67l2.02,3.88l0.55,6.65l-4.95,3.51v3.51l-3.49,4.81l-2.02,0.18l-2.75,4.62l0.18,4.44l4.77,3.51l-0.37,2.03l-1.83,2.77l-2.75,2.4l0.18,7.95l-4.22,1.48l-1.47,3.14h-2.02l-1.1-5.54l-4.59-7.04l3.77-6.31l0.26-15.59l2.6-1.43l0.63-8.92l7.41-10.61L497.72,104.58L497.72,104.58z M506.79,116.94l2.07,0.91l1.28,2.4l-1.28,1.66l-6.42,7.02l-1.1,3.7l1.47,5.36l4.95,3.7l6.6-3.14l5.32-0.74l4.95-7.95l-3.67-8.69l-3.49-8.32l0.55-5.36l-2.2-0.37l-0.57-3.91l-2.96-4.83l-3.28,2.27l-1.29,5.27l-3.48-2.09l-4.84-1.18l-1.08,1.26l1.86,1.68l3.39-0.06l2.73,4.41L506.79,116.94L506.79,116.94z M518.07,151.37l-6.85-1.11l0.15,3.83l6.35,3.88l2.6-0.76l-0.15-2.92L518.07,151.37L518.07,151.37z M506.76,147.64l-1.55-0.05l-0.9,0.91l0.65,0.96l1.55,0.1l0.8-1.16L506.76,147.64L506.76,147.64z M506.61,151.72l-1.5-0.15l-2.7,3.23v1.51l0.9,0.35l1.75,0.05l2.9-2.37l0.4-0.81L506.61,151.72L506.61,151.72z M510.81,154.7l-2.15-0.05l-2.95,2.82h-2.5l0.15,3.53l-1.5,2.77l5.4,0.05l1.55-0.2l1.55,1.87l3.55-0.15l3.4-4.33l-0.2-2.57L510.81,154.7L510.81,154.7z M510.66,166.29l1.5,2.47l-0.6,1.97l0.1,1.56l0.55,1.87l3.1-1.76l3.85,0.1l2.7,1.11h6.85l2-4.79l1.2-1.81v-1.21l-4.3-6.05l-3.8-1.51l-3.1-0.35l-2.7,0.86l0.1,2.72l-3.75,4.74L510.66,166.29L510.66,166.29z M511.46,174.76l0.85,1.56l0.2,1.66l-0.7,1.61l-1.6,3.08l-1.35,0.61l-1.75-0.76l-1.05,0.05l-2.55,0.96l-2.9-0.86l-4.7-3.33l-4.6-2.47l-1.85-2.82l-0.35-6.65l3.6-3.13l4.7-1.56l1.75-0.2l-0.7,1.41l0.45,0.55l7.91,0.15l1.7-0.05l2.8,4.29l-0.7,1.76l0.3,2.07L511.46,174.76L511.46,174.76z M448.36,205h-12.74l-2.57-1.16l-1.24,0.09l-1.5,3.12l0.53,3.21l4.87,0.45l0.62,2.05l-2.12,11.95l0.09,2.14l3.45,1.87l3.98,0.27l7.96-1.96l3.89-4.9l0.09-4.99l6.9-6.24l0.35-2.76l-6.28-0.09L448.36,205L448.36,205z M430.93,211.24l-0.62,8.65l-1.77,1.6l0.18,0.98l1.24,2.05l-0.8,2.5l1.33,0.45l3.1-0.36l-0.18-2.5l2.03-11.59l-0.44-1.6L430.93,211.24L430.93,211.24z M461.1,217.21l-1.59,0.54l0.35,1.43h2.3l0.97-1.07L461.1,217.21L461.1,217.21z M477.56,213.38l-2.65,1.34l0.35,5.17l2.12,0.36l1.59-1.52v-4.9L477.56,213.38L477.56,213.38z M477.83,206.96l-1.95,1.96l-0.18,1.78l1.59,0.98l0.62-0.09l0.35-2.59L477.83,206.96L477.83,206.96z M460.4,178.7l-2.21,0.54l-4.42,4.81l-1.33,0.09l-1.77-1.25l-1.15,0.27l-0.88,2.76l-6.46,0.18l0.18,1.43l4.42,2.94l5.13,4.1l-0.09,4.9l-2.74,4.81l5.93,2.85l6.02,0.18l1.86-2.14l3.8,0.09l1.06,0.98l3.8-0.27l1.95-2.5l-2.48-2.94l-0.18-1.87l0.53-2.05l-1.24-1.78l-2.12,0.62l-0.27-1.6l4.69-5.17v-3.12l-3.1-1.78l-1.59-0.27L460.4,178.7L460.4,178.7z M470.09,168.27l-4.53,2.23l0.96,0.87l0.1,2.23l-0.96-0.19l-1.06-1.65l-2.53,4.01l3.89,0.81l1.45,1.53l0.77,0.02l0.51-3.46l2.45-1.03L470.09,168.27L470.09,168.27z M461.61,176.52l-0.64,1.6l6.88,4.54l1.98,0.47l0.07-2.15l-1.73-1.94h-1.06l-1.45-1.65L461.61,176.52L461.61,176.52z M471.14,167.88l3.57-0.58v-2.52l2.99-0.49l1.64,1.65l1.73,0.19l2.7-1.17l2.41,0.68l2.12,1.84l0.29,6.89l2.12,2.82l-2.79,0.39l-4.63,2.91l0.39,0.97l4.14,3.88l-0.29,1.94l-3.85,1.94l-3.57,0.1l-0.87,1.84h-1.83l-0.87-1.94l-3.18-0.78l-0.1-3.2l-2.7-1.84l0.29-2.33l-1.83-2.52l0.48-3.3l2.5-1.17L471.14,167.88L471.14,167.88z M476.77,151.5l-4.15,4.59l-0.15,2.99l1.89,4.93l2.96-0.56l-0.37-4.03l2.04-2.28l-0.04-1.79l-1.44-3.73L476.77,151.5L476.77,151.5z M481.44,159.64l-0.93-0.04l-1.22,1.12l0.15,1.75l2.89,0.08l0.15-1.98L481.44,159.64L481.44,159.64z M498.49,150.17l-2.11,1.67l1.06,2.45l1.87-1.82L498.49,150.17L498.49,150.17z M472.91,189.38l-4.36,4.64l0.09,0.47l1.79-0.56l1.61,2.24l2.72-0.96l1.88,1.46l0.77-0.44l2.32-3.64l-0.59-0.56l-2.29-0.06l-1.11-2.27L472.91,189.38L472.91,189.38z M488.43,184.87h2.97h1.46l2.37,1.69l4.39-3.65l-4.26-3.04l-4.22-2.04l-2.89,0.52l-3.92,2.52L488.43,184.87L488.43,184.87z M495.84,187.13l0.69,0.61l0.09,1.04l7.63-0.17l5.64-2.43l-0.09-2.47l-1.08,0.48l-1.55-0.83l-0.95-0.04l-2.5,1l-3.4-0.82L495.84,187.13L495.84,187.13z M480.63,190.12l-0.65,1.35l0.56,0.96l2.33-0.48h1.98l2.15,1.82l4.57-0.83l3.36-2l0.86-1.35l-0.13-1.74l-3.02-2.26l-4.05,0.04l-0.34,2.3l-4.26,2.08L480.63,190.12L480.63,190.12z M496.74,189.6l-1.16,1.82l0.09,2.78l1.85,0.95l5.69,0.17l7.93-6.68l0.04-1.48l-0.86-0.43l-5.73,2.6L496.74,189.6L496.74,189.6z M494.8,191.99l-2.54,1.52l-4.74,1.04l0.95,2.74l3.32,0.04l3.06-2.56L494.8,191.99L494.8,191.99z M495.62,195.16l-3.53,2.91h-3.58l-0.43,2.52l1.64,0.43l0.82-1.22l1.29,1.13l1.03,3.6l7.07,3.3l0.7-0.8l-7.17-7.4l0.73-1.35l6.81-0.26l0.69-2.17l-4.44,0.13L495.62,195.16L495.62,195.16z M494.8,198.94l-0.37,0.61l6.71,6.92l2.46-3.62l-0.09-1.43l-2.15-2.61L494.8,198.94L494.8,198.94z M472.27,196.98l-0.62,1.57l0.17,1.71l2.39,2.79l3.76-0.13l8.3,9.64l5.18,1.5l3.06,2.89l0.73,6.59l1.64-0.96l1.42-3.59l-0.35-2.58l2.43-0.22l0.35-1.46l-6.85-3.28l-6.5-6.39l-2.59-3.82l-0.63-3.63l3.31-0.79l-0.85-2.39l-2.03-1.71l-1.75-0.08l-2.44,0.67l-2.3,3.22l-1.39,0.92l-2.15-1.32L472.27,196.98L472.27,196.98z M492.44,223.02l-1.45-0.78l-4.95,0.78l0.17,1.34l4.45,2.24l0.67,0.73l1.17,0.17L492.44,223.02L492.44,223.02z M492.61,230.47l-1.67,0.34l0.06,1.85l1.5,0.5l0.67-0.56L492.61,230.47L492.61,230.47z M515.57,173.15l-2.9,1.63l0.72,3.08l-2.68,5.65l0.02,2.49l1.26,0.8l8.08,0.4l2.26-1.87l2.42,0.81l3.47,4.63l-2.54,4.56l3.02,0.88l3.95-4.55l2.26,0.41l2.1,1.46l-1.85,2.44l2.5,3.9h2.66l1.37-2.6l2.82-0.57l0.08-2.11l-5.24-0.81l0.16-2.27h5.08l5.48-4.39l2.42-2.11l0.4-6.66l-10.8-0.97l-4.43-6.25l-3.06-1.05l-3.71,0.16l-1.67,4.13l-7.6,0.1l-2.47-1.14L515.57,173.15L515.57,173.15z M520.75,187.71l3.1,4.77l-0.26,2.7l1.11,0.05l2.63-4.45l-3.16-3.92l-1.79-0.74L520.75,187.71L520.75,187.71z M512.18,187.6l-0.26,1.48l-5.79,4.82l4.84,7.1l3.1,2.17h5.58l1.84-1.54l2.47-0.32l1.84,1.11l3.26-3.71l-0.63-1.86l-3.31-0.85l-2.26-0.11l0.11-3.18l-3-4.72L512.18,187.6L512.18,187.6z M511.44,202.39l0.16,4.98l1.68,3.5l6.31,0.11l2.84-2.01l2.79-1.11l-0.68-3.18l0.63-1.7l-1.42-0.74l-1.95,0.16l-1.53,1.54l-6.42,0.05L511.44,202.39L511.44,202.39z M504.02,209.76v4.61l1.32,2.49l0.95-0.11l1.63-2.97l-0.95-1.33l-0.37-3.29l-1.26-1.17L504.02,209.76L504.02,209.76z M510.92,208.01l-3.37,1.11l0.16,2.86l0.79,1.01l4-1.86L510.92,208.01L510.92,208.01z M506.71,217.6l-0.11,1.33l4.63,2.33l2.21,0.85l-1.16,1.22l-2.58,0.26l-0.37,1.17l0.89,2.01l2.89,1.54l1.26,0.11l0.16-3.45l1.89-2.28l-5.16-6.1l0.68-2.07l1.21-0.05l1.84,1.48l1.16-0.58l0.37-2.07l5.42,0.05l0.21-3.18l-2.26,1.59l-6.63-0.16l-4.31,2.23L506.71,217.6L506.71,217.6z M523.02,209.7l-0.16,3.55l3.1-0.95l1.42-0.95l-0.42-1.54l-1.47-1.17L523.02,209.7L523.02,209.7z M516.76,230.59l1.63,0.05l0.68,1.01h2.37l1.58-0.58l0.53,0.64l-1.05,1.38l-4.63,0.16l-0.84-1.11l-0.89-0.53L516.76,230.59L516.76,230.59z";

const TURKEY_LAKES = [
  // Van Gölü (lon ~42.8, lat ~38.6)
  { id: 'van', name: 'Van Gölü', d: 'M 655,160 C 665,152 682,154 690,165 C 696,174 695,188 686,195 C 674,204 656,202 648,190 C 642,180 645,168 655,160 Z' },
  // Tuz Gölü (lon ~33.4, lat ~38.8)
  { id: 'tuz', name: 'Tuz Gölü', d: 'M 305,162 C 315,155 328,160 332,172 C 335,185 330,198 322,208 C 314,215 302,212 298,200 C 294,188 296,170 305,162 Z' },
  // Beyşehir Gölü
  { id: 'beysehir', name: 'Beyşehir Gölü', d: 'M 230,225 C 235,220 242,223 245,230 C 248,238 245,248 238,252 C 232,254 227,248 227,240 C 227,232 228,228 230,225 Z' },
  // Eğirdir Gölü
  { id: 'egirdir', name: 'Eğirdir Gölü', d: 'M 215,215 C 220,210 226,214 227,222 C 228,230 224,240 218,242 C 213,243 210,236 211,228 C 212,220 213,217 215,215 Z' }
];

const TURKEY_RIVERS = [
  // Kızılırmak (Sivas -> Samsun deltasında denize dökülür)
  { name: 'Kızılırmak', d: 'M 440,175 Q 380,210 330,200 Q 300,185 315,140 Q 330,95 385,75 Q 405,68 412,48' },
  // Yeşilırmak (Tokat -> Çarşamba deltasında Karadeniz\'e dökülür)
  { name: 'Yeşilırmak', d: 'M 470,140 Q 440,110 435,80 Q 432,60 445,45' },
  // Sakarya Nehri (Eskişehir -> Karasu\'da Karadeniz\'e dökülür)
  { name: 'Sakarya', d: 'M 240,170 Q 210,140 230,110 Q 225,85 220,55' },
  // Fırat Nehri (Erzincan/Karasu -> Keban -> Basra Körfezi\'ne akar)
  { name: 'Fırat', d: 'M 540,120 Q 510,150 495,190 Q 480,230 460,285' },
  // Dicle Nehri (Hazar Gölü -> Diyarbakır -> Basra\'ya akar)
  { name: 'Dicle', d: 'M 530,195 Q 560,220 575,250 Q 590,275 615,285' },
  // Gediz Nehri (Ege Denizi\'ne dökülür)
  { name: 'Gediz', d: 'M 170,170 Q 130,175 75,172' },
  // Büyük Menderes (Ege Denizi\'ne dökülür)
  { name: 'B. Menderes', d: 'M 180,215 Q 135,225 78,228' }
];

const STRAITS_CANALS = [
  { id: 'panama', name: 'Panama Kanalı', x: 232, y: 325, desc: 'Atlas - Büyük Okyanus bağlantısı' },
  { id: 'suez', name: 'Süveyş Kanalı', x: 536, y: 247, desc: 'Akdeniz - Kızıldeniz bağlantısı' },
  { id: 'gibraltar', name: 'Cebelitarık Boğazı', x: 426, y: 228, desc: 'Atlas Okyanusu - Akdeniz girişi' },
  { id: 'malacca', name: 'Malakka Boğazı', x: 742, y: 342, desc: 'Hint Okyanusu - Pasifik geçişi' },
  { id: 'hormuz', name: 'Hürmüz Boğazı', x: 595, y: 260, desc: 'Basra Körfezi petrol çıkış kapısı' },
  { id: 'babalmandab', name: 'Babülmendep Boğazı', x: 574, y: 304, desc: 'Kızıldeniz - Hint Okyanusu çıkışı' },
  { id: 'bosporus', name: 'İstanbul & Çanakkale Boğazları', x: 512, y: 206, desc: 'Karadeniz - Akdeniz bağlantısı' },
  { id: 'bering', name: 'Bering Boğazı', x: 40, y: 110, desc: 'Asya - Kuzey Amerika ayrımı' }
];


// Module Exports
__exports['TURKEY_VECTOR_PATH'] = TURKEY_VECTOR_PATH;
__exports['WORLD_VECTOR_PATH'] = WORLD_VECTOR_PATH;
__exports['TURKEY_LAKES'] = TURKEY_LAKES;
__exports['TURKEY_RIVERS'] = TURKEY_RIVERS;
__exports['STRAITS_CANALS'] = STRAITS_CANALS;

});

__define('modules/science/geoTemplates.js', function(__exports, __require, __module) {
const { escSvg } = __require('modules/science/overlayEngine.js');
const { TURKEY_VECTOR_PATH, WORLD_VECTOR_PATH, TURKEY_LAKES, TURKEY_RIVERS, STRAITS_CANALS } = __require('modules/science/mapData.js');

/**
 * Egemen's Testmaker — Coğrafya Şablon Envanteri (TYT, AYT & KPSS)
 * Gerçek GIS ve Wikimedia dilsiz harita vektörleri, MEB uyumlu İzohips ve İklim grafiği,
 * Doğru $23^\circ 27'$ eksen eğikliği ve yörünge/küre modelleri.
 */

const GEO_TEMPLATES = {
  // --------------------------------------------------------------------------
  // 1. TÜRKİYE DİLSİZ VEKTÖREL HARİTASI (GENEL & BÖLGESEL YAKINLAŞTIRMALAR)
  // --------------------------------------------------------------------------
  turkeyMap: {
    id: 'turkeyMap',
    category: 'cografya',
    name: 'Türkiye Dilsiz Vektörel Haritası (Genel & Bölgesel)',
    tags: ['TYT', 'AYT', 'KPSS', 'Türkiye', 'Dilsiz Harita', 'Bölgeler', 'Göller', 'Nehirler'],
    desc: 'Otantik GIS kıyı ve sınır verileriyle Türkiye fiziki dilsiz haritası; bölgesel yakınlaştırmalar, göller, akarsular ve sürüklenebilir harita pinleri.',
    defaultParams: {
      title: 'Türkiye Dilsiz Haritası',
      viewRegion: 'all', // 'all' | 'marmara' | 'ege' | 'akdeniz' | 'karadeniz' | 'icanadolu' | 'doguanadolu'
      showGraticule: true,
      showLakes: true,
      showRivers: true,
      pins: [
        { id: 'p1', x: 135, y: 55, label: 'I', text: 'Ergene Havzası', color: '#dc2626' },
        { id: 'p2', x: 105, y: 225, label: 'II', text: 'Menteşe Yöresi', color: '#dc2626' },
        { id: 'p3', x: 385, y: 250, label: 'III', text: 'Çukurova Deltası', color: '#dc2626' },
        { id: 'p4', x: 520, y: 75, label: 'IV', text: 'Doğu Karadeniz (Rize)', color: '#dc2626' },
        { id: 'p5', x: 685, y: 220, label: 'V', text: 'Hakkari Yöresi', color: '#dc2626' }
      ]
    },
    presets: [
      {
        name: 'ÖSYM TYT Klasik 5 Bölge (I: Ergene, II: Menteşe, III: Çukurova, IV: Rize, V: Hakkari)',
        params: {
          title: 'Haritada Numaralandırılmış 5 Yöre',
          viewRegion: 'all',
          pins: [
            { id: 'p1', x: 135, y: 55, label: 'I', text: 'Ergene Havzası', color: '#dc2626' },
            { id: 'p2', x: 105, y: 225, label: 'II', text: 'Menteşe Yöresi', color: '#dc2626' },
            { id: 'p3', x: 385, y: 250, label: 'III', text: 'Çukurova Deltası', color: '#dc2626' },
            { id: 'p4', x: 520, y: 75, label: 'IV', text: 'Doğu Karadeniz', color: '#dc2626' },
            { id: 'p5', x: 685, y: 220, label: 'V', text: 'Hakkari Yöresi', color: '#dc2626' }
          ]
        }
      },
      {
        name: 'Bölgesel Yakınlaştırma: Kıyı Ege & Grabenler',
        params: {
          title: 'Kıyı Ege Çöküntü Ovaları',
          viewRegion: 'ege',
          pins: [
            { id: 'p1', x: 75, y: 140, label: '1', text: 'Bakırçay Grabeni', color: '#0284c7' },
            { id: 'p2', x: 95, y: 175, label: '2', text: 'Gediz Grabeni', color: '#0284c7' },
            { id: 'p3', x: 110, y: 205, label: '3', text: 'K. Menderes Grabeni', color: '#0284c7' },
            { id: 'p4', x: 125, y: 235, label: '4', text: 'B. Menderes Grabeni', color: '#0284c7' }
          ]
        }
      },
      {
        name: 'Bölgesel Yakınlaştırma: Marmara & Boğazlar',
        params: {
          title: 'Marmara Bölümü & Boğazlar',
          viewRegion: 'marmara',
          pins: [
            { id: 'p1', x: 85, y: 95, label: 'A', text: 'Çanakkale Boğazı', color: '#059669' },
            { id: 'p2', x: 170, y: 65, label: 'B', text: 'İstanbul Boğazı', color: '#059669' },
            { id: 'p3', x: 145, y: 130, label: 'C', text: 'Kapıdağ Yarımadası', color: '#059669' }
          ]
        }
      },
      {
        name: 'Bölgesel Yakınlaştırma: Akdeniz & Toroslar',
        params: {
          title: 'Akdeniz Kıyı Kuşağı & Toroslar',
          viewRegion: 'akdeniz',
          pins: [
            { id: 'p1', x: 195, y: 235, label: 'I', text: 'Teke Platosu (Karstik)', color: '#d97706' },
            { id: 'p2', x: 255, y: 230, label: 'II', text: 'Taşeli Platosu', color: '#d97706' },
            { id: 'p3', x: 385, y: 250, label: 'III', text: 'Çukurova Deltası', color: '#d97706' }
          ]
        }
      }
    ],
    schema: [
      { key: 'title', label: 'Harita Başlığı', type: 'text' },
      {
        key: 'viewRegion',
        label: 'Görünüm / Bölgesel Yakınlaştırma',
        type: 'select',
        options: [
          { v: 'all', l: 'Türkiye Geneli (Tüm Ülke)' },
          { v: 'marmara', l: 'Marmara & Boğazlar (Yakınlaştırılmış)' },
          { v: 'ege', l: 'Kıyı Ege & Grabenler (Yakınlaştırılmış)' },
          { v: 'akdeniz', l: 'Akdeniz & Toroslar (Yakınlaştırılmış)' },
          { v: 'karadeniz', l: 'Karadeniz & Kıyı Kuşağı (Yakınlaştırılmış)' },
          { v: 'icanadolu', l: 'İç Anadolu Platoları (Yakınlaştırılmış)' },
          { v: 'doguanadolu', l: 'Doğu Anadolu (Yakınlaştırılmış)' }
        ]
      },
      { key: 'showGraticule', label: 'Paralel ve Meridyen Şebekesini Göster (26°-45° D, 36°-42° K)', type: 'checkbox' },
      { key: 'showLakes', label: 'Başlıca Gölleri Göster (Van, Tuz, Beyşehir, Eğirdir)', type: 'checkbox' },
      { key: 'showRivers', label: 'Başlıca Akarsuları Göster (Kızılırmak, Fırat, Dicle vb.)', type: 'checkbox' }
    ],
    renderSvg(p) {
      let vb = '0 0 750 360';
      if (p.viewRegion === 'marmara') vb = '30 0 250 180';
      else if (p.viewRegion === 'ege') vb = '20 90 240 210';
      else if (p.viewRegion === 'akdeniz') vb = '160 160 340 180';
      else if (p.viewRegion === 'karadeniz') vb = '200 0 440 170';
      else if (p.viewRegion === 'icanadolu') vb = '190 75 320 200';
      else if (p.viewRegion === 'doguanadolu') vb = '460 60 290 240';

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif; background-color:#e0f2fe;">
        <defs>
          <linearGradient id="trLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f8fafc"/>
            <stop offset="100%" stop-color="#f1f5f9"/>
          </linearGradient>
        </defs>

        <!-- Deniz Arka Planı -->
        <rect x="-200" y="-100" width="1200" height="600" fill="#e0f2fe" />

        <!-- Otantik GIS Türkiye Kıyı ve Sınır Vektörü -->
        <path d="${TURKEY_VECTOR_PATH}" fill="url(#trLandGrad)" stroke="#334155" stroke-width="1.3" stroke-linejoin="round" />

        <!-- Başlıca Göller -->
        ${p.showLakes ? `
          <g id="trLakes">
            ${TURKEY_LAKES.map(lk => `
              <path d="${lk.d}" fill="#38bdf8" stroke="#0284c7" stroke-width="1" />
              <text x="${lk.id === 'van' ? 668 : (lk.id === 'tuz' ? 315 : (lk.id === 'beysehir' ? 236 : 219))}" y="${lk.id === 'van' ? 180 : (lk.id === 'tuz' ? 188 : (lk.id === 'beysehir' ? 240 : 230))}" font-size="8.5" font-weight="bold" fill="#0369a1" text-anchor="middle">${lk.name}</text>
            `).join('')}
          </g>
        ` : ''}

        <!-- Başlıca Akarsular -->
        ${p.showRivers ? `
          <g id="trRivers" stroke="#0284c7" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.85">
            ${TURKEY_RIVERS.map(rv => `
              <path d="${rv.d}" />
            `).join('')}
          </g>
        ` : ''}

        <!-- Paralel & Meridyen Şebekesi (Graticule) -->
        ${p.showGraticule && p.viewRegion === 'all' ? `
          <g stroke="#94a3b8" stroke-width="0.75" stroke-dasharray="3,3" opacity="0.6">
            <!-- 36° K (Güney) -->
            <line x1="150" y1="335" x2="720" y2="335" />
            <text x="145" y="338" font-size="9" fill="#64748b" text-anchor="end">36°K</text>
            <!-- 38° K -->
            <line x1="50" y1="230" x2="720" y2="230" />
            <text x="45" y="233" font-size="9" fill="#64748b" text-anchor="end">38°K</text>
            <!-- 40° K -->
            <line x1="50" y1="125" x2="720" y2="125" />
            <text x="45" y="128" font-size="9" fill="#64748b" text-anchor="end">40°K</text>
            <!-- 42° K (Kuzey - Sinop) -->
            <line x1="80" y1="20" x2="720" y2="20" />
            <text x="75" y="23" font-size="9" fill="#64748b" text-anchor="end">42°K</text>

            <!-- 26° D (Batı) -->
            <line x1="20" y1="10" x2="20" y2="350" />
            <text x="20" y="358" font-size="9" fill="#64748b" text-anchor="middle">26°D</text>
            <!-- 30° D -->
            <line x1="170" y1="10" x2="170" y2="350" />
            <text x="170" y="358" font-size="9" fill="#64748b" text-anchor="middle">30°D</text>
            <!-- 35° D -->
            <line x1="365" y1="10" x2="365" y2="350" />
            <text x="365" y="358" font-size="9" fill="#64748b" text-anchor="middle">35°D</text>
            <!-- 40° D -->
            <line x1="560" y1="10" x2="560" y2="350" />
            <text x="560" y="358" font-size="9" fill="#64748b" text-anchor="middle">40°D</text>
            <!-- 45° D (Doğu - Iğdır) -->
            <line x1="740" y1="10" x2="740" y2="350" />
            <text x="740" y="358" font-size="9" fill="#64748b" text-anchor="middle">45°D</text>
          </g>
        ` : ''}

        <!-- Harita Başlığı -->
        ${p.title ? `
          <g transform="translate(375, 26)">
            <rect x="-140" y="-16" width="280" height="24" rx="6" fill="#ffffff" fill-opacity="0.9" stroke="#cbd5e1" stroke-width="1" />
            <text x="0" y="0" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>
          </g>
        ` : ''}

        <!-- Sürüklenebilir Harita Pinleri -->
        <g id="trPins">
          ${(p.pins || []).map(pin => `
            <g class="sci-draggable" data-map-pin-id="${pin.id}" transform="translate(${pin.x},${pin.y})" style="cursor:move;">
              <path d="M 0 0 C -9 -12 -11 -18 -11 -24 A 11 11 0 1 1 11 -24 C 11 -18 9 -12 0 0 Z" fill="${pin.color || '#dc2626'}" stroke="#ffffff" stroke-width="1.8" />
              <circle cx="0" cy="-24" r="5.5" fill="#ffffff" />
              <text x="0" y="-21" text-anchor="middle" font-size="7.5" font-weight="bold" fill="${pin.color || '#dc2626'}">${escSvg(pin.label)}</text>
              ${pin.text ? `
                <rect x="12" y="-31" width="${pin.text.length * 6.5 + 10}" height="18" rx="4" fill="#ffffff" fill-opacity="0.95" stroke="${pin.color || '#dc2626'}" stroke-width="1" />
                <text x="${17 + (pin.text.length * 3.2)}" y="-18" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#0f172a">${escSvg(pin.text)}</text>
              ` : ''}
            </g>
          `).join('')}
        </g>
      </svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 2. DÜNYA DİLSİZ HARİTASI, DÖNENCELER & BOĞAZLAR
  // --------------------------------------------------------------------------
  worldMap: {
    id: 'worldMap',
    category: 'cografya',
    name: 'Dünya Dilsiz Haritası (Kıtalar, Dönenceler & Boğazlar)',
    tags: ['TYT', 'AYT', 'Dünya', 'Ekvator', 'Dönenceler', 'Boğazlar', 'Kanallar'],
    desc: 'Otantik Wikimedia vektör dilsiz dünya haritası; Ekvator, Yengeç/Oğlak dönenceleri, Greenwich meridyeni, stratejik su yolları ve sürüklenebilir noktalar.',
    defaultParams: {
      title: 'Dünya Fiziki / Dilsiz Haritası',
      showEquator: true,
      showTropics: true,
      showPolarCircles: true,
      showGreenwich: true,
      showStraits: true,
      pins: [
        { id: 'wp1', x: 232, y: 325, label: 'I', text: 'Panama Kanalı', color: '#dc2626' },
        { id: 'wp2', x: 536, y: 247, label: 'II', text: 'Süveyş Kanalı', color: '#dc2626' },
        { id: 'wp3', x: 426, y: 228, label: 'III', text: 'Cebelitarık Boğazı', color: '#dc2626' },
        { id: 'wp4', x: 742, y: 342, label: 'IV', text: 'Malakka Boğazı', color: '#dc2626' },
        { id: 'wp5', x: 595, y: 260, label: 'V', text: 'Hürmüz Boğazı', color: '#dc2626' }
      ]
    },
    presets: [
      {
        name: 'TYT - Stratejik Boğazlar ve Kanallar (Panama, Süveyş, Cebelitarık, Malakka, Hürmüz)',
        params: {
          title: 'Dünyanın Stratejik Su Yolları',
          showEquator: true,
          showTropics: true,
          showPolarCircles: false,
          showGreenwich: true,
          showStraits: true,
          pins: [
            { id: 'wp1', x: 232, y: 325, label: 'I', text: 'Panama', color: '#dc2626' },
            { id: 'wp2', x: 536, y: 247, label: 'II', text: 'Süveyş', color: '#dc2626' },
            { id: 'wp3', x: 426, y: 228, label: 'III', text: 'Cebelitarık', color: '#dc2626' },
            { id: 'wp4', x: 742, y: 342, label: 'IV', text: 'Malakka', color: '#dc2626' },
            { id: 'wp5', x: 595, y: 260, label: 'V', text: 'Hürmüz', color: '#dc2626' }
          ]
        }
      },
      {
        name: 'AYT - Küresel Nüfus & Yoğun Alanlar',
        params: {
          title: 'Dünyada Nüfusun Yoğun Olduğu Alanlar',
          showEquator: true,
          showTropics: true,
          showPolarCircles: true,
          showGreenwich: false,
          showStraits: false,
          pins: [
            { id: 'wp1', x: 720, y: 240, label: '1', text: 'Güneydoğu Asya', color: '#2563eb' },
            { id: 'wp2', x: 475, y: 175, label: '2', text: 'Batı Avrupa', color: '#2563eb' },
            { id: 'wp3', x: 210, y: 215, label: '3', text: 'ABD Doğu Kıyısı', color: '#2563eb' }
          ]
        }
      }
    ],
    schema: [
      { key: 'title', label: 'Harita Başlığı', type: 'text' },
      { key: 'showEquator', label: 'Ekvator Çizgisini Göster (0°)', type: 'checkbox' },
      { key: 'showTropics', label: "Dönenceleri Göster (23°27\' K Yengeç & 23°27\' G Oğlak)", type: 'checkbox' },
      { key: 'showPolarCircles', label: "Kutup Dairelerini Göster (66°33\' K ve G)", type: 'checkbox' },
      { key: 'showGreenwich', label: 'Başlangıç Meridyenini Göster (0° Greenwich)', type: 'checkbox' },
      { key: 'showStraits', label: 'Stratejik Boğaz & Kanal İşaretlerini Göster', type: 'checkbox' }
    ],
    renderSvg(p) {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 950 620" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif; background-color:#e0f2fe;">
        <!-- Okyanus Arka Planı -->
        <rect width="950" height="620" fill="#e0f2fe" />

        <!-- Otantik Wikimedia Dünya Kıtaları Vektörü -->
        <path d="${WORLD_VECTOR_PATH}" fill="#f8fafc" stroke="#334155" stroke-width="0.85" stroke-linejoin="round" />

        <!-- Paraleller ve Meridyenler -->
        <!-- Kutup Daireleri (66°33\') -->
        ${p.showPolarCircles ? `
          <g stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,4">
            <line x1="0" y1="80" x2="950" y2="80" />
            <text x="10" y="75" font-size="10" font-weight="bold" fill="#64748b">66°33\' K (Kuzey Kutup Dairesi)</text>
            <line x1="0" y1="540" x2="950" y2="540" />
            <text x="10" y="535" font-size="10" font-weight="bold" fill="#64748b">66°33\' G (Güney Kutup Dairesi)</text>
          </g>
        ` : ''}

        <!-- Dönenceler (23°27\') -->
        ${p.showTropics ? `
          <g stroke="#f59e0b" stroke-width="1.3" stroke-dasharray="5,4">
            <line x1="0" y1="229" x2="950" y2="229" />
            <text x="940" y="224" font-size="10.5" font-weight="bold" fill="#b45309" text-anchor="end">23°27\' K (Yengeç Dönencesi)</text>
            <line x1="0" y1="391" x2="950" y2="391" />
            <text x="940" y="386" font-size="10.5" font-weight="bold" fill="#b45309" text-anchor="end">23°27\' G (Oğlak Dönencesi)</text>
          </g>
        ` : ''}

        <!-- Ekvator (0°) -->
        ${p.showEquator ? `
          <g stroke="#dc2626" stroke-width="1.8" stroke-dasharray="6,3">
            <line x1="0" y1="310" x2="950" y2="310" />
            <text x="940" y="305" font-size="11.5" font-weight="bold" fill="#dc2626" text-anchor="end">0° Ekvator</text>
          </g>
        ` : ''}

        <!-- Greenwich (0°) -->
        ${p.showGreenwich ? `
          <g stroke="#475569" stroke-width="1.2" stroke-dasharray="5,4">
            <line x1="460" y1="0" x2="460" y2="620" />
            <text x="465" y="35" font-size="10" font-weight="bold" fill="#475569">0° Greenwich</text>
          </g>
        ` : ''}

        <!-- Stratejik Boğazlar -->
        ${p.showStraits ? `
          <g id="worldStraits">
            ${STRAITS_CANALS.map(s => `
              <circle cx="${s.x}" cy="${s.y}" r="4" fill="#2563eb" stroke="#ffffff" stroke-width="1.5" />
              <text x="${s.x + 6}" y="${s.y - 4}" font-size="9" font-weight="bold" fill="#1e3a8a">${s.name}</text>
            `).join('')}
          </g>
        ` : ''}

        <!-- Harita Başlığı -->
        ${p.title ? `
          <g transform="translate(475, 30)">
            <rect x="-160" y="-18" width="320" height="26" rx="6" fill="#ffffff" fill-opacity="0.9" stroke="#cbd5e1" stroke-width="1.2" />
            <text x="0" y="0" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>
          </g>
        ` : ''}

        <!-- Sürüklenebilir Pinler -->
        <g id="worldPins">
          ${(p.pins || []).map(pin => `
            <g class="sci-draggable" data-map-pin-id="${pin.id}" transform="translate(${pin.x},${pin.y})" style="cursor:move;">
              <path d="M 0 0 C -9 -12 -11 -18 -11 -24 A 11 11 0 1 1 11 -24 C 11 -18 9 -12 0 0 Z" fill="${pin.color || '#dc2626'}" stroke="#ffffff" stroke-width="1.8" />
              <circle cx="0" cy="-24" r="5.5" fill="#ffffff" />
              <text x="0" y="-21" text-anchor="middle" font-size="7.5" font-weight="bold" fill="${pin.color || '#dc2626'}">${escSvg(pin.label)}</text>
              ${pin.text ? `
                <rect x="12" y="-31" width="${pin.text.length * 6.8 + 12}" height="18" rx="4" fill="#ffffff" fill-opacity="0.95" stroke="${pin.color || '#dc2626'}" stroke-width="1" />
                <text x="${18 + (pin.text.length * 3.4)}" y="-18" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#0f172a">${escSvg(pin.text)}</text>
              ` : ''}
            </g>
          `).join('')}
        </g>
      </svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 3. YILLIK SICAKLIK VE YAĞIŞ SÜTUN/ÇİZGİ GRAFİĞİ (İKLİM GRAFİĞİ)
  // --------------------------------------------------------------------------
  climateGraph: {
    id: 'climateGraph',
    category: 'cografya',
    name: 'İklim Grafiği (Yıllık Sıcaklık ve Yağış Sütun/Çizgi)',
    tags: ['TYT', 'AYT', 'KPSS', 'İklim', 'Sıcaklık', 'Yağış', 'Akdeniz', 'Karadeniz', 'Karasal'],
    desc: 'ÖSYM ve MEB kitaplarının vazgeçilmez soru formatı: 12 ayın yağış (mavi sütunlar) ve sıcaklık (kırmızı çizgi) grafiği. Akdeniz, Karadeniz, Karasal, Ekvatoral hazır ayarlarıyla.',
    defaultParams: {
      stationName: 'Antalya (Akdeniz İklimi)',
      climateType: 'akdeniz',
      rainValues: '230, 160, 100, 50, 25, 10, 3, 5, 15, 75, 140, 240',
      tempValues: '10, 11, 13, 16, 21, 26, 29, 28, 25, 20, 15, 12',
      maxRainScale: 250,
      showAnnualStats: true
    },
    presets: [
      {
        name: 'Akdeniz İklimi (Antalya - Yazları Sıcak/Kurak, Kışları Ilık/Yağışlı)',
        params: {
          stationName: 'Antalya (Akdeniz İklimi)',
          climateType: 'akdeniz',
          rainValues: '230, 160, 100, 50, 25, 10, 3, 5, 15, 75, 140, 240',
          tempValues: '10, 11, 13, 16, 21, 26, 29, 28, 25, 20, 15, 12',
          maxRainScale: 250,
          showAnnualStats: true
        }
      },
      {
        name: 'Karadeniz İklimi (Rize - Her Mevsim Bol Yağışlı, Sonbahar Zirve)',
        params: {
          stationName: 'Rize (Karadeniz İklimi)',
          climateType: 'karadeniz',
          rainValues: '210, 170, 150, 100, 90, 120, 140, 180, 240, 270, 250, 230',
          tempValues: '7, 7, 8, 12, 16, 20, 23, 23, 20, 16, 12, 9',
          maxRainScale: 300,
          showAnnualStats: true
        }
      },
      {
        name: 'Ilıman Karasal İklim (Ankara/Konya - İlkbahar Yağışlı / Kırkikindi)',
        params: {
          stationName: 'Konya (Ilıman Karasal İklim)',
          climateType: 'karasal',
          rainValues: '35, 30, 32, 45, 50, 25, 10, 8, 15, 30, 35, 42',
          tempValues: '0, 1, 6, 11, 16, 20, 23, 23, 18, 12, 6, 2',
          maxRainScale: 100,
          showAnnualStats: true
        }
      },
      {
        name: 'Sert Karasal İklim (Erzurum-Kars - En Çok Yağış Yazın)',
        params: {
          stationName: 'Erzurum (Sert Karasal İklim)',
          climateType: 'sert_karasal',
          rainValues: '20, 25, 35, 55, 75, 80, 55, 30, 25, 45, 35, 25',
          tempValues: '-10, -9, -3, 5, 11, 15, 19, 19, 14, 8, 1, -6',
          maxRainScale: 100,
          showAnnualStats: true
        }
      },
      {
        name: 'Ekvatoral İklim (Yıl Boyu Sıcak & Bol Yağışlı, Ekinokslarda Zirve)',
        params: {
          stationName: 'Amazon / Kongo (Ekvatoral İklim)',
          climateType: 'ekvatoral',
          rainValues: '240, 260, 310, 280, 210, 150, 120, 140, 220, 270, 290, 260',
          tempValues: '26, 26, 27, 27, 27, 26, 26, 26, 27, 27, 27, 26',
          maxRainScale: 350,
          showAnnualStats: true
        }
      }
    ],
    schema: [
      { key: 'stationName', label: 'İstasyon / Başlık Metni', type: 'text' },
      { key: 'rainValues', label: 'Aylık Yağış Değerleri (mm, 12 Ay - virgülle)', type: 'text', hint: 'Örn: 230, 160, 100...' },
      { key: 'tempValues', label: 'Aylık Sıcaklık Değerleri (°C, 12 Ay - virgülle)', type: 'text', hint: 'Örn: 10, 11, 13, 16...' },
      {
        key: 'maxRainScale',
        label: 'Yağış Ekseni Üst Limiti (mm)',
        type: 'select',
        options: [
          { v: 100, l: '100 mm (Karasal)' },
          { v: 250, l: '250 mm (Akdeniz)' },
          { v: 300, l: '300 mm (Karadeniz)' },
          { v: 400, l: '400 mm (Ekvatoral/Muson)' }
        ]
      },
      { key: 'showAnnualStats', label: 'Yıllık Toplam Yağış ve Sıcaklık Farkını Göster', type: 'checkbox' }
    ],
    renderSvg(p) {
      const months = ['O', 'Ş', 'M', 'N', 'M', 'H', 'T', 'A', 'E', 'E', 'K', 'A'];
      const rain = String(p.rainValues || '').split(',').map(s => parseFloat(s.trim()) || 0);
      const temp = String(p.tempValues || '').split(',').map(s => parseFloat(s.trim()) || 0);

      while (rain.length < 12) rain.push(0);
      while (temp.length < 12) temp.push(0);

      const maxRain = Number(p.maxRainScale) || 250;
      const minTemp = -10;
      const maxTemp = 40;

      const chartX = 65;
      const chartY = 60;
      const chartW = 390;
      const chartH = 200;
      const barW = 20;
      const colStep = chartW / 12;

      // Coordinate mappers
      const rainToY = (r) => chartY + chartH - (Math.max(0, r) / maxRain) * chartH;
      const tempToY = (t) => chartY + chartH - ((t - minTemp) / (maxTemp - minTemp)) * chartH;

      let tempPolyPoints = [];
      temp.forEach((t, i) => {
        const x = chartX + i * colStep + colStep / 2;
        const y = tempToY(t);
        tempPolyPoints.push(`${x},${y}`);
      });

      const totalRain = Math.round(rain.reduce((a, b) => a + b, 0));
      const minT = Math.min(...temp);
      const maxT = Math.max(...temp);
      const diffT = Math.round((maxT - minT) * 10) / 10;

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 330" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif; background-color:#ffffff;">
        <!-- Başlık -->
        <text x="260" y="30" text-anchor="middle" font-size="14" font-weight="bold" fill="#0f172a">${escSvg(p.stationName || 'Yıllık Sıcaklık ve Yağış Grafiği')}</text>

        <!-- Grafik Izgarası -->
        <g stroke="#e2e8f0" stroke-width="1">
          ${[0, 0.25, 0.5, 0.75, 1].map(f => `
            <line x1="${chartX}" y1="${chartY + chartH * f}" x2="${chartX + chartW}" y2="${chartY + chartH * f}" />
          `).join('')}
        </g>

        <!-- Sol Y Ekseni: Yağış (mm) Mavi -->
        <g text-anchor="end" font-size="10" font-weight="bold" fill="#0284c7">
          <text x="${chartX - 8}" y="${chartY + 4}">${maxRain}</text>
          <text x="${chartX - 8}" y="${chartY + chartH * 0.25 + 4}">${Math.round(maxRain * 0.75)}</text>
          <text x="${chartX - 8}" y="${chartY + chartH * 0.5 + 4}">${Math.round(maxRain * 0.5)}</text>
          <text x="${chartX - 8}" y="${chartY + chartH * 0.75 + 4}">${Math.round(maxRain * 0.25)}</text>
          <text x="${chartX - 8}" y="${chartY + chartH + 4}">0</text>
          <text x="${chartX - 8}" y="${chartY - 14}" text-anchor="end" font-size="11" fill="#0284c7">Yağış (mm)</text>
        </g>

        <!-- Sağ Y Ekseni: Sıcaklık (°C) Kırmızı -->
        <g text-anchor="start" font-size="10" font-weight="bold" fill="#dc2626">
          <text x="${chartX + chartW + 8}" y="${chartY + 4}">40</text>
          <text x="${chartX + chartW + 8}" y="${chartY + chartH * 0.25 + 4}">27.5</text>
          <text x="${chartX + chartW + 8}" y="${chartY + chartH * 0.5 + 4}">15</text>
          <text x="${chartX + chartW + 8}" y="${chartY + chartH * 0.75 + 4}">2.5</text>
          <text x="${chartX + chartW + 8}" y="${chartY + chartH + 4}">-10</text>
          <text x="${chartX + chartW + 8}" y="${chartY - 14}" text-anchor="start" font-size="11" fill="#dc2626">Sıcaklık (°C)</text>
        </g>

        <!-- Sıfır Derece Çizgisi -->
        <line x1="${chartX}" y1="${tempToY(0)}" x2="${chartX + chartW}" y2="${tempToY(0)}" stroke="#f87171" stroke-width="1.2" stroke-dasharray="3,3" />
        <text x="${chartX + chartW + 28}" y="${tempToY(0) + 3}" font-size="9" fill="#dc2626">0°C</text>

        <!-- Yağış Sütunları (Mavi) -->
        <g id="rainBars" fill="#38bdf8" stroke="#0284c7" stroke-width="1.2">
          ${rain.map((r, i) => {
            const bx = chartX + i * colStep + (colStep - barW) / 2;
            const by = rainToY(r);
            const bh = chartY + chartH - by;
            return `<rect x="${bx}" y="${by}" width="${barW}" height="${Math.max(0, bh)}" rx="1.5" />`;
          }).join('')}
        </g>

        <!-- Sıcaklık Eğrisi (Kırmızı) -->
        <polyline points="${tempPolyPoints.join(' ')}" fill="none" stroke="#dc2626" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <!-- Noktalar -->
        ${temp.map((t, i) => {
          const cx = chartX + i * colStep + colStep / 2;
          const cy = tempToY(t);
          return `
            <circle cx="${cx}" cy="${cy}" r="4.5" fill="#ffffff" stroke="#dc2626" stroke-width="2.5" />
            <text x="${cx}" y="${cy - 8}" font-size="9" font-weight="bold" fill="#991b1b" text-anchor="middle">${t}°</text>
          `;
        }).join('')}

        <!-- X Ekseni Çizgisi ve Aylar -->
        <line x1="${chartX}" y1="${chartY + chartH}" x2="${chartX + chartW}" y2="${chartY + chartH}" stroke="#0f172a" stroke-width="2" />
        <g font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle">
          ${months.map((m, i) => `
            <text x="${chartX + i * colStep + colStep / 2}" y="${chartY + chartH + 18}">${m}</text>
          `).join('')}
        </g>

        <!-- İstatistik Lejantı -->
        ${p.showAnnualStats ? `
          <g transform="translate(260, 310)" font-size="11" fill="#475569" text-anchor="middle">
            <text>Yıllık Toplam Yağış: <tspan font-weight="bold" fill="#0284c7">${totalRain} mm</tspan> · Yıllık Sıcaklık Farkı: <tspan font-weight="bold" fill="#dc2626">${diffT} °C</tspan></text>
          </g>
        ` : ''}
      </svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 4. İZOHİPS TOPOGRAFYA HARİTASI & ARAZİ ŞEKİLLERİ
  // --------------------------------------------------------------------------
  isohypseTopography: {
    id: 'isohypseTopography',
    category: 'cografya',
    name: 'İzohips Topografya Haritası & Yer Şekilleri',
    tags: ['TYT', 'AYT', 'İzohips', 'Topografya', 'Vadi', 'Sırt', 'Boyun', 'Falez', 'Delta', 'Kapalı Çukur'],
    desc: 'Eş yükselti eğrileriyle dağ zirvesi, boyun, vadi, akarsu, delta, falez ve kapalı çukur (krater). A-B profil hattı ve numaralı soru noktaları.',
    defaultParams: {
      title: 'İzohips Topografya Haritası',
      contourInterval: 100, // 50 | 100 | 200
      showCrater: true,
      showCliff: true,
      showDelta: true,
      showRiver: true,
      showProfileLine: true,
      pins: [
        { id: 'ip1', x: 260, y: 155, label: 'I', text: 'Zirve (Doruk)', color: '#dc2626' },
        { id: 'ip2', x: 200, y: 195, label: 'II', text: 'Boyun', color: '#dc2626' },
        { id: 'ip3', x: 135, y: 155, label: 'III', text: 'Kapalı Çukur', color: '#dc2626' },
        { id: 'ip4', x: 340, y: 190, label: 'IV', text: 'Vadi (Akarsu)', color: '#dc2626' },
        { id: 'ip5', x: 420, y: 265, label: 'V', text: 'Delta Ovası', color: '#dc2626' }
      ]
    },
    presets: [
      {
        name: 'TYT - Yer Şekilleri Tespiti (I: Zirve, II: Boyun, III: Kapalı Çukur, IV: Vadi, V: Delta)',
        params: {
          title: 'İzohips Haritasında Belirtilen Şekiller',
          contourInterval: 100,
          showCrater: true,
          showCliff: true,
          showDelta: true,
          showRiver: true,
          showProfileLine: true
        }
      }
    ],
    schema: [
      { key: 'title', label: 'Harita Başlığı', type: 'text' },
      {
        key: 'contourInterval',
        label: 'İzohips Aralık Değeri (m)',
        type: 'select',
        options: [
          { v: 50, l: '50 metre (Ayrıntılı)' },
          { v: 100, l: '100 metre (Standart ÖSYM)' },
          { v: 200, l: '200 metre (Yüksek Dağlık)' }
        ]
      },
      { key: 'showCrater', label: 'Kapalı Çukur / Krateri Göster (İçe Dönük Oklar)', type: 'checkbox' },
      { key: 'showCliff', label: 'Falez (Yalıyar / Uçurum) Göster', type: 'checkbox' },
      { key: 'showDelta', label: 'Delta Ovası ve Kıyı Çizgisini Göster (0 m)', type: 'checkbox' },
      { key: 'showRiver', label: 'Akarsu ve Akış Yönü Okunu Göster', type: 'checkbox' },
      { key: 'showProfileLine', label: 'A-B Profil Kesit Çizgisini Göster', type: 'checkbox' }
    ],
    renderSvg(p) {
      const step = Number(p.contourInterval) || 100;
      const h1 = step;
      const h2 = step * 2;
      const h3 = step * 3;
      const h4 = step * 4;
      const h5 = step * 5;

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 360" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif; background-color:#ffffff;">
        <defs>
          <pattern id="craterHatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#0f172a" stroke-width="1.5" />
          </pattern>
        </defs>

        <!-- Deniz Arka Planı (0 m Kıyı Çizgisi Altı) -->
        ${p.showDelta ? `
          <path d="M 0,270 Q 150,265 280,275 Q 380,270 415,310 Q 430,340 450,360 L 540,360 L 540,260 Q 450,255 420,285 Q 400,265 280,265 Q 150,260 0,270 Z" fill="#e0f2fe" opacity="0.6"/>
          <!-- Kıyı Çizgisi (0 m İzohipsi) -->
          <path d="M 0,270 C 150,260 260,275 350,270 C 400,260 415,295 440,330 C 455,350 490,360 540,360" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round" />
          <text x="35" y="295" font-size="11" font-weight="bold" fill="#0284c7">DENİZ (0 m)</text>
        ` : ''}

        <!-- 1. Kademe İzohips (h1) -->
        <path d="M 30,230 C 60,110 180,70 330,80 C 450,90 490,180 440,245 C 380,230 350,215 320,240 C 270,250 160,250 30,230 Z" fill="none" stroke="#64748b" stroke-width="1.5" />
        <text x="55" y="165" font-size="9" fill="#475569" transform="rotate(-65,55,165)">${h1}</text>

        <!-- 2. Kademe İzohips (h2) -->
        <path d="M 65,200 C 90,120 170,95 300,100 C 410,110 440,180 395,225 C 340,200 320,195 295,215 C 240,225 150,220 65,200 Z" fill="none" stroke="#64748b" stroke-width="1.5" />
        <text x="90" y="145" font-size="9" fill="#475569" transform="rotate(-50,90,145)">${h2}</text>

        <!-- 3. Kademe: Sol Çanak (Kapalı Çukur) & Sağ Tepe (Zirve) Ayrımı -->
        <!-- Sol Tepe/Çukur (135, 155) -->
        <path d="M 95,160 C 95,130 130,120 165,130 C 185,145 185,175 160,185 C 130,190 95,180 95,160 Z" fill="none" stroke="#64748b" stroke-width="1.5" />
        <text x="105" y="150" font-size="8.5" fill="#475569">${h3}</text>

        <!-- Kapalı Çukur (İçe dönük oklar) -->
        ${p.showCrater ? `
          <g id="craterMarks">
            <ellipse cx="140" cy="155" rx="26" ry="18" fill="#f8fafc" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="2,2" />
            <!-- İçe dönük oklar / çentikler -->
            <line x1="114" y1="155" x2="122" y2="155" stroke="#dc2626" stroke-width="1.5" />
            <line x1="166" y1="155" x2="158" y2="155" stroke="#dc2626" stroke-width="1.5" />
            <line x1="140" y1="137" x2="140" y2="145" stroke="#dc2626" stroke-width="1.5" />
            <line x1="140" y1="173" x2="140" y2="165" stroke="#dc2626" stroke-width="1.5" />
            <text x="140" y="159" font-size="9" font-weight="bold" fill="#dc2626" text-anchor="middle">${h2}</text>
          </g>
        ` : ''}

        <!-- Sağ Tepe (Zirve): h3, h4, h5 -->
        <path d="M 215,185 C 205,140 240,115 310,120 C 375,125 390,165 365,195 C 330,175 280,175 240,190 Z" fill="none" stroke="#64748b" stroke-width="1.5" />
        <text x="220" y="160" font-size="8.5" fill="#475569">${h3}</text>

        <path d="M 235,170 C 230,145 255,130 300,132 C 345,135 355,160 335,180 C 300,165 265,165 235,170 Z" fill="none" stroke="#64748b" stroke-width="1.5" />
        <text x="245" y="145" font-size="8.5" fill="#475569">${h4}</text>

        <path d="M 255,160 C 255,150 270,140 295,142 C 315,145 320,158 305,168 C 285,160 265,160 255,160 Z" fill="none" stroke="#64748b" stroke-width="1.5" />
        <text x="270" y="153" font-size="8.5" fill="#475569">${h5}</text>

        <!-- Doruk / Zirve Noktası (Spot Height) -->
        <polygon points="280,148 284,155 276,155" fill="#0f172a" />
        <text x="290" y="154" font-size="9" font-weight="bold" fill="#0f172a">▲ ${h5 + 45} m</text>

        <!-- Akarsu (Vadi boyunca akar) -->
        ${p.showRiver ? `
          <g id="contourRiver">
            <!-- Vadi konturları akarsuyun kaynağına doğru V şeklinde girinti yapar -->
            <path d="M 335,125 Q 360,165 380,220 Q 395,260 425,305" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round" />
            <!-- Akış Yönü Oku (Aşağı denize doğru) -->
            <polygon points="405,275 413,272 411,282" fill="#0284c7" />
            <text x="390" y="240" font-size="9.5" font-weight="bold" fill="#0284c7" transform="rotate(45,390,240)">Akarsu</text>
          </g>
        ` : ''}

        <!-- Falez (Uçurum): Konturlar denize çok dik ve sıkı -->
        ${p.showCliff ? `
          <g id="cliffZone">
            <line x1="475" y1="260" x2="475" y2="280" stroke="#b91c1c" stroke-width="3" stroke-linecap="round" />
            <line x1="478" y1="263" x2="478" y2="282" stroke="#b91c1c" stroke-width="2.5" stroke-linecap="round" />
            <line x1="481" y1="265" x2="481" y2="284" stroke="#b91c1c" stroke-width="2" stroke-linecap="round" />
            <text x="495" y="275" font-size="9.5" font-weight="bold" fill="#b91c1c">Falez</text>
          </g>
        ` : ''}

        <!-- A-B Profil Çizgisi -->
        ${p.showProfileLine ? `
          <g id="profileLine" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="5,4">
            <line x1="50" y1="155" x2="390" y2="155" />
            <circle cx="50" cy="155" r="5" fill="#dc2626" stroke="#ffffff" stroke-width="2" />
            <text x="40" y="160" font-size="12" font-weight="bold" fill="#dc2626">A</text>
            <circle cx="390" cy="155" r="5" fill="#dc2626" stroke="#ffffff" stroke-width="2" />
            <text x="402" y="160" font-size="12" font-weight="bold" fill="#dc2626">B</text>
          </g>
        ` : ''}

        <!-- Başlık -->
        <text x="270" y="26" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>

        <!-- Sürüklenebilir Numaralı Soru Pinleri (I-V) -->
        <g id="isoPins">
          ${(p.pins || []).map(pin => `
            <g class="sci-draggable" data-map-pin-id="${pin.id}" transform="translate(${pin.x},${pin.y})" style="cursor:move;">
              <path d="M 0 0 C -9 -12 -11 -18 -11 -24 A 11 11 0 1 1 11 -24 C 11 -18 9 -12 0 0 Z" fill="${pin.color || '#dc2626'}" stroke="#ffffff" stroke-width="1.8" />
              <circle cx="0" cy="-24" r="5.5" fill="#ffffff" />
              <text x="0" y="-21" text-anchor="middle" font-size="7.5" font-weight="bold" fill="${pin.color || '#dc2626'}">${escSvg(pin.label)}</text>
              ${pin.text ? `
                <rect x="12" y="-31" width="${pin.text.length * 6.8 + 12}" height="18" rx="4" fill="#ffffff" fill-opacity="0.95" stroke="${pin.color || '#dc2626'}" stroke-width="1" />
                <text x="${18 + (pin.text.length * 3.4)}" y="-18" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#0f172a">${escSvg(pin.text)}</text>
              ` : ''}
            </g>
          `).join('')}
        </g>
      </svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 5. DÜNYANIN YILLIK HAREKETİ, MEVSİMLER & DOĞRU 23°27\' EKSEN EĞİKLİĞİ
  // --------------------------------------------------------------------------
  earthOrbitSeasons: {
    id: 'earthOrbitSeasons',
    category: 'cografya',
    name: "Dünya\'nın Yıllık Hareketi & 23°27\' Eksen Eğikliği",
    tags: ['TYT', 'AYT', 'Gündönümü', 'Ekinoks', '21 Haziran', '21 Aralık', '21 Mart', 'Aydınlanma Çemberi'],
    desc: 'MEB Coğrafya müfredatına tam uyumlu: Güneş etrafında eliptik yörünge, uzayda sabit 23°27\' sağa eğik dönme ekseni, 21 Haziran / 21 Aralık gün dönümleri ve 21 Mart / 23 Eylül ekinoksları.',
    defaultParams: {
      viewMode: 'orbit', // 'orbit' (4 Konum) | 'single_june' | 'single_december' | 'single_equinox'
      title: "Dünya'nın Yıllık Hareketi ve Mevsimlerin Oluşumu",
      showRays: true,
      showAxisAngle: true
    },
    presets: [
      {
        name: '4 Konumlu Yıllık Yörünge Şeması (Güneş Merkezde, 21 Haz / 23 Eyl / 21 Ara / 21 Mar)',
        params: {
          viewMode: 'orbit',
          title: "Dünya'nın Güneş Etrafındaki Yıllık Yörüngesi ve Mevsimler",
          showRays: true,
          showAxisAngle: true
        }
      },
      {
        name: '21 Haziran Detaylı Küre Görünümü (Kuzey Kutup Aydınlık, Yengece Dik)',
        params: {
          viewMode: 'single_june',
          title: '21 Haziran Gün Dönümü (Yaz Başlangıcı)',
          showRays: true,
          showAxisAngle: true
        }
      },
      {
        name: '21 Aralık Detaylı Küre Görünümü (Güney Kutup Aydınlık, Oğlağa Dik)',
        params: {
          viewMode: 'single_december',
          title: '21 Aralık Gün Dönümü (Kış Başlangıcı)',
          showRays: true,
          showAxisAngle: true
        }
      },
      {
        name: '21 Mart / 23 Eylül Ekinoks Küresi (Ekvatora Dik, Aydınlanma Kutuplardan Geçer)',
        params: {
          viewMode: 'single_equinox',
          title: '21 Mart / 23 Eylül Ekinoksu (Gece-Gündüz Eşitliği)',
          showRays: true,
          showAxisAngle: true
        }
      }
    ],
    schema: [
      { key: 'title', label: 'Şema Başlığı', type: 'text' },
      {
        key: 'viewMode',
        label: 'Görünüm Modu',
        type: 'select',
        options: [
          { v: 'orbit', l: 'Güneş Etrafında Yıllık Yörünge (4 Ana Konum)' },
          { v: 'single_june', l: '21 Haziran Detaylı Küre (Kuzey Kutup Aydınlık)' },
          { v: 'single_december', l: '21 Aralık Detaylı Küre (Güney Kutup Aydınlık)' },
          { v: 'single_equinox', l: '21 Mart / 23 Eylül Ekinoks Küresi (Gece=Gündüz)' }
        ]
      },
      { key: 'showRays', label: 'Güneş Işınları Doğrultusunu Göster', type: 'checkbox' },
      { key: 'showAxisAngle', label: '23°27\' Eksen Eğikliği ve Derece Açılarını Göster', type: 'checkbox' }
    ],
    renderSvg(p) {
      if (p.viewMode === 'orbit') {
        // 4 Konumlu Yörünge: Eksen her 4 konumda da uzayda SAĞA (23.45 derece) eğiktir!
        return `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif; background-color:#ffffff;">
            <!-- Başlık -->
            <text x="300" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>

            <!-- Eliptik Yörünge Düzlemi -->
            <ellipse cx="300" cy="205" rx="230" ry="115" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6,4" />
            <!-- Yörünge Dolanım Yönü Okları (Saat yönünün tersi) -->
            <polygon points="300,90 310,85 305,95" fill="#64748b" />
            <polygon points="300,320 290,325 295,315" fill="#64748b" />

            <!-- GÜNEŞ (Merkezde) -->
            <g id="centerSun" transform="translate(300, 205)">
              <circle cx="0" cy="0" r="34" fill="#fbbf24" stroke="#f59e0b" stroke-width="3" />
              <!-- Işınlar -->
              ${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `
                <line x1="${40 * Math.cos(a * Math.PI / 180)}" y1="${40 * Math.sin(a * Math.PI / 180)}" x2="${50 * Math.cos(a * Math.PI / 180)}" y2="${50 * Math.sin(a * Math.PI / 180)}" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" />
              `).join('')}
              <text x="0" y="5" text-anchor="middle" font-size="12" font-weight="bold" fill="#78350f">GÜNEŞ</text>
            </g>

            <!-- 1. SOL KONUM: 21 HAZİRAN (Gündönümü) -->
            <!-- Eksen sağa 23°27\' eğik olduğundan, Güneş'e bakan taraf Kuzey Kutup bölgesidir! -->
            <g id="posJune" transform="translate(90, 205)">
              <!-- Yörünge Etiketi -->
              <text x="0" y="-55" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f172a">21 HAZİRAN</text>
              <text x="0" y="-42" text-anchor="middle" font-size="9" fill="#2563eb">Yaz Gündönümü (KYK)</text>

              <!-- Dönme Ekseni (23.45° Sağa Eğik) -->
              <line x1="-16" y1="-42" x2="16" y2="42" stroke="#dc2626" stroke-width="2" stroke-linecap="round" />
              <text x="-19" y="-45" font-size="9" font-weight="bold" fill="#dc2626">K</text>
              <text x="21" y="48" font-size="9" font-weight="bold" fill="#dc2626">G</text>

              <!-- Dünya Küresi (r=30) -->
              <!-- Güneş sağda olduğundan, SAĞ yarımküre aydınlık, SOL yarımküre karanlık! -->
              <!-- Kuzey Kutbu sağa eğik olduğundan AYDINLIK BÖLGEDEDİR! -->
              <circle cx="0" cy="0" r="30" fill="#38bdf8" stroke="#0f172a" stroke-width="1.8" />
              <!-- Karanlık Bölge (Sol Yarımküre) -->
              <path d="M 0,-30 A 30 30 0 0 0 0,30 Z" fill="#1e293b" fill-opacity="0.85" />
              <!-- Aydınlanma Çemberi (Dikey çizgi) -->
              <line x1="0" y1="-30" x2="0" y2="30" stroke="#ffffff" stroke-width="1.5" />
              <!-- Ekvator Çizgisi (Eksene dik: -66.55°) -->
              <line x1="-28" y1="12" x2="28" y2="-12" stroke="#f8fafc" stroke-width="1.4" stroke-dasharray="2,2" />
            </g>

            <!-- 2. SAĞ KONUM: 21 ARALIK (Gündönümü) -->
            <!-- Eksen yine sağa 23°27\' eğik; Güneş solda olduğundan, Güney Kutup bölgesi Güneş'e dönüktür! -->
            <g id="posDec" transform="translate(510, 205)">
              <text x="0" y="-55" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f172a">21 ARALIK</text>
              <text x="0" y="-42" text-anchor="middle" font-size="9" fill="#2563eb">Kış Gündönümü (KYK)</text>

              <!-- Dönme Ekseni (23.45° Sağa Eğik) -->
              <line x1="-16" y1="-42" x2="16" y2="42" stroke="#dc2626" stroke-width="2" stroke-linecap="round" />
              <text x="-19" y="-45" font-size="9" font-weight="bold" fill="#dc2626">K</text>
              <text x="21" y="48" font-size="9" font-weight="bold" fill="#dc2626">G</text>

              <!-- Dünya Küresi -->
              <!-- Güneş solda olduğundan, SOL yarımküre aydınlık, SAĞ yarımküre karanlık! -->
              <!-- Kuzey Kutbu sağa eğik olduğundan KARANLIK BÖLGEDE kalır (Kutup Gecesi)! -->
              <circle cx="0" cy="0" r="30" fill="#38bdf8" stroke="#0f172a" stroke-width="1.8" />
              <!-- Karanlık Bölge (Sağ Yarımküre) -->
              <path d="M 0,-30 A 30 30 0 0 1 0,30 Z" fill="#1e293b" fill-opacity="0.85" />
              <!-- Aydınlanma Çemberi -->
              <line x1="0" y1="-30" x2="0" y2="30" stroke="#ffffff" stroke-width="1.5" />
              <!-- Ekvator Çizgisi -->
              <line x1="-28" y1="12" x2="28" y2="-12" stroke="#f8fafc" stroke-width="1.4" stroke-dasharray="2,2" />
            </g>

            <!-- 3. ÜST KONUM: 21 MART (İlkbahar Ekinoksu) -->
            <g id="posMarch" transform="translate(300, 90)">
              <text x="0" y="-50" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f172a">21 MART (Ekinoks)</text>
              <line x1="-16" y1="-38" x2="16" y2="38" stroke="#dc2626" stroke-width="2" />
              <circle cx="0" cy="0" r="26" fill="#38bdf8" stroke="#0f172a" stroke-width="1.8" />
              <!-- Güneş altta olduğundan, alt aydınlık, üst karanlık -->
              <path d="M -26,0 A 26 26 0 0 1 26,0 Z" fill="#1e293b" fill-opacity="0.85" />
              <line x1="-26" y1="0" x2="26" y2="0" stroke="#ffffff" stroke-width="1.5" />
            </g>

            <!-- 4. ALT KONUM: 23 EYLÜL (Sonbahar Ekinoksu) -->
            <g id="posSept" transform="translate(300, 320)">
              <text x="0" y="52" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f172a">23 EYLÜL (Ekinoks)</text>
              <line x1="-16" y1="-38" x2="16" y2="38" stroke="#dc2626" stroke-width="2" />
              <circle cx="0" cy="0" r="26" fill="#38bdf8" stroke="#0f172a" stroke-width="1.8" />
              <!-- Güneş üstte olduğundan, üst aydınlık, alt karanlık -->
              <path d="M -26,0 A 26 26 0 0 0 26,0 Z" fill="#1e293b" fill-opacity="0.85" />
              <line x1="-26" y1="0" x2="26" y2="0" stroke="#ffffff" stroke-width="1.5" />
            </g>

            <!-- Eğiklik Bilgi Notu -->
            ${p.showAxisAngle ? `
              <g transform="translate(300, 385)" font-size="10.5" fill="#475569" text-anchor="middle">
                <text>Eksen Eğikliği: <tspan font-weight="bold" fill="#dc2626">23° 27'</tspan> · Ekliptik (Yörünge) Açısı: <tspan font-weight="bold" fill="#0f172a">66° 33'</tspan> (Uzayda Yönü Değişmez)</text>
              </g>
            ` : ''}
          </svg>
        `;
      } else {
        // DETAYLI TEK KÜRE GÖRÜNÜMÜ (MEB Soru Klasiği)
        const isJune = p.viewMode === 'single_june';
        const isDec = p.viewMode === 'single_december';
        const isEquinox = p.viewMode === 'single_equinox';

        const titleText = isJune ? '21 Haziran Gün Dönümü (Yaz Başlangıcı)' : (isDec ? '21 Aralık Gün Dönümü (Kış Başlangıcı)' : '21 Mart / 23 Eylül Ekinoksu');
        const perpText = isJune ? "Yengeç Dönencesi (23° 27' K)" : (isDec ? "Oğlak Dönencesi (23° 27' G)" : "Ekvator (0°)");

        return `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 380" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif; background-color:#ffffff;">
            <!-- Başlık -->
            <text x="280" y="26" text-anchor="middle" font-size="14" font-weight="bold" fill="#0f172a">${escSvg(titleText)}</text>

            <!-- Güneş Işınları (Soldan Paralel Gelen Işınlar) -->
            ${p.showRays ? `
              <g id="solarRays" stroke="#f59e0b" stroke-width="2" stroke-linecap="round">
                <line x1="20" y1="80" x2="160" y2="80" />
                <polygon points="160,80 150,75 150,85" fill="#f59e0b" />
                <line x1="20" y1="130" x2="160" y2="130" />
                <polygon points="160,130 150,125 150,135" fill="#f59e0b" />
                <line x1="20" y1="180" x2="160" y2="180" stroke-width="3" stroke="#dc2626" />
                <polygon points="160,180 148,174 148,186" fill="#dc2626" />
                <text x="90" y="174" font-size="10" font-weight="bold" fill="#dc2626">Güneş Işınları (90° Dik)</text>
                <line x1="20" y1="230" x2="160" y2="230" />
                <polygon points="160,230 150,225 150,235" fill="#f59e0b" />
                <line x1="20" y1="280" x2="160" y2="280" />
                <polygon points="160,280 150,275 150,285" fill="#f59e0b" />
              </g>
            ` : ''}

            <!-- DÜNYA KÜRESİ (Merkez: 330, 180, R=120) -->
            <g id="earthGlobe" transform="translate(330, 180)">
              <!-- Temel Küre -->
              <circle cx="0" cy="0" r="120" fill="#f0fdf4" stroke="#0f172a" stroke-width="2" />

              <!-- Gece / Gündüz Taraması -->
              ${isJune ? `
                <!-- 21 Haziran: Işık soldan gelir, dikey aydınlanma çizgisi ortadan geçer; Kuzey kutup aydınlıkta! -->
                <path d="M 0,-120 A 120 120 0 0 1 0,120 Z" fill="#1e293b" fill-opacity="0.8" />
              ` : (isDec ? `
                <!-- 21 Aralık: Sağ taraf aydınlık veya soldan ışık geliyorsa sol aydınlık, sağ taraf karanlık -->
                <path d="M 0,-120 A 120 120 0 0 1 0,120 Z" fill="#1e293b" fill-opacity="0.8" />
              ` : `
                <!-- Ekinoks: Sol yarım aydınlık, sağ yarım karanlık -->
                <path d="M 0,-120 A 120 120 0 0 1 0,120 Z" fill="#1e293b" fill-opacity="0.8" />
              `)}

              <!-- Aydınlanma Çemberi (Dikey Kesit Çizgisi) -->
              <line x1="0" y1="-128" x2="0" y2="128" stroke="#ffffff" stroke-width="2.5" />
              <text x="4" y="-124" font-size="9.5" font-weight="bold" fill="#64748b">Aydınlanma Çemberi</text>

              <!-- Eksen Eğikliği Çizgisi (23°27\' Sağa Eğik) -->
              <g transform="rotate(${isJune ? 23.45 : (isDec ? -23.45 : 0)})">
                <!-- Dönme Ekseni -->
                <line x1="0" y1="-145" x2="0" y2="145" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" />
                <text x="-4" y="-150" font-size="12" font-weight="bold" fill="#dc2626">Kuzey Kutup Noktası (90°K)</text>
                <text x="-4" y="160" font-size="12" font-weight="bold" fill="#dc2626">Güney Kutup Noktası (90°G)</text>

                <!-- Ekvator (Eksene 90° Dik) -->
                <line x1="-120" y1="0" x2="120" y2="0" stroke="#0284c7" stroke-width="2.2" stroke-dasharray="4,3" />
                <text x="125" y="4" font-size="10.5" font-weight="bold" fill="#0284c7">Ekvator (0°)</text>

                <!-- Yengeç Dönencesi (23°27\' K) -->
                <line x1="-113" y1="-48" x2="113" y2="-48" stroke="#d97706" stroke-width="1.8" stroke-dasharray="3,3" />
                <text x="118" y="-45" font-size="9.5" font-weight="bold" fill="#d97706">Yengeç D. (23°27\' K)</text>

                <!-- Oğlak Dönencesi (23°27\' G) -->
                <line x1="-113" y1="48" x2="113" y2="48" stroke="#d97706" stroke-width="1.8" stroke-dasharray="3,3" />
                <text x="118" y="52" font-size="9.5" font-weight="bold" fill="#d97706">Oğlak D. (23°27\' G)</text>

                <!-- Kuzey Kutup Dairesi (66°33\' K) -->
                <line x1="-70" y1="-100" x2="70" y2="-100" stroke="#475569" stroke-width="1.5" stroke-dasharray="2,2" />
                <text x="75" y="-97" font-size="9" font-weight="bold" fill="#475569">66°33\' K</text>

                <!-- Güney Kutup Dairesi (66°33\' G) -->
                <line x1="-70" y1="100" x2="70" y2="100" stroke="#475569" stroke-width="1.5" stroke-dasharray="2,2" />
                <text x="75" y="103" font-size="9" font-weight="bold" fill="#475569">66°33\' G</text>
              </g>

              <!-- Eksen Açı Göstergesi (23°27\') -->
              ${p.showAxisAngle ? `
                <path d="M 0,-125 A 125 125 0 0 1 45,-116" fill="none" stroke="#dc2626" stroke-width="1.5" />
                <text x="25" y="-132" font-size="11" font-weight="bold" fill="#dc2626">23° 27'</text>
              ` : ''}
            </g>

            <!-- Açıklama Kutusu -->
            <g transform="translate(280, 360)" font-size="11" fill="#475569" text-anchor="middle">
              <text>Güneş Işınlarının Dik Açıyla (90°) Geldiği Enlem: <tspan font-weight="bold" fill="#dc2626">${perpText}</tspan></text>
            </g>
          </svg>
        `;
      }
    }
  },

  // --------------------------------------------------------------------------
  // 6. HORST - GRABEN KIRIK DAĞ SİSTEMİ (3D BLOK DİYAGRAM)
  // --------------------------------------------------------------------------
  horstGraben: {
    id: 'horstGraben',
    category: 'cografya',
    name: 'Horst - Graben Kırık Dağ Sistemi (3D Blok)',
    tags: ['TYT', 'AYT', 'KPSS', 'Orojenez', 'Fay', 'Horst', 'Graben', 'Ege Dağları'],
    desc: 'Ege Bölgesi kırıklı dağ oluşumu (Orojenez); normal fay düzlemleri, tabaka katmanları, yükselen horst ve çöken graben blokları.',
    defaultParams: {
      title: 'Kırık Dağlar (Horst - Graben Sistemi)',
      presetName: 'ege_classic',
      showFaultLines: true,
      showArrows: true,
      showLayers: true
    },
    presets: [
      {
        name: 'Ege Bölgesi Klasiği (Kaz - Madra - Yunt - Bozdağlar & Grabenler)',
        params: {
          title: 'Ege Kırık Dağları ve Çöküntü Ovaları',
          presetName: 'ege_classic',
          showFaultLines: true,
          showArrows: true,
          showLayers: true
        }
      }
    ],
    schema: [
      { key: 'title', label: 'Başlık', type: 'text' },
      { key: 'showFaultLines', label: 'Normal Fay Çizgilerini Göster', type: 'checkbox' },
      { key: 'showArrows', label: 'Yükselme / Çökme Yön Oklarını Göster', type: 'checkbox' },
      { key: 'showLayers', label: 'Tabaka / Tabakalanma Katmanlarını Göster', type: 'checkbox' }
    ],
    renderSvg(p) {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 340" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif; background-color:#ffffff;">
        <defs>
          <pattern id="strata1" width="10" height="10" patternTransform="rotate(20)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#94a3b8" stroke-width="1" />
          </pattern>
        </defs>

        <text x="270" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>

        <!-- 3D Blok Çizimi -->
        <!-- SOL HORST (Yükselen Blok) -->
        <g id="horstLeft">
          <polygon points="40,110 160,110 200,80 80,80" fill="#86efac" stroke="#15803d" stroke-width="1.8" />
          <polygon points="40,110 160,110 160,250 40,250" fill="#fef3c7" stroke="#0f172a" stroke-width="1.8" />
          <polygon points="160,110 200,80 200,220 160,250" fill="#d97706" fill-opacity="0.4" stroke="#0f172a" stroke-width="1.8" />
          
          <!-- Tabakalar -->
          ${p.showLayers ? `
            <line x1="40" y1="160" x2="160" y2="160" stroke="#b45309" stroke-width="1.5" stroke-dasharray="3,2" />
            <line x1="40" y1="205" x2="160" y2="205" stroke="#b45309" stroke-width="1.5" stroke-dasharray="3,2" />
          ` : ''}

          <text x="100" y="145" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">HORST</text>
          <text x="100" y="162" text-anchor="middle" font-size="9.5" fill="#475569">(Kırık Dağ)</text>
          ${p.showArrows ? `
            <line x1="100" y1="230" x2="100" y2="190" stroke="#16a34a" stroke-width="3" />
            <polygon points="100,185 94,195 106,195" fill="#16a34a" />
          ` : ''}
        </g>

        <!-- ORTA GRABEN (Çöken Blok) -->
        <g id="grabenMid">
          <polygon points="175,170 345,170 385,140 215,140" fill="#fed7aa" stroke="#c2410c" stroke-width="1.8" />
          <polygon points="175,170 345,170 345,290 175,290" fill="#ffedd5" stroke="#0f172a" stroke-width="1.8" />
          <polygon points="345,170 385,140 385,260 345,290" fill="#ea580c" fill-opacity="0.3" stroke="#0f172a" stroke-width="1.8" />

          <text x="260" y="205" text-anchor="middle" font-size="13" font-weight="bold" fill="#9a3412">GRABEN</text>
          <text x="260" y="222" text-anchor="middle" font-size="10" fill="#7c2d12">(Çöküntü Ovası)</text>
          ${p.showArrows ? `
            <line x1="260" y1="235" x2="260" y2="275" stroke="#dc2626" stroke-width="3" />
            <polygon points="260,280 254,270 266,270" fill="#dc2626" />
          ` : ''}
        </g>

        <!-- SAĞ HORST (Yükselen Blok) -->
        <g id="horstRight">
          <polygon points="360,110 480,110 520,80 400,80" fill="#86efac" stroke="#15803d" stroke-width="1.8" />
          <polygon points="360,110 480,110 480,250 360,250" fill="#fef3c7" stroke="#0f172a" stroke-width="1.8" />
          <polygon points="480,110 520,80 520,220 480,250" fill="#d97706" fill-opacity="0.4" stroke="#0f172a" stroke-width="1.8" />

          <text x="420" y="145" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">HORST</text>
          <text x="420" y="162" text-anchor="middle" font-size="9.5" fill="#475569">(Kırık Dağ)</text>
          ${p.showArrows ? `
            <line x1="420" y1="230" x2="420" y2="190" stroke="#16a34a" stroke-width="3" />
            <polygon points="420,185 414,195 426,195" fill="#16a34a" />
          ` : ''}
        </g>

        <!-- Fay Çizgileri -->
        ${p.showFaultLines ? `
          <g stroke="#dc2626" stroke-width="2.2" stroke-dasharray="4,3">
            <line x1="160" y1="80" x2="175" y2="290" />
            <text x="145" y="275" font-size="10" font-weight="bold" fill="#dc2626">Normal Fay</text>
            <line x1="360" y1="80" x2="345" y2="290" />
            <text x="375" y="275" font-size="10" font-weight="bold" fill="#dc2626">Normal Fay</text>
          </g>
        ` : ''}
      </svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 7. TOMBOLO (SAPLI ADA) & KIYI BİRİKTİRME ŞEKİLLERİ
  // --------------------------------------------------------------------------
  tomboloCoastal: {
    id: 'tomboloCoastal',
    category: 'cografya',
    name: 'Tombolo (Saplı Ada) & Kıyı Şekilleri',
    tags: ['TYT', 'AYT', 'KPSS', 'Tombolo', 'Saplı Ada', 'Sinop', 'Kapıdağ', 'Lagün'],
    desc: 'Dalga biriktirmesi sonucu adanın karaya bağlanması (Tombolo); anakara, dalga cepheleri, kıyı kordonu ve lagün (deniz kulağı).',
    defaultParams: {
      title: 'Tombolo (Saplı Ada) Oluşumu',
      exampleName: 'Sinop İnceburun & Kapıdağ Yarımadası',
      showWaveFronts: true,
      showDepositionArrows: true
    },
    presets: [
      {
        name: 'Sinop İnceburun Yarımadası Klasiği',
        params: {
          title: 'Tombolo Örneği: Sinop İnceburun',
          exampleName: 'Sinop Yarımadası',
          showWaveFronts: true,
          showDepositionArrows: true
        }
      },
      {
        name: 'Kapıdağ Yarımadası (Erdek / Balıkesir)',
        params: {
          title: 'Tombolo Örneği: Kapıdağ Yarımadası',
          exampleName: 'Kapıdağ Tombolosu',
          showWaveFronts: true,
          showDepositionArrows: true
        }
      }
    ],
    schema: [
      { key: 'title', label: 'Başlık', type: 'text' },
      { key: 'exampleName', label: 'Örnek İsimlendirmesi', type: 'text' },
      { key: 'showWaveFronts', label: 'Dalga Cephelerini Göster', type: 'checkbox' },
      { key: 'showDepositionArrows', label: 'Kıyı Biriktirme Oklarını Göster', type: 'checkbox' }
    ],
    renderSvg(p) {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 350" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif; background-color:#e0f2fe;">
        <!-- Deniz Arka Planı -->
        <rect width="540" height="350" fill="#e0f2fe" />

        <text x="270" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>

        <!-- Anakara (Güney / Alt Kısım) -->
        <path d="M 0,250 Q 150,220 230,230 Q 310,230 540,250 L 540,350 L 0,350 Z" fill="#bbf7d0" stroke="#16a34a" stroke-width="2" />
        <text x="100" y="300" font-size="14" font-weight="bold" fill="#166534">ANAKARA</text>

        <!-- Eski Ada (Kuzeyde Bağımsızken Karaya Bağlanan Ada) -->
        <ellipse cx="270" cy="115" rx="65" ry="45" fill="#bbf7d0" stroke="#16a34a" stroke-width="2" />
        <text x="270" y="112" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">ESKİ ADA</text>
        <text x="270" y="128" text-anchor="middle" font-size="10" fill="#15803d">(Saplı Ada)</text>

        <!-- Tombolo Kıyı Kordonu (Bağlantı Sapı) -->
        <path d="M 230,230 C 240,185 245,155 245,145 L 295,145 C 295,155 300,185 310,230 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="1.8" />
        <text x="270" y="195" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#854d0e">TOMBOLO</text>
        <text x="270" y="208" text-anchor="middle" font-size="9" fill="#a16207">(Kıyı Kordonu)</text>

        <!-- Dalga Cepheleri -->
        ${p.showWaveFronts ? `
          <g stroke="#38bdf8" stroke-width="1.5" fill="none" opacity="0.8">
            <!-- Sol Dalgalar -->
            <path d="M 50,80 Q 120,120 180,180" />
            <path d="M 80,60 Q 150,100 200,160" />
            <!-- Sağ Dalgalar -->
            <path d="M 490,80 Q 420,120 360,180" />
            <path d="M 460,60 Q 390,100 340,160" />
          </g>
        ` : ''}

        <!-- Biriktirme Okları -->
        ${p.showDepositionArrows ? `
          <g stroke="#ca8a04" stroke-width="2.2" fill="#ca8a04">
            <line x1="180" y1="185" x2="225" y2="195" />
            <polygon points="228,196 218,190 220,200" />
            <line x1="360" y1="185" x2="315" y2="195" />
            <polygon points="312,196 320,200 322,190" />
            <text x="270" y="255" text-anchor="middle" font-size="10" font-style="italic" fill="#64748b">Dalgaların taşıdığı kumların adayı karaya bağlaması</text>
          </g>
        ` : ''}

        <text x="270" y="335" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f172a">Örnek: ${escSvg(p.exampleName)}</text>
      </svg>`;
      return svg;
    }
  }
};


// Module Exports
__exports['GEO_TEMPLATES'] = GEO_TEMPLATES;

});

__define('modules/science/physTemplates.js', function(__exports, __require, __module) {
const { escSvg } = __require('modules/science/overlayEngine.js');

/**
 * Egemen's Testmaker — Fizik Şablon Envanteri (TYT & AYT)
 * Devreler, Vektörler, Dalgalar, Yay-Kütle, Eğik Düzlem, Manyetizma, Transformatör,
 * Isı-Sıcaklık, Makaralar, Optik, Dinamik ve Sıvı Basıncı.
 */

const PHYS_TEMPLATES = {
  // --------------------------------------------------------------------------
  // 1. ELEKTRİK DEVRESİ (DİNAMİK DİRENÇLER, PİL & ÖLÇÜ ALETLERİ)
  // --------------------------------------------------------------------------
  electricCircuit: {
    id: 'electricCircuit',
    category: 'fizik',
    name: 'Elektrik Devresi & Ohm Yasası',
    tags: ['TYT', 'AYT', 'Devre', 'Direnç', 'Ohm', 'Voltmetre'],
    desc: 'Seri/paralel dirençler, üreteç, anahtar, voltmetre ve ampermetre ile parametrik devre modeli. İstenilen yere serbest direnç sembolü ve formül konabilir.',
    defaultParams: {
      circuitType: 'series_parallel', // 'series' | 'parallel' | 'series_parallel' | 'wheatstone'
      vVal: '24 V',
      r1Val: '6 Ω',
      r2Val: '3 Ω',
      r3Val: '4 Ω',
      showVoltmeter: true,
      showAmmeter: true,
      switchState: 'closed', // 'open' | 'closed'
      showFormulaBox: true
    },
    presets: [
      {
        name: 'TYT 2023 - Seri ve Paralel Bağlı Lamba & Direnç (Eşdeğer Direnç)',
        params: {
          circuitType: 'series_parallel',
          vVal: '36 V',
          r1Val: '6 Ω',
          r2Val: '12 Ω',
          r3Val: '4 Ω',
          showVoltmeter: true,
          showAmmeter: true,
          switchState: 'closed',
          showFormulaBox: true
        }
      },
      {
        name: 'TYT - Paralel Kol Akım Paylaşımı & Voltmetre Ölçümü',
        params: {
          circuitType: 'parallel',
          vVal: '12 V',
          r1Val: '4 Ω',
          r2Val: '2 Ω',
          r3Val: '',
          showVoltmeter: true,
          showAmmeter: true,
          switchState: 'closed',
          showFormulaBox: true
        }
      },
      {
        name: 'Basit Seri Devre (R1 + R2)',
        params: {
          circuitType: 'series',
          vVal: '20 V',
          r1Val: '5 Ω',
          r2Val: '5 Ω',
          r3Val: '',
          showVoltmeter: false,
          showAmmeter: true,
          switchState: 'closed',
          showFormulaBox: false
        }
      }
    ],
    schema: [
      {
        key: 'circuitType',
        label: 'Devre Bağlantı Şekli',
        type: 'select',
        options: [
          { v: 'series_parallel', l: 'Karma (Seri + Paralel Kollar)' },
          { v: 'parallel', l: 'Paralel Bağlı Dirençler' },
          { v: 'series', l: 'Seri Bağlı Dirençler' }
        ]
      },
      { key: 'vVal', label: 'Üreteç Gerilimi (V)', type: 'text' },
      { key: 'r1Val', label: '1. Direnç Değeri (R₁)', type: 'text' },
      { key: 'r2Val', label: '2. Direnç Değeri (R₂)', type: 'text' },
      { key: 'r3Val', label: '3. Direnç Değeri (R₃)', type: 'text' },
      { key: 'showVoltmeter', label: 'Voltmetre (V) Göster', type: 'checkbox' },
      { key: 'showAmmeter', label: 'Ampermetre (A) Göster', type: 'checkbox' },
      {
        key: 'switchState',
        label: 'Anahtar Konumu',
        type: 'select',
        options: [{ v: 'closed', l: 'Kapalı (Akım Geçer)' }, { v: 'open', l: 'Açık (Akım Kesik)' }]
      },
      { key: 'showFormulaBox', label: 'Ohm Yasası Formül Kutusunu Göster (V = I·R)', type: 'checkbox' }
    ],
    renderSvg(p) {
      const isClosed = p.switchState === 'closed';

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 350" width="100%" height="100%" class="sci-interactive-svg" style="font-family:'Noto Sans',sans-serif;">
        <rect x="0" y="0" width="540" height="350" fill="#ffffff" />

        <!-- Ana Devre İletken Telleri -->
        <g stroke="#0f172a" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <!-- Alt Hat (Üreteç ve Anahtar) -->
          <line x1="80" y1="280" x2="210" y2="280" />
          <line x1="270" y1="280" x2="350" y2="280" />
          <line x1="410" y1="280" x2="460" y2="280" />
          <line x1="460" y1="280" x2="460" y2="80" />
          <line x1="80" y1="280" x2="80" y2="80" />
      `;

      if (p.circuitType === 'series') {
        svg += `
          <!-- Üst Seri Hat -->
          <line x1="80" y1="80" x2="160" y2="80" />
          <line x1="240" y1="80" x2="320" y2="80" />
          <line x1="400" y1="80" x2="460" y2="80" />
        </g>
        `;
        // R1 ve R2
        svg += renderResistorBox(200, 80, 'R₁', p.r1Val);
        svg += renderResistorBox(360, 80, 'R₂', p.r2Val);
      } else if (p.circuitType === 'parallel') {
        svg += `
          <!-- Üst Paralel Düğümler -->
          <line x1="80" y1="80" x2="180" y2="80" />
          <line x1="180" y1="50" x2="180" y2="130" />
          <line x1="180" y1="50" x2="220" y2="50" />
          <line x1="180" y1="130" x2="220" y2="130" />
          <line x1="300" y1="50" x2="340" y2="50" />
          <line x1="300" y1="130" x2="340" y2="130" />
          <line x1="340" y1="50" x2="340" y2="130" />
          <line x1="340" y1="80" x2="460" y2="80" />
        </g>
        `;
        svg += renderResistorBox(260, 50, 'R₁', p.r1Val);
        svg += renderResistorBox(260, 130, 'R₂', p.r2Val);
      } else {
        // Karma Devre
        svg += `
          <line x1="80" y1="80" x2="140" y2="80" />
          <line x1="220" y1="80" x2="270" y2="80" />
          <!-- Paralel Kollar -->
          <line x1="270" y1="50" x2="270" y2="120" />
          <line x1="270" y1="50" x2="310" y2="50" />
          <line x1="270" y1="120" x2="310" y2="120" />
          <line x1="390" y1="50" x2="430" y2="50" />
          <line x1="390" y1="120" x2="430" y2="120" />
          <line x1="430" y1="50" x2="430" y2="120" />
          <line x1="430" y1="80" x2="460" y2="80" />
        </g>
        `;
        svg += renderResistorBox(180, 80, 'R₁', p.r1Val);
        svg += renderResistorBox(350, 50, 'R₂', p.r2Val);
        svg += renderResistorBox(350, 120, 'R₃', p.r3Val);
      }

      // Üreteç (Pil)
      svg += `
        <g id="batteryComp" transform="translate(240, 280)">
          <line x1="-15" y1="-18" x2="-15" y2="18" stroke="#0f172a" stroke-width="4" />
          <line x1="15" y1="-10" x2="15" y2="10" stroke="#0f172a" stroke-width="2.5" />
          <text x="-25" y="-12" font-size="12" font-weight="bold" fill="#dc2626">+</text>
          <text x="25" y="-12" font-size="12" font-weight="bold" fill="#0f172a">-</text>
          <text x="0" y="32" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">V = ${escSvg(p.vVal)}</text>
        </g>
      `;

      // Anahtar (K anahtarı)
      svg += `
        <g id="switchComp" transform="translate(380, 280)">
          <circle cx="-15" cy="0" r="3.5" fill="#0f172a" />
          <circle cx="15" cy="0" r="3.5" fill="${isClosed ? '#0f172a' : '#ffffff'}" stroke="#0f172a" stroke-width="2" />
          <line x1="-15" y1="0" x2="${isClosed ? '15' : '10'}" y2="${isClosed ? '0' : '-16'}" stroke="#0f172a" stroke-width="2.5" />
          <text x="0" y="-18" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f172a">K (${isClosed ? 'Kapalı' : 'Açık'})</text>
        </g>
      `;

      // Ampermetre (Devre üzerinde seri)
      if (p.showAmmeter) {
        svg += `
          <g id="ammeterComp" transform="translate(460, 180)">
            <circle cx="0" cy="0" r="16" fill="#ffffff" stroke="#059669" stroke-width="2.5" />
            <text x="0" y="6" text-anchor="middle" font-size="15" font-weight="bold" fill="#059669">A</text>
            <text x="26" y="5" font-size="11" font-weight="bold" fill="#059669">A₁</text>
          </g>
        `;
      }

      // Voltmetre (R1 üzerine paralel bağlı)
      if (p.showVoltmeter) {
        svg += `
          <g id="voltmeterComp" stroke="#2563eb" stroke-width="1.8" fill="none">
            <line x1="140" y1="80" x2="140" y2="20" />
            <line x1="140" y1="20" x2="180" y2="20" />
            <line x1="220" y1="20" x2="220" y2="80" />
            <circle cx="180" cy="20" r="15" fill="#ffffff" stroke="#2563eb" stroke-width="2" />
            <text x="180" y="25" text-anchor="middle" font-size="14" font-weight="bold" fill="#2563eb" stroke="none">V</text>
          </g>
        `;
      }

      // Akım Yönü Oku
      if (isClosed) {
        svg += `
          <g fill="#dc2626" stroke="#dc2626" stroke-width="1.5">
            <line x1="70" y1="180" x2="70" y2="140" />
            <polygon points="70,132 66,145 74,145" />
            <text x="60" y="160" text-anchor="end" font-size="11" font-weight="bold" stroke="none">i (Akım)</text>
          </g>
        `;
      }

      // Formül Kutusu (Ohm Kanunu)
      if (p.showFormulaBox) {
        svg += `
          <g transform="translate(30, 20)">
            <rect x="0" y="0" width="130" height="34" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
            <text x="65" y="22" text-anchor="middle" font-size="12" font-style="italic" font-weight="bold" fill="#0f172a">V = I · R</text>
          </g>
        `;
      }

      svg += `</svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 2. VEKTÖRLER & KARELİ DÜZLEMDE BİLEŞKE KUVVET
  // --------------------------------------------------------------------------
  vectorsGrid: {
    id: 'vectorsGrid',
    category: 'fizik',
    name: 'Vektörler & Bileşke Kuvvet (Kareli Düzlem)',
    tags: ['TYT', 'AYT', 'Vektör', 'Bileşke', 'Kuvvet', 'Kareli Düzlem'],
    desc: 'Kareli koordinat düzleminde F1, F2, F3 vektörleri, bileşke R vektörü ve açı hesaplamaları.',
    defaultParams: {
      title: 'Aynı Düzlemdeki Vektörlerin Bileşkesi',
      gridSize: '6x6',
      showResultant: true,
      f1: '3, 1', // dx, dy birim cinsinden
      f2: '-2, 3',
      f3: '1, -2'
    },
    presets: [
      {
        name: 'AYT - 3 Vektörün Bileşkesi (R = F1 + F2 + F3)',
        params: {
          title: 'Sürtünmesiz Yatay Düzlemde Cisme Etki Eden Kuvvetler',
          showResultant: true,
          f1: '3, 1',
          f2: '-1, 2',
          f3: '0, -2'
        }
      },
      {
        name: 'Denge Durumu (Bileşke Sıfır: R = 0)',
        params: {
          title: 'Hareketsiz Duran Cisme Etki Eden Dengelenmiş Kuvvetler',
          showResultant: false,
          f1: '2, 2',
          f2: '-2, 1',
          f3: '0, -3'
        }
      }
    ],
    schema: [
      { key: 'title', label: 'Soru Başlığı', type: 'text' },
      { key: 'f1', label: '1. Kuvvet Vektörü (dx, dy)', type: 'text', hint: 'Örn: 3, 1' },
      { key: 'f2', label: '2. Kuvvet Vektörü (dx, dy)', type: 'text', hint: 'Örn: -2, 3' },
      { key: 'f3', label: '3. Kuvvet Vektörü (dx, dy)', type: 'text', hint: 'Örn: 1, -2' },
      { key: 'showResultant', label: 'Bileşke Vektörü (R) Göster', type: 'checkbox' }
    ],
    renderSvg(p) {
      const originX = 260;
      const originY = 175;
      const u = 32; // 1 birim kare 32px

      const parseV = (str) => {
        const parts = (str || '0,0').split(',').map(s => parseFloat(s.trim()) || 0);
        return { dx: parts[0], dy: parts[1] };
      };

      const v1 = parseV(p.f1);
      const v2 = parseV(p.f2);
      const v3 = parseV(p.f3);
      const rVec = { dx: v1.dx + v2.dx + v3.dx, dy: v1.dy + v2.dy + v3.dy };

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 350" width="100%" height="100%" class="sci-interactive-svg" style="font-family:'Noto Sans',sans-serif;">
        <rect x="0" y="0" width="540" height="350" fill="#ffffff" />
        ${p.title ? `<text x="270" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>` : ''}

        <!-- 8x8 Kareli Grid Izgarası -->
        <g stroke="#e2e8f0" stroke-width="1.2">
      `;

      for (let i = -4; i <= 4; i++) {
        svg += `<line x1="${originX - 4 * u}" y1="${originY + i * u}" x2="${originX + 4 * u}" y2="${originY + i * u}" />`;
        svg += `<line x1="${originX + i * u}" y1="${originY - 4 * u}" x2="${originX + i * u}" y2="${originY + 4 * u}" />`;
      }

      svg += `</g>`;

      // Eksen Çizgileri
      svg += `
        <line x1="${originX - 4 * u}" y1="${originY}" x2="${originX + 4 * u}" y2="${originY}" stroke="#94a3b8" stroke-width="1.8" />
        <line x1="${originX}" y1="${originY - 4 * u}" x2="${originX}" y2="${originY + 4 * u}" stroke="#94a3b8" stroke-width="1.8" />
        <!-- Orijin Cismi (Kütle) -->
        <circle cx="${originX}" cy="${originY}" r="5" fill="#0f172a" />
        <text x="${originX - 8}" y="${originY + 16}" font-size="11" font-weight="bold" fill="#64748b">O</text>
      `;

      // Vektör Çizim Fonksiyonu
      const drawVec = (dx, dy, color, label) => {
        const targetX = originX + dx * u;
        const targetY = originY - dy * u; // SVG y ekseni ters
        const angle = Math.atan2(targetY - originY, targetX - originX);
        const headLen = 10;
        const x1 = targetX - headLen * Math.cos(angle - Math.PI / 6);
        const y1 = targetY - headLen * Math.sin(angle - Math.PI / 6);
        const x2 = targetX - headLen * Math.cos(angle + Math.PI / 6);
        const y2 = targetY - headLen * Math.sin(angle + Math.PI / 6);

        return `
          <line x1="${originX}" y1="${originY}" x2="${targetX}" y2="${targetY}" stroke="${color}" stroke-width="2.6" stroke-linecap="round" />
          <polygon points="${targetX},${targetY} ${x1},${y1} ${x2},${y2}" fill="${color}" />
          <text x="${targetX + (dx >= 0 ? 8 : -14)}" y="${targetY + (dy >= 0 ? -6 : 14)}" font-size="12" font-weight="bold" fill="${color}">${label}</text>
        `;
      };

      svg += drawVec(v1.dx, v1.dy, '#2563eb', 'F₁');
      svg += drawVec(v2.dx, v2.dy, '#059669', 'F₂');
      svg += drawVec(v3.dx, v3.dy, '#d97706', 'F₃');

      if (p.showResultant && (rVec.dx !== 0 || rVec.dy !== 0)) {
        svg += drawVec(rVec.dx, rVec.dy, '#dc2626', 'R (Bileşke)');
      }

      // 1 birim kare lejantı
      svg += `
        <g transform="translate(420, 290)">
          <rect x="0" y="0" width="${u}" height="${u}" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5" />
          <text x="${u / 2}" y="${u / 2 + 4}" font-size="10" font-weight="bold" fill="#64748b" text-anchor="middle">1 br</text>
        </g>
      `;

      svg += `</svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 3. DALGALAR & PERİYODİK HAREKET
  // --------------------------------------------------------------------------
  waveMotion: {
    id: 'waveMotion',
    category: 'fizik',
    name: 'Dalgalar (Enine Dalga, Dalga Boyu λ & Genlik)',
    tags: ['TYT', 'AYT', 'Dalga Boyu', 'Genlik', 'Tepe', 'Çukur', 'Frekans'],
    desc: 'Sinüzoidal enine dalga modeli; dalga boyu (λ), genlik (A), dalga tepesi, dalga çukuru ve ilerleme yönü.',
    defaultParams: {
      title: 'Periyodik Dalga Modeli (Dalga Boyu & Genlik)',
      waveLengthLabel: 'λ = 8 cm',
      amplitudeLabel: 'A = 4 cm',
      cycles: 2.5,
      showNodes: true,
      showArrow: true
    },
    presets: [
      {
        name: 'TYT - İki Tepe Arası Dalga Boyu Ölçümü',
        params: {
          title: 'Homojen Ortamda İlerleyen Periyodik Dalga',
          waveLengthLabel: 'λ (Dalga Boyu)',
          amplitudeLabel: 'Genlik (A)',
          cycles: 2.5,
          showNodes: true,
          showArrow: true
        }
      }
    ],
    schema: [
      { key: 'title', label: 'Şema Başlığı', type: 'text' },
      { key: 'waveLengthLabel', label: 'Dalga Boyu Etiketi (λ)', type: 'text' },
      { key: 'amplitudeLabel', label: 'Genlik Etiketi (A)', type: 'text' },
      { key: 'showNodes', label: 'Tepe & Çukur Noktalarını İşaretle', type: 'checkbox' },
      { key: 'showArrow', label: 'İlerleme Yönü Okunu Göster', type: 'checkbox' }
    ],
    renderSvg(p) {
      const startX = 60;
      const endX = 480;
      const centerY = 180;
      const amp = 60; // Genlik px
      const lambda = 160; // Dalga boyu px

      let pathD = `M ${startX} ${centerY}`;
      for (let x = startX; x <= endX; x += 4) {
        const y = centerY - amp * Math.sin(((x - startX) / lambda) * 2 * Math.PI);
        pathD += ` L ${x} ${y.toFixed(1)}`;
      }

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 340" width="100%" height="100%" class="sci-interactive-svg" style="font-family:'Noto Sans',sans-serif;">
        <rect x="0" y="0" width="540" height="340" fill="#ffffff" />
        ${p.title ? `<text x="270" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>` : ''}

        <!-- Denge Konumu (Eksen) -->
        <line x1="${startX - 20}" y1="${centerY}" x2="${endX + 20}" y2="${centerY}" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="6,4" />
        <text x="${endX + 25}" y="${centerY + 4}" font-size="11" font-weight="bold" fill="#64748b">Denge Konumu</text>

        <!-- Sinüs Dalga Eğrisi -->
        <path d="${pathD}" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" />

        <!-- Dalga Boyu (λ) Ölçüm Çizgisi (İki Tepe Arası) -->
        <g stroke="#dc2626" stroke-width="1.8">
          <line x1="${startX + lambda * 0.25}" y1="${centerY - amp - 15}" x2="${startX + lambda * 1.25}" y2="${centerY - amp - 15}" />
          <line x1="${startX + lambda * 0.25}" y1="${centerY - amp - 20}" x2="${startX + lambda * 0.25}" y2="${centerY - amp - 10}" />
          <line x1="${startX + lambda * 1.25}" y1="${centerY - amp - 20}" x2="${startX + lambda * 1.25}" y2="${centerY - amp - 10}" />
          <text x="${startX + lambda * 0.75}" y="${centerY - amp - 22}" text-anchor="middle" font-size="12" font-weight="bold" fill="#dc2626" stroke="none">${escSvg(p.waveLengthLabel)}</text>
        </g>

        <!-- Genlik (A) Ölçüm Çizgisi -->
        <g stroke="#059669" stroke-width="1.8">
          <line x1="${startX + lambda * 0.25}" y1="${centerY}" x2="${startX + lambda * 0.25}" y2="${centerY - amp}" stroke-dasharray="3,3" />
          <line x1="${startX + lambda * 0.25 - 25}" y1="${centerY - amp}" x2="${startX + lambda * 0.25 - 25}" y2="${centerY}" />
          <line x1="${startX + lambda * 0.25 - 30}" y1="${centerY - amp}" x2="${startX + lambda * 0.25 - 20}" y2="${centerY - amp}" />
          <line x1="${startX + lambda * 0.25 - 30}" y1="${centerY}" x2="${startX + lambda * 0.25 - 20}" y2="${centerY}" />
          <text x="${startX + lambda * 0.25 - 35}" y="${centerY - amp / 2 + 4}" text-anchor="end" font-size="11" font-weight="bold" fill="#059669" stroke="none">${escSvg(p.amplitudeLabel)}</text>
        </g>
      `;

      // Tepe & Çukur Noktaları
      if (p.showNodes) {
        svg += `
          <circle cx="${startX + lambda * 0.25}" cy="${centerY - amp}" r="4.5" fill="#dc2626" />
          <text x="${startX + lambda * 0.25}" y="${centerY - amp - 4}" text-anchor="middle" font-size="10" font-weight="bold" fill="#dc2626">Dalga Tepesi</text>

          <circle cx="${startX + lambda * 0.75}" cy="${centerY + amp}" r="4.5" fill="#2563eb" />
          <text x="${startX + lambda * 0.75}" y="${centerY + amp + 16}" text-anchor="middle" font-size="10" font-weight="bold" fill="#2563eb">Dalga Çukuru</text>
        `;
      }

      // İlerleme Yönü Oku
      if (p.showArrow) {
        svg += `
          <g transform="translate(360, 60)">
            <line x1="0" y1="0" x2="60" y2="0" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" />
            <polygon points="68,0 56,-5 56,5" fill="#0f172a" />
            <text x="30" y="-10" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f172a">İlerleme Hızı (v)</text>
          </g>
        `;
      }

      // Formül Kutusu
      svg += `
        <g transform="translate(30, 270)">
          <rect x="0" y="0" width="180" height="36" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
          <text x="90" y="23" text-anchor="middle" font-size="12" font-style="italic" font-weight="bold" fill="#0f172a">v = λ · f  =  λ / T</text>
        </g>
      `;

      svg += `</svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 4. YAY-KÜTLE SİSTEMİ & BASİT HARMONİK HAREKET
  // --------------------------------------------------------------------------
  springHarmonic: {
    id: 'springHarmonic',
    category: 'fizik',
    name: 'Yay - Kütle Sistemi & Harmonik Hareket',
    tags: ['AYT', 'Yay', 'Basit Harmonik Hareket', 'Periyot', 'Hooke'],
    desc: 'Tavana asılı veya yatay düzlemde yay sabiti (k), asılı kütle (m), denge konumu ve periyot (T = 2π√(m/k)) modeli.',
    defaultParams: {
      title: 'Düşey Yay - Kütle Sistemi',
      springK: 'k = 100 N/m',
      massM: 'm = 4 kg',
      displacement: '+x (Uzanım)',
      showPeriodFormula: true
    },
    presets: [
      {
        name: 'AYT - Periyot Hesabı (T = 2π√(m/k))',
        params: {
          title: 'Sürtünmesiz Ortamda Salınım Yapan Yaylı Sarkaç',
          springK: 'k = 200 N/m',
          massM: 'm = 2 kg',
          displacement: '+x',
          showPeriodFormula: true
        }
      }
    ],
    schema: [
      { key: 'title', label: 'Şema Başlığı', type: 'text' },
      { key: 'springK', label: 'Yay Sabiti (k)', type: 'text' },
      { key: 'massM', label: 'Kütle Değeri (m)', type: 'text' },
      { key: 'displacement', label: 'Uzanım / Genlik (+x, -x)', type: 'text' },
      { key: 'showPeriodFormula', label: 'Periyot Formülünü Göster', type: 'checkbox' }
    ],
    renderSvg(p) {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 350" width="100%" height="100%" class="sci-interactive-svg" style="font-family:'Noto Sans',sans-serif;">
        <rect x="0" y="0" width="540" height="350" fill="#ffffff" />
        ${p.title ? `<text x="270" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>` : ''}

        <!-- Tavan (Sabit Askı Noktası) -->
        <line x1="180" y1="60" x2="340" y2="60" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
        <!-- Tavan Taraması -->
        <g stroke="#94a3b8" stroke-width="1.5">
          ${[190, 210, 230, 250, 270, 290, 310, 330].map(x => `<line x1="${x}" y1="60" x2="${x + 8}" y2="50" />`).join('')}
        </g>

        <!-- Helezon Yay Çizimi -->
        <path d="
          M 260 60
          L 260 75
          C 230 85 290 95 260 105
          C 230 115 290 125 260 135
          C 230 145 290 155 260 165
          C 230 175 290 185 260 195
          L 260 210
        " fill="none" stroke="#475569" stroke-width="3.5" stroke-linecap="round" />

        <!-- Yay Sabiti Etiketi -->
        <rect x="285" y="125" width="${p.springK.length * 7 + 16}" height="22" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
        <text x="293" y="140" font-size="11" font-weight="bold" fill="#0f172a">${escSvg(p.springK)}</text>

        <!-- Asılı Kütle (m) -->
        <g transform="translate(260, 240)">
          <rect x="-35" y="-30" width="70" height="60" rx="6" fill="#cbd5e1" stroke="#334155" stroke-width="2.5" />
          <text x="0" y="5" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">${escSvg(p.massM)}</text>
        </g>

        <!-- Denge & Genlik Seviyeleri (O, +x, -x) -->
        <g stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5,4">
          <!-- -x Seviyesi -->
          <line x1="120" y1="190" x2="400" y2="190" />
          <text x="410" y="194" font-size="11" font-weight="bold" fill="#dc2626">+r (Üst Denge)</text>

          <!-- O Denge Noktası -->
          <line x1="120" y1="240" x2="400" y2="240" stroke="#2563eb" />
          <text x="410" y="244" font-size="11" font-weight="bold" fill="#2563eb">O (Denge Noktası)</text>

          <!-- +x Seviyesi -->
          <line x1="120" y1="290" x2="400" y2="290" />
          <text x="410" y="294" font-size="11" font-weight="bold" fill="#dc2626">-r (Alt Denge)</text>
        </g>

        <!-- Formül Kutusu -->
        ${p.showPeriodFormula ? `
          <g transform="translate(30, 275)">
            <rect x="0" y="0" width="160" height="42" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
            <text x="80" y="26" text-anchor="middle" font-size="13" font-style="italic" font-weight="bold" fill="#0f172a">T = 2π √(m / k)</text>
          </g>
        ` : ''}
      `;

      svg += `</svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 5. EĞİK DÜZLEM & SÜRTÜNME KUVVETİ
  // --------------------------------------------------------------------------
  inclinedPlane: {
    id: 'inclinedPlane',
    category: 'fizik',
    name: 'Eğik Düzlem & Sürtünme Kuvveti',
    tags: ['TYT', 'AYT', 'Dinamik', 'Eğik Düzlem', 'Sürtünme', 'Kuvvet'],
    desc: 'α açılı eğik düzlemde m kütleli cisim, mg sinα, mg cosα bileşenleri, tepki kuvveti (N) ve sürtünme (Fs).',
    defaultParams: {
      title: 'Eğik Düzlemde Cisme Etki Eden Kuvvetler',
      angleAlpha: '37°',
      massLabel: 'm = 5 kg',
      frictionState: 'with_friction', // 'frictionless' | 'with_friction'
      showComponents: true
    },
    presets: [
      {
        name: 'AYT - 37° Eğik Düzlemde İvme Hesabı (sin 37° = 0.6, cos 37° = 0.8)',
        params: {
          title: 'Sürtünmeli Eğik Düzlemde Kayan Cisim (k = 0.2)',
          angleAlpha: '37°',
          massLabel: 'm = 2 kg',
          frictionState: 'with_friction',
          showComponents: true
        }
      }
    ],
    schema: [
      { key: 'title', label: 'Şema Başlığı', type: 'text' },
      { key: 'angleAlpha', label: 'Eğik Düzlem Açısı (α)', type: 'text' },
      { key: 'massLabel', label: 'Cisim Kütlesi (m)', type: 'text' },
      {
        key: 'frictionState',
        label: 'Sürtünme Durumu',
        type: 'select',
        options: [{ v: 'with_friction', l: 'Sürtünmeli (Fs Oku Var)' }, { v: 'frictionless', l: 'Sürtünmesiz (Fs = 0)' }]
      },
      { key: 'showComponents', label: 'Ağırlık Bileşenlerini Göster (mg·sinα, mg·cosα)', type: 'checkbox' }
    ],
    renderSvg(p) {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 350" width="100%" height="100%" class="sci-interactive-svg" style="font-family:'Noto Sans',sans-serif;">
        <rect x="0" y="0" width="540" height="350" fill="#ffffff" />
        ${p.title ? `<text x="270" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>` : ''}

        <!-- Eğik Düzlem Kama Geometrisi -->
        <polygon points="60,280 440,280 440,90" fill="#e2e8f0" stroke="#1e293b" stroke-width="2.5" stroke-linejoin="round" />

        <!-- Açı α Yay Çizimi -->
        <path d="M 120 280 A 60 60 0 0 0 110 255" fill="none" stroke="#dc2626" stroke-width="2" />
        <text x="130" y="272" font-size="12" font-weight="bold" fill="#dc2626">α = ${escSvg(p.angleAlpha)}</text>

        <!-- Düzlem Üzerindeki Blok (Döndürülmüş Koordinat Sistemi: ~26.5 derece) -->
        <g transform="translate(250, 185) rotate(-26.5)">
          <rect x="-35" y="-45" width="70" height="45" rx="4" fill="#cbd5e1" stroke="#0f172a" stroke-width="2" />
          <text x="0" y="-20" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f172a">${escSvg(p.massLabel)}</text>

          <!-- Normal Tepki Kuvveti (N) -->
          <line x1="0" y1="-45" x2="0" y2="-95" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round" />
          <polygon points="0,-100 -4,-90 4,-90" fill="#2563eb" />
          <text x="-8" y="-98" font-size="11" font-weight="bold" fill="#2563eb">N</text>

          <!-- Sürtünme Kuvveti (Fs) -->
          ${p.frictionState === 'with_friction' ? `
            <line x1="35" y1="-2" x2="85" y2="-2" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" />
            <polygon points="90,-2 80,-6 80,2" fill="#d97706" />
            <text x="96" y="2" font-size="11" font-weight="bold" fill="#d97706">Fs</text>
          ` : ''}

          <!-- mg sinα (Aşağı Doğru Çeken Kuvvet) -->
          ${p.showComponents ? `
            <line x1="-35" y1="-2" x2="-85" y2="-2" stroke="#dc2626" stroke-width="2.2" stroke-linecap="round" />
            <polygon points="-90,-2 -80,-6 -80,2" fill="#dc2626" />
            <text x="-95" y="2" text-anchor="end" font-size="11" font-weight="bold" fill="#dc2626">mg · sinα</text>
          ` : ''}
        </g>

        <!-- Gerçek Düşey Ağırlık Vektörü (G = mg) -->
        <g transform="translate(250, 185)">
          <line x1="0" y1="0" x2="0" y2="70" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" />
          <polygon points="0,78 -5,66 5,66" fill="#0f172a" />
          <text x="10" y="74" font-size="12" font-weight="bold" fill="#0f172a">G = m·g</text>
        </g>
      `;

      svg += `</svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 6. MANYETİK ALAN & İNDÜKSİYON (SAĞ EL KURALI)
  // --------------------------------------------------------------------------
  magneticField: {
    id: 'magneticField',
    category: 'fizik',
    name: 'Manyetik Alan & Sağ El Kuralı (B, I, F)',
    tags: ['AYT', 'Manyetizma', 'Sağ El Kuralı', 'Lorentz', 'Manyetik Kuvvet'],
    desc: 'Manyetik alan çizgileri (B), akım geçen düz tel (I) ve etkiyen manyetik kuvvet (F = B·I·L·sinθ).',
    defaultParams: {
      title: 'Manyetik Alandaki Akım Taşıyan Tele Etkiyen Kuvvet',
      bFieldLabel: 'B (Manyetik Alan)',
      currentLabel: 'I = 4 A',
      forceLabel: 'F = B · I · L',
      bDirection: 'into_page' // 'into_page' (çarpı) | 'out_of_page' (nokta) | 'right'
    },
    presets: [
      {
        name: 'AYT - Sayfa Düzlemine Dik Manyetik Alan (Çarpı: ⊗)',
        params: {
          title: 'Sayfa Düzleminden İçeri Doğru Düzgün B Alanı',
          bFieldLabel: 'B (İçeri ⊗)',
          currentLabel: 'I',
          forceLabel: 'F (Manyetik Kuvvet)',
          bDirection: 'into_page'
        }
      }
    ],
    schema: [
      { key: 'title', label: 'Şema Başlığı', type: 'text' },
      { key: 'bFieldLabel', label: 'Manyetik Alan Etiketi', type: 'text' },
      { key: 'currentLabel', label: 'Akım Etiketi (I)', type: 'text' },
      { key: 'forceLabel', label: 'Manyetik Kuvvet Etiketi (F)', type: 'text' },
      {
        key: 'bDirection',
        label: 'Manyetik Alan Yönü',
        type: 'select',
        options: [
          { v: 'into_page', l: 'Sayfa Düzleminden İçeri (⊗)' },
          { v: 'out_of_page', l: 'Sayfa Düzleminden Dışarı (⊙)' }
        ]
      }
    ],
    renderSvg(p) {
      const isInto = p.bDirection === 'into_page';

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 340" width="100%" height="100%" class="sci-interactive-svg" style="font-family:'Noto Sans',sans-serif;">
        <rect x="0" y="0" width="540" height="340" fill="#ffffff" />
        ${p.title ? `<text x="270" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>` : ''}

        <!-- Düzgün Manyetik Alan Bölgesi (Kutusu) -->
        <rect x="80" y="60" width="380" height="230" rx="8" fill="#f0fdf4" stroke="#86efac" stroke-width="1.8" />
        <text x="95" y="85" font-size="12" font-weight="bold" fill="#166534">${escSvg(p.bFieldLabel)}</text>

        <!-- Manyetik Alan Sembolleri Matrisi -->
        <g stroke="#16a34a" stroke-width="1.6">
      `;

      for (let rx = 140; rx <= 420; rx += 70) {
        for (let ry = 95; ry <= 260; ry += 55) {
          if (isInto) {
            // Çarpı (Sayfadan içeri)
            svg += `
              <circle cx="${rx}" cy="${ry}" r="9" fill="#ffffff" />
              <line x1="${rx - 5}" y1="${ry - 5}" x2="${rx + 5}" y2="${ry + 5}" />
              <line x1="${rx + 5}" y1="${ry - 5}" x2="${rx - 5}" y2="${ry + 5}" />
            `;
          } else {
            // Nokta (Sayfadan dışarı)
            svg += `
              <circle cx="${rx}" cy="${ry}" r="9" fill="#ffffff" />
              <circle cx="${rx}" cy="${ry}" r="2.5" fill="#16a34a" />
            `;
          }
        }
      }

      svg += `</g>`;

      // Akım Geçen Düz İletken Tel (Yatay veya Düşey)
      svg += `
        <!-- İletken Tel -->
        <line x1="120" y1="180" x2="420" y2="180" stroke="#0f172a" stroke-width="5" stroke-linecap="round" />
        <!-- Akım Oku -->
        <polygon points="432,180 416,173 416,187" fill="#0f172a" />
        <text x="440" y="184" font-size="13" font-weight="bold" fill="#0f172a">${escSvg(p.currentLabel)}</text>

        <!-- Manyetik Kuvvet Oku (F) -> Sağ El Kuralı: Başparmak akım (+x), Dört parmak içeri, Avuç içi yukarı (+y) -->
        <g transform="translate(270, 180)">
          <line x1="0" y1="0" x2="0" y2="-75" stroke="#dc2626" stroke-width="3" stroke-linecap="round" />
          <polygon points="0,-85 -6,-72 6,-72" fill="#dc2626" />
          <text x="12" y="-72" font-size="13" font-weight="bold" fill="#dc2626">${escSvg(p.forceLabel)}</text>
        </g>
      `;

      svg += `</svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 7. ISI - SICAKLIK HAL DEĞİŞİM GRAFİĞİ
  // --------------------------------------------------------------------------
  thermalHeatGraph: {
    id: 'thermalHeatGraph',
    category: 'fizik',
    name: 'Isı - Sıcaklık Hal Değişim Grafiği',
    tags: ['TYT', 'Isı', 'Sıcaklık', 'Hal Değişimi', 'Erime', 'Kaynama'],
    desc: 'Sıcaklık (T) - Verilen Isı (Q) grafiği; katı, erime, sıvı, kaynama ve gaz fazları.',
    defaultParams: {
      title: 'Saf Maddenin Sıcaklık - Isı Grafiği',
      tMelt: '0 °C (Erime)',
      tBoil: '100 °C (Kaynama)',
      q1: 'Q₁',
      q2: 'Q₂',
      q3: 'Q₃'
    },
    presets: [
      {
        name: 'TYT - Saf Suyun Isınma ve Hal Değişimi (Buz -> Su -> Buhar)',
        params: {
          title: '1 Atm Basınçta Buzun Su ve Buhara Dönüşümü',
          tMelt: '0 °C (Erime Noktası)',
          tBoil: '100 °C (Kaynama Noktası)',
          q1: 'Q₁',
          q2: 'Q₂',
          q3: 'Q₃'
        }
      }
    ],
    schema: [
      { key: 'title', label: 'Grafik Başlığı', type: 'text' },
      { key: 'tMelt', label: 'Erime Sıcaklığı', type: 'text' },
      { key: 'tBoil', label: 'Kaynama Sıcaklığı', type: 'text' }
    ],
    renderSvg(p) {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 340" width="100%" height="100%" class="sci-interactive-svg" style="font-family:'Noto Sans',sans-serif;">
        <rect x="0" y="0" width="540" height="340" fill="#ffffff" />
        ${p.title ? `<text x="270" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>` : ''}

        <!-- Eksenler -->
        <g stroke="#0f172a" stroke-width="2">
          <!-- Sıcaklık Ekseni (T) -->
          <line x1="80" y1="280" x2="80" y2="45" />
          <polygon points="80,38 75,50 85,50" fill="#0f172a" />
          <text x="70" y="42" text-anchor="end" font-size="12" font-weight="bold">Sıcaklık (T)</text>

          <!-- Isı Ekseni (Q) -->
          <line x1="80" y1="280" x2="490" y2="280" />
          <polygon points="498,280 486,275 486,285" fill="#0f172a" />
          <text x="495" y="298" font-size="12" font-weight="bold">Verilen Isı (Q)</text>
        </g>

        <!-- Hal Değişimi Eğrisi -->
        <!-- 1. Katı Isınma (80,260 -> 140,210) -->
        <!-- 2. Erime Platrosu (140,210 -> 220,210) -->
        <!-- 3. Sıvı Isınma (220,210 -> 300,120) -->
        <!-- 4. Kaynama Platosu (300,120 -> 400,120) -->
        <!-- 5. Gaz Isınma (400,120 -> 460,70) -->
        <path d="M 80 260 L 140 210 L 220 210 L 300 120 L 400 120 L 460 70" fill="none" stroke="#2563eb" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Erime Noktası Kesikli Çizgisi -->
        <line x1="80" y1="210" x2="220" y2="210" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4,4" />
        <text x="72" y="214" text-anchor="end" font-size="10.5" font-weight="bold" fill="#dc2626">${escSvg(p.tMelt)}</text>

        <!-- Kaynama Noktası Kesikli Çizgisi -->
        <line x1="80" y1="120" x2="400" y2="120" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4,4" />
        <text x="72" y="124" text-anchor="end" font-size="10.5" font-weight="bold" fill="#dc2626">${escSvg(p.tBoil)}</text>

        <!-- Faz Etiketleri -->
        <text x="100" y="245" font-size="10" font-weight="bold" fill="#64748b">Katı</text>
        <text x="180" y="200" text-anchor="middle" font-size="10" font-weight="bold" fill="#0284c7">Katı + Sıvı (Erime)</text>
        <text x="250" y="170" font-size="10" font-weight="bold" fill="#64748b">Sıvı</text>
        <text x="350" y="110" text-anchor="middle" font-size="10" font-weight="bold" fill="#0284c7">Sıvı + Gaz (Kaynama)</text>
        <text x="440" y="90" font-size="10" font-weight="bold" fill="#64748b">Gaz</text>
      `;

      svg += `</svg>`;
      return svg;
    }
  }
};

function renderResistorBox(x, y, label, val) {
  return `
    <g transform="translate(${x}, ${y})">
      <rect x="-30" y="-14" width="60" height="28" rx="4" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" />
      <text x="0" y="-18" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f172a">${escSvg(label)}</text>
      ${val ? `<text x="0" y="4" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#2563eb">${escSvg(val)}</text>` : ''}
    </g>
  `;
}


// Module Exports
__exports['PHYS_TEMPLATES'] = PHYS_TEMPLATES;

});

__define('modules/science/chemTemplates.js', function(__exports, __require, __module) {
const { escSvg } = __require('modules/science/overlayEngine.js');

/**
 * Egemen's Testmaker — Kimya Şablon Envanteri (TYT & AYT)
 * Çözünürlük Eğrisi, Galvanik Pil, Titrasyon, Potansiyel Enerji Diyagramı,
 * Manometre / Gaz Yasaları, Molekül Geometrisi (VSEPR), Bohr ve Periyodik Tablo.
 */

const CHEM_TEMPLATES = {
  // --------------------------------------------------------------------------
  // 1. ÇÖZÜNÜRLÜK - SICAKLIK GRAFİĞİ
  // --------------------------------------------------------------------------
  solubilityCurve: {
    id: 'solubilityCurve',
    category: 'kimya',
    name: 'Çözünürlük - Sıcaklık Grafiği (Doygunluk & Çökelme)',
    tags: ['TYT', 'AYT', 'Çözeltiler', 'Çözünürlük', 'Doygunluk', 'Çökelme'],
    desc: 'Sıcaklık (°C) ile çözünürlük (g / 100 g su) eğrisi; doymuş, doymamış ve aşırı doymuş bölgeler.',
    defaultParams: {
      title: 'X Tuzunun Çözünürlük - Sıcaklık Grafiği',
      saltName: 'X Tuzu (Endotermik)',
      t1Val: '20 °C',
      s1Val: '25 g',
      t2Val: '50 °C',
      s2Val: '60 g',
      showPoints: true
    },
    presets: [
      {
        name: 'AYT - Endotermik Çözünen X Tuzu (Isı Alan)',
        params: {
          title: 'X Maddesinin Sudaki Çözünürlük Eğrisi',
          saltName: 'X Tuzu (ΔH > 0)',
          t1Val: '20 °C',
          s1Val: '30 g',
          t2Val: '60 °C',
          s2Val: '75 g',
          showPoints: true
        }
      }
    ],
    schema: [
      { key: 'title', label: 'Grafik Başlığı', type: 'text' },
      { key: 'saltName', label: 'Tuz / Madde İsmi', type: 'text' },
      { key: 't1Val', label: '1. Sıcaklık Değeri (T₁)', type: 'text' },
      { key: 's1Val', label: '1. Çözünürlük Değeri (Ç₁)', type: 'text' },
      { key: 't2Val', label: '2. Sıcaklık Değeri (T₂)', type: 'text' },
      { key: 's2Val', label: '2. Çözünürlük Değeri (Ç₂)', type: 'text' },
      { key: 'showPoints', label: 'Doygunluk Noktalarını İşaretle', type: 'checkbox' }
    ],
    renderSvg(p) {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 350" width="100%" height="100%" class="sci-interactive-svg" style="font-family:'Noto Sans',sans-serif;">
        <rect x="0" y="0" width="540" height="350" fill="#ffffff" />
        ${p.title ? `<text x="270" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>` : ''}

        <!-- Eksenler -->
        <g stroke="#0f172a" stroke-width="2">
          <!-- Y Ekseni: Çözünürlük (g / 100 g su) -->
          <line x1="85" y1="280" x2="85" y2="45" />
          <polygon points="85,38 80,50 90,50" fill="#0f172a" />
          <text x="75" y="42" text-anchor="end" font-size="11" font-weight="bold">Çözünürlük (g / 100 g su)</text>

          <!-- X Ekseni: Sıcaklık (°C) -->
          <line x1="85" y1="280" x2="490" y2="280" />
          <polygon points="498,280 486,275 486,285" fill="#0f172a" />
          <text x="495" y="300" font-size="12" font-weight="bold">Sıcaklık (°C)</text>
        </g>

        <!-- Çözünürlük Eğrisi (Endotermik Yay) -->
        <path d="M 85 240 C 180 230 280 180 450 80" fill="none" stroke="#2563eb" stroke-width="3.5" stroke-linecap="round" />
        <text x="455" y="80" font-size="11" font-weight="bold" fill="#2563eb">${escSvg(p.saltName)}</text>

        <!-- 1. Nokta Kesişim Çizgileri -->
        <g stroke="#dc2626" stroke-width="1.4" stroke-dasharray="4,4">
          <line x1="85" y1="200" x2="210" y2="200" />
          <line x1="210" y1="200" x2="210" y2="280" />
          <circle cx="210" cy="200" r="4.5" fill="#dc2626" stroke="#ffffff" stroke-width="1.5" />
          <text x="75" y="204" text-anchor="end" font-size="11" font-weight="bold" fill="#dc2626" stroke="none">${escSvg(p.s1Val)}</text>
          <text x="210" y="296" text-anchor="middle" font-size="11" font-weight="bold" fill="#dc2626" stroke="none">${escSvg(p.t1Val)}</text>
        </g>

        <!-- 2. Nokta Kesişim Çizgileri -->
        <g stroke="#059669" stroke-width="1.4" stroke-dasharray="4,4">
          <line x1="85" y1="120" x2="380" y2="120" />
          <line x1="380" y1="120" x2="380" y2="280" />
          <circle cx="380" cy="120" r="4.5" fill="#059669" stroke="#ffffff" stroke-width="1.5" />
          <text x="75" y="124" text-anchor="end" font-size="11" font-weight="bold" fill="#059669" stroke="none">${escSvg(p.s2Val)}</text>
          <text x="380" y="296" text-anchor="middle" font-size="11" font-weight="bold" fill="#059669" stroke="none">${escSvg(p.t2Val)}</text>
        </g>

        <!-- Doymuş / Doymamış Alan Açıklamaları -->
        <g font-size="10.5" font-weight="bold">
          <text x="160" y="140" fill="#9333ea">• Aşırı Doymuş Bölge</text>
          <text x="300" y="170" fill="#2563eb">• Eğri Üzeri (Doymuş Çözelti)</text>
          <text x="320" y="240" fill="#d97706">• Doymamış Bölge</text>
        </g>
      `;

      svg += `</svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 2. ELEKTROKİMYASAL PİL (GALVANİK DANIEL HÜCRESİ)
  // --------------------------------------------------------------------------
  galvanicCell: {
    id: 'galvanicCell',
    category: 'kimya',
    name: 'Elektrokimyasal Galvanik Pil (Daniell Hücresi)',
    tags: ['AYT', 'Elektrokimya', 'Pil', 'Anot', 'Katot', 'Tuz Köprüsü'],
    desc: 'Anot ve katot kapları, elektrotlar (Zn/Cu), tuz köprüsü, voltmetre ve dış devrede elektron akış yönü.',
    defaultParams: {
      title: 'Zn - Cu Galvanik Pili (E°pil = 1.10 V)',
      anodeMetal: 'Zn (Anot)',
      cathodeMetal: 'Cu (Katot)',
      vRead: '1.10 V',
      showElectronFlow: true
    },
    presets: [
      {
        name: 'AYT Standart Daniell Pili (Zn - Cu)',
        params: {
          title: 'Zn - Cu Standart Elektrokimyasal Pili',
          anodeMetal: 'Zn (Anot)',
          cathodeMetal: 'Cu (Katot)',
          vRead: '1.10 V',
          showElectronFlow: true
        }
      }
    ],
    schema: [
      { key: 'title', label: 'Şema Başlığı', type: 'text' },
      { key: 'anodeMetal', label: 'Anot Elektrot Metal / İsmi', type: 'text' },
      { key: 'cathodeMetal', label: 'Katot Elektrot Metal / İsmi', type: 'text' },
      { key: 'vRead', label: 'Voltmetre Değeri', type: 'text' },
      { key: 'showElectronFlow', label: 'Elektron Akış Okunu Göster (e⁻)', type: 'checkbox' }
    ],
    renderSvg(p) {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 360" width="100%" height="100%" class="sci-interactive-svg" style="font-family:'Noto Sans',sans-serif;">
        <rect x="0" y="0" width="540" height="360" fill="#ffffff" />
        ${p.title ? `<text x="270" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>` : ''}

        <!-- 1. Kap (Anot Beheri - Sol) -->
        <rect x="70" y="160" width="140" height="150" rx="8" fill="#f0fdf4" stroke="#0f172a" stroke-width="2.5" />
        <!-- Çözelti Seviyesi -->
        <rect x="72" y="210" width="136" height="98" fill="#dcfce7" opacity="0.8" />
        <text x="140" y="275" text-anchor="middle" font-size="11" font-weight="bold" fill="#166534">1 M Zn²⁺(suda)</text>

        <!-- 2. Kap (Katot Beheri - Sağ) -->
        <rect x="330" y="160" width="140" height="150" rx="8" fill="#eff6ff" stroke="#0f172a" stroke-width="2.5" />
        <!-- Çözelti Seviyesi -->
        <rect x="332" y="210" width="136" height="98" fill="#dbeafe" opacity="0.8" />
        <text x="400" y="275" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e40af">1 M Cu²⁺(suda)</text>

        <!-- Anot Elektrodu (Zn Çubuğu) -->
        <rect x="125" y="110" width="28" height="150" rx="3" fill="#cbd5e1" stroke="#334155" stroke-width="2" />
        <text x="139" y="100" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">${escSvg(p.anodeMetal)}</text>

        <!-- Katot Elektrodu (Cu Çubuğu) -->
        <rect x="385" y="110" width="28" height="150" rx="3" fill="#fed7aa" stroke="#c2410c" stroke-width="2" />
        <text x="399" y="100" text-anchor="middle" font-size="12" font-weight="bold" fill="#c2410c">${escSvg(p.cathodeMetal)}</text>

        <!-- Tuz Köprüsü (Ters U Borusu) -->
        <path d="M 175 230 L 175 140 C 175 125 365 125 365 140 L 365 230" fill="none" stroke="#fef08a" stroke-width="24" stroke-linecap="round" />
        <path d="M 175 230 L 175 140 C 175 125 365 125 365 140 L 365 230" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round" />
        <text x="270" y="138" text-anchor="middle" font-size="11" font-weight="bold" fill="#854d0e">Tuz Köprüsü (KNO₃)</text>

        <!-- Dış Devre İletken Teli ve Voltmetre -->
        <g stroke="#0f172a" stroke-width="2.5" fill="none">
          <line x1="139" y1="110" x2="139" y2="55" />
          <line x1="139" y1="55" x2="245" y2="55" />
          <line x1="295" y1="55" x2="399" y2="55" />
          <line x1="399" y1="55" x2="399" y2="110" />
        </g>

        <!-- Voltmetre -->
        <circle cx="270" cy="55" r="22" fill="#ffffff" stroke="#2563eb" stroke-width="2.5" />
        <text x="270" y="52" text-anchor="middle" font-size="10" font-weight="bold" fill="#64748b">V</text>
        <text x="270" y="66" text-anchor="middle" font-size="11" font-weight="bold" fill="#2563eb">${escSvg(p.vRead)}</text>

        <!-- Elektron Akış Yönü Oku (Anot -> Katot) -->
        ${p.showElectronFlow ? `
          <g transform="translate(190, 45)">
            <line x1="0" y1="0" x2="40" y2="0" stroke="#dc2626" stroke-width="2.5" />
            <polygon points="48,0 36,-4 36,4" fill="#dc2626" />
            <text x="20" y="-8" text-anchor="middle" font-size="11" font-weight="bold" fill="#dc2626">e⁻ Akışı</text>
          </g>
        ` : ''}
      `;

      svg += `</svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 3. ASİT - BAZ TİTRASYONU & EŞDEĞERLİK NOKTASI
  // --------------------------------------------------------------------------
  acidBaseTitration: {
    id: 'acidBaseTitration',
    category: 'kimya',
    name: 'Asit - Baz Titrasyonu & pH Eğrisi',
    tags: ['AYT', 'Asit-Baz', 'Titrasyon', 'Büret', 'Eşdeğerlik', 'pH'],
    desc: 'Kuvvetli asit - kuvvetli baz titrasyon eğrisi (pH - Eklenen Baz Hacmi), eşdeğerlik noktası (pH = 7).',
    defaultParams: {
      title: 'Kuvvetli Asit - Kuvvetli Baz Titrasyon Eğrisi',
      acidFormula: 'HCl (0.1 M, 25 mL)',
      baseFormula: 'NaOH (0.1 M)',
      veqLabel: 'V_eş = 25 mL',
      startPh: 'pH = 1',
      showEquivalenceLine: true
    },
    presets: [
      {
        name: 'AYT Standart Titrasyon (HCl + NaOH -> NaCl + H2O)',
        params: {
          title: '0.1 M 25 mL HCl Çözeltisinin 0.1 M NaOH ile Titrasyonu',
          acidFormula: 'HCl',
          baseFormula: 'NaOH',
          veqLabel: '25 mL (Eşdeğerlik)',
          startPh: 'pH = 1',
          showEquivalenceLine: true
        }
      }
    ],
    schema: [
      { key: 'title', label: 'Grafik Başlığı', type: 'text' },
      { key: 'acidFormula', label: 'Titrasyon Asidi', type: 'text' },
      { key: 'baseFormula', label: 'Eklenen Baz Çözeltisi', type: 'text' },
      { key: 'veqLabel', label: 'Eşdeğerlik Hacmi Etiketi', type: 'text' },
      { key: 'showEquivalenceLine', label: 'pH = 7 Eşdeğerlik Çizgisini Göster', type: 'checkbox' }
    ],
    renderSvg(p) {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 350" width="100%" height="100%" class="sci-interactive-svg" style="font-family:'Noto Sans',sans-serif;">
        <rect x="0" y="0" width="540" height="350" fill="#ffffff" />
        ${p.title ? `<text x="270" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>` : ''}

        <!-- Eksenler -->
        <g stroke="#0f172a" stroke-width="2">
          <!-- Y Ekseni (pH: 0 - 14) -->
          <line x1="80" y1="280" x2="80" y2="50" />
          <polygon points="80,42 75,54 85,54" fill="#0f172a" />
          <text x="70" y="48" text-anchor="end" font-size="12" font-weight="bold">pH</text>

          <!-- X Ekseni (Eklenen Baz Hacmi V mL) -->
          <line x1="80" y1="280" x2="480" y2="280" />
          <polygon points="488,280 476,275 476,285" fill="#0f172a" />
          <text x="485" y="300" font-size="11" font-weight="bold">Eklenen Baz Hacmi (mL)</text>
        </g>

        <!-- Titrasyon S Eğrisi -->
        <!-- pH=1 (80, 260) -> pH=3 (220, 240) -> Dik Sıçrama pH=7 (260, 165) -> pH=11 (300, 90) -> pH=13 (440, 75) -->
        <path d="M 80 260 C 180 255 240 240 255 190 L 265 140 C 280 90 340 75 440 75" fill="none" stroke="#2563eb" stroke-width="3.5" stroke-linecap="round" />

        <!-- Eşdeğerlik Noktası (pH = 7) -->
        ${p.showEquivalenceLine ? `
          <g stroke="#16a34a" stroke-width="1.5" stroke-dasharray="4,4">
            <line x1="80" y1="165" x2="260" y2="165" />
            <line x1="260" y1="165" x2="260" y2="280" />
            <circle cx="260" cy="165" r="5" fill="#16a34a" stroke="#ffffff" stroke-width="2" />
            <text x="72" y="169" text-anchor="end" font-size="11" font-weight="bold" fill="#16a34a" stroke="none">pH = 7</text>
            <text x="260" y="296" text-anchor="middle" font-size="11" font-weight="bold" fill="#16a34a" stroke="none">${escSvg(p.veqLabel)}</text>
            <text x="275" y="165" font-size="11" font-weight="bold" fill="#16a34a" stroke="none">Dönüm Noktası</text>
          </g>
        ` : ''}

        <!-- Başlangıç pH=1 -->
        <text x="72" y="264" text-anchor="end" font-size="11" font-weight="bold" fill="#dc2626">${escSvg(p.startPh)}</text>
        <text x="72" y="79" text-anchor="end" font-size="11" font-weight="bold" fill="#2563eb">pH = 13</text>
      `;

      svg += `</svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 4. TEPKİME HIZI & POTANSİYEL ENERJİ GRAFİĞİ
  // --------------------------------------------------------------------------
  potentialEnergyDiagram: {
    id: 'potentialEnergyDiagram',
    category: 'kimya',
    name: 'Potansiyel Enerji - Tepkime Koordinatı (ΔH, Ea)',
    tags: ['AYT', 'Tepkime Hızı', 'Aktifleşme Enerjisi', 'Entalpi', 'Katalizör'],
    desc: 'Girenler, ürünler, aktifleşmiş kompleks, ileri aktifleşme enerjisi (Eai), geri aktifleşme (Eag) ve tepkime ısısı (ΔH).',
    defaultParams: {
      title: 'Tepkimenin Potansiyel Enerji - Tepkime Koordinatı Grafiği',
      reactionType: 'exothermic', // 'exothermic' (ΔH < 0) | 'endothermic' (ΔH > 0)
      showCatalyst: true,
      eaiLabel: 'Ea_i',
      deltaHLabel: 'ΔH < 0'
    },
    presets: [
      {
        name: 'AYT - Ekzotermik Tepkime & Katalizör Etkisi (ΔH < 0)',
        params: {
          title: 'Ekzotermik Tepkimede Katalizörün Eai\'ye Etkisi',
          reactionType: 'exothermic',
          showCatalyst: true,
          eaiLabel: 'Ea_i = 60 kJ',
          deltaHLabel: 'ΔH = -40 kJ'
        }
      },
      {
        name: 'AYT - Endotermik Tepkime (ΔH > 0)',
        params: {
          title: 'Endotermik Tepkime Grafiği (Ürünler > Girenler)',
          reactionType: 'endothermic',
          showCatalyst: false,
          eaiLabel: 'Ea_i',
          deltaHLabel: 'ΔH > 0'
        }
      }
    ],
    schema: [
      { key: 'title', label: 'Grafik Başlığı', type: 'text' },
      {
        key: 'reactionType',
        label: 'Tepkime Türü',
        type: 'select',
        options: [{ v: 'exothermic', l: 'Ekzotermik (Isı Veren: ΔH < 0)' }, { v: 'endothermic', l: 'Endotermik (Isı Alan: ΔH > 0)' }]
      },
      { key: 'showCatalyst', label: 'Katalizörlü Eğriyi Göster (Kesikli Tepe)', type: 'checkbox' },
      { key: 'eaiLabel', label: 'İleri Aktifleşme Enerjisi Etiketi', type: 'text' },
      { key: 'deltaHLabel', label: 'Tepkime Isısı Etiketi (ΔH)', type: 'text' }
    ],
    renderSvg(p) {
      const isExo = p.reactionType === 'exothermic';
      const reactantsY = 200;
      const peakY = 80;
      const productsY = isExo ? 240 : 150;
      const catalystPeakY = 120;

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 350" width="100%" height="100%" class="sci-interactive-svg" style="font-family:'Noto Sans',sans-serif;">
        <rect x="0" y="0" width="540" height="350" fill="#ffffff" />
        ${p.title ? `<text x="270" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>` : ''}

        <!-- Eksenler -->
        <g stroke="#0f172a" stroke-width="2">
          <!-- Potansiyel Enerji (PE) -->
          <line x1="80" y1="280" x2="80" y2="45" />
          <polygon points="80,38 75,50 85,50" fill="#0f172a" />
          <text x="70" y="45" text-anchor="end" font-size="11" font-weight="bold">Potansiyel Enerji (PE)</text>

          <!-- Tepkime Koordinatı (TK) -->
          <line x1="80" y1="280" x2="480" y2="280" />
          <polygon points="488,280 476,275 476,285" fill="#0f172a" />
          <text x="485" y="300" font-size="11" font-weight="bold">Tepkime Koordinatı</text>
        </g>

        <!-- Katalizörsüz Ana Eğri -->
        <path d="M 80 ${reactantsY} L 160 ${reactantsY} C 210 ${reactantsY} 230 ${peakY} 270 ${peakY} C 310 ${peakY} 330 ${productsY} 380 ${productsY} L 460 ${productsY}" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" />

        <!-- Katalizörlü Eğri (Daha Düşük Tepe) -->
        ${p.showCatalyst ? `
          <path d="M 160 ${reactantsY} C 210 ${reactantsY} 230 ${catalystPeakY} 270 ${catalystPeakY} C 310 ${catalystPeakY} 330 ${productsY} 380 ${productsY}" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-dasharray="5,4" />
          <text x="270" y="${catalystPeakY - 8}" text-anchor="middle" font-size="10" font-weight="bold" fill="#dc2626">Katalizörlü</text>
        ` : ''}

        <!-- Girenler ve Ürünler Etiketleri -->
        <text x="120" y="${reactantsY - 8}" font-size="11" font-weight="bold" fill="#0f172a">Girenler</text>
        <text x="420" y="${productsY - 8}" font-size="11" font-weight="bold" fill="#0f172a">Ürünler</text>

        <!-- Eai (İleri Aktifleşme Enerjisi Çizgisi) -->
        <g stroke="#d97706" stroke-width="1.8">
          <line x1="270" y1="${reactantsY}" x2="270" y2="${peakY}" stroke-dasharray="3,3" />
          <line x1="180" y1="${peakY}" x2="270" y2="${peakY}" stroke-dasharray="3,3" />
          <text x="255" y="${(reactantsY + peakY) / 2}" text-anchor="end" font-size="11" font-weight="bold" fill="#d97706">${escSvg(p.eaiLabel)}</text>
        </g>

        <!-- ΔH (Tepkime Isısı Farkı) -->
        <g stroke="#16a34a" stroke-width="1.8">
          <line x1="380" y1="${reactantsY}" x2="460" y2="${reactantsY}" stroke-dasharray="3,3" />
          <line x1="440" y1="${reactantsY}" x2="440" y2="${productsY}" />
          <text x="450" y="${(reactantsY + productsY) / 2 + 4}" font-size="11" font-weight="bold" fill="#16a34a">${escSvg(p.deltaHLabel)}</text>
        </g>
      `;

      svg += `</svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 5. GAZ YASALARI & MANOMETRE / PİSTONLU KAP
  // --------------------------------------------------------------------------
  gasLawsManometer: {
    id: 'gasLawsManometer',
    category: 'kimya',
    name: 'Gaz Yasaları & Açık Uçlu Manometre',
    tags: ['AYT', 'Gazlar', 'Manometre', 'Açık Hava Basıncı', 'Piston'],
    desc: 'U borulu cıva manometresi; Pgaz = P0 ± h basınç dengesi veya hareketli sürtünmesiz pistonlu kap.',
    defaultParams: {
      title: 'Açık Uçlu Manometrede Gaz Basıncı Dengesi',
      gasName: 'He Gazı',
      p0Label: 'P₀ = 76 cm-Hg',
      hDiff: 'h = 10 cm',
      liquidLevel: 'higher_right' // 'higher_right' (Pgaz > P0) | 'higher_left' (Pgaz < P0) | 'equal'
    },
    presets: [
      {
        name: 'AYT - Gaz Basıncı Açık Hava Basıncından Büyük (Pgaz = P0 + h)',
        params: {
          title: 'Açık Uçlu Manometre (P_gaz = P₀ + h)',
          gasName: 'X Gazı',
          p0Label: 'P₀ = 75 cmHg',
          hDiff: 'h = 15 cm',
          liquidLevel: 'higher_right'
        }
      }
    ],
    schema: [
      { key: 'title', label: 'Şema Başlığı', type: 'text' },
      { key: 'gasName', label: 'Tüp İçi Gaz İsmi', type: 'text' },
      { key: 'p0Label', label: 'Açık Hava Basıncı (P₀)', type: 'text' },
      { key: 'hDiff', label: 'Cıva Seviye Farkı (h)', type: 'text' },
      {
        key: 'liquidLevel',
        label: 'Cıva Denge Seviyesi',
        type: 'select',
        options: [
          { v: 'higher_right', l: 'Sağ Kol Yüksekte (P_gaz = P₀ + h)' },
          { v: 'higher_left', l: 'Sol Kol Yüksekte (P_gaz = P₀ - h)' },
          { v: 'equal', l: 'Eşit Seviyede (P_gaz = P₀)' }
        ]
      }
    ],
    renderSvg(p) {
      const isRight = p.liquidLevel === 'higher_right';
      const isLeft = p.liquidLevel === 'higher_left';
      const leftY = isRight ? 210 : (isLeft ? 150 : 180);
      const rightY = isRight ? 150 : (isLeft ? 210 : 180);

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 350" width="100%" height="100%" class="sci-interactive-svg" style="font-family:'Noto Sans',sans-serif;">
        <rect x="0" y="0" width="540" height="350" fill="#ffffff" />
        ${p.title ? `<text x="270" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>` : ''}

        <!-- Gaz Balonu (Sol Hazne) -->
        <g id="gasChamber">
          <circle cx="150" cy="180" r="55" fill="#f0fdf4" stroke="#0f172a" stroke-width="2.5" />
          <text x="150" y="175" text-anchor="middle" font-size="13" font-weight="bold" fill="#166534">${escSvg(p.gasName)}</text>
          <text x="150" y="195" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f172a">P_gaz = ?</text>
          <!-- Bağlantı Borusu -->
          <rect x="203" y="172" width="60" height="16" fill="#f0fdf4" stroke="#0f172a" stroke-width="2.5" />
        </g>

        <!-- U Borusu Manometre -->
        <!-- Sol Kol Dikey, Taban, Sağ Kol Dikey -->
        <g stroke="#0f172a" stroke-width="2.5" fill="none">
          <path d="M 260 172 L 260 280 C 260 300 360 300 360 280 L 360 80" />
          <path d="M 276 188 L 276 275 C 276 288 344 288 344 275 L 344 80" />
        </g>

        <!-- Cıva Dolgusu (Hg) -->
        <path d="
          M 260 ${leftY} L 276 ${leftY}
          L 276 275 C 276 288 344 288 344 275
          L 344 ${rightY} L 360 ${rightY}
          L 360 280 C 360 300 260 300 260 280 Z
        " fill="#94a3b8" stroke="#475569" stroke-width="1" />

        <!-- Cıva Seviye Farkı h Çizgileri -->
        ${isRight ? `
          <g stroke="#dc2626" stroke-width="1.5">
            <line x1="276" y1="${leftY}" x2="380" y2="${leftY}" stroke-dasharray="3,3" />
            <line x1="344" y1="${rightY}" x2="380" y2="${rightY}" stroke-dasharray="3,3" />
            <line x1="375" y1="${leftY}" x2="375" y2="${rightY}" />
            <text x="385" y="${(leftY + rightY) / 2 + 4}" font-size="11" font-weight="bold" fill="#dc2626">${escSvg(p.hDiff)}</text>
          </g>
        ` : ''}

        <!-- Açık Uç ve P0 Oku -->
        <g transform="translate(352, 65)">
          <line x1="0" y1="0" x2="0" y2="25" stroke="#2563eb" stroke-width="2.5" />
          <polygon points="0,32 -4,20 4,20" fill="#2563eb" />
          <text x="0" y="-8" text-anchor="middle" font-size="11" font-weight="bold" fill="#2563eb">${escSvg(p.p0Label)}</text>
        </g>

        <!-- Basınç Denklem Notu -->
        <g transform="translate(30, 290)">
          <rect x="0" y="0" width="180" height="34" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
          <text x="90" y="22" text-anchor="middle" font-size="12" font-style="italic" font-weight="bold" fill="#0f172a">
            ${isRight ? 'P_gaz = P₀ + h' : (isLeft ? 'P_gaz = P₀ - h' : 'P_gaz = P₀')}
          </text>
        </g>
      `;

      svg += `</svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 6. MOLEKÜL GEOMETRİSİ (VSEPR & BAĞ AÇILARI)
  // --------------------------------------------------------------------------
  molecularGeometry: {
    id: 'molecularGeometry',
    category: 'kimya',
    name: 'Molekül Geometrisi & VSEPR Modeli',
    tags: ['AYT', 'VSEPR', 'Hibritleşme', 'Bağ Açısı', 'Molekül Geometrisi'],
    desc: 'AX2 Doğrusal (180°), AX3 Düzlem Üçgen (120°), AX4 Düzgün Dörtyüzlü (109.5°), AX3E Üçgen Piramit (107°), AX2E2 Kırık Doğru (104.5°).',
    defaultParams: {
      geoShape: 'tetrahedral', // 'linear' | 'trigonal_planar' | 'tetrahedral' | 'trigonal_pyramidal' | 'bent'
      centralAtom: 'C',
      ligandAtom: 'H',
      showAngle: true
    },
    presets: [
      {
        name: 'Metan (CH4) - Düzgün Dörtyüzlü (sp3, 109.5°)',
        params: { geoShape: 'tetrahedral', centralAtom: 'C', ligandAtom: 'H', showAngle: true }
      },
      {
        name: 'Amonyak (NH3) - Üçgen Piramit (sp3, 107°)',
        params: { geoShape: 'trigonal_pyramidal', centralAtom: 'N', ligandAtom: 'H', showAngle: true }
      },
      {
        name: 'Su (H2O) - Kırık Doğru / Açısal (sp3, 104.5°)',
        params: { geoShape: 'bent', centralAtom: 'O', ligandAtom: 'H', showAngle: true }
      },
      {
        name: 'Karbondioksit (CO2) - Doğrusal (sp, 180°)',
        params: { geoShape: 'linear', centralAtom: 'C', ligandAtom: 'O', showAngle: true }
      }
    ],
    schema: [
      {
        key: 'geoShape',
        label: 'VSEPR Geometrisi',
        type: 'select',
        options: [
          { v: 'tetrahedral', l: 'Düzgün Dörtyüzlü (AX4, 109.5°)' },
          { v: 'trigonal_pyramidal', l: 'Üçgen Piramit (AX3E, 107°)' },
          { v: 'bent', l: 'Kırık Doğru / Açısal (AX2E2, 104.5°)' },
          { v: 'trigonal_planar', l: 'Düzlem Üçgen (AX3, 120°)' },
          { v: 'linear', l: 'Doğrusal (AX2, 180°)' }
        ]
      },
      { key: 'centralAtom', label: 'Merkez Atom (A)', type: 'text' },
      { key: 'ligandAtom', label: 'Bağlı Atomlar (X)', type: 'text' },
      { key: 'showAngle', label: 'Bağ Açısını Göster', type: 'checkbox' }
    ],
    renderSvg(p) {
      const cx = 270;
      const cy = 180;
      let angleText = '109.5°';
      let vseprCode = 'AX₄ (sp³)';

      if (p.geoShape === 'linear') { angleText = '180°'; vseprCode = 'AX₂ (sp)'; }
      else if (p.geoShape === 'trigonal_planar') { angleText = '120°'; vseprCode = 'AX₃ (sp²)'; }
      else if (p.geoShape === 'trigonal_pyramidal') { angleText = '107°'; vseprCode = 'AX₃E (sp³)'; }
      else if (p.geoShape === 'bent') { angleText = '104.5°'; vseprCode = 'AX₂E₂ (sp³)'; }

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 340" width="100%" height="100%" class="sci-interactive-svg" style="font-family:'Noto Sans',sans-serif;">
        <rect x="0" y="0" width="540" height="340" fill="#ffffff" />
        <text x="270" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">VSEPR Molekül Geometrisi: ${vseprCode}</text>

        <!-- Bağlar ve Ligandlar -->
        <g stroke="#0f172a" stroke-width="3">
      `;

      if (p.geoShape === 'linear') {
        svg += `
          <line x1="${cx - 90}" y1="${cy}" x2="${cx + 90}" y2="${cy}" />
          ${renderAtom(cx - 90, cy, p.ligandAtom, '#38bdf8')}
          ${renderAtom(cx + 90, cy, p.ligandAtom, '#38bdf8')}
          <!-- Açı Yayı -->
          <path d="M ${cx - 30} ${cy} A 30 30 0 0 1 ${cx + 30} ${cy}" fill="none" stroke="#dc2626" stroke-width="2" />
          <text x="${cx}" y="${cy - 36}" text-anchor="middle" font-size="12" font-weight="bold" fill="#dc2626">${angleText}</text>
        `;
      } else if (p.geoShape === 'bent') {
        svg += `
          <line x1="${cx}" y1="${cy}" x2="${cx - 75}" y2="${cy + 65}" />
          <line x1="${cx}" y1="${cy}" x2="${cx + 75}" y2="${cy + 65}" />
          ${renderAtom(cx - 75, cy + 65, p.ligandAtom, '#38bdf8')}
          ${renderAtom(cx + 75, cy + 65, p.ligandAtom, '#38bdf8')}
          <!-- Ortaklanmamış Elektron Çiftleri (Kulaklar) -->
          <ellipse cx="${cx - 20}" cy="${cy - 35}" rx="8" ry="16" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5" transform="rotate(-30, ${cx - 20}, ${cy - 35})" />
          <ellipse cx="${cx + 20}" cy="${cy - 35}" rx="8" ry="16" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5" transform="rotate(30, ${cx + 20}, ${cy - 35})" />
          <text x="${cx}" y="${cy + 45}" text-anchor="middle" font-size="12" font-weight="bold" fill="#dc2626">${angleText}</text>
        `;
      } else {
        // Tetrahedral / Piramit
        svg += `
          <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - 85}" />
          <line x1="${cx}" y1="${cy}" x2="${cx - 75}" y2="${cy + 65}" />
          <line x1="${cx}" y1="${cy}" x2="${cx + 75}" y2="${cy + 65}" />
          <line x1="${cx}" y1="${cy}" x2="${cx + 25}" y2="${cy + 75}" stroke-width="6" stroke-linecap="round" />
          ${renderAtom(cx, cy - 85, p.ligandAtom, '#38bdf8')}
          ${renderAtom(cx - 75, cy + 65, p.ligandAtom, '#38bdf8')}
          ${renderAtom(cx + 75, cy + 65, p.ligandAtom, '#38bdf8')}
          ${renderAtom(cx + 25, cy + 75, p.ligandAtom, '#38bdf8')}
          <text x="${cx - 35}" y="${cy + 15}" font-size="12" font-weight="bold" fill="#dc2626">${angleText}</text>
        `;
      }

      svg += `</g>`;

      // Merkez Atom
      svg += renderAtom(cx, cy, p.centralAtom, '#f59e0b', 24);

      svg += `</svg>`;
      return svg;
    }
  }
};

function renderAtom(x, y, symbol, fill, r = 18) {
  return `
    <g transform="translate(${x}, ${y})">
      <circle cx="0" cy="0" r="${r}" fill="${fill}" stroke="#0f172a" stroke-width="2" />
      <text x="0" y="5" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">${escSvg(symbol)}</text>
    </g>
  `;
}


// Module Exports
__exports['CHEM_TEMPLATES'] = CHEM_TEMPLATES;

});

__define('modules/science/bioTemplates.js', function(__exports, __require, __module) {
const { escSvg } = __require('modules/science/overlayEngine.js');

/**
 * Egemen's Testmaker — Biyoloji Şablon Envanteri (TYT & AYT)
 * Sürüklenebilir Hücre Mimarisi & Organeller, Mitoz/Mayoz Evreleri,
 * DNA & Nükleotid, Soy Ağacı, Besin Piramidi, Nefron ve Sinaps İletimi.
 */

const BIO_TEMPLATES = {
  // --------------------------------------------------------------------------
  // 1. HÜCRE MİMARİSİ (SÜRÜKLENEBİLİR ORGANELLER & DİNAMİK OKLAR)
  // --------------------------------------------------------------------------
  cellStructure: {
    id: 'cellStructure',
    category: 'biyoloji',
    name: 'Hücre Mimarisi & Sürüklenebilir Organeller',
    tags: ['TYT', 'LGS', 'Organeller', 'Hücre', 'Mitokondri', 'Çekirdek'],
    desc: 'Bitki veya hayvan hücresi; organeller (çekirdek, mitokondri, golgi vb.) tuval üzerinde serbestçe sürüklenebilir, ok ve etiketler organeli dinamik takip eder.',
    defaultParams: {
      cellType: 'animal', // 'animal' | 'plant'
      labelStyle: 'roman', // 'roman' | 'letters' | 'names'
      showCellWall: false,
      organelles: {
        nucleus: { active: true, x: 220, y: 175, label: 'I' },
        mitochondria: { active: true, x: 370, y: 130, label: 'II' },
        golgi: { active: true, x: 140, y: 240, label: 'III' },
        vacuole: { active: true, x: 320, y: 235, label: 'IV' },
        chloroplast: { active: false, x: 360, y: 95, label: 'V' },
        ribosome: { active: true, x: 190, y: 105, label: 'VI' },
        centrosome: { active: true, x: 170, y: 205, label: 'VII' }
      }
    },
    presets: [
      {
        name: 'TYT - Hayvan Hücresi (Organeller Sürüklenebilir I-VII)',
        params: {
          cellType: 'animal',
          labelStyle: 'roman',
          showCellWall: false,
          organelles: {
            nucleus: { active: true, x: 220, y: 175, label: 'I' },
            mitochondria: { active: true, x: 370, y: 130, label: 'II' },
            golgi: { active: true, x: 140, y: 240, label: 'III' },
            vacuole: { active: true, x: 320, y: 235, label: 'IV' },
            chloroplast: { active: false, x: 360, y: 95, label: 'V' },
            ribosome: { active: true, x: 190, y: 105, label: 'VI' },
            centrosome: { active: true, x: 170, y: 205, label: 'VII' }
          }
        }
      },
      {
        name: 'TYT - Bitki Hücresi (Kloroplast & Merkezi Koful Aktif)',
        params: {
          cellType: 'plant',
          labelStyle: 'roman',
          showCellWall: true,
          organelles: {
            nucleus: { active: true, x: 170, y: 155, label: 'I' },
            mitochondria: { active: true, x: 130, y: 265, label: 'II' },
            golgi: { active: true, x: 140, y: 90, label: 'III' },
            vacuole: { active: true, x: 330, y: 215, label: 'IV' },
            chloroplast: { active: true, x: 370, y: 100, label: 'V' },
            ribosome: { active: true, x: 240, y: 110, label: 'VI' },
            centrosome: { active: false, x: 170, y: 205, label: 'VII' }
          }
        }
      }
    ],
    schema: [
      {
        key: 'cellType',
        label: 'Hücre Tipi',
        type: 'select',
        options: [
          { v: 'animal', l: 'Hayvan Hücresi (Yuvarlak / Esnek Zar)' },
          { v: 'plant', l: 'Bitki Hücresi (Köşeli / Çeperli)' }
        ]
      },
      {
        key: 'labelStyle',
        label: 'Etiketleme Şekli',
        type: 'select',
        options: [
          { v: 'roman', l: 'Roma Rakamları (I, II, III...)' },
          { v: 'letters', l: 'Harfler (K, L, M...)' },
          { v: 'names', l: 'Organel İsimleri' }
        ]
      },
      { key: 'showCellWall', label: 'Hücre Duvarı / Çeperi Göster', type: 'checkbox' }
    ],
    renderSvg(p) {
      const isPlant = p.cellType === 'plant';
      const orgs = p.organelles || {};

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 370" width="100%" height="100%" class="sci-interactive-svg" style="font-family:'Noto Sans',sans-serif;">
        <defs>
          <radialGradient id="bioCytoGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${isPlant ? '#f0fdf4' : '#eff6ff'}" />
            <stop offset="100%" stop-color="${isPlant ? '#dcfce7' : '#dbeafe'}" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="540" height="370" fill="#ffffff" />
        <text x="270" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">
          ${isPlant ? 'Ökaryot Bitki Hücresi Mimarisi' : 'Ökaryot Hayvan Hücresi Mimarisi'}
        </text>`;

      if (isPlant) {
        if (p.showCellWall !== false) {
          svg += `<rect x="60" y="45" width="420" height="300" rx="26" fill="none" stroke="#15803d" stroke-width="9" />
          <rect x="65" y="50" width="410" height="290" rx="22" fill="none" stroke="#86efac" stroke-width="4" />`;
        }
        svg += `<rect x="70" y="55" width="400" height="280" rx="20" fill="url(#bioCytoGrad)" stroke="#16a34a" stroke-width="3" />`;
      } else {
        svg += `<path d="M 100 190 C 80 110, 150 55, 270 55 C 390 55, 460 110, 450 200 C 440 290, 380 340, 260 340 C 140 340, 110 270, 100 190 Z" fill="url(#bioCytoGrad)" stroke="#0284c7" stroke-width="3.5" />`;
      }

      if (orgs.nucleus?.active) {
        const nx = orgs.nucleus.x, ny = orgs.nucleus.y;
        svg += `
          <g class="sci-draggable" data-organelle-key="nucleus" transform="translate(${nx},${ny})">
            <circle cx="0" cy="0" r="34" fill="#c084fc" stroke="#7e22ce" stroke-width="2.5" />
            <circle cx="0" cy="0" r="14" fill="#6b21a8" />
            <text x="0" y="4" text-anchor="middle" font-size="9" font-weight="bold" fill="#ffffff">Çekirdekçik</text>
          </g>
          ${renderOrganellePointer(nx, ny, nx, ny - 45, nx - 40, ny - 45, getOrgLabel(orgs.nucleus.label, p.labelStyle, 'Çekirdek'))}
        `;
      }

      if (orgs.mitochondria?.active) {
        const mx = orgs.mitochondria.x, my = orgs.mitochondria.y;
        svg += `
          <g class="sci-draggable" data-organelle-key="mitochondria" transform="translate(${mx},${my})">
            <ellipse cx="0" cy="0" rx="24" ry="14" fill="#fed7aa" stroke="#ea580c" stroke-width="2" />
            <path d="M -16 0 Q -10 -8 0 0 Q 10 8 16 0" fill="none" stroke="#c2410c" stroke-width="1.8" stroke-linecap="round" />
          </g>
          ${renderOrganellePointer(mx, my, mx + 30, my - 30, mx + 60, my - 30, getOrgLabel(orgs.mitochondria.label, p.labelStyle, 'Mitokondri'))}
        `;
      }

      if (orgs.golgi?.active) {
        const gx = orgs.golgi.x, gy = orgs.golgi.y;
        svg += `
          <g class="sci-draggable" data-organelle-key="golgi" transform="translate(${gx},${gy})">
            <path d="M -18 -8 Q 0 -14 18 -8" stroke="#f59e0b" stroke-width="4.5" fill="none" stroke-linecap="round" />
            <path d="M -20 0 Q 0 -6 20 0" stroke="#d97706" stroke-width="4.5" fill="none" stroke-linecap="round" />
            <path d="M -18 8 Q 0 2 18 8" stroke="#b45309" stroke-width="4.5" fill="none" stroke-linecap="round" />
          </g>
          ${renderOrganellePointer(gx, gy, gx - 30, gy + 30, gx - 60, gy + 30, getOrgLabel(orgs.golgi.label, p.labelStyle, 'Golgi Aygıtı'))}
        `;
      }

      if (orgs.vacuole?.active) {
        const vx = orgs.vacuole.x, vy = orgs.vacuole.y;
        const vRadius = isPlant ? 36 : 18;
        svg += `
          <g class="sci-draggable" data-organelle-key="vacuole" transform="translate(${vx},${vy})">
            <circle cx="0" cy="0" r="${vRadius}" fill="#bae6fd" stroke="#0284c7" stroke-width="2" opacity="0.85" />
            <text x="0" y="4" text-anchor="middle" font-size="9.5" fill="#0369a1" font-weight="bold">${isPlant ? 'Merkezi Koful' : 'Koful'}</text>
          </g>
          ${renderOrganellePointer(vx, vy, vx + 35, vy + 25, vx + 65, vy + 25, getOrgLabel(orgs.vacuole.label, p.labelStyle, isPlant ? 'Merkezi Koful' : 'Koful'))}
        `;
      }

      if (orgs.chloroplast?.active) {
        const cx = orgs.chloroplast.x, cy = orgs.chloroplast.y;
        svg += `
          <g class="sci-draggable" data-organelle-key="chloroplast" transform="translate(${cx},${cy})">
            <ellipse cx="0" cy="0" rx="22" ry="14" fill="#86efac" stroke="#15803d" stroke-width="2" />
            <line x1="-12" y1="-4" x2="12" y2="-4" stroke="#166534" stroke-width="2" />
            <line x1="-14" y1="0" x2="14" y2="0" stroke="#166534" stroke-width="2" />
            <line x1="-12" y1="4" x2="12" y2="4" stroke="#166534" stroke-width="2" />
          </g>
          ${renderOrganellePointer(cx, cy, cx + 30, cy - 30, cx + 60, cy - 30, getOrgLabel(orgs.chloroplast.label, p.labelStyle, 'Kloroplast'))}
        `;
      }

      if (orgs.ribosome?.active) {
        const rx = orgs.ribosome.x, ry = orgs.ribosome.y;
        svg += `
          <g class="sci-draggable" data-organelle-key="ribosome" transform="translate(${rx},${ry})">
            <circle cx="0" cy="0" r="6.5" fill="#475569" stroke="#0f172a" stroke-width="1.5" />
            <circle cx="8" cy="4" r="5.5" fill="#475569" stroke="#0f172a" stroke-width="1.5" />
          </g>
          ${renderOrganellePointer(rx, ry, rx, ry - 35, rx - 35, ry - 35, getOrgLabel(orgs.ribosome.label, p.labelStyle, 'Ribozom'))}
        `;
      }

      if (orgs.centrosome?.active && !isPlant) {
        const sx = orgs.centrosome.x, sy = orgs.centrosome.y;
        svg += `
          <g class="sci-draggable" data-organelle-key="centrosome" transform="translate(${sx},${sy})">
            <rect x="-8" y="-4" width="16" height="8" rx="2" fill="#eab308" stroke="#a16207" stroke-width="1.5" />
            <rect x="-4" y="-8" width="8" height="16" rx="2" fill="#eab308" stroke="#a16207" stroke-width="1.5" />
          </g>
          ${renderOrganellePointer(sx, sy, sx - 45, sy - 15, sx - 70, sy - 15, getOrgLabel(orgs.centrosome.label, p.labelStyle, 'Sentrozom'))}
        `;
      }

      svg += `</svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 2. HÜCRE BÖLÜNMELERİ (MİTOZ & MAYOZ, TETRAT, CROSSING-OVER, 2n=2,4,6)
  // --------------------------------------------------------------------------
  mitosisMeiosis: {
    id: 'mitosisMeiosis',
    category: 'biyoloji',
    name: 'Hücre Bölünmesi (Mitoz & Mayoz Evreleri)',
    tags: ['TYT', 'AYT', 'LGS', 'Mitoz', 'Mayoz', 'Tetrat', 'Krossing-Over', 'Kromozom'],
    desc: 'Mitoz, Mayoz I (tetrat, çift sıra, homolog ayrılması, krossing-over) ve Mayoz II (kardeş kromatit ayrılması) evreleri; 2n=2, 2n=4, 2n=6 seçenekleri ve soru maskelemesi.',
    defaultParams: {
      divisionType: 'mitosis', // 'mitosis' | 'meiosis1' | 'meiosis2'
      phase: 'metaphase', // 'prophase' | 'metaphase' | 'anaphase' | 'telophase'
      chromosomeCount: '4', // '2' | '4' | '6'
      crossingOver: false,
      showSpindleFibers: true,
      labelMask: 'none' // 'none' | 'questions'
    },
    presets: [
      {
        name: 'TYT - Mitoz Metafaz (2n = 4, Ekvatorda Tek Sıra)',
        params: { divisionType: 'mitosis', phase: 'metaphase', chromosomeCount: '4', crossingOver: false, showSpindleFibers: true, labelMask: 'none' }
      },
      {
        name: 'TYT - Mitoz Anafaz (2n = 4 -> 8 Kardeş Kromatit Kutuplara)',
        params: { divisionType: 'mitosis', phase: 'anaphase', chromosomeCount: '4', crossingOver: false, showSpindleFibers: true, labelMask: 'none' }
      },
      {
        name: 'AYT - Mayoz I Metafaz I (2n = 4, Homologlar Çift Sıra Tetrat)',
        params: { divisionType: 'meiosis1', phase: 'metaphase', chromosomeCount: '4', crossingOver: true, showSpindleFibers: true, labelMask: 'none' }
      },
      {
        name: 'AYT - Mayoz I Anafaz I (Homolog Kromozom Ayrılması & Çeşitlilik)',
        params: { divisionType: 'meiosis1', phase: 'anaphase', chromosomeCount: '4', crossingOver: true, showSpindleFibers: true, labelMask: 'none' }
      },
      {
        name: 'AYT - Mayoz II Anafaz II (n = 2, Kardeş Kromatit Ayrılması)',
        params: { divisionType: 'meiosis2', phase: 'anaphase', chromosomeCount: '2', crossingOver: true, showSpindleFibers: true, labelMask: 'none' }
      }
    ],
    schema: [
      {
        key: 'divisionType',
        label: 'Bölünme Türü',
        type: 'select',
        options: [
          { v: 'mitosis', l: 'Mitoz Bölünme' },
          { v: 'meiosis1', l: 'Mayoz I (Homolog Kromozomlar & Tetrat)' },
          { v: 'meiosis2', l: 'Mayoz II (Haploid Hücre & Kromatitler)' }
        ]
      },
      {
        key: 'phase',
        label: 'Evre',
        type: 'select',
        options: [
          { v: 'prophase', l: 'Profaz' },
          { v: 'metaphase', l: 'Metafaz (Ekvatoral Düzlem)' },
          { v: 'anaphase', l: 'Anafaz (Kutuplara Çekilme)' },
          { v: 'telophase', l: 'Telofaz & Boğumlanma / Ara Lamel' }
        ]
      },
      {
        key: 'chromosomeCount',
        label: 'Kromozom Sayısı (2n)',
        type: 'select',
        options: [
          { v: '2', l: '2n = 2' },
          { v: '4', l: '2n = 4' },
          { v: '6', l: '2n = 6' }
        ]
      },
      { key: 'crossingOver', label: 'Krossing-Over (Parça Değişimi) Göster', type: 'checkbox' },
      { key: 'showSpindleFibers', label: 'İğ İplikleri ve Sentrozomları Göster', type: 'checkbox' },
      {
        key: 'labelMask',
        label: 'Soru Maskelemesi',
        type: 'select',
        options: [
          { v: 'none', l: 'Tam İsimlendirme' },
          { v: 'questions', l: 'Kutulara Soru İşareti (?) Koy' }
        ]
      }
    ],
    renderSvg(p) {
      const isMeiosis1 = p.divisionType === 'meiosis1';
      const isMeiosis2 = p.divisionType === 'meiosis2';
      const nChr = parseInt(p.chromosomeCount) || 4;
      const xo = Boolean(p.crossingOver);
      const mask = p.labelMask === 'questions';

      const phaseNames = {
        prophase: isMeiosis1 ? 'Profaz I' : (isMeiosis2 ? 'Profaz II' : 'Profaz'),
        metaphase: isMeiosis1 ? 'Metafaz I (Tetratlar Ekvatorda Çift Sıra)' : (isMeiosis2 ? 'Metafaz II (Ekvatorda Tek Sıra)' : 'Metafaz (Ekvatorda Tek Sıra)'),
        anaphase: isMeiosis1 ? 'Anafaz I (Homolog Kromozomlar Ayrılır)' : (isMeiosis2 ? 'Anafaz II (Kardeş Kromatitler Ayrılır)' : 'Anafaz (Kardeş Kromatitler Ayrılır)'),
        telophase: isMeiosis1 ? 'Telofaz I & Sitokinez I' : (isMeiosis2 ? 'Telofaz II & Sitokinez II' : 'Telofaz & Sitokinez')
      };

      const title = `${phaseNames[p.phase]} (${isMeiosis2 ? `n = ${nChr/2}` : `2n = ${nChr}`})`;

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 370" width="100%" height="100%" class="sci-interactive-svg" style="font-family:'Noto Sans',sans-serif;">
        <rect x="0" y="0" width="540" height="370" fill="#ffffff" />
        <text x="270" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">${title}</text>`;

      if (p.phase === 'telophase') {
        svg += `
          <path d="M 140 185 C 100 100, 200 70, 260 130 C 320 70, 420 100, 380 185 C 420 270, 320 300, 260 240 C 200 300, 100 270, 140 185 Z" fill="#f8fafc" stroke="#0284c7" stroke-width="2.5" />
          <line x1="260" y1="115" x2="260" y2="255" stroke="#dc2626" stroke-width="2" stroke-dasharray="4,3" />
          <text x="260" y="280" text-anchor="middle" font-size="11" font-weight="bold" fill="#dc2626">Boğumlanma Çizgisi</text>
        `;
      } else {
        svg += `
          <ellipse cx="270" cy="185" rx="190" ry="140" fill="#f8fafc" stroke="#0284c7" stroke-width="2.5" />
          <line x1="80" y1="185" x2="460" y2="185" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4" />
          <text x="470" y="189" font-size="10" fill="#64748b">Ekvatoral Düzlem</text>
        `;
      }

      if (p.showSpindleFibers && p.phase !== 'telophase') {
        svg += `
          <g stroke="#cbd5e1" stroke-width="1.2">
            <line x1="270" y1="65" x2="270" y2="305" />
            <line x1="270" y1="65" x2="200" y2="185" />
            <line x1="270" y1="65" x2="340" y2="185" />
            <line x1="270" y1="305" x2="200" y2="185" />
            <line x1="270" y1="305" x2="340" y2="185" />
            <line x1="270" y1="65" x2="150" y2="185" />
            <line x1="270" y1="65" x2="390" y2="185" />
            <line x1="270" y1="305" x2="150" y2="185" />
            <line x1="270" y1="305" x2="390" y2="185" />
          </g>
          <circle cx="270" cy="65" r="8" fill="#ea580c" />
          <circle cx="270" cy="305" r="8" fill="#ea580c" />
          <text x="270" y="50" text-anchor="middle" font-size="10" font-weight="bold" fill="#c2410c">${mask ? '?' : 'Kutup (Sentrozom)'}</text>
          <text x="270" y="330" text-anchor="middle" font-size="10" font-weight="bold" fill="#c2410c">${mask ? '?' : 'Kutup (Sentrozom)'}</text>
        `;
      }

      const colors = [
        { c1: '#2563eb', c2: '#dc2626' },
        { c1: '#16a34a', c2: '#d97706' },
        { c1: '#9333ea', c2: '#0891b2' }
      ];

      const drawChr = (x, y, w, h, col, xoCol = null, angle = 0) => {
        let piece = xo && xoCol ? `<rect x="${x - w/2}" y="${y + h/4}" width="${w}" height="${h/4}" rx="2" fill="${xoCol}" />` : '';
        return `
          <g transform="rotate(${angle} ${x} ${y})">
            <rect x="${x - w/2}" y="${y - h/2}" width="${w}" height="${h}" rx="3" fill="${col}" stroke="#0f172a" stroke-width="1.2" />
            ${piece}
            <circle cx="${x}" cy="${y}" r="3" fill="#ffffff" stroke="#0f172a" stroke-width="1.2" />
          </g>
        `;
      };

      if (p.phase === 'metaphase') {
        const span = 260;
        const count = isMeiosis2 ? nChr / 2 : nChr;
        const step = count > 1 ? span / (count - 1) : 0;
        const startX = 270 - span / 2;

        for (let i = 0; i < count; i++) {
          const cx = startX + i * step;
          const pairCol = colors[i % colors.length];

          if (isMeiosis1) {
            svg += drawChr(cx, 165, 8, 36, pairCol.c1, xo ? pairCol.c2 : null, 0);
            svg += drawChr(cx, 205, 8, 36, pairCol.c2, xo ? pairCol.c1 : null, 0);
          } else {
            svg += drawChr(cx - 5, 185, 7, 38, pairCol.c1, xo && i === 0 ? pairCol.c2 : null, -12);
            svg += drawChr(cx + 5, 185, 7, 38, isMeiosis2 ? pairCol.c1 : pairCol.c2, xo && i === 0 ? pairCol.c1 : null, 12);
          }
        }

        if (isMeiosis1) {
          svg += `
            <g transform="translate(410, 110)">
              <rect x="0" y="0" width="115" height="44" rx="6" fill="#fef3c7" stroke="#d97706" stroke-width="1.5" />
              <text x="57" y="18" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#b45309">${mask ? '?' : 'Tetrat & Sinapsis'}</text>
              <text x="57" y="34" text-anchor="middle" font-size="9" fill="#78350f">(Homolog Çift Sıra)</text>
            </g>
          `;
        }
      } else if (p.phase === 'anaphase') {
        const span = 240;
        const count = isMeiosis2 ? nChr / 2 : nChr;
        const step = count > 1 ? span / (count - 1) : 0;
        const startX = 270 - span / 2;

        for (let i = 0; i < count; i++) {
          const cx = startX + i * step;
          const pairCol = colors[i % colors.length];

          if (isMeiosis1) {
            svg += drawChr(cx, 125, 8, 34, pairCol.c1, xo ? pairCol.c2 : null, 0);
            svg += drawChr(cx, 245, 8, 34, pairCol.c2, xo ? pairCol.c1 : null, 0);
          } else {
            svg += drawChr(cx, 125, 7, 26, pairCol.c1, null, -18);
            svg += drawChr(cx, 245, 7, 26, pairCol.c2, null, 18);
          }
        }

        svg += `
          <g transform="translate(50, 150)">
            <line x1="0" y1="-20" x2="0" y2="-60" stroke="#dc2626" stroke-width="2" />
            <polygon points="0,-65 -4,-55 4,-55" fill="#dc2626" />
            <line x1="0" y1="20" x2="0" y2="60" stroke="#dc2626" stroke-width="2" />
            <polygon points="0,65 -4,55 4,55" fill="#dc2626" />
            <text x="8" y="-35" font-size="10" font-weight="bold" fill="#dc2626">Kutuplara Çekilme</text>
          </g>
        `;
      } else if (p.phase === 'prophase') {
        svg += `
          <circle cx="270" cy="185" r="80" fill="none" stroke="#7c3aed" stroke-width="2" stroke-dasharray="6,4" />
          <text x="270" y="115" text-anchor="middle" font-size="10" font-weight="bold" fill="#6d28d9">Erimekte Olan Çekirdek Zarı</text>
        `;
        for (let i = 0; i < nChr; i++) {
          const ang = (i * 2 * Math.PI) / nChr;
          const cx = 270 + 45 * Math.cos(ang);
          const cy = 185 + 45 * Math.sin(ang);
          const pairCol = colors[i % colors.length];
          svg += drawChr(cx, cy, 7, 30, pairCol.c1, null, (i * 45));
        }
      } else if (p.phase === 'telophase') {
        const leftCount = Math.ceil(nChr / 2);
        for (let i = 0; i < leftCount; i++) {
          const pairCol = colors[i % colors.length];
          svg += drawChr(190 + (i - 1) * 25, 185, 6, 24, pairCol.c1, null, 15);
          svg += drawChr(330 + (i - 1) * 25, 185, 6, 24, pairCol.c2, null, -15);
        }
      }

      svg += `</svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 3. DNA & NÜKLEOTİD MODELİ (LGS & TYT)
  // --------------------------------------------------------------------------
  dnaModel: {
    id: 'dnaModel',
    category: 'biyoloji',
    name: 'DNA Çift Sarmal & Nükleotid Modeli',
    tags: ['LGS', 'TYT', 'DNA', 'Nükleotid', 'Hidrojen Bağı', 'Genetik Kod'],
    desc: 'DNA çift zincirli basamaklı modeli veya tek nükleotid kimyasal şeması; A-T (2\'li bağ), G-C (3\'lü bağ), maskeleme ve soru kalıpları.',
    defaultParams: {
      mode: 'ladder', // 'ladder' | 'nucleotide'
      sequence: 'A-T-G-C-T-A',
      maskMode: 'none', // 'none' | 'mask_bases' | 'mask_bonds'
      showHydrogenBonds: true
    },
    presets: [
      {
        name: 'LGS - Baz Eşleşmesi ve Maskelenmiş [ 1 ], [ 2 ]',
        params: { mode: 'ladder', sequence: 'A-T-G-C-A', maskMode: 'mask_bases', showHydrogenBonds: true }
      },
      {
        name: 'LGS / TYT - Tek Nükleotid Yapısı (Fosfat - Deoksiriboz - Baz)',
        params: { mode: 'nucleotide' }
      },
      {
        name: 'TYT - Hidrojen Bağları Sayısı (A=T 2\'li, G≡C 3\'lü)',
        params: { mode: 'ladder', sequence: 'A-T-G-C-C-G', maskMode: 'none', showHydrogenBonds: true }
      }
    ],
    schema: [
      {
        key: 'mode',
        label: 'Model Görünümü',
        type: 'select',
        options: [
          { v: 'ladder', l: 'DNA Çift Zincir (Basamaklı Sarmal Model)' },
          { v: 'nucleotide', l: 'Tek Nükleotid Detay Şeması (P - D - Baz)' }
        ]
      },
      { key: 'sequence', label: '1. Zincir Baz Dizilimi (Sol)', type: 'text', hint: 'Örn: A-T-G-C-A' },
      {
        key: 'maskMode',
        label: 'Soru Maskelemesi',
        type: 'select',
        options: [
          { v: 'none', l: 'Tüm Harfleri Göster (Normal)' },
          { v: 'mask_bases', l: 'Karşı Zinciri [ 1 ], [ 2 ] ile Maskele' },
          { v: 'mask_bonds', l: 'Hidrojen Bağ Sayılarını Gizle (?)' }
        ]
      },
      { key: 'showHydrogenBonds', label: 'Hidrojen Bağ Çizgilerini Göster', type: 'checkbox' }
    ],
    renderSvg(p) {
      if (p.mode === 'nucleotide') {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 270" width="100%" height="100%" class="sci-interactive-svg" style="font-family:'Noto Sans',sans-serif;">
          <rect x="0" y="0" width="500" height="270" fill="#ffffff" />
          <text x="250" y="28" text-anchor="middle" font-size="14" font-weight="bold" fill="#0f172a">Bir Nükleotidin Yapısı</text>
          
          <!-- Fosfat (P) -->
          <circle cx="85" cy="135" r="28" fill="#fee2e2" stroke="#dc2626" stroke-width="2.5" />
          <text x="85" y="141" text-anchor="middle" font-size="16" font-weight="bold" fill="#b91c1c">P</text>
          <text x="85" y="185" text-anchor="middle" font-size="12" font-weight="bold" fill="#64748b">Fosfat</text>

          <line x1="113" y1="135" x2="165" y2="135" stroke="#0f172a" stroke-width="2.5" />
          <text x="139" y="128" text-anchor="middle" font-size="10" fill="#64748b">Fosfodiester</text>

          <!-- Deoksiriboz Şekeri (Beşgen) -->
          <polygon points="220,95 265,127 248,177 192,177 175,127" fill="#fef3c7" stroke="#d97706" stroke-width="2.5" />
          <text x="220" y="147" text-anchor="middle" font-size="16" font-weight="bold" fill="#b45309">D</text>
          <text x="220" y="201" text-anchor="middle" font-size="12" font-weight="bold" fill="#64748b">Deoksiriboz</text>

          <line x1="265" y1="135" x2="320" y2="135" stroke="#0f172a" stroke-width="2.5" />
          <text x="292" y="128" text-anchor="middle" font-size="10" fill="#64748b">Glikozit</text>

          <!-- Organik Azotlu Baz (Adenin) -->
          <rect x="320" y="107" width="120" height="56" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="2.5" />
          <text x="380" y="141" text-anchor="middle" font-size="15" font-weight="bold" fill="#1d4ed8">Adenin (A)</text>
          <text x="380" y="185" text-anchor="middle" font-size="12" font-weight="bold" fill="#64748b">Organik Baz</text>

          <text x="250" y="242" text-anchor="middle" font-size="11.5" font-weight="600" fill="#334155">Nükleotid = Fosfat + Deoksiriboz Şekeri + Organik Azotlu Baz</text>
        </svg>`;
      }

      const bases = (p.sequence || 'A-T-G-C').toUpperCase().split(/[^A-Z]/).filter(Boolean);
      const complement = { 'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G' };
      const colors = {
        'A': { bg: '#dbeafe', border: '#2563eb', text: '#1d4ed8' },
        'T': { bg: '#fee2e2', border: '#dc2626', text: '#b91c1c' },
        'G': { bg: '#dcfce7', border: '#16a34a', text: '#15803d' },
        'C': { bg: '#fef3c7', border: '#d97706', text: '#b45309' }
      };

      const startY = 70;
      const stepY = 44;
      const totalH = startY + bases.length * stepY + 40;

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 ${Math.max(330, totalH)}" width="100%" height="100%" class="sci-interactive-svg" style="font-family:'Noto Sans',sans-serif;">
        <rect x="0" y="0" width="480" height="${Math.max(330, totalH)}" fill="#ffffff" />
        <text x="240" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">DNA Çift Sarmallı Yapısı</text>
        <text x="135" y="48" text-anchor="middle" font-size="11" font-weight="bold" fill="#64748b">1. Zincir</text>
        <text x="345" y="48" text-anchor="middle" font-size="11" font-weight="bold" fill="#64748b">2. Zincir</text>

        <line x1="75" y1="${startY - 10}" x2="75" y2="${startY + bases.length * stepY}" stroke="#94a3b8" stroke-width="6" stroke-linecap="round" />
        <line x1="405" y1="${startY - 10}" x2="405" y2="${startY + bases.length * stepY}" stroke="#94a3b8" stroke-width="6" stroke-linecap="round" />
      `;

      bases.forEach((b1, i) => {
        const b2 = complement[b1] || 'T';
        const y = startY + i * stepY;
        const c1 = colors[b1] || colors['A'];
        const c2 = colors[b2] || colors['T'];
        const isTriple = (b1 === 'G' || b1 === 'C');

        svg += `
          <rect x="95" y="${y - 14}" width="70" height="28" rx="5" fill="${c1.bg}" stroke="${c1.border}" stroke-width="2" />
          <text x="130" y="${y + 5}" text-anchor="middle" font-size="13" font-weight="bold" fill="${c1.text}">${b1}</text>
        `;

        if (p.showHydrogenBonds !== false) {
          if (p.maskMode === 'mask_bonds') {
            svg += `
              <text x="240" y="${y + 4}" text-anchor="middle" font-size="13" font-weight="bold" fill="#dc2626">?</text>
            `;
          } else if (isTriple) {
            svg += `
              <line x1="168" y1="${y - 6}" x2="312" y2="${y - 6}" stroke="#64748b" stroke-width="1.8" stroke-dasharray="3,3" />
              <line x1="168" y1="${y}" x2="312" y2="${y}" stroke="#64748b" stroke-width="1.8" stroke-dasharray="3,3" />
              <line x1="168" y1="${y + 6}" x2="312" y2="${y + 6}" stroke="#64748b" stroke-width="1.8" stroke-dasharray="3,3" />
            `;
          } else {
            svg += `
              <line x1="168" y1="${y - 4}" x2="312" y2="${y - 4}" stroke="#64748b" stroke-width="1.8" stroke-dasharray="3,3" />
              <line x1="168" y1="${y + 4}" x2="312" y2="${y + 4}" stroke="#64748b" stroke-width="1.8" stroke-dasharray="3,3" />
            `;
          }
        }

        const isMasked = p.maskMode === 'mask_bases';
        const rightText = isMasked ? `[ ${i + 1} ]` : b2;
        const rBg = isMasked ? '#f1f5f9' : c2.bg;
        const rBorder = isMasked ? '#0f172a' : c2.border;
        const rTextCol = isMasked ? '#0f172a' : c2.text;

        svg += `
          <rect x="315" y="${y - 14}" width="70" height="28" rx="5" fill="${rBg}" stroke="${rBorder}" stroke-width="2" />
          <text x="350" y="${y + 5}" text-anchor="middle" font-size="13" font-weight="bold" fill="${rTextCol}">${rightText}</text>
        `;
      });

      svg += `</svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 4. SOY AĞACI (PEDIGREE / KALITIM)
  // --------------------------------------------------------------------------
  pedigree: {
    id: 'pedigree',
    category: 'biyoloji',
    name: 'Soy Ağacı (Kalıtım / Pedigree)',
    tags: ['TYT', 'LGS', 'Mendel', 'Kalıtım', 'Soy Ağacı'],
    desc: 'Otozomal veya eşeye bağlı kalıtım için 3 nesilli, taranmış/hasta birey ve taşıyıcı dişi seçilebilir soy ağacı.',
    defaultParams: {
      title: 'Soy Ağacı Şeması',
      affectedList: '2, 5, 7',
      carrierList: '',
      questionMarkId: '',
      labelType: 'num', // 'num' | 'letters' | 'none'
      showLegend: true
    },
    presets: [
      { name: 'TYT 2023 - Otozomal Çekinik (1, 4, 7 Hasta)', params: { title: 'Otozomal Çekinik Özellik', affectedList: '1, 4, 7', carrierList: '', questionMarkId: '', labelType: 'num', showLegend: true } },
      { name: 'TYT - X\'e Bağlı Renk Körlüğü (2 Erkek Hasta, 3 Taşıyıcı)', params: { title: 'X\'e Bağlı Kalıtım', affectedList: '2, 6', carrierList: '3', questionMarkId: '8', labelType: 'num', showLegend: true } },
      { name: 'LGS - Mendel Çaprazlama & Soy Ağacı', params: { title: 'Kalıtım Şeması', affectedList: '5, 8', carrierList: '', questionMarkId: '', labelType: 'num', showLegend: true } }
    ],
    schema: [
      { key: 'title', label: 'Başlık / Not', type: 'text' },
      { key: 'affectedList', label: 'Taranmış (Hasta) Birey Numaraları', type: 'text', hint: 'Örn: 2, 5, 7' },
      { key: 'carrierList', label: 'Taşıyıcı Dişiler (Yarım Taralı)', type: 'text', hint: 'Örn: 3, 6' },
      { key: 'questionMarkId', label: 'Soru İşareti (?) Konulacak Birey', type: 'text', hint: 'Örn: 8' },
      {
        key: 'labelType',
        label: 'Birey İsimlendirmesi',
        type: 'select',
        options: [
          { v: 'num', l: 'Numaralı (1, 2, 3...)' },
          { v: 'letters', l: 'Harfli (K, L, M...)' },
          { v: 'none', l: 'Gizle' }
        ]
      },
      { key: 'showLegend', label: 'Lejant (Açıklama Kutusu) Göster', type: 'checkbox' }
    ],
    renderSvg(p) {
      const aff = (p.affectedList || '').split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const carr = (p.carrierList || '').split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const qId = parseInt(p.questionMarkId);
      const isAff = (id) => aff.includes(id);
      const isCarr = (id) => carr.includes(id);

      const individuals = [
        { id: 1, type: 'male', x: 140, y: 70 },
        { id: 2, type: 'female', x: 260, y: 70 },
        { id: 3, type: 'female', x: 90, y: 180 },
        { id: 4, type: 'male', x: 190, y: 180 },
        { id: 5, type: 'female', x: 290, y: 180 },
        { id: 6, type: 'male', x: 390, y: 180 },
        { id: 7, type: 'male', x: 300, y: 290 },
        { id: 8, type: 'female', x: 380, y: 290 }
      ];

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 370" width="100%" height="100%" class="sci-interactive-svg" style="font-family:'Noto Sans',sans-serif;">
        <rect x="0" y="0" width="520" height="370" fill="#ffffff" />
        ${p.title ? `<text x="260" y="26" text-anchor="middle" font-size="14" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>` : ''}
        
        <!-- Nesil Çizgileri -->
        <line x1="156" y1="70" x2="244" y2="70" stroke="#0f172a" stroke-width="2.2" />
        <line x1="200" y1="70" x2="200" y2="120" stroke="#0f172a" stroke-width="2.2" />
        <line x1="90" y1="120" x2="290" y2="120" stroke="#0f172a" stroke-width="2.2" />
        <line x1="90" y1="120" x2="90" y2="164" stroke="#0f172a" stroke-width="2.2" />
        <line x1="190" y1="120" x2="190" y2="164" stroke="#0f172a" stroke-width="2.2" />
        <line x1="290" y1="120" x2="290" y2="164" stroke="#0f172a" stroke-width="2.2" />
        <line x1="306" y1="180" x2="374" y2="180" stroke="#0f172a" stroke-width="2.2" />
        <line x1="340" y1="180" x2="340" y2="230" stroke="#0f172a" stroke-width="2.2" />
        <line x1="300" y1="230" x2="380" y2="230" stroke="#0f172a" stroke-width="2.2" />
        <line x1="300" y1="230" x2="300" y2="274" stroke="#0f172a" stroke-width="2.2" />
        <line x1="380" y1="230" x2="380" y2="274" stroke="#0f172a" stroke-width="2.2" />
        
        <!-- Nesil Numaraları (I, II, III) -->
        <text x="35" y="75" font-size="13" font-weight="bold" fill="#64748b">I</text>
        <text x="35" y="185" font-size="13" font-weight="bold" fill="#64748b">II</text>
        <text x="35" y="295" font-size="13" font-weight="bold" fill="#64748b">III</text>
      `;

      individuals.forEach(ind => {
        const isQ = qId === ind.id;
        const fill = isQ ? '#f1f5f9' : (isAff(ind.id) ? '#0f172a' : '#ffffff');
        const stroke = '#0f172a';
        let label = p.labelType === 'num' ? String(ind.id) : (p.labelType === 'letters' ? String.fromCharCode(64 + ind.id) : '');

        if (ind.type === 'male') {
          svg += `<rect x="${ind.x - 16}" y="${ind.y - 16}" width="32" height="32" fill="${fill}" stroke="${stroke}" stroke-width="2.4" rx="2" />`;
        } else {
          if (isCarr(ind.id) && !isQ) {
            svg += `<circle cx="${ind.x}" cy="${ind.y}" r="16" fill="#ffffff" stroke="${stroke}" stroke-width="2.4" />`;
            svg += `<path d="M ${ind.x} ${ind.y - 16} A 16 16 0 0 1 ${ind.x} ${ind.y + 16} Z" fill="#0f172a" />`;
          } else {
            svg += `<circle cx="${ind.x}" cy="${ind.y}" r="16" fill="${fill}" stroke="${stroke}" stroke-width="2.4" />`;
          }
        }

        if (isQ) {
          svg += `<text x="${ind.x}" y="${ind.y + 5}" text-anchor="middle" font-size="16" font-weight="bold" fill="#dc2626">?</text>`;
        }

        if (label) {
          svg += `<text x="${ind.x}" y="${ind.y + 32}" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">${label}</text>`;
        }
      });

      if (p.showLegend) {
        svg += `
          <g transform="translate(60, 335)">
            <rect x="0" y="0" width="14" height="14" fill="#0f172a" stroke="#0f172a" stroke-width="1.5" />
            <text x="20" y="11" font-size="11" fill="#334155">: Özelliği gösteren erkek</text>
            <circle cx="170" cy="7" r="7" fill="#0f172a" stroke="#0f172a" stroke-width="1.5" />
            <text x="184" y="11" font-size="11" fill="#334155">: Özelliği gösteren dişi</text>
            <rect x="330" y="0" width="14" height="14" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" />
            <text x="350" y="11" font-size="11" fill="#334155">: Sağlıklı</text>
          </g>
        `;
      }

      svg += `</svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 5. BESİN & ENERJİ PİRAMİDİ (EKOLOJİ)
  // --------------------------------------------------------------------------
  foodPyramid: {
    id: 'foodPyramid',
    category: 'biyoloji',
    name: 'Besin & Enerji Piramidi',
    tags: ['TYT', 'LGS', 'Ekoloji', 'Besin Zinciri', 'Ayrıştırıcı'],
    desc: 'Trofik basamaklar, üretici, 1.-3. dereceden tüketiciler, ayrıştırıcılar kutusu ve enerji/biyobirikim okları.',
    defaultParams: {
      levels: '4',
      tier1: 'Üreticiler (Bitkiler)',
      tier2: '1. Tüketiciler (Otçul)',
      tier3: '2. Tüketiciler (Etçil)',
      tier4: '3. Tüketiciler (Hepçil)',
      showDecomposer: true,
      showArrows: true
    },
    presets: [
      { name: 'TYT Standart 4 Basamaklı Besin Piramidi', params: { levels: '4', tier1: 'Üreticiler', tier2: 'Birincil Tüketiciler', tier3: 'İkincil Tüketiciler', tier4: 'Üçüncül Tüketiciler', showDecomposer: true, showArrows: true } },
      { name: 'LGS - Biyolojik Birikim & Enerji Akışı', params: { levels: '3', tier1: 'Ot', tier2: 'Çekirge', tier3: 'Kurbağa', tier4: '', showDecomposer: true, showArrows: true } }
    ],
    schema: [
      { key: 'levels', label: 'Basamak Sayısı', type: 'select', options: [{ v: '3', l: '3 Basamak' }, { v: '4', l: '4 Basamak' }] },
      { key: 'tier1', label: '1. Katman (En Alt - Üretici)', type: 'text' },
      { key: 'tier2', label: '2. Katman (1. Tüketici)', type: 'text' },
      { key: 'tier3', label: '3. Katman (2. Tüketici)', type: 'text' },
      { key: 'tier4', label: '4. Katman (Tepe Tüketici)', type: 'text' },
      { key: 'showDecomposer', label: 'Ayrıştırıcılar (Mantar/Bakteri) Kutusu', type: 'checkbox' },
      { key: 'showArrows', label: 'Biyolojik Birikim & Enerji Okları', type: 'checkbox' }
    ],
    renderSvg(p) {
      const n = parseInt(p.levels) || 4;
      const texts = [p.tier1, p.tier2, p.tier3, p.tier4];
      const tierColors = ['#86efac', '#fed7aa', '#fbcfe8', '#fca5a5'];

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 360" width="100%" height="100%" class="sci-interactive-svg" style="font-family:'Noto Sans',sans-serif;">
        <rect x="0" y="0" width="540" height="360" fill="#ffffff" />
        <text x="250" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">Ekolojik Besin & Enerji Piramidi</text>
      `;

      const baseY = 320;
      const totalHeight = 250;
      const hPerTier = totalHeight / n;
      const centerX = 230;

      for (let i = 0; i < n; i++) {
        const yBottom = baseY - i * hPerTier;
        const yTop = yBottom - hPerTier;
        const wBottom = 340 * (1 - (i / n) * 0.75);
        const wTop = 340 * (1 - ((i + 1) / n) * 0.75);

        const x1 = centerX - wBottom / 2;
        const x2 = centerX + wBottom / 2;
        const x3 = centerX + wTop / 2;
        const x4 = centerX - wTop / 2;

        svg += `
          <polygon points="${x1},${yBottom} ${x2},${yBottom} ${x3},${yTop} ${x4},${yTop}" fill="${tierColors[i]}" stroke="#0f172a" stroke-width="2" />
          <text x="${centerX}" y="${(yBottom + yTop) / 2 + 5}" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">${escSvg(texts[i])}</text>
        `;
      }

      if (p.showDecomposer) {
        svg += `
          <g transform="translate(425, 70)">
            <rect x="0" y="0" width="95" height="250" rx="8" fill="#fef3c7" stroke="#d97706" stroke-width="2" />
            <text x="47" y="115" text-anchor="middle" font-size="12" font-weight="bold" fill="#b45309" transform="rotate(-90 47 115)">AYRIŞTIRICILAR</text>
            <text x="47" y="235" text-anchor="middle" font-size="10" fill="#78350f">(Mantar, Bakteri)</text>
            <line x1="-5" y1="50" x2="-25" y2="50" stroke="#d97706" stroke-width="1.8" stroke-dasharray="3,2" />
            <line x1="-5" y1="125" x2="-25" y2="125" stroke="#d97706" stroke-width="1.8" stroke-dasharray="3,2" />
            <line x1="-5" y1="200" x2="-25" y2="200" stroke="#d97706" stroke-width="1.8" stroke-dasharray="3,2" />
          </g>
        `;
      }

      if (p.showArrows) {
        svg += `
          <g transform="translate(30, 80)">
            <line x1="0" y1="230" x2="0" y2="10" stroke="#dc2626" stroke-width="2.5" />
            <polygon points="0,0 -4,12 4,12" fill="#dc2626" />
            <text x="12" y="70" font-size="10.5" font-weight="bold" fill="#dc2626" transform="rotate(-90 12 70)">▲ Biyolojik Birikim Artar</text>
            <text x="12" y="190" font-size="10.5" font-weight="bold" fill="#15803d" transform="rotate(-90 12 190)">▼ Aktarılan Enerji (%10) Azalır</text>
          </g>
        `;
      }

      svg += `</svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 6. NEFRON & BOŞALTIM SİSTEMİ
  // --------------------------------------------------------------------------
  nephron: {
    id: 'nephron',
    category: 'biyoloji',
    name: 'Nefron & Boşaltım Modeli (Süzülme & Emilim)',
    tags: ['AYT', 'Boşaltım', 'Nefron', 'Glomerulus', 'Bowman', 'Henle'],
    desc: 'Glomerulus, Bowman kapsülü, proksimal tüp, Henle kulpu, distal tüp, toplama kanalı ve süzülme/emilim okları.',
    defaultParams: {
      title: 'Böbrek Nefronunun Yapısı & İdrar Oluşumu',
      labelType: 'num', // 'num' | 'names'
      showFlowArrows: true,
      showVessels: true
    },
    presets: [
      {
        name: 'AYT - Numaralandırılmış Nefron Kısımları (I-V)',
        params: {
          title: 'Nefronda Numaralandırılmış Bölgeler',
          labelType: 'num',
          showFlowArrows: true,
          showVessels: true
        }
      },
      {
        name: 'Nefron Kısımları İsimleriyle',
        params: {
          title: 'Nefronun Anatomik Yapısı ve Süzülme Yönü',
          labelType: 'names',
          showFlowArrows: true,
          showVessels: true
        }
      }
    ],
    schema: [
      { key: 'title', label: 'Şema Başlığı', type: 'text' },
      {
        key: 'labelType',
        label: 'Bölge İsimlendirmesi',
        type: 'select',
        options: [{ v: 'num', l: 'Numaralı (I, II, III, IV, V)' }, { v: 'names', l: 'Anatomik İsimler' }]
      },
      { key: 'showFlowArrows', label: 'Süzülme ve Emilim Oklarını Göster', type: 'checkbox' },
      { key: 'showVessels', label: 'Getirici / Götürücü Kılcalları Göster', type: 'checkbox' }
    ],
    renderSvg(p) {
      const isNum = p.labelType === 'num';
      const l1 = isNum ? 'I' : 'Glomerulus';
      const l2 = isNum ? 'II' : 'Bowman Kapsülü';
      const l3 = isNum ? 'III' : 'Proksimal Tüp';
      const l4 = isNum ? 'IV' : 'Henle Kulpu';
      const l5 = isNum ? 'V' : 'Toplama Kanalı';

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 360" width="100%" height="100%" class="sci-interactive-svg" style="font-family:'Noto Sans',sans-serif;">
        <rect x="0" y="0" width="540" height="360" fill="#ffffff" />
        ${p.title ? `<text x="270" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>` : ''}

        <!-- Korteks / Medulla Ayrım Çizgisi -->
        <line x1="40" y1="170" x2="500" y2="170" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="6,4" />
        <text x="50" y="165" font-size="10" font-weight="bold" fill="#94a3b8">Korteks (Kabuk)</text>
        <text x="50" y="185" font-size="10" font-weight="bold" fill="#94a3b8">Medulla (Öz)</text>

        <!-- NEFRON KANALI YOLU -->
        <g stroke="#f59e0b" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.85">
          <path d="M 140 100 C 110 80 110 140 140 120" />
          <path d="M 140 110 C 180 90 190 140 220 120" />
          <path d="M 220 120 L 220 280 C 220 310 270 310 270 280 L 270 120" />
          <path d="M 270 120 C 310 100 320 140 360 110" />
          <path d="M 360 110 L 430 110 L 430 330" />
        </g>
        <g stroke="#b45309" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M 140 92 C 100 70 100 150 140 128" />
          <path d="M 140 102 C 175 82 185 132 212 112" />
          <path d="M 212 112 L 212 280 C 212 318 278 318 278 280 L 278 112" />
          <path d="M 278 112 C 315 92 325 132 352 102" />
          <path d="M 352 102 L 422 102 L 422 330" />
        </g>

        <!-- Glomerulus Kılcal Yumağı (Kırmızı Damar) -->
        <g id="glomerulusGroup" transform="translate(125, 110)">
          <circle cx="0" cy="0" r="16" fill="#fecdd3" stroke="#dc2626" stroke-width="2.5" />
          <path d="M -8 -8 Q 0 8 8 -8 Q -8 0 8 8" fill="none" stroke="#dc2626" stroke-width="2.5" />
        </g>

        <!-- Damarlar -->
        ${p.showVessels ? `
          <g stroke="#dc2626" stroke-width="3" fill="none" stroke-linecap="round">
            <line x1="80" y1="70" x2="115" y2="100" />
            <line x1="115" y1="120" x2="80" y2="150" />
            <text x="60" y="65" font-size="9.5" font-weight="bold" fill="#dc2626" stroke="none">Getirici Atar</text>
          </g>
        ` : ''}

        <!-- Süzülme ve Geri Emilim Okları -->
        ${p.showFlowArrows ? `
          <line x1="135" y1="110" x2="160" y2="110" stroke="#2563eb" stroke-width="2.5" />
          <polygon points="166,110 156,106 156,114" fill="#2563eb" />
          <text x="155" y="100" font-size="9" font-weight="bold" fill="#2563eb">Süzülme</text>

          <line x1="220" y1="200" x2="185" y2="200" stroke="#059669" stroke-width="2" />
          <polygon points="180,200 188,197 188,203" fill="#059669" />
          <text x="175" y="195" font-size="9" font-weight="bold" fill="#059669">H₂O Emilimi</text>

          <line x1="270" y1="220" x2="305" y2="220" stroke="#d97706" stroke-width="2" />
          <polygon points="310,220 302,217 302,223" fill="#d97706" />
          <text x="312" y="215" font-size="9" font-weight="bold" fill="#d97706">NaCl Emilimi</text>
        ` : ''}

        <!-- Numaralandırılmış / İsimlendirilmiş Etiket Kutuları -->
        ${renderNephronBadge(125, 60, l1)}
        ${renderNephronBadge(80, 115, l2)}
        ${renderNephronBadge(200, 75, l3)}
        ${renderNephronBadge(245, 335, l4)}
        ${renderNephronBadge(430, 75, l5)}
      `;

      svg += `</svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // 7. NÖRON & SİNAPS İLETİMİ
  // --------------------------------------------------------------------------
  synapse: {
    id: 'synapse',
    category: 'biyoloji',
    name: 'Nöron Yapısı & Sinaps İletimi',
    tags: ['AYT', 'Sinir Sistemi', 'Nöron', 'Sinaps', 'Akson', 'Dendrit'],
    desc: 'Hücre gövdesi, dendritler, akson, miyelin kılıf, Ranvier boğumu ve sinaptik boşluktaki nörotransmitter iletimi.',
    defaultParams: {
      title: 'Motor Nöron Yapısı & İmpuls İletim Yönü',
      showMyelin: true,
      showTransmitters: true,
      impulseDirection: 'left_to_right'
    },
    presets: [
      {
        name: 'AYT - Miyelinli Nöron & Atlama İletimi',
        params: {
          title: 'Miyelin Kılıflı Nöronda İmpuls İletimi',
          showMyelin: true,
          showTransmitters: true,
          impulseDirection: 'left_to_right'
        }
      }
    ],
    schema: [
      { key: 'title', label: 'Şema Başlığı', type: 'text' },
      { key: 'showMyelin', label: 'Miyelin Kılıfları & Ranvier Boğumunu Göster', type: 'checkbox' },
      { key: 'showTransmitters', label: 'Sinaptik Boşluktaki Nörotransmitterleri Göster', type: 'checkbox' }
    ],
    renderSvg(p) {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 340" width="100%" height="100%" class="sci-interactive-svg" style="font-family:'Noto Sans',sans-serif;">
        <rect x="0" y="0" width="540" height="340" fill="#ffffff" />
        ${p.title ? `<text x="270" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>` : ''}

        <!-- Nöron Gövdesi & Dendritler -->
        <g id="somaGroup" transform="translate(100, 170)">
          <path d="M -30 -30 L -60 -60 M -35 0 L -75 0 M -30 30 L -60 60 M 0 -35 L 0 -70 M 0 35 L 0 70" stroke="#0284c7" stroke-width="3" stroke-linecap="round" />
          <circle cx="0" cy="0" r="36" fill="#bae6fd" stroke="#0284c7" stroke-width="2.5" />
          <circle cx="0" cy="0" r="14" fill="#0284c7" opacity="0.8" />
          <text x="0" y="4" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#ffffff">Çekirdek</text>
          <text x="-65" y="-65" font-size="11" font-weight="bold" fill="#0369a1">Dendrit</text>
        </g>

        <!-- Akson Gövdesi -->
        <line x1="136" y1="170" x2="450" y2="170" stroke="#0284c7" stroke-width="6" stroke-linecap="round" />

        <!-- Miyelin Kılıf Boğumları -->
        ${p.showMyelin ? `
          <g transform="translate(160, 170)">
            <rect x="0" y="-16" width="60" height="32" rx="8" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
            <rect x="75" y="-16" width="60" height="32" rx="8" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
            <rect x="150" y="-16" width="60" height="32" rx="8" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
            <rect x="225" y="-16" width="60" height="32" rx="8" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />

            <line x1="68" y1="-2" x2="68" y2="-45" stroke="#dc2626" stroke-width="1.8" />
            <polygon points="68,-2 65,-10 71,-10" fill="#dc2626" />
            <text x="68" y="-50" text-anchor="middle" font-size="10" font-weight="bold" fill="#dc2626">Ranvier Boğumu</text>
            <text x="180" y="-22" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#854d0e">Miyelin Kılıf</text>
          </g>
        ` : ''}

        <!-- Akson Uçları & Sinaps Yumruları -->
        <g id="axonTerminals" transform="translate(450, 170)" stroke="#0284c7" stroke-width="3">
          <line x1="0" y1="0" x2="35" y2="-40" />
          <circle cx="35" cy="-40" r="7" fill="#0284c7" />
          <line x1="0" y1="0" x2="45" y2="0" />
          <circle cx="45" cy="0" r="7" fill="#0284c7" />
          <line x1="0" y1="0" x2="35" y2="40" />
          <circle cx="35" cy="40" r="7" fill="#0284c7" />
          <text x="55" y="4" font-size="11" font-weight="bold" fill="#0369a1" stroke="none">Akson Ucu (Sinaps)</text>
        </g>

        <!-- İmpuls İletim Yönü Oku -->
        <g transform="translate(180, 240)">
          <line x1="0" y1="0" x2="200" y2="0" stroke="#dc2626" stroke-width="3" stroke-linecap="round" />
          <polygon points="210,0 196,-6 196,6" fill="#dc2626" />
          <text x="100" y="-10" text-anchor="middle" font-size="12" font-weight="bold" fill="#dc2626">İmpuls İletim Yönü (Dendrit ➔ Akson)</text>
        </g>
      `;

      svg += `</svg>`;
      return svg;
    }
  }
};

function renderOrganellePointer(fromX, fromY, midX, midY, toX, toY, label) {
  const isLeft = toX < fromX;
  const boxW = label.length > 2 ? label.length * 8 + 16 : 28;
  const boxX = isLeft ? toX - boxW : toX;

  return `
    <g stroke="#0f172a" stroke-width="1.6" fill="none">
      <circle cx="${fromX}" cy="${fromY}" r="2.5" fill="#0f172a" />
      <line x1="${fromX}" y1="${fromY}" x2="${midX}" y2="${midY}" />
      <line x1="${midX}" y1="${midY}" x2="${toX}" y2="${toY}" />
    </g>
    <g transform="translate(${boxX}, ${toY - 12})">
      <rect x="0" y="0" width="${boxW}" height="24" rx="4" fill="#ffffff" stroke="#0f172a" stroke-width="1.6" />
      <text x="${boxW / 2}" y="16" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#0f172a">${escSvg(label)}</text>
    </g>
  `;
}

function getOrgLabel(code, style, name) {
  if (style === 'names') return name;
  return code || name;
}

function renderNephronBadge(x, y, label) {
  const w = label.length > 2 ? label.length * 8 + 14 : 26;
  return `
    <g transform="translate(${x}, ${y})">
      <rect x="-${w / 2}" y="-12" width="${w}" height="24" rx="4" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />
      <text x="0" y="4.5" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#0f172a">${escSvg(label)}</text>
    </g>
  `;
}


// Module Exports
__exports['BIO_TEMPLATES'] = BIO_TEMPLATES;

});

__define('modules/scienceTemplates.js', function(__exports, __require, __module) {
const { $, openModal, closeModal } = __require('utils.js');
const { GEO_TEMPLATES } = __require('modules/science/geoTemplates.js');
const { PHYS_TEMPLATES } = __require('modules/science/physTemplates.js');
const { CHEM_TEMPLATES } = __require('modules/science/chemTemplates.js');
const { BIO_TEMPLATES } = __require('modules/science/bioTemplates.js');
const { injectOverlaysIntoSvg, renderCircuitSymbolSvg, setupStageInteractions, addOverlayItem, deleteSelectedOverlayItem, resetAllOverlays, setSelectedOverlayId } = __require('modules/science/overlayEngine.js');

/**
 * Egemen's Testmaker — Fen Bilimleri & Coğrafya Şablon Envanteri (Fizik, Kimya, Biyoloji, Coğrafya)
 * TYT, AYT, LGS ve KPSS müfredatına uygun parametrik vektörel (SVG) diyagram üretim motoru,
 * interaktif tuval, devre sembolleri, KaTeX formülleri, organel ve harita pinleri yönetim katmanı.
 */

let onScienceInsertCallback = null;
let onScienceCancelCallback = null;
let activeCategory = 'all'; // 'all' | 'cografya' | 'fizik' | 'kimya' | 'biyoloji'
let activeTemplateId = 'turkeyMap';
let currentParams = {};

// ============================================================================
// 1. ŞABLON TANIMLARI & VEKTÖREL ÇİZİM MOTORLARI
// ============================================================================

const SCIENCE_TEMPLATES = {
  // Coğrafya, Fizik, Kimya ve Biyoloji Modülleri
  ...GEO_TEMPLATES,
  ...PHYS_TEMPLATES,
  ...CHEM_TEMPLATES,
  ...BIO_TEMPLATES,
  // --------------------------------------------------------------------------
  // BİYOLOJİ ŞABLONLARI
  // --------------------------------------------------------------------------
  pedigree: {
    id: 'pedigree',
    category: 'biyoloji',
    name: 'Soy Ağacı (Kalıtım / Pedigree)',
    tags: ['TYT', 'LGS', 'Mendel', 'Kalıtım'],
    desc: 'Otozomal veya eşeye bağlı kalıtım için 3 nesilli, taranmış/hasta birey seçilebilir soy ağacı.',
    defaultParams: {
      title: 'Soy Ağacı',
      affectedList: '2, 5, 7',
      carrierList: '',
      labelType: 'num', // 'num' | 'letters' | 'none'
      showLegend: true
    },
    presets: [
      { name: 'TYT 2023 - Otozomal Çekinik (1, 4, 7 Hasta)', params: { affectedList: '1, 4, 7', carrierList: '', labelType: 'num', showLegend: true } },
      { name: 'TYT - X\'e Bağlı Renk Körlüğü (2 Erkek Hasta, 3 Taşıyıcı)', params: { affectedList: '2, 6', carrierList: '3', labelType: 'num', showLegend: true } },
      { name: 'LGS - Kalıtım & Çaprazlama Şeması', params: { affectedList: '5, 8', carrierList: '', labelType: 'num', showLegend: true } }
    ],
    schema: [
      { key: 'title', label: 'Başlık / Not', type: 'text' },
      { key: 'affectedList', label: 'Taranmış (Hasta) Birey Numaraları', type: 'text', hint: 'Örn: 2, 5, 7' },
      { key: 'carrierList', label: 'Taşıyıcı Dişiler (Yarım Taralı)', type: 'text', hint: 'Örn: 3, 6' },
      { key: 'labelType', label: 'Birey İsimlendirmesi', type: 'select', options: [{ v: 'num', l: 'Numaralı (1, 2, 3...)' }, { v: 'letters', l: 'Harfli (K, L, M...)' }, { v: 'none', l: 'Gizle' }] },
      { key: 'showLegend', label: 'Lejant (Açıklama Kutusu) Göster', type: 'checkbox' }
    ],
    renderSvg(p) {
      const aff = p.affectedList.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const carr = p.carrierList.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const isAff = (id) => aff.includes(id);
      const isCarr = (id) => carr.includes(id);

      const individuals = [
        { id: 1, type: 'male', x: 140, y: 70 },
        { id: 2, type: 'female', x: 260, y: 70 },
        { id: 3, type: 'female', x: 90, y: 180 },
        { id: 4, type: 'male', x: 190, y: 180 },
        { id: 5, type: 'female', x: 290, y: 180 },
        { id: 6, type: 'male', x: 390, y: 180 },
        { id: 7, type: 'male', x: 300, y: 290 },
        { id: 8, type: 'female', x: 380, y: 290 }
      ];

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 370" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif;">
        ${p.title ? `<text x="260" y="26" text-anchor="middle" font-size="14" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>` : ''}
        
        <!-- Nesil Çizgileri -->
        <line x1="156" y1="70" x2="244" y2="70" stroke="#0f172a" stroke-width="2.2" />
        <line x1="200" y1="70" x2="200" y2="120" stroke="#0f172a" stroke-width="2.2" />
        <line x1="90" y1="120" x2="290" y2="120" stroke="#0f172a" stroke-width="2.2" />
        <line x1="90" y1="120" x2="90" y2="164" stroke="#0f172a" stroke-width="2.2" />
        <line x1="190" y1="120" x2="190" y2="164" stroke="#0f172a" stroke-width="2.2" />
        <line x1="290" y1="120" x2="290" y2="164" stroke="#0f172a" stroke-width="2.2" />
        <line x1="306" y1="180" x2="374" y2="180" stroke="#0f172a" stroke-width="2.2" />
        <line x1="340" y1="180" x2="340" y2="230" stroke="#0f172a" stroke-width="2.2" />
        <line x1="300" y1="230" x2="380" y2="230" stroke="#0f172a" stroke-width="2.2" />
        <line x1="300" y1="230" x2="300" y2="274" stroke="#0f172a" stroke-width="2.2" />
        <line x1="380" y1="230" x2="380" y2="274" stroke="#0f172a" stroke-width="2.2" />
        
        <!-- Nesil Numaraları (I, II, III) -->
        <text x="35" y="75" font-size="13" font-weight="bold" fill="#64748b">I</text>
        <text x="35" y="185" font-size="13" font-weight="bold" fill="#64748b">II</text>
        <text x="35" y="295" font-size="13" font-weight="bold" fill="#64748b">III</text>
      `;

      individuals.forEach(ind => {
        const fill = isAff(ind.id) ? '#0f172a' : '#ffffff';
        const stroke = '#0f172a';
        let label = p.labelType === 'num' ? String(ind.id) : (p.labelType === 'letters' ? String.fromCharCode(64 + ind.id) : '');

        if (ind.type === 'male') {
          svg += `<rect x="${ind.x - 16}" y="${ind.y - 16}" width="32" height="32" fill="${fill}" stroke="${stroke}" stroke-width="2.4" rx="2" />`;
        } else {
          if (isCarr(ind.id)) {
            svg += `<circle cx="${ind.x}" cy="${ind.y}" r="16" fill="#ffffff" stroke="${stroke}" stroke-width="2.4" />`;
            svg += `<path d="M ${ind.x} ${ind.y - 16} A 16 16 0 0 1 ${ind.x} ${ind.y + 16} Z" fill="#0f172a" />`;
          } else {
            svg += `<circle cx="${ind.x}" cy="${ind.y}" r="16" fill="${fill}" stroke="${stroke}" stroke-width="2.4" />`;
          }
        }

        if (label) {
          svg += `<text x="${ind.x}" y="${ind.y + 32}" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">${label}</text>`;
        }
      });

      if (p.showLegend) {
        svg += `
          <g transform="translate(60, 335)">
            <rect x="0" y="0" width="14" height="14" fill="#0f172a" stroke="#0f172a" stroke-width="1.5" />
            <text x="20" y="11" font-size="11" fill="#334155">: Özelliği gösteren erkek</text>
            <circle cx="170" cy="7" r="7" fill="#0f172a" stroke="#0f172a" stroke-width="1.5" />
            <text x="184" y="11" font-size="11" fill="#334155">: Özelliği gösteren dişi</text>
            <rect x="330" y="0" width="14" height="14" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" />
            <text x="350" y="11" font-size="11" fill="#334155">: Sağlıklı</text>
          </g>
        `;
      }

      svg += `</svg>`;
      return svg;
    }
  },

  dnaModel: {
    id: 'dnaModel',
    category: 'biyoloji',
    name: 'DNA & Nükleotid Modeli',
    tags: ['LGS', 'TYT', 'DNA', 'Genetik Kod', 'Nükleotid'],
    desc: 'LGS Fen Bilimleri ve TYT için A-T-G-C baz çiftleri, fosfat-şeker omurgası ve hidrojen bağları şablonu.',
    defaultParams: {
      mode: 'ladder',
      sequence: 'A-T-G-C-T-A',
      maskMode: 'none'
    },
    presets: [
      { name: 'LGS - Baz Eşleşmesi (A-T, G-C ve ? Soru Kalıbı)', params: { mode: 'ladder', sequence: 'A-T-G-C-A', maskMode: 'mask_bases' } },
      { name: 'LGS/TYT - Tek Nükleotid Yapısı (Fosfat-Şeker-Baz)', params: { mode: 'nucleotide' } },
      { name: 'TYT - Hidrojen Bağı Sayısı (2\'li ve 3\'lü)', params: { mode: 'ladder', sequence: 'A-T-G-C-C-G', maskMode: 'none' } }
    ],
    schema: [
      { key: 'mode', label: 'Model Görünümü', type: 'select', options: [{ v: 'ladder', l: 'DNA Çift Zincir (Basamaklı Model)' }, { v: 'nucleotide', l: 'Tek Nükleotid Detay Şeması (P-D-Baz)' }] },
      { key: 'sequence', label: '1. Zincir Baz Dizilimi (Sol)', type: 'text', hint: 'Örn: A-T-G-C-A' },
      { key: 'maskMode', label: 'Soru İçin Gizleme', type: 'select', options: [{ v: 'none', l: 'Tüm Harfleri Göster (Normal)' }, { v: 'mask_bases', l: 'Sağ Zinciri [ 1 ], [ 2 ] ile Maskele' }] }
    ],
    renderSvg(p) {
      if (p.mode === 'nucleotide') {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 260" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif;">
          <text x="240" y="28" text-anchor="middle" font-size="14" font-weight="bold" fill="#0f172a">Bir Nükleotidin Yapısı</text>
          
          <!-- Fosfat (P) -->
          <circle cx="80" cy="130" r="28" fill="#fee2e2" stroke="#dc2626" stroke-width="2.5" />
          <text x="80" y="136" text-anchor="middle" font-size="16" font-weight="bold" fill="#b91c1c">P</text>
          <text x="80" y="180" text-anchor="middle" font-size="12" font-weight="bold" fill="#64748b">Fosfat</text>

          <line x1="108" y1="130" x2="160" y2="130" stroke="#0f172a" stroke-width="2.5" />

          <!-- Deoksiriboz Şekeri (Beşgen) -->
          <polygon points="210,90 255,122 238,172 182,172 165,122" fill="#fef3c7" stroke="#d97706" stroke-width="2.5" />
          <text x="210" y="142" text-anchor="middle" font-size="16" font-weight="bold" fill="#b45309">D</text>
          <text x="210" y="196" text-anchor="middle" font-size="12" font-weight="bold" fill="#64748b">Deoksiriboz</text>

          <line x1="255" y1="130" x2="310" y2="130" stroke="#0f172a" stroke-width="2.5" />

          <!-- Organik Baz (Adenin) -->
          <rect x="310" y="102" width="110" height="56" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="2.5" />
          <text x="365" y="136" text-anchor="middle" font-size="15" font-weight="bold" fill="#1d4ed8">Adenin (A)</text>
          <text x="365" y="180" text-anchor="middle" font-size="12" font-weight="bold" fill="#64748b">Organik Baz</text>

          <text x="240" y="235" text-anchor="middle" font-size="11" fill="#475569">Nükleotid = Fosfat + Deoksiriboz Şekeri + Organik Azotlu Baz</text>
        </svg>`;
      }

      const bases = p.sequence.toUpperCase().split(/[^A-Z]/).filter(Boolean);
      const complement = { 'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G' };
      const colors = {
        'A': { bg: '#dbeafe', border: '#2563eb', text: '#1d4ed8' },
        'T': { bg: '#fee2e2', border: '#dc2626', text: '#b91c1c' },
        'G': { bg: '#dcfce7', border: '#16a34a', text: '#15803d' },
        'C': { bg: '#fef3c7', border: '#d97706', text: '#b45309' }
      };

      const startY = 70;
      const stepY = 44;
      const totalH = startY + bases.length * stepY + 40;

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 ${Math.max(320, totalH)}" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif;">
        <text x="230" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">DNA Çift Zincirli Yapısı</text>
        <text x="135" y="48" text-anchor="middle" font-size="11" font-weight="bold" fill="#64748b">1. Zincir</text>
        <text x="325" y="48" text-anchor="middle" font-size="11" font-weight="bold" fill="#64748b">2. Zincir</text>

        <line x1="80" y1="${startY - 10}" x2="80" y2="${startY + bases.length * stepY}" stroke="#94a3b8" stroke-width="6" stroke-linecap="round" />
        <line x1="380" y1="${startY - 10}" x2="380" y2="${startY + bases.length * stepY}" stroke="#94a3b8" stroke-width="6" stroke-linecap="round" />
      `;

      bases.forEach((b1, i) => {
        const b2 = complement[b1] || 'T';
        const y = startY + i * stepY;
        const c1 = colors[b1] || colors['A'];
        const c2 = colors[b2] || colors['T'];
        const isTriple = (b1 === 'G' || b1 === 'C');

        svg += `
          <rect x="100" y="${y - 14}" width="70" height="28" rx="5" fill="${c1.bg}" stroke="${c1.border}" stroke-width="2" />
          <text x="135" y="${y + 5}" text-anchor="middle" font-size="13" font-weight="bold" fill="${c1.text}">${b1}</text>
        `;

        if (isTriple) {
          svg += `
            <line x1="172" y1="${y - 6}" x2="288" y2="${y - 6}" stroke="#64748b" stroke-width="1.8" stroke-dasharray="3,3" />
            <line x1="172" y1="${y}" x2="288" y2="${y}" stroke="#64748b" stroke-width="1.8" stroke-dasharray="3,3" />
            <line x1="172" y1="${y + 6}" x2="288" y2="${y + 6}" stroke="#64748b" stroke-width="1.8" stroke-dasharray="3,3" />
          `;
        } else {
          svg += `
            <line x1="172" y1="${y - 4}" x2="288" y2="${y - 4}" stroke="#64748b" stroke-width="1.8" stroke-dasharray="3,3" />
            <line x1="172" y1="${y + 4}" x2="288" y2="${y + 4}" stroke="#64748b" stroke-width="1.8" stroke-dasharray="3,3" />
          `;
        }

        const isMasked = p.maskMode === 'mask_bases';
        const rightText = isMasked ? `[ ${i + 1} ]` : b2;
        const rBg = isMasked ? '#f1f5f9' : c2.bg;
        const rBorder = isMasked ? '#0f172a' : c2.border;
        const rTextCol = isMasked ? '#0f172a' : c2.text;

        svg += `
          <rect x="290" y="${y - 14}" width="70" height="28" rx="5" fill="${rBg}" stroke="${rBorder}" stroke-width="2" />
          <text x="325" y="${y + 5}" text-anchor="middle" font-size="13" font-weight="bold" fill="${rTextCol}">${rightText}</text>
        `;
      });

      svg += `</svg>`;
      return svg;
    }
  },

  foodPyramid: {
    id: 'foodPyramid',
    category: 'biyoloji',
    name: 'Besin Piramidi / Enerji Zinciri',
    tags: ['LGS', 'TYT', 'Ekoloji', 'Enerji Piramidi'],
    desc: 'Trofik düzeyler, üreticiden tepe tüketiciye biyokütle ve %10 enerji aktarım piramidi.',
    defaultParams: {
      levels: '4',
      tier1: 'Üreticiler (Bitkiler)',
      tier2: '1. Tüketiciler (Otçullar)',
      tier3: '2. Tüketiciler (Etçiller)',
      tier4: '3. Tüketiciler (Tepe Yırtıcı)',
      showDecomposer: true,
      showArrows: true
    },
    presets: [
      { name: 'LGS - Canlı İsimli Besin Piramidi', params: { levels: '4', tier1: 'Ot / Buğday', tier2: 'Çekirge', tier3: 'Kurbağa', tier4: 'Yılan / Kartal', showDecomposer: true } },
      { name: 'TYT - Enerji & Biyolojik Birikim Kuralları', params: { levels: '4', tier1: 'Üreticiler (10.000 J)', tier2: 'Otçullar (1.000 J)', tier3: 'Etçiller (100 J)', tier4: 'Tepe Tüketici (10 J)', showArrows: true } }
    ],
    schema: [
      { key: 'levels', label: 'Basamak Sayısı', type: 'select', options: [{ v: '3', l: '3 Basamak' }, { v: '4', l: '4 Basamak (Standart)' }, { v: '5', l: '5 Basamak' }] },
      { key: 'tier1', label: '1. Katman (En Alt - Üretici)', type: 'text' },
      { key: 'tier2', label: '2. Katman (1. Tüketici)', type: 'text' },
      { key: 'tier3', label: '3. Katman (2. Tüketici)', type: 'text' },
      { key: 'tier4', label: '4. Katman (Tepe Tüketici)', type: 'text' },
      { key: 'showDecomposer', label: 'Ayrıştırıcılar (Mantar/Bakteri) Kutusu', type: 'checkbox' },
      { key: 'showArrows', label: 'Biyolojik Birikim & Enerji Okları', type: 'checkbox' }
    ],
    renderSvg(p) {
      const n = parseInt(p.levels) || 4;
      const texts = [p.tier1, p.tier2, p.tier3, p.tier4, '4. Tüketiciler'];
      const tierColors = ['#86efac', '#fed7aa', '#fbcfe8', '#fca5a5', '#c4b5fd'];

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 360" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif;">
        <text x="250" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">Ekolojik Besin & Enerji Piramidi</text>
      `;

      const baseY = 320;
      const totalHeight = 250;
      const hPerTier = totalHeight / n;
      const centerX = 230;

      for (let i = 0; i < n; i++) {
        const yBottom = baseY - i * hPerTier;
        const yTop = yBottom - hPerTier;
        const wBottom = 340 * (1 - (i / n) * 0.75);
        const wTop = 340 * (1 - ((i + 1) / n) * 0.75);

        const x1 = centerX - wBottom / 2;
        const x2 = centerX + wBottom / 2;
        const x3 = centerX + wTop / 2;
        const x4 = centerX - wTop / 2;

        svg += `
          <polygon points="${x1},${yBottom} ${x2},${yBottom} ${x3},${yTop} ${x4},${yTop}" fill="${tierColors[i]}" stroke="#0f172a" stroke-width="2" />
          <text x="${centerX}" y="${(yBottom + yTop) / 2 + 5}" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">${escSvg(texts[i])}</text>
        `;
      }

      if (p.showDecomposer) {
        svg += `
          <g transform="translate(425, 70)">
            <rect x="0" y="0" width="95" height="250" rx="8" fill="#fef3c7" stroke="#d97706" stroke-width="2" />
            <text x="47" y="115" text-anchor="middle" font-size="12" font-weight="bold" fill="#b45309" transform="rotate(-90 47 115)">AYRIŞTIRICILAR</text>
            <text x="47" y="235" text-anchor="middle" font-size="10" fill="#78350f">(Mantar, Bakteri)</text>
            <line x1="-5" y1="50" x2="-25" y2="50" stroke="#d97706" stroke-width="1.8" stroke-dasharray="3,2" />
            <line x1="-5" y1="125" x2="-25" y2="125" stroke="#d97706" stroke-width="1.8" stroke-dasharray="3,2" />
            <line x1="-5" y1="200" x2="-25" y2="200" stroke="#d97706" stroke-width="1.8" stroke-dasharray="3,2" />
          </g>
        `;
      }

      if (p.showArrows) {
        svg += `
          <g transform="translate(30, 80)">
            <line x1="0" y1="230" x2="0" y2="10" stroke="#dc2626" stroke-width="2.5" />
            <polygon points="0,0 -4,12 4,12" fill="#dc2626" />
            <text x="12" y="70" font-size="10.5" font-weight="bold" fill="#dc2626" transform="rotate(-90 12 70)">▲ Biyolojik Birikim Artar</text>
            <text x="12" y="190" font-size="10.5" font-weight="bold" fill="#15803d" transform="rotate(-90 12 190)">▼ Aktarılan Enerji (%10) Azalır</text>
          </g>
        `;
      }

      svg += `</svg>`;
      return svg;
    }
  },

  mitosis: {
    id: 'mitosis',
    category: 'biyoloji',
    name: 'Hücre Bölünmesi (Mitoz Evreleri)',
    tags: ['TYT', 'LGS', 'Mitoz', 'Kromozom'],
    desc: 'Profaz, Metafaz (ekvatoral dizilme), Anafaz (kromatit ayrılması) ve Telofaz evreleri.',
    defaultParams: {
      phase: 'metaphase',
      chromosomeCount: '4'
    },
    presets: [
      { name: 'TYT - Metafaz (Ekvatorda Tek Sıra Dizilim)', params: { phase: 'metaphase', chromosomeCount: '4' } },
      { name: 'TYT - Anafaz (Kardeş Kromatitlerin Kutuplara Çekilmesi)', params: { phase: 'anaphase', chromosomeCount: '4' } },
      { name: 'LGS - Hücre Bölünmesi Sıralama Sorusu', params: { phase: 'metaphase' } }
    ],
    schema: [
      { key: 'phase', label: 'Bölünme Evresi', type: 'select', options: [{ v: 'prophase', l: 'Profaz' }, { v: 'metaphase', l: 'Metafaz (Ekvatorda Dizilim)' }, { v: 'anaphase', l: 'Anafaz (Kutuplara Çekilme)' }, { v: 'telophase', l: 'Telofaz / Sitokinez' }] }
    ],
    renderSvg(p) {
      const phaseTitles = { prophase: 'Profaz Evresi', metaphase: 'Metafaz Evresi (2n = 4)', anaphase: 'Anafaz Evresi', telophase: 'Telofaz ve Sitokinez' };
      const title = phaseTitles[p.phase] || 'Mitoz Bölünme';

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 340" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif;">
        <text x="250" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">${title}</text>
      `;

      if (p.phase === 'metaphase') {
        svg += `
          <ellipse cx="250" cy="175" rx="180" ry="135" fill="#f8fafc" stroke="#0284c7" stroke-width="2.5" />
          <line x1="80" y1="175" x2="420" y2="175" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4" />
          <text x="430" y="179" font-size="10" fill="#64748b">Ekvatoral Düzlem</text>

          <circle cx="250" cy="65" r="7" fill="#ea580c" />
          <circle cx="250" cy="285" r="7" fill="#ea580c" />
          <text x="250" y="52" text-anchor="middle" font-size="10" font-weight="bold" fill="#c2410c">Kutup</text>

          <g stroke="#cbd5e1" stroke-width="1.2">
            <line x1="250" y1="65" x2="160" y2="175" />
            <line x1="250" y1="65" x2="220" y2="175" />
            <line x1="250" y1="65" x2="280" y2="175" />
            <line x1="250" y1="65" x2="340" y2="175" />

            <line x1="250" y1="285" x2="160" y2="175" />
            <line x1="250" y1="285" x2="220" y2="175" />
            <line x1="250" y1="285" x2="280" y2="175" />
            <line x1="250" y1="285" x2="340" y2="175" />
          </g>

          ${[160, 220, 280, 340].map((x, idx) => {
            const color = idx % 2 === 0 ? '#ef4444' : '#3b82f6';
            return `
              <g transform="translate(${x}, 175)">
                <line x1="-10" y1="-18" x2="10" y2="18" stroke="${color}" stroke-width="5" stroke-linecap="round" />
                <line x1="10" y1="-18" x2="-10" y2="18" stroke="${color}" stroke-width="5" stroke-linecap="round" />
                <circle cx="0" cy="0" r="3.5" fill="#fef08a" stroke="#ca8a04" stroke-width="1" />
              </g>
            `;
          }).join('')}
        `;
      } else if (p.phase === 'anaphase') {
        svg += `
          <ellipse cx="250" cy="175" rx="160" ry="145" fill="#f8fafc" stroke="#0284c7" stroke-width="2.5" />
          <circle cx="250" cy="55" r="7" fill="#ea580c" />
          <circle cx="250" cy="295" r="7" fill="#ea580c" />
          
          ${[170, 220, 280, 330].map((x, idx) => {
            const color = idx % 2 === 0 ? '#ef4444' : '#3b82f6';
            return `
              <g transform="translate(${x}, 105)">
                <path d="M -9 14 Q 0 0 9 14" fill="none" stroke="${color}" stroke-width="4.5" stroke-linecap="round" />
                <circle cx="0" cy="2" r="3" fill="#fef08a" stroke="#ca8a04" />
                <line x1="0" y1="0" x2="${250 - x}" y2="-45" stroke="#cbd5e1" stroke-width="1.2" />
              </g>
            `;
          }).join('')}

          ${[170, 220, 280, 330].map((x, idx) => {
            const color = idx % 2 === 0 ? '#ef4444' : '#3b82f6';
            return `
              <g transform="translate(${x}, 245)">
                <path d="M -9 -14 Q 0 0 9 -14" fill="none" stroke="${color}" stroke-width="4.5" stroke-linecap="round" />
                <circle cx="0" cy="-2" r="3" fill="#fef08a" stroke="#ca8a04" />
                <line x1="0" y1="0" x2="${250 - x}" y2="45" stroke="#cbd5e1" stroke-width="1.2" />
              </g>
            `;
          }).join('')}
        `;
      } else {
        svg += `
          <circle cx="250" cy="175" r="130" fill="#f8fafc" stroke="#0284c7" stroke-width="2.5" />
          <circle cx="250" cy="175" r="75" fill="#fef2f2" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="5,4" />
          <text x="250" y="180" text-anchor="middle" font-size="12" font-style="italic" fill="#991b1b">Kromatin İplikler Kısalıp Kalınlaşır</text>
        `;
      }

      svg += `</svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // KİMYA ŞABLONLARI
  // --------------------------------------------------------------------------
  bohrAtom: {
    id: 'bohrAtom',
    category: 'kimya',
    name: 'Bohr Atom Modeli & Katman Dağılımı',
    tags: ['TYT', 'LGS', 'Atom', 'Periyodik Sistem', 'Katman'],
    desc: 'Elektron katman halkaları (2, 8, 8), çekirdek proton/nötron gösterimi ve değerlik elektronları.',
    defaultParams: {
      symbol: 'Na',
      electrons: '2, 8, 1',
      protons: '11',
      neutrons: '12',
      showNucleusDetail: true
    },
    presets: [
      { name: '11Na (Sodyum: 2, 8, 1) - 3. Periyot 1A', params: { symbol: 'Na', electrons: '2, 8, 1', protons: '11', neutrons: '12' } },
      { name: '17Cl (Klor: 2, 8, 7) - 3. Periyot 7A', params: { symbol: 'Cl', electrons: '2, 8, 7', protons: '17', neutrons: '18' } },
      { name: '6C (Karbon: 2, 4) - 2. Periyot 4A', params: { symbol: 'C', electrons: '2, 4', protons: '6', neutrons: '6' } }
    ],
    schema: [
      { key: 'symbol', label: 'Element Sembolü', type: 'text' },
      { key: 'electrons', label: 'Katman Elektron Dağılımı (Virgülle)', type: 'text', hint: 'Örn: 2, 8, 1' },
      { key: 'protons', label: 'Proton Sayısı (p+)', type: 'text' },
      { key: 'neutrons', label: 'Nötron Sayısı (n0)', type: 'text' },
      { key: 'showNucleusDetail', label: 'Çekirdekte p+ ve n0 Sayılarını Yaz', type: 'checkbox' }
    ],
    renderSvg(p) {
      const shells = p.electrons.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const radii = [52, 88, 124, 155];
      const centerX = 230;
      const centerY = 180;

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 370" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif;">
        <text x="250" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">Bohr Atom Modeli — Katman Elektron Dağılımı</text>
      `;

      shells.forEach((count, sIdx) => {
        const r = radii[sIdx] || (50 + sIdx * 35);
        svg += `<circle cx="${centerX}" cy="${centerY}" r="${r}" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="4,3" />`;

        for (let e = 0; e < count; e++) {
          const angle = (2 * Math.PI / count) * e - Math.PI / 2;
          const eX = centerX + r * Math.cos(angle);
          const eY = centerY + r * Math.sin(angle);
          const isValence = (sIdx === shells.length - 1);
          const eColor = isValence ? '#ea580c' : '#2563eb';

          svg += `<circle cx="${eX}" cy="${eY}" r="5" fill="${eColor}" stroke="#ffffff" stroke-width="1.2" />`;
        }
      });

      svg += `<circle cx="${centerX}" cy="${centerY}" r="28" fill="#fee2e2" stroke="#dc2626" stroke-width="2.5" />`;

      if (p.showNucleusDetail && p.protons) {
        svg += `
          <text x="${centerX}" y="${centerY - 4}" text-anchor="middle" font-size="10" font-weight="bold" fill="#991b1b">${p.protons}p⁺</text>
          <text x="${centerX}" y="${centerY + 12}" text-anchor="middle" font-size="9" fill="#7f1d1d">${p.neutrons || '0'}n⁰</text>
        `;
      } else {
        svg += `<text x="${centerX}" y="${centerY + 5}" text-anchor="middle" font-size="14" font-weight="bold" fill="#991b1b">${p.symbol}</text>`;
      }

      const distNotation = shells.join(' ) ');
      svg += `
        <g transform="translate(130, 335)">
          <rect x="0" y="0" width="240" height="28" rx="6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1" />
          <text x="120" y="19" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">${p.protons ? `_${p.protons}` : ''}${p.symbol} :  ) ${distNotation} )</text>
        </g>
      `;

      svg += `</svg>`;
      return svg;
    }
  },

  nuclideSymbol: {
    id: 'nuclideSymbol',
    category: 'kimya',
    name: 'Nükleon & İyon Gösterimi (X Sembolü)',
    tags: ['TYT', 'Kimya', 'İyon Yükü', 'Atom No', 'Kütle No'],
    desc: 'Kütle No (A), Atom No (Z), Nötron (n), İyon Yükü (q), Elektron (e) sınav şablonu.',
    defaultParams: {
      symbol: 'X',
      massNum: '35',
      neutronNum: '18',
      atomicNum: '17',
      charge: '-1',
      electrons: '18',
      showFormulas: true
    },
    presets: [
      { name: 'TYT - İyon Yükü ve Elektron Hesabı (Cl- Anyonu)', params: { symbol: 'Cl', massNum: '35', atomicNum: '17', charge: '-1', electrons: '18', neutronNum: '18' } },
      { name: 'TYT - Katyon Hesaplama (Al 3+ Katyonu)', params: { symbol: 'Al', massNum: '27', atomicNum: '13', charge: '+3', electrons: '10', neutronNum: '14' } },
      { name: 'TYT - Soru Kalıbı (? Bilinmeyenli Değerler)', params: { symbol: 'X', massNum: '40', atomicNum: '?', charge: '+2', electrons: '18', neutronNum: '20' } }
    ],
    schema: [
      { key: 'symbol', label: 'Element Sembolü', type: 'text' },
      { key: 'massNum', label: 'Kütle Numarası (Sol Üst)', type: 'text' },
      { key: 'neutronNum', label: 'Nötron Sayısı (Sol Orta)', type: 'text' },
      { key: 'atomicNum', label: 'Proton / Atom No (Sol Alt)', type: 'text' },
      { key: 'charge', label: 'İyon Yükü (Sağ Üst)', type: 'text' },
      { key: 'electrons', label: 'Elektron Sayısı (Sağ Alt)', type: 'text' },
      { key: 'showFormulas', label: 'Ters "U" İlişki Formülünü Göster', type: 'checkbox' }
    ],
    renderSvg(p) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 300" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif;">
        <text x="230" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">İyon ve Atom Tanecik Şeması</text>
        <text x="230" y="165" text-anchor="middle" font-size="88" font-weight="bold" fill="#0f172a">${escSvg(p.symbol)}</text>

        <g transform="translate(130, 95)">
          <rect x="-35" y="-22" width="70" height="34" rx="6" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.8" />
          <text x="0" y="2" text-anchor="middle" font-size="16" font-weight="bold" fill="#1d4ed8">${escSvg(p.massNum)}</text>
          <text x="0" y="24" text-anchor="middle" font-size="9" fill="#64748b">Kütle No (A)</text>
        </g>

        <g transform="translate(130, 155)">
          <rect x="-35" y="-18" width="70" height="30" rx="6" fill="#f8fafc" stroke="#64748b" stroke-width="1.5" />
          <text x="0" y="4" text-anchor="middle" font-size="15" font-weight="bold" fill="#334155">${escSvg(p.neutronNum)}</text>
          <text x="0" y="24" text-anchor="middle" font-size="9" fill="#64748b">Nötron (n)</text>
        </g>

        <g transform="translate(130, 215)">
          <rect x="-35" y="-18" width="70" height="34" rx="6" fill="#fef2f2" stroke="#ef4444" stroke-width="1.8" />
          <text x="0" y="5" text-anchor="middle" font-size="16" font-weight="bold" fill="#b91c1c">${escSvg(p.atomicNum)}</text>
          <text x="0" y="28" text-anchor="middle" font-size="9" fill="#64748b">Proton (Z)</text>
        </g>

        <g transform="translate(330, 95)">
          <rect x="-35" y="-22" width="70" height="34" rx="6" fill="#fefce8" stroke="#ca8a04" stroke-width="1.8" />
          <text x="0" y="2" text-anchor="middle" font-size="16" font-weight="bold" fill="#a16207">${escSvg(p.charge)}</text>
          <text x="0" y="24" text-anchor="middle" font-size="9" fill="#64748b">İyon Yükü (q)</text>
        </g>

        <g transform="translate(330, 215)">
          <rect x="-35" y="-18" width="70" height="34" rx="6" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.8" />
          <text x="0" y="5" text-anchor="middle" font-size="16" font-weight="bold" fill="#15803d">${escSvg(p.electrons)}</text>
          <text x="0" y="28" text-anchor="middle" font-size="9" fill="#64748b">Elektron (e⁻)</text>
        </g>

        ${p.showFormulas ? `
          <path d="M 330 185 Q 230 265 130 185" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,3" />
          <text x="230" y="278" text-anchor="middle" font-size="11" font-weight="bold" fill="#475569">Z = e + q  •  A = Z + n</text>
        ` : ''}
      </svg>`;
    }
  },

  periodicTable: {
    id: 'periodicTable',
    category: 'kimya',
    name: 'Periyodik Tablo Kesiti',
    tags: ['TYT', 'LGS', 'Periyot', 'Grup', 'Periyodik Özellikler'],
    desc: 'Gruplar (1A, 2A, 7A, 8A vb.) ve periyotlarda elementlerin bağıl konumları kesiti.',
    defaultParams: {
      cellX: '2, 1',
      elemX: 'X',
      cellY: '2, 7',
      elemY: 'Y',
      cellZ: '3, 1',
      elemZ: 'Z',
      cellT: '3, 8',
      elemT: 'T'
    },
    presets: [
      { name: 'TYT - Yarıçap & İyonlaşma Enerjisi Kıyaslama Kesiti', params: { cellX: '2, 1', elemX: 'X', cellY: '2, 7', elemY: 'Y', cellZ: '3, 1', elemZ: 'Z', cellT: '3, 8', elemT: 'T' } },
      { name: 'LGS - Periyodik Tabloda Yer Bulma', params: { cellX: '1, 1', elemX: 'H', cellY: '2, 8', elemY: 'Ne', cellZ: '3, 2', elemZ: 'Mg', cellT: '3, 7', elemT: 'Cl' } }
    ],
    schema: [
      { key: 'elemX', label: '1. Element Sembolü', type: 'text' },
      { key: 'cellX', label: '1. Element Konumu (Periyot, GrupNo)', type: 'text', hint: 'Örn: 2, 1' },
      { key: 'elemY', label: '2. Element Sembolü', type: 'text' },
      { key: 'cellY', label: '2. Element Konumu (Periyot, GrupNo)', type: 'text', hint: 'Örn: 2, 7' },
      { key: 'elemZ', label: '3. Element Sembolü', type: 'text' },
      { key: 'cellZ', label: '3. Element Konumu (Periyot, GrupNo)', type: 'text', hint: 'Örn: 3, 1' },
      { key: 'elemT', label: '4. Element Sembolü', type: 'text' },
      { key: 'cellT', label: '4. Element Konumu (Periyot, GrupNo)', type: 'text', hint: 'Örn: 3, 8' }
    ],
    renderSvg(p) {
      const groups = ['1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A'];
      const periods = ['1', '2', '3'];

      const cellMap = {};
      const addElem = (loc, sym) => {
        if (!loc || !sym) return;
        const [r, c] = loc.split(',').map(s => parseInt(s.trim()));
        if (r && c) cellMap[`${r}_${c}`] = sym;
      };
      addElem(p.cellX, p.elemX);
      addElem(p.cellY, p.elemY);
      addElem(p.cellZ, p.elemZ);
      addElem(p.cellT, p.elemT);

      const startX = 65;
      const startY = 75;
      const cellW = 46;
      const cellH = 46;

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 490 280" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif;">
        <text x="245" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">Periyodik Sistemden Bir Kesit</text>
      `;

      groups.forEach((g, cIdx) => {
        const x = startX + cIdx * cellW;
        svg += `<text x="${x + cellW / 2}" y="62" text-anchor="middle" font-size="11" font-weight="bold" fill="#64748b">${g}</text>`;
      });

      periods.forEach((pr, rIdx) => {
        const y = startY + rIdx * cellH;
        svg += `<text x="44" y="${y + cellH / 2 + 4}" text-anchor="middle" font-size="11" font-weight="bold" fill="#64748b">${pr}.P</text>`;
      });

      periods.forEach((pr, rIdx) => {
        const r = rIdx + 1;
        groups.forEach((g, cIdx) => {
          const c = cIdx + 1;
          const x = startX + cIdx * cellW;
          const y = startY + rIdx * cellH;
          const elem = cellMap[`${r}_${c}`];

          const isEmptyHole = (r === 1 && c > 1 && c < 8);
          if (isEmptyHole) return;

          const isFilled = Boolean(elem);
          const bg = isFilled ? '#e0f2fe' : '#ffffff';
          const stroke = isFilled ? '#0284c7' : '#cbd5e1';
          const strokeW = isFilled ? 2 : 1;

          svg += `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" fill="${bg}" stroke="${stroke}" stroke-width="${strokeW}" />`;
          if (elem) {
            svg += `<text x="${x + cellW / 2}" y="${y + cellH / 2 + 6}" text-anchor="middle" font-size="16" font-weight="bold" fill="#0369a1">${escSvg(elem)}</text>`;
          }
        });
      });

      svg += `
        <g transform="translate(65, 245)">
          <line x1="0" y1="0" x2="368" y2="0" stroke="#0f172a" stroke-width="1.8" />
          <polygon points="368,0 358,-4 358,4" fill="#0f172a" />
          <text x="184" y="16" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#0f172a">Aynı periyotta sağa doğru: İyonlaşma enerjisi artar, yarıçap azalır</text>
        </g>
      `;

      svg += `</svg>`;
      return svg;
    }
  },

  labApparatus: {
    id: 'labApparatus',
    category: 'kimya',
    name: 'Kimya Deney Düzeneği (Isıtma & Ayırma)',
    tags: ['TYT', 'LGS', 'Deney', 'Ayırma Hunisi', 'Beher'],
    desc: 'Beher + İspirto Ocağı + Termometre veya Ayırma Hunisi (iki fazlı karışım).',
    defaultParams: {
      type: 'heating',
      liquidColor: '#38bdf8',
      tempValue: '78 °C',
      liquidLabel1: 'Saf Su / Etil Alkol',
      liquidLabel2: 'Zeytinyağı (Üst Faz)'
    },
    presets: [
      { name: 'TYT - Kaynama Noktası Tespiti (Termometreli Isıtma)', params: { type: 'heating', tempValue: '78 °C', liquidLabel1: 'Etil Alkol' } },
      { name: 'TYT - Ayırma Hunisi (Heterojen Sıvı-Sıvı Fazları)', params: { type: 'funnel', liquidLabel1: 'Su (d = 1 g/cm³)', liquidLabel2: 'Zeytinyağı (d = 0.9 g/cm³)' } }
    ],
    schema: [
      { key: 'type', label: 'Düzenek Türü', type: 'select', options: [{ v: 'heating', l: 'Isıtma Düzeneği (Beher, Ocak, Termometre)' }, { v: 'funnel', l: 'Ayırma Hunisi (İki Fazlı Sıvı Karışımı)' }] },
      { key: 'liquidLabel1', label: '1. Sıvı / Alt Faz Etiketi', type: 'text' },
      { key: 'liquidLabel2', label: '2. Sıvı (Ayırma Hunisi İçin)', type: 'text' },
      { key: 'tempValue', label: 'Termometre Değeri (Isıtmada)', type: 'text' }
    ],
    renderSvg(p) {
      if (p.type === 'funnel') {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 360" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif;">
          <text x="230" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">Ayırma Hunisi ile Yoğunluk Farkından Ayırma</text>

          <line x1="120" y1="50" x2="120" y2="330" stroke="#475569" stroke-width="6" stroke-linecap="round" />
          <rect x="70" y="325" width="100" height="15" fill="#334155" rx="3" />
          <line x1="120" y1="120" x2="190" y2="120" stroke="#475569" stroke-width="4" />

          <rect x="215" y="55" width="30" height="15" fill="#e2e8f0" stroke="#0f172a" stroke-width="2" rx="2" />
          <path d="M 215 70 C 170 100 170 180 220 220 L 220 270 L 240 270 L 240 220 C 290 180 290 100 245 70 Z" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" />
          
          <path d="M 185 130 C 180 150 195 175 230 175 C 265 175 280 150 275 130 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5" />
          <path d="M 195 175 C 210 205 220 220 220 240 L 240 240 C 240 220 250 205 265 175 Z" fill="#93c5fd" stroke="#2563eb" stroke-width="1.5" />

          <rect x="210" y="245" width="40" height="8" rx="2" fill="#dc2626" stroke="#0f172a" stroke-width="1.5" />
          <polygon points="200,325 260,325 245,290 215,290" fill="#eff6ff" stroke="#0f172a" stroke-width="2" />

          <g font-size="11" font-weight="bold">
            <line x1="275" y1="145" x2="330" y2="145" stroke="#0f172a" stroke-width="1.5" />
            <text x="335" y="149" fill="#a16207">${escSvg(p.liquidLabel2)}</text>
            <line x1="260" y1="200" x2="330" y2="200" stroke="#0f172a" stroke-width="1.5" />
            <text x="335" y="204" fill="#1d4ed8">${escSvg(p.liquidLabel1)}</text>
          </g>
        </svg>`;
      }

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 360" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif;">
        <text x="230" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">Sıvı Isıtma & Kaynama Noktası Deneyi</text>

        <line x1="80" y1="330" x2="380" y2="330" stroke="#64748b" stroke-width="2" />

        <line x1="170" y1="230" x2="150" y2="330" stroke="#334155" stroke-width="4" stroke-linecap="round" />
        <line x1="290" y1="230" x2="310" y2="330" stroke="#334155" stroke-width="4" stroke-linecap="round" />
        <line x1="160" y1="230" x2="300" y2="230" stroke="#334155" stroke-width="5" />
        <line x1="165" y1="228" x2="295" y2="228" stroke="#94a3b8" stroke-width="3" stroke-dasharray="4,2" />

        <rect x="205" y="275" width="50" height="45" rx="8" fill="#e2e8f0" stroke="#475569" stroke-width="2" />
        <line x1="230" y1="275" x2="230" y2="265" stroke="#cbd5e1" stroke-width="4" />
        <path d="M 230 265 Q 220 245 230 235 Q 240 245 230 265 Z" fill="#f97316" stroke="#dc2626" stroke-width="1.5" />
        <path d="M 230 260 Q 225 248 230 242 Q 235 248 230 260 Z" fill="#fef08a" />

        <path d="M 180 130 L 180 222 Q 180 226 185 226 L 275 226 Q 280 226 280 222 L 280 130" fill="none" stroke="#0f172a" stroke-width="2.5" />
        <rect x="175" y="126" width="110" height="5" rx="2" fill="#cbd5e1" />
        
        <path d="M 182 170 Q 230 173 278 170 L 278 224 L 182 224 Z" fill="${p.liquidColor}" opacity="0.65" />
        <circle cx="210" cy="190" r="3" fill="#ffffff" opacity="0.7" />
        <circle cx="245" cy="180" r="4" fill="#ffffff" opacity="0.7" />
        <circle cx="230" cy="205" r="2.5" fill="#ffffff" opacity="0.7" />

        <rect x="226" y="70" width="8" height="135" rx="4" fill="#f8fafc" stroke="#dc2626" stroke-width="1.8" />
        <circle cx="230" cy="202" r="7" fill="#ef4444" />
        <line x1="230" y1="200" x2="230" y2="105" stroke="#ef4444" stroke-width="3" />

        <g transform="translate(242, 85)">
          <rect x="0" y="-12" width="65" height="24" rx="4" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5" />
          <text x="32" y="4" text-anchor="middle" font-size="11" font-weight="bold" fill="#b91c1c">${escSvg(p.tempValue)}</text>
        </g>

        <text x="300" y="195" font-size="12" font-weight="bold" fill="#0f172a">${escSvg(p.liquidLabel1)}</text>
        <line x1="295" y1="192" x2="260" y2="192" stroke="#0f172a" stroke-width="1.5" />
      </svg>`;
    }
  },

  phScale: {
    id: 'phScale',
    category: 'kimya',
    name: 'pH Skalası & Asit-Baz İndikatörleri',
    tags: ['LGS', 'TYT', 'Asitler', 'Bazlar', 'pH'],
    desc: '0-14 renk skalası, asidik/nötr/bazik bölgeler ve çözelti işaretçileri.',
    defaultParams: {
      marker1Val: '2.5',
      marker1Name: 'X (Limon Suyu)',
      marker2Val: '7.0',
      marker2Name: 'Y (Saf Su)',
      marker3Val: '11.5',
      marker3Name: 'Z (Çamaşır Suyu)'
    },
    presets: [
      { name: 'LGS - X, Y, Z Maddeleri Asitlik Kıyaslama', params: { marker1Val: '3.0', marker1Name: 'X çözeltisi', marker2Val: '7.0', marker2Name: 'Y çözeltisi', marker3Val: '12.0', marker3Name: 'Z çözeltisi' } },
      { name: 'TYT - Günlük Hayat Maddeleri (Mide Asidi - Sabun)', params: { marker1Val: '1.5', marker1Name: 'Mide Özsuyu', marker2Val: '7.4', marker2Name: 'Kan', marker3Val: '10.0', marker3Name: 'Sabunlu Su' } }
    ],
    schema: [
      { key: 'marker1Name', label: '1. Madde Adı', type: 'text' },
      { key: 'marker1Val', label: '1. Madde pH (0-14)', type: 'text' },
      { key: 'marker2Name', label: '2. Madde Adı', type: 'text' },
      { key: 'marker2Val', label: '2. Madde pH (0-14)', type: 'text' },
      { key: 'marker3Name', label: '3. Madde Adı', type: 'text' },
      { key: 'marker3Val', label: '3. Madde pH (0-14)', type: 'text' }
    ],
    renderSvg(p) {
      const startX = 50;
      const endX = 450;
      const barY = 140;
      const barW = endX - startX;
      const barH = 32;

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 290" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif;">
        <defs>
          <linearGradient id="phGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ef4444" />
            <stop offset="25%" stop-color="#f97316" />
            <stop offset="50%" stop-color="#22c55e" />
            <stop offset="75%" stop-color="#0284c7" />
            <stop offset="100%" stop-color="#7c3aed" />
          </linearGradient>
        </defs>
        <text x="250" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">pH Skalası (Asitlik - Bazlık Derecesi)</text>

        <rect x="${startX}" y="${barY}" width="${barW}" height="${barH}" rx="6" fill="url(#phGrad)" stroke="#0f172a" stroke-width="2" />

        ${Array.from({ length: 15 }).map((_, i) => {
          const x = startX + (barW / 14) * i;
          return `
            <line x1="${x}" y1="${barY + barH}" x2="${x}" y2="${barY + barH + 6}" stroke="#0f172a" stroke-width="1.5" />
            <text x="${x}" y="${barY + barH + 20}" text-anchor="middle" font-size="11" font-weight="bold" fill="#334155">${i}</text>
          `;
        }).join('')}

        <text x="${startX + 70}" y="${barY - 14}" text-anchor="middle" font-size="12" font-weight="bold" fill="#dc2626">ASİDİK (0 - 7)</text>
        <text x="${startX + barW / 2}" y="${barY - 14}" text-anchor="middle" font-size="12" font-weight="bold" fill="#15803d">NÖTR (7)</text>
        <text x="${endX - 70}" y="${barY - 14}" text-anchor="middle" font-size="12" font-weight="bold" fill="#6d28d9">BAZİK (7 - 14)</text>
      `;

      const markers = [
        { name: p.marker1Name, val: parseFloat(p.marker1Val), color: '#b91c1c' },
        { name: p.marker2Name, val: parseFloat(p.marker2Val), color: '#15803d' },
        { name: p.marker3Name, val: parseFloat(p.marker3Val), color: '#6d28d9' }
      ].filter(m => !isNaN(m.val) && m.name);

      markers.forEach((m, idx) => {
        const clamped = Math.max(0, Math.min(14, m.val));
        const mX = startX + (barW / 14) * clamped;
        const yTop = 60 + (idx % 2 === 0 ? 0 : 25);

        svg += `
          <g>
            <line x1="${mX}" y1="${yTop + 20}" x2="${mX}" y2="${barY}" stroke="${m.color}" stroke-width="2" />
            <polygon points="${mX},${barY} ${mX - 4},${barY - 8} ${mX + 4},${barY - 8}" fill="${m.color}" />
            <rect x="${mX - 45}" y="${yTop}" width="90" height="20" rx="4" fill="#ffffff" stroke="${m.color}" stroke-width="1.5" />
            <text x="${mX}" y="${yTop + 14}" text-anchor="middle" font-size="10" font-weight="bold" fill="${m.color}">${escSvg(m.name)} (${m.val})</text>
          </g>
        `;
      });

      svg += `</svg>`;
      return svg;
    }
  },

  lewisDot: {
    id: 'lewisDot',
    category: 'kimya',
    name: 'Lewis Nokta Yapısı & Kimyasal Bağlar',
    tags: ['TYT', 'Kimya', 'Lewis', 'Kovalent Bağ', 'İyonik Bağ'],
    desc: 'H2O, NH3, CH4, CO2, NaCl molekülleri, bağlayıcı ve ortaklanmamış elektron çiftleri.',
    defaultParams: {
      molecule: 'H2O',
      showLonePairs: true,
      highlightBonds: true
    },
    presets: [
      { name: 'TYT - H2O Lewis Yapısı (2 Bağ, 2 Ortaklanmamış Çift)', params: { molecule: 'H2O', showLonePairs: true, highlightBonds: true } },
      { name: 'TYT - CO2 Lewis Yapısı (Çift Bağlar: O=C=O)', params: { molecule: 'CO2', showLonePairs: true, highlightBonds: true } },
      { name: 'TYT - NH3 Lewis Yapısı (3 Bağ, 1 Ortaklanmamış Çift)', params: { molecule: 'NH3', showLonePairs: true, highlightBonds: true } },
      { name: 'TYT - İyonik Bağ Lewis Gösterimi ([Na]+ [:Cl:]-)', params: { molecule: 'NaCl', showLonePairs: true } }
    ],
    schema: [
      { key: 'molecule', label: 'Molekül / Bileşik Seçimi', type: 'select', options: [
        { v: 'H2O', l: 'Su (H₂O) — Kırık Doğru' },
        { v: 'CO2', l: 'Karbondioksit (CO₂) — Doğrusal (Çift Bağ)' },
        { v: 'NH3', l: 'Amonyak (NH₃) — Üçgen Piramit' },
        { v: 'CH4', l: 'Metan (CH₄) — Düzgün Dörtyüzlü' },
        { v: 'NaCl', l: 'Sodyum Klorür (NaCl) — İyonik Gösterim' },
        { v: 'N2', l: 'Azot Gazı (N₂) — Üçlü Kovalent Bağ' }
      ]},
      { key: 'showLonePairs', label: 'Ortaklanmamış Değerlik Elektron Çiftlerini Göster', type: 'checkbox' },
      { key: 'highlightBonds', label: 'Bağlayıcı Çiftleri (Çizgi) Göster', type: 'checkbox' }
    ],
    renderSvg(p) {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif;">
        <text x="240" y="26" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">Lewis Nokta Yapısı ve Kimyasal Türler</text>
      `;

      const dotPair = (x1, y1, x2, y2) => {
        if (!p.showLonePairs) return '';
        return `<circle cx="${x1}" cy="${y1}" r="3" fill="#dc2626" /><circle cx="${x2}" cy="${y2}" r="3" fill="#dc2626" />`;
      };

      if (p.molecule === 'CO2') {
        // O = C = O
        svg += `
          <!-- Merkez C -->
          <text x="240" y="158" text-anchor="middle" font-size="34" font-weight="bold" fill="#0f172a">C</text>
          <!-- Sol O -->
          <text x="140" y="158" text-anchor="middle" font-size="34" font-weight="bold" fill="#0f172a">O</text>
          <!-- Sağ O -->
          <text x="340" y="158" text-anchor="middle" font-size="34" font-weight="bold" fill="#0f172a">O</text>
          <!-- Çift Bağlar (Sol ve Sağ) -->
          <line x1="165" y1="142" x2="215" y2="142" stroke="#2563eb" stroke-width="3.5" />
          <line x1="165" y1="154" x2="215" y2="154" stroke="#2563eb" stroke-width="3.5" />
          <line x1="265" y1="142" x2="315" y2="142" stroke="#2563eb" stroke-width="3.5" />
          <line x1="265" y1="154" x2="315" y2="154" stroke="#2563eb" stroke-width="3.5" />
          <!-- O üstü ortaklanmamış çiftler -->
          ${dotPair(130, 115, 150, 115)}
          ${dotPair(130, 178, 150, 178)}
          ${dotPair(330, 115, 350, 115)}
          ${dotPair(330, 178, 350, 178)}

          <text x="240" y="245" text-anchor="middle" font-size="11" font-weight="bold" fill="#475569">4 Bağlayıcı Çift (2 Çiftli Bağ) • 4 Ortaklanmamış Elektron Çifti</text>
        `;
      } else if (p.molecule === 'NH3') {
        // N merkezli üçgen piramit
        svg += `
          <text x="240" y="145" text-anchor="middle" font-size="34" font-weight="bold" fill="#0f172a">N</text>
          <text x="160" y="210" text-anchor="middle" font-size="28" font-weight="bold" fill="#0f172a">H</text>
          <text x="240" y="235" text-anchor="middle" font-size="28" font-weight="bold" fill="#0f172a">H</text>
          <text x="320" y="210" text-anchor="middle" font-size="28" font-weight="bold" fill="#0f172a">H</text>
          <!-- Bağlar -->
          <line x1="225" y1="155" x2="175" y2="195" stroke="#2563eb" stroke-width="3" />
          <line x1="240" y1="160" x2="240" y2="208" stroke="#2563eb" stroke-width="3" />
          <line x1="255" y1="155" x2="305" y2="195" stroke="#2563eb" stroke-width="3" />
          <!-- N Tepesindeki Ortaklanmamış Çift -->
          ${dotPair(233, 105, 247, 105)}
          <text x="240" y="270" text-anchor="middle" font-size="11" font-weight="bold" fill="#475569">3 Bağlayıcı Çift • 1 Ortaklanmamış Elektron Çifti</text>
        `;
      } else if (p.molecule === 'NaCl') {
        // [Na]+ [ :Cl: ]-
        svg += `
          <!-- Na Katyonu -->
          <text x="150" y="158" text-anchor="middle" font-size="36" font-weight="bold" fill="#0f172a">[ Na ]</text>
          <text x="195" y="125" font-size="22" font-weight="bold" fill="#ea580c">⁺</text>
          <!-- Cl Anyonu -->
          <text x="290" y="158" text-anchor="middle" font-size="36" font-weight="bold" fill="#0f172a">[ : Cl : ]</text>
          <text x="350" y="125" font-size="22" font-weight="bold" fill="#ea580c">⁻</text>
          <!-- Cl etrafındaki 8 elektron -->
          ${dotPair(290, 115, 305, 115)}
          ${dotPair(290, 178, 305, 178)}
          <text x="240" y="245" text-anchor="middle" font-size="11" font-weight="bold" fill="#475569">İyonik Bağ: Elektron Alışverişi Sonucu Oluşan Elektrostatik Çekim</text>
        `;
      } else {
        // H2O Varsayılan (Kırık doğru)
        svg += `
          <text x="240" y="145" text-anchor="middle" font-size="36" font-weight="bold" fill="#0f172a">O</text>
          <text x="165" y="205" text-anchor="middle" font-size="28" font-weight="bold" fill="#0f172a">H</text>
          <text x="315" y="205" text-anchor="middle" font-size="28" font-weight="bold" fill="#0f172a">H</text>
          <!-- Bağlar -->
          <line x1="225" y1="150" x2="180" y2="188" stroke="#2563eb" stroke-width="3" />
          <line x1="255" y1="150" x2="300" y2="188" stroke="#2563eb" stroke-width="3" />
          <!-- Oksijen Üstü 2 Çift Ortaklanmamış Elektron -->
          ${dotPair(215, 100, 228, 92)}
          ${dotPair(252, 92, 265, 100)}
          <text x="240" y="255" text-anchor="middle" font-size="11" font-weight="bold" fill="#475569">2 Bağlayıcı Elektron Çifti • 2 Ortaklanmamış Elektron Çifti</text>
        `;
      }

      svg += `</svg>`;
      return svg;
    }
  },

  // --------------------------------------------------------------------------
  // FİZİK ŞABLONLARI
  // --------------------------------------------------------------------------
  simpleMachines: {
    id: 'simpleMachines',
    category: 'fizik',
    name: 'Makaralar & Basit Makineler',
    tags: ['LGS', 'TYT', 'Basit Makineler', 'Makara', 'Palanga', 'Eğik Düzlem'],
    desc: 'Sabit makara, hareketli makara, palanga, kaldıraç veya eğik düzlem şablonu.',
    defaultParams: {
      type: 'movable',
      loadVal: '60 N',
      forceVal: '30 N'
    },
    presets: [
      { name: 'LGS - Hareketli Makara (Kuvvetten 2 Kat Kazanç: F = G/2)', params: { type: 'movable', loadVal: '60 N', forceVal: '30 N' } },
      { name: 'LGS - Sabit Makara (Kuvvetin Yönü Değişir: F = G)', params: { type: 'fixed', loadVal: '40 N', forceVal: '40 N' } },
      { name: 'LGS/TYT - Eğik Düzlem (h ve L hipotenüs)', params: { type: 'inclined', loadVal: 'P', forceVal: 'F' } }
    ],
    schema: [
      { key: 'type', label: 'Makine Türü', type: 'select', options: [{ v: 'movable', l: 'Hareketli Makara (F = G / 2)' }, { v: 'fixed', l: 'Sabit Makara (F = G)' }, { v: 'inclined', l: 'Eğik Düzlem' }] },
      { key: 'loadVal', label: 'Yük Değeri (G)', type: 'text', hint: 'Örn: 60 N' },
      { key: 'forceVal', label: 'Kuvvet Değeri (F)', type: 'text', hint: 'Örn: 30 N veya ?' }
    ],
    renderSvg(p) {
      if (p.type === 'fixed') {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 360" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif;">
          <text x="230" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">Sabit Makara Sistemi (F = G)</text>

          <line x1="130" y1="50" x2="330" y2="50" stroke="#0f172a" stroke-width="4" />
          ${Array.from({ length: 11 }).map((_, i) => `<line x1="${140 + i * 18}" y1="50" x2="${150 + i * 18}" y2="38" stroke="#0f172a" stroke-width="2" />`).join('')}

          <line x1="230" y1="50" x2="230" y2="100" stroke="#475569" stroke-width="5" />
          <circle cx="230" cy="120" r="35" fill="#f1f5f9" stroke="#0f172a" stroke-width="3" />
          <circle cx="230" cy="120" r="8" fill="#475569" />

          <line x1="195" y1="120" x2="195" y2="240" stroke="#0f172a" stroke-width="2.5" />
          <rect x="170" y="240" width="50" height="45" rx="6" fill="#fed7aa" stroke="#ea580c" stroke-width="2" />
          <text x="195" y="268" text-anchor="middle" font-size="13" font-weight="bold" fill="#9a3412">${escSvg(p.loadVal)}</text>
          <text x="195" y="305" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f172a">Yük (G)</text>

          <line x1="265" y1="120" x2="265" y2="230" stroke="#0f172a" stroke-width="2.5" />
          <polygon points="265,245 259,230 271,230" fill="#dc2626" />
          <text x="300" y="242" font-size="13" font-weight="bold" fill="#dc2626">F = ${escSvg(p.forceVal)}</text>
        </svg>`;
      }

      if (p.type === 'inclined') {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 490 320" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif;">
          <text x="245" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">Eğik Düzlem (Kuvvet Kazancı)</text>

          <polygon points="80,260 400,260 400,100" fill="#f8fafc" stroke="#0f172a" stroke-width="3" />
          <path d="M 120 260 A 40 40 0 0 0 115 240" fill="none" stroke="#dc2626" stroke-width="2" />
          <text x="135" y="252" font-size="12" font-weight="bold" fill="#dc2626">α</text>

          <line x1="415" y1="100" x2="415" y2="260" stroke="#64748b" stroke-width="1.8" />
          <line x1="410" y1="100" x2="420" y2="100" stroke="#64748b" stroke-width="1.8" />
          <line x1="410" y1="260" x2="420" y2="260" stroke="#64748b" stroke-width="1.8" />
          <text x="435" y="185" font-size="12" font-weight="bold" fill="#475569">h</text>

          <text x="220" y="150" font-size="12" font-weight="bold" fill="#475569" transform="rotate(-26 220 150)">Uzunluk (L)</text>

          <g transform="translate(240, 180) rotate(-26.5)">
            <rect x="-25" y="-35" width="50" height="35" rx="4" fill="#fed7aa" stroke="#ea580c" stroke-width="2" />
            <text x="0" y="-13" text-anchor="middle" font-size="12" font-weight="bold" fill="#9a3412">${escSvg(p.loadVal)}</text>
            
            <line x1="25" y1="-18" x2="65" y2="-18" stroke="#dc2626" stroke-width="2.5" />
            <polygon points="75,-18 63,-23 63,-13" fill="#dc2626" />
            <text x="85" y="-14" font-size="12" font-weight="bold" fill="#dc2626">F = ${escSvg(p.forceVal)}</text>
          </g>

          <text x="245" y="300" text-anchor="middle" font-size="11" fill="#64748b">Kuvvet Kazancı: F · L = G · h</text>
        </svg>`;
      }

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 360" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif;">
        <text x="230" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">Hareketli Makara Sistemi (F = G / 2)</text>

        <line x1="130" y1="50" x2="330" y2="50" stroke="#0f172a" stroke-width="4" />
        ${Array.from({ length: 11 }).map((_, i) => `<line x1="${140 + i * 18}" y1="50" x2="${150 + i * 18}" y2="38" stroke="#0f172a" stroke-width="2" />`).join('')}

        <circle cx="195" cy="54" r="4" fill="#0f172a" />
        <line x1="195" y1="54" x2="195" y2="180" stroke="#0f172a" stroke-width="2.5" />

        <path d="M 195 180 A 35 35 0 0 0 265 180" fill="none" stroke="#0f172a" stroke-width="2.5" />
        <circle cx="230" cy="180" r="35" fill="#f1f5f9" stroke="#0f172a" stroke-width="3" />
        <circle cx="230" cy="180" r="8" fill="#475569" />

        <line x1="230" y1="188" x2="230" y2="240" stroke="#0f172a" stroke-width="3" />
        <rect x="205" y="240" width="50" height="45" rx="6" fill="#fed7aa" stroke="#ea580c" stroke-width="2" />
        <text x="230" y="268" text-anchor="middle" font-size="13" font-weight="bold" fill="#9a3412">${escSvg(p.loadVal)}</text>
        <text x="230" y="305" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f172a">Yük (G)</text>

        <line x1="265" y1="180" x2="265" y2="75" stroke="#0f172a" stroke-width="2.5" />
        <polygon points="265,60 259,75 271,75" fill="#dc2626" />
        <text x="290" y="72" font-size="13" font-weight="bold" fill="#dc2626">F = ${escSvg(p.forceVal)}</text>
      </svg>`;
    }
  },

  opticsRay: {
    id: 'opticsRay',
    category: 'fizik',
    name: 'Optik: Işığın Kırılması & Aynalar',
    tags: ['TYT', 'Optik', 'Kırılma', 'Snell', 'Yansıma'],
    desc: 'Az yoğundan çok yoğuna normale yaklaşma, sınır açısı veya düzlem ayna yansıması.',
    defaultParams: {
      scenario: 'dense',
      angle1: '50°',
      angle2: '30°',
      medium1: 'n₁ (Hava / Az Yoğun)',
      medium2: 'n₂ (Cam / Çok Yoğun)'
    },
    presets: [
      { name: 'TYT - Az Yoğundan Çok Yoğuna (Normale Yaklaşma)', params: { scenario: 'dense', angle1: '50°', angle2: '30°', medium1: 'Hava (n₁)', medium2: 'Cam (n₂ > n₁)' } },
      { name: 'TYT - Tam Yansıma & Sınır Açısı Sorusu', params: { scenario: 'rare', angle1: '42°', angle2: '90°', medium1: 'Su (n₁)', medium2: 'Hava (n₂ < n₁)' } },
      { name: 'TYT - Düzlem Aynada Yansıma Kanunu (θg = θy)', params: { scenario: 'mirror', angle1: '40°', angle2: '40°' } }
    ],
    schema: [
      { key: 'scenario', label: 'Optik Olayı', type: 'select', options: [{ v: 'dense', l: 'Az Yoğundan Çok Yoğuna (Normale Yaklaşma)' }, { v: 'rare', l: 'Çok Yoğundan Az Yoğuna (Normalden Uzaklaşma / Sınır Açısı)' }, { v: 'mirror', l: 'Düzlem Aynada Yansıma' }] },
      { key: 'medium1', label: '1. Ortam İsmi', type: 'text' },
      { key: 'medium2', label: '2. Ortam İsmi', type: 'text' },
      { key: 'angle1', label: 'Gelme Açısı (α)', type: 'text' },
      { key: 'angle2', label: 'Kırılma / Yansıma Açısı (β)', type: 'text' }
    ],
    renderSvg(p) {
      if (p.scenario === 'mirror') {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 300" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif;">
          <text x="230" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">Düzlem Aynada Yansıma (θ_gelen = θ_yansıyan)</text>

          <line x1="60" y1="220" x2="400" y2="220" stroke="#0f172a" stroke-width="3" />
          ${Array.from({ length: 17 }).map((_, i) => `<line x1="${70 + i * 20}" y1="220" x2="${60 + i * 20}" y2="232" stroke="#64748b" stroke-width="1.8" />`).join('')}

          <line x1="230" y1="60" x2="230" y2="220" stroke="#64748b" stroke-width="1.8" stroke-dasharray="5,4" />
          <text x="230" y="50" text-anchor="middle" font-size="11" font-weight="bold" fill="#64748b">Normal (N)</text>

          <line x1="110" y1="100" x2="230" y2="220" stroke="#2563eb" stroke-width="2.5" />
          <polygon points="175,165 163,161 171,153" fill="#2563eb" />
          <text x="100" y="90" font-size="11" font-weight="bold" fill="#2563eb">Gelen Işın</text>

          <line x1="230" y1="220" x2="350" y2="100" stroke="#16a34a" stroke-width="2.5" />
          <polygon points="295,155 303,167 291,167" fill="#16a34a" />
          <text x="350" y="90" font-size="11" font-weight="bold" fill="#16a34a">Yansıyan Işın</text>

          <path d="M 215 170 A 40 40 0 0 1 230 160" fill="none" stroke="#2563eb" stroke-width="1.8" />
          <text x="210" y="150" font-size="11" font-weight="bold" fill="#2563eb">${escSvg(p.angle1)}</text>

          <path d="M 230 160 A 40 40 0 0 1 245 170" fill="none" stroke="#16a34a" stroke-width="1.8" />
          <text x="250" y="150" font-size="11" font-weight="bold" fill="#16a34a">${escSvg(p.angle2)}</text>
        </svg>`;
      }

      const isDense = p.scenario === 'dense';
      const kX = isDense ? 280 : 330;

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 340" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif;">
        <text x="230" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">Işığın Kırılması (Snell Yasası: n₁ · sin α = n₂ · sin β)</text>

        <line x1="50" y1="170" x2="410" y2="170" stroke="#0f172a" stroke-width="2.5" />
        <rect x="50" y="45" width="360" height="125" fill="#f8fafc" />
        <rect x="50" y="170" width="360" height="135" fill="${isDense ? '#dbeafe' : '#f1f5f9'}" />

        <text x="70" y="75" font-size="12" font-weight="bold" fill="#1e3a8a">${escSvg(p.medium1)}</text>
        <text x="70" y="200" font-size="12" font-weight="bold" fill="#1e3a8a">${escSvg(p.medium2)}</text>

        <line x1="230" y1="55" x2="230" y2="295" stroke="#64748b" stroke-width="1.8" stroke-dasharray="5,4" />
        <text x="230" y="50" text-anchor="middle" font-size="11" font-weight="bold" fill="#64748b">Normal (N)</text>

        <line x1="120" y1="80" x2="230" y2="170" stroke="#2563eb" stroke-width="2.5" />
        <polygon points="180,129 168,126 177,117" fill="#2563eb" />
        
        <line x1="230" y1="170" x2="${kX}" y2="280" stroke="#16a34a" stroke-width="2.5" />
        <polygon points="${(230 + kX) / 2},225 ${(230 + kX) / 2 - 8},215 ${(230 + kX) / 2 + 4},215" fill="#16a34a" />

        <path d="M 205 140 A 35 35 0 0 1 230 135" fill="none" stroke="#2563eb" stroke-width="1.8" />
        <text x="210" y="125" font-size="11" font-weight="bold" fill="#2563eb">${escSvg(p.angle1)}</text>

        <path d="M 230 205 A 35 35 0 0 0 ${(230 + kX) / 2} 200" fill="none" stroke="#16a34a" stroke-width="1.8" />
        <text x="245" y="215" font-size="11" font-weight="bold" fill="#16a34a">${escSvg(p.angle2)}</text>
      </svg>`;
    }
  },

  dynamicsFBD: {
    id: 'dynamicsFBD',
    category: 'fizik',
    name: 'Kuvvet & Serbest Cisim Diyagramı (FBD)',
    tags: ['TYT', 'Dinamik', 'Kuvvet', 'Sürtünme', 'Newton'],
    desc: 'Yatay zemin üzerinde kütle bloğu ve etkiyen kuvvet vektörleri (F, fs, N, G).',
    defaultParams: {
      mass: 'm = 4 kg',
      forceF: 'F = 20 N',
      frictionFs: 'fs = 4 N',
      showFriction: true,
      showNormal: true,
      showWeight: true
    },
    presets: [
      { name: 'TYT - Yatay Sürtünmeli Zeminde Çekilen Cisim (F ve fs)', params: { mass: 'm', forceF: 'F', frictionFs: 'fs', showFriction: true, showNormal: false, showWeight: false } },
      { name: 'TYT/AYT - 4 Kuvvetin Tümünün Gösterildiği Serbest Cisim Diyagramı', params: { mass: '2 kg', forceF: '30 N', frictionFs: '10 N', showFriction: true, showNormal: true, showWeight: true } }
    ],
    schema: [
      { key: 'mass', label: 'Kütle Değeri', type: 'text' },
      { key: 'forceF', label: 'Çekme Kuvveti (F)', type: 'text' },
      { key: 'frictionFs', label: 'Sürtünme Kuvveti (fs)', type: 'text' },
      { key: 'showFriction', label: 'Sürtünme Kuvvetini Göster', type: 'checkbox' },
      { key: 'showNormal', label: 'Yüzey Tepki Kuvvetini (N) Göster', type: 'checkbox' },
      { key: 'showWeight', label: 'Yerçekimi / Ağırlığı (G=mg) Göster', type: 'checkbox' }
    ],
    renderSvg(p) {
      const bX = 230;
      const bY = 160;
      const bW = 80;
      const bH = 60;

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 320" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif;">
        <text x="250" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">Serbest Cisim Diyagramı (Newton Hareket Yasaları)</text>

        <line x1="60" y1="${bY + bH / 2}" x2="440" y2="${bY + bH / 2}" stroke="#0f172a" stroke-width="2.5" />
        ${Array.from({ length: 19 }).map((_, i) => `<line x1="${75 + i * 19}" y1="${bY + bH / 2}" x2="${65 + i * 19}" y2="${bY + bH / 2 + 10}" stroke="#64748b" stroke-width="1.5" />`).join('')}

        <rect x="${bX - bW / 2}" y="${bY - bH / 2}" width="${bW}" height="${bH}" rx="4" fill="#fed7aa" stroke="#ea580c" stroke-width="2.5" />
        <text x="${bX}" y="${bY + 5}" text-anchor="middle" font-size="13" font-weight="bold" fill="#9a3412">${escSvg(p.mass)}</text>

        <line x1="${bX + bW / 2}" y1="${bY}" x2="${bX + bW / 2 + 90}" y2="${bY}" stroke="#2563eb" stroke-width="3" />
        <polygon points="${bX + bW / 2 + 100},${bY} ${bX + bW / 2 + 88},${bY - 5} ${bX + bW / 2 + 88},${bY + 5}" fill="#2563eb" />
        <text x="${bX + bW / 2 + 50}" y="${bY - 10}" text-anchor="middle" font-size="12" font-weight="bold" fill="#1d4ed8">${escSvg(p.forceF)}</text>

        ${p.showFriction ? `
          <line x1="${bX - bW / 2}" y1="${bY + bH / 2 - 4}" x2="${bX - bW / 2 - 70}" y2="${bY + bH / 2 - 4}" stroke="#dc2626" stroke-width="2.5" />
          <polygon points="${bX - bW / 2 - 80},${bY + bH / 2 - 4} ${bX - bW / 2 - 68},${bY + bH / 2 - 9} ${bX - bW / 2 - 68},${bY + bH / 2 + 1}" fill="#dc2626" />
          <text x="${bX - bW / 2 - 45}" y="${bY + bH / 2 - 14}" text-anchor="middle" font-size="12" font-weight="bold" fill="#b91c1c">${escSvg(p.frictionFs)}</text>
        ` : ''}

        ${p.showNormal ? `
          <line x1="${bX}" y1="${bY - bH / 2}" x2="${bX}" y2="${bY - bH / 2 - 65}" stroke="#16a34a" stroke-width="2.5" />
          <polygon points="${bX},${bY - bH / 2 - 75} ${bX - 5},${bY - bH / 2 - 63} ${bX + 5},${bY - bH / 2 - 63}" fill="#16a34a" />
          <text x="${bX + 16}" y="${bY - bH / 2 - 40}" font-size="12" font-weight="bold" fill="#15803d">N (Tepki)</text>
        ` : ''}

        ${p.showWeight ? `
          <line x1="${bX}" y1="${bY + bH / 2}" x2="${bX}" y2="${bY + bH / 2 + 65}" stroke="#9333ea" stroke-width="2.5" />
          <polygon points="${bX},${bY + bH / 2 + 75} ${bX - 5},${bY + bH / 2 + 63} ${bX + 5},${bY + bH / 2 + 63}" fill="#9333ea" />
          <text x="${bX + 16}" y="${bY + bH / 2 + 45}" font-size="12" font-weight="bold" fill="#7e22ce">G = m·g</text>
        ` : ''}
      </svg>`;
    }
  },

  liquidPressure: {
    id: 'liquidPressure',
    category: 'fizik',
    name: 'Sıvı Basıncı & U Borusu / Taşırma',
    tags: ['LGS', 'TYT', 'Basınç', 'U Borusu', 'Kaldırma Kuvveti'],
    desc: 'U borusunda karışmayan sıvı dengesi (h1·d1 = h2·d2) veya taşırma kabı.',
    defaultParams: {
      type: 'utube',
      density1: 'd₁ (Su)',
      density2: 'd₂ (Cıva)',
      height1: '2h',
      height2: 'h'
    },
    presets: [
      { name: 'LGS/TYT - U Borusunda Karışmayan Sıvı Yoğunluk Dengesi', params: { type: 'utube', density1: 'd₁', density2: 'd₂', height1: '3h', height2: 'h' } },
      { name: 'TYT - Kaldırma Kuvveti (K, L, M Yüzen/Askıda/Batan)', params: { type: 'buoyancy' } }
    ],
    schema: [
      { key: 'type', label: 'Deney Düzeneği', type: 'select', options: [{ v: 'utube', l: 'U Borusu Sıvı Dengesi' }, { v: 'buoyancy', l: 'Kaldırma Kuvveti (Yüzen, Askıda, Batan Cisimler)' }] },
      { key: 'density1', label: '1. Sıvı Yoğunluğu (d1)', type: 'text' },
      { key: 'density2', label: '2. Sıvı Yoğunluğu (d2)', type: 'text' },
      { key: 'height1', label: '1. Sıvı Yüksekliği (Sol)', type: 'text' },
      { key: 'height2', label: '2. Sıvı Yüksekliği (Sağ)', type: 'text' }
    ],
    renderSvg(p) {
      if (p.type === 'buoyancy') {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 320" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif;">
          <text x="230" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">Sıvıların Kaldırma Kuvveti (F_K = V_batan · d_sıvı · g)</text>

          <rect x="90" y="80" width="280" height="200" rx="4" fill="#eff6ff" stroke="#0f172a" stroke-width="3" />
          <line x1="90" y1="120" x2="370" y2="120" stroke="#0284c7" stroke-width="2" />
          <text x="350" y="112" font-size="11" font-weight="bold" fill="#0369a1">d_sıvı</text>

          <g transform="translate(145, 120)">
            <rect x="-22" y="-22" width="44" height="44" rx="4" fill="#fed7aa" stroke="#ea580c" stroke-width="2" />
            <text x="0" y="5" text-anchor="middle" font-size="13" font-weight="bold" fill="#9a3412">K</text>
            <text x="0" y="38" text-anchor="middle" font-size="10" font-weight="bold" fill="#475569">d_K &lt; d_sıvı</text>
          </g>

          <g transform="translate(230, 180)">
            <rect x="-22" y="-22" width="44" height="44" rx="4" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
            <text x="0" y="5" text-anchor="middle" font-size="13" font-weight="bold" fill="#854d0e">L</text>
            <text x="0" y="38" text-anchor="middle" font-size="10" font-weight="bold" fill="#475569">d_L = d_sıvı</text>
          </g>

          <g transform="translate(315, 256)">
            <rect x="-22" y="-22" width="44" height="44" rx="4" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
            <text x="0" y="5" text-anchor="middle" font-size="13" font-weight="bold" fill="#991b1b">M</text>
            <text x="0" y="-28" text-anchor="middle" font-size="10" font-weight="bold" fill="#475569">d_M &gt; d_sıvı</text>
          </g>
        </svg>`;
      }

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 340" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif;">
        <text x="230" y="24" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">U Borusunda Karışmayan Sıvı Dengesi</text>

        <path d="M 140 70 L 140 250 A 40 40 0 0 0 220 290 L 240 290 A 40 40 0 0 0 320 250 L 320 70" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
        <path d="M 190 70 L 190 240 A 15 15 0 0 0 205 255 L 255 255 A 15 15 0 0 0 270 240 L 270 70" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />

        <path d="M 141 210 L 189 210 L 189 240 A 15 15 0 0 0 205 255 L 255 255 A 15 15 0 0 0 270 240 L 270 160 L 319 160 L 319 250 A 40 40 0 0 1 240 290 L 220 290 A 40 40 0 0 1 141 250 Z" fill="#cbd5e1" />
        <text x="230" y="275" text-anchor="middle" font-size="11" font-weight="bold" fill="#334155">${escSvg(p.density2)}</text>

        <rect x="141" y="100" width="48" height="110" fill="#93c5fd" />
        <text x="165" y="150" text-anchor="middle" font-size="11" font-weight="bold" fill="#1d4ed8">${escSvg(p.density1)}</text>

        <line x1="120" y1="210" x2="340" y2="210" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="4,3" />
        <text x="350" y="214" font-size="10" font-weight="bold" fill="#dc2626">Denge Çizgisi</text>

        <line x1="125" y1="100" x2="125" y2="210" stroke="#2563eb" stroke-width="1.5" />
        <line x1="120" y1="100" x2="130" y2="100" stroke="#2563eb" stroke-width="1.5" />
        <line x1="120" y1="210" x2="130" y2="210" stroke="#2563eb" stroke-width="1.5" />
        <text x="110" y="155" text-anchor="end" font-size="11" font-weight="bold" fill="#2563eb">${escSvg(p.height1)}</text>

        <line x1="335" y1="160" x2="335" y2="210" stroke="#475569" stroke-width="1.5" />
        <line x1="330" y1="160" x2="340" y2="160" stroke="#475569" stroke-width="1.5" />
        <line x1="330" y1="210" x2="340" y2="210" stroke="#475569" stroke-width="1.5" />
        <text x="350" y="185" font-size="11" font-weight="bold" fill="#475569">${escSvg(p.height2)}</text>

        <text x="230" y="325" text-anchor="middle" font-size="11" fill="#475569">Sıvı Basıncı Dengesi: h₁ · d₁ = h₂ · d₂</text>
      </svg>`;
    }
  }
};

function escSvg(str) {
  return String(str || '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);
}

// ============================================================================
// 2. SVG -> PNG 2X RETINA EXPORTER
// ============================================================================

function svgToDataUrl(svgString, scale = 2) {
  return new Promise((resolve, reject) => {
    try {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = (img.width || 520) * scale;
        canvas.height = (img.height || 360) * scale;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png', 0.95));
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}

// ============================================================================
// 3. MODAL YÖNETİMİ & ETKİLEŞİM MANTIĞI
// ============================================================================

function setOnScienceInsertCallback(fn) {
  onScienceInsertCallback = fn;
}

function openScienceModal(callback, onCancel) {
  if (typeof callback === 'function') {
    onScienceInsertCallback = callback;
  }
  if (typeof onCancel === 'function') {
    onScienceCancelCallback = onCancel;
  } else {
    onScienceCancelCallback = null;
  }
  closeModal('textModal');
  closeSideDrawer();
  openModal('scienceModal');
  renderCategoryTabs();
  renderTemplateList();
  selectTemplate(activeTemplateId);
}

function closeScienceModal() {
  closeModal('scienceModal');
  closeSideDrawer();
  if (typeof onScienceCancelCallback === 'function') {
    const cb = onScienceCancelCallback;
    onScienceCancelCallback = null;
    onScienceInsertCallback = null;
    cb();
  }
}

function renderCategoryTabs() {
  const tabs = document.querySelectorAll('.sci-cat-tab');
  tabs.forEach(tab => {
    const isAct = tab.dataset.cat === activeCategory;
    tab.className = `sci-cat-tab px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
      isAct ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
    }`;
  });
}

function renderTemplateList() {
  const listEl = $('sciTemplateList');
  if (!listEl) return;
  listEl.innerHTML = '';

  const q = ($('sciSearchInput')?.value || '').toLowerCase().trim();

  const entries = Object.values(SCIENCE_TEMPLATES).filter(t => {
    if (activeCategory !== 'all' && t.category !== activeCategory) return false;
    if (q && !t.name.toLowerCase().includes(q) && !t.desc.toLowerCase().includes(q) && !t.tags.some(tg => tg.toLowerCase().includes(q))) {
      return false;
    }
    return true;
  });

  if (!entries.length) {
    listEl.innerHTML = `<div class="p-6 text-center text-xs text-slate-400">Eşleşen şablon bulunamadı.</div>`;
    return;
  }

  entries.forEach(t => {
    const isAct = t.id === activeTemplateId;
    const catIcon = t.category === 'cografya' ? '🌍' : (t.category === 'biyoloji' ? '🧬' : (t.category === 'kimya' ? '🧪' : '⚡'));
    const catBadgeColor = t.category === 'cografya' ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300' :
      (t.category === 'biyoloji' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300' :
      (t.category === 'kimya' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300' : 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300'));

    const card = document.createElement('button');
    card.type = 'button';
    card.className = `w-full text-left p-2.5 rounded-xl border transition flex items-start gap-2.5 ${
      isAct ? 'bg-white border-slate-900 shadow-sm ring-1 ring-slate-900 dark:bg-slate-800 dark:border-slate-100 dark:ring-slate-100' : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300 dark:bg-slate-900/60 dark:border-slate-800'
    }`;

    card.innerHTML = `
      <span class="text-xl shrink-0 p-1 rounded-lg bg-white shadow-xs border border-slate-100 dark:bg-slate-800 dark:border-slate-700">${catIcon}</span>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5">
          <span class="text-[12px] font-bold text-slate-900 truncate dark:text-slate-100">${escSvg(t.name)}</span>
        </div>
        <p class="text-[10.5px] text-slate-500 line-clamp-2 mt-0.5 leading-snug dark:text-slate-400">${escSvg(t.desc)}</p>
        <div class="flex items-center gap-1 mt-1.5 flex-wrap">
          <span class="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded border ${catBadgeColor}">${t.category}</span>
          ${t.tags.slice(0, 2).map(tag => `<span class="text-[9px] text-slate-400 dark:text-slate-500">#${tag}</span>`).join(' ')}
        </div>
      </div>
    `;

    card.onclick = () => selectTemplate(t.id);
    listEl.appendChild(card);
  });
}

function selectTemplate(templateId) {
  const tpl = SCIENCE_TEMPLATES[templateId];
  if (!tpl) return;
  activeTemplateId = templateId;
  currentParams = JSON.parse(JSON.stringify(tpl.defaultParams || {}));
  currentParams._overlays = [];
  setSelectedOverlayId(null);

  renderTemplateList();
  renderPresets(tpl);
  renderSchemaControls(tpl);
  updateLivePreview();
}

function renderPresets(tpl) {
  const presetBox = $('sciPresetBox');
  if (!presetBox) return;
  presetBox.innerHTML = '';

  if (!tpl.presets || !tpl.presets.length) {
    presetBox.classList.add('hidden');
    return;
  }
  presetBox.classList.remove('hidden');

  const title = document.createElement('span');
  title.className = 'text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1';
  title.textContent = 'TYT & LGS Çıkmış Soru Hazır Ayarları:';
  presetBox.appendChild(title);

  const wrap = document.createElement('div');
  wrap.className = 'flex flex-wrap gap-1.5';

  tpl.presets.forEach(pr => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'text-[11px] font-medium px-2 py-1 rounded-lg border border-slate-200 bg-white hover:border-slate-900 hover:text-slate-900 text-slate-600 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-100';
    btn.textContent = `★ ${pr.name}`;
    btn.onclick = () => {
      Object.assign(currentParams, pr.params);
      renderSchemaControls(tpl);
      updateLivePreview();
    };
    wrap.appendChild(btn);
  });
  presetBox.appendChild(wrap);
}

function renderSchemaControls(tpl) {
  const container = $('sciParamControls');
  if (!container) return;
  container.innerHTML = '';

  tpl.schema.forEach(field => {
    const val = currentParams[field.key] !== undefined ? currentParams[field.key] : tpl.defaultParams[field.key];
    const row = document.createElement('div');
    row.className = 'space-y-1';

    if (field.type === 'checkbox') {
      row.className = 'flex items-center gap-2 pt-1';
      row.innerHTML = `
        <input type="checkbox" id="field_${field.key}" class="rounded border-slate-300 dark:border-slate-700" ${val ? 'checked' : ''}>
        <label for="field_${field.key}" class="text-[12px] font-medium text-slate-700 dark:text-slate-300 select-none cursor-pointer">${escSvg(field.label)}</label>
      `;
      const input = row.querySelector('input');
      input.onchange = (e) => {
        currentParams[field.key] = e.target.checked;
        updateLivePreview();
      };
    } else if (field.type === 'select') {
      row.innerHTML = `
        <label class="lbl text-[11px] font-semibold text-slate-700 dark:text-slate-300">${escSvg(field.label)}</label>
        <select class="inp text-[12px] !py-1.5" id="field_${field.key}">
          ${field.options.map(opt => `<option value="${opt.v}" ${val === opt.v ? 'selected' : ''}>${opt.l}</option>`).join('')}
        </select>
      `;
      const select = row.querySelector('select');
      select.onchange = (e) => {
        currentParams[field.key] = e.target.value;
        updateLivePreview();
      };
    } else {
      row.innerHTML = `
        <div class="flex items-center justify-between">
          <label class="lbl text-[11px] font-semibold text-slate-700 dark:text-slate-300">${escSvg(field.label)}</label>
          ${field.hint ? `<span class="text-[10px] text-slate-400">${escSvg(field.hint)}</span>` : ''}
        </div>
        <input class="inp text-[12px] !py-1.5" id="field_${field.key}" value="${escSvg(val || '')}">
      `;
      const input = row.querySelector('input');
      input.oninput = (e) => {
        currentParams[field.key] = e.target.value;
        updateLivePreview();
      };
    }

    container.appendChild(row);
  });
}

function updateLivePreview() {
  const stage = $('sciPreviewStage');
  if (!stage) return;

  const tpl = SCIENCE_TEMPLATES[activeTemplateId];
  if (!tpl) return;

  let svgStr = tpl.renderSvg(currentParams);
  svgStr = injectOverlaysIntoSvg(svgStr, currentParams);
  stage.innerHTML = svgStr;

  const infoEl = $('sciSelectedInfo');
  setupStageInteractions(
    stage,
    currentParams,
    () => updateLivePreview(),
    (sel) => {
      if (infoEl) {
        if (!sel) {
          infoEl.classList.add('hidden');
          infoEl.textContent = '';
        } else {
          infoEl.classList.remove('hidden');
          if (sel.type === 'organelle') {
            infoEl.textContent = `Seçili: Organel (${sel.key})`;
          } else if (sel.type === 'symbol') {
            infoEl.textContent = `Seçili: Devre Bileşeni`;
          } else if (sel.type === 'formula') {
            infoEl.textContent = `Seçili: Formül`;
          } else if (sel.type === 'arrow') {
            infoEl.textContent = `Seçili: İşaret Oku`;
          } else if (sel.type === 'pin' || sel.type === 'mapPin') {
            infoEl.textContent = `Seçili: Harita Pini`;
          } else if (sel.type === 'text') {
            infoEl.textContent = `Seçili: Metin Notu`;
          } else {
            infoEl.textContent = `Seçili Öğe: ${sel.type}`;
          }
        }
      }
    }
  );
}

// ============================================================================
// 4. BAŞLATICI & OLAY DİNLEYİCİLERİ
// ============================================================================


// ============================================================================
// 5. YAN ÇEKMECE (SIDE DRAWER): KATEX FORMÜLLER & DEVRE ELEMANLARI
// ============================================================================

let drawerActiveMode = 'formula'; // 'formula' | 'symbol'
let drawerFormulaCat = 'fizik'; // 'fizik' | 'kimya' | 'biyoloji' | 'matematik'
let drawerActiveSymbol = 'resistor';
let drawerFormulaSize = 16;

const FORMULA_PRESETS = {
  fizik: [
    { label: 'V = I · R', latex: 'V = I \\cdot R', desc: 'Ohm Yasası' },
    { label: 'P = V · I', latex: 'P = V \\cdot I', desc: 'Elektriksel Güç' },
    { label: 'F_net = m · a', latex: 'F_{\\text{net}} = m \\cdot a', desc: 'Newton 2. Yasa' },
    { label: 'E_k = 1/2 m v²', latex: 'E_k = \\frac{1}{2} m v^2', desc: 'Kinetik Enerji' },
    { label: 'E_p = m g h', latex: 'E_p = m g h', desc: 'Potansiyel Enerji' },
    { label: 'W = F · Δx', latex: 'W = F \\cdot \\Delta x', desc: 'İş - Enerji' },
    { label: 'P = h · d · g', latex: 'P = h \\cdot d \\cdot g', desc: 'Sıvı Basıncı' },
    { label: 'F_K = V_b · d_s · g', latex: 'F_K = V_b \\cdot d_s \\cdot g', desc: 'Kaldırma Kuvveti' },
    { label: 'T = 2π√(m/k)', latex: 'T = 2\\pi\\sqrt{\\frac{m}{k}}', desc: 'Yay Sarkacı' },
    { label: 'T = 2π√(L/g)', latex: 'T = 2\\pi\\sqrt{\\frac{L}{g}}', desc: 'Basit Sarkaç' },
    { label: 'λ = v / f', latex: '\\lambda = \\frac{v}{f}', desc: 'Dalga Boyu' },
    { label: 'Q = m · c · ΔT', latex: 'Q = m \\cdot c \\cdot \\Delta T', desc: 'Isı - Sıcaklık' },
    { label: 'E = mc²', latex: 'E = m c^2', desc: 'Kütle-Enerji' },
    { label: 'F = q · v · B · sinθ', latex: 'F = q v B \\sin\\theta', desc: 'Manyetik Kuvvet' },
    { label: 'a_mer = v² / r', latex: 'a_{\\text{mer}} = \\frac{v^2}{r}', desc: 'Merkezcil İvme' }
  ],
  kimya: [
    { label: 'P · V = n · R · T', latex: 'P \\cdot V = n R T', desc: 'İdeal Gaz Yasası' },
    { label: 'M = n / V', latex: 'M = \\frac{n}{V}', desc: 'Molarite' },
    { label: 'pH = -log[H⁺]', latex: '\\text{pH} = -\\log[\\text{H}^+]', desc: 'pH Formülü' },
    { label: 'pOH = -log[OH⁻]', latex: '\\text{pOH} = -\\log[\\text{OH}^-]', desc: 'pOH Formülü' },
    { label: 'ΔH = ΣΔH_u - ΣΔH_g', latex: '\\Delta H = \\sum \\Delta H_u^\\circ - \\sum \\Delta H_g^\\circ', desc: 'Tepkime Isısı' },
    { label: 'K_a · K_b = 10⁻¹⁴', latex: 'K_a \\cdot K_b = 10^{-14}', desc: 'Su İyon Çarpımı' },
    { label: 'E°_pil = E°_kat - E°_an', latex: 'E^\\circ_{\\text{pil}} = E^\\circ_{\\text{katot}} - E^\\circ_{\\text{anot}}', desc: 'Pil Potansiyeli' },
    { label: 'r = k[A]ᵃ[B]ᵇ', latex: 'r = k [\\text{A}]^a [\\text{B}]^b', desc: 'Tepkime Hızı' },
    { label: 'q = m · L_e', latex: 'q = m \\cdot L_e', desc: 'Erime Isısı' },
    { label: 'd = m / V', latex: 'd = \\frac{m}{V}', desc: 'Özkütle' }
  ],
  biyoloji: [
    { label: 'Fotosentez Denklemi', latex: '6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow{Işık} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2', desc: 'Fotosentez' },
    { label: 'Hücresel Solunum', latex: '\\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 \\to 6\\text{CO}_2 + 6\\text{H}_2\\text{O} + 32\\text{ATP}', desc: 'Solunum' },
    { label: 'Hardy-Weinberg (Genotip)', latex: 'p^2 + 2pq + q^2 = 1', desc: 'Genotip Frekansı' },
    { label: 'Hardy-Weinberg (Allel)', latex: 'p + q = 1', desc: 'Allel Frekansı' },
    { label: 'DNA Baz Eşleşmesi', latex: '\\text{A} = \\text{T}, \\quad \\text{G} \\equiv \\text{C}', desc: 'Baz Eşleşmesi' },
    { label: 'Kromozom Formülü', latex: '2n = 46 \\implies n = 23', desc: 'Kromozom Sayısı' },
    { label: 'Kromozom & Kromatit', latex: '1\\,\\text{Kromozom} = 2\\,\\text{Kardeş Kromatit}', desc: 'Mitoz Bağıntısı' }
  ],
  matematik: [
    { label: 'Kesir: a/b', latex: '\\frac{a}{b}', desc: 'Kesir' },
    { label: 'Karekök: √x', latex: '\\sqrt{x}', desc: 'Karekök' },
    { label: 'n. Dereceden Kök', latex: '\\sqrt[n]{x}', desc: 'Kök' },
    { label: 'Üs: xⁿ', latex: 'x^n', desc: 'Üslü İfade' },
    { label: 'İndis: x_n', latex: 'x_n', desc: 'Alt İndis' },
    { label: 'Toplam: ∑', latex: '\\sum_{i=1}^{n} x_i', desc: 'Toplam Sembolü' },
    { label: 'Limit: lim', latex: '\\lim_{x \\to 0}', desc: 'Limit' },
    { label: 'İntegral: ∫', latex: '\\int_{a}^{b} f(x)\\,dx', desc: 'Belirli İntegral' },
    { label: 'Yunan Harfleri', latex: '\\alpha, \\beta, \\theta, \\pi, \\Delta, \\Omega', desc: 'Semboller' },
    { label: 'Bağıntılar', latex: '\\pm, \\approx, \\le, \\ge, \\ne', desc: 'İşaretler' }
  ]
};

const CIRCUIT_SYMBOLS = [
  { id: 'resistor', name: 'Direnç (Kutu)', defLabel: 'R₁', defVal: '6 Ω' },
  { id: 'resistor_zigzag', name: 'Direnç (Zigzag)', defLabel: 'R₂', defVal: '12 Ω' },
  { id: 'battery', name: 'Pil / Üreteç', defLabel: '+ / -', defVal: '24 V' },
  { id: 'switch_open', name: 'Açık Anahtar', defLabel: 'S₁', defVal: '' },
  { id: 'switch_closed', name: 'Kapalı Anahtar', defLabel: 'S₂', defVal: '' },
  { id: 'bulb', name: 'Lamba', defLabel: 'K', defVal: '' },
  { id: 'voltmeter', name: 'Voltmetre (V)', defLabel: 'V', defVal: '' },
  { id: 'ammeter', name: 'Ampermetre (A)', defLabel: 'A', defVal: '' },
  { id: 'capacitor', name: 'Sığaç / Kapasitör', defLabel: 'C', defVal: '10 µF' }
];

function openSideDrawer(mode = 'formula') {
  const drawer = $('sciSideDrawer');
  if (!drawer) return;
  drawerActiveMode = mode;
  drawer.classList.remove('hidden');

  const titleEl = $('sciDrawerTitle');
  const iconEl = $('sciDrawerIcon');
  const fMode = $('sciDrawerFormulaMode');
  const sMode = $('sciDrawerSymbolMode');

  if (mode === 'formula') {
    if (titleEl) titleEl.textContent = 'Formül (KaTeX) Ekle';
    if (iconEl) iconEl.textContent = '∑';
    if (fMode) fMode.classList.remove('hidden');
    if (sMode) sMode.classList.add('hidden');
    renderDrawerFormulaTabs();
    renderDrawerFormulaChips();
    updateDrawerKatexPreview();
    setTimeout(() => { $('sciDrawerKatexInput')?.focus(); }, 50);
  } else {
    if (titleEl) titleEl.textContent = 'Devre Elemanı Ekle';
    if (iconEl) iconEl.textContent = '⚡';
    if (fMode) fMode.classList.add('hidden');
    if (sMode) sMode.classList.remove('hidden');
    renderDrawerSymbolGrid();
    updateDrawerSymbolPreview();
  }
}

function closeSideDrawer() {
  const drawer = $('sciSideDrawer');
  if (drawer) drawer.classList.add('hidden');
}

function renderDrawerFormulaTabs() {
  document.querySelectorAll('#sciDrawerFormulaMode .sci-drawer-tab').forEach(tab => {
    const isAct = tab.dataset.dcat === drawerFormulaCat;
    tab.className = `sci-drawer-tab px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
      isAct ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
    }`;
  });
}

function renderDrawerFormulaChips() {
  const container = $('sciDrawerChips');
  if (!container) return;
  container.innerHTML = '';

  const list = FORMULA_PRESETS[drawerFormulaCat] || [];
  list.forEach(item => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sci-chip text-[11px] font-medium px-2 py-1 rounded-lg border border-slate-200 bg-white hover:border-teal-600 hover:text-teal-700 text-slate-700 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:text-teal-300';
    btn.textContent = item.label;
    btn.title = item.desc || item.label;
    btn.onclick = () => {
      const input = $('sciDrawerKatexInput');
      if (input) {
        input.value = item.latex;
        updateDrawerKatexPreview();
      }
    };
    container.appendChild(btn);
  });
}

function updateDrawerKatexPreview() {
  const preview = $('sciDrawerKatexPreview');
  if (!preview) return;
  const input = $('sciDrawerKatexInput');
  const latex = (input?.value || '').trim();

  if (!latex) {
    preview.innerHTML = '<span class="text-xs text-slate-400 font-sans italic">Önizleme burada görünecektir</span>';
    return;
  }

  if (window.katex && typeof window.katex.renderToString === 'function') {
    try {
      preview.innerHTML = window.katex.renderToString(latex, { throwOnError: false, displayMode: true });
    } catch (e) {
      preview.textContent = latex;
    }
  } else {
    preview.textContent = latex;
  }
}

function renderDrawerSymbolGrid() {
  const grid = $('sciDrawerSymbolGrid');
  if (!grid) return;
  grid.innerHTML = '';

  CIRCUIT_SYMBOLS.forEach(sym => {
    const isAct = sym.id === drawerActiveSymbol;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `sci-symbol-card p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
      isAct ? 'bg-teal-50 border-teal-600 text-teal-900 ring-1 ring-teal-600 dark:bg-teal-950 dark:border-teal-400 dark:text-teal-100' :
      'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 text-slate-700 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-300'
    }`;

    btn.innerHTML = `
      <div class="h-8 flex items-center justify-center pointer-events-none">
        <svg viewBox="0 0 74 36" width="50" height="24">
          ${renderCircuitSymbolSvg({ id: 'card', symbol: sym.id, x: 37, y: 18, rot: 0 }, false)}
        </svg>
      </div>
      <span class="text-[10px] font-bold leading-tight line-clamp-1">${sym.name}</span>
    `;

    btn.onclick = () => {
      drawerActiveSymbol = sym.id;
      const lblInp = $('sciDrawerSymbolLabel');
      const valInp = $('sciDrawerSymbolVal');
      if (lblInp) lblInp.value = sym.defLabel;
      if (valInp) valInp.value = sym.defVal;
      renderDrawerSymbolGrid();
      updateDrawerSymbolPreview();
    };

    grid.appendChild(btn);
  });
}

function updateDrawerSymbolPreview() {
  const box = $('sciDrawerSymbolPreview');
  if (!box) return;

  const lbl = $('sciDrawerSymbolLabel')?.value || '';
  const val = $('sciDrawerSymbolVal')?.value || '';

  const mockItem = {
    id: 'preview_sym',
    symbol: drawerActiveSymbol,
    x: 60,
    y: 35,
    label: lbl,
    val: val,
    rot: 0
  };

  box.innerHTML = `
    <svg viewBox="0 0 120 70" width="120" height="70" style="font-family:'Noto Sans',sans-serif;">
      ${renderCircuitSymbolSvg(mockItem, false)}
    </svg>
  `;
}

function initSideDrawer() {
  // Sekme geçişleri
  document.querySelectorAll('#sciDrawerFormulaMode .sci-drawer-tab').forEach(tab => {
    tab.onclick = () => {
      drawerFormulaCat = tab.dataset.dcat;
      renderDrawerFormulaTabs();
      renderDrawerFormulaChips();
    };
  });

  // KaTeX Canlı Önizleme
  const kInp = $('sciDrawerKatexInput');
  if (kInp) {
    kInp.oninput = () => updateDrawerKatexPreview();
  }

  // KaTeX Boyut Kaydırıcısı
  const sizeSlider = $('sciDrawerFormulaSize');
  const sizeVal = $('sciDrawerFormulaSizeVal');
  if (sizeSlider) {
    sizeSlider.oninput = (e) => {
      drawerFormulaSize = parseInt(e.target.value) || 16;
      if (sizeVal) sizeVal.textContent = `${drawerFormulaSize}px`;
    };
  }

  // KaTeX Tuvale Ekle Butonu
  const insertFormulaBtn = $('sciDrawerInsertFormulaBtn');
  if (insertFormulaBtn) {
    insertFormulaBtn.onclick = () => {
      const latex = ($('sciDrawerKatexInput')?.value || '').trim();
      if (!latex) {
        alert('Lütfen eklenecek bir formül yazın veya hazır formüllerden birini seçin.');
        return;
      }
      addOverlayItem(currentParams, 'formula', {
        text: latex,
        x: 240,
        y: 170,
        size: drawerFormulaSize
      });
      updateLivePreview();
    };
  }

  // Sembol Input Dinleyicileri
  const symLbl = $('sciDrawerSymbolLabel');
  if (symLbl) symLbl.oninput = () => updateDrawerSymbolPreview();
  const symVal = $('sciDrawerSymbolVal');
  if (symVal) symVal.oninput = () => updateDrawerSymbolPreview();

  // Sembol Tuvale Ekle Butonu
  const insertSymBtn = $('sciDrawerInsertSymbolBtn');
  if (insertSymBtn) {
    insertSymBtn.onclick = () => {
      const lbl = $('sciDrawerSymbolLabel')?.value || '';
      const val = $('sciDrawerSymbolVal')?.value || '';
      addOverlayItem(currentParams, 'symbol', {
        symbol: drawerActiveSymbol,
        label: lbl,
        val: val,
        x: 260,
        y: 170
      });
      updateLivePreview();
    };
  }

  // Çekmece Kapat Butonu
  const closeBtn = $('sciDrawerClose');
  if (closeBtn) closeBtn.onclick = closeSideDrawer;
}


function initScienceTemplates() {
  const searchInp = $('sciSearchInput');
  if (searchInp) {
    searchInp.oninput = () => renderTemplateList();
  }

  document.querySelectorAll('.sci-cat-tab').forEach(btn => {
    btn.onclick = () => {
      activeCategory = btn.dataset.cat;
      renderCategoryTabs();
      renderTemplateList();
    };
  });

  const closeBtn = $('sciModalClose');
  if (closeBtn) closeBtn.onclick = closeScienceModal;
  const cancelBtn = $('sciModalCancel');
  if (cancelBtn) cancelBtn.onclick = closeScienceModal;

  // İnteraktif Katman Araç Çubuğu: Sağ Çekmece ile Entegre (Direnç & KaTeX)
  initSideDrawer();

  const addSymbolBtn = $('sciToolAddSymbol');
  if (addSymbolBtn) {
    addSymbolBtn.onclick = () => openSideDrawer('symbol');
  }

  const addFormulaBtn = $('sciToolAddFormula');
  if (addFormulaBtn) {
    addFormulaBtn.onclick = () => openSideDrawer('formula');
  }

  const addTextBtn = $('sciToolAddText');
  if (addTextBtn) {
    addTextBtn.onclick = () => {
      const text = prompt('Eklenecek metin / not:', 'Önemli Not');
      if (text) {
        addOverlayItem(currentParams, 'text', {
          text,
          x: 240,
          y: 170,
          size: 13
        });
        updateLivePreview();
      }
    };
  }

  const addArrowBtn = $('sciToolAddArrow');
  if (addArrowBtn) {
    addArrowBtn.onclick = () => {
      const label = prompt('Ok üzerine kuvvet / yön etiketi (İsteğe bağlı, örn: F, v, Akım, Boğaz):', '');
      addOverlayItem(currentParams, 'arrow', {
        x1: 200,
        y1: 170,
        x2: 300,
        y2: 170,
        label: label || '',
        color: '#dc2626'
      });
      updateLivePreview();
    };
  }

  const addPinBtn = $('sciToolAddPin');
  if (addPinBtn) {
    addPinBtn.onclick = () => {
      const label = prompt('Pin numarası veya harfi (örn: I, II, III, A, B, 1, 2):', 'I');
      if (label === null) return;
      const text = prompt('Pin açıklama metni (İsteğe bağlı, örn: Çukurova Deltası, Rize, Kapıdağ Tombolosu):', '');
      if (currentParams.pins && Array.isArray(currentParams.pins)) {
        const id = 'p_' + Date.now();
        currentParams.pins.push({
          id,
          x: 260,
          y: 150,
          label: label || 'I',
          text: text || '',
          color: '#dc2626'
        });
      } else {
        addOverlayItem(currentParams, 'pin', {
          label: label || 'I',
          text: text || '',
          color: '#dc2626',
          x: 260,
          y: 150
        });
      }
      updateLivePreview();
    };
  }

  const deleteSelectedBtn = $('sciToolDeleteSelected');
  if (deleteSelectedBtn) {
    deleteSelectedBtn.onclick = () => {
      const deleted = deleteSelectedOverlayItem(currentParams);
      if (!deleted) {
        alert('Lütfen önce silmek istediğiniz bir öğeyi (katman, pin veya devre bileşeni) tuval üzerinde tıklayarak seçin.');
      } else {
        updateLivePreview();
      }
    };
  }

  const resetOverlaysBtn = $('sciToolResetOverlays');
  if (resetOverlaysBtn) {
    resetOverlaysBtn.onclick = () => {
      if (confirm('Eklenen tüm katmanları ve taşımaları sıfırlamak istiyor musunuz?')) {
        const tpl = SCIENCE_TEMPLATES[activeTemplateId];
        if (tpl) {
          currentParams = JSON.parse(JSON.stringify(tpl.defaultParams || {}));
          currentParams._overlays = [];
          setSelectedOverlayId(null);
          renderSchemaControls(tpl);
          updateLivePreview();
        }
      }
    };
  }

  const insertBtn = $('sciModalInsert');
  if (insertBtn) {
    insertBtn.onclick = async () => {
      const tpl = SCIENCE_TEMPLATES[activeTemplateId];
      if (!tpl) return;
      let svgStr = tpl.renderSvg(currentParams);
      svgStr = injectOverlaysIntoSvg(svgStr, currentParams);

      insertBtn.disabled = true;
      const oldText = insertBtn.textContent;
      insertBtn.textContent = 'Ekleniyor...';

      try {
        const dataUrl = await svgToDataUrl(svgStr, 2);
        closeModal('scienceModal');
        closeSideDrawer();
        const cb = onScienceInsertCallback;
        onScienceInsertCallback = null;
        onScienceCancelCallback = null;
        if (typeof cb === 'function') {
          cb(dataUrl, tpl.name, tpl.category);
        }
      } catch (err) {
        console.error('Fen şablonu dışa aktarma hatası:', err);
        alert('Görsel oluşturulurken bir hata meydana geldi.');
      } finally {
        insertBtn.disabled = false;
        insertBtn.textContent = oldText;
      }
    };
  }

  const downloadBtn = $('sciModalDownload');
  if (downloadBtn) {
    downloadBtn.onclick = async () => {
      const tpl = SCIENCE_TEMPLATES[activeTemplateId];
      if (!tpl) return;
      let svgStr = tpl.renderSvg(currentParams);
      svgStr = injectOverlaysIntoSvg(svgStr, currentParams);
      try {
        const dataUrl = await svgToDataUrl(svgStr, 2);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${tpl.id}_${Date.now()}.png`;
        a.click();
      } catch (e) {
        console.error(e);
      }
    };
  }

  const copySvgBtn = $('sciModalCopySvg');
  if (copySvgBtn) {
    copySvgBtn.onclick = async () => {
      const tpl = SCIENCE_TEMPLATES[activeTemplateId];
      if (!tpl) return;
      let svgStr = tpl.renderSvg(currentParams);
      svgStr = injectOverlaysIntoSvg(svgStr, currentParams);
      try {
        await navigator.clipboard.writeText(svgStr);
        const old = copySvgBtn.textContent;
        copySvgBtn.textContent = 'Kopyalandı!';
        setTimeout(() => { copySvgBtn.textContent = old; }, 1500);
      } catch (e) {
        alert('SVG kopyalanamadı.');
      }
    };
  }
}


// Module Exports
__exports['SCIENCE_TEMPLATES'] = SCIENCE_TEMPLATES;
__exports['svgToDataUrl'] = svgToDataUrl;
__exports['setOnScienceInsertCallback'] = setOnScienceInsertCallback;
__exports['openScienceModal'] = openScienceModal;
__exports['closeScienceModal'] = closeScienceModal;
__exports['openSideDrawer'] = openSideDrawer;
__exports['closeSideDrawer'] = closeSideDrawer;
__exports['initScienceTemplates'] = initScienceTemplates;

});

__define('modules/textModal.js', function(__exports, __require, __module) {
const { questions, MAX, LETTERS } = __require('state.js');
const { $, uid, esc, openModal, closeModal, warnText, clearWarn } = __require('utils.js');
const { openGeometryModal } = __require('modules/geometryDrawer.js');
const { openScienceModal } = __require('modules/scienceTemplates.js');

let editingId = null;
let questionKind = 'coktan';
let questionLevel = 'orta';
let blankItems = [''];
let blankAnswers = [''];
let txtImgSrc = null;
let blankImgSrc = null;
let onSaveCallback = null;

function setOnSaveCallback(fn) {
  onSaveCallback = fn;
}

function renderBlankList() {
  const list = $('blankQList');
  if (!list) return;
  list.innerHTML = '';
  blankItems.forEach((txt, i) => {
    if (blankAnswers[i] === undefined) blankAnswers[i] = '';
    const row = document.createElement('div');
    row.className = 'rounded-lg border border-slate-100 bg-white p-2 dark:border-slate-700 dark:bg-slate-900';
    row.innerHTML =
      `<div class="flex items-start gap-2">` +
        `<span class="mt-2.5 w-5 shrink-0 text-right text-xs font-semibold text-slate-400">${i + 1}.</span>` +
        `<textarea class="inp h-12 flex-1 leading-relaxed" placeholder="Türk edebiyatında ilk roman ... tarafından yazılmıştır." data-bi="${i}">${esc(txt)}</textarea>` +
        (blankItems.length > 1 ? `<button class="mt-2 shrink-0 rounded px-1.5 py-0.5 text-xs text-slate-300 transition hover:text-rose-600" data-bd="${i}">✕</button>` : '') +
      `</div>` +
      `<div class="mt-1.5 flex items-center gap-2 pl-7">` +
        `<span class="w-14 shrink-0 text-[10px] font-medium uppercase tracking-wide text-emerald-600">Cevap</span>` +
        `<input class="inp !h-7 flex-1 text-[12px]" placeholder="Opsiyonel · cevap anahtarında görünür" data-ba="${i}" value="${esc(blankAnswers[i] || '')}">` +
      `</div>`;
    list.appendChild(row);
  });
  list.querySelectorAll('[data-bi]').forEach((ta) => {
    ta.oninput = () => { blankItems[+ta.dataset.bi] = ta.value; };
  });
  list.querySelectorAll('[data-ba]').forEach((inp) => {
    inp.oninput = () => { blankAnswers[+inp.dataset.ba] = inp.value; };
  });
  list.querySelectorAll('[data-bd]').forEach((btn) => {
    btn.onclick = () => {
      blankItems.splice(+btn.dataset.bd, 1);
      blankAnswers.splice(+btn.dataset.bd, 1);
      renderBlankList();
    };
  });
}

function setQuestionKind(kind) {
  questionKind = kind;
  document.querySelectorAll('.qkind').forEach((b) => {
    const on = b.dataset.qk === kind;
    b.className = 'qkind rounded-lg py-2 font-medium transition ' +
      (on ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400');
  });
  $('blankPanel').classList.toggle('hidden', kind !== 'bosluk');
  $('preamblePanel').classList.toggle('hidden', kind === 'bosluk');
  $('rootPanel').classList.toggle('hidden', kind === 'bosluk');
  $('optionsPanel').classList.toggle('hidden', kind !== 'coktan');
  $('layoutPanel').classList.toggle('hidden', kind !== 'coktan');
  $('commonImgBlock').classList.toggle('hidden', kind === 'bosluk');
  $('aiPromptPanel').classList.toggle('hidden', kind !== 'coktan');
  if (kind === 'klasik' && $('txtBlank').value === '0') $('txtBlank').value = '25';
  if (kind === 'coktan') $('txtBlank').value = '0';
  if (kind === 'bosluk') { $('txtBlank').value = '0'; renderBlankList(); }
}

function renderOptionAnswer() {
  const current = $('txtAns').value;
  document.querySelectorAll('[data-opt-answer]').forEach((btn) => {
    const active = btn.dataset.optAnswer === current;
    btn.className = 'opt-answer w-7 shrink-0 rounded-md py-1 text-xs font-bold transition ' +
      (active ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' : 'text-slate-400 hover:bg-slate-200 hover:text-slate-700');
  });
}

function setTxtImg(src) {
  txtImgSrc = src;
  $('imgPreview').src = src || '';
  $('imgPreview').classList.toggle('hidden', !src);
  $('imgUploadPlaceholder').classList.toggle('hidden', !!src);
  $('txtImgRemove').classList.toggle('hidden', !src);
}

function setBlankImg(src) {
  blankImgSrc = src;
  $('blankImgPreview').src = src || '';
  $('blankImgPreview').classList.toggle('hidden', !src);
  $('blankImgPlaceholder').classList.toggle('hidden', !!src);
  $('blankImgRemove').classList.toggle('hidden', !src);
}

function renderLevelPills() {
  document.querySelectorAll('#txtLevelGroup .lvl-pill').forEach(btn => {
    const isAct = btn.dataset.lvl === questionLevel;
    btn.classList.toggle('active', isAct);
    if (isAct) {
      if (questionLevel === 'kolay') btn.className = 'lvl-pill active flex-1 rounded-lg border border-emerald-500 bg-emerald-50 py-1.5 text-[11px] font-semibold text-emerald-800 transition dark:bg-emerald-950/50 dark:text-emerald-300';
      else if (questionLevel === 'zor') btn.className = 'lvl-pill active flex-1 rounded-lg border border-rose-500 bg-rose-50 py-1.5 text-[11px] font-semibold text-rose-800 transition dark:bg-rose-950/50 dark:text-rose-300';
      else btn.className = 'lvl-pill active flex-1 rounded-lg border border-amber-500 bg-amber-50 py-1.5 text-[11px] font-semibold text-amber-800 transition dark:bg-amber-950/50 dark:text-amber-300';
    } else {
      btn.className = 'lvl-pill flex-1 rounded-lg border border-slate-200 bg-white py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300';
    }
  });
}

function openText(q) {
  editingId = q ? q.id : null;
  $('txtTitle').textContent = q ? 'Yazılı soruyu düzenle' : 'Yazılı soru ekle';
  setTxtImg(q && q.imgSrc ? q.imgSrc : null);
  $('imgUploadPanel').classList.toggle('hidden', !(q && q.imgSrc));
  
  questionLevel = (q && q.level) || 'orta';
  renderLevelPills();
  if ($('txtTags')) $('txtTags').value = (q && Array.isArray(q.tags)) ? q.tags.join(', ') : '';

  const bImg = q && q.kind === 'bosluk' ? q.imgSrc : null;
  setBlankImg(bImg || null);
  $('blankImgPanel').classList.toggle('hidden', !bImg);
  
  if (q && q.kind === 'bosluk') {
    if (q.blankItems && q.blankItems.length) blankItems = [...q.blankItems];
    else if (q.blankText) blankItems = [q.blankText];
    else blankItems = [''];
    
    if (q.groupId) {
      const grouped = questions.filter((x) => x.groupId === q.groupId && x.kind === 'bosluk');
      blankAnswers = blankItems.map((_, idx) => (grouped[idx] && grouped[idx].answer) || '');
    } else if (q.blankAnswers && q.blankAnswers.length) {
      blankAnswers = [...q.blankAnswers];
    } else {
      blankAnswers = blankItems.map((_, idx) => (idx === 0 ? (q.answer || '') : ''));
    }
  } else {
    blankItems = [''];
    blankAnswers = [''];
  }
  
  setQuestionKind(q && q.kind ? q.kind : 'coktan');
  $('txtPreamble').value = q ? (q.text || '') : '';
  $('txtRoot').value = q ? (q.root || '') : '';
  $('txtWordBank').value = q && q.wordBank ? q.wordBank.join(', ') : '';
  for (let i = 0; i < 5; i++) $('opt' + i).value = q && q.options ? (q.options[i] || '') : '';
  $('txtAns').value = q && q.answer ? q.answer : '';
  renderOptionAnswer();
  $('txtLayout').value = q && q.layout ? q.layout : 'v';
  $('txtBlank').value = String(q && q.blank ? q.blank : (q && q.kind === 'klasik' ? 25 : 0));
  clearWarn();
  openModal('textModal');
  $('aiPromptPanel').removeAttribute('open');
}

function saveText(keepOpen) {
  try {
    _saveText(keepOpen);
  } catch (e) {
    console.error('saveText hatası:', e);
    if (!keepOpen) closeModal('textModal');
    alert('Soru kaydedilirken beklenmedik bir hata oluştu:\n' + (e && e.message ? e.message : e));
  }
}

function _saveText(keepOpen) {
  const preamble = $('txtPreamble').value.trim();
  const root = $('txtRoot').value.trim();
  const wordBank = $('txtWordBank').value.split(',').map((w) => w.trim()).filter(Boolean);

  if (questionKind === 'bosluk') {
    const validBlanks = blankItems.map((t) => t.trim()).filter(Boolean);
    if (!validBlanks.length) {
      if (!keepOpen) return closeModal('textModal');
      return warnText('Lütfen en az bir boşluk doldurma cümlesi giriniz.');
    }
    if (editingId) {
      const idx = questions.findIndex((x) => x.id === editingId);
      const oldGroupId = questions[idx].groupId;
      let groupQuestions = oldGroupId ? questions.filter((x) => x.groupId === oldGroupId) : [questions[idx]];
      groupQuestions.forEach((gq) => {
        const gi = questions.findIndex((x) => x.id === gq.id);
        if (gi >= 0) questions.splice(gi, 1);
      });
      const gid = validBlanks.length > 1 ? uid() : null;
      const validAns = [];
      blankItems.forEach((t, i) => { if (t.trim()) validAns.push((blankAnswers[i] || '').trim()); });
      validBlanks.forEach((bt, bi) => {
        questions.splice(idx + bi, 0, {
          id: bi === 0 ? editingId : uid(),
          groupId: gid,
          stem: '',
          name: 'metin',
          type: 'text',
          kind: 'bosluk',
          text: '',
          root: '',
          imgSrc: bi === 0 && blankImgSrc ? blankImgSrc : null,
          blankText: bt,
          blankItems: validBlanks,
          wordBank,
          bankShared: false,
          options: ['', '', '', '', ''],
          layout: 'v',
          blank: 0,
          answer: validAns[bi] || null,
        });
      });
    } else {
      if (questions.length + validBlanks.length > MAX) return alert('Bir testte en fazla 100 soru bulundurabilirsiniz.');
      const gid = validBlanks.length > 1 ? uid() : null;
      const validAns = [];
      blankItems.forEach((t, i) => { if (t.trim()) validAns.push((blankAnswers[i] || '').trim()); });
      validBlanks.forEach((bt, bi) => {
        questions.push({
          id: uid(),
          groupId: gid,
          stem: '',
          name: 'metin',
          type: 'text',
          kind: 'bosluk',
          text: '',
          root: '',
          imgSrc: bi === 0 && blankImgSrc ? blankImgSrc : null,
          blankText: bt,
          blankItems: validBlanks,
          wordBank,
          bankShared: false,
          options: ['', '', '', '', ''],
          layout: 'v',
          blank: 0,
          answer: validAns[bi] || null,
        });
      });
    }
    if (onSaveCallback) onSaveCallback();
    if (keepOpen) {
      editingId = null;
      $('txtTitle').textContent = 'Yazılı soru ekle';
      blankItems = [''];
      blankAnswers = [''];
      $('txtWordBank').value = '';
      setBlankImg(null);
      $('blankImgPanel').classList.add('hidden');
      $('blankImgFile').value = '';
      renderBlankList();
    } else {
      closeModal('textModal');
    }
    return;
  }

  if (!preamble && !root) {
    const hasOptions = [0, 1, 2, 3, 4].some((i) => $('opt' + i).value.trim());
    if (!hasOptions) return closeModal('textModal');
    return warnText('Lütfen soru metni veya soru kökü giriniz.');
  }

  const options = [0, 1, 2, 3, 4].map((i) => $('opt' + i).value.trim());
  const tags = $('txtTags') ? $('txtTags').value.split(',').map(t => t.trim()).filter(Boolean) : [];
  const data = {
    type: 'text',
    kind: questionKind,
    level: questionLevel || 'orta',
    tags: tags,
    text: preamble,
    root: root,
    imgSrc: txtImgSrc ? txtImgSrc : null,
    blankText: '',
    blankItems: [],
    wordBank: [],
    bankShared: false,
    options: questionKind === 'coktan' ? options : ['', '', '', '', ''],
    layout: $('txtLayout').value,
    blank: +$('txtBlank').value || 0,
    answer: $('txtAns').value || null,
  };

  if (editingId) {
    const q = questions.find((x) => x.id === editingId);
    if (q) Object.assign(q, data);
  } else {
    if (questions.length >= MAX) return alert('Bir testte en fazla 100 soru bulundurabilirsiniz.');
    questions.push(Object.assign({ id: uid(), groupId: null, stem: '', name: 'metin' }, data));
  }

  if (onSaveCallback) onSaveCallback();

  if (keepOpen) {
    editingId = null;
    $('txtTitle').textContent = 'Yazılı soru ekle';
    $('txtPreamble').value = '';
    $('txtRoot').value = '';
    setTxtImg(null);
    $('imgUploadPanel').classList.add('hidden');
    $('txtImgFile').value = '';
    [0, 1, 2, 3, 4].forEach((i) => ($('opt' + i).value = ''));
    $('txtAns').value = '';
    renderOptionAnswer();
  } else {
    closeModal('textModal');
  }
}

function extractMarked(raw) {
  if (!raw) return null;
  const m = raw.match(/\*([\s\S]*?)\*/);
  if (!m) return null;
  return { marked: m[1].trim(), rest: (raw.slice(0, m.index) + ' ' + raw.slice(m.index + m[0].length)).trim() };
}

function autoParseQuestion(raw) {
  if (!raw || !raw.trim()) return;
  const starMatch = extractMarked(raw);
  const source = starMatch ? starMatch.rest : raw;
  const lines = source.split('\n');
  const optMap = {};
  const rest = [];
  const optRegex = /^\s*([A-Ea-e])\s*[).:\-]\s*(.+)$/;

  lines.forEach((line) => {
    const m = line.trim().match(optRegex);
    if (m && 'ABCDEabcde'.includes(m[1])) {
      optMap[m[1].toUpperCase()] = m[2].trim();
    } else if (!/(?:cevap|doğru\s*cevap|dogru\s*cevap|yanıt|answer)\s*[:=]?\s*[A-Ea-e]\b/i.test(line)) {
      rest.push(line);
    }
  });

  if (Object.keys(optMap).length >= 2) {
    LETTERS.forEach((l, i) => {
      if (optMap[l] !== undefined) $('opt' + i).value = optMap[l];
    });
  }

  const am = raw.match(/(?:cevap|doğru\s*cevap|dogru\s*cevap|yanıt|answer)\s*[:=]?\s*([A-Ea-e])\b/i);
  if (am) {
    $('txtAns').value = am[1].toUpperCase();
    renderOptionAnswer();
  }

  if (starMatch && starMatch.marked) {
    $('txtRoot').value = starMatch.marked;
    $('txtPreamble').value = rest.join('\n').trim();
    return;
  }

  const remainingText = rest.join('\n').trim();
  if (remainingText) {
    const paragraphs = remainingText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    if (paragraphs.length >= 2) {
      $('txtRoot').value = paragraphs[paragraphs.length - 1];
      $('txtPreamble').value = paragraphs.slice(0, -1).join('\n\n');
    } else {
      const singleLines = remainingText.split('\n').map((l) => l.trim()).filter(Boolean);
      if (singleLines.length >= 2 && (singleLines[singleLines.length - 1].endsWith('?') || /buna göre|hangisidir|değildir|söylenebilir|kaçtır|hangisinde/i.test(singleLines[singleLines.length - 1]))) {
        $('txtRoot').value = singleLines[singleLines.length - 1];
        $('txtPreamble').value = singleLines.slice(0, -1).join('\n');
      } else if (remainingText.endsWith('?') || /buna göre|hangisidir|değildir|aşağıdakilerden|kaçtır/i.test(remainingText)) {
        $('txtRoot').value = remainingText;
        if ($('txtPreamble').value === raw) $('txtPreamble').value = '';
      } else {
        $('txtPreamble').value = remainingText;
      }
    }
  }
}

function handleInsertGeometryQuestion(dataUrl) {
  if (!dataUrl) return;

  const preamble = $('txtPreamble')?.value.trim() || '';
  const root = $('txtRoot')?.value.trim() || '';
  const hasUserText = Boolean(preamble || root);

  const defaultRoot = 'Şekilde verilenlere göre istenen değeri bulunuz.';
  const qText = hasUserText ? preamble : '';
  const qRoot = hasUserText ? (root || defaultRoot) : defaultRoot;

  const options = [0, 1, 2, 3, 4].map((i) => $('opt' + i)?.value.trim() || '');
  const hasOptions = options.some(Boolean);

  const tags = $('txtTags')?.value ? $('txtTags').value.split(',').map((t) => t.trim()).filter(Boolean) : ['geometri'];
  if (!tags.includes('geometri')) tags.push('geometri');

  if (editingId) {
    const q = questions.find((x) => x.id === editingId);
    if (q) {
      q.imgSrc = dataUrl;
      if (qText) q.text = qText;
      if (qRoot) q.root = qRoot;
      if (hasOptions) q.options = options;
      if ($('txtAns')?.value) q.answer = $('txtAns').value;
      if (tags.length) q.tags = tags;
    }
  } else {
    if (questions.length >= MAX) {
      alert('Bir testte en fazla 100 soru bulundurabilirsiniz.');
      return;
    }
    const newQ = {
      id: uid(),
      groupId: null,
      stem: '',
      name: 'geometri',
      type: 'text',
      kind: questionKind === 'bosluk' ? 'coktan' : questionKind,
      level: questionLevel || 'orta',
      tags: tags,
      text: qText,
      root: qRoot,
      imgSrc: dataUrl,
      blankText: '',
      blankItems: [],
      wordBank: [],
      bankShared: false,
      options: hasOptions ? options : ['', '', '', '', ''],
      layout: $('txtLayout')?.value || 'v',
      blank: 0,
      answer: $('txtAns')?.value || null,
    };
    questions.push(newQ);
  }

  if (onSaveCallback) onSaveCallback();

  // Form alanlarını sıfırla ve kapat
  editingId = null;
  $('txtTitle').textContent = 'Yazılı soru ekle';
  $('txtPreamble').value = '';
  $('txtRoot').value = '';
  setTxtImg(null);
  $('imgUploadPanel').classList.add('hidden');
  $('txtImgFile').value = '';
  [0, 1, 2, 3, 4].forEach((i) => ($('opt' + i).value = ''));
  $('txtAns').value = '';
  renderOptionAnswer();
  closeModal('textModal');
}

function handleInsertScienceQuestion(dataUrl, templateName = 'Fen & Coğrafya Şablonu', category = 'fen') {
  if (!dataUrl) return;

  const preamble = $('txtPreamble')?.value.trim() || '';
  const root = $('txtRoot')?.value.trim() || '';
  const hasUserText = Boolean(preamble || root);

  const defaultRoot = 'Yukarıda verilen görsel ve bilgilere göre aşağıdaki yargılardan hangisi doğrudur?';
  const qText = hasUserText ? preamble : '';
  const qRoot = hasUserText ? (root || defaultRoot) : defaultRoot;

  const options = [0, 1, 2, 3, 4].map((i) => $('opt' + i)?.value.trim() || '');
  const hasOptions = options.some(Boolean);

  const tagList = [category || 'fen', 'şablon'];
  if (templateName) tagList.push(templateName.toLowerCase().slice(0, 15));

  if (editingId) {
    const q = questions.find((x) => x.id === editingId);
    if (q) {
      q.imgSrc = dataUrl;
      if (qText) q.text = qText;
      if (qRoot) q.root = qRoot;
      if (hasOptions) q.options = options;
      if ($('txtAns')?.value) q.answer = $('txtAns').value;
    }
  } else {
    if (questions.length >= MAX) {
      alert('Bir testte en fazla 100 soru bulundurabilirsiniz.');
      return;
    }
    const newQ = {
      id: uid(),
      groupId: null,
      stem: '',
      name: templateName || 'Fen/Coğrafya',
      type: 'text',
      kind: questionKind === 'bosluk' ? 'coktan' : questionKind,
      level: questionLevel || 'orta',
      tags: tagList,
      text: qText,
      root: qRoot,
      imgSrc: dataUrl,
      blankText: '',
      blankItems: [],
      wordBank: [],
      bankShared: false,
      options: hasOptions ? options : ['', '', '', '', ''],
      layout: $('txtLayout')?.value || 'v',
      blank: 0,
      answer: $('txtAns')?.value || null,
    };
    questions.push(newQ);
  }

  if (onSaveCallback) onSaveCallback();

  editingId = null;
  $('txtTitle').textContent = 'Yazılı soru ekle';
  $('txtPreamble').value = '';
  $('txtRoot').value = '';
  setTxtImg(null);
  $('imgUploadPanel').classList.add('hidden');
  $('txtImgFile').value = '';
  [0, 1, 2, 3, 4].forEach((i) => ($('opt' + i).value = ''));
  $('txtAns').value = '';
  renderOptionAnswer();
  closeModal('textModal');
}

function initTextModal() {
  document.querySelectorAll('.qkind').forEach((b) => (b.onclick = () => setQuestionKind(b.dataset.qk)));
  document.querySelectorAll('[data-opt-answer]').forEach((btn) => {
    btn.onclick = () => {
      $('txtAns').value = $('txtAns').value === btn.dataset.optAnswer ? '' : btn.dataset.optAnswer;
      renderOptionAnswer();
    };
  });

  const blankAddBtn = $('blankAddBtn');
  if (blankAddBtn) {
    blankAddBtn.onclick = () => {
      blankItems.push('');
      blankAnswers.push('');
      renderBlankList();
    };
  }

  $('copyPrompt').onclick = async () => {
    const txt = $('aiPrompt').innerText;
    try {
      await navigator.clipboard.writeText(txt);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = txt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    const btn = $('copyPrompt');
    const old = btn.textContent;
    btn.textContent = 'Kopyalandı!';
    setTimeout(() => { btn.textContent = old; }, 1600);
  };

  const uploadImgBtn = $('txtUploadImgBtn');
  if (uploadImgBtn) {
    uploadImgBtn.onclick = () => {
      $('imgUploadPanel').classList.remove('hidden');
      $('txtImgFile').click();
    };
  }

  $('txtImgFile').onchange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      setTxtImg(r.result);
      $('imgUploadPanel').classList.remove('hidden');
    };
    r.readAsDataURL(f);
  };
  $('txtImgRemove').onclick = () => {
    setTxtImg(null);
    $('txtImgFile').value = '';
    $('imgUploadPanel').classList.add('hidden');
  };

  const blankUploadBtn = $('blankUploadImgBtn');
  if (blankUploadBtn) {
    blankUploadBtn.onclick = () => {
      $('blankImgPanel').classList.remove('hidden');
      $('blankImgFile').click();
    };
  }

  $('blankImgFile').onchange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      setBlankImg(r.result);
      $('blankImgPanel').classList.remove('hidden');
    };
    r.readAsDataURL(f);
  };
  $('blankImgRemove').onclick = () => {
    setBlankImg(null);
    $('blankImgFile').value = '';
    $('blankImgPanel').classList.add('hidden');
  };

  const sciBtn = $('txtOpenScienceBtn');
  if (sciBtn) {
    sciBtn.onclick = () => {
      closeModal('textModal');
      openScienceModal((dataUrl, name, cat) => {
        setTxtImg(dataUrl);
        $('imgUploadPanel').classList.remove('hidden');
        openModal('textModal');
      }, () => {
        openModal('textModal');
      });
    };
  }

  const blankSciBtn = $('blankOpenScienceBtn');
  if (blankSciBtn) {
    blankSciBtn.onclick = () => {
      closeModal('textModal');
      openScienceModal((dataUrl, name, cat) => {
        setBlankImg(dataUrl);
        $('blankImgPanel').classList.remove('hidden');
        openModal('textModal');
      }, () => {
        openModal('textModal');
      });
    };
  }

  $('textBtn').onclick = () => openText(null);
  $('txtCancel').onclick = () => closeModal('textModal');
  $('txtSave').onclick = () => saveText(false);
  $('txtSaveNew').onclick = () => saveText(true);

  document.querySelectorAll('#txtLevelGroup .lvl-pill').forEach((btn) => {
    btn.onclick = () => {
      questionLevel = btn.dataset.lvl;
      renderLevelPills();
    };
  });

  const headerGeoBtn = $('modalHeaderGeoBtn');
  if (headerGeoBtn) {
    headerGeoBtn.onclick = () => {
      closeModal('textModal');
      openGeometryModal((dataUrl) => {
        setTxtImg(dataUrl);
        $('imgUploadPanel').classList.remove('hidden');
        openModal('textModal');
      }, () => {
        openModal('textModal');
      });
    };
  }

  const geoBtn = $('txtOpenGeoBtn');
  if (geoBtn) {
    geoBtn.onclick = () => {
      closeModal('textModal');
      openGeometryModal((dataUrl) => {
        setTxtImg(dataUrl);
        $('imgUploadPanel').classList.remove('hidden');
        openModal('textModal');
      }, () => {
        openModal('textModal');
      });
    };
  }

  const blankGeoBtn = $('blankOpenGeoBtn');
  if (blankGeoBtn) {
    blankGeoBtn.onclick = () => {
      closeModal('textModal');
      openGeometryModal((dataUrl) => {
        setBlankImg(dataUrl);
        $('blankImgPanel').classList.remove('hidden');
        openModal('textModal');
      }, () => {
        openModal('textModal');
      });
    };
  }

  $('txtPreamble').addEventListener('paste', () => { setTimeout(() => autoParseQuestion($('txtPreamble').value), 10); });
  $('txtRoot').addEventListener('paste', () => { setTimeout(() => autoParseQuestion($('txtRoot').value), 10); });
}


// Module Exports
__exports['setOnSaveCallback'] = setOnSaveCallback;
__exports['renderBlankList'] = renderBlankList;
__exports['setQuestionKind'] = setQuestionKind;
__exports['renderOptionAnswer'] = renderOptionAnswer;
__exports['renderLevelPills'] = renderLevelPills;
__exports['openText'] = openText;
__exports['saveText'] = saveText;
__exports['extractMarked'] = extractMarked;
__exports['autoParseQuestion'] = autoParseQuestion;
__exports['handleInsertGeometryQuestion'] = handleInsertGeometryQuestion;
__exports['handleInsertScienceQuestion'] = handleInsertScienceQuestion;
__exports['initTextModal'] = initTextModal;

});

__define('modules/questionManager.js', function(__exports, __require, __module) {
const { questions, setQuestions, S, LETTERS, MAX } = __require('state.js');
const { $, uid, esc, setProgress, defaultBaseName, todayStr, parseTags } = __require('utils.js');
const { openText } = __require('modules/textModal.js');

let dragIdx = null;
let groupTarget = null, groupSel = [];
let onStateChanged = null;

function setOnQuestionChangeCallback(fn) {
  onStateChanged = fn;
}

function notifyChange() {
  if (typeof onStateChanged === 'function') {
    onStateChanged();
  }
}

function showPreview(q) {
  if (q.type === 'text' && q.kind === 'bosluk') {
    $('previewBody').innerHTML = `<div class="text-sm leading-relaxed">
        <span class="rounded bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-900">BOŞLUK DOLDURMA</span>
        ${q.imgSrc ? `<img src="${q.imgSrc}" class="mt-3 max-h-56 rounded-lg border border-slate-200">` : ''}
        <div class="mt-3 whitespace-pre-wrap text-slate-800 dark:text-slate-200">${esc(q.blankText).replace(/(\.\.\.|_{2,})/g, '<b class="text-amber-700">______________</b>')}</div>
        ${(q.wordBank || []).length ? `<div class="mt-4 rounded border border-amber-300 bg-amber-50 p-2 text-xs"><b class="text-amber-900">Kelime Havuzu:</b> ${esc((q.wordBank || []).join('  •  '))}</div>` : ''}
      </div>`;
  } else {
    $('previewBody').innerHTML = q.type === 'text'
      ? `<div class="text-sm leading-relaxed">
           ${q.imgSrc ? `<img src="${q.imgSrc}" class="mb-3 max-h-56 rounded-lg border border-slate-200">` : ''}
            ${q.text ? `<div class="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">${esc(q.text)}</div>` : ''}
            ${q.root ? `<div class="mt-2 font-bold text-slate-900 dark:text-slate-100 whitespace-pre-wrap">${esc(q.root)}</div>` : ''}
            <div class="mt-3 ${q.layout === 'h' ? 'flex flex-wrap gap-4' : 'space-y-1.5'}">${(q.options || []).filter(Boolean)
              .map((o, k) => `<div><b class="text-slate-900 dark:text-slate-100">${LETTERS[k]})</b> ${esc(o)}</div>`).join('')}</div>
           ${q.blank ? `<div class="mt-3 border-t pt-2 text-xs italic text-slate-400">Klasik / Açık uçlu soru (${q.blank} mm boşluk)</div>` : ''}
         </div>`
      : `<img src="${q.src}" class="max-h-[80vh]">`;
  }
  $('preview').classList.replace('hidden', 'flex');
}

function openGroup(q) {
  groupTarget = q;
  groupSel = questions.filter(x => q.groupId && x.groupId === q.groupId && x.id !== q.id).map(x => x.id);
  $('gStem').value = q.stem || '';
  const g = $('gGrid');
  g.innerHTML = '';
  questions.forEach((x, i) => {
    if (x.id === q.id) return;
    const b = document.createElement('button');
    const on = () => groupSel.includes(x.id);
    const paint = () => b.className = 'rounded-lg border p-1.5 transition ' + (on() ? 'border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-800' : 'border-slate-200 hover:border-slate-400 dark:border-slate-700');
    b.innerHTML = (x.type === 'text'
      ? `<div class="h-20 overflow-hidden text-left text-[9px] leading-tight text-slate-600 dark:text-slate-400">${esc(x.text || x.root || x.blankText || '')}</div>`
      : `<img src="${x.src}" class="h-20 w-full object-contain">`) + `<span class="mt-1 block text-[10px] font-medium text-slate-400">${i + 1}</span>`;
    paint();
    b.onclick = () => {
      groupSel = on() ? groupSel.filter(id => id !== x.id) : [...groupSel, x.id];
      paint();
    };
    g.appendChild(b);
  });
  $('groupModal').classList.replace('hidden', 'flex');
}

function render() {
  $('qCount').textContent = questions.length;
  $('ansCount').textContent = questions.filter(q => q.answer).length;
  const g = $('grid');
  g.innerHTML = '';
  if (!questions.length) {
    g.innerHTML = `<div id="emptyState" class="col-span-full flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-20 text-center dark:border-slate-700 dark:bg-slate-900">
      <div>
        <p class="text-[15px] font-medium text-slate-700 dark:text-slate-300">Henüz soru oluşturmadınız</p>
        <p class="mt-1.5 text-[13px] leading-relaxed text-slate-400">
          Dilerseniz yukarıdaki seçenekleri kullanarak<br><b class="text-slate-600 dark:text-slate-300">Yazılı Kağıdı</b> veya <b class="text-slate-600 dark:text-slate-300">Konu Denemesi</b> oluşturabilirsiniz
        </p>
      </div></div>`;
    notifyChange();
    return;
  }
  g.className = 'grid grid-cols-2 gap-3 xl:grid-cols-3';
  questions.forEach((q, i) => {
    const d = document.createElement('div');
    d.className = 'card group relative cursor-grab rounded-xl border border-slate-200 bg-white p-2.5 transition hover:border-slate-300 hover:shadow-md active:cursor-grabbing dark:border-slate-800 dark:bg-slate-900';
    if (q.groupId) {
      d.style.borderColor = document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#0f172a';
    }
    d.draggable = true;
    d.ondragstart = () => dragIdx = i;
    d.ondragover = e => e.preventDefault();
    d.ondrop = () => {
      if (dragIdx !== null && dragIdx !== i) {
        const [it] = questions.splice(dragIdx, 1);
        questions.splice(i, 0, it);
        render();
      }
    };
    d.ondblclick = () => showPreview(q);
    const lvl = q.level || 'orta';
    const lvlCfg = {
      kolay: { label: 'Kolay', cls: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' },
      orta: { label: 'Orta', cls: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300' },
      zor: { label: 'Zor', cls: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300' }
    }[lvl] || { label: 'Orta', cls: 'border-slate-200 bg-slate-50 text-slate-700' };

    const qKindLabel = q.type === 'text'
      ? (q.kind === 'bosluk' ? 'Boşluk' : (q.kind === 'klasik' ? 'Klasik' : 'Test'))
      : 'Görsel';

    d.innerHTML = `
      <div class="flex items-center justify-between gap-1.5 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-1.5">
          <span class="rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-bold text-white dark:bg-white dark:text-slate-900">#${i + 1}</span>
          <span class="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">${qKindLabel}</span>
          <button type="button" class="btn-lvl-cycle rounded border px-1.5 py-0.2 text-[9px] font-bold transition hover:scale-105 ${lvlCfg.cls}" title="Zorluğu değiştirmek için tıklayın">${lvlCfg.label}</button>
        </div>
        <div class="tools flex items-center gap-1">
          <button class="btn-mini" data-a="prev" title="Önizle">🔍</button>
          ${q.type === 'text' ? '<button class="btn-mini" data-a="edit" title="Metni Düzenle">✏️</button>' : ''}
          <button class="btn-mini" data-a="grp" title="Gruplandır">🔗</button>
          <button class="btn-mini" data-a="up" title="Yukarı">↑</button>
          <button class="btn-mini" data-a="down" title="Aşağı">↓</button>
          <button class="btn-mini !text-rose-600 hover:!bg-rose-50 dark:hover:!bg-rose-950/40" data-a="del" title="Sil">✕</button>
        </div>
      </div>

      ${q.type === 'text'
        ? (q.kind === 'bosluk'
          ? `<div class="relative h-32 overflow-hidden rounded-lg bg-slate-50 p-2.5 text-left text-[11px] leading-snug dark:bg-slate-800">
               ${q.imgSrc ? `<span class="absolute right-2 bottom-2 z-10 rounded bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-medium text-white">📷 Görsel</span>` : ''}
               <div class="text-slate-700 dark:text-slate-300">${esc(q.blankText || '').replace(/(\.\.\.|_{2,})/g, '<span class="text-slate-400">______</span>')}</div>
               ${(q.wordBank || []).length ? `<div class="mt-1 text-[10px] text-slate-400 font-medium">Havuz: ${esc((q.wordBank || []).join(' · '))}</div>` : ''}
             </div>`
          : `<div class="relative h-32 overflow-hidden rounded-lg bg-slate-50 p-2.5 text-left text-[11px] leading-snug dark:bg-slate-800">
                ${q.imgSrc ? `<span class="absolute right-2 bottom-2 z-10 rounded bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-medium text-white">📷 Görsel</span>` : ''}
                ${q.text ? `<div class="text-slate-500 text-[10px] line-clamp-1">${esc(q.text)}</div>` : ''}
                ${q.root ? `<div class="mt-0.5 font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">${esc(q.root)}</div>` : ''}
                <div class="mt-1 ${q.layout === 'h' ? 'flex flex-wrap gap-2' : 'space-y-0.5'} text-slate-600 dark:text-slate-300">${(q.options || []).filter(Boolean)
                  .map((o, k) => `<div><span class="font-bold text-slate-400">${LETTERS[k]}</span> ${esc(o)}</div>`).join('')}</div>
                ${q.blank ? `<div class="mt-1 text-[10px] text-slate-400 italic">${q.blank} mm cevap satırı</div>` : ''}
              </div>`)
        : `<img src="${q.src}" class="h-32 w-full rounded-lg object-contain bg-slate-50 dark:bg-slate-800">`}

      ${(q.tags && q.tags.length) ? `
        <div class="mt-2 flex flex-wrap gap-1">
          ${q.tags.map(t => `<span class="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">#${esc(t)}</span>`).join('')}
        </div>
      ` : ''}

      <div class="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
        <span class="text-[10px] font-medium text-slate-400">Doğru Şık:</span>
        <div class="flex gap-1">${LETTERS.map(l =>
          `<button data-l="${l}" class="h-6 w-6 rounded-md border text-[11px] font-bold transition ${q.answer === l ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 shadow-sm' : 'border-slate-200 text-slate-400 hover:border-slate-400 dark:border-slate-700'}">${l}</button>`).join('')}</div>
      </div>`;

    const lvlBtn = d.querySelector('.btn-lvl-cycle');
    if (lvlBtn) {
      lvlBtn.onclick = (ev) => {
        ev.stopPropagation();
        const cycle = { kolay: 'orta', orta: 'zor', zor: 'kolay' };
        q.level = cycle[q.level || 'orta'] || 'orta';
        render();
      };
    }

    d.querySelectorAll('[data-a]').forEach(b => b.onclick = ev => {
      ev.stopPropagation();
      const a = b.dataset.a;
      if (a === 'del') questions.splice(i, 1);
      if (a === 'prev') return showPreview(q);
      if (a === 'edit') return openText(q);
      if (a === 'grp') return openGroup(q);
      if (a === 'up' && i > 0) { const [it] = questions.splice(i, 1); questions.splice(i - 1, 0, it); }
      if (a === 'down' && i < questions.length - 1) { const [it] = questions.splice(i, 1); questions.splice(i + 1, 0, it); }
      render();
    });

    d.querySelectorAll('[data-l]').forEach(b => b.onclick = ev => {
      ev.stopPropagation();
      q.answer = q.answer === b.dataset.l ? null : b.dataset.l;
      render();
    });

    g.appendChild(d);
  });

  notifyChange();
}

async function addFiles(list, syncUIFn) {
  const arr = [...list];
  const db = arr.find(f => f.name.toLowerCase().endsWith('.db'));
  if (db) {
    try {
      const raw = await db.text();
      const d = JSON.parse(raw);
      if (!d || !Array.isArray(d.questions)) throw new Error('Geçersiz taslak dosyası.');
      setQuestions(d.questions);
      if (d.settings && typeof d.settings === 'object') Object.assign(S, d.settings);
      if (typeof syncUIFn === 'function') syncUIFn();
      render();
    } catch (e) {
      alert('Taslak dosyası okunamadı. Dosyanın bu araç ile kaydedilmiş bir ".db" olduğundan emin olun.');
    }
    return;
  }
  const imgs = arr.filter(f => /image\/(jpeg|png|gif)/.test(f.type));
  if (!imgs.length) {
    alert('Yüklemek istediğiniz görsel sadece JPG, PNG veya GIF formatında olabilir.');
    return;
  }
  imgs.sort((a, b) => a.name.localeCompare(b.name, 'tr', { numeric: true }));
  let done = 0;
  setProgress(0, imgs.length);
  for (const f of imgs) {
    await new Promise(res => {
      const r = new FileReader();
      r.onload = () => {
        const im = new Image();
        im.onload = () => {
          if (questions.length < MAX) {
            questions.push({
              id: uid(),
              src: r.result,
              w: im.width,
              h: im.height,
              answer: null,
              groupId: null,
              stem: '',
              name: f.name
            });
          }
          done++;
          setProgress(done, imgs.length);
          render();
          res();
        };
        im.src = r.result;
      };
      r.readAsDataURL(f);
    });
  }
  setTimeout(() => setProgress(0, null), 1200);
}

function initQuestionManager({ syncUIFn, collectFn }) {
  $('pickBtn').onclick = () => $('fileInput').click();
  $('fileInput').onchange = e => {
    addFiles(e.target.files, syncUIFn);
    e.target.value = '';
  };

  const dz = $('dropzone');
  dz.addEventListener('dragover', e => {
    e.preventDefault();
    dz.classList.add('border-sky-400', 'bg-sky-50/50');
  });
  dz.addEventListener('dragleave', () => dz.classList.remove('border-sky-400', 'bg-sky-50/50'));
  dz.addEventListener('drop', e => {
    e.preventDefault();
    dz.classList.remove('border-sky-400', 'bg-sky-50/50');
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files, syncUIFn);
  });

  $('clearAll').onclick = () => {
    if (confirm('Tüm sorular silinsin mi?')) {
      questions.length = 0;
      render();
    }
  };

  $('preview').onclick = () => $('preview').classList.replace('flex', 'hidden');

  $('gCancel').onclick = () => $('groupModal').classList.replace('flex', 'hidden');
  $('gSave').onclick = () => {
    const gid = (groupTarget && groupTarget.groupId) || uid();
    questions.forEach(x => {
      if (groupTarget && x.id === groupTarget.id) {
        x.groupId = groupSel.length ? gid : null;
        x.stem = $('gStem').value;
      } else if (groupSel.includes(x.id)) {
        x.groupId = gid;
        x.stem = '';
      } else if (x.groupId === gid) {
        x.groupId = null;
        x.stem = '';
      }
    });
    $('groupModal').classList.replace('flex', 'hidden');
    render();
  };

  $('saveDraft').onclick = () => {
    try {
      if (typeof collectFn === 'function') collectFn();
      if (!questions.length) {
        alert('Kaydedilecek soru bulunamadı. Önce en az bir soru ekleyin.');
        return;
      }
      const payload = JSON.stringify({ questions, settings: S });
      const blob = new Blob([payload], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const tParsed = parseTags(S.title || 'Test');
      const baseName = defaultBaseName(tParsed.clean, S);
      const a = document.createElement('a');
      a.href = url;
      a.download = baseName + ' - ' + todayStr() + '.db';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (e) {
      alert('Çalışma kaydedilirken hata oluştu: ' + (e && e.message ? e.message : e));
    }
  };
}


// Module Exports
__exports['setOnQuestionChangeCallback'] = setOnQuestionChangeCallback;
__exports['showPreview'] = showPreview;
__exports['openGroup'] = openGroup;
__exports['render'] = render;
__exports['addFiles'] = addFiles;
__exports['initQuestionManager'] = initQuestionManager;

});

__define('modules/previewStage.js', function(__exports, __require, __module) {
const { questions, S } = __require('state.js');
const { $, openModal, closeModal } = __require('utils.js');
const { buildPreviewPages, pageSizeMM, getMebLogoBox, imgCache, fixLogoAspect, calculateQuestionBounds } = __require('modules/pdfEngine.js');
const { openText } = __require('modules/textModal.js');
const { render } = __require('modules/questionManager.js');

let pvPages = [];
let pvIndex = 0;
let pvTimer = null, pvBusy = false, pvDirty = false;
let pvZoom = 0, pvFitZoom = 1;
let selectedHeaderItems = new Set();
let dragState = null, suppressClick = false;
let headerDragState = null;
let icTarget = null, icSel = null, icDraw = false, icP0 = { x: 0, y: 0 };
let pvPan = null;
let collectFnRef = null;

function setCollectFn(fn) {
  collectFnRef = fn;
}

function pvSetBusy(on) {
  $('pvBusy').classList.toggle('on', on);
  $('pvLiveDot').classList.toggle('busy', on);
}

function schedulePreview() {
  clearTimeout(pvTimer);
  pvTimer = setTimeout(runPreview, 320);
}

function refreshNow() {
  clearTimeout(pvTimer);
  runPreview();
}

async function runPreview() {
  if (pvBusy) { pvDirty = true; return; }
  pvBusy = true;
  pvSetBusy(true);
  try {
    if (typeof collectFnRef === 'function') collectFnRef();
    const pages = await buildPreviewPages();
    pvPages = pages;
    if (pvIndex > pvPages.length - 1) pvIndex = pvPages.length - 1;
    if (pvIndex < 0) pvIndex = 0;
    showPvPage();
  } catch (e) {
    console.error('Önizleme hatası:', e);
  }
  pvBusy = false;
  pvSetBusy(false);
  if (pvDirty) {
    pvDirty = false;
    schedulePreview();
  }
}

function showPvPage() {
  const stack = $('pvStack');
  stack.innerHTML = '';
  const has = pvPages.length > 0;
  $('pvEmpty').classList.toggle('hide', has);
  if (has) {
    const c = pvPages[pvIndex].canvas;
    c.className = 'pv-canvas';
    stack.appendChild(c);
  }
  $('pvPageInfo').textContent = has ? (pvIndex + 1) + ' / ' + pvPages.length : '0 / 0';
  $('pvPrev').disabled = !has || pvIndex === 0;
  $('pvNext').disabled = !has || pvIndex >= pvPages.length - 1;
  const sz = (S.pageSize || 'a4').toUpperCase();
  const yon = S.orientation === 'landscape' ? 'Yatay' : 'Dikey';
  $('pvMeta').textContent = has
    ? sz + ' · ' + yon + ' · ' + (S.columns || 2) + ' sütun · ' + questions.length + ' soru · ' + pvPages.length + ' sayfa'
    : '—';
  if ($('pvBig').classList.contains('open')) showPvBig();
}

function pvDock(open) {
  const pane = $('previewPane');
  const card = pane && pane.querySelector('.pv-card');
  if (!card) return;
  const first = card.getBoundingClientRect();
  document.body.classList.toggle('pv-docked', open);
  const last = card.getBoundingClientRect();
  if (!first.width || !last.width) return;
  const dx = first.left - last.left, dy = first.top - last.top;
  const sx = first.width / last.width, sy = first.height / last.height;
  card.style.transformOrigin = 'top left';
  card.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';
  requestAnimationFrame(() => {
    card.style.transition = 'transform .55s cubic-bezier(.22,1,.36,1)';
    card.style.transform = 'translate(0,0) scale(1,1)';
    setTimeout(() => { card.style.transition = ''; card.style.transform = ''; card.style.transformOrigin = ''; }, 600);
  });
}

function fitPreviewZoom() {
  const wrap = $('pvBigWrap'), cv = $('pvBigCanvas');
  if (!cv.width || !wrap.clientWidth || !wrap.clientHeight) return 1;
  return Math.min(1, (wrap.clientWidth - 28) / cv.width, (wrap.clientHeight - 18) / cv.height);
}

function applyPreviewZoom() {
  const cv = $('pvBigCanvas');
  if (!cv.width) return;
  cv.style.width = Math.round(cv.width * pvZoom) + 'px';
  cv.style.height = Math.round(cv.height * pvZoom) + 'px';
  requestAnimationFrame(layoutOverlay);
}

function showPvBig() {
  const cv = $('pvBigCanvas');
  if (!pvPages.length) { $('pvOverlay').innerHTML = ''; $('pvBigInfo').textContent = '0 / 0'; return; }
  const src = pvPages[pvIndex].canvas;
  cv.width = src.width; cv.height = src.height;
  cv.getContext('2d').drawImage(src, 0, 0);
  pvFitZoom = fitPreviewZoom();
  if (!pvZoom) pvZoom = pvFitZoom;
  pvZoom = Math.max(pvFitZoom * .55, Math.min(3.5, pvZoom));
  applyPreviewZoom();
  $('pvBigInfo').textContent = (pvIndex + 1) + ' / ' + pvPages.length;
  $('pvBigPrev').disabled = pvIndex === 0;
  $('pvBigNext').disabled = pvIndex >= pvPages.length - 1;
  requestAnimationFrame(layoutOverlay);
}

function layoutOverlay() {
  const cv = $('pvBigCanvas'), pg = pvPages[pvIndex], ov = $('pvOverlay');
  if (!pg) { ov.innerHTML = ''; return; }
  const dispW = cv.clientWidth || cv.width, k = dispW / pg.w;
  ov.style.width = dispW + 'px';
  ov.style.height = (pg.h * k) + 'px';
  
  const snapLine = $('pvSnapLine');
  const marquee = $('pvMarquee');
  ov.innerHTML = '';
  ov.appendChild(snapLine);
  ov.appendChild(marquee);
  
  if (S.showQuestionAreaGuide) {
    try {
      const qb = calculateQuestionBounds();
      const guideBox = document.createElement('div');
      guideBox.className = 'pv-qa-guide';
      guideBox.style.left = (qb.left * k) + 'px';
      guideBox.style.top = (qb.contentTop * k) + 'px';
      guideBox.style.width = (qb.width * k) + 'px';
      guideBox.style.height = (qb.usableH * k) + 'px';
      guideBox.innerHTML = `<span class="pv-qa-tag">📐 Güvenli Soru Alanı (${Math.round(qb.usableH)} mm)</span>`;
      ov.appendChild(guideBox);
    } catch (e) {}
  }
  
  (pg.items || []).forEach((it, i) => {
    const chip = document.createElement('div');
    chip.className = 'pvChip';
    chip.style.left = (it.x * k) + 'px';
    chip.style.top = (it.y * k) + 'px';
    chip.style.width = (it.w * k) + 'px';
    chip.style.height = (it.h * k) + 'px';
    const isImg = it.q.type !== 'text';
    chip.innerHTML =
      '<span class="pvNum">' + (i + 1) + '</span>' +
      '<span class="pvActs">' +
        (isImg
          ? '<button type="button" data-act="crop" title="Görseli kırp">✂</button>' +
            '<button type="button" data-act="fit" title="Sütun genişliğine sığdır">⤢</button>'
          : '<button type="button" data-act="edit" title="Metni düzenle">✎</button>') +
      '</span>' +
      (isImg ? '<span class="pvRz" data-act="rz" title="Boyutlandır"></span>' : '');
    ov.appendChild(chip);
    wireChip(chip, it, k);
  });
  
  if (pg.mebHeaderItems) {
    const headerLabels = {
      mebYear:'YIL', mebSchool:'OKUL', mebLesson:'DERS', mebExam:'SINIF+SINAV', mebDate:'TARIH',
      mebNameLbl:'AD', mebClassLbl:'SINIF ET', mebNoLbl:'NO', mebScoreLbl:'PUAN'
    };
    Object.values(pg.mebHeaderItems).forEach((it) => {
      if (!it.text) return;
      const chip = document.createElement('div');
      chip.className = 'pvChip pvTextChip' + (selectedHeaderItems.has(it.id) ? ' selected' : '');
      chip.dataset.hid = it.id;
      chip.style.left = (it.x * k) + 'px';
      chip.style.top = (it.y * k) + 'px';
      chip.style.width = (it.w * k) + 'px';
      chip.style.height = (it.h * k) + 'px';
      chip.innerHTML = '<span class="pvNum" style="background:#475569;font-size:7px">' + (headerLabels[it.id] || it.id) + '</span>';
      ov.appendChild(chip);
      wireHeaderChip(chip, it, k);
    });
  }
  
  if (pg.logoBox) {
    const box = pg.logoBox;
    const chip = document.createElement('div');
    chip.className = 'pvChip pvLogoChip' + (selectedHeaderItems.has('logo') ? ' selected' : '');
    chip.dataset.hid = 'logo';
    chip.style.left = (box.x * k) + 'px';
    chip.style.top = (box.y * k) + 'px';
    chip.style.width = (box.w * k) + 'px';
    chip.style.height = (box.h * k) + 'px';
    chip.innerHTML = '<span class="pvNum">LOGO</span>' +
      '<span class="pvActs"><button type="button" data-act="logofix" title="Logoyu doğal oranına getir">↺</button></span>' +
      '<span class="pvRz" data-act="rz" title="Boyutlandır"></span>';
    ov.appendChild(chip);
    wireLogoChipCombined(chip, k);
  }
}

function wireChip(chip, it, k) {
  chip.addEventListener('pointerdown', (e) => {
    const act = e.target.dataset.act;
    if (act && act !== 'rz') return;
    dragState = {
      chip, it, k, mode: act === 'rz' ? 'rz' : 'drag',
      sx: e.clientX, sy: e.clientY, moved: false,
      w0: it.w, h0: it.h, scale0: it.q.scale || 1
    };
    chip.setPointerCapture(e.pointerId);
    chip.classList.add('dragging');
    e.preventDefault();
  });
  chip.addEventListener('pointermove', (e) => {
    const d = dragState; if (!d || d.chip !== chip) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
    if (!d.moved) return;
    if (d.mode === 'rz') {
      const baseW = d.w0 / d.scale0;
      let nw = Math.max(12, Math.min(baseW, d.w0 + dx / d.k));
      let nh = Math.max(8, d.h0 + dy / d.k);
      it.q.scale = nw / baseW;
      it.q.aspect = nh / nw;
      chip.style.width = (nw * d.k) + 'px';
      chip.style.height = (nh * d.k) + 'px';
    } else {
      chip.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      showDropLine(e.clientX, e.clientY, d.it.q.id);
    }
  });
  const end = (e) => {
    const d = dragState; if (!d || d.chip !== chip) return;
    chip.classList.remove('dragging'); chip.style.transform = '';
    dragState = null; hideDropLine();
    if (!d.moved) return;
    suppressClick = true;
    if (d.mode === 'rz') { refreshNow(); return; }
    const target = dropTarget(e.clientX, e.clientY, d.it.q.id);
    if (target) moveQuestion(d.it.q.id, target); else refreshNow();
  };
  chip.addEventListener('pointerup', end);
  chip.addEventListener('pointercancel', end);
  chip.addEventListener('click', (e) => {
    if (suppressClick) { suppressClick = false; return; }
    const act = e.target.dataset.act;
    if (act === 'edit') return editFromPaper(it.q);
    if (act === 'crop') return openImgCrop(it.q);
    if (act === 'fit') { it.q.scale = 1; it.q.aspect = undefined; return refreshNow(); }
    if (it.q.type === 'text') editFromPaper(it.q);
  });
}

function syncHeaderSelectionDom() {
  document.querySelectorAll('.pvTextChip,.pvLogoChip').forEach((chip) => {
    chip.classList.toggle('selected', selectedHeaderItems.has(chip.dataset.hid));
  });
}

function startHeaderDrag(e, startId, k, isLogo, isRz) {
  if (isRz) {
    headerDragState = {
      mode: 'resize_logo',
      sx: e.clientX, sy: e.clientY,
      w0: S.logoW || 26, h0: S.logoH || 26,
      k, moved: false
    };
    return;
  }
  if (!selectedHeaderItems.has(startId)) {
    if (!e.ctrlKey && !e.shiftKey) {
      selectedHeaderItems.clear();
    }
    selectedHeaderItems.add(startId);
    syncHeaderSelectionDom();
  }
  const itemsState = {};
  const pg = pvPages[pvIndex];
  
  selectedHeaderItems.forEach((id) => {
    if (id === 'logo') {
      const box = getMebLogoBox(S.margin || 10);
      itemsState[id] = { x0: box.x, y0: box.y, w: box.w, h: box.h };
    } else if (pg.mebHeaderItems && pg.mebHeaderItems[id]) {
      const it = pg.mebHeaderItems[id];
      itemsState[id] = { x0: it.x, y0: it.y, w: it.w, h: it.h };
    }
  });
  
  headerDragState = {
    mode: 'drag',
    sx: e.clientX, sy: e.clientY,
    k, itemsState, moved: false,
    startId
  };
}

function moveHeaderDrag(e) {
  const d = headerDragState; if (!d) return;
  const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
  if (Math.abs(dx) + Math.abs(dy) > 2) d.moved = true;
  if (!d.moved) return;
  
  const snapLine = $('pvSnapLine');
  const [PW] = pageSizeMM();
  const pageCenter = PW / 2;
  
  if (d.mode === 'resize_logo') {
    const nw = Math.max(8, d.w0 + dx / d.k);
    const nh = Math.max(8, d.h0 + dy / d.k);
    const logoChip = document.querySelector('.pvLogoChip');
    if (logoChip) {
      logoChip.style.width = (nw * d.k) + 'px';
      logoChip.style.height = (nh * d.k) + 'px';
    }
    d.nw = nw; d.nh = nh;
    return;
  }
  
  let deltaX = dx / d.k;
  let deltaY = dy / d.k;
  let snapX = null;
  const SNAP_THRESHOLD = 1.6;
  
  for (const [, s] of Object.entries(d.itemsState)) {
    const targetX = s.x0 + deltaX;
    const targetCenterX = targetX + s.w / 2;
    if (Math.abs(targetCenterX - pageCenter) < SNAP_THRESHOLD) {
      const exactDeltaX = (pageCenter - s.w / 2) - s.x0;
      deltaX = exactDeltaX;
      snapX = pageCenter;
      break;
    }
  }
  
  if (snapX !== null) {
    snapLine.style.display = 'block';
    snapLine.style.left = (snapX * d.k) + 'px';
    snapLine.style.height = '100%';
  } else {
    snapLine.style.display = 'none';
  }
  
  const chips = document.querySelectorAll('.pvChip');
  chips.forEach((chip) => {
    const id = chip.dataset.hid;
    if (!id || !d.itemsState[id]) return;
    const s = d.itemsState[id];
    chip.style.left = ((s.x0 + deltaX) * d.k) + 'px';
    chip.style.top = ((s.y0 + deltaY) * d.k) + 'px';
  });
  
  d.deltaX = deltaX;
  d.deltaY = deltaY;
}

function endHeaderDrag(e) {
  const d = headerDragState; if (!d) return;
  headerDragState = null;
  $('pvSnapLine').style.display = 'none';
  
  if (!d.moved) return;
  suppressClick = true;
  
  if (d.mode === 'resize_logo') {
    S.logoW = d.nw; S.logoH = d.nh;
    refreshNow();
    return;
  }
  
  S.mebPos = S.mebPos || {};
  for (const [id, s] of Object.entries(d.itemsState)) {
    const nx = s.x0 + d.deltaX;
    const ny = s.y0 + d.deltaY;
    if (id === 'logo') {
      S.logoX = nx;
      S.logoY = ny;
    } else {
      S.mebPos[id] = { x: nx, y: ny };
    }
  }
  refreshNow();
}

function wireHeaderChip(chip, it, k) {
  chip.addEventListener('pointerdown', (e) => {
    chip.setPointerCapture(e.pointerId);
    startHeaderDrag(e, it.id, k, false, false);
    e.stopPropagation();
  });
  chip.addEventListener('pointermove', (e) => {
    moveHeaderDrag(e);
    e.stopPropagation();
  });
  const up = (e) => {
    try { chip.releasePointerCapture(e.pointerId); } catch (err) {}
    endHeaderDrag(e);
    e.stopPropagation();
  };
  chip.addEventListener('pointerup', up);
  chip.addEventListener('pointercancel', up);
}

function wireLogoChipCombined(chip, k) {
  chip.addEventListener('click', (e) => {
    if (e.target.dataset.act === 'logofix') {
      e.stopPropagation();
      fixLogoAspect(refreshNow);
    }
  });
  chip.addEventListener('pointerdown', (e) => {
    if (e.target.dataset.act === 'logofix') { e.stopPropagation(); return; }
    const isRz = e.target.dataset.act === 'rz';
    chip.setPointerCapture(e.pointerId);
    startHeaderDrag(e, 'logo', k, true, isRz);
    e.stopPropagation();
  });
  chip.addEventListener('pointermove', (e) => {
    moveHeaderDrag(e);
    e.stopPropagation();
  });
  const up = (e) => {
    try { chip.releasePointerCapture(e.pointerId); } catch (err) {}
    endHeaderDrag(e);
    e.stopPropagation();
  };
  chip.addEventListener('pointerup', up);
  chip.addEventListener('pointercancel', up);
}

function pvPageCoords(clientX, clientY) {
  const pg = pvPages[pvIndex], cv = $('pvBigCanvas'), r = cv.getBoundingClientRect();
  const k = r.width / pg.w;
  return { mx: (clientX - r.left) / k, my: (clientY - r.top) / k, k };
}

function dropTarget(cx, cy, selfId) {
  const pg = pvPages[pvIndex]; if (!pg) return null;
  const { mx, my } = pvPageCoords(cx, cy);
  let best = null, bd = Infinity;
  (pg.items || []).forEach((it) => {
    if (it.q.id === selfId) return;
    const dd = Math.hypot(it.x + it.w / 2 - mx, it.y + it.h / 2 - my);
    if (dd < bd) { bd = dd; best = it; }
  });
  return best ? { id: best.q.id, after: my > best.y + best.h / 2 } : null;
}

function showDropLine(cx, cy, selfId) {
  const pg = pvPages[pvIndex]; if (!pg) return;
  const target = dropTarget(cx, cy, selfId);
  if (!target) return hideDropLine();
  const it = (pg.items || []).find((i) => i.q.id === target.id); if (!it) return;
  const { k } = pvPageCoords(cx, cy);
  const line = $('pvDropLine');
  line.style.display = 'block';
  line.style.left = (it.x * k) + 'px';
  line.style.width = (it.w * k) + 'px';
  line.style.top = ((target.after ? it.y + it.h : it.y) * k - 1) + 'px';
}

function hideDropLine() {
  $('pvDropLine').style.display = 'none';
}

function moveQuestion(dragId, target) {
  const di = questions.findIndex((q) => q.id === dragId);
  if (di < 0 || dragId === target.id) return refreshNow();
  const [dq] = questions.splice(di, 1);
  const ti = questions.findIndex((q) => q.id === target.id);
  const at = ti < 0 ? questions.length : ti + (target.after ? 1 : 0);
  questions.splice(at, 0, dq);
  render();
  refreshNow();
}

function editFromPaper(q) {
  $('pvBig').classList.remove('open');
  openText(q);
}

function openImgCrop(q) {
  icTarget = q; icSel = null;
  $('icImg').src = q.src;
  $('imgCropModal').classList.add('open');
  requestAnimationFrame(drawIcRect);
}

function icPos(e) {
  const im = $('icImg'), r = im.getBoundingClientRect();
  return { x: Math.max(0, Math.min(r.width, e.clientX - r.left)), y: Math.max(0, Math.min(r.height, e.clientY - r.top)) };
}

function drawIcRect() {
  const r = $('icRect');
  if (!icSel || icSel.w < 2 || icSel.h < 2) { r.style.display = 'none'; return; }
  r.style.display = 'block';
  r.style.left = icSel.x + 'px'; r.style.top = icSel.y + 'px';
  r.style.width = icSel.w + 'px'; r.style.height = icSel.h + 'px';
}

function closePvBig() {
  $('pvBig').classList.remove('open');
  pvZoom = 0;
  selectedHeaderItems.clear();
}

function initPreviewStage() {
  $('pvPrev').onclick = () => { if (pvIndex > 0) { pvIndex--; showPvPage(); } };
  $('pvNext').onclick = () => { if (pvIndex < pvPages.length - 1) { pvIndex++; showPvPage(); } };
  $('pvRefresh').onclick = () => { clearTimeout(pvTimer); runPreview(); };

  $('pvOpenBig').onclick = () => { pvZoom = 0; $('pvBig').classList.add('open'); requestAnimationFrame(showPvBig); };
  $('pvBigClose').onclick = closePvBig;
  $('pvBig').onclick = (e) => { if (e.target === $('pvBig')) closePvBig(); };
  $('pvBigPrev').onclick = () => { if (pvIndex > 0) { pvIndex--; showPvPage(); } };
  $('pvBigNext').onclick = () => { if (pvIndex < pvPages.length - 1) { pvIndex++; showPvPage(); } };
  $('pvZoomReset').onclick = () => { pvZoom = pvFitZoom; applyPreviewZoom(); };

  $('pvBigWrap').addEventListener('wheel', (e) => {
    if (!$('pvBig').classList.contains('open') || !pvZoom) return;
    e.preventDefault();
    const wrap = $('pvBigWrap'), cv = $('pvBigCanvas'), old = pvZoom;
    const next = Math.max(pvFitZoom * .55, Math.min(3.5, old * Math.exp(-e.deltaY * .0015)));
    if (Math.abs(next - old) < .001) return;
    const cr = cv.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
    const pointX = wrap.scrollLeft + e.clientX - cr.left;
    const pointY = wrap.scrollTop + e.clientY - cr.top;
    const mouseX = e.clientX - wr.left, mouseY = e.clientY - wr.top;
    pvZoom = next; applyPreviewZoom();
    const ratio = next / old;
    requestAnimationFrame(() => {
      wrap.scrollLeft = pointX * ratio - mouseX;
      wrap.scrollTop = pointY * ratio - mouseY;
    });
  }, { passive: false });

  const pvBigWrap = $('pvBigWrap');
  pvBigWrap.addEventListener('pointerdown', (e) => {
    if (!$('pvBig').classList.contains('open') || e.button !== 0) return;
    if (e.target.closest && e.target.closest('.pvChip')) return;
    
    const isMarqueeMode = e.shiftKey;
    const rect = $('pvOverlay').getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    
    pvPan = {
      id: e.pointerId,
      mode: isMarqueeMode ? 'marquee' : 'pan',
      x: e.clientX, y: e.clientY,
      startX, startY,
      left: pvBigWrap.scrollLeft, top: pvBigWrap.scrollTop,
      moved: false
    };
    
    if (isMarqueeMode) {
      const marq = $('pvMarquee');
      marq.style.display = 'block';
      marq.style.left = startX + 'px';
      marq.style.top = startY + 'px';
      marq.style.width = '0px';
      marq.style.height = '0px';
    } else {
      pvBigWrap.classList.add('panning');
    }
    
    pvBigWrap.setPointerCapture(e.pointerId);
  });

  pvBigWrap.addEventListener('pointermove', (e) => {
    if (!pvPan || pvPan.id !== e.pointerId) return;
    const dx = e.clientX - pvPan.x, dy = e.clientY - pvPan.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) pvPan.moved = true;
    
    if (pvPan.mode === 'marquee') {
      const rect = $('pvOverlay').getBoundingClientRect();
      const curX = e.clientX - rect.left;
      const curY = e.clientY - rect.top;
      
      const x = Math.min(pvPan.startX, curX);
      const y = Math.min(pvPan.startY, curY);
      const w = Math.abs(curX - pvPan.startX);
      const h = Math.abs(curY - pvPan.startY);
      
      const marq = $('pvMarquee');
      marq.style.left = x + 'px';
      marq.style.top = y + 'px';
      marq.style.width = w + 'px';
      marq.style.height = h + 'px';
    } else {
      pvBigWrap.scrollLeft = pvPan.left - dx;
      pvBigWrap.scrollTop = pvPan.top - dy;
    }
    e.preventDefault();
  });

  const stopPvPan = (e) => {
    if (!pvPan || pvPan.id !== e.pointerId) return;
    if (pvPan.mode === 'marquee') {
      const marq = $('pvMarquee');
      marq.style.display = 'none';
      if (pvPan.moved) {
        const mx = parseFloat(marq.style.left);
        const my = parseFloat(marq.style.top);
        const mw = parseFloat(marq.style.width);
        const mh = parseFloat(marq.style.height);
        
        if (!e.ctrlKey && !e.shiftKey) {
          selectedHeaderItems.clear();
        }
        
        const chips = document.querySelectorAll('.pvTextChip, .pvLogoChip');
        chips.forEach((chip) => {
          const cx = parseFloat(chip.style.left);
          const cy = parseFloat(chip.style.top);
          const cw = parseFloat(chip.style.width);
          const ch = parseFloat(chip.style.height);
          if (cx < mx + mw && cx + cw > mx && cy < my + mh && cy + ch > my) {
            const id = chip.dataset.hid;
            if (id) selectedHeaderItems.add(id);
          }
        });
        layoutOverlay();
      }
    } else {
      pvBigWrap.classList.remove('panning');
      if (!pvPan.moved) {
        selectedHeaderItems.clear();
        layoutOverlay();
      }
    }
    try { pvBigWrap.releasePointerCapture(e.pointerId); } catch (err) {}
    pvPan = null;
  };

  pvBigWrap.addEventListener('pointerup', stopPvPan);
  pvBigWrap.addEventListener('pointercancel', stopPvPan);

  window.addEventListener('resize', () => {
    if (!$('pvBig').classList.contains('open')) return;
    pvFitZoom = fitPreviewZoom();
    pvZoom = Math.max(pvFitZoom * .55, Math.min(3.5, pvZoom));
    applyPreviewZoom();
  });

  $('icStage').addEventListener('pointerdown', (e) => {
    icDraw = true; const p = icPos(e); icP0 = { x: p.x, y: p.y };
    icSel = { x: p.x, y: p.y, w: 0, h: 0 };
    $('icStage').setPointerCapture(e.pointerId); drawIcRect(); e.preventDefault();
  });
  $('icStage').addEventListener('pointermove', (e) => {
    if (!icDraw) return; const p = icPos(e);
    icSel = { x: Math.min(icP0.x, p.x), y: Math.min(icP0.y, p.y), w: Math.abs(p.x - icP0.x), h: Math.abs(p.y - icP0.y) };
    drawIcRect();
  });
  $('icStage').addEventListener('pointerup', () => { icDraw = false; });
  $('icReset').onclick = () => { icSel = null; drawIcRect(); };
  $('icClose').onclick = () => { $('imgCropModal').classList.remove('open'); icTarget = null; };
  $('imgCropModal').onclick = (e) => { if (e.target === $('imgCropModal')) { $('imgCropModal').classList.remove('open'); icTarget = null; } };
  $('icApply').onclick = () => {
    if (!icTarget) return;
    const im = $('icImg');
    if (!icSel || icSel.w < 6 || icSel.h < 6) { alert('Önce kırpılacak alanı çerçeveleyin.'); return; }
    const sc = im.naturalWidth / Math.max(1, im.clientWidth);
    const c = document.createElement('canvas');
    c.width = Math.round(icSel.w * sc); c.height = Math.round(icSel.h * sc);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(im, icSel.x * sc, icSel.y * sc, icSel.w * sc, icSel.h * sc, 0, 0, c.width, c.height);
    icTarget.src = c.toDataURL('image/jpeg', 0.92);
    icTarget.w = c.width; icTarget.h = c.height;
    icTarget.scale = 1; icTarget.aspect = undefined;
    delete imgCache[icTarget.id];
    $('imgCropModal').classList.remove('open');
    icTarget = null;
    render();
    refreshNow();
  };
}


// Module Exports
__exports['setCollectFn'] = setCollectFn;
__exports['pvSetBusy'] = pvSetBusy;
__exports['schedulePreview'] = schedulePreview;
__exports['refreshNow'] = refreshNow;
__exports['runPreview'] = runPreview;
__exports['showPvPage'] = showPvPage;
__exports['pvDock'] = pvDock;
__exports['showPvBig'] = showPvBig;
__exports['layoutOverlay'] = layoutOverlay;
__exports['closePvBig'] = closePvBig;
__exports['initPreviewStage'] = initPreviewStage;
Object.defineProperty(__exports, 'pvPages', { get: () => pvPages, set: (v) => { pvPages = v; }, enumerable: true, configurable: true });
Object.defineProperty(__exports, 'pvIndex', { get: () => pvIndex, set: (v) => { pvIndex = v; }, enumerable: true, configurable: true });

});

__define('modules/sidebar.js', function(__exports, __require, __module) {
const { S, questions, PRESET_COLORS } = __require('state.js');
const { $, esc } = __require('utils.js');
const { schedulePreview, pvDock, refreshNow } = __require('modules/previewStage.js');
const { trimLogoImage, setCustomLogo, fixLogoAspect, calculateQuestionBounds } = __require('modules/pdfEngine.js');
const { openCustomTemplateModal, getCustomTemplates, getActiveCustomTemplate } = __require('modules/customTemplate.js');

function openSidebar() {
  $('sidebarPanel').classList.add('open');
  $('sidebarOverlay').classList.add('open');
  pvDock(true);
}

function closeSidebar() {
  $('sidebarPanel').classList.remove('open');
  $('sidebarOverlay').classList.remove('open');
  pvDock(false);
}

function initDark() {
  let on = false;
  try {
    const saved = localStorage.getItem('testmaker-dark');
    if (saved !== null) on = saved === '1';
  } catch (e) {}
  document.documentElement.classList.toggle('dark', on);
  $('darkBtn').textContent = on ? '☀️' : '🌙';
  $('darkBtn').onclick = () => {
    const isDark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', isDark);
    try { localStorage.setItem('testmaker-dark', isDark ? '1' : '0'); } catch (e) {}
    $('darkBtn').textContent = isDark ? '☀️' : '🌙';
  };
}

const GUIDE = [
  {
    s: '🚀 1. Hızlı Başlangıç (3 Adımda Sınav Kâğıdı)',
    items: [
      ['Soruları Ekleyin', 'Soru görsellerini çalışma alanına sürükleyebilir, <b>Yazılı Soru Ekleyin</b> butonuyla çoktan seçmeli, boşluk doldurma veya klasik sorular yazabilir ya da <b>Soru Bankası Havuzu</b>ndan hazır sorular aktarabilirsiniz.'],
      ['Sınav ve Şablon Ayarlarını Yapın', 'Sol menüdeki <b>Test Ayarları</b> panelinden MEB Resmî Şablonu, Varsayılan Düzen veya Kendi Şablonunuzu seçip okul adını, dersi ve mizanpajı belirleyin.'],
      ['Baskıya Hazır PDF Oluşturun', '<b>Sınav Kâğıdını Oluştur</b> butonuna tıklayarak A4 boyutunda, çift sütunlu, cevap anahtarlı vektörel PDF çıktınızı anında indirin.']
    ]
  },
  {
    s: '🏛️ 2. MEB Resmî Şablonu ve Düzen Seçenekleri',
    items: [
      ['MEB Resmî Şablon Düzeni', 'Millî Eğitim Bakanlığı sınav yönergelerine tam uyumludur. Resmî MEB arması sol üst köşede yer alır; okul ve sınav başlığı sayfa genişliğinin tam ortasında bağımsız olarak hizalanır.'],
      ['Öğrenci Bilgi Alanları', 'Adı-Soyadı, Sınıfı, Okul Numarası ve Puan haneleri logonun altına muntazam biçimde dizilir; logo taşınsa veya boyutlandırılsa dahi başlık metinleri sabit kalır.'],
      ['Otomatik Mizanpaj ve Ayrım', 'Şablon başlığının yüksekliği ve sayfa kenar boşlukları hesaplanarak soruların yerleşeceği güvenli alan otomatik olarak ayrılır; başlık ve sorular asla üst üste binmez.']
    ]
  },
  {
    s: '📚 3. Soru Bankası Havuzu (DB Yönetimi ve Paylaşım)',
    items: [
      ['Kendi Soru Havuzunuzu Oluşturma', 'Dilediğiniz sayıda soru havuzu veritabanı (DB) açabilir, adlandırabilir ve branşlara göre kategorize edebilirsiniz.'],
      ['Zorluk Seviyelendirmesi', 'Sorularınızı <b>Kolay (🟢)</b>, <b>Orta (🟡)</b> ve <b>Zor (🔴)</b> olarak derecelendirebilir; sınav hazırlarken seviyeye göre filtreleme yapabilirsiniz.'],
      ['Konu ve Kazanım Etiketleri', 'Her soruya konu ve kazanım etiketleri ekleyebilir (ör. <i>#üçgenler</i>, <i>#fonksiyonlar</i>), etiketlere göre anında arama yapabilirsiniz.'],
      ['.db Dosyası Olarak Paylaşma', 'Soru havuzunuzu tek tıkla <b>.db</b> formatında bilgisayarınıza indirebilir, zümre öğretmenlerinizle paylaşabilir veya başkalarının hazırladığı havuzları sisteme yükleyebilirsiniz.']
    ]
  },
  {
    s: '📐 4. Yazılı Soru Ekleme ve Geometri Çizim Stüdyosu',
    items: [
      ['Soru Türleri', '<b>Çoktan Seçmeli</b> (A–E seçenekli), <b>Boşluk Doldurma</b> (üç nokta [...] ile otomatik algılanan kelime havuzlu) ve <b>Klasik</b> (açık uçlu, satır boşluklu) soru formatları desteklenir.'],
      ['Öncül ve Soru Kökü Ayrımı', 'Öncül metni standart punto ile, soru kökü ise öğrencinin dikkatini çekecek şekilde <b>kalın (bold)</b> olarak basılır.'],
      ['Geometri Soruları Çizim Stüdyosu', '<b>Yazılı Soru Ekleyin</b> penceresindeki <b>Geometri Sorusu</b> butonuna basarak; Öklid, muhteşem üçlü, 30-60-90, iç açıortay, kenarortay ve benzerlik dahil 12 zengin üçgen türü, çember, dörtgen ve paralel açılar çizebilirsiniz.'],
      ['Açı, Derece ve Kenar Seçenekleri', 'Şekiller üzerinde köşe adları (A, B, C), kenar uzunlukları, yükseklik (h), açı yayları, derece etiketleri ve taralı alanlar canlı önizleme ile soruya aktarılır.']
    ]
  },
  {
    s: '✂️ 5. Görsel ve PDF\'ten Soru Kesme (OCR Destekli)',
    items: [
      ['Hassas Alan Seçimi', 'Kitap taramalarını veya PDF sayfalarını yükleyip fareyle çerçeveleyerek tek tıkla soru havuzunuza ekleyebilirsiniz.'],
      ['Optik Karakter Tanıma (OCR)', 'Kırpılan sorudaki metin ve şıkları yapay zekâ OCR motoru ile otomatik olarak metne dönüştürebilirsiniz.']
    ]
  },
  {
    s: '🎨 6. Sınav Tasarım Rengi ve Mizanpaj',
    items: [
      ['5 Önerilen Renk Paleti', 'Resmî MEB Bordo, Kurumsal Lacivert, Zümrüt Yeşili, Canlandırıcı Turuncu ve Kurşunî Antrasit paletlerinden birini tek dokunuşla seçebilirsiniz.'],
      ['Özel Renk Seçici ve HEX Girişi', '<b>Kendi Rengini Seç</b> butonuyla renk tekerleğini açabilir veya doğrudan kurumunuzun <b>HEX</b> renk kodunu (ör. <i>#1E3A8A</i>) yazabilirsiniz.'],
      ['Akıllı Yerleşim ve Boşluk Ayarı', 'Sayfa sütun sayısı (1, 2, 3 sütun), sorular arası boşluk ve filigran ayarlarını canlı olarak değiştirebilirsiniz.']
    ]
  },
  {
    s: '📄 7. Çıktı Alma ve Çevrim Dışı Güvenlik',
    items: [
      ['Baskıya Hazır PDF ve Word (.docx)', 'Sınavınızı doğrudan yazıcıya gönderebileceğiniz vektörel PDF olarak oluşturabilir veya Word formatında dışa aktarabilirsiniz.'],
      ['Çoklu Kitapçık Desteği', 'A, B, C, D kitapçıkları oluşturulduğunda sorular otomatik olarak karıştırılır ve ortak cevap anahtarı üretilir.'],
      ['Veri Gizliliği', 'Tüm işlemler yerel tarayıcınız üzerinde gerçekleşir; soru ve sınav verileriniz hiçbir haricî sunucuya gönderilmez.']
    ]
  }
];

function initGuide() {
  const gb = $('guideBody');
  if (!gb) return;
  gb.innerHTML =
    GUIDE.map((g) => `
      <section class="mb-7">
        <h3 class="mb-3 border-b border-slate-200 pb-1.5 text-[13px] font-semibold tracking-wide text-slate-900 dark:border-slate-800 dark:text-slate-100">${g.s}</h3>
        <dl class="space-y-3">
          ${g.items.map(([t, d]) => `
            <div>
              <dt class="text-[13px] font-medium text-slate-800 dark:text-slate-200">${t}</dt>
              <dd class="mt-0.5 text-[13px] leading-relaxed text-slate-500">${d}</dd>
            </div>`).join('')}
        </dl>
      </section>`).join('') +
    `<section class="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center dark:border-slate-700 dark:bg-slate-800">
       <div class="text-[13px] font-semibold text-slate-900 dark:text-slate-100">Egemen Bilim</div>
       <div class="mt-1.5 text-[13px] text-slate-500">
         <a class="text-slate-700 hover:underline dark:text-slate-300" href="tel:+905537891938">0553 789 1938</a>
         <span class="mx-2 text-slate-300">·</span>
         <a class="text-slate-700 hover:underline dark:text-slate-300" href="mailto:egemenbilim@gmail.com">egemenbilim@gmail.com</a>
       </div>
       <div class="mt-2 text-xs text-slate-400">Öneri ve hata bildirimleriniz için yazabilirsiniz.</div>
     </section>`;
  $('openGuide').onclick = () => $('guide').classList.replace('hidden', 'flex');
  $('guideClose').onclick = () => $('guide').classList.replace('flex', 'hidden');
}

function renderTabs() {
  [...$('typeTabs').children].forEach(b => {
    b.className = b.dataset.t === S.testType ? 'active' : '';
  });
  $('konuRow').classList.toggle('hidden', S.testType !== 'yaprak');
}

function renderTplCards() {
  const isMeb = S.template === 'meb';
  const isCustom = S.template === 'custom';
  document.querySelectorAll('.tpl-card').forEach(b => b.classList.toggle('active', b.dataset.tpl === S.template));
  document.querySelectorAll('.tpl-hide-meb').forEach(el => el.classList.toggle('hidden', isMeb || isCustom));
  document.querySelectorAll('.tpl-show-meb').forEach(el => el.classList.toggle('hidden', !isMeb));
  updateQuestionAreaMetrics();
}

function renderColorPalette() {
  const container = $('colorPaletteSwatches');
  if (!container) return;
  const curr = (S.themeColor || '#1d4ed8').toLowerCase();
  container.innerHTML = PRESET_COLORS.map(c => {
    const isAct = c.hex.toLowerCase() === curr;
    return `<button type="button" class="color-swatch-circle ${isAct ? 'active' : ''}" data-hex="${c.hex}" title="${c.name} (${c.hex})" style="background-color:${c.hex}">
      ${isAct ? '<span class="swatch-check">✓</span>' : ''}
    </button>`;
  }).join('');

  if ($('themeColorHex')) {
    $('themeColorHex').value = (S.themeColor || '#1d4ed8').toUpperCase();
  }
  if ($('themeColor')) {
    $('themeColor').value = S.themeColor || '#1d4ed8';
  }
}

function updateQuestionAreaMetrics() {
  try {
    const b = calculateQuestionBounds();
    if ($('qaUsableH')) $('qaUsableH').textContent = `${Math.round(b.usableH)} mm (${Math.round(b.contentTop)} mm - ${Math.round(b.bottomAdj)} mm)`;
    if ($('qaCols')) $('qaCols').textContent = `${b.numCols} Sütun`;
    if ($('qaColW')) $('qaColW').textContent = `${Math.round(b.colW)} mm`;
  } catch (e) {}
}

function renderLogoChoice() {
  const c = S.logoChoice || 'meb';
  $('mebLogoRadio').checked = c === 'meb';
  $('customLogoRadio').checked = c === 'custom';
  $('noLogoRadio').checked = c === 'none';
  $('customLogoPanel').classList.toggle('hidden', c !== 'custom');
  S.mebLogo = c !== 'none';
}

function collect() {
  S.title = $('title').value;
  S.school = $('school').value;
  S.lesson = $('lesson').value;
  S.description = $('description').value;
  S.konuKapsami = $('konuKapsami').value;
  S.mebYear = $('mebYear').value;
  S.mebSchool = $('mebSchool').value;
  S.mebDate = $('mebDate').value;
  S.mebLesson = $('mebLesson').value;
  S.mebGrade = $('mebGrade').value;
  S.mebExam = $('mebExam').value;
  S.mebNameLbl = $('mebNameLbl').value;
  S.mebClassLbl = $('mebClassLbl').value;
  S.mebNoLbl = $('mebNoLbl').value;
  S.mebScoreLbl = $('mebScoreLbl').value;
}

function syncUI() {
  if (S.title !== undefined) $('title').value = S.title;
  if (S.school !== undefined) $('school').value = S.school;
  if (S.lesson !== undefined) $('lesson').value = S.lesson;
  if (S.description !== undefined) $('description').value = S.description;
  if (S.konuKapsami !== undefined) $('konuKapsami').value = S.konuKapsami;
  if (S.groups !== undefined) $('groups').value = String(S.groups);
  if (S.optic !== undefined) $('optic').checked = !!S.optic;
  if (S.showAnswerKey !== undefined) $('showAnswerKey').checked = !!S.showAnswerKey;
  if (S.spacing !== undefined) { $('spacing').checked = !!S.spacing; $('spacingBox').classList.toggle('hidden', !S.spacing); }
  if (S.spacingValue !== undefined) { $('spacingValue').value = String(S.spacingValue); $('spVal').textContent = String(S.spacingValue); }
  if (S.smartLayout !== undefined) $('smartLayout').checked = !!S.smartLayout;
  if (S.watermark !== undefined) $('watermark').value = S.watermark;
  if (S.watermarkAngle !== undefined) { $('watermarkAngle').value = String(S.watermarkAngle); $('wmAngleVal').textContent = S.watermarkAngle + '°'; }
  if (S.watermarkSize !== undefined) { $('watermarkSize').value = String(S.watermarkSize); $('wmSizeVal').textContent = String(S.watermarkSize); }
  if (S.watermarkDivider !== undefined) $('watermarkDivider').checked = !!S.watermarkDivider;
  if (S.themeColor !== undefined) {
    $('themeColor').value = S.themeColor;
    renderColorPalette();
  }
  if (S.pageSize !== undefined) $('pageSize').value = S.pageSize;
  if (S.orientation !== undefined) $('orientation').value = S.orientation;
  if (S.columns !== undefined) $('columns').value = String(S.columns);
  if (S.margin !== undefined) { $('margin').value = String(S.margin); $('mgVal').textContent = String(S.margin); }
  if (S.template !== undefined) renderTplCards();
  if (S.mebYear !== undefined) $('mebYear').value = S.mebYear;
  if (S.mebSchool !== undefined) $('mebSchool').value = S.mebSchool;
  if (S.mebDate !== undefined) $('mebDate').value = S.mebDate;
  if (S.mebLesson !== undefined) $('mebLesson').value = S.mebLesson;
  if (S.mebGrade !== undefined) $('mebGrade').value = S.mebGrade;
  if (S.mebExam !== undefined) $('mebExam').value = S.mebExam;
  if (S.mebNameLbl !== undefined) $('mebNameLbl').value = S.mebNameLbl;
  if (S.mebClassLbl !== undefined) $('mebClassLbl').value = S.mebClassLbl;
  if (S.mebNoLbl !== undefined) $('mebNoLbl').value = S.mebNoLbl;
  if (S.mebScoreLbl !== undefined) $('mebScoreLbl').value = S.mebScoreLbl;
  if (S.logoChoice !== undefined) renderLogoChoice();
  renderTabs();
  updateQuestionAreaMetrics();
  $('qCount').textContent = questions.length;
  $('ansCount').textContent = questions.filter((q) => q.answer).length;
}

function initSidebar() {
  $('sidebarToggle').onclick = openSidebar;
  $('sidebarClose').onclick = closeSidebar;
  $('sidebarOverlay').onclick = closeSidebar;

  [...$('typeTabs').children].forEach(b => b.onclick = () => {
    S.testType = b.dataset.t;
    renderTabs();
  });
  renderTabs();

  $('groups').onchange = e => S.groups = +e.target.value;
  $('optic').onchange = e => S.optic = e.target.checked;
  $('showAnswerKey').onchange = e => S.showAnswerKey = e.target.checked;
  $('spacing').onchange = e => {
    S.spacing = e.target.checked;
    $('spacingBox').classList.toggle('hidden', !S.spacing);
  };
  $('spacingValue').oninput = e => {
    S.spacingValue = +e.target.value;
    $('spVal').textContent = e.target.value;
  };
  $('advBtn').onclick = () => {
    const h = $('advBox').classList.toggle('hidden');
    $('advArrow').textContent = h ? '＋' : '−';
  };
  $('tplBtn').onclick = () => {
    const h = $('tplBox').classList.toggle('hidden');
    $('tplArrow').textContent = h ? '＋' : '−';
  };

  document.querySelectorAll('.tpl-card').forEach(b => {
    b.onclick = () => {
      S.template = b.dataset.tpl;
      renderTplCards();
      schedulePreview();
    };
  });
  renderTplCards();

  const openCtplBtn = $('openCustomTplModal');
  if (openCtplBtn) {
    openCtplBtn.onclick = () => openCustomTemplateModal();
  }

  $('mebYear').oninput = e => S.mebYear = e.target.value;
  $('mebSchool').oninput = e => S.mebSchool = e.target.value;
  $('mebDate').oninput = e => S.mebDate = e.target.value;
  $('mebLesson').oninput = e => S.mebLesson = e.target.value;
  $('mebGrade').oninput = e => S.mebGrade = e.target.value;
  $('mebExam').oninput = e => S.mebExam = e.target.value;
  $('mebNameLbl').oninput = e => S.mebNameLbl = e.target.value;
  $('mebClassLbl').oninput = e => S.mebClassLbl = e.target.value;
  $('mebNoLbl').oninput = e => S.mebNoLbl = e.target.value;
  $('mebScoreLbl').oninput = e => S.mebScoreLbl = e.target.value;

  document.querySelectorAll('[name=logoChoice]').forEach(r => {
    r.onchange = () => {
      S.logoChoice = r.value;
      renderLogoChoice();
      schedulePreview();
    };
  });

  $('customLogoFile').onchange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      trimLogoImage(r.result, (trimmed) => {
        const im = new Image();
        im.onload = () => {
          setCustomLogo(trimmed, im);
          const ar = (im.naturalWidth || 1) / (im.naturalHeight || 1);
          let h = 22, w = h * ar;
          if (w > 60) { w = 60; h = w / ar; }
          S.logoW = Math.max(8, w);
          S.logoH = Math.max(8, h);
          schedulePreview();
        };
        im.src = trimmed;
        $('customLogoPreview').src = trimmed;
        $('customLogoPreview').classList.remove('hidden');
        $('customLogoPlaceholder').classList.add('hidden');
        $('customLogoRemove').classList.remove('hidden');
      });
    };
    r.readAsDataURL(f);
  };

  $('customLogoRemove').onclick = () => {
    setCustomLogo(null, null);
    $('customLogoFile').value = '';
    $('customLogoPreview').classList.add('hidden');
    $('customLogoPlaceholder').classList.remove('hidden');
    $('customLogoRemove').classList.add('hidden');
    schedulePreview();
  };

  $('logoFixAspect').onclick = () => fixLogoAspect(refreshNow);
  $('logoSizeReset').onclick = () => { S.logoW = 22; S.logoH = 22; schedulePreview(); };
  $('logoPosReset').onclick = () => {
    S.logoX = null;
    S.logoY = null;
    S.mebPos = null;
    schedulePreview();
  };
  renderLogoChoice();

  $('smartLayout').onchange = e => S.smartLayout = e.target.checked;
  $('watermark').oninput = e => S.watermark = e.target.value;
  $('watermarkAngle').oninput = e => {
    S.watermarkAngle = +e.target.value;
    $('wmAngleVal').textContent = e.target.value + '°';
  };
  $('watermarkSize').oninput = e => {
    S.watermarkSize = +e.target.value;
    $('wmSizeVal').textContent = e.target.value;
  };
  $('watermarkDivider').onchange = e => S.watermarkDivider = e.target.checked;
  $('konuKapsami').oninput = e => S.konuKapsami = e.target.value;

  // Sınav Tasarım Rengi Eventleri
  renderColorPalette();
  const swatches = $('colorPaletteSwatches');
  if (swatches) {
    swatches.onclick = (e) => {
      const btn = e.target.closest('.color-swatch-circle');
      if (btn && btn.dataset.hex) {
        S.themeColor = btn.dataset.hex;
        renderColorPalette();
        schedulePreview();
      }
    };
  }

  const customColorBtn = $('customColorPickBtn');
  if (customColorBtn) {
    customColorBtn.onclick = () => $('themeColor').click();
  }

  $('themeColor').oninput = (e) => {
    S.themeColor = e.target.value;
    renderColorPalette();
    schedulePreview();
  };

  const hexInp = $('themeColorHex');
  if (hexInp) {
    hexInp.oninput = (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val)) {
        S.themeColor = val;
        if ($('themeColor')) $('themeColor').value = val;
        renderColorPalette();
        schedulePreview();
      }
    };
  }

  const qaToggle = $('toggleQuestionAreaGuide');
  if (qaToggle) {
    qaToggle.onclick = () => {
      S.showQuestionAreaGuide = !S.showQuestionAreaGuide;
      qaToggle.textContent = S.showQuestionAreaGuide ? 'Kılavuzu Gizle' : 'Kılavuzu Göster';
      schedulePreview();
    };
  }

  $('pageSize').onchange = e => { S.pageSize = e.target.value; updateQuestionAreaMetrics(); };
  $('orientation').onchange = e => { S.orientation = e.target.value; updateQuestionAreaMetrics(); };
  $('columns').onchange = e => { S.columns = +e.target.value; updateQuestionAreaMetrics(); };
  $('margin').oninput = e => {
    S.margin = +e.target.value;
    $('mgVal').textContent = e.target.value;
    updateQuestionAreaMetrics();
  };

  ['input', 'change'].forEach(ev => {
    $('sidebarPanel').addEventListener(ev, schedulePreview);
  });
  [...$('typeTabs').children].forEach(b => b.addEventListener('click', schedulePreview));
  $('advBtn').addEventListener('click', schedulePreview);

  initDark();
  initGuide();
}


// Module Exports
__exports['GUIDE'] = GUIDE;
__exports['openSidebar'] = openSidebar;
__exports['closeSidebar'] = closeSidebar;
__exports['initDark'] = initDark;
__exports['initGuide'] = initGuide;
__exports['renderTabs'] = renderTabs;
__exports['renderTplCards'] = renderTplCards;
__exports['renderColorPalette'] = renderColorPalette;
__exports['updateQuestionAreaMetrics'] = updateQuestionAreaMetrics;
__exports['renderLogoChoice'] = renderLogoChoice;
__exports['collect'] = collect;
__exports['syncUI'] = syncUI;
__exports['initSidebar'] = initSidebar;

});

__define('modules/cropTool.js', function(__exports, __require, __module) {
const { questions, MAX, LETTERS } = __require('state.js');
const { $, uid } = __require('utils.js');

let cropSrc = null, cuts = [], cropAnswer = null, rect = null, drawing = false, startP = { x: 0, y: 0 };
let pdfPages = [], selectedPdfPage = null;
let pdfDoc = null;
let pdfRenderTasks = {};
let zoom = { s: 1, tx: 0, ty: 0 };
let pinch = null;

const CROP_ANS_BASE = 'h-6 w-6 rounded-md border text-[11px] font-medium transition ';
const CROP_ANS_OFF = 'border-white/25 text-white/80 hover:border-white/60 hover:text-white';
const CROP_ANS_ON = 'bg-white text-slate-900 border-white font-bold';

function paintCropAns() {
  const ansBox = $('cropAns');
  if (!ansBox) return;
  ansBox.querySelectorAll('[data-c]').forEach(x =>
    x.className = CROP_ANS_BASE + (cropAnswer === x.dataset.c ? CROP_ANS_ON : CROP_ANS_OFF));
}

function applyZoom() {
  const st = $('cropStage');
  if (st) st.style.transform = 'translate(' + zoom.tx + 'px,' + zoom.ty + 'px) scale(' + zoom.s + ')';
}

function resetZoom() {
  zoom = { s: 1, tx: 0, ty: 0 };
  pinch = null;
  applyZoom();
}

function pdfLoadingShow(msg) {
  const el = $('pdfLoading');
  if (!el) return;
  el.textContent = msg || 'PDF açılıyor...';
  el.classList.remove('hidden');
  el.classList.add('flex');
}

function pdfLoadingHide() {
  const el = $('pdfLoading');
  if (!el) return;
  el.classList.add('hidden');
  el.classList.remove('flex');
}

function clearPdfCache() {
  pdfPages.forEach(p => {
    if (p && p.blobUrl) {
      try { URL.revokeObjectURL(p.blobUrl); } catch (e) {}
    }
    if (p && p.canvas) {
      try { p.canvas.width = 0; p.canvas.height = 0; } catch (e) {}
    }
  });
  pdfPages = [];
  Object.values(pdfRenderTasks).forEach(t => {
    try { if (t && t.task) t.task.cancel(); } catch (e) {}
  });
  pdfRenderTasks = {};
  if (pdfDoc) {
    try { pdfDoc.destroy(); } catch (e) {}
    pdfDoc = null;
  }
}

async function renderPdfPage(n) {
  if (pdfPages[n - 1]) return pdfPages[n - 1];
  if (pdfRenderTasks[n]) return pdfRenderTasks[n].promise;
  const promise = (async () => {
    const page = await pdfDoc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(1.5, 1500 / Math.max(1, base.width));
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const task = page.render({ canvasContext: canvas.getContext('2d'), viewport });
    pdfRenderTasks[n].task = task;
    await task.promise;
    const blobUrl = await new Promise((res) => {
      if (!canvas.toBlob) {
        res(canvas.toDataURL('image/jpeg', 0.9));
        return;
      }
      canvas.toBlob(b => res(b ? URL.createObjectURL(b) : canvas.toDataURL('image/jpeg', 0.9)), 'image/jpeg', 0.9);
    });
    pdfPages[n - 1] = { page: n, canvas, blobUrl };
    return pdfPages[n - 1];
  })();
  pdfRenderTasks[n] = { promise, task: null };
  try {
    const out = await promise;
    return out;
  } finally {
    delete pdfRenderTasks[n];
  }
}

async function selectPdfPage(n) {
  if (!pdfDoc) return;
  const sel = $('pdfPageSelect');
  if (sel) sel.value = String(n);
  selectedPdfPage = n;
  const cached = pdfPages[n - 1];
  if (!cached) pdfLoadingShow(n + '. sayfa hazırlanıyor…');
  try {
    const p = await renderPdfPage(n);
    if (selectedPdfPage !== n) return;
    cropSrc = p.blobUrl;
    const im = $('cropImg');
    im.src = cropSrc;
    im.classList.remove('hidden');
    $('cropHint').classList.add('hidden');
    rect = null;
    drawRect();
    hideCropAdd();
    resetZoom();
  } catch (e) {
    if (e && e.name === 'RenderingCancelledException') return;
    console.error(e);
    alert(n + '. sayfa açılamadı.');
  } finally {
    if (selectedPdfPage === n) pdfLoadingHide();
  }
}

async function loadPdfFile(file) {
  if (!window.pdfjsLib) { alert('PDF kütüphanesi yüklenemedi.'); return; }
  clearPdfCache();
  pdfLoadingShow('PDF açılıyor...');
  try {
    const buf = await file.arrayBuffer();
    pdfDoc = await window.pdfjsLib.getDocument({ data: buf }).promise;
    pdfPages = new Array(pdfDoc.numPages);
    $('pdfPageBar').classList.remove('hidden');
    $('pdfPageBar').classList.add('flex');
    const sel = $('pdfPageSelect');
    let opts = '';
    for (let i = 1; i <= pdfDoc.numPages; i++) opts += '<option value="' + i + '">Sayfa ' + i + '</option>';
    sel.innerHTML = opts;
    $('pdfPageCount').textContent = '/ ' + pdfDoc.numPages;
    sel.onchange = () => selectPdfPage(+sel.value);
    if (pdfDoc.numPages) await selectPdfPage(1);
    else pdfLoadingHide();
  } catch (e) {
    console.error(e);
    alert('PDF yüklenirken hata oluştu.');
    pdfLoadingHide();
  }
}

function stagePos(clientX, clientY) {
  const stage = $('cropStage');
  const b = stage.getBoundingClientRect();
  return { x: (clientX - b.left) / zoom.s, y: (clientY - b.top) / zoom.s };
}

function startDraw(clientX, clientY) {
  if (!cropSrc) return;
  hideCropAdd();
  drawing = true;
  startP = stagePos(clientX, clientY);
  rect = { x: startP.x, y: startP.y, w: 0, h: 0 };
  drawRect();
}

function moveDraw(clientX, clientY) {
  if (!drawing) return;
  const p = stagePos(clientX, clientY);
  rect = {
    x: Math.min(startP.x, p.x),
    y: Math.min(startP.y, p.y),
    w: Math.abs(p.x - startP.x),
    h: Math.abs(p.y - startP.y)
  };
  drawRect();
}

function endDraw(clientX, clientY) {
  if (!drawing) return;
  drawing = false;
  if (rect && rect.w > 10 && rect.h > 10) showCropAddAt(clientX, clientY);
}

function drawRect() {
  const r = $('cropRect');
  if (!rect) {
    r.classList.add('hidden');
    return;
  }
  r.classList.remove('hidden');
  r.style.left = rect.x + 'px';
  r.style.top = rect.y + 'px';
  r.style.width = rect.w + 'px';
  r.style.height = rect.h + 'px';
}

function showCropAddAt(clientX, clientY) {
  const bar = $('cropAddBar');
  const wrap = $('cropWrap');
  const wb = wrap.getBoundingClientRect();
  bar.classList.remove('hidden');
  bar.classList.add('flex');
  const bw = bar.offsetWidth || 240;
  const bh = bar.offsetHeight || 36;
  const gap = 8;
  let left = clientX - wb.left + wrap.scrollLeft + gap;
  let top = clientY - wb.top + wrap.scrollTop + gap;
  const maxLeft = wrap.scrollLeft + wrap.clientWidth - bw - 4;
  const maxTop = wrap.scrollTop + wrap.clientHeight - bh - 4;
  if (left > maxLeft) left = Math.max(4, clientX - wb.left + wrap.scrollLeft - bw - gap);
  if (left < 4) left = 4;
  if (top > maxTop) top = Math.max(4, clientY - wb.top + wrap.scrollTop - bh - gap);
  if (top < 4) top = 4;
  bar.style.left = left + 'px';
  bar.style.top = top + 'px';
}

function hideCropAdd() {
  const bar = $('cropAddBar');
  if (bar) {
    bar.classList.add('hidden');
    bar.classList.remove('flex');
  }
}

function trimCanvas(c) {
  const ctx = c.getContext('2d'), w = c.width, h = c.height, d = ctx.getImageData(0, 0, w, h).data;
  const blank = (i) => d[i] > 235 && d[i + 1] > 235 && d[i + 2] > 235;
  const rowB = (y) => {
    for (let x = 0; x < w; x++) if (!blank((y * w + x) * 4)) return false;
    return true;
  };
  const colB = (x) => {
    for (let y = 0; y < h; y++) if (!blank((y * w + x) * 4)) return false;
    return true;
  };
  let t = 0, b = h - 1, l = 0, r = w - 1;
  while (t < b && rowB(t)) t++;
  while (b > t && rowB(b)) b--;
  while (l < r && colB(l)) l++;
  while (r > l && colB(r)) r--;
  const p = 3;
  t = Math.max(0, t - p);
  l = Math.max(0, l - p);
  b = Math.min(h - 1, b + p);
  r = Math.min(w - 1, r + p);
  const o = document.createElement('canvas');
  o.width = r - l + 1;
  o.height = b - t + 1;
  o.getContext('2d').drawImage(c, l, t, o.width, o.height, 0, 0, o.width, o.height);
  return o;
}

function renderCuts(onOcrRequested) {
  $('cutCount').textContent = cuts.length;
  $('cutList').innerHTML = '<div class="mb-2.5 text-[11px] font-medium uppercase tracking-wide text-white/40">Kesilenler</div>' +
    (cuts.length ? cuts.map((c, i) => `<div class="group relative mb-2 overflow-hidden rounded-lg bg-white p-1"><img src="${c.src}" class="w-full">
      <span class="absolute left-1.5 top-1.5 rounded bg-slate-900/80 px-1.5 text-[10px] font-medium text-white">${i + 1}${c.answer ? ' · ' + c.answer : ''}</span>
      <button data-ocr="${i}" class="absolute left-1.5 bottom-1.5 rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-semibold text-slate-900">Metni oku</button>
      <button data-i="${i}" class="absolute right-1.5 top-1.5 rounded bg-slate-900/80 px-1.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100 hover:bg-rose-600">✕</button></div>`).join('')
      : '<div class="mt-4 text-center text-[11px] text-white/30">Henüz soru kesilmedi</div>');

  $('cutList').querySelectorAll('[data-i]').forEach(b => b.onclick = () => {
    cuts.splice(+b.dataset.i, 1);
    renderCuts(onOcrRequested);
  });
  $('cutList').querySelectorAll('[data-ocr]').forEach(b => b.onclick = (e) => {
    e.stopPropagation();
    if (onOcrRequested) onOcrRequested(cuts[+b.dataset.ocr]);
  });
}

async function ocrCutToText(cut, openTextFn, autoParseFn) {
  if (!cut || !cut.src) return;
  if (!window.Tesseract) { alert('OCR kütüphanesi yüklenemedi. İnternet bağlantısını kontrol edin.'); return; }
  try {
    if ($('progress')) {
      $('progress').classList.remove('hidden');
      $('progress').textContent = 'Metin okunuyor…';
    }
    const result = await window.Tesseract.recognize(cut.src, 'tur', {
      logger: (m) => {
        if (m.status === 'recognizing text' && $('progress')) {
          $('progress').textContent = 'Metin okunuyor… ' + Math.round((m.progress || 0) * 100) + '%';
        }
      }
    });
    const text = (result && result.data && result.data.text) ? result.data.text.trim() : '';
    if ($('progress')) $('progress').classList.add('hidden');
    if (!text) { alert('Metin okunamadı. Daha net bir kesim deneyin.'); return; }
    $('cropTool').classList.replace('flex', 'hidden');
    if (openTextFn) openTextFn(null);
    $('txtPreamble').value = text;
    if (autoParseFn) autoParseFn(text);
  } catch (e) {
    if ($('progress')) $('progress').classList.add('hidden');
    alert('OCR hatası: ' + (e && e.message ? e.message : e));
  }
}

function initCropTool({ onQuestionsUpdated, openTextFn, autoParseFn }) {
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  $('cropAns').innerHTML = LETTERS.map(l => `<button type="button" data-c="${l}" class="${CROP_ANS_BASE}${CROP_ANS_OFF}">${l}</button>`).join('');
  $('cropAns').querySelectorAll('[data-c]').forEach(b => b.onclick = (e) => {
    e.stopPropagation();
    cropAnswer = cropAnswer === b.dataset.c ? null : b.dataset.c;
    paintCropAns();
  });

  $('openCrop').onclick = () => $('cropTool').classList.replace('hidden', 'flex');
  $('cropClose').onclick = () => {
    $('cropTool').classList.replace('flex', 'hidden');
    clearPdfCache();
    selectedPdfPage = null;
    $('pdfPageBar').classList.add('hidden');
    $('pdfPageBar').classList.remove('flex');
  };

  $('cropFile').onchange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) {
      loadPdfFile(f);
    } else {
      clearPdfCache();
      selectedPdfPage = null;
      $('pdfPageBar').classList.add('hidden');
      $('pdfPageBar').classList.remove('flex');
      const r = new FileReader();
      r.onload = () => {
        cropSrc = r.result;
        const im = $('cropImg');
        im.src = cropSrc;
        im.classList.remove('hidden');
        $('cropHint').classList.add('hidden');
        resetZoom();
      };
      r.readAsDataURL(f);
    }
    e.target.value = '';
  };

  const stage = $('cropStage');
  stage.addEventListener('mousedown', e => startDraw(e.clientX, e.clientY));
  stage.addEventListener('mousemove', e => moveDraw(e.clientX, e.clientY));
  stage.addEventListener('mouseup', e => endDraw(e.clientX, e.clientY));

  stage.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      pinch = null;
      e.preventDefault();
      startDraw(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2) {
      drawing = false;
      hideCropAdd();
      const t0 = e.touches[0], t1 = e.touches[1];
      const d0 = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const b = stage.getBoundingClientRect();
      const O = { x: b.left - zoom.tx, y: b.top - zoom.ty };
      const m = { x: (t0.clientX + t1.clientX) / 2, y: (t0.clientY + t1.clientY) / 2 };
      pinch = { d0, s0: zoom.s, cMid: { x: (m.x - O.x - zoom.tx) / zoom.s, y: (m.y - O.y - zoom.ty) / zoom.s } };
      e.preventDefault();
    }
  }, { passive: false });

  stage.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && drawing) {
      e.preventDefault();
      moveDraw(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2 && pinch) {
      const t0 = e.touches[0], t1 = e.touches[1];
      const d = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const sNew = Math.min(5, Math.max(1, pinch.s0 * (d / Math.max(1, pinch.d0))));
      const b = stage.getBoundingClientRect();
      const O = { x: b.left - zoom.tx, y: b.top - zoom.ty };
      const m = { x: (t0.clientX + t1.clientX) / 2, y: (t0.clientY + t1.clientY) / 2 };
      let txNew = m.x - O.x - sNew * pinch.cMid.x;
      let tyNew = m.y - O.y - sNew * pinch.cMid.y;
      const wrap = $('cropWrap');
      const cw = wrap.clientWidth, ch = wrap.clientHeight;
      const ow = stage.offsetWidth, oh = stage.offsetHeight, c = 48;
      if (ow * sNew > cw) txNew = Math.max(cw - ow * sNew - c, Math.min(c, txNew)); else txNew = 0;
      if (oh * sNew > ch) tyNew = Math.max(ch - oh * sNew - c, Math.min(c, tyNew)); else tyNew = 0;
      zoom = { s: sNew, tx: txNew, ty: tyNew };
      applyZoom();
      e.preventDefault();
    }
  }, { passive: false });

  stage.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
      if (drawing) {
        const t = e.changedTouches[0];
        if (t) endDraw(t.clientX, t.clientY);
      }
      pinch = null;
    } else if (e.touches.length === 1) {
      pinch = null;
      drawing = false;
    }
  });

  stage.addEventListener('touchcancel', () => { pinch = null; drawing = false; });
  window.addEventListener('mouseup', () => { drawing = false; });
  window.addEventListener('touchend', () => { drawing = false; });

  ['mousedown', 'mouseup', 'touchstart', 'touchend', 'pointerdown', 'pointerup'].forEach(ev =>
    $('cropAddBar').addEventListener(ev, e => e.stopPropagation()));

  $('cropAddBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    $('cutBtn').click();
    hideCropAdd();
  });

  $('cropOcrBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    $('cutBtn').click();
    hideCropAdd();
    const last = cuts[cuts.length - 1];
    if (last) ocrCutToText(last, openTextFn, autoParseFn);
  });

  $('cutBtn').onclick = () => {
    if (!cropSrc || !rect || rect.w < 8 || rect.h < 8) return alert('Önce bir alan seçin.');
    const img = $('cropImg'), scale = img.naturalWidth / img.clientWidth;
    let c = document.createElement('canvas');
    c.width = rect.w * scale;
    c.height = rect.h * scale;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, rect.x * scale, rect.y * scale, rect.w * scale, rect.h * scale, 0, 0, c.width, c.height);
    if ($('autoTrim').checked) c = trimCanvas(c);
    cuts.push({
      id: uid(),
      src: c.toDataURL('image/jpeg', 0.92),
      w: c.width,
      h: c.height,
      answer: cropAnswer,
      groupId: null,
      stem: '',
      name: 'kirpma'
    });
    rect = null;
    drawRect();
    cropAnswer = null;
    paintCropAns();
    renderCuts((cut) => ocrCutToText(cut, openTextFn, autoParseFn));
  };

  renderCuts((cut) => ocrCutToText(cut, openTextFn, autoParseFn));

  $('cropUpload').onclick = () => {
    questions.push(...cuts);
    if (questions.length > MAX) questions.length = MAX;
    cuts = [];
    renderCuts((cut) => ocrCutToText(cut, openTextFn, autoParseFn));
    $('cropTool').classList.replace('flex', 'hidden');
    if (onQuestionsUpdated) onQuestionsUpdated();
  };
}


// Module Exports
__exports['clearPdfCache'] = clearPdfCache;
__exports['ocrCutToText'] = ocrCutToText;
__exports['initCropTool'] = initCropTool;

});

__define('modules/equationEditor.js', function(__exports, __require, __module) {
const { $, openModal, closeModal } = __require('utils.js');

const EQED_MAIN = [
  { label: 'Kesir', template: '\\frac{PAY}{PAYDA}' },
  { label: 'Karekök', template: '\\sqrt{SAYI}' },
  { label: 'Dereceli Kök', template: '\\sqrt[DERECE]{SAYI}' },
  { label: 'Üslü Sayı', template: 'TABAN^{ÜS}' },
  { label: 'Alt İndis', template: 'TABAN_{İNDİS}' },
  { label: 'Mutlak Değer', template: '\\left| SAYI \\right|' },
  {
    label: 'Logaritma', dropdown: [
      { label: 'log₁₀', template: '\\log(SAYI)' },
      { label: 'Taban Belirt', template: '\\log_{TABAN}(SAYI)' },
      { label: 'ln (doğal log)', template: '\\ln(SAYI)' }
    ]
  },
  {
    label: 'Trigonometri', dropdown: [
      { label: 'sin', template: '\\sin(AÇI)' },
      { label: 'cos', template: '\\cos(AÇI)' },
      { label: 'tan', template: '\\tan(AÇI)' },
      { label: 'cot', template: '\\cot(AÇI)' },
      { label: 'sec', template: '\\sec(AÇI)' },
      { label: 'csc', template: '\\csc(AÇI)' },
      { label: 'arcsin', template: '\\arcsin(SAYI)' },
      { label: 'arccos', template: '\\arccos(SAYI)' },
      { label: 'arctan', template: '\\arctan(SAYI)' },
      { label: 'Derece (°)', insert: '^{\\circ}' }
    ]
  },
  { label: 'Limit', template: '\\lim_{x \\to DEĞER}' },
  {
    label: 'Türev', dropdown: [
      { label: '1. Türev', template: "FONKSİYON'(DEĞİŞKEN)" },
      { label: '2. Türev', template: "FONKSİYON''(DEĞİŞKEN)" },
      { label: 'Leibniz Gösterimi', template: '\\frac{d\\,FONKSİYON}{d\\,DEĞİŞKEN}' }
    ]
  },
  {
    label: 'İntegral', dropdown: [
      { label: 'Belirsiz İntegral', template: '\\int FONKSİYON \\, dx' },
      { label: 'Belirli İntegral', template: '\\int_{ALT}^{ÜST} FONKSİYON \\, dx' },
      { label: 'Çevre İntegrali', template: '\\oint FONKSİYON \\, dx' }
    ]
  },
  { label: 'Toplam Sembolü', template: '\\sum_{i=ALT}^{ÜST} İFADE' },
  {
    label: 'Pi/Alfa/Theta', dropdown: [
      { label: 'π', insert: '\\pi' },
      { label: 'α', insert: '\\alpha' },
      { label: 'β', insert: '\\beta' },
      { label: 'θ', insert: '\\theta' },
      { label: 'Δ', insert: '\\Delta' },
      { label: '∞', insert: '\\infty' }
    ]
  },
  {
    label: 'Eşitsizlik/Karşılaştırma', dropdown: [
      { label: '≤ küçük eşit', insert: '\\leq' },
      { label: '≥ büyük eşit', insert: '\\geq' },
      { label: '≠ eşit değil', insert: '\\neq' },
      { label: '≈ yaklaşık eşit', insert: '\\approx' },
      { label: '≡ özdeş', insert: '\\equiv' },
      { label: '∝ orantılı', insert: '\\propto' }
    ]
  },
  {
    label: 'Küme İşlemleri', dropdown: [
      { label: '∈ elemanıdır', insert: '\\in' },
      { label: '∉ elemanı değildir', insert: '\\notin' },
      { label: '⊂ alt kümesi', insert: '\\subset' },
      { label: '⊆ alt küme/eşit', insert: '\\subseteq' },
      { label: '∪ birleşim', insert: '\\cup' },
      { label: '∩ kesişim', insert: '\\cap' },
      { label: '∅ boş küme', insert: '\\emptyset' },
      { label: '∀ her biri için', insert: '\\forall' },
      { label: '∃ vardır', insert: '\\exists' }
    ]
  },
  { label: 'Parçalı Fonksiyon', template: '\\begin{cases} DEĞER_1, & KOŞUL_1 \\\\ DEĞER_2, & KOŞUL_2 \\end{cases}' }
];

const EQED_ADV = [
  { label: 'Çarpım Sembolü', template: '\\prod_{i=ALT}^{ÜST} İFADE' },
  { label: 'Vektör', template: '\\vec{V}' },
  { label: 'Üst Çizgi', template: '\\overline{İFADE}' },
  { label: 'Şapka (^)', template: '\\hat{DEĞİŞKEN}' },
  { label: 'İkili Matris', template: '\\begin{pmatrix} A & B \\\\ C & D \\end{pmatrix}' },
  {
    label: 'Ok Sembolleri', dropdown: [
      { label: '→ sağa ok', insert: '\\to' },
      { label: '⇒ ise (sonuç)', insert: '\\Rightarrow' },
      { label: '⇔ ancak ve ancak', insert: '\\Leftrightarrow' }
    ]
  },
  {
    label: 'Geometri', dropdown: [
      { label: '∠ açı', insert: '\\angle' },
      { label: '⊥ dik', insert: '\\perp' },
      { label: '∥ paralel', insert: '\\parallel' },
      { label: '△ üçgen', insert: '\\triangle' }
    ]
  }
];

const PLACEHOLDER_RE = /[A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜ0-9_]*/g;

function closeAllPopovers(root) {
  root.querySelectorAll('.eqed-popover').forEach((p) => { p.classList.add('hidden'); });
}

function makeMainButton(root, textarea, item, onChange) {
  if (item.dropdown) {
    const wrap = document.createElement('div');
    wrap.className = 'relative';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'eqed-btn w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-medium text-slate-600 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300';
    btn.textContent = item.label + ' ▾';
    const pop = document.createElement('div');
    pop.className = 'eqed-popover hidden absolute left-0 top-full z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900';
    item.dropdown.forEach((sub) => {
      const sb = document.createElement('button');
      sb.type = 'button';
      sb.className = 'block w-full rounded-md px-2 py-1.5 text-left text-[12px] text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800';
      sb.textContent = sub.label;
      sb.addEventListener('click', () => {
        if (sub.template != null) insertTemplate(textarea, sub.template);
        else if (sub.insert != null) insertPlain(textarea, sub.insert);
        pop.classList.add('hidden');
        onChange();
      });
      pop.appendChild(sb);
    });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasHidden = pop.classList.contains('hidden');
      closeAllPopovers(root);
      if (wasHidden) pop.classList.remove('hidden');
    });
    wrap.appendChild(btn);
    wrap.appendChild(pop);
    return wrap;
  }
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'eqed-btn w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-medium text-slate-600 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300';
  b.textContent = item.label;
  b.addEventListener('click', () => {
    insertTemplate(textarea, item.template);
    onChange();
  });
  return b;
}

function insertPlain(textarea, str) {
  const start = textarea.selectionStart != null ? textarea.selectionStart : textarea.value.length;
  const end = textarea.selectionEnd != null ? textarea.selectionEnd : textarea.value.length;
  const val = textarea.value;
  textarea.value = val.slice(0, start) + str + val.slice(end);
  const pos = start + str.length;
  textarea.focus();
  textarea.setSelectionRange(pos, pos);
}

function insertTemplate(textarea, template) {
  const start = textarea.selectionStart != null ? textarea.selectionStart : textarea.value.length;
  const end = textarea.selectionEnd != null ? textarea.selectionEnd : textarea.value.length;
  const val = textarea.value;
  textarea.value = val.slice(0, start) + template + val.slice(end);
  textarea.focus();
  PLACEHOLDER_RE.lastIndex = start;
  const m = PLACEHOLDER_RE.exec(textarea.value);
  if (m && m.index < start + template.length) {
    textarea.setSelectionRange(m.index, m.index + m[0].length);
  } else {
    const pos = start + template.length;
    textarea.setSelectionRange(pos, pos);
  }
}

function jumpToPlaceholder(textarea, direction) {
  const val = textarea.value;
  const cursor = direction > 0 ? textarea.selectionEnd : textarea.selectionStart;
  if (direction > 0) {
    PLACEHOLDER_RE.lastIndex = cursor;
    const m = PLACEHOLDER_RE.exec(val);
    if (m) { textarea.setSelectionRange(m.index, m.index + m[0].length); return true; }
    return false;
  }
  const re = new RegExp(PLACEHOLDER_RE.source, 'g');
  let last = null, mm;
  while ((mm = re.exec(val))) {
    if (mm.index >= cursor) break;
    last = mm;
  }
  if (last) { textarea.setSelectionRange(last.index, last.index + last[0].length); return true; }
  return false;
}

function buildPreviewUpdater(textarea, previewEl, errorEl) {
  let t = null;
  return function schedule() {
    if (t) clearTimeout(t);
    t = setTimeout(() => {
      const src = textarea.value.trim();
      if (!src) { previewEl.innerHTML = ''; errorEl.classList.add('hidden'); return; }
      try {
        if (window.katex) {
          window.katex.render(src, previewEl, { throwOnError: true, displayMode: true });
        }
        errorEl.classList.add('hidden');
      } catch (e) {
        previewEl.innerHTML = '';
        errorEl.textContent = 'Sözdizimi hatası: formülü kontrol edin.';
        errorEl.classList.remove('hidden');
      }
    }, 150);
  };
}

function initEquationEditor(container, opts = {}) {
  container.innerHTML = '';

  const mainGrid = document.createElement('div');
  mainGrid.className = 'grid grid-cols-3 gap-1.5 sm:grid-cols-4';
  container.appendChild(mainGrid);

  const textarea = document.createElement('textarea');
  textarea.className = 'eqed-input inp mt-3 h-24 font-mono text-[13px]';
  textarea.placeholder = 'Örn: \\frac{1}{2} + \\sqrt{x}';

  const advWrap = document.createElement('details');
  advWrap.className = 'eqed-advanced mt-2 rounded-lg border border-slate-200 dark:border-slate-700';
  const advSummary = document.createElement('summary');
  advSummary.className = 'cursor-pointer select-none px-3 py-2 text-[12px] font-medium text-slate-500 dark:text-slate-400';
  advSummary.textContent = '▸ Diğer Yapılar (İntegral, Vektör, Matris...)';
  const advGrid = document.createElement('div');
  advGrid.className = 'grid grid-cols-2 gap-1.5 border-t border-slate-100 p-2 dark:border-slate-800 sm:grid-cols-3';
  advWrap.appendChild(advSummary);
  advWrap.appendChild(advGrid);
  container.appendChild(advWrap);
  container.appendChild(textarea);

  const previewRow = document.createElement('div');
  previewRow.className = 'mt-2 flex items-center justify-between';
  const previewLabel = document.createElement('span');
  previewLabel.className = 'text-[11px] font-medium text-slate-400';
  previewLabel.textContent = 'Önizleme';
  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'eqed-copy rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-500 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-600 dark:text-slate-400';
  copyBtn.textContent = 'Panoya Kopyala';
  previewRow.appendChild(previewLabel);
  previewRow.appendChild(copyBtn);
  container.appendChild(previewRow);

  const previewEl = document.createElement('div');
  previewEl.className = 'eqed-preview mt-1 min-h-[64px] overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60';
  container.appendChild(previewEl);

  const errorEl = document.createElement('div');
  errorEl.className = 'eqed-error mt-1 hidden text-[11px] font-medium text-rose-600';
  container.appendChild(errorEl);

  const scheduleUpdate = buildPreviewUpdater(textarea, previewEl, errorEl);

  EQED_MAIN.forEach((item) => {
    mainGrid.appendChild(makeMainButton(container, textarea, item, scheduleUpdate));
  });
  EQED_ADV.forEach((item) => {
    advGrid.appendChild(makeMainButton(container, textarea, item, scheduleUpdate));
  });

  textarea.addEventListener('input', scheduleUpdate);
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const ok = jumpToPlaceholder(textarea, e.shiftKey ? -1 : 1);
      if (ok) e.preventDefault();
    }
  });
  document.addEventListener('click', () => { closeAllPopovers(container); });

  copyBtn.addEventListener('click', () => {
    const val = textarea.value;
    if (opts.onCopy) { opts.onCopy(val); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(val);
  });

  return {
    textarea,
    reset: () => { textarea.value = ''; previewEl.innerHTML = ''; errorEl.classList.add('hidden'); },
    getValue: () => textarea.value
  };
}

function initMathModalIntegration() {
  const mathState = { targetId: null, selStart: 0, selEnd: 0 };
  let eqedApi = null;

  function ensureEditor() {
    if (eqedApi) return eqedApi;
    const container = $('eqedContainer');
    if (!container) return null;
    eqedApi = initEquationEditor(container, {});
    return eqedApi;
  }

  document.querySelectorAll('.math-trigger').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const field = $(targetId);
      if (!field) return;
      mathState.targetId = targetId;
      mathState.selStart = field.selectionStart != null ? field.selectionStart : field.value.length;
      mathState.selEnd = field.selectionEnd != null ? field.selectionEnd : field.value.length;
      const api = ensureEditor();
      if (api) {
        api.reset();
        openModal('mathModal');
        setTimeout(() => { api.textarea.focus(); }, 30);
      }
    });
  });

  const closeBtn = $('mathModalClose');
  const cancelBtn = $('mathModalCancel');
  const insertBtn = $('mathModalInsert');
  if (closeBtn) closeBtn.addEventListener('click', () => closeModal('mathModal'));
  if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal('mathModal'));
  if (insertBtn) insertBtn.addEventListener('click', () => {
    const api = ensureEditor();
    if (!api) return;
    const latex = api.getValue().trim();
    if (!latex) { closeModal('mathModal'); return; }
    const field = $(mathState.targetId);
    if (!field) { closeModal('mathModal'); return; }
    const wrapped = '$' + latex + '$';
    const val = field.value;
    const before = val.slice(0, mathState.selStart);
    const after = val.slice(mathState.selEnd);
    field.value = before + wrapped + after;
    const pos = (before + wrapped).length;
    field.focus();
    field.setSelectionRange(pos, pos);
    field.dispatchEvent(new Event('input', { bubbles: true }));
    closeModal('mathModal');
  });
}


// Module Exports
__exports['EQED_MAIN'] = EQED_MAIN;
__exports['EQED_ADV'] = EQED_ADV;
__exports['initEquationEditor'] = initEquationEditor;
__exports['initMathModalIntegration'] = initMathModalIntegration;

});

__define('modules/wordExport.js', function(__exports, __require, __module) {
const { questions, S, LETTERS } = __require('state.js');
const { $, defaultBaseName, todayStr, parseTags } = __require('utils.js');

function initWordExport(collectFn) {
  const wordBtn = $('wordBtn');
  if (!wordBtn) return;

  wordBtn.onclick = async () => {
    if (typeof collectFn === 'function') collectFn();
    if (!questions.length) return alert('Önce soru yükleyin.');
    const D = window.docx;
    if (!D) { alert('Word kütüphanesi yüklenemedi. İnternet bağlantısını kontrol edin.'); return; }
    
    wordBtn.disabled = true;
    wordBtn.textContent = '⏳ Hazırlanıyor...';
    try {
      const children = [];
      const heading = [S.school, S.lesson, S.title].filter(Boolean).join(' — ') || 'Sınav';
      children.push(new D.Paragraph({ children: [new D.TextRun({ text: heading, bold: true, size: 28 })], spacing: { after: 200 } }));
      if (S.description) {
        children.push(new D.Paragraph({ children: [new D.TextRun({ text: S.description, italics: true, size: 20 })], spacing: { after: 300 } }));
      }
      const stripTex = (s) => String(s || '').replace(/\$([^$]+)\$/g, '$1');
      questions.forEach((q, i) => {
        const n = (i + 1) + '. ';
        if (q.type === 'text') {
          if (q.kind === 'bosluk') {
            children.push(new D.Paragraph({ children: [new D.TextRun({ text: n + stripTex(q.blankText || ''), size: 22 })], spacing: { after: 120 } }));
          } else {
            if (q.text) children.push(new D.Paragraph({ children: [new D.TextRun({ text: n + stripTex(q.text), size: 22 })], spacing: { after: 60 } }));
            if (q.root) children.push(new D.Paragraph({ children: [new D.TextRun({ text: (q.text ? '' : n) + stripTex(q.root), bold: true, size: 22 })], spacing: { after: 80 } }));
            (q.options || []).filter(Boolean).forEach((o, k) => {
              children.push(new D.Paragraph({ children: [new D.TextRun({ text: '   ' + LETTERS[k] + ') ' + stripTex(o), size: 20 })], spacing: { after: 40 } }));
            });
          }
        } else {
          children.push(new D.Paragraph({ children: [new D.TextRun({ text: n + '[Görsel soru]', italics: true, size: 20 })], spacing: { after: 120 } }));
        }
      });
      if (S.showAnswerKey && questions.some((q) => q.answer)) {
        children.push(new D.Paragraph({ children: [new D.TextRun({ text: 'CEVAP ANAHTARI', bold: true, size: 24 })], spacing: { before: 400, after: 120 } }));
        const key = questions.map((q, i) => (i + 1) + ') ' + (q.answer || '-')).join('   ');
        children.push(new D.Paragraph({ children: [new D.TextRun({ text: key, size: 20 })] }));
      }
      const doc = new D.Document({ sections: [{ properties: {}, children }] });
      const blob = await D.Packer.toBlob(doc);
      const tParsed = parseTags(S.title);
      const name = defaultBaseName(tParsed.clean, S) + ' - ' + todayStr() + '.docx';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (e) {
      alert('Word oluşturulurken hata: ' + (e && e.message ? e.message : e));
      console.error(e);
    }
    wordBtn.disabled = false;
    wordBtn.textContent = '📄 Word olarak indir';
  };
}


// Module Exports
__exports['initWordExport'] = initWordExport;

});

__define('storage.js', function(__exports, __require, __module) {
const { S, questions, setQuestions } = __require('state.js');
const { $, openModal, closeModal } = __require('utils.js');

const AS_KEY = 'testmaker-autosave';
let asTimer = null, asReady = false, asRestoring = false;

function asOpenDB() {
  return new Promise((res, rej) => {
    if (!window.indexedDB) return rej(new Error('no idb'));
    const r = indexedDB.open('egemen-testmaker', 1);
    r.onupgradeneeded = () => { try { r.result.createObjectStore('kv'); } catch (e) {} };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

function asPut(data) {
  return asOpenDB().then((db) => new Promise((res, rej) => {
    const tx = db.transaction('kv', 'readwrite');
    tx.objectStore('kv').put(data, AS_KEY);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  })).catch(() => {
    try { localStorage.setItem(AS_KEY, JSON.stringify({ t: data.t, n: data.questions.length })); } catch (e) {}
  });
}

function asGet() {
  return asOpenDB().then((db) => new Promise((res, rej) => {
    const tx = db.transaction('kv', 'readonly');
    const q = tx.objectStore('kv').get(AS_KEY);
    q.onsuccess = () => res(q.result || null);
    q.onerror = () => rej(q.error);
  })).catch(() => null);
}

function asClear() {
  return asOpenDB().then((db) => new Promise((res) => {
    const tx = db.transaction('kv', 'readwrite');
    tx.objectStore('kv').delete(AS_KEY);
    tx.oncomplete = () => res();
    tx.onerror = () => res();
  })).catch(() => {});
}

function scheduleAutosave(collectFn) {
  if (!asReady || asRestoring) return;
  clearTimeout(asTimer);
  asTimer = setTimeout(() => runAutosave(collectFn), 2000);
}

function runAutosave(collectFn) {
  try {
    if (typeof collectFn === 'function') collectFn();
    const payload = { t: Date.now(), questions, settings: S };
    asPut(payload);
  } catch (e) {}
}

async function offerRestore(syncUIFn, renderFn) {
  let data = null;
  try { data = await asGet(); } catch (e) {}
  if (!data || !Array.isArray(data.questions) || !data.questions.length) {
    asReady = true;
    return;
  }
  const d = new Date(data.t || Date.now());
  const p = (n) => String(n).padStart(2, '0');
  $('restoreMeta').textContent = data.questions.length + ' soru · ' + p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  openModal('restoreModal');
  $('restoreYes').onclick = () => {
    asRestoring = true;
    try {
      setQuestions(data.questions);
      if (data.settings && typeof data.settings === 'object') Object.assign(S, data.settings);
      if (typeof syncUIFn === 'function') syncUIFn();
      if (typeof renderFn === 'function') renderFn();
    } catch (e) {
      console.error(e);
    }
    closeModal('restoreModal');
    asRestoring = false;
    asReady = true;
  };
  $('restoreNo').onclick = () => {
    asClear();
    closeModal('restoreModal');
    asReady = true;
  };
}


// Module Exports
__exports['asOpenDB'] = asOpenDB;
__exports['asPut'] = asPut;
__exports['asGet'] = asGet;
__exports['asClear'] = asClear;
__exports['scheduleAutosave'] = scheduleAutosave;
__exports['runAutosave'] = runAutosave;
__exports['offerRestore'] = offerRestore;

});

__define('modules/questionBank.js', function(__exports, __require, __module) {
const { questions, setQuestions, S, LETTERS, MAX } = __require('state.js');
const { $, uid, esc, openModal, closeModal, todayStr } = __require('utils.js');

const BANK_STORAGE_KEY = 'testmaker_question_banks_v1';

let banks = [];
let currentBankId = null;
let selectedPoolQuestionIds = new Set();
let filterLevel = 'all';
let filterTag = '';
let filterSearch = '';
let onBankUpdatedCallback = null;

function setOnBankUpdatedCallback(fn) {
  onBankUpdatedCallback = fn;
}

// ================= IndexedDB / LocalStorage Storage =================
function openBankDB() {
  return new Promise((res, rej) => {
    if (!window.indexedDB) return rej(new Error('no idb'));
    const req = indexedDB.open('egemen-testmaker-banks', 1);
    req.onupgradeneeded = () => {
      try { req.result.createObjectStore('banks'); } catch (e) {}
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

async function loadBanks() {
  try {
    const db = await openBankDB();
    const data = await new Promise((res, rej) => {
      const tx = db.transaction('banks', 'readonly');
      const getReq = tx.objectStore('banks').get(BANK_STORAGE_KEY);
      getReq.onsuccess = () => res(getReq.result || null);
      getReq.onerror = () => rej(getReq.error);
    });
    if (Array.isArray(data) && data.length) {
      banks = data;
    } else {
      banks = getFallbackBanks();
    }
  } catch (e) {
    try {
      const raw = localStorage.getItem(BANK_STORAGE_KEY);
      banks = raw ? JSON.parse(raw) : getFallbackBanks();
    } catch (err) {
      banks = getFallbackBanks();
    }
  }

  if (!banks.length) {
    banks = [
      {
        id: uid(),
        name: 'Genel Soru Havuzu',
        description: 'Tüm branş ve seviyeler için varsayılan soru havuzu.',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        questions: []
      }
    ];
    saveBanks();
  }

  if (!currentBankId || !banks.find(b => b.id === currentBankId)) {
    currentBankId = banks[0].id;
  }

  return banks;
}

function getFallbackBanks() {
  return [
    {
      id: uid(),
      name: 'Genel Soru Havuzu',
      description: 'Tüm branş ve seviyeler için varsayılan soru havuzu.',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      questions: []
    }
  ];
}

async function saveBanks() {
  try {
    const db = await openBankDB();
    await new Promise((res, rej) => {
      const tx = db.transaction('banks', 'readwrite');
      tx.objectStore('banks').put(banks, BANK_STORAGE_KEY);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch (e) {
    try {
      localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(banks));
    } catch (err) {}
  }
  if (typeof onBankUpdatedCallback === 'function') {
    onBankUpdatedCallback();
  }
}

function getBanks() {
  return banks;
}

function getCurrentBank() {
  return banks.find(b => b.id === currentBankId) || banks[0] || null;
}

function setCurrentBank(bankId) {
  if (banks.find(b => b.id === bankId)) {
    currentBankId = bankId;
    selectedPoolQuestionIds.clear();
    renderBankModalContent();
  }
}

function createNewBank(name, description = '') {
  const trimmed = (name || '').trim();
  if (!trimmed) return null;
  const newBank = {
    id: uid(),
    name: trimmed,
    description: description.trim(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    questions: []
  };
  banks.push(newBank);
  currentBankId = newBank.id;
  saveBanks();
  renderBankModalContent();
  return newBank;
}

function renameCurrentBank(newName) {
  const b = getCurrentBank();
  if (!b) return;
  const trimmed = (newName || '').trim();
  if (!trimmed) return;
  b.name = trimmed;
  b.updatedAt = Date.now();
  saveBanks();
  renderBankModalContent();
}

function deleteCurrentBank() {
  if (banks.length <= 1) {
    alert('En az bir soru havuzu bulunmalıdır. Havuz silinemez.');
    return;
  }
  const b = getCurrentBank();
  if (!b) return;
  if (!confirm(`"${b.name}" havuzunu ve içindeki tüm soruları silmek istediğinize emin misiniz?`)) {
    return;
  }
  banks = banks.filter(x => x.id !== b.id);
  currentBankId = banks[0].id;
  saveBanks();
  renderBankModalContent();
}

// ================= Question Import / Export to Pool =================
function addCurrentTestQuestionsToBank() {
  const b = getCurrentBank();
  if (!b) return;
  if (!questions.length) {
    alert('Şu anda sınavınızda soru bulunmuyor. Önce soru ekleyin.');
    return;
  }

  let addedCount = 0;
  questions.forEach((q) => {
    const clone = JSON.parse(JSON.stringify(q));
    clone.id = uid();
    clone.createdAt = Date.now();
    if (!clone.level) clone.level = 'orta';
    if (!Array.isArray(clone.tags)) clone.tags = [];
    b.questions.push(clone);
    addedCount++;
  });

  b.updatedAt = Date.now();
  saveBanks();
  renderBankModalContent();
  alert(`${addedCount} adet soru "${b.name}" havuzuna başarıyla eklendi!`);
}

function addSelectedPoolQuestionsToTest(onAddedCallback) {
  const b = getCurrentBank();
  if (!b || !selectedPoolQuestionIds.size) {
    alert('Lütfen sınava eklemek için en az bir soru seçin.');
    return;
  }

  const selectedList = b.questions.filter(q => selectedPoolQuestionIds.has(q.id));
  if (!selectedList.length) return;

  if (questions.length + selectedList.length > MAX) {
    alert(`Maksimum soru sınırı (${MAX}) aşılıyor. En fazla ${MAX - questions.length} soru daha ekleyebilirsiniz.`);
    return;
  }

  selectedList.forEach((q) => {
    const clone = JSON.parse(JSON.stringify(q));
    clone.id = uid();
    questions.push(clone);
  });

  selectedPoolQuestionIds.clear();
  closeModal('bankModal');
  if (typeof onAddedCallback === 'function') onAddedCallback();
  alert(`${selectedList.length} adet soru mevcut sınava eklendi.`);
}

// ================= DB Export & Import (.db) =================
function exportCurrentBankToDB() {
  const b = getCurrentBank();
  if (!b) return;
  if (!b.questions.length) {
    alert('Bu havuzda henüz soru bulunmuyor.');
    return;
  }

  const payload = {
    type: 'edtech-question-bank',
    version: 2,
    bankName: b.name,
    bankDescription: b.description || '',
    exportDate: new Date().toISOString(),
    questionCount: b.questions.length,
    questions: b.questions
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = b.name.replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ\-_ ]/g, '').trim() || 'Soru_Bankasi';
  a.href = url;
  a.download = `${safeName} - ${todayStr()}.db`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function importBankFromDB(file) {
  if (!file) return;
  try {
    const raw = await file.text();
    const data = JSON.parse(raw);
    if (!data) throw new Error('Boş dosya');

    let importedQuestions = [];
    let bankName = file.name.replace(/\.db$/i, '').replace(/ - \d{2}\.\d{2}\.\d{4}$/, '') || 'İçe Aktarılan Havuz';
    let bankDesc = 'Paylaşılan .db dosyasından içe aktarıldı.';

    if (data.type === 'edtech-question-bank' && Array.isArray(data.questions)) {
      importedQuestions = data.questions;
      if (data.bankName) bankName = data.bankName;
      if (data.bankDescription) bankDesc = data.bankDescription;
    } else if (Array.isArray(data.questions)) {
      // TestMaker standard draft file
      importedQuestions = data.questions;
      bankName = 'İçe Aktarılan Soru Taslağı';
    } else if (Array.isArray(data)) {
      importedQuestions = data;
    } else {
      throw new Error('Geçersiz .db soru havuzu biçimi.');
    }

    if (!importedQuestions.length) {
      alert('Dosyada soru bulunamadı.');
      return;
    }

    const newBank = {
      id: uid(),
      name: bankName,
      description: bankDesc,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      questions: importedQuestions.map(q => ({
        ...q,
        id: uid(),
        level: q.level || 'orta',
        tags: Array.isArray(q.tags) ? q.tags : []
      }))
    };

    banks.push(newBank);
    currentBankId = newBank.id;
    saveBanks();
    renderBankModalContent();
    alert(`"${newBank.name}" havuzu (${newBank.questions.length} soru) başarıyla içe aktarıldı!`);
  } catch (e) {
    alert('Soru havuzu dosyası okunamadı: ' + (e && e.message ? e.message : e));
  }
}

// ================= UI Rendering =================
function openBankModal() {
  renderBankModalContent();
  openModal('bankModal');
}

function renderBankModalContent() {
  const b = getCurrentBank();
  if (!b) return;

  // Render bank list dropdown
  const select = $('bankSelect');
  if (select) {
    select.innerHTML = banks.map(item =>
      `<option value="${item.id}" ${item.id === currentBankId ? 'selected' : ''}>${esc(item.name)} (${item.questions ? item.questions.length : 0} soru)</option>`
    ).join('');
  }

  // Update bank info
  if ($('bankTitleDisplay')) $('bankTitleDisplay').textContent = b.name;
  if ($('bankDescDisplay')) $('bankDescDisplay').textContent = b.description || 'Açıklama belirtilmemiş.';
  if ($('bankQTotal')) $('bankQTotal').textContent = b.questions ? b.questions.length : 0;

  // Filter questions
  let list = Array.isArray(b.questions) ? [...b.questions] : [];

  if (filterLevel !== 'all') {
    list = list.filter(q => (q.level || 'orta') === filterLevel);
  }

  if (filterTag) {
    const tLower = filterTag.toLowerCase();
    list = list.filter(q => (q.tags || []).some(t => t.toLowerCase().includes(tLower)));
  }

  if (filterSearch) {
    const sLower = filterSearch.toLowerCase();
    list = list.filter(q =>
      (q.text && q.text.toLowerCase().includes(sLower)) ||
      (q.root && q.root.toLowerCase().includes(sLower)) ||
      (q.blankText && q.blankText.toLowerCase().includes(sLower)) ||
      (q.tags && q.tags.some(t => t.toLowerCase().includes(sLower)))
    );
  }

  // Collect all unique tags in current bank for filter chips
  const allTags = new Set();
  (b.questions || []).forEach(q => {
    (q.tags || []).forEach(t => allTags.add(t));
  });

  const tagWrap = $('bankTagPills');
  if (tagWrap) {
    if (!allTags.size) {
      tagWrap.innerHTML = '<span class="text-[11px] text-slate-400 italic">Henüz etiket eklenmemiş</span>';
    } else {
      tagWrap.innerHTML = Array.from(allTags).map(t =>
        `<button type="button" data-tag="${esc(t)}" class="bank-tag-chip rounded-full px-2 py-0.5 text-[10px] font-medium transition ${filterTag === t ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}">#${esc(t)}</button>`
      ).join('');
    }
  }

  // Update selected count
  if ($('bankSelectedCount')) {
    $('bankSelectedCount').textContent = selectedPoolQuestionIds.size;
  }

  // Render question cards list
  const container = $('bankQuestionsList');
  if (!container) return;

  if (!list.length) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center">
        <span class="text-3xl">📭</span>
        <p class="mt-2 text-[14px] font-medium text-slate-700 dark:text-slate-300">Bu havuzda veya filtrede soru bulunamadı.</p>
        <p class="text-[12px] text-slate-400">Aktif sınavınızdaki soruları bu havuza ekleyebilir veya yeni .db havuzu yükleyebilirsiniz.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map((q, idx) => {
    const isSelected = selectedPoolQuestionIds.has(q.id);
    const lvl = q.level || 'orta';
    const lvlConfig = {
      kolay: { label: 'Kolay', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
      orta: { label: 'Orta', bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
      zor: { label: 'Zor', bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' }
    }[lvl] || { label: 'Orta', bg: 'bg-slate-50 text-slate-700 border-slate-200' };

    const qKindLabel = q.type === 'text'
      ? (q.kind === 'bosluk' ? 'Boşluk Doldurma' : (q.kind === 'klasik' ? 'Klasik Soru' : 'Çoktan Seçmeli'))
      : 'Görsel Soru';

    return `
      <div class="bank-q-card relative flex flex-col justify-between rounded-xl border p-3 transition ${isSelected ? 'border-slate-900 bg-slate-50/70 shadow-sm dark:border-white dark:bg-slate-800/80' : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'}" data-qid="${q.id}">
        <div>
          <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="bank-q-check" data-qid="${q.id}" ${isSelected ? 'checked' : ''} style="accent-color:#0f172a">
              <span class="text-[11px] font-bold text-slate-700 dark:text-slate-300">Soru #${idx + 1}</span>
            </label>
            <div class="flex items-center gap-1.5">
              <span class="rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">${qKindLabel}</span>
              <span class="rounded border px-1.5 py-0.5 text-[9px] font-semibold ${lvlConfig.bg}">${lvlConfig.label}</span>
            </div>
          </div>

          <div class="mt-2.5 max-h-28 overflow-hidden text-left text-[12px] leading-relaxed text-slate-700 dark:text-slate-300">
            ${q.imgSrc ? `<div class="mb-2"><img src="${q.imgSrc}" class="max-h-16 rounded border border-slate-200"></div>` : ''}
            ${q.type === 'text'
              ? (q.kind === 'bosluk'
                ? esc(q.blankText || '').replace(/(\.\.\.|_{2,})/g, '______')
                : (q.text ? `<div class="text-slate-500 text-[11px] line-clamp-2">${esc(q.text)}</div>` : '') +
                  (q.root ? `<div class="font-semibold line-clamp-2">${esc(q.root)}</div>` : ''))
              : (q.src ? `<img src="${q.src}" class="max-h-24 w-full object-contain">` : '<span class="italic text-slate-400">Görsel</span>')}
          </div>
        </div>

        <div class="mt-3 border-t border-slate-100 pt-2 dark:border-slate-800">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap gap-1">
              ${(q.tags || []).map(t => `<span class="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">#${esc(t)}</span>`).join('')}
            </div>
            <div class="flex items-center gap-1">
              ${q.answer ? `<span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Cevap: ${q.answer}</span>` : ''}
              <button type="button" class="bank-q-delete rounded px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-rose-600" data-del-qid="${q.id}" title="Bu soruyu havuzdan sil">Sil ✕</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ================= Event Wire-up =================
function initQuestionBank(onTestChangedCallback) {
  loadBanks().then(() => {
    renderBankModalContent();
  });

  // Open modal button
  const openBtn = $('openBankModalBtn');
  if (openBtn) openBtn.onclick = () => openBankModal();

  const openBtn2 = $('dropzoneBankBtn');
  if (openBtn2) openBtn2.onclick = () => openBankModal();

  // Close modal button
  const closeBtn = $('bankModalClose');
  if (closeBtn) closeBtn.onclick = () => closeModal('bankModal');

  // Bank dropdown switch
  const select = $('bankSelect');
  if (select) {
    select.onchange = (e) => {
      setCurrentBank(e.target.value);
    };
  }

  // Create new bank button
  const newBankBtn = $('bankCreateBtn');
  if (newBankBtn) {
    newBankBtn.onclick = () => {
      const name = prompt('Yeni Soru Havuzu Adı:');
      if (name && name.trim()) {
        const desc = prompt('Havuz Açıklaması (İsteğe bağlı):', '') || '';
        createNewBank(name, desc);
      }
    };
  }

  // Rename bank button
  const renameBankBtn = $('bankRenameBtn');
  if (renameBankBtn) {
    renameBankBtn.onclick = () => {
      const b = getCurrentBank();
      if (!b) return;
      const name = prompt('Havuzun Yeni Adı:', b.name);
      if (name && name.trim()) renameCurrentBank(name);
    };
  }

  // Delete bank button
  const delBankBtn = $('bankDeleteBtn');
  if (delBankBtn) {
    delBankBtn.onclick = () => deleteCurrentBank();
  }

  // Add current test questions to bank
  const saveTestBtn = $('bankSaveCurrentTestBtn');
  if (saveTestBtn) {
    saveTestBtn.onclick = () => addCurrentTestQuestionsToBank();
  }

  // Add selected pool questions to test
  const addSelectedBtn = $('bankAddSelectedBtn');
  if (addSelectedBtn) {
    addSelectedBtn.onclick = () => addSelectedPoolQuestionsToTest(onTestChangedCallback);
  }

  // Export current bank to .db
  const exportBtn = $('bankExportBtn');
  if (exportBtn) {
    exportBtn.onclick = () => exportCurrentBankToDB();
  }

  // Import .db to bank
  const importFile = $('bankImportFile');
  const importBtn = $('bankImportBtn');
  if (importBtn && importFile) {
    importBtn.onclick = () => importFile.click();
    importFile.onchange = (e) => {
      if (e.target.files && e.target.files[0]) {
        importBankFromDB(e.target.files[0]);
        e.target.value = '';
      }
    };
  }

  // Level filter buttons
  document.querySelectorAll('[data-bank-filter-level]').forEach((btn) => {
    btn.onclick = () => {
      filterLevel = btn.dataset.bankFilterLevel;
      document.querySelectorAll('[data-bank-filter-level]').forEach(b => {
        b.classList.toggle('active', b.dataset.bankFilterLevel === filterLevel);
      });
      renderBankModalContent();
    };
  });

  // Search input
  const searchInp = $('bankSearchInp');
  if (searchInp) {
    searchInp.oninput = (e) => {
      filterSearch = e.target.value;
      renderBankModalContent();
    };
  }

  // Select all / Deselect all
  const selectAllBtn = $('bankSelectAllBtn');
  if (selectAllBtn) {
    selectAllBtn.onclick = () => {
      const b = getCurrentBank();
      if (!b || !b.questions) return;
      if (selectedPoolQuestionIds.size === b.questions.length) {
        selectedPoolQuestionIds.clear();
      } else {
        b.questions.forEach(q => selectedPoolQuestionIds.add(q.id));
      }
      renderBankModalContent();
    };
  }

  // Event delegation on question list container
  const container = $('bankQuestionsList');
  if (container) {
    container.onclick = (e) => {
      const target = e.target;
      // Checkbox click
      if (target.classList.contains('bank-q-check')) {
        const qid = target.dataset.qid;
        if (target.checked) selectedPoolQuestionIds.add(qid);
        else selectedPoolQuestionIds.delete(qid);
        if ($('bankSelectedCount')) $('bankSelectedCount').textContent = selectedPoolQuestionIds.size;
        const card = target.closest('.bank-q-card');
        if (card) {
          card.classList.toggle('border-slate-900', target.checked);
          card.classList.toggle('bg-slate-50/70', target.checked);
        }
        return;
      }
      // Tag click
      const tagChip = target.closest('.bank-tag-chip');
      if (tagChip) {
        const t = tagChip.dataset.tag;
        filterTag = filterTag === t ? '' : t;
        renderBankModalContent();
        return;
      }
      // Delete question from bank
      const delBtn = target.closest('.bank-q-delete');
      if (delBtn) {
        const qid = delBtn.dataset.delQid;
        const b = getCurrentBank();
        if (b && confirm('Bu soruyu havuzdan silmek istediğinize emin misiniz?')) {
          b.questions = b.questions.filter(q => q.id !== qid);
          selectedPoolQuestionIds.delete(qid);
          saveBanks();
          renderBankModalContent();
        }
        return;
      }
    };
  }
}


// Module Exports
__exports['setOnBankUpdatedCallback'] = setOnBankUpdatedCallback;
__exports['loadBanks'] = loadBanks;
__exports['saveBanks'] = saveBanks;
__exports['getBanks'] = getBanks;
__exports['getCurrentBank'] = getCurrentBank;
__exports['setCurrentBank'] = setCurrentBank;
__exports['createNewBank'] = createNewBank;
__exports['renameCurrentBank'] = renameCurrentBank;
__exports['deleteCurrentBank'] = deleteCurrentBank;
__exports['addCurrentTestQuestionsToBank'] = addCurrentTestQuestionsToBank;
__exports['addSelectedPoolQuestionsToTest'] = addSelectedPoolQuestionsToTest;
__exports['exportCurrentBankToDB'] = exportCurrentBankToDB;
__exports['importBankFromDB'] = importBankFromDB;
__exports['openBankModal'] = openBankModal;
__exports['renderBankModalContent'] = renderBankModalContent;
__exports['initQuestionBank'] = initQuestionBank;

});

__define('main.js', function(__exports, __require, __module) {
const { initSidebar, syncUI, collect } = __require('modules/sidebar.js');
const { render, initQuestionManager, setOnQuestionChangeCallback } = __require('modules/questionManager.js');
const { initTextModal, setOnSaveCallback, openText, autoParseQuestion } = __require('modules/textModal.js');
const { initCropTool } = __require('modules/cropTool.js');
const { initMathModalIntegration } = __require('modules/equationEditor.js');
const { initWordExport } = __require('modules/wordExport.js');
const { initMakePdfButton, ensureFont } = __require('modules/pdfEngine.js');
const { initPreviewStage, schedulePreview, setCollectFn, closePvBig } = __require('modules/previewStage.js');
const { scheduleAutosave, offerRestore } = __require('storage.js');
const { initQuestionBank } = __require('modules/questionBank.js');
const { initGeometryDrawer } = __require('modules/geometryDrawer.js');
const { initCustomTemplateManager } = __require('modules/customTemplate.js');
const { initScienceTemplates, closeScienceModal } = __require('modules/scienceTemplates.js');
const { $, closeModal } = __require('utils.js');

document.addEventListener('DOMContentLoaded', () => {
  setCollectFn(collect);

  const onDataChanged = () => {
    schedulePreview();
    scheduleAutosave(collect);
  };

  setOnSaveCallback(() => {
    render();
    onDataChanged();
  });

  setOnQuestionChangeCallback(onDataChanged);

  initSidebar();
  initTextModal();
  initQuestionManager({ syncUIFn: syncUI, collectFn: collect });
  initQuestionBank(() => {
    render();
    onDataChanged();
  });
  initGeometryDrawer();
  initCustomTemplateManager();
  initScienceTemplates();

  initCropTool({
    onQuestionsUpdated: () => {
      render();
      onDataChanged();
    },
    openTextFn: openText,
    autoParseFn: autoParseQuestion
  });
  initMathModalIntegration();
  initWordExport(collect);
  initMakePdfButton(collect);
  initPreviewStage();

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if ($('imgCropModal') && $('imgCropModal').classList.contains('open')) {
      $('imgCropModal').classList.remove('open');
    } else if ($('mathModal') && $('mathModal').classList.contains('flex')) {
      closeModal('mathModal');
    } else if ($('scienceModal') && $('scienceModal').classList.contains('flex')) {
      closeScienceModal();
    } else if ($('textModal') && $('textModal').classList.contains('flex')) {
      closeModal('textModal');
    } else if ($('bankModal') && $('bankModal').classList.contains('flex')) {
      closeModal('bankModal');
    } else if ($('geoModal') && $('geoModal').classList.contains('flex')) {
      closeModal('geoModal');
    } else if ($('customTplModal') && $('customTplModal').classList.contains('flex')) {
      closeModal('customTplModal');
    } else if ($('pvBig') && $('pvBig').classList.contains('open')) {
      closePvBig();
    }
  });

  ensureFont();
  render();
  schedulePreview();
  offerRestore(syncUI, render);
});


// Module Exports

});

  // Uygulama Giriş Noktası
  document.addEventListener('DOMContentLoaded', () => {
    try {
      __require('main.js');
    } catch (err) {
      console.error('Uygulama başlatma hatası:', err);
    }
  });
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    try {
      __require('main.js');
    } catch (err) {}
  }
})();
