# <Level Name> QA Checklist

## Metadata

- levelId: `<level_id>`
- status: `draft`

## 1. Spec Gate

- [ ] PRD, scene doc, and level spec agree on the same gameplay loop.
- [ ] Input mapping is explicit for keyboard and pointer.
- [ ] Pass threshold and scoring rules are frozen.

## 2. Visual Gate

- [ ] Correct background is used in each phase.
- [ ] Actors stand on the correct side and face the correct direction.
- [ ] Dialogue bubbles follow the actor and stay outside the body silhouette.
- [ ] Bubble text wraps without clipping or overflow.
- [ ] No UI element blocks core acting poses.

## 3. Audio Gate

- [ ] Dialogue / teaching BGM does not restart on each line advance.
- [ ] Practice phase switches to practice rhythm audio.
- [ ] Exam phase switches to exam rhythm audio.
- [ ] Audio timing matches the playable beat.

## 4. Gameplay Gate

- [ ] Free training exits only at the intended count.
- [ ] Practice requires the configured pass threshold.
- [ ] Exam note sequence matches the spec.
- [ ] Score, combo, and rating produce expected results.

## 5. Engineering Gate

- [ ] Relevant automated tests were added first and now pass.
- [ ] Typecheck passes.
- [ ] Build passes.
- [ ] Manual playthrough was completed end to end.
- [ ] Commit message includes a clear reason.
