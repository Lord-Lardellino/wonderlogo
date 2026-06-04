/* ═══════════════════════════════════════════════════════════════
   prodotti.js — Animated Full-Screen Sections
   Ispirato al Codepen GreenSock "Animated Sections" (Observer)
   Usa solo GSAP + Observer (entrambi free)
   SplitText (premium) sostituito con split manuale
   ═══════════════════════════════════════════════════════════════ */

/* Fallback: se GSAP o Observer non caricano, mostra tutto staticamente */
if (typeof gsap === 'undefined' || typeof Observer === 'undefined') {
  document.querySelectorAll('.prod-section').forEach((s, i) => {
    s.style.visibility = 'visible';
    if (i > 0) s.style.position = 'relative';
  });
  document.querySelectorAll('.prod-char, .prod-section__tag, .prod-section__desc, .prod-section__btn')
    .forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
  document.body.style.height = 'auto';
  document.body.style.overflow = 'auto';
} else {
  initProdotti();
}

function initProdotti() {

gsap.registerPlugin(Observer);

/* ─── Split manuale in righe + caratteri ────────────────────────
   Ogni riga (separata da <br>) diventa un blocco con white-space:nowrap
   così le singole lettere (inline-block) NON vanno a capo a metà parola.
   Ogni riga ha overflow:hidden per l'effetto reveal dal basso.
─────────────────────────────────────────────────────────────── */
function splitChars(el) {
  const lines = el.innerHTML.split(/<br\s*\/?>/gi);
  el.innerHTML = lines.map(line => {
    const chars = line.split('').map(ch =>
      ch === ' '
        ? '<span class="prod-char">&nbsp;</span>'
        : `<span class="prod-char">${ch}</span>`
    ).join('');
    return `<span class="prod-line">${chars}</span>`;
  }).join('');
  return el.querySelectorAll('.prod-char');
}

/* ─── Setup ──────────────────────────────────────────────────── */
const sections    = document.querySelectorAll('.prod-section');
const outers      = gsap.utils.toArray('.prod-section__outer');
const inners      = gsap.utils.toArray('.prod-section__inner');
const bgs         = gsap.utils.toArray('.prod-section__bg');
const currentEl   = document.getElementById('prod-current');
const totalEl     = document.getElementById('prod-total');
const hint        = document.querySelector('.prod-hint');

const total = sections.length;
if (totalEl) totalEl.textContent = String(total).padStart(2, '0');

/* Split testi al caricamento */
const splitTitles = [];
sections.forEach(sec => {
  const title = sec.querySelector('.prod-section__title');
  if (title) splitTitles.push(splitChars(title));
  else        splitTitles.push([]);
});

let currentIndex = -1;
let animating    = false;
const wrap = gsap.utils.wrap(0, total);

gsap.set(outers, { yPercent: 100 });
gsap.set(inners, { yPercent: -100 });

/* ─── Transizione tra sezioni ────────────────────────────────── */
function goTo(index, direction) {
  index = wrap(index);
  animating = true;

  const fromTop  = direction === -1;
  const dFactor  = fromTop ? -1 : 1;

  const tl = gsap.timeline({
    defaults: { duration: 1.2, ease: 'power1.inOut' },
    onComplete: () => { animating = false; },
  });

  /* Nascondi sezione corrente */
  if (currentIndex >= 0) {
    gsap.set(sections[currentIndex], { zIndex: 0 });
    tl.to(bgs[currentIndex], { yPercent: -12 * dFactor })
      .set(sections[currentIndex], { autoAlpha: 0 });
  }

  /* Mostra nuova sezione */
  gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 });

  tl.fromTo(
    [outers[index], inners[index]],
    { yPercent: i => i ? -100 * dFactor : 100 * dFactor },
    { yPercent: 0 },
    0
  )
  .fromTo(bgs[index], { yPercent: 12 * dFactor }, { yPercent: 0 }, 0)
  /* Anima i caratteri del titolo */
  .fromTo(
    splitTitles[index],
    { autoAlpha: 0, yPercent: 120 * dFactor },
    {
      autoAlpha: 1,
      yPercent: 0,
      duration: 1,
      ease: 'power3',
      stagger: { each: 0.018, from: 'start' },
    },
    0.15
  )
  /* Anima tag, descrizione e bottone */
  .fromTo(
    sections[index].querySelector('.prod-section__tag'),
    { autoAlpha: 0, y: 20 * dFactor },
    { autoAlpha: 1, y: 0, duration: .7, ease: 'power3' },
    0.1
  )
  .fromTo(
    sections[index].querySelector('.prod-section__desc'),
    { autoAlpha: 0, y: 30 * dFactor },
    { autoAlpha: 1, y: 0, duration: .8, ease: 'power3' },
    0.3
  )
  .fromTo(
    sections[index].querySelector('.prod-section__btn'),
    { autoAlpha: 0, y: 20 * dFactor },
    { autoAlpha: 1, y: 0, duration: .7, ease: 'power3' },
    0.45
  );

  /* Aggiorna contatore */
  currentIndex = index;
  if (currentEl) {
    gsap.to(currentEl, {
      duration: .4,
      opacity: 0,
      y: -10,
      onComplete: () => {
        currentEl.textContent = String(index + 1).padStart(2, '0');
        gsap.to(currentEl, { duration: .4, opacity: 1, y: 0 });
      },
    });
  }
}

/* ─── Observer (scroll + swipe + tasto) ─────────────────────── */
Observer.create({
  type: 'wheel,touch,pointer',
  wheelSpeed: -1,
  onDown:  () => !animating && goTo(currentIndex - 1, -1),
  onUp:    () => !animating && goTo(currentIndex + 1,  1),
  tolerance: 10,
  preventDefault: true,
});

/* Tasti freccia */
document.addEventListener('keydown', e => {
  if (animating) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goTo(currentIndex + 1,  1);
  if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  goTo(currentIndex - 1, -1);
});

/* Nascondi hint dopo primo scroll */
let hintHidden = false;
document.addEventListener('wheel', () => {
  if (!hintHidden && hint) {
    gsap.to(hint, { autoAlpha: 0, duration: .5 });
    hintHidden = true;
  }
}, { once: true });

/* ─── Inizia dalla prima sezione ─────────────────────────────── */
goTo(0, 1);

} /* fine initProdotti() */
