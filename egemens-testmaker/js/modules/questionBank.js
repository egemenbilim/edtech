import { questions, setQuestions, S, LETTERS, MAX } from '../state.js';
import { $, uid, esc, openModal, closeModal, todayStr } from '../utils.js';

const BANK_STORAGE_KEY = 'testmaker_question_banks_v1';

let banks = [];
let currentBankId = null;
let selectedPoolQuestionIds = new Set();
let filterLevel = 'all';
let filterTag = '';
let filterSearch = '';
let onBankUpdatedCallback = null;

export function setOnBankUpdatedCallback(fn) {
  onBankUpdatedCallback = fn;
}

// ================= IndexedDB / LocalStorage Storage =================
function openBankDB() {
  return new Promise((res, rej) => {
    if (!window.indexedDB) return rej(new Error('no idb'));
    const req = indexedDB.open('egemen-testmaker-banks', 1);
    req.onupgradeneeded = () => {
      try { req.result.createObjectStore('banks'); } catch (e) {}
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

export async function loadBanks() {
  try {
    const db = await openBankDB();
    const data = await new Promise((res, rej) => {
      const tx = db.transaction('banks', 'readonly');
      const getReq = tx.objectStore('banks').get(BANK_STORAGE_KEY);
      getReq.onsuccess = () => res(getReq.result || null);
      getReq.onerror = () => rej(getReq.error);
    });
    if (Array.isArray(data) && data.length) {
      banks = data;
    } else {
      banks = getFallbackBanks();
    }
  } catch (e) {
    try {
      const raw = localStorage.getItem(BANK_STORAGE_KEY);
      banks = raw ? JSON.parse(raw) : getFallbackBanks();
    } catch (err) {
      banks = getFallbackBanks();
    }
  }

  if (!banks.length) {
    banks = [
      {
        id: uid(),
        name: 'Genel Soru Havuzu',
        description: 'Tüm branş ve seviyeler için varsayılan soru havuzu.',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        questions: []
      }
    ];
    saveBanks();
  }

  if (!currentBankId || !banks.find(b => b.id === currentBankId)) {
    currentBankId = banks[0].id;
  }

  return banks;
}

function getFallbackBanks() {
  return [
    {
      id: uid(),
      name: 'Genel Soru Havuzu',
      description: 'Tüm branş ve seviyeler için varsayılan soru havuzu.',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      questions: []
    }
  ];
}

export async function saveBanks() {
  try {
    const db = await openBankDB();
    await new Promise((res, rej) => {
      const tx = db.transaction('banks', 'readwrite');
      tx.objectStore('banks').put(banks, BANK_STORAGE_KEY);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch (e) {
    try {
      localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(banks));
    } catch (err) {}
  }
  if (typeof onBankUpdatedCallback === 'function') {
    onBankUpdatedCallback();
  }
}

export function getBanks() {
  return banks;
}

export function getCurrentBank() {
  return banks.find(b => b.id === currentBankId) || banks[0] || null;
}

export function setCurrentBank(bankId) {
  if (banks.find(b => b.id === bankId)) {
    currentBankId = bankId;
    selectedPoolQuestionIds.clear();
    renderBankModalContent();
  }
}

export function createNewBank(name, description = '') {
  const trimmed = (name || '').trim();
  if (!trimmed) return null;
  const newBank = {
    id: uid(),
    name: trimmed,
    description: description.trim(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    questions: []
  };
  banks.push(newBank);
  currentBankId = newBank.id;
  saveBanks();
  renderBankModalContent();
  return newBank;
}

export function renameCurrentBank(newName) {
  const b = getCurrentBank();
  if (!b) return;
  const trimmed = (newName || '').trim();
  if (!trimmed) return;
  b.name = trimmed;
  b.updatedAt = Date.now();
  saveBanks();
  renderBankModalContent();
}

export function deleteCurrentBank() {
  if (banks.length <= 1) {
    alert('En az bir soru havuzu bulunmalıdır. Havuz silinemez.');
    return;
  }
  const b = getCurrentBank();
  if (!b) return;
  if (!confirm(`"${b.name}" havuzunu ve içindeki tüm soruları silmek istediğinize emin misiniz?`)) {
    return;
  }
  banks = banks.filter(x => x.id !== b.id);
  currentBankId = banks[0].id;
  saveBanks();
  renderBankModalContent();
}

// ================= Question Import / Export to Pool =================
export function addCurrentTestQuestionsToBank() {
  const b = getCurrentBank();
  if (!b) return;
  if (!questions.length) {
    alert('Şu anda sınavınızda soru bulunmuyor. Önce soru ekleyin.');
    return;
  }

  let addedCount = 0;
  questions.forEach((q) => {
    const clone = JSON.parse(JSON.stringify(q));
    clone.id = uid();
    clone.createdAt = Date.now();
    if (!clone.level) clone.level = 'orta';
    if (!Array.isArray(clone.tags)) clone.tags = [];
    b.questions.push(clone);
    addedCount++;
  });

  b.updatedAt = Date.now();
  saveBanks();
  renderBankModalContent();
  alert(`${addedCount} adet soru "${b.name}" havuzuna başarıyla eklendi!`);
}

export function addSelectedPoolQuestionsToTest(onAddedCallback) {
  const b = getCurrentBank();
  if (!b || !selectedPoolQuestionIds.size) {
    alert('Lütfen sınava eklemek için en az bir soru seçin.');
    return;
  }

  const selectedList = b.questions.filter(q => selectedPoolQuestionIds.has(q.id));
  if (!selectedList.length) return;

  if (questions.length + selectedList.length > MAX) {
    alert(`Maksimum soru sınırı (${MAX}) aşılıyor. En fazla ${MAX - questions.length} soru daha ekleyebilirsiniz.`);
    return;
  }

  selectedList.forEach((q) => {
    const clone = JSON.parse(JSON.stringify(q));
    clone.id = uid();
    questions.push(clone);
  });

  selectedPoolQuestionIds.clear();
  closeModal('bankModal');
  if (typeof onAddedCallback === 'function') onAddedCallback();
  alert(`${selectedList.length} adet soru mevcut sınava eklendi.`);
}

// ================= DB Export & Import (.db) =================
export function exportCurrentBankToDB() {
  const b = getCurrentBank();
  if (!b) return;
  if (!b.questions.length) {
    alert('Bu havuzda henüz soru bulunmuyor.');
    return;
  }

  const payload = {
    type: 'edtech-question-bank',
    version: 2,
    bankName: b.name,
    bankDescription: b.description || '',
    exportDate: new Date().toISOString(),
    questionCount: b.questions.length,
    questions: b.questions
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = b.name.replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ\-_ ]/g, '').trim() || 'Soru_Bankasi';
  a.href = url;
  a.download = `${safeName} - ${todayStr()}.db`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function importBankFromDB(file) {
  if (!file) return;
  try {
    const raw = await file.text();
    const data = JSON.parse(raw);
    if (!data) throw new Error('Boş dosya');

    let importedQuestions = [];
    let bankName = file.name.replace(/\.db$/i, '').replace(/ - \d{2}\.\d{2}\.\d{4}$/, '') || 'İçe Aktarılan Havuz';
    let bankDesc = 'Paylaşılan .db dosyasından içe aktarıldı.';

    if (data.type === 'edtech-question-bank' && Array.isArray(data.questions)) {
      importedQuestions = data.questions;
      if (data.bankName) bankName = data.bankName;
      if (data.bankDescription) bankDesc = data.bankDescription;
    } else if (Array.isArray(data.questions)) {
      // TestMaker standard draft file
      importedQuestions = data.questions;
      bankName = 'İçe Aktarılan Soru Taslağı';
    } else if (Array.isArray(data)) {
      importedQuestions = data;
    } else {
      throw new Error('Geçersiz .db soru havuzu biçimi.');
    }

    if (!importedQuestions.length) {
      alert('Dosyada soru bulunamadı.');
      return;
    }

    const newBank = {
      id: uid(),
      name: bankName,
      description: bankDesc,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      questions: importedQuestions.map(q => ({
        ...q,
        id: uid(),
        level: q.level || 'orta',
        tags: Array.isArray(q.tags) ? q.tags : []
      }))
    };

    banks.push(newBank);
    currentBankId = newBank.id;
    saveBanks();
    renderBankModalContent();
    alert(`"${newBank.name}" havuzu (${newBank.questions.length} soru) başarıyla içe aktarıldı!`);
  } catch (e) {
    alert('Soru havuzu dosyası okunamadı: ' + (e && e.message ? e.message : e));
  }
}

// ================= UI Rendering =================
export function openBankModal() {
  renderBankModalContent();
  openModal('bankModal');
}

export function renderBankModalContent() {
  const b = getCurrentBank();
  if (!b) return;

  // Render bank list dropdown
  const select = $('bankSelect');
  if (select) {
    select.innerHTML = banks.map(item =>
      `<option value="${item.id}" ${item.id === currentBankId ? 'selected' : ''}>${esc(item.name)} (${item.questions ? item.questions.length : 0} soru)</option>`
    ).join('');
  }

  // Update bank info
  if ($('bankTitleDisplay')) $('bankTitleDisplay').textContent = b.name;
  if ($('bankDescDisplay')) $('bankDescDisplay').textContent = b.description || 'Açıklama belirtilmemiş.';
  if ($('bankQTotal')) $('bankQTotal').textContent = b.questions ? b.questions.length : 0;

  // Filter questions
  let list = Array.isArray(b.questions) ? [...b.questions] : [];

  if (filterLevel !== 'all') {
    list = list.filter(q => (q.level || 'orta') === filterLevel);
  }

  if (filterTag) {
    const tLower = filterTag.toLowerCase();
    list = list.filter(q => (q.tags || []).some(t => t.toLowerCase().includes(tLower)));
  }

  if (filterSearch) {
    const sLower = filterSearch.toLowerCase();
    list = list.filter(q =>
      (q.text && q.text.toLowerCase().includes(sLower)) ||
      (q.root && q.root.toLowerCase().includes(sLower)) ||
      (q.blankText && q.blankText.toLowerCase().includes(sLower)) ||
      (q.tags && q.tags.some(t => t.toLowerCase().includes(sLower)))
    );
  }

  // Collect all unique tags in current bank for filter chips
  const allTags = new Set();
  (b.questions || []).forEach(q => {
    (q.tags || []).forEach(t => allTags.add(t));
  });

  const tagWrap = $('bankTagPills');
  if (tagWrap) {
    if (!allTags.size) {
      tagWrap.innerHTML = '<span class="text-[11px] text-slate-400 italic">Henüz etiket eklenmemiş</span>';
    } else {
      tagWrap.innerHTML = Array.from(allTags).map(t =>
        `<button type="button" data-tag="${esc(t)}" class="bank-tag-chip rounded-full px-2 py-0.5 text-[10px] font-medium transition ${filterTag === t ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}">#${esc(t)}</button>`
      ).join('');
    }
  }

  // Update selected count
  if ($('bankSelectedCount')) {
    $('bankSelectedCount').textContent = selectedPoolQuestionIds.size;
  }

  // Render question cards list
  const container = $('bankQuestionsList');
  if (!container) return;

  if (!list.length) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center">
        <span class="text-3xl">📭</span>
        <p class="mt-2 text-[14px] font-medium text-slate-700 dark:text-slate-300">Bu havuzda veya filtrede soru bulunamadı.</p>
        <p class="text-[12px] text-slate-400">Aktif sınavınızdaki soruları bu havuza ekleyebilir veya yeni .db havuzu yükleyebilirsiniz.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map((q, idx) => {
    const isSelected = selectedPoolQuestionIds.has(q.id);
    const lvl = q.level || 'orta';
    const lvlConfig = {
      kolay: { label: 'Kolay', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
      orta: { label: 'Orta', bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
      zor: { label: 'Zor', bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' }
    }[lvl] || { label: 'Orta', bg: 'bg-slate-50 text-slate-700 border-slate-200' };

    const qKindLabel = q.type === 'text'
      ? (q.kind === 'bosluk' ? 'Boşluk Doldurma' : (q.kind === 'klasik' ? 'Klasik Soru' : 'Çoktan Seçmeli'))
      : 'Görsel Soru';

    return `
      <div class="bank-q-card relative flex flex-col justify-between rounded-xl border p-3 transition ${isSelected ? 'border-slate-900 bg-slate-50/70 shadow-sm dark:border-white dark:bg-slate-800/80' : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'}" data-qid="${q.id}">
        <div>
          <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="bank-q-check" data-qid="${q.id}" ${isSelected ? 'checked' : ''} style="accent-color:#0f172a">
              <span class="text-[11px] font-bold text-slate-700 dark:text-slate-300">Soru #${idx + 1}</span>
            </label>
            <div class="flex items-center gap-1.5">
              <span class="rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">${qKindLabel}</span>
              <span class="rounded border px-1.5 py-0.5 text-[9px] font-semibold ${lvlConfig.bg}">${lvlConfig.label}</span>
            </div>
          </div>

          <div class="mt-2.5 max-h-28 overflow-hidden text-left text-[12px] leading-relaxed text-slate-700 dark:text-slate-300">
            ${q.imgSrc ? `<div class="mb-2"><img src="${q.imgSrc}" class="max-h-16 rounded border border-slate-200"></div>` : ''}
            ${q.type === 'text'
              ? (q.kind === 'bosluk'
                ? esc(q.blankText || '').replace(/(\.\.\.|_{2,})/g, '______')
                : (q.text ? `<div class="text-slate-500 text-[11px] line-clamp-2">${esc(q.text)}</div>` : '') +
                  (q.root ? `<div class="font-semibold line-clamp-2">${esc(q.root)}</div>` : ''))
              : (q.src ? `<img src="${q.src}" class="max-h-24 w-full object-contain">` : '<span class="italic text-slate-400">Görsel</span>')}
          </div>
        </div>

        <div class="mt-3 border-t border-slate-100 pt-2 dark:border-slate-800">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap gap-1">
              ${(q.tags || []).map(t => `<span class="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">#${esc(t)}</span>`).join('')}
            </div>
            <div class="flex items-center gap-1">
              ${q.answer ? `<span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Cevap: ${q.answer}</span>` : ''}
              <button type="button" class="bank-q-delete rounded px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-rose-600" data-del-qid="${q.id}" title="Bu soruyu havuzdan sil">Sil ✕</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ================= Event Wire-up =================
export function initQuestionBank(onTestChangedCallback) {
  loadBanks().then(() => {
    renderBankModalContent();
  });

  // Open modal button
  const openBtn = $('openBankModalBtn');
  if (openBtn) openBtn.onclick = () => openBankModal();

  const openBtn2 = $('dropzoneBankBtn');
  if (openBtn2) openBtn2.onclick = () => openBankModal();

  // Close modal button
  const closeBtn = $('bankModalClose');
  if (closeBtn) closeBtn.onclick = () => closeModal('bankModal');

  // Bank dropdown switch
  const select = $('bankSelect');
  if (select) {
    select.onchange = (e) => {
      setCurrentBank(e.target.value);
    };
  }

  // Create new bank button
  const newBankBtn = $('bankCreateBtn');
  if (newBankBtn) {
    newBankBtn.onclick = () => {
      const name = prompt('Yeni Soru Havuzu Adı:');
      if (name && name.trim()) {
        const desc = prompt('Havuz Açıklaması (İsteğe bağlı):', '') || '';
        createNewBank(name, desc);
      }
    };
  }

  // Rename bank button
  const renameBankBtn = $('bankRenameBtn');
  if (renameBankBtn) {
    renameBankBtn.onclick = () => {
      const b = getCurrentBank();
      if (!b) return;
      const name = prompt('Havuzun Yeni Adı:', b.name);
      if (name && name.trim()) renameCurrentBank(name);
    };
  }

  // Delete bank button
  const delBankBtn = $('bankDeleteBtn');
  if (delBankBtn) {
    delBankBtn.onclick = () => deleteCurrentBank();
  }

  // Add current test questions to bank
  const saveTestBtn = $('bankSaveCurrentTestBtn');
  if (saveTestBtn) {
    saveTestBtn.onclick = () => addCurrentTestQuestionsToBank();
  }

  // Add selected pool questions to test
  const addSelectedBtn = $('bankAddSelectedBtn');
  if (addSelectedBtn) {
    addSelectedBtn.onclick = () => addSelectedPoolQuestionsToTest(onTestChangedCallback);
  }

  // Export current bank to .db
  const exportBtn = $('bankExportBtn');
  if (exportBtn) {
    exportBtn.onclick = () => exportCurrentBankToDB();
  }

  // Import .db to bank
  const importFile = $('bankImportFile');
  const importBtn = $('bankImportBtn');
  if (importBtn && importFile) {
    importBtn.onclick = () => importFile.click();
    importFile.onchange = (e) => {
      if (e.target.files && e.target.files[0]) {
        importBankFromDB(e.target.files[0]);
        e.target.value = '';
      }
    };
  }

  // Level filter buttons
  document.querySelectorAll('[data-bank-filter-level]').forEach((btn) => {
    btn.onclick = () => {
      filterLevel = btn.dataset.bankFilterLevel;
      document.querySelectorAll('[data-bank-filter-level]').forEach(b => {
        b.classList.toggle('active', b.dataset.bankFilterLevel === filterLevel);
      });
      renderBankModalContent();
    };
  });

  // Search input
  const searchInp = $('bankSearchInp');
  if (searchInp) {
    searchInp.oninput = (e) => {
      filterSearch = e.target.value;
      renderBankModalContent();
    };
  }

  // Select all / Deselect all
  const selectAllBtn = $('bankSelectAllBtn');
  if (selectAllBtn) {
    selectAllBtn.onclick = () => {
      const b = getCurrentBank();
      if (!b || !b.questions) return;
      if (selectedPoolQuestionIds.size === b.questions.length) {
        selectedPoolQuestionIds.clear();
      } else {
        b.questions.forEach(q => selectedPoolQuestionIds.add(q.id));
      }
      renderBankModalContent();
    };
  }

  // Event delegation on question list container
  const container = $('bankQuestionsList');
  if (container) {
    container.onclick = (e) => {
      const target = e.target;
      // Checkbox click
      if (target.classList.contains('bank-q-check')) {
        const qid = target.dataset.qid;
        if (target.checked) selectedPoolQuestionIds.add(qid);
        else selectedPoolQuestionIds.delete(qid);
        if ($('bankSelectedCount')) $('bankSelectedCount').textContent = selectedPoolQuestionIds.size;
        const card = target.closest('.bank-q-card');
        if (card) {
          card.classList.toggle('border-slate-900', target.checked);
          card.classList.toggle('bg-slate-50/70', target.checked);
        }
        return;
      }
      // Tag click
      const tagChip = target.closest('.bank-tag-chip');
      if (tagChip) {
        const t = tagChip.dataset.tag;
        filterTag = filterTag === t ? '' : t;
        renderBankModalContent();
        return;
      }
      // Delete question from bank
      const delBtn = target.closest('.bank-q-delete');
      if (delBtn) {
        const qid = delBtn.dataset.delQid;
        const b = getCurrentBank();
        if (b && confirm('Bu soruyu havuzdan silmek istediğinize emin misiniz?')) {
          b.questions = b.questions.filter(q => q.id !== qid);
          selectedPoolQuestionIds.delete(qid);
          saveBanks();
          renderBankModalContent();
        }
        return;
      }
    };
  }
}
