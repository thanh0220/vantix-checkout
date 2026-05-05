import { createCanvas } from 'canvas';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';

const NodeCanvasFactory = {
  create(w, h) {
    const canvas = createCanvas(w, h);
    return { canvas, context: canvas.getContext('2d') };
  },
  reset(obj, w, h) {
    obj.canvas.width = w; obj.canvas.height = h;
  },
  destroy(obj) { obj.canvas = null; }
};

const files = [
  { src: 'nen-entry-overview.pdf', out: 'preview-nen-1.jpg' },
  { src: 'nen-nosd.pdf',           out: 'preview-nen-2.jpg' },
  { src: 'nen-morning-evening.pdf',out: 'preview-nen-3.jpg' },
  { src: 'nen-outsidebar.pdf',     out: 'preview-nen-4.jpg' },
  { src: 'nen-pressure-zone.pdf',  out: 'preview-nen-5.jpg' },
];

async function convertPage(src, out) {
  const data = new Uint8Array(readFileSync(resolve(src)));
  const pdf  = await pdfjsLib.getDocument({ data, verbosity: 0, CanvasFactory: NodeCanvasFactory }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1.8 });
  const { canvas, context } = NodeCanvasFactory.create(viewport.width, viewport.height);
  await page.render({ canvasContext: context, viewport, canvasFactory: NodeCanvasFactory }).promise;
  writeFileSync(out, canvas.toBuffer('image/jpeg', { quality: 0.88 }));
  console.log('✓', out);
}

for (const f of files) {
  await convertPage(f.src, f.out).catch(e => console.error('✗', f.src, e.message));
}
