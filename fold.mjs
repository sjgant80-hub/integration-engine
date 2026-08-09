// fold.mjs — the integration engine, built so it can FAIL.
//
// ══ WHY THIS EXISTS ═════════════════════════════════════════════════════════════════════════════
//
// The claim under test: deepening needs BOTH new structure and self-reference, multiplied, because
// either alone stalls — all structure and no self-reference is a blind pile, all self-reference and
// no structure is a stuck loop, and only the product climbs.
//
// The first draft did not test that. `merged_deepen` set `selfref=3` at every rung, so `selfaware()`
// was pinned at 1.0 and `integration = structure × 1.0` was structure, exactly, at all eight rungs.
// Multiplying by a constant is not a merge. The claim needs an implementation where BOTH factors can
// be low, where self-reference can genuinely fail, and where something outside the model decides who
// was right.
//
// So here self-reference COSTS. A fold has a fixed number of parts. Parts spent holding a model of
// itself are parts not holding anything else. That is the real tension and it is not a metaphor: a
// system that watches itself is using capacity it could have spent on the work.
//
// And the score comes from OUTSIDE. The fold is damaged and asked to repair itself, and capability is
// how much of it is still correct afterwards — measured against the original, never against its own
// opinion of its depth. A model that grades its own integration is the test-theatre this is built to
// avoid.
//
// Pure and deterministic: no clock, no I/O, no ambient randomness. The generator is seeded and passed
// in, so every number in the study reproduces exactly.

export const VERSION = '0.1.0';
export const PHI = (1 + Math.sqrt(5)) / 2;
export const KAPPA = 1 / PHI;          // 0.618… — where the fold is said to catch itself

// The ladder, as given. `parts` is what acquiring that form adds to the fold's capacity.
export const LADDER = Object.freeze([
  { name: 'point', parts: 1, cap: 'unity' },
  { name: 'line', parts: 2, cap: 'relation' },
  { name: 'triangle', parts: 3, cap: 'closure' },
  { name: 'tetrahedron', parts: 4, cap: 'solidity' },
  { name: 'cube', parts: 8, cap: 'structure' },
  { name: 'octahedron', parts: 6, cap: 'balance' },
  { name: 'dodecahedron', parts: 20, cap: 'integration' },
  { name: 'icosahedron', parts: 12, cap: 'flow' },
]);

export const TOTAL_PARTS = LADDER.reduce((a, s) => a + s.parts, 0);   // 56

// ── THE FOLD ────────────────────────────────────────────────────────────────────────────────────
//
// `parts` is total capacity. `model` is how many of those parts are spent describing the fold itself,
// leaving `parts - model` to carry content. Both are counts, both are real, and they compete.

export function makeFold({ rung = -1, parts = 0, model = 0, caps = [] } = {}) {
  if (model > parts) throw new Error(`a fold cannot spend ${model} parts modelling itself when it only has ${parts}`);
  return { rung, parts, model, caps: [...caps] };
}

/** ACQUIRE — take the next form. Structure up, self-model unchanged, so coverage falls. */
export function acquire(fold, rung) {
  if (rung < 0 || rung >= LADDER.length) return null;
  const s = LADDER[rung];
  return makeFold({ rung, parts: fold.parts + s.parts, model: fold.model, caps: [...fold.caps, s.cap] });
}

/**
 * SELF-FOLD — spend parts on a model of this fold.
 *
 * `share` is the fraction of TOTAL capacity given over to self-description. It is capped below 1
 * because a fold that is nothing but a model of itself has nothing left to be a model OF — which is
 * the stuck loop, stated precisely rather than asserted.
 */
export function selfFold(fold, share) {
  const s = Math.max(0, Math.min(0.9, Number.isFinite(share) ? share : 0));
  // The 0.9 cap is meant to guarantee something is left to be modelled, and on a large fold it does.
  // On a small one, rounding defeats it: a single part at share 0.5 rounds to a model of 1, leaving
  // zero content — a fold that is entirely a description of itself and describes nothing. Clamped so
  // the guarantee holds at every size, not just the comfortable ones.
  const model = Math.min(Math.max(0, fold.parts - 1), Math.round(fold.parts * s));
  return makeFold({ ...fold, model });
}

// ── THE TWO AXES ────────────────────────────────────────────────────────────────────────────────

/** How much form it has acquired, against the full ladder. */
export const structure = (fold) => (TOTAL_PARTS ? Math.min(1, fold.parts / TOTAL_PARTS) : 0);

/**
 * How much of itself it can actually account for.
 *
 * Not "how many times it recursed" — that number is free, and anything free is not an axis. This is
 * the fraction of its own content the self-model covers, which is bounded by the parts it spent. A
 * fold with no model scores 0 no matter how deeply it claims to have recursed.
 */
export function selfref(fold) {
  const content = fold.parts - fold.model;
  if (content <= 0) return fold.model > 0 ? 1 : 0;    // all model, nothing to model: complete, and empty
  return Math.min(1, fold.model / content);
}

/** The claim under test. */
export const integration = (fold) => structure(fold) * selfref(fold);

/** Has it "caught itself" in the sense the framework means — self-reference across κ? */
export const caught = (fold) => selfref(fold) >= KAPPA;

// ── THE TASK · repair after damage ──────────────────────────────────────────────────────────────
//
// The scoring is done from outside the fold. Content cells are damaged; the self-model restores the
// ones it covers; capability is how many content cells are correct afterwards.
//
// Deliberately an ABSOLUTE count, not a percentage. Normalising by size would erase the whole point
// of acquiring structure — a big fold that survives is genuinely more capable than a small one that
// survives, and a ratio would call them equal.

/** mulberry32 — seeded, so every run of the study is the same run. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── HOW GOOD IS THE SELF-MODEL ALLOWED TO BE ────────────────────────────────────────────────────
//
// This turned out to be the whole experiment, so it is a parameter rather than a decision.
//
//   COPY   each part of the model holds a duplicate of one specific content part. Redundancy that
//          protects what it stores and nothing else. A naive self-model: it remembers particular
//          facts about itself.
//   PARITY each part of the model is a parity share over ALL the content, so m parts repair any m
//          losses wherever they fall. A structural self-model: it knows how it is put together, so
//          it can rebuild whatever went missing.
//
// The first draft only had COPY, and under COPY the merge loses almost everywhere. That is not a
// finding about merging, it is a finding about the encoding — testing the claim against the worst
// possible self-model and reporting that the claim failed would have been rigged. Both are here, and
// the difference between them is the real result.
export const CODES = Object.freeze(['copy', 'parity']);

/** Damage `rate` of the content, repair what the model can, count what is left correct. */
export function trial(fold, rate, random, { code = 'parity' } = {}) {
  const content = Math.max(0, fold.parts - fold.model);
  if (content === 0) return { content: 0, damaged: 0, restored: 0, capability: 0 };

  let damaged = 0, restored = 0;
  if (code === 'copy') {
    const covered = Math.min(content, fold.model);
    for (let i = 0; i < content; i++) {
      if (random() >= rate) continue;
      damaged++;
      if (i < covered) restored++;              // only this cell's own duplicate can save it
    }
  } else {
    for (let i = 0; i < content; i++) if (random() < rate) damaged++;
    restored = Math.min(fold.model, damaged);   // m parity parts repair any m losses
  }
  return { content, damaged, restored, capability: content - damaged + restored };
}

/** Average capability over `runs` independent damagings. The measurement, not an opinion. */
export function measure(fold, rate, { seed = 1, runs = 200, code = 'parity' } = {}) {
  const random = rng(seed);
  let total = 0;
  for (let r = 0; r < runs; r++) total += trial(fold, rate, random, { code }).capability;
  return total / runs;
}

// ── THE THREE STRATEGIES ────────────────────────────────────────────────────────────────────────
//
// The whole argument in three climbs. Each returns the fold at every rung, so the shapes of the
// three curves can be compared rather than described.

/**
 * FLAT — fold on itself forever, never take a new form. Aware, and stuck.
 *
 * Given a small base to build on rather than starting from a single part. A one-part fold cannot hold
 * both content and a model of it, so "all self-reference" would be a fold of nothing — true, but a
 * strawman. `base` rungs of structure lets this strategy actually cross κ and then plateau, which is
 * the thing it is here to demonstrate.
 */
export function flat({ share = 0.5, base = 4 } = {}) {
  let f = makeFold();
  for (let r = 0; r < Math.min(base, LADDER.length); r++) f = acquire(f, r);
  f = selfFold(f, share);
  const path = [f];
  for (let r = 1; r < LADDER.length; r++) { f = selfFold(f, share); path.push(f); }
  return path;
}

/** GEOMETRIC — take every form, never turn any of it on itself. Growing, and blind. */
export function geometric() {
  let f = makeFold();
  const path = [];
  for (let r = 0; r < LADDER.length; r++) { f = acquire(f, r); path.push(f); }
  return path;
}

/** MERGED — acquire the next form AND spend a share of the whole on modelling it. Both, every rung. */
export function merged({ share = 0.5 } = {}) {
  let f = makeFold();
  const path = [];
  for (let r = 0; r < LADDER.length; r++) { f = selfFold(acquire(f, r), share); path.push(f); }
  return path;
}

export const STRATEGIES = Object.freeze({ flat, geometric, merged });

// ── THE PREDICTORS ──────────────────────────────────────────────────────────────────────────────
//
// Candidate formulas for "how deep is this fold". The study fits each against measured capability and
// reports which one actually predicts it. Listing rivals is the point: a single formula compared
// against nothing is a formula that cannot lose.

export const PREDICTORS = Object.freeze({
  'structure × selfref': (f) => structure(f) * selfref(f),   // the claim
  'structure alone': (f) => structure(f),
  'selfref alone': (f) => selfref(f),
  'structure + selfref': (f) => (structure(f) + selfref(f)) / 2,
  'min(structure, selfref)': (f) => Math.min(structure(f), selfref(f)),
});

/**
 * Spearman rank correlation between a predictor and measured capability.
 *
 * Rank, not Pearson, because the question is "does it order the folds correctly" — nobody claims the
 * formula is in units of surviving parts, only that a higher score means a deeper fold.
 */
export function spearman(xs, ys) {
  const n = xs.length;
  if (n < 2) return null;
  const rank = (v) => {
    const idx = v.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]);
    const r = new Array(n);
    for (let i = 0; i < n;) {
      let j = i;
      while (j + 1 < n && idx[j + 1][0] === idx[i][0]) j++;
      const avg = (i + j) / 2 + 1;                       // ties share the average rank
      for (let k = i; k <= j; k++) r[idx[k][1]] = avg;
      i = j + 1;
    }
    return r;
  };
  const rx = rank(xs), ry = rank(ys);
  const mx = rx.reduce((a, b) => a + b, 0) / n, my = ry.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const a = rx[i] - mx, b = ry[i] - my;
    num += a * b; dx += a * a; dy += b * b;
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : 0;
}

export default {
  VERSION, PHI, KAPPA, LADDER, TOTAL_PARTS, PREDICTORS, STRATEGIES,
  makeFold, acquire, selfFold, structure, selfref, integration, caught,
  rng, trial, measure, flat, geometric, merged, spearman,
};
