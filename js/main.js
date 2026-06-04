/* ═══════════════════════════════════════════════════════════════
   WONDERLOGO — main.js
   ═══════════════════════════════════════════════════════════════ */

/* ─── PRELOADER (solo home) ──────────────────────────────────────── */
window.addEventListener('load', () => {
  const pre = document.getElementById('pre');
  if (!pre) return;
  setTimeout(() => {
    pre.classList.add('out');
    setTimeout(() => { pre.style.display = 'none'; }, 680);
  }, 2200);
});

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

/* ─── CANVAS — PLACEHOLDER VIDEO HERO ───────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* Palette brand */
  const COLORS = ['#1d6b4a', '#c8d400', '#664470', '#3a3246', '#f2efe8'];

  /* Ridimensiona canvas — usa window per evitare layout shift */
  function resize() {
    const hero    = canvas.closest('#hero') || canvas.parentElement;
    canvas.width  = hero ? hero.offsetWidth  : window.innerWidth;
    canvas.height = hero ? hero.offsetHeight : window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => {
    resize();
    /* Rimanda le particelle dentro i nuovi confini */
    particles.forEach(p => {
      p.x = Math.min(p.x, canvas.width);
      p.y = Math.min(p.y, canvas.height);
    });
  });

  /* Particelle */
  const PARTICLE_COUNT = 90;
  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x:     Math.random() * canvas.width,
    y:     Math.random() * canvas.height,
    vx:    (Math.random() - .5) * .65,
    vy:    (Math.random() - .5) * .65,
    r:     Math.random() * 2.2 + .8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: Math.random() * .55 + .1,
  }));

  /* ─── Loop di disegno ─────────────────────────────────────────── */
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Linee di connessione tra particelle vicine */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(200,212,0,${.055 * (1 - dist / 140)})`;
          ctx.lineWidth   = .5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    /* Particelle */
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      /* Converte alpha float in hex a 2 cifre */
      const hex = Math.round(p.alpha * 255).toString(16).padStart(2, '0');
      ctx.fillStyle = p.color + hex;
      ctx.fill();

      /* Movimento */
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    });

    requestAnimationFrame(draw);
  }

  draw();
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
