(() => {
  // Link de checkout: preencha para que todos os botões de CTA apontem para ele.
  const CHECKOUT_URL = '';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isDesktop = () => window.innerWidth >= 1100;

  if (CHECKOUT_URL) {
    document.querySelectorAll('[data-cta]').forEach((a) => { a.href = CHECKOUT_URL; });
  }

  /* ---------- Entrada do hero ---------- */
  document.querySelectorAll('[data-hero]').forEach((el, i) => el.style.setProperty('--i', i));
  const start = () => requestAnimationFrame(() => document.body.classList.add('is-loaded'));
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]).then(start);
  } else {
    start();
  }

  /* ---------- Revelação ao rolar ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const markTiltReady = (el) => {
    if (!el.hasAttribute('data-tilt')) return;
    const done = () => el.classList.add('tilt-ready');
    el.addEventListener('transitionend', function handler(e) {
      if (e.propertyName !== 'transform') return;
      el.removeEventListener('transitionend', handler);
      done();
    });
    setTimeout(done, 1800);
  };

  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        markTiltReady(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => { el.classList.add('is-in'); markTiltReady(el); });
  }

  /* ---------- Efeitos ligados à rolagem ---------- */
  const progressBar = document.querySelector('.scroll-progress');
  const hero = document.querySelector('.hero');
  const stickyCta = document.querySelector('.sticky-cta');
  const finalSection = document.querySelector('.final');
  const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
  const track = document.querySelector('.timeline__track');
  const fill = document.querySelector('.timeline__fill');
  const modules = [...document.querySelectorAll('.module')];

  let ticking = false;
  const onScroll = () => {
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    const y = window.scrollY;
    progressBar.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);

    if (!reduceMotion) {
      parallaxEls.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const factor = parseFloat(el.dataset.parallax) || 0;
        el.style.transform = `translate3d(0, ${((r.top + r.height / 2 - vh / 2) * -factor).toFixed(1)}px, 0)`;
      });
    }

    if (track && fill) {
      const r = track.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
      fill.style.setProperty('--tl', p.toFixed(4));
      fill.style.setProperty('--tl-head', p > 0.01 && p < 0.995 ? 1 : 0);
      modules.forEach((m) => {
        const mr = m.getBoundingClientRect();
        m.classList.toggle('is-active', mr.top + mr.height / 2 < vh * 0.6);
      });
    }

    if (stickyCta && hero && finalSection) {
      const pastHero = hero.getBoundingClientRect().bottom < 0;
      const atFinal = finalSection.getBoundingClientRect().top < vh * 0.85;
      stickyCta.classList.toggle('is-visible', pastHero && !atFinal);
    }
    ticking = false;
  };
  const requestTick = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);
  onScroll();

  /* ---------- Brilho do hero seguindo o mouse ---------- */
  if (hero && finePointer && !reduceMotion) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
      hero.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }

  /* ---------- Tilt 3D nos cards ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      const maxDeg = 6;
      el.addEventListener('pointermove', (e) => {
        if (!isDesktop() || !el.classList.contains('tilt-ready')) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add('tilting');
        el.style.setProperty('--ry', `${(px * maxDeg * 2).toFixed(2)}deg`);
        el.style.setProperty('--rx', `${(-py * maxDeg * 2).toFixed(2)}deg`);
      });
      el.addEventListener('pointerleave', () => {
        el.classList.remove('tilting');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });

    const yesCard = document.querySelector('.acard--yes');
    if (yesCard) {
      yesCard.addEventListener('pointermove', (e) => {
        const r = yesCard.getBoundingClientRect();
        yesCard.style.setProperty('--mx', `${e.clientX - r.left}px`);
        yesCard.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    }
  }

  /* ---------- FAQ (acordeão) ---------- */
  document.querySelectorAll('.qa').forEach((qa) => {
    const btn = qa.querySelector('.qa__q');
    const toggle = () => {
      const open = !qa.classList.contains('is-open');
      qa.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    };
    btn.addEventListener('click', toggle);
    qa.addEventListener('click', (e) => { if (e.target === qa) toggle(); });
  });
})();
