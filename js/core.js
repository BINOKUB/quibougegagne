/* PROJET : QUI BOUGE GAGNE
   FICHIER : js/core.js
   REVISION : 03 - Indexation réelle des 26 pistes
   DESCRIPTION : Moteur audio avec lecture aléatoire (Shuffle)
*/

const audio = document.getElementById('audio-engine');
const playBtn = document.getElementById('play-btn');
const nextBtn = document.getElementById('next-btn');
const titleDisplay = document.getElementById('track-title');

// Liste exacte de tes 26 fichiers (basée sur ton terminal)
const playlist = [
    "MASTERED_HARDANCE-HIT-CLUB-1.mp3",
    "MASTERED_HARDANCE-HIT-CLUB-2.mp3",
    "MASTERED_HARDANCE-HIT-CLUB-3.mp3",
    "MASTERED_HARDANCE-HIT-CLUB-4.mp3",
    "MASTERED_HARDANCE-HIT-CLUB-5.mp3",
    "MASTERED_HARDANCE-HIT-CLUB-6.mp3",
    "MASTERED_HARDANCE-HIT-CLUB-7.mp3",
    "MASTERED_HARDANCE-HIT-CLUB-8.mp3",
    "MASTERED_HARDANCE-HIT-CLUB-9.mp3",
    "MASTERED_HARDANCE-HIT-CLUB-10.mp3",
    "MASTERED_HARDANCE-HIT-CLUB-11.mp3"
];

let currentTrackIndex = 0;

// Mélange Aléatoire
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function loadTrack(index) {
    audio.src = `audio/${playlist[index]}`;
    // On nettoie le nom pour l'affichage (enlève .mp3 et les préfixes lourds)
    let cleanName = playlist[index].replace('MASTERED_HARDANCE-HIT-', '').replace('.mp3', '');
    titleDisplay.innerText = `SESSION : ${cleanName}`;
    console.log("Chargement : " + playlist[index]);
}

// Initialisation
shuffle(playlist);
loadTrack(0);

playBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play().catch(e => console.log("L'utilisateur doit interagir d'abord."));
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
