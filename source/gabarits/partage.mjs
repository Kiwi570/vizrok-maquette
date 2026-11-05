/* Image de partage 1200×630 de chaque page (photo du client, logo, accroche, polices et couleurs du site).
   outils/images-partage.mjs photographie ces pages et écrit assets/partage/<page>-<langue>.jpg. */
import { html, brut } from '../../outils/gabarit.mjs';

export function page(c) {
  const cle = c.page.cle;
  const image = c.page.imagePartage || c.site.imagePartage;
  return html`<!doctype html>
<html lang="${c.l}"><head><meta charset="utf-8">
<link rel="stylesheet" href="/assets/css/socle.css"><link rel="stylesheet" href="/assets/css/site.css">
<style>${brut(`:root{--fond:${c.site.couleurs.fond};--texte:${c.site.couleurs.texte}}
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:var(--fond);color:var(--texte)}
.carte{display:grid;grid-template-columns:1fr 1fr;width:1200px;height:630px}
.carte-texte{display:flex;flex-direction:column;justify-content:space-between;padding:64px}
.carte-marque{display:flex;align-items:center;gap:16px;margin:0}.carte-mot{font-family:var(--police-titres);font-weight:900;text-transform:uppercase;font-size:40px}.carte-titre{text-transform:uppercase;font-weight:900}.carte-image{position:relative}.carte-image::after{content:'${c.s("commun.mentionIa")}';position:absolute;right:12px;bottom:12px;padding:3px 8px;border-radius:999px;background:rgba(0,0,0,.66);color:#fff;font:600 13px/1.4 var(--police-texte)}
.carte-titre{font-family:var(--police-titres);font-size:64px;line-height:1.02;margin:0;text-wrap:balance}
.carte-nom{font-size:24px;font-weight:600;margin:0}
.carte-image{background:center/cover no-repeat}`)}</style>
</head><body>
<div class="carte">
  <div class="carte-texte">
    <p class="carte-marque"><span class="marque" style="width:72px;height:72px"><svg viewBox="0 0 24 32" width="34" height="44"><path d="M14 1 2 18h8l-2 13L22 12h-8l2-11z" fill="currentColor"/></svg></span><span class="carte-mot">Vizrok<span style="color:#3DFF8A">.store</span></span></p>
    <p class="carte-titre">${c.t(`pages.${cle}.accroche`)}</p>
    <p class="carte-nom">${c.site.nom}</p>
  </div>
  <div class="carte-image" style="background-image:url('/assets/images/${image}')"></div>
</div>
</body></html>`;
}
