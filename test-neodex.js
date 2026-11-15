// lancé par le test « local » de NeoDex : la vérification interne (plateau, bombe, étoile), un échange à la souris, une bombe et une étoile
// posées puis déclenchées, la fin de partie, le plein écran et la place prise (avec NEO_SHOTS : garde des images du jeu)
module.exports = async ({ pj, sleep }) => {
  const C = code => pj(`(() => { const T = document.getElementById('gc').__jy, jy = T.st(); ${code} })()`);
  const shot = async n => { if (!process.env.NEO_SHOTS) return; const d = await pj(`document.getElementById('gc').toDataURL()`); require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'joyaux-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  const cell = (x, y, type) => pj(`(() => { const c = document.getElementById('gc'), r = c.getBoundingClientRect(); c.dispatchEvent(new PointerEvent('${type}', {clientX: r.left + (12 + ${x} * 18 + 9) / 168 * r.width, clientY: r.top + (26 + ${y} * 18 + 9) / 182 * r.height, bubbles: true})); })(), 0`);
  const calm = async () => { for (let i = 0; i < 80 && await C('return jy.busy;'); i++) await sleep(50); };
  await pj(`window.__e = []; addEventListener('error', e => __e.push(e.message)); 0`);
  const chk = await C('return T.check();'); if (chk !== 'ok') throw new Error('vérification : ' + chk);
  await C('T.again(); return 0;'); await sleep(300); await shot('0-depart');
  // un coup qui aligne, joué en deux clics
  const mv = await C(`for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) for (const [dx, dy] of [[1, 0], [0, 1]]) { const a = x + dx, c = y + dy; if (a > 7 || c > 7) continue; const t = jy.b.map(r => r.slice()); [t[y][x], t[c][a]] = [t[c][a], t[y][x]]; for (let j = 0; j < 8; j++) for (let i = 0; i < 6; i++) if (t[j][i] === t[j][i+1] && t[j][i] === t[j][i+2]) return [x, y, a, c]; for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) if (t[j][i] === t[j+1][i] && t[j][i] === t[j+2][i]) return [x, y, a, c]; } return null;`);
  if (!mv) throw new Error('aucun coup trouvé');
  await cell(mv[0], mv[1], 'pointerdown'); await cell(mv[0], mv[1], 'pointerup'); await cell(mv[2], mv[3], 'pointerdown'); await calm();
  const s1 = await C('return {moves: jy.moves, score: jy.score};'); if (s1.moves !== 24 || !(s1.score >= 30)) throw new Error('le coup devait compter : ' + JSON.stringify(s1));
  // une bombe et une étoile posées ; on aligne la bombe, puis on échange l'étoile
  await C(`const b = jy.b; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) b[y][x] = (x + y * 2) % 6; b[5][2] = 5; jy.sp[5][2] = 'B'; b[2][6] = 6; return 0;`);
  await sleep(400); await shot('1-speciales');
  await C('T.swap(3, 4, 3, 5); return 0;'); await sleep(420); await shot('2-bombe'); await calm();
  const s2 = await C('return {score: jy.score, holes: jy.b.flat().filter(v => v < 0).length, blasts: jy.blasts};');
  if (s2.score < s1.score + 9 * 10 + 50 || s2.holes || !s2.blasts) throw new Error('la bombe devait exploser en 3 × 3 : ' + JSON.stringify(s2));
  const st = await C(`for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (jy.b[y][x] < 6) { jy.b[y][x] = 6; const a = x < 7 ? x + 1 : x - 1, col = jy.b[y][a]; T.swap(x, y, a, y); return jy.b.flat().filter(v => v === col).length; } return 0;`);
  await sleep(420); await shot('3-etoile'); await calm();
  const s3 = await C('return {score: jy.score, stars: jy.b.flat().filter(v => v >= 6).length, holes: jy.b.flat().filter(v => v < 0).length};');
  if (!(s3.score >= s2.score + st * 10) || s3.holes) throw new Error('l\'étoile devait vider une couleur : ' + JSON.stringify(s3));
  await C(`jy.moves = 1; return 0;`); const mv2 = await C(`for (let y = 0; y < 8; y++) for (let x = 0; x < 7; x++) { const t = jy.b.map(r => r.slice()); [t[y][x], t[y][x+1]] = [t[y][x+1], t[y][x]]; for (let j = 0; j < 8; j++) for (let i = 0; i < 6; i++) if (t[j][i] === t[j][i+1] && t[j][i] === t[j][i+2]) return [x, y]; for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) if (t[j][i] === t[j+1][i] && t[j][i] === t[j+2][i]) return [x, y]; } return null;`);
  if (mv2) { await C(`T.swap(${mv2[0]}, ${mv2[1]}, ${mv2[0] + 1}, ${mv2[1]}); return 0;`); await calm(); await sleep(700); if (await C('return jy.mode;') !== 'over') throw new Error('la partie devait finir'); await shot('4-fin'); }
  const errs = await pj(`window.__e.join(' | ')`); if (errs) throw new Error('erreur : ' + errs);
  await pj(`document.fullscreenElement && document.exitFullscreen(), 0`); await sleep(200);
  await pj(`document.getElementById('gFs').click(), 0`); await sleep(800);
  const fs = await pj(`(() => { const c = document.getElementById('gc'), r = c.getBoundingClientRect(); return document.fullscreenElement === c.parentElement && (Math.abs(r.height - innerHeight) < 3 || Math.abs(r.width - innerWidth) < 3); })()`);
  await pj(`document.fullscreenElement && document.exitFullscreen(), 0`); await sleep(400);
  if (!fs) throw new Error('le plein écran ne remplit pas l\'écran');
  const L = await pj(`(() => { const r = document.getElementById('gc').getBoundingClientRect(); let s = 0; for (let e = document.getElementById('gc').parentElement; e; e = e.parentElement) s += e.scrollTop; return { bottom: Math.round(r.bottom + s), h: Math.round(r.height), wh: innerHeight, ww: innerWidth, sw: document.documentElement.scrollWidth }; })()`);
  if (process.env.NEO_FIT_LOG) console.log('FIT', JSON.stringify(L));
  if (L.bottom > L.wh + 1 || L.sw > L.ww + 1 || L.h < 300) throw new Error('la zone de jeu dépasse la fenêtre ou reste petite : ' + JSON.stringify(L));
  await C('T.again(); return 0;');
  return 'vérification ok · coup à la souris · bombe 3 × 3 · étoile : ' + st + ' pierres d\'une couleur · fin · plein écran · ' + L.h + ' px dans ' + L.ww + '×' + L.wh;
};
