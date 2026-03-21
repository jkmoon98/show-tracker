// Copy this file to config.js and fill in. config.js is gitignored.
// Firebase: Firebase Console → Project settings → Your apps
// TMDB: https://www.themoviedb.org/settings/api (Spark: key in browser is normal for TMDB)

window.FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

window.TMDB_API_KEY = "YOUR_TMDB_API_KEY";

// Optional (Blaze only): hide key via Cloud Functions — set base URL from Firebase Console → Functions
// window.TMDB_PROXY_BASE = "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net";
