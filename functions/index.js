const { onRequest } = require('firebase-functions/v2/https');
const { defineString } = require('firebase-functions/params');
const functions = require('firebase-functions');

const TMDB_BASE = 'https://api.themoviedb.org/3';

// Prefer params (set in .env or Firebase). Legacy: firebase functions:config:set tmdb.apikey="..."
const tmdbApiKeyParam = defineString('TMDB_API_KEY', { default: '' });

function getTmdbKey() {
  const fromParam = tmdbApiKeyParam.value();
  if (fromParam) return fromParam;
  try {
    return functions.config().tmdb?.apikey || '';
  } catch {
    return '';
  }
}

function setCors(res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Max-Age', '3600');
}

exports.searchTMDB = onRequest(async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

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

exports.tmdbDetails = onRequest(async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

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
