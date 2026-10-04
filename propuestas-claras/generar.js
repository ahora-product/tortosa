/* Genera las 5 propuestas claras a partir de index.html.
   Uso (desde la raíz del proyecto):  node propuestas-claras/generar.js
   Crea propuesta-clara-1.html … propuesta-clara-5.html en la raíz. */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const base = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const NAMES = [
  'Crema + cifras',
  'Mocca + proceso',
  'Bento',
  'Secciones flotantes',
  'Acento terracota',
];

function insertBefore(html, marker, snippet) {
  const i = html.indexOf(marker);
  if (i < 0) throw new Error('No encuentro: ' + marker);
  return html.slice(0, i) + snippet + '\n    ' + html.slice(i);
}
function insertAfter(html, marker, snippet) {
  const i = html.indexOf(marker);
  if (i < 0) throw new Error('No encuentro: ' + marker);
  return html.slice(0, i + marker.length) + snippet + html.slice(i + marker.length);
}
const colorLogos = (html) => html
  .replace(/makito-white\.png/g, 'makito.png')
  .replace(/valento-white\.png/g, 'valento.png')
  .replace(/roly-white\.svg/g, 'roly.svg')
  .replace(/velilla-white\.png/g, 'velilla.webp')
  .replace(/kedat-white\.png/g, 'kedat.png');

const ico = {
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  star: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  home: '<path d="M3.5 11 12 4l8.5 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>',
};
const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ico[k]}</svg>`;

/* ---------- Bloques nuevos de cada propuesta ---------- */
const P1_STATS = `<!-- NUEVO (propuesta 1): tarjetas de cifras -->
    <section class="p1-stats" aria-label="Tortosa en cifras">
      <div class="container p1-stats-grid">
        <div class="p1-stat p1-stat-accent reveal"><strong data-count="25" data-prefix="+">+25</strong><span>años dando imagen a negocios de Valencia</span></div>
        <div class="p1-stat reveal"><strong data-count="6">6</strong><span>servicios bajo un mismo techo</span></div>
        <div class="p1-stat reveal"><strong data-count="14">14</strong><span>catálogos para elegir producto</span></div>
        <div class="p1-stat reveal"><strong>1</strong><span>único proveedor: diseño, fabricación e instalación</span></div>
      </div>
    </section>
`;

const P2_CHIPS = `<div class="p2-chips" aria-hidden="true">
            <span class="p2-chip"><i>✎</i>Diseño a medida</span>
            <span class="p2-chip"><i>⚒</i>Fabricación propia</span>
            <span class="p2-chip"><i>✓</i>Instalación incluida</span>
          </div>
          `;
const P2_PROCESS = `<!-- NUEVO (propuesta 2): cómo trabajamos -->
    <section class="section p2-process" aria-labelledby="p2-process-title">
      <div class="container">
        <header class="px-head reveal">
          <span class="sec-no"><span class="sec-no-t">Cómo trabajamos</span></span>
          <h2 id="p2-process-title" data-split>De la idea a tu fachada, en cuatro pasos</h2>
        </header>
        <div class="p2-steps">
          <article class="p2-step reveal"><h3>Escuchamos</h3><p>Nos cuentas qué necesitas y visitamos tu local si hace falta.</p></article>
          <article class="p2-step reveal"><h3>Diseñamos</h3><p>Te enseñamos cómo quedará antes de fabricar nada.</p></article>
          <article class="p2-step reveal"><h3>Fabricamos</h3><p>Producimos con materiales de calidad y acabados cuidados.</p></article>
          <article class="p2-step reveal"><h3>Instalamos</h3><p>Lo montamos nosotros y nos hacemos cargo de todo.</p></article>
        </div>
      </div>
    </section>
`;

const P3_FLOAT = `
          <div class="p3-float" aria-hidden="true"><strong>+25</strong><span>años dando imagen a negocios de Valencia</span></div>`;
const P3_BENTO = `<!-- NUEVO (propuesta 3): bento "Por qué Tortosa" -->
    <section class="section p3-why" aria-labelledby="p3-why-title">
      <div class="container">
        <header class="px-head reveal">
          <span class="sec-no"><span class="sec-no-t">Por qué Tortosa</span></span>
          <h2 id="p3-why-title" data-split>Lo que nos piden que no cambiemos</h2>
        </header>
        <div class="p3-bento">
          <article class="p3-tile p3-tile-big reveal"><span class="p3-ico">${svg('home')}</span><div><h3>Todo bajo un mismo techo</h3><p>Desde un regalo de empresa hasta la fachada completa: diseño, producción e instalación.</p></div></article>
          <article class="p3-tile reveal"><span class="p3-ico">${svg('chat')}</span><div><h3>Trato cercano</h3><p>Asesoramiento honesto, sin letra pequeña.</p></div></article>
          <article class="p3-tile p3-tile-dark reveal"><span class="p3-ico">${svg('star')}</span><div><h3>Calidad</h3><p>En materiales y acabados.</p></div></article>
          <article class="p3-tile p3-tile-wide reveal"><span class="p3-ico">${svg('clock')}</span><div><h3>Cumplimos plazos</h3><p>Nos hacemos cargo de todo para que tú solo tengas que abrir la puerta.</p></div></article>
        </div>
      </div>
    </section>
`;

const P4_SCRIPT = `<script>
  /* Propuesta 4: inclinación 3D + brillo que sigue al cursor */
  (function () {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.service-card, .catalog-cover, .ig-card').forEach(function (el) {
      el.classList.add('p4-tilt');
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', x * 100 + '%');
        el.style.setProperty('--my', y * 100 + '%');
        el.style.transition = 'transform .12s ease-out';
        el.style.transform = 'perspective(900px) rotateX(' + ((.5 - y) * 8) + 'deg) rotateY(' + ((x - .5) * 10) + 'deg) translateY(-6px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transition = 'transform .6s cubic-bezier(0.22, 1, 0.36, 1)';
        el.style.transform = '';
      });
    });
  })();
  </script>
  `;

const P5_TAGS = ['Lo más pedido', 'Vehículos y vinilos', 'Para regalar', 'Con tu logo', 'Uniformes', 'Papelería'];
const P5_WORK_ITEMS = [
  ['rotulos-fachadas/fachadas/fachadas-001.jpg', 'Fachadas', 'Rótulo y fachada completa'],
  ['rotulacion/vehiculos/vehiculos-001.jpg', 'Rotulación', 'Vehículos de empresa'],
  ['textil-publicitario/textil-publicitario-001.jpg', 'Textil', 'Textil con tu marca'],
  ['rotulacion/vinilos/vinilos-001.jpg', 'Rotulación', 'Vinilos y escaparates'],
  ['regalos-empresa/regalos-empresa-001.jpg', 'Regalos', 'Regalos de empresa'],
  ['ropa-laboral/ropa-laboral-001.jpg', 'Laboral', 'Ropa de trabajo'],
  ['rotulos-fachadas/fachadas/fachadas-004.jpg', 'Fachadas', 'Letras corpóreas'],
].filter(([src]) => fs.existsSync(path.join(root, 'assets/portfolio', src)));
const P5_WORK = `<!-- NUEVO (propuesta 5): carrusel de trabajos -->
    <section class="section p5-work" aria-labelledby="p5-work-title">
      <div class="container">
        <div class="p5-work-head reveal">
          <div>
            <span class="sec-no"><span class="sec-no-t">Trabajos reales</span></span>
            <p class="eyebrow">Desliza</p>
            <h2 id="p5-work-title" data-split>Un poco de todo lo que hacemos</h2>
          </div>
          <div class="p5-arrows">
            <button type="button" data-dir="-1" aria-label="Anterior">←</button>
            <button type="button" data-dir="1" aria-label="Siguiente">→</button>
          </div>
        </div>
        <div class="p5-track" data-lenis-prevent>
${P5_WORK_ITEMS.map(([src, tag, title]) => `          <figure class="p5-item"><img src="assets/portfolio/${src}" alt="${title} — trabajo de Comercial Tortosa" loading="lazy"><figcaption class="p5-cap"><small>${tag}</small><strong>${title}</strong></figcaption></figure>`).join('\n')}
        </div>
      </div>
    </section>
`;
const P5_SCRIPT = `<script>
  /* Propuesta 5: flechas del carrusel */
  document.querySelectorAll('.p5-arrows button').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = document.querySelector('.p5-track');
      var item = t.querySelector('.p5-item');
      t.scrollBy({ left: (item.offsetWidth + 18) * Number(b.dataset.dir), behavior: 'smooth' });
    });
  });
  </script>
  `;

/* ---------- Ensamblado ---------- */
const variants = {
  1: { cls: 'lt-header lt-hero', logos: true, build: (h) => insertBefore(h, '<section class="section services"', P1_STATS) },
  2: { cls: 'lt-header', logos: false, build: (h) => insertBefore(insertBefore(h, '<div class="hero-badge"', P2_CHIPS), '<section class="section fachadas"', P2_PROCESS) },
  3: { cls: 'lt-header lt-hero', logos: true, build: (h) => insertBefore(insertAfter(h, '<div class="about-media reveal">', P3_FLOAT), '<section class="section portfolio"', P3_BENTO) },
  4: { cls: 'lt-header lt-hero', logos: true, build: (h) => insertBefore(h, '</body>', P4_SCRIPT) },
  5: {
    cls: 'lt-header lt-hero', logos: true,
    build: (h) => {
      let n = 0;
      h = h.replace(/<article class="service-card( service-featured)? reveal">/g, (m) => m + `\n            <span class="p5-tag">${P5_TAGS[n++]}</span>`);
      h = insertBefore(h, '<section class="section about"', P5_WORK);
      return insertBefore(h, '</body>', P5_SCRIPT);
    },
  },
};

for (const [n, v] of Object.entries(variants)) {
  let h = base;
  h = h.replace('<html lang="es">', `<html lang="es" class="${v.cls}">`);
  h = h.replace(/<title>[^<]*<\/title>/, `<title>Propuesta ${n} · ${NAMES[n - 1]} | Tortosa</title>`);
  h = h.replace('<meta name="robots" content="index, follow">', '<meta name="robots" content="noindex, nofollow">');
  h = h.replace('<link rel="stylesheet" href="styles.css">',
    `<link rel="stylesheet" href="styles.css">\n  <link rel="stylesheet" href="propuestas-claras/base.css">\n  <link rel="stylesheet" href="propuestas-claras/p${n}.css">`);
  if (v.logos) h = colorLogos(h);
  h = v.build(h);
  const sw = `<nav class="prop-switch" aria-label="Cambiar de propuesta">
    <a href="propuestas-claras.html" title="Todas las propuestas">☰</a>
${[1, 2, 3, 4, 5].map((i) => `    <a href="propuesta-clara-${i}.html"${i == n ? ' class="on" aria-current="page"' : ''}>${i}</a>`).join('\n')}
    <span class="prop-name">${NAMES[n - 1]}</span>
  </nav>
  `;
  h = insertBefore(h, '<!-- Botón flotante de presupuesto en móvil -->', sw);
  fs.writeFileSync(path.join(root, `propuesta-clara-${n}.html`), h);
  console.log('OK propuesta-clara-' + n + '.html');
}
