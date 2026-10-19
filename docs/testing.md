# Testing — verification evidence

PharmaGO's core logic is tested automatically with **Vitest**, and the health warning is also
tested as a rendered component with **React Testing Library**. Every test that proves an
acceptance criterion is named after it (for example `US1-AC2: …`), so a test run can be read
directly as evidence.

The logic under test lives in plain functions, not inside page components, and the pages call
these same functions:

| Function                                            | File                 | Used by                                           |
| --------------------------------------------------- | -------------------- | ------------------------------------------------- |
| `compareOptions(offers, medicineId, sort, filters)` | `src/lib/pricing.ts` | Options page (`/compare/:id`)                     |
| `bestOffer(offers, medicineId)`, `cheapestOffer(…)` | `src/lib/pricing.ts` | medicine page, medicine cards, "Best price" badge |
| `orderTotals(items, method)`                        | `src/lib/pricing.ts` | cart, checkout                                    |
| `getWarnings(medicine, conditions)`                 | `src/lib/health.ts`  | `HealthWarning` component on the medicine page    |

## User stories → acceptance criteria → tests

**US1** — As an elderly user, I want to see the same medicine in different pharmacies, so that I
can buy it at the lowest price.

**US2** — As a user with diabetes, I want to be warned about medicines that are not safe for me,
so that I don't buy the wrong one.

| Story | Acceptance criterion                                                                            | Test (file › name)                                                                                                       | Status  |
| ----- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------- |
| US1   | **AC1** "Browse other options" shows at least 3 pharmacies with their prices for every medicine | `price-comparison.test.ts` › US1-AC1: every medicine is offered by at least 3 pharmacies, each with a price              | ✅ Pass |
| US1   | **AC2** With "Cheapest" selected, the pharmacy with the lowest price is shown first             | `price-comparison.test.ts` › US1-AC2: with Cheapest selected, the lowest price is shown first                            | ✅ Pass |
| US1   | **AC2** (example from the design)                                                               | `price-comparison.test.ts` › US1-AC2: cheapest offer is first for Fanigan (Sog'lom Plus, 31,500 sum)                     | ✅ Pass |
| US1   | **AC3** For Fanigan the best match pharmacy is Horoshiy Pharm                                   | `price-comparison.test.ts` › US1-AC3: the best match pharmacy for Fanigan is Horoshiy Pharm                              | ✅ Pass |
| US2   | **AC1** With "Diabetes" ticked, Teraflu shows "Not recommended for you" with the reason         | `health.test.ts` › US2-AC1: with Diabetes ticked, Teraflu is flagged with the reason                                     | ✅ Pass |
| US2   | **AC1** (rendered UI)                                                                           | `health-warning.test.tsx` › US2-AC1: shows 'Not recommended for you' with the reason for Teraflu when Diabetes is ticked | ✅ Pass |
| US2   | **AC2** With no conditions ticked, the warning is not shown                                     | `health.test.ts` › US2-AC2: with no conditions ticked, Teraflu is not flagged                                            | ✅ Pass |
| US2   | **AC2** (rendered UI)                                                                           | `health-warning.test.tsx` › US2-AC2: shows no warning for Teraflu when no conditions are ticked                          | ✅ Pass |

### Supporting tests

| Area          | Test (file › name)                                                                                                                                                                | Status  |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Out of stock  | `price-comparison.test.ts` › out-of-stock offers are excluded from best match and cheapest                                                                                        | ✅ Pass |
| Out of stock  | `price-comparison.test.ts` › out-of-stock offers are listed last on the Options page                                                                                              | ✅ Pass |
| Out of stock  | `price-comparison.test.ts` › returns no best match when no pharmacy has the medicine in stock                                                                                     | ✅ Pass |
| Sorting       | `price-comparison.test.ts` › Closest sorts pharmacies by distance                                                                                                                 | ✅ Pass |
| Filters       | `price-comparison.test.ts` › Free delivery filter keeps only pharmacies with free delivery                                                                                        | ✅ Pass |
| Filters       | `price-comparison.test.ts` › 24/7 filter keeps only pharmacies open 24/7                                                                                                          | ✅ Pass |
| Filters       | `price-comparison.test.ts` › filters combine: free delivery and 24/7 together can leave no pharmacy                                                                               | ✅ Pass |
| Totals        | `price-comparison.test.ts` › adds the drone fee (15,000 sum) to the subtotal                                                                                                      | ✅ Pass |
| Totals        | `price-comparison.test.ts` › adds the courier fee (10,000 sum) to the subtotal                                                                                                    | ✅ Pass |
| Totals        | `price-comparison.test.ts` › charges no delivery for an empty order                                                                                                               | ✅ Pass |
| Health        | `health.test.ts` › does not flag Teraflu for an unrelated condition (asthma)                                                                                                      | ✅ Pass |
| Health        | `health.test.ts` › lists every matching condition when several are ticked                                                                                                         | ✅ Pass |
| Health        | `health.test.ts` › only reports conditions the medicine conflicts with (Fanigan: ulcer, kidney, asthma but not diabetes)                                                          | ✅ Pass |
| Best match    | `pricing.test.ts` › lets price outweigh distance; sorts scores best first                                                                                                         | ✅ Pass |
| Demo data     | `data.test.ts` › 6 consistency checks (offers, unique prices, design values, sum format, box colours)                                                                             | ✅ Pass |
| Routing       | `app-routing.test.tsx` › matches a page for / instead of falling back to not found                                                                                                | ✅ Pass |
| Privacy       | `privacy.test.ts` › consent rule (4 tests) and delete my data (3 tests) — see `docs/security.md`                                                                                  | ✅ Pass |
| Privacy       | `privacy-store.test.tsx` › consent, logout and delete my data checked against the real store and `localStorage` (4 tests)                                                         | ✅ Pass |
| Medicine page | `pricing.test.ts` › same medicine in other pharmacies: sorted cheapest first, difference sign, Lowest price / Best match badges, pack size, nothing to save when already cheapest | ✅ Pass |
| Demo data     | `data.test.ts` › every medicine in ≥ 4 pharmacies with ≥ 3 prices; cheaper and dearer than the best match (5–25%)                                                                 | ✅ Pass |

**Do the tests really catch bugs?** As a check, we broke the code on purpose (reversed the
"Cheapest" sort and switched off the health check). The US1-AC2 and US2-AC1 tests then failed,
and passed again once the code was restored.

## How to run the tests

```sh
npm install                          # once
npm test                             # run all tests once
npm test -- --reporter=verbose       # list every test by name (output below)
npm run test:watch                   # re-run on every file change while developing
```

**Continuous integration:** `.github/workflows/ci.yml` runs `npm ci`, `npm test` and
`npm run build` on GitHub Actions for every push to `main`. Each commit shows a green check (✓)
or a red cross (✗) on GitHub; the runs are listed under the repository's **Actions** tab.

## Latest test run

Local run on 17 October 2026 (Windows 11, Node 24.14.0, npm 11.9.0), command
`npm test -- --reporter=verbose` (timings removed):

```text
 RUN  v4.1.12

 ✓ src/test/pricing.test.ts > best match scoring > sorts scores best first
 ✓ src/test/health.test.ts > US2: health warnings (getWarnings) > US2-AC1: with Diabetes ticked, Teraflu is flagged with the reason
 ✓ src/test/health.test.ts > US2: health warnings (getWarnings) > US2-AC2: with no conditions ticked, Teraflu is not flagged
 ✓ src/test/health.test.ts > US2: health warnings (getWarnings) > does not flag Teraflu for an unrelated condition (asthma)
 ✓ src/test/health.test.ts > US2: health warnings (getWarnings) > lists every matching condition when several are ticked
 ✓ src/test/health.test.ts > US2: health warnings (getWarnings) > only reports conditions the medicine conflicts with (Fanigan: ulcer, kidney, asthma but not diabetes)
 ✓ src/test/data.test.ts > demo data > gives every medicine at least one offer
 ✓ src/test/data.test.ts > demo data > only has offers for known medicines and pharmacies, at most one per pair
 ✓ src/test/data.test.ts > demo data > has different prices across pharmacies for the same medicine
 ✓ src/test/data.test.ts > demo data > matches the design's Fanigan offer at Horoshiy Pharm
 ✓ src/test/data.test.ts > demo data > formats prices in sum
 ✓ src/test/data.test.ts > demo data > gives every medicine without a photo its own box colour
 ✓ src/test/price-comparison.test.ts > US1: compare the same medicine across pharmacies > US1-AC1: every medicine is offered by at least 3 pharmacies, each with a price
 ✓ src/test/price-comparison.test.ts > US1: compare the same medicine across pharmacies > US1-AC2: with Cheapest selected, the lowest price is shown first
 ✓ src/test/price-comparison.test.ts > US1: compare the same medicine across pharmacies > US1-AC2: cheapest offer is first for Fanigan (Sog'lom Plus, 31,500 sum)
 ✓ src/test/price-comparison.test.ts > US1: compare the same medicine across pharmacies > US1-AC3: the best match pharmacy for Fanigan is Horoshiy Pharm
 ✓ src/test/price-comparison.test.ts > price comparison details > out-of-stock offers are excluded from best match and cheapest
 ✓ src/test/price-comparison.test.ts > price comparison details > out-of-stock offers are listed last on the Options page
 ✓ src/test/price-comparison.test.ts > price comparison details > returns no best match when no pharmacy has the medicine in stock
 ✓ src/test/price-comparison.test.ts > price comparison details > Closest sorts pharmacies by distance
 ✓ src/test/price-comparison.test.ts > price comparison details > Free delivery filter keeps only pharmacies with free delivery
 ✓ src/test/price-comparison.test.ts > price comparison details > 24/7 filter keeps only pharmacies open 24/7
 ✓ src/test/price-comparison.test.ts > price comparison details > filters combine: free delivery and 24/7 together can leave no pharmacy
 ✓ src/test/price-comparison.test.ts > order totals > adds the drone fee (15,000 sum) to the subtotal
 ✓ src/test/price-comparison.test.ts > order totals > adds the courier fee (10,000 sum) to the subtotal
 ✓ src/test/price-comparison.test.ts > order totals > charges no delivery for an empty order
 ✓ src/test/privacy-store.test.tsx > store privacy behaviour > does not save health conditions when the user did not consent
 ✓ src/test/privacy-store.test.tsx > store privacy behaviour > saves health conditions when the user consented
 ✓ src/test/privacy-store.test.tsx > store privacy behaviour > log out removes the health conditions from storage
 ✓ src/test/privacy-store.test.tsx > store privacy behaviour > delete my data removes everything PharmaGO stored and does not write it back
 ✓ src/test/health-warning.test.tsx > US2: HealthWarning component > US2-AC1: shows 'Not recommended for you' with the reason for Teraflu when Diabetes is ticked
 ✓ src/test/health-warning.test.tsx > US2: HealthWarning component > US2-AC2: shows no warning for Teraflu when no conditions are ticked
 ✓ src/test/app-routing.test.tsx > App routing > matches a page for / instead of falling back to not found
 ✓ src/test/privacy.test.ts > consent rule > does not save health conditions without consent
 ✓ src/test/privacy.test.ts > consent rule > saves health conditions with consent
 ✓ src/test/privacy.test.ts > consent rule > drops conditions from a saved user who never gave consent
 ✓ src/test/privacy.test.ts > consent rule > keeps conditions for a user who gave consent
 ✓ src/test/privacy.test.ts > delete my data > removes every key PharmaGO stored and nothing else
 ✓ src/test/privacy.test.ts > delete my data > does nothing when there is no data
 ✓ src/test/privacy.test.ts > delete my data > removes data left by older app versions on load, but keeps the current data

✓ src/test/pricing.test.ts > best match scoring > lets price outweigh distance
 Test Files  8 passed (8)
      Tests  41 passed (41)
```
