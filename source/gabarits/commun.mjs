/* Gabarit commun : head, en-tête, menu, panier en tiroir, pied de page, barre fixe du téléphone, voile, intro.
   Les conventions data-* sont celles que lisent le socle JavaScript et l'audit (voir le README du socle). */
import { html, brut } from '../../outils/gabarit.mjs';
import { vuesDetail, dessin } from './vizrok.mjs';

const navigation = (c) => c.site.navigation.filter((cle) => c.pages[cle] && (c.pages[cle].langues || c.langues).includes(c.l));
const marque = () => html`<span class="marque" aria-hidden="true"><svg class="marque-eclair" viewBox="0 0 24 32" width="18" height="24"><path d="M14 1 2 18h8l-2 13L22 12h-8l2-11z" fill="currentColor"/></svg></span>`;

function tete(c) {
  const p = c.page, cle = p.cle;
  const titre = c.s(`pages.${cle}.titre`), description = c.s(`pages.${cle}.description`);
  const ici = c.abs(c.url(cle));
  const imagePartage = c.abs(`/assets/partage/${p.partage === false ? 'accueil' : cle}-${c.l}.jpg`);
  const structure = c.donnees.structure ? JSON.stringify(c.donnees.structure).replace(/</g, '\\u003c') : '';
  return html`<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${titre}</title>
<meta name="description" content="${description}">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="${ici}">
<style>${brut(c.critique.css)}</style>
<script>${brut(c.critique.js)}</script>
${(c.site.polices || []).map((f) => html`<link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin>\n`)}<link rel="stylesheet" href="${c.asset('css/socle.css')}">
<link rel="stylesheet" href="${c.asset('css/site.css')}">
<link rel="modulepreload" href="${c.asset('js/site.js')}">
<link rel="modulepreload" href="${c.asset('js/socle/index.js')}">
<script src="/assets/vendor/gsap.min.js" defer></script>
<script src="/assets/vendor/ScrollTrigger.min.js" defer></script>
<script src="/assets/vendor/SplitText.min.js" defer></script>
<script src="/assets/vendor/Flip.min.js" defer></script>
<script type="module" src="${c.asset('js/site.js')}"></script>
<meta name="theme-color" content="${c.site.couleurs.theme || c.site.couleurs.fond}">
<link rel="icon" href="/assets/images/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${c.site.nom}">
<meta property="og:locale" content="fr_FR">
<meta property="og:title" content="${titre}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${ici}">
<meta property="og:image" content="${imagePartage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${c.s(`pages.${p.partage === false ? 'accueil' : cle}.partageAlt`)}">
<meta name="twitter:card" content="summary_large_image">
${structure ? html`<script type="application/ld+json">${brut(structure)}</script>` : ''}
</head>`;
}

function boutonPanier(c, classe = '') {
  return html`<button type="button" class="bouton bouton-panier ${classe}" data-panier-ouvrir aria-controls="panier" aria-expanded="false">${c.t('panier.bouton')} <span class="panier-compte" data-panier-compte>0</span></button>`;
}

function entete(c) {
  return html`<header data-entete>
  <div class="entete-rangee">
    <a class="entete-logo" href="${c.url('accueil')}" data-libelle="${c.libelle('accueil')}"${c.page.cle === 'accueil' ? brut(' aria-current="page"') : ''}>
      ${marque()}<span class="entete-nom">Vizrok<span class="entete-point">.store</span></span>
    </a>
    <nav data-nav aria-label="${c.s('commun.navigation')}">
      <ul>${navigation(c).filter((k) => k !== 'accueil').map((k) => html`<li>${c.lien(k)}</li>`)}</ul>
    </nav>
    <div class="entete-actions">
      ${boutonPanier(c)}
      <button type="button" data-menu-bouton aria-controls="menu" aria-expanded="false" data-libelle-ouvrir="${c.s('commun.menu')}" data-libelle-fermer="${c.s('commun.fermer')}"><span data-libelle-bouton>${c.t('commun.menu')}</span></button>
    </div>
  </div>
</header>
<div id="menu" data-menu role="dialog" aria-modal="true" aria-label="${c.s('commun.menu')}">
  <ul>${navigation(c).map((k, i) => html`<li style="--i:${i}">${c.lien(k, { classe: 'menu-lien' })}</li>`)}</ul>
  <ul class="menu-reseaux">${c.site.reseaux.map((r) => html`<li><a class="lien-reseau" href="${r.url}" target="_blank" rel="noopener">${r.nom} <span>${r.compte}</span></a></li>`)}</ul>
  <p><button type="button" class="lien" data-calme-bascule data-libelle-reduire="${c.s('commun.calmeReduire')}" data-libelle-retablir="${c.s('commun.calmeRetablir')}" data-libelle-systeme="${c.s('commun.calmeSysteme')}"><span data-libelle-bouton>${c.t('commun.calmeReduire')}</span></button></p>
</div>`;
}

/* Panier en tiroir : une seule source (localStorage « vizrok:panier »), identique dans tous les onglets.
   Rempli par assets/js/panier.js ; sans JavaScript, il reste caché et la boutique reste lisible. */
function panier(c) {
  return html`<div class="panier" id="panier" role="dialog" aria-modal="true" aria-labelledby="panier-titre" data-recouvrement hidden data-t-moins="${c.s('panier.moins')}" data-t-plus="${c.s('panier.plus')}" data-t-retirer="${c.s('panier.retirer')}" data-t-quantite="${c.s('panier.quantite')}">
  <div class="panier-fond" data-panier-fermer></div>
  <div class="panier-tiroir" tabindex="-1">
    <div class="panier-tete">
      <h2 id="panier-titre">${c.t('panier.titre')}</h2>
      <button type="button" class="panier-fermer" data-panier-fermer aria-label="${c.s('panier.fermer')}"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>
    </div>
    <p class="panier-vide" data-panier-vide>${c.t('panier.vide')}</p>
    <ul class="panier-liste" data-panier-liste></ul>
    <div class="panier-pied">
      <p class="panier-total"><span>${c.t('panier.total')}</span> <strong data-panier-total data-prix>0,00 €</strong></p>
      <p class="panier-note">${c.t('panier.note')}</p>
      <p class="panier-paiements" aria-label="${c.s('panier.paiementsLibelle')}">${c.donnees.paiements.map((p) => html`<span>${p}</span>`)}</p>
      <button type="button" class="bouton panier-commander" data-panier-commander>${c.t('panier.commander')}</button>
      <p class="panier-message" data-panier-message role="status" hidden>${c.t('panier.simule')}</p>
    </div>
    <p class="visuellement-cache" aria-live="polite" data-panier-annonce data-ajoute="${c.s('panier.ajoute')}"></p>
  </div>
</div>
<script type="application/json" id="donnees-produits">${brut(JSON.stringify(c.donnees.produits.map((p) => ({ id: p.id, nom: p.nom, court: p.court, categorie: p.categorie, categorieNom: c.s('accueil.collections.' + p.categorie), prix: p.prix, description: p.description, details: p.details, couleurs: p.couleurs, tailles: p.tailles, aCompleter: !!p.aCompleter, coloriPhoto: p.coloriPhoto || '', teinte: !!p.teinte, vues: vuesDetail(p.id), dessins: (p.couleurs.length ? p.couleurs : [null]).map((_, i) => dessin(p, i)) }))).replace(/</g, '\\u003c'))}</script>`;
}

function pied(c) {
  return html`<footer class="pied" id="pied" data-masque-barre>
  <div class="conteneur pied-haut">
    <p class="pied-signature" aria-hidden="true" data-audit-ignorer>Built to Perform.</p>
  </div>
  <div class="conteneur pied-grille">
    <div>
      <p class="pied-nom">${marque()} <strong>${c.site.nom}</strong></p>
      <p>${c.t('commun.piedTexte')}</p>
      <ul>${c.site.reseaux.map((r) => html`<li><a href="${r.url}" target="_blank" rel="noopener">${r.nom} ${r.compte}</a></li>`)}</ul>
    </div>
    <nav aria-label="${c.s('commun.sommaire')}">
      <p><strong>${c.t('commun.sommaire')}</strong></p>
      <ul>${navigation(c).map((k) => html`<li>${c.lien(k)}</li>`)}</ul>
    </nav>
    <div>
      <p><strong>${c.t('commun.confort')}</strong></p>
      <ul>
        <li><button type="button" class="lien" data-calme-bascule data-libelle-reduire="${c.s('commun.calmeReduire')}" data-libelle-retablir="${c.s('commun.calmeRetablir')}" data-libelle-systeme="${c.s('commun.calmeSysteme')}"><span data-libelle-bouton>${c.t('commun.calmeReduire')}</span></button></li>
        <li><a href="#haut" data-sans-transition>${c.t('commun.retourHaut')}</a></li>
      </ul>
      <p class="pied-legal">${c.t('commun.legal')}</p>
    </div>
  </div>
  <div class="conteneur pied-bas"><p>${c.t('commun.maquette')}</p><p>© 2026 ${c.site.nom}</p></div>
</footer>`;
}

function barre(c) {
  return html`<div data-barre-fixe>
  ${c.lien('boutique', { classe: 'bouton bouton--contour', texte: c.t('commun.barreBoutique') })}
  ${boutonPanier(c, 'bouton-panier--barre')}
</div>`;
}

function voile(c) {
  return html`<div data-voile aria-hidden="true"><div class="voile-contenu">${marque()}<span data-voile-libelle>${c.libelle(c.page.cle)}</span><span class="voile-barre"></span></div></div>`;
}

/* Panneau de l'intro : la barre chargée (accueil) ou, sur les autres pages, le même décor en plus court. */
function ouverture(c) {
  const disques = [
    { cle: 'vetements', n: 7, classe: 'd-vert' },
    { cle: 'accessoires', n: 5, classe: 'd-jaune' },
    { cle: 'nutrition', n: 5, classe: 'd-orange' },
    { cle: 'deco', n: 1, classe: 'd-blanc' },
  ];
  return html`<div class="ouverture-panneau" data-ouverture aria-hidden="true" data-effet="barre-chargee">
  <p class="intro-logo">${marque()}<span class="intro-neon">VIZROK</span></p>
  <div class="intro-scene">
    <div class="intro-barre"><span class="intro-manchon intro-manchon--g"></span><span class="intro-tige"></span><span class="intro-manchon intro-manchon--d"></span>
      ${['g', 'd'].map((cote) => html`<span class="intro-cote intro-cote--${cote}">${disques.map((d, i) => html`<span class="intro-disque ${d.classe}" style="--i:${i}"></span>`)}</span>`)}
    </div>
    <span class="intro-choc" aria-hidden="true"></span>
  </div>
  <p class="intro-mots"><span>${c.t('intro.mot1')}</span> <span>${c.t('intro.mot2')}</span> <span>${c.t('intro.mot3')}</span></p>
  <p class="intro-compteur"><span class="intro-compteur-libelle">${c.t('intro.pieces')}</span> <span class="intro-compteur-valeur" data-intro-compteur>00</span></p>
</div>`;
}

export function page(c, contenu) {
  return html`<!doctype html>
<html lang="${c.l}" data-v="${c.v}" data-page="${c.page.cle}"${c.site.curseur ? brut(' data-curseur') : ''}>
${tete(c)}
<body id="haut">
${voile(c)}
${ouverture(c)}
<a class="evitement" href="#contenu">${c.t('commun.evitement')}</a>
${entete(c)}
<main id="contenu" tabindex="-1"${c.page.sansAction ? brut(' data-sans-action') : ''}${c.page.sansEffet ? brut(' data-sans-effet') : ''}>
${contenu}
</main>
${pied(c)}
${barre(c)}
${panier(c)}
</body>
</html>`;
}
