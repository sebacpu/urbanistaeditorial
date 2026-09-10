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

  // Ilustraciones papercraft por capas. Cada capa es un <div class="pop-layer">
  // con su propio SVG apilado, porque los transforms 3D no funcionan sobre
  // grupos internos de un SVG — solo sobre elementos HTML.
  const POP = {
    lec: [
      `<rect x="60" y="240" width="240" height="26" fill="#0B0C0E" rx="4"/>`,
      `<g transform="rotate(-24 180 240)"><rect x="140" y="120" width="80" height="120" fill="#F2EEE3" stroke="#0B0C0E" stroke-width="5" rx="4"/><line x1="155" y1="150" x2="205" y2="150" stroke="#0B0C0E" stroke-width="4"/><line x1="155" y1="170" x2="205" y2="170" stroke="#0B0C0E" stroke-width="4"/></g>
       <g transform="rotate(24 180 240)"><rect x="140" y="120" width="80" height="120" fill="#F2EEE3" stroke="#0B0C0E" stroke-width="5" rx="4"/><line x1="155" y1="150" x2="205" y2="150" stroke="#0B0C0E" stroke-width="4"/><line x1="155" y1="170" x2="205" y2="170" stroke="#0B0C0E" stroke-width="4"/></g>`,
      `<g transform="rotate(-12 180 240)"><rect x="140" y="105" width="80" height="135" fill="#006DFE" stroke="#0B0C0E" stroke-width="5" rx="4"/></g>
       <g transform="rotate(12 180 240)"><rect x="140" y="105" width="80" height="135" fill="#FFCC00" stroke="#0B0C0E" stroke-width="5" rx="4"/></g>`,
      `<rect x="140" y="90" width="80" height="150" fill="#fff" stroke="#0B0C0E" stroke-width="5" rx="4"/>
       <line x1="155" y1="120" x2="205" y2="120" stroke="#0B0C0E" stroke-width="4"/>
       <line x1="155" y1="140" x2="205" y2="140" stroke="#0B0C0E" stroke-width="4"/>
       <line x1="155" y1="160" x2="190" y2="160" stroke="#0B0C0E" stroke-width="4"/>
       <circle cx="180" cy="205" r="16" fill="none" stroke="#E0342B" stroke-width="5"/>`,
      `<rect x="120" y="46" width="120" height="34" fill="#0B0C0E" rx="4"/>
       <text x="180" y="70" text-anchor="middle" fill="#FFCC00" font-family="'IBM Plex Mono',monospace" font-weight="600" font-size="15" letter-spacing="4">LEÍDO ✓</text>`
    ],

    est: [
      `<rect x="50" y="150" width="260" height="110" fill="#fff" stroke="#0B0C0E" stroke-width="5" rx="4" transform="rotate(-2 180 205)"/>
       <g stroke="#0B0C0E" stroke-width="4" opacity=".65" stroke-linecap="round">
         <line x1="75" y1="180" x2="290" y2="176"/>
         <line x1="75" y1="202" x2="260" y2="198"/>
         <line x1="75" y1="224" x2="285" y2="220"/>
       </g>`,
      `<path d="M75 192 C 130 178, 200 208, 290 188" fill="none" stroke="#E0342B" stroke-width="6" stroke-linecap="round"/>
       <path d="M180 214 C 195 204, 213 204, 226 213" fill="none" stroke="#E0342B" stroke-width="5" stroke-linecap="round"/>`,
      `<g transform="rotate(-38 265 130)">
         <rect x="240" y="40" width="26" height="150" fill="#E0342B" stroke="#0B0C0E" stroke-width="5" rx="3"/>
         <polygon points="240,190 266,190 253,215" fill="#F2EEE3" stroke="#0B0C0E" stroke-width="5"/>
         <rect x="240" y="40" width="26" height="22" fill="#0B0C0E"/>
       </g>`,
      `<rect x="60" y="52" width="170" height="34" fill="#FFCC00" stroke="#0B0C0E" stroke-width="4" rx="4" transform="rotate(-3 145 69)"/>
       <text x="145" y="76" text-anchor="middle" fill="#0B0C0E" font-family="'IBM Plex Mono',monospace" font-weight="600" font-size="14" letter-spacing="2" transform="rotate(-3 145 69)">MÁS RITMO AQUÍ</text>`
    ],

    ort: [
      `<rect x="55" y="120" width="250" height="140" fill="#fff" stroke="#0B0C0E" stroke-width="5" rx="4"/>
       <g fill="#0B0C0E" font-family="'IBM Plex Mono',monospace" font-size="17">
         <text x="75" y="155">la ciudad qeu</text>
         <text x="75" y="185">nos escribe ,</text>
         <text x="75" y="215">tambien lee.</text>
       </g>
       <g stroke="#E0342B" stroke-width="4" fill="none" stroke-linecap="round">
         <path d="M162 160 l 32 0" transform="rotate(-6 178 160)"/>
         <circle cx="196" cy="180" r="12"/>
         <path d="M74 220 l 74 0"/>
       </g>`,
      `<g transform="rotate(14 230 170)">
         <circle cx="215" cy="150" r="52" fill="rgba(0,109,254,.14)" stroke="#0B0C0E" stroke-width="7"/>
         <circle cx="215" cy="150" r="52" fill="none" stroke="#006DFE" stroke-width="3"/>
         <rect x="252" y="192" width="16" height="66" fill="#FFCC00" stroke="#0B0C0E" stroke-width="5" rx="6" transform="rotate(-45 260 200)"/>
       </g>`,
      `<rect x="95" y="46" width="170" height="34" fill="#0B0C0E" rx="4"/>
       <text x="180" y="70" text-anchor="middle" fill="#F2EEE3" font-family="'IBM Plex Mono',monospace" font-weight="600" font-size="14" letter-spacing="3">CERO ERRATAS</text>`
    ],

    dia: [
      `<rect x="60" y="245" width="240" height="18" fill="#0B0C0E" rx="4"/>`,
      `<g stroke="#0B0C0E" stroke-width="5" stroke-linejoin="round">
         <polygon points="70,245 110,110 150,245" fill="#F2EEE3"/>
         <polygon points="110,110 150,245 190,110" fill="#fff"/>
         <polygon points="150,245 190,110 230,245" fill="#F2EEE3"/>
         <polygon points="190,110 230,245 270,110" fill="#fff"/>
         <polygon points="230,245 270,110 290,245" fill="#FFCC00"/>
       </g>
       <g stroke="#0B0C0E" stroke-width="3" opacity=".5">
         <line x1="100" y1="160" x2="120" y2="160"/><line x1="97" y1="180" x2="125" y2="180"/>
         <line x1="175" y1="160" x2="205" y2="160"/><line x1="172" y1="180" x2="208" y2="180"/>
       </g>`,
      `<g transform="rotate(3 285 90)">
         <rect x="245" y="55" width="84" height="52" fill="#006DFE" stroke="#0B0C0E" stroke-width="5" rx="4"/>
         <line x1="258" y1="72" x2="316" y2="72" stroke="#fff" stroke-width="4"/>
         <line x1="258" y1="86" x2="300" y2="86" stroke="#FFCC00" stroke-width="4"/>
       </g>`,
      `<rect x="60" y="46" width="160" height="34" fill="#FFCC00" stroke="#0B0C0E" stroke-width="4" rx="4"/>
       <text x="140" y="70" text-anchor="middle" fill="#0B0C0E" font-family="'IBM Plex Mono',monospace" font-weight="600" font-size="14" letter-spacing="2">RETÍCULA VIVA</text>`
    ],

    men: [
      `<rect x="70" y="230" width="220" height="30" fill="#FFCC00" stroke="#0B0C0E" stroke-width="5" rx="6"/>
       <rect x="85" y="258" width="14" height="20" fill="#0B0C0E"/>
       <rect x="261" y="258" width="14" height="20" fill="#0B0C0E"/>`,
      `<g stroke="#0B0C0E" stroke-width="5" stroke-linejoin="round">
         <circle cx="128" cy="140" r="26" fill="#fff"/>
         <path d="M100 235 C 100 185, 156 185, 156 235 Z" fill="#006DFE"/>
       </g>
       <g stroke="#0B0C0E" stroke-width="5" stroke-linejoin="round">
         <circle cx="232" cy="140" r="26" fill="#fff"/>
         <path d="M204 235 C 204 185, 260 185, 260 235 Z" fill="#0B0C0E"/>
       </g>`,
      `<g transform="rotate(-4 180 96)">
         <rect x="150" y="78" width="60" height="40" fill="#fff" stroke="#0B0C0E" stroke-width="5" rx="6"/>
         <polygon points="170,118 186,118 174,132" fill="#fff" stroke="#0B0C0E" stroke-width="5"/>
         <line x1="162" y1="92" x2="198" y2="92" stroke="#0B0C0E" stroke-width="4"/>
         <line x1="162" y1="104" x2="188" y2="104" stroke="#0B0C0E" stroke-width="4"/>
       </g>`,
      `<rect x="105" y="30" width="150" height="34" fill="#0B0C0E" rx="4"/>
       <text x="180" y="54" text-anchor="middle" fill="#FFCC00" font-family="'IBM Plex Mono',monospace" font-weight="600" font-size="14" letter-spacing="2">UNO A UNO</text>`
    ]
  };

  const SERVICIOS = [
    {
      codigo: 'SERVICIO #01',
      titulo: 'Informe de lectura',
      desc: 'Una lectura profesional de tu manuscrito en la que evaluamos distintos aspectos. Estructura, ritmo, coherencia narrativa, potencial editorial. ¡Te devolvemos todo en un informe!',
      pop: 'lec',
      cta: 'Cotizar este servicio'
    },
    {
      codigo: 'SERVICIO #02',
      titulo: 'Corrección de estilo',
      desc: 'Una revisión en la que afinamos y fortalecemos tu estilo de escritura sin perder de vista tu esencia como creativ@. Estudiamos el ritmo de tu historia y las palabras con las que decidiste contarla.',
      pop: 'est',
      cta: 'Cotizar este servicio'
    },
    {
      codigo: 'SERVICIO #03',
      titulo: 'Corrección ortotipográfica',
      desc: 'Una revisión en la que cazamos errores de ortografía, tildes, puntuación, mayúsculas y detalles que pudiste pasar por alto. No tocamos ni el ritmo, ni las frases.',
      pop: 'ort',
      cta: 'Cotizar este servicio'
    },
    {
      codigo: 'SERVICIO #04',
      titulo: 'Diagramación editorial',
      desc: '¡Diseñamos la presentación de tu manuscrito! Tipografía, interlineado, márgenes. Queremos que el espíritu de tu obra se transmita en los detalles grandes y pequeños.',
      pop: 'dia',
      cta: 'Cotizar este servicio'
    },
    {
      codigo: 'SERVICIO #05',
      titulo: 'Mentorías personalizadas',
      desc: 'Todo/a creativ@ tiene sus dudas. Coordinamos una sesión 1:1 para resolver justo lo que necesitas. ¿Por dónde empezar? ¡Dayummm, no salgo del primer capítulo! ¿Cómo funciona el proceso editorial? ¿Cómo estructuro mi obra?',
      pop: 'men',
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
      const capas = POP[s.pop]
        .map((c) => `<div class="pop-layer"><svg viewBox="0 0 360 300" aria-hidden="true">${c}</svg></div>`)
        .join('');
      escenario.innerHTML = `<div class="popup">${capas}</div>`;
      folio.textContent = `pág. ${i + 1} de ${SERVICIOS.length}`;
      btnPrev.disabled = i === 0;
      btnNext.disabled = i === SERVICIOS.length - 1;

      // armar el pop-up en cascada: forzar reflow para fijar el estado
      // inicial de las capas antes de disparar la transición
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
     CONTACTO: campos extra al publicar manuscrito
  ========================================================== */
  const motivo = document.getElementById('c-motivo');
  const manuscritoFields = document.querySelector('[data-manuscrito-fields]');

  if (motivo && manuscritoFields) {
    const extras = manuscritoFields.querySelectorAll('input, textarea');
    const syncManuscrito = () => {
      const show = motivo.value === 'manuscrito';
      manuscritoFields.hidden = !show;
      extras.forEach((el) => {
        el.disabled = !show;
        el.required = show;
      });
    };
    motivo.addEventListener('change', syncManuscrito);
    syncManuscrito();
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
