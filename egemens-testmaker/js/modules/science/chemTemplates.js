import { escSvg } from './overlayEngine.js';

/**
 * Egemen's Testmaker — Kimya Şablon Envanteri (TYT & AYT)
 * Çözünürlük Eğrisi, Galvanik Pil, Titrasyon, Potansiyel Enerji Diyagramı,
 * Manometre / Gaz Yasaları, Molekül Geometrisi (VSEPR), Bohr ve Periyodik Tablo.
 */

export const CHEM_TEMPLATES = {
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
