# Rapport d’audit

Projet : `vizrok-maquette` · 05/11/2026 18:37:21 · 16 min · 4 page(s) · audit standard ciblé sur /,/boutique,/seance,/nutrition

## Résumé

- Échecs : **0**
- À regarder : **2**
- Non lancé : **1**
- Contrôles passés : vercel.json (1), .vercelignore (1), robots.txt (1), numéro de version (1), langues (1), mesures (44), balayage (4), films d’ouverture (8), films de transition (8), bords de l’écran (5), intro accélérable et passable (7), menu (1), clavier (4), liens et boutons (4), liens profonds (4), liens vers la page en cours (4), changements de hauteur (4), mode calme (8), bouton du mode calme (2), parcours du projet (1), tient dans l’écran (4), fluidité (8), défilement selon l’appareil (5), mouvement (8), effets du plan (17), souris immobile (3), vitesse (4), captures (1)

## Échecs

Aucun.

## À regarder

### fluidité (1)

- **fluidité** — `/` — 4 % d'images de plus de 50 ms _(1366×768 défilement à la molette, processeur ralenti 4 fois)_

### effet qui dérive sous la souris immobile (1)

- **effet qui dérive sous la souris immobile** — `/nutrition` — [data-souris] onde — léger changement (0.3 %) 1,5 à 4,5 s après l’arrêt de la souris _(1366×768 souris)_

## Non lancé

- **Safari (WebKit)** : WebKit ne peut pas s’installer ici : vérification à faire dans Safari sur le Mac (liste dans le rapport)

### À vérifier dans Safari sur le Mac (WebKit indisponible ici)

- Ouverture de chaque page : rien qui clignote, intro complète au premier chargement et au rechargement.
- Changement de page : le voile couvre l’écran, pas de page blanche ; retour arrière sans intro ni voile resté.
- Défilement : fluide (natif), en-tête qui se cache et revient sans clignoter, sections épinglées entières.
- Menu sur iPhone (mode Responsive de Safari) : ouverture, fermeture, page bloquée derrière.
- Polices, images, mention « Illustration générée », formulaires et barre fixe du bas.

## Repères

- Numéro de version des fichiers : ?v=2
- Audit standard : étapes lourdes sur /, /boutique, /nutrition, /seance.
- Accessibilité : axe-core 4.12.1 en plus des contrôles intégrés.
- Ouverture / (1366×768) : 2817 ms depuis le premier octet
- Ouverture /boutique (1366×768) : 2606 ms depuis le premier octet
- Ouverture /nutrition (1366×768) : 2662 ms depuis le premier octet
- Ouverture /seance (1366×768) : 2654 ms depuis le premier octet
- Ouverture / (390×844) : 2679 ms depuis le premier octet
- Ouverture /boutique (390×844) : 2594 ms depuis le premier octet
- Ouverture /nutrition (390×844) : 2630 ms depuis le premier octet
- Ouverture /seance (390×844) : 2649 ms depuis le premier octet
- Bords de l’écran : 447 images d’intro, 13 de voile et 124 de menu jugées (panneau immobile couvrant tout l’écran), barre de défilement classique de 15 px.
- Tient dans l'écran /boutique : aucune section épinglée ou plein écran.
- Tient dans l'écran /nutrition : aucune section épinglée ou plein écran.
- Tient dans l'écran /seance : aucune section épinglée ou plein écran.
- Fluidité /boutique 1366×768 (molette) : 0 % d'images lentes sur 227, tâche la plus longue 0 ms
- Fluidité /nutrition 1366×768 (molette) : 1 % d'images lentes sur 277, tâche la plus longue 105 ms
- Fluidité /seance 1366×768 (molette) : 0 % d'images lentes sur 346, tâche la plus longue 0 ms
- Fluidité / 390×844 (doigt) : 0 % d'images lentes sur 1344, tâche la plus longue 0 ms
- Fluidité /boutique 390×844 (doigt) : 0 % d'images lentes sur 1349, tâche la plus longue 0 ms
- Fluidité /nutrition 390×844 (doigt) : 0 % d'images lentes sur 1349, tâche la plus longue 0 ms
- Fluidité /seance 390×844 (doigt) : 0 % d'images lentes sur 1353, tâche la plus longue 0 ms
- Vitesse / : 0.71 s de calcul au chargement (téléphone ralenti).
- Vitesse /boutique : 0.64 s de calcul au chargement (téléphone ralenti).
- Vitesse /nutrition : 0.47 s de calcul au chargement (téléphone ralenti).
- Vitesse /seance : 0.53 s de calcul au chargement (téléphone ralenti).

## Fichiers

- Captures : `captures/` (téléphone, tablette, ordinateur, écran par écran)
- Films : `films/` (planches contact de l’ouverture, des transitions, des retours, des ancres et des épinglages ; ⚠ = image signalée)
- Comparaisons : `comparaisons/`
- Détail complet : `rapport.json`
