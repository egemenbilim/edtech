export const $ = (id) => document.getElementById(id);

export const uid = () => 'q' + Math.random().toString(36).slice(2, 10);

export function esc(s) {
  return String(s || '')
    .replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
    .replace(/\n/g, '<br>');
}

export function slugForFile(s) {
  const map = {
    'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G', 'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O', 'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U'
  };
  return String(s || '')
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (m) => map[m] || m)
    .replace(/[^a-zA-Z0-9 _-]+/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

export function defaultBaseName(cleanTitle, S) {
  const base = slugForFile(cleanTitle);
  if (base) return base;
  if (S && S.template === 'meb') {
    const combo = slugForFile([S.mebSchool, S.mebLesson, S.mebGrade, S.mebExam].filter(Boolean).join(' - '));
    if (combo) return combo;
  }
  return 'Sinav';
}

export function todayStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export function parseTags(title) {
  const tags = (title.match(/\[[A-Z_]+\]/g) || []);
  return {
    clean: title.replace(/\[[A-Z_]+\]/g, '').trim(),
    noPageNumber: tags.includes('[NO_PAGENUMBER]'),
    noDescription: tags.includes('[NO_DESCRIPTION]'),
    noUppercase: tags.includes('[NO_UPPERCASE]'),
    centerDescription: tags.includes('[CENTER_DESCRIPTION]'),
    hideVersion: tags.includes('[HIDE_VERSION]'),
    negativeAngle: tags.includes('[NEGATIVE_WATERMARK_ANGLE]')
  };
}

export function shuffle(a) {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.random() * (i + 1) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function toBlocks(qs) {
  const seen = new Set(), out = [];
  qs.forEach(q => {
    if (seen.has(q.id)) return;
    if (q.groupId) {
      const g = qs.filter(x => x.groupId === q.groupId);
      g.forEach(x => seen.add(x.id));
      out.push(g);
    } else {
      seen.add(q.id);
      out.push([q]);
    }
  });
  return out;
}

export function booklet(qs, i) {
  const b = toBlocks(qs);
  return i === 0 ? b.flat() : shuffle(b).map(g => g.length > 1 ? shuffle(g) : g).flat();
}

export function jpegBytes(dataURL) {
  const b = atob(dataURL.split(',')[1]);
  const a = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
  return a;
}

export function openModal(id) {
  const el = $(id);
  if (!el) return;
  el.classList.remove('hidden');
  el.classList.add('flex');
}

export function closeModal(id) {
  const el = $(id);
  if (!el) return;
  el.classList.add('hidden');
  el.classList.remove('flex', 'above');
}

export function warnText(msg) {
  const w = $('txtWarn');
  if (w) {
    w.textContent = msg;
    w.classList.remove('on');
    void w.offsetWidth;
    w.classList.add('on');
  }
  try { window.alert(msg); } catch (e) {}
}

export function clearWarn() {
  const w = $('txtWarn');
  if (w) {
    w.classList.remove('on');
    w.textContent = '';
  }
}

export function setProgress(d, t) {
  const p = $('progress');
  if (!p) return;
  if (t === null) {
    p.classList.add('hidden');
    return;
  }
  p.classList.remove('hidden');
  p.innerHTML = `Yükleniyor ${d} / ${t}<div class="mt-1.5 h-1 w-32 overflow-hidden rounded-full bg-white/20"><div class="h-1 rounded-full bg-white transition-all" style="width:${d / t * 100}%"></div></div>`;
}
