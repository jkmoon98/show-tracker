const { onRequest } = require('firebase-functions/v2/https');
const { defineString } = require('firebase-functions/params');
const functions = require('firebase-functions');

const TMDB_BASE = 'https://api.themoviedb.org/3';

// Set via functions/.env (see .env.example) or Firebase deploy params. Legacy v1: firebase functions:config:set tmdb.apikey="..."
const tmdbApiKeyParam = defineString('TMDB_API_KEY', { default: '' });

const httpOpts = {
  cors: true,
  region: 'us-central1',
  invoker: 'public',
};

function getTmdbKey() {
  const fromParam = tmdbApiKeyParam.value();
  if (fromParam) return fromParam;
  try {
    return functions.config().tmdb?.apikey || '';
  } catch {
    return '';
  }
}

exports.searchTMDB = onRequest(httpOpts, async (req, res) => {
  const apiKey = getTmdbKey();
  if (!apiKey) {
    res.status(500).json({ error: 'TMDB API key not configured' });
    return;
  }

  const query = (req.query.q || req.query.query || '').trim();
  if (!query) {
    res.json([]);
    return;
  }

  try {
    const url = `${TMDB_BASE}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data.results || []);
  } catch (error) {
    console.error('TMDB search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

exports.tmdbDetails = onRequest(httpOpts, async (req, res) => {
  const apiKey = getTmdbKey();
  if (!apiKey) {
    res.status(500).json({ error: 'TMDB API key not configured' });
    return;
  }

  const id = req.query.id || req.query.tv_id;
  if (!id) {
    res.status(400).json({ error: 'Missing id' });
    return;
  }

  try {
    const url = `${TMDB_BASE}/tv/${id}?api_key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      res.status(response.status).json({ error: 'Not found' });
      return;
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('TMDB details error:', error);
    res.status(500).json({ error: 'Request failed' });
  }
});

exports.tmdbCredits = onRequest(httpOpts, async (req, res) => {
  const apiKey = getTmdbKey();
  if (!apiKey) {
    res.status(500).json({ error: 'TMDB API key not configured' });
    return;
  }

  const id = req.query.id || req.query.tv_id;
  if (!id) {
    res.status(400).json({ error: 'Missing id' });
    return;
  }

  try {
    const url = `${TMDB_BASE}/tv/${id}/credits?api_key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      res.status(response.status).json({ error: 'Not found' });
      return;
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('TMDB credits error:', error);
    res.status(500).json({ error: 'Request failed' });
  }
});
