/* ============================================================
   TORTOSA — Genera las versiones WebP ligeras de las fotos.
   Cada JPG/PNG de las carpetas de abajo tiene al lado sus copias
   .webp en varios anchos (foto-400.webp, foto-800.webp, ...) y,
   para el portfolio, la foto completa en WebP (foto.webp) que usa
   el visor. Los JPG originales se quedan como respaldo.

   Uso (cuando añadas o cambies fotos):
     npm install        (solo la primera vez)
     npm run imagenes
   Solo procesa las fotos nuevas o modificadas.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..', 'assets');
const QUALITY = 82; // WebP: sin pérdida visible y ~60-80 % menos peso que el JPG

// carpeta → anchos que se generan (null = tamaño original)
const JOBS = [
  { dir: 'brand', only: /fachada\.jpg$/, widths: [560, 840, null] },
  { dir: 'servicios', widths: [640, 1000, null] },
  { dir: 'fachadas-columnas', widths: [300, null] },
  { dir: '.', only: /^tienda-interior\.jpg$/, widths: [400, null], shallow: true },
  { dir: 'portfolio', widths: [400, 800, null], skip: /_descartes/ },
];

function walk(dir, shallow) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(function (e) {
    var p = path.join(dir, e.name);
    if (e.isDirectory()) return shallow ? [] : walk(p);
    return /\.(jpe?g|png)$/i.test(e.name) ? [p] : [];
  });
}

function outName(file, w) {
  var base = file.replace(/\.(jpe?g|png)$/i, '');
  return w ? base + '-' + w + '.webp' : base + '.webp';
}

function fresh(src, out) {
  return fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs;
}

(async function () {
  var made = 0, before = 0, after = 0;
  for (const job of JOBS) {
    var files = walk(path.join(ROOT, job.dir), job.shallow)
      .filter(function (f) { return (!job.only || job.only.test(path.basename(f))) && (!job.skip || !job.skip.test(f)); });
    for (const f of files) {
      for (const w of job.widths) {
        var out = outName(f, w);
        if (fresh(f, out)) continue;
        await sharp(f).rotate()
          .resize(w ? { width: w, withoutEnlargement: true } : undefined) // nunca se amplía
          .webp({ quality: QUALITY, effort: 6, smartSubsample: true })
          .toFile(out);
        if (!w) { before += fs.statSync(f).size; after += fs.statSync(out).size; }
        made++;
      }
    }
  }
  console.log(made + ' archivos WebP generados.');
  if (before) console.log('Tamaño completo: ' + (before / 1e6).toFixed(1) + ' MB (JPG) → ' + (after / 1e6).toFixed(1) + ' MB (WebP)');
})();
