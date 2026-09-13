'use client';

import React, { useState } from 'react';
import {
  MousePointer2,
  Slash,
  PenTool,
  Circle,
  Type,
  Plus,
  Minus,
  RotateCcw,
  RotateCw,
  Grid,
  Magnet,
  Check,
  X,
  Sparkles,
  HelpCircle,
  Compass,
} from 'lucide-react';
import { ToolType } from './types';
import { useGeometryCanvas } from './useGeometryCanvas';
import { FloatingStyleToolbar } from './FloatingStyleToolbar';
import { KatexFormulaModal } from './KatexFormulaModal';

interface GeometryCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (dataUrl: string) => void;
  title?: string;
}

export const GeometryCanvasModal: React.FC<GeometryCanvasModalProps> = ({
  isOpen,
  onClose,
  onInsert,
  title = 'Vektörel Geometri & KaTeX Matematik Tuvali',
}) => {
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);

  const {
    canvasRef,
    activeTool,
    setActiveTool,
    style,
    updateStyle,
    setAngleDisplayMode,
    gridEnabled,
    setGridEnabled,
    snapEnabled,
    setSnapEnabled,
    zoomLevel,
    setZoom,
    isToolbarVisible,
    toolbarPosition,
    handleUndo,
    handleRedo,
    handleDuplicate,
    handleDelete,
    finalizeShape,
    addKatexFormula,
    exportCanvas,
  } = useGeometryCanvas();

  if (!isOpen) return null;

  const getGuidanceText = () => {
    switch (activeTool) {
      case 'select':
        return 'Nesneleri seçmek, taşımak, boyutlandırmak ve açı modunu değiştirmek için tıklayın.';
      case 'shape':
        return 'Köşeleri sırayla tıklayarak şekli çizin. Bittiğinde iç açılar (90° diklik kutusu veya yay) otomatik oluşturulur.';
      case 'line':
        return 'Yükseklik, kenarortay veya doğru çizmek için sürükleyin. Köşelere manyetik kenetlenir.';
      case 'circle':
        return 'Merkezden dışa doğru sürükleyerek çember oluşturun.';
      case 'text':
        return 'Köşe harfi (A, B, C) veya açıklama eklemek istediğiniz yere tıklayın.';
      default:
        return 'Vektörel geometri çizim aracını kullanmaya hazırsınız.';
    }
  };

  const handleExportAndInsert = () => {
    const dataUrl = exportCanvas({ format: 'png', multiplier: 2 });
    if (dataUrl) {
      onInsert(dataUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 sm:p-4 backdrop-blur-md select-none animate-in fade-in">
      <div className="flex h-[92vh] w-full max-w-6xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900 dark:text-slate-100 overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {title}
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                  Otomatik Açı Tespiti & KaTeX
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Şekil çizin (iç açılar otomatik oluşur), açı yazılarını gizleyin, yükseklikler çizin ve formül ekleyin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
              title="Kapat (ESC)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Guidance Toast */}
        <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50/70 px-5 py-2 text-xs text-blue-900 dark:border-blue-950 dark:bg-blue-950/40 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-semibold">{getGuidanceText()}</span>
          </div>

          {activeTool === 'shape' && (
            <button
              type="button"
              onClick={finalizeShape}
              className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm animate-pulse"
            >
              <Check className="h-3.5 w-3.5" /> Şekli Tamamla & Açıları Belirt
            </button>
          )}
        </div>

        {/* Ana Gövde */}
        <div className="relative flex flex-1 overflow-hidden bg-slate-100 dark:bg-slate-950">
          
          {/* Sadeleştirilmiş Sol Araç Çubuğu (Toolbox) */}
          <div className="z-10 flex w-20 flex-col items-center gap-2 border-r border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            
            {/* 1. Seçim Aracı */}
            <button
              type="button"
              onClick={() => setActiveTool('select')}
              title="Seç & Düzenle (V)"
              className={`flex h-12 w-full flex-col items-center justify-center rounded-xl transition ${
                activeTool === 'select'
                  ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200 shadow-sm dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <MousePointer2 className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Seç</span>
            </button>

            {/* 2. Şekil Çiz (Otomatik Açılı Çokgen) */}
            <button
              type="button"
              onClick={() => setActiveTool('shape')}
              title="Şekil Çiz (Otomatik Açılı Üçgen, Dörtgen vb.)"
              className={`flex h-12 w-full flex-col items-center justify-center rounded-xl transition ${
                activeTool === 'shape'
                  ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200 shadow-sm dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <PenTool className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[10px] mt-0.5 font-bold">Şekil Çiz</span>
            </button>

            {/* 3. Doğru / Yükseklik */}
            <button
              type="button"
              onClick={() => setActiveTool('line')}
              title="Doğru / Yükseklik Çiz"
              className={`flex h-12 w-full flex-col items-center justify-center rounded-xl transition ${
                activeTool === 'line'
                  ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200 shadow-sm dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Slash className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Doğru</span>
            </button>

            {/* 4. Çember */}
            <button
              type="button"
              onClick={() => setActiveTool('circle')}
              title="Çember / Daire"
              className={`flex h-12 w-full flex-col items-center justify-center rounded-xl transition ${
                activeTool === 'circle'
                  ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200 shadow-sm dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Circle className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Çember</span>
            </button>

            {/* 5. Metin */}
            <button
              type="button"
              onClick={() => setActiveTool('text')}
              title="Köşe Harfi / Metin Ekle (T)"
              className={`flex h-12 w-full flex-col items-center justify-center rounded-xl transition ${
                activeTool === 'text'
                  ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200 shadow-sm dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Type className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Harf / Metin</span>
            </button>

            <div className="w-full my-1 border-t border-slate-200 dark:border-slate-800" />

            {/* 6. KaTeX Formül Butonu */}
            <button
              type="button"
              onClick={() => setIsFormulaModalOpen(true)}
              title="Matematiksel Formül Ekle (LaTeX)"
              className="flex h-12 w-full flex-col items-center justify-center rounded-xl border border-blue-200 bg-blue-50/50 text-blue-600 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 transition shadow-sm"
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-[9px] mt-0.5 font-bold">KaTeX</span>
            </button>
          </div>

          {/* Merkezi Tuval */}
          <div className="relative flex flex-1 items-center justify-center overflow-auto p-4">
            <div className="relative rounded-2xl border border-slate-300 bg-white shadow-xl dark:border-slate-700 overflow-hidden">
              <canvas ref={canvasRef} />

              {/* Kayan Şekil Biçimlendirme Araç Çubuğu (Açı Modu Destekli) */}
              <FloatingStyleToolbar
                visible={isToolbarVisible}
                position={toolbarPosition}
                currentStyle={style}
                onStyleChange={updateStyle}
                onAngleModeChange={setAngleDisplayMode}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>

        {/* Alt Kontrol Çubuğu */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-2.5 dark:border-slate-800 dark:bg-slate-900 shadow-md">
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-800/60">
              <button
                type="button"
                onClick={() => setZoom(zoomLevel - 10)}
                title="Küçült"
                className="rounded-lg p-1 text-slate-600 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-700 transition"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(100)}
                className="px-2 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                %{zoomLevel}
              </button>
              <button
                type="button"
                onClick={() => setZoom(zoomLevel + 10)}
                title="Büyüt"
                className="rounded-lg p-1 text-slate-600 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-700 transition"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setGridEnabled(!gridEnabled)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                gridEnabled
                  ? 'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Izgara</span>
            </button>

            <button
              type="button"
              onClick={() => setSnapEnabled(!snapEnabled)}
              title="Manyetik Kenetlenme"
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                snapEnabled
                  ? 'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400'
              }`}
            >
              <Magnet className="h-3.5 w-3.5" />
              <span>Snap (Köşe/Izgara)</span>
            </button>

            <div className="flex items-center gap-1 ml-1 border-l border-slate-200 pl-2 dark:border-slate-800">
              <button
                type="button"
                onClick={handleUndo}
                title="Geri Al (Ctrl+Z)"
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                title="İleri Al (Ctrl+Y)"
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
              >
                <RotateCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
            >
              İptal
            </button>

            <button
              type="button"
              onClick={handleExportAndInsert}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2 text-xs font-bold text-white shadow-lg hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition active:scale-95"
            >
              <Check className="h-4 w-4" />
              <span>Şekli Soruya Ekle</span>
            </button>
          </div>
        </div>
      </div>

      <KatexFormulaModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        onInsertFormula={addKatexFormula}
      />
    </div>
  );
};
