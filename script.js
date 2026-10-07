/* ============================================================
   TORTOSA — v3 · comportamiento de la página (sin librerías)
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Año actual en el pie ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---------- Menú móvil ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('menu-movil');
  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    menu.hidden = true;
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      if (open) { closeMenu(); return; }
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Cerrar menú');
      menu.hidden = false;
    });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  }

  /* ---------- Aparición al hacer scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Apartado activo en el menú ---------- */
  var links = document.querySelectorAll('.nav-links a');
  if ('IntersectionObserver' in window && links.length) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = '#' + e.target.id;
        links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { navIO.observe(s); });
  }

  /* ---------- Formulario: envía la solicitud a contacto.php ----------
     contacto.php la manda por email con Resend. El destinatario y la clave
     están en el servidor (data/contacto-config.php), no en la web. */
  var form = document.getElementById('contact-form');
  var note = document.getElementById('form-note');
  function setNote(text, type) { note.textContent = text; note.className = 'form-note' + (type ? ' ' + type : ''); }
  if (form) {
    var submitBtn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var contact = form.contact.value.trim();
      var message = form.message.value.trim();
      if (!name || !contact || !message) { setNote('Por favor, rellena todos los campos.', 'err'); return; }
      var tipos = Array.prototype.map.call(form.querySelectorAll('[name="tipo"]:checked'), function (c) { return c.value; });

      submitBtn.disabled = true;
      setNote('Enviando…');
      fetch('contacto.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name: name, contact: contact, message: message, tipos: tipos, botcheck: form.botcheck.checked })
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.error);
          setNote('¡Gracias! Hemos recibido tu solicitud y te responderemos lo antes posible.', 'ok');
          form.reset();
        })
        .catch(function () {
          setNote('No se ha podido enviar. Llámanos al 96 357 01 11 o escríbenos a david@comercialtortosa.com', 'err');
        })
        .then(function () { submitBtn.disabled = false; });
    });
  }

  /* ---------- Servicios: paneles que se abren ---------- */
  var panels = document.querySelectorAll('.svc-panel');
  function openPanel(p) { panels.forEach(function (q) { q.classList.toggle('is-open', q === p); }); }
  // Al pasar el ratón solo en escritorio: en la versión apilada (≤900px) moverían el panel bajo el cursor
  var hoverMQ = window.matchMedia('(min-width: 901px) and (hover: hover)');
  panels.forEach(function (p) {
    p.addEventListener('mouseenter', function () { if (hoverMQ.matches) openPanel(p); });
    p.addEventListener('focusin', function () { openPanel(p); });
    p.addEventListener('click', function () { openPanel(p); });
  });
})();
