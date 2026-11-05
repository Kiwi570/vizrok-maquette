/* Boutique : filtres en disques, recherche sans accents ni pluriels, tri, sélection gardée dans l'adresse
   (?collection=, ?q=, ?tri=, ?produit=), fiches réordonnées en Flip (déplacées, jamais recréées), fiche en volet
   (dialog natif) avec son propre lien, couleurs, tailles et ajout au panier. Mode calme : changement direct. */
import { etat, rafraichir, suivre, lacher } from './socle/index.js?v=4';
import { ajouter, catalogue } from './panier.js?v=4';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const euros = (n) => n.toFixed(2).replace('.', ',') + ' €';
const normal = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const racine = (m) => m.replace(/(es|s|x)$/, '');

export function initBoutique() {
  const grille = $('[data-grille]');
  if (!grille) return;
  const fiches = $$('.fiche', grille);
  const ordre = new Map(fiches.map((f, i) => [f, i]));
  const filtres = $$('[data-filtre]');
  const q = $('[data-recherche]'), tri = $('[data-tri]'), compte = $('[data-compte-affiche]'), aucun = $('[data-aucun]');
  const Flip = window.Flip;
  if (Flip && window.gsap) window.gsap.registerPlugin(Flip);
  const params = new URLSearchParams(location.search);
  let collection = params.get('collection') || 'tout';
  if (!filtres.some((f) => f.dataset.filtre === collection)) collection = 'tout';
  if (q && params.get('q')) q.value = params.get('q');
  if (tri && params.get('tri')) tri.value = params.get('tri');

  let flipEnCours = null, minuteur = 0;
  function appliquer({ anime = true, haut = false } = {}) {
    const mots = normal(q?.value).split(/\s+/).filter(Boolean).map(racine);
    const etatAvant = anime && Flip && !etat.calme ? Flip.getState(fiches) : null;
    if (flipEnCours) flipEnCours.progress(1);
    let n = 0;
    fiches.forEach((f) => {
      const texte = normal(f.dataset.nom);
      const ok = (collection === 'tout' || f.dataset.categorie === collection) && mots.every((m) => texte.includes(m));
      f.hidden = !ok;
      if (ok) n++;
    });
    const t = tri?.value || 'defaut';
    const tries = [...fiches].sort((a, b) => t === 'prix' ? a.dataset.prixValeur - b.dataset.prixValeur : t === 'prix-desc' ? b.dataset.prixValeur - a.dataset.prixValeur : ordre.get(a) - ordre.get(b));
    tries.forEach((f) => grille.appendChild(f));
    filtres.forEach((f) => f.setAttribute('aria-pressed', String(f.dataset.filtre === collection)));
    if (compte) compte.textContent = String(n);
    if (aucun) aucun.hidden = n > 0;
    rafraichir();
    if (etatAvant) flipEnCours = Flip.from(etatAvant, { duration: 0.55, ease: 'power3.inOut', absolute: false, nested: true, onComplete: () => rafraichir(), onEnter: (els) => window.gsap.fromTo(els, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.4 }), onLeave: (els) => window.gsap.to(els, { opacity: 0, scale: 0.94, duration: 0.3 }) });
    const u = new URL(location.href);
    collection === 'tout' ? u.searchParams.delete('collection') : u.searchParams.set('collection', collection);
    q?.value.trim() ? u.searchParams.set('q', q.value.trim()) : u.searchParams.delete('q');
    t === 'defaut' ? u.searchParams.delete('tri') : u.searchParams.set('tri', t);
    history.replaceState(history.state, '', u);
    setTimeout(() => {
      rafraichir();
      const cat = $('#catalogue');
      if (haut && cat && cat.getBoundingClientRect().top < 0) window.scrollTo({ top: window.scrollY + cat.getBoundingClientRect().top - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--entete-h')) || 64), behavior: 'instant' });
    }, anime ? 600 : 0);
  }
  filtres.forEach((f) => f.addEventListener('click', () => { collection = f.dataset.filtre; appliquer({ haut: true }); }));
  q?.addEventListener('input', () => { clearTimeout(minuteur); minuteur = setTimeout(() => appliquer({ haut: true }), 160); });
  tri?.addEventListener('change', () => appliquer());
  $('[data-effacer]')?.addEventListener('click', () => { collection = 'tout'; if (q) q.value = ''; appliquer({ haut: true }); });
  appliquer({ anime: false });

  initFiche();
}

/* ---------- Fiche en volet ---------- */
function initFiche() {
  const d = $('[data-fiche-volet]');
  if (!d || !d.showModal) return;
  let produit = null, ouvreur = null;
  const media = $('[data-fv-media]', d);

  function vue(p, i) {
    const v = p.vues[i];
    if (!v) { media.innerHTML = `<div class="visuel-code" data-visuel role="img" aria-label="${p.court}">${p.dessins[Math.min(i, p.dessins.length - 1)] || ''}<span>${p.court}</span></div>`; return; }
    const srcset = v.largeurs.map((w) => `${v.src}-${w}.webp ${w}w`).join(', ');
    const w = v.largeurs.find((x) => x >= 800) || v.largeurs[v.largeurs.length - 1];
    media.querySelector('img.fv-image')?.remove();
    media.style.setProperty('--plaque', v.fond || '#101C2E');
    media.insertAdjacentHTML('afterbegin', `<img class="fv-image${v.plein ? ' est-plein' : ''}" src="${v.src}-${w}.webp" srcset="${srcset}" sizes="(max-width: 760px) 100vw, 540px" alt="${p.nom}">`);
    $$('.fv-vignettes button', media).forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
  }

  function ouvrir(id, depuis, couleur = 0) {
    const p = catalogue().find((x) => x.id === id);
    if (!p) return;
    produit = p;
    ouvreur = depuis || null;
    media.innerHTML = '';
    if (p.vues.length > 1) {
      media.insertAdjacentHTML('beforeend', `<div class="fv-vignettes">${p.vues.map((v, k) => `<button type="button" aria-label="${media.dataset.vue || 'Vue'} ${k + 1}" aria-pressed="${k === 0}" style="background:${v.fond}"><img src="${v.src}-${v.largeurs[0]}.webp" alt="" loading="lazy"${v.plein ? ' class="est-plein"' : ''}></button>`).join('')}</div>`);
      $$('.fv-vignettes button', media).forEach((b, k) => b.addEventListener('click', () => vue(p, k)));
    }
    /* Avec les photos de la boutique, les vues ne suivent pas les coloris (photos d'un seul coloris) ; sans photo, le dessin prend la couleur. */
    vue(p, !p.vues.length && p.couleurs.length ? Math.min(couleur, p.couleurs.length - 1) : 0);
    $('[data-fv-categorie]', d).textContent = p.categorieNom;
    $('[data-fv-nom]', d).textContent = p.nom;
    $('[data-fv-prix]', d).textContent = euros(p.prix);
    $('[data-fv-description]', d).textContent = p.description;
    $('[data-fv-details]', d).innerHTML = p.details.map((x) => `<li>${x}</li>`).join('');
    $('[data-fv-note]', d).hidden = !p.aCompleter;
    const fc = $('[data-fv-couleurs]', d), ft = $('[data-fv-tailles]', d);
    fc.hidden = !p.couleurs.length;
    fc.querySelectorAll('label').forEach((l) => l.remove());
    p.couleurs.forEach((c, k) => fc.insertAdjacentHTML('beforeend', `<label class="pastille" style="--c:${c.hex}"><input type="radio" data-superpose name="fv-couleur" value="${c.nom}" data-k="${k}"${k ? '' : ' checked'}><span>${c.nom}</span></label>`));
    const choisie = $$('input', fc)[Math.min(couleur, p.couleurs.length - 1)];
    if (choisie) choisie.checked = true;
    const note = $('[data-fv-photo]', d);
    const noter = () => {
      const c = $('input[name="fv-couleur"]:checked', fc);
      note.hidden = !(p.vues.length && p.coloriPhoto && c && c.value !== p.coloriPhoto);
      note.textContent = (note.dataset.modele || '').replace('{coloris}', p.coloriPhoto);
    };
    $$('input', fc).forEach((i) => i.addEventListener('change', () => { if (!p.vues.length) vue(p, +i.dataset.k); noter(); }));
    noter();
    ft.querySelectorAll('label').forEach((l) => l.remove());
    ft.onchange = () => { $('[data-fv-erreur]', d).hidden = true; };
    const unique = p.tailles.length === 1;
    p.tailles.forEach((t) => ft.insertAdjacentHTML('beforeend', `<label class="taille"><input type="radio" data-superpose name="fv-taille" value="${t}"${unique ? ' checked' : ''}><span>${t}</span></label>`));
    $('[data-fv-erreur]', d).hidden = true;
    $('[data-fv-ok]', d).hidden = true;
    d.showModal();
    suivre(d);
    const u = new URL(location.href); u.searchParams.set('produit', p.id); history.replaceState(history.state, '', u);
    $('[data-fiche-fermer]', d).focus();
  }
  function fermer() { if (d.open) d.close(); }
  d.addEventListener('close', () => {
    lacher(d);
    const u = new URL(location.href); u.searchParams.delete('produit'); history.replaceState(history.state, '', u);
    if (ouvreur && ouvreur.focus) ouvreur.focus();
  });
  d.addEventListener('click', (e) => { if (e.target === d) fermer(); });
  $('[data-fiche-fermer]', d).addEventListener('click', fermer);
  $('[data-fv-ajouter]', d).addEventListener('click', (e) => {
    const t = $('input[name="fv-taille"]:checked', d), c = $('input[name="fv-couleur"]:checked', d);
    if (!t) { const err = $('[data-fv-erreur]', d); err.hidden = false; $('input[name="fv-taille"]', d)?.focus(); return; }
    ajouter({ id: produit.id, couleur: c ? c.value : '', taille: t.value }, e.currentTarget);
    $('[data-fv-ok]', d).hidden = false;
  });
  /* En capture : la fiche s'ouvre ici, sans transition de page (le socle ignore un clic déjà traité). */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-produit-ouvrir]');
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    ouvrir(a.dataset.produitOuvrir, a);
  }, true);
  window.addEventListener('vizrok:fiche', (e) => ouvrir(e.detail.id, e.detail.depuis, e.detail.couleur || 0));
  const sp = new URLSearchParams(location.search), id = sp.get('produit');
  if (id) {
    const go = () => ouvrir(id, $(`[data-produit-ouvrir="${CSS.escape(id)}"]`), +(sp.get('couleur') || 0));
    if (window.__socle?.pret) go(); else window.addEventListener('socle:pret', go, { once: true });
  }
}
