/* Panier simulé : une seule source (localStorage « vizrok:panier »), identique dans tous les onglets (événement storage),
   donnée abîmée nettoyée sans bloquer le site, tiroir avec focus gardé, Échap et retour du focus,
   produit qui s'envole vers le panier, total et ajouts annoncés aux lecteurs d'écran. Rien n'est payé. */
import { etat, suivre, lacher, partir } from './socle/index.js?v=2';

const CLE = 'vizrok:panier';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const euros = (n) => n.toFixed(2).replace('.', ',') + ' €';
let produits = [];
let ouvreur = null;

export const catalogue = () => produits;
const trouver = (id) => produits.find((p) => p.id === id);

function lire() {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return [];
    const v = JSON.parse(brut);
    if (!Array.isArray(v)) throw new Error('forme');
    return v.filter((l) => l && trouver(l.id) && Number.isFinite(+l.qte) && +l.qte > 0).map((l) => ({ id: l.id, couleur: String(l.couleur || ''), taille: String(l.taille || ''), qte: Math.min(20, Math.round(+l.qte)) }));
  } catch {
    try { localStorage.removeItem(CLE); } catch {}
    return [];
  }
}
function ecrire(lignes) {
  try { localStorage.setItem(CLE, JSON.stringify(lignes)); } catch {}
  rendre(lignes);
}

export function ajouter({ id, couleur = '', taille = '', qte = 1 }, depuis) {
  const p = trouver(id);
  if (!p) return;
  const lignes = lire();
  const l = lignes.find((x) => x.id === id && x.couleur === couleur && x.taille === taille);
  if (l) l.qte = Math.min(20, l.qte + qte); else lignes.push({ id, couleur, taille, qte });
  ecrire(lignes);
  annoncer(`${p.court} ${$('[data-panier-annonce]')?.dataset.ajoute || 'ajouté au panier'}. Total ${euros(total(lignes))}.`);
  envol(depuis);
}

const total = (lignes) => lignes.reduce((s, l) => s + (trouver(l.id)?.prix || 0) * l.qte, 0);

function image(p, couleur) {
  const i = Math.max(0, p.couleurs.findIndex((c) => c.nom === couleur));
  if (!p.vues || !p.vues.length) return `<span class="pl-visuel" aria-hidden="true">${(p.dessins || [])[Math.min(i, (p.dessins || [1]).length - 1)] || ''}</span>`;
  const v = p.vues[0];
  const w = v.largeurs.find((x) => x >= 240) || v.largeurs[v.largeurs.length - 1];
  return `<img src="${v.src}-${w}.webp" alt="" width="64" height="64" loading="lazy" style="background:${v.fond}${v.plein ? ';object-fit:cover' : ''}">`;
}

function rendre(lignes = lire()) {
  const n = lignes.reduce((s, l) => s + l.qte, 0);
  $$('[data-panier-compte]').forEach((el) => { el.textContent = String(n); });
  const liste = $('[data-panier-liste]');
  if (!liste) return;
  const T = liste.closest('.panier').dataset;
  liste.innerHTML = lignes.map((l, i) => {
    const p = trouver(l.id);
    const variante = [l.couleur, l.taille].filter(Boolean).join(' · ');
    return `<li class="panier-ligne">
      ${image(p, l.couleur)}
      <div><p class="pl-nom">${p.court}</p>${variante ? `<p class="pl-variante">${variante}</p>` : ''}
        <div class="pl-qte"><button type="button" data-qte="-1" data-ligne="${i}" aria-label="${T.tMoins} : ${p.court}">−</button><output aria-label="${T.tQuantite}">${l.qte}</output><button type="button" data-qte="1" data-ligne="${i}" aria-label="${T.tPlus} : ${p.court}">+</button></div></div>
      <div class="pl-prix"><span data-prix>${euros(p.prix * l.qte)}</span><button type="button" class="pl-retirer" data-retirer="${i}" aria-label="${T.tRetirer} : ${p.court}">${T.tRetirer}</button></div>
    </li>`;
  }).join('');
  $('[data-panier-vide]').hidden = lignes.length > 0;
  $('[data-panier-total]').textContent = euros(total(lignes));
  $('[data-panier-commander]').disabled = !lignes.length;
}

function annoncer(t) {
  const a = $('[data-panier-annonce]');
  if (!a) return;
  a.textContent = '';
  setTimeout(() => { a.textContent = t; }, 60);
}

/* Le produit s'envole vers le bouton Panier visible (en-tête ou barre du téléphone). */
function envol(depuis) {
  const cible = $$('[data-panier-ouvrir]').find((b) => b.offsetParent !== null && b.getBoundingClientRect().top >= 0);
  if (!depuis || !cible || etat.calme || !window.gsap) { cible?.animate?.([{ transform: 'scale(1.15)' }, { transform: 'none' }], { duration: 300 }); return; }
  const a = depuis.getBoundingClientRect(), b = cible.getBoundingClientRect();
  const point = document.createElement('span');
  point.className = 'panier-vole';
  point.dataset.auditIgnorer = '';
  point.setAttribute('aria-hidden', 'true');
  document.body.appendChild(point);
  const x0 = a.left + a.width / 2 - 28, y0 = a.top + a.height / 2 - 28, x1 = b.left + b.width / 2 - 28, y1 = b.top + b.height / 2 - 28;
  window.gsap.timeline({ onComplete: () => { point.remove(); cible.animate([{ transform: 'scale(1.18)' }, { transform: 'none' }], { duration: 320, easing: 'ease-out' }); } })
    .fromTo(point, { x: x0, y: y0, scale: 0.6 }, { x: x1, duration: 0.7, ease: 'power1.inOut' }, 0)
    .fromTo(point, { y: y0 }, { y: Math.min(y0, y1) - 120, duration: 0.35, ease: 'power2.out' }, 0)
    .to(point, { y: y1, duration: 0.35, ease: 'power2.in' }, 0.35)
    .to(point, { scale: 0.2, opacity: 0, duration: 0.2 }, 0.55);
}

function ouvrir(depuis) {
  const p = $('#panier');
  if (!p) return;
  ouvreur = depuis || document.activeElement;
  p.hidden = false;
  document.documentElement.classList.add('panier-ouvert');
  suivre(p);
  $$('[data-panier-ouvrir]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
  requestAnimationFrame(() => { p.classList.add('est-ouvert'); $('.panier-tiroir', p).focus(); });
}
function fermer() {
  const p = $('#panier');
  if (!p || p.hidden) return;
  p.classList.remove('est-ouvert');
  $$('[data-panier-ouvrir]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
  const fin = () => { p.hidden = true; document.documentElement.classList.remove('panier-ouvert'); lacher(p); };
  if (etat.calme) fin(); else setTimeout(fin, 420);
  if (ouvreur && ouvreur.focus) ouvreur.focus();
}

export function initPanier() {
  try { produits = JSON.parse($('#donnees-produits')?.textContent || '[]'); } catch { produits = []; }
  const p = $('#panier');
  if (!p) return;
  rendre();
  window.addEventListener('storage', (e) => { if (e.key === CLE || e.key === null) rendre(); });
  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-panier-ouvrir]');
    if (o) { e.preventDefault(); ouvrir(o); return; }
    if (e.target.closest('[data-panier-fermer]')) { fermer(); return; }
    const aj = e.target.closest('[data-ajouter]');
    if (aj && !aj.closest('[data-fiche-volet]')) {
      const prod = trouver(aj.dataset.ajouter);
      if (!prod) return;
      /* Un produit à plusieurs tailles ou couleurs s'ouvre en fiche dans la boutique ; sinon il part directement. */
      const i = aj.dataset.couleur != null ? +aj.dataset.couleur : 0;
      const couleur = prod.couleurs[i]?.nom || '';
      if (prod.tailles.length > 1) {
        if (document.querySelector('[data-fiche-volet]')) window.dispatchEvent(new CustomEvent('vizrok:fiche', { detail: { id: prod.id, couleur: i, depuis: aj } }));
        else partir(new URL(`/boutique?produit=${prod.id}&couleur=${i}`, location.href), document.querySelector('[data-libelle-boutique]')?.dataset.libelleBoutique || 'Boutique');
        return;
      }
      ajouter({ id: prod.id, couleur, taille: prod.tailles[0] }, aj);
      aj.closest('.fiche')?.classList.add('est-ajoutee');
      return;
    }
    const q = e.target.closest('[data-qte]');
    if (q) {
      const lignes = lire(), l = lignes[+q.dataset.ligne];
      if (!l) return;
      l.qte += +q.dataset.qte;
      ecrire(lignes.filter((x) => x.qte > 0));
      annoncer(`${$('[data-panier-total]').textContent}`);
      return;
    }
    const r = e.target.closest('[data-retirer]');
    if (r) { const lignes = lire(); lignes.splice(+r.dataset.retirer, 1); ecrire(lignes); $('.panier-tiroir').focus(); return; }
    if (e.target.closest('[data-panier-commander]')) {
      const m = $('[data-panier-message]');
      m.hidden = false;
      ecrire([]);
      $('[data-panier-commander]').disabled = true;
    }
  });
  document.addEventListener('keydown', (e) => {
    if (p.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); fermer(); return; }
    if (e.key === 'Tab') {
      const f = $$('button:not([disabled]), a[href], [tabindex="-1"]', $('.panier-tiroir', p)).filter((x) => x.offsetParent !== null || x.classList.contains('panier-tiroir'));
      if (!f.length) return;
      const premier = f[0], dernier = f[f.length - 1];
      if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
      else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
    }
  });
}
