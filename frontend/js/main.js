/* ============================================================
   URBANISTA EDITORIAL — interacción
   Galería rotativa del hero · Libro pop-up de servicios ·
   Navegación mobile · Formularios demo
============================================================ */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ==========================================================
     NAVEGACIÓN MOBILE
  ========================================================== */
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('nav-list');

  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const abierta = navList.classList.toggle('is-abierta');
      navToggle.setAttribute('aria-expanded', String(abierta));
    });
    navList.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        navList.classList.remove('is-abierta');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ==========================================================
     GALERÍA ROTATIVA DEL HERO
  ========================================================== */
  const galeria = document.querySelector('.galeria');

  if (galeria) {
    const slides = Array.from(galeria.querySelectorAll('[data-slide]'));
    const dotsWrap = galeria.querySelector('.galeria__dots');
    const btnPrev = galeria.querySelector('.galeria__flecha--prev');
    const btnNext = galeria.querySelector('.galeria__flecha--next');
    const INTERVALO = 4500;
    let actual = 0;
    let timer = null;

    // dots (diamantes)
    const dots = slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'galeria__dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ir a imagen ${i + 1} de ${slides.length}`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => { irA(i); reiniciar(); });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function irA(i) {
      actual = (i + slides.length) % slides.length;
      slides.forEach((s, j) => s.classList.toggle('is-activa', j === actual));
      dots.forEach((d, j) => d.setAttribute('aria-selected', String(j === actual)));
    }

    function avanzar() { irA(actual + 1); }

    function iniciar() {
      if (reduceMotion.matches || timer) return;
      timer = setInterval(avanzar, INTERVALO);
    }
    function detener() {
      clearInterval(timer);
      timer = null;
    }
    function reiniciar() { detener(); iniciar(); }

    btnNext.addEventListener('click', () => { irA(actual + 1); reiniciar(); });
    btnPrev.addEventListener('click', () => { irA(actual - 1); reiniciar(); });

    // pausa al hacer hover o al enfocar con teclado
    galeria.addEventListener('mouseenter', detener);
    galeria.addEventListener('mouseleave', iniciar);
    galeria.addEventListener('focusin', detener);
    galeria.addEventListener('focusout', iniciar);

    // pausa cuando la pestaña no está visible
    document.addEventListener('visibilitychange', () => {
      document.hidden ? detener() : iniciar();
    });

    iniciar();
  }

  /* ==========================================================
     LIBRO POP-UP DE SERVICIOS
  ========================================================== */

  const SERVICIOS = [
    {
      codigo: 'SERVICIO #01',
      titulo: 'Informe de lectura',
      desc: 'Una lectura profesional de tu manuscrito en la que evaluamos distintos aspectos. Estructura, ritmo, coherencia narrativa, potencial editorial. ¡Te devolvemos todo en un informe!',
      img: 'img/servicios/01-informe-de-lectura.png',
      cta: 'Cotizar este servicio'
    },
    {
      codigo: 'SERVICIO #02',
      titulo: 'Corrección de estilo',
      desc: 'Una revisión en la que afinamos y fortalecemos tu estilo de escritura sin perder de vista tu esencia como creativ@. Estudiamos el ritmo de tu historia y las palabras con las que decidiste contarla.',
      img: 'img/servicios/02-correccion-de-estilo.png',
      cta: 'Cotizar este servicio'
    },
    {
      codigo: 'SERVICIO #03',
      titulo: 'Corrección ortotipográfica',
      desc: 'Una revisión en la que cazamos errores de ortografía, tildes, puntuación, mayúsculas y detalles que pudiste pasar por alto. No tocamos ni el ritmo, ni las frases.',
      img: 'img/servicios/03-correccion-ortotipografica.png',
      cta: 'Cotizar este servicio'
    },
    {
      codigo: 'SERVICIO #04',
      titulo: 'Diagramación editorial',
      desc: '¡Diseñamos la presentación de tu manuscrito! Tipografía, interlineado, márgenes. Queremos que el espíritu de tu obra se transmita en los detalles grandes y pequeños.',
      img: 'img/servicios/04-diagramacion-editorial.png',
      cta: 'Cotizar este servicio'
    },
    {
      codigo: 'SERVICIO #05',
      titulo: 'Mentorías personalizadas',
      desc: 'Todo/a creativ@ tiene sus dudas. Coordinamos una sesión 1:1 para resolver justo lo que necesitas. ¿Por dónde empezar? ¡Dayummm, no salgo del primer capítulo! ¿Cómo funciona el proceso editorial? ¿Cómo estructuro mi obra?',
      img: 'img/servicios/05-mentorias-personalizadas.png',
      cta: 'Cotizar este servicio'
    }
  ];

  const libro = document.getElementById('libro');

  if (libro) {
    const infoCodigo = libro.querySelector('[data-info-codigo]');
    const infoTitulo = libro.querySelector('[data-info-titulo]');
    const infoDesc = libro.querySelector('[data-info-desc]');
    const infoCta = libro.querySelector('[data-info-cta]');
    const escenario = libro.querySelector('[data-escenario]');
    const hoja = libro.querySelector('[data-hoja]');
    const folio = document.querySelector('[data-folio]');
    const btnPrev = document.querySelector('[data-libro-prev]');
    const btnNext = document.querySelector('[data-libro-next]');

    let pagina = 0;
    let girando = false;
    let giroToken = 0;

    function pintar(i, armar = true) {
      const s = SERVICIOS[i];
      infoCodigo.textContent = s.codigo;
      infoTitulo.textContent = s.titulo;
      infoDesc.textContent = s.desc;
      infoCta.textContent = s.cta;
      escenario.innerHTML = `<div class="popup"><div class="pop-layer"><img class="popup__img" src="${s.img}" alt="${s.titulo}"></div></div>`;
      folio.textContent = `pág. ${i + 1} de ${SERVICIOS.length}`;
      btnPrev.disabled = i === 0;
      btnNext.disabled = i === SERVICIOS.length - 1;

      // armar el pop-up: forzar reflow para fijar el estado
      // inicial antes de disparar la transición
      const popup = escenario.querySelector('.popup');
      void popup.offsetWidth;
      if (armar) popup.classList.add('is-armado');
    }

    function irAPagina(destino) {
      if (girando) return;
      if (destino < 0 || destino >= SERVICIOS.length || destino === pagina) return;

      const adelante = destino > pagina;
      pagina = destino;

      // sin animación de hoja si el usuario prefiere menos movimiento
      // o si estamos en el layout apilado de mobile
      const hojaVisible = !reduceMotion.matches &&
        window.matchMedia('(min-width: 961px)').matches;

      if (!hojaVisible) {
        libro.classList.add('is-cambiando');
        setTimeout(() => {
          pintar(pagina);
          libro.classList.remove('is-cambiando');
        }, 260);
        return;
      }

      girando = true;
      const token = ++giroToken;
      hoja.classList.add('is-girando', adelante ? 'libro__hoja--adelante' : 'libro__hoja--atras');

      // el contenido cambia a mitad del giro, cuando la hoja tapa la página
      setTimeout(() => {
        libro.classList.add('is-cambiando');
        setTimeout(() => {
          pintar(pagina);
          libro.classList.remove('is-cambiando');
        }, 40);
      }, 300);

      // cierre del giro: animationend, con timeout de respaldo por si la
      // animación no corre (pestaña oculta, interrupciones)
      const finGiro = () => {
        if (token !== giroToken) return;
        hoja.classList.remove('is-girando', 'libro__hoja--adelante', 'libro__hoja--atras');
        girando = false;
      };
      hoja.addEventListener('animationend', finGiro, { once: true });
      setTimeout(finGiro, 900);
    }

    btnNext.addEventListener('click', () => irAPagina(pagina + 1));
    btnPrev.addEventListener('click', () => irAPagina(pagina - 1));

    // teclado: flechas cuando el libro (o sus controles) tienen foco
    libro.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); irAPagina(pagina + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); irAPagina(pagina - 1); }
    });

    // swipe horizontal en mobile
    let toqueX = null, toqueY = null;
    libro.addEventListener('touchstart', (e) => {
      toqueX = e.touches[0].clientX;
      toqueY = e.touches[0].clientY;
    }, { passive: true });
    libro.addEventListener('touchend', (e) => {
      if (toqueX === null) return;
      const dx = e.changedTouches[0].clientX - toqueX;
      const dy = e.changedTouches[0].clientY - toqueY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        irAPagina(dx < 0 ? pagina + 1 : pagina - 1);
      }
      toqueX = toqueY = null;
    }, { passive: true });

    // clic en el borde derecho/izquierdo de la página (escritorio)
    libro.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      const rect = libro.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      if (x > 0.86) irAPagina(pagina + 1);
      else if (x < 0.14) irAPagina(pagina - 1);
    });

    // el pop-up de la primera página se arma cuando el libro entra en pantalla
    const params = new URLSearchParams(location.search);
    const DEBUG_POP = params.get('debug') === 'pop';
    if (DEBUG_POP) pagina = Math.min(SERVICIOS.length - 1, parseInt(params.get('pag') || '0', 10) || 0);
    pintar(pagina, DEBUG_POP);
    if (!DEBUG_POP) {
      const obs = new IntersectionObserver((entradas) => {
        entradas.forEach((en) => {
          if (en.isIntersecting) {
            escenario.querySelector('.popup').classList.add('is-armado');
            obs.disconnect();
          }
        });
      }, { threshold: 0.35 });
      obs.observe(libro);
    } else {
      // modo debug (solo desarrollo): capas armadas sin transición
      const st = document.createElement('style');
      st.textContent = '.pop-layer{transition:none !important}';
      document.head.appendChild(st);
    }
  }

  /* ==========================================================
     CONTACTO: nombre del archivo adjunto
  ========================================================== */
  const archivo = document.getElementById('c-obra');
  const archivoNombre = document.querySelector('[data-archivo-nombre]');
  if (archivo && archivoNombre) {
    archivo.addEventListener('change', () => {
      archivoNombre.textContent = archivo.files[0]
        ? archivo.files[0].name
        : 'Ningún archivo seleccionado';
    });
  }

  /* ==========================================================
     FORMULARIOS DEMO (sin backend todavía)
     TODO: conectar a Formspree / Mailchimp / correo real.
  ========================================================== */
  document.querySelectorAll('[data-demo-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = form.parentElement.querySelector('[data-demo-msg]') ||
        form.querySelector('[data-demo-msg]');
      if (msg) {
        msg.textContent = 'Demo visual: este formulario aún no envía datos. Falta conectar el backend (Formspree o similar).';
      }
    });
  });

})();
