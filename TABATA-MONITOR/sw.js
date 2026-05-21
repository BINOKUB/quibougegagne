// ========================================================================
// SCRIPT : sw.js (Service Worker)
// DESCRIPTION : Gestionnaire de cache hors-ligne. Force le téléchargement
//               des actifs HTML/CSS/JS et de la banque audio complète.
// ========================================================================

const CACHE_NAME = 'tabata-qbg-v1';

// L'ARSENAL COMPLET À TÉLÉCHARGER DANS LE TÉLÉPHONE
const ASSETS = [
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  '../audio/prep.mp3',
  '../audio/3.mp3',
  '../audio/2.mp3',
  '../audio/1.mp3',
  '../audio/go.mp3',
  '../audio/stop.mp3',
  '../audio/alerte.mp3',
  '../audio/fin.mp3'
];

// PHASE D'INSTALLATION : Téléchargement forcé de la liste
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Mise en cache de la machine et des audios');
      return cache.addAll(ASSETS);
    })
  );
});

// PHASE DE LECTURE : Interception (On sert le cache même sans internet)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      // Retourne la version en cache si elle existe, sinon tente le réseau
      return res || fetch(e.request);
    })
  );
});
