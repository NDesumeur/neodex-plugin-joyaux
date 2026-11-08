# Joyaux

Un jeu d'alignement de pierres précieuses : échange deux pierres voisines pour en aligner trois ou plus de la même sorte. Elles disparaissent, les autres tombent, de nouvelles arrivent, et les chaînes en cascade multiplient les points. Tu as 25 coups pour faire le meilleur score.

*English version: [README.en.md](README.en.md)*

## Commandes

- **Clic sur une pierre** puis **sur sa voisine** (à gauche, à droite, en haut ou en bas) pour les échanger.
- Ou **glisse** une pierre vers sa voisine.
- **Nouvelle partie** recommence.

## Règles

- Le plateau fait 8 × 8 cases avec 6 sortes de pierres. Chaque pierre a sa forme : on les reconnaît même sans les couleurs.
- Un échange doit aligner au moins **trois pierres pareilles**, en ligne ou en colonne ; sinon il est annulé et **ne coûte pas de coup**.
- Les pierres alignées disparaissent, celles du dessus tombent et de nouvelles arrivent par le haut. Si elles forment à leur tour des alignements, c'est une **chaîne**.
- S'il n'y a plus aucun échange possible, le plateau est mélangé tout seul.
- Après le 25e coup (et la fin des chaînes), la partie s'arrête.

## Points

Chaque pierre retirée vaut 10 points, multipliés par le rang dans la chaîne : ×1 pour le premier alignement, ×2 pour celui qui suit en cascade, ×3 pour le suivant, etc.

## Statistiques

Le panneau Records montre ton **meilleur score** et le nombre de **parties**.

## Données et synchronisation

Ton meilleur score et tes parties sont enregistrés par NeoDex, sauvegardés et synchronisés entre tes PC si la synchro est activée.

## Installer

Dans NeoDex : **NeoStore → À découvrir → Joyaux → Installer**.

Développer un plugin : voir le [SDK NeoDex](https://github.com/NDesumeur/neodex-sdk).
