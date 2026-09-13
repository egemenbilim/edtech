import { questions, setQuestions, S, LETTERS, MAX } from '../state.js';
import { $, uid, esc, setProgress, defaultBaseName, todayStr, parseTags } from '../utils.js';
import { openText } from './textModal.js';

let dragIdx = null;
let groupTarget = null, groupSel = [];
let onStateChanged = null;

export function setOnQuestionChangeCallback(fn) {
  onStateChanged = fn;
}

function notifyChange() {
  if (typeof onStateChanged === 'function') {
    onStateChanged();
  }
}

export function showPreview(q) {
  if (q.type === 'text' && q.kind === 'bosluk') {
    $('previewBody').innerHTML = `<div class="text-sm leading-relaxed">
        <span class="rounded bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-900">BOŞLUK DOLDURMA</span>
        ${q.imgSrc ? `<img src="${q.imgSrc}" class="mt-3 max-h-56 rounded-lg border border-slate-200">` : ''}
        <div class="mt-3 whitespace-pre-wrap text-slate-800 dark:text-slate-200">${esc(q.blankText).replace(/(\.\.\.|_{2,})/g, '<b class="text-amber-700">______________</b>')}</div>
        ${(q.wordBank || []).length ? `<div class="mt-4 rounded border border-amber-300 bg-amber-50 p-2 text-xs"><b class="text-amber-900">Kelime Havuzu:</b> ${esc((q.wordBank || []).join('  •  '))}</div>` : ''}
      </div>`;
  } else {
    $('previewBody').innerHTML = q.type === 'text'
      ? `<div class="text-sm leading-relaxed">
           ${q.imgSrc ? `<img src="${q.imgSrc}" class="mb-3 max-h-56 rounded-lg border border-slate-200">` : ''}
            ${q.text ? `<div class="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">${esc(q.text)}</div>` : ''}
            ${q.root ? `<div class="mt-2 font-bold text-slate-900 dark:text-slate-100 whitespace-pre-wrap">${esc(q.root)}</div>` : ''}
            <div class="mt-3 ${q.layout === 'h' ? 'flex flex-wrap gap-4' : 'space-y-1.5'}">${(q.options || []).filter(Boolean)
              .map((o, k) => `<div><b class="text-slate-900 dark:text-slate-100">${LETTERS[k]})</b> ${esc(o)}</div>`).join('')}</div>
           ${q.blank ? `<div class="mt-3 border-t pt-2 text-xs italic text-slate-400">Klasik / Açık uçlu soru (${q.blank} mm boşluk)</div>` : ''}
         </div>`
      : `<img src="${q.src}" class="max-h-[80vh]">`;
  }
  $('preview').classList.replace('hidden', 'flex');
}

export function openGroup(q) {
  groupTarget = q;
  groupSel = questions.filter(x => q.groupId && x.groupId === q.groupId && x.id !== q.id).map(x => x.id);
  $('gStem').value = q.stem || '';
  const g = $('gGrid');
  g.innerHTML = '';
  questions.forEach((x, i) => {
    if (x.id === q.id) return;
    const b = document.createElement('button');
    const on = () => groupSel.includes(x.id);
    const paint = () => b.className = 'rounded-lg border p-1.5 transition ' + (on() ? 'border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-800' : 'border-slate-200 hover:border-slate-400 dark:border-slate-700');
    b.innerHTML = (x.type === 'text'
      ? `<div class="h-20 overflow-hidden text-left text-[9px] leading-tight text-slate-600 dark:text-slate-400">${esc(x.text || x.root || x.blankText || '')}</div>`
      : `<img src="${x.src}" class="h-20 w-full object-contain">`) + `<span class="mt-1 block text-[10px] font-medium text-slate-400">${i + 1}</span>`;
    paint();
    b.onclick = () => {
      groupSel = on() ? groupSel.filter(id => id !== x.id) : [...groupSel, x.id];
      paint();
    };
    g.appendChild(b);
  });
  $('groupModal').classList.replace('hidden', 'flex');
}

export function render() {
  $('qCount').textContent = questions.length;
  $('ansCount').textContent = questions.filter(q => q.answer).length;
  const g = $('grid');
  g.innerHTML = '';
  if (!questions.length) {
    g.innerHTML = `<div id="emptyState" class="col-span-full flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-20 text-center dark:border-slate-700 dark:bg-slate-900">
      <div>
        <p class="text-[15px] font-medium text-slate-700 dark:text-slate-300">Henüz soru oluşturmadınız</p>
        <p class="mt-1.5 text-[13px] leading-relaxed text-slate-400">
          Dilerseniz yukarıdaki seçenekleri kullanarak<br><b class="text-slate-600 dark:text-slate-300">Yazılı Kağıdı</b> veya <b class="text-slate-600 dark:text-slate-300">Konu Denemesi</b> oluşturabilirsiniz
        </p>
      </div></div>`;
    notifyChange();
    return;
  }
  g.className = 'grid grid-cols-2 gap-3 xl:grid-cols-3';
  questions.forEach((q, i) => {
    const d = document.createElement('div');
    d.className = 'card group relative cursor-grab rounded-xl border border-slate-200 bg-white p-2.5 transition hover:border-slate-300 hover:shadow-md active:cursor-grabbing dark:border-slate-800 dark:bg-slate-900';
    if (q.groupId) {
      d.style.borderColor = document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#0f172a';
    }
    d.draggable = true;
    d.ondragstart = () => dragIdx = i;
    d.ondragover = e => e.preventDefault();
    d.ondrop = () => {
      if (dragIdx !== null && dragIdx !== i) {
        const [it] = questions.splice(dragIdx, 1);
        questions.splice(i, 0, it);
        render();
      }
    };
    d.ondblclick = () => showPreview(q);
    const lvl = q.level || 'orta';
    const lvlCfg = {
      kolay: { label: 'Kolay', cls: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' },
      orta: { label: 'Orta', cls: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300' },
      zor: { label: 'Zor', cls: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300' }
    }[lvl] || { label: 'Orta', cls: 'border-slate-200 bg-slate-50 text-slate-700' };

    const qKindLabel = q.type === 'text'
      ? (q.kind === 'bosluk' ? 'Boşluk' : (q.kind === 'klasik' ? 'Klasik' : 'Test'))
      : 'Görsel';

    d.innerHTML = `
      <div class="flex items-center justify-between gap-1.5 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-1.5">
          <span class="rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-bold text-white dark:bg-white dark:text-slate-900">#${i + 1}</span>
          <span class="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">${qKindLabel}</span>
          <button type="button" class="btn-lvl-cycle rounded border px-1.5 py-0.2 text-[9px] font-bold transition hover:scale-105 ${lvlCfg.cls}" title="Zorluğu değiştirmek için tıklayın">${lvlCfg.label}</button>
        </div>
        <div class="tools flex items-center gap-1">
          <button class="btn-mini" data-a="prev" title="Önizle">🔍</button>
          ${q.type === 'text' ? '<button class="btn-mini" data-a="edit" title="Metni Düzenle">✏️</button>' : ''}
          <button class="btn-mini" data-a="grp" title="Gruplandır">🔗</button>
          <button class="btn-mini" data-a="up" title="Yukarı">↑</button>
          <button class="btn-mini" data-a="down" title="Aşağı">↓</button>
          <button class="btn-mini !text-rose-600 hover:!bg-rose-50 dark:hover:!bg-rose-950/40" data-a="del" title="Sil">✕</button>
        </div>
      </div>

      ${q.type === 'text'
        ? (q.kind === 'bosluk'
          ? `<div class="relative h-32 overflow-hidden rounded-lg bg-slate-50 p-2.5 text-left text-[11px] leading-snug dark:bg-slate-800">
               ${q.imgSrc ? `<span class="absolute right-2 bottom-2 z-10 rounded bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-medium text-white">📷 Görsel</span>` : ''}
               <div class="text-slate-700 dark:text-slate-300">${esc(q.blankText || '').replace(/(\.\.\.|_{2,})/g, '<span class="text-slate-400">______</span>')}</div>
               ${(q.wordBank || []).length ? `<div class="mt-1 text-[10px] text-slate-400 font-medium">Havuz: ${esc((q.wordBank || []).join(' · '))}</div>` : ''}
             </div>`
          : `<div class="relative h-32 overflow-hidden rounded-lg bg-slate-50 p-2.5 text-left text-[11px] leading-snug dark:bg-slate-800">
                ${q.imgSrc ? `<span class="absolute right-2 bottom-2 z-10 rounded bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-medium text-white">📷 Görsel</span>` : ''}
                ${q.text ? `<div class="text-slate-500 text-[10px] line-clamp-1">${esc(q.text)}</div>` : ''}
                ${q.root ? `<div class="mt-0.5 font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">${esc(q.root)}</div>` : ''}
                <div class="mt-1 ${q.layout === 'h' ? 'flex flex-wrap gap-2' : 'space-y-0.5'} text-slate-600 dark:text-slate-300">${(q.options || []).filter(Boolean)
                  .map((o, k) => `<div><span class="font-bold text-slate-400">${LETTERS[k]}</span> ${esc(o)}</div>`).join('')}</div>
                ${q.blank ? `<div class="mt-1 text-[10px] text-slate-400 italic">${q.blank} mm cevap satırı</div>` : ''}
              </div>`)
        : `<img src="${q.src}" class="h-32 w-full rounded-lg object-contain bg-slate-50 dark:bg-slate-800">`}

      ${(q.tags && q.tags.length) ? `
        <div class="mt-2 flex flex-wrap gap-1">
          ${q.tags.map(t => `<span class="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">#${esc(t)}</span>`).join('')}
        </div>
      ` : ''}

      <div class="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
        <span class="text-[10px] font-medium text-slate-400">Doğru Şık:</span>
        <div class="flex gap-1">${LETTERS.map(l =>
          `<button data-l="${l}" class="h-6 w-6 rounded-md border text-[11px] font-bold transition ${q.answer === l ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 shadow-sm' : 'border-slate-200 text-slate-400 hover:border-slate-400 dark:border-slate-700'}">${l}</button>`).join('')}</div>
      </div>`;

    const lvlBtn = d.querySelector('.btn-lvl-cycle');
    if (lvlBtn) {
      lvlBtn.onclick = (ev) => {
        ev.stopPropagation();
        const cycle = { kolay: 'orta', orta: 'zor', zor: 'kolay' };
        q.level = cycle[q.level || 'orta'] || 'orta';
        render();
      };
    }

    d.querySelectorAll('[data-a]').forEach(b => b.onclick = ev => {
      ev.stopPropagation();
      const a = b.dataset.a;
      if (a === 'del') questions.splice(i, 1);
      if (a === 'prev') return showPreview(q);
      if (a === 'edit') return openText(q);
      if (a === 'grp') return openGroup(q);
      if (a === 'up' && i > 0) { const [it] = questions.splice(i, 1); questions.splice(i - 1, 0, it); }
      if (a === 'down' && i < questions.length - 1) { const [it] = questions.splice(i, 1); questions.splice(i + 1, 0, it); }
      render();
    });

    d.querySelectorAll('[data-l]').forEach(b => b.onclick = ev => {
      ev.stopPropagation();
      q.answer = q.answer === b.dataset.l ? null : b.dataset.l;
      render();
    });

    g.appendChild(d);
  });

  notifyChange();
}

export async function addFiles(list, syncUIFn) {
  const arr = [...list];
  const db = arr.find(f => f.name.toLowerCase().endsWith('.db'));
  if (db) {
    try {
      const raw = await db.text();
      const d = JSON.parse(raw);
      if (!d || !Array.isArray(d.questions)) throw new Error('Geçersiz taslak dosyası.');
      setQuestions(d.questions);
      if (d.settings && typeof d.settings === 'object') Object.assign(S, d.settings);
      if (typeof syncUIFn === 'function') syncUIFn();
      render();
    } catch (e) {
      alert('Taslak dosyası okunamadı. Dosyanın bu araç ile kaydedilmiş bir ".db" olduğundan emin olun.');
    }
    return;
  }
  const imgs = arr.filter(f => /image\/(jpeg|png|gif)/.test(f.type));
  if (!imgs.length) {
    alert('Yüklemek istediğiniz görsel sadece JPG, PNG veya GIF formatında olabilir.');
    return;
  }
  imgs.sort((a, b) => a.name.localeCompare(b.name, 'tr', { numeric: true }));
  let done = 0;
  setProgress(0, imgs.length);
  for (const f of imgs) {
    await new Promise(res => {
      const r = new FileReader();
      r.onload = () => {
        const im = new Image();
        im.onload = () => {
          if (questions.length < MAX) {
            questions.push({
              id: uid(),
              src: r.result,
              w: im.width,
              h: im.height,
              answer: null,
              groupId: null,
              stem: '',
              name: f.name
            });
          }
          done++;
          setProgress(done, imgs.length);
          render();
          res();
        };
        im.src = r.result;
      };
      r.readAsDataURL(f);
    });
  }
  setTimeout(() => setProgress(0, null), 1200);
}

export function initQuestionManager({ syncUIFn, collectFn }) {
  $('pickBtn').onclick = () => $('fileInput').click();
  $('fileInput').onchange = e => {
    addFiles(e.target.files, syncUIFn);
    e.target.value = '';
  };

  const dz = $('dropzone');
  dz.addEventListener('dragover', e => {
    e.preventDefault();
    dz.classList.add('border-sky-400', 'bg-sky-50/50');
  });
  dz.addEventListener('dragleave', () => dz.classList.remove('border-sky-400', 'bg-sky-50/50'));
  dz.addEventListener('drop', e => {
    e.preventDefault();
    dz.classList.remove('border-sky-400', 'bg-sky-50/50');
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files, syncUIFn);
  });

  $('clearAll').onclick = () => {
    if (confirm('Tüm sorular silinsin mi?')) {
      questions.length = 0;
      render();
    }
  };

  $('preview').onclick = () => $('preview').classList.replace('flex', 'hidden');

  $('gCancel').onclick = () => $('groupModal').classList.replace('flex', 'hidden');
  $('gSave').onclick = () => {
    const gid = (groupTarget && groupTarget.groupId) || uid();
    questions.forEach(x => {
      if (groupTarget && x.id === groupTarget.id) {
        x.groupId = groupSel.length ? gid : null;
        x.stem = $('gStem').value;
      } else if (groupSel.includes(x.id)) {
        x.groupId = gid;
        x.stem = '';
      } else if (x.groupId === gid) {
        x.groupId = null;
        x.stem = '';
      }
    });
    $('groupModal').classList.replace('flex', 'hidden');
    render();
  };

  $('saveDraft').onclick = () => {
    try {
      if (typeof collectFn === 'function') collectFn();
      if (!questions.length) {
        alert('Kaydedilecek soru bulunamadı. Önce en az bir soru ekleyin.');
        return;
      }
      const payload = JSON.stringify({ questions, settings: S });
      const blob = new Blob([payload], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const tParsed = parseTags(S.title || 'Test');
      const baseName = defaultBaseName(tParsed.clean, S);
      const a = document.createElement('a');
      a.href = url;
      a.download = baseName + ' - ' + todayStr() + '.db';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (e) {
      alert('Çalışma kaydedilirken hata oluştu: ' + (e && e.message ? e.message : e));
    }
  };
}
