'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ToolType,
  ShapeStyle,
  Point2D,
  AngleDisplayMode,
  CornerAngleData,
  GeometryExportOptions,
} from './types';
import {
  calculatePolygonInternalAngles,
  findNearestVertex,
  generateArcPath,
  generateRegularPolygonPoints,
  snapToGrid,
  katexToImage,
} from './geometryMath';

export function useGeometryCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<any>(null);

  // Durum Yönetimi (Sadeleştirilmiş Araçlar)
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [style, setStyle] = useState<ShapeStyle>({
    strokeColor: '#0f172a',
    fillColor: 'transparent',
    strokeWidth: 2,
    isDashed: false,
    fontSize: 18,
    angleDisplayMode: 'all',
  });

  const [gridEnabled, setGridEnabled] = useState<boolean>(true);
  const [snapEnabled, setSnapEnabled] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Kayan Araç Çubuğu
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [toolbarPosition, setToolbarPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isToolbarVisible, setIsToolbarVisible] = useState<boolean>(false);

  // Tarihçe
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isHistoryUpdatingRef = useRef<boolean>(false);

  // Çizim Durumları
  const drawingLineRef = useRef<any>(null);
  const isDrawingLineRef = useRef<boolean>(false);

  // Şekil Çiz (Shape / Polygon)
  const shapePointsRef = useRef<Point2D[]>([]);
  const shapeTempLineRef = useRef<any>(null);
  const shapeMarkersRef = useRef<any[]>([]);

  // Tuvaldeki Tüm Tepe Noktalarını Toplama (Vertex Snapping için)
  const getAllVertices = useCallback((): Point2D[] => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return [];
    const vertices: Point2D[] = [];

    canvas.forEachObject((obj: any) => {
      if (obj.type === 'polygon' && Array.isArray(obj.points)) {
        const matrix = obj.calcTransformMatrix();
        const fabric = (window as any).fabric;
        obj.points.forEach((pt: Point2D) => {
          if (fabric) {
            const transformed = fabric.util.transformPoint(
              new fabric.Point(pt.x - obj.pathOffset.x, pt.y - obj.pathOffset.y),
              matrix
            );
            vertices.push({ x: transformed.x, y: transformed.y });
          }
        });
      } else if (obj.type === 'line') {
        vertices.push({ x: obj.x1, y: obj.y1 });
        vertices.push({ x: obj.x2, y: obj.y2 });
      } else if (obj.type === 'circle') {
        vertices.push({ x: obj.left, y: obj.top });
      }
    });

    return vertices;
  }, []);

  const saveState = useCallback(() => {
    if (!fabricCanvasRef.current || isHistoryUpdatingRef.current) return;
    const json = JSON.stringify(fabricCanvasRef.current.toJSON());
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(json);
    historyIndexRef.current++;
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0 && fabricCanvasRef.current) {
      isHistoryUpdatingRef.current = true;
      historyIndexRef.current--;
      const json = historyRef.current[historyIndexRef.current];
      fabricCanvasRef.current.loadFromJSON(json, () => {
        fabricCanvasRef.current.renderAll();
        isHistoryUpdatingRef.current = false;
      });
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1 && fabricCanvasRef.current) {
      isHistoryUpdatingRef.current = true;
      historyIndexRef.current++;
      const json = historyRef.current[historyIndexRef.current];
      fabricCanvasRef.current.loadFromJSON(json, () => {
        fabricCanvasRef.current.renderAll();
        isHistoryUpdatingRef.current = false;
      });
    }
  }, []);

  const updateGridBackground = useCallback((canvas: any, showGrid: boolean) => {
    if (!canvas) return;
    if (!showGrid) {
      canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
      return;
    }

    const gridSize = 20;
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = gridSize;
    patternCanvas.height = gridSize;
    const pctx = patternCanvas.getContext('2d');
    if (pctx) {
      pctx.strokeStyle = '#e2e8f0';
      pctx.lineWidth = 0.8;
      pctx.beginPath();
      pctx.moveTo(gridSize, 0);
      pctx.lineTo(gridSize, gridSize);
      pctx.lineTo(0, gridSize);
      pctx.stroke();
    }

    const fabric = (window as any).fabric;
    if (fabric) {
      const pattern = new fabric.Pattern({
        source: patternCanvas,
        repeat: 'repeat',
      });
      canvas.setBackgroundColor(pattern, canvas.renderAll.bind(canvas));
    }
  }, []);

  // Şekli ve Otomatik Açılarını Oluşturup Tamamlama
  const finalizeShape = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const fabric = (window as any).fabric;
    if (!canvas || !fabric || shapePointsRef.current.length < 3) {
      cleanupShapeDrawing();
      return;
    }

    const pts = [...shapePointsRef.current];
    cleanupShapeDrawing();

    // 1. Ana Poligon Şekli
    const polygon = new fabric.Polygon(pts, {
      fill: style.fillColor,
      stroke: style.strokeColor,
      strokeWidth: style.strokeWidth,
      strokeDashArray: style.isDashed ? [6, 6] : null,
      selectable: true,
      cornerColor: '#2563eb',
      cornerSize: 8,
      transparentCorners: false,
    });

    // 2. Otomatik Açıları Hesapla
    const angleDataList: CornerAngleData[] = calculatePolygonInternalAngles(pts, 26);
    const angleObjects: any[] = [];

    angleDataList.forEach((ang) => {
      if (ang.isRightAngle && ang.rightAngleBoxPoints && ang.dotPosition) {
        // Diklik Karesi
        const box = new fabric.Polyline(ang.rightAngleBoxPoints, {
          fill: 'transparent',
          stroke: style.strokeColor,
          strokeWidth: 1.5,
          selectable: false,
          isAngleComponent: true,
        });

        // Diklik Noktası
        const dot = new fabric.Circle({
          left: ang.dotPosition.x,
          top: ang.dotPosition.y,
          radius: 2,
          fill: style.strokeColor,
          originX: 'center',
          originY: 'center',
          selectable: false,
          isAngleComponent: true,
        });

        angleObjects.push(box, dot);
      } else if (ang.arcPathString) {
        // Açı Yayı
        const arc = new fabric.Path(ang.arcPathString, {
          stroke: style.strokeColor,
          strokeWidth: 1.5,
          fill: 'transparent',
          selectable: false,
          isAngleComponent: true,
          isAngleArc: true,
        });

        // Derece Metni
        const text = new fabric.IText(`${ang.angleDegrees}°`, {
          left: ang.labelPosition.x,
          top: ang.labelPosition.y,
          fontSize: 14,
          fontFamily: 'Noto Sans, sans-serif',
          fontWeight: 'bold',
          fill: style.strokeColor,
          originX: 'center',
          originY: 'center',
          selectable: false,
          isAngleComponent: true,
          isAngleLabel: true,
        });

        angleObjects.push(arc, text);
      }
    });

    // Ana şekil ve açıları bir grup olarak birleştir
    const shapeGroup = new fabric.Group([polygon, ...angleObjects], {
      selectable: true,
      cornerColor: '#2563eb',
      cornerSize: 8,
      transparentCorners: false,
      angleDisplayMode: 'all',
      hasAutoAngles: true,
    });

    canvas.add(shapeGroup);
    canvas.setActiveObject(shapeGroup);
    canvas.renderAll();
    saveState();
    setActiveTool('select');
  }, [style, saveState]);

  const cleanupShapeDrawing = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if (shapeTempLineRef.current) {
      canvas.remove(shapeTempLineRef.current);
      shapeTempLineRef.current = null;
    }
    shapeMarkersRef.current.forEach((m) => canvas.remove(m));
    shapeMarkersRef.current = [];
    shapePointsRef.current = [];
    canvas.renderAll();
  };

  // Açı Gösterim Modunu Değiştirme ('all' | 'arc_only' | 'hidden')
  const setAngleDisplayMode = (mode: AngleDisplayMode) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;

    setStyle((prev) => ({ ...prev, angleDisplayMode: mode }));

    // Eğer grup içindeyse açı nesnelerinin görünürlüğünü güncelle
    if (active.type === 'group' && Array.isArray(active._objects)) {
      active.angleDisplayMode = mode;
      active._objects.forEach((obj: any) => {
        if (obj.isAngleLabel) {
          obj.set('visible', mode === 'all');
        } else if (obj.isAngleArc || obj.isAngleComponent) {
          obj.set('visible', mode !== 'hidden');
        }
      });
      canvas.renderAll();
      saveState();
    }
  };

  // Canvas Başlatma
  useEffect(() => {
    if (!canvasRef.current) return;
    const fabric = (window as any).fabric;
    if (!fabric) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 760,
      height: 520,
      selection: true,
      preserveObjectStacking: true,
    });
    fabricCanvasRef.current = canvas;

    updateGridBackground(canvas, gridEnabled);
    saveState();

    const updateToolbar = (target: any) => {
      if (!target) {
        setIsToolbarVisible(false);
        setSelectedObject(null);
        return;
      }
      setSelectedObject(target);
      const bound = target.getBoundingRect(true);
      setToolbarPosition({
        top: bound.top,
        left: bound.left + bound.width / 2,
      });
      setIsToolbarVisible(true);

      setStyle((prev) => ({
        ...prev,
        strokeColor: target.stroke || prev.strokeColor,
        fillColor: target.fill || prev.fillColor,
        strokeWidth: target.strokeWidth || prev.strokeWidth,
        isDashed: Array.isArray(target.strokeDashArray) && target.strokeDashArray.length > 0,
        angleDisplayMode: target.angleDisplayMode || prev.angleDisplayMode || 'all',
      }));
    };

    canvas.on('selection:created', (e: any) => updateToolbar(e.selected?.[0]));
    canvas.on('selection:updated', (e: any) => updateToolbar(e.selected?.[0]));
    canvas.on('selection:cleared', () => updateToolbar(null));
    canvas.on('object:modified', () => {
      updateToolbar(canvas.getActiveObject());
      saveState();
    });

    // Mouse Down
    canvas.on('mouse:down', (opt: any) => {
      const pointer = canvas.getPointer(opt.e);
      let pt: Point2D = snapToGrid({ x: pointer.x, y: pointer.y }, 10, snapEnabled);

      // Manyetik Köşe Kenetlenmesi (Vertex Snap)
      const existingVertices = getAllVertices();
      pt = findNearestVertex(pt, existingVertices, 15);

      if (activeTool === 'point') {
        const circle = new fabric.Circle({
          left: pt.x,
          top: pt.y,
          radius: 4,
          fill: style.strokeColor,
          originX: 'center',
          originY: 'center',
          selectable: true,
        });
        canvas.add(circle);
        canvas.renderAll();
        saveState();
      } else if (activeTool === 'line') {
        isDrawingLineRef.current = true;
        const line = new fabric.Line([pt.x, pt.y, pt.x, pt.y], {
          stroke: style.strokeColor,
          strokeWidth: style.strokeWidth,
          strokeDashArray: style.isDashed ? [6, 6] : null,
          selectable: true,
          cornerColor: '#2563eb',
          cornerSize: 8,
          transparentCorners: false,
        });
        drawingLineRef.current = line;
        canvas.add(line);
      } else if (activeTool === 'shape') {
        // İlk noktaya yakın tıklandıysa şekli kapat
        if (shapePointsRef.current.length >= 3) {
          const firstPt = shapePointsRef.current[0];
          const dist = Math.hypot(pt.x - firstPt.x, pt.y - firstPt.y);
          if (dist < 18) {
            finalizeShape();
            return;
          }
        }

        shapePointsRef.current.push(pt);

        const marker = new fabric.Circle({
          left: pt.x,
          top: pt.y,
          radius: 4.5,
          fill: '#ef4444',
          stroke: '#ffffff',
          strokeWidth: 1.5,
          originX: 'center',
          originY: 'center',
          selectable: false,
        });
        canvas.add(marker);
        shapeMarkersRef.current.push(marker);

        if (!shapeTempLineRef.current) {
          const rubberLine = new fabric.Line([pt.x, pt.y, pt.x, pt.y], {
            stroke: style.strokeColor,
            strokeWidth: style.strokeWidth,
            strokeDashArray: [4, 4],
            selectable: false,
          });
          shapeTempLineRef.current = rubberLine;
          canvas.add(rubberLine);
        } else {
          shapeTempLineRef.current.set({ x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y });
        }
        canvas.renderAll();
      } else if (activeTool === 'circle') {
        const circle = new fabric.Circle({
          left: pt.x,
          top: pt.y,
          radius: 40,
          fill: style.fillColor,
          stroke: style.strokeColor,
          strokeWidth: style.strokeWidth,
          originX: 'center',
          originY: 'center',
          selectable: true,
          cornerColor: '#2563eb',
          cornerSize: 8,
        });
        canvas.add(circle);
        canvas.setActiveObject(circle);
        canvas.renderAll();
        saveState();
        setActiveTool('select');
      } else if (activeTool === 'text') {
        const text = new fabric.IText('A', {
          left: pt.x,
          top: pt.y,
          fontSize: 20,
          fontFamily: 'Noto Sans, sans-serif',
          fontWeight: 'bold',
          fill: style.strokeColor,
          selectable: true,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        canvas.renderAll();
        saveState();
        setActiveTool('select');
      }
    });

    // Mouse Move
    canvas.on('mouse:move', (opt: any) => {
      const pointer = canvas.getPointer(opt.e);
      let pt: Point2D = snapToGrid({ x: pointer.x, y: pointer.y }, 10, snapEnabled);
      const existingVertices = getAllVertices();
      pt = findNearestVertex(pt, existingVertices, 15);

      if (isDrawingLineRef.current && drawingLineRef.current) {
        drawingLineRef.current.set({ x2: pt.x, y2: pt.y });
        canvas.renderAll();
      } else if (activeTool === 'shape' && shapeTempLineRef.current) {
        shapeTempLineRef.current.set({ x2: pt.x, y2: pt.y });
        canvas.renderAll();
      }
    });

    // Mouse Up
    canvas.on('mouse:up', () => {
      if (isDrawingLineRef.current && drawingLineRef.current) {
        isDrawingLineRef.current = false;
        drawingLineRef.current.setCoords();
        canvas.setActiveObject(drawingLineRef.current);
        canvas.renderAll();
        saveState();
        setActiveTool('select');
        drawingLineRef.current = null;
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        cleanupShapeDrawing();
        setActiveTool('select');
        canvas.discardActiveObject();
        canvas.renderAll();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObjs = canvas.getActiveObjects();
        if (activeObjs && activeObjs.length > 0) {
          activeObjs.forEach((obj: any) => canvas.remove(obj));
          canvas.discardActiveObject();
          canvas.renderAll();
          saveState();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) handleRedo();
        else handleUndo();
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        handleDuplicate();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.dispose();
    };
  }, [getAllVertices, finalizeShape]);

  // Aktif Araç Değişimi
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (activeTool === 'select') {
      canvas.selection = true;
      canvas.defaultCursor = 'default';
      canvas.forEachObject((obj: any) => {
        obj.selectable = true;
        obj.evented = true;
      });
    } else {
      canvas.selection = false;
      canvas.defaultCursor = 'crosshair';
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  }, [activeTool]);

  useEffect(() => {
    updateGridBackground(fabricCanvasRef.current, gridEnabled);
  }, [gridEnabled, updateGridBackground]);

  const updateStyle = (updates: Partial<ShapeStyle>) => {
    setStyle((prev) => ({ ...prev, ...updates }));
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObjs = canvas.getActiveObjects();
    if (activeObjs && activeObjs.length > 0) {
      activeObjs.forEach((obj: any) => {
        if (updates.strokeColor !== undefined) obj.set('stroke', updates.strokeColor);
        if (updates.fillColor !== undefined) obj.set('fill', updates.fillColor);
        if (updates.strokeWidth !== undefined) obj.set('strokeWidth', updates.strokeWidth);
        if (updates.isDashed !== undefined) {
          obj.set('strokeDashArray', updates.isDashed ? [6, 6] : null);
        }
        obj.setCoords();
      });
      canvas.renderAll();
      saveState();
    }
  };

  const handleDuplicate = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;

    active.clone((cloned: any) => {
      canvas.discardActiveObject();
      cloned.set({
        left: cloned.left + 20,
        top: cloned.top + 20,
        evented: true,
      });
      if (cloned.type === 'activeSelection') {
        cloned.canvas = canvas;
        cloned.forEachObject((obj: any) => canvas.add(obj));
        cloned.setCoords();
      } else {
        canvas.add(cloned);
      }
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      saveState();
    });
  };

  const handleDelete = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObjs = canvas.getActiveObjects();
    if (activeObjs && activeObjs.length > 0) {
      activeObjs.forEach((obj: any) => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
      saveState();
    }
  };

  const addRegularPolygon = (sides: number) => {
    const canvas = fabricCanvasRef.current;
    const fabric = (window as any).fabric;
    if (!canvas || !fabric) return;

    const points = generateRegularPolygonPoints(sides, 60, { x: 380, y: 260 });
    const poly = new fabric.Polygon(points, {
      fill: style.fillColor,
      stroke: style.strokeColor,
      strokeWidth: style.strokeWidth,
      selectable: true,
      cornerColor: '#2563eb',
      cornerSize: 8,
    });
    canvas.add(poly);
    canvas.setActiveObject(poly);
    canvas.renderAll();
    saveState();
    setActiveTool('select');
  };

  const addKatexFormula = async (latex: string, options: { color: string; fontSize: number }) => {
    const canvas = fabricCanvasRef.current;
    const fabric = (window as any).fabric;
    if (!canvas || !fabric) return;

    try {
      const { dataUrl } = await katexToImage(latex, {
        color: options.color,
        fontSize: options.fontSize,
      });

      fabric.Image.fromURL(dataUrl, (img: any) => {
        img.set({
          left: 380,
          top: 260,
          originX: 'center',
          originY: 'center',
          selectable: true,
          hasControls: true,
          hasBorders: true,
          cornerColor: '#2563eb',
          cornerSize: 8,
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        saveState();
      });
    } catch (err) {
      console.error('KaTeX ekleme hatası:', err);
    }
  };

  const exportCanvas = (options: GeometryExportOptions = {}): string | null => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return null;

    canvas.discardActiveObject();
    canvas.renderAll();

    return canvas.toDataURL({
      format: options.format || 'png',
      multiplier: options.multiplier || 2,
    });
  };

  const setZoom = (percent: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const scale = Math.max(0.5, Math.min(2.5, percent / 100));
    canvas.setZoom(scale);
    canvas.renderAll();
    setZoomLevel(Math.round(scale * 100));
  };

  return {
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
    addRegularPolygon,
    addKatexFormula,
    exportCanvas,
  };
}
