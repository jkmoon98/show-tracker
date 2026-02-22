# ShowTracker

A personal TV show diary with Firebase auth/sync and TMDB search. Runs on the **free Firebase Spark plan** (no Cloud Functions).

## Setup

1. Copy `config.example.js` to `config.js`.
2. Fill in your **Firebase** config (Firebase Console → Project settings → Your apps).
3. Add your **TMDB API key** in `config.js` (get one at [TMDB](https://www.themoviedb.org/settings/api)).

`config.js` is gitignored – don’t commit it.

## Local development

Open `index.html` in a browser or use a local server. Ensure `config.js` exists with your keys.

## Deploy

```bash
firebase deploy
```

Deploys **hosting only** (no Blaze plan required). Have `config.js` in the project root with your values before deploying.
