// ========================================================================
// RÉVISION : V1.2
// NOM DU SCRIPT : app.js
// DESCRIPTION : Moteur logique de précision pour le minuteur Tabata.
// NOUVELLES INTÉGRATIONS : Intégration de la banque de fichiers MP3 de qualité
//                         studio, préchargement des pistes pour éliminer la latence,
//                         et routage vers le répertoire d'actifs combiné (../audio/).
// ========================================================================

// ÉTATS DE LA MACHINE
let totalCycles = 8;
let currentCycle = 0;
let timeRemaining = 0;
let currentPhase = 'PRÊT'; // PRÊT, PRÉPARATION, EFFORT, REPOS
let timerInterval = null;
let isRunning = false;

// VARIABLES DES COMPTES À REBOURS
const PREP_TIME = 10; 
const EFFORT_TIME = 20;
const REPOS_TIME = 10;

// CONFIGURATION DU CHEMIN RELATIF DE LA BANQUE AUDIO
const AUDIO_PATH = '../audio/';

// PRÉCHARGEMENT DES ACTIFS AUDIO DE LUXE (Élimine le délai de lecture)
const audioBank = {
    prep: new Audio(`${AUDIO_PATH}prep.wav`),
    count3: new Audio(`${AUDIO_PATH}3.wav`),
    count2: new Audio(`${AUDIO_PATH}2.wav`),
    count1: new Audio(`${AUDIO_PATH}1.wav`),
    go: new Audio(`${AUDIO_PATH}go.wav`),
    stop: new Audio(`${AUDIO_PATH}stop.wav`),
    alerte: new Audio(`${AUDIO_PATH}alerte.wav`),
    fin: new Audio(`${AUDIO_PATH}fin.wav`)
};

// INITIALISATION DU CONTEXTE AUDIO (Pour les bips électroniques industriels en couche de fond)
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudioEngine() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    // Force le chargement/réveil de la banque audio sur l'action de l'utilisateur
    Object.values(audioBank).forEach(track => {
        track.load();
    });
}

// LECTURE SÉCURISÉE DES FICHIERS MP3
function playStudioVoice(trackKey) {
    try {
        const sound = audioBank[trackKey];
        if (sound) {
            sound.currentTime = 0; // Réinitialise pour permettre des lectures rapides successives
            sound.play().catch(err => console.log(`Lecture audio restreinte par le navigateur: ${err}`));
        }
    } catch (error) {
        console.error(`Impossible de lire l'actif audio: ${trackKey}`, error);
    }
}

// COUCHE DE FOND : ÉMISSION DE BIPS BRUTS (WEB AUDIO API)
function emitMechanicalBeep(frequency, duration) {
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'square'; 
    oscillator.frequency.value = frequency;
    
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

// GESTIONNAIRE DES COMPOSITIONS SONORES
function triggerAudioPattern(type) {
    if (type === 'EFFORT_START') {
        emitMechanicalBeep(880, 0.15);
        setTimeout(() => emitMechanicalBeep(880, 0.15), 200);
        playStudioVoice('go');
    } else if (type === 'REPOS_START') {
        emitMechanicalBeep(440, 0.3);
        playStudioVoice('stop');
    } else if (type === 'ALERT_3_SEC') {
        emitMechanicalBeep(600, 0.05);
    }
}

// SÉLECTION DU THÈME VISUEL
function setTheme(color) {
    document.body.className = '';
    document.body.classList.add(`theme-${color}`);
    
    document.querySelectorAll('.btn-theme').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === color) btn.classList.add('active');
    });
}

// RÉGLAGE DES CONFIGURATIONS DE CYCLES
function setPresetCycles(count) {
    if (isRunning) return;
    totalCycles = count;
    document.getElementById('custom-cycles').value = count;
    document.getElementById('total-cycles-display').textContent = count;
    
    document.querySelectorAll('.btn-preset').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.textContent) === count) btn.classList.add('active');
    });
    resetMachine();
}

function setCustomCycles(value) {
    if (isRunning) return;
    let count = parseInt(value);
    if (isNaN(count) || count < 1) count = 1;
    totalCycles = count;
    document.getElementById('total-cycles-display').textContent = count;
    
    document.querySelectorAll('.btn-preset').forEach(btn => btn.classList.remove('active'));
    resetMachine();
}

// COMMANDE INTERRUPTEUR DE MARCHE
function toggleTimer() {
    initAudioEngine(); 
    if (isRunning) {
        pauseMachine();
    } else {
        startMachine();
    }
}

function startMachine() {
    isRunning = true;
    document.getElementById('main-action-btn').textContent = 'PAUSE';
    document.getElementById('main-action-btn').style.borderColor = '#fff';
    document.getElementById('main-action-btn').style.color = '#fff';

    if (currentPhase === 'PRÊT') {
        switchPhase('PRÉPARATION', PREP_TIME);
        playStudioVoice('prep');
    }

    timerInterval = setInterval(tick, 1000);
}

function pauseMachine() {
    isRunning = false;
    clearInterval(timerInterval);
    document.getElementById('main-action-btn').textContent = 'REPRENDRE';
    document.getElementById('main-action-btn').removeAttribute('style');
}

function resetMachine() {
    isRunning = false;
    clearInterval(timerInterval);
    currentCycle = 0;
    currentPhase = 'PRÊT';
    timeRemaining = 0;
    document.getElementById('phase-title').textContent = 'PRÊT';
    document.getElementById('time-display').textContent = '00';
    document.getElementById('cycle-display').innerHTML = `CYCLE : 0 / <span id="total-cycles-display">${totalCycles}</span>`;
    document.getElementById('main-action-btn').textContent = 'DÉMARRER';
    document.querySelector('.counter-box').className = 'counter-box';
    document.getElementById('main-action-btn').removeAttribute('style');
}

// COMMUTATEUR DE SÉQUENCE PHYSIOLOGIQUE
function switchPhase(phase, duration) {
    currentPhase = phase;
    timeRemaining = duration;
    
    const container = document.querySelector('.counter-box');
    container.className = 'counter-box';
    
    document.getElementById('phase-title').textContent = currentPhase;
    document.getElementById('time-display').textContent = formatTime(timeRemaining);

    if (phase === 'PRÉPARATION') {
        container.classList.add('phase-prep');
    } else if (phase === 'EFFORT') {
        container.classList.add('phase-effort');
        triggerAudioPattern('EFFORT_START');
    } else if (phase === 'REPOS') {
        container.classList.add('phase-repos');
        triggerAudioPattern('REPOS_START');
    }
}

// CADENCE SECONDE PAR SECONDE (MÉTRONOME)
function tick() {
    if (timeRemaining > 0) {
        timeRemaining--;
        document.getElementById('time-display').textContent = formatTime(timeRemaining);
        
        // SYNCHRONISATION CADRÉE POUR LE COMPTE À REBOURS (3, 2, 1)
        if ((currentPhase === 'PRÉPARATION' || currentPhase === 'REPOS') && timeRemaining <= 3 && timeRemaining > 0) {
            triggerAudioPattern('ALERT_3_SEC');
            if (timeRemaining === 3) playStudioVoice('count3');
            if (timeRemaining === 2) playStudioVoice('count2');
            if (timeRemaining === 1) playStudioVoice('count1');
        }
        
        // ALERTE D'ANTICIPATION DE FIN D'EFFORT (À 3 secondes du repos)
        if (currentPhase === 'EFFORT' && timeRemaining === 3) {
            playStudioVoice('alerte');
        }
    } else {
        // TRANSITIONS AUTOMATIQUES DES ETAPES
        if (currentPhase === 'PRÉPARATION') {
            currentCycle = 1;
            updateCycleDisplay();
            switchPhase('EFFORT', EFFORT_TIME);
        } else if (currentPhase === 'EFFORT') {
            if (currentCycle < totalCycles) {
                switchPhase('REPOS', REPOS_TIME);
            } else {
                endWorkout();
            }
        } else if (currentPhase === 'REPOS') {
            currentCycle++;
            updateCycleDisplay();
            switchPhase('EFFORT', EFFORT_TIME);
        }
    }
}

function updateCycleDisplay() {
    document.getElementById('cycle-display').innerHTML = `CYCLE : ${currentCycle} / <span id="total-cycles-display">${totalCycles}</span>`;
}

function formatTime(seconds) {
    return seconds < 10 ? `0${seconds}` : seconds;
}

function endWorkout() {
    isRunning = false;
    clearInterval(timerInterval);
    currentPhase = 'TERMINÉ';
    document.getElementById('phase-title').textContent = 'TERMINÉ';
    document.getElementById('time-display').textContent = 'END';
    emitMechanicalBeep(300, 1.0);
    playStudioVoice('fin');
    document.getElementById('main-action-btn').textContent = 'RESET';
    document.getElementById('main-action-btn').onclick = resetMachine;
}
