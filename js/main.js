/* ═══════════════════════════════════════════════════════════════
   WONDERLOGO — main.js
   ═══════════════════════════════════════════════════════════════ */

/* ─── PRELOADER (solo home) ──────────────────────────────────────── */
(function initPreloader() {
  const hide = () => {
    const pre = document.getElementById('pre');
    if (!pre || pre.dataset.done) return;
    pre.dataset.done = '1';
    setTimeout(() => {
      pre.classList.add('out');
      setTimeout(() => { pre.style.display = 'none'; }, 680);
    }, 2200);
  };
  // Non dipendere da 'load' (può non scattare se una risorsa è lenta/bloccata)
  if (document.readyState !== 'loading') hide();
  else document.addEventListener('DOMContentLoaded', hide);
  // Rete di sicurezza assoluta
  setTimeout(hide, 5000);
})();

/* ─── PAGE HERO — ingresso (pagine interne) ──────────────────────── */
(function initPageHero() {
  const title = document.querySelector('.page-hero-title');
  if (!title || typeof gsap === 'undefined') return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.page-hero-line', { scaleX: 0, transformOrigin: 'left', duration: .6 })
    .from('.page-hero-title', { y: 50, opacity: 0, duration: .9 }, '-=.2')
    .from('.page-hero-sub',   { y: 30, opacity: 0, duration: .7 }, '-=.5')
    .from('.breadcrumb',      { y: 20, opacity: 0, duration: .6 }, '-=.4')
    .from('.page-hero-deco',  { opacity: 0, scale: .9, duration: 1.2 }, 0);
})();

/* ─── CAROSELLO VIDEO HERO ───────────────────────────────────────
   👉 Metti qui i tuoi video: il PRIMO della lista = il più bello,
      viene mostrato per primo appena si atterra sul sito.
      Tutti i video partono in automatico e SENZA AUDIO (muted).
      Converti i .mov in .mp4 web e mettili nella cartella video/.
      (Vedi video/LEGGIMI-VIDEO.md per il comando di conversione.)        */
const HERO_VIDEOS = [
  'video/c0035.mp4',   // ⭐ taglio arancione su rosso — il più dinamico, per primo
  'video/c0033.mp4',   // stampante Fujifilm flatbed (brand + colore)
  'video/c0036.mp4',   // macro testa di taglio con laser rosso
  'video/c0032.mp4',   // plotter che stampa pannelli colorati
  'video/c0034.mp4',   // fresa/intaglio arancione, vista larga
  'video/c0031.mp4',   // plotter a bobina
];

(function initHeroCarousel() {
  const media = document.getElementById('heroMedia');
  if (!media) return;

  const list = (window.HERO_VIDEOS || HERO_VIDEOS).filter(Boolean);
  if (!list.length) return;            // niente video → resta lo sfondo blob

  const dotsWrap = document.getElementById('heroDots');
  const prevBtn  = document.getElementById('heroPrev');
  const nextBtn  = document.getElementById('heroNext');
  const single   = list.length === 1;

  /* Crea i <video> (muted = senza audio, autoplay anche su mobile) */
  const videos = list.map((src, i) => {
    const v = document.createElement('video');
    v.src         = src;
    v.muted       = true;
    v.defaultMuted = true;
    v.loop        = single;            // se è uno solo, va in loop
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.preload     = i === 0 ? 'auto' : 'metadata';
    v.poster      = 'images/logo-rilievo.jpg';
    media.appendChild(v);
    return v;
  });

  /* Crea i dot (solo se più di un video) */
  const dots = [];
  if (dotsWrap && !single) {
    list.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Video ' + (i + 1));
      b.addEventListener('click', () => go(i, true));
      dotsWrap.appendChild(b);
      dots.push(b);
    });
  } else if (dotsWrap) {
    dotsWrap.style.display = 'none';
  }
  if (single && prevBtn) prevBtn.style.display = 'none';
  if (single && nextBtn) nextBtn.style.display = 'none';

  let idx = 0;
  let userPaused = false;

  function show(i) {
    videos.forEach((v, k) => {
      const active = k === i;
      v.classList.toggle('is-active', active);
      if (active) {
        try { v.currentTime = 0; } catch (e) {}
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      } else {
        v.pause();
      }
    });
    dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
  }

  function go(i, fromUser) {
    idx = (i + videos.length) % videos.length;
    if (fromUser) userPaused = false;
    show(idx);
  }

  const next = () => go(idx + 1);
  const prev = () => go(idx - 1);

  /* Avanza quando il video corrente finisce (se non è in loop) */
  if (!single) {
    videos.forEach((v, k) => {
      v.addEventListener('ended', () => { if (k === idx) next(); });
      /* Sicurezza: se un video non parte/non ha durata, passa oltre */
      v.addEventListener('error', () => { if (k === idx) next(); });
    });
    nextBtn && nextBtn.addEventListener('click', () => go(idx + 1, true));
    prevBtn && prevBtn.addEventListener('click', () => go(idx - 1, true));

    /* Avanzamento automatico di sicurezza (clip lunghe o senza evento ended) */
    setInterval(() => {
      const v = videos[idx];
      if (!userPaused && v && v.duration && v.currentTime >= v.duration - 0.3) next();
    }, 1000);
  }

  /* Pausa il carosello quando la hero non è visibile (risparmio risorse) */
  const hero = document.getElementById('hero');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(en => {
        const v = videos[idx];
        if (!v) return;
        if (en.isIntersecting) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
        else v.pause();
      });
    }, { threshold: 0.15 }).observe(hero);
  }

  show(0);
})();

/* ─── CURSORE CUSTOM ─────────────────────────────────────────────── */
(function initCursor() {
  const cur  = document.getElementById('cur');
  const ring = document.getElementById('cur-ring');
  if (!cur || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
  });

  (function animRing() {
    rx += (mx - rx) * .12;
    ry += (my - ry) * .12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  document.querySelectorAll('a, button, .srv-card, .pc, .mc, .vc, .tc').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('big'));
    el.addEventListener('mouseleave', () => cur.classList.remove('big'));
  });
})();

/* ─── BARRA SCROLL ───────────────────────────────────────────────── */
(function initScrollBar() {
  const bar = document.getElementById('bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - innerHeight) * 100;
    bar.style.width = pct + '%';
  }, { passive: true });
})();

/* ─── NAVBAR SCROLL ──────────────────────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

/* ─── MENU MOBILE ────────────────────────────────────────────────── */
(function initMobileMenu() {
  const mob  = document.getElementById('mob');
  const burg = document.getElementById('burger');
  if (!mob || !burg) return;

  let open = false;

  function toggle() {
    open = !open;
    mob.classList.toggle('open', open);
    burg.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  function close() {
    open = false;
    mob.classList.remove('open');
    burg.classList.remove('open');
    document.body.style.overflow = '';
  }

  burg.addEventListener('click', toggle);

  document.querySelectorAll('[data-close-mob]').forEach(el => {
    el.addEventListener('click', close);
  });
})();

/* ─── SMOOTH SCROLL ──────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ─── PARALLAX BLOBS ─────────────────────────────────────────────── */
(function initParallax() {
  const blobs = document.querySelectorAll('.blob');
  if (!blobs.length) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    blobs[0] && (blobs[0].style.transform = `translateY(${y * .22}px)`);
    blobs[1] && (blobs[1].style.transform = `translateY(${y * .13}px)`);
    blobs[2] && (blobs[2].style.transform = `translateY(${y * .32}px)`);
  }, { passive: true });
})();

/* ─── SCROLL REVEAL ──────────────────────────────────────────────── */
(function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('on');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.rv, .rvl, .rvr').forEach(el => obs.observe(el));
})();

/* ─── CONTATORI ANIMATI ──────────────────────────────────────────── */
(function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el     = en.target;
      const target = +el.dataset.t;
      const dur    = 2000;
      const start  = performance.now();

      (function step(now) {
        const progress = Math.min((now - start) / dur, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      })(start);

      obs.unobserve(el);
    });
  }, { threshold: 0.55 });

  document.querySelectorAll('.cnt').forEach(el => obs.observe(el));
})();

/* ─── 3D CARD TILT ───────────────────────────────────────────────── */
(function initTilt() {
  document.querySelectorAll('.srv-card, .pc').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `perspective(850px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-9px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ─── MAGNETIC BUTTONS ───────────────────────────────────────────── */
(function initMagnetic() {
  document.querySelectorAll('.btn, .nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * .26;
      const y = (e.clientY - r.top  - r.height / 2) * .26;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ─── IMG FALLBACK (se una foto in images/ non c'è ancora) ──────── */
(function initImgFallback() {
  // placeholder grigio inline (SVG) — niente immagine rotta
  const ph = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='700' height='500'%3E%3Crect width='700' height='500' fill='%231a1a1a'/%3E%3Cg fill='none' stroke='%23c8d400' stroke-opacity='.35' stroke-width='2'%3E%3Crect x='280' y='200' width='140' height='100' rx='8'/%3E%3Ccircle cx='320' cy='235' r='12'/%3E%3Cpath d='M295 295l35-35 25 25 30-25 35 35'/%3E%3C/g%3E%3Ctext x='350' y='340' fill='%23c8d400' fill-opacity='.4' font-family='sans-serif' font-size='15' text-anchor='middle'%3EFoto in arrivo%3C/text%3E%3C/svg%3E";
  document.querySelectorAll('img[src^="images/"]').forEach(img => {
    if (img.classList.contains('logo-img')) return; // il logo ha già il suo fallback
    img.addEventListener('error', () => {
      if (img.dataset.fb) return;
      img.dataset.fb = '1';
      img.src = ph;
    });
  });
})();

/* ─── LOGO FALLBACK (se logo.png non ancora presente) ───────────── */
(function initLogoFallback() {
  document.querySelectorAll('.logo-img').forEach(img => {
    img.addEventListener('error', () => {
      img.style.display = 'none';

      const isMob    = img.classList.contains('logo-img--mob');
      const isFooter = img.classList.contains('logo-img--footer');
      const size     = isFooter ? '2rem' : isMob ? '2.2rem' : '1.6rem';

      const span = document.createElement('span');
      span.style.cssText = [
        `font-family:'Fredoka',sans-serif`,
        `font-size:${size}`,
        `font-weight:700`,
        `color:#f2efe8`,
        `letter-spacing:-.01em`,
        `display:block`,
        isFooter ? 'margin-bottom:13px' : '',
        isMob    ? 'margin-bottom:36px' : '',
      ].filter(Boolean).join(';');

      span.innerHTML = 'Wonder<em style="color:#c8d400;font-style:normal">Logo</em>';
      img.parentElement.appendChild(span);
    });
  });
})();
