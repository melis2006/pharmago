# PharmaGO — project guide for Claude

## Context

PharmaGO is a university MVP (midterm project). It is a responsive website (mobile + desktop)
for **elderly users** to:

- search medicines (by name or symptom, by category),
- compare prices of the same medicine across pharmacies in Tashkent,
- order delivery by **drone** or **courier** and track the order.

Key feature: a **health profile** (diabetes, high blood pressure, pregnancy, kidney/liver disease,
etc.). Medicines that conflict with the user's conditions show a red **"Not recommended for you"**
warning (`src/routes/medicine.$id.tsx`, driven by `Medicine.conflicts` in `src/lib/data.ts`).

The code was originally generated with Lovable and exported. This repository
(https://github.com/melis2006/pharmago) is **not** connected to Lovable — develop here only.

- **All data is mock/demo data.** There is no backend; app state lives in the browser
  (`localStorage`, key `pharmago-v4`; bump `STORAGE_KEY` in `src/lib/privacy.ts` when saved data changes shape).
- **English only**, with no language switcher. "Ask AI", "Call operator", voice search and the
  Emergency buttons are intentional **"Coming soon" placeholders** (they call `soon()` from
  `src/components/Shell.tsx`, which shows a toast).

## Tech stack

- React 19 + TypeScript (strict), Vite 8
- TanStack Start / TanStack Router (file-based routing, SSR) + TanStack Query
- Build config via `@lovable.dev/vite-tanstack-config` (wraps tanstackStart, React, Tailwind,
  tsconfig paths, Nitro — do not add those plugins to `vite.config.ts` again)
- Deployed on **Vercel**: `nitro: { preset: process.env.NITRO_PRESET || "vercel" }` in
  `vite.config.ts`; the build writes `.vercel/output` (static files + one SSR function for all
  routes, so deep links work). No environment variables are needed.
- Tailwind CSS v4 (`src/styles.css`), shadcn/ui components on Radix (`src/components/ui`),
  lucide-react icons, sonner toasts
- Vitest + Testing Library + jsdom for tests
- ESLint + Prettier

## Structure

```
src/
  routes/            file-based routes (routeTree.gen.ts is generated — never edit by hand)
    __root.tsx       app shell: <html>, StoreProvider, Toaster, 404/error pages
    index.tsx        /                    start screen (benefits, Get started, Log in)
    home.tsx         /home                search, categories, popular medicines
    search.tsx       /search              results
    medicine.$id.tsx /medicine/:id        details, pack choice, health warning
    compare.$id.tsx  /compare/:id         price comparison across pharmacies
    cart.tsx, checkout.tsx, success.$orderId.tsx, track.$orderId.tsx, orders.tsx
    saved.tsx, profile.tsx, login.tsx, emergency.tsx, admin.tsx (stock + drone fleet)
  components/        Shell (header with sticky Back row, bottom nav, Logo, PageTitle, Stars,
                     soon(), Footer), BackButton (history back, or parent page),
                     MedicineCard, MedicineImage (photo or generated box), Pharmacy (logo,
                     stars, Contact toast), HealthWarning, Privacy (consent checkbox,
                     Delete my data), AddressForm (registration, Profile, checkout),
                     SavedAddresses (Profile), SearchBar, ui/ (shadcn)
  assets/products/   product photos
  lib/
    data.ts          mock MEDICINES, PHARMACIES, OFFERS (medicine × pharmacy: price, stock,
                     origin, dates), CONDITIONS, CATEGORIES, DELIVERY, formatSum ("35,000 sum")
    pricing.ts       bestOffer, cheapestOffer, compareOptions (sort/filter), orderTotals
    health.ts        getWarnings(medicine, conditions)
    privacy.ts       STORAGE_KEY, consent rule, deleteMyData, removeLegacyData
    address.ts       Address type, validateAddress, formatAddress, add/update/remove/default
    navigation.ts    parentPath (Back fallback), showBackButton (not on / and /home)
    store.tsx        React context store persisted to localStorage (cart, saved, user,
                     orders, addresses, cards, offers, drones, admin) + addToCart(),
                     logout(), deleteAllData()
  routes/privacy.tsx /privacy             plain-English privacy notice
  test/              Vitest + Testing Library tests, named after user-story criteria
docs/testing.md      user stories → acceptance criteria → tests
docs/security.md     main privacy risk, our response, checks, limitations
.github/workflows/   CI: npm ci, npm test, npm run build on every push to main
```

Keep logic that can be tested (prices, sorting, warnings, totals) in `src/lib`, not in components.
Contact buttons never use `tel:` links — demo numbers may belong to real people.

**Privacy:** health conditions are only stored with consent (`user.healthConsent`; enforced in
the store). The app must make **no requests to other hosts**: no analytics, no CDN scripts, no
Google Fonts (fonts are self-hosted via `@fontsource`). Never store the password.

## Commands

```sh
npm install        # .npmrc sets legacy-peer-deps=true (avoids npm "edgesOut" crash)
npm run dev        # dev server on http://localhost:8080
npm run build      # production build for Vercel into .vercel/output/
npm test           # vitest run
npm run lint       # eslint + prettier, must have 0 errors
npm run format     # prettier --write . (run before committing)
```

`.gitattributes` forces LF line endings (also on Windows). Tap targets must be at least 48px
(`min-h-12`); do not use `size="sm"` buttons for user-facing actions.

## Rules

1. **Elderly-friendly UI:** keep the interface simple, with large text, large touch targets and
   high contrast. Do not add clutter, small fonts or hidden gestures.
2. **All data is mock.** Do not add a real backend, real payments or external APIs; keep data in
   `src/lib/data.ts` and state in `src/lib/store.tsx` (localStorage).
3. **Placeholders stay placeholders.** Ask AI, Call operator, voice search and Emergency remain
   "Coming soon" unless a task explicitly says otherwise. Do not add language switchers.
4. **Every task ends with a working build and exactly one commit:** run `npm run build` and
   `npm test` before committing.
5. English only for UI text. Use npm (not bun) for dependencies.
6. No `Co-Authored-By` lines in commits. Commits are authored by
   `melis2006 <189466933+melis2006@users.noreply.github.com>`.
7. Never force-push or rewrite pushed history.
