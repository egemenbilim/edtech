import { escSvg } from './overlayEngine.js';
import { TURKEY_VECTOR_PATH, WORLD_VECTOR_PATH, TURKEY_LAKES, TURKEY_RIVERS, STRAITS_CANALS } from './mapData.js';
import { COGRAFYA_HARITALAR, COGRAFYA_HARITA_MAP } from './geoMapsData.js';

/**
 * Egemen's Testmaker — Coğrafya Şablon Envanteri (TYT, AYT & KPSS)
 * Otantik GIS / Fiziki Dilsiz Harita Veri Havuzu (12 Harita), İzohips, İklim grafiği,
 * Doğru eksen eğikliği ve yörünge modelleri.
 */

export const GEO_TEMPLATES = {
  // --------------------------------------------------------------------------
  // 0. COĞRAFYA HARİTALARI (12 OTANTİK DİLSİZ & BÖLGESEL HARİTA)
  // --------------------------------------------------------------------------
  cografyaHaritalari: {
    id: 'cografyaHaritalari',
    category: 'cografya',
    name: 'Coğrafya Dilsiz Haritaları (12 Harita & Bölgeler)',
    tags: ['TYT', 'AYT', 'KPSS', 'Harita', 'Dilsiz Harita', 'Coğrafya', 'Bölgeler', 'Fiziki', 'İklim'],
    desc: 'Coğrafya Haritaları arşivinden 12 otantik dilsiz ve fiziki harita: Genel Türkiye, İklim, Kıvrım Dağları, Volkanik Dağlar ve 7 Coğrafi Bölge. Tıklanabilir pinler, metin ve KaTeX formülleri.',
    defaultParams: {
      title: 'Türkiye Dilsiz Haritası',
      mapId: 'turkey_dilsiz',
      pins: []
    },
    presets: COGRAFYA_HARITALAR.map(m => ({
      name: m.title,
      params: {
        title: m.title,
        mapId: m.id,
        pins: []
      }
    })),
    schema: [
      { key: 'title', label: 'Harita Başlığı', type: 'text' },
      {
        key: 'mapId',
        label: 'Harita Seçimi (12 Otantik Harita)',
        type: 'select',
        options: COGRAFYA_HARITALAR.map(m => ({ v: m.id, l: m.title }))
      }
    ],
    renderSvg(p) {
      const mapMeta = COGRAFYA_HARITA_MAP[p.mapId || 'turkey_dilsiz'] || COGRAFYA_HARITALAR[0];
      const w = mapMeta.w, h = mapMeta.h;
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" style="font-family:'Noto Sans',sans-serif; background-color:#ffffff;">
          <rect width="${w}" height="${h}" fill="#ffffff" />
          <image href="${mapMeta.dataUrl}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" />
          ${p.title ? `
            <g transform="translate(${w / 2}, 38)">
              <rect x="-${p.title.length * 7.5 + 24}" y="-22" width="${p.title.length * 15 + 48}" height="36" rx="8" fill="#ffffff" fill-opacity="0.95" stroke="#94a3b8" stroke-width="1.4" />
              <text x="0" y="3" text-anchor="middle" font-size="16" font-weight="bold" fill="#0f172a">${escSvg(p.title)}</text>
            </g>
          ` : ''}
          <g id="trPins">
            ${(p.pins || []).map(pin => {
              const katexHtml = (pin.katex && typeof window !== 'undefined' && window.katex)
                ? window.katex.renderToString(pin.katex, { throwOnError: false })
                : '';
              const hasLabel = pin.text || katexHtml;
              return `
              <g class="sci-draggable" data-map-pin-id="${pin.id}" transform="translate(${pin.x},${pin.y})" style="cursor:move;">
                <path d="M 0 0 C -12 -16 -15 -25 -15 -32 A 15 15 0 1 1 15 -32 C 15 -25 12 -16 0 0 Z" fill="${pin.color || '#dc2626'}" stroke="#ffffff" stroke-width="2.4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))" />
                <circle cx="0" cy="-32" r="8" fill="#ffffff" />
                <text x="0" y="-27" text-anchor="middle" font-size="10.5" font-weight="bold" fill="${pin.color || '#dc2626'}">${escSvg(pin.label)}</text>
                ${hasLabel ? `
                  <foreignObject x="18" y="-46" width="260" height="52" style="overflow:visible;">
                    <div xmlns="http://www.w3.org/1999/xhtml" style="background:#ffffff; border:1.4px solid ${pin.color || '#dc2626'}; border-radius:6px; padding:3px 8px; font-size:12px; font-weight:600; color:#0f172a; display:inline-flex; align-items:center; gap:6px; box-shadow:0 2px 6px rgba(0,0,0,0.18); white-space:nowrap;">
                      ${pin.text ? `<span>${escSvg(pin.text)}</span>` : ''}
                      ${katexHtml ? `<span style="color:#1d4ed8;">${katexHtml}</span>` : ''}
                    </div>
                  </foreignObject>
                ` : ''}
              </g>`;
            }).join('')}
          </g>
        </svg>
      `;
    }
  },
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
      pins: []
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
