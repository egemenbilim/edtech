import { questions, S, LETTERS } from '../state.js';
import { $, defaultBaseName, todayStr, parseTags } from '../utils.js';

export function initWordExport(collectFn) {
  const wordBtn = $('wordBtn');
  if (!wordBtn) return;

  wordBtn.onclick = async () => {
    if (typeof collectFn === 'function') collectFn();
    if (!questions.length) return alert('Önce soru yükleyin.');
    const D = window.docx;
    if (!D) { alert('Word kütüphanesi yüklenemedi. İnternet bağlantısını kontrol edin.'); return; }
    
    wordBtn.disabled = true;
    wordBtn.textContent = '⏳ Hazırlanıyor...';
    try {
      const children = [];
      const heading = [S.school, S.lesson, S.title].filter(Boolean).join(' — ') || 'Sınav';
      children.push(new D.Paragraph({ children: [new D.TextRun({ text: heading, bold: true, size: 28 })], spacing: { after: 200 } }));
      if (S.description) {
        children.push(new D.Paragraph({ children: [new D.TextRun({ text: S.description, italics: true, size: 20 })], spacing: { after: 300 } }));
      }
      const stripTex = (s) => String(s || '').replace(/\$([^$]+)\$/g, '$1');
      questions.forEach((q, i) => {
        const n = (i + 1) + '. ';
        if (q.type === 'text') {
          if (q.kind === 'bosluk') {
            children.push(new D.Paragraph({ children: [new D.TextRun({ text: n + stripTex(q.blankText || ''), size: 22 })], spacing: { after: 120 } }));
          } else {
            if (q.text) children.push(new D.Paragraph({ children: [new D.TextRun({ text: n + stripTex(q.text), size: 22 })], spacing: { after: 60 } }));
            if (q.root) children.push(new D.Paragraph({ children: [new D.TextRun({ text: (q.text ? '' : n) + stripTex(q.root), bold: true, size: 22 })], spacing: { after: 80 } }));
            (q.options || []).filter(Boolean).forEach((o, k) => {
              children.push(new D.Paragraph({ children: [new D.TextRun({ text: '   ' + LETTERS[k] + ') ' + stripTex(o), size: 20 })], spacing: { after: 40 } }));
            });
          }
        } else {
          children.push(new D.Paragraph({ children: [new D.TextRun({ text: n + '[Görsel soru]', italics: true, size: 20 })], spacing: { after: 120 } }));
        }
      });
      if (S.showAnswerKey && questions.some((q) => q.answer)) {
        children.push(new D.Paragraph({ children: [new D.TextRun({ text: 'CEVAP ANAHTARI', bold: true, size: 24 })], spacing: { before: 400, after: 120 } }));
        const key = questions.map((q, i) => (i + 1) + ') ' + (q.answer || '-')).join('   ');
        children.push(new D.Paragraph({ children: [new D.TextRun({ text: key, size: 20 })] }));
      }
      const doc = new D.Document({ sections: [{ properties: {}, children }] });
      const blob = await D.Packer.toBlob(doc);
      const tParsed = parseTags(S.title);
      const name = defaultBaseName(tParsed.clean, S) + ' - ' + todayStr() + '.docx';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (e) {
      alert('Word oluşturulurken hata: ' + (e && e.message ? e.message : e));
      console.error(e);
    }
    wordBtn.disabled = false;
    wordBtn.textContent = '📄 Word olarak indir';
  };
}
