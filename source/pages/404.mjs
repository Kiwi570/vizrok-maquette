/* Page 404 : un disque roule et s'arrête contre le bord, sur la photo du disque seul. */
import { html } from '../../outils/gabarit.mjs';
import { disque } from '../gabarits/vizrok.mjs';

export const page = { cle: '404', fichier: '404', partage: false };

export default (c) => html`
<section class="introuvable" id="debut">
  ${c.media({ nom: 'grok/404', alt: c.s('introuvable.alt'), cadrage: '50% 55%', priorite: true, classe: 'introuvable-fond', sizes: '100vw' })}
  <div class="conteneur introuvable-cadre">
    <p class="introuvable-code" aria-hidden="true">4<span class="introuvable-disque" data-effet="disque-404">${disque('d-vert')}</span>4</p>
    <h1 data-anime="lignes">${c.t('introuvable.titre')}</h1>
    <p data-anime>${c.t('introuvable.texte')}</p>
    <p class="fin-actions" data-anime>
      ${c.lien('accueil', { classe: 'bouton', texte: c.t('introuvable.retour'), attrs: 'data-action-principale' })}
      ${c.lien('boutique', { classe: 'bouton bouton--contour', texte: c.t('introuvable.boutique') })}
    </p>
  </div>
</section>
`;
