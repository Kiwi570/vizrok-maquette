/* Effets propres à Vizrok.store. Le socle gère l'ouverture, le voile, l'en-tête, le menu, le mode calme, les boucles,
   les mesures et la bibliothèque d'effets (posée par attributs dans les pages). Ici : l'intro « la barre se charge »,
   le mouvement d'ouverture de chaque page, les effets de défilement propres au client (chacun marqué data-effet). */
import { demarrer, boucle, etat, rafraichir, quand } from './socle/index.js?v=2';
import { initPanier } from './panier.js?v=2';
import { initBoutique } from './boutique.js?v=2';
import { initKit, initEtapes } from './formulaires-vizrok.js?v=2';

const gsap = window.gsap;
const ST = window.ScrollTrigger;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const page = document.documentElement.dataset.page;
const grand = () => window.matchMedia('(min-width: 900px) and (min-height: 600px)').matches;
const sourisFine = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
let onde = null;

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
  accueil() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.hero-ligne', { yPercent: 135, opacity: 1 }, { yPercent: 0, opacity: 1, duration: 0.8 }, 0)
      .fromTo('.hero-sur, .hero-intro, .hero-actions', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, 0.12)
      .fromTo('.hero-media img', { scale: 1.08 }, { scale: 1, duration: 0.9, ease: 'power2.out' }, 0)
      .call(() => onde && onde.choc(0.64, 0.62, 1), null, 0.05);
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
  contact() {
    const tl = gsap.timeline();
    tl.fromTo('.casier-porte', { rotationY: 0, opacity: 1 }, { rotationY: -104, duration: 0.9, ease: 'power3.inOut' }, 0.1)
      .to('.casier-porte', { opacity: 0, duration: 0.25 }, 0.8)
      .fromTo('.etapes-form', { x: -24, opacity: 0.4 }, { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.45)
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
  gsap.set('.hero-ligne, .hero-sur, .hero-intro, .hero-actions, .hero-media img, .b-titre-mot, .b-filtre, .b-filtre .disque, .bordereau, .tampon, .bordereau-suivi, .etapes-form, .et-titre, .et-lignes li, .et-valeur, .introuvable-disque, .introuvable-disque .disque, .casier-porte, .chrono-cadre', { clearProps: 'all' });
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

/* Ta séance : le maillot s'éclate pièce par pièce, épinglé sur grand écran (data-effet="maillot-eclate"). */
function eclate() {
  const sec = $('.eclate');
  if (!sec) return;
  const svg = $('.eclate-svg', sec);
  const ecarts = { 1: [0, 60], 2: [0, -16], 3: [0, -86], 4: [0, 28], 5: [84, -60] };
  const ancres = { 1: [200, 300], 2: [70, 176], 3: [200, 126], 4: [108, 330], 5: [200, 140] };
  const pieces = $$('.ep', svg), reperes = $$('.ep-repere', svg), lignes = $$('.eclate-liste li', sec);
  const poser = (p) => {
    pieces.forEach((g) => { const [x, y] = ecarts[g.dataset.piece]; g.firstElementChild.setAttribute('transform', `translate(${x * p} ${y * p})`); });
    reperes.forEach((r) => {
      const i = r.dataset.repere, [ax, ay] = ancres[i], [x, y] = ecarts[i];
      const px = ax + x * p, py = ay + y * p, lx = i % 2 ? 372 : 28;
      r.setAttribute('transform', `translate(${lx} ${py})`);
      const l = $('.ep-trait', r); l.setAttribute('x2', String(px - lx)); l.setAttribute('y2', '0');
      r.style.opacity = String(Math.min(1, p * 3));
    });
    const actif = Math.min(5, Math.floor(p * 5.2) + 1);
    lignes.forEach((li) => li.classList.toggle('est-actif', +li.dataset.piece <= actif && p > 0.02));
  };
  if (etat.calme) { poser(1); return; }
  poser(0);
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px) and (min-height: 600px)', () => {
    sec.classList.add('est-epinglable');
    const st = ST.create({ trigger: sec, start: 'top top', end: () => '+=' + window.innerHeight * 1.4, pin: true, scrub: 0.6, invalidateOnRefresh: true, refreshPriority: 2, onUpdate: (s) => poser(s.progress) });
    rafraichir();
    return () => { st.kill(); sec.classList.remove('est-epinglable'); };
  });
  mm.add('(max-width: 899px), (max-height: 599px)', () => {
    const st = ST.create({ trigger: svg, start: 'top 85%', end: 'bottom 35%', scrub: 0.5, onUpdate: (s) => poser(s.progress) });
    return () => st.kill();
  });
}

/* Nutrition : le shaker se remplit d'un cran à chaque produit (data-effet="shaker-niveau"). */
function shaker() {
  const niveau = $('[data-shaker-niveau]');
  if (!niveau) return;
  const compte = $('[data-shaker-compte]'), n = $$('[data-n-produit]').length;
  /* Le liquide monte du fond (y = 290) jusqu'au col du shaker (y = 76). */
  const poser = (p) => { const hauteur = 8 + p * 206; niveau.setAttribute('y', String(290 - hauteur)); niveau.setAttribute('height', String(hauteur)); };
  if (etat.calme) { poser(1); if (compte) compte.textContent = `${n} / ${n}`; return; }
  poser(0);
  ST.create({ trigger: '.gamme-liste', start: 'top 70%', end: 'bottom 70%', scrub: 0.4,
    onUpdate: (st) => { poser(st.progress); if (compte) compte.textContent = `${Math.min(n, Math.round(st.progress * n))} / ${n}`; } });
}

/* Bordereau : il s'incline légèrement au défilement, la ligne de suivi s'étire. */
function bordereau() {
  const b = $('.bordereau');
  if (!b || etat.calme) return;
  gsap.fromTo(b, { yPercent: 0 }, { yPercent: -12, rotation: -3, ease: 'none', scrollTrigger: { trigger: '.l-tete', start: 'top top', end: 'bottom top', scrub: 0.5 } });
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

/* ---------- Démarrage ---------- */
demarrer({
  /* Onde de choc WebGL : ordinateur et tablette seulement (sur téléphone, l'intro porte la signature). */
  pret: [document.querySelector('[data-onde-choc]') && !etat.calme && window.innerWidth > 760
    ? import('./onde-choc.js?v=2').then((m) => { onde = m.initOndeChoc(document.querySelector('[data-onde-choc]')); return onde && onde.pret; }).catch((err) => console.warn('[onde-choc]', err))
    : null].filter(Boolean),
  preparer() {
    initPanier();
    if (page === 'boutique') initBoutique();
    if (page === 'seance') initKit();
    if (page === 'contact') initEtapes();
    if (!gsap || !ST) return;
    const faire = (fn) => { try { fn(); } catch (err) { console.error('[vizrok]', fn.name, err); } };
    [enteteApresSaut, heroTelephone, chrono, rubanVitesse, manifeste, collections, maillot, neon, disquesRoulent, eclate, shaker, bordereau, disque404].forEach(faire);
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
