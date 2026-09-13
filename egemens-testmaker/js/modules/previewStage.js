import { questions, S } from '../state.js';
import { $, openModal, closeModal } from '../utils.js';
import { buildPreviewPages, pageSizeMM, getMebLogoBox, imgCache, fixLogoAspect, calculateQuestionBounds } from './pdfEngine.js';
import { openText } from './textModal.js';
import { render } from './questionManager.js';

export let pvPages = [];
export let pvIndex = 0;
let pvTimer = null, pvBusy = false, pvDirty = false;
let pvZoom = 0, pvFitZoom = 1;
let selectedHeaderItems = new Set();
let dragState = null, suppressClick = false;
let headerDragState = null;
let icTarget = null, icSel = null, icDraw = false, icP0 = { x: 0, y: 0 };
let pvPan = null;
let collectFnRef = null;

export function setCollectFn(fn) {
  collectFnRef = fn;
}

export function pvSetBusy(on) {
  $('pvBusy').classList.toggle('on', on);
  $('pvLiveDot').classList.toggle('busy', on);
}

export function schedulePreview() {
  clearTimeout(pvTimer);
  pvTimer = setTimeout(runPreview, 320);
}

export function refreshNow() {
  clearTimeout(pvTimer);
  runPreview();
}

export async function runPreview() {
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

export function showPvPage() {
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

export function pvDock(open) {
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

export function showPvBig() {
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

export function layoutOverlay() {
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

export function closePvBig() {
  $('pvBig').classList.remove('open');
  pvZoom = 0;
  selectedHeaderItems.clear();
}

export function initPreviewStage() {
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
