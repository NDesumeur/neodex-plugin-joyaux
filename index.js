// Joyaux : Échange deux pierres voisines pour en aligner trois ou plus de la même sorte. Les chaînes en cascade multiplient les points ; 25 coups par partie.
// Jeu NeoDex en pixel art dessiné à la main (police bitmap, cadres et boutons en pixels). Il tourne dans le bac à sable de NeoDex.
const HTML = `<div class="appWrap wide">
  <div class="agHead"><span class="label">Joyaux</span><span class="hint">Clic sur une pierre puis sur sa voisine, ou glisser</span></div>
  <div class="gMain"><div class="gameBox"><canvas id="gc" width="168" height="182" role="img" aria-label="Plateau de Joyaux"></canvas></div>
    <div class="gSide">
      <div class="sysCard"><b>RECORDS</b><div class="gStats" id="gStats"></div></div>
      <label class="row">Mode <select class="gSel" id="jyMode"><option value="score">Score · 25 coups</option><option value="combat">Combat contre les monstres</option></select></label>
      <div class="row"><button class="btn main" id="gNew">NOUVELLE PARTIE</button><button class="btn" id="gFs">PLEIN ÉCRAN</button></div>
      <div class="hint">4 pierres alignées : une bombe, qui explose en 3 × 3 quand on l'aligne à son tour.</div><div class="hint">5 pierres alignées : une étoile ; échange-la avec une pierre pour effacer toute sa couleur.</div>
      <div class="hint">Combat : chacun son tour avec le monstre. Rouge : des coups ; vert : des soins ; bleu : un bouclier ; les autres remplissent la magie (à 12, un sort de 8 dégâts). Une bombe ou une étoile créée : on rejoue.</div>
      <div class="hint">Un échange qui n'aligne rien est annulé et ne coûte pas de coup.</div><div class="hint">Chaque pierre a sa forme : on les reconnaît même sans les couleurs.</div>
    </div></div>
</div>`;
const CSS = `.gMain{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}
.gameBox{display:grid;place-items:center;padding:10px;background:#05010b;flex:2;min-width:320px;position:relative}
.gameBox canvas{width:100%;image-rendering:pixelated;cursor:var(--cp,pointer);touch-action:none}
.gSide{display:flex;flex-direction:column;gap:14px;flex:1;min-width:250px;max-width:420px}
.gSide .sysCard{display:flex;flex-direction:column}
.gStats{display:grid;grid-template-columns:1fr auto;gap:4px 14px}
.gStats b{text-align:right}
.gameBox canvas{width:min(100%,max(300px,calc((100vh - 190px) * 168 / 182)));height:auto;aspect-ratio:168/182}
.gameBox:fullscreen{padding:0}
.gameBox:fullscreen canvas{width:min(100vw,calc(100vh * 168 / 182))}`;
/* ---------- l'habillage pixel art, dessiné à la main : police bitmap (accents compris), cadres, boutons, icônes ----------
   Tout est en pixels pleins, agrandis par 2 sans lissage : aucun dégradé, aucune ombre floue. */
const PXK = (() => {
  // chaque lettre : ses lignes, de haut en bas, à partir de la ligne 2 de la case (0-1 : accents des majuscules, 9-10 : jambages)
  const S = {
    A: '.###. #...# #...# ##### #...# #...# #...#', B: '####. #...# #...# ####. #...# #...# ####.', C: '.###. #...# #.... #.... #.... #...# .###.',
    D: '####. #...# #...# #...# #...# #...# ####.', E: '##### #.... #.... ####. #.... #.... #####', F: '##### #.... #.... ####. #.... #.... #....',
    G: '.###. #...# #.... #.### #...# #...# .####', H: '#...# #...# #...# ##### #...# #...# #...#', I: '### .#. .#. .#. .#. .#. ###',
    J: '..### ...#. ...#. ...#. #..#. #..#. .##..', K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#', L: '#.... #.... #.... #.... #.... #.... #####',
    M: '#...# ##.## #.#.# #.#.# #...# #...# #...#', N: '#...# ##..# #.#.# #..## #...# #...# #...#', O: '.###. #...# #...# #...# #...# #...# .###.',
    P: '####. #...# #...# ####. #.... #.... #....', Q: '.###. #...# #...# #...# #.#.# #..#. .##.#', R: '####. #...# #...# ####. #.#.. #..#. #...#',
    S: '.#### #.... #.... .###. ....# ....# ####.', T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..', U: '#...# #...# #...# #...# #...# #...# .###.',
    V: '#...# #...# #...# #...# #...# .#.#. ..#..', W: '#...# #...# #...# #.#.# #.#.# ##.## #...#', X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
    Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..', Z: '##### ....# ...#. ..#.. .#... #.... #####',
    a: '..... ..... .###. ....# .#### #...# .####', b: '#.... #.... ####. #...# #...# #...# ####.', c: '..... ..... .###. #.... #.... #.... .###.',
    d: '....# ....# .#### #...# #...# #...# .####', e: '..... ..... .###. #...# ##### #.... .###.', f: '..## .#.. #### .#.. .#.. .#.. .#..',
    g: '..... ..... .#### #...# #...# #...# .#### ....# .###.', h: '#.... #.... ####. #...# #...# #...# #...#', i: '.#. ... ##. .#. .#. .#. ###',
    'ı': '... ... ##. .#. .#. .#. ###', j: '...# .... ..## ...# ...# ...# ...# #..# .##.', k: '#... #... #..# #.#. ##.. #.#. #..#',
    l: '##. .#. .#. .#. .#. .#. ###', m: '..... ..... ##.#. #.#.# #.#.# #.#.# #...#', n: '..... ..... ####. #...# #...# #...# #...#',
    o: '..... ..... .###. #...# #...# #...# .###.', p: '..... ..... ####. #...# #...# #...# ####. #.... #....', q: '..... ..... .#### #...# #...# #...# .#### ....# ....#',
    r: '.... .... #.## ##.. #... #... #...', s: '..... ..... .#### #.... .###. ....# ####.', t: '.#.. .#.. #### .#.. .#.. .#.. ..##',
    u: '..... ..... #...# #...# #...# #..## .##.#', v: '..... ..... #...# #...# #...# .#.#. ..#..', w: '..... ..... #...# #...# #.#.# #.#.# .#.#.',
    x: '..... ..... #...# .#.#. ..#.. .#.#. #...#', y: '..... ..... #...# #...# #...# #...# .#### ....# .###.', z: '..... ..... ##### ...#. ..#.. .#... #####',
    0: '.###. #...# #..## #.#.# ##..# #...# .###.', 1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.', 2: '.###. #...# ....# ...#. ..#.. .#... #####',
    3: '####. ....# ....# .###. ....# ....# ####.', 4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.', 5: '##### #.... ####. ....# ....# #...# .###.',
    6: '.###. #.... #.... ####. #...# #...# .###.', 7: '##### ....# ...#. ..#.. .#... .#... .#...', 8: '.###. #...# #...# .###. #...# #...# .###.',
    9: '.###. #...# #...# .#### ....# ....# .###.',
    '.': '. . . . . . #', ',': '.. .. .. .. .. .# .# #.', ':': '. . # . . . #', ';': '.. .. .# .. .. .# .# #.', '!': '# # # # # . #',
    '?': '.###. #...# ....# ...#. ..#.. ..... ..#..', "'": '# # . . . . .', '"': '#.# #.# ... ... ... ... ...', '-': '... ... ... ### ... ... ...',
    '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....', '/': '....# ...#. ...#. ..#.. .#... .#... #....', '(': '.# #. #. #. #. #. .#', ')': '#. .# .# .# .# .# #.',
    '%': '##..# ##.#. ...#. ..#.. .#... .#.## #..##', '·': '. . . # . . .', '×': '..... ..... #...# .#.#. ..#.. .#.#. #...#',
    '<': '...# ..#. .#.. #... .#.. ..#. ...#', '>': '#... .#.. ..#. ...# ..#. .#.. #...', '=': '.... .... #### .... #### .... ....',
    '_': '..... ..... ..... ..... ..... ..... #####', '#': '.#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.', '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#',
    '…': '..... ..... ..... ..... ..... ..... #.#.#', '«': '..... ..#.# .#.#. #.#.. .#.#. ..#.# .....', '»': '..... #.#.. .#.#. ..#.# .#.#. #.#.. .....',
    '◀': '...# ..## .### #### .### ..## ...#', '▶': '#... ##.. ###. #### ###. ##.. #...', '→': '..... ..#.. ...#. ##### ...#. ..#.. .....',
    '←': '..... ..#.. .#... ##### .#... ..#.. .....', '↑': '..#.. .###. #.#.# ..#.. ..#.. ..#.. ..#..', '↓': '..#.. ..#.. ..#.. ..#.. #.#.# .###. ..#..',
    '*': '..... #.#.# .###. ##### .###. #.#.# .....', '[': '## #. #. #. #. #. ##', ']': '## .# .# .# .# .# ##', '|': '# # # # # # #',
    '@': '.###. #...# #.### #.#.# #.### #.... .###.', '€': '..### .#... ####. .#... ####. .#... ..###', '$': '..#.. .#### #.#.. .###. ..#.# ####. ..#..',
    '°': '.#. #.# .#. ... ... ... ...', '~': '..... ..... .#..# #.##. ..... ..... .....', '♪': '..##. ..#.# ..#.. ..#.. .##.. ###.. .#...',
  };
  const ACC = { a: ['..#', '.#.'], g: ['#..', '.#.'], c: ['.#.', '#.#'], d: ['...', '#.#'], t: ['.#.#', '#.#.'], z: ['.#.', '##.'] };  // aigu, grave, circonflexe, tréma, tilde, cédille
  const COMP = { é: 'ea', è: 'eg', ê: 'ec', ë: 'ed', á: 'aa', à: 'ag', â: 'ac', ä: 'ad', í: 'ıa', ì: 'ıg', î: 'ıc', ï: 'ıd', ó: 'oa', ò: 'og', ô: 'oc', ö: 'od',
    ú: 'ua', ù: 'ug', û: 'uc', ü: 'ud', ÿ: 'yd', ñ: 'nt', ç: 'cz', É: 'Ea', È: 'Eg', Ê: 'Ec', Ë: 'Ed', Á: 'Aa', À: 'Ag', Â: 'Ac', Ä: 'Ad', Í: 'Ia', Î: 'Ic', Ï: 'Id',
    Ó: 'Oa', Ô: 'Oc', Ö: 'Od', Ú: 'Ua', Ù: 'Ug', Û: 'Uc', Ü: 'Ud', Ñ: 'Nt', Ç: 'Cz' };
  const SUB = { 'œ': 'oe', 'Œ': 'OE', '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', ' ': ' ', ' ': ' ', '•': '·', '✓': 'v', 'ᐸ': '<', 'ᐳ': '>', '＜': '<', '＞': '>', '｜': '|', '／': '/', '！': '!', '？': '?', '（': '(', '）': ')', '：': ':', '　': ' ' };  // ᐸ ᐳ : les < > des titres YouTube
  const H = 11, glyphs = new Map(); let raster;
  function glyph(ch) {
    let g = glyphs.get(ch); if (g) return g;
    const px = [], add = (rows, ox, oy) => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') px.push([ox + x, oy + y]); });
    const c = COMP[ch], src = S[c ? c[0] : ch]; let w = 3;
    if (src) {
      const rows = src.split(' '); w = Math.max(...rows.map(r => r.length)); add(rows, 0, 2);
      if (c) { const a = ACC[c[1]]; add(a, Math.floor((w - a[0].length) / 2), c[1] === 'z' ? 9 : /[A-Z]/.test(c[0]) ? 0 : 1); }
    } else if (ch !== ' ') {  // japonais, emoji… : la lettre du système, réduite à des pixels nets (sans lissage) sur la même hauteur que la police
      const q = (raster ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })), RW = 16;
      q.canvas.width = RW; q.canvas.height = H; q.font = '11px "MS Gothic", "Yu Gothic UI", Meiryo, "Segoe UI Symbol", sans-serif'; q.fillStyle = '#000'; q.fillText(ch, 0, 10);
      const d = q.getImageData(0, 0, RW, H).data; let mx = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < RW; x++) if (d[(y * RW + x) * 4 + 3] > 110) { px.push([x, y]); mx = Math.max(mx, x + 1); }
      w = mx || 3;
      if (!px.length) { w = 5; add(['#####', '#...#', '#...#', '#...#', '#...#', '#...#', '#####'], 0, 2); }  // vraiment inconnue : une petite case
    }
    g = { w, px }; glyphs.set(ch, g); return g;
  }
  function layout(text) {
    let x = 0; const items = [];
    for (const ch of String(text)) for (const c of SUB[ch] ?? ch) { const g = glyph(c); items.push([g, x]); x += g.w + 1; }
    return { w: Math.max(0, x - 1), items };
  }
  function draw(g, text, x, y, color, s = 1) {  // (x, y) : coin haut gauche de la case
    const L = layout(text); g.fillStyle = color;
    for (const [gl, ox] of L.items) for (const [px, py] of gl.px) g.fillRect(x + (ox + px) * s, y + py * s, s, s);
    return L.w * s;
  }
  const bmp = new Map();
  function sprite(text, color, s = 1) {  // le texte tout prêt, gardé pour les images suivantes du jeu
    const k = text + '|' + color + '|' + s; let c = bmp.get(k); if (c) return c;
    c = document.createElement('canvas'); c.width = Math.max(1, layout(text).w * s); c.height = H * s; draw(c.getContext('2d'), text, 0, 0, color, s);
    if (bmp.size > 400) bmp.delete(bmp.keys().next().value);
    bmp.set(k, c); return c;
  }
  // comme fillText : (x, y) sur la ligne de base, aligné à gauche, au centre ou à droite
  function fill(g, text, x, y, color, s = 1, align = 'left') {
    const c = sprite(String(text), color, s), dx = align === 'center' ? -c.width / 2 : align === 'right' ? -c.width : 0;
    g.drawImage(c, Math.round(x + dx), Math.round(y - 9 * s));
  }
  const scale = size => Math.max(1, Math.round((size || 8) / 8));
  function art(rows, pal, s = 1) {  // un dessin en lignes de caractères, chaque caractère une couleur de la palette (« . » : transparent)
    const c = document.createElement('canvas'); c.width = Math.max(...rows.map(r => r.length)) * s; c.height = rows.length * s;
    const g = c.getContext('2d');
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const col = pal[r[x]]; if (col) { g.fillStyle = col; g.fillRect(x * s, y * s, s, s); } } });
    return c;
  }
  return { H, layout, draw, sprite, fill, scale, art };
})();

// les pièces de l'interface, pixel par pixel (K : contour, les autres lettres : la palette du jeu)
const PX_PANEL = ['..KKKKKKKKKKKK..', '.KAAAAAAAAAAAAK.', 'KALAAAAAAAAAALSK', 'KAAKKKKKKKKKKSSK', 'KAAKHHHHHHHHKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK',
  'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKKKKKKKKKKSSK', 'KALSSSSSSSSSSLSK', '.KSSSSSSSSSSSSK.', '..KKKKKKKKKKKK..'];
const PX_CARD = ['.KKKKKKKKKK.', 'KFFFFFFFFFFK', 'KFHHHHHHHHFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFSSSSSSSSFK', 'KFFFFFFFFFFK', '.KKKKKKKKKK.'];
const PX_BTN = ['.KKKKKKKKKK.', 'KWWWWWWWWWWK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KBBBBBBBBBBK', 'KKKKKKKKKKKK', 'KDDDDDDDDDDK', '.KKKKKKKKKK.'];
const PX_BTN_DOWN = ['............', '............', '.KKKKKKKKKK.', 'KBBBBBBBBBBK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KWWWWWWWWWWK', '.KKKKKKKKKK.'];
const PX_TRACK = ['.KKKKKKKKKK.', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KHHHHHHHHHHK', '.KKKKKKKKKK.'];
const PX_KNOB = ['.KKKKK.', 'KWWWWWK', 'KWAAABK', 'KWAAABK', 'KKKKKKK', 'KWAAABK', 'KWAAABK', 'KBBBBBK', 'KDDDDDK', '.KKKKK.'];
const PX_RAIL = ['KDDDDDDK', 'KDDDDDDK', 'KDDDDDDK', 'KDDHHDDK'];
const PX_ICONS = {
  play: ['kk......', 'kakk....', 'kaaakk..', 'kaaaaakk', 'kaaaaaak', 'kaaaaakk', 'kaaakk..', 'kakk....', 'kk......'],
  full: ['www...www', 'w.......w', 'w.......w', '.........', '....a....', '.........', 'w.......w', 'w.......w', 'www...www'],
  note: ['...aaaaaa', '...aaaaaa', '...a....a', '...a....a', '...a....a', '.aaa..aaa', 'aaaa.aaaa', 'aaaa.aaaa', '.aa...aa.'],
  star: ['....g....', '....g....', '...ggg...', 'ggggwgggg', '.ggwwwgg.', '..ggggg..', '..oo.oo..', '.oo...oo.', '.o.....o.'],
  crown: ['g...g...g', 'gg.ggg.gg', 'ggggggggg', 'grgggggrg', 'ggggggggg', 'ooooooooo'],
  folder: ['oooo.....', 'oggoooooo', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ooooooooo'],
  vol: ['....w....', '...ww..b.', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', '...ww..b.', '....w....'],
  clock: ['..wwwww..', '.w.....w.', 'w...a...w', 'w...a...w', 'w...aaa.w', 'w.......w', 'w.......w', '.w.....w.', '..wwwww..'],
  cursor: ['....a....', '..aaaaa..', '.a..a..a.', '.a.....a.', 'aaa.w.aaa', '.a.....a.', '.a..a..a.', '..aaaaa..', '....a....'],
  plus: ['...b...', '...b...', '...b...', 'bbbbbbb', '...b...', '...b...', '...b...'],
  down: ['wwwwwww', '.wwwww.', '..www..', '...w...'],
};

/* habille la page du jeu : root = son conteneur, T = sa palette, icons = [motif du texte, icône] pour les boutons et libellés */
function pxSkin(root, { T, icons = [], emblem, title }) {
  root.classList.add('pxk'); const s = 2, url = c => c.toDataURL();
  const btnPal = (M, W, B, D) => ({ K: T.k, W, M, B, D });
  const BN = btnPal(T.btn, T.btnHi, T.btnLo, T.k2), BH = btnPal(T.btnHov, T.btnHovHi, T.btnLo, T.k2);
  const BA = btnPal(T.acc, T.accL, T.accS, T.accD), BAH = btnPal(T.accL, '#ffffff', T.acc, T.accD);
  const img = { panel: PXK.art(PX_PANEL, { K: T.k, A: T.acc, S: T.accS, L: T.rivet, H: T.hl, D: T.fill }, s),
    card: PXK.art(PX_CARD, { K: T.k, F: T.line, H: T.hl, D: T.fill, S: T.k2 }, s), cardOn: PXK.art(PX_CARD, { K: T.k, F: T.acc, H: T.accS, D: T.fillOn, S: T.accD }, s),
    btn: PXK.art(PX_BTN, BN, s), btnH: PXK.art(PX_BTN, BH, s), btnD: PXK.art(PX_BTN_DOWN, BH, s),
    main: PXK.art(PX_BTN, BA, s), mainH: PXK.art(PX_BTN, BAH, s), mainD: PXK.art(PX_BTN_DOWN, BA, s),
    track: PXK.art(PX_TRACK, { K: T.k, D: T.k2, H: T.line }, s), knob: PXK.art(PX_KNOB, { K: T.k, W: T.accL, A: T.acc, B: T.accS, D: T.accD }, s),
    rail: PXK.art(PX_RAIL, { K: T.k, D: T.k2, H: T.line }, s), tile: PXK.art(T.tile, { x: T.bgDot, ':': T.bgDot2, '+': T.spark, '*': T.spark2 }, s) };
  const u = Object.fromEntries(Object.entries(img).map(([k, c]) => [k, url(c)]));
  const nine = (k, sl) => `border-style:solid;border-width:${sl * s}px;border-image:url(${u[k]}) ${sl * s} fill / ${sl * s}px stretch`;
  const IP = { k: T.k, w: T.text, a: T.acc, b: T.acc2, g: T.gold, o: T.orange, r: T.red, n: T.green, N: T.green2, m: T.muted, s: T.accS };
  const iconUrl = new Map(), icon = name => {
    let v = iconUrl.get(name); if (!v) { const c = PXK.art(PX_ICONS[name] || emblem, IP, s); v = { u: url(c), w: c.width, h: c.height }; iconUrl.set(name, v); }
    const b = document.createElement('b'); b.className = 'pxI'; b.setAttribute('aria-hidden', 'true'); b.style.cssText = `width:${v.w}px;height:${v.h}px;background-image:url(${v.u})`; return b;
  };
  const R = '.pxk.pxk';
  const css = document.createElement('style');
  css.textContent = `html,html body{background:${T.bg} url(${u.tile}) 0 0/${img.tile.width}px ${img.tile.height}px repeat!important}
::-webkit-scrollbar{width:16px;height:16px} ::-webkit-scrollbar-track{background:url(${u.rail}) 0 0/16px 8px repeat-y} ::-webkit-scrollbar-thumb{${nine('main', 4)}} ::-webkit-scrollbar-corner{background:none}
${R}{color:${T.text}}
${R} .px{box-shadow:none;background:none}
${R} .agHead{gap:18px;margin:0}
${R} .agHead .label{display:flex;align-items:center;gap:12px}
${R} .btn,${R} .tab{${nine('btn', 4)};height:auto;min-height:0;padding:0 6px 4px;margin:0;color:${T.text};font:12px/1 monospace;display:inline-flex;align-items:center;gap:6px;filter:none;text-shadow:none;letter-spacing:0;cursor:var(--cp,pointer)}
${R} .btn:hover,${R} .tab:hover{border-image-source:url(${u.btnH})}
${R} .btn:active,${R} .tab:active{border-image-source:url(${u.btnD});padding:4px 6px 0}
${R} .btn.main,${R} .tab.on{border-image-source:url(${u.main});color:${T.k}}
${R} .btn.main:hover,${R} .tab.on:hover{border-image-source:url(${u.mainH})}
${R} .btn.main:active,${R} .tab.on:active{border-image-source:url(${u.mainD})}
${R} .btn:focus-visible,${R} .tab:focus-visible{outline:2px dashed ${T.acc2};outline-offset:2px}
${R} .btn .pxV,${R} .tab .pxV{white-space:nowrap}
${R} .sysCard{${nine('card', 4)};padding:4px 6px;gap:8px;background:none}
${R} .sysCard.on{border-image-source:url(${u.cardOn})}
${R} .sysCard.on>b{color:${T.acc}}
${R} .sysCard>b{color:${T.text}}
${R} .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
${R} .gameBox,${R} .thBox{${nine('panel', 5)};box-shadow:none;background:none;padding:2px;gap:8px;grid-template-rows:auto auto}
${R} .gameBox canvas,${R} .thBox canvas{display:block;background:#05010b}
${R} .gameBox:fullscreen,${R} .thBox:fullscreen{border:0;padding:0;background:#000}
${R} .rhFs{position:static;opacity:1;justify-self:end;margin:0 6px 6px 0}
${R} .rhTabs{gap:8px;flex-wrap:wrap}
${R} .hint{color:${T.muted};line-height:24px}
${R} label{color:${T.muted};display:inline-flex;align-items:center;gap:8px}
${R} .rhDel{color:${T.red};top:6px;right:8px}
${R} input[type=range]{-webkit-appearance:none;appearance:none;background:none;height:20px;width:150px}
${R} input[type=range]::-webkit-slider-runnable-track{height:12px;${nine('track', 2)}}
${R} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:20px;border:0;background:url(${u.knob}) 0 0/100% 100%;margin-top:-8px;cursor:var(--cp,pointer)}
${R} .pxSel{justify-content:space-between;gap:10px;max-width:100%;overflow:hidden}
${R} .rhImport .pxSel{flex:1;min-width:0}
.pxMenu{position:fixed;z-index:50;${nine('card', 4)};padding:2px;max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;color:${T.text}}
.pxMenu button{all:unset;padding:3px 8px;cursor:var(--cp,pointer);white-space:nowrap}
.pxMenu button:hover,.pxMenu button:focus-visible,.pxMenu button.on{background:${T.btnHov};color:${T.text}}
.pxMenu button.on{color:${T.acc}}
.pxT{position:relative;white-space:normal;font:12px/1 monospace;letter-spacing:0;text-transform:none}
.pxT i{display:inline-block;vertical-align:middle;background:currentColor;-webkit-mask:var(--m) 0 0/100% 100% no-repeat;mask:var(--m) 0 0/100% 100% no-repeat;image-rendering:pixelated}
.pxI{display:inline-block;vertical-align:middle;background:0 0/100% 100% no-repeat;image-rendering:pixelated;margin-right:6px}
.pxV>.pxI+.pxI{margin-left:-4px}
.pxSr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;
  document.head.append(css);
  // un mot = une image (en masque : sa couleur suit celle du texte), une règle par mot pour ne pas répéter l'image
  const words = new Map(), sheet = document.head.appendChild(document.createElement('style')).sheet;
  const word = w => {
    let k = words.get(w);
    if (!k) { const c = PXK.sprite(w, '#fff', s); k = 'pw' + words.size; words.set(w, k); sheet.insertRule(`.${k}{--m:url(${c.toDataURL()});width:${c.width}px;height:${c.height}px}`, sheet.cssRules.length); }
    const i = document.createElement('i'); i.className = k; return i;
  };
  function render(vis, text, lead) {
    const parts = [], ic = lead && icons.find(([re]) => re.test(text.trim()));
    if (ic) parts.push(icon(ic[1]));
    for (const m of text.matchAll(/(★+)|(\s+)|([^\s★]+)/g)) {
      if (m[1]) for (const _ of m[1]) parts.push(icon('star'));
      else if (m[2]) parts.push(document.createTextNode(' '));
      else parts.push(word(m[3]));
    }
    vis.replaceChildren(...parts);
  }
  const lead = node => node.parentElement?.matches('button,label,.tab,.btn') && !node.previousSibling;
  function pixText(node) {  // le texte reste dans la page (lecteur d'écran, copier) ; on voit ses lettres en pixels
    const wrap = document.createElement('span'), sr = document.createElement('span'), vis = document.createElement('span');
    wrap.className = 'pxT'; sr.className = 'pxSr'; vis.className = 'pxV'; vis.setAttribute('aria-hidden', 'true');
    const first = lead(node); node.replaceWith(wrap); sr.append(node); wrap.append(sr, vis); render(vis, node.data, first);
  }
  function pxSelect(sel) {  // une liste déroulante en pixels ; la vraie reste cachée et garde sa valeur et ses événements
    sel.dataset.px = '1'; sel.style.display = 'none';
    const b = document.createElement('button'), lab = document.createElement('span'); b.type = 'button'; b.className = 'btn pxSel'; b.append(lab, icon('down')); sel.after(b);
    const sync = () => { const t = sel.selectedOptions[0]?.textContent || '—'; if (lab.dataset.t !== t) { lab.dataset.t = t; lab.textContent = t; } };
    const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    Object.defineProperty(sel, 'value', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); sync(); } });
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, characterData: true, attributes: true });
    sel.addEventListener('change', sync);
    b.onclick = () => {
      document.querySelector('.pxMenu')?.remove();
      const m = document.createElement('div'), r = b.getBoundingClientRect(); m.className = 'pxMenu'; m.setAttribute('role', 'listbox');
      for (const o of sel.options) {
        const it = document.createElement('button'); it.type = 'button'; it.textContent = o.textContent; it.className = o.selected ? 'on' : ''; it.setAttribute('role', 'option');
        it.onclick = () => { sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); close(); b.focus(); };
        m.append(it);
      }
      root.append(m);
      const below = innerHeight - r.bottom; m.style.minWidth = r.width + 'px'; m.style.left = Math.min(r.left, innerWidth - m.offsetWidth - 4) + 'px';
      m.style.top = (below > m.offsetHeight + 8 || below > r.top ? r.bottom + 2 : r.top - m.offsetHeight - 2) + 'px';
      const close = () => { m.remove(); removeEventListener('pointerdown', out, true); removeEventListener('keydown', key, true); removeEventListener('blur', close); };
      const out = e => { if (!m.contains(e.target) && e.target !== b && !b.contains(e.target)) close(); };
      const key = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); b.focus(); } };
      addEventListener('pointerdown', out, true); addEventListener('keydown', key, true); addEventListener('blur', close);
      (m.querySelector('.on') || m.firstChild)?.focus();
    };
    sync();
  }
  const SKIP = 'select,option,textarea,script,style,canvas,.pxT,[data-pxskip]';
  let queued = false;
  function pass() {
    queued = false;
    root.querySelectorAll('select.gSel:not([data-px])').forEach(pxSelect);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), todo = [];
    for (let n; (n = w.nextNode());) if (n.data.trim() && n.parentElement && !n.parentElement.closest(SKIP)) todo.push(n);
    todo.forEach(pixText);
  }
  new MutationObserver(ms => {
    for (const m of ms) if (m.type === 'characterData') { const wrap = m.target.parentNode?.closest?.('.pxT'); if (wrap) render(wrap.lastChild, m.target.data, false); }
    if (!queued) { queued = true; queueMicrotask(pass); }
  }).observe(root, { childList: true, subtree: true, characterData: true });
  // le titre : grosses lettres à contour, trois tons, et l'emblème du jeu
  const lab = root.querySelector('.agHead .label');
  if (lab) {
    const L = PXK.layout(title), c = document.createElement('canvas'), g = c.getContext('2d'), on = [];
    c.width = L.w + 3; c.height = PXK.H + 3;
    for (const [gl, ox] of L.items) for (const [x, y] of gl.px) on.push([ox + x + 1, y + 1]);
    g.fillStyle = T.k; for (const [x, y] of on) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [2, 2], [1, 2], [2, 1]]) g.fillRect(x + dx, y + dy, 1, 1);
    for (const [x, y] of on) { g.fillStyle = y <= 5 ? T.accL : y <= 7 ? T.acc : T.accS; g.fillRect(x, y, 1, 1); }
    const big = document.createElement('canvas'), z = 4; big.width = c.width * z; big.height = c.height * z;
    const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(c, 0, 0, big.width, big.height);
    const t = document.createElement('b'); t.className = 'pxI'; t.style.cssText = `width:${big.width}px;height:${big.height}px;background-image:url(${big.toDataURL()})`;
    const e = PXK.art(emblem, IP, 3), em = document.createElement('b'); em.className = 'pxI'; em.style.cssText = `width:${e.width}px;height:${e.height}px;background-image:url(${e.toDataURL()})`;
    const sr = document.createElement('span'); sr.className = 'pxSr'; sr.textContent = lab.textContent;
    lab.dataset.pxskip = '1'; lab.replaceChildren(em, t, sr);
  }
  pass();
}

export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast, sfx } = host;
  const folder = ctx.folder;
  host.addStyle(CSS);
  view.innerHTML = HTML;
  pxSkin(view.querySelector('.appWrap'), { title: "JOYAUX", T: {"k": "#0a0814", "k2": "#141024", "fill": "#1e1834", "fillOn": "#2a2246", "hl": "#362c58", "line": "#544680", "acc": "#b07aff", "accL": "#e4d0ff", "accS": "#7a4ac8", "accD": "#2a1050", "rivet": "#e4d0ff", "btn": "#362c58", "btnHi": "#6a5aa0", "btnLo": "#141024", "btnHov": "#463a70", "btnHovHi": "#8a7ac0", "text": "#f4f0ff", "muted": "#b8b0d8", "acc2": "#ffd84a", "gold": "#ffd84a", "orange": "#ffa030", "red": "#ff4a5a", "green": "#7ee07a", "green2": "#2f8a3a", "bg": "#0c0a18", "bgDot": "#1e1834", "bgDot2": "#141024", "spark": "#544680", "spark2": "#ffd84a", "tile": ["................", "...:............", "................", "..........+.....", "................", "................", ".....:..........", "................", "................", ".............:..", "................", "..+.............", "................", ".........:......", "................", "................"]},
  emblem: ["....kkkk....", "...kwaaak...", "..kwaaaaak..", ".kwaaaaaaak.", "kwaaaaaaaaak", "kaaaaaaaassk", ".kaaaaaassk.", "..kaaaassk..", "...kaassk...", "....kssk....", ".....kk.....", "............"],
  icons: [[/^NOUVELLE/, "play"], [/^RECORDS/, "crown"]] });
  const $ = id => view.querySelector('#' + id) || document.getElementById(id);
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const games = { best: {}, ...(await doc('games')) };
  let gamesTimer = null;
  const saveGames = () => { clearTimeout(gamesTimer); gamesTimer = setTimeout(() => { gamesTimer = null; folder.write('games', games).catch(() => {}); }, 500); };
  const best = (k, v) => { const b = games.best[k]; if (b == null || v > b) { games.best[k] = v; saveGames(); return true; } return false; };
  const gstore = (k, init) => (games[k] ??= init);
function gameLoop(st, appKey, update, draw) {
  cancelAnimationFrame(st.raf);
  const STEP = 1000 / 60; let acc = 0, last = performance.now();
  const frame = t => {
    if (!view.classList.contains('on')) { st.raf = 0; if (st.mode === 'play') st.mode = 'pause'; return; }  // leaving the tab pauses the game
    st.raf = requestAnimationFrame(frame);
    acc += Math.min(200, t - last); last = t;
    while (acc >= STEP) { if (st.mode === 'play') update(); st.tick++; acc -= STEP; }
    draw();
  };
  st.raf = requestAnimationFrame(frame);
}
function gameText(g, w, lines, y0) {  // lignes centrées en police pixel, sur une bande sombre
  g.fillStyle = 'rgba(11,3,28,.72)'; g.fillRect(0, y0 - 14, w, lines.length * 14 + 14);
  lines.forEach(([text, color, size], i) => PXK.fill(g, text, w / 2, y0 + i * 14, color, PXK.scale(size), 'center'));
}
const px = (g, color, x, y, w = 1, h = 1) => { g.fillStyle = color; g.fillRect(Math.round(x), Math.round(y), w, h); };
function sprite(g, rows, x, y, pal) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) px(g, c, x + i, y + j); } }); }
const seeded = s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pxFont = (g, text, x, y, color, size = 8, align = 'left') => { const s = PXK.scale(size); PXK.fill(g, text, x + s, y + s, '#05010b', s, align); PXK.fill(g, text, x, y, color, s, align); };

const clock = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
// petits outils communs aux jeux : une toile pré-dessinée, la position du pointeur dans le canevas, un bip
const cnv = (w, h, fn) => { const c = el('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; fn(g); return c; };
const spr = (rows, pal) => cnv(Math.max(...rows.map(r => r.length)), rows.length, g => sprite(g, rows, 0, 0, pal));
const W = 168, H = 182, cv = $('gc'), g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
const cpos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };
let actx = null;
const beep = (f, d = .1, type = 'square', slide = 0, vol = .08) => { try { actx ??= new AudioContext(); const o = actx.createOscillator(), gn = actx.createGain(), t = actx.currentTime; o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d); gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(gn).connect(actx.destination); o.start(t); o.stop(t + d + .02); } catch {} };
const keyOk = e => view.classList.contains('on') && !/INPUT|SELECT|TEXTAREA/.test(e.target.tagName);
const showStats = rows => $('gStats').replaceChildren(...rows.flatMap(([a, b]) => [el('span', '', a), el('b', '', String(b))]));

/* ---------- Joyaux : échange deux pierres voisines pour en aligner trois (ou plus) de la même sorte. 25 coups pour le plus gros score. ---------- */
const JY = {N: 8, C: 18, X0: 12, Y0: 26, MOVES: 25};
const JY_P = {k: '#05010b', w: '#ffffff'};
const JY_GEM = [  // six pierres taillées à la main, chacune sa forme (on les reconnaît sans les couleurs)
  [['....kkkkk.....', '...kLLaaak....', '..kLLaaaaak...', '.kLaaaaaaaak..', 'kLaaaaaaaaaak.', 'kaaaaaaaaaaDk.', 'kaaaaaaaaaaDk.', 'kaaaaaaaaaDDk.', '.kaaaaaaaDDk..', '..kaaaaaDDk...', '...kaaaDDk....', '....kkkkk.....'], '#ff4a5a'],
  [['......kk......', '.....kLLk.....', '....kLLaak....', '...kLaaaaak...', '..kLaaaaaaak..', '.kLaaaaaaaaak.', '.kaaaaaaaaaDk.', '..kaaaaaaaDk..', '...kaaaaaDk...', '....kaaaDk....', '.....kaDk.....', '......kk......'], '#3f8aff'],
  [['..kkkkkkkkk...', '.kLLLaaaaaak..', 'kLLaaaaaaaaak.', 'kLaaaaaaaaaak.', 'kaaaaaaaaaaak.', 'kaaaaaaaaaaDk.', 'kaaaaaaaaaaDk.', 'kaaaaaaaaaaDk.', 'kaaaaaaaaaDDk.', '.kaaaaaaaDDk..', '..kkkkkkkkk...', '..............'], '#5fdf6a'],
  [['......k.......', '.....kLk......', '....kLaak.....', '...kLaaaak....', 'kkkLaaaaaakkk.', 'kLaaaaaaaaaDk.', '.kaaaaaaaaDk..', '..kaaaaaaDk...', '..kaaakaaDk...', '.kaaak.kaDDk..', '.kakk...kkDk..', '.kk.......kk..'], '#ffd84a'],
  [['....kkkkk.....', '..kkLLaaakk...', '.kLLaaaaaaak..', '.kLaaaaaaaak..', 'kLaaaaaaaaaak.', 'kaaaaawaaaaak.', 'kaaaaaaaaaaDk.', 'kaaaaaaaaaaDk.', '.kaaaaaaaaDk..', '.kaaaaaaaDDk..', '..kkaaaDDkk...', '....kkkkk.....'], '#b07aff'],
  [['.....kkk......', '....kLLak.....', '...kLaaaak....', '..kLaaaaaak...', '.kLaaaaaaaak..', 'kLaaaaaaaaaak.', 'kkkkkkkkkkkkk.', '.kaaaaaaaaDk..', '..kaaaaaaDk...', '...kaaaaDk....', '....kaaDk.....', '.....kkk......'], '#ff9a3d'],
].map(([rows, c]) => spr(rows, {...JY_P, a: c, L: '#' + [1, 3, 5].map(i => Math.min(255, Math.round(parseInt(c.slice(i, i + 2), 16) * 1.4 + 40)).toString(16).padStart(2, '0')).join(''), D: '#' + [1, 3, 5].map(i => Math.round(parseInt(c.slice(i, i + 2), 16) * .5).toString(16).padStart(2, '0')).join('')}));
const JY_COL = ['#ff4a5a', '#ff9a3d', '#ffd84a', '#5fdf6a', '#3f8aff', '#b07aff'];
const JY_STAR = JY_COL.map((_, sh) => cnv(14, 12, b => ['......k.......', '.....kwk......', '....kwaak.....', '...kwaaaak....', 'kkkwaaaaaakkk.', 'kwaaaaaaaaaak.', '.kaaaaaaaaak..', '..kaaaaaaak...', '..kaaakaaak...', '.kaaak.kaaak..', '.kakk...kkak..', '.kk.......kk..'].forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.') px(b, ch === 'k' ? '#05010b' : ch === 'w' ? '#ffffff' : JY_COL[(((x + y) >> 1) + sh) % 6], x, y); }))));
const JY_BOMB = spr(['...o.', '..k..', '.kkk.', 'kkwkk', 'kkkkk', '.kkk.'], {k: '#05010b', w: '#c8c0d8', o: '#ffd84a'});
const jys = gstore('joyaux', {games: 0, mode: 'score', foe: 0, wins: 0});
// le combat, façon jeu de rôle : [nom, vie, force, couleur du portrait] ; après le dernier, le Dragon revient, plus fort à chaque fois
const JY_FOES = [['Gelée', 30, .6, '#5fdf6a'], ['Gobelin', 40, .8, '#9ac840'], ['Golem', 60, .8, '#a89c8c'], ['Spectre', 55, 1.1, '#c8c0ff'], ['Hydre', 75, 1.1, '#3fbfa0'], ['Dragon', 100, 1.3, '#ff4a5a']];
const JY_SPELL = 12, JY_ME = 50;
function jyFoe(i) { const [name, hp, atk, col] = JY_FOES[Math.min(i, JY_FOES.length - 1)], up = Math.max(0, i - JY_FOES.length + 1); return {name: up ? name + ' +' + up : name, hp: hp + up * 20, max: hp + up * 20, atk: atk + up * .15, sh: 0, mp: 0, col}; }
function jyHit(t, d) { d = Math.round(d); const s = Math.min(t.sh, d); t.sh -= s; t.hp = Math.max(0, t.hp - (d - s)); return d - s; }
function jyFight(cnt, booms) {  // ce qu'a donné l'alignement à celui qui joue : rouge frappe, vert soigne, bleu protège, le reste remplit la magie
  const me = jy.turn === 'me' ? jy.me : jy.foe, them = jy.turn === 'me' ? jy.foe : jy.me, d = (cnt[0] * 2 + booms * 3) * me.atk;
  if (d) { const got = jyHit(them, d); jy.hits.push({who: jy.turn === 'me' ? 'foe' : 'me', n: got, t: 0}); }
  me.hp = Math.min(me.max, me.hp + cnt[2]); me.sh += cnt[1]; me.mp += cnt[3] + cnt[4] + cnt[5];
}
function jyFoeMove() {  // le monstre cherche l'échange qui aligne le plus, avec un faible pour le rouge
  let bestMv = null, bestV = -1; const b = jy.b;
  for (let y = 0; y < JY.N; y++) for (let x = 0; x < JY.N; x++) for (const [dx, dy] of [[1, 0], [0, 1]]) {
    const a = x + dx, c = y + dy; if (a >= JY.N || c >= JY.N) continue;
    if (b[y][x] === 6 || b[c][a] === 6) { if (bestV < 5) { bestV = 5; bestMv = [x, y, a, c]; } continue; }
    const t = b.map(r => r.slice()); [t[y][x], t[c][a]] = [t[c][a], t[y][x]]; const m = jyMatches(t); if (!m.size) continue;
    let v = m.size + Math.random() * 1.5; for (const k of m) { const [i, j] = k.split(',').map(Number); if (t[j][i] === 0) v += 1; }
    if (v > bestV) { bestV = v; bestMv = [x, y, a, c]; }
  }
  if (bestMv) jyTry(...bestMv, true);
}
function jyTurnEnd() {  // fin d'un tour de combat : les sorts, la victoire ou la défaite, puis à l'autre (sauf s'il a gagné un tour de plus)
  for (const [w, who] of [[jy.me, 'foe'], [jy.foe, 'me']]) if (w.mp >= JY_SPELL && (who === 'foe') === (jy.turn === 'me')) { w.mp -= JY_SPELL; jyHit(who === 'foe' ? jy.foe : jy.me, 8 * w.atk); jy.hits.push({who, n: Math.round(8 * w.atk), t: 0, spell: true}); beep(880, .3, 'sawtooth', 220, .06); }
  if (jy.foe.hp <= 0 || jy.me.hp <= 0) {
    jy.won = jy.foe.hp <= 0; jy.mode = 'over'; jy.endAt = jy.tick; jys.games++;
    if (jy.won) { jys.wins++; jys.foe = Math.max(jys.foe, jy.lv + 1); beep(523, .2, 'square', 1047); } else beep(330, .4, 'triangle', 110);
    saveGames(); jyInfo(); return;
  }
  if (jy.extra) jy.extra = false; else jy.turn = jy.turn === 'me' ? 'foe' : 'me';
  if (jy.turn === 'foe') jy.foeAt = jy.tick + 28;
}
let jy = null;
const jyRand = () => Math.floor(Math.random() * 6);
function jyRuns(b) {  // -> les suites de trois pierres pareilles ou plus, chacune entière (pour repérer celles de 4 et de 5)
  const runs = [];
  for (let y = 0; y < JY.N; y++) for (let x = 0; x < JY.N; x++) for (const [dx, dy] of [[1, 0], [0, 1]]) {
    const c = b[y][x]; if (c < 0 || c > 5 || b[y - dy]?.[x - dx] === c) continue; let n = 1; while (b[y + dy * n]?.[x + dx * n] === c) n++;
    if (n >= 3) runs.push({c, cells: Array.from({length: n}, (_, i) => (x + dx * i) + ',' + (y + dy * i))});
  }
  return runs;
}
const jyMatches = b => new Set(jyRuns(b).flatMap(r => r.cells));
const jyColor = (b, c) => { const o = []; for (let y = 0; y < JY.N; y++) for (let x = 0; x < JY.N; x++) if (b[y][x] === c) o.push(x + ',' + y); return o; };
function jyBlast(b, sp, cells) {  // ajoute aux cases effacées ce que font les bombes prises dedans (3 × 3, en chaîne) et les étoiles (leur couleur la plus présente)
  const out = new Set(cells), q = [...cells];
  while (q.length) {
    const [x, y] = q.pop().split(',').map(Number); let add = [];
    if (sp[y][x] === 'B') { for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if (b[y + j]?.[x + i] != null) add.push((x + i) + ',' + (y + j)); }
    else if (b[y][x] === 6) { const n = [0, 1, 2, 3, 4, 5].map(c => jyColor(b, c).length); add = jyColor(b, n.indexOf(Math.max(...n))); }
    for (const k of add) if (!out.has(k)) { out.add(k); q.push(k); }
  }
  return out;
}
const jyStar = (b, x, y, a, c) => { const u = b[y][x], v = b[c][a]; return u === 6 && v === 6 ? jyColor(b, 6).concat(...[0, 1, 2, 3, 4, 5].map(k => jyColor(b, k))) : [x + ',' + y, a + ',' + c].concat(jyColor(b, u === 6 ? v : u)); };  // l'étoile échangée efface toute la couleur de l'autre pierre
function jyHasMove(b) { if (b.some(r => r.includes(6))) return true; for (let y = 0; y < JY.N; y++) for (let x = 0; x < JY.N; x++) for (const [dx, dy] of [[1, 0], [0, 1]]) { const a = x + dx, c = y + dy; if (a >= JY.N || c >= JY.N) continue; const t = b.map(r => r.slice()); [t[y][x], t[c][a]] = [t[c][a], t[y][x]]; if (jyMatches(t).size) return true; } return false; }
function jyBoard() { let b; do { b = Array.from({length: JY.N}, () => Array.from({length: JY.N}, jyRand)); while (jyMatches(b).size) for (const k of jyMatches(b)) { const [x, y] = k.split(',').map(Number); b[y][x] = jyRand(); } } while (!jyHasMove(b)); return b; }
function jyNew() { jy = Object.assign(jy || {tick: 0, raf: 0}, {mode: 'play', b: jyBoard(), sp: Array.from({length: JY.N}, () => Array(JY.N).fill(0)), booms: [], force: null, last: null, off: Array.from({length: JY.N}, () => Array(JY.N).fill(0)), sel: null, moves: JY.MOVES, score: 0, chain: 0, busy: 0, swap: null, pops: [], endAt: 0, drag: null, hits: [], extra: false, won: false});
  jy.combat = jys.mode === 'combat'; if (jy.combat) Object.assign(jy, {lv: jys.foe, foe: jyFoe(jys.foe), me: {hp: JY_ME, max: JY_ME, sh: 0, mp: 0, atk: 1}, turn: 'me', foeAt: 0}); jyInfo(); }
function jyTry(x, y, a, c, foe = false) {
  if (jy.busy || jy.mode !== 'play' || (jy.combat && (jy.turn === 'foe') !== foe)) return; const b = jy.b, sp = jy.sp, star = b[y][x] === 6 || b[c][a] === 6;
  if (star) jy.force = jyStar(b, x, y, a, c);
  [b[y][x], b[c][a]] = [b[c][a], b[y][x]]; [sp[y][x], sp[c][a]] = [sp[c][a], sp[y][x]]; jy.last = [x + ',' + y, a + ',' + c];
  jy.swap = {x, y, a, c, t: 0, back: !star && !jyMatches(b).size}; jy.busy = 1; jy.sel = null; beep(520, .03, 'square', 0, .04);
}
function jyResolve() {  // efface les alignements, fait tomber les pierres, recommence tant qu'il y en a
  const runs = jyRuns(jy.b); if (!runs.length && !jy.force) { jy.busy = 0; jy.chain = 0; if (jy.combat) { if (!jyHasMove(jy.b)) { jy.b = jyBoard(); jy.shuffle = jy.tick; } jyTurnEnd(); return; } if (jy.moves <= 0) { jy.mode = 'over'; jy.endAt = jy.tick; jys.games++; best('joyaux', jy.score); saveGames(); jyInfo(); beep(330, .4, 'triangle', 660); } else if (!jyHasMove(jy.b)) { jy.b = jyBoard(); jy.shuffle = jy.tick; } return; }
  jy.chain++; const m = new Set(runs.flatMap(r => r.cells)), make = new Map(), star = !!jy.force;
  for (const r of runs) if (r.cells.length >= 4) make.set(r.cells.find(k => jy.last?.includes(k)) ?? r.cells[r.cells.length >> 1], r.cells.length >= 5 ? 6 : r.c);  // 4 alignées : une bombe ; 5 : une étoile
  for (const k of jy.force || []) { m.add(k); const [x, y] = k.split(',').map(Number); if (jy.b[y][x] === 6) jy.b[y][x] = 7; }  // l'étoile échangée est dépensée
  jy.force = null; jy.last = null;
  if (make.size) jy.extra = true;  // une bombe ou une étoile créée : un tour de plus
  for (const k of make.keys()) m.delete(k);
  const all = jyBlast(jy.b, jy.sp, m); for (const k of make.keys()) all.delete(k);
  let booms = 0; for (const k of all) { const [x, y] = k.split(',').map(Number); if (jy.sp[y][x] === 'B' || jy.b[y][x] >= 6) { booms++; jy.booms.push({x, y, t: 0, big: jy.b[y][x] >= 6}); } }
  if (jy.combat) { const cnt = [0, 0, 0, 0, 0, 0]; for (const k of all) { const [x, y] = k.split(',').map(Number); if (jy.b[y][x] < 6) cnt[jy.b[y][x]]++; } jyFight(cnt, booms); }
  jy.score += all.size * 10 * jy.chain + booms * 50; jy.blasts = (jy.blasts || 0) + booms; beep(600 + jy.chain * 120, .08, 'triangle', 0, .07);
  if (booms || star) { beep(90, .35, 'sawtooth', 40, .1); beep(1400, .25, 'triangle', 2400, .04); jy.shake = 8; }
  for (const k of all) { const [x, y] = k.split(',').map(Number); jy.pops.push({x, y, c: jy.b[y][x], t: 0}); jy.b[y][x] = -1; jy.sp[y][x] = 0; }
  for (const [k, c] of make) { const [x, y] = k.split(',').map(Number); jy.b[y][x] = c; jy.sp[y][x] = c === 6 ? 0 : 'B'; [1047, 1319, 1568].forEach((f, i) => setTimeout(() => beep(f, .1, 'square', 0, .04), 120 + i * 70)); }
  for (let x = 0; x < JY.N; x++) { let w = JY.N - 1; for (let y = JY.N - 1; y >= 0; y--) if (jy.b[y][x] >= 0) { if (w !== y) { jy.b[w][x] = jy.b[y][x]; jy.sp[w][x] = jy.sp[y][x]; jy.b[y][x] = -1; jy.sp[y][x] = 0; jy.off[w][x] = (w - y) * JY.C; } w--; }
    for (let y = w, k = 1; y >= 0; y--, k++) { jy.b[y][x] = jyRand(); jy.sp[y][x] = 0; jy.off[y][x] = (w + 1 + k - 1) * JY.C + 6; } }
  jy.busy = 2;
}
function jyUpdate() {
  for (const p of jy.pops) p.t++; jy.pops = jy.pops.filter(p => p.t < 12); for (const o of jy.booms) o.t++; jy.booms = jy.booms.filter(o => o.t < 16); if (jy.shake) jy.shake--;
  const s = jy.swap; if (s && ++s.t >= 8) { if (s.back && !s.rev) { const b = jy.b, sp = jy.sp; [b[s.y][s.x], b[s.c][s.a]] = [b[s.c][s.a], b[s.y][s.x]]; [sp[s.y][s.x], sp[s.c][s.a]] = [sp[s.c][s.a], sp[s.y][s.x]]; jy.last = null; s.rev = true; s.t = 0; beep(200, .05, 'square', 0, .04); } else { jy.swap = null; if (s.back) jy.busy = 0; else { if (!jy.combat) jy.moves--; jyResolve(); } } }
  for (const h of jy.hits) h.t++; jy.hits = jy.hits.filter(h => h.t < 40);
  if (jy.combat && jy.mode === 'play' && jy.turn === 'foe' && !jy.busy && jy.tick >= jy.foeAt) jyFoeMove();
  if (jy.busy === 2) { let moving = false; for (const r of jy.off) for (let x = 0; x < JY.N; x++) if (r[x] > 0) { r[x] = Math.max(0, r[x] - 3); moving = true; } if (!moving) jyResolve(); }
}
const JY_BG = cnv(W, H, b => { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px(b, (x + y) % 2 ? '#140a24' : '#100820', x, y); px(b, '#05010b', JY.X0 - 3, JY.Y0 - 3, JY.N * JY.C + 6, JY.N * JY.C + 6); for (let y = 0; y < JY.N; y++) for (let x = 0; x < JY.N; x++) px(b, (x + y) % 2 ? '#22163a' : '#1a1030', JY.X0 + x * JY.C, JY.Y0 + y * JY.C, JY.C, JY.C); });
function jyDraw() {
  g.drawImage(JY_BG, 0, 0); g.save(); if (jy.shake) g.translate((jy.shake & 2) - 1, (jy.shake & 1) * 2 - 1); g.beginPath(); g.rect(JY.X0, JY.Y0, JY.N * JY.C, JY.N * JY.C); g.clip();
  const s = jy.swap, k = s ? (s.rev ? 1 - s.t / 8 : s.t / 8) : 0;
  for (let y = 0; y < JY.N; y++) for (let x = 0; x < JY.N; x++) {
    const c = jy.b[y][x]; if (c < 0) continue; let X = JY.X0 + x * JY.C + 2, Y = JY.Y0 + y * JY.C + 3 - jy.off[y][x];
    if (s) { const sw = s.rev ? (x === s.x && y === s.y ? [s.a, s.c] : x === s.a && y === s.c ? [s.x, s.y] : null) : (x === s.a && y === s.c ? [s.x, s.y] : x === s.x && y === s.y ? [s.a, s.c] : null); if (sw) { X += (sw[0] - x) * JY.C * (1 - k); Y += (sw[1] - y) * JY.C * (1 - k); } }
    const sel = jy.sel && jy.sel[0] === x && jy.sel[1] === y; X = Math.round(X); Y = Math.round(Y - (sel ? Math.abs(Math.sin(jy.tick / 5)) * 2 : 0));
    if (c >= 6) { g.drawImage(JY_STAR[(jy.tick >> 3) % 6], X, Y); continue; }
    if (jy.sp[y][x] === 'B') { if ((jy.tick >> 3) % 2) { g.globalAlpha = .22; px(g, '#ffffff', X - 1, Y - 2, 16, 16); g.globalAlpha = 1; } g.drawImage(JY_GEM[c], X, Y); g.drawImage(JY_BOMB, X + 9, Y + 7); if ((jy.tick >> 2) % 2) px(g, '#ff9a3d', X + 12, Y + 6); continue; }
    g.drawImage(JY_GEM[c], X, Y);
    const ph = (x * 37 + y * 91 + jy.tick) % 150; if (ph < 8 && !jy.off[y][x]) { const r = ph < 4 ? ph : 8 - ph; px(g, '#ffffff', X + 4 - r, Y + 3, r * 2 + 1, 1); px(g, '#ffffff', X + 4, Y + 3 - r, 1, r * 2 + 1); }  // l'éclat qui brille sur la pierre
  }
  for (const o of jy.booms) { const r = 4 + o.t * (o.big ? 3 : 1.6), X = JY.X0 + o.x * JY.C + 9, Y = JY.Y0 + o.y * JY.C + 9; g.globalAlpha = Math.max(0, 1 - o.t / 16);
    px(g, o.big ? '#ffd84a' : '#ffffff', X - r, Y - r, r * 2, 2); px(g, o.big ? '#ffd84a' : '#ffffff', X - r, Y + r - 2, r * 2, 2); px(g, o.big ? '#ffd84a' : '#ffffff', X - r, Y - r, 2, r * 2); px(g, o.big ? '#ffd84a' : '#ffffff', X + r - 2, Y - r, 2, r * 2); if (o.t < 4) px(g, '#ffffff', X - 6, Y - 6, 12, 12); g.globalAlpha = 1; }
  g.restore();
  if (jy.sel) { const X = JY.X0 + jy.sel[0] * JY.C, Y = JY.Y0 + jy.sel[1] * JY.C; px(g, '#ffffff', X, Y, JY.C, 1); px(g, '#ffffff', X, Y + JY.C - 1, JY.C, 1); px(g, '#ffffff', X, Y, 1, JY.C); px(g, '#ffffff', X + JY.C - 1, Y, 1, JY.C); }
  for (const p of jy.pops) { const k2 = p.t / 12; for (let a = 0; a < 6; a++) px(g, '#ffffff', JY.X0 + p.x * JY.C + 9 + Math.cos(a * 1.05 + p.t / 4) * k2 * 10, JY.Y0 + p.y * JY.C + 9 + Math.sin(a * 1.05 + p.t / 4) * k2 * 10, 2, 2); }
  if (jy.combat) jyBars(); else
  pxFont(g, String(jy.score), JY.X0, 16, '#ffffff', 8); if (!jy.combat) pxFont(g, jy.moves + ' coups', W - JY.X0, 16, jy.moves <= 5 ? '#ff4a5a' : '#e4d0ff', 6, 'right');
  if (jy.chain > 1 && jy.busy && !jy.combat) pxFont(g, 'chaîne ×' + jy.chain, W / 2, 16, '#ffd84a', 6, 'center');
  if (jy.combat && jy.mode === 'over' && jy.tick - jy.endAt > 30) gameText(g, W, jy.won ? [['VICTOIRE', '#ffd84a', 12], [jy.foe.name + ' vaincu', '#ffffff'], ['Clic : monstre suivant', '#ffd84a']] : [['DÉFAITE', '#ff4a5a', 12], [jy.foe.name + ' a gagné', '#ffffff'], ['Clic pour réessayer', '#ffd84a']], 90);
  else if (jy.mode === 'over' && jy.tick - jy.endAt > 30) gameText(g, W, [['FINI', '#ffd84a', 12], [jy.score + ' points', '#ffffff'], ['Clic pour rejouer', '#ffd84a']], 90);
}
function jyBars() {
  const side = (w, x, name, on) => {
    const left = x < W / 2, L = left ? x : x - 56;
    pxFont(g, left ? name + ' ' + w.hp : w.hp + ' ' + name, x, 7, on ? '#ffd84a' : '#a898c8', 5, left ? 'left' : 'right');
    px(g, '#05010b', L, 10, 56, 6); px(g, '#ff4a5a', L + 1, 11, Math.round(54 * w.hp / w.max), 4);
    px(g, '#05010b', L, 17, 56, 4); px(g, w.mp >= JY_SPELL ? '#ffffff' : '#b07aff', L + 1, 18, Math.round(54 * Math.min(1, w.mp / JY_SPELL)), 2);
    if (w.sh) { const S = left ? L + 58 : L - 9; px(g, '#05010b', S, 10, 7, 8); px(g, '#3f8aff', S + 1, 11, 5, 5); px(g, '#3f8aff', S + 2, 16, 3, 1); pxFont(g, w.sh + '', S + 3, 25, '#7fb0ff', 5, 'center'); }
  };
  side(jy.me, JY.X0, 'TOI', jy.turn === 'me'); side(jy.foe, W - JY.X0, jy.foe.name, jy.turn === 'foe');
  const fx = W / 2 - 5, fy = 2 + (jy.turn === 'foe' && jy.mode === 'play' ? (jy.tick >> 3) % 2 : 0);  // le portrait du monstre : une tête ronde de sa couleur, deux yeux
  px(g, '#05010b', fx - 1, fy - 1, 12, 12); px(g, jy.foe.col, fx, fy, 10, 10); px(g, '#ffffff', fx + 2, fy + 3, 2, 2); px(g, '#ffffff', fx + 6, fy + 3, 2, 2); px(g, '#05010b', fx + 3, fy + 7, 4, 1);
  for (const h of jy.hits) { const X = h.who === 'foe' ? W - 40 : 40; g.globalAlpha = Math.max(0, 1 - h.t / 40); pxFont(g, '-' + h.n, X, 40 - h.t / 2, h.spell ? '#d0a0ff' : '#ff6a6a', 8, 'center'); g.globalAlpha = 1; }
}
const jyCell = e => { const [x, y] = cpos(e), a = Math.floor((x - JY.X0) / JY.C), b = Math.floor((y - JY.Y0) / JY.C); return a >= 0 && b >= 0 && a < JY.N && b < JY.N ? [a, b] : null; };
cv.onpointerdown = e => {
  e.preventDefault(); if (!jy) return; if (jy.mode === 'over') { if (jy.tick - jy.endAt > 30) jyNew(); return; }
  const c = jyCell(e); if (!c || jy.busy || (jy.combat && jy.turn === 'foe')) return; jy.drag = c;
  if (jy.sel && Math.abs(jy.sel[0] - c[0]) + Math.abs(jy.sel[1] - c[1]) === 1) { jyTry(...jy.sel, ...c); jy.drag = null; } else jy.sel = c;
};
cv.onpointermove = e => { if (!jy?.drag || jy.busy) return; const c = jyCell(e); if (c && Math.abs(jy.drag[0] - c[0]) + Math.abs(jy.drag[1] - c[1]) === 1) { jyTry(...jy.drag, ...c); jy.drag = null; } };
cv.onpointerup = () => { if (jy) jy.drag = null; };
function jyInfo() { showStats([['Meilleur score', games.best.joyaux || 0], ['Parties', jys.games], ['Combats gagnés', jys.wins], ['Plus loin', jyFoe(jys.foe).name]]); $('jyMode').value = jys.mode; }
$('jyMode').onchange = () => { jys.mode = $('jyMode').value; saveGames(); jyNew(); $('jyMode').blur(); };
$('gNew').onclick = () => { jyNew(); $('gNew').blur(); };
$('gFs').onclick = () => { const box = cv.parentElement; document.fullscreenElement ? document.exitFullscreen() : box.requestFullscreen?.().catch(() => {}); $('gFs').blur(); };
function jyCheck() {  // vérification : plateau neuf sans alignement et jouable ; 4 alignées font une bombe, 5 une étoile ; la bombe vide 3 × 3, l'étoile une couleur
  const bad = [], b = jyBoard(), grid = () => Array.from({length: JY.N}, (_, y) => Array.from({length: JY.N}, (_, x) => (x + y * 2) % 6)), zero = () => Array.from({length: JY.N}, () => Array(JY.N).fill(0));
  const t = grid(); t[3][2] = t[3][3] = t[3][4] = 5; if (jyMatches(b).size || !jyHasMove(b) || !jyMatches(t).has('3,3') || jyRuns(grid()).length) bad.push('plateau');
  const keep = jy, run = (cells, last) => { const t2 = grid(); for (const [x, y] of cells) t2[y][x] = 5; jy = {b: t2, sp: zero(), off: zero(), pops: [], booms: [], chain: 0, score: 0, last, force: null, moves: 9, mode: 'play', tick: 0}; jyResolve(); const r = jy; jy = keep; return r; };
  const r4 = run([[0, 3], [1, 3], [2, 3], [3, 3]], ['2,3']); if (r4.sp[3][2] !== 'B' || r4.b[3][2] !== 5) bad.push('bombe');
  const r5 = run([[0, 3], [1, 3], [2, 3], [3, 3], [4, 3]], ['2,3']); if (r5.b[3][2] !== 6) bad.push('étoile');
  const sp = zero(); sp[4][4] = 'B'; sp[0][0] = 'B'; if (jyBlast(grid(), sp, ['4,4']).size !== 9 || jyBlast(grid(), sp, ['0,0']).size !== 4) bad.push('explosion');
  const g2 = grid(); g2[0][0] = 6; const col = g2[0][1]; if (new Set(jyStar(g2, 0, 0, 1, 0)).size !== jyColor(g2, col).length + 1) bad.push('étoile échangée');
  const f = jyFoe(0); f.sh = 3; if (jyHit(f, 5) !== 2 || f.hp !== 28 || f.sh !== 0) bad.push('bouclier');
  if (jyFoe(JY_FOES.length).max !== 120) bad.push('monstre après le dernier');
  const realInfo = jyInfo, keepS = {...jys}; jyInfo = () => {};
  try {
    jy = {combat: true, turn: 'me', me: {hp: 50, max: 50, sh: 0, mp: 0, atk: 1}, foe: jyFoe(0), hits: [], extra: false, tick: 0, mode: 'play', lv: 0};
    jyFight([3, 2, 4, 3, 0, 0], 0); if (jy.foe.hp !== 24 || jy.me.sh !== 2 || jy.me.mp !== 3 || jy.me.hp !== 50) bad.push('coups du combat');
    jyTurnEnd(); if (jy.turn !== 'foe') bad.push('tour du monstre');
    jy.extra = true; jyTurnEnd(); if (jy.turn !== 'foe') bad.push('tour de plus');
    jy.turn = 'me'; jy.me.mp = 12; jy.foe.hp = 8; jyTurnEnd(); if (jy.mode !== 'over' || !jy.won || jys.foe < 1) bad.push('sort et victoire');
    jy = {combat: true, turn: 'foe', busy: 0, mode: 'play', b: grid(), sp: zero(), foe: jyFoe(0), me: {hp: 50, max: 50, sh: 0, mp: 0, atk: 1}}; jy.b[3][2] = jy.b[3][3] = 5; jy.b[4][4] = 5;
    jyFoeMove(); if (!jy.swap || jy.swap.back) bad.push('le monstre joue');
  } finally { jy = keep; Object.assign(jys, keepS); jyInfo = realInfo; }
  return bad.join(' | ') || 'ok';
}
{ const c = jyCheck(); console.assert(c === 'ok', 'joyaux', c); cv.__jy = {check: jyCheck, st: () => jy, swap: (x, y, a, c) => jyTry(x, y, a, c), again: () => jyNew()}; }
ctx.onOpen(() => { if (!jy) jyNew(); gameLoop(jy, 'joyaux', jyUpdate, jyDraw); jyInfo(); });

}
