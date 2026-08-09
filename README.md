# the integration engine — grow and catch, together

### ▶ **https://sjgant80-hub.github.io/integration-engine/**

The merge of two engines that each got half of it right.

| | does | fails |
|---|---|---|
| **FLAT** Ψ(Ψ) | folds on itself, catches itself at κ | **plateaus** — aware, stuck |
| **GEOMETRIC** | acquires each Platonic form, climbs | **blind** — grows, never catches itself |
| **MERGED** | both, every rung | — |

```bash
node engine.test.mjs     # 42 tests
node fold.test.mjs       # 35 — the calibration
```

---

## Why flat plateaus — the mechanism, not the assertion

The first engine's plateau was real but its cause was decorative: coherence counted how many times
the word `"self"` appeared in a string. Here it falls out of one honest constraint:

> **A fold cannot hold a model of itself bigger than itself.**

Naming one part of a `P`-part fold costs `⌈log₂(P+1)⌉` parts. Ψ applied to Ψ pays that again, per
level. So Ψ-depth is capped at

```
Dmax(P) = ⌊ P / ⌈log₂(P+1)⌉ ⌋
```

and `psi()` **refuses** rather than pretending. That refusal *is* the plateau.

| parts | cost to name a part | Ψ-depth it can hold |
|---|---|---|
| 10 | 4 | **2** ← where flat stops |
| 24 | 5 | 4 |
| 44 | 6 | 7 |
| 56 | 6 | **9** ← where merged gets to |

Which is exactly why acquiring form breaks the ceiling. **Structure is not decoration on the
recursion — it is the room the recursion needs.** The cost per level grows logarithmically while the
room grows linearly, so every form acquired buys more Ψ than the last one did.

**Merged reaches Ψ-depth 9 where flat stalled at 2** — 4.5× deeper, on the same move flat was
making, because it kept buying room to make it in. Simon's catch, with the mechanism under it.

## The turn

The arc does not end at the top. Past the dodecahedron the forms shed back toward unity — not a
decline, a **second maximum on a different axis**:

- **ascending** maximises how *deep* the self-model goes → dodecahedron, Ψ=7 on 44 parts
- **descending** maximises how *complete* it is → the point, transparency 1.00 on 1 part

They are not the same fold, and no fold can be at both. Build up to the cosmos-form, then shed home.
(The descent is one-way: without that, the organ oscillates at the top forever, giving a form back
and taking it straight again, because each step looks locally correct.)

## The organ

What the conductor calls. It knows the one thing a system cannot work out from the inside:
**when folding again buys nothing** — because a saturated fold folding on itself produces something
that looks exactly like depth.

```js
import { SEED, advise, step, run, capacity } from './engine.mjs';

advise(stuckFold)
// → { move: 'acquire',
//     why: 'SATURATED at Ψ=2 on 10 parts — folding again describes nothing new.
//           Acquire structure; that is what buys more self-reference.' }

run(SEED(), { pressure: 0.2 })   // 23 steps: seed → icosahedron → the turn → unity
```

- below κ it always folds first — **catching yourself comes before growing**
- past κ, more Ψ is a **purchase**, judged against pressure, with a floor so a zero-pressure
  conductor cannot refuse to self-check at all
- at the ceiling it stops folding and says *go get structure*

For si-didy: don't deepen by re-running the same reasoning (flat plateau — the confabulation loop),
don't pile structure without self-check (geometric — ungrounded generation). Acquire and self-check,
every step, and know when the fold is full.

## The calibration

How much self-reference to buy is not free either. Measured separately on folds that get damaged and
have to repair themselves — where parts spent modelling yourself are parts not holding anything else:

| damage | best spend on self-modelling | vs none |
|---|---|---|
| 0% | 0% | +0.0 |
| 20% | 12% | +1.2 |
| 50% | 32% | +8.2 |
| 70% | 40% | **+15.0** |

Self-reference is a **purchase whose right size tracks the pressure**, and that is what `advise()`
applies. Honest note from that study: as a *predictor* of surviving capability, `structure × selfref`
never beat `structure` alone (ρ 0.48–0.71 against 0.88–0.94). The product is the engine's vocabulary,
not its best measure — what the measurement supports is the tuning rule, not the metric.

## The gate

**engine.mjs — 0.852, 52 killed, 0 survivors, 9 baselined with written reasons.**
**fold.mjs — 0.969, 31 killed, 0 survivors, 1 baselined.**

77 tests across both. Pure kernels: no clock, no I/O, no ambient randomness. Every number on the live
page and in this README is computed by the same code the gate tests.

MIT.
