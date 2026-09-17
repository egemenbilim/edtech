import { questions, MAX, LETTERS } from '../state.js';
import { $, uid, esc, openModal, closeModal, warnText, clearWarn } from '../utils.js';
import { openGeometryModal } from './geometryDrawer.js';
import { openScienceModal } from './scienceTemplates.js';

let editingId = null;
let questionKind = 'coktan';
let questionLevel = 'orta';
let blankItems = [''];
let blankAnswers = [''];
let txtImgSrc = null;
let blankImgSrc = null;
let onSaveCallback = null;

export function setOnSaveCallback(fn) {
  onSaveCallback = fn;
}

export function renderBlankList() {
  const list = $('blankQList');
  if (!list) return;
  list.innerHTML = '';
  blankItems.forEach((txt, i) => {
    if (blankAnswers[i] === undefined) blankAnswers[i] = '';
    const row = document.createElement('div');
    row.className = 'rounded-lg border border-slate-100 bg-white p-2 dark:border-slate-700 dark:bg-slate-900';
    row.innerHTML =
      `<div class="flex items-start gap-2">` +
        `<span class="mt-2.5 w-5 shrink-0 text-right text-xs font-semibold text-slate-400">${i + 1}.</span>` +
        `<textarea class="inp h-12 flex-1 leading-relaxed" placeholder="Türk edebiyatında ilk roman ... tarafından yazılmıştır." data-bi="${i}">${esc(txt)}</textarea>` +
        (blankItems.length > 1 ? `<button class="mt-2 shrink-0 rounded px-1.5 py-0.5 text-xs text-slate-300 transition hover:text-rose-600" data-bd="${i}">✕</button>` : '') +
      `</div>` +
      `<div class="mt-1.5 flex items-center gap-2 pl-7">` +
        `<span class="w-14 shrink-0 text-[10px] font-medium uppercase tracking-wide text-emerald-600">Cevap</span>` +
        `<input class="inp !h-7 flex-1 text-[12px]" placeholder="Opsiyonel · cevap anahtarında görünür" data-ba="${i}" value="${esc(blankAnswers[i] || '')}">` +
      `</div>`;
    list.appendChild(row);
  });
  list.querySelectorAll('[data-bi]').forEach((ta) => {
    ta.oninput = () => { blankItems[+ta.dataset.bi] = ta.value; };
  });
  list.querySelectorAll('[data-ba]').forEach((inp) => {
    inp.oninput = () => { blankAnswers[+inp.dataset.ba] = inp.value; };
  });
  list.querySelectorAll('[data-bd]').forEach((btn) => {
    btn.onclick = () => {
      blankItems.splice(+btn.dataset.bd, 1);
      blankAnswers.splice(+btn.dataset.bd, 1);
      renderBlankList();
    };
  });
}

export function setQuestionKind(kind) {
  questionKind = kind;
  document.querySelectorAll('.qkind').forEach((b) => {
    const on = b.dataset.qk === kind;
    b.className = 'qkind rounded-lg py-2 font-medium transition ' +
      (on ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400');
  });
  $('blankPanel').classList.toggle('hidden', kind !== 'bosluk');
  $('preamblePanel').classList.toggle('hidden', kind === 'bosluk');
  $('rootPanel').classList.toggle('hidden', kind === 'bosluk');
  $('optionsPanel').classList.toggle('hidden', kind !== 'coktan');
  $('layoutPanel').classList.toggle('hidden', kind !== 'coktan');
  $('commonImgBlock').classList.toggle('hidden', kind === 'bosluk');
  $('aiPromptPanel').classList.toggle('hidden', kind !== 'coktan');
  if (kind === 'klasik' && $('txtBlank').value === '0') $('txtBlank').value = '25';
  if (kind === 'coktan') $('txtBlank').value = '0';
  if (kind === 'bosluk') { $('txtBlank').value = '0'; renderBlankList(); }
}

export function renderOptionAnswer() {
  const current = $('txtAns').value;
  document.querySelectorAll('[data-opt-answer]').forEach((btn) => {
    const active = btn.dataset.optAnswer === current;
    btn.className = 'opt-answer w-7 shrink-0 rounded-md py-1 text-xs font-bold transition ' +
      (active ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' : 'text-slate-400 hover:bg-slate-200 hover:text-slate-700');
  });
}

function setTxtImg(src) {
  txtImgSrc = src;
  $('imgPreview').src = src || '';
  $('imgPreview').classList.toggle('hidden', !src);
  $('imgUploadPlaceholder').classList.toggle('hidden', !!src);
  $('txtImgRemove').classList.toggle('hidden', !src);
}

function setBlankImg(src) {
  blankImgSrc = src;
  $('blankImgPreview').src = src || '';
  $('blankImgPreview').classList.toggle('hidden', !src);
  $('blankImgPlaceholder').classList.toggle('hidden', !!src);
  $('blankImgRemove').classList.toggle('hidden', !src);
}

export function renderLevelPills() {
  document.querySelectorAll('#txtLevelGroup .lvl-pill').forEach(btn => {
    const isAct = btn.dataset.lvl === questionLevel;
    btn.classList.toggle('active', isAct);
    if (isAct) {
      if (questionLevel === 'kolay') btn.className = 'lvl-pill active flex-1 rounded-lg border border-emerald-500 bg-emerald-50 py-1.5 text-[11px] font-semibold text-emerald-800 transition dark:bg-emerald-950/50 dark:text-emerald-300';
      else if (questionLevel === 'zor') btn.className = 'lvl-pill active flex-1 rounded-lg border border-rose-500 bg-rose-50 py-1.5 text-[11px] font-semibold text-rose-800 transition dark:bg-rose-950/50 dark:text-rose-300';
      else btn.className = 'lvl-pill active flex-1 rounded-lg border border-amber-500 bg-amber-50 py-1.5 text-[11px] font-semibold text-amber-800 transition dark:bg-amber-950/50 dark:text-amber-300';
    } else {
      btn.className = 'lvl-pill flex-1 rounded-lg border border-slate-200 bg-white py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300';
    }
  });
}

export function openText(q) {
  editingId = q ? q.id : null;
  $('txtTitle').textContent = q ? 'Yazılı soruyu düzenle' : 'Yazılı soru ekle';
  setTxtImg(q ? (q.imgSrc || q.src || null) : null);
  $('imgUploadPanel').classList.toggle('hidden', !(q && (q.imgSrc || q.src)));
  
  questionLevel = (q && q.level) || 'orta';
  renderLevelPills();
  if ($('txtTags')) $('txtTags').value = (q && Array.isArray(q.tags)) ? q.tags.join(', ') : '';

  const bImg = q && q.kind === 'bosluk' ? q.imgSrc : null;
  setBlankImg(bImg || null);
  $('blankImgPanel').classList.toggle('hidden', !bImg);
  
  if (q && q.kind === 'bosluk') {
    if (q.blankItems && q.blankItems.length) blankItems = [...q.blankItems];
    else if (q.blankText) blankItems = [q.blankText];
    else blankItems = [''];
    
    if (q.groupId) {
      const grouped = questions.filter((x) => x.groupId === q.groupId && x.kind === 'bosluk');
      blankAnswers = blankItems.map((_, idx) => (grouped[idx] && grouped[idx].answer) || '');
    } else if (q.blankAnswers && q.blankAnswers.length) {
      blankAnswers = [...q.blankAnswers];
    } else {
      blankAnswers = blankItems.map((_, idx) => (idx === 0 ? (q.answer || '') : ''));
    }
  } else {
    blankItems = [''];
    blankAnswers = [''];
  }
  
  setQuestionKind(q && q.kind ? q.kind : 'coktan');
  $('txtPreamble').value = q ? (q.text || '') : '';
  $('txtRoot').value = q ? (q.root || '') : '';
  $('txtWordBank').value = q && q.wordBank ? q.wordBank.join(', ') : '';
  for (let i = 0; i < 5; i++) $('opt' + i).value = q && q.options ? (q.options[i] || '') : '';
  $('txtAns').value = q && q.answer ? q.answer : '';
  renderOptionAnswer();
  $('txtLayout').value = q && q.layout ? q.layout : 'v';
  $('txtBlank').value = String(q && q.blank ? q.blank : (q && q.kind === 'klasik' ? 25 : 0));
  clearWarn();
  openModal('textModal');
  $('aiPromptPanel').removeAttribute('open');
}

export function saveText(keepOpen) {
  try {
    _saveText(keepOpen);
  } catch (e) {
    console.error('saveText hatası:', e);
    if (!keepOpen) closeModal('textModal');
    alert('Soru kaydedilirken beklenmedik bir hata oluştu:\n' + (e && e.message ? e.message : e));
  }
}

function _saveText(keepOpen) {
  const preamble = $('txtPreamble').value.trim();
  const root = $('txtRoot').value.trim();
  const wordBank = $('txtWordBank').value.split(',').map((w) => w.trim()).filter(Boolean);

  if (questionKind === 'bosluk') {
    const validBlanks = blankItems.map((t) => t.trim()).filter(Boolean);
    if (!validBlanks.length) {
      if (!keepOpen) return closeModal('textModal');
      return warnText('Lütfen en az bir boşluk doldurma cümlesi giriniz.');
    }
    if (editingId) {
      const idx = questions.findIndex((x) => x.id === editingId);
      const oldGroupId = questions[idx].groupId;
      let groupQuestions = oldGroupId ? questions.filter((x) => x.groupId === oldGroupId) : [questions[idx]];
      groupQuestions.forEach((gq) => {
        const gi = questions.findIndex((x) => x.id === gq.id);
        if (gi >= 0) questions.splice(gi, 1);
      });
      const gid = validBlanks.length > 1 ? uid() : null;
      const validAns = [];
      blankItems.forEach((t, i) => { if (t.trim()) validAns.push((blankAnswers[i] || '').trim()); });
      validBlanks.forEach((bt, bi) => {
        questions.splice(idx + bi, 0, {
          id: bi === 0 ? editingId : uid(),
          groupId: gid,
          stem: '',
          name: 'metin',
          type: 'text',
          kind: 'bosluk',
          text: '',
          root: '',
          imgSrc: bi === 0 && blankImgSrc ? blankImgSrc : null,
          blankText: bt,
          blankItems: validBlanks,
          wordBank,
          bankShared: false,
          options: ['', '', '', '', ''],
          layout: 'v',
          blank: 0,
          answer: validAns[bi] || null,
        });
      });
    } else {
      if (questions.length + validBlanks.length > MAX) return alert('Maksimum soru sınırına ulaşıldı.');
      const gid = validBlanks.length > 1 ? uid() : null;
      const validAns = [];
      blankItems.forEach((t, i) => { if (t.trim()) validAns.push((blankAnswers[i] || '').trim()); });
      validBlanks.forEach((bt, bi) => {
        questions.push({
          id: uid(),
          groupId: gid,
          stem: '',
          name: 'metin',
          type: 'text',
          kind: 'bosluk',
          text: '',
          root: '',
          imgSrc: bi === 0 && blankImgSrc ? blankImgSrc : null,
          blankText: bt,
          blankItems: validBlanks,
          wordBank,
          bankShared: false,
          options: ['', '', '', '', ''],
          layout: 'v',
          blank: 0,
          answer: validAns[bi] || null,
        });
      });
    }
    if (onSaveCallback) onSaveCallback();
    if (keepOpen) {
      editingId = null;
      $('txtTitle').textContent = 'Yazılı soru ekle';
      blankItems = [''];
      blankAnswers = [''];
      $('txtWordBank').value = '';
      setBlankImg(null);
      $('blankImgPanel').classList.add('hidden');
      $('blankImgFile').value = '';
      renderBlankList();
    } else {
      closeModal('textModal');
    }
    return;
  }

  if (!preamble && !root) {
    const hasOptions = [0, 1, 2, 3, 4].some((i) => $('opt' + i).value.trim());
    if (!hasOptions) return closeModal('textModal');
    return warnText('Lütfen soru metni veya soru kökü giriniz.');
  }

  const options = [0, 1, 2, 3, 4].map((i) => $('opt' + i).value.trim());
  const tags = $('txtTags') ? $('txtTags').value.split(',').map(t => t.trim()).filter(Boolean) : [];
  const data = {
    type: 'text',
    kind: questionKind,
    level: questionLevel || 'orta',
    tags: tags,
    text: preamble,
    root: root,
    imgSrc: txtImgSrc ? txtImgSrc : null,
    blankText: '',
    blankItems: [],
    wordBank: [],
    bankShared: false,
    options: questionKind === 'coktan' ? options : ['', '', '', '', ''],
    layout: $('txtLayout').value,
    blank: +$('txtBlank').value || 0,
    answer: $('txtAns').value || null,
  };

  if (editingId) {
    const q = questions.find((x) => x.id === editingId);
    if (q) Object.assign(q, data);
  } else {
    if (questions.length >= MAX) return alert('Maksimum soru sınırına ulaşıldı.');
    questions.push(Object.assign({ id: uid(), groupId: null, stem: '', name: 'metin' }, data));
  }

  if (onSaveCallback) onSaveCallback();

  if (keepOpen) {
    editingId = null;
    $('txtTitle').textContent = 'Yazılı soru ekle';
    $('txtPreamble').value = '';
    $('txtRoot').value = '';
    setTxtImg(null);
    $('imgUploadPanel').classList.add('hidden');
    $('txtImgFile').value = '';
    [0, 1, 2, 3, 4].forEach((i) => ($('opt' + i).value = ''));
    $('txtAns').value = '';
    renderOptionAnswer();
  } else {
    closeModal('textModal');
  }
}

export function extractMarked(raw) {
  if (!raw) return null;
  const m = raw.match(/\*([\s\S]*?)\*/);
  if (!m) return null;
  return { marked: m[1].trim(), rest: (raw.slice(0, m.index) + ' ' + raw.slice(m.index + m[0].length)).trim() };
}

export function autoParseQuestion(raw) {
  if (!raw || !raw.trim()) return;
  const starMatch = extractMarked(raw);
  const source = starMatch ? starMatch.rest : raw;
  const lines = source.split('\n');
  const optMap = {};
  const rest = [];
  const optRegex = /^\s*([A-Ea-e])\s*[).:\-]\s*(.+)$/;

  lines.forEach((line) => {
    const m = line.trim().match(optRegex);
    if (m && 'ABCDEabcde'.includes(m[1])) {
      optMap[m[1].toUpperCase()] = m[2].trim();
    } else if (!/(?:cevap|doğru\s*cevap|dogru\s*cevap|yanıt|answer)\s*[:=]?\s*[A-Ea-e]\b/i.test(line)) {
      rest.push(line);
    }
  });

  if (Object.keys(optMap).length >= 2) {
    LETTERS.forEach((l, i) => {
      if (optMap[l] !== undefined) $('opt' + i).value = optMap[l];
    });
  }

  const am = raw.match(/(?:cevap|doğru\s*cevap|dogru\s*cevap|yanıt|answer)\s*[:=]?\s*([A-Ea-e])\b/i);
  if (am) {
    $('txtAns').value = am[1].toUpperCase();
    renderOptionAnswer();
  }

  if (starMatch && starMatch.marked) {
    $('txtRoot').value = starMatch.marked;
    $('txtPreamble').value = rest.join('\n').trim();
    return;
  }

  const remainingText = rest.join('\n').trim();
  if (remainingText) {
    const paragraphs = remainingText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    if (paragraphs.length >= 2) {
      $('txtRoot').value = paragraphs[paragraphs.length - 1];
      $('txtPreamble').value = paragraphs.slice(0, -1).join('\n\n');
    } else {
      const singleLines = remainingText.split('\n').map((l) => l.trim()).filter(Boolean);
      if (singleLines.length >= 2 && (singleLines[singleLines.length - 1].endsWith('?') || /buna göre|hangisidir|değildir|söylenebilir|kaçtır|hangisinde/i.test(singleLines[singleLines.length - 1]))) {
        $('txtRoot').value = singleLines[singleLines.length - 1];
        $('txtPreamble').value = singleLines.slice(0, -1).join('\n');
      } else if (remainingText.endsWith('?') || /buna göre|hangisidir|değildir|aşağıdakilerden|kaçtır/i.test(remainingText)) {
        $('txtRoot').value = remainingText;
        if ($('txtPreamble').value === raw) $('txtPreamble').value = '';
      } else {
        $('txtPreamble').value = remainingText;
      }
    }
  }
}

export function handleInsertGeometryQuestion(dataUrl) {
  if (!dataUrl) return;

  const preamble = $('txtPreamble')?.value.trim() || '';
  const root = $('txtRoot')?.value.trim() || '';
  const hasUserText = Boolean(preamble || root);

  const defaultRoot = 'Şekilde verilenlere göre istenen değeri bulunuz.';
  const qText = hasUserText ? preamble : '';
  const qRoot = hasUserText ? (root || defaultRoot) : defaultRoot;

  const options = [0, 1, 2, 3, 4].map((i) => $('opt' + i)?.value.trim() || '');
  const hasOptions = options.some(Boolean);

  const tags = $('txtTags')?.value ? $('txtTags').value.split(',').map((t) => t.trim()).filter(Boolean) : ['geometri'];
  if (!tags.includes('geometri')) tags.push('geometri');

  if (editingId) {
    const q = questions.find((x) => x.id === editingId);
    if (q) {
      q.imgSrc = dataUrl;
      if (qText) q.text = qText;
      if (qRoot) q.root = qRoot;
      if (hasOptions) q.options = options;
      if ($('txtAns')?.value) q.answer = $('txtAns').value;
      if (tags.length) q.tags = tags;
    }
  } else {
    if (questions.length >= MAX) {
      alert('Maksimum soru sınırına ulaşıldı.');
      return;
    }
    const newQ = {
      id: uid(),
      groupId: null,
      stem: '',
      name: 'geometri',
      type: 'text',
      kind: questionKind === 'bosluk' ? 'coktan' : questionKind,
      level: questionLevel || 'orta',
      tags: tags,
      text: qText,
      root: qRoot,
      imgSrc: dataUrl,
      blankText: '',
      blankItems: [],
      wordBank: [],
      bankShared: false,
      options: hasOptions ? options : ['', '', '', '', ''],
      layout: $('txtLayout')?.value || 'v',
      blank: 0,
      answer: $('txtAns')?.value || null,
    };
    questions.push(newQ);
  }

  if (onSaveCallback) onSaveCallback();

  // Form alanlarını sıfırla ve kapat
  editingId = null;
  $('txtTitle').textContent = 'Yazılı soru ekle';
  $('txtPreamble').value = '';
  $('txtRoot').value = '';
  setTxtImg(null);
  $('imgUploadPanel').classList.add('hidden');
  $('txtImgFile').value = '';
  [0, 1, 2, 3, 4].forEach((i) => ($('opt' + i).value = ''));
  $('txtAns').value = '';
  renderOptionAnswer();
  closeModal('textModal');
}

export function handleInsertScienceQuestion(dataUrl, templateName = 'Fen & Coğrafya Şablonu', category = 'fen') {
  if (!dataUrl) return;

  const preamble = $('txtPreamble')?.value.trim() || '';
  const root = $('txtRoot')?.value.trim() || '';
  const hasUserText = Boolean(preamble || root);

  const defaultRoot = 'Yukarıda verilen görsel ve bilgilere göre aşağıdaki yargılardan hangisi doğrudur?';
  const qText = hasUserText ? preamble : '';
  const qRoot = hasUserText ? (root || defaultRoot) : defaultRoot;

  const options = [0, 1, 2, 3, 4].map((i) => $('opt' + i)?.value.trim() || '');
  const hasOptions = options.some(Boolean);

  const tagList = [category || 'fen', 'şablon'];
  if (templateName) tagList.push(templateName.toLowerCase().slice(0, 15));

  if (editingId) {
    const q = questions.find((x) => x.id === editingId);
    if (q) {
      q.imgSrc = dataUrl;
      if (qText) q.text = qText;
      if (qRoot) q.root = qRoot;
      if (hasOptions) q.options = options;
      if ($('txtAns')?.value) q.answer = $('txtAns').value;
    }
  } else {
    if (questions.length >= MAX) {
      alert('Maksimum soru sınırına ulaşıldı.');
      return;
    }
    const newQ = {
      id: uid(),
      groupId: null,
      stem: '',
      name: templateName || 'Fen/Coğrafya',
      type: 'text',
      kind: questionKind === 'bosluk' ? 'coktan' : questionKind,
      level: questionLevel || 'orta',
      tags: tagList,
      text: qText,
      root: qRoot,
      imgSrc: dataUrl,
      blankText: '',
      blankItems: [],
      wordBank: [],
      bankShared: false,
      options: hasOptions ? options : ['', '', '', '', ''],
      layout: $('txtLayout')?.value || 'v',
      blank: 0,
      answer: $('txtAns')?.value || null,
    };
    questions.push(newQ);
  }

  if (onSaveCallback) onSaveCallback();

  editingId = null;
  $('txtTitle').textContent = 'Yazılı soru ekle';
  $('txtPreamble').value = '';
  $('txtRoot').value = '';
  setTxtImg(null);
  $('imgUploadPanel').classList.add('hidden');
  $('txtImgFile').value = '';
  [0, 1, 2, 3, 4].forEach((i) => ($('opt' + i).value = ''));
  $('txtAns').value = '';
  renderOptionAnswer();
  closeModal('textModal');
}

export function initTextModal() {
  document.querySelectorAll('.qkind').forEach((b) => (b.onclick = () => setQuestionKind(b.dataset.qk)));
  document.querySelectorAll('[data-opt-answer]').forEach((btn) => {
    btn.onclick = () => {
      $('txtAns').value = $('txtAns').value === btn.dataset.optAnswer ? '' : btn.dataset.optAnswer;
      renderOptionAnswer();
    };
  });

  const blankAddBtn = $('blankAddBtn');
  if (blankAddBtn) {
    blankAddBtn.onclick = () => {
      blankItems.push('');
      blankAnswers.push('');
      renderBlankList();
    };
  }

  $('copyPrompt').onclick = async () => {
    const txt = $('aiPrompt').innerText;
    try {
      await navigator.clipboard.writeText(txt);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = txt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    const btn = $('copyPrompt');
    const old = btn.textContent;
    btn.textContent = 'Kopyalandı!';
    setTimeout(() => { btn.textContent = old; }, 1600);
  };

  const uploadImgBtn = $('txtUploadImgBtn');
  if (uploadImgBtn) {
    uploadImgBtn.onclick = () => {
      $('imgUploadPanel').classList.remove('hidden');
      $('txtImgFile').click();
    };
  }

  $('txtImgFile').onchange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      setTxtImg(r.result);
      $('imgUploadPanel').classList.remove('hidden');
    };
    r.readAsDataURL(f);
  };
  $('txtImgRemove').onclick = () => {
    setTxtImg(null);
    $('txtImgFile').value = '';
    $('imgUploadPanel').classList.add('hidden');
  };

  const blankUploadBtn = $('blankUploadImgBtn');
  if (blankUploadBtn) {
    blankUploadBtn.onclick = () => {
      $('blankImgPanel').classList.remove('hidden');
      $('blankImgFile').click();
    };
  }

  $('blankImgFile').onchange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      setBlankImg(r.result);
      $('blankImgPanel').classList.remove('hidden');
    };
    r.readAsDataURL(f);
  };
  $('blankImgRemove').onclick = () => {
    setBlankImg(null);
    $('blankImgFile').value = '';
    $('blankImgPanel').classList.add('hidden');
  };

  const sciBtn = $('txtOpenScienceBtn');
  if (sciBtn) {
    sciBtn.onclick = () => {
      closeModal('textModal');
      openScienceModal((dataUrl, name, cat) => {
        setTxtImg(dataUrl);
        $('imgUploadPanel').classList.remove('hidden');
        openModal('textModal');
      }, () => {
        openModal('textModal');
      });
    };
  }

  const blankSciBtn = $('blankOpenScienceBtn');
  if (blankSciBtn) {
    blankSciBtn.onclick = () => {
      closeModal('textModal');
      openScienceModal((dataUrl, name, cat) => {
        setBlankImg(dataUrl);
        $('blankImgPanel').classList.remove('hidden');
        openModal('textModal');
      }, () => {
        openModal('textModal');
      });
    };
  }

  $('textBtn').onclick = () => openText(null);
  $('txtCancel').onclick = () => closeModal('textModal');
  $('txtSave').onclick = () => saveText(false);
  $('txtSaveNew').onclick = () => saveText(true);

  document.querySelectorAll('#txtLevelGroup .lvl-pill').forEach((btn) => {
    btn.onclick = () => {
      questionLevel = btn.dataset.lvl;
      renderLevelPills();
    };
  });

  const headerGeoBtn = $('modalHeaderGeoBtn');
  if (headerGeoBtn) {
    headerGeoBtn.onclick = () => {
      closeModal('textModal');
      openGeometryModal((dataUrl) => {
        setTxtImg(dataUrl);
        $('imgUploadPanel').classList.remove('hidden');
        openModal('textModal');
      }, () => {
        openModal('textModal');
      });
    };
  }

  const geoBtn = $('txtOpenGeoBtn');
  if (geoBtn) {
    geoBtn.onclick = () => {
      closeModal('textModal');
      openGeometryModal((dataUrl) => {
        setTxtImg(dataUrl);
        $('imgUploadPanel').classList.remove('hidden');
        openModal('textModal');
      }, () => {
        openModal('textModal');
      });
    };
  }

  const blankGeoBtn = $('blankOpenGeoBtn');
  if (blankGeoBtn) {
    blankGeoBtn.onclick = () => {
      closeModal('textModal');
      openGeometryModal((dataUrl) => {
        setBlankImg(dataUrl);
        $('blankImgPanel').classList.remove('hidden');
        openModal('textModal');
      }, () => {
        openModal('textModal');
      });
    };
  }

  $('txtPreamble').addEventListener('paste', () => { setTimeout(() => autoParseQuestion($('txtPreamble').value), 10); });
  $('txtRoot').addEventListener('paste', () => { setTimeout(() => autoParseQuestion($('txtRoot').value), 10); });
}
