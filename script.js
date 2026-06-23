/* ============================================================
   TORTOSA — comportamiento de la página
   JavaScript sencillo, sin librerías. Funciona abriendo index.html.
   ============================================================ */
(function () {
  'use strict';

  // Marca que hay JS activo (para las animaciones de aparición)
  document.documentElement.classList.add('js');

  /* ---------- Año actual en el pie ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---------- Menú móvil ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Abrir menú' : 'Cerrar menú');
      mobileNav.hidden = open;
    });
    // Al pulsar un enlace, se cierra el menú
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
        mobileNav.hidden = true;
      });
    });
  }

  /* ---------- Sombra de la cabecera al hacer scroll ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Animación de aparición de secciones ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Resaltar el apartado activo en el menú ---------- */
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.main-nav a');
  if ('IntersectionObserver' in window && sections.length && navLinks.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Formulario de contacto ----------
     Sin servidor, el formulario abre el correo del visitante con el
     mensaje ya escrito hacia david@comercialtortosa.com.
     (Para recibirlo automáticamente sin abrir el correo, ver README:
      se puede conectar con Formspree en 1 línea.)
  ------------------------------------------------------------------ */
  var form = document.getElementById('contact-form');
  var note = document.getElementById('form-note');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var contact = form.contact.value.trim();
      var message = form.message.value.trim();

      if (!name || !contact || !message) {
        if (note) { note.textContent = 'Por favor, rellena todos los campos.'; note.className = 'form-note err'; }
        return;
      }

      var subject = 'Solicitud de presupuesto — ' + name;
      var body = 'Nombre: ' + name + '\n' +
                 'Contacto: ' + contact + '\n\n' +
                 'Mensaje:\n' + message;
      var mailto = 'mailto:david@comercialtortosa.com' +
                   '?subject=' + encodeURIComponent(subject) +
                   '&body=' + encodeURIComponent(body);

      window.location.href = mailto;
      if (note) { note.textContent = 'Abriendo tu correo… si no se abre, escríbenos a david@comercialtortosa.com'; note.className = 'form-note ok'; }
      form.reset();
    });
  }
})();
