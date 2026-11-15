# Joyaux

Un jeu d'alignement de pierres précieuses : échange deux pierres voisines pour en aligner trois ou plus de la même sorte. Elles disparaissent, les autres tombent, de nouvelles arrivent, et les chaînes en cascade multiplient les points. Tu as 25 coups pour faire le meilleur score.

*English version: [README.en.md](README.en.md)*

## Commandes

- **Clic sur une pierre** puis **sur sa voisine** (à gauche, à droite, en haut ou en bas) pour les échanger.
- Ou **glisse** une pierre vers sa voisine.
- **Nouvelle partie** recommence.
- **Plein écran** : le bouton du même nom ; Échap pour en sortir. Hors plein écran, le plateau prend toute la place que laisse la fenêtre.

## Règles

- Le plateau fait 8 × 8 cases avec 6 sortes de pierres. Chaque pierre a sa forme : on les reconnaît même sans les couleurs.
- Un échange doit aligner au moins **trois pierres pareilles**, en ligne ou en colonne ; sinon il est annulé et **ne coûte pas de coup**.
- Les pierres alignées disparaissent, celles du dessus tombent et de nouvelles arrivent par le haut. Si elles forment à leur tour des alignements, c'est une **chaîne**.
- S'il n'y a plus aucun échange possible, le plateau est mélangé tout seul.
- Après le 25e coup (et la fin des chaînes), la partie s'arrête.

## Pierres spéciales

- **Bombe** : aligne **4 pierres** pareilles ; à l'endroit de ton échange reste une pierre avec une petite bombe, qui clignote. Quand elle est alignée à son tour, elle **explose** et efface les 3 × 3 cases autour d'elle (et fait sauter les autres bombes prises dedans).
- **Étoile** : aligne **5 pierres** ; il reste une étoile aux six couleurs. **Échange-la** avec n'importe quelle pierre : toutes les pierres de cette couleur disparaissent. Deux étoiles échangées vident tout le plateau.
- Chaque bombe ou étoile qui part rapporte **50 points** de plus, avec une secousse et un grand éclat.
- De temps en temps, un **éclat** brille sur une pierre.

## Points

Chaque pierre retirée vaut 10 points, multipliés par le rang dans la chaîne : ×1 pour le premier alignement, ×2 pour celui qui suit en cascade, ×3 pour le suivant, etc.

## Statistiques

Le panneau Records montre ton **meilleur score** et le nombre de **parties**.

## Données et synchronisation

Ton meilleur score et tes parties sont enregistrés par NeoDex, sauvegardés et synchronisés entre tes PC si la synchro est activée.

## Installer

Dans NeoDex : **NeoStore → À découvrir → Joyaux → Installer**.

Développer un plugin : voir le [SDK NeoDex](https://github.com/NDesumeur/neodex-sdk).
