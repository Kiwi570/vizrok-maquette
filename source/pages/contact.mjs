/* Contact : ouverture compacte sur la photo des casiers ; la porte du casier pivote et le formulaire en sort.
   Formulaire en étapes (sujet en grandes cartes, coordonnées, récapitulatif), envoi simulé, sujet prérempli
   par l'adresse (?sujet=commande). Sans JavaScript, toutes les étapes sont visibles. */
import { html, brut } from '../../outils/gabarit.mjs';

export const page = { cle: 'contact', fichier: 'contact', imagePartage: 'grok/contact-ouverture-1280.webp' };

const SUJETS = ['commande', 'defaut', 'retractation', 'collaboration', 'autre'];

export default (c) => html`
<section class="c-tete" id="debut">
  ${c.media({ nom: 'grok/contact-ouverture', alt: c.s('contact.alt'), cadrage: '76% 50%', cadrageMobile: '60% 70%', priorite: true, classe: 'c-tete-fond', sizes: '100vw', attrs: 'data-fx="zoom" data-fx-force="8"' })}
  <div class="conteneur c-cadre">
    <div class="c-texte">
      <p class="surtitre">${c.t('contact.surtitre')}</p>
      <h1 class="c-titre" data-anime="lignes">${c.t('contact.titre')}</h1>
      <p data-anime>${c.t('contact.texte')}</p>
      <p class="c-info" data-info-cle data-anime>${c.t('contact.info')}</p>
      <p class="c-ecrire" data-anime><a class="bouton" href="#formulaire" data-action-principale>${c.t('contact.ecrire')}</a></p>
      <ul class="c-reseaux" data-anime>
        <li class="c-reseaux-titre">${c.t('contact.reseaux')}</li>
        ${c.site.reseaux.map((r) => html`<li><a href="${r.url}" target="_blank" rel="noopener">${r.nom} <span>${r.compte}</span></a></li>`)}
      </ul>
    </div>
    <div class="casier" data-effet="casier-contact">
      <div class="casier-porte" aria-hidden="true"><span class="casier-fentes"></span><span class="casier-poignee"></span></div>
      <form class="etapes-form" id="formulaire" data-formulaire data-etapes action="#" novalidate>
        <div class="etape" data-etape="1">
          <p class="etape-num">${c.t('contact.etape')} 1 ${c.t('contact.sur')} 3</p>
          <h2 class="etape-titre" tabindex="-1">${c.t('contact.q1')}</h2>
          <fieldset class="sujets"><legend class="visuellement-cache">${c.t('contact.q1')}</legend>
            ${SUJETS.map((s, i) => html`<label class="sujet"><input type="radio" data-superpose name="sujet" value="${s}"${i === 0 ? brut(' checked') : ''}><span>${c.t('contact.sujets.' + s)}</span></label>`)}
          </fieldset>
          <p class="etape-nav"><button type="button" class="bouton" data-etape-suivante>${c.t('contact.suivant')}</button></p>
        </div>
        <div class="etape" data-etape="2">
          <p class="etape-num">${c.t('contact.etape')} 2 ${c.t('contact.sur')} 3</p>
          <h2 class="etape-titre" tabindex="-1">${c.t('contact.q2')}</h2>
          <div class="champ"><label for="f-nom">${c.t('contact.nom')}</label><input id="f-nom" name="nom" autocomplete="name" required></div>
          <div class="champ"><label for="f-email">${c.t('contact.email')}</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
          <div class="champ"><label for="f-commande">${c.t('contact.commandeNum')}</label><input id="f-commande" name="commande" autocomplete="off"></div>
          <div class="champ"><label for="f-message">${c.t('contact.message')}</label><textarea id="f-message" name="message" rows="4" required></textarea></div>
          <p class="etape-aide" data-aide-defaut hidden>${c.t('contact.defautAide')}</p>
          <p class="etape-nav"><button type="button" class="bouton bouton--contour" data-etape-precedente>${c.t('contact.precedent')}</button> <button type="button" class="bouton" data-etape-suivante>${c.t('contact.suivant')}</button></p>
        </div>
        <div class="etape" data-etape="3">
          <p class="etape-num">${c.t('contact.etape')} 3 ${c.t('contact.sur')} 3</p>
          <h2 class="etape-titre" tabindex="-1">${c.t('contact.q3')}</h2>
          <dl class="recap" data-recap></dl>
          <p class="mention-donnees">${c.t('contact.donnees')}</p>
          <p class="etape-nav"><button type="button" class="bouton bouton--contour" data-etape-precedente>${c.t('contact.modifier')}</button> <button type="submit" class="bouton">${c.t('contact.envoyer')}</button></p>
          <p data-message-envoi data-texte="${c.s('contact.envoye')}" role="status" tabindex="-1" hidden></p>
        </div>
      </form>
    </div>
  </div>
</section>
`;
