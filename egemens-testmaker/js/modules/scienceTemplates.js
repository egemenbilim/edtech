import { $, openModal, closeModal } from '../utils.js';
import { GEO_TEMPLATES } from './science/geoTemplates.js';
import { PHYS_TEMPLATES } from './science/physTemplates.js';
import { CHEM_TEMPLATES } from './science/chemTemplates.js';
import { BIO_TEMPLATES } from './science/bioTemplates.js';
import {
  injectOverlaysIntoSvg,
  renderCircuitSymbolSvg,
  setupStageInteractions,
  addOverlayItem,
  deleteSelectedOverlayItem,
  resetAllOverlays,
  setSelectedOverlayId
} from './science/overlayEngine.js';

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

export const SCIENCE_TEMPLATES = {
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

export function svgToDataUrl(svgString, scale = 2) {
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

export function setOnScienceInsertCallback(fn) {
  onScienceInsertCallback = fn;
}

export function openScienceModal(callback, onCancel) {
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

export function closeScienceModal() {
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

export function openSideDrawer(mode = 'formula') {
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

export function closeSideDrawer() {
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


export function initScienceTemplates() {
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
