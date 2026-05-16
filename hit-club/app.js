// --- CONFIGURATION SYSTÈME ---
let playlists = JSON.parse(localStorage.getItem('hitclub_playlists')) || [];
let currentPlaylistIndex = null;
let playingIndices = { pl: null, tr: null };
let isShuffle = false;

const audioPlayer = document.getElementById('main-audio-player');
const trackNameDisplay = document.getElementById('current-track-name');
const clockElement = document.getElementById('digital-clock');

// --- LOGIQUE DU CHRONOMÈTRE ---
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
        chronoInterval = setInterval(() => { 
            secondsElapsed++; 
            updateChronoDisplay(); 
        }, 1000);
        btn.textContent = "STOP";
        btn.style.color = "#ff3e3e";
    }
}

function resetChrono() {
    clearInterval(chronoInterval);
    chronoInterval = null;
    secondsElapsed = 0;
    updateChronoDisplay();
    const btn = document.getElementById('start-stop-btn');
    btn.textContent = "DÉMARRER";
    btn.style.color = "var(--accent-color)";
}

// --- LOGIQUE DU SHUFFLE (ALÉATOIRE) ---
function toggleShuffle() {
    isShuffle = !isShuffle;
    const btn = document.getElementById('shuffle-btn');
    if (btn) {
        btn.textContent = isShuffle ? "SHUFFLE: ON" : "SHUFFLE: OFF";
        btn.classList.toggle('shuffle-active', isShuffle);
    }
}

// --- NAVIGATION ET LECTURE ---
function switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById(viewName + '-view');
    if (view) view.classList.add('active');
}

function playTrack(plIndex, tIndex) {
    const track = playlists[plIndex].tracks[tIndex];
    if (track && track.file) {
        playingIndices = { pl: plIndex, tr: tIndex };
        
        const url = URL.createObjectURL(track.file);
        audioPlayer.src = url;
        trackNameDisplay.textContent = track.name.toUpperCase();
        
        // Sécurité pour forcer le démarrage sur Android/Chrome
        audioPlayer.play().catch(err => {
            console.log("Lecture en attente d'action utilisateur.");
        });
        
        switchView('fitness');
    }
}

// AUTO-PLAY : Enchaînement automatique
audioPlayer.onended = () => {
    if (playingIndices.pl === null) return;
    const currentPL = playlists[playingIndices.pl];
    if (!currentPL || currentPL.tracks.length === 0) return;

    let nextIndex;
    if (isShuffle && currentPL.tracks.length > 1) {
        do {
            nextIndex = Math.floor(Math.random() * currentPL.tracks.length);
        } while (nextIndex === playingIndices.tr);
    } else {
        nextIndex = (playingIndices.tr + 1) % currentPL.tracks.length;
    }
    playTrack(playingIndices.pl, nextIndex);
};

// --- GESTION DES FICHIERS ET PLAYLISTS ---
function createNewPlaylist() {
    const name = prompt("Nom de la playlist :");
    if (name) { 
        playlists.push({ name: name, tracks: [] }); 
        saveAndRender(); 
    }
}

function triggerFileInput(index) {
    currentPlaylistIndex = index;
    const input = document.getElementById('file-input');
    if (input) input.click();
}

function handleFiles(files) {
    if (currentPlaylistIndex === null) return;
    for (let file of files) {
        playlists[currentPlaylistIndex].tracks.push({ 
            name: file.name.replace('.mp3', ''), 
            file: file 
        });
    }
    saveAndRender();
}

function deleteTrack(plIndex, tIndex) {
    if (confirm("Supprimer ce morceau ?")) { 
        playlists[plIndex].tracks.splice(tIndex, 1); 
        saveAndRender(); 
    }
}

function deletePlaylist(plIndex) {
    if (confirm("Supprimer cette playlist ?")) { 
        playlists.splice(plIndex, 1); 
        saveAndRender(); 
    }
}

function saveAndRender() {
    // Sauvegarde les noms pour la structure
    localStorage.setItem('hitclub_playlists', JSON.stringify(playlists.map(p => ({
        name: p.name, 
        tracks: p.tracks.map(t => ({name: t.name}))
    }))));
    render();
}

function render() {
    const container = document.getElementById('playlist-container');
    if (!container) return;
    
    container.innerHTML = '';
    if (playlists.length === 0) {
        container.innerHTML = '<p class="empty-msg">Aucune playlist.</p>';
        return;
    }

    playlists.forEach((pl, index) => {
        const plDiv = document.createElement('div');
        plDiv.className = 'playlist-item';
        plDiv.innerHTML = `
            <div class="pl-header">
                <div>
                    <strong>${pl.name}</strong> 
                    <button class="btn-delete-pl" onclick="deletePlaylist(${index})">🗑️</button>
                </div>
                <button onclick="triggerFileInput(${index})">AJOUTER MP3</button>
            </div>
            <ul class="track-list">
                ${pl.tracks.map((t, tIndex) => `
                    <li>
                        <span class="track-name" onclick="playTrack(${index}, ${tIndex})">▶ ${t.name}</span>
                        <button class="btn-delete-track" onclick="deleteTrack(${index}, ${tIndex})">×</button>
                    </li>
                `).join('')}
            </ul>
        `;
        container.appendChild(plDiv); // Correction du bug innerHTML.appendChild
    });
}

// Lancement initial
render();
updateChronoDisplay();
