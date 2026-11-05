/* Kit au vestiaire (Ta séance) et formulaire de contact en étapes. */
import { etat, rafraichir } from './socle/index.js?v=2';
import { ajouter, catalogue } from './panier.js?v=2';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const euros = (n) => n.toFixed(2).replace('.', ',') + ' €';

/* Kit : chaque pièce choisie tombe sur son crochet et se balance ; le total suit (data-effet="vestiaire-kit"). */
export function initKit() {
  const f = $('[data-kit]');
  if (!f) return;
  const totaux = $$('[data-kit-total]'), annonce = $('[data-kit-annonce]', f), ok = $('[data-kit-ok]', f);
  const groupes = ['maillot', 'gourde', 'verre', 'tete'];
  const P = () => catalogue();
  let affiche = 0, minuteur = 0;
  const choix = () => groupes.map((g) => {
    const i = $(`input[name="kit-${g}"]:checked`, f);
    if (!i || !i.value) return null;
    const [id, couleur] = i.value.split('|');
    return { g, id, couleur, prix: +i.dataset.prixOption };
  }).filter(Boolean);

  function visuel(p, couleur) {
    const k = p ? Math.max(0, p.couleurs.findIndex((c) => c.nom === couleur)) : 0;
    if (!p || !p.vues.length) return `<div class="kit-item"><div class="visuel-code">${p ? p.dessins[Math.min(k, p.dessins.length - 1)] : ''}</div></div>`;
    /* Première photo du produit ; aperçu du coloris par un calque de teinte quand le produit le permet (maillot). */
    const v = p.vues[0], col = p.couleurs[k];
    const w = v.largeurs.find((x) => x >= 480) || v.largeurs[v.largeurs.length - 1];
    const teinte = p.teinte && col && col.nom !== p.coloriPhoto ? `;--teinte:${col.hex}` : '';
    return `<div class="kit-item${v.plein ? ' plein' : ''}" style="--plaque:${v.fond}${teinte}"><img src="${v.src}-${w}.webp" alt="" loading="lazy"></div>`;
  }
  function mettreAJour(anime = true) {
    const c = choix();
    groupes.forEach((g) => {
      const zone = $(`[data-kit-objet="${g}"]`);
      const x = c.find((y) => y.g === g);
      const cle = x ? x.id + x.couleur : '';
      if (zone.dataset.cle === cle) return;
      zone.dataset.cle = cle;
      zone.innerHTML = x ? visuel(P().find((p) => p.id === x.id), x.couleur) : '';
      if (x && anime && !etat.calme && window.gsap) {
        window.gsap.fromTo(zone, { y: -60, opacity: 0, rotation: -14 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.in' });
        window.gsap.fromTo(zone, { rotation: -14 }, { rotation: 0, duration: 1.4, ease: 'elastic.out(1.1, 0.25)', delay: 0.35 });
      }
    });
    const total = c.reduce((s, x) => s + x.prix, 0);
    if (anime && !etat.calme && window.gsap) {
      const o = { n: affiche };
      window.gsap.to(o, { n: total, duration: 0.5, ease: 'power2.out', onUpdate: () => { totaux.forEach((t) => { t.textContent = euros(o.n); }); } });
    } else totaux.forEach((t) => { t.textContent = euros(total); });
    affiche = total;
    totaux.forEach((t) => { t.dataset.total = total.toFixed(2); });
    clearTimeout(minuteur);
    minuteur = setTimeout(() => { annonce.textContent = `${$('.kit-total span', f).textContent} : ${euros(total)}`; }, 450);
    ok.hidden = true;
  }
  f.addEventListener('change', () => mettreAJour());
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const taille = $('[name="kit-taille"]', f).value;
    const bouton = $('[type="submit"]', f);
    choix().forEach((x) => {
      const p = P().find((y) => y.id === x.id);
      ajouter({ id: x.id, couleur: x.couleur, taille: x.g === 'maillot' ? taille : (p?.tailles[0] || '') }, bouton);
    });
    ok.hidden = false;
  });
  mettreAJour(false);
  rafraichir();
}

/* Contact en étapes : le focus va au titre de l'étape ; on ne passe à la suite qu'avec des champs valides ;
   « Modifier » revient en arrière ; le récapitulatif reprend les réponses ; l'envoi (simulé) est géré par le socle. */
export function initEtapes() {
  const f = $('[data-etapes]');
  if (!f) return;
  const etapes = $$('[data-etape]', f);
  let courante = 0;
  f.setAttribute('data-etapes-actif', '');
  const aide = $('[data-aide-defaut]', f);
  const majAide = () => { if (aide) aide.hidden = $('input[name="sujet"]:checked', f)?.value !== 'defaut'; };
  f.addEventListener('change', majAide);
  function montrer(i, focus = true) {
    courante = i;
    etapes.forEach((e, k) => e.classList.toggle('est-courante', k === i));
    if (i === 2) remplirRecap();
    if (focus) $('.etape-titre', etapes[i])?.focus();
    if (!etat.calme && window.gsap && focus) window.gsap.fromTo(etapes[i], { x: 24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
    rafraichir();
  }
  function valide(etape) {
    let premier = null;
    $$('input[required], textarea[required]', etape).forEach((c) => {
      const v = c.value.trim();
      const bon = v && (c.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v));
      if (!bon) { c.setAttribute('aria-invalid', 'true'); premier = premier || c; } else c.removeAttribute('aria-invalid');
    });
    if (premier) { f.requestSubmit ? null : null; premier.focus(); f.dispatchEvent(new Event('submit', { cancelable: true })); }
    return !premier;
  }
  function remplirRecap() {
    const r = $('[data-recap]', f);
    const sujet = $('input[name="sujet"]:checked', f);
    const lignes = [
      [$('.etape[data-etape="1"] .etape-titre', f).textContent, sujet ? sujet.closest('label').textContent.trim() : ''],
      ...['nom', 'email', 'commande', 'message'].map((n) => { const c = $(`[name="${n}"]`, f); return [$(`label[for="${c.id}"]`, f).textContent, c.value.trim()]; }),
    ].filter(([, v]) => v);
    r.innerHTML = lignes.map(([k, v]) => `<dt>${k}</dt><dd></dd>`).join('');
    $$('dd', r).forEach((dd, i) => { dd.textContent = lignes[i][1]; });
  }
  f.addEventListener('click', (e) => {
    if (e.target.closest('[data-etape-suivante]')) {
      if (courante === 1 && !valideSansEnvoi(etapes[1])) return;
      montrer(Math.min(etapes.length - 1, courante + 1));
    }
    if (e.target.closest('[data-etape-precedente]')) montrer(Math.max(0, courante - 1));
  });
  f.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('input') && courante < 2) { e.preventDefault(); $('[data-etape-suivante]', etapes[courante])?.click(); }
  });
  function valideSansEnvoi(etape) {
    let premier = null;
    $$('input[required], textarea[required]', etape).forEach((c) => {
      const v = c.value.trim();
      const bon = v && (c.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v));
      if (!bon) premier = premier || c;
    });
    if (premier) {
      /* Les messages d'erreur du socle s'affichent à l'envoi : on déclenche sa vérification, sans rien envoyer. */
      const envoi = $('[type="submit"]', f);
      montrer(1, false);
      envoi.disabled = false;
      f.dispatchEvent(new Event('submit', { cancelable: true }));
      return false;
    }
    return true;
  }
  void valide;
  majAide();
  montrer(0, false);
}
