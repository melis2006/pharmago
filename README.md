# PharmaGO

Responsive web app (mobile + desktop) for elderly users in Tashkent: search medicines,
compare prices across pharmacies, and order delivery by drone or courier.
University MVP — all data is demo data stored in the browser (localStorage).

**Live demo:** _https://YOUR-PROJECT.vercel.app_ (add the link after the first deploy)

## Development

You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone https://github.com/melis2006/pharmago.git
cd pharmago
npm i
npm run dev
```

Other commands: `npm run build`, `npm test`, `npm run lint`.

## Deploy

The app is deployed on [Vercel](https://vercel.com). `npm run build` already produces
Vercel's output format (`.vercel/output`: static files plus one server function that renders
every page), so no extra configuration is needed.

1. On [vercel.com/new](https://vercel.com/new), import the `melis2006/pharmago` GitHub repository.
2. The framework is detected automatically. Keep the default build settings
   (build command `npm run build`).
3. **No environment variables are needed** — the app has no backend and no secrets.
4. Click **Deploy**.

Every push to `main` deploys a new production version; other branches get preview links.
Direct links such as `/medicine/fanigan` or `/admin` work, also after refreshing the page,
because the server function renders every route.

To build for another host, set `NITRO_PRESET` when building, for example
`NITRO_PRESET=node-server npm run build` for a plain Node.js server (`node .output/server/index.mjs`).
