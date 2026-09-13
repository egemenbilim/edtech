import { Point2D, AngleCalculationResult, CornerAngleData } from './types';

/**
 * 3 Noktadan açı, yay koordinatları ve etiket konumunu hassas olarak hesaplar.
 */
export function calculateAngle(
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  arcRadius: number = 28
): AngleCalculationResult {
  const v1x = p1.x - p2.x;
  const v1y = p1.y - p2.y;
  const v2x = p3.x - p2.x;
  const v2y = p3.y - p2.y;

  let theta1 = Math.atan2(v1y, v1x);
  let theta2 = Math.atan2(v2y, v2x);

  let diff = theta2 - theta1;
  while (diff < 0) diff += 2 * Math.PI;
  while (diff >= 2 * Math.PI) diff -= 2 * Math.PI;

  let startAngleRad = theta1;
  let sweepAngleRad = diff;
  let isClockwise = true;

  if (diff > Math.PI) {
    startAngleRad = theta2;
    sweepAngleRad = 2 * Math.PI - diff;
    isClockwise = false;
  }

  const angleDegrees = Math.round((sweepAngleRad * 180) / Math.PI);
  const bisectorAngleRad = isClockwise
    ? startAngleRad + sweepAngleRad / 2
    : startAngleRad - sweepAngleRad / 2;

  const labelDist = arcRadius + 16;
  const labelPosition: Point2D = {
    x: p2.x + Math.cos(bisectorAngleRad) * labelDist,
    y: p2.y + Math.sin(bisectorAngleRad) * labelDist,
  };

  return {
    angleDegrees,
    startAngleRad,
    endAngleRad: isClockwise ? startAngleRad + sweepAngleRad : startAngleRad - sweepAngleRad,
    sweepAngleRad,
    bisectorAngleRad,
    labelPosition,
  };
}

/**
 * Verilen bir çokgenin (üçgen, dörtgen vb.) TÜM köşelerindeki iç açıları otomatik hesaplar.
 * Dik açıları (90°) tespit edip diklik kutusu koordinatlarını üretir.
 */
export function calculatePolygonInternalAngles(
  points: Point2D[],
  arcRadius: number = 24
): CornerAngleData[] {
  const n = points.length;
  if (n < 3) return [];

  // Çokgenin yönünü belirle (Shoelace signed area)
  let signedArea = 0;
  for (let i = 0; i < n; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    signedArea += p1.x * p2.y - p2.x * p1.y;
  }
  const isPolygonClockwise = signedArea < 0;

  const results: CornerAngleData[] = [];

  for (let i = 0; i < n; i++) {
    const pPrev = points[(i - 1 + n) % n];
    const pCurr = points[i];
    const pNext = points[(i + 1) % n];

    const vPrev = { x: pPrev.x - pCurr.x, y: pPrev.y - pCurr.y };
    const vNext = { x: pNext.x - pCurr.x, y: pNext.y - pCurr.y };

    const lenPrev = Math.hypot(vPrev.x, vPrev.y);
    const lenNext = Math.hypot(vNext.x, vNext.y);

    if (lenPrev === 0 || lenNext === 0) continue;

    // Birim vektörler
    const uPrev = { x: vPrev.x / lenPrev, y: vPrev.y / lenNext };
    const uNext = { x: vNext.x / lenNext, y: vNext.y / lenNext };

    const thPrev = Math.atan2(vPrev.y, vPrev.x);
    const thNext = Math.atan2(vNext.y, vNext.x);

    // Açılar arası fark
    let diff = thNext - thPrev;
    while (diff < 0) diff += 2 * Math.PI;
    while (diff >= 2 * Math.PI) diff -= 2 * Math.PI;

    // Çokgen yönüne göre iç açı seçimi
    let sweepAngle = isPolygonClockwise ? 2 * Math.PI - diff : diff;
    if (sweepAngle < 0) sweepAngle += 2 * Math.PI;
    if (sweepAngle > 2 * Math.PI) sweepAngle -= 2 * Math.PI;

    // Çokgenin iç açısı genellikle < 180°'dir (dışbükey çokgenlerde)
    const angleDegrees = Math.round((sweepAngle * 180) / Math.PI);
    const isRightAngle = Math.abs(angleDegrees - 90) <= 2;

    const boxSize = 16;
    if (isRightAngle) {
      // Standart Dik Açı Sembolü (Kare ve Nokta)
      const u1 = { x: vPrev.x / lenPrev, y: vPrev.y / lenPrev };
      const u2 = { x: vNext.x / lenNext, y: vNext.y / lenNext };

      const corner1 = { x: pCurr.x + u1.x * boxSize, y: pCurr.y + u1.y * boxSize };
      const corner2 = {
        x: pCurr.x + (u1.x + u2.x) * boxSize,
        y: pCurr.y + (u1.y + u2.y) * boxSize,
      };
      const corner3 = { x: pCurr.x + u2.x * boxSize, y: pCurr.y + u2.y * boxSize };

      const dotPos = {
        x: pCurr.x + (u1.x + u2.x) * (boxSize * 0.5),
        y: pCurr.y + (u1.y + u2.y) * (boxSize * 0.5),
      };

      results.push({
        vertexIndex: i,
        vertex: pCurr,
        prevVertex: pPrev,
        nextVertex: pNext,
        angleDegrees: 90,
        isRightAngle: true,
        rightAngleBoxPoints: [corner1, corner2, corner3],
        dotPosition: dotPos,
        labelPosition: {
          x: pCurr.x + (u1.x + u2.x) * (boxSize + 14),
          y: pCurr.y + (u1.y + u2.y) * (boxSize + 14),
        },
      });
    } else {
      // Açı Yayı ve Derece
      const startAngle = isPolygonClockwise ? thNext : thPrev;
      const endAngle = isPolygonClockwise ? thPrev : thNext;
      const arcPath = generateArcPath(pCurr, arcRadius, startAngle, endAngle);

      const bisectorAngle = startAngle + sweepAngle / 2;
      const labelDist = arcRadius + 16;
      const labelPosition = {
        x: pCurr.x + Math.cos(bisectorAngle) * labelDist,
        y: pCurr.y + Math.sin(bisectorAngle) * labelDist,
      };

      results.push({
        vertexIndex: i,
        vertex: pCurr,
        prevVertex: pPrev,
        nextVertex: pNext,
        angleDegrees,
        isRightAngle: false,
        arcPathString: arcPath,
        labelPosition,
      });
    }
  }

  return results;
}

/**
 * Verilen merkez, yarıçap, başlangıç ve süpürme açısına göre SVG Arc Path string'i üretir.
 */
export function generateArcPath(
  center: Point2D,
  radius: number,
  startAngleRad: number,
  endAngleRad: number
): string {
  const startX = center.x + radius * Math.cos(startAngleRad);
  const startY = center.y + radius * Math.sin(startAngleRad);
  const endX = center.x + radius * Math.cos(endAngleRad);
  const endY = center.y + radius * Math.sin(endAngleRad);

  let diff = endAngleRad - startAngleRad;
  while (diff < 0) diff += 2 * Math.PI;
  const largeArcFlag = diff > Math.PI ? 1 : 0;
  const sweepFlag = 1;

  return `M ${startX.toFixed(2)} ${startY.toFixed(2)} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${endX.toFixed(2)} ${endY.toFixed(2)}`;
}

/**
 * Manyetik Köşe / Tepe Noktası Yakalama (Vertex Snapping)
 * Kullanıcı çizim yaparken mevcut şekillerin köşelerine yaklaştığında tam kilitlenir.
 */
export function findNearestVertex(
  point: Point2D,
  vertices: Point2D[],
  threshold: number = 14
): Point2D {
  let closest = point;
  let minDist = threshold;

  for (const v of vertices) {
    const d = Math.hypot(point.x - v.x, point.y - v.y);
    if (d < minDist) {
      minDist = d;
      closest = { x: v.x, y: v.y };
    }
  }

  return closest;
}

/**
 * Düzgün çokgen köşe noktalarını üretir.
 */
export function generateRegularPolygonPoints(
  sides: number,
  radius: number,
  center: Point2D
): Point2D[] {
  const points: Point2D[] = [];
  const angleStep = (2 * Math.PI) / sides;
  const startOffset = -Math.PI / 2;

  for (let i = 0; i < sides; i++) {
    const angle = startOffset + i * angleStep;
    points.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    });
  }

  return points;
}

/**
 * Grid snap hesaplama
 */
export function snapToGrid(point: Point2D, gridSize: number = 10, enabled: boolean = true): Point2D {
  if (!enabled || gridSize <= 0) return point;
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

/**
 * KaTeX formülünü SVG/DataURL görüntüsüne dönüştürür.
 */
export async function katexToImage(
  latex: string,
  options: { color?: string; fontSize?: number; scale?: number } = {}
): Promise<{ dataUrl: string; width: number; height: number }> {
  const { color = '#0f172a', fontSize = 24, scale = 2 } = options;

  const katex = (window as any).katex;
  if (!katex) {
    throw new Error('KaTeX kütüphanesi yüklenemedi.');
  }

  const htmlString = katex.renderToString(latex, {
    displayMode: true,
    throwOnError: false,
  });

  const wrapper = document.createElement('div');
  wrapper.style.display = 'inline-block';
  wrapper.style.fontSize = `${fontSize}px`;
  wrapper.style.color = color;
  wrapper.style.fontFamily = 'KaTeX_Main, Times New Roman, serif';
  wrapper.style.padding = '8px 12px';
  wrapper.style.position = 'absolute';
  wrapper.style.left = '-9999px';
  wrapper.style.top = '-9999px';
  wrapper.innerHTML = htmlString;
  document.body.appendChild(wrapper);

  const rect = wrapper.getBoundingClientRect();
  const width = Math.max(Math.ceil(rect.width) + 8, 30);
  const height = Math.max(Math.ceil(rect.height) + 8, 24);
  document.body.removeChild(wrapper);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width} ${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:${fontSize}px; color:${color}; font-family: KaTeX_Main, Times New Roman, serif; display:flex; align-items:center; justify-content:center; height:100%;">
          ${htmlString}
        </div>
      </foreignObject>
    </svg>
  `;

  const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          width,
          height,
        });
      } else {
        resolve({ dataUrl: svgDataUrl, width, height });
      }
    };
    img.onerror = () => {
      resolve({ dataUrl: svgDataUrl, width, height });
    };
    img.src = svgDataUrl;
  });
}
