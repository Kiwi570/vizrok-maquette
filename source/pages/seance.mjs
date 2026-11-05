/* Ta séance : ouverture scindée (chrono LED de salle qui démarre puis devient le titre, photo encadrée à droite),
   maillot en vue éclatée épinglée, guide des tailles converti en cm, kit au vestiaire (composeur, total qui compte),
   accessoires en cascade. */
import { html, brut } from '../../outils/gabarit.mjs';
import { prix, visuelProduit, carteProduit } from '../gabarits/vizrok.mjs';

export const page = { cle: 'seance', fichier: 'seance', imagePartage: 'grok/seance-ouverture-1280.webp' };

/* Guide du fournisseur : valeurs en pouces affichées « cm » sur la boutique actuelle, converties ici. */
const GUIDE = [['S', 27.56, 19.69], ['M', 28.35, 20.87], ['L', 29.13, null], ['XL', 29.92, 23.23], ['2XL', 30.71, 24.41]];
const cm = (p) => Math.round(p * 2.54);
/* Repères du scanner sur la photo du maillot (pièce, x %, y %), dans l'ordre où la ligne laser les atteint. */
const REPERES = [[5, 44, 15.6], [3, 61, 18.5], [2, 31, 27], [1, 58, 50], [4, 26, 69]];

export default (c) => {
  const P = c.donnees.produits;
  const get = (id) => P.find((p) => p.id === id);
  const maillot = get('maillot');
  const accessoires = P.filter((p) => p.categorie === 'accessoires');
  const groupes = [
    { cle: 'maillot', options: [get('maillot')], couleurs: true, requis: true },
    { cle: 'gourde', options: [get('gourde')], couleurs: true },
    { cle: 'verre', options: [get('verre-shaker'), get('verre-canette')] },
    { cle: 'tete', options: [get('casquette'), get('bob')] },
  ];
  return html`
<section class="s-tete" id="debut">
  <div class="s-tete-texte">
    <p class="surtitre">${c.t('seance.surtitre')}</p>
    <div class="chrono" data-effet="chrono-led" aria-hidden="true">
      <span class="chrono-cadre"><span class="chrono-chiffres" data-chrono>00:00</span></span>
      <span class="chrono-libelle">${c.t('seance.chrono')}</span>
    </div>
    <h1 class="s-titre" data-anime>${c.t('seance.titre')}</h1>
    <p data-anime>${c.t('seance.texte')}</p>
    <p class="s-actions" data-anime><a class="bouton" href="#kit" data-action-principale data-survol="magnetique">${c.t('seance.action')}</a> <span class="s-info" data-info-cle>${c.t('seance.info')}</span></p>
  </div>
  ${c.media({ nom: 'grok/seance-ouverture', alt: c.s('seance.alt'), cadrage: '66% 55%', cadrageMobile: '55% 65%', priorite: true, classe: 's-tete-media', sizes: '(max-width: 760px) 100vw, 50vw', attrs: 'data-fx="zoom" data-fx-force="10"' })}
</section>

<section class="eclate scanner" id="eclate" data-effet="maillot-scanner">
  <div class="eclate-cadre conteneur">
    <div class="eclate-texte">
      <p class="surtitre">${c.t('seance.eclate.surtitre')}</p>
      <h2 data-anime="lignes">${c.t('seance.eclate.titre')}</h2>
      <ol class="eclate-liste">
        ${REPERES.map(([i]) => html`<li data-piece="${i}"><strong>${c.t('seance.eclate.p' + i)}</strong> <span>${c.t('seance.eclate.p' + i + 't')}</span></li>`)}
      </ol>
      <p class="eclate-couleurs">${c.t('seance.eclate.couleurs')} <span data-prix>${prix(maillot.prix)} ${c.t('commun.ht')}</span></p>
    </div>
    <div class="scan-scene" data-visuel>
      <div class="scan-photo" style="--photo:url(/assets/images/produits/maillot-1-1200.webp)">
        ${visuelProduit(c, maillot, { classe: 'scan-base', sizes: '(max-width: 760px) 90vw, 40vw' })}
        <div class="scan-eclaire" aria-hidden="true"></div>
        <div class="scan-grille" aria-hidden="true"></div>
        <div class="scan-ligne" aria-hidden="true"><span></span></div>
        ${REPERES.map(([i, x, y], k) => html`<span class="scan-repere" data-repere="${i}" style="--x:${x}%;--y:${y}%" aria-hidden="true">${k + 1}</span>`)}
      </div>
      <div class="scan-loupe" aria-hidden="true" style="--photo:url(/assets/images/produits/maillot-1-1200.webp)"><span class="scan-loupe-vue"></span><span class="scan-loupe-titre">${c.t('seance.eclate.loupe')} · <b data-loupe-titre>${c.t('seance.eclate.p' + REPERES[3][0])}</b></span></div>
    </div>
  </div>
</section>

<section class="guide-tailles conteneur" id="tailles">
  <div class="tailles-texte">
    <p class="surtitre">${c.t('seance.tailles.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('seance.tailles.titre')}</h2>
    <p>${c.t('seance.tailles.texte')}</p>
    <table class="tailles-table" data-anime>
      <thead><tr><th scope="col">${c.t('seance.tailles.taille')}</th><th scope="col">A · ${c.t('seance.tailles.longueur')}</th><th scope="col">B · ${c.t('seance.tailles.largeur')}</th></tr></thead>
      <tbody>${GUIDE.map(([t, a, b]) => html`<tr><th scope="row">${t}</th><td>${cm(a)} cm</td><td>${b ? html`${cm(b)} cm` : html`<em>${c.t('seance.tailles.confirmer')}</em>`}</td></tr>`)}</tbody>
    </table>
  </div>
  <figure class="tailles-schema" data-visuel>
    <svg viewBox="0 0 320 340" aria-hidden="true">
      <path class="ts-maillot" d="M95 40h130l50 34-22 40-28-18v210H95V96l-28 18-22-40z" fill="none" stroke-width="2.5" stroke-linejoin="round"/>
      <path class="ts-cote" d="M80 40v266M72 40h16M72 306h16" stroke-width="2" fill="none"/>
      <path class="ts-cote" d="M95 150h130M95 142v16M225 142v16" stroke-width="2" fill="none"/>
      <text class="ts-lettre" x="62" y="178">A</text><text class="ts-lettre" x="154" y="138">B</text>
    </svg>
    <figcaption>${c.t('seance.tailles.a')}<br>${c.t('seance.tailles.b')}</figcaption>
  </figure>
</section>

<section class="kit" id="kit" data-effet="vestiaire-kit">
  <div class="kit-mur">
    ${c.media({ nom: 'grok/seance-vestiaire', alt: c.s('seance.kit.alt'), cadrage: '50% 60%', classe: 'kit-fond', sizes: '(max-width: 760px) 100vw, 60vw' })}
    <div class="kit-crochets" aria-hidden="true">
      ${groupes.map((g) => html`<div class="kit-crochet" data-crochet="${g.cle}"><span class="kit-pique"></span><div class="kit-objet" data-kit-objet="${g.cle}"></div></div>`)}
    </div>
    <div class="kit-banc" aria-hidden="true"><span>${c.t('seance.kit.total')}</span> <strong data-kit-total data-prix>${prix(maillot.prix)}</strong></div>
  </div>
  <form class="kit-form" data-kit aria-labelledby="kit-titre">
    <p class="surtitre">${c.t('seance.kit.surtitre')}</p>
    <h2 id="kit-titre" data-anime="lignes">${c.t('seance.kit.titre')}</h2>
    <p>${c.t('seance.kit.texte')}</p>
    ${groupes.map((g) => html`<fieldset class="kit-groupe">
      <legend>${c.t('seance.kit.' + g.cle)}</legend>
      <div class="kit-choix">
        ${g.requis ? '' : html`<label class="kit-option"><input type="radio" data-superpose name="kit-${g.cle}" value="" checked><span>${c.t('seance.kit.aucun')}</span></label>`}
        ${g.options.map((p, i) => g.couleurs && p.couleurs.length
          ? p.couleurs.map((col, j) => html`<label class="kit-option kit-option--couleur" style="--c:${col.hex}"><input type="radio" data-superpose name="kit-${g.cle}" value="${p.id}|${col.nom}" data-prix-option="${p.prix}"${g.requis && j === 0 ? brut(' checked') : ''}><span>${p.court} · ${col.nom} <b data-prix>${prix(p.prix)}</b></span></label>`)
          : html`<label class="kit-option"><input type="radio" data-superpose name="kit-${g.cle}" value="${p.id}|" data-prix-option="${p.prix}"><span>${p.court} <b data-prix>${prix(p.prix)}</b></span></label>`)}
      </div>
      ${g.cle === 'maillot' ? html`<div class="kit-taille"><label for="kit-taille">${c.t('boutique.taille')}</label><select id="kit-taille" name="kit-taille">${maillot.tailles.map((t) => html`<option${t === 'M' ? brut(' selected') : ''}>${t}</option>`)}</select></div>` : ''}
    </fieldset>`)}
    <div class="kit-total">
      <p><span>${c.t('seance.kit.total')}</span> <strong data-kit-total data-prix>${prix(maillot.prix)}</strong></p>
      <button type="submit" class="bouton" data-survol="magnetique">${c.t('seance.kit.ajouter')}</button>
      <p class="kit-note">${c.t('seance.kit.note')}</p>
      <p class="kit-ok" data-kit-ok role="status" hidden>${c.t('seance.kit.ajoute')}</p>
    </div>
    <p class="visuellement-cache" aria-live="polite" data-kit-annonce></p>
  </form>
</section>

<section class="s-accessoires" id="accessoires">
  <div class="s-acc-fond" aria-hidden="true">${c.media({ nom: 'grok/seance-acier', alt: '', sizes: '100vw', attrs: 'data-fx="parallaxe"' })}</div>
  <div class="conteneur">
    <p class="surtitre">${c.t('seance.accessoires.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('seance.accessoires.titre')}</h2>
    <p>${c.t('seance.accessoires.texte')}</p>
    <div class="s-acc-grille" data-anime="cascade">${accessoires.map((p) => carteProduit(c, p, { sizes: '(max-width: 760px) 50vw, 20vw' }))}</div>
  </div>
</section>

<section class="fin conteneur" id="fin">
  <div class="fin-disques" aria-hidden="true" data-visuel data-fx="trace"><svg viewBox="0 0 400 120"><path d="M10 60 H 390" stroke="currentColor" stroke-width="6" stroke-linecap="round" fill="none"/></svg></div>
  <h2 data-anime="lignes">${c.t('seance.fin.titre')}</h2>
  <p class="fin-actions" data-anime>${c.lien('boutique', { classe: 'bouton', texte: c.t('seance.fin.action'), attrs: 'data-survol="magnetique"' })}</p>
</section>
`;
};
