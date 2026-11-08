# Joyaux (Jewels)

A gem-matching game: swap two neighbouring stones to line up three or more of the same kind. They vanish, the others fall, new ones arrive, and cascading chains multiply the points. You have 25 moves to get the best score.

*Version française : [README.md](README.md)*

## Controls

- **Click a stone** then **its neighbour** (left, right, above or below) to swap them.
- Or **drag** a stone towards its neighbour.
- **New game** starts over.

## Rules

- The board has 8 × 8 cells with 6 kinds of stones. Each stone has its own shape: you can tell them apart even without the colours.
- A swap must line up at least **three identical stones**, in a row or a column; otherwise it is undone and **costs no move**.
- Matched stones vanish, those above fall and new ones come in from the top. If they form new matches in turn, that is a **chain**.
- If no swap is possible any more, the board is shuffled by itself.
- After the 25th move (and the end of the chains), the game ends.

## Points

Each removed stone is worth 10 points, multiplied by its place in the chain: ×1 for the first match, ×2 for the one that follows in the cascade, ×3 for the next, and so on.

## Statistics

The Records panel shows your **best score** and the number of **games**.

## Data and sync

Your best score and games are stored by NeoDex, backed up and synced between your PCs when sync is on.

## Install

In NeoDex: **NeoStore → Discover → Joyaux → Install**.

Building a plugin: see the [NeoDex SDK](https://github.com/NDesumeur/neodex-sdk).
