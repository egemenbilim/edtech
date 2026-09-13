import { $, openModal, closeModal } from '../utils.js';

export const EQED_MAIN = [
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

export const EQED_ADV = [
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

export function initEquationEditor(container, opts = {}) {
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

export function initMathModalIntegration() {
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
