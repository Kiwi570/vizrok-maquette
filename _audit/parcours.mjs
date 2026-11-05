/* Parcours propres à Vizrok : kit au vestiaire (total vérifié par le calcul), filtres de la boutique,
   fiche en volet par son lien, panier (deux onglets, donnée abîmée). */
export default async function ({ contexte, attendrePret, attendre, BASE, R, T }) {
  const { ctx, page } = await contexte({ taille: T('390×844') });
  try {
    /* Kit : le total affiché égale la somme des pièces cochées. */
    await page.goto(BASE + '/seance', { waitUntil: 'load' });
    await attendrePret(page);
    await page.evaluate(() => {
      for (const [nom, i] of [['kit-gourde', 1], ['kit-verre', 1], ['kit-tete', 2]]) {
        const r = document.querySelectorAll(`input[name="${nom}"]`)[i];
        r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await attendre(900);
    const kit = await page.evaluate(() => {
      const att = [...document.querySelectorAll('[data-kit] input:checked[data-prix-option]')].reduce((s, i) => s + parseFloat(i.dataset.prixOption), 0);
      const t = document.querySelector('[data-kit-total]');
      const r = t.getBoundingClientRect();
      return { att, aff: parseFloat(t.dataset.total), visible: r.top >= 0 && r.bottom <= innerHeight };
    });
    if (Math.abs(kit.att - kit.aff) > 0.005) R.echec('kit', `total ${kit.aff} au lieu de ${kit.att}`, { page: '/seance', taille: '390×844' });

    /* Boutique : ?collection=nutrition affiche les 5 produits nutrition, la fiche s'ouvre par son lien. */
    await page.goto(BASE + '/boutique?collection=nutrition', { waitUntil: 'load' });
    await attendrePret(page);
    const n = await page.evaluate(() => document.querySelectorAll('[data-grille] .fiche:not([hidden])').length);
    if (n !== 5) R.echec('filtres', `${n} fiches pour la collection nutrition au lieu de 5`, { page: '/boutique?collection=nutrition' });
    await page.goto(BASE + '/boutique?produit=gourde', { waitUntil: 'load' });
    await attendrePret(page);
    await attendre(400);
    const ouverte = await page.evaluate(() => document.querySelector('[data-fiche-volet]')?.open && document.querySelector('[data-fv-nom]').textContent);
    if (!ouverte) R.echec('fiche', 'la fiche de la gourde ne s’ouvre pas par son lien', { page: '/boutique?produit=gourde' });

    /* Panier : identique dans deux onglets ; une donnée abîmée est nettoyée sans bloquer le site. */
    await page.keyboard.press('Escape');
    await page.goto(BASE + '/boutique', { waitUntil: 'load' });
    await attendrePret(page);
    await page.locator('.fiche[data-produit="gourde"] [data-ajouter]').click();
    await attendre(300);
    const autre = await ctx.newPage();
    await autre.goto(BASE + '/', { waitUntil: 'load' });
    await attendrePret(autre);
    const compte = await autre.evaluate(() => document.querySelector('[data-panier-compte]').textContent);
    if (compte !== '1') R.echec('panier', `compte ${compte} dans le second onglet au lieu de 1`, { page: '/' });
    await page.evaluate(() => localStorage.setItem('vizrok:panier', '{abîmé'));
    await page.reload({ waitUntil: 'load' });
    if ((await attendrePret(page)) === 'jamais-pret') R.echec('panier', 'une donnée abîmée bloque le site', { page: '/boutique' });
    await autre.close();
  } finally { await ctx.close(); }
}
