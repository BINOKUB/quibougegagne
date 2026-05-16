// --- CONFIGURATION SYSTÈME (V2 - IndexedDB) ---
let playlists = [];
let currentPlaylistIndex = null;
let playingIndices = { pl: null, tr: null };
let isShuffle = false;

const audioPlayer = document.getElementById('main-audio-player');
const trackNameDisplay = document.getElementById('current-track-name');
const clockElement = document.getElementById('digital-clock');

// --- INITIALISATION DE LA BASE DE DONNÉES (Le Garde-Manger) ---
const dbName = "HitClubDB";
let db;

const request = indexedDB.open(dbName, 1);
request.onupgradeneeded = (e) => {
    db = e.target.result;
    db.createObjectStore("files"); // Stockage des MP3 réels
};
request.onsuccess = (e) => {
    db = e.target.result;
    loadPlaylistsFromStorage();
};

// --- LOGIQUE DU CHRONOMÈTRE (Inchangée) ---
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
    document.getElementById('start-stop-btn').textContent = "DÉMARRER";
}

// --- GESTION DES VUES & SHUFFLE ---
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

// --- LECTURE ET PERSISTANCE ---
async function playTrack(plIndex, tIndex) {
    const track = playlists[plIndex].tracks[tIndex];
    playingIndices = { pl: plIndex, tr: tIndex };

    // Si le fichier n'est pas en RAM, on va le chercher dans le Garde-Manger (IndexedDB)
    if (!track.file) {
        track.file = await getFileFromDB(track.id);
    }

    if (track.file) {
        const url = URL.createObjectURL(track.file);
        audioPlayer.src = url;
        trackNameDisplay.textContent = track.name.toUpperCase();
        audioPlayer.play().catch(() => console.log("Attente clic..."));
        switchView('fitness');
    } else {
        alert("Fichier introuvable. Veuillez recharger ce morceau.");
    }
}

// --- GESTION DES FICHIERS ---
async function handleFiles(files) {
    if (currentPlaylistIndex === null) return;
    for (let file of files) {
        const fileId = Date.now() + "-" + file.name; // ID unique
        playlists[currentPlaylistIndex].tracks.push({ name: file.name.replace('.mp3', ''), id: fileId, file: file });
        await saveFileToDB(fileId, file);
    }
    savePlaylistsToStorage();
}

// --- FONCTIONS DE LA BASE DE DONNÉES ---
function saveFileToDB(id, file) {
    return new Promise((resolve) => {
        const tx = db.transaction("files", "readwrite");
        tx.objectStore("files").put(file, id);
        tx.oncomplete = () => resolve();
    });
}

function getFileFromDB(id) {
    return new Promise((resolve) => {
        const tx = db.transaction("files", "readonly");
        const req = tx.objectStore("files").get(id);
        req.onsuccess = () => resolve(req.result);
    });
}

function deleteFileFromDB(id) {
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").delete(id);
}

// --- SAUVEGARDE ET CHARGEMENT ---
function savePlaylistsToStorage() {
    const data = playlists.map(p => ({ name: p.name, tracks: p.tracks.map(t => ({ name: t.name, id: t.id })) }));
    localStorage.setItem('hitclub_playlists_v2', JSON.stringify(data));
    render();
}

function loadPlaylistsFromStorage() {
    const data = localStorage.getItem('hitclub_playlists_v2');
    if (data) playlists = JSON.parse(data);
    render();
}

// --- LE RESTE DES FONCTIONS (Playlist, Delete, Render) ---
function createNewPlaylist() {
    const name = prompt("Nom de la playlist :");
    if (name) { playlists.push({ name: name, tracks: [] }); savePlaylistsToStorage(); }
}

function triggerFileInput(index) {
    currentPlaylistIndex = index;
    document.getElementById('file-input').click();
}

async function deleteTrack(plIndex, tIndex) {
    if (confirm("Supprimer ?")) {
        deleteFileFromDB(playlists[plIndex].tracks[tIndex].id);
        playlists[plIndex].tracks.splice(tIndex, 1);
        savePlaylistsToStorage();
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
    let next = (playingIndices.tr + 1) % playlists[playingIndices.pl].tracks.length;
    if (isShuffle) next = Math.floor(Math.random() * playlists[playingIndices.pl].tracks.length);
    playTrack(playingIndices.pl, next);
};
