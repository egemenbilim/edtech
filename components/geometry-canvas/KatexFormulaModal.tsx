'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Plus, Eye } from 'lucide-react';
import { FormulaTabGroup } from './types';

interface KatexFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertFormula: (latex: string, options: { color: string; fontSize: number }) => void;
}

const FORMULA_TABS: FormulaTabGroup[] = [
  {
    id: 'basic',
    label: 'Temel',
    items: [
      { latex: '\\sqrt{x}', display: '√x', tooltip: 'Karekök' },
      { latex: '\\sqrt[n]{x}', display: 'ⁿ√x', tooltip: 'n. Dereceden Kök' },
      { latex: '\\frac{a}{b}', display: 'a/b', tooltip: 'Kesir' },
      { latex: 'x^{2}', display: 'x²', tooltip: 'Kare Üs' },
      { latex: 'x_{1}', display: 'x₁', tooltip: 'Alt Simge' },
      { latex: 'x^{n}', display: 'xⁿ', tooltip: 'Genel Üs' },
      { latex: '\\pm', display: '±', tooltip: 'Artı-Eksi' },
      { latex: '\\cdot', display: '·', tooltip: 'Çarpı Nokta' },
      { latex: '\\times', display: '×', tooltip: 'Çarpı Haç' },
      { latex: '\\div', display: '÷', tooltip: 'Bölü' },
      { latex: '2\\sqrt{3}', display: '2√3', tooltip: 'Katsayılı Kök' },
      { latex: 'x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}', display: 'Kök Formülü', tooltip: 'İkinci Dereceden Denklem Kökleri' },
    ],
  },
  {
    id: 'symbols',
    label: 'Semboller & Geometri',
    items: [
      { latex: '\\pi', display: 'π', tooltip: 'Pi Sayısı' },
      { latex: '\\alpha', display: 'α', tooltip: 'Alfa Açısı' },
      { latex: '\\beta', display: 'β', tooltip: 'Beta Açısı' },
      { latex: '\\theta', display: 'θ', tooltip: 'Teta Açısı' },
      { latex: '\\Delta', display: 'Δ', tooltip: 'Delta (Üçgen/Diskriminant)' },
      { latex: '60^\\circ', display: '60°', tooltip: 'Derece' },
      { latex: '\\angle ABC', display: '∠ABC', tooltip: 'Açı İşareti' },
      { latex: '\\triangle ABC', display: '△ABC', tooltip: 'Üçgen İşareti' },
      { latex: '\\perp', display: '⊥', tooltip: 'Diklik' },
      { latex: '\\parallel', display: '∥', tooltip: 'Paralellik' },
      { latex: '\\le', display: '≤', tooltip: 'Küçük Eşit' },
      { latex: '\\ge', display: '≥', tooltip: 'Büyük Eşit' },
      { latex: '\\ne', display: '≠', tooltip: 'Eşit Değil' },
      { latex: '\\approx', display: '≈', tooltip: 'Yaklaşık Eşit' },
      { latex: '\\infty', display: '∞', tooltip: 'Sonsuz' },
    ],
  },
  {
    id: 'placeholders',
    label: 'Vektör & Parantez',
    items: [
      { latex: '\\vec{v}', display: 'v⃗', tooltip: 'Vektör' },
      { latex: '|x|', display: '|x|', tooltip: 'Mutlak Değer' },
      { latex: '\\overline{AB}', display: 'AB̄', tooltip: 'Doğru Parçası' },
      { latex: '\\widehat{ABC}', display: 'ABĈ', tooltip: 'Açı Şapkası' },
      { latex: '\\left( \\frac{a}{b} \\right)', display: '(a/b)', tooltip: 'Dinamik Parantez' },
      { latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', display: '[Matris]', tooltip: '2x2 Matris' },
    ],
  },
  {
    id: 'calculus',
    label: 'Calculus & Analiz',
    items: [
      { latex: '\\int f(x) dx', display: '∫ f(x)dx', tooltip: 'Belirsiz İntegral' },
      { latex: '\\int_{a}^{b} f(x) dx', display: '∫ₐᵇ f(x)dx', tooltip: 'Belirli İntegral' },
      { latex: '\\sum_{i=1}^{n} x_i', display: '∑ xᵢ', tooltip: 'Toplam Sembolü' },
      { latex: '\\lim_{x \\to \\infty}', display: 'lim x→∞', tooltip: 'Limit' },
      { latex: '\\frac{dy}{dx}', display: 'dy/dx', tooltip: 'Türev' },
    ],
  },
];

export const KatexFormulaModal: React.FC<KatexFormulaModalProps> = ({
  isOpen,
  onClose,
  onInsertFormula,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'symbols' | 'placeholders' | 'calculus'>('basic');
  const [latexInput, setLatexInput] = useState<string>('2\\sqrt{3}');
  const [selectedColor, setSelectedColor] = useState<string>('#0f172a');
  const [fontSize, setFontSize] = useState<number>(24);
  const previewRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Canlı KaTeX Önizleme
  useEffect(() => {
    if (!isOpen) return;
    if (previewRef.current && (window as any).katex) {
      try {
        (window as any).katex.render(latexInput || ' ', previewRef.current, {
          displayMode: true,
          throwOnError: false,
        });
      } catch (err) {
        previewRef.current.innerText = latexInput;
      }
    }
  }, [latexInput, isOpen]);

  if (!isOpen) return null;

  const handleAppendLatex = (symbolLatex: string) => {
    setLatexInput((prev) => (prev ? `${prev} ${symbolLatex}` : symbolLatex));
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleConfirm = () => {
    if (!latexInput.trim()) return;
    onInsertFormula(latexInput.trim(), { color: selectedColor, fontSize });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900 dark:text-slate-100 overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Matematiksel Formül ve KaTeX Denklem Editörü</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tuval üzerine serbestçe taşınabilir yüksek kaliteli formül ekleyin.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Sekmeler */}
          <div className="flex items-center gap-1 border-b border-slate-200 pb-2 dark:border-slate-800">
            {FORMULA_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sembol Butonları Izgarası */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {FORMULA_TABS.find((t) => t.id === activeTab)?.items.map((item, idx) => (
              <button
                key={idx}
                type="button"
                title={item.tooltip}
                onClick={() => handleAppendLatex(item.latex)}
                className="flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50/80 px-2 text-xs font-medium text-slate-800 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-slate-800 transition shadow-sm active:scale-95"
              >
                {item.display}
              </button>
            ))}
          </div>

          {/* LaTeX Input Alanı */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              LaTeX Kodu
            </label>
            <input
              ref={inputRef}
              type="text"
              value={latexInput}
              onChange={(e) => setLatexInput(e.target.value)}
              placeholder="Örn: 2\sqrt{3} veya \frac{a}{b}"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-mono text-sm text-slate-800 outline-none ring-offset-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          {/* Canlı KaTeX Önizleme Kutusu */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-blue-500" /> Canlı Önizleme
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Tuvale bu netlikte eklenecektir</span>
            </div>
            <div
              className="flex min-h-[70px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-950/40"
              style={{ color: selectedColor }}
            >
              <div ref={previewRef} className="text-xl" />
            </div>
          </div>

          {/* Renk ve Boyut Ayarları */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-400">Renk:</span>
              {['#0f172a', '#2563eb', '#dc2626', '#16a34a', '#7c3aed', '#ea580c'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-5 w-5 rounded-full border border-black/10 transition hover:scale-110 ${
                    selectedColor === color ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-400">Boyut:</span>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value={18}>18px (Küçük)</option>
                <option value={24}>24px (Standart)</option>
                <option value={32}>32px (Büyük)</option>
                <option value={40}>40px (Ekstra Büyük)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/30">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-700 transition active:scale-95"
          >
            <Plus className="h-4 w-4" /> Tuvale Ekle
          </button>
        </div>
      </div>
    </div>
  );
};
