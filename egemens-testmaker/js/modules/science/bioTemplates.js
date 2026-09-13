import { escSvg } from './overlayEngine.js';

/**
 * Egemen's Testmaker — Biyoloji Şablon Envanteri (TYT & AYT)
 * Sürüklenebilir Hücre Mimarisi & Organeller, Mitoz/Mayoz Evreleri,
 * DNA & Nükleotid, Soy Ağacı, Besin Piramidi, Nefron ve Sinaps İletimi.
 */

export const BIO_TEMPLATES = {
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
