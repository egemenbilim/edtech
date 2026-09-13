import { questions, MAX, LETTERS } from '../state.js';
import { $, uid } from '../utils.js';

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

export function clearPdfCache() {
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

export async function ocrCutToText(cut, openTextFn, autoParseFn) {
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

export function initCropTool({ onQuestionsUpdated, openTextFn, autoParseFn }) {
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
