/* PROJET : QUI BOUGE GAGNE
   FICHIER : js/core.js
   REVISION : 05 - Titres cliquables vers Boutique
*/

const audio = document.getElementById('audio-engine');
const playBtn = document.getElementById('play-btn');
const nextBtn = document.getElementById('next-btn');
const titleDisplay = document.getElementById('track-title');

// 1. On prépare l'arsenal avec les liens Stripe (Remplace les # par tes vrais liens)
const playlist = [
    { file: "MASTERED_HARDANCE-HIT-CLUB-1.mp3", url: "https://buy.stripe.com/8x214oe552vOfOy52fbsc06" },
    { file: "MASTERED_HARDANCE-HIT-CLUB-2.mp3", url: "https://buy.stripe.com/eVqdRae555I059U52fbsc07" },
    { file: "MASTERED_HARDANCE-HIT-CLUB-3.mp3", url: "https://buy.stripe.com/aFaeVeaSTgmE6dYcuHbsc08" },
    { file: "MASTERED_HARDANCE-HIT-CLUB-4.mp3", url: "https://buy.stripe.com/fZudRa8KL1rKdGq1Q3bsc09" },
    { file: "MASTERED_HARDANCE-HIT-CLUB-5.mp3", url: "https://buy.stripe.com/7sYbJ29OP7Q89qa7anbsc0a" },
    { file: "MASTERED_HARDANCE-HIT-CLUB-6.mp3", url: "https://buy.stripe.com/aFa7sM6CD2vOdGq0LZbsc00" },
    { file: "MASTERED_HARDANCE-HIT-CLUB-7.mp3", url: "https://buy.stripe.com/28E5kEbWXc6ogSC3Ybbsc01" },
    { file: "MASTERED_HARDANCE-HIT-CLUB-8.mp3", url: "https://buy.stripe.com/28E7sMgddfiA1XI8erbsc02" },
    { file: "MASTERED_HARDANCE-HIT-CLUB-9.mp3", url: "https://buy.stripe.com/cNi8wQ0ef1rK45Q0LZbsc03" },
    { file: "MASTERED_HARDANCE-HIT-CLUB-10.mp3", url: "https://buy.stripe.com/14A14o8KLdasbyibqDbsc04" },
    { file: "MASTERED_HARDANCE-HIT-CLUB-11.mp3", url: "https://buy.stripe.com/7sY9AU4uvfiAdGq2U7bsc05" }
];

let currentTrackIndex = 0;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function loadTrack(index) {
    const track = playlist[index];
    
    // Chargement de l'extrait 10s
    audio.src = `previews/prev_${track.file}`;
    
    // Nettoyage du nom pour l'affichage
    let cleanName = track.file.replace('MASTERED_HARDANCE-HIT-', '').replace('.mp3', '');
    
    // MISE À JOUR DU TITRE ET DU LIEN
    titleDisplay.innerHTML = `<a href="${track.url}" target="_blank" class="track-link">SESSION : ${cleanName}</a>`;
    
    console.log("Lecture : " + track.file + " -> Destination : " + track.url);
}

// Initialisation
shuffle(playlist);
loadTrack(0);

// --- LOGIQUE DES BOUTONS ---
playBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play().catch(e => console.log("Interaction requise."));
        playBtn.innerText = "PAUSE";
    } else {
        audio.pause();
        playBtn.innerText = "PLAY";
    }
});

nextBtn.addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
    audio.play();
    playBtn.innerText = "PAUSE";
});

audio.addEventListener('ended', () => nextBtn.click());
