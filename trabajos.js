/* ============================================================
   TORTOSA — v3 · Página de trabajos reales
   Una pestaña por servicio (los mismos 6 de la web). La pestaña
   activa sale del enlace: trabajos.html#rotulacion, etc.
   Datos en portfolio-data.js (assets/portfolio/<servicio>/...).
   ============================================================ */
(function () {
  'use strict';

  var BASE = 'assets/portfolio/';
  var DATA = (window.PORTFOLIO || []).filter(function (s) { return count(s) > 0; }); // sin fotos (Imprenta) no sale
  if (!DATA.length) return;

  var tabsEl = document.getElementById('works-tabs');
  var filtersEl = document.getElementById('works-filters');
  var grid = document.getElementById('works-grid');
  var sub = document.getElementById('works-sub');
  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lb-img');
  var lbList = [], lbIdx = 0, lastFocus = null;

  function count(s) { return s.groups.reduce(function (n, g) { return n + g.files.length; }, 0); }
  function itemsOf(g) { return g.files.map(function (f) { return { src: BASE + f, cat: g.name }; }); }
  // Varias subcarpetas intercaladas para que se vea variedad desde el principio
  function mix(lists) {
    var out = [], max = Math.max.apply(null, lists.map(function (l) { return l.length; }));
    for (var i = 0; i < max; i++) lists.forEach(function (l) { if (l[i]) out.push(l[i]); });
    return out;
  }

  /* ---------- Rejilla ---------- */
  function renderGrid(list) {
    grid.innerHTML = '';
    var frag = document.createDocumentFragment();
    list.forEach(function (it, k) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'gal-item';
      b.style.animationDelay = (k % 12) * 40 + 'ms';
      b.innerHTML = '<img src="' + it.src + '" alt="Trabajo de ' + it.cat.toLowerCase() + ' realizado por Comercial Tortosa" loading="lazy" decoding="async"><span class="gal-tag">' + it.cat + '</span>';
      b.addEventListener('click', function () { lbOpen(list, k, b); });
      frag.appendChild(b);
    });
    grid.appendChild(frag);
  }

  /* ---------- Pestañas por servicio ---------- */
  DATA.forEach(function (s) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'works-tab'; b.id = 'tab-' + s.id;
    b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', 'works-grid');
    b.dataset.id = s.id;
    b.innerHTML = s.title + ' <small>' + count(s) + '</small>';
    b.addEventListener('click', function () { show(s.id, true); });
    tabsEl.appendChild(b);
  });

  function show(id, push) {
    var s = DATA.filter(function (x) { return x.id === id; })[0] || DATA[0];
    tabsEl.querySelectorAll('.works-tab').forEach(function (t) {
      var on = t.dataset.id === s.id;
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      if (on) t.scrollIntoView({ block: 'nearest', inline: 'center' });
    });
    grid.setAttribute('aria-labelledby', 'tab-' + s.id);
    var lists = s.groups.map(itemsOf), all = mix(lists);
    document.getElementById('works-title').textContent = s.title;
    sub.textContent = all.length + ' trabajos realizados';
    document.title = s.title + ' · Trabajo real | Tortosa';

    // Filtros por tipo (solo si el servicio tiene varias subcarpetas)
    filtersEl.innerHTML = '';
    if (s.groups.length > 1) {
      [{ name: 'Todo', list: all }].concat(s.groups.map(function (g, i) { return { name: g.name, list: lists[i] }; }))
        .forEach(function (f, i) {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'gal-chip';
          b.setAttribute('aria-pressed', i === 0);
          b.innerHTML = f.name + ' <small>' + f.list.length + '</small>';
          b.addEventListener('click', function () {
            filtersEl.querySelectorAll('.gal-chip').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
            renderGrid(f.list);
          });
          filtersEl.appendChild(b);
        });
    }
    renderGrid(all);
    if (push && location.hash !== '#' + s.id) history.replaceState(null, '', '#' + s.id);
  }

  // Flechas entre pestañas (patrón de pestañas accesible)
  tabsEl.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var tabs = Array.prototype.slice.call(tabsEl.querySelectorAll('.works-tab'));
    var i = tabs.indexOf(document.activeElement); if (i < 0) return;
    var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    next.focus(); show(next.dataset.id, true);
  });

  window.addEventListener('hashchange', function () { show(location.hash.slice(1)); });
  show(location.hash.slice(1));

  /* ---------- Cerrar (X o Esc): vuelve a la web ----------
     Si venimos de la portada, volvemos atrás para conservar la posición del scroll. */
  var closeBtn = document.getElementById('works-close');
  function closeScreen(e) {
    var ref = document.referrer;
    if (ref && ref.indexOf(location.origin) === 0 && ref.indexOf('trabajos') < 0 && history.length > 1) {
      if (e) e.preventDefault();
      history.back();
    } else if (!e) { location.href = closeBtn.getAttribute('href'); }
  }
  closeBtn.addEventListener('click', closeScreen);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.hidden) closeScreen(); });

  /* ---------- Visor ---------- */
  function lbShow(i) {
    lbIdx = (i + lbList.length) % lbList.length;
    var it = lbList[lbIdx];
    lbImg.src = it.src;
    lbImg.alt = 'Trabajo de ' + it.cat.toLowerCase() + ' realizado por Comercial Tortosa';
    document.getElementById('lb-cat').textContent = it.cat;
    document.getElementById('lb-counter').textContent = (lbIdx + 1) + ' / ' + lbList.length;
    new Image().src = lbList[(lbIdx + 1) % lbList.length].src; // precarga la siguiente
  }
  function lbOpen(list, i, opener) {
    lbList = list; lastFocus = opener; lbShow(i);
    lb.hidden = false; document.body.style.overflow = 'hidden';
    document.getElementById('lb-close').focus();
  }
  function lbClose() {
    lb.hidden = true; document.body.style.overflow = '';
    var it = grid.children[lbIdx] || lastFocus; if (it) it.focus();
  }
  document.getElementById('lb-close').addEventListener('click', lbClose);
  document.getElementById('lb-prev').addEventListener('click', function () { lbShow(lbIdx - 1); });
  document.getElementById('lb-next').addEventListener('click', function () { lbShow(lbIdx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-stage')) lbClose(); });

  var tx = null; // deslizar en móvil
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 50) lbShow(lbIdx + (dx < 0 ? 1 : -1));
  });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') lbClose();
    if (e.key === 'ArrowRight') lbShow(lbIdx + 1);
    if (e.key === 'ArrowLeft') lbShow(lbIdx - 1);
  });
})();
