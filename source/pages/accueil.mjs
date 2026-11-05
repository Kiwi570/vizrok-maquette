/* Accueil : intro « la barre se charge » (panneau du gabarit commun), héros avec onde de choc WebGL,
   ruban réactif à la vitesse, manifeste mot à mot, collections épinglées (disques), maillot mesh,
   nouveautés en galerie épinglée, nutrition, garanties, réseaux en néon, appel final.
   Chaque section a au moins un effet au défilement, visible aussi sur téléphone. */
import { html, brut } from '../../outils/gabarit.mjs';
import { CATEGORIES, prix, visuelProduit, carteProduit, disque, vues } from '../gabarits/vizrok.mjs';

export const page = { cle: 'accueil', fichier: 'index', imagePartage: 'grok/accueil-ouverture-1280.webp' };

/* Barre de l'ouverture, vue de côté : manchon, petit, moyen et grand disque (de l'extérieur vers le centre). */
const BARRE = brut('<span class="hb-manchon"></span><span class="hb-disque hb-disque--3" style="--c:#F2F4F2"></span><span class="hb-disque hb-disque--2" style="--c:#E6FF3B"></span><span class="hb-disque" style="--c:#3DFF8A"></span>');
/* Section « Porté » : photos portées de la boutique (produit, vue, cadrage). */
const PORTE = [['hoodie-lane-seven', 3, '50% 30%'], ['tshirt', 3, '50% 22%'], ['casquette', 4, '50% 35%'], ['pull-stanley-stella', 5, '50% 40%']];

export default (c) => {
  const P = c.donnees.produits;
  const par = (cat) => P.filter((p) => p.categorie === cat);
  const maillot = P.find((p) => p.id === 'maillot');
  const nouveautes = P.filter((p) => p.nouveaute);
  const nutrition = par('nutrition');
  return html`
<section class="hero" id="debut" data-gouttiere="#050B14">
  <div class="hero-fond">
    ${c.media({ nom: 'grok/accueil-ouverture', alt: c.s('accueil.hero.alt'), cadrage: '64% 60%', cadrageMobile: '60% 70%', priorite: true, classe: 'hero-media', sizes: '100vw', attrs: 'data-onde-choc' })}
  </div>
  <div class="hero-texte conteneur">
    <p class="surtitre hero-sur" data-anime="gsap">${c.t('accueil.hero.surtitre')}</p>
    <h1 class="hero-titre"><span class="hero-barre" aria-hidden="true" data-effet="barre-tombe"><span class="hb-tige"></span><span class="hb-cote hb-cote--g">${BARRE}</span><span class="hb-cote hb-cote--d">${BARRE}</span></span><span class="ligne-masque"><span class="hero-ligne" data-anime="gsap">${c.t('accueil.hero.titre')}</span></span></h1>
    <p class="hero-intro" data-anime="gsap">${c.t('accueil.hero.texte')}</p>
    <p class="hero-actions" data-anime="gsap">
      ${c.lien('boutique', { classe: 'bouton', texte: c.t('accueil.hero.action'), attrs: 'data-action-principale data-survol="magnetique"' })}
      <span class="hero-info" data-info-cle>${c.t('accueil.hero.info')}</span>
    </p>
  </div>
  <canvas class="hero-magnesie" aria-hidden="true" data-audit-ignorer></canvas>
</section>

<div class="ruban-section" data-section data-sans-visuel data-effet="ruban-vitesse">
  <div class="ruban" id="ruban" data-ruban data-boucle-css><p><span>${c.t('accueil.ruban')}</span> <span aria-hidden="true">${c.t('accueil.ruban')}</span></p></div>
  <button type="button" class="ruban-pause" data-pause-pour="ruban" data-libelle-pause="${c.s('commun.pause')}" data-libelle-lecture="${c.s('commun.lecture')}"><span data-libelle-bouton>${c.t('commun.pause')}</span></button>
</div>

<section class="manifeste" id="manifeste">
  <div class="manifeste-fond" aria-hidden="true">${c.media({ nom: 'grok/accueil-manifeste', alt: '', cadrage: '50% 60%', sizes: '100vw', attrs: 'data-fx="parallaxe" data-fx-force="12"' })}</div>
  <div class="conteneur manifeste-cadre">
    <p class="surtitre">${c.t('accueil.manifeste.surtitre')}</p>
    <h2 class="manifeste-texte" data-effet="manifeste" data-mot-a-mot>${c.t('accueil.manifeste.texte')}</h2>
    <p class="manifeste-suite" data-anime="mots">${c.t('accueil.manifeste.suite')}</p>
    <p class="manifeste-signature">${c.t('accueil.manifeste.signature')}</p>
  </div>
</section>

<section class="porte" id="porte" data-effet="porte-volets">
  <div class="conteneur porte-tete">
    <p class="surtitre">${c.t('accueil.porte.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('accueil.porte.titre')}</h2>
    <p>${c.t('accueil.porte.texte')}</p>
  </div>
  <ul class="porte-grille" role="list" aria-label="${c.s('accueil.porte.region')}">
    ${PORTE.map(([id, vue, cadrage], i) => { const p = P.find((x) => x.id === id); return html`<li class="porte-item porte-item--${i + 1}" data-porte-vitesse="${[-6, 8, -12, 5][i]}">
      <figure class="porte-cadre">
        ${c.media({ nom: `produits/${id}-${vue}`, alt: c.s('accueil.porte.alt', { piece: p.court }), cadrage, classe: 'porte-media', sizes: '(max-width: 760px) 80vw, 26vw' })}
        <span class="porte-volets" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
      </figure>
      <div class="porte-etiquette">
        <p class="porte-nom">${p.court}</p>
        <p class="porte-prix" data-prix>${prix(p.prix)} <small>${c.t('commun.ht')}</small></p>
        <button type="button" class="bouton bouton--petit" data-ajouter="${p.id}" aria-label="${c.s('commun.choisir') + ' : ' + p.court}">${c.t('commun.choisir')}</button>
      </div>
    </li>`; })}
  </ul>
</section>

<section class="collections" id="collections">
  <div class="collections-fond" aria-hidden="true" data-audit-ignorer>${c.media({ nom: 'grok/accueil-collections', alt: '', sizes: '100vw' })}</div>
  <div class="collections-cadre conteneur">
    <div class="collections-tete">
      <p class="surtitre">${c.t('accueil.collections.surtitre')}</p>
      <h2 data-anime="lignes">${c.t('accueil.collections.titre')}</h2>
      <p class="collections-aide">${c.t('accueil.collections.texte')}</p>
    </div>
    <div class="collections-barre" data-effet="disques-collections" aria-hidden="true">
      <span class="cb-tige"></span><span class="cb-manchon"></span>
      ${CATEGORIES.map((k, i) => html`<span class="cb-disque cb-g ${k.disque}" style="--i:${i}"></span><span class="cb-disque cb-d ${k.disque}" style="--i:${i}"></span>`)}<span class="cb-manchon cb-manchon--d"></span>
    </div>
    <ol class="collections-liste">
      ${CATEGORIES.map((k, i) => {
        const liste = par(k.cle), min = Math.min(...liste.map((p) => p.prix));
        const vedette = liste.find((p) => p.id === (k.cle === 'vetements' ? 'hoodie-lane-seven' : '')) || liste.find((p) => vues(p.id).length) || liste[0];
        return html`<li class="collection" data-collection="${k.cle}" style="--i:${i}">
        <div class="collection-texte">
          <p class="collection-num" aria-hidden="true">0${i + 1}</p>
          <h3>${c.t('accueil.collections.' + k.cle)}</h3>
          <p class="collection-compte"><strong>${liste.length}</strong> ${liste.length > 1 ? c.t('accueil.collections.pieces') : c.t('accueil.collections.piece')} · ${c.t('accueil.collections.des')} <span data-prix>${prix(min)} ${c.t('commun.ht')}</span></p>
          <p>${c.t('accueil.collections.' + k.cle + 'Texte')}</p>
          ${c.lien('boutique', { params: 'collection=' + k.cle, classe: 'lien-fleche', texte: c.t('accueil.collections.voir') })}
        </div>
        ${visuelProduit(c, vedette, { classe: 'collection-media', sizes: '(max-width: 760px) 70vw, 30vw' })}
      </li>`;
      })}
    </ol>
  </div>
</section>

<section class="maillot" id="maillot" data-effet="maillot-mesh">
  <div class="maillot-scene">
    <div class="maillot-lueur" aria-hidden="true"></div>
    <div class="maillot-vues">
      ${maillot.couleurs.map((col, i) => html`<div class="maillot-vue${i === 0 ? ' est-active' : ''}" data-coloris="${i}">${visuelProduit(c, maillot, { vue: 0, teinte: i ? col.hex : '', sizes: '(max-width: 760px) 90vw, 45vw' })}</div>`)}
    </div>
    <canvas class="maillot-mesh" aria-hidden="true" data-audit-ignorer></canvas>
  </div>
  <div class="maillot-texte">
    <p class="surtitre">${c.t('accueil.maillot.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('accueil.maillot.titre')}</h2>
    <p data-anime>${c.t('accueil.maillot.texte')}</p>
    <p class="maillot-prix" data-prix>${prix(maillot.prix)} <small>${c.t('commun.ht')} · ${c.t('commun.ttc')}</small></p>
    <fieldset class="pastilles">
      <legend>${c.t('accueil.maillot.couleur')}</legend>
      ${maillot.couleurs.map((col, i) => html`<label class="pastille" style="--c:${col.hex}"><input type="radio" data-superpose name="coloris-maillot" value="${i}"${i === 0 ? brut(' checked') : ''} data-coloris-choix="${i}"><span>${col.nom}</span></label>`)}
    </fieldset>
    <p class="maillot-apercu">${c.t('accueil.maillot.apercu')}</p>
    <p class="maillot-actions">
      <button type="button" class="bouton" data-ajouter="maillot" data-coloris-ajout data-survol="magnetique">${c.t('accueil.maillot.action')}</button>
      ${c.lien('seance', { ancre: 'eclate', classe: 'lien-fleche', texte: c.t('accueil.maillot.detail') })}
    </p>
  </div>
</section>

<section class="galerie ecran epingle nouveautes" id="nouveautes" data-fx="galerie">
  <div class="conteneur galerie-tete">
    <p class="surtitre">${c.t('accueil.nouveautes.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('accueil.nouveautes.titre')}</h2>
    <p>${c.t('accueil.nouveautes.texte')}</p>
  </div>
  <div class="piste galerie-piste" data-galerie data-anime="cascade" tabindex="0" role="region" aria-label="${c.s('accueil.nouveautes.region')}">
    ${nouveautes.map((p) => carteProduit(c, p, { classe: 'carte', sizes: '(max-width: 760px) 78vw, 30vw' }))}
  </div>
  <div class="galerie-progres" aria-hidden="true"><span></span></div>
</section>

<section class="nutri" id="nutrition">
  ${c.media({ nom: 'grok/accueil-nutrition', alt: '', classe: 'nutri-fond', sizes: '100vw', attrs: 'data-fx="zoom" aria-hidden="true"' })}
  <div class="conteneur nutri-cadre">
    <div class="nutri-tete">
      <p class="surtitre">${c.t('accueil.nutrition.surtitre')}</p>
      <h2 data-anime="lignes">${c.t('accueil.nutrition.titre')}</h2>
      <p data-anime>${c.t('accueil.nutrition.texte')}</p>
      <p data-anime>${c.lien('nutrition', { classe: 'bouton bouton--contour', texte: c.t('accueil.nutrition.action') })}</p>
    </div>
    <ul class="nutri-liste" data-anime="cascade">
      ${nutrition.map((p) => html`<li>${c.lien('boutique', { params: 'produit=' + p.id, classe: 'nutri-item', texte: html`<span class="nutri-nom">${p.court}</span><span class="nutri-prix" data-prix>${prix(p.prix)} ${c.t('commun.ht')}</span>` })}</li>`)}
    </ul>
  </div>
</section>

<section class="garanties conteneur" id="garanties">
  ${c.media({ nom: 'grok/accueil-garanties', alt: c.s('accueil.garanties.alt'), cadrage: '50% 55%', classe: 'garanties-media', sizes: '(max-width: 760px) 100vw, 36vw', attrs: 'data-anime="rideau"' })}
  <div class="garanties-texte">
    <p class="surtitre">${c.t('accueil.garanties.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('accueil.garanties.titre')}</h2>
    <svg class="garanties-trait" viewBox="0 0 600 40" preserveAspectRatio="none" aria-hidden="true" data-fx="trace"><path d="M4 30 C 120 4, 220 36, 330 18 S 520 6, 596 22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="none"/></svg>
    <ul class="garanties-liste" data-anime="cascade">
      <li><strong class="garantie-titre">${c.t('accueil.garanties.g1')}</strong><span>${c.t('accueil.garanties.g1t')}</span></li>
      <li><strong class="garantie-titre"><span class="garantie-chiffre" data-compteur="30">30</span> ${c.t('accueil.garanties.g2')}</strong><span>${c.t('accueil.garanties.g2t')}</span></li>
      <li><strong class="garantie-titre"><span class="garantie-chiffre" data-compteur="14">14</span> ${c.t('accueil.garanties.g3')}</strong><span>${c.t('accueil.garanties.g3t')}</span></li>
      <li><strong class="garantie-titre">${c.t('accueil.garanties.g4')}</strong><span>${c.t('accueil.garanties.g4t')}</span></li>
    </ul>
    <p>${c.lien('livraison', { classe: 'lien-fleche', texte: c.t('accueil.garanties.action') })}</p>
  </div>
</section>

<section class="reseaux" id="reseaux">
  ${c.media({ nom: 'grok/accueil-reseaux', alt: c.s('accueil.reseaux.alt'), cadrage: '50% 55%', classe: 'reseaux-media', sizes: '(max-width: 760px) 100vw, 40vw', attrs: 'data-fx="parallaxe"' })}
  <div class="reseaux-texte">
    <p class="surtitre">${c.t('accueil.reseaux.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('accueil.reseaux.titre')}</h2>
    <ul class="reseaux-liste">
      ${c.site.reseaux.map((r) => html`<li><a class="reseau-neon" href="${r.url}" target="_blank" rel="noopener" data-effet="neon"><span class="reseau-nom">${r.nom}</span><span class="neon-texte" data-neon>${r.compte}</span></a></li>`)}
    </ul>
  </div>
</section>

<section class="fin conteneur" id="fin">
  <div class="fin-disques" aria-hidden="true" data-visuel data-fx="trace">
    <svg viewBox="0 0 400 120"><path d="M10 60 H 390" stroke="currentColor" stroke-width="6" stroke-linecap="round" fill="none"/></svg>
  </div>
  <h2 data-anime="mots">${c.t('accueil.fin.titre')}</h2>
  <p data-anime>${c.t('accueil.fin.texte')}</p>
  <p class="fin-actions" data-anime>
    ${c.lien('boutique', { classe: 'bouton', texte: c.t('accueil.fin.action'), attrs: 'data-survol="magnetique"' })}
    ${c.lien('seance', { ancre: 'kit', classe: 'bouton bouton--contour', texte: c.t('accueil.fin.seance'), attrs: 'data-survol="magnetique"' })}
  </p>
</section>
`;
};
