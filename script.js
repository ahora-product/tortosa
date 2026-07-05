/* ============================================================
   TORTOSA — comportamiento de la página
   Scroll suave (Lenis) + animaciones (GSAP) cuando están disponibles.
   Si las librerías externas no cargan, todo funciona igual sin animación.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasST = typeof window.ScrollTrigger !== 'undefined';
  var hasLenis = typeof window.Lenis !== 'undefined';

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
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
        mobileNav.hidden = true;
      });
    });
  }

  /* ---------- Cabecera: sombra, progreso y ocultar/mostrar ---------- */
  var header = document.querySelector('.site-header');
  var progress = document.querySelector('.scroll-progress');
  var lastY = window.pageYOffset;

  function onScroll() {
    var y = window.pageYOffset;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    if (header) {
      header.classList.toggle('scrolled', y > 10);
      // Ocultar al bajar, mostrar al subir (pasados los primeros 600px)
      if (y > 600 && y > lastY + 4) {
        header.classList.add('nav-hidden');
      } else if (y < lastY - 4) {
        header.classList.remove('nav-hidden');
      }
    }
    if (progress) {
      progress.style.transform = 'scaleX(' + (docH > 0 ? y / docH : 0) + ')';
    }
    lastY = y;
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

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

  /* ============================================================
     CAMINO SIN ANIMACIÓN (sin GSAP o con "reducir movimiento")
     El contenido se muestra sin esconderse y quitamos la intro.
     ============================================================ */
  if (!hasGSAP || !hasST || reduceMotion) {
    root.classList.remove('is-loading');
    // Reveal de respaldo con IntersectionObserver (aparición suave)
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealEls.length && !reduceMotion) {
      root.classList.add('gsap-on'); // reutiliza el estado oculto del CSS
      var ro = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.transition = 'opacity .8s ease, transform .8s cubic-bezier(0.22,1,0.36,1)';
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'none';
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { el.style.transform = 'translateY(22px)'; ro.observe(el); });
    }
    return;
  }

  /* ============================================================
     CAMINO CON ANIMACIÓN (GSAP + Lenis)
     ============================================================ */
  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  root.classList.add('gsap-on');

  /* ---------- Partir titulares en líneas (para revelarlos enmascarados) ---------- */
  function splitLines(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    var spans = words.map(function (w) {
      var s = document.createElement('span');
      s.style.display = 'inline-block';
      s.textContent = w;
      el.appendChild(s);
      el.appendChild(document.createTextNode(' '));
      return s;
    });
    var lines = [], current = null, top = null;
    spans.forEach(function (s) {
      var t = s.offsetTop;
      if (top === null || Math.abs(t - top) > 4) { current = []; lines.push(current); top = t; }
      current.push(s.textContent);
    });
    el.textContent = '';
    var inners = [];
    lines.forEach(function (group) {
      var line = document.createElement('span');
      line.className = 'split-line';
      line.style.display = 'block';
      line.style.overflow = 'hidden';
      var inner = document.createElement('span');
      inner.className = 'split-line-i';
      inner.style.display = 'block';
      inner.textContent = group.join(' ');
      line.appendChild(inner);
      el.appendChild(line);
      inners.push(inner);
    });
    return inners;
  }

  function start() {
    var ST = window.ScrollTrigger;

    /* ---------- Scroll suave con Lenis ---------- */
    if (hasLenis) {
      var lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
      lenis.on('scroll', ST.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);

      // Enlaces internos: desplazamiento suave con Lenis
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          var id = a.getAttribute('href');
          if (id.length < 2) return;
          var target = document.querySelector(id);
          if (!target) return;
          e.preventDefault();
          lenis.scrollTo(target, { offset: -78, duration: 1.1 });
        });
      });
    }

    /* ---------- Partir los titulares marcados ---------- */
    var splitTargets = document.querySelectorAll('[data-split], [data-split-link]');
    splitTargets.forEach(function (el) {
      var inners = splitLines(el);
      el._lines = inners;
      gsap.set(inners, { yPercent: 115 });
    });

    /* ---------- Intro + revelado del hero ---------- */
    var tl = gsap.timeline();
    var fill = document.querySelector('.preloader-bar-fill');
    var preloader = document.querySelector('.preloader');

    if (fill) { tl.to(fill, { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }); }
    if (preloader) {
      tl.to(preloader, { yPercent: -101, duration: 0.9, ease: 'power4.inOut' }, '+=0.05')
        .add(function () { root.classList.remove('is-loading'); preloader.style.display = 'none'; }, '>-0.1');
    } else {
      root.classList.remove('is-loading');
    }

    var heroLines = document.querySelectorAll('.hero-title .line-i');
    var heroMedia = document.querySelector('.hero-media .media');

    tl.to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.25')
      .fromTo(heroLines, { yPercent: 115 }, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.1 }, '<0.05')
      .to(['.hero [data-hero="lead"]', '.hero [data-hero="actions"]', '.hero [data-hero="stats"]'],
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 }, '-=0.7');

    if (heroMedia) {
      gsap.set(heroMedia, { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set('.hero-media', { opacity: 1 });
      tl.to(heroMedia, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power4.out' }, '-=1.0');
    }

    // Posición inicial de los textos del hero que entran con fade-up
    gsap.set(['.hero [data-hero="lead"]', '.hero [data-hero="actions"]', '.hero [data-hero="stats"]'], { y: 26 });
    gsap.set('.hero-eyebrow', { y: 18 });

    /* ---------- Revelado genérico de bloques (.reveal) al hacer scroll ---------- */
    gsap.utils.toArray('.reveal').forEach(function (el) {
      gsap.set(el, { y: 40 });
      ST.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: function () {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' });
        }
      });
    });

    /* ---------- Titulares: revelar líneas enmascaradas al entrar ---------- */
    splitTargets.forEach(function (el) {
      if (!el._lines) return;
      ST.create({
        trigger: el,
        start: 'top 86%',
        once: true,
        onEnter: function () {
          gsap.to(el._lines, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.08 });
        }
      });
    });

    /* ---------- Imágenes con barrido (curtain) al entrar ---------- */
    gsap.utils.toArray('.section .media, .fachadas .media').forEach(function (m) {
      gsap.set(m, { clipPath: 'inset(0% 0% 100% 0%)' });
      ST.create({
        trigger: m,
        start: 'top 90%',
        once: true,
        onEnter: function () {
          gsap.to(m, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power4.out' });
        }
      });
    });

    /* ---------- Parallax suave en imágenes marcadas ---------- */
    gsap.utils.toArray('[data-parallax] img').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    /* ---------- Contadores numéricos ---------- */
    gsap.utils.toArray('[data-count]').forEach(function (el) {
      var end = parseFloat(el.getAttribute('data-count')) || 0;
      var pre = el.getAttribute('data-prefix') || '';
      var suf = el.getAttribute('data-suffix') || '';
      var obj = { v: 0 };
      ST.create({
        trigger: el, start: 'top 92%', once: true,
        onEnter: function () {
          gsap.to(obj, {
            v: end, duration: 1.4, ease: 'power2.out',
            onUpdate: function () { el.textContent = pre + Math.round(obj.v) + suf; }
          });
        }
      });
    });

    /* ---------- Botones magnéticos (solo con ratón fino) ---------- */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
        var xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' });
        var yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' });
        btn.addEventListener('mousemove', function (e) {
          var r = btn.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
        });
        btn.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
      });
    }

    ST.refresh();
  }

  // Esperamos a que la tipografía esté lista para medir bien las líneas
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start);
  } else {
    window.addEventListener('load', start);
  }
})();
