// --- CONFIGURATION SYSTÈME (V2.1 - 100% INDEXEDDB) ---
let playlists = [];
let currentPlaylistIndex = null;
let playingIndices = { pl: null, tr: null };
let isShuffle = false;

const audioPlayer = document.getElementById('main-audio-player');
const trackNameDisplay = document.getElementById('current-track-name');
const clockElement = document.getElementById('digital-clock');

// --- INITIALISATION DU COFFRE-FORT (IndexedDB) ---
const dbName = "HitClubDB";
let db;

const request = indexedDB.open(dbName, 2); // Version 2 pour inclure la structure
request.onupgradeneeded = (e) => {
    db = e.target.result;
    if (!db.objectStoreNames.contains("files")) db.createObjectStore("files");
    if (!db.objectStoreNames.contains("config")) db.createObjectStore("config"); // Store pour les listes
};

request.onsuccess = (e) => {
    db = e.target.result;
    loadAllFromDB(); // On charge tout depuis la base de données
};

// --- LOGIQUE DU CHRONOMÈTRE (Stable) ---
let secondsElapsed = 0;
let chronoInterval = null;

function updateChronoDisplay() {
    const hrs = Math.floor(secondsElapsed / 3600);
    const mins = Math.floor((secondsElapsed % 3600) / 60);
    const secs = secondsElapsed % 60;
    clockElement.textContent = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function toggleChrono() {
    const btn = document.getElementById('start-stop-btn');
    if (chronoInterval) {
        clearInterval(chronoInterval);
        chronoInterval = null;
        btn.textContent = "DÉMARRER";
        btn.style.color = "var(--accent-color)";
    } else {
        chronoInterval = setInterval(() => { secondsElapsed++; updateChronoDisplay(); }, 1000);
        btn.textContent = "STOP"; btn.style.color = "#ff3e3e";
    }
}

function resetChrono() {
    clearInterval(chronoInterval); chronoInterval = null;
    secondsElapsed = 0; updateChronoDisplay();
    const btn = document.getElementById('start-stop-btn');
    btn.textContent = "DÉMARRER"; btn.style.color = "var(--accent-color)";
}

// --- NAVIGATION ET SHUFFLE ---
function switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewName + '-view').classList.add('active');
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    const btn = document.getElementById('shuffle-btn');
    btn.textContent = isShuffle ? "SHUFFLE: ON" : "SHUFFLE: OFF";
    btn.classList.toggle('shuffle-active', isShuffle);
}

// --- LECTURE PERMANENTE ---
async function playTrack(plIndex, tIndex) {
    const track = playlists[plIndex].tracks[tIndex];
    playingIndices = { pl: plIndex, tr: tIndex };

    if (!track.file) track.file = await getFileFromDB(track.id);

    if (track.file) {
        const url = URL.createObjectURL(track.file);
        audioPlayer.src = url;
        trackNameDisplay.textContent = track.name.toUpperCase();
        audioPlayer.play().catch(() => console.log("Attente clic..."));
        switchView('fitness');
    } else {
        alert("Fichier introuvable.");
    }
}

// --- GESTION DES FICHIERS ---
async function handleFiles(files) {
    if (currentPlaylistIndex === null) return;
    for (let file of files) {
        const fileId = Date.now() + "-" + file.name;
        await saveFileToDB(fileId, file);
        playlists[currentPlaylistIndex].tracks.push({ name: file.name.replace('.mp3', ''), id: fileId, file: file });
    }
    saveStructureToDB();
}

// --- OPÉRATIONS DE BASE DE DONNÉES (Zéro LocalStorage) ---
function saveFileToDB(id, file) {
    return new Promise(resolve => {
        const tx = db.transaction("files", "readwrite");
        tx.objectStore("files").put(file, id);
        tx.oncomplete = () => resolve();
    });
}

function getFileFromDB(id) {
    return new Promise(resolve => {
        const tx = db.transaction("files", "readonly");
        const req = tx.objectStore("files").get(id);
        req.onsuccess = () => resolve(req.result);
    });
}

function saveStructureToDB() {
    const data = playlists.map(p => ({ 
        name: p.name, 
        tracks: p.tracks.map(t => ({ name: t.name, id: t.id })) 
    }));
    const tx = db.transaction("config", "readwrite");
    tx.objectStore("config").put(data, "playlists");
    render();
}

function loadAllFromDB() {
    const tx = db.transaction("config", "readonly");
    const req = tx.objectStore("config").get("playlists");
    req.onsuccess = () => {
        if (req.result) playlists = req.result;
        render();
    };
}

// --- INTERFACE ---
function createNewPlaylist() {
    const name = prompt("Nom de la playlist :");
    if (name) { playlists.push({ name: name, tracks: [] }); saveStructureToDB(); }
}

function triggerFileInput(index) {
    currentPlaylistIndex = index;
    document.getElementById('file-input').click();
}

async function deleteTrack(plIndex, tIndex) {
    if (confirm("Supprimer ?")) {
        const tx = db.transaction("files", "readwrite");
        tx.objectStore("files").delete(playlists[plIndex].tracks[tIndex].id);
        playlists[plIndex].tracks.splice(tIndex, 1);
        saveStructureToDB();
    }
}

function deletePlaylist(plIndex) {
    if (confirm("Supprimer toute la liste ?")) {
        const tx = db.transaction("files", "readwrite");
        playlists[plIndex].tracks.forEach(t => tx.objectStore("files").delete(t.id));
        playlists.splice(plIndex, 1);
        saveStructureToDB();
    }
}

function render() {
    const container = document.getElementById('playlist-container');
    container.innerHTML = playlists.length === 0 ? '<p class="empty-msg">Aucune playlist.</p>' : '';
    playlists.forEach((pl, index) => {
        const plDiv = document.createElement('div');
        plDiv.className = 'playlist-item';
        plDiv.innerHTML = `
            <div class="pl-header">
                <div><strong>${pl.name}</strong> <button class="btn-delete-pl" onclick="deletePlaylist(${index})">🗑️</button></div>
                <button onclick="triggerFileInput(${index})">AJOUTER MP3</button>
            </div>
            <ul class="track-list">
                ${pl.tracks.map((t, tIndex) => `<li><span onclick="playTrack(${index}, ${tIndex})">▶ ${t.name}</span><button onclick="deleteTrack(${index}, ${tIndex})">×</button></li>`).join('')}
            </ul>`;
        container.appendChild(plDiv);
    });
}

audioPlayer.onended = () => {
    if (playingIndices.pl === null) return;
    const currentPL = playlists[playingIndices.pl];
    let next = (playingIndices.tr + 1) % currentPL.tracks.length;
    if (isShuffle) next = Math.floor(Math.random() * currentPL.tracks.length);
    playTrack(playingIndices.pl, next);
};
