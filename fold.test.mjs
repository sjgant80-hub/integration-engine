// fold.test.mjs — the gate, and the record of what the measurement actually said.
//
// The headline tests are not the mechanics. They are the FINDINGS: that the pasted engine's merge was
// decorative, that self-reference costs content, that it only earns its keep under damage, and that
// `structure × selfref` never beat structure alone. Those are pinned here so a future edit that
// quietly flatters the claim has to break a test to do it.
import assert from 'node:assert/strict';
import {
  LADDER, TOTAL_PARTS, KAPPA, PHI, PREDICTORS, CODES,
  makeFold, acquire, selfFold, structure, selfref, integration, caught,
  rng, trial, measure, flat, geometric, merged, spearman,
} from './fold.mjs';

let pass = 0, fail = 0;
const t = (name, fn) => { try { fn(); pass++; } catch (e) { fail++; console.error(`  ✗ ${name}\n      ${e.message.split('\n')[0]}`); } };

const top = (path) => path[path.length - 1];

// ════ THE DEFECT THAT STARTED THIS ══════════════════════════════════════════════════════════════

t('THE DEFECT · a self-reference term pinned at 1 makes the product identical to structure', () => {
  // The pasted engine set selfref = 3 at every rung, so selfaware() was min(1, 3/3) = 1 always, and
  // integration = structure × 1. Eight rungs of "the product climbs where neither half does", with
  // one of the halves held at a constant. Reproduced here so the trap stays visible.
  const pinned = (f) => structure(f) * 1;
  let f = makeFold();
  for (let r = 0; r < LADDER.length; r++) {
    f = acquire(f, r);
    assert.equal(pinned(f), structure(f), 'multiplying by a constant is not a merge');
  }
});

t('here, self-reference can be LOW — it is measured, not granted', () => {
  const grown = geometric()[7];
  assert.equal(selfref(grown), 0, 'a fold that never modelled itself scores zero, whatever it claims');
  assert.ok(selfref(selfFold(grown, 0.5)) > 0);
  assert.notEqual(integration(grown), structure(grown), 'so the product is no longer structure in disguise');
});

// ════ SELF-REFERENCE COSTS ══════════════════════════════════════════════════════════════════════

t('a self-model is paid for out of the fold\'s own parts', () => {
  const f = selfFold(makeFold({ parts: 100 }), 0.3);
  assert.equal(f.model, 30);
  assert.equal(f.parts - f.model, 70, 'thirty parts spent watching are seventy parts left doing');
});

t('spending everything on self-modelling leaves nothing to model', () => {
  const all = selfFold(makeFold({ parts: 50 }), 1);
  assert.ok(all.model <= 45, 'the share is capped below 1 — a fold that is only a self-model is empty');
  assert.ok(all.parts - all.model > 0);
});

t('a fold cannot model more of itself than it has', () => {
  assert.throws(() => makeFold({ parts: 4, model: 5 }), /cannot spend/);
});

t('acquiring form DILUTES self-reference — the two axes genuinely compete', () => {
  const a = selfFold(makeFold({ parts: 10 }), 0.5);
  const before = selfref(a);
  const after = selfref(acquire(a, 6));            // +20 parts, same model
  assert.ok(after < before, `coverage must fall when the thing being covered grows: ${before} → ${after}`);
});

t('structure and self-reference are on the same scale and both bounded', () => {
  for (const f of [...flat(), ...geometric(), ...merged()]) {
    for (const v of [structure(f), selfref(f), integration(f)]) {
      assert.ok(v >= 0 && v <= 1, `${v} out of range`);
      assert.ok(Number.isFinite(v));
    }
  }
});

t('κ is where self-reference is said to catch, and it is 1/φ', () => {
  assert.ok(Math.abs(KAPPA - 1 / PHI) < 1e-12);
  assert.equal(caught(selfFold(makeFold({ parts: 100 }), 0.5)), true, 'half spent modelling covers all the rest');
  assert.equal(caught(geometric()[7]), false, 'and a fold that never looked at itself has not caught anything');
});

// ════ THE TASK · scored from outside ════════════════════════════════════════════════════════════

t('capability is measured against the original, never against the fold\'s own opinion', () => {
  const f = merged()[7];
  const m = measure(f, 0.3, { seed: 3, runs: 200 });
  assert.ok(m >= 0 && m <= f.parts - f.model);
  assert.notEqual(m, integration(f), 'the score and the claim are different numbers from different places');
});

t('the measurement is deterministic — same seed, same answer, forever', () => {
  // Deliberately a fold whose outcome DEPENDS on where the damage lands. A fold whose model covers
  // all its content survives identically whatever the dice say, so it would pass this test without
  // demonstrating anything — which is exactly the vacuous assertion this suite exists to avoid.
  const f = geometric()[7];
  assert.equal(selfref(f), 0, 'nothing repairs the damage, so the seed decides the answer');
  assert.equal(measure(f, 0.3, { seed: 9, runs: 100 }), measure(f, 0.3, { seed: 9, runs: 100 }));
  assert.notEqual(measure(f, 0.3, { seed: 9, runs: 100 }), measure(f, 0.3, { seed: 10, runs: 100 }));
});

t('with no damage there is nothing to repair, so capability is simply the content', () => {
  const f = merged()[7];
  assert.equal(measure(f, 0, { seed: 1, runs: 20 }), f.parts - f.model);
});

t('more damage never helps', () => {
  const f = geometric()[7];
  let last = Infinity;
  for (const rate of [0, 0.1, 0.3, 0.5, 0.8]) {
    const c = measure(f, rate, { seed: 4, runs: 400 });
    assert.ok(c <= last + 1e-9, `capability rose from ${last} to ${c} as damage increased`);
    last = c;
  }
});

t('a fold with no self-model repairs nothing', () => {
  const f = geometric()[7];
  const r = trial(f, 0.5, rng(2), { code: 'parity' });
  assert.equal(r.restored, 0);
  assert.equal(r.capability, r.content - r.damaged);
});

// ════ THE CODES · how good the self-model is allowed to be ══════════════════════════════════════

t('PARITY repairs damage anywhere; COPY only repairs what it duplicated', () => {
  // model smaller than content, so the two codes can actually differ
  const f = selfFold(geometric()[7], 0.2);
  assert.ok(f.model < f.parts - f.model, 'the fixture must have less model than content');
  const par = measure(f, 0.5, { seed: 6, runs: 800, code: 'parity' });
  const cop = measure(f, 0.5, { seed: 6, runs: 800, code: 'copy' });
  assert.ok(par > cop, `parity ${par} should beat copy ${cop} — it is not tied to specific cells`);
});

t('the two codes COINCIDE when the model covers everything', () => {
  // At half the parts, model equals content exactly, so copy protects every cell and parity has
  // nothing extra to offer. This is why a fixed 50% share could not tell the codes apart at all.
  const f = selfFold(geometric()[7], 0.5);
  assert.equal(f.model, f.parts - f.model);
  const seed = 8;
  assert.equal(measure(f, 0.4, { seed, runs: 300, code: 'parity' }), measure(f, 0.4, { seed, runs: 300, code: 'copy' }));
});

t('both codes are declared, and an unknown one falls back to parity rather than silently scoring zero', () => {
  assert.deepEqual([...CODES], ['copy', 'parity']);
  const f = selfFold(geometric()[7], 0.2);
  assert.equal(measure(f, 0.3, { seed: 2, runs: 100, code: 'nonsense' }), measure(f, 0.3, { seed: 2, runs: 100, code: 'parity' }));
});

// ════ THE FINDINGS · pinned, so they cannot quietly drift ═══════════════════════════════════════

t('FINDING 1 · with no damage, self-reference is pure overhead and structure alone wins', () => {
  const geo = measure(geometric()[7], 0, { seed: 1, runs: 50 });
  const mer = measure(merged({ share: 0.5 })[7], 0, { seed: 1, runs: 50 });
  assert.ok(geo > mer, `${geo} vs ${mer} — in a world that never breaks you, watching yourself costs and returns nothing`);
  assert.equal(geo, TOTAL_PARTS);
});

t('FINDING 2 · under heavy damage the merged fold wins, and by a wide margin', () => {
  const geo = measure(geometric()[7], 0.7, { seed: 1, runs: 2000 });
  const mer = measure(merged({ share: 0.5 })[7], 0.7, { seed: 1, runs: 2000 });
  assert.ok(mer > geo * 1.4, `merged ${mer.toFixed(1)} should clearly beat geometric ${geo.toFixed(1)} at 70% damage`);
});

t('FINDING 3 · the crossover exists — there is a damage rate where the winner changes', () => {
  const winnerAt = (rate) => {
    const geo = measure(geometric()[7], rate, { seed: 1, runs: 2000 });
    const mer = measure(merged({ share: 0.5 })[7], rate, { seed: 1, runs: 2000 });
    return mer > geo ? 'merged' : 'geometric';
  };
  assert.equal(winnerAt(0.1), 'geometric');
  assert.equal(winnerAt(0.7), 'merged');
});

t('FINDING 4 · a NAIVE self-model pays much later than a structural one', () => {
  // The whole experiment turned on this. Judging the claim against the worst possible self-model
  // would have been rigged, so both are measured and the gap is the result.
  const rate = 0.2;
  const geo = measure(geometric()[7], rate, { seed: 11, runs: 2000, code: 'parity' });
  const bestAt = (code) => {
    let best = -1;
    for (let i = 0; i <= 45; i++) best = Math.max(best, measure(merged({ share: i / 50 })[7], rate, { seed: 11, runs: 2000, code }));
    return best;
  };
  assert.ok(bestAt('parity') > geo, 'a structural self-model already pays at 20% damage');
  assert.ok(bestAt('copy') <= geo + 1e-9, 'a self-model that only remembers specific facts does not');
});

t('FINDING 5 · THE CLAIM FAILS — structure alone predicts capability better than the product', () => {
  // 152 folds, structure and self-reference varied independently, capability measured from outside.
  // This is the result the whole build exists to establish, and it goes against the hypothesis.
  const pop = [];
  for (let r = 0; r < LADDER.length; r++) {
    let f = makeFold();
    for (let i = 0; i <= r; i++) f = acquire(f, i);
    for (let i = 0; i <= 18; i++) pop.push(selfFold(f, i / 20));
  }
  assert.equal(pop.length, 152);

  for (const rate of [0, 0.35, 0.7]) {
    const caps = pop.map(f => measure(f, rate, { seed: 5, runs: 300 }));
    const product = spearman(pop.map(PREDICTORS['structure × selfref']), caps);
    const alone = spearman(pop.map(PREDICTORS['structure alone']), caps);
    assert.ok(alone > product, `at ${rate}: structure alone (${alone.toFixed(2)}) must beat the product (${product.toFixed(2)})`);
    assert.ok(alone > 0.85, `structure alone should be a strong predictor, got ${alone.toFixed(2)}`);
  }
});

t('FINDING 6 · self-reference ALONE carries almost no information about capability', () => {
  // Not "negative" — that was an artefact of degenerate folds whose model consumed every part, and it
  // disappeared once the clamp stopped those existing. The robust statement is weaker and cleaner:
  // knowing only how much a fold watches itself tells you next to nothing about how much survives.
  const pop = [];
  for (let r = 0; r < LADDER.length; r++) {
    let f = makeFold();
    for (let i = 0; i <= r; i++) f = acquire(f, i);
    for (let i = 0; i <= 18; i++) pop.push(selfFold(f, i / 20));
  }
  for (const rate of [0, 0.1, 0.35, 0.7]) {
    const caps = pop.map(f => measure(f, rate, { seed: 5, runs: 300 }));
    const alone = spearman(pop.map(PREDICTORS['selfref alone']), caps);
    const struct = spearman(pop.map(PREDICTORS['structure alone']), caps);
    assert.ok(Math.abs(alone) < 0.3, `self-reference alone should be near-uninformative, got ${alone.toFixed(2)} at ${rate}`);
    assert.ok(struct > Math.abs(alone) * 2.5, `and structure should dwarf it: ${struct.toFixed(2)} vs ${alone.toFixed(2)}`);
  }
});

t('FINDING 7 · but the product gets LESS wrong as the world gets more hostile', () => {
  const pop = [];
  for (let r = 0; r < LADDER.length; r++) {
    let f = makeFold();
    for (let i = 0; i <= r; i++) f = acquire(f, i);
    for (let i = 0; i <= 18; i++) pop.push(selfFold(f, i / 20));
  }
  const rho = (rate) => spearman(pop.map(PREDICTORS['structure × selfref']), pop.map(f => measure(f, rate, { seed: 5, runs: 300 })));
  assert.ok(rho(0.7) > rho(0), `the product should track capability better under damage: ${rho(0).toFixed(2)} → ${rho(0.7).toFixed(2)}`);
});

// ════ THE STRATEGIES ════════════════════════════════════════════════════════════════════════════

t('FLAT plateaus — self-reference saturated, structure never grows', () => {
  const path = flat();
  assert.equal(path.length, LADDER.length);
  const s = path.map(structure);
  assert.ok(s.every(x => x === s[0]), 'the flat climb never acquires anything after its base');
  assert.equal(selfref(top(path)), 1);
  // the base is exactly the rungs asked for — 4 rungs is 1+2+3+4 parts, not 3 and not 5
  assert.equal(flat({ base: 4 })[0].parts, 10);
  assert.equal(flat({ base: 1 })[0].parts, 1);
  assert.equal(flat({ base: 3 })[0].parts, 6);
  assert.ok(flat({ base: 4 })[0].parts > flat({ base: 3 })[0].parts, 'one more rung is strictly more structure');
});

t('GEOMETRIC climbs and stays blind', () => {
  const path = geometric();
  const s = path.map(structure);
  for (let i = 1; i < s.length; i++) assert.ok(s[i] > s[i - 1], 'structure must rise every rung');
  assert.equal(structure(top(path)), 1);
  assert.ok(path.every(f => selfref(f) === 0), 'and never once looks at itself');
});

t('MERGED does both every rung', () => {
  const path = merged();
  const s = path.map(structure);
  for (let i = 1; i < s.length; i++) assert.ok(s[i] > s[i - 1]);
  // from the second rung on. A single-part fold cannot hold both content and a model of that
  // content, so rung 1 having no self-model is the constraint being honest, not a gap.
  assert.equal(selfref(path[0]), 0, 'one part cannot describe itself and still be something');
  assert.ok(path.slice(1).every(f => selfref(f) > 0), 'and carries a self-model from there on');
  assert.equal(structure(top(path)), 1);
});

t('the ladder is the one that was given', () => {
  assert.equal(LADDER.length, 8);
  assert.equal(TOTAL_PARTS, 56);
  assert.deepEqual(LADDER.map(s => s.parts), [1, 2, 3, 4, 8, 6, 20, 12]);
  assert.equal(LADDER[6].name, 'dodecahedron');
});

// ════ SPEARMAN ══════════════════════════════════════════════════════════════════════════════════

t('rank correlation is right on the cases with known answers', () => {
  assert.ok(Math.abs(spearman([1, 2, 3, 4], [10, 20, 30, 40]) - 1) < 1e-9);
  assert.ok(Math.abs(spearman([1, 2, 3, 4], [40, 30, 20, 10]) + 1) < 1e-9);
  assert.equal(spearman([1, 1, 1], [1, 2, 3]), 0, 'no variation means no correlation, not a crash');
  assert.equal(spearman([1], [1]), null);
  assert.ok(spearman([1, 2, 3, 4], [1, 2, 4, 3]) > 0.5, 'a nearly-right ordering scores high');
});

t('ties share a rank rather than being ordered by accident', () => {
  assert.ok(Math.abs(spearman([1, 1, 2, 2], [1, 1, 2, 2]) - 1) < 1e-9);
});

// ════ FUZZ ══════════════════════════════════════════════════════════════════════════════════════

t('a pure kernel does not throw on garbage', () => {
  for (const junk of [null, undefined, {}, { parts: 0, model: 0 }, { parts: NaN, model: 0 }]) {
    assert.doesNotThrow(() => structure(junk || { parts: 0, model: 0 }));
    assert.doesNotThrow(() => selfref(junk || { parts: 0, model: 0 }));
  }
  assert.doesNotThrow(() => selfFold(makeFold({ parts: 10 }), NaN));
  assert.doesNotThrow(() => selfFold(makeFold({ parts: 10 }), -5));
  assert.equal(acquire(makeFold(), 99), null);
  assert.equal(acquire(makeFold(), -1), null);
  assert.equal(trial(makeFold(), 0.5, rng(1)).capability, 0);
});

t('an empty fold is empty, not undefined', () => {
  const e = makeFold();
  assert.equal(structure(e), 0);
  assert.equal(selfref(e), 0);
  assert.equal(integration(e), 0);
  assert.equal(measure(e, 0.5, { runs: 5 }), 0);
});

// ════ BOUNDARIES · pinned to a case sitting exactly on them ═════════════════════════════════════

t('the ladder ends where it ends — one past the top is nothing, not undefined', () => {
  const f = makeFold();
  assert.equal(acquire(f, LADDER.length), null, 'rung 8 does not exist on an 8-rung ladder');
  assert.ok(acquire(f, LADDER.length - 1), 'but the last rung does');
});

t('kappa is INCLUSIVE — exactly at the threshold, the fold has caught itself', () => {
  // Built to land precisely on kappa: content 1, model kappa. `caught` is a pure read of the numbers.
  assert.equal(caught({ parts: 1 + KAPPA, model: KAPPA }), true, 'at the boundary is across it');
  assert.equal(caught({ parts: 1 + KAPPA * 0.999, model: KAPPA * 0.999 }), false);
});

t('the damage threshold is exact, in BOTH codes — a draw sitting on the rate does not damage', () => {
  // `random` is injected, so the boundary is reachable rather than a measure-zero accident. A value
  // exactly equal to the rate must fall on the SAFE side, identically under both encodings.
  const f = selfFold(geometric()[7], 0.2);
  for (const code of ['copy', 'parity']) {
    const onTheLine = trial(f, 0.5, () => 0.5, { code });
    assert.equal(onTheLine.damaged, 0, code + ': a draw exactly at the rate must not count as damage');
    const under = trial(f, 0.5, () => 0.499, { code });
    assert.equal(under.damaged, under.content, code + ': and just under it, everything is hit');
  }
});

t('two points are enough to correlate — the early return is for fewer than two', () => {
  assert.ok(Math.abs(spearman([1, 2], [1, 2]) - 1) < 1e-9, 'two points already have an order');
  assert.ok(Math.abs(spearman([1, 2], [2, 1]) + 1) < 1e-9);
  assert.equal(spearman([1], [1]), null);
  assert.equal(spearman([], []), null);
});

console.log(`\n${fail === 0 ? '✓' : '✗'} fold  ${pass}/${pass + fail}${fail ? `  (${fail} failing)` : ''}`);
process.exit(fail === 0 ? 0 : 1);
