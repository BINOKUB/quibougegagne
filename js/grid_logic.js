/* PROJET : QUI BOUGE GAGNE
   FICHIER : js/grid_logic.js
   DESCRIPTION : Gestion de la grille interactive et persistance locale.
*/

const grid = document.getElementById('vitality-grid');
const counter = document.getElementById('counter');
const resetBtn = document.getElementById('reset-grid');
const totalBlocks = 30; // On commence par un cycle de 30 jours

// 1. Charger l'état sauvegardé
let savedState = JSON.parse(localStorage.getItem('qbg_vitality_state')) || {};

// 2. Générer la grille
for (let i = 1; i <= totalBlocks; i++) {
    const block = document.createElement('div');
    block.classList.add('block');
    block.innerText = i;

    // Si le bloc était déjà coché
    if (savedState[i]) {
        block.classList.add('active');
    }

    block.addEventListener('click', () => {
        block.classList.toggle('active');
        saveProgress();
    });

    grid.appendChild(block);
}

// 3. Sauvegarder dans le navigateur
function saveProgress() {
    const blocks = document.querySelectorAll('.block');
    let newState = {};
    let activeCount = 0;

    blocks.forEach((block, index) => {
        if (block.classList.contains('active')) {
            newState[index + 1] = true;
            activeCount++;
        }
    });

    localStorage.setItem('qbg_vitality_state', JSON.stringify(newState));
    counter.innerText = activeCount;
}

// 4. Reset
resetBtn.addEventListener('click', () => {
    if(confirm("Voulez-vous vraiment effacer votre progression ?")) {
        localStorage.removeItem('qbg_vitality_state');
        location.reload();
    }
});

// Init du compteur au chargement
saveProgress();
