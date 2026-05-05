const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const { createCanvas } = require('canvas');
const { writeFileSync, readFileSync } = require('fs');
const { resolve } = require('path');

pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve('pdfjs-dist/legacy/build/pdf.worker.js');

class NodeCanvasFactory {
  create(width, height) {
    const canvas = createCanvas(width, height);
    return { canvas, context: canvas.getContext('2d') };
  }
  reset(obj, width, height) {
    obj.canvas.width = width;
    obj.canvas.height = height;
  }
  destroy(obj) {
    obj.canvas.width = 0;
    obj.canvas.height = 0;
    obj.canvas = null;
    obj.context = null;
  }
}

const files = [
  { src: 'nen-entry-overview.pdf', prefix: 'nen-1' },
  { src: 'nen-nosd.pdf',           prefix: 'nen-2' },
  { src: 'nen-morning-evening.pdf',prefix: 'nen-3' },
  { src: 'nen-outsidebar.pdf',     prefix: 'nen-4' },
  { src: 'nen-pressure-zone.pdf',  prefix: 'nen-5' },
];

async function convertAllPages(src, prefix) {
  const data = new Uint8Array(readFileSync(resolve(src)));
  const canvasFactory = new NodeCanvasFactory();
  const pdf = await pdfjsLib.getDocument({ data, verbosity: 0, canvasFactory }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.6 });
    const { canvas, context } = canvasFactory.create(viewport.width, viewport.height);
    await page.render({ canvasContext: context, viewport, canvasFactory }).promise;
    const out = `preview-${prefix}-p${i}.jpg`;
    writeFileSync(out, canvas.toBuffer('image/jpeg', { quality: 0.88 }));
    console.log('✓', out);
    pages.push(out);
  }
  return pages;
}

(async () => {
  const manifest = {};
  for (const f of files) {
    const pages = await convertAllPages(f.src, f.prefix).catch(e => { console.error('✗', f.src, e.message); return []; });
    manifest[f.prefix] = pages;
  }
  writeFileSync('nen-manifest.json', JSON.stringify(manifest, null, 2));
  console.log('\nManifest:');
  console.log(JSON.stringify(manifest, null, 2));
})();
