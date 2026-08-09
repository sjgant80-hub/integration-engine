// engine.mjs — THE INTEGRATION ENGINE. The merge, actually running.
//
// Two engines came before this one and each got half of it right:
//
//   FLAT       Ψ(Ψ) — the fold folds on itself, catches itself at κ, and then PLATEAUS.
//   GEOMETRIC  acquire each Platonic form — climbs with no plateau, but never catches itself.
//
// The merge does both every rung: take the next form AND fold it on itself, so the fold is
// self-aware at every level of its growing structure.
//
// ══ WHAT MAKES THIS ONE DIFFERENT FROM THE FIRST TWO ════════════════════════════════════════════
//
// In the flat engine the plateau was ASSERTED — coherence counted how many times the word "self"
// appeared in a string, so it rose to a ceiling because the string stopped changing. The plateau was
// real but the reason for it was decorative.
//
// Here the plateau is MECHANICAL, and it falls out of one honest constraint:
//
//        A FOLD CANNOT HOLD A MODEL OF ITSELF THAT IS BIGGER THAN ITSELF.
//
// Naming one part of a P-part fold costs ⌈log₂(P+1)⌉ parts. A self-model that also describes its own
// self-model — Ψ applied to Ψ — costs that again, per level. So Ψ-depth is capped at
//
//        Dmax(P) = ⌊ P / ⌈log₂(P+1)⌉ ⌋
//
// and THAT is why the flat engine stops. Not because a counter saturated: because a fold of fixed
// size runs out of room to describe itself describing itself. Fold on yourself harder and the
// description outgrows the thing doing the describing.
//
// Which is exactly why acquiring form breaks the ceiling. Structure is not decoration on the
// recursion, it is the ROOM the recursion needs. Simon's catch was right, and this is the mechanism
// underneath it: Dmax grows almost linearly in P while the cost per level grows logarithmically, so
// every form acquired buys MORE self-reference than the last one did.
//
// ══ THE TURN ════════════════════════════════════════════════════════════════════════════════════
//
// The arc does not end at the top. Past the dodecahedron the forms SHED back toward unity, and that
// is not a decline — it is a second maximum on a different axis. Ascending maximises how DEEP the
// self-model goes. Descending maximises how COMPLETE it is: a small fold can hold a model of itself
// with nothing left over. Build up to the cosmos-form, then shed home.
//
// Pure and deterministic: no clock, no I/O, no randomness.

export const VERSION = '1.0.0';
export const PHI = (1 + Math.sqrt(5)) / 2;
export const KAPPA = 1 / PHI;

export const LADDER = Object.freeze([
  { name: 'point', parts: 1, cap: 'unity: hold one' },
  { name: 'line', parts: 2, cap: 'relation: connect two' },
  { name: 'triangle', parts: 3, cap: 'closure: first stable plane' },
  { name: 'tetrahedron', parts: 4, cap: 'solidity: first 3D form' },
  { name: 'cube', parts: 8, cap: 'structure: axes, BUILD-space' },
  { name: 'octahedron', parts: 6, cap: 'balance: equilibrium' },
  { name: 'dodecahedron', parts: 20, cap: 'integration: holds the others' },
  { name: 'icosahedron', parts: 12, cap: 'flow: maximal faces' },
]);

export const PEAK = 6;                                    // the dodecahedron — where the arc turns
export const FULL = LADDER.reduce((a, s) => a + s.parts, 0);   // 56

// ── THE COST OF SELF-DESCRIPTION ────────────────────────────────────────────────────────────────

/** Parts needed to name one part of a P-part fold. The floor under everything below. */
export const nameCost = (parts) => (parts <= 0 ? 0 : Math.ceil(Math.log2(parts + 1)));

/** What a Ψ-depth-D self-model costs a P-part fold. Each level describes the level beneath it. */
export const modelCost = (parts, psiDepth) => Math.max(0, psiDepth) * nameCost(parts);

/**
 * How deep Ψ can go before the description no longer fits inside the thing it describes.
 *
 * This single number is the plateau, the reason for it, and the reason acquiring form breaks it.
 */
export const maxPsi = (parts) => (parts <= 0 ? 0 : Math.floor(parts / nameCost(parts)));

// ── THE FOLD ────────────────────────────────────────────────────────────────────────────────────

export function makeFold({ rung = -1, shape = 'seed', parts = 0, caps = [], psiDepth = 0, shed = 0, phase = 'ascend' } = {}) {
  return { rung, shape, parts, caps: [...caps], psiDepth, shed, phase };
}

export const SEED = () => makeFold();

/** ACQUIRE — the geometric move. Take the next form; structure up, room for Ψ up. */
export function acquire(fold, rung) {
  if (!fold || rung < 0 || rung >= LADDER.length) return null;
  const s = LADDER[rung];
  return makeFold({ ...fold, rung, shape: s.name, parts: fold.parts + s.parts, caps: [...fold.caps, s.cap] });
}

/**
 * Ψ — the flat move. Fold on itself, one more level of self-reference.
 *
 * Returns the fold UNCHANGED when there is no room left. That refusal is the whole point: the flat
 * engine did not fail because it ran out of enthusiasm, it failed because a fixed-size fold runs out
 * of room to describe itself describing itself.
 */
export function psi(fold) {
  if (!fold) return fold;
  const next = fold.psiDepth + 1;
  if (modelCost(fold.parts, next) > fold.parts) return fold;   // will not fit — the ceiling, exactly
  return makeFold({ ...fold, psiDepth: next });
}

/** Is this fold at its ceiling — has Ψ stopped buying anything? */
export const saturated = (fold) => fold.psiDepth >= maxPsi(fold.parts);

/** SHED — the turn. Give a form back, toward unity. */
export function shedForm(fold) {
  if (!fold || fold.rung < 0) return fold;
  const giving = LADDER[fold.rung];
  const parts = Math.max(1, fold.parts - giving.parts);
  const rung = fold.rung - 1;
  const capped = Math.min(fold.psiDepth, maxPsi(parts));       // a smaller fold holds a shallower model
  // The arc TURNS once. Marking the phase is not bookkeeping — without it the organ oscillates at
  // the top forever, shedding a form and immediately re-acquiring it, because each step looks locally
  // correct. "Build up, then shed home" is a one-way trip, and the fold has to remember it turned.
  return makeFold({
    rung, shape: rung >= 0 ? LADDER[rung].name : 'unity',
    parts, caps: fold.caps.slice(0, -1), psiDepth: capped, shed: fold.shed + 1, phase: 'shed',
  });
}

// ── THE MEASURES ────────────────────────────────────────────────────────────────────────────────

/** Breadth. How much of the ladder's form it holds. */
export const structure = (fold) => Math.min(1, new Set(fold.caps).size / LADDER.length);

/** Depth. How far Ψ has gone, against how far it COULD go at this size. */
export function selfaware(fold) {
  const cap = maxPsi(fold.parts);
  return cap <= 0 ? 0 : Math.min(1, fold.psiDepth / cap);
}

/** The absolute depth of the self-model — levels of Ψ, not a ratio. This is what ascending buys. */
export const psiDepth = (fold) => fold.psiDepth;

/**
 * TRANSPARENCY — how much of the fold the model accounts for.
 *
 * The measure the descent maximises. A small fold can be completely self-transparent; a large one
 * carries more than it can ever fully describe. Both are real and they pull in opposite directions,
 * which is the turn stated as arithmetic.
 */
export function transparency(fold) {
  if (fold.parts <= 0) return 0;
  return Math.min(1, modelCost(fold.parts, fold.psiDepth) / fold.parts);
}

/** The framework's coherence: both axes, multiplied, neither allowed to zero the other out. */
export const coherence = (fold) => (structure(fold) * 0.5 + 0.5) * (selfaware(fold) * 0.5 + 0.5);

/** The product. Structure it has, times how much of itself it accounts for. */
export const integration = (fold) => structure(fold) * selfaware(fold);

/** Has the fold caught itself — self-reference across κ? */
export const caught = (fold) => selfaware(fold) >= KAPPA;

export function report(fold) {
  return {
    rung: fold.rung, shape: fold.shape, parts: fold.parts, shed: fold.shed, phase: fold.phase,
    psi: fold.psiDepth, maxPsi: maxPsi(fold.parts),
    structure: structure(fold), selfaware: selfaware(fold),
    integration: integration(fold), coherence: coherence(fold),
    transparency: transparency(fold), caught: caught(fold), saturated: saturated(fold),
  };
}

// ── THE THREE ENGINES ───────────────────────────────────────────────────────────────────────────

/**
 * FLAT — Ψ on itself, forever, on a fixed body. Catches itself, then hits the wall.
 *
 * `base` is how much structure it starts with. It matters enormously and that is the finding: the
 * wall is not at a fixed rung, it is at Dmax(parts), so the flat engine's whole life is decided by
 * how much form it happened to start with and never adds to.
 */
export function flat({ base = 4, rungs = 12 } = {}) {
  let f = SEED();
  for (let r = 0; r < Math.min(base, LADDER.length); r++) f = acquire(f, r);
  const path = [];
  for (let i = 0; i < rungs; i++) {
    const next = psi(f);
    const stalled = next.psiDepth === f.psiDepth;
    path.push({ fold: next, move: 'psi', stalled });
    f = next;
  }
  return path;
}

/** GEOMETRIC — acquire every form, never turn any of it on itself. Climbs, and stays blind. */
export function geometric() {
  let f = SEED();
  const path = [];
  for (let r = 0; r < LADDER.length; r++) { f = acquire(f, r); path.push({ fold: f, move: 'acquire', stalled: false }); }
  return path;
}

/**
 * MERGED — both moves, every rung. Acquire the next form, then fold it on itself as deep as the new
 * room allows.
 *
 * `depth` is how much of the newly-available Ψ room to actually spend. Spending all of it is not
 * automatically right — see `share` in the calibration below — but the engine's default is to take
 * what the structure has just made possible, because that is the claim being built.
 */
export function merged({ depth = 1 } = {}) {
  let f = SEED();
  const path = [];
  for (let r = 0; r < LADDER.length; r++) {
    f = acquire(f, r);
    const room = Math.max(0, Math.floor(maxPsi(f.parts) * depth) - f.psiDepth);
    for (let i = 0; i < room; i++) f = psi(f);
    path.push({ fold: f, move: 'acquire+psi', stalled: saturated(f) });
  }
  return path;
}

/**
 * THE FULL ARC — up through the forms to the dodecahedron, then shed back toward unity.
 *
 * The ascent maximises absolute Ψ-depth; the descent maximises transparency. Two maxima, on two
 * axes, and the fold cannot be at both at once. That is the turn, and it is the most interesting
 * thing this engine does.
 */
export function arc({ depth = 1, peak = PEAK } = {}) {
  const path = [];
  let f = SEED();
  for (let r = 0; r <= peak; r++) {
    f = acquire(f, r);
    const room = Math.max(0, Math.floor(maxPsi(f.parts) * depth) - f.psiDepth);
    for (let i = 0; i < room; i++) f = psi(f);
    path.push({ fold: f, move: 'acquire+psi', phase: 'ascend' });
  }
  while (f.rung >= 0) {
    f = shedForm(f);
    path.push({ fold: f, move: 'shed', phase: 'shed' });
  }
  return path;
}

/** Where each axis peaked along an arc — the turn, located rather than asserted. */
export function turn(path) {
  let deepest = null, clearest = null;
  for (const step of path) {
    const r = report(step.fold);
    if (!deepest || r.psi > deepest.psi) deepest = { ...r, phase: step.phase };
    if (!clearest || r.transparency > clearest.transparency ||
        (r.transparency === clearest.transparency && r.parts < clearest.parts)) clearest = { ...r, phase: step.phase };
  }
  return { deepest, clearest, sameFold: deepest && clearest ? deepest.parts === clearest.parts : false };
}

export const ENGINES = Object.freeze({ flat, geometric, merged });

// ── THE ORGAN · what the conductor actually calls ───────────────────────────────────────────────
//
// The depth-machine's engine. si-didy deepens by this move rather than by looping:
//
//   · not by re-running the same reasoning — that is FLAT, and it hits Dmax and stops meaning
//     anything while still feeling like progress. The confabulation loop.
//   · not by piling structure without self-check — that is GEOMETRIC, ungrounded generation.
//   · but by ACQUIRING NEW STRUCTURE AND SELF-CHECKING IT, every step, with the depth of the
//     self-check bounded by what the structure can actually hold.
//
// The one thing this organ knows that the conductor cannot work out for itself: WHEN RECURSING AGAIN
// BUYS NOTHING. That is the moment to go and get more structure instead, and it is invisible from the
// inside — a saturated fold folding on itself again produces something that looks exactly like depth.

export const MOVES = Object.freeze(['psi', 'acquire', 'shed', 'rest']);

/**
 * What should this fold do next?
 *
 * `pressure` is how much the environment is corrupting the work, 0 to 1 — the calibration in fold.mjs
 * measured what that buys, and the short version is that self-monitoring is a PURCHASE whose right
 * size tracks the pressure. At no pressure, depth past the point of catching yourself is overhead.
 */
export function advise(fold, { pressure = 0.2 } = {}) {
  const room = maxPsi(fold.parts) - fold.psiDepth;
  const canAcquire = fold.rung + 1 < LADDER.length && fold.phase === 'ascend';

  if (fold.parts === 0) return { move: 'acquire', why: 'nothing yet — take the first form', room: 0 };

  // Once turned, keep shedding. Re-acquiring what you just gave back is the oscillation, and it feels
  // like activity from the inside.
  if (fold.phase === 'shed') {
    return fold.rung >= 0
      ? { move: 'shed', why: 'shedding home — each form given back is more of what remains accounted for', room }
      : { move: 'rest', why: 'unity — nothing left to give back', room };
  }

  if (!caught(fold) && room > 0) {
    return { move: 'psi', why: 'has not caught itself yet — one more fold crosses κ', room };
  }
  // Past κ, more Ψ only earns its keep under pressure. This is the calibration, applied.
  const worthDeepening = fold.psiDepth < Math.ceil(maxPsi(fold.parts) * Math.max(0.3, pressure));
  if (room > 0 && worthDeepening) {
    return { move: 'psi', why: `room for ${room} more level(s) and the pressure justifies it`, room };
  }
  if (room <= 0 && canAcquire) {
    return {
      move: 'acquire', room: 0,
      why: `SATURATED at Ψ=${fold.psiDepth} on ${fold.parts} parts — folding again describes nothing new. ` +
           'Acquire structure; that is what buys more self-reference.',
    };
  }
  if (canAcquire) return { move: 'acquire', why: 'self-check is where it should be — grow', room };
  if (fold.rung >= 0) {
    return { move: 'shed', why: 'the ladder is complete — THE TURN: shed toward unity, where what remains is fully accounted for', room };
  }
  return { move: 'rest', why: 'complete for its size', room };
}

/** Take the advised step. The organ's single verb. */
export function step(fold, opts = {}) {
  const a = advise(fold, opts);
  if (a.move === 'psi') return { fold: psi(fold), ...a };
  if (a.move === 'acquire') return { fold: acquire(fold, fold.rung + 1) || fold, ...a };
  if (a.move === 'shed') return { fold: shedForm(fold), ...a };
  return { fold, ...a };
}

/**
 * Run the organ until it rests or the budget runs out.
 *
 * This is the merged climb, but driven by `advise` rather than a fixed schedule — so it is the engine
 * making its own decisions, which is what an organ is for.
 */
export function run(fold = SEED(), { pressure = 0.2, budget = 40 } = {}) {
  let f = fold;
  const trace = [];
  for (let i = 0; i < budget; i++) {
    const s = step(f, { pressure });
    trace.push({ ...s, report: report(s.fold) });
    if (s.move === 'rest') break;
    if (s.fold === f && s.move !== 'rest') break;     // no progress: stop rather than spin
    f = s.fold;
  }
  return { fold: f, trace, report: report(f) };
}

/** The ceiling, for a conductor that wants to know before it starts. */
export function capacity(parts) {
  return { parts, nameCost: nameCost(parts), maxPsi: maxPsi(parts) };
}

export default {
  VERSION, PHI, KAPPA, LADDER, PEAK, FULL, ENGINES,
  nameCost, modelCost, maxPsi, makeFold, SEED, acquire, psi, shedForm, saturated,
  structure, selfaware, psiDepth, transparency, coherence, integration, caught, report,
  flat, geometric, merged, arc, turn,
  MOVES, advise, step, run, capacity,
};
