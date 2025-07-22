/**
 * JavaScript spécifique à index.html
 * Fonctionnalités personnalisées pour la page principale du stream
 */

// Configuration spécifique à index.html
const CONFIG = {
    panelInterval: 300000, // 5 minutes
    panelDuration: 15000,  // 10 secondes
    bottomInterval: 180000, // 3 minutes
    bottomDuration: 20000,  // 20 secondes
};

let timerInterval;
let progress = 0;
const interval = 500;
const totalSteps = CONFIG.panelDuration / interval;

// Système de popup toutes les 5 minutes
function showInfoPanel() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    const panel = document.getElementById('leftPanel');
    const timer = panel.querySelector('.timer-progress');

    progress = 0;
    timer.style.background = `conic-gradient(#ef4444 0%, transparent 0%)`;

    timerInterval = setInterval(() => updateTimer(timer), interval);
    panel.classList.add('show');

    setTimeout(() => {
        panel.classList.remove('show');
        clearInterval(timerInterval);
    }, CONFIG.panelDuration);
}

function updateTimer(timer) {
    progress += (100 / totalSteps);
    timer.style.background = `conic-gradient(#ef4444 ${progress}%, transparent ${progress}%)`;

    if (progress >= 100) {
        clearInterval(timerInterval);
    }
}

function showBottomBar() {
    const bottomBar = document.getElementById('bottomBar');
    bottomBar.style.display = 'flex';
    bottomBar.style.animation = 'slide-in-up 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';

    setTimeout(() => {
        bottomBar.style.animation = 'slide-out-down 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
        setTimeout(() => {
            bottomBar.style.display = 'none';
        }, 600);
    }, CONFIG.bottomDuration);
}

// Initialisation automatique quand le DOM est prêt
document.addEventListener('DOMContentLoaded', function () {
    // Première popup après 30 secondes puis toutes les 5 minutes
    // setTimeout(showInfoPanel, 30000);
    // setInterval(showInfoPanel, CONFIG.panelInterval);

    setTimeout(showBottomBar, 10000);
    setInterval(showBottomBar, CONFIG.bottomInterval);
});
