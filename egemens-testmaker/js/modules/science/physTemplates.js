import { escSvg } from './overlayEngine.js';

/**
 * Egemen's Testmaker — Fizik Şablon Envanteri (TYT & AYT)
 * Devreler, Vektörler, Dalgalar, Yay-Kütle, Eğik Düzlem, Manyetizma, Transformatör,
 * Isı-Sıcaklık, Makaralar, Optik, Dinamik ve Sıvı Basıncı.
 */

export const PHYS_TEMPLATES = {
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
