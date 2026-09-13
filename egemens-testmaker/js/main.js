import { initSidebar, syncUI, collect } from './modules/sidebar.js';
import { render, initQuestionManager, setOnQuestionChangeCallback } from './modules/questionManager.js';
import { initTextModal, setOnSaveCallback, openText, autoParseQuestion } from './modules/textModal.js';
import { initCropTool } from './modules/cropTool.js';
import { initMathModalIntegration } from './modules/equationEditor.js';
import { initWordExport } from './modules/wordExport.js';
import { initMakePdfButton, ensureFont } from './modules/pdfEngine.js';
import { initPreviewStage, schedulePreview, setCollectFn, closePvBig } from './modules/previewStage.js';
import { scheduleAutosave, offerRestore } from './storage.js';
import { initQuestionBank } from './modules/questionBank.js';
import { initGeometryDrawer } from './modules/geometryDrawer.js';
import { initCustomTemplateManager } from './modules/customTemplate.js';
import { initScienceTemplates, closeScienceModal } from './modules/scienceTemplates.js';
import { $, closeModal } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  setCollectFn(collect);

  const onDataChanged = () => {
    schedulePreview();
    scheduleAutosave(collect);
  };

  setOnSaveCallback(() => {
    render();
    onDataChanged();
  });

  setOnQuestionChangeCallback(onDataChanged);

  initSidebar();
  initTextModal();
  initQuestionManager({ syncUIFn: syncUI, collectFn: collect });
  initQuestionBank(() => {
    render();
    onDataChanged();
  });
  initGeometryDrawer();
  initCustomTemplateManager();
  initScienceTemplates();

  initCropTool({
    onQuestionsUpdated: () => {
      render();
      onDataChanged();
    },
    openTextFn: openText,
    autoParseFn: autoParseQuestion
  });
  initMathModalIntegration();
  initWordExport(collect);
  initMakePdfButton(collect);
  initPreviewStage();

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if ($('imgCropModal') && $('imgCropModal').classList.contains('open')) {
      $('imgCropModal').classList.remove('open');
    } else if ($('mathModal') && $('mathModal').classList.contains('flex')) {
      closeModal('mathModal');
    } else if ($('scienceModal') && $('scienceModal').classList.contains('flex')) {
      closeScienceModal();
    } else if ($('textModal') && $('textModal').classList.contains('flex')) {
      closeModal('textModal');
    } else if ($('bankModal') && $('bankModal').classList.contains('flex')) {
      closeModal('bankModal');
    } else if ($('geoModal') && $('geoModal').classList.contains('flex')) {
      closeModal('geoModal');
    } else if ($('customTplModal') && $('customTplModal').classList.contains('flex')) {
      closeModal('customTplModal');
    } else if ($('pvBig') && $('pvBig').classList.contains('open')) {
      closePvBig();
    }
  });

  ensureFont();
  render();
  schedulePreview();
  offerRestore(syncUI, render);
});
