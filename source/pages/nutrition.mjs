/* Nutrition : ouverture sur fond clair, très grande étiquette nutritionnelle dont les lignes se tracent
   et dont les valeurs s'écrivent « à compléter » ; gamme avec un shaker collant dont le niveau monte à chaque produit ;
   six saveurs de la barre ; mentions obligatoires à compléter. Aucune allégation de santé. */
import { html } from '../../outils/gabarit.mjs';
import { prix, visuelProduit } from '../gabarits/vizrok.mjs';

export const page = { cle: 'nutrition', fichier: 'nutrition', imagePartage: 'grok/nutrition-bandeau-1280.webp' };

/* Couleur du liquide du shaker pour chaque produit de la gamme. */
const TEINTES = { nutrimax: '#3DFF8A', energy: '#E6FF3B', barre: '#D99A4E', 'built-to-perform': '#FF7A1F', whey: '#C08A5C' };

export default (c) => {
  const P = c.donnees.produits.filter((p) => p.categorie === 'nutrition');
  const barre = P.find((p) => p.id === 'barre');
  const N = c.donnees.nutrition;
  return html`
<section class="n-tete" id="debut">
  <div class="conteneur n-tete-cadre">
    <div class="n-tete-texte">
      <p class="surtitre">${c.t('nutrition.surtitre')}</p>
      <h1 class="n-titre" data-anime="lignes">${c.t('nutrition.titre')}</h1>
      <p data-anime>${c.t('nutrition.texte')}</p>
      <p class="n-actions" data-anime><a class="bouton" href="#gamme" data-action-principale>${c.t('nutrition.action')}</a> <span class="n-info" data-info-cle>${c.t('nutrition.info')}</span></p>
    </div>
    <div class="etiquette" data-effet="etiquette-trace" data-visuel role="img" aria-label="${c.s('nutrition.etiquette')}">
      <p class="et-titre">${c.t('nutrition.etiquetteTitre')} <span>${c.t('nutrition.pour')}</span></p>
      <ul class="et-lignes">
        ${N.lignes.map((l, i) => html`<li class="${l.startsWith('dont') ? 'et-sous' : ''}" style="--i:${i}"><span>${l}</span><span class="et-valeur" data-et-valeur>${c.t('commun.aCompleter')}</span></li>`)}
      </ul>
    </div>
  </div>
  ${c.media({ nom: 'grok/nutrition-bandeau', alt: c.s('nutrition.alt'), classe: 'n-bandeau', sizes: '100vw', attrs: 'data-fx="onde"' })}
</section>

<section class="gamme" id="gamme">
  <div class="conteneur gamme-cadre">
    <div class="gamme-shaker" data-effet="shaker-niveau" data-visuel aria-hidden="true">
      <svg viewBox="0 0 160 300">
        <defs><linearGradient id="sh-degrade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="sh-stop-a"/><stop offset="1" class="sh-stop-b"/></linearGradient><clipPath id="shaker-int"><path d="M34 70h92l-8 210a10 10 0 0 1-10 10H52a10 10 0 0 1-10-10z"/></clipPath></defs>
        <g clip-path="url(#shaker-int)">
          <path class="sh-niveau" d="M0 76H160V300H0Z" data-shaker-niveau/>
          <path class="sh-menisque" d="M0 76H160" data-shaker-menisque/>
          <g class="sh-bulles" data-shaker-bulles>${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => html`<circle cx="${48 + ((k * 37) % 64)}" cy="${280 - ((k * 53) % 180)}" r="${1.6 + (k % 3)}"/>`)}</g>
        </g>
        <path class="sh-verre" d="M34 70h92l-8 210a10 10 0 0 1-10 10H52a10 10 0 0 1-10-10z"/>
        <path class="sh-reflet" d="M48 84l5 186"/>
        <path class="sh-couvercle" d="M28 46h104v24H28z M58 14h44v32H58z"/>
        ${P.map((p, i) => html`<line class="sh-grad" x1="112" x2="124" y1="${270 - i * 44}" y2="${270 - i * 44}"/>`)}
      </svg>
      <span class="sh-compte" data-shaker-compte>0 / ${P.length}</span>
    </div>
    <div class="gamme-liste">
      <p class="surtitre">${c.t('nutrition.gamme.surtitre')}</p>
      <h2 data-anime="lignes">${c.t('nutrition.gamme.titre')}</h2>
      <p>${c.t('nutrition.gamme.texte')}</p>
      ${P.map((p, i) => html`<article class="n-produit" data-n-produit="${i + 1}" data-couleur="${TEINTES[p.id] || '#3DFF8A'}" id="n-${p.id}" data-anime>
        ${visuelProduit(c, p, { classe: 'n-produit-media', sizes: '(max-width: 760px) 40vw, 18vw' })}
        <div>
          <h3>${p.court}</h3>
          <p class="n-produit-prix" data-prix>${prix(p.prix)} ${c.t('commun.ht')}</p>
          <p>${p.description}</p>
          <ul class="n-produit-details">${p.details.map((d) => html`<li>${d}</li>`)}</ul>
          <p class="n-produit-actions">
            <button type="button" class="bouton bouton--petit" data-ajouter="${p.id}" aria-label="${c.s('commun.ajouter') + ' : ' + p.court}">${c.t('commun.ajouter')}</button>
            ${c.lien('boutique', { params: 'produit=' + p.id, classe: 'lien-fleche', texte: c.t('commun.voir') })}
          </p>
        </div>
      </article>`)}
    </div>
  </div>
</section>

<section class="clair saveurs" id="saveurs">
  <div class="conteneur">
    <p class="surtitre">${c.t('nutrition.saveurs.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('nutrition.saveurs.titre')}</h2>
    <p>${c.t('nutrition.saveurs.texte')}</p>
  </div>
  <ul class="saveurs-ruban" data-anime="cascade" data-visuel>
    ${barre.saveurs.map((s, i) => html`<li style="--i:${i}"><span class="saveur-pastille" aria-hidden="true"></span>${s}</li>`)}
  </ul>
</section>

<section class="mentions conteneur" id="mentions">
  <div>
    <p class="surtitre">${c.t('nutrition.mentions.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('nutrition.mentions.titre')}</h2>
    <p>${c.t('nutrition.mentions.texte')}</p>
  </div>
  <ol class="mentions-liste" data-anime="cascade" data-visuel>
    ${N.mentions.map((m) => html`<li><span class="mention-case" aria-hidden="true"></span>${m} <em>${c.t('commun.aCompleter')}</em></li>`)}
  </ol>
</section>

<section class="fin conteneur" id="fin">
  ${visuelProduit(c, c.donnees.produits.find((p) => p.id === 'verre-shaker'), { classe: 'fin-produit', sizes: '(max-width: 760px) 60vw, 24vw', attrs: 'data-anime="rideau"' })}
  <div>
    <h2 data-anime="lignes">${c.t('nutrition.fin.titre')}</h2>
    <p data-anime>${c.t('nutrition.fin.texte')}</p>
    <p class="fin-actions" data-anime>
      ${c.lien('boutique', { params: 'produit=verre-shaker', classe: 'bouton', texte: c.t('nutrition.fin.action') })}
      ${c.lien('boutique', { params: 'collection=nutrition', classe: 'bouton bouton--contour', texte: c.t('nutrition.fin.boutique') })}
    </p>
  </div>
</section>
`;
};
