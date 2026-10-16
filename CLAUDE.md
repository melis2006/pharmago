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
  (`localStorage`, key `pharmago-v1`).
- **English only.** Uzbek/Russian on the welcome screen, "Ask AI", "Call operator", voice search
  and the Emergency buttons are intentional **"Coming soon" placeholders** (they call `soon()` from
  `src/components/Shell.tsx`, which shows a toast).

## Tech stack

- React 19 + TypeScript (strict), Vite 8
- TanStack Start / TanStack Router (file-based routing, SSR) + TanStack Query
- Build config via `@lovable.dev/vite-tanstack-config` (wraps tanstackStart, React, Tailwind,
  tsconfig paths, Nitro — do not add those plugins to `vite.config.ts` again)
- Tailwind CSS v4 (`src/styles.css`), shadcn/ui components on Radix (`src/components/ui`),
  lucide-react icons, sonner toasts
- Vitest + Testing Library + jsdom for tests
- ESLint + Prettier

## Structure

```
src/
  routes/            file-based routes (routeTree.gen.ts is generated — never edit by hand)
    __root.tsx       app shell: <html>, StoreProvider, Toaster, 404/error pages
    index.tsx        /                    welcome + language choice
    home.tsx         /home                search, categories, popular medicines
    search.tsx       /search              results
    medicine.$id.tsx /medicine/:id        details, pack choice, health warning
    compare.$id.tsx  /compare/:id         price comparison across pharmacies
    cart.tsx, checkout.tsx, success.$orderId.tsx, track.$orderId.tsx, orders.tsx
    saved.tsx, profile.tsx, login.tsx, emergency.tsx, admin.tsx (stock + drone fleet)
  components/        Shell (header, bottom nav, Logo, PageTitle, Stars, soon()),
                     MedicineCard, SearchBar, ui/ (shadcn)
  lib/
    data.ts          mock MEDICINES, PHARMACIES, CONDITIONS, CATEGORIES, DELIVERY, formatUZS
    store.tsx        React context store persisted to localStorage (cart, saved, user,
                     orders, addresses, cards, stock, drones, admin) + addToCart()
  test/              Vitest setup and tests
```

## Commands

```sh
npm install        # .npmrc sets legacy-peer-deps=true (avoids npm "edgesOut" crash)
npm run dev        # dev server on http://localhost:8080
npm run build      # production build into .output/
npm test           # vitest run
npm run lint       # eslint
```

## Rules

1. **Elderly-friendly UI:** keep the interface simple, with large text, large touch targets and
   high contrast. Do not add clutter, small fonts or hidden gestures.
2. **All data is mock.** Do not add a real backend, real payments or external APIs; keep data in
   `src/lib/data.ts` and state in `src/lib/store.tsx` (localStorage).
3. **Placeholders stay placeholders.** Uzbek/Russian, Ask AI, Call operator, voice search and
   Emergency remain "Coming soon" unless a task explicitly says otherwise.
4. **Every task ends with a working build and exactly one commit:** run `npm run build` and
   `npm test` before committing.
5. English only for UI text. Use npm (not bun) for dependencies.
6. No `Co-Authored-By` lines in commits. Commits are authored by
   `melis2006 <189466933+melis2006@users.noreply.github.com>`.
7. Never force-push or rewrite pushed history.
