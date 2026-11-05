/* Boutique (page de catégorie) : ouverture compacte sur fond uni, disques-filtres qui roulent et se posent,
   catalogue filtrable en Flip, tri, recherche sans accents, sélection dans l'adresse (?collection=, ?q=, ?produit=),
   fiche en volet (dialog) avec son propre lien, couleurs et tailles, ajout au panier. */
import { html, brut } from '../../outils/gabarit.mjs';
import { CATEGORIES, prix, carteProduit, disque } from '../gabarits/vizrok.mjs';

export const page = { cle: 'boutique', fichier: 'boutique', imagePartage: 'grok/boutique-rayon-1280.webp' };

export default (c) => {
  const P = c.donnees.produits;
  const n = (cat) => P.filter((p) => p.categorie === cat).length;
  return html`
<section class="b-tete" id="debut">
  <div class="conteneur b-tete-cadre">
    <div class="b-tete-texte">
      <p class="surtitre">${c.t('boutique.surtitre')}</p>
      <h1 class="b-titre"><span data-anime="gsap" class="b-titre-mot">${c.t('boutique.titre')}</span></h1>
      <p class="b-titre-compte" data-info-cle><span data-compteur="${P.length}">${P.length}</span> ${c.t('accueil.collections.pieces')}</p>
      <p data-anime>${c.t('boutique.texte')}</p>
    </div>
    <div class="b-filtres" role="group" aria-label="${c.s('boutique.filtres')}" data-effet="disques-filtres" data-visuel>
      <button type="button" class="b-filtre" data-filtre="tout" aria-pressed="true" data-action-principale>${disque('d-gris')}<span>${c.t('boutique.tout')} <b>${P.length}</b></span></button>
      ${CATEGORIES.map((k) => html`<button type="button" class="b-filtre" data-filtre="${k.cle}" aria-pressed="false">${disque(k.disque)}<span>${c.t('accueil.collections.' + k.cle)} <b>${n(k.cle)}</b></span></button>`)}
    </div>
  </div>
</section>

<section class="b-catalogue conteneur" id="catalogue">
  <div class="b-outils">
    <div class="champ b-recherche">
      <label for="b-q">${c.t('boutique.recherche')}</label>
      <input id="b-q" type="search" name="q" autocomplete="off" placeholder="${c.s('boutique.rechercheAide')}" data-recherche>
    </div>
    <div class="champ b-tri">
      <label for="b-tri">${c.t('boutique.tri')}</label>
      <select id="b-tri" name="tri" data-tri>
        <option value="defaut">${c.t('boutique.triDefaut')}</option>
        <option value="prix">${c.t('boutique.triPrix')}</option>
        <option value="prix-desc">${c.t('boutique.triPrixDesc')}</option>
      </select>
    </div>
    <p class="b-compte" aria-live="polite"><strong data-compte-affiche>${P.length}</strong> ${c.t('boutique.resultats')}</p>
  </div>
  <div class="b-grille" data-grille data-anime="cascade">
    ${P.map((p) => carteProduit(c, p, { niveau: 2, sizes: '(max-width: 560px) 50vw, (max-width: 1000px) 33vw, 25vw' }))}
  </div>
  <div class="b-aucun" data-aucun hidden>
    <p>${c.t('boutique.aucun')}</p>
    <button type="button" class="bouton bouton--contour" data-effacer>${c.t('boutique.effacer')}</button>
  </div>
</section>

<section class="b-rayon" id="rayon">
  ${c.media({ nom: 'grok/boutique-rayon', alt: c.s('boutique.rayon.alt'), cadrage: '70% 50%', classe: 'b-rayon-media', sizes: '100vw', attrs: 'data-fx="parallaxe"' })}
  <div class="b-rayon-texte conteneur">
    <h2 data-anime="lignes">${c.t('boutique.rayon.titre')}</h2>
    <p data-anime>${c.t('boutique.rayon.texte')}</p>
    <p data-anime>${c.lien('seance', { ancre: 'kit', classe: 'bouton', texte: c.t('boutique.rayon.action'), attrs: 'data-survol="magnetique"' })}</p>
  </div>
</section>

<dialog class="fiche-volet" id="fiche-volet" aria-labelledby="fv-titre" data-recouvrement data-fiche-volet>
  <div class="fv-cadre">
    <button type="button" class="fv-fermer" data-fiche-fermer aria-label="${c.s('boutique.fermerFiche')}"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>
    <div class="fv-media" data-fv-media data-vue="${c.s('boutique.vue')}"></div>
    <div class="fv-texte">
      <p class="surtitre" data-fv-categorie></p>
      <h2 id="fv-titre" data-fv-nom></h2>
      <p class="fv-prix" data-prix><span data-fv-prix></span> <small>${c.t('commun.ht')} · ${c.t('commun.ttc')}</small></p>
      <p data-fv-description></p>
      <fieldset class="pastilles" data-fv-couleurs><legend>${c.t('boutique.couleur')}</legend></fieldset>
      <p class="fv-photo" data-fv-photo data-modele="${c.s('boutique.photoColoris')}" hidden></p>
      <fieldset class="tailles" data-fv-tailles><legend>${c.t('boutique.taille')}</legend></fieldset>
      <p class="champ-erreur" data-fv-erreur role="alert" hidden>${c.t('boutique.choisirTaille')}</p>
      <ul class="fv-details" data-fv-details></ul>
      <p class="fv-note" data-fv-note hidden>${c.t('boutique.nutritionNote')}</p>
      <button type="button" class="bouton fv-ajouter" data-fv-ajouter>${c.t('boutique.ajouterPanier')}</button>
      <p class="fv-ok" data-fv-ok role="status" hidden>${c.t('boutique.ajoute')}</p>
    </div>
  </div>
</dialog>
`;
};
