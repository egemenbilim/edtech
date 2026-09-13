/**
 * Egemen's Testmaker — Fen & Coğrafya İnteraktif Tuval ve Katman Motoru
 * Soru içi değişkenler, devre sembolleri (direnç, pil, vb.), KaTeX formülleri,
 * serbest yazı, oklar, pinler ve organel sürükle-bırak yönetim katmanı.
 */

export function escSvg(str) {
  return String(str || '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);
}

let activeSelectedId = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let currentDragTarget = null; // { type: 'overlay' | 'organelle' | 'mapPin', key: string | number }

export function getSelectedOverlayId() {
  return activeSelectedId;
}

export function setSelectedOverlayId(id) {
  activeSelectedId = id;
}

// ============================================================================
// 1. SEMBOLLER, FORMÜLLER VE İŞARETLEYİCİLER İÇİN SVG RENDER
// ============================================================================

export function renderKaTeXSvg(text, x, y, size = 16, color = '#0f172a', isSelected = false) {
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

export function renderCircuitSymbolSvg(item, isSelected = false) {
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

export function renderArrowSvg(item, isSelected = false) {
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

export function renderPinSvg(item, isSelected = false) {
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

export function renderTextAnnotationSvg(item, isSelected = false) {
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

export function injectOverlaysIntoSvg(svgStr, currentParams) {
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

export function setupStageInteractions(stageEl, currentParams, onUpdate, onSelect) {
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

export function addOverlayItem(currentParams, type, customData = {}) {
  if (!currentParams._overlays) currentParams._overlays = [];
  const id = 'ov_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

  let newItem = { id, type, x: 260, y: 180, ...customData };
  currentParams._overlays.push(newItem);
  activeSelectedId = id;
  return newItem;
}

export function deleteSelectedOverlayItem(currentParams) {
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

export function resetAllOverlays(currentParams) {
  currentParams._overlays = [];
  activeSelectedId = null;
}
