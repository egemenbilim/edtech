/* ══════════════════════════════════════════════════════
   Eğitim Promptları Deposu — Yardımcı Araçlar (Utils)
   ══════════════════════════════════════════════════════ */

import { TURKISH_RULE } from './templates.js';

export function toast(msg, type) {
  const wrap = document.getElementById('toast-wrap');
  if (!wrap) return;

  const t = document.createElement('div');
  t.className = 'toast ' + (type || 'err');
  t.innerHTML = (type === 'ok' ? '✨ ' : '⚠️ ') + msg;
  wrap.appendChild(t);

  setTimeout(() => {
    t.classList.add('out');
    setTimeout(() => t.remove(), 320);
  }, 3200);
}

export function markInvalid(el) {
  if (!el) return;
  el.classList.remove('invalid');
  void el.offsetWidth;
  el.classList.add('invalid');
  el.addEventListener('animationend', () => el.classList.remove('invalid'), { once: true });
}

export function tidy(s) {
  return s.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}
