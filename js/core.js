/* PROJET : QUI BOUGE GAGNE
   FICHIER : js/core.js
   REVISION : 04 - Sécurisation par extraits (Previews 10s)
   DESCRIPTION : Charge les versions 'prev_' depuis le dossier /previews/
*/

const audio = document.getElementById('audio-engine');
const playBtn = document.getElementById('play-btn');
const nextBtn = document.getElementById('next-btn');
const titleDisplay = document.getElementById('track-title');

// Liste de tes fichiers originaux (le script ajoutera 'prev_' tout seul)
const playlist = [
    "MASTERED_HARDANCE.mp3",
    "MASTERED_HARDANCE-HIT-01.mp3",
    "MASTERED_HARDANCE-HIT--Abyssal.mp3",
    "MASTERED_HARDANCE-HIT--Abyssal-2.mp3",
    "MASTERED_HARDANCE-HIT-Acid.mp3",
    "MASTERED_HARDANCE-HIT-Acid-2.mp3",
    "MASTERED_HARDANCE-HIT-Bloom.mp3",
    "MASTERED_HARDANCE-HIT-Bloom-2.mp3",
    "MASTERED_HARDANCE-HIT-Blue_Note.mp3",
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
    "MASTERED_HARDANCE-HIT-CLUB-11.mp3",
    "MASTERED_HARDANCE-HIT-PERCUSSIVE-1.mp3",
    "MASTERED_HARDANCE-HIT-PERCUSSIVE-2.mp3",
    "MASTERED_HARDANCE-HIT-PERCUSSIVE-3.mp3",
    "MASTERED_HARDANCE-HIT-PERCUSSIVE-4.mp3",
    "MASTERED_HARDANCE-HIT-PULSE.mp3",
    "MASTERED_HARDANCE-HIT-Pulse-2.mp3"
];

let currentTrackIndex = 0;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function loadTrack(index) {
    // CONSTRUCTION DU LIEN VERS L'EXTRAIT SÉCURISÉ
    // On va chercher dans /previews/ et on ajoute 'prev_' devant le nom
    audio.src = `previews/prev_${playlist[index]}`;
    
    // Nettoyage du nom pour l'affichage uniquement
    let cleanName = playlist[index].replace('MASTERED_HARDANCE-HIT-', '').replace('.mp3', '');
    titleDisplay.innerText = `SESSION : ${cleanName}`;
    
    console.log("Mode Sécurisé - Chargement de l'extrait : prev_" + playlist[index]);
}

// Initialisation
shuffle(playlist);
loadTrack(0);

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
