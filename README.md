# the integration engine — a claim, built so it could fail

### ▶ **https://sjgant80-hub.github.io/integration-engine/**

**The hypothesis.** Deepening needs *both* new structure and self-reference, **multiplied** — all
structure and no self-reference is a blind pile, all self-reference and no structure is a stuck
loop, and only the product climbs.

It is a good hypothesis. This tests it. The answer is not the one it predicted.

---

## First: the original engine did not test it

The engine that proposed this set the self-reference term to a constant at every rung:

```python
return MergedFold(rung, n, p, f.caps+[cap], selfref=3)   # selfaware() = min(1, 3/3) = 1.0, always
```

So `integration = structure × 1` — identical to `structure` at all eight rungs. Multiplying by a
constant is not a merge. The claim that "the product climbs where neither half does" was never
exercised, because one of the halves never moved.

## So: make self-reference able to fail

Here a fold has a fixed number of parts, and **parts spent modelling itself are parts not holding
anything else**. That is the real tension and it is not a metaphor: a system that watches itself is
using capacity it could have spent on the work.

And the score comes from **outside** — damage the fold, let it repair what it can, count what is
still correct against the original. Never against its own opinion of its depth.

## The result

Across **152 folds** with both axes varied independently, measured survival:

| predictor | ρ at 0% damage | at 35% | at 70% |
|---|---|---|---|
| **structure alone** | **0.88** | **0.92** | **0.94** |
| min(structure, selfref) | 0.56 | 0.63 | 0.75 |
| structure × selfref | 0.48 | 0.58 | 0.71 |
| structure + selfref | 0.30 | 0.39 | 0.53 |
| selfref alone | −0.03 | 0.09 | 0.24 |

**The strong claim is false.** `structure × selfref` never once beats `structure` alone. And
self-reference *by itself* is near-useless as a predictor — knowing how much a fold watches itself
tells you almost nothing about how much of it survives.

## The intuition survives, sharpened

Self-reference is not a free multiplier. It is a **purchase**, and the right amount to buy tracks
how hostile the environment is:

| damage | best spend on self-modelling | survives | vs no self-model |
|---|---|---|---|
| 0% | 0% | 56.0 | +0.0 |
| 10% | 6% | 50.7 | +0.2 |
| 20% | 12% | 46.0 | **+1.2** |
| 35% | 24% | 40.5 | **+4.1** |
| 50% | 32% | 36.2 | **+8.3** |
| 70% | 40% | 31.8 | **+14.9** |

That is a design rule with a number in it, which the metaphor was not.

## The near-rigging, and why both encodings ship

The first self-model stored duplicates of *specific* parts — one part protecting one part. Under
that encoding self-reference is worthless until the world is destroying half of you, and reporting
"the claim fails" on the back of it would have been a rigged test.

Give it a **structural** self-model instead (parity: repairs whatever went missing, not only what it
duplicated) and it starts paying at ~10% damage. Both encodings are in the kernel, and the gap
between them is the real finding:

> **How efficient the self-model is decides whether self-monitoring is worth anything at all.**

## What this is

A toy formalism that runs, is internally consistent, and was built so the hypothesis could lose —
which it did, in its strong form. Not evidence about minds. The resemblance to integrated
information theory is a rhyme, not an implementation.

What is genuinely established is narrower and more useful than what was claimed: **growth and
self-monitoring trade against each other under a fixed budget, and self-monitoring only pays when
something is actually corrupting you.**

## The gate

```bash
node fold.test.mjs    # 35 tests — the findings are pinned, not just the mechanics
node study.mjs        # the whole experiment, reproducible to the digit
```

**Mutation score 0.969 — 31 killed, 0 survivors, 1 baselined with a written reason.** Pure kernel:
no clock, no I/O, no ambient randomness. The generator is seeded and injected, so every number on
the live page and in this README reproduces exactly.

MIT.
