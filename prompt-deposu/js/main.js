/* ══════════════════════════════════════════════════════
   CYBER-NEURAL GLOW STUDIO — MAIN ORCHESTRATOR
   Eğitim Promptları Deposu | Egemen's EdTech
   ══════════════════════════════════════════════════════ */

import {
  SINIF_REQUIRED, PANELS, HIDE_DERS, HIDE_KONU,
  dersOptions, promptTemplates, getConcreteInstruction, TURKISH_RULE
} from './templates.js';
import { toast, markInvalid, tidy } from './utils.js';

let courseCount = 0;
let veliCourseCount = 0;
let isStreaming = false;
let streamTimer = null;
let currentFullText = "";
let soundEnabled = localStorage.getItem('cyber_audio_enabled') !== 'false';

/* ══════════════════════════════════════════════════════
   1. WEB AUDIO API SES SENTEZLEYİCİSİ (Haptic Sound FX)
   ══════════════════════════════════════════════════════ */
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSound(type) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.03);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === 'success') {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 akoru
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.05, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.18);
      });
    } else if (type === 'copy') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch (e) {
    // Ses sentezleyici hatası olursa sessizce yut
  }
}

export function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('cyber_audio_enabled', soundEnabled ? 'true' : 'false');
  updateSoundUI();
  if (soundEnabled) playSound('click');
}

function updateSoundUI() {
  const btn = document.getElementById('btn-sound-toggle');
  const icon = document.getElementById('sound-icon');
  const txt = document.getElementById('sound-text');
  if (!btn) return;
  if (soundEnabled) {
    btn.classList.add('is-active');
    if (icon) icon.textContent = '🔊';
    if (txt) txt.textContent = 'Ses: Açık';
  } else {
    btn.classList.remove('is-active');
    if (icon) icon.textContent = '🔇';
    if (txt) txt.textContent = 'Ses: Kapalı';
  }
}

/* ══════════════════════════════════════════════════════
   2. HTML5 CANVAS: NEURAL CONSTELLATION PARÇACIKLARI
   ══════════════════════════════════════════════════════ */
function initNeuralCanvas() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const mouse = { x: -9999, y: -9999, radius: 140 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
  });

  const particleCount = Math.min(Math.floor(window.innerWidth / 20), 75);
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.75,
      vy: (Math.random() - 0.5) * 0.75,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.4 ? 'rgba(6, 182, 212,' : 'rgba(139, 92, 246,'
    });
  }

  function draw() {
    if (document.hidden) {
      requestAnimationFrame(draw);
      return;
    }
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Parçacık noktası
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + '0.7)';
      ctx.fill();

      // Fareye bağlantı
      const dxMouse = p.x - mouse.x;
      const dyMouse = p.y - mouse.y;
      const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
      if (distMouse < mouse.radius) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(6, 182, 212, ${1 - distMouse / mouse.radius * 0.8})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Yakındaki diğer parçacıklarla bağlantı
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 115) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 * (1 - dist / 115)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════
   3. KUTLAMA KONFETİSİ (Celebration Confetti)
   ══════════════════════════════════════════════════════ */
export function burstConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#ffffff'];
  let pieces = [];
  const count = 70;

  for (let i = 0; i < count; i++) {
    pieces.push({
      x: window.innerWidth * 0.75 + (Math.random() - 0.5) * 200,
      y: window.innerHeight * 0.45,
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * -14 - 6,
      size: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 15,
      opacity: 1,
      gravity: 0.45,
      drag: 0.96
    });
  }

  function renderConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    pieces.forEach(p => {
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.opacity -= 0.012;

      if (p.opacity > 0) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    });

    if (alive) {
      requestAnimationFrame(renderConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  renderConfetti();
}

/* ══════════════════════════════════════════════════════
   4. 3D TILT ETKİLEŞİMİ (Holographic Card Flare)
   ══════════════════════════════════════════════════════ */
function init3DTilt() {
  document.querySelectorAll('.tilt-tile').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -9; // Max 9 deg tilt
      const rotateY = ((x - centerX) / centerX) * 9;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.02)`;
      card.style.setProperty('--tile-mouse-x', `${x}px`);
      card.style.setProperty('--tile-mouse-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      const isChecked = card.querySelector('input[type="radio"]:checked');
      card.style.transform = isChecked ? 'translateY(-3px) scale(1.02)' : 'none';
    });
  });
}

/* ══════════════════════════════════════════════════════
   5. CANLI TYPEWRITER / STREAM METİN AKIŞ MOTORU
   ══════════════════════════════════════════════════════ */
export function streamPrompt(fullText) {
  const box = document.getElementById('result-box');
  const skipBtn = document.getElementById('btn-skip-stream');
  const statusChip = document.getElementById('status-chip');
  const statusText = document.getElementById('status-text');
  const paper = document.getElementById('paper');

  if (!box) return;

  if (isStreaming && streamTimer) {
    clearInterval(streamTimer);
  }

  isStreaming = true;
  currentFullText = fullText;
  box.classList.remove('empty');
  box.innerHTML = '<span class="typewriter-cursor"></span>';

  if (skipBtn) skipBtn.style.display = 'inline-block';
  if (statusChip) {
    statusChip.className = 'terminal-status-pill streaming';
  }
  if (statusText) statusText.textContent = 'Yazılıyor... ⚡';
  if (paper) {
    paper.classList.remove('pulse');
    void paper.offsetWidth;
    paper.classList.add('pulse');
  }

  let index = 0;
  const totalLength = fullText.length;
  // Hızlı akış: her adımda 4-7 karakter yazar
  const chunkSize = Math.max(3, Math.floor(totalLength / 80));

  streamTimer = setInterval(() => {
    index += chunkSize;
    if (index >= totalLength) {
      index = totalLength;
      finalizeStream();
    }
    box.textContent = fullText.slice(0, index);
    box.appendChild(createCursor());
    box.scrollTop = box.scrollHeight;
    updateCounts(index);
  }, 14);
}

function createCursor() {
  const c = document.createElement('span');
  c.className = 'typewriter-cursor';
  return c;
}

export function skipStream() {
  if (!isStreaming) return;
  finalizeStream();
}

function finalizeStream() {
  if (streamTimer) clearInterval(streamTimer);
  isStreaming = false;
  const box = document.getElementById('result-box');
  const skipBtn = document.getElementById('btn-skip-stream');
  const statusChip = document.getElementById('status-chip');
  const statusText = document.getElementById('status-text');

  if (box) {
    box.textContent = currentFullText;
    box.scrollTop = 0;
  }
  if (skipBtn) skipBtn.style.display = 'none';
  if (statusChip) {
    statusChip.className = 'terminal-status-pill ok';
  }
  if (statusText) statusText.textContent = 'Hazır · Türkçe Çıktı';

  updateCounts(currentFullText.length);
  playSound('success');
  burstConfetti();
}

function updateCounts(charCount) {
  const charEl = document.getElementById('count-chars');
  const wordEl = document.getElementById('count-words');
  if (charEl) charEl.textContent = charCount.toLocaleString('tr-TR');
  if (wordEl) {
    const textSnippet = currentFullText.slice(0, charCount);
    const words = textSnippet.split(/\s+/).filter(Boolean).length;
    wordEl.textContent = words.toLocaleString('tr-TR');
  }
}

/* ══════════════════════════════════════════════════════
   6. DİNAMİK FORM SATIRLARI (Çalışma Programı & Veli)
   ══════════════════════════════════════════════════════ */
export function addCourseRow() {
  if (courseCount >= 10) { toast("En fazla 10 ders ekleyebilirsiniz."); return; }
  courseCount++;
  const c = document.getElementById('dynamic-courses');
  if (!c) return;

  const r = document.createElement('div');
  r.className = 'course-row';
  r.innerHTML = `
    <div class="row-field">
      <label class="mini-label">Ders <span class="req">*</span></label>
      <select class="p-ders control">${dersOptions}</select>
    </div>
    <div class="row-field">
      <label class="mini-label">Konu(lar) <span class="req">*</span></label>
      <input type="text" class="p-konu control" placeholder="Örn: Fonksiyonlar, Parabol">
    </div>
    ${courseCount > 1 ? `<button type="button" class="btn-remove" title="Dersi Kaldır">✕</button>` : ''}
  `;
  c.appendChild(r);

  if (courseCount > 1) {
    r.querySelector('.btn-remove').addEventListener('click', () => {
      playSound('click');
      r.remove();
      courseCount--;
    });
  }
  playSound('click');
}

export function addVeliCourseRow() {
  if (veliCourseCount >= 15) { toast("En fazla 15 ders ekleyebilirsiniz."); return; }
  veliCourseCount++;
  const c = document.getElementById('dynamic-veli-courses');
  if (!c) return;

  const r = document.createElement('div');
  r.className = 'veli-course-row';
  r.innerHTML = `
    <div class="row-field">
      <label class="mini-label">Ders ${veliCourseCount === 1 ? '<span class="req">*</span>' : ''}</label>
      <select class="v-ders control" onchange="window.handleVeliDersChange(this)">${dersOptions}</select>
    </div>
    <div class="row-field v-konu-container">
      <label class="mini-label">İşlenen Konular ${veliCourseCount === 1 ? '<span class="req">*</span>' : ''}</label>
      <input type="text" class="v-konu control" placeholder="Örn: Cümlede Anlam">
    </div>
    ${veliCourseCount > 1 ? `<button type="button" class="btn-remove" title="Dersi Kaldır">✕</button>` : ''}
  `;
  c.appendChild(r);

  if (veliCourseCount > 1) {
    r.querySelector('.btn-remove').addEventListener('click', () => {
      playSound('click');
      r.remove();
      veliCourseCount--;
    });
  }
  playSound('click');
}

export function handleVeliDersChange(sel) {
  const r = sel.closest('.veli-course-row');
  const k = r.querySelector('.v-konu-container');
  const isDeneme = sel.value === 'Deneme Sınavı';
  const isFirst = r === document.querySelector('.veli-course-row');

  k.innerHTML = `
    <label class="mini-label">${isDeneme ? 'Yayın Markası <span class="opt">(Opsiyonel)</span>' : 'İşlenen Konular ' + (isFirst ? '<span class="req">*</span>' : '')}</label>
    <input type="text" class="v-konu control" placeholder="${isDeneme ? 'Örn: 3D, Özdebir' : 'Örn: Cümlede Anlam'}">
  `;
}

export function onMateryalChange(v) {
  playSound('click');
  PANELS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const sinifGroup = document.getElementById('sinif-group');
  if (sinifGroup) sinifGroup.style.display = SINIF_REQUIRED.includes(v) ? 'block' : 'none';

  const dersGroup = document.getElementById('main-ders-group');
  if (dersGroup) dersGroup.style.display = HIDE_DERS.includes(v) ? 'none' : 'block';

  const konuGroup = document.getElementById('konu-group');
  if (konuGroup) konuGroup.style.display = HIDE_KONU.includes(v) ? 'none' : 'block';

  const map = {
    nlm: 'nlm-options',
    maarif: 'maarif-options',
    calisma_programi: 'program-options',
    veli_bulteni: 'veli-options',
    gagne: 'gagne-options',
    video: 'video-options'
  };
  if (map[v]) {
    const targetEl = document.getElementById(map[v]);
    if (targetEl) targetEl.style.display = 'block';
  }

  // 3D Tilt tile durumunu güncelle
  document.querySelectorAll('.tilt-tile').forEach(tile => {
    const radio = tile.querySelector('input[type="radio"]');
    if (radio && radio.checked) {
      tile.style.transform = 'translateY(-3px) scale(1.02)';
    } else {
      tile.style.transform = 'none';
    }
  });
}

export function getMateryal() {
  const c = document.querySelector('input[name="materyal"]:checked');
  return c ? c.value : '';
}

/* ══════════════════════════════════════════════════════
   7. PROMPT ÜRETİM MANTIĞI & VALİDASYON
   ══════════════════════════════════════════════════════ */
export function generatePrompt() {
  const materyal = getMateryal();
  if (!materyal) { toast("Lütfen bir Materyal Türü seçin."); return; }

  const sinifNeeded = SINIF_REQUIRED.includes(materyal);
  const sinifEl = document.getElementById("sinif");
  const sinif = sinifNeeded ? sinifEl.value : "";

  if (sinifNeeded && !sinif) {
    markInvalid(sinifEl);
    toast("Bu materyal türü için Sınıf Seviyesi zorunludur.");
    return;
  }

  const concreteEN = sinifNeeded ? getConcreteInstruction(sinif) : "";
  let sonuc = "";

  if (materyal === 'video') {
    const d = document.getElementById("ders").value;
    const k = document.getElementById("konu").value.trim();
    if (!d) { markInvalid(document.getElementById("ders")); toast("Ders seçin."); return; }
    if (!k) { markInvalid(document.getElementById("konu")); toast("Konu yazın."); return; }
    sonuc = promptTemplates.video.replace(/{ders}/g, d).replace(/{konu}/g, k);
  } else if (materyal === 'gagne') {
    const d = document.getElementById("ders").value;
    const k = document.getElementById("konu").value.trim();
    const s = document.getElementById("g-sure").value.trim();
    if (!d) { markInvalid(document.getElementById("ders")); toast("Ders seçin."); return; }
    if (!k) { markInvalid(document.getElementById("konu")); toast("Konu yazın."); return; }
    if (!s) { markInvalid(document.getElementById("g-sure")); toast("Ders Süresi zorunludur."); return; }
    sonuc = promptTemplates.gagne
      .replace(/{ders}/g, d)
      .replace(/{konu}/g, k)
      .replace(/{sinif}/g, sinif)
      .replace(/{g_sure}/g, s)
      .replace(/{ortaokul_ek}/g, concreteEN);
  } else if (materyal === 'veli_bulteni') {
    let liste = [];
    const rows = document.querySelectorAll('.veli-course-row');
    for (let i = 0; i < rows.length; i++) {
      const d = rows[i].querySelector('.v-ders').value;
      const k = rows[i].querySelector('.v-konu').value.trim();
      if (i === 0 && !d) { markInvalid(rows[i].querySelector('.v-ders')); toast("En az 1 ders seçin."); return; }
      if (d) {
        if (d === 'Deneme Sınavı') {
          liste.push(`Trial exam administered${k ? ` (Publisher: ${k})` : ''}`);
        } else {
          if (i === 0 && !k) { markInvalid(rows[i].querySelector('.v-konu')); toast("İlk dersin konusunu yazın."); return; }
          liste.push(`In ${d}, the topic${k ? ` "${k}"` : ''} was covered`);
        }
      }
    }
    const etk = document.getElementById("v-etkinlikler").value.trim() || "(Not specified)";
    sonuc = `Design 1 "Parent Information Bulletin" according to the pedagogical guidelines below.
I want to prepare a bulletin for our students. Write a professional, empathetic, very warm, and motivating text that will include parents in the educational process.
Use minimal warm emojis (e.g., 🌱, 📚, ✨). Create a completely human-sounding bulletin message (suitable for WhatsApp or a parent group) that does not feel like it was written by AI.
- If middle-school audience, add 2-3 very simple, practical pedagogical tips parents can apply at home.

[This Week's Data]
- Lessons Covered: ${liste.join(", ")}.
Please treat each lesson as a separate bullet point. Add contextually appropriate additions for each lesson. If there is a Trial Exam, focus on exam experience, analysis, and motivation.
- Extra Activities: ${etk}

Note: Create a general, motivating, embracing informational text for parents.`;
  } else if (materyal === 'calisma_programi') {
    const sure = document.getElementById("p-sure").value.trim();
    if (!sure) { markInvalid(document.getElementById("p-sure")); toast("Program Süresi zorunludur."); return; }

    let liste = [];
    const rows = document.querySelectorAll('.course-row');
    for (let i = 0; i < rows.length; i++) {
      const d = rows[i].querySelector('.p-ders').value;
      const k = rows[i].querySelector('.p-konu').value.trim();
      if (!d || !k) {
        if (!d) markInvalid(rows[i].querySelector('.p-ders'));
        if (!k) markInvalid(rows[i].querySelector('.p-konu'));
        toast("Tüm ders/konu alanlarını doldurun.");
        return;
      }
      liste.push(`${d} (${k})`);
    }

    const ogrenci = document.getElementById("p-ogrenci").value.trim();
    const kisi = ogrenci || "the student";
    const baslikKisi = ogrenci || "Student";
    const gs = document.getElementById("p-gunluk-sure").value.trim();
    const kaynak = document.getElementById("p-kaynak").value.trim();
    const ts = document.getElementById("p-toplam-soru").value.trim();
    const gks = document.getElementById("p-gunluk-soru").value.trim();
    const deneme = document.getElementById("p-deneme").value.trim();
    const ek = document.getElementById("p-ek").value.trim();

    let ekMetin = "";
    if (kaynak || ts || gks || deneme || ek) {
      ekMetin = "\n\nAdditional Expectations:\n";
      if (kaynak) ekMetin += `- Resource: ${kaynak}\n`;
      if (ts) ekMetin += `- Total Questions: ${ts}\n`;
      if (gks) ekMetin += `- Daily Questions: ${gks}\n`;
      if (deneme) ekMetin += `- Trial Exams: ${deneme}\n`;
      if (ek) ekMetin += `- Special Requests: ${ek}\n`;
    }

    sonuc = `We are working on "${liste.join(", ")}" for ${kisi}. Create a study schedule of ${sure}.
- Clear, understandable, and encouraging output.
- Consider the cognitive and psychological developmental level of the age group.
- Do not exceed MEB curriculum limits.
${gs ? `- Daily study time should not exceed ${gs}.` : '- Daily study duration should be determined by AI.'}
- Structure as a weekly TABLE with each day/criterion shown separately. Heading should include ${baslikKisi} and ${sure}.${ekMetin}`;
  } else if (materyal === 'maarif') {
    const d = document.getElementById("ders").value;
    const ok = document.getElementById("m-okul").value.trim();
    const t = document.getElementById("m-tarih").value.trim();
    const h = document.getElementById("m-hafta").value.trim();
    const s = document.getElementById("m-sure").value.trim();
    const u = document.getElementById("m-unite").value.trim();
    const k = document.getElementById("m-konular").value.trim();

    if (!d || !ok || !t || !h || !s || !u || !k) {
      [
        document.getElementById("ders"),
        document.getElementById("m-okul"),
        document.getElementById("m-tarih"),
        document.getElementById("m-hafta"),
        document.getElementById("m-sure"),
        document.getElementById("m-unite"),
        document.getElementById("m-konular")
      ].forEach((el, i) => {
        if ([d, ok, t, h, s, u, k][i] !== '') markInvalid(el);
      });
      toast("Ders Adı ve I. Bölüm zorunlu alanlarını doldurun.");
      return;
    }

    const og = document.getElementById("m-ogrenme_ciktilari").value.trim();
    const optF = [
      "alan", "kavramsal", "egilimler", "sosyal", "degerler",
      "okuryazarlik", "disiplinler", "beceriler_arasi", "icerik",
      "olcme", "kabuller", "on_degerlendirme", "kopru",
      "uygulamalar", "zenginlestirme", "destekleme"
    ];

    const v = {
      "{okul}": ok,
      "{ders}": d,
      "{tarih}": t,
      "{hafta}": h,
      "{sure}": s,
      "{unite}": u,
      "{konular}": k,
      "{ogrenme_ciktilari}": og || "(Generate appropriate learning outcome)"
    };

    optF.forEach(f => {
      const inputEl = document.getElementById("m-" + f);
      const val = inputEl ? inputEl.value.trim() : "";
      v["{" + f + "}"] = val || "(contextually fill)";
    });

    sonuc = promptTemplates.maarif;
    for (const key in v) sonuc = sonuc.split(key).join(v[key]);
  } else {
    const d = document.getElementById("ders").value;
    const k = document.getElementById("konu").value;
    const ogEl = document.getElementById("ogretmen");
    const kuEl = document.getElementById("kurum");
    const og = (ogEl && ogEl.value) ? ogEl.value : "Egemen Bilim (Turkish Language and Literature Teacher)";
    const ku = (kuEl && kuEl.value) ? kuEl.value : "[Institution Name]";

    if (!d) { markInvalid(document.getElementById("ders")); toast("Ders seçin."); return; }
    if (!k.trim()) { markInvalid(document.getElementById("konu")); toast("Konu yazın."); return; }

    sonuc = promptTemplates[materyal]
      .replace(/{ders}/g, d)
      .replace(/{konu}/g, k)
      .replace(/{sinif}/g, sinif || "")
      .replace(/{ogretmen}/g, og)
      .replace(/{kurum}/g, ku)
      .replace(/{ortaokul_ek}/g, concreteEN);

    if (materyal === 'nlm' && d === 'İngilizce') {
      sonuc = sonuc.replace('strictly in Turkish', 'appropriately for English language teaching');
      sonuc = sonuc.replace('KPI_1_LANGUAGE: 100% Turkish. ZERO English terminology in the final output (No "Slide", "Title", "Content").', 'KPI_1_LANGUAGE: Optimized for English teaching.');
      sonuc = sonuc.replace('STRICT LANGUAGE: The output must be entirely in Turkish. Replace all system words: "Slide" -> "Sayfa", "Title" -> "Başlık". NEVER use English UI terms.', 'LANGUAGE: Standard English terminology permitted.');
    }
  }

  const finalPrompt = tidy(sonuc) + TURKISH_RULE;
  streamPrompt(finalPrompt);
}

/* ══════════════════════════════════════════════════════
   8. AKSİYONLAR: KOPYALA, İNDİR, AI DERİN BAĞLANTILARI
   ══════════════════════════════════════════════════════ */
export function copyPrompt() {
  const box = document.getElementById('result-box');
  if (!box || box.classList.contains('empty')) {
    toast("Önce bir prompt oluşturun!");
    return Promise.reject("empty");
  }

  return navigator.clipboard.writeText(box.textContent).then(() => {
    const btn = document.getElementById('btn-copy');
    const txt = document.getElementById('copy-text');
    if (btn) btn.classList.add('copied');
    if (txt) txt.textContent = "Kopyalandı! 🎉";
    playSound('copy');
    burstConfetti();
    toast("Prompt panoya kopyalandı.", 'ok');
    setTimeout(() => {
      if (btn) btn.classList.remove('copied');
      if (txt) txt.textContent = "Metni Kopyala";
    }, 2200);
  }).catch(err => {
    toast("Kopyalama başarısız: " + err);
    throw err;
  });
}

export function downloadPrompt() {
  const box = document.getElementById('result-box');
  if (!box || box.classList.contains('empty')) {
    toast("İndirmek için önce bir prompt oluşturun!");
    return;
  }

  playSound('click');
  const materyal = getMateryal() || 'egitim-promptu';
  const now = new Date().toISOString().slice(0, 10);
  const filename = `${materyal}_${now}.md`;

  const blob = new Blob([box.textContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast(`Prompt "${filename}" olarak indirildi.`, 'ok');
}

export function openInAI(platform) {
  const box = document.getElementById('result-box');
  if (!box || box.classList.contains('empty')) {
    toast("Lütfen önce bir prompt oluşturun!");
    return;
  }

  copyPrompt().then(() => {
    const urls = {
      chatgpt: 'https://chatgpt.com',
      claude: 'https://claude.ai',
      notebooklm: 'https://notebooklm.google.com'
    };
    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'noopener,noreferrer');
      toast(`Prompt kopyalandı! ${platform.toUpperCase()} yeni sekmede açıldı.`, 'ok');
    }
  }).catch(() => {});
}

export function toggleMaarifAccordion(btn) {
  playSound('click');
  btn.classList.toggle('is-open');
  const body = document.getElementById('maarif-accordion-body');
  if (body) body.classList.toggle('is-open');
}

/* ══════════════════════════════════════════════════════
   9. HIZLI ÖRNEK SENARYOLAR (Quick Presets)
   ══════════════════════════════════════════════════════ */
export function loadPreset(key) {
  playSound('click');

  if (key === 'maarif_divan') {
    const radio = document.querySelector('input[name="materyal"][value="maarif"]');
    if (radio) {
      radio.checked = true;
      onMateryalChange('maarif');
    }
    const ders = document.getElementById('ders');
    if (ders) ders.value = 'Türk Dili ve Edebiyatı';
    const okul = document.getElementById('m-okul');
    if (okul) okul.value = 'Atatürk Anadolu Lisesi';
    const tarih = document.getElementById('m-tarih');
    if (tarih) tarih.value = '14/10/2026';
    const hafta = document.getElementById('m-hafta');
    if (hafta) hafta.value = '5. Hafta';
    const sure = document.getElementById('m-sure');
    if (sure) sure.value = '80 dk';
    const unite = document.getElementById('m-unite');
    if (unite) unite.value = '2. Ünite: Şiir';
    const konular = document.getElementById('m-konular');
    if (konular) konular.value = '1. Tanzimat Şiiri, 2. Şinasi ve Tercüman-ı Ahval Mukaddimesi, 3. Namık Kemal Hürriyet Kasidesi, 4. Ziya Paşa Terkib-i Bend';
    const cıktı = document.getElementById('m-ogrenme_ciktilari');
    if (cıktı) cıktı.value = 'TDE1.2. Şiir tahlili ve dönemin zihniyetini yorumlama';

    toast('10. Sınıf Edebiyat Maarif şablonu yüklendi!', 'ok');
    generatePrompt();
  } else if (key === 'fen_dna') {
    const radio = document.querySelector('input[name="materyal"][value="not"]');
    if (radio) {
      radio.checked = true;
      onMateryalChange('not');
    }
    const sinif = document.getElementById('sinif');
    if (sinif) sinif.value = '8. Sınıf';
    const ders = document.getElementById('ders');
    if (ders) ders.value = 'Fen Bilgisi';
    const konu = document.getElementById('konu');
    if (konu) konu.value = 'DNA ve Genetik Kod, Nükleotid Dizilimleri, DNA Eşlenmesi, Gen-Kromozom ilişkisi ve Mutasyon/Modifikasyon analizi.';

    toast('8. Sınıf Fen Özeti şablonu yüklendi!', 'ok');
    generatePrompt();
  } else if (key === 'yks_program') {
    const radio = document.querySelector('input[name="materyal"][value="calisma_programi"]');
    if (radio) {
      radio.checked = true;
      onMateryalChange('calisma_programi');
    }
    const sure = document.getElementById('p-sure');
    if (sure) sure.value = '3 Haftalık';
    const ogrenci = document.getElementById('p-ogrenci');
    if (ogrenci) ogrenci.value = 'Kerem';
    const kaynak = document.getElementById('p-kaynak');
    if (kaynak) kaynak.value = '3D Soru Bankası & MEB OGM Materyal';
    const gs = document.getElementById('p-gunluk-sure');
    if (gs) gs.value = '5 Saat';
    const ts = document.getElementById('p-toplam-soru');
    if (ts) ts.value = '1800 Soru';
    const gks = document.getElementById('p-gunluk-soru');
    if (gks) gks.value = '120 Soru';
    const deneme = document.getElementById('p-deneme');
    if (deneme) deneme.value = 'Haftada 2 TYT Denemesi';
    const ek = document.getElementById('p-ek');
    if (ek) ek.value = 'Pazartesi ve Çarşamba ağırlıklı olarak Matematik ve Geometri olsun. Pazar günleri deneme analizi yapılsın.';

    toast('YKS Çalışma Programı şablonu yüklendi!', 'ok');
  } else if (key === 'veli_bulten') {
    const radio = document.querySelector('input[name="materyal"][value="veli_bulteni"]');
    if (radio) {
      radio.checked = true;
      onMateryalChange('veli_bulteni');
    }
    const etk = document.getElementById('v-etkinlikler');
    if (etk) etk.value = 'Bu hafta öğrencilerimizle beraber "Bilim ve Etik" üzerine münazara etkinliği düzenledik ve kitap okuma saati yaptık.';

    toast('Haftalık Veli Bülteni şablonu yüklendi!', 'ok');
  }
}

/* ══════════════════════════════════════════════════════
   10. GLOBAL BINDINGS & INIT
   ══════════════════════════════════════════════════════ */
window.generatePrompt = generatePrompt;
window.copyPrompt = copyPrompt;
window.downloadPrompt = downloadPrompt;
window.openInAI = openInAI;
window.toggleMaarifAccordion = toggleMaarifAccordion;
window.loadPreset = loadPreset;
window.handleVeliDersChange = handleVeliDersChange;
window.toggleSound = toggleSound;
window.skipStream = skipStream;

document.addEventListener("DOMContentLoaded", () => {
  initNeuralCanvas();
  init3DTilt();
  updateSoundUI();

  addCourseRow();
  addVeliCourseRow();

  // Materyal Seçimi Değişimi
  document.querySelectorAll('input[name="materyal"]').forEach(r => {
    r.addEventListener('change', () => onMateryalChange(r.value));
  });

  const btnCourse = document.getElementById('btn-add-course');
  if (btnCourse) btnCourse.addEventListener('click', addCourseRow);

  const btnVeliCourse = document.getElementById('btn-add-veli-course');
  if (btnVeliCourse) btnVeliCourse.addEventListener('click', addVeliCourseRow);

  // Arama & Filtreleme
  const searchInput = document.getElementById('search-materials');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      document.querySelectorAll('.tilt-tile').forEach(tile => {
        const name = (tile.getAttribute('data-name') || '').toLowerCase();
        const text = tile.textContent.toLowerCase();
        if (!q || name.includes(q) || text.includes(q)) {
          tile.style.display = 'flex';
          tile.style.opacity = '1';
        } else {
          tile.style.display = 'none';
        }
      });
    });
  }

  // Kısayol: Ctrl+Enter / Cmd+Enter
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      generatePrompt();
    }
  });

  // Varsayılan ilk şablonu seçili başlat
  const firstRadio = document.querySelector('input[name="materyal"][value="maarif"]');
  if (firstRadio) {
    firstRadio.checked = true;
    onMateryalChange('maarif');
  }
});
