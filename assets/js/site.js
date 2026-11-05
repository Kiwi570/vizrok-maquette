/* Effets propres à Vizrok.store. Le socle gère l'ouverture, le voile, l'en-tête, le menu, le mode calme, les boucles,
   les mesures et la bibliothèque d'effets (posée par attributs dans les pages). Ici : l'intro « la barre se charge »,
   le mouvement d'ouverture de chaque page, les effets de défilement propres au client (chacun marqué data-effet). */
import { demarrer, boucle, etat, rafraichir, quand } from './socle/index.js?v=3';
import { initPanier, ajouter, catalogue } from './panier.js?v=3';
import { initBoutique } from './boutique.js?v=3';
import { initKit, initEtapes } from './formulaires-vizrok.js?v=3';

const gsap = window.gsap;
const ST = window.ScrollTrigger;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const page = document.documentElement.dataset.page;
const grand = () => window.matchMedia('(min-width: 900px) and (min-height: 600px)').matches;
const sourisFine = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
let onde = null;
let nuage = null;

/* ---------- Magnésie : nuage de poudre en canvas 2D (impact de la barre, clic dans l'ouverture) ---------- */
function magnesie() {
  const hero = $('.hero'), cv = hero && $('.hero-magnesie', hero);
  if (!cv) return;
  if (etat.calme) { cv.hidden = true; return; }
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, parts = [], raf = 0, avant = 0;
  const peu = window.innerWidth < 760;
  const taille = () => { const r = hero.getBoundingClientRect(); W = r.width; H = r.height; cv.width = Math.round(W); cv.height = Math.round(H); };
  new ResizeObserver(taille).observe(hero);
  taille();
  cv.style.visibility = 'hidden';
  const pas = (t) => {
    const dt = Math.min(0.05, Math.max(0.001, (t - avant) / 1000)); avant = t;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'screen';
    parts = parts.filter((p) => (p.age += dt) < p.vie);
    for (const p of parts) {
      p.vx *= Math.pow(0.16, dt); p.vy = p.vy * Math.pow(0.25, dt) + 18 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      const k = p.age / p.vie, r = p.r0 + (p.r1 - p.r0) * Math.sqrt(k), a = p.a * (1 - k) * (1 - k);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, `rgba(236,242,245,${a.toFixed(3)})`); g.addColorStop(1, 'rgba(236,242,245,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832); ctx.fill();
    }
    raf = parts.length ? requestAnimationFrame(pas) : 0;
    /* Canvas retiré de l'affichage au repos : aucune couche transparente à composer pendant le défilement. */
    if (!raf) cv.style.visibility = 'hidden';
  };
  nuage = (x, y, n = 50, largeur = 60) => {
    const r = cv.getBoundingClientRect();
    const total = Math.round(n * (peu ? 0.45 : 1));
    for (let i = 0; i < total; i++) {
      const ang = -Math.PI * (0.04 + 0.92 * Math.random()), v = 50 + Math.random() * 280;
      parts.push({ x: x - r.left + (Math.random() - 0.5) * largeur, y: y - r.top + (Math.random() - 0.5) * 10, vx: Math.cos(ang) * v * 1.5, vy: Math.sin(ang) * v * 0.6,
        r0: 1.5 + Math.random() * 3.5, r1: 9 + Math.random() * 24, a: 0.16 + Math.random() * 0.3, age: 0, vie: 0.8 + Math.random() * 1.2 });
    }
    if (parts.length > 260) parts.splice(0, parts.length - 260);
    if (!raf) { cv.style.visibility = ''; avant = performance.now(); raf = requestAnimationFrame(pas); }
  };
  hero.addEventListener('pointerdown', (e) => { if (!e.target.closest('a, button')) nuage(e.clientX, e.clientY, 24, 24); });
}

/* Impact de la barre sur le titre : poudre sous chaque côté et au centre, onde de choc au point d'impact. */
function impactBarre() {
  const barre = $('.hero-barre');
  if (!barre) return;
  const r = barre.getBoundingClientRect();
  if (nuage) {
    $$('.hb-cote', barre).forEach((cote) => { const c = cote.getBoundingClientRect(); nuage(c.left + c.width / 2, c.bottom, 90, c.width * 2.2); });
    nuage(r.left + r.width / 2, r.bottom, 26, r.width * 0.5);
  }
  const fig = $('.hero-media');
  if (onde && fig) { const f = fig.getBoundingClientRect(); onde.choc((r.left + r.width / 2 - f.left) / f.width, (r.bottom - f.top) / f.height, 1); }
}

/* Fiches produit vivantes : au survol, la vue portée balaie la photo, la fiche s'incline vers la souris avec un reflet,
   et les tailles s'offrent en ajout rapide ; au doigt, un appui long ouvre l'ajout rapide (le toucher simple ouvre la fiche). */
function fichesVivantes() {
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-rapide]');
    if (!b) return;
    e.preventDefault();
    const p = catalogue().find((x) => x.id === b.dataset.rapide);
    if (!p) return;
    ajouter({ id: p.id, couleur: p.couleurs[0]?.nom || '', taille: b.dataset.taille }, b);
    b.classList.add('est-ajoute'); b.textContent = b.dataset.taille + ' ✓';
    setTimeout(() => { b.classList.remove('est-ajoute'); b.textContent = b.dataset.taille; }, 1100);
  });
  if (etat.calme) return;
  if (sourisFine()) {
    document.addEventListener('pointerover', (e) => {
      const fiche = e.target.closest && e.target.closest('.fiche');
      if (!fiche || fiche.__vivante) return;
      fiche.__vivante = true;
      const lien = $('.fiche-lien', fiche), fig = lien && $('.fiche-media', lien);
      if (!fig) return;
      const alt = lien.dataset.vueAlt;
      if (alt) {
        const img = new Image();
        img.className = 'fiche-alt' + (lien.hasAttribute('data-vue-alt-plein') ? ' est-plein' : '');
        img.alt = ''; img.decoding = 'async';
        img.sizes = $('img', fig)?.getAttribute('sizes') || '25vw';
        img.srcset = `${alt}-480.webp 480w, ${alt}-800.webp 800w`;
        img.src = `${alt}-480.webp`;
        img.style.background = lien.dataset.vueAltFond || '';
        fig.appendChild(img);
      }
      const reflet = document.createElement('span');
      reflet.className = 'fiche-reflet';
      fig.appendChild(reflet);
      let raf = 0, px = 0, py = 0;
      fig.addEventListener('pointermove', (ev) => {
        const r = fig.getBoundingClientRect();
        px = (ev.clientX - r.left) / r.width - 0.5; py = (ev.clientY - r.top) / r.height - 0.5;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          fig.style.transform = `perspective(900px) rotateY(${(px * 10).toFixed(2)}deg) rotateX(${(-py * 10).toFixed(2)}deg) scale(1.02)`;
          fig.style.setProperty('--mx', ((px + 0.5) * 100).toFixed(1) + '%');
          fig.style.setProperty('--my', ((py + 0.5) * 100).toFixed(1) + '%');
        });
      });
      fig.addEventListener('pointerleave', () => { fig.style.transform = ''; });
    }, { passive: true });
    return;
  }
  /* Appui long au doigt : l'ajout rapide s'ouvre ; le clic qui suit n'ouvre pas la fiche. */
  let minuteur = 0, depart = null, longue = false;
  const annuler = () => { clearTimeout(minuteur); depart = null; };
  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    const fig = e.target.closest && e.target.closest('.fiche-lien .fiche-media'), fiche = fig && fig.closest('.fiche');
    if (!fiche || !$('.fiche-rapide', fiche)) return;
    depart = [e.clientX, e.clientY]; longue = false;
    minuteur = setTimeout(() => {
      longue = true;
      $$('.fiche.est-rapide').forEach((f) => f !== fiche && f.classList.remove('est-rapide'));
      fiche.classList.add('est-rapide');
      if (navigator.vibrate) navigator.vibrate(12);
    }, 450);
  }, { passive: true });
  document.addEventListener('pointermove', (e) => { if (depart && Math.hypot(e.clientX - depart[0], e.clientY - depart[1]) > 10) annuler(); }, { passive: true });
  document.addEventListener('pointerup', annuler, { passive: true });
  document.addEventListener('pointercancel', annuler, { passive: true });
  document.addEventListener('contextmenu', (e) => { if (e.target.closest && e.target.closest('.fiche-lien .fiche-media')) e.preventDefault(); });
  window.addEventListener('click', (e) => {
    /* Le clic qui suit l'appui long (doigt relevé) ne fait rien : ni fiche ouverte, ni taille ajoutée. */
    if (longue) { e.preventDefault(); e.stopImmediatePropagation(); longue = false; return; }
    if (!(e.target.closest && e.target.closest('.fiche-rapide'))) $$('.fiche.est-rapide').forEach((f) => f.classList.remove('est-rapide'));
  }, true);
}

/* Porté : chaque photo s'ouvre en volets à son arrivée ; sur grand écran, les quatre photos glissent à des vitesses différentes. */
function porte() {
  const sec = $('.porte');
  if (!sec) return;
  const items = $$('.porte-item', sec);
  if (etat.calme) { items.forEach((it) => it.classList.add('est-ouvert')); return; }
  items.forEach((it) => {
    /* Retour sur la page ou photo déjà dépassée : ouverte tout de suite, sans rejouer les volets. */
    if (etat.arrivee === 'retour' || it.getBoundingClientRect().bottom < 0) { it.classList.add('est-ouvert'); return; }
    const volets = $$('.porte-volets i', it), img = $('.porte-media img', it);
    gsap.timeline({ scrollTrigger: { trigger: it, start: 'top 85%', once: true }, onComplete: () => it.classList.add('est-ouvert') })
      .fromTo(volets, { scaleY: 1 }, { scaleY: 0, duration: 0.7, stagger: 0.07, ease: 'power3.inOut' }, 0)
      .fromTo(img, { scale: 1.22 }, { scale: 1, duration: 1.2, ease: 'power3.out', clearProps: 'transform' }, 0);
  });
  gsap.matchMedia().add('(min-width: 900px)', () => {
    items.forEach((it) => gsap.fromTo(it, { yPercent: 0 }, { yPercent: +it.dataset.porteVitesse || 0, ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 0.6 } }));
  });
}

/* ---------- Intro : la barre se charge (≈ 2,3 s) ---------- */
function intro() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  const compteur = $('[data-intro-compteur]');
  const valeur = { n: 0 };
  const ecrire = () => { if (compteur) compteur.textContent = String(Math.round(valeur.n)).padStart(2, '0'); };
  const cotes = { g: $$('.intro-cote--g .intro-disque'), d: $$('.intro-cote--d .intro-disque') };
  const paliers = [7, 12, 17, 18];
  gsap.set('.intro-disque', { opacity: 0 });
  gsap.set('.intro-mots span', { yPercent: 60, opacity: 0 });
  [0, 1, 2, 3].forEach((i) => {
    const t = 0.3 + i * 0.32;
    tl.fromTo(cotes.g[i], { x: -window.innerWidth * 0.5, opacity: 0 }, { x: 0, opacity: 1, duration: 0.28, ease: 'power4.in' }, t)
      .fromTo(cotes.d[i], { x: window.innerWidth * 0.5, opacity: 0 }, { x: 0, opacity: 1, duration: 0.28, ease: 'power4.in' }, t)
      .fromTo('.intro-choc', { scale: 0.4, opacity: 0.9 }, { scale: 7 + i * 2, opacity: 0, duration: 0.5, ease: 'power2.out' }, t + 0.28)
      .fromTo('.intro-barre', { y: 0 }, { y: 4, duration: 0.06, yoyo: true, repeat: 1, ease: 'power1.inOut' }, t + 0.28)
      .to(valeur, { n: paliers[i], duration: 0.22, ease: 'none', onUpdate: ecrire }, t + 0.2);
  });
  tl.call(() => document.documentElement.classList.add('intro-neon-on'), null, 0.9)
    .fromTo('.intro-neon', { opacity: 0.4 }, { opacity: 1, duration: 0.18, ease: 'steps(2)' }, 0.9)
    .to('.intro-mots span', { yPercent: 0, opacity: 1, duration: 0.42, stagger: 0.3 }, 0.62)
    .to('.intro-scene', { y: () => -window.innerHeight * 0.42, opacity: 0, duration: 0.5, ease: 'power3.in' }, 1.72)
    .to('.intro-mots, .intro-logo, .intro-compteur', { y: -40, opacity: 0, duration: 0.4, ease: 'power2.in' }, 1.8)
    .fromTo('.ouverture-panneau', { clipPath: 'inset(0 0 0% 0)' }, { clipPath: 'inset(0 0 100% 0)', duration: 0.55, ease: 'power4.inOut' }, 1.85);
  return tl;
}

/* ---------- Mouvement d'ouverture de chaque page ---------- */
const OUVERTURES = {
  /* Accueil : le titre monte, la barre tombe dessus ; à l'impact le titre s'écrase et rebondit,
     la magnésie s'envole des disques et l'onde de choc part du point d'impact. */
  accueil() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const barre = $('.hero-barre'), ligne = $('.hero-ligne');
    tl.fromTo(ligne, { yPercent: 135, opacity: 1 }, { yPercent: 0, opacity: 1, duration: 0.7 }, 0)
      .fromTo('.hero-media img', { scale: 1.08 }, { scale: 1, duration: 0.9, ease: 'power2.out' }, 0);
    if (barre) {
      tl.fromTo(barre, { y: () => -(barre.getBoundingClientRect().bottom + 60), rotation: -3 }, { y: 0, rotation: 0, duration: 0.44, ease: 'power2.in' }, 0.34)
        .call(impactBarre, null, 0.78)
        .fromTo(ligne, { scaleY: 1, scaleX: 1 }, { scaleY: 0.82, scaleX: 1.03, duration: 0.07, ease: 'power2.out', transformOrigin: '50% 100%' }, 0.78)
        .to(ligne, { scaleY: 1, scaleX: 1, duration: 0.85, ease: 'elastic.out(1, 0.3)' }, 0.85)
        .to(barre, { y: -18, rotation: 1.2, duration: 0.15, ease: 'power2.out' }, 0.78)
        .to(barre, { y: 0, rotation: 0, duration: 0.45, ease: 'bounce.out' }, 0.93)
        .fromTo('.hero-texte', { x: 0 }, { x: 6, duration: 0.035, yoyo: true, repeat: 5, ease: 'none' }, 0.78);
    }
    tl.fromTo('.hero-sur, .hero-intro, .hero-actions', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, barre ? 0.95 : 0.12);
    return tl;
  },
  boutique() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const filtres = $$('.b-filtre');
    tl.fromTo('.b-titre-mot', { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7 }, 0)
      .fromTo(filtres, { x: () => window.innerWidth * 0.6, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, stagger: 0.09, ease: 'power3.out' }, 0.05)
      .fromTo(filtres.map((f) => $('.disque', f)), { rotation: 540 }, { rotation: 0, duration: 0.9, stagger: 0.09, ease: 'power3.out' }, 0.05)
      .call(() => $('.b-filtres')?.classList.add('est-pose'));
    return tl;
  },
  seance() {
    const tl = gsap.timeline();
    const chiffres = $('[data-chrono]');
    const t = { s: 0 };
    tl.fromTo('.chrono-cadre', { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' }, 0)
      .to(t, { s: 3, duration: 0.6, ease: 'none', onUpdate: () => { if (chiffres) chiffres.textContent = '00:0' + Math.floor(t.s); } }, 0.2)
      .call(() => $('.chrono')?.classList.add('chrono-fini'));
    return tl;
  },
  nutrition() {
    const tl = gsap.timeline();
    tl.fromTo('.et-titre', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'power2.out' }, 0)
      .fromTo('.et-lignes li', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.45, stagger: 0.08, ease: 'power2.out' }, 0.2)
      .fromTo('.et-valeur', { opacity: 0, x: 10 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.08 }, 0.5)
      .call(() => $('.etiquette')?.classList.add('est-tracee'));
    return tl;
  },
  livraison() {
    const tl = gsap.timeline();
    tl.fromTo('.bordereau', { y: 60, rotation: 4, opacity: 0 }, { y: 0, rotation: -1.2, opacity: 1, duration: 0.7, ease: 'power3.out' }, 0)
      .fromTo('.tampon', { scale: 2.6, opacity: 0, rotation: -24 }, { scale: 1, opacity: 0.88, rotation: -12, duration: 0.32, ease: 'power4.in' }, 0.55)
      .fromTo('.bordereau', { x: 0 }, { x: 3, duration: 0.05, yoyo: true, repeat: 1 }, 0.87)
      .fromTo('.bordereau-suivi', { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.7, ease: 'power2.out' }, 0.9)
      .call(() => $('.bordereau')?.classList.add('est-tamponne'));
    return tl;
  },
  /* Contact : la poignée tourne, la porte tremble puis s'ouvre en grand et revient d'un cran ; le néon du casier grésille. */
  contact() {
    const tl = gsap.timeline();
    tl.fromTo('.casier-poignee', { rotation: 0 }, { rotation: 75, duration: 0.24, ease: 'power2.inOut' }, 0.05)
      .fromTo('.casier-porte', { x: 0 }, { x: 3, duration: 0.04, yoyo: true, repeat: 3, ease: 'none' }, 0.27)
      .fromTo('.casier-porte', { rotationY: 0, opacity: 1 }, { rotationY: 118, duration: 0.62, ease: 'power2.in' }, 0.42)
      .to('.casier-porte', { rotationY: 100, duration: 0.45, ease: 'back.out(2.4)' }, 1.04)
      .to('.casier-porte', { opacity: 0, duration: 0.3 }, 1.3)
      .call(() => $('.casier')?.classList.add('neon-gresille'), null, 0.7)
      .fromTo('.etapes-form', { x: -16, opacity: 0.3 }, { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.66)
      .call(() => $('.casier')?.classList.add('est-ouvert'));
    return tl;
  },
  404() {
    const tl = gsap.timeline();
    tl.fromTo('.introuvable-disque', { x: () => -window.innerWidth * 0.6 }, { x: 0, duration: 1.1, ease: 'power3.out' }, 0)
      .fromTo('.introuvable-disque .disque', { rotation: -720 }, { rotation: 0, duration: 1.1, ease: 'power3.out' }, 0)
      .to('.introuvable-disque', { x: 8, duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 1.1)
      .call(() => $('.introuvable-disque')?.classList.add('est-roule'));
    return tl;
  },
};

function etatFinalOuvertures() {
  gsap.set('.hero-ligne, .hero-barre, .hero-texte, .hero-sur, .hero-intro, .hero-actions, .hero-media img, .b-titre-mot, .b-filtre, .b-filtre .disque, .bordereau, .tampon, .bordereau-suivi, .etapes-form, .et-titre, .et-lignes li, .et-valeur, .introuvable-disque, .introuvable-disque .disque, .casier-porte, .casier-poignee, .chrono-cadre', { clearProps: 'all' });
  $('.b-filtres')?.classList.add('est-pose');
  $('.chrono')?.classList.add('chrono-fini');
  $('.etiquette')?.classList.add('est-tracee');
  $('.bordereau')?.classList.add('est-tamponne');
  $('.casier')?.classList.add('est-ouvert');
  $('.introuvable-disque')?.classList.add('est-roule');
  const ch = $('[data-chrono]'); if (ch) ch.textContent = '00:03';
}

/* ---------- Effets de défilement propres au client ---------- */

/* Ruban : la vitesse du défilement l'incline et l'accélère (data-effet="ruban-vitesse"). */
function rubanVitesse() {
  const p = $('.ruban p');
  if (!p || etat.calme || !sourisFine()) return;
  const anim = p.getAnimations ? p.getAnimations()[0] : null;
  const section = $('.ruban-section'), ruban = p.parentElement;
  let v = 0, i = 0, ecrit = 0;
  ST.create({ trigger: section, start: 'top bottom', end: 'bottom top', onUpdate: (st) => { v = st.getVelocity(); } });
  boucle(section, (dt) => {
    const cible = Math.max(-12, Math.min(12, v / 220));
    i += (cible - i) * (1 - Math.pow(0.002, dt));
    v *= Math.pow(0.05, dt);
    if (Math.abs(i - ecrit) < 0.05) return;
    ecrit = i;
    ruban.style.transform = `skewX(${(-i).toFixed(2)}deg)`;
    if (anim && !section.querySelector('.en-pause')) anim.playbackRate = 1 + Math.min(3, Math.abs(i) / 3);
  });
}

/* Manifeste : chaque mot s'allume au rythme du défilement (data-effet="manifeste"). */
function manifeste() {
  const el = $('[data-mot-a-mot]');
  if (!el || etat.calme) return;
  const mots = el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label', el.textContent.trim());
  el.innerHTML = mots.map((m) => `<span class="mot" aria-hidden="true">${m}</span>`).join(' ');
  const spans = $$('.mot', el);
  gsap.fromTo(spans, { opacity: 0.22 }, { opacity: 1, stagger: 0.25, ease: 'none',
    scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 40%', scrub: true } });
}

/* Collections : la barre se charge disque par disque ; épinglée sur grand écran (data-effet="disques-collections"). */
function collections() {
  const sec = $('.collections');
  if (!sec || etat.calme) return;
  const disques = $$('.cb-disque', sec), items = $$('.collection', sec);
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px) and (min-height: 600px)', () => {
    sec.classList.add('est-epinglable');
    gsap.set(items, { autoAlpha: 0, yPercent: 8 });
    gsap.set(items[0], { autoAlpha: 1, yPercent: 0 });
    const g = disques.filter((d) => d.classList.contains('cb-g')), d2 = disques.filter((d) => d.classList.contains('cb-d'));
    gsap.set(g, { x: () => -window.innerWidth }); gsap.set(d2, { x: () => window.innerWidth });
    gsap.set([g[0], d2[0]], { x: 0 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + window.innerHeight * 2.4, pin: true, scrub: 0.6, invalidateOnRefresh: true, refreshPriority: 2 } });
    items.forEach((it, i) => {
      if (!i) return;
      tl.to(items[i - 1], { autoAlpha: 0, yPercent: -8, duration: 0.35 }, i)
        .fromTo(g[i], { x: () => -window.innerWidth }, { x: 0, duration: 0.6, ease: 'power3.in' }, i - 0.2)
        .fromTo(d2[i], { x: () => window.innerWidth }, { x: 0, duration: 0.6, ease: 'power3.in' }, i - 0.2)
        .fromTo('.cb-tige', { y: 0 }, { y: 3, duration: 0.05, yoyo: true, repeat: 1 }, i + 0.4)
        .fromTo(it, { autoAlpha: 0, yPercent: 8 }, { autoAlpha: 1, yPercent: 0, duration: 0.4 }, i + 0.32);
    });
    tl.to({}, { duration: 0.4 });
    rafraichir();
    return () => { sec.classList.remove('est-epinglable'); gsap.set([...items, ...disques], { clearProps: 'all' }); };
  });
  mm.add('(max-width: 899px), (max-height: 599px)', () => {
    const st = { trigger: sec.querySelector('.collections-barre'), start: 'top 90%', end: 'top 30%', scrub: 0.5 };
    gsap.fromTo(disques.filter((d) => d.classList.contains('cb-g')), { x: () => -window.innerWidth * 0.8 }, { x: 0, stagger: 0.25, ease: 'none', scrollTrigger: st });
    gsap.fromTo(disques.filter((d) => d.classList.contains('cb-d')), { x: () => window.innerWidth * 0.8 }, { x: 0, stagger: 0.25, ease: 'none', scrollTrigger: { ...st } });
    items.forEach((it) => gsap.fromTo(it, { y: 40, opacity: 0.2 }, { y: 0, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: it, start: 'top 92%', end: 'top 60%', scrub: 0.5 } }));
  });
}

/* Maillot : une trame de mesh s'ouvre au défilement sur le visuel ; les pastilles changent le coloris et la lueur. */
function maillot() {
  const sec = $('.maillot');
  if (!sec) return;
  const vuesEl = $$('.maillot-vue', sec), choix = $$('[data-coloris-choix]', sec);
  const couleurs = choix.map((c) => getComputedStyle(c.closest('.pastille')).getPropertyValue('--c').trim());
  const ajout = $('[data-coloris-ajout]', sec);
  const choisir = (i) => {
    vuesEl.forEach((v, k) => v.classList.toggle('est-active', k === i));
    sec.style.setProperty('--coloris', couleurs[i]);
    if (ajout) ajout.dataset.couleur = String(i);
  };
  choix.forEach((c) => c.addEventListener('change', () => choisir(+c.value)));
  choisir(0);
  const canvas = $('.maillot-mesh', sec);
  if (!canvas || etat.calme) { if (canvas) canvas.hidden = true; return; }
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, cellules = [];
  const mesurer = () => {
    const r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pas = w < 500 ? Math.max(30, w / 11) : Math.max(22, Math.min(40, w / 16)), hy = pas * 0.866;
    cellules = [];
    for (let y = -hy, l = 0; y < h + hy; y += hy, l++) for (let x = -pas + (l % 2) * pas / 2; x < w + pas; x += pas) {
      const d = Math.hypot(x - w / 2, y - h / 2) / Math.hypot(w / 2, h / 2);
      cellules.push([x, y, pas, d]);
    }
    dessiner(dernier);
  };
  let dernier = 0;
  const dessiner = (p) => {
    dernier = p;
    ctx.clearRect(0, 0, w, h);
    for (const [x, y, pas, d] of cellules) {
      const ouverture = Math.max(0, Math.min(1, p * 1.6 - d * 0.6));
      const r = (pas * 0.56) * (1 - ouverture);
      if (r < 0.6) continue;
      ctx.beginPath();
      for (let k = 0; k < 6; k++) { const a = Math.PI / 3 * k + Math.PI / 6; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
      ctx.closePath();
      ctx.fillStyle = 'rgba(5,11,20,.94)'; ctx.fill();
      ctx.strokeStyle = 'rgba(61,255,138,.35)'; ctx.lineWidth = 1; ctx.stroke();
    }
  };
  new ResizeObserver(mesurer).observe(canvas);
  let raf = 0, voulu = 0;
  ST.create({ trigger: sec, start: 'top 85%', end: 'center 45%', scrub: true, onUpdate: (st) => { voulu = st.progress; if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (Math.abs(voulu - dernier) > 0.004) dessiner(voulu); }); } });
}

/* Réseaux : chaque compte s'allume lettre par lettre au défilement, comme un tube néon (data-effet="neon"). */
function neon() {
  $$('[data-neon]').forEach((el) => {
    const t = el.textContent;
    el.setAttribute('aria-label', t);
    el.innerHTML = [...t].map((ch) => `<span class="lettre" aria-hidden="true">${ch}</span>`).join('');
    if (etat.calme) { $$('.lettre', el).forEach((l) => l.classList.add('allumee')); return; }
    const lettres = $$('.lettre', el);
    ST.create({ trigger: el, start: 'top 88%', end: 'top 45%', scrub: true,
      onUpdate: (st) => { const n = Math.round(st.progress * lettres.length); if (n === el.__n) return; el.__n = n; lettres.forEach((l, i) => l.classList.toggle('allumee', i < n)); } });
  });
}

/* Boutique : les disques-filtres roulent avec le défilement (data-effet="disques-filtres"). */
function disquesRoulent() {
  const f = $('.b-filtres');
  if (!f || etat.calme) return;
  gsap.to($$('.disque', f), { rotation: 360, ease: 'none', scrollTrigger: { trigger: '.b-tete', start: 'top top', end: 'bottom top', scrub: 0.5 } });
}

/* Ta séance : le maillot passe au scanner, épinglé sur grand écran (data-effet="maillot-scanner"). La ligne laser descend,
   la photo s'allume derrière elle, chaque repère apparaît à son passage, la loupe montre le gros plan du dernier atteint. */
function scanner() {
  const sec = $('.scanner');
  if (!sec) return;
  const photo = $('.scan-photo', sec), loupe = $('.scan-loupe', sec), vue = $('.scan-loupe-vue', sec), titre = $('[data-loupe-titre]', sec);
  const lignes = $$('.eclate-liste li', sec);
  const pts = $$('.scan-repere', sec).map((el) => ({ el, piece: el.dataset.repere, x: parseFloat(el.style.getPropertyValue('--x')), y: parseFloat(el.style.getPropertyValue('--y')) }));
  const noms = Object.fromEntries(lignes.map((li) => [li.dataset.piece, $('strong', li).textContent]));
  let actif = -2;
  /* Gros plan : la photo agrandie 3,4 fois, centrée sur le repère (pourcentages de background-position). */
  const viser = (k) => {
    if (k === actif) return;
    actif = k;
    const p = pts[Math.max(0, k)];
    vue.style.setProperty('--lx', (((p.x / 100) * 3.4 - 0.5) / 2.4 * 100).toFixed(2) + '%');
    vue.style.setProperty('--ly', (((p.y / 100) * 4.533 - 0.5) / 3.533 * 100).toFixed(2) + '%');
    titre.textContent = noms[p.piece] || '';
    sec.classList.toggle('scan-vise', k >= 0);
    pts.forEach((q, i) => q.el.classList.toggle('est-actif', i === k));
    lignes.forEach((li) => li.classList.toggle('est-actif', k >= 0 && pts.findIndex((q) => q.piece === li.dataset.piece) <= k));
    if (window.innerWidth > 760) {
      const h = photo.offsetHeight, l = loupe.offsetHeight;
      loupe.style.transform = `translateY(${Math.max(0, Math.min(h - l, (p.y / 100) * h - l / 2)).toFixed(0)}px)`;
    }
  };
  const poser = (prog) => {
    const scan = Math.max(0, Math.min(100, prog * 106 - 3));
    photo.style.setProperty('--scan', scan.toFixed(2) + '%');
    sec.classList.toggle('scan-en-cours', scan > 0 && scan < 100);
    let k = -1;
    pts.forEach((q, i) => { const vu = scan >= q.y; q.el.classList.toggle('est-vu', vu); if (vu) k = i; });
    viser(k);
  };
  if (etat.calme) { poser(1); viser(3); return; }
  sec.classList.add('scan-js');
  poser(0);
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px) and (min-height: 600px)', () => {
    sec.classList.add('est-epinglable');
    const st = ST.create({ trigger: sec, start: 'top top', end: () => '+=' + window.innerHeight * 1.5, pin: true, scrub: 0.5, invalidateOnRefresh: true, refreshPriority: 2, onUpdate: (x) => poser(x.progress) });
    rafraichir();
    return () => { st.kill(); sec.classList.remove('est-epinglable'); };
  });
  mm.add('(max-width: 899px), (max-height: 599px)', () => {
    const st = ST.create({ trigger: photo, start: 'top 75%', end: 'bottom 40%', scrub: 0.4, onUpdate: (x) => poser(x.progress) });
    return () => st.kill();
  });
}

/* Nutrition : le shaker se remplit d'un cran à chaque produit (data-effet="shaker-niveau") ; le liquide prend la couleur
   du produit lu, ondule, clapote et penche selon la vitesse du défilement, des bulles remontent. */
function shaker() {
  const niveau = $('[data-shaker-niveau]');
  if (!niveau) return;
  const scene = niveau.closest('.gamme-shaker'), compte = $('[data-shaker-compte]'), menisque = $('[data-shaker-menisque]');
  const produits = $$('[data-n-produit]'), n = produits.length;
  const bulles = $$('[data-shaker-bulles] circle').map((c) => ({ el: c, x: +c.getAttribute('cx'), y: +c.getAttribute('cy'), r: +c.getAttribute('r'), v: 18 + Math.random() * 26, phase: Math.random() * 6 }));
  let p = 0, t = 0, ampl = 1, pente = 0, penteV = 0, couleur = -1;
  const surface = () => 290 - (8 + p * 206);
  const dessiner = () => {
    const s0 = surface(), pts = [];
    for (let x = 0; x <= 160; x += 8) pts.push(`${x} ${(s0 + Math.sin(x * 0.07 + t * 3.1) * ampl + Math.sin(x * 0.13 - t * 2.2) * ampl * 0.45 + pente * (x - 80)).toFixed(2)}`);
    niveau.setAttribute('d', `M${pts.join('L')}L160 300L0 300Z`);
    if (menisque) menisque.setAttribute('d', `M${pts.join('L')}`);
  };
  const teinter = () => {
    const k = Math.min(n - 1, Math.max(0, Math.floor(p * n - 0.001)));
    if (k === couleur || !produits[k]) return;
    couleur = k;
    scene.style.setProperty('--sh-couleur', produits[k].dataset.couleur);
  };
  const ecrireCompte = () => { if (compte) compte.textContent = `${Math.min(n, Math.round(p * n))} / ${n}`; };
  if (etat.calme) { p = 1; ampl = 0; dessiner(); teinter(); ecrireCompte(); return; }
  dessiner(); teinter();
  ST.create({ trigger: '.gamme-liste', start: 'top 70%', end: 'bottom 70%', scrub: 0.4,
    onUpdate: (st) => {
      p = st.progress; teinter(); ecrireCompte();
      const v = st.getVelocity();
      penteV += Math.max(-0.5, Math.min(0.5, v * 0.00006));
      ampl = Math.min(9, Math.max(ampl, 1 + Math.abs(v) / 260));
    } });
  quand('pret', () => boucle(scene, (dt) => {
    t += dt;
    /* Ressort amorti : le liquide penche puis revient à plat ; les vagues retombent doucement. */
    penteV += (-38 * pente - 3.2 * penteV) * dt;
    pente = Math.max(-0.16, Math.min(0.16, pente + penteV * dt));
    ampl += (1 - ampl) * (1 - Math.pow(0.25, dt));
    dessiner();
    const s0 = surface();
    for (const b of bulles) {
      b.y -= b.v * dt;
      if (b.y < s0 + 4) b.y = 286;
      b.el.setAttribute('cy', b.y.toFixed(1));
      b.el.setAttribute('cx', (b.x + Math.sin(t * 2 + b.phase) * 2).toFixed(1));
      b.el.style.opacity = b.y > s0 + 6 ? '' : '0';
    }
  }));
}

/* Bordereau : il s'incline légèrement au défilement, la ligne de suivi s'étire. */
function bordereau() {
  const b = $('.bordereau');
  if (!b || etat.calme) return;
  gsap.fromTo(b, { yPercent: 0 }, { yPercent: -12, rotation: -3, ease: 'none', scrollTrigger: { trigger: '.l-tete', start: 'top top', end: 'bottom top', scrub: 0.5 } });
}

/* Livraison : le colis suit son trajet sur la carte au rythme des étapes (data-effet="colis-carte"). */
function colisCarte() {
  const carte = $('.etapes-carte');
  if (!carte) return;
  const sec = carte.closest('.etapes'), trajet = $('[data-carte-trajet]', carte), colis = $('[data-carte-colis]', carte);
  const noeuds = $$('.carte-noeud', carte), etapes = $$('.frise-etape', sec);
  const L = trajet.getTotalLength();
  /* Seuil de chaque étape : la longueur du trajet au point le plus proche de son nœud. */
  const seuils = noeuds.map((g) => {
    const m = g.getAttribute('transform').match(/translate\(([\d.]+) ([\d.]+)\)/), nx = +m[1], ny = +m[2];
    let meilleur = 0, d0 = Infinity;
    for (let l = 0; l <= L; l += L / 240) { const pt = trajet.getPointAtLength(l), d = (pt.x - nx) ** 2 + (pt.y - ny) ** 2; if (d < d0) { d0 = d; meilleur = l; } }
    return meilleur / L;
  });
  trajet.style.strokeDasharray = `${L} ${L}`;
  const poser = (p) => {
    trajet.style.strokeDashoffset = String(L * (1 - p));
    const pt = trajet.getPointAtLength(L * p);
    colis.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
    seuils.forEach((s, i) => { const ok = p >= s - 0.005; noeuds[i].classList.toggle('est-atteint', ok); etapes[i]?.classList.toggle('est-actif', ok); });
  };
  if (etat.calme) { poser(1); return; }
  sec.classList.add('colis-js');
  poser(0);
  /* Sur téléphone, la carte passe au-dessus des étapes : le colis avance pendant qu'elle traverse l'écran. */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 761px)', () => { const st = ST.create({ trigger: $('.frise', sec), start: 'top 70%', end: 'bottom 55%', scrub: 0.6, onUpdate: (x) => poser(x.progress) }); return () => st.kill(); });
  mm.add('(max-width: 760px)', () => { const st = ST.create({ trigger: carte, start: 'top 80%', end: 'bottom 35%', scrub: 0.6, onUpdate: (x) => poser(x.progress) }); return () => st.kill(); });
}

/* Contact : à l'envoi (simulé), un ticket de vestiaire numéroté s'imprime au-dessus du formulaire. */
function ticketVestiaire() {
  const t = $('[data-ticket]'), msg = $('[data-message-envoi]');
  if (!t || !msg) return;
  new MutationObserver(() => {
    if (msg.hidden || !t.hidden) return;
    const sujet = $('input[name="sujet"]:checked')?.closest('label')?.textContent.trim() || '';
    t.innerHTML = '<p class="ticket-tete"></p><p class="ticket-num"><small></small><span></span></p><p class="ticket-sujet"></p><p class="ticket-mention"></p><div class="ticket-code"></div>';
    $('.ticket-tete', t).textContent = t.dataset.tete;
    $('.ticket-num small', t).textContent = t.dataset.num;
    $('.ticket-num span', t).textContent = String(Math.floor(1000 + Math.random() * 9000));
    $('.ticket-sujet', t).textContent = sujet;
    $('.ticket-mention', t).textContent = t.dataset.mention;
    t.hidden = false;
    const envoi = msg.closest('form')?.querySelector('[type="submit"]');
    if (envoi && t.dataset.envoye) envoi.textContent = t.dataset.envoye;
    if (etat.calme || !gsap) { t.style.transform = 'rotate(-4deg)'; return; }
    gsap.timeline()
      .fromTo(t, { clipPath: 'inset(0 0 100% 0)', y: -8, rotation: 0 }, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 1.1, ease: 'steps(14)' })
      .to(t, { rotation: -5, y: 16, duration: 0.6, ease: 'back.out(2.2)' });
  }).observe(msg, { attributes: true, attributeFilter: ['hidden'] });
}

/* Accueil sur téléphone (sans WebGL) : la photo de la salle se resserre et le texte remonte au défilement. */
function heroTelephone() {
  const hero = $('.hero');
  if (!hero || etat.calme || window.innerWidth > 760) return;
  const fig = $('.hero-media', hero);
  fig.dataset.effet = fig.dataset.effet || 'onde-de-choc';
  gsap.fromTo($('img', fig), { scale: 1 }, { scale: 1.15, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.fromTo('.hero-texte', { yPercent: 0 }, { yPercent: -18, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
}

/* Ta séance : le chrono de salle compte le temps passé sur la page (s'arrête hors écran et en mode calme). */
function chrono() {
  const el = $('[data-chrono]');
  if (!el || etat.calme) return;
  let s = 3;
  quand('pret', () => boucle(el.closest('.chrono'), (dt) => {
    s += dt;
    const m = Math.floor(s / 60), x = Math.floor(s % 60);
    const v = String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0');
    if (el.textContent !== v) el.textContent = v;
  }));
}

/* 404 : le disque continue de tourner doucement sur lui-même. */
function disque404() {
  const d = $('.introuvable-disque .disque');
  if (!d || etat.calme) return;
  let a = 0;
  quand('pret', () => boucle(d.closest('.introuvable-disque'), (dt) => { a = (a + dt * 18) % 360; d.style.transform = `rotate(${a}deg)`; }));
}

/* Après un grand saut (ancre, retour à une section), l'en-tête revient : le menu reste à portée. */
function enteteApresSaut() {
  let y0 = window.scrollY, raf = 0;
  window.addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const y = window.scrollY;
      if (Math.abs(y - y0) > window.innerHeight * 0.8) requestAnimationFrame(() => document.documentElement.classList.remove('entete-cache'));
      y0 = y;
    });
  }, { passive: true });
}

/* ---------- Transition entre pages : un disque roule jusqu'au centre, grandit et couvre l'écran ;
   à l'arrivée, il rétrécit au centre puis repart en roulant vers la droite (crochet etat.voileAnim du socle). ---------- */
function voileDisque() {
  const v = $('[data-voile]'), d = v && $('.voile-disque', v);
  if (!d || !d.animate) return;
  const contenu = $('.voile-contenu', v), marques = $('.vd-marques', d);
  const mesure = () => {
    const W = window.innerWidth, H = window.innerHeight, r = Math.round(Math.max(90, Math.min(W, H) * 0.22));
    d.style.width = d.style.height = 2 * r + 'px';
    d.style.margin = `${-r}px 0 0 ${-r}px`;
    return { W, r, S: (Math.hypot(W, H) / 2 + 6) / r };
  };
  const tour = (dx, r) => (dx / r) * 57.2958;
  etat.voileAnim = {
    couvrir(voile, duree) {
      const { W, r, S } = mesure(), D = duree < 400 ? 560 : 760, dx = W / 2 + r;
      voile.style.transform = 'none'; voile.style.background = 'transparent'; d.style.visibility = 'visible';
      const a = d.animate([
        { transform: `translateX(${-dx}px) rotate(${-tour(dx, r)}deg) scale(1)`, easing: 'cubic-bezier(.22,.61,.36,1)' },
        { transform: 'translateX(0px) rotate(0deg) scale(1)', offset: 0.56, easing: 'cubic-bezier(.64,0,.78,0)' },
        { transform: `translateX(0px) rotate(30deg) scale(${S})` },
      ], { duration: D, fill: 'forwards' });
      marques?.animate([{ opacity: 1 }, { opacity: 1, offset: 0.6 }, { opacity: 0, offset: 0.9 }, { opacity: 0 }], { duration: D, fill: 'forwards' });
      contenu?.animate([{ opacity: 0 }, { opacity: 0, offset: 0.78 }, { opacity: 1 }], { duration: D, fill: 'forwards' });
      return a.finished.then(() => { voile.style.background = ''; });
    },
    lever(voile) {
      const { W, r, S } = mesure(), D = 700, dx = W / 2 + r;
      voile.style.transform = 'none'; voile.style.background = 'transparent'; d.style.visibility = 'visible';
      const a = d.animate([
        { transform: `translateX(0px) rotate(-30deg) scale(${S})`, easing: 'cubic-bezier(.22,.61,.36,1)' },
        { transform: 'translateX(0px) rotate(0deg) scale(1)', offset: 0.46, easing: 'cubic-bezier(.55,0,.75,.3)' },
        { transform: `translateX(${dx}px) rotate(${tour(dx, r)}deg) scale(1)` },
      ], { duration: D, fill: 'forwards' });
      marques?.animate([{ opacity: 0 }, { opacity: 0, offset: 0.2 }, { opacity: 1, offset: 0.46 }, { opacity: 1 }], { duration: D, fill: 'forwards' });
      contenu?.animate([{ opacity: 1 }, { opacity: 0, offset: 0.18 }, { opacity: 0 }], { duration: D, fill: 'forwards' });
      return a.finished;
    },
    nettoyer(voile) {
      [d, marques, contenu].forEach((el) => el && el.getAnimations().forEach((x) => x.cancel()));
      voile.style.transform = ''; voile.style.background = ''; d.style.visibility = '';
    },
  };
}
voileDisque();

/* ---------- Démarrage ---------- */
demarrer({
  /* Onde de choc WebGL : ordinateur et tablette seulement (sur téléphone, l'intro porte la signature). */
  pret: [document.querySelector('[data-onde-choc]') && !etat.calme && window.innerWidth > 760
    ? import('./onde-choc.js?v=3').then((m) => { onde = m.initOndeChoc(document.querySelector('[data-onde-choc]')); return onde && onde.pret; }).catch((err) => console.warn('[onde-choc]', err))
    : null].filter(Boolean),
  preparer() {
    initPanier();
    if (page === 'boutique') initBoutique();
    if (page === 'seance') initKit();
    if (page === 'contact') initEtapes();
    if (!gsap || !ST) return;
    const faire = (fn) => { try { fn(); } catch (err) { console.error('[vizrok]', fn.name, err); } };
    [enteteApresSaut, fichesVivantes, magnesie, heroTelephone, chrono, rubanVitesse, manifeste, porte, collections, maillot, neon, disquesRoulent, scanner, shaker, colisCarte, ticketVestiaire, bordereau, disque404].forEach(faire);
    /* Épinglages créés ici après ceux du socle : ordre recalculé selon la page, puis un seul refresh regroupé. */
    ST.sort();
    rafraichir();
  },
  jouer() {
    if (!gsap) return null;
    const tl = intro();
    /* Le mouvement d'ouverture de la page démarre quand le panneau se retire ; il ne rallonge pas l'intro. */
    const o = OUVERTURES[page];
    if (o) tl.call(() => o(), null, 1.95);
    return tl;
  },
  etatFinal() {
    if (!gsap) return;
    gsap.set('.ouverture-panneau, .intro-scene, .intro-mots, .intro-logo, .intro-compteur', { clearProps: 'all' });
    etatFinalOuvertures();
  },
  arrivee() {
    if (!gsap) return;
    const o = OUVERTURES[page];
    if (o) o().delay(0.1);
  },
});
