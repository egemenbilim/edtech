import { S, questions, PRESET_COLORS } from '../state.js';
import { $, esc } from '../utils.js';
import { schedulePreview, pvDock, refreshNow } from './previewStage.js';
import { trimLogoImage, setCustomLogo, fixLogoAspect, calculateQuestionBounds } from './pdfEngine.js';
import { openCustomTemplateModal, getCustomTemplates, getActiveCustomTemplate } from './customTemplate.js';

export function openSidebar() {
  $('sidebarPanel').classList.add('open');
  $('sidebarOverlay').classList.add('open');
  pvDock(true);
}

export function closeSidebar() {
  $('sidebarPanel').classList.remove('open');
  $('sidebarOverlay').classList.remove('open');
  pvDock(false);
}

export function initDark() {
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

export const GUIDE = [
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

export function initGuide() {
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

export function renderTabs() {
  [...$('typeTabs').children].forEach(b => {
    b.className = b.dataset.t === S.testType ? 'active' : '';
  });
  $('konuRow').classList.toggle('hidden', S.testType !== 'yaprak');
}

export function renderTplCards() {
  const isMeb = S.template === 'meb';
  const isCustom = S.template === 'custom';
  document.querySelectorAll('.tpl-card').forEach(b => b.classList.toggle('active', b.dataset.tpl === S.template));
  document.querySelectorAll('.tpl-hide-meb').forEach(el => el.classList.toggle('hidden', isMeb || isCustom));
  document.querySelectorAll('.tpl-show-meb').forEach(el => el.classList.toggle('hidden', !isMeb));
  updateQuestionAreaMetrics();
}

export function renderColorPalette() {
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

export function updateQuestionAreaMetrics() {
  try {
    const b = calculateQuestionBounds();
    if ($('qaUsableH')) $('qaUsableH').textContent = `${Math.round(b.usableH)} mm (${Math.round(b.contentTop)} mm - ${Math.round(b.bottomAdj)} mm)`;
    if ($('qaCols')) $('qaCols').textContent = `${b.numCols} Sütun`;
    if ($('qaColW')) $('qaColW').textContent = `${Math.round(b.colW)} mm`;
  } catch (e) {}
}

export function renderLogoChoice() {
  const c = S.logoChoice || 'meb';
  $('mebLogoRadio').checked = c === 'meb';
  $('customLogoRadio').checked = c === 'custom';
  $('noLogoRadio').checked = c === 'none';
  $('customLogoPanel').classList.toggle('hidden', c !== 'custom');
  S.mebLogo = c !== 'none';
}

export function collect() {
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

export function syncUI() {
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

export function initSidebar() {
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
