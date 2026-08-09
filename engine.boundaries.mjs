// engine.boundaries.mjs — every edge in the organ, pinned to a case sitting exactly on it.
//
// An engine about thresholds is thresholds all the way down: where Ψ runs out of room, where κ is
// crossed, where the arc turns. Witness produced a surviving mutant for each, and every one of them
// is a fold judged one level off.
import assert from 'node:assert/strict';
import {
  LADDER, FULL, KAPPA, SEED, makeFold, acquire, psi, shedForm, maxPsi, nameCost, modelCost,
  transparency, caught, selfaware, flat, merged, arc, turn, advise, step, run,
} from './engine.mjs';

const build = (rungs) => { let f = SEED(); for (let r = 0; r < rungs; r++) f = acquire(f, r); return f; };
const last = (a) => a[a.length - 1];

export function boundaries(t) {
  t('the ladder bound is exact — the last rung works, one past it is nothing', () => {
    assert.ok(acquire(SEED(), LADDER.length - 1), 'the last rung exists');
    assert.equal(acquire(SEED(), LADDER.length), null, 'and one past it does not');
  });

  t('rung 0 is a FORM, not unity — unity is below the ladder', () => {
    let f = build(2);                       // rung 1, the line
    f = shedForm(f);
    assert.equal(f.rung, 0);
    assert.equal(f.shape, 'point', 'rung 0 is the point; only rung -1 is unity');
    assert.equal(shedForm(f).shape, 'unity');
    assert.equal(shedForm(f).rung, -1);
  });

  t('κ is INCLUSIVE — exactly at the threshold the fold has caught itself', () => {
    // constructed to land precisely on κ: selfaware = psiDepth / maxPsi
    assert.equal(caught({ parts: 1, psiDepth: KAPPA, caps: [] }), true, 'maxPsi(1) is 1, so Ψ=κ IS κ');
    assert.equal(caught({ parts: 1, psiDepth: KAPPA * 0.999, caps: [] }), false);
  });

  t('a fold with no parts is transparent about having nothing, not NaN', () => {
    assert.equal(transparency(SEED()), 0);
    assert.equal(nameCost(0), 0);
    assert.equal(modelCost(0, 5), 0);
    assert.ok(Number.isFinite(transparency(makeFold({ parts: 0, psiDepth: 3 }))));
  });

  t('the shed branch fires at rung 0 too — the last form is still a form to give back', () => {
    const atZero = makeFold({ rung: 0, shape: 'point', parts: 1, caps: [LADDER[0].cap] });
    const a = advise(atZero);
    assert.notEqual(a.move, 'rest', 'there is still one form held, so it is not yet home');
    assert.equal(advise(makeFold({ rung: -1, phase: 'shed', parts: 1 })).move, 'rest');
  });

  t('the shed counter counts sheds, up', () => {
    let f = build(3);
    assert.equal(f.shed, 0);
    f = shedForm(f);
    assert.equal(f.shed, 1);
    assert.equal(shedForm(f).shed, 2, 'each form given back is one more shed, not one fewer');
  });

  t('with NO room, Ψ is never advised — not even to cross κ', () => {
    const stuck = psi(psi(build(4)));                    // Ψ at its ceiling on 10 parts
    assert.equal(maxPsi(stuck.parts) - stuck.psiDepth, 0);
    assert.notEqual(advise(stuck, { pressure: 1 }).move, 'psi', 'advising a fold to do the impossible is worse than useless');
    const uncaught = makeFold({ rung: 0, shape: 'point', parts: 1, caps: [LADDER[0].cap], psiDepth: 1 });
    assert.equal(maxPsi(uncaught.parts) - uncaught.psiDepth, 0);
    assert.notEqual(advise(uncaught).move, 'psi');
  });

  t('saturation must be EXACT to send the fold looking for structure', () => {
    const oneLeft = psi(build(5));                       // 18 parts, maxPsi 3, Ψ=1 → room 2
    assert.ok(maxPsi(oneLeft.parts) - oneLeft.psiDepth > 0);
    assert.ok(!/SATURATED/.test(advise(oneLeft, { pressure: 1 }).why), 'room left is not saturation');
    const full = psi(psi(psi(build(5))));
    assert.equal(maxPsi(full.parts) - full.psiDepth, 0);
    assert.match(advise(full, { pressure: 1 }).why, /SATURATED/);
  });

  t('there is a FLOOR under pressure — zero and 0.3 buy the same, 0.9 buys more', () => {
    // Past κ, depth is a purchase judged against pressure. But the floor stops a zero-pressure
    // conductor from refusing to self-check at all, which is the ungrounded-generation failure — so
    // any pressure below 0.3 is treated as 0.3, and these two must be indistinguishable.
    let f = build(LADDER.length);
    for (let i = 0; i < 6; i++) f = psi(f);              // Ψ=6/9, just past κ
    assert.equal(caught(f), true);
    assert.equal(advise(f, { pressure: 0 }).move, advise(f, { pressure: 0.3 }).move,
      'below the floor, pressure makes no difference — that IS the floor');
    assert.equal(advise(f, { pressure: 0 }).move, 'shed');
    assert.equal(advise(f, { pressure: 0.9 }).move, 'psi', 'and above it, pressure buys depth');
  });

  t('the loops run exactly as many times as asked', () => {
    assert.equal(flat({ rungs: 3 }).length, 3);
    assert.equal(flat({ rungs: 1 }).length, 1);
    assert.equal(flat({ rungs: 0 }).length, 0);
    assert.equal(merged().length, LADDER.length);
    // depth 0 means take NO Ψ room at all — the geometric climb, expressed through the merged engine
    assert.ok(merged({ depth: 0 }).every(s => s.fold.psiDepth === 0), 'depth 0 buys nothing');
    assert.equal(last(merged({ depth: 1 })).fold.psiDepth, maxPsi(FULL));
  });

  t('the deepest fold is the FIRST to reach that depth, and the clearest the SMALLEST', () => {
    const tt = turn(arc());
    // the dodecahedron reaches Ψ=7 on the way up and again on the way down; the ascent is the answer
    assert.equal(tt.deepest.phase, 'ascend', 'the first time it got there is the one that counts');
    // point and triangle both hit transparency 1.00 — the smaller one wins
    assert.equal(tt.clearest.transparency, 1);
    assert.equal(tt.clearest.parts, 1, 'ties on transparency break toward the smaller fold');
  });

  t('turn survives a path with nothing in it', () => {
    const empty = turn([]);
    assert.equal(empty.deepest, null);
    assert.equal(empty.clearest, null);
    assert.equal(empty.sameFold, false, 'no folds cannot be the same fold');
  });

  t('turn breaks TIES the way it says — first to the depth, smallest to the clarity', () => {
    // The real arc reaches its maximum once, so ties never arise on it and the tie-break rules go
    // unexercised. Fed a path that does tie, they have to be right.
    const f = (parts, psiDepth, tag) => ({ fold: makeFold({ rung: 0, shape: tag, parts, psiDepth, caps: [LADDER[0].cap] }), phase: tag });
    const tied = turn([f(6, 2, 'first'), f(6, 2, 'second')]);
    assert.equal(tied.deepest.phase, 'first', 'the FIRST fold to reach the depth is the one that counts');
    const sizes = turn([f(6, 2, 'big'), f(3, 1, 'small')]);
    assert.equal(sizes.clearest.parts, 6, 'and among equal transparency the smaller wins — here 6 is the only 1.00');
  });

  t('the merged engine spends exactly the room it was told to, in both climbs', () => {
    assert.ok(merged({ depth: 0 }).every(s => s.fold.psiDepth === 0), 'depth 0 spends nothing');
    assert.ok(arc({ depth: 0 }).filter(s => s.phase === 'ascend').every(s => s.fold.psiDepth === 0),
      'and the arc obeys the same dial on the way up');
    assert.equal(last(arc({ depth: 1 }).filter(s => s.phase === 'ascend')).fold.psiDepth, 7,
      'at full depth the peak holds seven levels, not eight');
  });

  t('a fold with ROOM LEFT is told to grow, and is not told it is saturated', () => {
    let f = build(5);                                    // 18 parts, maxPsi 3
    f = psi(psi(f));                                     // Ψ=2/3 — past κ, one level of room left
    assert.equal(caught(f), true);
    assert.ok(maxPsi(f.parts) - f.psiDepth > 0, 'the fixture must genuinely have room');
    const a = advise(f, { pressure: 0 });
    assert.equal(a.move, 'acquire');
    assert.ok(!/SATURATED/.test(a.why), `it is not saturated, so it must not be told it is: "${a.why}"`);
  });

  t('run stops the moment it rests, and never spins on a move that changes nothing', () => {
    const r = run(SEED(), { budget: 200 });
    assert.equal(last(r.trace).move, 'rest');
    assert.equal(r.trace.filter(s => s.move === 'rest').length, 1, 'it rests once and stops, not repeatedly');
    // a fold already at unity rests immediately
    const home = run(makeFold({ rung: -1, phase: 'shed', parts: 1 }), { budget: 10 });
    assert.equal(home.trace.length, 1);
  });
}
