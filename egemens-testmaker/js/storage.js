import { S, questions, setQuestions } from './state.js';
import { $, openModal, closeModal } from './utils.js';

const AS_KEY = 'testmaker-autosave';
let asTimer = null, asReady = false, asRestoring = false;

export function asOpenDB() {
  return new Promise((res, rej) => {
    if (!window.indexedDB) return rej(new Error('no idb'));
    const r = indexedDB.open('egemen-testmaker', 1);
    r.onupgradeneeded = () => { try { r.result.createObjectStore('kv'); } catch (e) {} };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

export function asPut(data) {
  return asOpenDB().then((db) => new Promise((res, rej) => {
    const tx = db.transaction('kv', 'readwrite');
    tx.objectStore('kv').put(data, AS_KEY);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  })).catch(() => {
    try { localStorage.setItem(AS_KEY, JSON.stringify({ t: data.t, n: data.questions.length })); } catch (e) {}
  });
}

export function asGet() {
  return asOpenDB().then((db) => new Promise((res, rej) => {
    const tx = db.transaction('kv', 'readonly');
    const q = tx.objectStore('kv').get(AS_KEY);
    q.onsuccess = () => res(q.result || null);
    q.onerror = () => rej(q.error);
  })).catch(() => null);
}

export function asClear() {
  return asOpenDB().then((db) => new Promise((res) => {
    const tx = db.transaction('kv', 'readwrite');
    tx.objectStore('kv').delete(AS_KEY);
    tx.oncomplete = () => res();
    tx.onerror = () => res();
  })).catch(() => {});
}

export function scheduleAutosave(collectFn) {
  if (!asReady || asRestoring) return;
  clearTimeout(asTimer);
  asTimer = setTimeout(() => runAutosave(collectFn), 2000);
}

export function runAutosave(collectFn) {
  try {
    if (typeof collectFn === 'function') collectFn();
    const payload = { t: Date.now(), questions, settings: S };
    asPut(payload);
  } catch (e) {}
}

export async function offerRestore(syncUIFn, renderFn) {
  let data = null;
  try { data = await asGet(); } catch (e) {}
  if (!data || !Array.isArray(data.questions) || !data.questions.length) {
    asReady = true;
    return;
  }
  const d = new Date(data.t || Date.now());
  const p = (n) => String(n).padStart(2, '0');
  $('restoreMeta').textContent = data.questions.length + ' soru · ' + p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  openModal('restoreModal');
  $('restoreYes').onclick = () => {
    asRestoring = true;
    try {
      setQuestions(data.questions);
      if (data.settings && typeof data.settings === 'object') Object.assign(S, data.settings);
      if (typeof syncUIFn === 'function') syncUIFn();
      if (typeof renderFn === 'function') renderFn();
    } catch (e) {
      console.error(e);
    }
    closeModal('restoreModal');
    asRestoring = false;
    asReady = true;
  };
  $('restoreNo').onclick = () => {
    asClear();
    closeModal('restoreModal');
    asReady = true;
  };
}
