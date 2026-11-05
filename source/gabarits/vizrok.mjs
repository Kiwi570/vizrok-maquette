/* Briques propres à Vizrok, partagées par les pages : prix, visuel produit, fiche produit, disque. */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { html, brut } from '../../outils/gabarit.mjs';

const racine = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dossierProduits = join(racine, 'assets/images/produits');
/* Fond relevé et mode d'affichage de chaque vue (donnees/vues.json, écrit avec les images) :
   « contenu » = photo studio sur fond uni, posée sur une plaque de la même couleur ; « plein » = scène recadrée. */
const fichierVues = join(racine, 'donnees/vues.json');
const INFOS = existsSync(fichierVues) ? JSON.parse(readFileSync(fichierVues, 'utf8')) : {};
export const infoVue = (id, i = 0) => (INFOS[id] || [])[i] || { fond: '#101C2E', affichage: 'contenu' };

export const CATEGORIES = [
  { cle: 'vetements', disque: 'd-vert' },
  { cle: 'accessoires', disque: 'd-jaune' },
  { cle: 'nutrition', disque: 'd-orange' },
  { cle: 'deco', disque: 'd-blanc' },
];

export const prix = (n) => n.toFixed(2).replace('.', ',') + ' €';

/* Vues disponibles d'un produit : assets/images/produits/<id>-<n>-<largeur>.webp (n = 1, 2…). */
export function vues(id) {
  if (!existsSync(dossierProduits)) return [];
  const n = new Set();
  for (const f of readdirSync(dossierProduits)) {
    const m = f.match(new RegExp(`^${id}-(\\d+)-\\d+\\.webp$`));
    if (m) n.add(+m[1]);
  }
  return [...n].sort((a, b) => a - b).map((i) => `produits/${id}-${i}`);
}

/* Vues d'un produit avec leurs largeurs, pour la fiche en volet et le panier (données JSON de la page). */
export function vuesDetail(id) {
  return vues(id).map((nom) => {
    const base = nom.split('/').pop();
    const largeurs = readdirSync(dossierProduits).map((f) => f.match(new RegExp(`^${base}-(\\d+)\\.webp$`))).filter(Boolean).map((m) => +m[1]).sort((a, b) => a - b);
    const i = +base.split('-').pop() - 1;
    const { fond, affichage } = infoVue(id, i);
    return { src: `/assets/images/${nom}`, largeurs, fond, plein: affichage === 'plein' };
  });
}

/* Dessin de secours d'un produit sans photo (un par type, à la couleur du coloris, avec l'éclair Vizrok) :
   utilisé seulement si assets/images/produits/ ne contient aucune vue du produit. */
const ECLAIR = (x, y, k = 1) => `<path class="vc-eclair" transform="translate(${x} ${y}) scale(${k})" d="M14 1 2 18h8l-2 13L22 12h-8l2-11z"/>`;
const TEE = 'M82 46 104 36c4 10 28 10 32 0l22 10 30 30-22 22-14-12v104H88V86L74 98 52 76z';
export const DESSINS = {
  maillot: `<path class="vc-corps" d="${TEE}"/><path class="vc-trait" d="M104 36 88 86M136 36l16 50"/><path class="vc-trait" d="M106 38c6 8 22 8 28 0"/>${ECLAIR(108, 104, 0.9)}`,
  tshirt: `<path class="vc-corps" d="${TEE}"/><path class="vc-trait" d="M104 36c4 12 28 12 32 0"/>${ECLAIR(108, 100, 0.9)}`,
  pantalon: '<path class="vc-corps" d="M86 30h68l8 172h-34l-8-118-8 118H78z"/><path class="vc-trait" d="M86 46h68M86 30v16M154 30v16M80 190h32M128 190h32"/>' + ECLAIR(92, 70, 0.7),
  'hoodie-lane-seven': `<path class="vc-corps" d="M80 50 100 40c-6-24 46-24 40 0l20 10 28 66-20 8-18-40v112H90V84l-18 40-20-8z"/><path class="vc-trait" d="M100 40c4 18 36 18 40 0M100 160h40l-6-26h-28zM90 190h60M52 116l20 8M188 116l-20 8"/>${ECLAIR(110, 92, 0.85)}`,
  'hoodie-cotton-heritage': `<path class="vc-corps" d="M80 50 100 40c-6-24 46-24 40 0l20 10 28 66-20 8-18-40v112H90V84l-18 40-20-8z"/><path class="vc-trait" d="M100 40c4 18 36 18 40 0M100 160h40l-6-26h-28zM90 190h60M52 116l20 8M188 116l-20 8"/>${ECLAIR(110, 92, 0.85)}`,
  'pull-cotton-heritage': `<path class="vc-corps" d="M80 46 104 36c4 10 28 10 32 0l24 10 26 64-20 8-18-40v116H88V78l-18 40-20-8z"/><path class="vc-trait" d="M88 186h64M50 106l20 8M190 106l-20 8"/>${ECLAIR(108, 96, 0.9)}`,
  'pull-stanley-stella': `<path class="vc-corps" d="M72 48 100 36c4 10 36 10 40 0l28 12 26 66-22 8-18-40v116H86V82l-18 40-22-8z"/><path class="vc-trait" d="M86 188h68M46 112l22 8M194 112l-22 8"/>${ECLAIR(108, 96, 0.9)}`,
  bob: '<path class="vc-corps" d="M84 84c0-34 72-34 72 0l4 34h-80z"/><path class="vc-corps" d="M50 122c16-8 124-8 140 0-6 14-128 14-140 0z"/>' + ECLAIR(110, 78, 0.8),
  casquette: '<path class="vc-corps" d="M66 128c0-52 100-60 108-4z"/><path class="vc-corps" d="M150 124c20 0 44 4 50 16-18 6-46 4-62-2z"/><path class="vc-trait" d="M120 66v58"/>' + ECLAIR(96, 92, 0.75),
  gourde: '<path class="vc-corps" d="M104 26h32v22c0 10 18 18 18 40v104a12 12 0 0 1-12 12H98a12 12 0 0 1-12-12V88c0-22 18-30 18-40z"/><path class="vc-trait" d="M104 40h32"/>' + ECLAIR(108, 120, 0.9),
  'verre-shaker': '<path class="vc-corps vc-verre" d="M78 40h84l-12 164H90z"/><ellipse class="vc-trait" cx="120" cy="40" rx="42" ry="6"/><path class="vc-trait" d="M96 70l6 110"/>',
  'verre-canette': '<path class="vc-corps vc-verre" d="M84 46c0-6 72-6 72 0l-4 14v126l4 12c0 8-72 8-72 0l4-12V60z"/><ellipse class="vc-trait" cx="120" cy="46" rx="36" ry="6"/><path class="vc-trait" d="M98 74v100"/>',
  poster: '<rect class="vc-corps" x="34" y="56" width="172" height="130" rx="2"/><path class="vc-trait" d="M48 168 96 108l30 34 22-22 44 48z"/>' + ECLAIR(150, 72, 0.9),
  nutrimax: '<rect class="vc-corps" x="46" y="86" width="64" height="104" rx="8"/><rect class="vc-corps" x="122" y="70" width="72" height="120" rx="8"/><path class="vc-trait" d="M46 104h64M122 90h72"/>' + ECLAIR(146, 120, 0.9),
  energy: '<path class="vc-corps" d="M96 34h48l6 12v148l-6 10H96l-6-10V46z"/><path class="vc-trait" d="M90 58h60M90 182h60"/>' + ECLAIR(108, 104, 0.9),
  barre: '<path class="vc-corps" d="M30 104l16-12h148l16 12-16 12H46z"/><path class="vc-trait" d="M58 92v24M182 92v24"/>' + ECLAIR(110, 92, 0.7),
  'built-to-perform': '<rect class="vc-corps" x="40" y="80" width="70" height="110" rx="8"/><rect class="vc-corps" x="118" y="104" width="44" height="86" rx="6"/><path class="vc-corps" d="M170 150h40v40h-40z"/><path class="vc-trait" d="M40 100h70"/>' + ECLAIR(62, 120, 0.85),
  whey: '<rect class="vc-corps" x="70" y="58" width="100" height="136" rx="12"/><path class="vc-corps" d="M66 40h108v22H66z"/><path class="vc-trait" d="M70 90h100"/>' + ECLAIR(108, 118, 0.9),
};
export function dessin(p, vue = 0) {
  const col = p.couleurs[Math.min(vue, Math.max(0, p.couleurs.length - 1))];
  return `<svg viewBox="0 0 240 230" aria-hidden="true" style="--remplissage:${col ? col.hex : '#1B2D4D'}">${DESSINS[p.id] || DESSINS.whey}</svg>`;
}
export function visuelCode(p, vue = 0) {
  return html`<div class="visuel-code visuel-code--${p.categorie}" data-visuel role="img" aria-label="${p.court}">
  ${brut(dessin(p, vue))}
  <span>${p.court}</span>
</div>`;
}

/* Visuel d'un produit : la photo de la boutique (vue n), posée sur une plaque de la couleur de son fond.
   teinte : aperçu d'un coloris sur la photo blanche (maillot), par un calque en produit. */
export function visuelProduit(c, p, { vue = 0, classe = '', sizes = '(max-width: 760px) 50vw, 25vw', priorite = false, attrs = '', teinte = '' } = {}) {
  const v = vues(p.id);
  if (!v.length) return html`<figure class="media media--produit ${classe}"${brut(attrs ? ' ' + attrs : '')}>${visuelCode(p, vue)}</figure>`;
  const i = Math.min(vue, v.length - 1), info = infoVue(p.id, i);
  return c.media({ nom: v[i], alt: p.nom, classe: `media--produit${info.affichage === 'plein' ? ' media--plein' : ''}${clair(info.fond) ? ' media--clair' : ''}${teinte ? ' media--teinte' : ''} ${classe}`, sizes, priorite, attrs,
    style: `--plaque:${info.fond}` + (teinte ? `;--teinte:${teinte}` : '') });
}

/* Fond clair (verre shaker, photos portées) : plaque claire assumée, cadrée comme une boîte à lumière. */
const clair = (hex) => /^#[0-9A-F]{6}$/i.test(hex) && [1, 3, 5].reduce((s, k) => s + parseInt(hex.slice(k, k + 2), 16), 0) / 3 > 200;

/* Vue montrée au survol d'une fiche : la première dont le fond change (photo portée, détail), sinon la deuxième. */
export function vueAlternative(p) {
  const v = vues(p.id);
  if (v.length < 2) return null;
  const f0 = infoVue(p.id, 0).fond;
  let i = v.findIndex((_, k) => k > 0 && infoVue(p.id, k).fond !== f0);
  if (i < 0) i = 1;
  const info = infoVue(p.id, i);
  return { src: `/assets/images/${v[i]}`, fond: info.fond, plein: info.affichage === 'plein' };
}

/* Fiche produit de la boutique et des galeries : le prix est visible au recto. */
export function carteProduit(c, p, { classe = '', niveau = 3, sizes } = {}) {
  const H = `h${niveau}`, alt = vueAlternative(p);
  return html`<article class="fiche ${classe}" data-produit="${p.id}" data-categorie="${p.categorie}" data-prix-valeur="${p.prix}" data-nom="${p.nom} ${p.court} ${p.description}">
  <a class="fiche-lien" href="${c.url('boutique', '', 'produit=' + p.id)}" data-produit-ouvrir="${p.id}" data-libelle="${c.libelle('boutique')}"${alt ? brut(` data-vue-alt="${alt.src}" data-vue-alt-fond="${alt.fond}"${alt.plein ? ' data-vue-alt-plein' : ''}`) : ''}>
    ${visuelProduit(c, p, { classe: 'fiche-media', sizes })}
    <${brut(H)} class="fiche-nom">${p.court}</${brut(H)}>
  </a>
  <p class="fiche-ligne"><span class="fiche-prix" data-prix>${prix(p.prix)} <small>${c.t('commun.ht')}</small></span>${p.couleurs.length ? html`<span class="fiche-couleurs" role="img" aria-label="${p.couleurs.map((x) => x.nom).join(', ')}">${p.couleurs.map((x) => html`<i style="--c:${x.hex}"></i>`)}</span>` : ''}</p>
  ${p.aCompleter ? html`<p class="fiche-note"><span>${c.t('commun.ficheACompleter')}</span></p>` : ''}
  ${p.tailles.length > 1 ? html`<div class="fiche-rapide" aria-hidden="true"><p class="fr-titre">${c.t('commun.ajoutRapide')}</p><div class="fr-tailles">${p.tailles.map((t) => html`<button type="button" tabindex="-1" data-rapide="${p.id}" data-taille="${t}">${t}</button>`)}</div></div>` : ''}
  <button type="button" class="bouton bouton--petit fiche-ajouter" data-ajouter="${p.id}" aria-label="${(p.tailles.length > 1 ? c.s('commun.choisir') : c.s('commun.ajouter')) + ' : ' + p.court}">${p.tailles.length > 1 ? c.t('commun.choisir') : c.t('commun.ajouter')}</button>
</article>`;
}

/* Disque de fonte en SVG (intro, collections, filtres, 404). */
export function disque(classe = '', etiquette = '') {
  return html`<svg class="disque ${classe}" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48" class="disque-bord"/><circle cx="50" cy="50" r="38" class="disque-face"/><circle cx="50" cy="50" r="30" class="disque-rainure"/><circle cx="50" cy="50" r="7" class="disque-trou"/>${etiquette ? html`<text x="50" y="27" text-anchor="middle" class="disque-texte">${etiquette}</text>` : ''}</svg>`;
}
