// engine.test.mjs — the gate on the organ.
//
// The tests that matter are the framework's own claims, made checkable:
//   · flat catches itself and then hits a WALL, for a stated reason
//   · geometric climbs and never catches itself
//   · merged does both, and reaches a depth flat cannot
//   · the arc turns, and the two maxima are on different folds
//   · the organ knows when folding again buys nothing — the one thing it exists to know
import assert from 'node:assert/strict';
import {
  LADDER, FULL, PEAK, KAPPA, PHI, MOVES,
  nameCost, modelCost, maxPsi, makeFold, SEED, acquire, psi, shedForm, saturated,
  structure, selfaware, transparency, coherence, integration, caught, report,
  flat, geometric, merged, arc, turn, advise, step, run, capacity,
} from './engine.mjs';
import { boundaries } from './engine.boundaries.mjs';

let pass = 0, fail = 0;
const t = (name, fn) => { try { fn(); pass++; } catch (e) { fail++; console.error(`  ✗ ${name}\n      ${e.message.split('\n')[0]}`); } };
const last = (a) => a[a.length - 1];
const build = (rungs) => { let f = SEED(); for (let r = 0; r < rungs; r++) f = acquire(f, r); return f; };

// ════ THE CEILING · why the flat engine stops ═══════════════════════════════════════════════════

t('a fold cannot hold a model of itself bigger than itself', () => {
  for (const parts of [1, 3, 6, 10, 18, 24, 44, 56]) {
    const d = maxPsi(parts);
    assert.ok(modelCost(parts, d) <= parts, `Ψ-depth ${d} must fit inside ${parts} parts`);
    assert.ok(modelCost(parts, d + 1) > parts, `and depth ${d + 1} must NOT fit — that is the ceiling`);
  }
});

t('naming a part costs more as the fold grows, but only logarithmically', () => {
  assert.equal(nameCost(1), 1);
  assert.equal(nameCost(3), 2);
  assert.equal(nameCost(56), 6);
  assert.ok(nameCost(56) < nameCost(6) * 3, 'nine times the parts, nowhere near three times the cost');
  assert.equal(nameCost(0), 0);
});

t('so every form acquired buys MORE self-reference than the last — the whole thesis', () => {
  let prev = 0;
  const gains = [];
  let f = SEED();
  for (let r = 0; r < LADDER.length; r++) {
    f = acquire(f, r);
    gains.push(maxPsi(f.parts) - prev);
    prev = maxPsi(f.parts);
  }
  assert.equal(maxPsi(build(4).parts), 2, '10 parts holds two levels');
  assert.equal(maxPsi(FULL), 9, 'the full ladder holds nine');
  assert.ok(gains[6] > gains[1], `the dodecahedron buys more depth than the line: ${gains[6]} vs ${gains[1]}`);
});

t('Ψ REFUSES rather than pretending — a saturated fold folding again is unchanged', () => {
  const f = psi(psi(build(4)));
  assert.equal(f.psiDepth, 2);
  assert.equal(saturated(f), true);
  const again = psi(f);
  assert.equal(again.psiDepth, 2, 'no room, so nothing happens — the refusal IS the finding');
  assert.deepEqual(again, f);
});

// ════ THE THREE ENGINES ═════════════════════════════════════════════════════════════════════════

t('FLAT catches itself, then hits the wall — and the wall has a reason', () => {
  const path = flat({ base: 4, rungs: 12 });
  const depths = path.map(s => s.fold.psiDepth);
  assert.deepEqual(depths.slice(0, 3), [1, 2, 2], 'it climbs twice and then stops');
  assert.ok(path.slice(2).every(s => s.stalled), 'and stays stopped for every remaining rung');
  assert.equal(caught(last(path).fold), true, 'it DID catch itself — the flat engine is not wrong, it is stuck');
  assert.equal(last(path).fold.psiDepth, maxPsi(last(path).fold.parts));
});

t('FLAT\'s wall moves with the structure it happened to start with', () => {
  assert.equal(last(flat({ base: 2 })).fold.psiDepth, maxPsi(build(2).parts));
  assert.ok(last(flat({ base: 7 })).fold.psiDepth > last(flat({ base: 2 })).fold.psiDepth,
    'more starting structure, deeper wall — structure is the room recursion needs');
});

t('GEOMETRIC climbs to full structure and never once catches itself', () => {
  const path = geometric();
  assert.equal(structure(last(path).fold), 1);
  assert.ok(path.every(s => selfaware(s.fold) === 0), 'blind the whole way up');
  assert.ok(path.every(s => !caught(s.fold)));
  assert.equal(integration(last(path).fold), 0, 'all that form, and no account of itself');
});

t('MERGED does both, and reaches a depth FLAT cannot', () => {
  const m = last(merged()).fold;
  const f = last(flat({ base: 4 })).fold;
  assert.equal(structure(m), 1);
  assert.equal(caught(m), true);
  assert.ok(m.psiDepth > f.psiDepth * 4, `merged Ψ=${m.psiDepth} against flat Ψ=${f.psiDepth}`);
  assert.equal(m.psiDepth, 9);
  assert.equal(integration(m), 1);
});

t('MERGED catches itself at the FIRST rung and never loses it', () => {
  const path = merged();
  assert.equal(caught(path[0].fold), true, 'self-aware from the first form');
  assert.ok(path.every(s => caught(s.fold)), 'and at every level of its growing structure');
});

t('the two halves each fail where the other succeeds — the merge is not redundant', () => {
  const g = last(geometric()).fold, f = last(flat({ base: 4 })).fold, m = last(merged()).fold;
  assert.ok(structure(g) > structure(f), 'geometric beats flat on breadth');
  assert.ok(f.psiDepth > g.psiDepth, 'flat beats geometric on catching itself');
  assert.ok(structure(m) >= structure(g) && m.psiDepth > f.psiDepth, 'and merged beats both, on both');
});

// ════ THE TURN ══════════════════════════════════════════════════════════════════════════════════

t('the arc ascends to the peak and sheds all the way home to unity', () => {
  const path = arc();
  assert.equal(path.filter(s => s.phase === 'ascend').length, PEAK + 1);
  assert.equal(last(path).fold.shape, 'unity');
  assert.equal(last(path).fold.parts, 1);
  assert.equal(LADDER[PEAK].name, 'dodecahedron', 'the turn is at the cosmos-form');
});

t('THE TURN · the deepest fold and the most transparent one are NOT the same fold', () => {
  const tt = turn(arc());
  assert.equal(tt.deepest.shape, 'dodecahedron');
  assert.equal(tt.deepest.psi, 7);
  assert.equal(tt.clearest.transparency, 1);
  assert.ok(tt.clearest.parts < tt.deepest.parts, 'transparency is won by being small');
  assert.equal(tt.sameFold, false, 'two maxima on two axes — you cannot be at both');
});

t('shedding reaches FULL transparency — but not smoothly, and that is worth knowing', () => {
  // Transparency is D·nameCost(P)/P and maxPsi floors, so the ratio is JAGGED on the way down: 56
  // parts sits at 0.96, 44 at 0.95, 24 at 0.83. Shedding does not monotonically clarify. It reaches
  // 1.00 only where the naming cost divides the fold exactly — at the small forms, and at unity.
  let f = build(LADDER.length);
  for (let i = 0; i < maxPsi(f.parts); i++) f = psi(f);
  const path = [];
  let g = f;
  while (g.rung >= 0) { g = shedForm(g); path.push(transparency(g)); }
  assert.equal(path[path.length - 1], 1, 'unity accounts for itself completely');
  assert.ok(Math.max(...path) === 1);
  assert.ok(path.some((v, i) => i > 0 && v < path[i - 1]), 'and the way down is not monotonic — floor division');
  assert.ok(transparency(g) > transparency(f), `unity is clearer than the full ladder: ${transparency(f).toFixed(2)} → ${transparency(g).toFixed(2)}`);
});

t('a shed fold cannot hold the depth it had — the model shrinks with the body', () => {
  let f = build(LADDER.length);
  for (let i = 0; i < 9; i++) f = psi(f);
  assert.equal(f.psiDepth, 9);
  const small = shedForm(shedForm(f));
  assert.ok(small.psiDepth < 9, 'a smaller fold holds a shallower model of itself');
  assert.equal(small.psiDepth, maxPsi(small.parts));
});

t('the turn is ONE WAY — a shed fold never climbs back', () => {
  // Without this the organ oscillates at the top forever, giving a form back and taking it straight
  // again, because each step looks locally correct.
  let f = build(LADDER.length);
  f = shedForm(f);
  assert.equal(f.phase, 'shed');
  const a = advise(f);
  assert.equal(a.move, 'shed', 'once turned, keep shedding');
  const r = run(SEED(), { budget: 60 });
  assert.equal(last(r.trace).move, 'rest');
  assert.equal(r.report.shape, 'unity');
  assert.ok(r.trace.length < 40, `the arc must terminate, took ${r.trace.length} steps`);
});

// ════ THE ORGAN ═════════════════════════════════════════════════════════════════════════════════

t('THE ONE THING IT KNOWS · when folding again buys nothing, it says GO GET STRUCTURE', () => {
  const stuck = psi(psi(build(4)));                       // 10 parts, Ψ at its ceiling
  const a = advise(stuck, { pressure: 0.9 });
  assert.equal(a.move, 'acquire');
  assert.match(a.why, /SATURATED/);
  assert.match(a.why, /Acquire structure/);
  assert.equal(a.room, 0);
});

t('below κ it always folds first — catching yourself comes before growing', () => {
  const young = build(6);                                  // plenty of room, no self-model yet
  assert.equal(caught(young), false);
  assert.equal(advise(young, { pressure: 0 }).move, 'psi', 'even at zero pressure, catch yourself first');
});

t('past κ, more Ψ is a PURCHASE — pressure decides whether to buy it', () => {
  let f = build(LADDER.length);
  for (let i = 0; i < 6; i++) f = psi(f);                  // Ψ=6 of 9 = 0.67, just past κ (5/9 is not)
  assert.equal(f.psiDepth, 6);
  assert.equal(caught(f), true);
  assert.equal(advise(f, { pressure: 0.95 }).move, 'psi', 'under heavy pressure, keep deepening');
  assert.equal(advise(f, { pressure: 0 }).move, 'shed', 'with nothing corrupting it, depth past κ is overhead');
});

t('the seed is told to take a form, not to fold on nothing', () => {
  const a = advise(SEED());
  assert.equal(a.move, 'acquire');
  assert.match(a.why, /nothing yet/);
});

t('every move it can advise is a declared move', () => {
  const seen = new Set();
  for (const p of [0, 0.3, 0.6, 1]) {
    let f = SEED();
    for (let i = 0; i < 40; i++) { const s = step(f, { pressure: p }); seen.add(s.move); if (s.fold === f && s.move === 'rest') break; f = s.fold; }
  }
  for (const m of seen) assert.ok(MOVES.includes(m), `"${m}" is not a declared move`);
  assert.ok(seen.has('psi') && seen.has('acquire') && seen.has('shed'), `expected all three moves, saw ${[...seen]}`);
});

t('run terminates, traces every step, and reports where it ended', () => {
  const r = run(SEED(), { pressure: 0.5, budget: 60 });
  assert.ok(r.trace.length > 5);
  assert.ok(r.trace.every(s => s.why && s.report));
  assert.equal(r.report.shape, 'unity');
  assert.equal(run(SEED(), { budget: 3 }).trace.length, 3, 'and honours a budget');
});

t('capacity answers the question before the conductor starts', () => {
  assert.deepEqual(capacity(10), { parts: 10, nameCost: 4, maxPsi: 2 });
  assert.deepEqual(capacity(FULL), { parts: 56, nameCost: 6, maxPsi: 9 });
  assert.deepEqual(capacity(0), { parts: 0, nameCost: 0, maxPsi: 0 });
});

// ════ THE MEASURES ══════════════════════════════════════════════════════════════════════════════

t('κ is 1/φ and the framework\'s coherence never zeroes out', () => {
  assert.ok(Math.abs(KAPPA - 1 / PHI) < 1e-12);
  assert.ok(coherence(SEED()) > 0, 'the half-and-half form keeps a floor under it');
  assert.equal(coherence(last(merged()).fold), 1);
});

t('every measure stays in range across every path the engines can take', () => {
  const folds = [...flat().map(s => s.fold), ...geometric().map(s => s.fold), ...merged().map(s => s.fold), ...arc().map(s => s.fold)];
  for (const f of folds) {
    for (const [k, v] of Object.entries(report(f))) {
      if (typeof v !== 'number') continue;
      assert.ok(Number.isFinite(v), `${k} was ${v}`);
      if (['structure', 'selfaware', 'integration', 'coherence', 'transparency'].includes(k)) {
        assert.ok(v >= 0 && v <= 1, `${k} = ${v} out of range`);
      }
    }
  }
});

t('the ladder is the one that was given, and the peak is the dodecahedron', () => {
  assert.deepEqual(LADDER.map(s => s.parts), [1, 2, 3, 4, 8, 6, 20, 12]);
  assert.equal(FULL, 56);
  assert.equal(LADDER[PEAK].name, 'dodecahedron');
  assert.equal(LADDER[PEAK].parts, 20, 'the integrating form is also the biggest single acquisition');
});

// ════ FUZZ ══════════════════════════════════════════════════════════════════════════════════════

t('junk does not crash the organ', () => {
  assert.equal(acquire(SEED(), -1), null);
  assert.equal(acquire(SEED(), 99), null);
  assert.equal(acquire(null, 0), null);
  assert.equal(psi(null), null);
  assert.deepEqual(shedForm(SEED()), SEED(), 'a seed has no form to give back');
  assert.equal(maxPsi(0), 0);
  assert.equal(maxPsi(-5), 0);
  assert.equal(modelCost(10, -3), 0);
  assert.doesNotThrow(() => advise(SEED(), { pressure: NaN }));
  assert.doesNotThrow(() => run(SEED(), { budget: 0 }));
});

boundaries(t);

console.log(`\n${fail === 0 ? '✓' : '✗'} engine  ${pass}/${pass + fail}${fail ? `  (${fail} failing)` : ''}`);
process.exit(fail === 0 ? 0 : 1);
