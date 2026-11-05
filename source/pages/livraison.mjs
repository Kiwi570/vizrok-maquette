/* Livraison & retours : ouverture centrée sur un bordereau d'expédition (le tampon « Qualité garantie » s'abat,
   la ligne de suivi part vers la droite), frise des étapes tracée, compteurs des remboursements,
   moyens de paiement, FAQ dépliable. Contenu réel de la page « Returns & FAQ » de la boutique. */
import { html } from '../../outils/gabarit.mjs';

export const page = { cle: 'livraison', fichier: 'livraison', imagePartage: 'grok/livraison-ouverture-1280.webp' };

/* Carte du suivi de colis : trajet du colis et ses cinq étapes (x, y, côté de l'étiquette). */
const NOEUDS = [[70, 440, 1], [168, 362, 1], [110, 236, -1], [258, 170, 1], [328, 62, -1]];
const ROUTE = 'M70,440C120,432,176,404,168,362S78,284,110,236S220,214,258,170S322,96,328,62';

export default (c) => html`
<section class="l-tete" id="debut">
  ${c.media({ nom: 'grok/livraison-ouverture', alt: c.s('livraison.alt'), cadrage: '72% 50%', cadrageMobile: '50% 70%', priorite: true, classe: 'l-tete-fond', sizes: '100vw', attrs: 'data-fx="parallaxe" data-fx-force="6"' })}
  <div class="l-tete-cadre conteneur">
    <div class="bordereau" data-effet="bordereau-tampon">
      <p class="bordereau-tete"><span>${c.t('livraison.bordereau')}</span></p>
      <p class="surtitre">${c.t('livraison.surtitre')}</p>
      <h1 class="l-titre">${c.t('livraison.titre')}</h1>
      <p class="l-texte">${c.t('livraison.texte')}</p>
      <p class="bordereau-actions"><a class="bouton" href="#faq" data-action-principale>${c.t('livraison.action')}</a> <span class="l-info" data-info-cle>${c.t('livraison.info')}</span></p>
      <dl class="bordereau-champs">
        <div><dt>${c.t('livraison.expediteur')}</dt><dd>${c.t('livraison.expediteurNom')}</dd></div>
        <div><dt>${c.t('livraison.destinataire')}</dt><dd>${c.t('livraison.destinataireNom')}</dd></div>
        <div><dt>${c.t('livraison.contenu')}</dt><dd>${c.t('livraison.contenuNom')}</dd></div>
      </dl>
      <span class="tampon" aria-hidden="true">${c.t('livraison.tampon')}</span>
      <svg class="bordereau-suivi" viewBox="0 0 600 24" preserveAspectRatio="none" aria-hidden="true"><path d="M2 12 H 598" stroke="currentColor" stroke-width="3" stroke-dasharray="10 8" fill="none"/></svg>
    </div>
  </div>
</section>

<section class="etapes conteneur" id="etapes">
  <div class="etapes-tete">
    <p class="surtitre">${c.t('livraison.etapes.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('livraison.etapes.titre')}</h2>
  </div>
  <div class="etapes-cadre">
    <ol class="frise">
      <svg class="frise-trait" viewBox="0 0 10 100" preserveAspectRatio="none" aria-hidden="true" data-fx="trace" data-effet="suivi-colis"><path d="M5 0 V 100" stroke="currentColor" stroke-width="2" fill="none" vector-effect="non-scaling-stroke"/></svg>
      ${[1, 2, 3, 4, 5].map((i) => html`<li class="frise-etape" data-anime style="--delai:${(i - 1) * 0.06}s"><span class="frise-point" aria-hidden="true">${i}</span><h3>${c.t('livraison.etapes.e' + i)}</h3><p>${c.t('livraison.etapes.e' + i + 't')}</p></li>`)}
    </ol>
    <div class="etapes-carte" data-effet="colis-carte" data-visuel aria-hidden="true">
      <svg class="carte-svg" viewBox="0 0 400 500">
        <defs>
          <pattern id="carte-rues" width="46" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(-14)"><path d="M0 0H46M0 0V46" fill="none" stroke="rgba(61,255,138,.09)" stroke-width="1"/><path d="M23 0V46" fill="none" stroke="rgba(234,242,245,.04)" stroke-width="6"/></pattern>
          <radialGradient id="carte-halo"><stop offset="0" stop-color="rgba(61,255,138,.35)"/><stop offset="1" stop-color="rgba(61,255,138,0)"/></radialGradient>
        </defs>
        <rect width="400" height="500" fill="#08111F"/>
        <rect width="400" height="500" fill="url(#carte-rues)"/>
        <path class="carte-blocs" d="M20 300h70v60H20zM190 280h80v50h-80zM230 380h120v70H230zM40 90h90v70H40zM300 230h80v60h-80zM180 40h60v60h-60z"/>
        <path class="carte-route" d="${ROUTE}"/>
        <path class="carte-trajet" d="${ROUTE}" data-carte-trajet/>
        ${NOEUDS.map(([x, y, cote], i) => html`<g class="carte-noeud" data-noeud="${i + 1}" transform="translate(${x} ${y})"><circle r="15"/><text class="carte-num" text-anchor="middle" dy="5">${i + 1}</text><text class="carte-nom" x="${cote * 24}" dy="5" text-anchor="${cote > 0 ? 'start' : 'end'}">${c.s('livraison.carte.n' + (i + 1))}</text></g>`)}
        <g class="carte-colis" data-carte-colis><circle class="carte-ping" r="22" fill="url(#carte-halo)"/><g class="carte-carton"><path d="M-11 -4 0 -10 11 -4 0 2Z"/><path d="M-11 -4 0 2V14L-11 8Z"/><path d="M11 -4 0 2V14L11 8Z"/><path d="M-5.5 -7 5.5 -1"/></g></g>
      </svg>
    </div>
  </div>
</section>

<section class="clair rembours conteneur" id="remboursements">
  <p class="surtitre">${c.t('livraison.remboursements.surtitre')}</p>
  <h2 data-anime="lignes">${c.t('livraison.remboursements.titre')}</h2>
  <ul class="rembours-grille" data-anime="cascade" data-visuel>
    <li><strong class="rembours-chiffre"><span data-compteur="24">24</span></strong><span>${c.t('livraison.remboursements.paypal')}</span></li>
    <li><strong class="rembours-chiffre">${c.t('livraison.remboursements.carteChiffre')}</strong><span>${c.t('livraison.remboursements.carte')}</span></li>
    <li><strong class="rembours-chiffre"><span data-compteur="14">14</span></strong><span>${c.t('livraison.remboursements.retractation')}</span><small>${c.t('livraison.remboursements.retractationTexte')}</small></li>
    <li><strong class="rembours-chiffre"><span data-compteur="2">2</span></strong><span>${c.t('livraison.remboursements.garantie')}</span></li>
  </ul>
  <div class="paiements" id="paiements">
    <h3 data-anime>${c.t('livraison.paiements.titre')}</h3>
    <ul class="paiements-liste" data-anime="cascade">${c.donnees.paiements.map((p) => html`<li>${p}</li>`)}</ul>
  </div>
</section>


<section class="faq conteneur" id="faq">
  <div>
    <p class="surtitre">${c.t('livraison.faq.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('livraison.faq.titre')}</h2>
    ${c.donnees.faq.map((f) => html`<details class="faq-item" data-anime><summary>${f.q}</summary><p>${f.r}</p></details>`)}
  </div>
  <div class="faq-cote">
    ${c.media({ nom: 'grok/boutique-rayon', alt: c.s('boutique.rayon.alt'), cadrage: '70% 50%', classe: 'faq-media', sizes: '(max-width: 760px) 100vw, 30vw', attrs: 'data-fx="zoom"' })}
    <h2 class="faq-cote-titre">${c.t('livraison.fin.titre')}</h2>
    <p>${c.lien('contact', { params: 'sujet=commande', classe: 'bouton', texte: c.t('livraison.fin.action'), attrs: 'data-survol="magnetique"' })}</p>
  </div>
</section>
`;
