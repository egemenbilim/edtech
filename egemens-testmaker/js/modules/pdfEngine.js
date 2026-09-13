import { questions, S, LETTERS } from '../state.js';
import { $, parseTags, booklet, jpegBytes, defaultBaseName, todayStr } from '../utils.js';
import { drawCustomHeader, getActiveCustomTemplate } from './customTemplate.js';

export const SCALE = 6;
export const FONT = "'Noto Sans', 'DejaVu Sans', Arial, sans-serif";
export const PX = (mm) => mm * SCALE;
export const PT = (pt) => (pt * 25.4 / 72) * SCALE;
export const LH_MM = 5.2;

export const TR_FONT_SAMPLE = 'AaBbCcÇçDdEeFfGgĞğHhIıİiJjKkLlMmNnOoÖöPpRrSsŞşTtUuÜüVvWwXxYyZz0123456789 —–…!?.,:;()[]«»°·•×÷+−=%&$#@_<>*/';

let fontReady = null;
export async function ensureFont() {
  if (fontReady) return fontReady;
  fontReady = (async () => {
    try {
      if (document.fonts && document.fonts.load) {
        await Promise.all([
          document.fonts.load("400 16px 'Noto Sans'", TR_FONT_SAMPLE),
          document.fonts.load("700 16px 'Noto Sans'", TR_FONT_SAMPLE),
          document.fonts.load("italic 400 16px 'Noto Sans'", TR_FONT_SAMPLE),
          document.fonts.load("italic 700 16px 'Noto Sans'", TR_FONT_SAMPLE),
        ]);
        await document.fonts.ready;
      }
    } catch (e) {}
    try { await ensureMebLogo(); } catch (e) {}
  })();
  return fontReady;
}

export function pageSizeMM() {
  const s = { a4: [210, 297], a5: [148, 210], letter: [216, 279] }[S.pageSize] || [210, 297];
  return S.orientation === 'landscape' ? [s[1], s[0]] : s;
}

export function createPage(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(4, Math.round(w * SCALE));
  c.height = Math.max(4, Math.round(h * SCALE));
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, c.width, c.height);
  return { w, h, canvas: c, ctx };
}

export function setFont(ctx, o = {}) {
  const size = o.size || PT(10);
  ctx.font = (o.italic ? 'italic ' : 'normal ') + (o.bold ? '700 ' : '400 ') + size + 'px ' + FONT;
  return size;
}

export const LATEX_SYMS = {
  '\\times':'×', '\\cdot':'·', '\\div':'÷', '\\pm':'±', '\\mp':'∓',
  '\\leq':'≤', '\\le':'≤', '\\geq':'≥', '\\ge':'≥', '\\neq':'≠', '\\ne':'≠',
  '\\approx':'≈', '\\equiv':'≡', '\\sim':'∼', '\\propto':'∝',
  '\\infty':'∞', '\\partial':'∂', '\\nabla':'∇', '\\forall':'∀', '\\exists':'∃',
  '\\in':'∈', '\\notin':'∉', '\\ni':'∋', '\\subset':'⊂', '\\subseteq':'⊆',
  '\\supset':'⊃', '\\supseteq':'⊇', '\\cup':'∪', '\\cap':'∩', '\\setminus':'∖',
  '\\emptyset':'∅', '\\varnothing':'∅', '\\complement':'∁',
  '\\to':'→', '\\rightarrow':'→', '\\leftarrow':'←', '\\leftrightarrow':'↔',
  '\\Rightarrow':'⇒', '\\Leftarrow':'⇐', '\\Leftrightarrow':'⇔',
  '\\circ':'°', '\\degree':'°', '\\perp':'⊥', '\\parallel':'∥', '\\angle':'∠',
  '\\triangle':'△', '\\therefore':'∴', '\\because':'∵',
  '\\alpha':'α', '\\beta':'β', '\\gamma':'γ', '\\delta':'δ', '\\epsilon':'ε',
  '\\varepsilon':'ε', '\\zeta':'ζ', '\\eta':'η', '\\theta':'θ', '\\vartheta':'ϑ',
  '\\iota':'ι', '\\kappa':'κ', '\\lambda':'λ', '\\mu':'μ', '\\nu':'ν', '\\xi':'ξ',
  '\\pi':'π', '\\rho':'ρ', '\\sigma':'σ', '\\tau':'τ', '\\upsilon':'υ',
  '\\phi':'φ', '\\varphi':'φ', '\\chi':'χ', '\\psi':'ψ', '\\omega':'ω',
  '\\Gamma':'Γ', '\\Delta':'Δ', '\\Theta':'Θ', '\\Lambda':'Λ', '\\Xi':'Ξ',
  '\\Pi':'Π', '\\Sigma':'Σ', '\\Phi':'Φ', '\\Psi':'Ψ', '\\Omega':'Ω',
  '\\ldots':'…', '\\dots':'…', '\\cdots':'⋯', '\\vdots':'⋮', '\\ddots':'⋱',
  '\\quad':'  ', '\\qquad':'    ', '\\,':' ', '\\;':' ', '\\:':' ', '\\ ':' ',
  '\\%':'%', '\\_':'_', '\\&':'&', '\\#':'#',
};

export function latexParse(src) {
  let i = 0;
  const n = src.length;
  function peek() { return src[i]; }
  function readCommand() {
    let j = i + 1;
    if (j < n && !/[a-zA-Z]/.test(src[j])) { i = j + 1; return '\\' + src[j - 1]; }
    let cmd = '';
    while (j < n && /[a-zA-Z]/.test(src[j])) { cmd += src[j]; j++; }
    i = j;
    return '\\' + cmd;
  }
  function readGroup() {
    if (peek() === '{') {
      i++;
      const node = readRow('}');
      if (peek() === '}') i++;
      return node;
    }
    if (peek() === '\\') {
      const cmd = readCommand();
      return atomFromCommand(cmd);
    }
    const ch = peek();
    i++;
    return { type: 'text', value: ch || '' };
  }
  function atomFromCommand(cmd) {
    if (LATEX_SYMS[cmd] !== undefined) return { type: 'text', value: LATEX_SYMS[cmd] };
    if (cmd === '\\frac') {
      const num = readGroup();
      const den = readGroup();
      return { type: 'frac', num, den };
    }
    if (cmd === '\\sqrt') {
      let idx = null;
      if (peek() === '[') {
        i++;
        let s = '';
        while (i < n && peek() !== ']') { s += src[i]; i++; }
        if (peek() === ']') i++;
        idx = s;
      }
      const rad = readGroup();
      return { type: 'sqrt', idx, rad };
    }
    if (cmd === '\\left') {
      let delim = '';
      if (peek()) { delim = peek(); i++; }
      const inner = readRow('\\right');
      if (src.slice(i, i + 6) === '\\right') {
        i += 6;
        let rdelim = '';
        if (peek()) { rdelim = peek(); i++; }
        return { type: 'delim', l: delim, r: rdelim, inner };
      }
      return { type: 'delim', l: delim, r: '', inner };
    }
    if (cmd === '\\vec') return { type: 'vec', body: readGroup() };
    if (cmd === '\\overline' || cmd === '\\bar') return { type: 'overline', body: readGroup() };
    if (cmd === '\\hat') return { type: 'hat', body: readGroup() };
    if (cmd === '\\sum' || cmd === '\\int' || cmd === '\\prod' || cmd === '\\oint' || cmd === '\\lim') {
      const glyph = { '\\sum': 'Σ', '\\int': '∫', '\\prod': 'Π', '\\oint': '∮', '\\lim': 'lim' }[cmd];
      return { type: 'bigop', glyph, isLim: cmd === '\\lim' };
    }
    if (cmd === '\\log' || cmd === '\\ln' || cmd === '\\sin' || cmd === '\\cos' || cmd === '\\tan' ||
        cmd === '\\cot' || cmd === '\\sec' || cmd === '\\csc' || cmd === '\\arcsin' || cmd === '\\arccos' ||
        cmd === '\\arctan' || cmd === '\\min' || cmd === '\\max' || cmd === '\\det' || cmd === '\\gcd') {
      return { type: 'func', name: cmd.slice(1) };
    }
    if (cmd === '\\begin') {
      let env = '';
      if (peek() === '{') { i++; while (i < n && peek() !== '}') { env += src[i]; i++; } if (peek() === '}') i++; }
      const rows = [];
      let curRow = [];
      const endTag = '\\end{' + env + '}';
      while (i < n && src.slice(i, i + endTag.length) !== endTag) {
        if (src.slice(i, i + 2) === '\\\\') { rows.push(curRow); curRow = []; i += 2; continue; }
        if (peek() === '&') { curRow.push({ type: 'text', value: '   ' }); i++; continue; }
        curRow.push(readAtom());
      }
      if (curRow.length) rows.push(curRow);
      if (src.slice(i, i + endTag.length) === endTag) i += endTag.length;
      return { type: 'env', env, rows };
    }
    return { type: 'text', value: cmd.replace('\\', '') };
  }
  function readAtom() {
    if (peek() === '^') { i++; const g = readGroup(); return { type: '_sup_pending', g }; }
    if (peek() === '_') { i++; const g = readGroup(); return { type: '_sub_pending', g }; }
    if (peek() === '{') return readGroup();
    if (peek() === '\\') return atomFromCommand(readCommand());
    if (peek() === "'") { i++; return { type: 'text', value: '′' }; }
    const ch = peek();
    i++;
    return { type: 'text', value: ch === undefined ? '' : ch };
  }
  function readRow(stopStr) {
    const atoms = [];
    while (i < n) {
      if (stopStr === '}' && peek() === '}') break;
      if (stopStr === '\\right' && src.slice(i, i + 6) === '\\right') break;
      let atom = readAtom();
      if (atom.type === '_sup_pending') {
        const base = atoms.pop() || { type: 'text', value: '' };
        atoms.push({ type: 'sup', base, sup: atom.g });
      } else if (atom.type === '_sub_pending') {
        const base = atoms.pop() || { type: 'text', value: '' };
        atoms.push({ type: 'sub', base, sub: atom.g });
      } else {
        atoms.push(atom);
      }
    }
    return { type: 'row', atoms };
  }
  try {
    return readRow(null);
  } catch (e) {
    return { type: 'row', atoms: [{ type: 'text', value: src }] };
  }
}

export function measureLatexNode(ctx, node, size) {
  const savedFont = ctx.font;
  const fs = size;
  ctx.font = fs + 'px ' + FONT;
  let res;
  switch (node.type) {
    case 'text': {
      const w = ctx.measureText(node.value).width;
      res = { w, asc: fs * 0.72, desc: fs * 0.22 };
      break;
    }
    case 'row': {
      let w = 0, asc = fs * 0.72, desc = fs * 0.22;
      node.atoms.forEach((a) => {
        const m = measureLatexNode(ctx, a, size);
        w += m.w;
        asc = Math.max(asc, m.asc); desc = Math.max(desc, m.desc);
      });
      res = { w, asc, desc };
      break;
    }
    case 'frac': {
      const subSize = size;
      const mn = measureLatexNode(ctx, node.num, subSize * 0.92);
      const md = measureLatexNode(ctx, node.den, subSize * 0.92);
      const w = Math.max(mn.w, md.w) + fs * 0.28;
      const asc = mn.asc + mn.desc + fs * 0.14;
      const desc = md.asc + md.desc + fs * 0.14;
      res = { w, asc, desc };
      break;
    }
    case 'sqrt': {
      const mi = node.idx ? (() => { ctx.font = (fs * 0.55) + 'px ' + FONT; return ctx.measureText(node.idx).width; })() : 0;
      const mr = measureLatexNode(ctx, node.rad, size * 0.95);
      const w = mi + fs * 0.55 + mr.w + fs * 0.12;
      const asc = mr.asc + fs * 0.22;
      const desc = mr.desc;
      res = { w, asc, desc };
      break;
    }
    case 'sup': {
      const mb = measureLatexNode(ctx, node.base, size);
      const ms = measureLatexNode(ctx, node.sup, size * 0.62);
      const w = mb.w + ms.w + fs * 0.06;
      const asc = mb.asc + ms.asc * 0.85 + fs * 0.06;
      res = { w, asc, desc: mb.desc };
      break;
    }
    case 'sub': {
      const mb = measureLatexNode(ctx, node.base, size);
      const ms = measureLatexNode(ctx, node.sub, size * 0.62);
      const w = mb.w + ms.w + fs * 0.06;
      const desc = mb.desc + ms.asc * 0.7 + fs * 0.06;
      res = { w, asc: mb.asc, desc: Math.max(mb.desc, desc) };
      break;
    }
    case 'delim': {
      const mi = measureLatexNode(ctx, node.inner, size);
      const dw = fs * 0.32;
      res = { w: mi.w + dw * (node.l ? 1 : 0) + dw * (node.r ? 1 : 0), asc: mi.asc, desc: mi.desc };
      break;
    }
    case 'vec': case 'overline': case 'hat': {
      const mb = measureLatexNode(ctx, node.body, size);
      res = { w: mb.w, asc: mb.asc + fs * 0.16, desc: mb.desc };
      break;
    }
    case 'bigop': {
      ctx.font = (fs * 1.35) + 'px ' + FONT;
      const w = ctx.measureText(node.glyph).width + fs * 0.14;
      res = { w, asc: fs * 0.85, desc: fs * 0.35 };
      break;
    }
    case 'func': {
      ctx.font = fs + 'px ' + FONT;
      const w = ctx.measureText(node.name).width + fs * 0.1;
      res = { w, asc: fs * 0.72, desc: fs * 0.22 };
      break;
    }
    case 'env': {
      let maxW = 0, totalH = 0;
      const rowH = size * 1.35;
      node.rows.forEach((r) => {
        let rw = 0;
        r.forEach((a) => { rw += measureLatexNode(ctx, a, size * 0.92).w; });
        maxW = Math.max(maxW, rw);
        totalH += rowH;
      });
      const bracketW = node.env === 'cases' ? fs * 0.45 : fs * 0.5;
      res = { w: maxW + bracketW, asc: totalH / 2 + rowH / 2, desc: totalH / 2 - rowH / 2 + size * 0.2, rowH, isEnv: true };
      break;
    }
    default:
      res = { w: 0, asc: fs * 0.72, desc: fs * 0.22 };
  }
  ctx.font = savedFont;
  return res;
}

export function drawLatexNode(ctx, node, x, y, size, color) {
  const fs = size;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  switch (node.type) {
    case 'text': {
      ctx.font = fs + 'px ' + FONT;
      ctx.fillText(node.value, x, y);
      return x + ctx.measureText(node.value).width;
    }
    case 'row': {
      let cx = x;
      node.atoms.forEach((a) => { cx = drawLatexNode(ctx, a, cx, y, size, color); });
      return cx;
    }
    case 'frac': {
      const subSize = size * 0.92;
      const mn = measureLatexNode(ctx, node.num, subSize);
      const md = measureLatexNode(ctx, node.den, subSize);
      const w = Math.max(mn.w, md.w) + fs * 0.28;
      const cx = x + w / 2;
      const barY = y - fs * 0.32;
      drawLatexNode(ctx, node.num, cx - mn.w / 2, barY - fs * 0.14 - mn.desc, subSize, color);
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, fs * 0.045);
      ctx.beginPath();
      ctx.moveTo(x + fs * 0.06, barY);
      ctx.lineTo(x + w - fs * 0.06, barY);
      ctx.stroke();
      drawLatexNode(ctx, node.den, cx - md.w / 2, barY + fs * 0.14 + md.asc, subSize, color);
      return x + w;
    }
    case 'sqrt': {
      const radSize = size * 0.95;
      const mr = measureLatexNode(ctx, node.rad, radSize);
      const stemW = fs * 0.55;
      const h = mr.asc + mr.desc + fs * 0.22;
      const topY = y - mr.asc - fs * 0.22;
      const botY = y + mr.desc;
      let ix = x;
      if (node.idx) {
        ctx.font = (fs * 0.55) + 'px ' + FONT;
        ctx.fillText(node.idx, ix, topY + fs * 0.3);
        ix += ctx.measureText(node.idx).width + fs * 0.05;
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, fs * 0.045);
      ctx.beginPath();
      ctx.moveTo(ix, y - h * 0.32);
      ctx.lineTo(ix + stemW * 0.28, botY);
      ctx.lineTo(ix + stemW * 0.5, topY);
      ctx.lineTo(ix + stemW + mr.w + fs * 0.1, topY);
      ctx.stroke();
      drawLatexNode(ctx, node.rad, ix + stemW, y, radSize, color);
      return ix + stemW + mr.w + fs * 0.1;
    }
    case 'sup': {
      const mb = measureLatexNode(ctx, node.base, size);
      const supSize = size * 0.62;
      const bx = drawLatexNode(ctx, node.base, x, y, size, color);
      drawLatexNode(ctx, node.sup, bx + fs * 0.03, y - mb.asc * 0.55, supSize, color);
      const ms = measureLatexNode(ctx, node.sup, supSize);
      return bx + ms.w + fs * 0.06;
    }
    case 'sub': {
      const bx = drawLatexNode(ctx, node.base, x, y, size, color);
      const subSize = size * 0.62;
      drawLatexNode(ctx, node.sub, bx + fs * 0.03, y + fs * 0.28, subSize, color);
      const ms = measureLatexNode(ctx, node.sub, subSize);
      return bx + ms.w + fs * 0.06;
    }
    case 'delim': {
      const mi = measureLatexNode(ctx, node.inner, size);
      const dw = fs * 0.32;
      let cx = x;
      ctx.font = (fs * 1.05) + 'px ' + FONT;
      if (node.l) { ctx.fillText(delimGlyph(node.l), cx, y + mi.desc * 0.3); cx += dw; }
      cx = drawLatexNode(ctx, node.inner, cx, y, size, color);
      if (node.r) { ctx.font = (fs * 1.05) + 'px ' + FONT; ctx.fillText(delimGlyph(node.r), cx, y + mi.desc * 0.3); cx += dw; }
      return cx;
    }
    case 'vec': {
      const mb = measureLatexNode(ctx, node.body, size);
      const bx = drawLatexNode(ctx, node.body, x, y, size, color);
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, fs * 0.04);
      const ay = y - mb.asc - fs * 0.1;
      ctx.beginPath(); ctx.moveTo(x, ay); ctx.lineTo(x + mb.w, ay); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + mb.w - fs * 0.08, ay - fs * 0.06); ctx.lineTo(x + mb.w, ay); ctx.lineTo(x + mb.w - fs * 0.08, ay + fs * 0.06); ctx.stroke();
      return bx;
    }
    case 'overline': {
      const mb = measureLatexNode(ctx, node.body, size);
      const bx = drawLatexNode(ctx, node.body, x, y, size, color);
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, fs * 0.04);
      const ay = y - mb.asc - fs * 0.08;
      ctx.beginPath(); ctx.moveTo(x, ay); ctx.lineTo(x + mb.w, ay); ctx.stroke();
      return bx;
    }
    case 'hat': {
      const mb = measureLatexNode(ctx, node.body, size);
      const bx = drawLatexNode(ctx, node.body, x, y, size, color);
      ctx.font = (fs * 0.7) + 'px ' + FONT;
      ctx.fillText('^', x + mb.w / 2 - fs * 0.12, y - mb.asc - fs * 0.02);
      return bx;
    }
    case 'bigop': {
      if (node.isLim) {
        ctx.font = 'italic ' + fs + 'px ' + FONT;
        ctx.fillText('lim', x, y);
        return x + ctx.measureText('lim').width + fs * 0.1;
      }
      ctx.font = (fs * 1.35) + 'px ' + FONT;
      ctx.fillText(node.glyph, x, y + fs * 0.1);
      return x + ctx.measureText(node.glyph).width + fs * 0.14;
    }
    case 'func': {
      ctx.font = 'normal ' + fs + 'px ' + FONT;
      ctx.fillText(node.name, x, y);
      return x + ctx.measureText(node.name).width + fs * 0.1;
    }
    case 'env': {
      const rowH = size * 1.35 * 0.92;
      const totalH = node.rows.length * rowH;
      let topY = y - totalH / 2 + rowH * 0.7;
      const bracketW = fs * (node.env === 'cases' ? 0.45 : 0.5);
      if (node.env === 'cases') {
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(1, fs * 0.045);
        ctx.beginPath();
        ctx.moveTo(x + bracketW * 0.7, y - totalH / 2);
        ctx.quadraticCurveTo(x, y - totalH / 2, x, y - rowH * 0.3);
        ctx.quadraticCurveTo(x, y, x - fs * 0.08, y);
        ctx.quadraticCurveTo(x, y, x, y + rowH * 0.3);
        ctx.quadraticCurveTo(x, y + totalH / 2, x + bracketW * 0.7, y + totalH / 2);
        ctx.stroke();
      }
      let cx = x + bracketW;
      node.rows.forEach((r) => {
        let rx = cx;
        r.forEach((a) => { rx = drawLatexNode(ctx, a, rx, topY, size * 0.92, color); });
        topY += rowH;
      });
      return x + bracketW + (measureLatexNode(ctx, node, size).w - bracketW);
    }
    default:
      return x;
  }
}

export function delimGlyph(d) {
  const map = { '|': '|', '(': '(', ')': ')', '[': '[', ']': ']', '\\{': '{', '\\}': '}', '.': '' };
  return map[d] !== undefined ? map[d] : d;
}

export function tokenizeLatexSegments(text) {
  const raw = String(text || '');
  const parts = raw.split(/(\$[^$]+\$)/g);
  const segs = [];
  parts.forEach((p) => {
    if (!p) return;
    if (/^\$[^$]+\$$/.test(p)) {
      segs.push({ latex: true, src: p.slice(1, -1) });
    } else {
      segs.push({ latex: false, src: p });
    }
  });
  return segs.length ? segs : [{ latex: false, src: '' }];
}

export function wrapRichText(ctx, text, maxW) {
  const paras = String(text || '').split(/\n/);
  const lines = [];
  for (const para of paras) {
    if (!para.trim()) { lines.push([]); continue; }
    const segs = tokenizeLatexSegments(para);
    let cur = [];
    let curW = 0;
    const pushLine = () => { lines.push(cur); cur = []; curW = 0; };
    segs.forEach((seg) => {
      if (seg.latex) {
        const node = latexParse(seg.src);
        const savedFont = ctx.font;
        const m = measureLatexNode(ctx, node, parseFloat(ctx.font) || PT(9.5));
        ctx.font = savedFont;
        if (curW + m.w > maxW && cur.length) pushLine();
        cur.push({ latex: true, node, w: m.w, asc: m.asc, desc: m.desc });
        curW += m.w;
      } else {
        const words = seg.src.split(/(\s+)/);
        words.forEach((w) => {
          if (!w) return;
          const ww = ctx.measureText(w).width;
          if (curW + ww > maxW && curW > 0 && !/^\s+$/.test(w)) pushLine();
          if (!/^\s+$/.test(w) || curW > 0) { cur.push({ latex: false, text: w, w: ww }); curW += ww; }
        });
      }
    });
    pushLine();
  }
  return lines.length ? lines : [[]];
}

export function drawRichLine(ctx, tokens, x, y, fontSize, color, fontSpec) {
  let cx = x;
  tokens.forEach((tok) => {
    if (tok.latex) {
      cx = drawLatexNode(ctx, tok.node, cx, y, fontSize, color);
    } else {
      ctx.font = fontSpec;
      ctx.fillStyle = color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(tok.text, cx, y);
      cx += tok.w;
    }
  });
}

export function wrapText(ctx, text, maxW) {
  const paras = String(text || '').split(/\n/);
  const lines = [];
  for (const para of paras) {
    if (!para.trim()) { lines.push(''); continue; }
    const words = para.split(/\s+/);
    let cur = '';
    for (const w of words) {
      const t = cur ? cur + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; }
      else cur = t;
    }
    if (cur) lines.push(cur);
  }
  return lines.length ? lines : [''];
}

export function drawText(ctx, str, x, y, o = {}) {
  const size = setFont(ctx, o);
  const lh = o.lineH || size * 1.45;
  ctx.fillStyle = o.color || '#111111';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = o.align || 'left';
  const maxW = o.maxW != null ? o.maxW : null;
  const hasLatex = /\$[^$]+\$/.test(String(str || ''));
  if (hasLatex) {
    const fontSpec = ctx.font;
    const lines = wrapRichText(ctx, str, maxW != null ? maxW : 1e6);
    lines.forEach((tokens, i) => {
      let lineW = 0;
      tokens.forEach((t) => (lineW += t.w));
      let lx = x * SCALE;
      if (o.align === 'center') lx = x * SCALE - lineW / 2;
      else if (o.align === 'right') lx = x * SCALE - lineW;
      const prevAlign = ctx.textAlign;
      ctx.textAlign = 'left';
      drawRichLine(ctx, tokens, lx, y * SCALE + i * lh, size, o.color || '#111111', fontSpec);
      ctx.textAlign = prevAlign;
    });
    ctx.font = fontSpec;
    return (lines.length * lh) / SCALE;
  }
  const lines = maxW != null ? wrapText(ctx, str, maxW) : [String(str)];
  lines.forEach((l, i) => { ctx.fillText(l, x * SCALE, y * SCALE + i * lh); });
  return (lines.length * lh) / SCALE;
}

export const imgCache = {};
export function getImg(q) {
  return new Promise((res) => {
    if (imgCache[q.id]) return res(imgCache[q.id]);
    const src = q.imgSrc || q.src;
    if (!src) return res(null);
    const im = new Image();
    im.onload = () => { imgCache[q.id] = im; res(im); };
    im.onerror = () => res(null);
    im.src = src;
  });
}

export const MEB_LOGO_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Milli_E%C4%9Fitim_Bakanl%C4%B1%C4%9F%C4%B1_Logo.svg/500px-Milli_E%C4%9Fitim_Bakanl%C4%B1%C4%9F%C4%B1_Logo.svg.png';
export let mebLogoImg = null, mebLogoReady = null;
export let customLogoSrc = null, customLogoImg = null;

export function setCustomLogo(src, img) {
  customLogoSrc = src;
  customLogoImg = img;
}

export function ensureMebLogo() {
  if (mebLogoReady) return mebLogoReady;
  mebLogoReady = new Promise((resolve) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => { mebLogoImg = im; resolve(); };
    im.onerror = () => { mebLogoImg = null; resolve(); };
    im.src = MEB_LOGO_URL;
  });
  return mebLogoReady;
}

export function mebLogoVisible() {
  const choice = S.logoChoice || 'meb';
  return choice !== 'none' && (choice === 'meb' || (choice === 'custom' && customLogoImg));
}

export function getMebLogoBox(M) {
  const defaultX = M + 2;
  const defaultY = M + 2;
  return {
    show: mebLogoVisible(),
    x: S.logoX != null ? S.logoX : defaultX,
    y: S.logoY != null ? S.logoY : defaultY,
    w: S.logoW || 22,
    h: S.logoH || 22
  };
}

export function activeLogoAspect() {
  const choice = S.logoChoice || 'meb';
  if (choice === 'custom' && customLogoImg && customLogoImg.naturalWidth && customLogoImg.naturalHeight) {
    return customLogoImg.naturalWidth / customLogoImg.naturalHeight;
  }
  return 1;
}

export function fixLogoAspect(refreshFn) {
  const ar = activeLogoAspect();
  let h = S.logoH || 26;
  let w = h * ar;
  const maxW = 60;
  if (w > maxW) { w = maxW; h = w / ar; }
  S.logoW = Math.max(8, w);
  S.logoH = Math.max(8, h);
  if (refreshFn) refreshFn();
}

export function trimLogoImage(src, cb) {
  const im = new Image();
  im.onload = () => {
    const w = im.naturalWidth, h = im.naturalHeight;
    if (!w || !h) return cb(src);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(im, 0, 0);
    let data;
    try { data = ctx.getImageData(0, 0, w, h).data; } catch (e) { return cb(src); }
    const isBlank = (i) => {
      const a = data[i + 3];
      if (a < 12) return true;
      return data[i] > 244 && data[i + 1] > 244 && data[i + 2] > 244;
    };
    let top = 0, bottom = h - 1, left = 0, right = w - 1;
    const rowBlank = (y) => { for (let x = 0; x < w; x++) if (!isBlank((y * w + x) * 4)) return false; return true; };
    const colBlank = (x) => { for (let y = top; y <= bottom; y++) if (!isBlank((y * w + x) * 4)) return false; return true; };
    while (top < bottom && rowBlank(top)) top++;
    while (bottom > top && rowBlank(bottom)) bottom--;
    while (left < right && colBlank(left)) left++;
    while (right > left && colBlank(right)) right--;
    const pad = 1;
    top = Math.max(0, top - pad); left = Math.max(0, left - pad);
    bottom = Math.min(h - 1, bottom + pad); right = Math.min(w - 1, right + pad);
    const nw = right - left + 1, nh = bottom - top + 1;
    if (nw < 4 || nh < 4 || (nw === w && nh === h)) return cb(src);
    const o = document.createElement('canvas');
    o.width = nw; o.height = nh;
    o.getContext('2d').drawImage(c, left, top, nw, nh, 0, 0, nw, nh);
    cb(o.toDataURL('image/png'));
  };
  im.onerror = () => cb(src);
  im.src = src;
}

export function drawMEBLogo(ctx, x, y, w, h) {
  const choice = S.logoChoice || 'meb';
  if (choice === 'none') return;
  if (choice === 'custom' && customLogoImg) {
    ctx.drawImage(customLogoImg, PX(x), PX(y), PX(w), PX(h));
    return;
  }
  if (mebLogoImg) {
    ctx.drawImage(mebLogoImg, PX(x), PX(y), PX(w), PX(h));
    return;
  }
  drawMEBLogoVector(ctx, x + w / 2, y + h / 2, Math.min(w, h) / 2);
}

export function drawMEBLogoVector(ctx, cx, cy, r) {
  const RED = '#d32b2b';
  const X = PX(cx), Y = PX(cy), R = PX(r);
  ctx.save();
  ctx.translate(X, Y);
  ctx.strokeStyle = RED; ctx.fillStyle = RED;
  ctx.lineWidth = Math.max(1, R * 0.035);
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = Math.max(1, R * 0.02);
  ctx.beginPath(); ctx.arc(0, 0, R * 0.93, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = Math.max(0.6, R * 0.026);
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2, rr1 = R * 0.945, rr2 = R * 0.995, sk = 0.05;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * rr1, Math.sin(a) * rr1);
    ctx.lineTo(Math.cos(a + sk) * rr2, Math.sin(a + sk) * rr2);
    ctx.stroke();
  }
  ctx.lineWidth = Math.max(1, R * 0.022);
  ctx.beginPath(); ctx.arc(0, 0, R * 0.7, 0, Math.PI * 2); ctx.stroke();
  const ring = (text, radius, startA, endA, size, flip) => {
    setFont(ctx, { size, bold: true });
    ctx.fillStyle = RED; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const n = text.length; if (!n) return;
    for (let i = 0; i < n; i++) {
      const p = n === 1 ? 0.5 : i / (n - 1);
      const a = startA + (endA - startA) * p;
      ctx.save();
      ctx.translate(Math.cos(a) * radius, Math.sin(a) * radius);
      ctx.rotate(a + (flip ? -Math.PI / 2 : Math.PI / 2));
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  };
  ring('TÜRKİYE CUMHURİYETİ MİLLİ EĞİTİM BAKANLIĞI', R * 0.82, Math.PI * 0.86, Math.PI * 0.14, R * 0.115, true);
  const star = (a, sr) => {
    const px = Math.cos(a) * R * 0.82, py = Math.sin(a) * R * 0.82;
    ctx.save(); ctx.translate(px, py); ctx.beginPath();
    for (let k = 0; k < 5; k++) {
      const oa = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
      const ia = oa + Math.PI / 5;
      ctx.lineTo(Math.cos(oa) * sr, Math.sin(oa) * sr);
      ctx.lineTo(Math.cos(ia) * sr * 0.42, Math.sin(ia) * sr * 0.42);
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
  };
  [0.24, 0.36, 0.5, 0.64, 0.76].forEach((f) => star(Math.PI * f, R * 0.075));
  ctx.lineWidth = Math.max(1, R * 0.03);
  ctx.beginPath();
  ctx.moveTo(-R * 0.42, R * 0.3); ctx.quadraticCurveTo(-R * 0.2, R * 0.18, 0, R * 0.3);
  ctx.quadraticCurveTo(R * 0.2, R * 0.18, R * 0.42, R * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-R * 0.42, R * 0.3); ctx.lineTo(-R * 0.42, R * 0.44);
  ctx.quadraticCurveTo(-R * 0.2, R * 0.32, 0, R * 0.44);
  ctx.quadraticCurveTo(R * 0.2, R * 0.32, R * 0.42, R * 0.44);
  ctx.lineTo(R * 0.42, R * 0.3);
  ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, R * 0.3); ctx.lineTo(0, R * 0.44); ctx.stroke();
  ctx.lineWidth = Math.max(1, R * 0.05);
  ctx.beginPath(); ctx.moveTo(0, R * 0.28); ctx.lineTo(0, -R * 0.05); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -R * 0.05);
  ctx.bezierCurveTo(-R * 0.22, -R * 0.16, -R * 0.14, -R * 0.4, 0, -R * 0.5);
  ctx.bezierCurveTo(R * 0.14, -R * 0.4, R * 0.22, -R * 0.16, 0, -R * 0.05);
  ctx.closePath(); ctx.fill();
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(0, -R * 0.28, R * 0.115, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = RED;
  ctx.beginPath(); ctx.arc(R * 0.035, -R * 0.28, R * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.restore();
}

export function getMEBHeaderItems(ctx, PW, PH, M, t, version) {
  const L = M + 2, R = PW - M - 2;
  const logoBox = getMebLogoBox(M);
  const showLogo = logoBox.show;
  // Başlık metinleri logodan tamamen bağımsız olarak sayfa genişliğinin tam ortasına hizalanır:
  const textCx = (L + R) / 2;
  let y = M + 3.5;
  ctx.save();

  setFont(ctx, { size: PT(12), bold: true });
  const wYear = ctx.measureText(S.mebYear || '').width / SCALE;
  const defYear = { x: textCx - wYear / 2, y: y, w: wYear, h: 4.8 };
  y += 6.5;

  setFont(ctx, { size: PT(12), bold: true });
  const wSchool = ctx.measureText(S.mebSchool || '').width / SCALE;
  const defSchool = { x: textCx - wSchool / 2, y: y, w: wSchool, h: 4.8 };
  y += 6.5;

  const dash = (v) => (v && String(v).trim() ? String(v).trim() : '...............');
  const lessonText = dash(S.mebLesson);
  const gradeText = dash(S.mebGrade) + ' Sınıf';
  const examOnly = S.mebExam && String(S.mebExam).trim() ? String(S.mebExam).trim() : '............... Sınavı';
  const examText = gradeText + ' ' + examOnly;

  setFont(ctx, { size: PT(11), bold: true });
  const gapMM = 2.5;
  const wLesson = ctx.measureText(lessonText).width / SCALE;
  const wExam = ctx.measureText(examText).width / SCALE;
  const totalW = wLesson + gapMM + wExam;
  const rowStartX = textCx - totalW / 2;
  const defLesson = { x: rowStartX, y, w: wLesson, h: 4.8 };
  const defExam = { x: rowStartX + wLesson + gapMM, y, w: wExam, h: 4.8 };

  const dateStr = (S.mebDate || '').trim();
  setFont(ctx, { size: PT(10.5), bold: true });
  const wDate = dateStr ? ctx.measureText(dateStr).width / SCALE : 18;
  const defDate = { x: R - wDate, y, w: wDate, h: 4.4 };

  // Öğrenci kimlik satırı logonun ASLA üstüne gelmeyecek şekilde logonun bitişinin altına yerleştirilir:
  const minStudentY = showLogo ? (logoBox.y + logoBox.h + 3.5) : (M + 22);
  y = Math.max(y + 6.5, minStudentY);

  setFont(ctx, { size: PT(10.5), bold: true });
  const wName = S.mebNameLbl ? ctx.measureText(S.mebNameLbl).width / SCALE : 20;
  const wClass = S.mebClassLbl ? ctx.measureText(S.mebClassLbl).width / SCALE : 12;
  const wNo = S.mebNoLbl ? ctx.measureText(S.mebNoLbl).width / SCALE : 16;
  const wScore = S.mebScoreLbl ? ctx.measureText(S.mebScoreLbl).width / SCALE : 10;
  const defName = { x: L, y, w: wName, h: 4.4 };
  const defClass = { x: L + (PW - 2 * M) * 0.36, y, w: wClass, h: 4.4 };
  const defNo = { x: L + (PW - 2 * M) * 0.55, y, w: wNo, h: 4.4 };
  const defScore = { x: L + (PW - 2 * M) * 0.78, y, w: wScore, h: 4.4 };
  ctx.restore();

  const p = S.mebPos || {};
  const make = (id, text, size, bold, def) => ({ id, text, size, bold, align: 'left', x: p[id]?.x != null ? p[id].x : def.x, y: p[id]?.y != null ? p[id].y : def.y, w: def.w, h: def.h });
  return {
    mebYear: make('mebYear', S.mebYear, 12, true, defYear),
    mebSchool: make('mebSchool', S.mebSchool, 12, true, defSchool),
    mebLesson: make('mebLesson', lessonText, 12, true, defLesson),
    mebExam: make('mebExam', examText, 12, true, defExam),
    mebDate: make('mebDate', dateStr, 10.5, true, defDate),
    mebNameLbl: make('mebNameLbl', S.mebNameLbl || 'Adı-Soyadı:', 10.5, true, defName),
    mebClassLbl: make('mebClassLbl', S.mebClassLbl || 'Sınıfı:', 10.5, true, defClass),
    mebNoLbl: make('mebNoLbl', S.mebNoLbl || 'Okul No.:', 10.5, true, defNo),
    mebScoreLbl: make('mebScoreLbl', S.mebScoreLbl || 'Puan:', 10.5, true, defScore),
  };
}

export function drawMEBHeader(ctx, PW, PH, M, t, version, first) {
  const logoBox = getMebLogoBox(M);
  if (logoBox.show) drawMEBLogo(ctx, logoBox.x, logoBox.y, logoBox.w, logoBox.h);
  const items = getMEBHeaderItems(ctx, PW, PH, M, t, version);

  ['mebYear', 'mebSchool', 'mebLesson', 'mebExam', 'mebDate', 'mebNameLbl', 'mebClassLbl', 'mebNoLbl', 'mebScoreLbl'].forEach((key) => {
    const it = items[key];
    if (!it || !it.text) return;
    drawText(ctx, it.text, it.x, it.y + (it.size >= 12 ? 3.8 : 3.5), { size: PT(it.size), bold: it.bold });
  });

  const labelY = Math.max(items.mebNameLbl.y, items.mebClassLbl.y, items.mebNoLbl.y, items.mebScoreLbl.y);
  let y = labelY + 4.5;
  if (!t.hideVersion && S.groups > 1) {
    drawText(ctx, 'Kitapçık: ' + version, PW - M - 2, y - 6.2, { size: PT(9), bold: true, align: 'right' });
  }
  ctx.strokeStyle = '#111';
  ctx.lineWidth = Math.max(1, 0.4 * SCALE);
  ctx.beginPath();
  ctx.moveTo(PX(M), PX(y));
  ctx.lineTo(PX(PW - M), PX(y));
  ctx.stroke();
  y += 3.5;
  if (!t.noDescription && S.description) {
    y += drawText(ctx, S.description, M + 1, y, {
      size: PT(7.5), italic: true, color: '#475569', maxW: PX(PW - 2 * M - 2),
    }) + 1.5;
  }
  return y + 1;
}

export function drawHeader(ctx, PW, PH, M, t, version, title, first) {
  if (S.watermark && !S.watermarkDivider) {
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#505050';
    setFont(ctx, { size: PT(S.watermarkSize || 44), bold: true });
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate((PW / 2) * SCALE, (PH / 2) * SCALE);
    const wmAngle = t.negativeAngle ? -Math.abs(S.watermarkAngle ?? 45) : (S.watermarkAngle ?? 45);
    ctx.rotate((wmAngle * Math.PI) / 180);
    ctx.fillText(S.watermark, 0, 0);
    ctx.restore();
  }
  if (S.template === 'meb') {
    if (!first) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = Math.max(1, 0.3 * SCALE);
      ctx.beginPath();
      ctx.moveTo(PX(M), PX(M + 5));
      ctx.lineTo(PX(PW - M), PX(M + 5));
      ctx.stroke();
      drawText(ctx, S.mebSchool || S.school || '', M, M + 4, { size: PT(7.5), color: '#475569' });
      const dash2 = (v) => (v && String(v).trim() ? String(v).trim() : '');
      const mid = [dash2(S.mebLesson), dash2(S.mebGrade), dash2(S.mebExam)].filter(Boolean).join(' · ');
      if (mid) drawText(ctx, mid, PW / 2, M + 4, { size: PT(8), bold: true, align: 'center' });
      if (!t.hideVersion && S.groups > 1) drawText(ctx, 'Kitapçık: ' + version, PW - M, M + 4, { size: PT(7.5), align: 'right' });
      return M + 8;
    }
    return drawMEBHeader(ctx, PW, PH, M, t, version, first);
  }
  if (S.template === 'custom') {
    if (!first) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = Math.max(1, 0.3 * SCALE);
      ctx.beginPath();
      ctx.moveTo(PX(M), PX(M + 5));
      ctx.lineTo(PX(PW - M), PX(M + 5));
      ctx.stroke();
      const tpl = getActiveCustomTemplate();
      drawText(ctx, (tpl ? tpl.school : S.school) || '', M, M + 4, { size: PT(7.5), color: '#475569' });
      const mid = (tpl ? tpl.examTitle : S.title) || 'Sınav';
      drawText(ctx, mid, PW / 2, M + 4, { size: PT(8), bold: true, align: 'center' });
      if (!t.hideVersion && S.groups > 1) drawText(ctx, 'Kitapçık: ' + version, PW - M, M + 4, { size: PT(7.5), align: 'right' });
      return M + 8;
    }
    return drawCustomHeader(ctx, PW, PH, M, t, version, first);
  }
  if (S.testType === 'yazili') {
    if (!first) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = Math.max(1, 0.3 * SCALE);
      ctx.beginPath();
      ctx.moveTo(PX(M), PX(M + 5));
      ctx.lineTo(PX(PW - M), PX(M + 5));
      ctx.stroke();
      drawText(ctx, S.school, M, M + 4, { size: PT(7.5), color: '#475569' });
      drawText(ctx, title + ' YAZILI SINAVI', PW / 2, M + 4, { size: PT(8), bold: true, align: 'center' });
      if (!t.hideVersion && S.groups > 1) drawText(ctx, 'Kitapçık: ' + version, PW - M, M + 4, { size: PT(7.5), align: 'right' });
      return M + 8;
    }
    const boxH = 15;
    ctx.strokeStyle = S.themeColor || '#1e293b';
    ctx.lineWidth = Math.max(1.2, 0.5 * SCALE);
    ctx.strokeRect(PX(M), PX(M), PX(PW - 2 * M), PX(boxH));
    ctx.beginPath();
    ctx.moveTo(PX(M), PX(M + 7.5));
    ctx.lineTo(PX(PW - M), PX(M + 7.5));
    ctx.stroke();
    const topText = (S.school ? S.school.toLocaleUpperCase('tr-TR') + ' • ' : '') + (S.lesson ? S.lesson + ' • ' : '') + title + ' YAZILI SINAVI';
    drawText(ctx, topText, PW / 2, M + 5.2, { size: PT(8.5), bold: true, align: 'center', color: '#0f172a' });
    if (!t.hideVersion && S.groups > 1) drawText(ctx, 'Kitapçık: ' + version, PW - M - 2.5, M + 5.2, { size: PT(8.5), bold: true, align: 'right' });
    drawText(ctx, 'Adı Soyadı: .......................................', M + 2.5, M + 12.2, { size: PT(8.2) });
    drawText(ctx, 'Sınıfı / Şubesi: .........', PW / 2 - 12, M + 12.2, { size: PT(8.2) });
    drawText(ctx, 'No: .........', PW / 2 + 28, M + 12.2, { size: PT(8.2) });
    drawText(ctx, 'Puan: .........', PW - M - 2.5, M + 12.2, { size: PT(8.5), bold: true, align: 'right' });
    let y = M + boxH + 2.5;
    if (!t.noDescription && S.description) {
      y += drawText(ctx, S.description, t.centerDescription ? PW / 2 : M + 1, y, {
        size: PT(8), italic: true, color: '#475569', maxW: PX(PW - 2 * M - 2), align: t.centerDescription ? 'center' : 'left',
      }) + 1.5;
    }
    return y;
  }
  if (S.testType === 'yaprak') {
    const headerTop = first ? M : M + 3;
    drawText(ctx, (S.school || 'BİLİM AKADEMİ').toLocaleUpperCase('tr-TR'), M, headerTop + 4, { size: PT(14), bold: true, color: '#2c3e50' });
    drawText(ctx, title.toLocaleUpperCase('tr-TR'), PW - M, headerTop + 4, { size: PT(16), bold: true, align: 'right', color: '#000' });
    if (!t.hideVersion && S.groups > 1) {
      drawText(ctx, version + ' KİTAPÇIĞI', PW - M, headerTop + 10, { size: PT(7), bold: true, align: 'right', color: '#555' });
    }
    ctx.strokeStyle = '#333';
    ctx.lineWidth = Math.max(1.5, 0.5 * SCALE);
    ctx.beginPath();
    ctx.moveTo(PX(M), PX(headerTop + 13));
    ctx.lineTo(PX(PW - M), PX(headerTop + 13));
    ctx.stroke();
    let currentY = headerTop + 18;
    if (first && S.konuKapsami) {
      const topics = S.konuKapsami.split(',').map((s) => s.trim()).filter(Boolean);
      if (topics.length) {
        const topicText = '> ' + topics.join(' > ');
        ctx.fillStyle = '#f1f3f5';
        ctx.fillRect(PX(M), PX(currentY), PX(PW - 2 * M), PX(8));
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = Math.max(1, 0.25 * SCALE);
        ctx.strokeRect(PX(M), PX(currentY), PX(PW - 2 * M), PX(8));
        drawText(ctx, topicText, PW / 2, currentY + 5, { size: PT(9), bold: true, align: 'center', color: '#333' });
        currentY += 12;
      }
    }
    if (first && !t.noDescription && S.description) {
      currentY += drawText(ctx, S.description, M + 1, currentY, { size: PT(8), italic: true, color: '#475569', maxW: PX(PW - 2 * M - 2) }) + 1.5;
    }
    return currentY + 2;
  }
  return M + 8;
}

export function splitBlanks(text) {
  const parts = String(text || '').split(/(\.{3,}|_{2,})/g);
  return parts.map((p) => ({ text: p, isBlank: /^(\.{3,}|_{2,})$/.test(p) }));
}

export function wrapBlankSegments(ctx, text, maxW, blankW) {
  const segs = splitBlanks(text);
  const lines = [];
  let cur = [];
  let curW = 0;
  const pushLine = () => { if (cur.length) lines.push(cur); cur = []; curW = 0; };
  segs.forEach((seg) => {
    if (seg.isBlank) {
      if (curW + blankW > maxW) pushLine();
      cur.push({ blank: true, w: blankW });
      curW += blankW;
      return;
    }
    const words = seg.text.split(/(\s+)/);
    words.forEach((w) => {
      if (!w) return;
      const ww = ctx.measureText(w).width;
      if (curW + ww > maxW && curW > 0) pushLine();
      if (!/^\s+$/.test(w) || curW > 0) { cur.push({ blank: false, text: w, w: ww }); curW += ww; }
    });
  });
  pushLine();
  return lines.length ? lines : [[]];
}

export function wrapAuto(ctx, text, maxW) {
  if (/\$[^$]+\$/.test(String(text || ''))) return wrapRichText(ctx, text, maxW);
  return wrapText(ctx, text, maxW);
}

export function drawAutoLine(ctx, line, x, y, fontSize, color, fontSpec) {
  if (Array.isArray(line)) {
    drawRichLine(ctx, line, x, y, fontSize, color, fontSpec);
    return;
  }
  ctx.font = fontSpec;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(line, x, y);
}

export function prepText(it, ctx) {
  const q = it.q;
  const contentW = it.w * SCALE - PX(7);
  if (q.kind === 'bosluk') {
    setFont(ctx, { size: PT(9.5), bold: false });
    it.blankLines = wrapBlankSegments(ctx, q.blankText || '', contentW, PX(22));
    let h = it.blankLines.length * LH_MM + 2;
    it.imgHeight = 0;
    if (q.imgSrc && imgCache[q.id]) {
      const im = imgCache[q.id];
      it.imgHeight = Math.min((im.height / Math.max(1, im.width)) * (contentW / SCALE), 45);
      h += it.imgHeight + 2;
    }
    if ((q.wordBank || []).length && !q.bankShared) {
      setFont(ctx, { size: PT(8.5) });
      it.bankLines = wrapText(ctx, '( ' + q.wordBank.join('  /  ') + ' )', contentW);
      h += it.bankLines.length * 4.4 + 2.5;
    } else it.bankLines = [];
    it.h = Math.max(h + 1, 8);
    return;
  }
  setFont(ctx, { size: PT(9.5) });
  it.preambleLines = q.text ? wrapAuto(ctx, q.text, contentW) : [];
  setFont(ctx, { size: PT(9.5), bold: true });
  it.rootLines = q.root ? wrapAuto(ctx, q.root, contentW) : [];
  if (!it.rootLines.length && it.preambleLines.length) { it.rootLines = it.preambleLines; it.preambleLines = []; }
  const opts = (q.options || []).filter(Boolean);
  setFont(ctx, { size: PT(9) });
  it.optLines = opts.map((o, k) => ({
    letter: LETTERS[k] + ')',
    lines: wrapAuto(ctx, o, q.layout === 'h' ? (it.w / Math.max(1, opts.length) - 4) * SCALE : contentW - PX(5)),
  }));
  it.imgHeight = 0;
  if (q.imgSrc && imgCache[q.id]) {
    const im = imgCache[q.id];
    it.imgHeight = Math.min((im.height / Math.max(1, im.width)) * (contentW / SCALE), 45);
  }
  let h = 0;
  if (it.imgHeight) h += it.imgHeight + 2;
  if (it.preambleLines.length) h += it.preambleLines.length * LH_MM;
  if (it.preambleLines.length && it.rootLines.length) h += 1.2;
  if (it.rootLines.length) h += it.rootLines.length * LH_MM;
  if ((it.preambleLines.length || it.rootLines.length) && it.optLines.length) h += 1.5;
  if (it.optLines.length) {
    if (q.layout === 'h') h += Math.max(...it.optLines.map((o) => o.lines.length), 1) * 4.4 + 1;
    else it.optLines.forEach((o) => (h += o.lines.length * 4.4 + 0.8));
  }
  if (q.blank) h += q.blank + 2;
  it.h = Math.max(h + 1, 8);
}

export function drawQ(ctx, it, x, y) {
  const q = it.q;
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  setFont(ctx, { size: PT(10), bold: true });
  ctx.fillText(it.num + '.', PX(x + 0.5), PX(y + 4.2));

  if (q.type === 'text' && q.kind === 'bosluk') {
    let ty = y + 4.2;
    const textX = x + 6.5;
    if (q.imgSrc && imgCache[q.id]) {
      const im = imgCache[q.id];
      const imgW = it.w - 6;
      const imgH = it.imgHeight || Math.min((im.height / Math.max(1, im.width)) * imgW, 45);
      ctx.drawImage(im, PX(textX), PX(ty), PX(imgW), PX(imgH));
      ty += imgH + 2;
    }
    setFont(ctx, { size: PT(9.5) });
    ctx.fillStyle = '#1e293b';
    (it.blankLines || []).forEach((line) => {
      let lx = PX(textX);
      line.forEach((seg) => {
        if (seg.blank) {
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = Math.max(1, 0.3 * SCALE);
          ctx.beginPath();
          ctx.moveTo(lx + PX(1), PX(ty + 0.8));
          ctx.lineTo(lx + seg.w - PX(1), PX(ty + 0.8));
          ctx.stroke();
        } else {
          setFont(ctx, { size: PT(9.5) });
          ctx.fillStyle = '#1e293b';
          ctx.fillText(seg.text, lx, PX(ty));
        }
        lx += seg.w;
      });
      ty += LH_MM;
    });
    if ((it.bankLines || []).length) {
      ty += 1.5;
      setFont(ctx, { size: PT(8.5), italic: true });
      ctx.fillStyle = '#92400e';
      it.bankLines.forEach((l) => { ctx.fillText(l, PX(textX), PX(ty)); ty += 4.4; });
    }
    return;
  }

  if (q.type === 'text') {
    let ty = y + 4.2;
    const textX = x + 6.5;
    const imgW = it.w - 6;
    if (q.imgSrc && imgCache[q.id]) {
      const im = imgCache[q.id];
      const imgH = it.imgHeight || Math.min((im.height / Math.max(1, im.width)) * imgW, 45);
      ctx.drawImage(im, PX(textX), PX(ty), PX(imgW), PX(imgH));
      ty += imgH + 2;
    }
    if (it.preambleLines && it.preambleLines.length) {
      const fSize = PT(9.5);
      const fSpec = setFont(ctx, { size: fSize }) && ctx.font;
      it.preambleLines.forEach((l) => { drawAutoLine(ctx, l, PX(textX), PX(ty), fSize, '#1e293b', fSpec); ty += LH_MM; });
      if (it.rootLines && it.rootLines.length) ty += 1.2;
    }
    if (it.rootLines && it.rootLines.length) {
      const fSize = PT(9.5);
      setFont(ctx, { size: fSize, bold: true });
      const fSpec = ctx.font;
      it.rootLines.forEach((l) => { drawAutoLine(ctx, l, PX(textX), PX(ty), fSize, '#0f172a', fSpec); ty += LH_MM; });
      ty += 1.5;
    }
    if (it.optLines && it.optLines.length) {
      if (q.layout === 'h') {
        const cw = it.w / Math.max(1, it.optLines.length);
        let maxL = 1;
        it.optLines.forEach((o, k) => {
          const colX = x + 5.5 + k * cw;
          setFont(ctx, { size: PT(9), bold: true });
          ctx.fillStyle = '#0f172a';
          ctx.textAlign = 'left';
          ctx.fillText(o.letter, PX(colX), PX(ty));
          const fSize = PT(9);
          setFont(ctx, { size: fSize });
          const fSpec = ctx.font;
          o.lines.forEach((l, j) => { drawAutoLine(ctx, l, PX(colX + 5), PX(ty + j * 4.4), fSize, '#334155', fSpec); });
          maxL = Math.max(maxL, o.lines.length);
        });
        ty += maxL * 4.4 + 1;
      } else {
        it.optLines.forEach((o) => {
          setFont(ctx, { size: PT(9), bold: true });
          ctx.fillStyle = '#0f172a';
          ctx.textAlign = 'left';
          ctx.fillText(o.letter, PX(x + 6.5), PX(ty));
          const fSize = PT(9);
          setFont(ctx, { size: fSize });
          const fSpec = ctx.font;
          o.lines.forEach((l, j) => { drawAutoLine(ctx, l, PX(x + 12), PX(ty + j * 4.4), fSize, '#334155', fSpec); });
          ty += o.lines.length * 4.4 + 0.8;
        });
      }
    }
    if (q.blank) {
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = Math.max(1, 0.25 * SCALE);
      for (let ly = ty + 4; ly < ty + q.blank; ly += 6) {
        ctx.beginPath();
        ctx.moveTo(PX(textX), PX(ly));
        ctx.lineTo(PX(x + it.w), PX(ly));
        ctx.stroke();
      }
    }
  } else {
    const im = imgCache[q.id];
    if (im) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(im, PX(x + 6), PX(y), PX(it.w), PX(it.h));
    }
  }
}

export function drawStemBox(ctx, stem, x, y, w) {
  setFont(ctx, { size: PT(8.5), bold: true });
  const lines = wrapAuto(ctx, stem, w * SCALE - PX(4));
  const boxH = lines.length * 4.2 + 2;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(PX(x), PX(y), PX(w), PX(boxH));
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(PX(x), PX(y), PX(1.5), PX(boxH));
  const fSize = PT(8.5);
  setFont(ctx, { size: fSize, bold: true, italic: true });
  const fSpec = ctx.font;
  lines.forEach((l, i) => { drawAutoLine(ctx, l, PX(x + 3), PX(y + 3.8 + i * 4.2), fSize, '#1e293b', fSpec); });
  return boxH + 2;
}

export function finishPage(page, PW, PH, M, pageNo, isFirst, contentTop, subTop, bottom, isWritten) {
  const ctx = page.ctx;
  if (S.columns === 2) {
    const midX = PW / 2;
    const topY = isFirst ? contentTop : subTop;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = Math.max(1, 0.3 * SCALE);
    ctx.beginPath();
    ctx.moveTo(PX(midX), PX(topY));
    ctx.lineTo(PX(midX), PX(bottom));
    ctx.stroke();
    if (S.watermark && S.watermarkDivider) {
      ctx.save();
      ctx.globalAlpha = 0.09;
      ctx.fillStyle = '#64748b';
      setFont(ctx, { size: PT(S.watermarkSize || 12), bold: true });
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.translate(PX(midX), PX((topY + bottom) / 2));
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(S.watermark, 0, 0);
      ctx.restore();
    }
  }
  const t = parseTags(S.title);
  if (!t.noPageNumber) {
    if (S.template !== 'meb' && S.testType === 'yaprak') {
      const footerY = PH - M + 3;
      ctx.strokeStyle = '#333';
      ctx.lineWidth = Math.max(1.5, 0.5 * SCALE);
      ctx.beginPath();
      ctx.moveTo(PX(M), PX(footerY - 4));
      ctx.lineTo(PX(PW - M), PX(footerY - 4));
      ctx.stroke();
      drawText(ctx, (S.school || 'BİLİM AKADEMİ').toLocaleUpperCase('tr-TR'), M, footerY, { size: PT(9), bold: true, color: '#000' });
      drawText(ctx, String(pageNo), PW - M, footerY, { size: PT(9), bold: true, align: 'right', color: '#000' });
    } else {
      drawText(ctx, '— ' + pageNo + ' —', PW / 2, PH - M + 3, { size: PT(8), align: 'center', color: '#64748b' });
      if (isWritten && pageNo === 1) {
        drawText(ctx, 'Başarılar dileriz.', PW - M, PH - M + 3, { size: PT(7.5), italic: true, align: 'right', color: '#64748b' });
      }
    }
  }
}

export function drawOptic(ctx, PW, count, title, version, answers) {
  const isKey = Array.isArray(answers);
  drawText(ctx, isKey ? 'OPTİK CEVAP FORMU — CEVAP ANAHTARI' : 'OPTİK CEVAP FORMU', PW / 2, 18, { size: PT(14), bold: true, align: 'center' });
  drawText(ctx, title, PW / 2, 25, { size: PT(10), align: 'center', color: '#334155' });
  if (isKey) drawText(ctx, 'Kitapçık: ' + version + '  ·  Doğru şıklar işaretlenmiştir', 15, 33, { size: PT(9), color: '#334155' });
  else drawText(ctx, 'Adı Soyadı: .............................   No: ........   Kitapçık: ' + version, 15, 33, { size: PT(9) });
  const perCol = 25;
  const cols = Math.max(1, Math.ceil(count / perCol));
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = Math.max(1, 0.35 * SCALE);
  for (let i = 0; i < count; i++) {
    const c = Math.floor(i / perCol), r = i % perCol;
    const x = 16 + c * ((PW - 32) / cols), y = 44 + r * 8.5;
    drawText(ctx, String(i + 1).padStart(2, '0'), x, y + 1.8, { size: PT(8), bold: true });
    const correct = isKey ? answers[i] : null;
    for (let k = 0; k < 5; k++) {
      const cx = x + 10 + k * 6.5;
      const isCorrect = correct && LETTERS[k] === correct;
      ctx.beginPath();
      ctx.arc(PX(cx), PX(y), PX(2.3), 0, Math.PI * 2);
      if (isCorrect) {
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        drawText(ctx, LETTERS[k], cx, y + 1, { size: PT(6.5), align: 'center', color: '#ffffff', bold: true });
      } else {
        ctx.stroke();
        drawText(ctx, LETTERS[k], cx, y + 1, { size: PT(6.5), align: 'center' });
      }
    }
  }
}

export function smartItemTotalH(it, ctx, colW) {
  let th = it.h;
  if (it.q && it.q.stem && ctx) {
    setFont(ctx, { size: PT(8.5), bold: true });
    th += wrapAuto(ctx, it.q.stem, colW * SCALE - PX(4)).length * 4.2 + 4;
  }
  return th;
}

export function smartOrder(items, colH, gap, ctx, colW) {
  const pool = items.map((it) => ({ it, th: smartItemTotalH(it, ctx, colW) }));
  const out = [];
  let rem = colH;
  let fresh = true;
  while (pool.length) {
    let pickI = -1, bestLeft = Infinity;
    for (let i = 0; i < pool.length; i++) {
      if (pool[i].th <= rem) {
        const left = rem - pool[i].th;
        if (left < bestLeft) { bestLeft = left; pickI = i; }
      }
    }
    if (pickI === -1) {
      if (fresh) {
        pool.sort((a, b) => b.th - a.th);
        pickI = 0;
      } else {
        rem = colH;
        fresh = true;
        continue;
      }
    }
    const pick = pool.splice(pickI, 1)[0];
    out.push(pick.it);
    rem -= pick.th + gap;
    fresh = false;
  }
  return out;
}

export function imgItem(q, w, maxH) {
  const ar0 = q.h / Math.max(1, q.w);
  const custom = (q.scale != null && q.scale !== 1) || q.aspect != null;
  if (!custom) {
    let h = ar0 * w;
    if (h > maxH) h = maxH;
    return { q, w, h };
  }
  let iw = w * (q.scale || 1);
  if (iw > w) iw = w;
  if (iw < 8) iw = 8;
  let ih = (q.aspect != null ? q.aspect : ar0) * iw;
  if (ih > maxH) ih = maxH;
  return { q, w: iw, h: ih };
}

export function buildPDF(pages) {
  const ptPerPx = 72 / (SCALE * 25.4);
  const W = +(pages[0].canvas.width * ptPerPx).toFixed(2);
  const H = +(pages[0].canvas.height * ptPerPx).toFixed(2);
  const enc = (s) => {
    const a = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i) & 0xff;
    return a;
  };
  const parts = [];
  let offset = 0;
  const write = (data) => {
    const bytes = typeof data === 'string' ? enc(data) : data;
    parts.push(bytes);
    offset += bytes.length;
  };
  const offsets = [0];
  write('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  offsets[1] = offset;
  write('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  const pageObjNums = pages.map((_, i) => 3 + i * 3);
  offsets[2] = offset;
  write('2 0 obj\n<< /Type /Pages /Kids [' + pageObjNums.map((n) => n + ' 0 R').join(' ') + '] /Count ' + pages.length + ' >>\nendobj\n');
  pages.forEach((pg, i) => {
    const pageNo = 3 + i * 3, imgNo = pageNo + 1, contentNo = pageNo + 2;
    const content = 'q\n' + W + ' 0 0 ' + H + ' 0 0 cm\n/Im0 Do\nQ\n';
    offsets[pageNo] = offset;
    write(pageNo + ' 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Resources << /XObject << /Im0 ' + imgNo + ' 0 R >> >> /Contents ' + contentNo + ' 0 R >>\nendobj\n');
    offsets[imgNo] = offset;
    write(imgNo + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + pg.canvas.width + ' /Height ' + pg.canvas.height + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + pg.bytes.length + ' >>\nstream\n');
    write(pg.bytes);
    write('\nendstream\nendobj\n');
    offsets[contentNo] = offset;
    write(contentNo + ' 0 obj\n<< /Length ' + content.length + ' >>\nstream\n' + content + 'endstream\nendobj\n');
  });
  const xrefStart = offset;
  const totalObjs = 2 + pages.length * 3;
  let xref = 'xref\n0 ' + (totalObjs + 1) + '\n0000000000 65535 f \n';
  for (let i = 1; i <= totalObjs; i++) xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  xref += 'trailer\n<< /Size ' + (totalObjs + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefStart + '\n%%EOF\n';
  write(xref);
  return new Blob(parts, { type: 'application/pdf' });
}

export async function renderPaperToBlob(idx) {
  await ensureFont();
  const t = parseTags(S.title);
  const [PW, PH] = pageSizeMM();
  const M = S.margin || 10;
  const version = LETTERS[idx];
  const gap = S.spacing ? Math.max(5, S.spacingValue) : 7;
  const ordered = booklet(questions, idx);
  const title = t.noUppercase ? t.clean : t.clean.toLocaleUpperCase('tr-TR');
  const pages = [createPage(PW, PH)];
  let page = pages[0];
  const contentTop = drawHeader(page.ctx, PW, PH, M, t, version, title, true);
  const isMeb = S.template === 'meb';
  const footerH = t.noPageNumber ? 0 : (!isMeb && S.testType === 'yaprak' ? 10 : 5);
  const subTop = !isMeb && S.testType === 'yaprak' ? M + 16 : M + 8;
  const wantsFooterNote = isMeb || S.testType === 'yazili';
  const bottomAdj = PH - M - footerH;
  const usableH = bottomAdj - contentTop;
  const maxH = Math.max(20, usableH * 0.88);
  const numCols = S.columns || 2;
  const colGap = 8;
  const colW = (PW - 2 * M - colGap * (numCols - 1)) / numCols;
  await Promise.all(ordered.filter((q) => q.type !== 'text' || q.imgSrc).map(getImg));
  const sharedBank = [];
  ordered.forEach((q) => { if (q.kind === 'bosluk' && q.bankShared) (q.wordBank || []).forEach((w) => { if (!sharedBank.includes(w)) sharedBank.push(w); }); });
  let sharedBankDrawn = false;
  const yStart = contentTop;
  let items = ordered.map((q) => {
    const w = colW - 6;
    if (q.type === 'text') { const it = { q, w, h: maxH }; prepText(it, page.ctx); it.h = Math.min(it.h, maxH); return it; }
    return imgItem(q, w, maxH);
  });
  if (S.smartLayout && numCols > 1) items = smartOrder(items, bottomAdj - yStart, gap, page.ctx, colW).map((it, i) => ({ ...it, num: i + 1 }));
  let c = 0, y = yStart, firstPage = true, pageIndex = 1, placedThisPage = 0;
  for (let n = 0; n < items.length; n++) {
    const it = items[n]; if (it.num === undefined) it.num = n + 1;
    let stemH = 0;
    if (it.q.stem) { setFont(page.ctx, { size: PT(8.5), bold: true }); stemH = wrapAuto(page.ctx, it.q.stem, colW * SCALE - PX(4)).length * 4.2 + 4; }
    if (y + stemH + it.h > bottomAdj && placedThisPage > 0) {
      c++;
      if (c >= numCols) {
        finishPage(page, PW, PH, M, pageIndex, firstPage, yStart, subTop, bottomAdj, wantsFooterNote);
        pageIndex++; page = createPage(PW, PH); pages.push(page); firstPage = false;
        drawHeader(page.ctx, PW, PH, M, t, version, title, false); c = 0; placedThisPage = 0;
      }
      y = firstPage ? yStart : subTop;
    }
    const x = M + c * (colW + colGap);
    if (!sharedBankDrawn && sharedBank.length && it.q.kind === 'bosluk') {
      setFont(page.ctx, { size: PT(8.5) });
      const bankLines = wrapText(page.ctx, sharedBank.join('   •   '), (colW - 6) * SCALE);
      const bankBoxH = bankLines.length * 4.6 + 8;
      if (y + bankBoxH + it.h > bottomAdj && placedThisPage > 0) {
        c++;
        if (c >= numCols) {
          finishPage(page, PW, PH, M, pageIndex, firstPage, yStart, subTop, bottomAdj, wantsFooterNote);
          pageIndex++; page = createPage(PW, PH); pages.push(page); firstPage = false;
          drawHeader(page.ctx, PW, PH, M, t, version, title, false); c = 0; placedThisPage = 0;
        }
        y = firstPage ? yStart : subTop;
      }
      const bx = M + c * (colW + colGap);
      page.ctx.fillStyle = '#fffbeb'; page.ctx.fillRect(PX(bx), PX(y), PX(colW), PX(bankBoxH));
      page.ctx.strokeStyle = '#f59e0b'; page.ctx.lineWidth = Math.max(1, 0.35 * SCALE);
      page.ctx.strokeRect(PX(bx), PX(y), PX(colW), PX(bankBoxH));
      drawText(page.ctx, 'KELİME HAVUZU', bx + 3, y + 4.5, { size: PT(8), bold: true, color: '#92400e' });
      bankLines.forEach((l, i) => { drawText(page.ctx, l, bx + 3, y + 9.5 + i * 4.6, { size: PT(8.5), color: '#78350f' }); });
      y += bankBoxH + 3; sharedBankDrawn = true;
    }
    if (it.q.stem) y += drawStemBox(page.ctx, it.q.stem, x, y, colW);
    drawQ(page.ctx, it, x, y);
    y += it.h + gap;
    placedThisPage++;
  }
  finishPage(page, PW, PH, M, pageIndex, firstPage, yStart, subTop, bottomAdj, wantsFooterNote);
  if (S.optic) { const op = createPage(PW, PH); drawOptic(op.ctx, PW, items.length, title, version); pages.push(op); }
  pages.forEach((p) => { p.bytes = jpegBytes(p.canvas.toDataURL('image/jpeg', 0.93)); });
  return { blob: buildPDF(pages), order: items.map((i) => i.q.id) };
}

export async function renderAnswerKeyBlob(orders) {
  await ensureFont();
  const t = parseTags(S.title);
  const [PW, PH] = pageSizeMM();
  const pages = [createPage(PW, PH)];
  let page = pages[0]; let y = 40;
  drawText(page.ctx, 'CEVAP ANAHTARI', PW / 2, 22, { size: PT(16), bold: true, align: 'center' });
  drawText(page.ctx, t.clean, PW / 2, 30, { size: PT(12), align: 'center' });
  orders.forEach((order, bi) => {
    if (y > 250) { page = createPage(PW, PH); pages.push(page); y = 22; }
    y += drawText(page.ctx, LETTERS[bi] + ' Kitapçığı', 15, y, { size: PT(11), bold: true }) + 6;
    const rowH = 7.5, perRow = 5;
    order.forEach((id, i) => {
      const q = questions.find((x) => x.id === id);
      const col = i % perRow, row = Math.floor(i / perRow), cellW = (PW - 30) / perRow;
      drawText(page.ctx, (i + 1) + ') ' + (q && q.answer ? String(q.answer) : '-'), 15 + col * cellW, y + row * rowH, { size: PT(9), maxW: PX(cellW - 3) });
    });
    y += Math.ceil(order.length / perRow) * rowH + 6;
    if (bi > 0) {
      const map = order.map((id, i) => (i + 1) + '\u2190A' + (questions.findIndex((q) => q.id === id) + 1)).join('   ');
      y += drawText(page.ctx, 'A kitapçığı eşleşmesi: ' + map, 15, y, { size: PT(8), maxW: PX(PW - 30) }) + 6;
    }
    if (S.optic) {
      const opticPage = createPage(PW, PH); pages.push(opticPage);
      const answers = order.map((id) => { const q = questions.find((x) => x.id === id); return q && q.answer && /^[A-E]$/i.test(q.answer) ? q.answer.toUpperCase() : null; });
      drawOptic(opticPage.ctx, PW, order.length, t.clean, LETTERS[bi], answers);
    }
  });
  pages.forEach((p) => { p.bytes = jpegBytes(p.canvas.toDataURL('image/jpeg', 0.92)); });
  return buildPDF(pages);
}

export function showResult(files) {
  const list = $('resultList');
  list.innerHTML = '';
  files.forEach((f) => {
    const url = URL.createObjectURL(f.blob);
    const row = document.createElement('div');
    row.className = 'flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 dark:border-slate-700';
    row.innerHTML = '<span class="flex-1 truncate text-[13px] font-medium text-slate-700 dark:text-slate-300">' + f.name + '</span>' +
      '<a href="' + url + '" download="' + f.name + '" class="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700">İndir</a>' +
      '<button class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-900 dark:border-slate-700 dark:text-slate-300">Önizle</button>';
    row.querySelector('button').onclick = () => window.open(url, '_blank');
    list.appendChild(row);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
  $('resultModal').classList.replace('hidden', 'flex');
}

export async function buildPreviewPages() {
  await ensureFont();
  const t = parseTags(S.title);
  const [PW, PH] = pageSizeMM();
  const M = S.margin || 10;
  const version = LETTERS[0];
  const gap = S.spacing ? Math.max(5, S.spacingValue) : 7;
  const ordered = booklet(questions, 0);
  const title = t.noUppercase ? t.clean : t.clean.toLocaleUpperCase('tr-TR');
  const pages = [createPage(PW, PH)];
  pages[0].items = [];

  if (S.template === 'meb') {
    const lb = getMebLogoBox(M);
    if (lb.show) pages[0].logoBox = lb;
    const tempCanvas = createPage(PW, PH).canvas;
    const tempCtx = tempCanvas.getContext('2d');
    pages[0].mebHeaderItems = getMEBHeaderItems(tempCtx, PW, PH, M, t, version);
  }

  let page = pages[0];
  const contentTop = drawHeader(page.ctx, PW, PH, M, t, version, title, true);
  const isMeb = S.template === 'meb';
  const footerH = t.noPageNumber ? 0 : (!isMeb && S.testType === 'yaprak' ? 10 : 5);
  const subTop = !isMeb && S.testType === 'yaprak' ? M + 16 : M + 8;
  const wantsFooterNote = isMeb || S.testType === 'yazili';
  const bottomAdj = PH - M - footerH;
  const usableH = bottomAdj - contentTop;
  const maxH = Math.max(20, usableH * 0.88);
  const numCols = S.columns || 2;
  const colGap = 8;
  const colW = (PW - 2 * M - colGap * (numCols - 1)) / numCols;
  await Promise.all(ordered.filter((q) => q.type !== 'text' || q.imgSrc).map(getImg));
  const sharedBank = [];
  ordered.forEach((q) => { if (q.kind === 'bosluk' && q.bankShared) (q.wordBank || []).forEach((w) => { if (!sharedBank.includes(w)) sharedBank.push(w); }); });
  let sharedBankDrawn = false;
  const yStart = contentTop;
  let items = ordered.map((q) => {
    const w = colW - 6;
    if (q.type === 'text') { const it = { q, w, h: maxH }; prepText(it, page.ctx); it.h = Math.min(it.h, maxH); return it; }
    return imgItem(q, w, maxH);
  });
  if (S.smartLayout && numCols > 1) items = smartOrder(items, bottomAdj - yStart, gap, page.ctx, colW).map((it, i) => ({ ...it, num: i + 1 }));
  let c = 0, y = yStart, firstPage = true, pageIndex = 1, placedThisPage = 0;
  for (let n = 0; n < items.length; n++) {
    const it = items[n]; if (it.num === undefined) it.num = n + 1;
    let stemH = 0;
    if (it.q.stem) { setFont(page.ctx, { size: PT(8.5), bold: true }); stemH = wrapAuto(page.ctx, it.q.stem, colW * SCALE - PX(4)).length * 4.2 + 4; }
    if (y + stemH + it.h > bottomAdj && placedThisPage > 0) {
      c++;
      if (c >= numCols) {
        finishPage(page, PW, PH, M, pageIndex, firstPage, yStart, subTop, bottomAdj, wantsFooterNote);
        pageIndex++; page = createPage(PW, PH); pages.push(page); firstPage = false;
        drawHeader(page.ctx, PW, PH, M, t, version, title, false); c = 0; placedThisPage = 0;
      }
      y = firstPage ? yStart : subTop;
    }
    const x = M + c * (colW + colGap);
    if (!sharedBankDrawn && sharedBank.length && it.q.kind === 'bosluk') {
      setFont(page.ctx, { size: PT(8.5) });
      const bankLines = wrapText(page.ctx, sharedBank.join('   •   '), (colW - 6) * SCALE);
      const bankBoxH = bankLines.length * 4.6 + 8;
      if (y + bankBoxH + it.h > bottomAdj && placedThisPage > 0) {
        c++;
        if (c >= numCols) {
          finishPage(page, PW, PH, M, pageIndex, firstPage, yStart, subTop, bottomAdj, wantsFooterNote);
          pageIndex++; page = createPage(PW, PH); pages.push(page); firstPage = false;
          drawHeader(page.ctx, PW, PH, M, t, version, title, false); c = 0; placedThisPage = 0;
        }
        y = firstPage ? yStart : subTop;
      }
      const bx = M + c * (colW + colGap);
      page.ctx.fillStyle = '#fffbeb'; page.ctx.fillRect(PX(bx), PX(y), PX(colW), PX(bankBoxH));
      page.ctx.strokeStyle = '#f59e0b'; page.ctx.lineWidth = Math.max(1, 0.35 * SCALE);
      page.ctx.strokeRect(PX(bx), PX(y), PX(colW), PX(bankBoxH));
      drawText(page.ctx, 'KELİME HAVUZU', bx + 3, y + 4.5, { size: PT(8), bold: true, color: '#92400e' });
      bankLines.forEach((l, i) => { drawText(page.ctx, l, bx + 3, y + 9.5 + i * 4.6, { size: PT(8.5), color: '#78350f' }); });
      y += bankBoxH + 3; sharedBankDrawn = true;
    }
    if (it.q.stem) y += drawStemBox(page.ctx, it.q.stem, x, y, colW);
    drawQ(page.ctx, it, x, y);
    if (!page.items) page.items = [];
    page.items.push({ q: it.q, x, y, w: it.w, h: it.h, num: it.num, p: pageIndex });
    y += it.h + gap;
    placedThisPage++;
  }
  finishPage(page, PW, PH, M, pageIndex, firstPage, yStart, subTop, bottomAdj, wantsFooterNote);
  if (S.optic) { const op = createPage(PW, PH); drawOptic(op.ctx, PW, items.length, title, version); pages.push(op); }
  return pages;
}

export function initMakePdfButton(collectFn) {
  const MAKE_BTN_DEFAULT_HTML = '<span class="pvMakeSpark">✨</span> Sınav Kağıdını Oluştur';
  const makeBtn = $('makeBtn');
  if (!makeBtn) return;

  makeBtn.onclick = async () => {
    if (typeof collectFn === 'function') collectFn();
    if (!questions.length) return alert('Önce soru yükleyin.');
    makeBtn.disabled = true;
    makeBtn.innerHTML = '⏳ Hazırlanıyor...';
    try {
      await ensureFont();
      const count = S.groups;
      const files = [];
      const orders = [];
      const tParsed = parseTags(S.title);
      const baseName = defaultBaseName(tParsed.clean, S);
      const dateStr = todayStr();
      for (let i = 0; i < count; i++) {
        const r = await renderPaperToBlob(i);
        orders.push(r.order);
        const suffix = count > 1 ? ' (' + LETTERS[i] + ' Kitapçığı)' : '';
        files.push({ name: baseName + ' - ' + dateStr + suffix + '.pdf', blob: r.blob });
      }
      if (S.showAnswerKey && questions.some((q) => q.answer)) {
        files.push({ name: baseName + ' - ' + dateStr + ' - Cevap Anahtarı.pdf', blob: await renderAnswerKeyBlob(orders) });
      }
      showResult(files);
    } catch (e) {
      alert('PDF oluşturulurken hata oluştu: ' + (e && e.message ? e.message : e));
      console.error(e);
    }
    makeBtn.disabled = false;
    makeBtn.innerHTML = MAKE_BTN_DEFAULT_HTML;
  };

  $('resultClose').onclick = () => $('resultModal').classList.replace('flex', 'hidden');
}

export function calculateQuestionBounds() {
  const [PW, PH] = pageSizeMM();
  const M = S.margin || 10;
  const t = parseTags(S.title || '');
  const title = t.noUppercase ? t.clean : t.clean.toLocaleUpperCase('tr-TR');
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = PX(PW);
  tempCanvas.height = PX(PH);
  const tempCtx = tempCanvas.getContext('2d');
  const contentTop = drawHeader(tempCtx, PW, PH, M, t, LETTERS[0], title, true);
  const isMeb = S.template === 'meb';
  const footerH = t.noPageNumber ? 0 : (!isMeb && S.testType === 'yaprak' ? 10 : 5);
  const bottomAdj = PH - M - footerH;
  const usableH = Math.max(20, bottomAdj - contentTop);
  const numCols = S.columns || 2;
  const colGap = 8;
  const colW = (PW - 2 * M - colGap * (numCols - 1)) / numCols;
  return {
    PW, PH, M, contentTop, bottomAdj, usableH, numCols, colGap, colW,
    left: M,
    right: PW - M,
    width: PW - 2 * M
  };
}
