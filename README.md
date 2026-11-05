# Vizrok.store — maquette v1

Maquette de la boutique Vizrok.store, direction « Salle de nuit » : bleu nuit #050B14, vert néon de la marque, jaune et orange néon des maillots.
Site statique (HTML, CSS, JavaScript), généré depuis `donnees/` par `node outils/generer.mjs`, prêt pour Vercel (cleanUrls).

## Pages

| Page | Ouverture | Effets propres |
|---|---|---|
| Accueil | Intro « la barre se charge » (disques, compteur 00 → 18 pièces), onde de choc WebGL sur la photo | ruban réactif à la vitesse, manifeste mot à mot, collections épinglées (disques), maillot mesh, néon des réseaux |
| Boutique | Compacte, disques-filtres qui roulent | catalogue filtrable en Flip, recherche, tri, fiche en volet avec son lien (`?produit=`), panier |
| Ta séance | Chrono LED qui devient le titre | maillot en vue éclatée épinglée, guide des tailles en cm, kit au vestiaire |
| Nutrition | Étiquette nutritionnelle tracée, valeurs « à compléter » | shaker qui se remplit, saveurs, mentions obligatoires |
| Livraison & retours | Bordereau tamponné | frise des étapes, remboursements, FAQ |
| Contact | Casier qui s'ouvre | formulaire en étapes (simulé) |
| 404 | Disque qui roule | — |

## À fournir par le client (à compléter)

- **Prix TTC** : la boutique actuelle affiche des prix hors taxes en euros (« plus tax »), qui sont des conversions de prix ronds en dollars (25 $ → 22,73 €). En France, les prix TTC sont obligatoires face aux particuliers.
- **Gamme Vizrok Nutrition** : pour chaque produit, ce qui est réellement livré pour le prix (Nutrimax décrit huit produits, Built to Perform en cite trois), la composition, les allergènes, la déclaration nutritionnelle, la quantité nette, la date de durabilité, le nom et l'adresse de l'exploitant ; pour les compléments alimentaires, la dose journalière et les mentions obligatoires ; pour la boisson énergisante, la teneur en caféine. Les promesses « récupération », « focus / concentration », « énergie durable » ne sont pas des allégations autorisées en l'état : elles ont été retirées de la maquette.
- **Guide des tailles du maillot** : la largeur du L (« 225 » sur la boutique actuelle) est à confirmer ; les autres valeurs ont été converties des pouces en centimètres.
- **Mentions légales** : identité de l'éditeur, SIRET ou équivalent, directeur de la publication, hébergeur (Vercel Inc., adresse à vérifier sur vercel.com/legal au moment de la mise en ligne).
- **Politique de confidentialité** (RGPD) et conditions générales de vente.
- **Logo** officiel en vectoriel : la maquette utilise une marque typographique avec l'éclair des accessoires.
- **Photos des autres coloris** : la boutique ne fournit que des photos du coloris Blanc pour les vêtements et la casquette (Noir pour la gourde). La fiche l'indique (« Photos : coloris Blanc. ») ; pour le maillot, Jaune néon et Orange néon sont un aperçu teinté de la photo blanche, à remplacer par de vraies photos si elles existent.
- **Verre shaker** : ses photos sont sur fond blanc, les autres produits sur fond noir ; une prise sur fond noir harmoniserait la grille.
- **Vraies photos** des produits portés et du créateur, si elles existent.
- **« Personnalisé »** : la boutique actuelle décrit le maillot et le verre canette comme « personnalisés avec le visuel Vizrok », alors que la rétractation exclut les articles personnalisés. La maquette écrit « imprimé au visuel Vizrok » ; à confirmer avec Fourthwall.
- **Mentions obligatoires de la nutrition** (à afficher sur chaque fiche une fois fournies) : dénomination, ingrédients et allergènes mis en évidence, quantité nette, date de durabilité minimale, conservation, déclaration nutritionnelle, nom et adresse de l'exploitant ; pour les compléments alimentaires, dose journalière, « Ne pas dépasser la dose journalière recommandée », « Tenir hors de portée des jeunes enfants », « Ne se substitue pas à une alimentation variée et équilibrée et à un mode de vie sain » ; boisson à plus de 150 mg/l de caféine : « Teneur élevée en caféine. Déconseillé aux enfants et aux femmes enceintes ou allaitantes » et la teneur en mg/100 ml ; polyols ajoutés à plus de 10 % : « Une consommation excessive peut avoir des effets laxatifs » ; allégations de santé limitées aux formulations autorisées du registre européen.
- **Guide des tailles** : la boutique actuelle affiche des valeurs en pouces sous l'étiquette « cm » ; la maquette les a converties.

## Crédits

- Photos des produits : boutique Fourthwall actuelle de Vizrok (60 vues pour 18 produits, `assets/images/produits/`, fond et affichage de chaque vue dans `donnees/vues.json`).
- Illustrations générées (Grok) : `assets/images/grok/`. Chacune porte sur le site la mention « Illustration générée » : **à garder sur le site final**.
- Polices : Big Shoulders Display, Archivo, JetBrains Mono (licence SIL Open Font License), hébergées avec le site.
- GSAP 3.15 (ScrollTrigger, SplitText, Flip).

## À retirer à la mise en ligne définitive

- La consigne `noindex` (balise robots dans `source/gabarits/commun.mjs`, en-tête X-Robots-Tag dans `vercel.json`).
- Le panier et les formulaires simulés (à brancher sur la boutique Fourthwall et un vrai envoi).
- Les mentions « à compléter » et « Prix TTC à compléter », une fois les informations fournies.
- À garder : la mention « Illustration générée ».

## Commandes

- `node outils/generer.mjs` : régénère les pages depuis `donnees/` et `source/` (ne jamais modifier les pages produites à la main).
- `node _audit/audit.mjs` : audit standard ; `--complet` pour la version finale.
