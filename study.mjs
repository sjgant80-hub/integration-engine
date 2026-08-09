// study.mjs — run the claim against the measurement and print whichever answer comes out.
//
// The claim: deepening needs structure AND self-reference, multiplied, because either alone stalls.
// The test: build folds by three strategies, damage them, measure how much survives, and ask which
// formula actually orders them correctly. The formula is scored against something outside itself.
import {
  LADDER, TOTAL_PARTS, KAPPA, PREDICTORS,
  flat, geometric, merged, structure, selfref, integration, caught, measure, selfFold, acquire, makeFold, spearman,
} from './fold.mjs';

const RATES = [0, 0.05, 0.1, 0.2, 0.35, 0.5, 0.7];
const pct = (x) => `${(x * 100).toFixed(0)}%`;
const f2 = (x) => x.toFixed(2);

export function climbTable(rate, { share = 0.5, seed = 7, runs = 400, code = 'parity' } = {}) {
  const paths = { flat: flat({ share }), geometric: geometric(), merged: merged({ share }) };
  const rows = [];
  for (let r = 0; r < LADDER.length; r++) {
    const row = { rung: r + 1, shape: LADDER[r].name };
    for (const [name, path] of Object.entries(paths)) {
      const f = path[r];
      row[name] = {
        structure: structure(f), selfref: selfref(f), integration: integration(f),
        capability: measure(f, rate, { seed: seed + r, runs, code }), caught: caught(f), parts: f.parts, model: f.model,
      };
    }
    rows.push(row);
  }
  return rows;
}

/** Which predictor actually orders the folds by how much of them survives? */
export function verdict({ share = 0.5, seed = 7, runs = 400, code = 'parity' } = {}) {
  const out = [];
  for (const rate of RATES) {
    const rows = climbTable(rate, { share, seed, runs, code });
    const folds = [], caps = [];
    for (const row of rows) {
      for (const s of ['flat', 'geometric', 'merged']) {
        folds.push({ structure: row[s].structure, selfref: row[s].selfref, parts: 0, model: 0 });
        caps.push(row[s].capability);
      }
    }
    const scores = {};
    for (const [name, fn] of Object.entries(PREDICTORS)) {
      // the predictors take a fold; rebuild the minimal shape they read
      const xs = folds.map(f => fn({ parts: f.structure * TOTAL_PARTS, model: 0, caps: [] }) || 0);
      // structure()/selfref() read parts+model, so evaluate them from the stored axes directly
      const direct = folds.map(f => {
        switch (name) {
          case 'structure × selfref': return f.structure * f.selfref;
          case 'structure alone': return f.structure;
          case 'selfref alone': return f.selfref;
          case 'structure + selfref': return (f.structure + f.selfref) / 2;
          case 'min(structure, selfref)': return Math.min(f.structure, f.selfref);
          default: return 0;
        }
      });
      scores[name] = spearman(direct, caps);
      void xs;
    }
    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    out.push({ rate, scores, best: best[0], bestRho: best[1] });
  }
  return out;
}

/** At a given damage rate, how much self-reference is actually worth buying? */
export function optimalShare(rate, { seed = 11, runs = 400, steps = 19, code = 'parity' } = {}) {
  let best = null;
  for (let i = 0; i <= steps; i++) {
    const share = (i / steps) * 0.9;
    const f = merged({ share })[LADDER.length - 1];
    const cap = measure(f, rate, { seed, runs, code });
    if (!best || cap > best.capability) best = { share, capability: cap, selfref: selfref(f), structure: structure(f) };
  }
  return best;
}

// ── run it ──────────────────────────────────────────────────────────────────────────────────────
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('study.mjs')) {
  console.log('═'.repeat(86));
  console.log('THE INTEGRATION ENGINE · does the product actually predict depth?');
  console.log(`${LADDER.length} rungs · ${TOTAL_PARTS} parts at the top · κ = ${KAPPA.toFixed(3)} · capability measured, not claimed`);
  console.log('═'.repeat(86));

  // 1 · the three climbs, under real damage
  for (const rate of [0.1, 0.5]) {
    console.log(`\n── THE THREE CLIMBS · ${pct(rate)} of the content damaged ──`);
    console.log('rung shape          FLAT (aware, stuck)     GEOMETRIC (grows, blind)  MERGED (both)');
    console.log('                    str  self  cap          str  self  cap           str  self  cap');
    for (const row of climbTable(rate)) {
      const cell = (c) => `${f2(c.structure)} ${f2(c.selfref)} ${String(Math.round(c.capability)).padStart(4)}`;
      console.log(`${String(row.rung).padStart(3)}  ${row.shape.padEnd(13)} ${cell(row.flat)}        ` +
                  `${cell(row.geometric)}         ${cell(row.merged)}`);
    }
  }

  // 2 · who wins, and where
  console.log('\n── WHO ACTUALLY SURVIVES, at the top of the ladder ──');
  console.log('damage   flat   geometric   merged   winner');
  for (const rate of RATES) {
    const rows = climbTable(rate);
    const top = rows[rows.length - 1];
    const caps = { flat: top.flat.capability, geometric: top.geometric.capability, merged: top.merged.capability };
    const win = Object.entries(caps).sort((a, b) => b[1] - a[1])[0][0];
    console.log(`${pct(rate).padStart(6)}  ${f2(caps.flat).padStart(5)}  ${f2(caps.geometric).padStart(9)}  ${f2(caps.merged).padStart(7)}   ${win}`);
  }

  // 3 · the actual question
  console.log('\n── WHICH FORMULA PREDICTS CAPABILITY? (Spearman ρ against measured survival) ──');
  const v = verdict();
  const names = Object.keys(PREDICTORS);
  console.log('damage  ' + names.map(n => n.padStart(22)).join(''));
  for (const row of v) {
    console.log(pct(row.rate).padStart(6) + '  ' + names.map(n => f2(row.scores[n]).padStart(22)).join(''));
  }
  console.log('\nbest predictor by damage rate:');
  for (const row of v) console.log(`  ${pct(row.rate).padStart(4)}  ${row.best}  (ρ ${f2(row.bestRho)})`);

  // 4 · how much self-reference is worth buying
  console.log('\n── HOW MUCH SELF-REFERENCE IS WORTH BUYING ──');
  console.log('damage   best share   its selfref   capability');
  for (const rate of RATES) {
    const o = optimalShare(rate);
    console.log(`${pct(rate).padStart(6)}  ${pct(o.share).padStart(10)}  ${f2(o.selfref).padStart(12)}  ${f2(o.capability).padStart(11)}`);
  }
  console.log('\n' + '═'.repeat(86));
}
