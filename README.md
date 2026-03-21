# ShowTracker

A personal TV show diary with Firebase auth/sync and TMDB search.

## Setup (Firebase Spark / free tier)

1. Copy `config.example.js` to `config.js`.
2. Fill in **Firebase** (Firebase Console → Project settings → Your apps).
3. Add your **TMDB API key** in `config.js` as `window.TMDB_API_KEY` ([TMDB API settings](https://www.themoviedb.org/settings/api)). The key is visible in the browser (normal for TMDB on a static site); TMDB API keys are designed to be used by clients and the main risk is limited quota/rate usage, not full account compromise.

`config.js` is gitignored.

## Optional: TMDB via Cloud Functions (Blaze plan)

If you upgrade to **Blaze**, you can deploy the proxy in `functions/` and set `window.TMDB_PROXY_BASE` in `config.js` to your functions URL (no TMDB key in the client). Copy `functions/.env.example` → `functions/.env` with `TMDB_API_KEY` for deploy.

## Local development

Use a local static server so `config.js` loads (e.g. `npx serve .` from the repo root).

## Deploy (hosting only on Spark)

```bash
firebase deploy --only hosting
```

## Deploy (hosting + functions on Blaze)

```bash
cd functions && npm install && cd ..
firebase deploy
```
