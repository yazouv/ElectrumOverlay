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
async function showInfoPanel() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    const data = await fetch('/api/info-panel')
        .then(response => response.json())
        .catch(error => {
            console.error('❌ Erreur lors de la récupération des données du panneau d\'information:', error);
            return null;
        });
    if (!data) {
        console.error('❌ Aucune donnée disponible pour le panneau d\'information.');
        return;
    }
    const panel = document.getElementById('leftPanel');
    const timer = panel.querySelector('.timer-progress');

    updateLeftPanel('leftPanelDestination', `${data.lastJob.source_city_name} → ${data.lastJob.destination_city_name}`);
    updateLeftPanel('leftPanelDistance', `${data.lastJob.planned_distance_km} km`);
    updateLeftPanel('leftPanelCargo', `${data.lastJob.cargo_name} ( ${data.lastJob.cargo_mass_t}t )`);
    updateLeftPanel('leftPanelRank', `${data.userData.role.name || 'Inconnu'}`);
    updateLeftPanel('leftPanelDistanceVTC', `${seperateThousands(data.companyStats.distance_driven_on_job_km)} km`);
    updateLeftPanel('leftPanelCompletedTrips', `${seperateThousands(data.companyStats.jobs_delivered)}`);
    updateLeftPanel('leftPanelDrivers', `${seperateThousands(data.companyDetails.members_count)}`);
    updateLeftPanel('leftPanelRecruitments', `${data.companyDetails.recruitment === 'open' ? '🟢 Ouverts' : '🔴 Fermés'}`);

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

function updateLeftPanel(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    } else {
        console.warn(`Élément avec l'ID ${id} non trouvé dans le panneau gauche.`);
    }
}

function seperateThousands(value) {
    const rounded = Math.round(Number(value));
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Initialisation automatique quand le DOM est prêt
document.addEventListener('DOMContentLoaded', function () {
    // Première popup après 5 secondes puis toutes les 5 minutes
    setTimeout(showInfoPanel, 30000);
    setInterval(showInfoPanel, CONFIG.panelInterval);

    setTimeout(showBottomBar, 10000);
    setInterval(showBottomBar, CONFIG.bottomInterval);
});
