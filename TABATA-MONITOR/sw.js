// ========================================================================
// SCRIPT : sw.js (Service Worker)
// DESCRIPTION : Gestionnaire de cache hors-ligne. Force le téléchargement
//               des actifs HTML/CSS/JS et de la banque audio complète.
// ========================================================================

const CACHE_NAME = 'tabata-qbg-v3';

// L'ARSENAL COMPLET À TÉLÉCHARGER DANS LE TÉLÉPHONE
const ASSETS = [
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  '../audio/prep.wav',
  '../audio/3.wav',
  '../audio/2.wav',
  '../audio/1.wav',
  '../audio/go.wav',
  '../audio/stop.wav',
  '../audio/alerte.wav',
  '../audio/fin.wav'
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


// PHASE DE NETTOYAGE : Destruction absolue des anciens coffres-forts
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Destruction de l\'ancien cache:', key);
          return caches.delete(key);
        }
      }));
    })
  );
});
