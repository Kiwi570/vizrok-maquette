/* Livraison & retours : ouverture centrée sur un bordereau d'expédition (le tampon « Qualité garantie » s'abat,
   la ligne de suivi part vers la droite), frise des étapes tracée, compteurs des remboursements,
   moyens de paiement, FAQ dépliable. Contenu réel de la page « Returns & FAQ » de la boutique. */
import { html } from '../../outils/gabarit.mjs';

export const page = { cle: 'livraison', fichier: 'livraison', imagePartage: 'grok/livraison-ouverture-1280.webp' };

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
    ${c.media({ nom: 'grok/livraison-colis', alt: c.s('livraison.colis.alt'), cadrage: '50% 55%', classe: 'etapes-media', sizes: '(max-width: 760px) 100vw, 34vw', attrs: 'data-anime="rideau"' })}
  </div>
</section>

<section class="rembours conteneur" id="remboursements">
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
